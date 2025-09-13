# TaskView API接口文档

## 🎯 API 概述

TaskView 后端提供完整的 RESTful API 接口，支持用户认证、邀请码管理和任务管理功能。

**服务地址**: `http://127.0.0.1:20000`

## 📋 接口列表

### 系统接口

#### 健康检查
```http
GET /api/health
```

**响应示例**:
```json
{
  "status": "ok",
  "message": "服务运行正常",
  "database": "connected",
  "timestamp": "2025-09-13T05:15:59.311206+00:00"
}
```

---

### 用户认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码",
  "role": "creator | executor"
}
```

**响应示例**:
```json
{
  "id": "用户ID",
  "username": "用户名",
  "email": "邮箱地址",
  "role": "creator",
  "created_at": "2025-09-13T05:00:00Z"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "邮箱地址",
  "password": "密码"
}
```

**响应示例**:
```json
{
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱地址",
    "role": "creator",
    "created_at": "2025-09-13T05:00:00Z"
  },
  "message": "登录成功"
}
```

---

### 邀请码管理接口

#### 生成邀请码
```http
POST /api/invites
Content-Type: application/json
```

**请求体**:
```json
{
  "creator_id": "创建者用户ID"
}
```

**响应示例**:
```json
{
  "id": "邀请码ID",
  "code": "ABCD1234",
  "creator_id": "创建者ID",
  "executor_id": null,
  "status": "pending",
  "created_at": "2025-09-13T05:00:00Z",
  "used_at": null
}
```

#### 使用邀请码
```http
POST /api/invites/use
Content-Type: application/json
```

**请求体**:
```json
{
  "code": "ABCD1234",
  "executor_id": "执行者用户ID"
}
```

**响应示例**:
```json
{
  "message": "邀请码使用成功，已建立绑定关系",
  "invite": {
    "id": "邀请码ID",
    "code": "ABCD1234",
    "creator_id": "创建者ID",
    "executor_id": "执行者ID",
    "status": "used",
    "created_at": "2025-09-13T05:00:00Z",
    "used_at": "2025-09-13T05:05:00Z"
  }
}
```

---

### 任务管理接口

#### 创建任务
```http
POST /api/tasks
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "任务标题",
  "description": "任务描述（可选）",
  "creator_id": "创建者ID",
  "invite_id": "邀请码ID"
}
```

**响应示例**:
```json
{
  "id": "任务ID",
  "title": "任务标题",
  "description": "任务描述",
  "status": "todo",
  "creator_id": "创建者ID",
  "executor_id": null,
  "invite_id": "邀请码ID",
  "created_at": "2025-09-13T05:00:00Z",
  "updated_at": "2025-09-13T05:00:00Z"
}
```

#### 获取任务列表
```http
GET /api/tasks/{invite_id}
```

**响应示例**:
```json
{
  "tasks": [
    {
      "id": "任务ID",
      "title": "任务标题",
      "description": "任务描述",
      "status": "todo",
      "creator_id": "创建者ID",
      "executor_id": "执行者ID",
      "invite_id": "邀请码ID",
      "created_at": "2025-09-13T05:00:00Z",
      "updated_at": "2025-09-13T05:00:00Z"
    }
  ]
}
```

#### 更新任务
```http
PUT /api/task/{task_id}
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "新标题（可选）",
  "description": "新描述（可选）",
  "status": "in_progress（可选）",
  "executor_id": "执行者ID（可选）"
}
```

#### 更新任务状态
```http
PUT /api/task/{task_id}/status
Content-Type: application/json
```

**请求体**:
```json
{
  "status": "todo | in_progress | done"
}
```

#### 删除任务
```http
DELETE /api/task/{task_id}
```

**响应**: 204 No Content

---

## 📊 数据模型

### 用户 (User)
- `id`: 用户唯一标识
- `username`: 用户名（唯一）
- `email`: 邮箱地址（唯一）
- `password_hash`: 加密后的密码
- `role`: 用户角色（"creator" | "executor"）
- `created_at`: 创建时间

### 邀请码 (Invite)
- `id`: 邀请码唯一标识
- `code`: 8位邀请码（唯一）
- `creator_id`: 创建者ID
- `executor_id`: 执行者ID（可为空）
- `status`: 状态（"pending" | "used"）
- `created_at`: 创建时间
- `used_at`: 使用时间（可为空）

### 任务 (Task)
- `id`: 任务唯一标识
- `title`: 任务标题
- `description`: 任务描述（可为空）
- `status`: 任务状态（"todo" | "in_progress" | "done"）
- `creator_id`: 创建者ID
- `executor_id`: 执行者ID（可为空）
- `invite_id`: 关联的邀请码ID
- `created_at`: 创建时间
- `updated_at`: 更新时间

---

## 🔐 认证说明

当前版本使用基础的用户ID验证，生产环境建议添加：
- JWT Token 认证
- API Key 验证
- 请求限流
- HTTPS 支持

---

## 📝 状态码说明

- `200` - 请求成功
- `201` - 创建成功
- `204` - 删除成功
- `400` - 请求参数错误
- `401` - 认证失败
- `404` - 资源不存在
- `409` - 资源冲突（如邮箱已存在）
- `500` - 服务器内部错误

---

## 🚀 使用流程示例

### 1. 创建者流程
```bash
# 1. 注册创建者账号
curl -X POST http://127.0.0.1:20000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"creator1","email":"creator1@example.com","password":"password123","role":"creator"}'

# 2. 生成邀请码
curl -X POST http://127.0.0.1:20000/api/invites \
  -H "Content-Type: application/json" \
  -d '{"creator_id":"创建者ID"}'

# 3. 创建任务
curl -X POST http://127.0.0.1:20000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"完成项目文档","creator_id":"创建者ID","invite_id":"邀请码ID"}'
```

### 2. 执行者流程
```bash
# 1. 注册执行者账号
curl -X POST http://127.0.0.1:20000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"executor1","email":"executor1@example.com","password":"password123","role":"executor"}'

# 2. 使用邀请码建立关系
curl -X POST http://127.0.0.1:20000/api/invites/use \
  -H "Content-Type: application/json" \
  -d '{"code":"ABCD1234","executor_id":"执行者ID"}'

# 3. 查看任务列表
curl http://127.0.0.1:20000/api/tasks/邀请码ID

# 4. 更新任务状态
curl -X PUT http://127.0.0.1:20000/api/task/任务ID/status \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

---

**注意**: 目前部分接口可能存在数据库查询的技术问题，但接口设计和逻辑已完成。