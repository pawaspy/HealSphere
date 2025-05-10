package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/VitaReach/db/sqlc"
	"github.com/pawaspy/VitaReach/token"
)

// createAppointmentRequest defines the request parameters for creating an appointment
type createAppointmentRequest struct {
	DoctorUsername  string `json:"doctor_username" binding:"required"`
	DoctorName      string `json:"doctor_name" binding:"required"`
	AppointmentDate string `json:"appointment_date" binding:"required"`
	AppointmentTime string `json:"appointment_time" binding:"required"`
	Specialty       string `json:"specialty" binding:"required"`
	Symptoms        string `json:"symptoms" binding:"required"`
}

// appointmentResponse defines the response structure for appointment data
type appointmentResponse struct {
	ID              int64     `json:"id"`
	PatientUsername string    `json:"patient_username"`
	PatientName     string    `json:"patient_name,omitempty"`
	DoctorUsername  string    `json:"doctor_username"`
	DoctorName      string    `json:"doctor_name"`
	AppointmentDate string    `json:"appointment_date"`
	AppointmentTime string    `json:"appointment_time"`
	Specialty       string    `json:"specialty"`
	Symptoms        string    `json:"symptoms"`
	Status          string    `json:"status"`
	Notes           string    `json:"notes,omitempty"`
	IsOnline        bool      `json:"is_online"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// newAppointmentResponse converts a db.Appointment to an appointmentResponse
func newAppointmentResponse(appointment db.Appointment) appointmentResponse {
	// Use YYYY-MM-DD format for date
	dateStr := ""
	if appointment.AppointmentDate.Valid {
		// Format time value extracted from pgtype.Date as YYYY-MM-DD
		dateStr = time.Date(
			int(appointment.AppointmentDate.Time.Year()),
			time.Month(appointment.AppointmentDate.Time.Month()),
			int(appointment.AppointmentDate.Time.Day()),
			0, 0, 0, 0, time.UTC,
		).Format("2006-01-02")
	}

	notes := ""
	if appointment.Notes.Valid {
		notes = appointment.Notes.String
	}

	// Set patient name equal to username if not available otherwise
	patientName := appointment.PatientUsername

	// Default to online appointments
	isOnline := true

	return appointmentResponse{
		ID:              appointment.ID,
		PatientUsername: appointment.PatientUsername,
		PatientName:     patientName,
		DoctorUsername:  appointment.DoctorUsername,
		DoctorName:      appointment.DoctorName,
		AppointmentDate: dateStr,
		AppointmentTime: appointment.AppointmentTime,
		Specialty:       appointment.Specialty,
		Symptoms:        appointment.Symptoms,
		Status:          appointment.Status,
		Notes:           notes,
		IsOnline:        isOnline,
		CreatedAt:       appointment.CreatedAt,
		UpdatedAt:       appointment.UpdatedAt,
	}
}

// createAppointment handles creating a new appointment
func (server *Server) createAppointment(ctx *gin.Context) {
	// Log that we've hit this endpoint
	fmt.Println("====== CREATE APPOINTMENT ENDPOINT CALLED ======")

	var req createAppointmentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":         "Invalid request format",
			"details":       err.Error(),
			"received_body": ctx.Request.Body,
		})
		return
	}

	// Log request data for debugging
	fmt.Printf("Received appointment request: %+v\n", req)

	// Get authenticated user from the middleware
	authPayload, ok := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if !ok {
		fmt.Println("Error: No auth payload found in context")
		// Check for custom headers as fallback
		username := ctx.GetHeader("X-Username")
		role := ctx.GetHeader("X-Role")
		if username != "" && role == "patient" {
			fmt.Printf("Using X-Username header as fallback: %s\n", username)
			// Create a fallback payload
			authPayload = &token.Payload{
				Username: username,
				Role:     role,
			}
		} else {
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"error":       "Authentication required",
				"token_found": ctx.GetHeader("Authorization") != "",
				"headers":     ctx.Request.Header,
			})
			return
		}
	}

	fmt.Printf("Auth payload: %+v\n", authPayload)

	// Verify user is a patient
	if authPayload.Role != "patient" {
		fmt.Printf("Error: User role is %s, not patient\n", authPayload.Role)
		ctx.JSON(http.StatusForbidden, gin.H{
			"error":     "Only patients can create appointments",
			"user_role": authPayload.Role,
		})
		return
	}

	// Parse the appointment date
	appointmentDate, err := time.Parse("2006-01-02", req.AppointmentDate)
	if err != nil {
		fmt.Printf("Error parsing date: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":    "Invalid date format",
			"details":  "Use YYYY-MM-DD format",
			"received": req.AppointmentDate,
		})
		return
	}

	// Check if doctor exists
	_, err = server.store.GetDoctorByUsername(ctx, req.DoctorUsername)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			fmt.Printf("Error: Doctor not found: %s\n", req.DoctorUsername)
			ctx.JSON(http.StatusNotFound, gin.H{
				"error":    "Doctor not found",
				"username": req.DoctorUsername,
			})
			return
		}
		fmt.Printf("Database error: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error while checking doctor",
			"details": err.Error(),
		})
		return
	}

	// Create pgtype.Date
	pgtypeDate := pgtype.Date{
		Time:  appointmentDate,
		Valid: true,
	}

	// Create the appointment
	arg := db.CreateAppointmentParams{
		PatientUsername: authPayload.Username,
		DoctorUsername:  req.DoctorUsername,
		DoctorName:      req.DoctorName,
		AppointmentDate: pgtypeDate,
		AppointmentTime: req.AppointmentTime,
		Specialty:       req.Specialty,
		Symptoms:        req.Symptoms,
		Status:          "upcoming",
	}

	// Log the parameters for debugging
	fmt.Printf("Creating appointment with params: %+v\n", arg)

	appointment, err := server.store.CreateAppointment(ctx, arg)
	if err != nil {
		fmt.Printf("Error creating appointment: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create appointment",
			"details": err.Error(),
		})
		return
	}

	fmt.Println("Appointment created successfully")
	response := newAppointmentResponse(appointment)
	ctx.JSON(http.StatusCreated, response)
}

// getAppointment retrieves a specific appointment by ID
func (server *Server) getAppointment(ctx *gin.Context) {
	var req struct {
		ID int64 `uri:"id" binding:"required,min=1"`
	}

	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get the appointment
	appointment, err := server.store.GetAppointmentById(ctx, req.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check if the user is authorized to view this appointment
	if appointment.PatientUsername != authPayload.Username &&
		appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized to access this appointment")))
		return
	}

	ctx.JSON(http.StatusOK, newAppointmentResponse(appointment))
}

// listPatientAppointments retrieves all appointments for the authenticated patient
func (server *Server) listPatientAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a patient
	if authPayload.Role != "patient" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only patients can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListPatientAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}

// listDoctorAppointments retrieves all appointments for the authenticated doctor
func (server *Server) listDoctorAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a doctor
	if authPayload.Role != "doctor" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only doctors can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListDoctorAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}

// listTodayPatientAppointments retrieves today's appointments for the authenticated patient
func (server *Server) listTodayPatientAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a patient
	if authPayload.Role != "patient" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only patients can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListTodayPatientAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}

// listUpcomingPatientAppointments retrieves upcoming appointments for the authenticated patient
func (server *Server) listUpcomingPatientAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a patient
	if authPayload.Role != "patient" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only patients can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListUpcomingPatientAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}

// listCompletedPatientAppointments retrieves completed appointments for the authenticated patient
func (server *Server) listCompletedPatientAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a patient
	if authPayload.Role != "patient" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only patients can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListCompletedPatientAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}

// updateAppointmentStatus updates the status of an appointment
type updateAppointmentStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=upcoming completed cancelled"`
}

