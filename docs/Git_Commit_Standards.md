# Git 提交规范与最佳实践

## 📋 目录
1. [提交信息格式](#提交信息格式)
2. [分支管理规范](#分支管理规范)
3. [推送前检查清单](#推送前检查清单)
4. [常见问题解决方案](#常见问题解决方案)
5. [工作流程](#工作流程)

---

## 📝 提交信息格式

### 格式规范
```
<类型>(<范围>): <简短描述>

<详细描述（可选）>

<相关问题编号（可选）>
```

### 提交类型
- **feat**: 新功能 (feature)
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式化（不影响代码运行的变动）
- **refactor**: 重构（即不是新增功能，也不是修改bug的代码变动）
- **test**: 增加测试
- **chore**: 构建过程或辅助工具的变动

### 示例
```bash
# 好的提交信息
feat(domain): 添加项目实体类
fix(api): 修复用户创建接口的认证问题
docs(readme): 更新安装说明

# 不好的提交信息
feat: 添加了一些功能
fix: bug修复
更新了代码
```

---

## 🌿 分支管理规范

### 分支命名
- **main**: 主分支，生产环境代码
- **dev**: 开发分支，集成测试环境
- **feature/功能名**: 功能分支
- **bugfix/问题描述**: 修复分支
- **hotfix/紧急修复**: 紧急修复分支

### 分支操作流程
```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "feat: 添加新功能"

# 3. 推送分支
git push -u origin feature/new-feature

# 4. 合并到dev（通过PR）
# 5. 合并到main（通过PR）
```

---

## ✅ 推送前检查清单

### 每次推送前必须执行

1. **检查当前分支**
   ```bash
   git branch --show-current
   ```

2. **检查提交状态**
   ```bash
   git status
   git log --oneline -5
   ```

3. **检查远程状态**
   ```bash
   git ls-remote origin
   ```

4. **同步远程更新**
   ```bash
   git fetch origin
   git pull origin main --rebase  # 如果在main分支
   ```

5. **验证推送**
   ```bash
   git push origin <分支名>
   ```

### 强制推送（谨慎使用）
```bash
# 仅在以下情况使用
# 1. 回滚错误提交
# 2. 修复历史提交
# 3. 解决分支分叉问题

git push --force-with-lease origin <分支名>
```

---

## 🔧 常见问题解决方案

### 问题1: 代理配置错误
**错误信息**:
```
fatal: unable to access 'https://github.com/xxx.git/':
Could not resolve proxy: proxy.huawei.com
```

**解决方案**:
```bash
# 清除代理配置
git config --global --unset http.proxy
git config --global --unset https.proxy

# 验证清除
git config --global --list | grep -i proxy
```

### 问题2: 推送被拒绝（远程包含本地没有的代码）
**错误信息**:
```
! [rejected]        main -> main (fetch first)
Updates were rejected because the remote contains work that you do not have locally.
```

**解决方案**:
```bash
# 方案1: 拉取并合并
git fetch origin
git pull origin main --rebase
git push origin main

# 方案2: 强制推送（谨慎使用）
git push origin main --force-with-lease
```

### 问题3: 网络连接失败
**错误信息**:
```
fatal: unable to access 'https://github.com/xxx.git/':
Failed to connect to github.com port 443 after 21058 ms: Couldn't connect to server
```

**解决方案**:
```bash
# 1. 检查网络连接
ping github.com

# 2. 重试推送
git push origin main

# 3. 增加超时时间
git config --global http.postBuffer 524288000
```

### 问题4: 认证失败
**错误信息**:
```
git@github.com: Permission denied (publickey).
```

**解决方案**:
```bash
# 1. 使用HTTPS URL
git remote set-url origin https://github.com/username/repo.git

# 2. 或配置SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"
# 将公钥添加到GitHub
```

---

## 🔄 工作流程

### 日常开发流程

1. **开始工作**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/xxx
   ```

2. **开发阶段**
   ```bash
   # 频繁提交，保持原子性
   git add <文件>
   git commit -m "feat: 添加功能描述"

   # 推送分支
   git push -u origin feature/xxx
   ```

3. **提交前准备**
   ```bash
   # 回到main分支
   git checkout main
   git pull origin main

   # 切换到功能分支
   git checkout feature/xxx
   git rebase main  # 保持提交历史整洁
   ```

4. **合并代码**
   ```bash
   # 创建Pull Request
   # 或本地合并
   git checkout main
   git merge feature/xxx
   git push origin main
   ```

---

## 📚 常用命令参考

### 基本操作
```bash
# 初始化
git init
git clone <url>

# 状态检查
git status
git log --oneline --graph --all
git diff

# 分支操作
git branch -a
git checkout <branch>
git checkout -b <new-branch>
git merge <branch>

# 远程操作
git remote -v
git fetch origin
git pull origin <branch>
git push origin <branch>
```

### 历史管理
```bash
# 撤销操作
git reset --soft HEAD~1      # 撤销提交但保留更改
git reset --hard HEAD~1      # 完全撤销提交和更改
git revert <commit-hash>     # 创建新的提交来撤销之前的提交

# 查看历史
git log --oneline
git show <commit-hash>
git blame <file>
```

---

## ⚠️ 重要提醒

1. **永远不要在main分支直接开发**
2. **提交前必须检查当前分支**
3. **推送前必须先pull最新代码**
4. **强制推送前确保没有其他人的工作**
5. **保持提交信息清晰、简洁、有意义**
6. **定期同步远程更新，避免大幅分叉**

---

## 📞 技术支持

如遇到本规范未覆盖的问题：
1. 检查 `.git/config` 文件
2. 查看详细错误信息
3. 参考 [Git官方文档](https://git-scm.com/doc)
4. 使用 `git help <command>` 获取帮助

---

**最后更新**: 2025-12-16
**适用范围**: 项目管理系统 DDD 架构