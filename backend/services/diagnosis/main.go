package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/amexan/backend/crl"
	"github.com/amexan/backend/crl/core"
)

type DiagnosisService struct {
	engine *core.RuleEngine
}

func (s *DiagnosisService) GenerateDifferential(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID    string   `json:"encounter_id"`
		PatientID      string   `json:"patient_id"`
		ChiefComplaint string   `json:"chief_complaint"`
		HistorySummary string   `json:"history_summary"`
		ExamFindings   []string `json:"exam_findings"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	state := core.NewRuleState(req.EncounterID, "", req.PatientID)
	state.SetValue("presenting_complaint", req.ChiefComplaint)
	state.SetValue("history_completed", true)
	state.SetValue("exam_completed", len(req.ExamFindings) > 0)

	// Evaluate diagnostic rules
	results := s.engine.EvaluateByCategory(r.Context(), core.CategoryDiagnosis, state)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"encounter_id":      req.EncounterID,
		"differential":      state.Differential,
		"recommendations":   state.Recommendations,
		"required_fields":   getRequiredFields(state),
		"rules_triggered":   len(results),
		"alerts":           state.Alerts,
	})
}

func (s *DiagnosisService) ConfirmDiagnosis(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID    string `json:"encounter_id"`
		DiagnosisCode  string `json:"diagnosis_code"`
		DiagnosisName  string `json:"diagnosis_name"`
		DiagnosisType  string `json:"diagnosis_type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "diagnosis recorded",
		"diagnosis": req.DiagnosisName,
		"code":      req.DiagnosisCode,
		"type":      req.DiagnosisType,
	})
}

func main() {
	engine := core.NewRuleEngine()
	engine.LoadRules(crl.LoadAllClinicalRules())

	service := &DiagnosisService{engine: engine}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/diagnosis/ddx", service.GenerateDifferential)
	mux.HandleFunc("POST /api/diagnosis/confirm", service.ConfirmDiagnosis)
	mux.HandleFunc("GET /api/diagnosis/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"diagnosis"}`))
	})

	log.Println("[Diagnosis Service] Listening on :8085")
	http.ListenAndServe(":8085", withCORS(mux))
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
