import { Migration } from '@mikro-orm/migrations';

export class Migration20260115030000 extends Migration {
    async up(): Promise<void> {
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "error_message" TYPE text;');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "error_stack" TYPE text;');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "component_stack" TYPE text;');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "user_agent" TYPE text;');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "url" TYPE text;');
    }

    async down(): Promise<void> {
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "error_message" TYPE varchar(255);');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "error_stack" TYPE varchar(255);');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "component_stack" TYPE varchar(255);');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "user_agent" TYPE varchar(255);');
        this.addSql('ALTER TABLE "error_log" ALTER COLUMN "url" TYPE varchar(255);');
    }
}
