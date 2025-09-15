# 多阶段构建 Dockerfile for TaskView

# 第一阶段：构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端 package 文件
COPY frontend/package.json frontend/package-lock.json ./

# 安装前端依赖（包括开发依赖，用于构建）
RUN npm ci

# 复制前端源码
COPY frontend/ ./

# 构建前端
RUN npm run build

# 第二阶段：构建后端
FROM rustlang/rust:nightly-alpine AS backend-builder

# 安装构建依赖
RUN apk add --no-cache musl-dev sqlite-dev

WORKDIR /app/backend

# 复制 Cargo 文件
COPY backend/Cargo.toml backend/Cargo.lock ./

# 创建一个虚拟的 main.rs 来利用 Docker 层缓存
RUN mkdir src && echo "fn main() {}" > src/main.rs

# 构建依赖（利用缓存）
RUN cargo build --release
RUN rm src/main.rs

# 复制后端源码
COPY backend/src ./src
COPY backend/migrations ./migrations

# 构建后端应用
RUN cargo build --release

# 第三阶段：运行时镜像
FROM alpine:3.20

# 安装运行时依赖
RUN apk add --no-cache nginx sqlite ca-certificates tzdata

# 设置时区
ENV TZ=Asia/Shanghai

# 创建应用用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -G appgroup -u 1001

# 创建必要的目录
RUN mkdir -p /app/data /var/run/nginx /var/log/nginx && \
    chown -R appuser:appgroup /app /var/run/nginx /var/log/nginx

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# 复制后端构建产物
COPY --from=backend-builder /app/backend/target/release/backend /app/backend
COPY --from=backend-builder /app/backend/migrations /app/migrations

# 创建 nginx 配置
COPY <<EOF /etc/nginx/nginx.conf
user appuser;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # 前端路由支持
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        # API 代理到后端
        location /api/ {
            proxy_pass http://127.0.0.1:20000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# 创建启动脚本
COPY <<EOF /app/start.sh
#!/bin/sh
set -e

# 确保数据目录存在
mkdir -p /app/data

# 设置数据库路径
export DATABASE_URL="sqlite:///app/data/database.db"
export JWT_SECRET="\${JWT_SECRET:-your-very-secure-jwt-secret-key-32chars-min}"
export PORT="20000"
export RUST_LOG="\${RUST_LOG:-info}"

echo "Starting TaskView application..."

# 启动后端（后台运行）
echo "Starting backend server..."
cd /app
./backend &
BACKEND_PID=\$!

# 等待后端启动
echo "Waiting for backend to start..."
for i in \$(seq 1 30); do
    if wget -q --spider http://127.0.0.1:20000/api/health 2>/dev/null; then
        echo "Backend is ready!"
        break
    fi
    echo "Waiting for backend... (\$i/30)"
    sleep 2
done

# 启动 nginx
echo "Starting nginx..."
nginx -g 'daemon off;' &
NGINX_PID=\$!

# 优雅关闭处理
trap 'echo "Shutting down..."; kill \$BACKEND_PID \$NGINX_PID; wait' SIGTERM SIGINT

echo "TaskView is running!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"

# 等待进程
wait
EOF

# 设置启动脚本权限
RUN chmod +x /app/start.sh

# 切换到应用用户
USER appuser

# 暴露端口
EXPOSE 80

# 设置工作目录
WORKDIR /app

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# 启动应用
CMD ["/app/start.sh"]