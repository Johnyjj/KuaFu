# KuaFu 前端设计规范

**日期：** 2026-04-10
**状态：** 已确认
**关联后端计划：** `docs/superpowers/plans/2026-04-08-backend.md`

---

## 1. 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18 + Vite | 开发体验好，构建快 |
| 组件库 | shadcn/ui | 无样式注入，完全贴合设计系统 |
| 图表 | Recharts | 专业数据可视化，支持动画 |
| 服务端状态 | TanStack Query v5 | 接口缓存、loading/error 统一管理 |
| 客户端状态 | Zustand | 轻量，用于 UI 状态（侧边栏、Tab 等） |
| 拖拽 | @dnd-kit | 看板拖拽改任务状态 |
| 路由 | React Router v6 | 客户端路由 |
| HTTP | Axios | 统一拦截 JWT token |
| 样式 | Tailwind CSS v3 | 与 shadcn/ui 配套 |
| 图标 | Lucide React | SVG 图标，禁止 emoji |
| 构建 | Vite 5 | 端口 5173 |

---

## 2. 设计系统

沿用 `findings.md` 已定义的设计系统：

### 色彩
```css
/* 中性色主体，色彩只用于语义（状态标签） */
--color-bg-sidebar: #f7f7f5      /* 侧边栏：温暖浅灰 */
--color-bg-content: #ffffff      /* 内容区：纯白 */
--color-bg-page: #fafafa         /* 页面底：极浅灰 */
--color-bg-hover: #e8e8e6        /* hover/选中背景 */
--color-border: #e8e8e6          /* 边框 */

--color-text-primary: #191919    /* 主文字：近黑 */
--color-text-secondary: #555555  /* 副文字 */
--color-text-muted: #8c8c8c      /* 占位/辅助 */
--color-text-disabled: #aaaaaa   /* 禁用 */

--color-interactive: #191919     /* 按钮、链接、进度条 */
--color-ring: #191919            /* 焦点环 */

/* 语义色（仅用于状态标签，不用于布局/装饰） */
--color-status-done: #16a34a     /* 已完成 */
--color-status-progress: #2563eb /* 进行中 */
--color-status-blocked: #dc2626  /* 阻塞 */
--color-status-todo: #92400e     /* 待办（暖棕）*/
--color-destructive: #dc2626     /* 删除/危险 */
```

### 字体
```css
font-family: 'Plus Jakarta Sans', sans-serif;
/* 权重：400 正文 / 600 标签 / 700 标题 / 800 KPI 数字 */
```

### 交互规范
- hover 微动画：50–100ms ease-out
- 卡片 hover：`shadow-md + -translate-y-0.5`
- 按钮点击：`scale-95` 反馈
- 页面切换：`fade + slide` 100ms
- 加载态：骨架屏（Skeleton），禁止纯 spinner 阻塞整页

---

## 3. 路由结构

```
/login                          登录页（未登录跳转此处）
/                               重定向到 /projects
/projects                       项目列表
/projects/:id                   重定向到 /projects/:id/tasks
  /projects/:id/tasks           任务视图（默认 Tab）
  /projects/:id/members         成员管理
  /projects/:id/stats           数据统计
/users                          用户管理（admin 专属，非 admin 跳转 403）
```

路由守卫：
- 未登录访问任何页 → 跳转 `/login`
- member 访问 `/users` → 跳转 `/projects` 并提示无权限

---

## 4. 应用骨架

### 侧边栏（220px，深色 `#0F172A`）
- 顶部：Logo "K" 图标 + "KuaFu" 文字
- 主导航：项目列表 / 我的任务 / 成员管理（管理员标签）
- 项目列表区：彩色圆点 + 项目名，点击跳转 `/projects/:id/tasks`
- 新建项目入口（admin 可见）
- 底部：当前用户头像 + 名字 + 邮箱 + 登出图标

### 顶部栏（52px，白色，border-bottom）
- 左：当前页面标题 + 副标题（如"共 N 个项目"）
- 右：页面相关操作按钮（新建项目、导出等）

### 内容区
- 背景 `#F8FAFC`
- padding: `20px 24px`
- 最大宽度：不限（fluid layout）

---

## 5. 页面规范

### 5.1 登录页（`/login`）
- 居中卡片，白色背景，宽 400px
- Logo + 标题"欢迎回来"
- 邮箱输入框 + 密码输入框（可见/隐藏切换）
- 登录按钮（全宽，`#2563EB`）
- 错误提示：红色内联提示（非 toast）
- 登录成功 → 跳转 `/projects`，token 存 `localStorage`

### 5.2 项目列表（`/projects`）
- 卡片网格，`grid-cols-3`（≥1280px），`grid-cols-2`（768–1279px）
- 每张卡片：项目图标 + 状态标签 + 项目名 + 描述 + 进度条 + 完成任务数 + 成员头像堆叠
- 新建项目卡（虚线边框，仅 admin 可见）→ 弹出 Dialog 创建
- 点击卡片 → 跳转 `/projects/:id/tasks`

### 5.3 任务视图（`/projects/:id/tasks`）

**顶部控制栏：**
- 左：Tab 切换「看板 | 列表」
- 右：筛选（状态/优先级/负责人）+ 新建任务按钮（admin）

