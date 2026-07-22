package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/amexan/backend/crl"
	"github.com/amexan/backend/crl/core"
)

type ExaminationService struct {
	engine *core.RuleEngine
}

func (s *ExaminationService) GetExamTemplate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID       string `json:"encounter_id"`
		PatientID         string `json:"patient_id"`
		ChiefComplaint    string `json:"chief_complaint"`
		Department        string `json:"department"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	state := core.NewRuleState(req.EncounterID, "", req.PatientID)

	// Set up context for exam rule evaluation
	state.SetValue("presenting_complaint", req.ChiefComplaint)
	state.SetValue("department", req.Department)

	// Evaluate examination rules
	results := s.engine.EvaluateByCategory(r.Context(), core.CategoryExamination, state)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"encounter_id":    req.EncounterID,
		"exam_sections":   getVisibleSections(state),
		"recommendations": state.Recommendations,
		"required_fields": getRequiredFields(state),
		"rules_triggered": len(results),
	})
}

func (s *ExaminationService) SubmitExam(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string                 `json:"encounter_id"`
		Findings    map[string]interface{} `json:"findings"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "examination recorded",
		"count":  len(req.Findings),
	})
}

func main() {
	engine := core.NewRuleEngine()
	engine.LoadRules(crl.LoadAllClinicalRules())

	service := &ExaminationService{engine: engine}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/examinations/template", service.GetExamTemplate)
	mux.HandleFunc("POST /api/examinations/submit", service.SubmitExam)
	mux.HandleFunc("GET /api/examinations/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"examination"}`))
	})

	log.Println("[Examination Service] Listening on :8084")
	http.ListenAndServe(":8084", withCORS(mux))
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
