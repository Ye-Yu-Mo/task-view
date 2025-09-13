use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use bcrypt;

use crate::models::{user, user::Entity as User};

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

pub async fn register(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<UserResponse>, StatusCode> {
    // 验证角色
    if payload.role != "creator" && payload.role != "executor" {
        return Err(StatusCode::BAD_REQUEST);
    }

    // 检查邮箱是否已存在
    if let Ok(Some(_)) = User::find()
        .filter(user::Column::Email.eq(&payload.email))
        .one(&db)
        .await
    {
        return Err(StatusCode::CONFLICT);
    }

    // 检查用户名是否已存在
    if let Ok(Some(_)) = User::find()
        .filter(user::Column::Username.eq(&payload.username))
        .one(&db)
        .await
    {
        return Err(StatusCode::CONFLICT);
    }

    // 加密密码
    let password_hash = bcrypt::hash(&payload.password, bcrypt::DEFAULT_COST)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 创建用户
    let user_model = user::ActiveModel {
        username: Set(payload.username),
        email: Set(payload.email),
        password_hash: Set(password_hash),
        role: Set(payload.role),
        ..Default::default()
    };

    let user = user_model
        .insert(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(UserResponse {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at.to_rfc3339(),
    }))
}

pub async fn login(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // 查找用户
    let user = User::find()
        .filter(user::Column::Email.eq(&payload.email))
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // 验证密码
    let is_valid = bcrypt::verify(&payload.password, &user.password_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !is_valid {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(Json(LoginResponse {
        user: UserResponse {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at.to_rfc3339(),
        },
        message: "登录成功".to_string(),
    }))
}
