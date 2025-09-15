# 使用Rust官方镜像作为构建环境
FROM rust:latest AS builder

# 设置工作目录
WORKDIR /app

# 复制源代码
COPY . .

# 构建应用
RUN cargo build --release

# 使用更小的基础镜像作为运行环境
FROM debian:bookworm-slim

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    ca-certificates \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/target/release/backend /app/backend

# 复制migrations目录
COPY --from=builder /app/migrations /app/migrations

# 创建数据库目录并设置权限
RUN mkdir -p /app/data && \
    touch /app/data/database.db && \
    chmod 755 /app/data && \
    chmod 644 /app/data/database.db

# 设置环境变量
ENV DATABASE_URL=sqlite:///app/data/database.db

# 暴露端口
EXPOSE 20000

# 启动应用
CMD ["./backend"]