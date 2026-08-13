CREATE TYPE "public"."disponibilidad" AS ENUM('ahora', 'hoy', 'esta_semana', 'fines_de_semana', 'flexible');--> statement-breakpoint
CREATE TYPE "public"."estado_conexion" AS ENUM('propuesta', 'aceptada', 'rechazada', 'confirmada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."estado_oferta" AS ENUM('nueva', 'verificada', 'pausada', 'archivada');--> statement-breakpoint
CREATE TYPE "public"."estado_solicitud" AS ENUM('recibida', 'contactada', 'verificada', 'conectada', 'resuelta', 'descartada');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('admin', 'operador');--> statement-breakpoint
CREATE TYPE "public"."tipo_recurso" AS ENUM('alimentos', 'agua', 'medicamentos', 'salud', 'apoyo_psicologico', 'alojamiento', 'ropa_enseres', 'transporte', 'herramientas', 'trabajo_fisico', 'profesion', 'conocimientos', 'informacion', 'espacio', 'contactos', 'tiempo', 'dinero', 'otro');--> statement-breakpoint
CREATE TYPE "public"."urgencia" AS ENUM('inmediata', 'hoy', 'esta_semana', 'sin_prisa');--> statement-breakpoint
CREATE TABLE "conexiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solicitud_id" uuid NOT NULL,
	"oferta_id" uuid NOT NULL,
	"estado" "estado_conexion" DEFAULT 'propuesta' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"razones" text,
	"nota" text,
	"creado_por" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" uuid NOT NULL,
	"estado_anterior" text,
	"estado_nuevo" text,
	"accion" text NOT NULL,
	"nota" text,
	"actor_id" uuid,
	"actor_nombre" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ofertas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" serial NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"email" text,
	"organizacion" text,
	"tipos" "tipo_recurso"[] NOT NULL,
	"descripcion" text NOT NULL,
	"departamento" text NOT NULL,
	"municipio" text NOT NULL,
	"zona" text,
	"radio_km" integer DEFAULT 10 NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"disponibilidad" "disponibilidad"[] NOT NULL,
	"nota_disponibilidad" text,
	"estado" "estado_oferta" DEFAULT 'nueva' NOT NULL,
	"notas_internas" text,
	"acepta_datos" boolean NOT NULL,
	"acepta_whatsapp" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"verificado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" serial NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"es_para_otra_persona" boolean DEFAULT false NOT NULL,
	"personas_afectadas" integer DEFAULT 1 NOT NULL,
	"tiene_menores" boolean DEFAULT false NOT NULL,
	"tiene_adultos_mayores" boolean DEFAULT false NOT NULL,
	"tipos" "tipo_recurso"[] NOT NULL,
	"descripcion" text NOT NULL,
	"urgencia" "urgencia" NOT NULL,
	"departamento" text NOT NULL,
	"municipio" text NOT NULL,
	"zona" text,
	"referencia_direccion" text,
	"lat" double precision,
	"lng" double precision,
	"estado" "estado_solicitud" DEFAULT 'recibida' NOT NULL,
	"notas_internas" text,
	"motivo_descarte" text,
	"acepta_datos" boolean NOT NULL,
	"acepta_whatsapp" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"contactado_en" timestamp with time zone,
	"verificado_en" timestamp with time zone,
	"conectado_en" timestamp with time zone,
	"resuelto_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"nombre" text NOT NULL,
	"password_hash" text NOT NULL,
	"rol" "rol" DEFAULT 'operador' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"ultimo_acceso_en" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "conexiones" ADD CONSTRAINT "conexiones_solicitud_id_solicitudes_id_fk" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conexiones" ADD CONSTRAINT "conexiones_oferta_id_ofertas_id_fk" FOREIGN KEY ("oferta_id") REFERENCES "public"."ofertas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conexiones" ADD CONSTRAINT "conexiones_creado_por_usuarios_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_actor_id_usuarios_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "conexiones_par_idx" ON "conexiones" USING btree ("solicitud_id","oferta_id");--> statement-breakpoint
CREATE INDEX "conexiones_solicitud_idx" ON "conexiones" USING btree ("solicitud_id");--> statement-breakpoint
CREATE INDEX "conexiones_oferta_idx" ON "conexiones" USING btree ("oferta_id");--> statement-breakpoint
CREATE INDEX "eventos_entidad_idx" ON "eventos" USING btree ("entidad","entidad_id");--> statement-breakpoint
CREATE INDEX "eventos_creado_idx" ON "eventos" USING btree ("creado_en");--> statement-breakpoint
CREATE INDEX "ofertas_estado_idx" ON "ofertas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "ofertas_municipio_idx" ON "ofertas" USING btree ("municipio");--> statement-breakpoint
CREATE INDEX "ofertas_creado_idx" ON "ofertas" USING btree ("creado_en");--> statement-breakpoint
CREATE UNIQUE INDEX "ofertas_telefono_idx" ON "ofertas" USING btree ("telefono");--> statement-breakpoint
CREATE INDEX "solicitudes_estado_idx" ON "solicitudes" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "solicitudes_municipio_idx" ON "solicitudes" USING btree ("municipio");--> statement-breakpoint
CREATE INDEX "solicitudes_creado_idx" ON "solicitudes" USING btree ("creado_en");--> statement-breakpoint
CREATE INDEX "solicitudes_telefono_idx" ON "solicitudes" USING btree ("telefono");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree (lower("email"));