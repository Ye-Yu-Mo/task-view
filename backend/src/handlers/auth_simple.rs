use axum::{extract::{State, Path}, http::StatusCode, Json};
use sea_orm::{ConnectionTrait, DatabaseConnection, Set};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use bcrypt;
use chrono;

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: String, // "creator" or "executor"
}

#[derive(Serialize)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: String,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub user: UserResponse,
    pub message: String,
}

// 简化的注册接口，直接使用SQL
pub async fn register_simple(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<UserResponse>, StatusCode> {
    // 验证角色
    if payload.role != "creator" && payload.role != "executor" {
        return Err(StatusCode::BAD_REQUEST);
    }

    // 生成ID和时间戳
    let user_id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now();

    // 加密密码
    let password_hash = bcrypt::hash(&payload.password, bcrypt::DEFAULT_COST)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 使用参数化查询避免SQL注入
    let sql = r#"
        INSERT INTO users (id, username, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    "#;
    
    let result = db.execute(
        sea_orm::Statement::from_sql_and_values(
            sea_orm::DatabaseBackend::Sqlite,
            sql,
            vec![
                user_id.clone().into(),
                payload.username.clone().into(),
                payload.email.clone().into(),
                password_hash.into(),
                payload.role.clone().into(),
                now.to_rfc3339().into(),
            ]
        )
    ).await;

    match result {
        Ok(_) => {
            Ok(Json(UserResponse {
                id: user_id,
                username: payload.username,
                email: payload.email,
                role: payload.role,
                created_at: now.to_rfc3339(),
            }))
        }
        Err(_) => Err(StatusCode::CONFLICT), // 可能是邮箱或用户名重复
    }
}

// 简化的登录接口
pub async fn login_simple(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // 使用参数化查询避免SQL注入
    let sql = "SELECT id, username, email, password_hash, role, created_at FROM users WHERE email = ? LIMIT 1";
    
    let result = db.query_one(
        sea_orm::Statement::from_sql_and_values(
            sea_orm::DatabaseBackend::Sqlite,
            sql,
            vec![payload.email.clone().into()]
        )
    ).await;
    
    match result {
        Ok(Some(row)) => {
            // 解析查询结果
            let id: String = row.try_get("", "id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let username: String = row.try_get("", "username").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let email: String = row.try_get("", "email").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let password_hash: String = row.try_get("", "password_hash").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let role: String = row.try_get("", "role").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let created_at: String = row.try_get("", "created_at").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            // 验证密码
            let password_valid = bcrypt::verify(&payload.password, &password_hash)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            
            if !password_valid {
                return Err(StatusCode::UNAUTHORIZED);
            }

            Ok(Json(LoginResponse {
                user: UserResponse {
                    id,
                    username,
                    email,
                    role,
                    created_at,
                },
                message: "登录成功".to_string(),
            }))
        }
        Ok(None) => Err(StatusCode::UNAUTHORIZED),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// 根据用户ID获取用户信息
pub async fn get_user_by_id(
    State(db): State<DatabaseConnection>,
    Path(user_id): Path<String>,
) -> Result<Json<UserResponse>, StatusCode> {
    let sql = "SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1";
    
    let result = db.query_one(
        sea_orm::Statement::from_sql_and_values(
            sea_orm::DatabaseBackend::Sqlite,
            sql,
            vec![user_id.into()]
        )
    ).await;
    
    match result {
        Ok(Some(row)) => {
            let id: String = row.try_get("", "id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let username: String = row.try_get("", "username").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let email: String = row.try_get("", "email").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let role: String = row.try_get("", "role").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let created_at: String = row.try_get("", "created_at").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            Ok(Json(UserResponse {
                id,
                username,
                email,
                role,
                created_at,
            }))
        }
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
