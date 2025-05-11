-- name: CreatePrescription :one
INSERT INTO prescriptions (
  appointment_id,
  prescription_text,
  consultation_notes
) VALUES (
  $1, $2, $3
) RETURNING *;

-- name: GetPrescription :one
SELECT * FROM prescriptions
WHERE appointment_id = $1 LIMIT 1;

-- name: UpdatePrescription :one
UPDATE prescriptions
SET prescription_text = $2,
    consultation_notes = $3,
    updated_at = now()
WHERE appointment_id = $1
RETURNING *;

-- name: UpdateFeedback :one
UPDATE prescriptions
SET feedback_rating = $2,
    feedback_comment = $3,
    updated_at = now()
WHERE appointment_id = $1
RETURNING *;

-- name: DeletePrescription :exec
DELETE FROM prescriptions
WHERE appointment_id = $1;
