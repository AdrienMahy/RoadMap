CREATE TABLE IF NOT EXISTS "documentation_documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "project_id" integer REFERENCES "projects"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "content_markdown" text NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "documentation_documents_project_id_idx"
  ON "documentation_documents" ("project_id");