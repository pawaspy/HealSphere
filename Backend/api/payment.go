package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"time"

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

// Simple Order represents a Razorpay order
type Order struct {
	ID     string `json:"id"`
	Amount int64  `json:"amount"`
}

// Initialize random seed
func init() {
	rand.Seed(time.Now().UnixNano())
}

// createOrder handles the creation of a new payment order
func (server *Server) createOrder(ctx *gin.Context) {
	var req PaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Convert amount to paise (smallest currency unit)
	amountPaise := int64(req.Amount * 100)

	// In a real implementation, you would make an HTTP request to Razorpay's API
	// For now, we'll simulate the order creation with a dummy order ID
	randStr := randomString(10)
	orderID := fmt.Sprintf("order_%s", randStr)

	order := map[string]interface{}{
		"id":       orderID,
		"amount":   amountPaise,
		"currency": "INR",
		"receipt":  fmt.Sprintf("rcpt_%s", randStr),
	}

	ctx.JSON(http.StatusOK, order)
}

// verifyPayment handles payment verification
func (server *Server) verifyPayment(ctx *gin.Context) {
	var req PaymentVerificationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get Razorpay key secret from environment variable
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	if keySecret == "" {
		keySecret = "CrhHrTu8aJa3tyRS4ecWvYi7" // Fallback to test key
	}

	// Create the signature
	data := req.RazorpayOrderID + "|" + req.RazorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	calculatedSignature := hex.EncodeToString(h.Sum(nil))

	// Verify the signature
	if calculatedSignature == req.RazorpaySignature {
		ctx.JSON(http.StatusOK, gin.H{"status": "success"})
	} else {
		ctx.JSON(http.StatusOK, gin.H{"status": "failure"})
	}
}

// Helper function to generate random string
func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
