use axum::{extract::{Path, State}, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait, ModelTrait, QueryFilter, Set, TransactionTrait};
use serde::{Deserialize, Serialize};
use chrono;

use crate::models::{task, task::Entity as Task, invite, invite::Entity as Invite};

#[derive(Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: Option<String>,
    pub creator_id: String,
    pub invite_id: String,
}

#[derive(Deserialize)]
pub struct UpdateTaskRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub executor_id: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateTaskStatusRequest {
    pub status: String, // "todo", "in_progress", "done"
}

#[derive(Serialize)]
pub struct TaskResponse {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub creator_id: String,
    pub executor_id: Option<String>,
    pub invite_id: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize)]
pub struct TaskListResponse {
    pub tasks: Vec<TaskResponse>,
}

// 创建任务接口
pub async fn create_task(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<CreateTaskRequest>,
) -> Result<Json<TaskResponse>, StatusCode> {
    // 验证邀请码是否存在且创建者有权限（不检查邀请码状态，允许使用已使用的邀请码创建任务）
    let _invite = Invite::find()
        .filter(invite::Column::Id.eq(&payload.invite_id))
        .filter(invite::Column::CreatorId.eq(&payload.creator_id))
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::BAD_REQUEST)?;

    // 使用事务创建任务，避免SeaORM insert方法的栈溢出问题
    let txn = db.begin().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let task_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now();
    
    // 使用原生SQL插入任务
    txn.execute(
        sea_orm::Statement::from_sql_and_values(
            sea_orm::DatabaseBackend::Sqlite,
            r#"
            INSERT INTO tasks (id, title, description, status, creator_id, executor_id, invite_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            [
                task_id.clone().into(),
                payload.title.into(),
                payload.description.into(),
                "todo".into(),
                payload.creator_id.into(),
                sea_orm::Value::String(None),
                payload.invite_id.into(),
                now.into(),
                now.into(),
            ]
        )
    ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 提交事务
    txn.commit().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 查询刚创建的任务
    let task = Task::find_by_id(&task_id)
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(TaskResponse {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        creator_id: task.creator_id,
        executor_id: task.executor_id,
        invite_id: task.invite_id,
        created_at: task.created_at.to_rfc3339(),
        updated_at: task.updated_at.to_rfc3339(),
    }))
}

// 获取任务列表接口
pub async fn get_tasks(
    State(db): State<DatabaseConnection>,
    Path(invite_id): Path<String>,
) -> Result<Json<TaskListResponse>, StatusCode> {
    let tasks = Task::find()
        .filter(task::Column::InviteId.eq(&invite_id))
        .all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let task_responses: Vec<TaskResponse> = tasks
        .into_iter()
        .map(|task| TaskResponse {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            creator_id: task.creator_id,
            executor_id: task.executor_id,
            invite_id: task.invite_id,
            created_at: task.created_at.to_rfc3339(),
            updated_at: task.updated_at.to_rfc3339(),
        })
        .collect();

    Ok(Json(TaskListResponse {
        tasks: task_responses,
    }))
}

// 更新任务接口
pub async fn update_task(
    State(db): State<DatabaseConnection>,
    Path(task_id): Path<String>,
    Json(payload): Json<UpdateTaskRequest>,
) -> Result<Json<TaskResponse>, StatusCode> {
    // 查找任务
    let task = Task::find_by_id(&task_id)
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // 更新任务
    let mut task_active: task::ActiveModel = task.into();
    
    if let Some(title) = payload.title {
        task_active.title = Set(title);
    }
    if let Some(description) = payload.description {
        task_active.description = Set(Some(description));
    }
    if let Some(status) = payload.status {
        // 验证状态值
        if !["todo", "in_progress", "done"].contains(&status.as_str()) {
            return Err(StatusCode::BAD_REQUEST);
        }
        task_active.status = Set(status);
    }
    if let Some(executor_id) = payload.executor_id {
        task_active.executor_id = Set(Some(executor_id));
    }
    
    task_active.updated_at = Set(chrono::Utc::now().into());

    let updated_task = task_active
        .update(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(TaskResponse {
        id: updated_task.id,
        title: updated_task.title,
        description: updated_task.description,
        status: updated_task.status,
        creator_id: updated_task.creator_id,
        executor_id: updated_task.executor_id,
        invite_id: updated_task.invite_id,
        created_at: updated_task.created_at.to_rfc3339(),
        updated_at: updated_task.updated_at.to_rfc3339(),
    }))
}

// 更新任务状态接口
pub async fn update_task_status(
    State(db): State<DatabaseConnection>,
    Path(task_id): Path<String>,
    Json(payload): Json<UpdateTaskStatusRequest>,
) -> Result<Json<TaskResponse>, StatusCode> {
    // 验证状态值
    if !["todo", "in_progress", "done"].contains(&payload.status.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }

    // 查找任务
    let task = Task::find_by_id(&task_id)
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // 更新任务状态
    let mut task_active: task::ActiveModel = task.into();
    task_active.status = Set(payload.status);
    task_active.updated_at = Set(chrono::Utc::now().into());

    let updated_task = task_active
        .update(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(TaskResponse {
        id: updated_task.id,
        title: updated_task.title,
        description: updated_task.description,
        status: updated_task.status,
        creator_id: updated_task.creator_id,
        executor_id: updated_task.executor_id,
        invite_id: updated_task.invite_id,
        created_at: updated_task.created_at.to_rfc3339(),
        updated_at: updated_task.updated_at.to_rfc3339(),
    }))
}

// 删除任务接口
pub async fn delete_task(
    State(db): State<DatabaseConnection>,
    Path(task_id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let task = Task::find_by_id(&task_id)
        .one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    task.delete(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}
