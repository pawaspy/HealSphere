-- Drop the index first
DROP INDEX IF EXISTS "prescriptions_appointment_id_idx";

-- Drop the prescriptions table
DROP TABLE IF EXISTS "prescriptions";

-- Remove the is_online column from appointments
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "is_online";
