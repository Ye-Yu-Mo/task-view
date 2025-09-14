-- 添加任务完成详情字段
ALTER TABLE tasks ADD COLUMN completion_details TEXT;
ALTER TABLE tasks ADD COLUMN completed_at DATETIME;