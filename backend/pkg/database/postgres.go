package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

// Config holds PostgreSQL connection configuration
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string

	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

func DefaultConfig() Config {
	return Config{
		Host:            "localhost",
		Port:            5432,
		User:            "amexan",
		Password:        "amexan",
		DBName:          "amexan_clinical_os",
		SSLMode:         "disable",
		MaxOpenConns:    25,
		MaxIdleConns:    10,
		ConnMaxLifetime: 5 * time.Minute,
	}
}

func (c Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// NewPool creates a new database connection pool
func NewPool(cfg Config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("[DB] Connected to PostgreSQL at %s:%d/%s", cfg.Host, cfg.Port, cfg.DBName)
	return db, nil
}

// RunMigrations executes schema migrations
func RunMigrations(db *sql.DB, migrationsPath string) error {
	// In production, use golang-migrate or similar
	// For now, this is a placeholder
	log.Printf("[DB] Migrations would run from: %s", migrationsPath)
	return nil
}
