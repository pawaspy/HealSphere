-- name: CreateAppointment :one
INSERT INTO appointments (
    patient_username,
    doctor_username,
    doctor_name,
    appointment_date,
    appointment_time,
    specialty,
    symptoms,
    status,
    is_online
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING *;

-- name: GetAppointmentById :one
SELECT * FROM appointments
WHERE id = $1;

-- name: ListPatientAppointments :many
SELECT * FROM appointments
WHERE patient_username = $1
ORDER BY appointment_date, appointment_time;

-- name: ListDoctorAppointments :many
SELECT * FROM appointments
WHERE doctor_username = $1
ORDER BY appointment_date, appointment_time;

-- name: ListTodayPatientAppointments :many
SELECT * FROM appointments
WHERE patient_username = $1 AND appointment_date = CURRENT_DATE
ORDER BY appointment_time;

-- name: ListTodayDoctorAppointments :many
SELECT * FROM appointments
WHERE doctor_username = $1 AND appointment_date = CURRENT_DATE
ORDER BY appointment_time;

-- name: ListUpcomingPatientAppointments :many
SELECT * FROM appointments
WHERE patient_username = $1 AND appointment_date >= CURRENT_DATE AND status = 'upcoming'
ORDER BY appointment_date, appointment_time;

-- name: ListUpcomingDoctorAppointments :many
SELECT * FROM appointments
WHERE doctor_username = $1 AND appointment_date >= CURRENT_DATE AND status = 'upcoming'
ORDER BY appointment_date, appointment_time;

-- name: ListCompletedPatientAppointments :many
SELECT * FROM appointments
WHERE patient_username = $1 AND status = 'completed'
ORDER BY appointment_date DESC, appointment_time DESC;

-- name: UpdateAppointmentStatus :one
UPDATE appointments
SET
    status = $2,
    updated_at = CURRENT_DATE
WHERE id = $1
RETURNING *;

-- name: UpdateOnlineStatus :one
UPDATE appointments
SET
    is_online = $2,
    updated_at = CURRENT_DATE
WHERE id = $1
RETURNING *;

-- name: AddAppointmentNotes :one
UPDATE appointments
SET
    notes = $2,
    updated_at = CURRENT_DATE
WHERE id = $1
RETURNING *;

-- name: DeleteAppointment :exec
DELETE FROM appointments
WHERE id = $1;
