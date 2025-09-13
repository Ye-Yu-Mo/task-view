-- 创建用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('creator', 'executor')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建邀请码表
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

-- 创建任务表
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

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_creator ON invites(creator_id);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_executor ON tasks(executor_id);
CREATE INDEX idx_tasks_invite ON tasks(invite_id);