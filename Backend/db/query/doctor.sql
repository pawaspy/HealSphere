-- name: CreateDoctor :one
INSERT INTO doctors (
    username,
    name,
    email,
    password_hash,
    phone,
    gender,
    specialization,
    qualification,
    experience
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING *;

-- name: GetDoctorByUsername :one
SELECT * FROM doctors
WHERE username = $1;

-- name: GetDoctorByEmail :one
SELECT * FROM doctors
WHERE email = $1;

-- name: CheckDoctorUsernameExists :one
SELECT EXISTS(SELECT 1 FROM doctors WHERE username = $1) AS exists;

-- name: CheckDoctorEmailExists :one
SELECT EXISTS(SELECT 1 FROM doctors WHERE email = $1) AS exists;

-- name: UpdateDoctorProfile :one
UPDATE doctors
SET
    name = $2,
    email = $3,
    phone = $4,
    gender = $5,
    specialization = $6,
    qualification = $7,
    experience = $8,
    updated_at = CURRENT_TIMESTAMP
WHERE username = $1
RETURNING *;

-- name: UpdateDoctorPassword :exec
UPDATE doctors
SET
    password_hash = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE username = $1;

-- name: DeleteDoctor :exec
DELETE FROM doctors
WHERE username = $1;

-- name: ListDoctors :many
SELECT * FROM doctors
ORDER BY created_at
LIMIT $1 OFFSET $2;

-- name: ListDoctorsBySpecialization :many
SELECT * FROM doctors
WHERE specialization = $1
ORDER BY created_at
LIMIT $2 OFFSET $3;
