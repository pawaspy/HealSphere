package api

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// PaymentRequest contains the amount to be charged
type PaymentRequest struct {
	Amount float64 `json:"amount" binding:"required,min=1"`
}

// PaymentVerificationRequest contains the payment verification data
type PaymentVerificationRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// createOrder handles the creation of a new payment order by forwarding to the payment server
func (server *Server) createOrder(ctx *gin.Context) {
	var req PaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get payment server URL from environment or use default
	paymentServerURL := os.Getenv("PAYMENT_SERVER_URL")
	if paymentServerURL == "" {
		paymentServerURL = "https://vitareach-payment-server.onrender.com"
	}

	// Forward request to payment server
	requestBody, err := json.Marshal(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	resp, err := http.Post(paymentServerURL+"/create-order", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach payment server", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	// Read response from payment server
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Forward payment server's response
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(resp.StatusCode, result)
}

// verifyPayment handles payment verification by forwarding to the payment server
func (server *Server) verifyPayment(ctx *gin.Context) {
	var req PaymentVerificationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get payment server URL from environment or use default
	paymentServerURL := os.Getenv("PAYMENT_SERVER_URL")
	if paymentServerURL == "" {
		paymentServerURL = "https://vitareach-payment-server.onrender.com"
	}

	// Forward verification request to payment server
	requestBody, err := json.Marshal(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	resp, err := http.Post(paymentServerURL+"/verify", "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach payment server", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	// Read response from payment server
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Forward payment server's response
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(resp.StatusCode, result)
}
