import { Migration } from '@mikro-orm/migrations';

export class Migration20260115020000_create_error_log_table extends Migration {

    override async up(): Promise<void> {
        // Check if table exists before creating
        this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'error_log') THEN
          CREATE TABLE "error_log" (
            "id" uuid not null,
            "tenant_id" uuid null,
            "user_id" int null,
            "error_message" varchar(255) not null,
            "error_stack" text null,
            "component_stack" text null,
            "user_agent" varchar(255) null,
            "url" varchar(255) null,
            "timestamp" timestamptz not null,
            "resolved" boolean not null default false,
            "resolved_by" varchar(255) null,
            "resolved_at" timestamptz null,
            constraint "error_log_pkey" primary key ("id")
          );
        END IF;
      END $$;
    `);

        // Add constraints safely
        this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_log_tenant_id_foreign') THEN
          ALTER TABLE "error_log" ADD CONSTRAINT "error_log_tenant_id_foreign" FOREIGN KEY ("tenant_id") REFERENCES "tenant" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
        END IF;
      END $$;
    `);

        this.addSql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'error_log_user_id_foreign') THEN
          ALTER TABLE "error_log" ADD CONSTRAINT "error_log_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "error_log" cascade;`);
    }

}
