ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "order_index" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "stages" ADD COLUMN IF NOT EXISTS "module_id" integer;
--> statement-breakpoint
ALTER TABLE "stages" ALTER COLUMN "module_id" SET NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stages_module_id_modules_id_fk'
  ) THEN
    ALTER TABLE "stages"
    ADD CONSTRAINT "stages_module_id_modules_id_fk"
    FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE;
  END IF;
END $$;
