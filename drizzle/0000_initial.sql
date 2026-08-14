CREATE TYPE "public"."availability" AS ENUM('now', 'today', 'this_week', 'weekends', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('proposed', 'accepted', 'rejected', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('new', 'verified', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('received', 'contacted', 'verified', 'connected', 'resolved', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('food', 'water', 'medicine', 'health', 'psychological_support', 'accommodation', 'clothing_supplies', 'transport', 'tools', 'manual_labor', 'profession', 'knowledge', 'information', 'space', 'contacts', 'time', 'money', 'other');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'operator');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('immediate', 'today', 'this_week', 'not_urgent');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"offer_id" uuid NOT NULL,
	"status" "connection_status" DEFAULT 'proposed' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"reasons" text,
	"note" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"previous_status" text,
	"new_status" text,
	"action" text NOT NULL,
	"note" text,
	"actor_id" uuid,
	"actor_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" serial NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"organization" text,
	"types" "resource_type"[] NOT NULL,
	"description" text NOT NULL,
	"department" text NOT NULL,
	"municipality" text NOT NULL,
	"zone" text,
	"radius_km" integer DEFAULT 10 NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"availability" "availability"[] NOT NULL,
	"availability_note" text,
	"status" "offer_status" DEFAULT 'new' NOT NULL,
	"internal_notes" text,
	"accepts_data_use" boolean NOT NULL,
	"accepts_whatsapp" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" serial NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"is_for_someone_else" boolean DEFAULT false NOT NULL,
	"affected_people" integer DEFAULT 1 NOT NULL,
	"has_minors" boolean DEFAULT false NOT NULL,
	"has_elderly" boolean DEFAULT false NOT NULL,
	"types" "resource_type"[] NOT NULL,
	"description" text NOT NULL,
	"urgency" "urgency" NOT NULL,
	"department" text NOT NULL,
	"municipality" text NOT NULL,
	"zone" text,
	"address_reference" text,
	"lat" double precision,
	"lng" double precision,
	"status" "request_status" DEFAULT 'received' NOT NULL,
	"internal_notes" text,
	"discard_reason" text,
	"accepts_data_use" boolean NOT NULL,
	"accepts_whatsapp" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"contacted_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"connected_at" timestamp with time zone,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'operator' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "connections_pair_idx" ON "connections" USING btree ("request_id","offer_id");--> statement-breakpoint
CREATE INDEX "connections_request_idx" ON "connections" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "connections_offer_idx" ON "connections" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "events_entity_idx" ON "events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "events_created_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "offers_status_idx" ON "offers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "offers_municipality_idx" ON "offers" USING btree ("municipality");--> statement-breakpoint
CREATE INDEX "offers_created_idx" ON "offers" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "offers_phone_idx" ON "offers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "requests_municipality_idx" ON "requests" USING btree ("municipality");--> statement-breakpoint
CREATE INDEX "requests_created_idx" ON "requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "requests_phone_idx" ON "requests" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree (lower("email"));