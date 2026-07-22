package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/amexan/backend/crl"
	"github.com/amexan/backend/crl/core"
	"github.com/amexan/backend/pkg/database"
)

// EncounterService manages the universal encounter lifecycle.
// It orchestrates the encounter state machine and integrates
// with the Clinical Rules Engine for workflow decisions.
type EncounterService struct {
	db     core.Repository
	engine *core.RuleEngine
}

func (s *EncounterService) StartEncounter(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PatientID   string `json:"patient_id"`
		ProviderID  string `json:"provider_id"`
		Department  string `json:"department"`
		VisitType   string `json:"visit_type"`
		Priority    string `json:"priority"`
		Reason      string `json:"reason_for_visit"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	// Create encounter
	encounter := &core.Encounter{
		PatientID:     req.PatientID,
		ProviderID:    req.ProviderID,
		VisitType:     core.VisitType(req.VisitType),
		Priority:      core.Priority(req.Priority),
		Status:        core.EncounterActive,
		ClinicalState: core.StateRegistered,
		ReasonForVisit: req.Reason,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := s.db.SaveEncounter(encounter); err != nil {
		http.Error(w, `{"error":"failed to save encounter"}`, http.StatusInternalServerError)
		return
	}

	// Evaluate encounter rules
	state := core.NewRuleState(encounter.ID, req.ProviderID, req.PatientID)
	state.Encounter = encounter

	results := s.engine.EvaluateByCategory(context.Background(), core.CategoryEncounter, state)

	response := map[string]interface{}{
		"encounter": encounter,
		"rules_triggered": len(results),
		"active_pathways": state.ActivePathways,
		"alerts":         state.Alerts,
		"warnings":       state.Warnings,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *EncounterService) GetEncounter(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, `{"error":"encounter ID required"}`, http.StatusBadRequest)
		return
	}

	encounter, err := s.db.GetEncounter(id)
	if err != nil {
		http.Error(w, `{"error":"encounter not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(encounter)
}

func (s *EncounterService) TransitionState(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string `json:"encounter_id"`
		NewState    string `json:"new_state"`
		UserID      string `json:"user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	encounter, err := s.db.GetEncounter(req.EncounterID)
	if err != nil {
		http.Error(w, `{"error":"encounter not found"}`, http.StatusNotFound)
		return
	}

	// Check transition validity
	encounter.ClinicalState = core.WorkflowState(req.NewState)
	encounter.UpdatedAt = time.Now()

	if err := s.db.UpdateEncounter(encounter); err != nil {
		http.Error(w, `{"error":"failed to update encounter"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "transitioned",
		"encounter": encounter,
	})
}

func main() {
	// Database connection
	dbCfg := database.DefaultConfig()
	db, err := database.NewPool(dbCfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize rule engine
	engine := core.NewRuleEngine()
	engine.LoadRules(crl.LoadAllClinicalRules())

	service := &EncounterService{
		db:     core.NewPostgresRepository(db),
		engine: engine,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/encounters/start", service.StartEncounter)
	mux.HandleFunc("GET /api/encounters/{id}", service.GetEncounter)
	mux.HandleFunc("POST /api/encounters/transition", service.TransitionState)
	mux.HandleFunc("GET /api/encounters/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"encounter"}`))
	})

	server := &http.Server{
		Addr:    ":8081",
		Handler: withCORS(mux),
	}

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh
		log.Println("Shutting down encounter service...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		server.Shutdown(ctx)
	}()

	log.Println("[Encounter Service] Listening on :8081")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
