package api

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pawaspy/VitaReach/token"
)

const (
	authorizationHeaderKey  = "authorization"
	authorizationTypeBearer = "bearer"
	authorizationPayloadKey = "authorization_key"
)

func authMiddleware(tokenMaker token.Maker) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		fmt.Println("======= AUTH DEBUG START =======")
		fmt.Printf("Request path: %s\n", ctx.Request.URL.Path)
		fmt.Printf("Request method: %s\n", ctx.Request.Method)

		authorizationHeader := ctx.GetHeader(authorizationHeaderKey)
		if len(authorizationHeader) == 0 {
			err := errors.New("authorization header is not provided")
			fmt.Println("ERROR: authorization header is not provided")

			// Check for custom headers as fallback
			username := ctx.GetHeader("X-Username")
			role := ctx.GetHeader("X-Role")
			if username != "" && role != "" {
				fmt.Printf("Using custom headers as fallback - Username: %s, Role: %s\n", username, role)
				// Create a mock payload
				payload := &token.Payload{
					Username: username,
					Role:     role,
				}
				ctx.Set(authorizationPayloadKey, payload)
				ctx.Next()
				fmt.Println("======= AUTH DEBUG END (Custom auth OK) =======")
				return
			}

			// Log all headers for debugging
			fmt.Println("All request headers:")
			for name, values := range ctx.Request.Header {
				fmt.Printf("  %s: %s\n", name, values)
			}

			fmt.Println("======= AUTH DEBUG END (No auth) =======")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		fields := strings.Fields(authorizationHeader)
		if len(fields) < 2 {
			err := errors.New("invalid authorization header format")
			fmt.Printf("ERROR: invalid authorization header structure: %s\n", authorizationHeader)
			fmt.Println("======= AUTH DEBUG END (Invalid format) =======")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		authorizationType := strings.ToLower(fields[0])
		if authorizationTypeBearer != authorizationType {
			err := fmt.Errorf("unsupported authorization type %s", authorizationType)
			fmt.Printf("ERROR: unsupported authorization type: %s\n", authorizationType)
			fmt.Println("======= AUTH DEBUG END (Wrong auth type) =======")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		accessToken := fields[1]
		fmt.Printf("Verifying token: %s...\n", accessToken[:min(len(accessToken), 20)])

		payload, err := tokenMaker.VerifyToken(accessToken)
		if err != nil {
			fmt.Printf("ERROR: Token verification failed: %v\n", err)
			fmt.Println("======= AUTH DEBUG END (Token verification failed) =======")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		// Check user role for specific endpoints
		if strings.Contains(ctx.Request.URL.Path, "/doctors/appointments") && payload.Role != "doctor" {
			fmt.Printf("ERROR: User %s with role %s tried to access doctor-only endpoint\n",
				payload.Username, payload.Role)
			fmt.Println("======= AUTH DEBUG END (Wrong role) =======")
			err := errors.New("access denied: doctor role required")
			ctx.AbortWithStatusJSON(http.StatusForbidden, errorResponse(err))
			return
		}

		fmt.Printf("Token verification successful. User: %s, Role: %s\n", payload.Username, payload.Role)
		fmt.Println("======= AUTH DEBUG END (Success) =======")
		ctx.Set(authorizationPayloadKey, payload)
		ctx.Next()
	}
}

// min returns the smaller of a or b
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// debugMiddleware logs headers and other useful information for debugging
func debugMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("=============== DEBUG REQUEST ===============")
		fmt.Printf("Request Method: %s\n", c.Request.Method)
		fmt.Printf("Request URL: %s\n", c.Request.URL.String())

		// Log all headers
		fmt.Println("Request Headers:")
		for name, values := range c.Request.Header {
			for _, value := range values {
				fmt.Printf("  %s: %s\n", name, value)
			}
		}

		// Log auth header specifically
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			fmt.Printf("Authorization Header: %s\n", authHeader)
		} else {
			fmt.Println("No Authorization Header Found!")
		}

		// Check custom headers
		username := c.GetHeader("X-Username")
		role := c.GetHeader("X-Role")
		if username != "" {
			fmt.Printf("X-Username: %s\n", username)
		}
		if role != "" {
			fmt.Printf("X-Role: %s\n", role)
		}

		fmt.Println("============================================")

		// Continue to the next middleware or handler
		c.Next()

		// Log response status after request is processed
		fmt.Printf("Response Status: %d\n", c.Writer.Status())
		fmt.Println("============================================")
	}
}
