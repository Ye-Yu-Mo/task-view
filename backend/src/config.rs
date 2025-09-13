use dotenvy::dotenv;
use std::env;

pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self, env::VarError> {
        dotenv().ok();
        
        Ok(Config {
            database_url: env::var("DATABASE_URL")?,
            port: env::var("PORT")
                .unwrap_or_else(|_| "20000".to_string())
                .parse()
                .unwrap_or(20000),
        })
    }
}