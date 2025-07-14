# GitHub 推送和代码回退指南

## 🚀 将项目推送到GitHub

### 步骤1：在GitHub创建仓库
1. 登录 [GitHub.com](https://github.com)
2. 点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `life-museum` 或 `onelife`
   - Description: `人生博物馆 - 个人生活展品管理系统`
   - 选择 `Private` 或 `Public`
   - **不要**勾选 "Add a README file"（我们已有README）
4. 点击 "Create repository"

### 步骤2：连接本地仓库到GitHub
```bash
# 添加远程仓库地址（替换YOUR_USERNAME为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/life-museum.git

# 查看远程仓库配置
git remote -v

# 推送代码到GitHub
git push -u origin master
```

### 步骤3：验证推送成功
在GitHub页面刷新，应该看到所有文件已上传。

### 步骤4：后续更新推送
```bash
# 添加修改的文件
git add .

# 提交更改
git commit -m "feat: 添加新功能"

# 推送到GitHub
git push origin master
```

## 🔄 代码回退：回到能运行的状态

### 方法1：查看提交历史
```bash
# 查看所有提交记录
git log --oneline

# 查看详细提交信息
git log --graph --pretty=format:"%h %s %cr %an"
```

### 方法2：回到指定提交（临时回退）
```bash
# 回到指定提交（替换COMMIT_HASH为实际的提交哈希）
git checkout efac4b3

# 查看这个版本的代码是否正常
npm run dev

# 如果正常，创建新分支保存这个状态
git checkout -b working-version

# 切回主分支
git checkout master
```

### 方法3：硬回退（永久回退）
```bash
# ⚠️ 警告：这会永久删除之后的提交！
# 回退到指定提交，丢弃之后的所有更改
git reset --hard efac4b3

# 查看状态
git status
```

### 方法4：安全回退（推荐）
```bash
# 创建一个新的提交来撤销错误的更改
git revert HEAD

# 或者撤销指定的提交
git revert <错误提交的哈希>
```

## 🛡️ 安全开发实践

### 开发新功能前：
```bash
# 1. 确保当前代码可以运行
npm run dev

# 2. 提交当前工作
git add .
git commit -m "保存当前工作状态"

# 3. 创建功能分支
git checkout -b feature/新功能名称

# 4. 开始开发...
```

### 功能开发完成后：
```bash
# 1. 测试新功能
npm run dev

# 2. 如果正常，合并到主分支
git checkout master
git merge feature/新功能名称

# 3. 如果有问题，回到安全状态
git checkout master
# 功能分支的更改不会影响主分支
```

## 🔍 故障排除

### 如果项目无法启动：
```bash
# 1. 查看最近的提交
git log --oneline -5

# 2. 回到上一个提交
git reset --hard HEAD~1

# 3. 或回到指定的安全提交
git reset --hard efac4b3

# 4. 重新安装依赖
npm install

# 5. 尝试启动
npm run dev
```

### 如果Git操作出错：
```bash
# 查看当前状态
git status

# 查看远程仓库信息
git remote -v

# 如果推送失败，先拉取远程更改
git pull origin master

# 强制推送（谨慎使用）
git push --force origin master
```

## 📋 日常工作流程

### 每天开始工作：
1. `git status` - 检查状态
2. `git pull origin master` - 获取最新代码
3. `npm run dev` - 确保项目正常运行

### 完成一个功能：
1. `git add .` - 添加所有更改
2. `git commit -m "描述更改"` - 提交更改
3. `npm run dev` - 测试功能
4. `git push origin master` - 推送到GitHub

### 重要更新后：
1. `git tag -a v1.1.0 -m "版本描述"` - 创建版本标签
2. `git push origin --tags` - 推送标签到GitHub

## 🆘 紧急恢复

如果项目完全崩溃：
```bash
# 1. 回到已知的工作版本
git reset --hard v1.0.0

# 2. 重新安装依赖
npm install

# 3. 启动项目
npm run dev

# 4. 如果还是有问题，使用紧急脚本
emergency-start.cmd
```

记住：**经常提交，小步推进，这样总能快速回到安全状态！** 