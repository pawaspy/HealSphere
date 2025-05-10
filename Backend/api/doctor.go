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

type createDoctorRequest struct {
	Username       string `json:"username" binding:"required,alphanum"`
	Name           string `json:"name" binding:"required"`
	Email          string `json:"email" binding:"required,email"`
	Phone          string `json:"phone" binding:"required"`
	Gender         string `json:"gender" binding:"required"`
	Specialization string `json:"specialization" binding:"required"`
	Qualification  string `json:"qualification" binding:"required"`
	Experience     int32  `json:"experience" binding:"required,gte=0"`
	Password       string `json:"password" binding:"required,min=6"`
}

type doctorResponse struct {
	Username       string             `json:"username"`
	Name           string             `json:"name"`
	Email          string             `json:"email"`
	Phone          string             `json:"phone"`
	Gender         string             `json:"gender"`
	Specialization string             `json:"specialization"`
	Qualification  string             `json:"qualification"`
	Experience     int32              `json:"experience"`
	CreatedAt      pgtype.Timestamptz `json:"created_at"`
	UpdatedAt      pgtype.Timestamptz `json:"updated_at"`
}

type loginDoctorRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginDoctorResponse struct {
	AccessToken string         `json:"access_token"`
	Doctor      doctorResponse `json:"doctor"`
}

type updateDoctorRequest struct {
	Name           string `json:"name"`
	Email          string `json:"email" binding:"omitempty,email"`
	Phone          string `json:"phone"`
	Gender         string `json:"gender"`
	Specialization string `json:"specialization"`
	Qualification  string `json:"qualification"`
	Experience     int32  `json:"experience" binding:"omitempty,gte=0"`
}

type updateDoctorPasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required,min=6"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

type listDoctorsRequest struct {
	PageID    int32  `form:"page_id" binding:"required,min=1"`
	PageSize  int32  `form:"page_size" binding:"required,min=5,max=20"`
	Specialty string `form:"specialty"`
}

func newDoctorResponse(doctor db.Doctor) doctorResponse {
	return doctorResponse{
		Username:       doctor.Username,
		Name:           doctor.Name,
		Email:          doctor.Email,
		Phone:          doctor.Phone,
		Gender:         doctor.Gender,
		Specialization: doctor.Specialization,
		Qualification:  doctor.Qualification,
		Experience:     doctor.Experience,
		CreatedAt:      doctor.CreatedAt,
		UpdatedAt:      doctor.UpdatedAt,
	}
}

// createDoctor handles the doctor signup
func (server *Server) createDoctor(ctx *gin.Context) {
	var req createDoctorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if username exists
	usernameExists, err := server.store.CheckDoctorUsernameExists(ctx, req.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	if usernameExists {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("username already exists")))
		return
	}

	// Check if email exists
	emailExists, err := server.store.CheckDoctorEmailExists(ctx, req.Email)
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

	arg := db.CreateDoctorParams{
		Username:       req.Username,
		Name:           req.Name,
		Email:          req.Email,
		PasswordHash:   hashedPassword,
		Phone:          req.Phone,
		Gender:         req.Gender,
		Specialization: req.Specialization,
		Qualification:  req.Qualification,
		Experience:     req.Experience,
	}

	doctor, err := server.store.CreateDoctor(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	resp := newDoctorResponse(doctor)
	ctx.JSON(http.StatusCreated, resp)
}

// loginDoctor handles doctor authentication
func (server *Server) loginDoctor(ctx *gin.Context) {
	var req loginDoctorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	doctor, err := server.store.GetDoctorByUsername(ctx, req.Username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(errors.New("invalid username or password")))
		return
	}

	err = util.CheckPassword(req.Password, doctor.PasswordHash)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(errors.New("invalid username or password")))
		return
	}

	accessToken, _, err := server.tokenMaker.CreateToken(
		doctor.Username,
		util.DoctorRole,
		server.config.TokenDuration,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := loginDoctorResponse{
		AccessToken: accessToken,
		Doctor:      newDoctorResponse(doctor),
	}
	ctx.JSON(http.StatusOK, rsp)
}

// getDoctorProfile retrieves the authenticated doctor's profile
func (server *Server) getDoctorProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	doctor, err := server.store.GetDoctorByUsername(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newDoctorResponse(doctor))
}

// updateDoctorProfile updates the doctor's profile information
func (server *Server) updateDoctorProfile(ctx *gin.Context) {
	var req updateDoctorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Check if email is being changed and if it already exists
	if req.Email != "" {
		currentDoctor, err := server.store.GetDoctorByUsername(ctx, authPayload.Username)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		if currentDoctor.Email != req.Email {
			emailExists, err := server.store.CheckDoctorEmailExists(ctx, req.Email)
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

	arg := db.UpdateDoctorProfileParams{
		Username:       authPayload.Username,
		Name:           req.Name,
		Email:          req.Email,
		Phone:          req.Phone,
		Gender:         req.Gender,
		Specialization: req.Specialization,
		Qualification:  req.Qualification,
		Experience:     req.Experience,
	}

	doctor, err := server.store.UpdateDoctorProfile(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newDoctorResponse(doctor))
}

// updateDoctorPassword changes the doctor's password
func (server *Server) updateDoctorPassword(ctx *gin.Context) {
	var req updateDoctorPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get the current doctor to verify the current password
	doctor, err := server.store.GetDoctorByUsername(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Verify the current password
	err = util.CheckPassword(req.CurrentPassword, doctor.PasswordHash)
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
	arg := db.UpdateDoctorPasswordParams{
		Username:     authPayload.Username,
		PasswordHash: hashedPassword,
	}
	err = server.store.UpdateDoctorPassword(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// deleteDoctor deletes the authenticated doctor's account
func (server *Server) deleteDoctor(ctx *gin.Context) {
	// Get the authenticated user
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Delete the doctor
	err := server.store.DeleteDoctor(ctx, authPayload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
}

// listDoctors gets a list of doctors with optional specialization filter
func (server *Server) listDoctors(ctx *gin.Context) {
	var req listDoctorsRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		// If there are binding errors, use default values
		req.PageID = 1
		req.PageSize = 10
	}

	var doctors []db.Doctor
	var err error

	if req.Specialty != "" {
		// List doctors by specialization
		arg := db.ListDoctorsBySpecializationParams{
			Specialization: req.Specialty,
			Limit:          req.PageSize,
			Offset:         (req.PageID - 1) * req.PageSize,
		}
		doctors, err = server.store.ListDoctorsBySpecialization(ctx, arg)
	} else {
		// List all doctors
		arg := db.ListDoctorsParams{
			Limit:  req.PageSize,
			Offset: (req.PageID - 1) * req.PageSize,
		}
		doctors, err = server.store.ListDoctors(ctx, arg)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Convert doctors to response objects
	response := make([]doctorResponse, len(doctors))
	for i, doctor := range doctors {
		response[i] = newDoctorResponse(doctor)
	}

	ctx.JSON(http.StatusOK, response)
}

// checkUsernameExists checks if a username is available
func (server *Server) checkDoctorUsernameExists(ctx *gin.Context) {
	username := ctx.Param("username")

	exists, err := server.store.CheckDoctorUsernameExists(ctx, username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"exists": exists,
	})
}

// checkEmailExists checks if an email is available
func (server *Server) checkDoctorEmailExists(ctx *gin.Context) {
	email := ctx.Param("email")

	exists, err := server.store.CheckDoctorEmailExists(ctx, email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"exists": exists,
	})
}
