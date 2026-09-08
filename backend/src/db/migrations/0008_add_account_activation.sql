-- Add isActivated column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_activated" boolean NOT NULL DEFAULT false;

-- Create activation_tokens table for email-based account activation
CREATE TABLE IF NOT EXISTS "activation_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "activation_tokens_token_unique" UNIQUE("token")
);

-- Add foreign key constraint for user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activation_tokens_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "activation_tokens"
    ADD CONSTRAINT "activation_tokens_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;
