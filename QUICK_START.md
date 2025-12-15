# 快速启动指南

## 🚀 快速部署（推荐）

### 使用Docker Compose（最简单）

```bash
# 1. 克隆项目
git>
cd project_management_ddd

# clone <repository-url 2. 启动所有服务
docker-compose up -d

# 3. 等待服务启动（约1-2分钟）
# 查看日志
docker-compose logs -f

# 4. 访问应用
# 前端: http://localhost:3000
# 后端API: http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（慎用）
docker-compose down -v
```

---

## 💻 本地开发

### 前置要求

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Git

### 1. 启动数据库和缓存

```bash
# 使用Docker启动数据库和Redis
docker run -d \
  --name pm_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=project_management \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d \
  --name pm_redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 2. 后端开发

```bash
cd backend

#python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux 创建虚拟环境
/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量（可选）
# 创建 .env 文件
cat > .env << EOF
DEBUG=true
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=project_management
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

# 运行数据库迁移
# alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --port 8000

# 访问 http://localhost:8000/docs 查看API文档
```

### 3. 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 📝 验证安装

### 1. 检查后端API

```bash
curl http://localhost:8000/health
# 期望返回: {"status":"healthy"}
```

### 2. 检查API文档

访问 http://localhost:8000/docs

### 3. 检查前端

访问 http://localhost:3000

---

## 🔧 常见问题

### Q: Docker Compose启动失败

**A**: 检查端口占用
```bash
# 检查端口
netstat -tulpn | grep 5432  # PostgreSQL
netstat -tulpn | grep 6379  # Redis
netstat -tulpn | grep 8000  # 后端
netstat -tulpn | grep 3000  # 前端

# 如果端口被占用，停止相应服务或修改docker-compose.yml中的端口映射
```

### Q: 数据库连接失败

**A**: 检查数据库是否启动
```bash
docker-compose logs postgres
```

### Q: 前端无法连接后端

**A**: 检查CORS配置和API地址

### Q: 依赖安装失败

**A**: 更新pip和npm
```bash
# Python
pip install --upgrade pip

# Node.js
npm install -g npm@latest
```

---

## 📚 下一步

1. **阅读架构文档**
   - `docs/DDD_Architecture.md` - 了解DDD设计
   - `docs/Project_Summary.md` - 查看完整实现

2. **探索API**
   - 访问 http://localhost:8000/docs
   - 使用Swagger UI测试API

3. **开发指南**
   - 查看代码注释
   - 运行单元测试
   - 添加新功能

4. **生产部署**
   - 修改生产环境配置
   - 启用HTTPS
   - 配置负载均衡

---

## 📞 获取帮助

- 📖 查看 `README.md` 了解详细信息
- 🐛 提交 Issue 报告问题
- 💡 查看代码示例和最佳实践

---

**祝您使用愉快！** 🎉
