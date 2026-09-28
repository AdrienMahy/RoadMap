CREATE TABLE IF NOT EXISTS "sprints" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "goal" text,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sprint_items" (
  "id" serial PRIMARY KEY,
  "sprint_id" integer NOT NULL REFERENCES "sprints"("id") ON DELETE CASCADE,
  "module_id" integer REFERENCES "modules"("id") ON DELETE CASCADE,
  "stage_id" integer REFERENCES "stages"("id") ON DELETE CASCADE,
  "order_index" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "sprint_items_single_target" CHECK (("module_id" IS NOT NULL AND "stage_id" IS NULL) OR ("module_id" IS NULL AND "stage_id" IS NOT NULL)),
  CONSTRAINT "sprint_items_unique_module" UNIQUE ("sprint_id", "module_id"),
  CONSTRAINT "sprint_items_unique_stage" UNIQUE ("sprint_id", "stage_id")
);

CREATE INDEX IF NOT EXISTS "sprint_items_sprint_id_idx" ON "sprint_items" ("sprint_id");
CREATE INDEX IF NOT EXISTS "sprint_items_module_id_idx" ON "sprint_items" ("module_id");
CREATE INDEX IF NOT EXISTS "sprint_items_stage_id_idx" ON "sprint_items" ("stage_id");
