CREATE TABLE IF NOT EXISTS "appointments" (
  "id" bigserial PRIMARY KEY,
  "patient_username" varchar NOT NULL,
  "doctor_username" varchar NOT NULL,
  "doctor_name" varchar NOT NULL,
  "appointment_date" date NOT NULL,
  "appointment_time" varchar NOT NULL, 
  "specialty" varchar NOT NULL,
  "symptoms" text NOT NULL,
  "status" varchar NOT NULL DEFAULT 'upcoming',
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  FOREIGN KEY (patient_username) REFERENCES patients(username) ON DELETE CASCADE,
  FOREIGN KEY (doctor_username) REFERENCES doctors(username) ON DELETE CASCADE
);

CREATE INDEX ON "appointments" ("patient_username");
CREATE INDEX ON "appointments" ("doctor_username");
CREATE INDEX ON "appointments" ("status");
CREATE INDEX ON "appointments" ("appointment_date");
