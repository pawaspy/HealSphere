CREATE TABLE IF NOT EXISTS "prescriptions" (
  "id" bigserial PRIMARY KEY,
  "appointment_id" bigint NOT NULL,
  "prescription_text" text NOT NULL,
  "consultation_notes" text,
  "feedback_rating" integer,
  "feedback_comment" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Add new column to appointments table for indicating if call is active
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "is_online" boolean DEFAULT false;

-- Add index for faster lookups
CREATE INDEX ON "prescriptions" ("appointment_id");
