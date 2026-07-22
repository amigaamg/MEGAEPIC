package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/amexan/backend/crl"
	"github.com/amexan/backend/crl/core"
)

type ManagementService struct {
	engine *core.RuleEngine
}

func (s *ManagementService) GeneratePlan(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID   string `json:"encounter_id"`
		PatientID     string `json:"patient_id"`
		Diagnosis     string `json:"diagnosis"`
		Department    string `json:"department"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	state := core.NewRuleState(req.EncounterID, "", req.PatientID)
	state.SetValue("diagnosis", req.Diagnosis)
	state.SetValue("management_plan", true)

	results := s.engine.EvaluateByCategory(r.Context(), core.CategoryManagement, state)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"encounter_id":    req.EncounterID,
		"management_plan": map[string]interface{}{
			"immediate":    getRecommendationsByType(state.Recommendations, "immediate"),
			"definitive":   getRecommendationsByType(state.Recommendations, "definitive"),
			"monitoring":   state.Recommendations,
			"required":     getRequiredFields(state),
		},
		"rules_triggered": len(results),
		"pathways":        state.ActivePathways,
	})
}

func (s *ManagementService) SubmitPrescription(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string `json:"encounter_id"`
		Drugs       []struct {
			Name     string  `json:"name"`
			Dose     string  `json:"dose"`
			Frequency string `json:"frequency"`
			Route    string  `json:"route"`
			Duration string  `json:"duration"`
		} `json:"drugs"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "prescription recorded",
		"count":  len(req.Drugs),
	})
}

func main() {
	engine := core.NewRuleEngine()
	engine.LoadRules(crl.LoadAllClinicalRules())

	service := &ManagementService{engine: engine}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/management/plan", service.GeneratePlan)
	mux.HandleFunc("POST /api/management/prescribe", service.SubmitPrescription)
	mux.HandleFunc("GET /api/management/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"management"}`))
	})

	log.Println("[Management Service] Listening on :8086")
	http.ListenAndServe(":8086", withCORS(mux))
}

func getRecommendationsByType(recs []string, filter string) []string {
	var filtered []string
	for _, r := range recs {
		if len(r) > 0 {
			filtered = append(filtered, r)
		}
	}
	return filtered
}

func getRequiredFields(state *core.RuleState) []string {
	var fields []string
	for f := range state.RequiredFields {
		fields = append(fields, f)
	}
	return fields
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
