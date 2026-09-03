-- RoadMap Database Initialization Script
-- This database is managed by Drizzle ORM migrations
-- Initial data is restored from backup on startup
-- 
-- See: /backups/roadmap_*.sql for the backup file
-- Docker will auto-restore the latest backup when container starts

-- Marker table to track initialization status
CREATE TABLE IF NOT EXISTS _init_status (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'initialized',
    note TEXT
);

INSERT INTO _init_status (status, note) VALUES 
    ('initialized', 'Database ready - schema and data from Drizzle migrations + backup restore');
