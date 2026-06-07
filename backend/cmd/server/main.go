package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/amexan/lbo-engine/internal/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/clinical/domains/lbo", api.RunLboEngine)

	// CORS middleware
	handler := corsMiddleware(http.DefaultServeMux)

	addr := fmt.Sprintf(":%s", port)
	log.Printf("LBO Engine server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
