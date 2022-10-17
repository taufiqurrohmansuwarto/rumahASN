/*
 Navicat PostgreSQL Data Transfer

 Source Server         : POSTGRES
 Source Server Type    : PostgreSQL
 Source Server Version : 100003
 Source Host           : localhost:5432
 Source Catalog        : siasn_helpdesk
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 100003
 File Encoding         : 65001

 Date: 17/10/2022 19:00:40
*/


-- ----------------------------
-- Sequence structure for categories_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."categories_id_seq";
CREATE SEQUENCE "public"."categories_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for comments_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."comments_id_seq";
CREATE SEQUENCE "public"."comments_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for knex_migrations_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."knex_migrations_id_seq";
CREATE SEQUENCE "public"."knex_migrations_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for knex_migrations_lock_index_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."knex_migrations_lock_index_seq";
CREATE SEQUENCE "public"."knex_migrations_lock_index_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for notifications_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."notifications_id_seq";
CREATE SEQUENCE "public"."notifications_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for permissions_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."permissions_id_seq";
CREATE SEQUENCE "public"."permissions_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tickets_comments_customers_agents_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tickets_comments_customers_agents_id_seq";
CREATE SEQUENCE "public"."tickets_comments_customers_agents_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for users_permissions_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."users_permissions_id_seq";
CREATE SEQUENCE "public"."users_permissions_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS "public"."categories";
CREATE TABLE "public"."categories" (
  "id" int4 NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "color" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "kode_satuan_kerja" varchar(255) COLLATE "pg_catalog"."default",
  "satuan_kerja" jsonb,
  "description" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "created_by" varchar(255) COLLATE "pg_catalog"."default",
  "updated_by" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS "public"."comments";
CREATE TABLE "public"."comments" (
  "id" int4 NOT NULL DEFAULT nextval('comments_id_seq'::regclass),
  "comment" text COLLATE "pg_catalog"."default",
  "user_custom_id" varchar(255) COLLATE "pg_catalog"."default",
  "comment_id" int4,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz(6)
)
;

-- ----------------------------
-- Table structure for knex_migrations
-- ----------------------------
DROP TABLE IF EXISTS "public"."knex_migrations";
CREATE TABLE "public"."knex_migrations" (
  "id" int4 NOT NULL DEFAULT nextval('knex_migrations_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "batch" int4,
  "migration_time" timestamptz(6)
)
;

-- ----------------------------
-- Table structure for knex_migrations_lock
-- ----------------------------
DROP TABLE IF EXISTS "public"."knex_migrations_lock";
CREATE TABLE "public"."knex_migrations_lock" (
  "index" int4 NOT NULL DEFAULT nextval('knex_migrations_lock_index_seq'::regclass),
  "is_locked" int4
)
;

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS "public"."notifications";
CREATE TABLE "public"."notifications" (
  "id" int4 NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  "type" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "title" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "content" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "from" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "to" varchar(255) COLLATE "pg_catalog"."default",
  "read_at" timestamptz(6),
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS "public"."permissions";
CREATE TABLE "public"."permissions" (
  "id" int4 NOT NULL DEFAULT nextval('permissions_id_seq'::regclass),
  "action" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "subject" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "conditions" json,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for priorities
-- ----------------------------
DROP TABLE IF EXISTS "public"."priorities";
CREATE TABLE "public"."priorities" (
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "color" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "created_by" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS "public"."roles";
CREATE TABLE "public"."roles" (
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for status
-- ----------------------------
DROP TABLE IF EXISTS "public"."status";
CREATE TABLE "public"."status" (
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6) DEFAULT now(),
  "updated_at" timestamp(6) DEFAULT now(),
  "created_by" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for tickets
-- ----------------------------
DROP TABLE IF EXISTS "public"."tickets";
CREATE TABLE "public"."tickets" (
  "id" uuid NOT NULL,
  "title" varchar(255) COLLATE "pg_catalog"."default",
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "content" text COLLATE "pg_catalog"."default",
  "html" text COLLATE "pg_catalog"."default",
  "ticket_number" text COLLATE "pg_catalog"."default",
  "assignee" varchar(255) COLLATE "pg_catalog"."default",
  "requester" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "start_work_at" timestamptz(6),
  "completed_at" timestamptz(6),
  "assignee_json" jsonb,
  "requester_json" jsonb,
  "file_url" varchar(255) COLLATE "pg_catalog"."default",
  "finished_at" timestamp(6),
  "chooser" varchar(255) COLLATE "pg_catalog"."default",
  "chooser_picked_at" timestamp(6),
  "status_code" varchar(255) COLLATE "pg_catalog"."default",
  "category_id" int4,
  "priority_code" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Table structure for tickets_agents_helper
-- ----------------------------
DROP TABLE IF EXISTS "public"."tickets_agents_helper";
CREATE TABLE "public"."tickets_agents_helper" (
  "user_custom_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "ticket_id" uuid NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for tickets_attachments
-- ----------------------------
DROP TABLE IF EXISTS "public"."tickets_attachments";
CREATE TABLE "public"."tickets_attachments" (
  "id" uuid NOT NULL,
  "ticket_id" uuid,
  "file_name" varchar(255) COLLATE "pg_catalog"."default",
  "file_path" varchar(255) COLLATE "pg_catalog"."default",
  "file_type" varchar(255) COLLATE "pg_catalog"."default",
  "file_size" varchar(255) COLLATE "pg_catalog"."default",
  "file_url" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for tickets_comments_agents
-- ----------------------------
DROP TABLE IF EXISTS "public"."tickets_comments_agents";
CREATE TABLE "public"."tickets_comments_agents" (
  "id" uuid NOT NULL,
  "ticket_id" uuid,
  "user_id" varchar(255) COLLATE "pg_catalog"."default",
  "comment" text COLLATE "pg_catalog"."default",
  "html" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for tickets_comments_customers
-- ----------------------------
DROP TABLE IF EXISTS "public"."tickets_comments_customers";
CREATE TABLE "public"."tickets_comments_customers" (
  "id" int4 NOT NULL DEFAULT nextval('tickets_comments_customers_agents_id_seq'::regclass),
  "ticket_id" uuid,
  "customer_id" varchar(255) COLLATE "pg_catalog"."default",
  "agent_id" varchar(255) COLLATE "pg_catalog"."default",
  "comment" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "custom_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "username" varchar(255) COLLATE "pg_catalog"."default",
  "image" varchar(255) COLLATE "pg_catalog"."default",
  "id" varchar(255) COLLATE "pg_catalog"."default",
  "from" varchar(255) COLLATE "pg_catalog"."default",
  "role" varchar(255) COLLATE "pg_catalog"."default",
  "group" varchar(255) COLLATE "pg_catalog"."default",
  "employee_number" varchar(255) COLLATE "pg_catalog"."default",
  "birthdate" date,
  "last_login" timestamptz(6),
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "organization_id" varchar(255) COLLATE "pg_catalog"."default",
  "current_role" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'user'::character varying
)
;

-- ----------------------------
-- Table structure for users_permissions
-- ----------------------------
DROP TABLE IF EXISTS "public"."users_permissions";
CREATE TABLE "public"."users_permissions" (
  "id" int4 NOT NULL DEFAULT nextval('users_permissions_id_seq'::regclass),
  "role_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "permission_id" int4 NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."categories_id_seq"
OWNED BY "public"."categories"."id";
SELECT setval('"public"."categories_id_seq"', 8, true);
ALTER SEQUENCE "public"."comments_id_seq"
OWNED BY "public"."comments"."id";
SELECT setval('"public"."comments_id_seq"', 2, false);
ALTER SEQUENCE "public"."knex_migrations_id_seq"
OWNED BY "public"."knex_migrations"."id";
SELECT setval('"public"."knex_migrations_id_seq"', 22, true);
ALTER SEQUENCE "public"."knex_migrations_lock_index_seq"
OWNED BY "public"."knex_migrations_lock"."index";
SELECT setval('"public"."knex_migrations_lock_index_seq"', 2, true);
ALTER SEQUENCE "public"."notifications_id_seq"
OWNED BY "public"."notifications"."id";
SELECT setval('"public"."notifications_id_seq"', 2, false);
ALTER SEQUENCE "public"."permissions_id_seq"
OWNED BY "public"."permissions"."id";
SELECT setval('"public"."permissions_id_seq"', 2, false);
ALTER SEQUENCE "public"."tickets_comments_customers_agents_id_seq"
OWNED BY "public"."tickets_comments_customers"."id";
SELECT setval('"public"."tickets_comments_customers_agents_id_seq"', 2, false);
ALTER SEQUENCE "public"."users_permissions_id_seq"
OWNED BY "public"."users_permissions"."id";
SELECT setval('"public"."users_permissions_id_seq"', 2, false);

-- ----------------------------
-- Primary Key structure for table categories
-- ----------------------------
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table comments
-- ----------------------------
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table knex_migrations
-- ----------------------------
ALTER TABLE "public"."knex_migrations" ADD CONSTRAINT "knex_migrations_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table knex_migrations_lock
-- ----------------------------
ALTER TABLE "public"."knex_migrations_lock" ADD CONSTRAINT "knex_migrations_lock_pkey" PRIMARY KEY ("index");

-- ----------------------------
-- Primary Key structure for table notifications
-- ----------------------------
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table permissions
-- ----------------------------
ALTER TABLE "public"."permissions" ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table priorities
-- ----------------------------
ALTER TABLE "public"."priorities" ADD CONSTRAINT "priorities_pk" PRIMARY KEY ("name");

-- ----------------------------
-- Primary Key structure for table roles
-- ----------------------------
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("name");

-- ----------------------------
-- Primary Key structure for table status
-- ----------------------------
ALTER TABLE "public"."status" ADD CONSTRAINT "status_pkey" PRIMARY KEY ("name");

-- ----------------------------
-- Primary Key structure for table tickets
-- ----------------------------
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table tickets_agents_helper
-- ----------------------------
ALTER TABLE "public"."tickets_agents_helper" ADD CONSTRAINT "tickets_agents_helper_pkey" PRIMARY KEY ("user_custom_id", "ticket_id");

-- ----------------------------
-- Primary Key structure for table tickets_attachments
-- ----------------------------
ALTER TABLE "public"."tickets_attachments" ADD CONSTRAINT "tickets_attachments_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table tickets_comments_agents
-- ----------------------------
ALTER TABLE "public"."tickets_comments_agents" ADD CONSTRAINT "tickets_comments_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table tickets_comments_customers
-- ----------------------------
ALTER TABLE "public"."tickets_comments_customers" ADD CONSTRAINT "tickets_comments_customers_agents_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("custom_id");

-- ----------------------------
-- Primary Key structure for table users_permissions
-- ----------------------------
ALTER TABLE "public"."users_permissions" ADD CONSTRAINT "users_permissions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table categories
-- ----------------------------
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_updated_by_foreign" FOREIGN KEY ("updated_by") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table comments
-- ----------------------------
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_comment_id_foreign" FOREIGN KEY ("comment_id") REFERENCES "public"."comments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_user_custom_id_foreign" FOREIGN KEY ("user_custom_id") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table notifications
-- ----------------------------
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_from_foreign" FOREIGN KEY ("from") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_to_foreign" FOREIGN KEY ("to") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table priorities
-- ----------------------------
ALTER TABLE "public"."priorities" ADD CONSTRAINT "priorities_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table status
-- ----------------------------
ALTER TABLE "public"."status" ADD CONSTRAINT "status_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tickets
-- ----------------------------
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_priority_code_fkey" FOREIGN KEY ("priority_code") REFERENCES "public"."priorities" ("name") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "public"."status" ("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tickets_agents_helper
-- ----------------------------
ALTER TABLE "public"."tickets_agents_helper" ADD CONSTRAINT "tickets_agents_helper_ticket_id_foreign" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tickets_agents_helper" ADD CONSTRAINT "tickets_agents_helper_user_custom_id_foreign" FOREIGN KEY ("user_custom_id") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tickets_attachments
-- ----------------------------
ALTER TABLE "public"."tickets_attachments" ADD CONSTRAINT "tickets_attachments_ticket_id_foreign" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tickets_comments_agents
-- ----------------------------
ALTER TABLE "public"."tickets_comments_agents" ADD CONSTRAINT "tickets_comments_ticket_id_foreign" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tickets_comments_customers
-- ----------------------------
ALTER TABLE "public"."tickets_comments_customers" ADD CONSTRAINT "tickets_comments_customers_agents_agent_id_foreign" FOREIGN KEY ("agent_id") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tickets_comments_customers" ADD CONSTRAINT "tickets_comments_customers_agents_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."users" ("custom_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."tickets_comments_customers" ADD CONSTRAINT "tickets_comments_customers_agents_ticket_id_foreign" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_current_role_foreign" FOREIGN KEY ("current_role") REFERENCES "public"."roles" ("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table users_permissions
-- ----------------------------
ALTER TABLE "public"."users_permissions" ADD CONSTRAINT "users_permissions_permission_id_foreign" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."users_permissions" ADD CONSTRAINT "users_permissions_role_id_foreign" FOREIGN KEY ("role_id") REFERENCES "public"."roles" ("name") ON DELETE NO ACTION ON UPDATE NO ACTION;
