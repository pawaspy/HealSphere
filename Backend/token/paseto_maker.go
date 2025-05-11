package token

import (
	"fmt"
	"time"

	"github.com/aead/chacha20poly1305"
	"github.com/o1egl/paseto"
)

type PasetoMaker struct {
	paseto       *paseto.V2
	symmetricKey []byte
}

func NewPasetoMaker(symmetricKey string) (Maker, error) {
	if len(symmetricKey) != chacha20poly1305.KeySize {
		return nil, fmt.Errorf("Invalid key size: %v", symmetricKey)
	}
	maker := &PasetoMaker{
		paseto:       paseto.NewV2(),
		symmetricKey: []byte(symmetricKey),
	}
	return maker, nil
}

func (maker *PasetoMaker) CreateToken(username, role string, duration time.Duration) (string, *Payload, error) {
	payload, err := NewPayload(username, role, duration)
	if err != nil {
		return "", payload, err
	}
	token, err := maker.paseto.Encrypt(maker.symmetricKey, payload, nil)
	return token, payload, err
}

func (maker *PasetoMaker) VerifyToken(token string) (*Payload, error) {
	var payload Payload

	fmt.Println("PasetoMaker: Attempting to verify token...")

	err := maker.paseto.Decrypt(token, maker.symmetricKey, &payload, nil)
	if err != nil {
		fmt.Printf("PasetoMaker: Token decryption failed: %v\n", err)
		return nil, ErrInvalidToken
	}
	err = payload.Valid()
	if err != nil {
		fmt.Printf("PasetoMaker: Token validation failed: %v\n", err)
		return nil, err
	}

	fmt.Printf("PasetoMaker: Token validated successfully for user %s with role %s\n", payload.Username, payload.Role)
	return &payload, nil
}
