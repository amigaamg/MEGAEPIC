package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/amexan/backend/crl"
	"github.com/amexan/backend/crl/core"
)

// HistoryService manages the HPI engine and clinical history collection.
// It uses the CRL to determine which history sections to activate
// based on patient context, chief complaints, and encounter type.
type HistoryService struct {
	engine *core.RuleEngine
	repo   core.Repository
}

func (s *HistoryService) StartHistory(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string `json:"encounter_id"`
		PatientID   string `json:"patient_id"`
		ProviderID  string `json:"provider_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	state := core.NewRuleState(req.EncounterID, req.ProviderID, req.PatientID)

	// Evaluate patient rules for section activation
	patientCtx, _ := s.repo.GetPatientContext(req.PatientID)
	if patientCtx != nil {
		state.Patient = patientCtx
	}

	// Run PAT rules to determine active sections
	patResults := s.engine.EvaluateByCategory(r.Context(), core.CategoryPatient, state)

	// Run HPI rules
	hpiResults := s.engine.EvaluateByCategory(r.Context(), core.CategoryHPI, state)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"encounter_id":     req.EncounterID,
		"active_sections":  getVisibleSections(state),
		"recommendations":  state.Recommendations,
		"pat_rules":        len(patResults),
		"hpi_rules":        len(hpiResults),
		"alerts":          state.Alerts,
	})
}

func (s *HistoryService) SubmitHPI(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string                 `json:"encounter_id"`
		ComplaintID string                 `json:"complaint_id"`
		Observations map[string]interface{} `json:"observations"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	// Convert observations to CRL observation objects
	for conceptID, value := range req.Observations {
		obs := &core.Observation{
			UUID:        generateUUID(),
			EncounterID: req.EncounterID,
			ConceptID:   conceptID,
			Value:       value,
			Source:      core.SourceClinician,
			Confidence:  1.0,
			TimeObserved: time.Now(),
			Status:      core.ObservationActive,
			Version:     1,
		}
		s.repo.SaveObservation(obs)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "saved",
		"count":   len(req.Observations),
	})
}

func (s *HistoryService) GetHistorySections(w http.ResponseWriter, r *http.Request) {
	encounterID := r.URL.Query().Get("encounter_id")
	if encounterID == "" {
		http.Error(w, `{"error":"encounter_id required"}`, http.StatusBadRequest)
		return
	}

	observations, _ := s.repo.GetObservations(encounterID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"encounter_id": encounterID,
		"observations": observations,
	})
}

func main() {
	engine := core.NewRuleEngine()
	engine.LoadRules(crl.LoadAllClinicalRules())

	service := &HistoryService{
		engine: engine,
		repo:   core.NewPostgresRepository(nil), // nil-safe for now
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/history/start", service.StartHistory)
	mux.HandleFunc("POST /api/history/hpi", service.SubmitHPI)
	mux.HandleFunc("GET /api/history/sections", service.GetHistorySections)
	mux.HandleFunc("GET /api/history/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"history"}`))
	})

	log.Println("[History Service] Listening on :8083")
	http.ListenAndServe(":8083", withCORS(mux))
}

func getVisibleSections(state *core.RuleState) []string {
	var sections []string
	for s, visible := range state.VisibleSections {
		if visible {
			sections = append(sections, s)
		}
	}
	return sections
}

func generateUUID() string {
	return fmt.Sprintf("%x-%x", time.Now().UnixNano(), time.Now().UnixMilli())
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
