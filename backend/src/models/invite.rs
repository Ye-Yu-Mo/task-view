use sea_orm::entity::prelude::*;
use sea_orm::Set;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "invites")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: String,
    pub code: String,
    pub creator_id: String,
    pub executor_id: Option<String>,
    pub status: String, // "pending" or "used"
    pub created_at: DateTimeWithTimeZone,
    pub used_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        let mut active_model = <ActiveModel as sea_orm::ActiveModelTrait>::default();
        active_model.id = Set(uuid::Uuid::new_v4().to_string());
        active_model.code = Set(uuid::Uuid::new_v4().to_string()[0..8].to_uppercase());
        active_model.status = Set("pending".to_string());
        active_model.created_at = Set(chrono::Utc::now().into());
        active_model
    }
}
