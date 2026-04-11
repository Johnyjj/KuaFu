# KuaFu 模块功能设计规范

## 1. 背景与目标

在项目（Project）与任务（Task）之间引入「模块」（Module）层级，使一个项目可以按功能域或职责划分为多个模块，每个模块下管理若干具体任务。路由结构和任务页整体布局保持不变，在现有 TasksPage 内按模块分组展示。

## 2. 数据模型

### 2.1 新增 `modules` 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, default uuid4 | |
| project_id | UUID | FK → projects.id, NOT NULL, index | 所属项目 |
| name | String(200) | NOT NULL | 模块名称 |
| description | Text | nullable | 模块描述 |
| owner_id | UUID | FK → users.id, nullable | 负责人 |
| order | Integer | NOT NULL, default 0 | 显示排序 |
| created_at | DateTime(tz) | server_default now() | |

关系：
- `Module` → `Project`（多对一）
- `Module` → `User`（多对一，owner，可空）
- `Module` → `Task`（一对多）

### 2.2 `tasks` 表变更

新增字段：`module_id UUID FK → modules.id nullable index`

- 历史任务 `module_id` 为 NULL，在 UI 显示为「未分配」组（仅当存在时才渲染）
- 新建任务时 `module_id` 为必填

## 3. 后端 API

### 3.1 模块 CRUD

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/projects/{project_id}/modules` | 已登录 | 列出项目所有模块（含 owner 姓名） |
| POST | `/projects/{project_id}/modules` | admin | 创建模块 |
| PATCH | `/modules/{module_id}` | admin 或模块 owner | 编辑模块（name/description/owner_id/order） |
| DELETE | `/modules/{module_id}` | admin | 删除模块（级联：将该模块下任务的 module_id 置 NULL） |

### 3.2 任务接口变更

- `TaskCreate` schema 新增 `module_id: Optional[UUID]`
- `TaskUpdate` schema 新增 `module_id: Optional[UUID]`
- `TaskOut` schema 新增 `module: Optional[{ id, name }]`

### 3.3 Schema 定义

```python
class ModuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: Optional[UUID] = None
    order: int = 0

class ModuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[UUID] = None
    order: Optional[int] = None

class ModuleOwnerOut(BaseModel):
    id: UUID
    name: str

class ModuleOut(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str]
    owner: Optional[ModuleOwnerOut]
    order: int
    created_at: datetime
    model_config = {"from_attributes": True}
```

## 4. 前端设计

### 4.1 路由

路由结构**不变**，仍为 `/projects/:id/tasks`。

### 4.2 新增 API

```typescript
// src/api/modules.ts
export const modulesApi = {
  list: (projectId: string) => client.get<Module[]>(`/projects/${projectId}/modules`),
  create: (projectId: string, data: ModuleCreate) => client.post<Module>(`/projects/${projectId}/modules`, data),
  update: (id: string, data: Partial<ModuleCreate>) => client.patch<Module>(`/modules/${id}`, data),
  delete: (id: string) => client.delete(`/modules/${id}`),
}
```

### 4.3 新增类型

```typescript
export interface Module {
  id: string
  project_id: string
  name: string
  description: string | null
  owner: { id: string; name: string } | null
  order: number
  created_at: string
}
```

### 4.4 TasksPage 结构

**数据层**：同时查询 modules 和 tasks，客户端按 `module_id` 分组：

```
groupedTasks = {
  [moduleId]: Task[],
  __unassigned__: Task[]   // module_id 为 null 的任务
}
```

**渲染结构**（列表与看板共用模块分组框架）：

```
TasksPage
├── Header（项目名、[新建模块]、[新建任务]、[导出]、[统计]、[成员]）
├── Tab（看板 | 列表）
└── ModuleSection × N
    ├── ModuleHeader（名称、描述、负责人头像、任务数、[编辑]、[收起/展开]）
    └── ModuleContent（收起时隐藏）
        ├── 看板模式：KanbanBoard（独立 DndContext，仅在本模块内拖拽）
        └── 列表模式：TaskTable
```

**未分配分组**：仅当存在 `module_id = null` 的任务时，在所有模块下方渲染一个不可编辑的「未分配」分组。

### 4.5 收起/展开状态

```typescript
const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
// 默认全部展开；切换时 add/delete moduleId
```

### 4.6 新建任务弹窗变更

「所属模块」下拉选择器（必填），从当前项目模块列表中选；当从某模块头部触发新建时预填该模块。

### 4.7 权限控制

| 操作 | 可见/可用角色 |
|------|--------------|
| 新建模块按钮 | admin |
| 删除模块 | admin |
| 编辑模块按钮 | admin 或该模块 owner |
| 新建任务 | admin（现有逻辑不变） |

## 5. 导出变更

### 5.1 项目概览 Sheet

新增行：各模块任务数汇总，格式为「模块A：X 个任务」。

### 5.2 任务明细 Sheet

列顺序调整，新增「模块」列：

| 模块 | 任务标题 | 描述 | 负责人 | 状态 | 优先级 | 进度(%) | 截止日期 | 创建时间 | 最后更新 |

`module_id` 为 NULL 的任务显示为「未分配」。

## 6. 数据库迁移

使用 Alembic 生成迁移脚本：
1. 创建 `modules` 表
2. 在 `tasks` 表添加 `module_id` 列（nullable，FK）
3. 不回填历史数据

## 7. 非功能要求

- 模块列表与任务列表使用独立 query key，互不影响缓存
- 删除模块前需二次确认弹窗
- 看板拖拽仅在同一模块内生效，不支持跨模块拖拽
- 模块顺序暂不支持拖拽排序（按 `order` 字段 + 创建时间排序）
