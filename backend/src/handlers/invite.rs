use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait, QueryFilter, Set, TransactionTrait};
use serde::{Deserialize, Serialize};
use chrono;

use crate::models::{invite, invite::Entity as Invite, user, user::Entity as User};

#[derive(Deserialize)]
pub struct CreateInviteRequest {
    pub creator_id: String,
}

#[derive(Serialize)]
pub struct InviteResponse {
    pub id: String,
    pub code: String,
    pub creator_id: String,
    pub executor_id: Option<String>,
    pub status: String,
    pub created_at: String,
    pub used_at: Option<String>,
}

#[derive(Deserialize)]
pub struct UseInviteRequest {
    pub code: String,
    pub executor_id: String,
}

#[derive(Serialize)]
pub struct UseInviteResponse {
    pub message: String,
    pub invite: InviteResponse,
}

#[derive(Serialize)]
pub struct InviteListResponse {
    pub invites: Vec<InviteResponse>,
}

// 生成邀请码接口
pub async fn create_invite(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateInviteRequest>,
) -> Result<Json<InviteResponse>, StatusCode> {
    tracing::info!("收到创建邀请码请求: creator_id={}", payload.creator_id);
    
    // 验证创建者是否存在且角色为creator
    tracing::info!("查询用户信息: id={}, role=creator", payload.creator_id);
    let creator = User::find()
        .filter(user::Column::Id.eq(&payload.creator_id))
        .filter(user::Column::Role.eq("creator"))
        .one(&db)
        .await
        .map_err(|e| {
            tracing::error!("数据库查询错误: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or_else(|| {
            tracing::warn!("用户不存在或不是创建者: {}", payload.creator_id);
            StatusCode::BAD_REQUEST
        })?;

    tracing::info!("用户验证成功: username={}, email={}", creator.username, creator.email);

    // 使用事务确保数据一致性
    let txn = db.begin().await.map_err(|e| {
        tracing::error!("开始事务失败: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("开始在事务中创建邀请码");
    
    // 手动创建邀请码数据，避免SeaORM的insert()方法的查询问题
    let invite_id = uuid::Uuid::new_v4().to_string();
    let invite_code = generate_invite_code();
    let created_at = chrono::Utc::now();
    
    tracing::info!("准备插入邀请码: id={}, code={}", invite_id, invite_code);

    // 使用原生SQL插入，避免SeaORM的复杂逻辑
    let insert_result = txn.execute(
        sea_orm::Statement::from_sql_and_values(
            sea_orm::DatabaseBackend::Sqlite,
            r#"
            INSERT INTO invites (id, code, creator_id, executor_id, status, created_at, used_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            [
                invite_id.clone().into(),
                invite_code.clone().into(),
                payload.creator_id.clone().into(),
                sea_orm::Value::String(None),
                "pending".into(),
                created_at.into(),
                sea_orm::Value::ChronoDateTimeWithTimeZone(None),
            ]
        )
    ).await.map_err(|e| {
        tracing::error!("插入邀请码失败: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("插入成功，影响行数: {}", insert_result.rows_affected());

    // 提交事务
    txn.commit().await.map_err(|e| {
        tracing::error!("提交事务失败: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("事务提交成功，邀请码创建完成: {}", invite_code);

    let response = Json(InviteResponse {
        id: invite_id,
        code: invite_code.clone(),
        creator_id: payload.creator_id,
        executor_id: None,
        status: "pending".to_string(),
        created_at: created_at.to_rfc3339(),
        used_at: None,
    });

    tracing::info!("成功生成邀请码: {}", invite_code);
    Ok(response)
}

// 生成邀请码的辅助函数
fn generate_invite_code() -> String {
    use uuid::Uuid;
    Uuid::new_v4().to_string()[0..8].to_uppercase()
}

// 使用邀请码接口
pub async fn use_invite(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UseInviteRequest>,
) -> Result<Json<UseInviteResponse>, StatusCode> {
    // 验证执行者是否存在且角色为executor
    let executor = User::find()
        .filter(user::Column::Id.eq(&payload.executor_id))
        .filter(user::Column::Role.eq("executor"))
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::BAD_REQUEST)?;

    // 查找邀请码
    let invite = Invite::find()
        .filter(invite::Column::Code.eq(&payload.code))
        .filter(invite::Column::Status.eq("pending"))
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // 更新邀请码状态
    let mut invite_active: invite::ActiveModel = invite.into();
    invite_active.executor_id = Set(Some(payload.executor_id));
    invite_active.status = Set("used".to_string());
    invite_active.used_at = Set(Some(chrono::Utc::now().into()));

    let updated_invite = invite_active
        .update(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(UseInviteResponse {
        message: "邀请码使用成功，已建立绑定关系".to_string(),
        invite: InviteResponse {
            id: updated_invite.id,
            code: updated_invite.code,
            creator_id: updated_invite.creator_id,
            executor_id: updated_invite.executor_id,
            status: updated_invite.status,
            created_at: updated_invite.created_at.to_rfc3339(),
            used_at: updated_invite.used_at.map(|dt| dt.to_rfc3339()),
        },
    }))
}

// 获取用户的邀请码列表（创建者视角）
pub async fn get_invites(
    State(db): State<DatabaseConnection>,
    axum::extract::Path(user_id): axum::extract::Path<String>,
) -> Result<Json<InviteListResponse>, StatusCode> {
    let invites = Invite::find()
        .filter(invite::Column::CreatorId.eq(&user_id))
        .all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let invite_responses: Vec<InviteResponse> = invites
        .into_iter()
        .map(|invite| InviteResponse {
            id: invite.id,
            code: invite.code,
            creator_id: invite.creator_id,
            executor_id: invite.executor_id,
            status: invite.status,
            created_at: invite.created_at.to_rfc3339(),
            used_at: invite.used_at.map(|dt| dt.to_rfc3339()),
        })
        .collect();

    Ok(Json(InviteListResponse {
        invites: invite_responses,
    }))
}

// 获取执行者相关的邀请码列表
pub async fn get_executor_invites(
    State(db): State<DatabaseConnection>,
    axum::extract::Path(executor_id): axum::extract::Path<String>,
) -> Result<Json<InviteListResponse>, StatusCode> {
    let invites = Invite::find()
        .filter(invite::Column::ExecutorId.eq(&executor_id))
        .all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let invite_responses: Vec<InviteResponse> = invites
        .into_iter()
        .map(|invite| InviteResponse {
            id: invite.id,
            code: invite.code,
            creator_id: invite.creator_id,
            executor_id: invite.executor_id,
            status: invite.status,
            created_at: invite.created_at.to_rfc3339(),
            used_at: invite.used_at.map(|dt| dt.to_rfc3339()),
        })
        .collect();

    Ok(Json(InviteListResponse {
        invites: invite_responses,
    }))
}
