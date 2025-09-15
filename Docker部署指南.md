# Docker 部署指南

## 概述

本项目已完全Docker化，支持一键部署。包含以下服务：
- **后端服务**：Rust + Axum API服务器（端口20000）
- **前端服务**：React + Vite应用，通过Nginx提供服务（端口20001）
- **数据库**：SQLite数据库，数据持久化存储

## 快速开始

### 前提条件
- Docker
- Docker Compose

### 一键启动
```bash
# 克隆项目
git clone <项目地址>
cd task-view

# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 访问应用
- 前端应用：http://localhost:20001
- 后端API：http://localhost:20000
- 健康检查：http://localhost:20000/api/health

## 项目结构

```
task-view/
├── docker-compose.yml          # Docker Compose配置文件
├── frontend/
│   ├── Dockerfile              # 前端Docker镜像配置
│   ├── nginx.conf              # Nginx配置文件
│   ├── .dockerignore           # Docker忽略文件
│   └── ...                     # 前端源码
└── backend/
    ├── Dockerfile              # 后端Docker镜像配置
    ├── .dockerignore           # Docker忽略文件
    ├── migrations/             # 数据库迁移文件
    └── ...                     # 后端源码
```

## 服务配置

### 后端服务 (task-view-backend)
- **基础镜像**：rust:latest (构建) + debian:bookworm-slim (运行)
- **端口**：20000
- **数据库**：SQLite，存储在持久化卷中
- **环境变量**：
  - `DATABASE_URL=sqlite:///app/data/database.db`
  - `PORT=20000`
  - `RUST_LOG=info`

### 前端服务 (task-view-frontend)
- **基础镜像**：node:18-alpine (构建) + nginx:alpine (运行)
- **端口**：20001 (映射到容器内部80端口)
- **特性**：
  - React Router支持
  - API代理到后端
  - 静态文件缓存优化

### 网络和存储
- **网络**：task-view-network (桥接模式)
- **存储卷**：backend_data (持久化数据库文件)

## 常用命令

### 服务管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 构建管理
```bash
# 重新构建所有镜像
docker-compose build

# 重新构建特定服务
docker-compose build backend
docker-compose build frontend

# 强制重新构建（无缓存）
docker-compose build --no-cache
```

### 数据管理
```bash
# 查看数据卷
docker volume ls

# 备份数据库
docker cp task-view-backend:/app/data/database.db ./backup.db

# 清理数据（危险操作）
docker-compose down -v
```

## 环境配置

### 生产环境部署
1. 修改docker-compose.yml中的端口映射
2. 配置反向代理（如Nginx）
3. 设置HTTPS证书
4. 配置环境变量

### 自定义配置
可以通过环境变量文件(.env)来配置：
```bash
# .env
BACKEND_PORT=20000
FRONTEND_PORT=20001
DATABASE_URL=sqlite:///app/data/database.db
RUST_LOG=info
```

## 故障排除

### 常见问题
1. **端口冲突**：确保20000和20001端口未被占用
2. **权限问题**：确保Docker有读写权限
3. **构建失败**：检查网络连接，清理Docker缓存

### 调试命令
```bash
# 进入容器调试
docker exec -it task-view-backend /bin/bash
docker exec -it task-view-frontend /bin/sh

# 查看容器资源使用
docker stats

# 查看镜像大小
docker images
```

## 性能优化

### 构建优化
- 使用多阶段构建减少镜像大小
- .dockerignore排除不必要文件
- 缓存依赖层提高构建速度

### 运行优化
- 使用轻量级基础镜像
- 配置资源限制
- 启用日志轮转

## 安全注意事项

1. 不要在生产环境暴露默认端口
2. 定期更新基础镜像
3. 使用安全的环境变量管理
4. 配置适当的网络隔离

## 更新部署

```bash
# 更新代码后重新部署
git pull
docker-compose build
docker-compose up -d
```

## 监控和日志

### 日志管理
```bash
# 查看服务日志
docker-compose logs --tail=100 -f

# 查看特定时间段日志
docker-compose logs --since="2024-01-01T00:00:00"
```

### 健康检查
后端提供健康检查接口：
- URL: http://localhost:20000/api/health
- 返回：服务状态、数据库连接状态、时间戳

---

> 💡 提示：这是一个完整的容器化解决方案，支持开发和生产环境的快速部署。如有问题，请查看日志或联系开发团队。