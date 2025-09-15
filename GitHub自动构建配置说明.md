# GitHub Actions 前端自动构建配置说明

## 概述

已为项目配置了两个 GitHub Actions 工作流，用于自动构建前端项目并保存构建结果到仓库中。

## 工作流文件

### 1. `build-to-repo.yml` - 主要工作流（推荐）

**位置**: `.github/workflows/build-to-repo.yml`

**触发条件**:
- 推送到 `main` 分支
- 修改了以下前端相关文件:
  - `frontend/src/**` (源代码)
  - `frontend/public/**` (静态资源)
  - `frontend/*.json` (配置文件)
  - `frontend/*.ts` (TypeScript 配置)
  - `frontend/*.js` (JavaScript 配置)

**工作流程**:
1. 检出代码
2. 设置 Node.js 18 环境
3. 安装前端依赖 (`npm ci`)
4. 运行 ESLint 代码检查
5. 构建前端项目 (`npm run build`)
6. 检查构建文件是否有变化
7. 如有变化，自动提交构建结果到仓库

### 2. `frontend-build.yml` - 包含 GitHub Pages 部署

**位置**: `.github/workflows/frontend-build.yml`

**额外功能**:
- 部署到 GitHub Pages
- 同时保存构建文件到仓库

## 配置修改

### .gitignore 更新

在 `.gitignore` 文件中添加了例外规则:
```
!frontend/dist/
```

这样可以确保前端构建的 `dist` 目录被包含在版本控制中，而其他 `dist` 目录仍然被忽略。

## 使用说明

### 自动触发
当你向 `main` 分支推送包含前端代码变化的提交时，GitHub Actions 会自动:
1. 检查代码质量
2. 构建前端项目
3. 将构建结果提交回仓库

### 手动触发
也可以在 GitHub 仓库的 Actions 页面手动运行工作流。

### 权限配置
工作流使用 `GITHUB_TOKEN` 自动令牌，具有以下权限:
- `contents: write` - 允许提交构建文件到仓库

## 构建输出

构建完成后，构建文件会保存在 `frontend/dist/` 目录中，包括:
- HTML 文件
- CSS 文件
- JavaScript 文件
- 静态资源文件

## 监控和调试

### 查看构建状态
1. 访问 GitHub 仓库
2. 点击 "Actions" 标签页
3. 查看最近的工作流运行情况

### 常见问题
1. **构建失败**: 检查 ESLint 错误或依赖问题
2. **无法推送**: 检查仓库权限设置
3. **文件未更新**: 确认 .gitignore 配置正确

## 注意事项

1. 确保 `frontend/package.json` 中的构建脚本正确
2. 构建过程中的任何 lint 错误都会导致工作流失败
3. 只有当构建文件实际发生变化时才会创建新的提交
4. 自动提交的消息包含构建时间和相关信息

## 下一步建议

1. 可以添加测试步骤到工作流中
2. 考虑添加构建缓存以提高构建速度
3. 可以配置通知机制，在构建失败时发送通知