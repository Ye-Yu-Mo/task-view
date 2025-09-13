pub mod auth;
pub mod auth_simple;
pub mod invite;
pub mod task;

use axum::{extract::State, http::StatusCode, Json};
use sea_orm::DatabaseConnection;
use serde_json::{json, Value};

pub async fn health_check(
    State(db): State<DatabaseConnection>,
) -> Result<Json<Value>, StatusCode> {
    // 测试数据库连接
    let db_status = match db.ping().await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    Ok(Json(json!({
        "status": "ok",
        "message": "服务运行正常",
        "database": db_status,
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}