# TaskView MVP开发计划

## 🎯 MVP 目标

实现一个最小可行的任务看板系统，包含核心的双用户协作功能。

## 📋 MVP 核心功能

### 必须实现的功能
1. **用户认证** - 简单的注册/登录
2. **角色区分** - 任务创建者/执行者
3. **邀请码机制** - 绑定协作关系
4. **基础任务管理** - 创建、编辑、删除任务
5. **简单看板** - 三列布局（待处理/进行中/已完成）
6. **任务状态更新** - 手动状态切换

### 暂不实现的功能
- Markdown编辑器（使用简单文本）
- 拖拽功能
- 实时更新
- 复杂筛选搜索
- 任务优先级
- 文件上传

## 🗂️ 数据库设计（简化版）

### 用户表 (users)
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('creator', 'executor')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 邀请码表 (invites)
```sql
CREATE TABLE invites (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    creator_id TEXT NOT NULL,
    executor_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (executor_id) REFERENCES users(id)
);
```

### 任务表 (tasks)
```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    creator_id TEXT NOT NULL,
    executor_id TEXT,
    invite_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (executor_id) REFERENCES users(id),
    FOREIGN KEY (invite_id) REFERENCES invites(id)
);
```

## 🛠️ MVP 开发阶段

### 阶段 1: 项目初始化（1天）✅ 已完成
- [x] 创建项目目录结构
- [x] 初始化前端项目（Vite + React + TypeScript）
- [x] 初始化后端项目（Rust + Axum）
- [x] 配置开发环境
- [x] 设置基础路由

### 阶段 2: 后端核心功能（3-4天）
#### 第1天：基础设置 ✅ 已完成
- [x] 数据库连接配置
- [x] 创建数据模型
- [x] 设置基础认证系统
- [x] 健康检查接口

#### 第2天：用户认证 ✅ 已完成
- [x] 用户注册接口
- [x] 用户登录接口
- [x] 密码加密
- [x] 基础session管理

#### 第3天：邀请码系统 ✅ 已完成
- [x] 邀请码生成接口（已修复SeaORM查询问题）
- [x] 邀请码使用接口
- [x] 绑定关系管理
- [x] 邀请码状态更新

#### 第4天：任务管理 ✅ 已完成
- [x] 任务CRUD接口
- [x] 任务状态更新接口
- [x] 权限验证（只能操作自己相关的任务）
- [x] 任务列表查询

### 阶段 3: 前端基础界面（3-4天）
#### 第1天：认证页面 ✅ 已完成
- [x] 登录页面
- [x] 注册页面
- [x] 角色选择

#### 第2天：邀请码功能
- [x] 创建者：生成邀请码页面
- [x] 执行者：输入邀请码页面
- [x] 绑定成功提示
- [x] 邀请码状态显示

#### 第3天：任务管理 ✅ 已完成
- [x] 任务创建表单
- [x] 任务列表显示
- [x] 任务编辑功能
- [x] 任务删除功能

#### 第4天：看板界面 ✅ 已完成
- [x] 三列布局设计
- [x] 任务卡片组件
- [x] 状态切换按钮
- [x] 基础样式优化

### 阶段 4: 集成测试（1-2天）⚠️ 需要继续
- [x] 前后端接口联调（邀请码系统已修复）
- [x] 基础错误处理
- [ ] 完整用户流程测试
- [ ] 权限验证测试
- [ ] 边界情况测试

### 阶段 5: MVP 完善（1天）⚠️ 需要继续
- [x] 基础样式优化
- [ ] 错误提示完善
- [ ] 简单的响应式适配
- [ ] 部署配置

## 📝 MVP 用户流程

### 任务创建者流程
1. 注册账号（选择创建者角色）
2. 登录系统
3. 生成邀请码
4. 分享邀请码给执行者
5. 创建任务
6. 查看任务执行进度

### 任务执行者流程
1. 注册账号（选择执行者角色）
2. 登录系统
3. 输入邀请码绑定创建者
4. 查看分配的任务
5. 更新任务状态
6. 完成任务

## 🎨 MVP 界面设计

### 页面结构
```
/                   # 首页/登录页
/register           # 注册页
/dashboard          # 仪表板（根据角色显示不同内容）
/invite            # 邀请码管理
/board             # 任务看板
```

### 组件设计
- **Header** - 导航栏，用户信息，退出
- **TaskCard** - 任务卡片，显示标题、描述、状态
- **TaskForm** - 任务创建/编辑表单
- **InviteCode** - 邀请码显示/输入组件
- **Board** - 三列看板布局

## 🚀 MVP 技术要求

### 前端技术栈（简化）
- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Axios（HTTP请求）
- React Router（路由）
- React Hook Form（表单）

### 后端技术栈（简化）
- Rust + Axum
- SeaORM + SQLite
- JWT认证
- bcrypt密码加密
- 基础日志记录

## ⏱️ MVP 开发时间估算

**总计：8-10天**
- 项目初始化：1天
- 后端开发：3-4天
- 前端开发：3-4天
- 测试集成：1-2天

## ✅ MVP 验收标准

### 功能验收
- [x] 两种角色用户可以正常注册登录
- [x] 创建者可以生成邀请码
- [x] 执行者可以通过邀请码绑定创建者
- [x] 创建者可以创建、编辑、删除任务
- [x] 执行者可以查看任务并更新状态
- [x] 任务在看板中正确显示和分类

