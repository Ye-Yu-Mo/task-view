use sea_orm::entity::prelude::*;
use sea_orm::Set;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "tasks")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String, // "todo", "in_progress", "done"
    pub creator_id: String,
    pub executor_id: Option<String>,
    pub invite_id: String,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        let now = chrono::Utc::now().into();
        Self {
            id: Set(uuid::Uuid::new_v4().to_string()),
            status: Set("todo".to_string()),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        }
    }
}