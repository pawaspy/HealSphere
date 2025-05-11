package api

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/razorpay/razorpay-go"
)

// PaymentConfig holds Razorpay configuration
type PaymentConfig struct {
	KeyID     string
	KeySecret string
}

// NewPaymentConfig creates a new payment config
func NewPaymentConfig(keyID, keySecret string) *PaymentConfig {
	return &PaymentConfig{
		KeyID:     keyID,
		KeySecret: keySecret,
	}
}

// CreateOrderRequest represents the request body for creating an order
type CreateOrderRequest struct {
	Amount float64 `json:"amount" binding:"required"`
}

// CreateOrderResponse represents the response from Razorpay
type CreateOrderResponse struct {
	ID        string `json:"id"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Receipt   string `json:"receipt"`
	Status    string `json:"status"`
	CreatedAt int64  `json:"created_at"`
}

// VerifyPaymentRequest represents the request body for verifying a payment
type VerifyPaymentRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// createOrder handles the creation of a new Razorpay order
func (server *Server) createOrder(ctx *gin.Context) {
	fmt.Println("====== CREATE ORDER ENDPOINT CALLED ======")

	var req CreateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	fmt.Printf("Received create order request: %+v\n", req)
	fmt.Printf("Using Razorpay Key ID: %s\n", server.config.RazorpayKeyID)

	// Initialize Razorpay client
	client := razorpay.NewClient(server.config.RazorpayKeyID, server.config.RazorpayKeySecret)

	// Create order data
	data := map[string]interface{}{
		"amount":   int(req.Amount * 100), // Convert to paise
		"currency": "INR",
		"receipt":  "order_rcptid_" + generateRandomString(10),
	}

	fmt.Printf("Creating order with data: %+v\n", data)

	// Create order
	order, err := client.Order.Create(data, nil)
	if err != nil {
		fmt.Printf("Error creating order: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	fmt.Printf("Order created successfully: %+v\n", order)

	// Convert order to response
	response := CreateOrderResponse{
		ID:        order["id"].(string),
		Amount:    int64(order["amount"].(float64)),
		Currency:  order["currency"].(string),
		Receipt:   order["receipt"].(string),
		Status:    order["status"].(string),
		CreatedAt: int64(order["created_at"].(float64)),
	}

	ctx.JSON(http.StatusOK, response)
}

// verifyPayment handles the verification of a Razorpay payment
func (server *Server) verifyPayment(ctx *gin.Context) {
	fmt.Println("====== VERIFY PAYMENT ENDPOINT CALLED ======")

	var req VerifyPaymentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	fmt.Printf("Received verify payment request: %+v\n", req)

	// Create signature
	payload := req.RazorpayOrderID + "|" + req.RazorpayPaymentID
	signature := hmac.New(sha256.New, []byte(server.config.RazorpayKeySecret))
	signature.Write([]byte(payload))
	generatedSignature := hex.EncodeToString(signature.Sum(nil))

	fmt.Printf("Generated signature: %s\n", generatedSignature)
	fmt.Printf("Received signature: %s\n", req.RazorpaySignature)

	// Verify signature
	if generatedSignature == req.RazorpaySignature {
		fmt.Println("Payment verification successful")
		ctx.JSON(http.StatusOK, gin.H{"status": "success"})
	} else {
		fmt.Println("Payment verification failed")
		ctx.JSON(http.StatusOK, gin.H{"status": "failure"})
	}
}

// Helper function to generate random string
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			panic(err)
		}
		b[i] = charset[n.Int64()]
	}
	return string(b)
}