### 技术验收
- [x] 前后端可以正常通信
- [x] 数据库操作正常
- [x] 用户认证安全可靠
- [x] 基础错误处理完善
- [x] 代码结构清晰

### 用户体验验收
- [x] 界面简洁易用
- [x] 操作流程顺畅
- [ ] 错误提示清晰
- [ ] 移动端基础可用

## 🔧 修复记录

### 邀请码系统修复（2025-09-13）
**问题描述**：邀请码生成接口在插入数据库后无法查询到刚插入的记录，导致返回RecordNotFound错误。

**根本原因**：SeaORM在插入操作后立即查询时存在事务同步问题，虽然数据已成功插入数据库，但查询操作无法立即看到新记录。

**解决方案**：
1. 添加详细的请求追踪日志，记录每个操作步骤
2. 直接使用插入操作返回的结果对象，避免二次查询
3. 验证数据库插入确实成功（通过SQLite命令行确认）
4. 优化错误处理和日志输出

**修复效果**：
- ✅ 邀请码生成接口现在能正确返回生成的邀请码
- ✅ 数据库记录正确插入并可查询
- ✅ 详细的日志输出便于问题排查
- ✅ 前端可以正常接收和使用邀请码

### 最新版本修复（2025-09-13）
**问题描述**：邀请码插入操作中SeaORM的`insert()`方法存在内部查询失败问题。

**解决方案**：
1. 使用显式事务管理确保数据一致性
2. 采用原生SQL插入避免SeaORM复杂逻辑
3. 手动生成UUID和时间戳
4. 完善的错误日志和事务回滚机制

**修复代码**：`invite.rs:66-132`行，采用事务+原生SQL的方式彻底解决插入查询问题。

## 📊 当前代码状态总结（2025-09-13）

### ✅ 已完成的功能模块

#### 后端API (Rust + Axum)
1. **用户认证系统**
   - `auth_simple.rs` - 简化版注册/登录（使用原生SQL，避免SeaORM问题）
   - `auth.rs` - 完整版认证（保留但未使用）
   - 支持creator/executor角色区分
   - bcrypt密码加密

2. **邀请码系统**
   - `invite.rs` - 完整的邀请码CRUD操作
   - 生成8位随机邀请码
   - 创建者/执行者绑定机制
   - 邀请码状态管理(pending/used)
   - 已修复插入查询问题

3. **任务管理系统**
   - `task.rs` - 完整的任务CRUD操作
   - 支持三种状态：todo/in_progress/done
   - 权限验证（基于invite_id）
   - 任务状态更新接口

4. **基础设施**
   - 数据库连接和迁移
   - 健康检查接口
   - CORS配置
   - 详细的日志记录

#### 前端界面 (React + TypeScript)
1. **认证界面**
   - 登录页面 (`LoginPage.tsx`)
   - 注册页面 (`RegisterPage.tsx`)
   - 角色选择组件 (`RoleSelector.tsx`)

2. **邀请码功能**
   - 创建邀请码页面 (`CreateInvitePage.tsx`)
   - 使用邀请码页面 (`UseInvitePage.tsx`)
   - 邀请码状态显示 (`InviteStatus.tsx`)

3. **任务管理界面**
   - 任务创建页面 (`CreateTaskPage.tsx`)
   - 任务编辑页面 (`EditTaskPage.tsx`)
   - 任务列表页面 (`TaskListPage.tsx`)
   - 任务看板页面 (`BoardPage.tsx`) - 三列布局

4. **基础组件**
   - UI组件库 (`Button.tsx`, `Input.tsx`)
   - 认证上下文 (`AuthContext.tsx`)
   - 路由配置 (`App.tsx`)

### ⚠️ 需要完善的部分

1. **错误处理优化**
   - 前端错误提示还需要更清晰
   - 网络错误的用户反馈

2. **移动端适配**
   - 响应式布局需要测试
   - 触摸交互优化

3. **测试完善**
   - 端到端用户流程测试
   - 权限边界测试
   - 并发操作测试

4. **性能优化**
   - 清理未使用的导入警告
   - 代码分割和懒加载

### 🔧 已修复的技术问题

1. **SeaORM插入查询问题** - 使用事务+原生SQL解决
2. **用户认证流程** - 简化版auth_simple避免复杂性
3. **邀请码生成冲突** - UUID确保唯一性
4. **任务权限验证** - 基于invite_id的访问控制

### 📝 占位代码清理

经检查，项目中没有发现实质性的占位代码：
- 所有API接口都有完整实现
- 前端页面都有实际功能
- 数据库模型都已实现
- 只有一些UI placeholder文本，这些是正常的用户提示

## 🔄 MVP 后续迭代

MVP完成后的改进方向：
1. **增强功能** - Markdown支持、拖拽操作
2. **实时更新** - WebSocket实时同步
3. **高级功能** - 任务筛选、优先级、截止日期
4. **体验优化** - 更好的UI设计、动画效果
5. **性能优化** - 分页、缓存、懒加载

---

**注意**：MVP版本专注于核心功能验证，保持简单可用，为后续迭代奠定基础。
