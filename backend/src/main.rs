use anyhow::Result;
use axum::{http::{header, Method}, routing::{get, post, put, delete}, Router};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

mod config;
mod database;
mod handlers;
mod models;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    // 加载配置
    let config = config::Config::from_env()
        .map_err(|e| anyhow::anyhow!("Failed to load config: {}", e))?;

    // 初始化数据库
    let db = database::Database::new(&config.database_url).await
        .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))?;

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_origin(Any);

    let app = Router::new()
        .route("/api/health", get(handlers::health_check))
        // 认证相关路由（使用简化版本避免栈溢出）
        .route("/api/auth/register", post(handlers::auth_simple::register_simple))
        .route("/api/auth/login", post(handlers::auth_simple::login_simple))
        .route("/api/users/:user_id", get(handlers::auth_simple::get_user_by_id))
        // 邀请码相关路由
        .route("/api/invites", post(handlers::invite::create_invite))
        .route("/api/invites/use", post(handlers::invite::use_invite))
        .route("/api/invites/:user_id", get(handlers::invite::get_invites))
        .route("/api/invites/executor/:executor_id", get(handlers::invite::get_executor_invites))
        .route("/api/invite/:invite_id", get(handlers::invite::get_invite_details))
        // 任务相关路由
        .route("/api/tasks", post(handlers::task::create_task))
        .route("/api/tasks/:invite_id", get(handlers::task::get_tasks))
        .route("/api/task/:task_id", put(handlers::task::update_task))
        .route("/api/task/:task_id", delete(handlers::task::delete_task))
        .route("/api/task/:task_id/status", put(handlers::task::update_task_status))
        .layer(cors)
        .with_state(db.connection);

    let addr = SocketAddr::from(([127, 0, 0, 1], config.port));
    println!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
