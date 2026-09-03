ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar(50) NOT NULL DEFAULT 'Board';
--> statement-breakpoint
UPDATE "users"
SET "role" = 'Administrateur'
WHERE "username" = 'admin';
