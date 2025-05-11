package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

type chatRequest struct {
	Message string `json:"message" binding:"required"`
	Format  string `json:"format"`
}

type chatResponse struct {
	Response string `json:"response"`
}

type geminiRequest struct {
	Contents         []geminiContent `json:"contents"`
	GenerationConfig geminiConfig    `json:"generationConfig"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
	Role  string       `json:"role,omitempty"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiConfig struct {
	MaxOutputTokens int     `json:"maxOutputTokens"`
	Temperature     float64 `json:"temperature"`
	TopP            float64 `json:"topP"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	PromptFeedback struct {
		BlockReason string `json:"blockReason"`
	} `json:"promptFeedback"`
}

// System prompt for medical context and safety
const medicalSystemPrompt = `You are a helpful medical assistant that provides general health information. Your role is to provide factual, evidence-based health information while being clear about limitations.

Important rules you must follow:
1. NEVER diagnose conditions or prescribe medications
2. ALWAYS recommend consulting a qualified healthcare professional for specific issues
3. Only provide general, factual medical information based on established medical consensus
4. For emergencies, ALWAYS advise contacting emergency services immediately
5. Be clear about your limitations as an AI assistant and when a doctor should be consulted
6. Do not provide specific treatment plans or dosages
7. Focus on general health education and wellness information
8. Be compassionate and understanding while remaining factual
9. When asked about symptoms, explain possible causes in general terms but emphasize the importance of professional evaluation
10. If asked about medications, only provide general information about drug classes and common uses, not specific recommendations

Remember: Your purpose is to supplement, not replace, professional medical advice.`

func (server *Server) handleChatRequest(ctx *gin.Context) {
	var req chatRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get API key from environment variable
	apiKey := server.config.GeminiAPIKey
	if apiKey == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini API key not configured"})
		return
	}

	// Create Gemini API request with format instruction if provided
	promptText := medicalSystemPrompt

	// Add format instruction if provided
	if req.Format != "" {
		promptText = fmt.Sprintf("%s\n\nResponse format: %s", promptText, req.Format)
	}

	// Add user query
	userQuery := fmt.Sprintf("%s\n\nUser query: %s", promptText, req.Message)

	geminiReq := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: userQuery},
				},
			},
		},
		GenerationConfig: geminiConfig{
			MaxOutputTokens: 400,
			Temperature:     0.3,
			TopP:            0.98,
		},
	}

	requestBody, err := json.Marshal(geminiReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Make request to Gemini API
	geminiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
	request, err := http.NewRequest("POST", fmt.Sprintf("%s?key=%s", geminiURL, apiKey), bytes.NewBuffer(requestBody))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(request)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		ctx.JSON(resp.StatusCode, gin.H{"error": fmt.Sprintf("Gemini API error: %s", string(bodyBytes))})
		return
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check if the prompt was blocked
	if geminiResp.PromptFeedback.BlockReason != "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("The prompt was blocked: %s", geminiResp.PromptFeedback.BlockReason),
		})
		return
	}

	// Check if we have a valid response
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "No response from Gemini"})
		return
	}

	ctx.JSON(http.StatusOK, chatResponse{
		Response: geminiResp.Candidates[0].Content.Parts[0].Text,
	})
}
