use sea_orm::*;
use std::fs;

pub struct Database {
    pub connection: DatabaseConnection,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, DbErr> {
        let connection = sea_orm::Database::connect(database_url).await?;
        
        // 运行迁移
        Self::run_migrations(&connection).await?;
        
        Ok(Database { connection })
    }
    
    async fn run_migrations(db: &DatabaseConnection) -> Result<(), DbErr> {
        // 检查是否需要运行迁移
        if Self::should_run_migrations(db).await? {
            tracing::info!("Running database migrations...");
            
            // 运行001迁移
            let migration_001 = fs::read_to_string("/app/migrations/001_initial.sql")
                .map_err(|e| DbErr::Custom(format!("Failed to read migration file 001: {}", e)))?;
            db.execute_unprepared(&migration_001).await?;
            
            // 运行002迁移  
            let migration_002 = fs::read_to_string("/app/migrations/002_add_completion_details.sql")
                .map_err(|e| DbErr::Custom(format!("Failed to read migration file 002: {}", e)))?;
            db.execute_unprepared(&migration_002).await?;
            
            tracing::info!("Database migrations completed");
        }
        
        Ok(())
    }
    
    async fn should_run_migrations(db: &DatabaseConnection) -> Result<bool, DbErr> {
        // 检查users表是否存在，使用查询方式
        let result = db
            .execute_unprepared("SELECT 1 FROM users LIMIT 1;")
            .await;
            
        match result {
            Ok(_) => Ok(false), // 表存在，不需要迁移
            Err(_) => Ok(true), // 表不存在，需要迁移
        }
    }
}