-- name: CreatePatient :one
INSERT INTO patients (
    username,
    name,
    email,
    password_hash,
    phone,
    age,
    gender
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetPatientByUsername :one
SELECT * FROM patients
WHERE username = $1;

-- name: GetPatientByEmail :one
SELECT * FROM patients
WHERE email = $1;

-- name: CheckPatientUsernameExists :one
SELECT EXISTS(SELECT 1 FROM patients WHERE username = $1) AS exists;

-- name: CheckPatientEmailExists :one
SELECT EXISTS(SELECT 1 FROM patients WHERE email = $1) AS exists;

-- name: UpdatePatientProfile :one
UPDATE patients
SET
    name = $2,
    email = $3,
    phone = $4,
    age = $5,
    gender = $6,
    updated_at = CURRENT_TIMESTAMP
WHERE username = $1
RETURNING *;

-- name: UpdatePatientPassword :exec
UPDATE patients
SET
    password_hash = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE username = $1;

-- name: DeletePatient :exec
DELETE FROM patients
WHERE username = $1;

-- name: ListPatients :many
SELECT * FROM patients
ORDER BY created_at
LIMIT $1 OFFSET $2;
