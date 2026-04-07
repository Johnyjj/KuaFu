# KuaFu 项目管理平台 — 设计文档

**日期：** 2026-04-08
**状态：** 已确认
**技术栈：** Vue 3 + FastAPI + PostgreSQL + Docker Compose

---

## 一、产品概述

面向公司内部开发和项目管理人员的 Web 端项目管理平台。支持多项目管理、任务看板、进展追踪、权限隔离，管理员可导出项目报告。

**目标用户：** 公司开发人员（组员）、项目管理人员（管理员）
**平台：** Web 端（桌面浏览器）

---

## 二、用户角色与权限

| 能力 | 管理员 | 组员 |
|------|--------|------|
| 创建项目 | ✅ | ✗ |
| 添加/移除成员 | ✅（仅自己名下项目） | ✗ |
| 查看项目 | ✅ 自己名下全部 | ✅ 仅被加入的项目 |
| 创建/分配任务 | ✅ | ✗ |
| 更新任务进展 | ✅ | ✅（仅自己负责的任务） |
| 查看项目统计 | ✅ | ✗ |
| 导出项目报告 | ✅ | ✗ |

**权限校验逻辑：**
1. 每个请求携带 JWT，解析出 `user_id` + `role`
2. `admin`：检查 `project.owner_id = user_id`
3. `member`：检查 `ProjectMember` 表中存在对应记录
4. 不满足 → 返回 403 Forbidden
5. 任务更新额外校验：`task.assignee_id = current_user.id`

---

## 三、界面与交互设计

### 布局结构
- **顶部导航栏：** Logo、全局操作（通知、头像、退出）
- **左侧项目树：** 固定侧边栏，列出当前用户有权限的项目，点击切换
- **右侧内容区：** 根据路由渲染对应页面

### 页面路由

| 路由 | 页面 | 可访问角色 |
|------|------|-----------|
| `/` | 全局概览仪表板 | 全部（内容按角色过滤） |
| `/projects/:id/board` | 项目看板 | 有权限的用户 |
| `/projects/:id/stats` | 项目统计 | 仅管理员 |
| `/projects/:id/members` | 成员管理 | 仅管理员 |
| `/settings` | 个人设置 | 全部 |
| `/admin/users` | 用户管理 | 仅管理员 |
| `/login` | 登录页 | 未登录 |

### 全局概览仪表板
- **管理员视角：** 名下所有项目进度卡片（完成率、剩余任务数、成员数）、全局任务状态分布图、近期活动流
- **组员视角：** 我负责的任务列表（按状态分组）、近期截止任务提醒

### 项目看板
- 三列 Kanban：**待处理 / 进行中 / 已完成**
- 任务卡片显示：标题、负责人头像、优先级标签、进度条、截止日期
- 点击任务卡片 → 右侧抽屉滑出

### 任务详情抽屉（右侧）
- 任务标题、描述
- 状态下拉（待处理 / 进行中 / 已完成 / 已阻塞）
- 优先级下拉（低 / 中 / 高 / 紧急）
- 进度滑块（0–100%）
- 负责人、截止日期（管理员可编辑）
- **进展日志区：**
  - 文本输入框 + 提交按钮（记录今日进展）
  - 历史日志时间线（倒序，显示时间、内容、当时进度快照）

### 项目统计（管理员）
- 任务完成率进度条
- 任务状态分布饼图
- 成员工作量分布（各成员负责任务数 / 完成数）
- 进展日志汇总时间线
- **一键导出按钮**（Excel / PDF）

---

## 四、数据模型

```sql
-- 用户
User
  id           UUID PK
  name         VARCHAR
  email        VARCHAR UNIQUE
  password_hash VARCHAR
  role         ENUM('admin', 'member')
  created_at   TIMESTAMP

-- 项目
Project
  id           UUID PK
  name         VARCHAR
  description  TEXT
  owner_id     UUID FK→User
  status       ENUM('active', 'completed', 'archived')
  created_at   TIMESTAMP
  updated_at   TIMESTAMP

-- 项目成员（权限隔离核心表）
ProjectMember
  id           UUID PK
  project_id   UUID FK→Project
  user_id      UUID FK→User
  joined_at    TIMESTAMP
  UNIQUE(project_id, user_id)

-- 任务
Task
  id           UUID PK
  project_id   UUID FK→Project
  title        VARCHAR
  description  TEXT
  assignee_id  UUID FK→User (nullable)
  status       ENUM('todo', 'in_progress', 'done', 'blocked')
  priority     ENUM('low', 'medium', 'high', 'urgent')
  progress     INTEGER DEFAULT 0  -- 0~100
  due_date     DATE (nullable)
  created_at   TIMESTAMP
  updated_at   TIMESTAMP

-- 进展日志
TaskLog
  id           UUID PK
  task_id      UUID FK→Task
  user_id      UUID FK→User
  content      TEXT              -- 进展文字
  progress     INTEGER           -- 提交时的进度快照
  status       VARCHAR           -- 提交时的状态快照
  created_at   TIMESTAMP
```

