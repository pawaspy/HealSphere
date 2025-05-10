package api

import (
	"fmt"

	"github.com/gin-gonic/gin"
	db "github.com/pawaspy/VitaReach/db/sqlc"
	"github.com/pawaspy/VitaReach/token"
	"github.com/pawaspy/VitaReach/util"
)

// Server serves HTTP requests for our banking system
type Server struct {
	config     util.Config
	store      db.Store
	tokenMaker token.Maker
	router     *gin.Engine
}

func NewServer(config util.Config, store db.Store) (*Server, error) {
	tokenMaker, err := token.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token: %w", err)
	}
	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}

	server.setupRouter()

	return server, nil
}

func (server *Server) setupRouter() {
	router := gin.Default()

	// Setup CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Username, X-Role")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Add debug middleware for every request
	router.Use(debugMiddleware())

	// Add a test route
	router.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Server is running"})
	})

	// Add a test appointments route
	router.GET("/appointments-test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Appointments endpoint is accessible"})
	})

	// Add a test appointments post route that doesn't require auth
	router.POST("/appointments-test", func(c *gin.Context) {
		// Log headers
		fmt.Println("=== APPOINTMENTS TEST POST ===")
		for key, values := range c.Request.Header {
			for _, value := range values {
				fmt.Printf("%s: %s\n", key, value)
			}
		}

		// Log body
		var requestBody map[string]interface{}
		if err := c.ShouldBindJSON(&requestBody); err != nil {
			fmt.Printf("Error binding JSON: %v\n", err)
			c.JSON(200, gin.H{
				"message": "Received request but couldn't parse JSON",
				"error":   err.Error(),
			})
			return
		}

		fmt.Printf("Request body: %v\n", requestBody)
		c.JSON(200, gin.H{
			"message":       "Appointments test POST received",
			"received_data": requestBody,
		})
	})

	// Add direct appointments route without using groups
	router.POST("/appointments", authMiddleware(server.tokenMaker), server.createAppointment)

	// Patient routes
	router.POST("/patients", server.createPatient)
	router.POST("/patients/login", server.loginPatient)
	router.GET("/patients/check-username/:username", server.checkUsernameExists)
	router.GET("/patients/check-email/:email", server.checkEmailExists)

	// Protected patient routes
	patientRoutes := router.Group("/patients").Use(authMiddleware(server.tokenMaker))
	patientRoutes.GET("/profile", server.getPatientProfile)
	patientRoutes.PUT("/profile", server.updatePatientProfile)
	patientRoutes.PATCH("/password", server.updatePatientPassword)
	patientRoutes.DELETE("", server.deletePatient)

	// Doctor routes
	router.POST("/doctors", server.createDoctor)
	router.POST("/doctors/login", server.loginDoctor)
	router.GET("/doctors/check-username/:username", server.checkDoctorUsernameExists)
	router.GET("/doctors/check-email/:email", server.checkDoctorEmailExists)
	router.GET("/doctors", server.listDoctors) // Public endpoint to search for doctors

	// Protected doctor routes
	doctorRoutes := router.Group("/doctors").Use(authMiddleware(server.tokenMaker))
	doctorRoutes.GET("/profile", server.getDoctorProfile)
	doctorRoutes.PUT("/profile", server.updateDoctorProfile)
	doctorRoutes.PATCH("/password", server.updateDoctorPassword)
	doctorRoutes.DELETE("", server.deleteDoctor)

	// Other Appointment routes
	appointmentRoutes := router.Group("/appointments").Use(authMiddleware(server.tokenMaker))
	appointmentRoutes.GET("/:id", server.getAppointment)
	appointmentRoutes.PATCH("/:id/status", server.updateAppointmentStatus)
	appointmentRoutes.PATCH("/:id/notes", server.addAppointmentNotes)
	appointmentRoutes.PATCH("/:id/online", server.updateAppointmentOnlineStatus)
	appointmentRoutes.DELETE("/:id", server.deleteAppointment)

	// Patient appointment routes for listing appointments
	patientAppointmentRoutes := router.Group("/patients/appointments").Use(authMiddleware(server.tokenMaker))
	patientAppointmentRoutes.GET("", server.listPatientAppointments)
	patientAppointmentRoutes.GET("/today", server.listTodayPatientAppointments)
	patientAppointmentRoutes.GET("/upcoming", server.listUpcomingPatientAppointments)
	patientAppointmentRoutes.GET("/completed", server.listCompletedPatientAppointments)

	// Doctor appointment routes
	doctorAppointmentRoutes := router.Group("/doctors/appointments").Use(authMiddleware(server.tokenMaker))
	doctorAppointmentRoutes.GET("", server.listDoctorAppointments)
	doctorAppointmentRoutes.GET("/today", server.listTodayDoctorAppointments)
	doctorAppointmentRoutes.GET("/upcoming", server.listUpcomingDoctorAppointments)

	// Chatbot API endpoint - can be used without authentication
	router.POST("/api/chat", server.handleChatRequest)

	// Prescription routes
	prescriptionRoutes := router.Group("/prescriptions").Use(authMiddleware(server.tokenMaker))
	prescriptionRoutes.POST("", server.createPrescription)
	prescriptionRoutes.GET("/:appointment_id", server.getPrescription)
	prescriptionRoutes.GET("/:appointment_id/exists", server.checkPrescriptionExists)
	prescriptionRoutes.PUT("/:appointment_id", server.updatePrescription)
	prescriptionRoutes.POST("/:appointment_id/feedback", server.submitFeedback)

	server.router = router
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