**看板视图（Kanban）：**
- 4 列：待办 / 进行中 / 完成 / 阻塞
- 每列顶部：状态名 + 任务数
- 任务卡片：标题 + 优先级标签 + 负责人头像 + 进度条 + 截止日
- 拖拽（@dnd-kit）改变状态，即时更新 + 乐观更新
- 点击任务卡 → 右侧滑出抽屉（Task Detail Drawer）

**列表视图：**
- 表格：复选框 / 任务名 / 状态 / 优先级 / 负责人 / 截止日 / 进度
- 行点击 → 同上抽屉

**Task Detail Drawer（右侧 480px）：**
- 任务标题（可编辑）
- 状态 / 优先级 / 负责人 / 截止日（可编辑）
- 进度滑块
- 进展日志列表（倒序）
- 添加进展日志表单（内容 + 进度 + 状态）
- 状态枚举显示映射：`todo`→待办 / `in_progress`→进行中 / `done`→已完成 / `blocked`→阻塞

### 5.4 成员管理（`/projects/:id/members`）
- 成员卡片列表：头像 + 名字 + 邮箱 + 角色标签
- admin：可添加成员（选择已有用户）/ 移除成员
- member：只读

### 5.5 数据统计（`/projects/:id/stats`）

**顶部操作栏：**
- 时间段筛选下拉（未来扩展，当前固定全量）
- 「导出 Excel」按钮（绿色 `#059669`，调用 `/api/v1/projects/:id/export`）

**KPI 卡片行（4 格）：**
- 总任务数（含本周新增 delta）
- 完成率（进度条）
- 平均进度（进度条）
- 阻塞任务数（红色高亮，>0 时警示）

**图表区（第一行）：**
- 左（1.4fr）：任务状态环形图（Recharts PieChart）+ 图例明细
- 右（1fr）：优先级分布水平条形图（Recharts BarChart）

**图表区（第二行）：**
- 左（1fr）：成员贡献排行（自定义进度条列表，含完成/总数）
- 右（1fr）：7 天进展趋势折线图（Recharts LineChart + AreaChart）

### 5.6 用户管理（`/users`，admin 专属）
- 用户表格：名字 / 邮箱 / 角色 / 创建时间
- 「创建用户」按钮 → Dialog（名字 + 邮箱 + 密码 + 角色）
- 仅 admin 可见，member 重定向

---

## 6. 目录结构

```
frontend/
├── src/
│   ├── api/                    # axios 实例 + 各模块接口函数
│   │   ├── client.ts           # axios 配置，统一加 Authorization header
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   └── users.ts
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 生成的基础组件
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # 侧边栏 + 顶部栏骨架
│   │   │   └── Sidebar.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   └── CreateProjectDialog.tsx
│   │   ├── tasks/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskTable.tsx
│   │   │   └── TaskDrawer.tsx
│   │   └── stats/
│   │       ├── KpiCard.tsx
│   │       ├── StatusDonut.tsx
│   │       ├── PriorityBar.tsx
│   │       ├── MemberContrib.tsx
│   │       └── ProgressTrend.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── MembersPage.tsx
│   │   ├── StatsPage.tsx
│   │   └── UsersPage.tsx
│   ├── store/
│   │   └── uiStore.ts          # Zustand：sidebarOpen, activeTab 等
│   ├── hooks/
│   │   └── useAuth.ts          # 读取 token，解析 role/user_id
│   ├── lib/
│   │   └── utils.ts            # shadcn/ui cn() 工具
│   ├── App.tsx                 # 路由配置 + QueryClientProvider
│   └── main.tsx
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 7. 状态管理策略

- **服务端状态（接口数据）**：全部用 TanStack Query，key 按模块组织（`['projects']`、`['tasks', projectId]` 等）
- **客户端 UI 状态**：Zustand store（侧边栏展开、当前 Tab、抽屉开关）
- **认证状态**：token 存 `localStorage`，`useAuth` hook 读取并解析，`axios` 拦截器自动附加 header
- **乐观更新**：拖拽改任务状态时先本地更新，请求失败回滚

---

## 8. 接口对接约定

后端 base URL：`http://localhost:8000/api/v1`

| 前端操作 | 接口 |
|----------|------|
| 登录 | `POST /auth/login` |
| 获取当前用户 | `GET /auth/me` |
| 项目列表 | `GET /projects` |
| 创建项目 | `POST /projects` |
| 项目任务列表 | `GET /projects/:id/tasks` |
| 创建任务 | `POST /projects/:id/tasks` |
| 更新任务 | `PATCH /tasks/:id` |
| 添加进展日志 | `POST /tasks/:id/logs` |
| 获取日志 | `GET /tasks/:id/logs` |
| 项目成员 | `GET /projects/:id/members` |
| 添加成员 | `POST /projects/:id/members` |
| 移除成员 | `DELETE /projects/:id/members/:userId` |
| 统计数据 | `GET /projects/:id/stats` |
| 导出 Excel | `GET /projects/:id/export`（blob 下载）|
| 用户列表 | `GET /users` |
| 创建用户 | `POST /users` |

---

## 9. 非功能要求

- **响应式**：支持 1280px+ 桌面端，768px+ 平板（侧边栏收起）；不做移动端
- **错误处理**：接口错误统一 toast 提示（shadcn/ui Sonner）；401 自动跳登录；403 提示无权限
- **加载态**：列表/图表用 Skeleton；按钮用 loading spinner
- **空状态**：每个列表有空状态插图 + 引导文字
- **无障碍**：shadcn/ui 基于 Radix UI，键盘导航和 ARIA 开箱即用