---

## 五、API 设计

```
认证与用户管理
  POST   /api/v1/auth/login          # 登录，返回 JWT
  POST   /api/v1/auth/logout
  GET    /api/v1/users               # 获取所有用户（管理员，用于添加成员时选择）
  POST   /api/v1/users               # 创建用户账号（管理员，内部系统无公开注册）
  PATCH  /api/v1/users/:id           # 修改用户信息（管理员）

项目
  GET    /api/v1/projects            # 按权限过滤返回
  POST   /api/v1/projects            # 管理员创建项目
  GET    /api/v1/projects/:id        # 项目详情
  PATCH  /api/v1/projects/:id        # 更新项目信息（管理员）

成员管理（管理员）
  GET    /api/v1/projects/:id/members
  POST   /api/v1/projects/:id/members      # 添加成员
  DELETE /api/v1/projects/:id/members/:uid # 移除成员

统计与导出（管理员）
  GET    /api/v1/projects/:id/stats        # 统计数据
  GET    /api/v1/projects/:id/export       # 下载报告（?format=excel|pdf）

任务
  GET    /api/v1/projects/:id/tasks        # 看板任务列表
  POST   /api/v1/projects/:id/tasks        # 创建任务（管理员）
  PATCH  /api/v1/tasks/:id                 # 更新状态/进度/负责人
  DELETE /api/v1/tasks/:id                 # 删除任务（管理员）

进展日志
  GET    /api/v1/tasks/:id/logs            # 查看历史日志
  POST   /api/v1/tasks/:id/logs            # 提交进展
```

---

## 六、前端组件结构

```
src/
├── layouts/
│   ├── AppLayout.vue          # 顶部导航 + 左侧项目树 + 内容区
│   └── AuthLayout.vue         # 登录页布局
├── views/
│   ├── DashboardView.vue      # 全局概览
│   ├── ProjectBoardView.vue   # 项目看板
│   ├── ProjectStatsView.vue   # 项目统计（管理员）
│   └── ProjectMembersView.vue # 成员管理（管理员）
├── components/
│   ├── board/
│   │   ├── KanbanBoard.vue    # 看板主体（三列）
│   │   ├── KanbanColumn.vue   # 单列容器
│   │   ├── TaskCard.vue       # 任务卡片
│   │   └── TaskDrawer.vue     # 右侧抽屉面板
│   ├── dashboard/
│   │   ├── StatsCards.vue     # 指标卡片组
│   │   └── ProjectProgress.vue# 项目进度列表
│   └── common/
│       ├── StatusBadge.vue    # 状态标签
│       └── ProgressSlider.vue # 进度滑块
├── stores/
│   ├── auth.ts                # 用户/权限/JWT 状态
│   ├── projects.ts            # 项目列表状态
│   └── tasks.ts               # 任务与日志状态
└── api/
    ├── auth.ts
    ├── projects.ts
    └── tasks.ts
```

---

## 七、后端目录结构

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py         # JWT 验证、权限依赖
│   ├── domain/
│   │   ├── models/             # SQLAlchemy ORM 模型
│   │   └── schemas/            # Pydantic 请求/响应模型
│   ├── routers/
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── tasks.py
│   │   └── exports.py
│   └── services/
│       ├── auth_service.py
│       ├── project_service.py
│       ├── task_service.py
│       └── export_service.py   # openpyxl / reportlab
├── alembic/                    # 数据库迁移
├── requirements.txt
└── Dockerfile
```

---

## 八、设计系统（ui-ux-pro-max）

| 维度 | 规范 |
|------|------|
| 风格 | Micro-interactions（细腻微交互） |
| 主色 | `#2563EB`（专业蓝） |
| 强调色 | `#059669`（完成绿） |
| 危险色 | `#DC2626` |
| 背景 | `#F8FAFC`，边框 `#E4ECFC` |
| 字体 | Plus Jakarta Sans（标题 + 正文） |
| 图标 | Lucide Icons（SVG，禁用 emoji） |
| 动画 | 150–300ms，ease-out 进入，ease-in 退出 |
| 触摸目标 | 最小 44×44px |
| 响应式 | 375 / 768 / 1024 / 1440px 断点 |

---

## 九、导出报告内容

Excel / PDF 报告包含：
1. 项目基本信息（名称、状态、创建时间、成员数）
2. 任务完成率统计
3. 任务明细表（标题、负责人、状态、进度、截止日期）
4. 进展日志时间线（按任务分组）

后端库：`openpyxl`（Excel）、`reportlab`（PDF）
