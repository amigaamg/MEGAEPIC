package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/amexan/backend/crl"
	"github.com/amexan/backend/crl/core"
)

type DocumentationService struct {
	engine *core.RuleEngine
}

func (s *DocumentationService) GenerateDocument(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID  string `json:"encounter_id"`
		DocumentType string `json:"document_type"`
		Template     string `json:"template"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	state := core.NewRuleState(req.EncounterID, "", "")
	state.SetValue("document.type", req.DocumentType)
	state.SetValue("document.generate", true)

	results := s.engine.EvaluateByCategory(r.Context(), core.CategoryDocument, state)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"encounter_id":    req.EncounterID,
		"document_type":   req.DocumentType,
		"required_fields": getRequiredFields(state),
		"rules_triggered": len(results),
	})
}

func (s *DocumentationService) SignDocument(w http.ResponseWriter, r *http.Request) {
	var req struct {
		DocumentID string `json:"document_id"`
		SignedBy   string `json:"signed_by"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":     "signed",
		"document":   req.DocumentID,
		"signed_by":  req.SignedBy,
	})
}

func main() {
	engine := core.NewRuleEngine()
	engine.LoadRules(crl.LoadAllClinicalRules())

	service := &DocumentationService{engine: engine}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/documents/generate", service.GenerateDocument)
	mux.HandleFunc("POST /api/documents/sign", service.SignDocument)
	mux.HandleFunc("GET /api/documents/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"documentation"}`))
	})

	log.Println("[Documentation Service] Listening on :8087")
	http.ListenAndServe(":8087", withCORS(mux))
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
