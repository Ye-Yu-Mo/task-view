# 任务看板系统 (TaskView)

一个基于现代化技术栈的任务看板管理系统，支持双用户角色协作和Markdown任务描述。

## 📋 项目概述

TaskView 是一个专为团队协作设计的任务看板系统，通过邀请码机制连接任务创建者和执行者，提供高效的任务管理和协作体验。

### 核心特性

- **双用户角色系统** - 支持任务创建者和任务执行者两种角色
- **邀请码绑定** - 通过唯一邀请码建立创建者与执行者的协作关系
- **任务看板管理** - 直观的看板视图，支持任务状态流转
- **Markdown 支持** - 任务描述支持完整的Markdown语法
- **实时更新** - 任务状态变更实时同步
- **响应式设计** - 支持桌面端和移动端访问

## 🛠️ 技术栈

### 前端
- **框架**: Vite + React 18 + TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Query (TanStack Query)
- **路由**: React Router
- **表单**: React Hook Form + Yup
- **HTTP客户端**: Axios
- **图标**: Lucide React
- **Markdown渲染**: React Markdown

### 后端
- **语言**: Rust 1.70+
- **Web框架**: Axum
- **数据库ORM**: SeaORM
- **数据库**: SQLite
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **日志**: tracing
- **工具库**: uuid, chrono, anyhow

### 开发工具
- **代码编辑器**: VS Code
- **版本控制**: Git
- **容器化**: Docker
- **API测试**: Thunder Client

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Rust 1.70+
- SQLite 3.40+
- Git

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd task-view

# 安装前端依赖
cd frontend
npm install

# 返回根目录，安装后端依赖
cd ../backend
cargo build

# 创建环境配置文件
cp .env.example .env
```

### 环境配置

在 `backend/.env` 文件中配置：

```bash
DATABASE_URL=sqlite://database.db
JWT_SECRET=your-very-secure-jwt-secret-key-32chars-min
PORT=20000
RUST_LOG=info
```

### 启动开发服务

```bash
# 启动后端服务 (Terminal 1)
cd backend
cargo run

# 启动前端服务 (Terminal 2)
cd frontend
npm run dev
```

访问 `http://localhost:5173` 开始使用。

## 📁 项目结构

```
task-view/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/         # React组件
│   │   │   ├── ui/            # 基础UI组件
│   │   │   ├── layout/        # 布局组件
│   │   │   ├── board/         # 看板相关组件
│   │   │   └── forms/         # 表单组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── auth/          # 认证页面
│   │   │   ├── dashboard/     # 仪表板
│   │   │   ├── board/         # 看板页面
│   │   │   └── invite/        # 邀请管理
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── services/          # API服务
│   │   │   ├── api.ts         # Axios配置
│   │   │   ├── auth.ts        # 认证服务
│   │   │   ├── tasks.ts       # 任务服务
│   │   │   └── invites.ts     # 邀请码服务
│   │   ├── types/             # TypeScript类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── context/           # React Context
│   │   └── constants/         # 常量定义
│   ├── vite.config.ts
│   └── package.json
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── handlers/          # API路由处理器
│   │   │   ├── auth.rs        # 认证相关
│   │   │   ├── tasks.rs       # 任务管理
│   │   │   ├── invites.rs     # 邀请码管理
│   │   │   └── mod.rs
│   │   ├── models/            # 数据模型
│   │   │   ├── user.rs        # 用户模型
│   │   │   ├── task.rs        # 任务模型
│   │   │   ├── invite.rs      # 邀请码模型
│   │   │   └── mod.rs
│   │   ├── services/          # 业务逻辑层
│   │   ├── middleware/        # 中间件
│   │   ├── database.rs        # 数据库配置
│   │   ├── config.rs          # 配置管理
│   │   └── main.rs           # 程序入口
│   ├── migrations/            # 数据库迁移文件
│   ├── Cargo.toml
│   └── .env
├── docs/                       # 项目文档
│   ├── API文档.md
│   ├── 数据库设计.md
│   └── 开发流程文档.md
├── 项目指南.md                  # 技术栈指南
└── README.md                   # 项目说明
```
  
## 🎯 功能模块

### 用户系统
- 用户注册/登录
- 角色区分（创建者/执行者）
- JWT身份认证
- 用户资料管理

### 邀请码系统
- 创建者生成邀请码
- 执行者通过邀请码加入
- 邀请码状态管理（未使用/已使用/已过期）
- 绑定关系管理

### 任务管理
- 任务创建和编辑
- Markdown格式描述
- 任务状态管理（待处理/进行中/已完成）
- 任务分配和认领
- 任务优先级设置

### 看板视图
- 拖拽式任务状态更新
- 多列布局（待处理/进行中/已完成）
- 任务筛选和搜索
- 实时状态同步

## 🔧 开发指南

### 前端开发
```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建
npm run build

# 预览构建结果
npm run preview
```

### 后端开发
```bash
# 代码检查
cargo check

# 运行测试
cargo test

# 格式化代码
cargo fmt

# 静态分析
cargo clippy

# 热重载开发
cargo install cargo-watch
cargo watch -x run
```

### 数据库管理
```bash
# 运行迁移
sea-orm-cli migrate up

# 生成模型
sea-orm-cli generate entity -o src/models
```

## 📊 API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 邀请码相关
- `POST /api/invites` - 创建邀请码
- `POST /api/invites/join` - 使用邀请码加入
- `GET /api/invites` - 获取邀请码列表

### 任务相关
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `PATCH /api/tasks/:id/status` - 更新任务状态

## 🚀 部署指南

### 前端部署
```bash
cd frontend
npm run build
# 将 dist 目录部署到静态文件服务器
```

### 后端部署
```bash
cd backend
cargo build --release
# 运行 target/release/backend
```

### Docker 部署
```bash
docker-compose up -d
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

## 📝 开发计划

### 第一阶段 - 基础功能 (2-3周)
- [ ] 用户认证系统
- [ ] 邀请码机制
- [ ] 基础任务管理
- [ ] 简单看板界面

### 第二阶段 - 增强功能 (2-3周)
- [ ] Markdown编辑器
- [ ] 拖拽看板
- [ ] 实时更新
- [ ] 任务筛选搜索

### 第三阶段 - 优化完善 (1-2周)
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 部署配置
- [ ] 文档完善

## 📄 许可证

MIT License

## 👥 贡献者

- [@jasxu](https://github.com/jasxu) - 项目维护者

---

如有问题或建议，请提交 Issue 或 Pull Request。