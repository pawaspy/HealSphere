package api

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/VitaReach/db/sqlc"
	"github.com/pawaspy/VitaReach/token"
	"github.com/pawaspy/VitaReach/util"
)

type createPatientRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Age      int32  `json:"age" binding:"required,gte=0"`
	Gender   string `json:"gender" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type patientResponse struct {
	Username  string             `json:"username"`
	Name      string             `json:"name"`
	Email     string             `json:"email"`
	Phone     string             `json:"phone"`
	Age       int32              `json:"age"`
	Gender    string             `json:"gender"`
	CreatedAt pgtype.Timestamptz `json:"created_at"`
	UpdatedAt pgtype.Timestamptz `json:"updated_at"`
}

type loginPatientRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginPatientResponse struct {
	AccessToken string          `json:"access_token"`
	Patient     patientResponse `json:"patient"`
}

type updatePatientRequest struct {
	Name   string `json:"name"`
	Email  string `json:"email" binding:"omitempty,email"`
	Phone  string `json:"phone"`
	Age    int32  `json:"age" binding:"omitempty,gte=0"`
	Gender string `json:"gender"`
}

type updatePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required,min=6"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

func newPatientResponse(patient db.Patient) patientResponse {
	return patientResponse{
		Username:  patient.Username,
		Name:      patient.Name,
		Email:     patient.Email,
		Phone:     patient.Phone,
		Age:       patient.Age,
		Gender:    patient.Gender,
		CreatedAt: patient.CreatedAt,
		UpdatedAt: patient.UpdatedAt,
	}
}

// createPatient handles the patient signup
func (server *Server) createPatient(ctx *gin.Context) {
	var req createPatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if username exists
	usernameExists, err := server.store.CheckPatientUsernameExists(ctx, req.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	if usernameExists {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("username already exists")))
		return
	}

	// Check if email exists
	emailExists, err := server.store.CheckPatientEmailExists(ctx, req.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	if emailExists {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("email already exists")))
		return
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to hash password")))
		return
	}

	arg := db.CreatePatientParams{
		Username:     req.Username,
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Age:          req.Age,
		Gender:       req.Gender,
		Phone:        req.Phone,
	}

	patient, err := server.store.CreatePatient(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	resp := newPatientResponse(patient)
	ctx.JSON(http.StatusCreated, resp)
}

// loginPatient handles patient authentication
func (server *Server) loginPatient(ctx *gin.Context) {
	var req loginPatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	patient, err := server.store.GetPatientByUsername(ctx, req.Username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(errors.New("invalid username or password")))
		return
	}

	err = util.CheckPassword(req.Password, patient.PasswordHash)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("invalid username or password")))
		return
	}

	accessToken, _, err := server.tokenMaker.CreateToken(
		patient.Username,
		util.PatientRole,
		server.config.TokenDuration,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := loginPatientResponse{
		AccessToken: accessToken,
		Patient:     newPatientResponse(patient),
	}
	ctx.JSON(http.StatusOK, rsp)
}

// getPatientProfile retrieves the authenticated patient's profile
func (server *Server) getPatientProfile(ctx *gin.Context) {
	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	patient, err := server.store.GetPatientByUsername(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newPatientResponse(patient))
}

// updatePatientProfile updates the patient's profile information
func (server *Server) updatePatientProfile(ctx *gin.Context) {
	var req updatePatientRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Check if email is being changed and if it already exists
	if req.Email != "" {
		currentPatient, err := server.store.GetPatientByUsername(ctx, authPayload.Username)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		if currentPatient.Email != req.Email {
			emailExists, err := server.store.CheckPatientEmailExists(ctx, req.Email)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}
			if emailExists {
				ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("email already in use")))
				return
			}
		}
	}

	arg := db.UpdatePatientProfileParams{
		Username: authPayload.Username,
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Age:      req.Age,
		Gender:   req.Gender,
	}

	patient, err := server.store.UpdatePatientProfile(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newPatientResponse(patient))
}

// updatePatientPassword changes the patient's password
func (server *Server) updatePatientPassword(ctx *gin.Context) {
	var req updatePasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get the current patient to verify the current password
	patient, err := server.store.GetPatientByUsername(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Verify the current password
	err = util.CheckPassword(req.CurrentPassword, patient.PasswordHash)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("incorrect current password")))
		return
	}

	// Hash the new password
	hashedPassword, err := util.HashPassword(req.NewPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to hash password")))
		return
	}

	// Update the password
	arg := db.UpdatePatientPasswordParams{
		Username:     authPayload.Username,
		PasswordHash: hashedPassword,
	}
	err = server.store.UpdatePatientPassword(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// checkUsernameExists checks if a username is available
func (server *Server) checkUsernameExists(ctx *gin.Context) {
	username := ctx.Param("username")

	exists, err := server.store.CheckPatientUsernameExists(ctx, username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"exists": exists,
	})
}

// checkEmailExists checks if an email is available
func (server *Server) checkEmailExists(ctx *gin.Context) {
	email := ctx.Param("email")

	exists, err := server.store.CheckPatientEmailExists(ctx, email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"exists": exists,
	})
}

// deletePatient deletes the authenticated patient's account
func (server *Server) deletePatient(ctx *gin.Context) {
	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Delete the patient
	err := server.store.DeletePatient(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
}
