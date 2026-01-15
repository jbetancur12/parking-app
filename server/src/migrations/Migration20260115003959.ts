import { Migration } from '@mikro-orm/migrations';

export class Migration20260115003959 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "feature_definition" ("id" serial primary key, "key" varchar(255) not null, "description" varchar(255) not null, "category" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "feature_definition" add constraint "feature_definition_key_unique" unique ("key");`);

    this.addSql(`create table "pricing_plan" ("id" uuid not null, "code" varchar(255) not null, "name" varchar(255) not null, "price" numeric(10,2) not null, "billing_period" varchar(255) not null default 'monthly', "max_locations" int not null, "max_users" int not null, "max_sessions" int not null, "features" jsonb not null, "feature_flags" jsonb null, "support" varchar(255) not null, "soft_limit_percentage" numeric(5,2) not null default 0.8, "hard_limit_percentage" numeric(5,2) not null default 1.2, "is_public" boolean not null default true, "is_active" boolean not null default true, "display_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "pricing_plan_pkey" primary key ("id"));`);
    this.addSql(`alter table "pricing_plan" add constraint "pricing_plan_code_unique" unique ("code");`);

    this.addSql(`create table "system_notification" ("id" uuid not null, "title" varchar(255) not null, "message" text not null, "type" text check ("type" in ('info', 'warning', 'danger')) not null default 'info', "is_active" boolean not null default true, "target_roles" jsonb null, "expires_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "system_notification_pkey" primary key ("id"));`);

    this.addSql(`create table "tenant" ("id" uuid not null, "name" varchar(255) not null, "slug" varchar(255) not null, "contact_email" varchar(255) null, "status" text check ("status" in ('active', 'suspended', 'archived')) not null default 'active', "plan" varchar(255) not null default 'basic', "pricing_plan_id" uuid null, "max_locations" int not null default 1, "max_users" int not null default 2, "trial_ends_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "tenant_pkey" primary key ("id"));`);
    this.addSql(`alter table "tenant" add constraint "tenant_slug_unique" unique ("slug");`);

    this.addSql(`create table "subscription" ("id" uuid not null, "tenant_id" uuid not null, "plan" varchar(255) not null, "status" text check ("status" in ('trialing', 'active', 'past_due', 'cancelled', 'unpaid')) not null default 'trialing', "current_period_start" timestamptz not null, "current_period_end" timestamptz not null, "cancel_at_period_end" boolean not null default false, "cancelled_at" timestamptz null, "trial_start" timestamptz null, "trial_end" timestamptz null, "amount" numeric(10,2) not null, "currency" varchar(255) not null default 'USD', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "subscription_pkey" primary key ("id"));`);

    this.addSql(`create table "location" ("id" uuid not null, "tenant_id" uuid not null, "name" varchar(255) not null, "address" varchar(255) null, "phone" varchar(255) null, "settings" jsonb null, "current_ticket_number" int not null default 0, "current_receipt_number" int not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "location_pkey" primary key ("id"));`);

    this.addSql(`create table "tariff" ("id" serial primary key, "vehicle_type" text check ("vehicle_type" in ('CAR', 'MOTORCYCLE', 'OTHER')) not null, "tariff_type" text check ("tariff_type" in ('MINUTE', 'HOUR', 'DAY', 'NIGHT', 'MONTH', 'WEEK', 'TWO_WEEKS')) not null, "cost" numeric(10,2) not null, "pricing_model" text check ("pricing_model" in ('MINUTE', 'BLOCKS', 'TRADITIONAL')) not null default 'BLOCKS', "base_price" numeric(10,2) not null default 0, "base_time_minutes" int not null default 60, "extra_frac_price" numeric(10,2) not null default 0, "extra_frac_time_minutes" int not null default 15, "day_max_price" numeric(10,2) null, "day_min_hours" int null, "description" varchar(255) null, "tenant_id" uuid not null, "location_id" uuid not null);`);

    this.addSql(`create table "system_setting" ("id" serial primary key, "key" varchar(255) not null, "value" text not null, "description" varchar(255) null, "tenant_id" uuid not null, "location_id" uuid null);`);

    this.addSql(`create table "product" ("id" serial primary key, "tenant_id" uuid not null, "location_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "price" numeric(10,2) not null, "stock" int not null default 0, "min_stock" int not null default 5, "is_active" boolean not null default true);`);
    this.addSql(`create index "product_tenant_id_index" on "product" ("tenant_id");`);
    this.addSql(`create index "product_location_id_index" on "product" ("location_id");`);

    this.addSql(`create table "monthly_client" ("id" serial primary key, "tenant_id" uuid not null, "location_id" uuid not null, "plate" varchar(255) not null, "name" varchar(255) not null, "phone" varchar(255) null, "vehicle_type" varchar(255) null, "start_date" timestamptz not null, "end_date" timestamptz not null, "billing_period" text check ("billing_period" in ('MONTH', 'TWO_WEEKS', 'WEEK')) not null default 'MONTH', "monthly_rate" numeric(10,2) not null, "is_active" boolean not null default true, "terms_accepted" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`create index "monthly_client_tenant_id_index" on "monthly_client" ("tenant_id");`);
    this.addSql(`create index "monthly_client_location_id_index" on "monthly_client" ("location_id");`);
    this.addSql(`alter table "monthly_client" add constraint "monthly_client_plate_unique" unique ("plate");`);

    this.addSql(`create table "monthly_payment" ("id" serial primary key, "client_id" int not null, "period_start" timestamptz not null, "period_end" timestamptz not null, "amount" numeric(10,2) not null, "payment_date" timestamptz not null, "receipt_number" varchar(255) null);`);

    this.addSql(`create table "loyalty" ("id" serial primary key, "plate" varchar(255) not null, "points" int not null default 0, "total_visits" int not null default 0, "last_visit" timestamptz not null, "tenant_id" uuid not null, "location_id" uuid null);`);

    this.addSql(`create table "invoice" ("id" uuid not null, "tenant_id" uuid not null, "subscription_id" uuid null, "invoice_number" varchar(255) not null, "status" text check ("status" in ('draft', 'open', 'paid', 'void', 'uncollectible')) not null default 'draft', "subtotal" numeric(10,2) not null, "tax" numeric(10,2) not null default 0, "total" numeric(10,2) not null, "currency" varchar(255) not null default 'USD', "due_date" timestamptz not null, "paid_at" timestamptz null, "voided_at" timestamptz null, "notes" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "invoice_pkey" primary key ("id"));`);
    this.addSql(`alter table "invoice" add constraint "invoice_invoice_number_unique" unique ("invoice_number");`);

    this.addSql(`create table "payment" ("id" uuid not null, "tenant_id" uuid not null, "invoice_id" uuid not null, "amount" numeric(10,2) not null, "currency" varchar(255) not null default 'USD', "status" text check ("status" in ('pending', 'completed', 'failed', 'refunded')) not null default 'pending', "payment_method" text check ("payment_method" in ('card', 'transfer', 'cash', 'other')) not null, "transaction_id" varchar(255) null, "metadata" jsonb null, "notes" text null, "processed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "payment_pkey" primary key ("id"));`);

    this.addSql(`create table "invoice_item" ("id" uuid not null, "invoice_id" uuid not null, "description" varchar(255) not null, "quantity" int not null default 1, "unit_price" numeric(10,2) not null, "amount" numeric(10,2) not null, "created_at" timestamptz not null, constraint "invoice_item_pkey" primary key ("id"));`);

    this.addSql(`create table "brand" ("id" serial primary key, "name" varchar(255) not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "tenant_id" uuid not null);`);
    this.addSql(`alter table "brand" add constraint "brand_name_unique" unique ("name");`);

    this.addSql(`create table "audit_log" ("id" serial primary key, "action" varchar(255) not null, "entity" varchar(255) not null, "entity_id" varchar(255) null, "user_id" int null, "username" varchar(255) null, "details" text null, "ip_address" varchar(255) null, "timestamp" timestamptz not null, "tenant_id" uuid null, "location_id" uuid null);`);

    this.addSql(`create table "agreement" ("id" serial primary key, "name" varchar(255) not null, "type" text check ("type" in ('FREE_HOURS', 'PERCENTAGE', 'FLAT_DISCOUNT')) not null, "value" numeric(10,2) not null, "is_active" boolean not null default true, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "location_id" uuid not null);`);

    this.addSql(`create table "usage_record" ("id" uuid not null, "tenant_id" uuid not null, "month" varchar(255) not null, "sessions_count" int not null default 0, "users_count" int not null default 0, "locations_count" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "usage_record_pkey" primary key ("id"));`);

    this.addSql(`create table "user" ("id" serial primary key, "username" varchar(255) not null, "password" varchar(255) not null, "role" text check ("role" in ('SUPER_ADMIN', 'ADMIN', 'LOCATION_MANAGER', 'OPERATOR', 'CASHIER')) not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, "last_login_at" timestamptz null, "last_active_location_id" uuid null, "reset_password_token" varchar(255) null, "reset_password_expires" timestamptz null, "token_version" int not null default 0);`);
    this.addSql(`alter table "user" add constraint "user_username_unique" unique ("username");`);

    this.addSql(`create table "shift" ("id" serial primary key, "tenant_id" uuid not null, "location_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" int not null, "start_time" timestamptz not null, "end_time" timestamptz null, "base_amount" numeric(10,2) not null default 0, "total_income" numeric(10,2) not null default 0, "total_expenses" numeric(10,2) not null default 0, "cash_income" numeric(10,2) not null default 0, "transfer_income" numeric(10,2) not null default 0, "declared_amount" numeric(10,2) not null default 0, "notes" varchar(255) null, "is_active" boolean not null default true);`);
    this.addSql(`create index "shift_tenant_id_index" on "shift" ("tenant_id");`);
    this.addSql(`create index "shift_location_id_index" on "shift" ("location_id");`);

    this.addSql(`create table "transaction" ("id" serial primary key, "tenant_id" uuid not null, "location_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "receipt_number" varchar(255) null, "shift_id" int not null, "type" text check ("type" in ('INCOME', 'EXPENSE', 'PARKING_REVENUE', 'MONTHLY_PAYMENT', 'WASH_SERVICE')) not null, "amount" numeric(10,2) not null, "description" varchar(255) not null, "payment_method" text check ("payment_method" in ('CASH', 'TRANSFER')) not null, "timestamp" timestamptz not null, "discount" numeric(10,2) null, "discount_reason" varchar(255) null, "agreement_id" int null);`);
    this.addSql(`create index "transaction_tenant_id_index" on "transaction" ("tenant_id");`);
    this.addSql(`create index "transaction_location_id_index" on "transaction" ("location_id");`);
    this.addSql(`create index "transaction_shift_id_index" on "transaction" ("shift_id");`);

    this.addSql(`create table "parking_session" ("id" serial primary key, "tenant_id" uuid not null, "location_id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "plate" varchar(255) not null, "ticket_number" varchar(255) null, "vehicle_type" text check ("vehicle_type" in ('CAR', 'MOTORCYCLE', 'OTHER')) not null, "plan_type" text check ("plan_type" in ('MINUTE', 'HOUR', 'DAY')) not null default 'HOUR', "entry_time" timestamptz not null, "exit_time" timestamptz null, "cost" numeric(10,2) null, "status" text check ("status" in ('ACTIVE', 'COMPLETED', 'CANCELLED')) not null default 'ACTIVE', "entry_shift_id" int not null, "exit_shift_id" int null, "notes" text null, "discount" numeric(10,2) null, "discount_reason" varchar(255) null, "receipt_number" varchar(255) null, "agreement_id" int null);`);
    this.addSql(`create index "parking_session_tenant_id_index" on "parking_session" ("tenant_id");`);
    this.addSql(`create index "parking_session_location_id_index" on "parking_session" ("location_id");`);
    this.addSql(`create index "parking_session_plate_index" on "parking_session" ("plate");`);
    this.addSql(`create index "parking_session_status_index" on "parking_session" ("status");`);

    this.addSql(`create table "expense" ("id" serial primary key, "shift_id" int not null, "description" varchar(255) not null, "amount" numeric(10,2) not null, "created_at" timestamptz not null, "tenant_id" uuid not null, "location_id" uuid not null);`);
    this.addSql(`create index "expense_shift_id_index" on "expense" ("shift_id");`);

    this.addSql(`create table "user_locations" ("user_id" int not null, "location_id" uuid not null, constraint "user_locations_pkey" primary key ("user_id", "location_id"));`);

    this.addSql(`create table "user_tenants" ("user_id" int not null, "tenant_id" uuid not null, constraint "user_tenants_pkey" primary key ("user_id", "tenant_id"));`);

    this.addSql(`create table "wash_service_type" ("id" serial primary key, "name" varchar(255) not null, "price" numeric(10,2) not null, "vehicle_type" varchar(255) not null, "is_active" boolean not null default true, "tenant_id" uuid not null, "location_id" uuid not null);`);

    this.addSql(`create table "wash_entry" ("id" serial primary key, "shift_id" int not null, "service_type_id" int not null, "plate" varchar(255) not null, "operator_name" varchar(255) null, "receipt_number" varchar(255) null, "cost" numeric(10,2) not null, "status" varchar(255) not null default 'Completed', "payment_method" varchar(255) not null default 'CASH', "created_at" timestamptz not null, "tenant_id" uuid not null, "location_id" uuid not null);`);
    this.addSql(`create index "wash_entry_shift_id_index" on "wash_entry" ("shift_id");`);

    this.addSql(`alter table "tenant" add constraint "tenant_pricing_plan_id_foreign" foreign key ("pricing_plan_id") references "pricing_plan" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "subscription" add constraint "subscription_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);

    this.addSql(`alter table "location" add constraint "location_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);

    this.addSql(`alter table "tariff" add constraint "tariff_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "tariff" add constraint "tariff_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);

    this.addSql(`alter table "system_setting" add constraint "system_setting_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "system_setting" add constraint "system_setting_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "product" add constraint "product_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "product" add constraint "product_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);

    this.addSql(`alter table "monthly_client" add constraint "monthly_client_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "monthly_client" add constraint "monthly_client_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);

    this.addSql(`alter table "monthly_payment" add constraint "monthly_payment_client_id_foreign" foreign key ("client_id") references "monthly_client" ("id") on update cascade;`);

    this.addSql(`alter table "loyalty" add constraint "loyalty_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "loyalty" add constraint "loyalty_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "invoice" add constraint "invoice_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "invoice" add constraint "invoice_subscription_id_foreign" foreign key ("subscription_id") references "subscription" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "payment" add constraint "payment_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "payment" add constraint "payment_invoice_id_foreign" foreign key ("invoice_id") references "invoice" ("id") on update cascade;`);

    this.addSql(`alter table "invoice_item" add constraint "invoice_item_invoice_id_foreign" foreign key ("invoice_id") references "invoice" ("id") on update cascade;`);

    this.addSql(`alter table "brand" add constraint "brand_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);

    this.addSql(`alter table "audit_log" add constraint "audit_log_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "audit_log" add constraint "audit_log_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "agreement" add constraint "agreement_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "agreement" add constraint "agreement_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);

    this.addSql(`alter table "usage_record" add constraint "usage_record_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);

    this.addSql(`alter table "user" add constraint "user_last_active_location_id_foreign" foreign key ("last_active_location_id") references "location" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "shift" add constraint "shift_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "shift" add constraint "shift_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);
    this.addSql(`alter table "shift" add constraint "shift_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "transaction" add constraint "transaction_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "transaction" add constraint "transaction_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);
    this.addSql(`alter table "transaction" add constraint "transaction_shift_id_foreign" foreign key ("shift_id") references "shift" ("id") on update cascade;`);
    this.addSql(`alter table "transaction" add constraint "transaction_agreement_id_foreign" foreign key ("agreement_id") references "agreement" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "parking_session" add constraint "parking_session_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "parking_session" add constraint "parking_session_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);
    this.addSql(`alter table "parking_session" add constraint "parking_session_entry_shift_id_foreign" foreign key ("entry_shift_id") references "shift" ("id") on update cascade;`);
    this.addSql(`alter table "parking_session" add constraint "parking_session_exit_shift_id_foreign" foreign key ("exit_shift_id") references "shift" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "parking_session" add constraint "parking_session_agreement_id_foreign" foreign key ("agreement_id") references "agreement" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "expense" add constraint "expense_shift_id_foreign" foreign key ("shift_id") references "shift" ("id") on update cascade;`);
    this.addSql(`alter table "expense" add constraint "expense_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "expense" add constraint "expense_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);

    this.addSql(`alter table "user_locations" add constraint "user_locations_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_locations" add constraint "user_locations_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_tenants" add constraint "user_tenants_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_tenants" add constraint "user_tenants_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "wash_service_type" add constraint "wash_service_type_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "wash_service_type" add constraint "wash_service_type_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);

    this.addSql(`alter table "wash_entry" add constraint "wash_entry_shift_id_foreign" foreign key ("shift_id") references "shift" ("id") on update cascade;`);
    this.addSql(`alter table "wash_entry" add constraint "wash_entry_service_type_id_foreign" foreign key ("service_type_id") references "wash_service_type" ("id") on update cascade;`);
    this.addSql(`alter table "wash_entry" add constraint "wash_entry_tenant_id_foreign" foreign key ("tenant_id") references "tenant" ("id") on update cascade;`);
    this.addSql(`alter table "wash_entry" add constraint "wash_entry_location_id_foreign" foreign key ("location_id") references "location" ("id") on update cascade;`);
  }

}
