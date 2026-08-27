CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" serial NOT NULL,
	"user_id" serial NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"icon" varchar(50),
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "points" (
	"id" serial PRIMARY KEY NOT NULL,
	"stage_id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"completed" boolean DEFAULT false NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"delivery_date" date,
	"icon" varchar(50),
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "update_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" serial NOT NULL,
	"action" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_by" varchar(255) DEFAULT 'system' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
