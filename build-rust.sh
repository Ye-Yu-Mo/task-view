#!/usr/bin/env bash
set -e

# 1. 安装 Rust 目标
echo "==> 添加 x86_64-unknown-linux-gnu 目标"
rustup target add x86_64-unknown-linux-gnu

# 2. 安装 x86_64-linux-gnu 工具链（非 host）
echo "==> 安装 stable-x86_64-unknown-linux-gnu 工具链"
rustup toolchain install stable-x86_64-unknown-linux-gnu --force-non-host

# 3. 安装交叉编译器
echo "==> 安装 x86_64-linux-gnu-gcc"
brew install FiloSottile/musl-cross/musl-cross || true

# 4. 创建 Cargo 配置文件
echo "==> 配置 Cargo linker"
mkdir -p .cargo
cat > .cargo/config.toml <<EOF
[target.x86_64-unknown-linux-gnu]
linker = "x86_64-linux-gnu-gcc"
EOF

# 5. 编译项目
echo "==> 编译项目"
cargo build --target x86_64-unknown-linux-gnu --release

echo "==> 编译完成!"
echo "可执行文件在: target/x86_64-unknown-linux-gnu/release/"
