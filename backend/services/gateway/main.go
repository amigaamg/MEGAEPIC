package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"context"
	"time"
)

// ServiceRegistry maps API paths to backend microservices
var serviceRegistry = map[string]string{
	"/api/encounters":    "http://localhost:8081",
	"/api/patients":      "http://localhost:8082",
	"/api/history":       "http://localhost:8083",
	"/api/examinations":  "http://localhost:8084",
	"/api/diagnosis":     "http://localhost:8085",
	"/api/management":    "http://localhost:8086",
	"/api/documents":     "http://localhost:8087",
	"/api/orders":        "http://localhost:8088",
	"/api/rules":         "http://localhost:8089",
}

// Gateway is the single entry point for all AMEXAN microservices
type Gateway struct {
	proxy http.Handler
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Find matching service
	var targetURL string
	for prefix, service := range serviceRegistry {
		if strings.HasPrefix(r.URL.Path, prefix) {
			targetURL = service
			break
		}
	}

	if targetURL == "" {
		// Route to default handler
		g.handleDefault(w, r)
		return
	}

	// Proxy to the target service
	target, err := url.Parse(targetURL)
	if err != nil {
		http.Error(w, `{"error":"invalid target"}`, http.StatusInternalServerError)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	r.Host = target.Host
	proxy.ServeHTTP(w, r)
}

func (g *Gateway) handleDefault(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/api/health":
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "ok",
			"service":   "amexan-gateway",
			"version":   "1.0.0",
			"timestamp": time.Now(),
			"services":  serviceRegistry,
		})

	case "/api/rules/load":
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Rules loaded from CRL repository",
			"count":   47,
		})

	default:
		json.NewEncoder(w).Encode(map[string]interface{}{
			"service": "AMEXAN Clinical OS Gateway",
			"version": "1.0.0",
			"endpoints": []string{
				"/api/encounters",
				"/api/patients",
				"/api/history",
				"/api/examinations",
				"/api/diagnosis",
				"/api/management",
				"/api/documents",
				"/api/orders",
				"/api/rules",
				"/api/health",
			},
		})
	}
}

func main() {
	gateway := &Gateway{}

	mux := http.NewServeMux()
	mux.Handle("/", gateway)

	server := &http.Server{
		Addr:    ":8080",
		Handler: withCORS(mux),
	}

	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh
		log.Println("Shutting down gateway...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		server.Shutdown(ctx)
	}()

	log.Println("[Gateway] AMEXAN Clinical OS Gateway listening on :8080")
	log.Println("[Gateway] Routes:")
	for prefix, target := range serviceRegistry {
		log.Printf("  %s -> %s", prefix, target)
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Gateway error: %v", err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
