package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/VitaReach/db/sqlc"
	"github.com/pawaspy/VitaReach/token"
)

type createPrescriptionRequest struct {
	AppointmentID     int64  `json:"appointment_id" binding:"required"`
	PrescriptionText  string `json:"prescription_text" binding:"required"`
	ConsultationNotes string `json:"consultation_notes"`
}

type prescriptionResponse struct {
	ID                int64     `json:"id"`
	AppointmentID     int64     `json:"appointment_id"`
	PrescriptionText  string    `json:"prescription_text"`
	ConsultationNotes string    `json:"consultation_notes"`
	FeedbackRating    int32     `json:"feedback_rating,omitempty"`
	FeedbackComment   string    `json:"feedback_comment,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type updatePrescriptionRequest struct {
	PrescriptionText  string `json:"prescription_text" binding:"required"`
	ConsultationNotes string `json:"consultation_notes"`
}

type updateFeedbackRequest struct {
	FeedbackRating  int32  `json:"feedback_rating" binding:"required,min=1,max=5"`
	FeedbackComment string `json:"feedback_comment"`
}

// createPrescription creates a new prescription after a consultation
func (server *Server) createPrescription(ctx *gin.Context) {
	var req createPrescriptionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if authPayload.Role != "doctor" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only doctors can create prescriptions")))
		return
	}

	// Check if the appointment exists and belongs to this doctor
	appointment, err := server.store.GetAppointmentById(ctx, req.AppointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Verify the doctor is authorized to create a prescription for this appointment
	if appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to create prescription for this appointment")))
		return
	}

	// Create the prescription
	prescription, err := server.store.CreatePrescription(ctx, db.CreatePrescriptionParams{
		AppointmentID:    req.AppointmentID,
		PrescriptionText: req.PrescriptionText,
		ConsultationNotes: pgtype.Text{
			String: req.ConsultationNotes,
			Valid:  req.ConsultationNotes != "",
		},
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Also update the appointment status to completed
	_, err = server.store.UpdateAppointmentStatus(ctx, db.UpdateAppointmentStatusParams{
		ID:     req.AppointmentID,
		Status: "completed",
	})

	if err != nil {
		// Log the error but still return the prescription
		fmt.Printf("Failed to update appointment status: %v\n", err)
	}

	// Convert to response format
	response := prescriptionResponse{
		ID:                prescription.ID,
		AppointmentID:     prescription.AppointmentID,
		PrescriptionText:  prescription.PrescriptionText,
		ConsultationNotes: prescription.ConsultationNotes.String,
		CreatedAt:         prescription.CreatedAt,
		UpdatedAt:         prescription.UpdatedAt,
	}

	ctx.JSON(http.StatusCreated, response)
}

// getPrescription gets a prescription by appointment ID
func (server *Server) getPrescription(ctx *gin.Context) {
	appointmentIDStr := ctx.Param("appointment_id")
	appointmentID, err := strconv.ParseInt(appointmentIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid appointment ID")))
		return
	}

	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Check if the appointment exists and the user is authorized to view it
	appointment, err := server.store.GetAppointmentById(ctx, appointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check if the user is authorized to view this prescription
	if authPayload.Role == "doctor" && appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to view this prescription")))
		return
	} else if authPayload.Role == "patient" && appointment.PatientUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to view this prescription")))
		return
	}

	// Get the prescription
	prescription, err := server.store.GetPrescription(ctx, appointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("prescription not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Convert to response format
	response := prescriptionResponse{
		ID:                prescription.ID,
		AppointmentID:     prescription.AppointmentID,
		PrescriptionText:  prescription.PrescriptionText,
		ConsultationNotes: prescription.ConsultationNotes.String,
		FeedbackRating:    prescription.FeedbackRating.Int32,
		FeedbackComment:   prescription.FeedbackComment.String,
		CreatedAt:         prescription.CreatedAt,
		UpdatedAt:         prescription.UpdatedAt,
	}

	ctx.JSON(http.StatusOK, response)
}

// updatePrescription updates an existing prescription
func (server *Server) updatePrescription(ctx *gin.Context) {
	appointmentIDStr := ctx.Param("appointment_id")
	appointmentID, err := strconv.ParseInt(appointmentIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid appointment ID")))
		return
	}

	var req updatePrescriptionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if authPayload.Role != "doctor" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only doctors can update prescriptions")))
		return
	}

	// Check if the appointment exists and belongs to this doctor
	appointment, err := server.store.GetAppointmentById(ctx, appointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Verify the doctor is authorized to update this prescription
	if appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to update prescription for this appointment")))
		return
	}

	// Update the prescription
	updatedPrescription, err := server.store.UpdatePrescription(ctx, db.UpdatePrescriptionParams{
		AppointmentID:    appointmentID,
		PrescriptionText: req.PrescriptionText,
		ConsultationNotes: pgtype.Text{
			String: req.ConsultationNotes,
			Valid:  req.ConsultationNotes != "",
		},
	})

	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("prescription not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Convert to response format
	response := prescriptionResponse{
		ID:                updatedPrescription.ID,
		AppointmentID:     updatedPrescription.AppointmentID,
		PrescriptionText:  updatedPrescription.PrescriptionText,
		ConsultationNotes: updatedPrescription.ConsultationNotes.String,
		FeedbackRating:    updatedPrescription.FeedbackRating.Int32,
		FeedbackComment:   updatedPrescription.FeedbackComment.String,
		CreatedAt:         updatedPrescription.CreatedAt,
		UpdatedAt:         updatedPrescription.UpdatedAt,
	}

	ctx.JSON(http.StatusOK, response)
}

// submitFeedback submits feedback for a prescription
func (server *Server) submitFeedback(ctx *gin.Context) {
	appointmentIDStr := ctx.Param("appointment_id")
	appointmentID, err := strconv.ParseInt(appointmentIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid appointment ID")))
		return
	}

	var req updateFeedbackRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if authPayload.Role != "patient" {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("only patients can submit feedback")))
		return
	}

	// Check if the appointment exists and belongs to this patient
	appointment, err := server.store.GetAppointmentById(ctx, appointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Verify the patient is authorized to submit feedback for this appointment
	if appointment.PatientUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to submit feedback for this appointment")))
		return
	}

	// Update the prescription with feedback
	updatedPrescription, err := server.store.UpdateFeedback(ctx, db.UpdateFeedbackParams{
		AppointmentID: appointmentID,
		FeedbackRating: pgtype.Int4{
			Int32: req.FeedbackRating,
			Valid: true,
		},
		FeedbackComment: pgtype.Text{
			String: req.FeedbackComment,
			Valid:  req.FeedbackComment != "",
		},
	})

	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("prescription not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Convert to response format
	response := prescriptionResponse{
		ID:                updatedPrescription.ID,
		AppointmentID:     updatedPrescription.AppointmentID,
		PrescriptionText:  updatedPrescription.PrescriptionText,
		ConsultationNotes: updatedPrescription.ConsultationNotes.String,
		FeedbackRating:    updatedPrescription.FeedbackRating.Int32,
		FeedbackComment:   updatedPrescription.FeedbackComment.String,
		CreatedAt:         updatedPrescription.CreatedAt,
		UpdatedAt:         updatedPrescription.UpdatedAt,
	}

	ctx.JSON(http.StatusOK, response)
}

// checkPrescriptionExists checks if a prescription exists for an appointment
func (server *Server) checkPrescriptionExists(ctx *gin.Context) {
	appointmentIDStr := ctx.Param("appointment_id")
	appointmentID, err := strconv.ParseInt(appointmentIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid appointment ID")))
		return
	}

	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Check if the appointment exists and the user is authorized to view it
	appointment, err := server.store.GetAppointmentById(ctx, appointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("appointment not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check if the user is authorized to view this prescription
	if authPayload.Role == "doctor" && appointment.DoctorUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to view this prescription")))
		return
	} else if authPayload.Role == "patient" && appointment.PatientUsername != authPayload.Username {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("not authorized to view this prescription")))
		return
	}

	// Check if the prescription exists
	_, err = server.store.GetPrescription(ctx, appointmentID)
	if err != nil {
		if err == sql.ErrNoRows {
			// Return 404 with a clear message that prescription doesn't exist
			ctx.JSON(http.StatusNotFound, gin.H{"exists": false, "message": "prescription not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Prescription exists
	ctx.JSON(http.StatusOK, gin.H{"exists": true})
}
