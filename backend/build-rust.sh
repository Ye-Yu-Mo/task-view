#!/bin/bash
set -e

TARGET="x86_64-unknown-linux-gnu"
RELEASE_DIR="target/$TARGET/release"

echo "==> 清理旧的编译产物"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

echo "==> 使用官方 Rust Docker 镜像构建 x86_64 可执行文件"

docker run --rm \
    -v "$PWD:/usr/src/app" \
    -v "$HOME/.cargo:/root/.cargo:cached" \
    -w /usr/src/app \
    rust:1.72-bullseye /bin/bash -c "
set -e
# 安装系统依赖（非交互式）
DEBIAN_FRONTEND=noninteractive apt-get update && \
DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential pkg-config libssl-dev git tzdata && \
ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
dpkg-reconfigure --frontend noninteractive tzdata

# 官方 Rust 镜像自带 rustup 和 cargo
source /root/.cargo/env

# 添加 x86_64 架构
rustup target add $TARGET

# 构建 release
cargo build --release --target $TARGET
"

echo "==> 编译完成，生成文件位置：$RELEASE_DIR"
