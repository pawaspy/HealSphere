package db

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store provides all functions to execute database queries and transactions
type Store struct {
	*Queries
	db *pgxpool.Pool
}

// NewStore creates a new Store
func NewStore(db *pgxpool.Pool) *Store {
	return &Store{
		Queries: New(db),
		db:      db,
	}
}