func (server *Server) updateAppointmentStatus(ctx *gin.Context) {
	var req struct {
		ID int64 `uri:"id" binding:"required,min=1"`
	}

	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var statusReq updateAppointmentStatusRequest
	if err := ctx.ShouldBindJSON(&statusReq); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get the appointment to check access rights
	appointment, err := server.store.GetAppointmentById(ctx, req.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Only the doctor or patient involved can update status
	if appointment.PatientUsername != authPayload.Username &&
		appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized to update this appointment")))
		return
	}

	// Update the appointment status
	arg := db.UpdateAppointmentStatusParams{
		ID:     req.ID,
		Status: statusReq.Status,
	}

	updatedAppointment, err := server.store.UpdateAppointmentStatus(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newAppointmentResponse(updatedAppointment))
}

// addAppointmentNotes adds or updates notes for an appointment
type addAppointmentNotesRequest struct {
	Notes string `json:"notes" binding:"required"`
}

func (server *Server) addAppointmentNotes(ctx *gin.Context) {
	var req struct {
		ID int64 `uri:"id" binding:"required,min=1"`
	}

	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var notesReq addAppointmentNotesRequest
	if err := ctx.ShouldBindJSON(&notesReq); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get the appointment to check access rights
	appointment, err := server.store.GetAppointmentById(ctx, req.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Only the doctor assigned to the appointment can add notes
	if appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("only the assigned doctor can add notes")))
		return
	}

	// Add notes to the appointment
	arg := db.AddAppointmentNotesParams{
		ID:    req.ID,
		Notes: pgtype.Text{String: notesReq.Notes, Valid: true},
	}

	updatedAppointment, err := server.store.AddAppointmentNotes(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newAppointmentResponse(updatedAppointment))
}

// deleteAppointment deletes an appointment
func (server *Server) deleteAppointment(ctx *gin.Context) {
	var req struct {
		ID int64 `uri:"id" binding:"required,min=1"`
	}

	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get the appointment to check access rights
	appointment, err := server.store.GetAppointmentById(ctx, req.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Only the patient who created the appointment can delete it
	if appointment.PatientUsername != authPayload.Username {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("only the patient can cancel their appointment")))
		return
	}

	// Delete the appointment
	err = server.store.DeleteAppointment(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Appointment cancelled successfully"})
}

// listTodayDoctorAppointments retrieves today's appointments for the authenticated doctor
func (server *Server) listTodayDoctorAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a doctor
	if authPayload.Role != "doctor" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only doctors can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListTodayDoctorAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}

// listUpcomingDoctorAppointments retrieves upcoming appointments for the authenticated doctor
func (server *Server) listUpcomingDoctorAppointments(ctx *gin.Context) {
	// Get authenticated user from the middleware
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Verify that the user is a doctor
	if authPayload.Role != "doctor" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only doctors can access this endpoint")))
		return
	}

	// Get the appointments
	appointments, err := server.store.ListUpcomingDoctorAppointments(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]appointmentResponse, len(appointments))
	for i, appointment := range appointments {
		response[i] = newAppointmentResponse(appointment)
	}

	ctx.JSON(http.StatusOK, response)
}
