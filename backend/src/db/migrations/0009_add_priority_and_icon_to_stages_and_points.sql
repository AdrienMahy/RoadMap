-- Add priority and icon columns to stages table
ALTER TABLE "stages" ADD COLUMN IF NOT EXISTS "priority" varchar(50) DEFAULT 'medium';
ALTER TABLE "stages" ADD COLUMN IF NOT EXISTS "icon" varchar(50);

-- Add priority column to points table
ALTER TABLE "points" ADD COLUMN IF NOT EXISTS "priority" varchar(50) DEFAULT 'medium';
