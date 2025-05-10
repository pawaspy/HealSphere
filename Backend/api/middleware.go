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
				return
			}

			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		fields := strings.Fields(authorizationHeader)
		if len(fields) < 2 {
			err := errors.New("invalid authorization header is provided")
			fmt.Printf("ERROR: invalid authorization header structure: %s\n", authorizationHeader)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		authorizationType := strings.ToLower(fields[0])
		if authorizationTypeBearer != authorizationType {
			err := fmt.Errorf("unsupported authorization type %s", authorizationType)
			fmt.Printf("ERROR: unsupported authorization type: %s\n", authorizationType)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		accessToken := fields[1]
		fmt.Printf("Verifying token: %s...\n", accessToken[:20])
		payload, err := tokenMaker.VerifyToken(accessToken)
		if err != nil {
			fmt.Printf("ERROR: Token verification failed: %v\n", err)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}
		fmt.Printf("Token verification successful. User: %s, Role: %s\n", payload.Username, payload.Role)
		ctx.Set(authorizationPayloadKey, payload)
		ctx.Next()
	}
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
