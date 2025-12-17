
## 概述
为了保证代码质量和团队协作效率，本项目采用规范化的Git提交流程。每次迭代一个小功能，经过测试用例验证后及时提交到Git仓库。

## 提交流程

### 1. 功能开发流程

```bash
# 1. 从主分支拉取最新代码
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 开发功能并编写测试用例

# 4. 运行测试用例
# 后端测试
cd backend
pytest app/tests/

# 前端测试
cd frontend
npm run test

# 5. 提交代码（遵循约定式提交）
git add .
git commit -m "feat: 添加新功能描述"

# 6. 推送到远程分支
git push origin feature/your-feature-name

# 7. 创建Pull Request进行代码审查

# 8. 合并到主分支
git checkout main
git pull origin main
```

### 2. 提交信息规范

使用约定式提交格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 类型（type）：

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式调整（不影响功能）
- **refactor**: 代码重构
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动
- **perf**: 性能优化
- **ci**: 持续集成相关

#### 示例：

```bash
# 新功能
git commit -m "feat(project): 添加项目创建功能"

# 修复bug
git commit -m "fix(task): 修复任务状态更新bug"

# 重构
git commit -m "refactor(user): 重构用户服务层代码"

# 测试
git commit -m "test(project): 添加项目实体单元测试"

# 文档
git commit -m "docs: 更新API文档"
```

### 3. 分支管理策略

- **main**: 主分支，始终保持可部署状态
- **feature/**: 功能分支，从main分支创建
- **hotfix/**: 紧急修复分支，从main分支创建

### 4. 提交前检查清单

- [ ] 代码经过自测
- [ ] 测试用例全部通过
- [ ] 提交信息符合规范
- [ ] 没有不必要的文件（被.gitignore忽略）
- [ ] 代码经过代码审查

### 5. 常用Git命令

```bash
# 查看当前状态
git status

# 查看提交历史
git log --oneline --graph

# 查看分支
git branch -a

# 切换分支
git checkout branch-name

# 创建并切换分支
git checkout -b new-branch

# 合并分支
git merge branch-name

# 删除分支
git branch -d branch-name

# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 撤销最后一次提交（不保留修改）
git reset --hard HEAD~1

# 暂存当前修改
git stash

# 恢复暂存的修改
git stash pop
```

### 6. 项目结构

```
project_management_ddd/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── domain/         # 领域层
│   │   ├── application/    # 应用层
│   │   ├── infrastructure/ # 基础设施层
│   │   └── tests/          # 测试用例
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── views/         # 视图组件
│   │   ├── api/           # API接口
│   │   ├── stores/        # 状态管理
│   │   └── router/        # 路由配置
│   └── Dockerfile
├── docs/                   # 项目文档
├── docker-compose.yml      # Docker编排文件
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明
```

### 7. 最佳实践

1. **小步提交**: 每次提交只包含一个小的功能或修复
2. **及时提交**: 开发过程中及时提交，避免丢失工作进度
3. **代码审查**: 通过Pull Request进行代码审查
4. **测试驱动**: 先写测试用例，再实现功能
5. **文档更新**: 重要功能需要同步更新文档

## 注意事项

- 提交前确保所有测试用例通过
- 避免在主分支上直接开发
- 使用语义化的分支名称
- 保持提交历史的整洁