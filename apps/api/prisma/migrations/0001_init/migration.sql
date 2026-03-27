CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Prisma baseline migration for Direct Drops MVP
-- Generated manually for repository bootstrap.
CREATE TYPE "Role" AS ENUM ('ADMIN','CONTROLLER','COURIER');
CREATE TYPE "CourierStatus" AS ENUM ('OFFLINE','AVAILABLE','BUSY');
CREATE TYPE "JobStatus" AS ENUM ('NEW','ASSIGNED','OUT_FOR_DELIVERY','DELIVERED','FAILED','CANCELLED');
CREATE TYPE "Priority" AS ENUM ('NORMAL','HIGH');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "role" "Role" NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT UNIQUE,
  "username" TEXT UNIQUE,
  "password_hash" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "couriers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id"),
  "vehicle_type" TEXT,
  "current_status" "CourierStatus" NOT NULL DEFAULT 'OFFLINE',
  "last_location_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "jobs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_name" TEXT NOT NULL,
  "customer_phone" TEXT NOT NULL,
  "delivery_address_line1" TEXT NOT NULL,
  "delivery_address_line2" TEXT,
  "delivery_city" TEXT NOT NULL,
  "delivery_postcode" TEXT NOT NULL,
  "delivery_lat" DOUBLE PRECISION,
  "delivery_lng" DOUBLE PRECISION,
  "notes" TEXT,
  "status" "JobStatus" NOT NULL DEFAULT 'NEW',
  "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
  "assigned_courier_id" UUID REFERENCES "couriers"("id"),
  "created_by_user_id" UUID NOT NULL REFERENCES "users"("id"),
  "assigned_at" TIMESTAMP,
  "out_for_delivery_at" TIMESTAMP,
  "delivered_at" TIMESTAMP,
  "failed_at" TIMESTAMP,
  "cancelled_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "job_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_id" UUID NOT NULL REFERENCES "jobs"("id"),
  "event_type" TEXT NOT NULL,
  "event_payload" JSONB NOT NULL,
  "created_by_user_id" UUID REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "courier_locations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courier_id" UUID NOT NULL REFERENCES "couriers"("id"),
  "job_id" UUID REFERENCES "jobs"("id"),
  "lat" DOUBLE PRECISION NOT NULL,
  "lng" DOUBLE PRECISION NOT NULL,
  "accuracy_meters" DOUBLE PRECISION,
  "heading" DOUBLE PRECISION,
  "speed_kph" DOUBLE PRECISION,
  "captured_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "sms_messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_id" UUID NOT NULL REFERENCES "jobs"("id"),
  "customer_phone" TEXT NOT NULL,
  "template_key" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'TWILIO',
  "provider_message_sid" TEXT,
  "status" TEXT NOT NULL,
  "error_code" TEXT,
  "error_message" TEXT,
  "sent_at" TIMESTAMP,
  "delivered_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "admin_settings" (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updated_by_user_id" UUID REFERENCES "users"("id"),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "sms_templates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_key" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "is_enabled" BOOLEAN NOT NULL DEFAULT true,
  "body" TEXT NOT NULL,
  "updated_by_user_id" UUID REFERENCES "users"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);
