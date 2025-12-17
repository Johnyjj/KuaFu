# 项目管理系统 - 基于DDD的高质量前后端项目

## 项目概述

这是一个基于**领域驱动设计（DDD）**思想构建的项目管理系统，展示了如何构建高质量、高标准的企业级应用。项目采用Python后端 + Vue.js前端的技术栈，遵循Clean Architecture原则，实现了清晰的分层架构和业务逻辑封装。

## 技术栈

### 后端
- **FastAPI** - 高性能异步API框架
- **SQLAlchemy 2.0** - ORM和数据库迁移
- **PostgreSQL** - 主数据库
- **Redis** - 缓存和会话存储
- **Pydantic** - 数据验证和序列化
- **pytest** - 单元测试

### 前端
- **Vue.js 3** - 使用Composition API
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router 4** - 路由管理
- **Element Plus** - UI组件库
- **Axios** - HTTP客户端
- **Vite** - 构建工具

## DDD架构设计

### 核心概念实现

#### 1. 领域层（Domain Layer）
- **值对象（Value Objects）**: `ProjectId`, `TaskId`, `UserId`, `Priority`, `TaskStatus`
- **实体（Entities）**: `Project`, `Task`, `User`
- **聚合（Aggregates）**: 项目和任务作为聚合根
- **领域服务（Domain Services）**: `ProjectDomainService`, `TaskDomainService`, `UserDomainService`
- **仓储接口（Repositories）**: 定义数据访问契约

#### 2. 应用层（Application Layer）
- **应用服务**: 协调领域对象和基础设施
- **DTOs**: 数据传输对象，隔离内部模型
- **依赖注入**: 使用FastAPI的依赖注入系统

#### 3. 基础设施层（Infrastructure Layer）
- **数据库模型**: SQLAlchemy ORM模型
- **仓储实现**: 具体的数据访问实现
- **外部服务**: 缓存、消息队列等

#### 4. 接口层（Interface Layer）
- **API控制器**: RESTful API端点
- **中间件**: 认证、日志、错误处理
- **数据验证**: 请求/响应验证

### 项目目录结构

```
project_management_ddd/
├── backend/                     # 后端应用
│   ├── app/
│   │   ├── api/                 # API接口层
│   │   │   └── v1/
│   │   ├── application/         # 应用服务层
│   │   │   ├── services/
│   │   │   └── dtos/
│   │   ├── domain/              # 领域层
│   │   │   ├── entities/        # 实体
│   │   │   ├── value_objects/   # 值对象
│   │   │   ├── services/        # 领域服务
│   │   │   ├── repositories/    # 仓储接口
│   │   │   └── factories/       # 领域工厂
│   │   ├── infrastructure/      # 基础设施层
│   │   │   ├── database/        # 数据库
│   │   │   ├── cache/           # 缓存
│   │   │   └── security/        # 安全
│   │   └── tests/               # 测试
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                    # 前端应用
│   ├── src/
│   │   ├── api/                 # API客户端
│   │   ├── stores/              # Pinia状态管理
│   │   ├── views/               # 页面视图
│   │   ├── components/          # 组件
│   │   ├── composables/         # 组合式函数
│   │   ├── types/               # TypeScript类型
│   │   └── utils/               # 工具函数
│   ├── package.json
│   └── Dockerfile
├── docs/                        # 文档
│   └── DDD_Architecture.md
├── docker-compose.yml           # Docker编排
└── README.md
```

## 核心功能模块

### 1. 项目管理
- 创建、编辑、删除项目
- 项目成员管理
- 项目状态管理（计划中、活跃、暂停、已完成、已取消）
- 项目进度跟踪
- 项目健康度分析
- 项目速度计算

### 2. 任务管理
- 创建、编辑、删除任务
- 任务分配和状态流转
- 任务优先级设置
- 子任务支持
- 任务标签管理
- 截止日期跟踪
- 任务风险评估
- 工作量分析

### 3. 用户管理
- 用户注册、登录、认证
- 用户信息管理
- 权限控制
- 用户活跃度统计
- 生产力分析

## DDD设计原则

### 1. 聚合（Aggregetes）
- **项目聚合**: 包含项目实体及其关联的任务
- **用户聚合**: 包含用户实体及其相关信息
- 聚合内部保持强一致性，聚合间通过ID引用

### 2. 仓储模式（Repository Pattern）
- 定义领域层的仓储接口
- 基础设施层实现具体仓储
- 隐藏数据访问细节

### 3. 工厂模式（Factory Pattern）
- 创建复杂的聚合对象
- 封装创建逻辑

### 4. 领域服务（Domain Services）
- 跨聚合的业务逻辑
- 复杂的计算和验证
- 不属于任何特定实体的操作

### 5. 贫血模型 vs 充血模型
- 采用**充血模型**，业务逻辑内聚在实体内部
- 实体包含状态和行为

## 快速开始

### 环境要求
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 使用Docker启动

```bash
# 克隆项目
git clone <repository-url>
cd project_management_ddd

# 启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 手动启动

#### 后端
```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --port 8000
```

#### 前端
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## API文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看交互式API文档。

### 主要API端点

#### 项目管理
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects/{id}` - 获取项目详情
- `PATCH /api/v1/projects/{id}` - 更新项目
- `DELETE /api/v1/projects/{id}` - 删除项目
- `GET /api/v1/projects/{id}/health` - 获取项目健康度

#### 任务管理
- `GET /api/v1/tasks` - 获取任务列表
- `POST /api/v1/tasks` - 创建任务
- `GET /api/v1/tasks/{id}` - 获取任务详情
- `PATCH /api/v1/tasks/{id}` - 更新任务
- `DELETE /api/v1/tasks/{id}` - 删除任务

#### 用户管理
- `GET /api/v1/users` - 获取用户列表
- `POST /api/v1/users` - 创建用户
- `GET /api/v1/users/{id}` - 获取用户详情
- `PATCH /api/v1/users/{id}` - 更新用户
- `DELETE /api/v1/users/{id}` - 删除用户

## 测试

### 后端测试
```bash
cd backend

# 运行单元测试
pytest

# 运行测试并生成覆盖率报告
pytest --cov=app

# 运行集成测试
pytest tests/integration
```

### 前端测试
```bash
cd frontend

# 运行单元测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 最佳实践

### 1. 领域驱动设计
- 明确领域边界上下文
- 使用通用语言（Ubiquitous Language）
- 持续重构领域模型

### 2. 测试驱动开发
- 先写测试，再写实现
- 单元测试覆盖核心业务逻辑
- 集成测试验证系统交互

### 3. 代码质量
- 严格的类型检查（TypeScript）
- 代码审查
- 持续集成/持续部署

### 4. 错误处理
- 统一错误处理机制
- 详细的错误日志
- 用户友好的错误信息

## 扩展建议

### 1. 添加更多领域
- 时间追踪（Time Tracking）
- 文件管理（File Management）
- 通知系统（Notification）
- 报表分析（Reporting & Analytics）

### 2. 技术增强
- 事件驱动架构（Event Sourcing）
- CQRS模式
- 微服务拆分
- API网关

### 3. 性能优化
- 数据库索引优化
- 缓存策略
- 异步处理
- CDN加速

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](../../issues)
- 发送邮件至 [your-email@example.com](mailto:your-email@example.com)

---

**注意**: 这是一个演示项目，展示了如何应用DDD原则构建高质量的企业级应用。在生产环境中使用前，请根据实际需求进行安全性和性能优化。
# Test
