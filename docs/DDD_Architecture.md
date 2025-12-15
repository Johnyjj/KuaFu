# 项目管理系统DDD架构设计

## 1. 领域驱动设计（DDD）架构

### 1.1 整体架构
```
┌─────────────────────────────────────────────────┐
│                 Frontend (Vue.js 3)              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Views     │ │   Stores    │ │  Components │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
                           │
                           ▼ API
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   DTOs      │ │  Controllers│ │   Services  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
                           │
                           ▼ Domain Logic
┌─────────────────────────────────────────────────┐
│              Domain Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Aggregates  │ │   Entities  │ │ ValueObjects│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Domain Services││ Repositories│ │   Factories │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
                           │
                           ▼ Persistence
┌─────────────────────────────────────────────────┐
│           Infrastructure Layer                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  Database   │ │    Cache    │ │   MQ/Events │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

### 1.2 核心领域模块

#### 项目管理领域 (Project Management Domain)
- **聚合根 (Aggregate Root)**: Project
- **实体 (Entities)**: Task, Subtask, ProjectMember
- **值对象 (Value Objects)**: ProjectId, TaskId, Priority, Status
- **领域服务 (Domain Services)**: ProjectDomainService, TaskDomainService

#### 用户管理领域 (User Management Domain)
- **聚合根 (Aggregate Root)**: User
- **实体 (Entities)**: Role, Permission, UserProfile
- **值对象 (Value Objects)**: UserId, Email, FullName
- **领域服务 (Domain Services)**: UserDomainService, AuthenticationService

#### 团队管理领域 (Team Management Domain)
- **聚合根 (Aggregate Root)**: Team
- **实体 (Entities)**: TeamMember, TeamRole
- **值对象 (Value Objects)**: TeamId, TeamName
- **领域服务 (Domain Services)**: TeamDomainService

#### 时间追踪领域 (Time Tracking Domain)
- **聚合根 (Aggregate Root)**: TimeEntry
- **实体 (Entities)**: Timesheet
- **值对象 (Value Objects)**: TimeEntryId, Duration, DateRange
- **领域服务 (Domain Services)**: TimeTrackingService

### 1.3 技术栈选择

#### 后端
- **框架**: FastAPI (高性能异步API框架)
- **ORM**: SQLAlchemy 2.0 + Alembic
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证**: JWT (FastAPI-Users)
- **测试**: pytest
- **API文档**: 自动生成OpenAPI 3.0

#### 前端
- **框架**: Vue.js 3 (Composition API)
- **类型检查**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI组件**: Element Plus
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **测试**: Vitest + Vue Test Utils

#### 部署
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **监控**: Prometheus + Grafana (可选)

## 2. 目录结构

### 2.1 后端目录结构
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI应用入口
│   ├── config.py                  # 配置管理
│   ├── dependencies.py            # 依赖注入
│   ├── api/                       # API接口层
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── projects.py        # 项目管理API
│   │   │   ├── tasks.py           # 任务管理API
│   │   │   ├── users.py           # 用户管理API
│   │   │   └── teams.py           # 团队管理API
│   ├── application/               # 应用服务层
│   │   ├── __init__.py
│   │   ├── services/
│   │   │   ├── project_service.py
│   │   │   ├── task_service.py
│   │   │   └── user_service.py
│   │   └── dtos/                  # 数据传输对象
│   │       ├── project_dtos.py
│   │       └── task_dtos.py
│   ├── domain/                    # 领域层
│   │   ├── __init__.py
│   │   ├── entities/              # 实体
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   └── user.py
│   │   ├── value_objects/         # 值对象
│   │   │   ├── project_id.py
│   │   │   ├── task_id.py
│   │   │   └── priority.py
│   │   ├── repositories/          # 仓储接口
│   │   │   ├── project_repository.py
│   │   │   └── task_repository.py
│   │   ├── services/              # 领域服务
│   │   │   ├── project_domain_service.py
│   │   │   └── task_domain_service.py
│   │   └── factories/             # 领域工厂
│   │       └── entity_factory.py
│   ├── infrastructure/            # 基础设施层
│   │   ├── __init__.py
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── models/            # ORM模型
│   │   │   │   ├── project.py
│   │   │   │   ├── task.py
│   │   │   │   └── user.py
│   │   │   └── repositories/      # 仓储实现
│   │   │       ├── project_repository_impl.py
│   │   │       └── task_repository_impl.py
│   │   ├── cache/
│   │   │   └── redis_client.py
│   │   └── security/
│   │       └── auth.py
│   └── tests/                     # 测试
│       ├── __init__.py
│       ├── unit/                  # 单元测试
│       └── integration/           # 集成测试
├── alembic/                       # 数据库迁移
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### 2.2 前端目录结构
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.ts                    # 应用入口
│   ├── App.vue                    # 根组件
│   ├── api/                       # API接口
│   │   ├── client.ts              # HTTP客户端
│   │   ├── projects.ts            # 项目API
│   │   └── tasks.ts               # 任务API
│   ├── stores/                    # Pinia状态管理
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── user.ts
│   ├── views/                     # 页面视图
│   │   ├── projects/
│   │   │   ├── ProjectList.vue
│   │   │   └── ProjectDetail.vue
│   │   └── tasks/
│   │       ├── TaskList.vue
│   │       └── TaskDetail.vue
│   ├── components/                # 通用组件
│   │   ├── ProjectCard.vue
│   │   ├── TaskCard.vue
│   │   └── UserAvatar.vue
│   ├── composables/               # 组合式函数
│   │   ├── useProject.ts
│   │   └── useTask.ts
│   ├── types/                     # TypeScript类型定义
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── user.ts
│   ├── utils/                     # 工具函数
│   │   └── date.ts
│   └── styles/
│       ├── main.css
│       └── variables.css
├── tests/                         # 测试
│   ├── unit/
│   └── e2e/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

## 3. 核心设计原则

### 3.1 DDD核心概念

1. **聚合 (Aggregate)**: 一组相关对象的集合，作为数据修改的单元
2. **聚合根 (Aggregate Root)**: 聚合中的根实体，唯一对外暴露
3. **实体 (Entity)**: 具有唯一标识的对象
4.值对象 (Value Object)**: 通过属性值识别的不可变对象
5. **仓储 (Repository)**: 负责持久化聚合的对象集合
6. **工厂 (Factory)**: 负责创建复杂聚合的对象
7. **领域服务 (Domain Service)**: 包含重要业务逻辑但不属于任何实体的操作

### 3.2 依赖倒置原则
- 领域层定义接口
- 基础设施层实现接口
- 应用服务层依赖领域层接口

### 3.3 边界上下文 (Bounded Context)
- 每个领域模块独立开发
- 清晰的模块边界
- 通过明确的接口进行通信

## 4. 业务流程示例

### 4.1 创建项目流程
1. 前端发送创建项目请求
2. 控制器接收请求并转换为DTO
3. 应用服务验证并调用领域服务
4. 领域服务创建项目聚合
5. 仓储保存到数据库
6. 返回项目DTO

### 4.2 任务分配流程
1. 管理员分配任务给用户
2. 检查任务和用户的聚合完整性
3. 更新任务状态和负责人
4. 发送领域事件 (Domain Event)
5. 通知用户
6. 更新数据库
