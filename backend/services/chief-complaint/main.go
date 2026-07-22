package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/amexan/backend/services/chief-complaint/engine"
)

type ChiefComplaintService struct {
	cce   *engine.ChiefComplaintEngine
	qe    *engine.QuestionEngine
	chron *engine.ChronologyBuilder
	hpi   *engine.HPINarrativeGenerator
}

func main() {
	svc := &ChiefComplaintService{
		cce:   engine.NewChiefComplaintEngine(),
		qe:    engine.NewQuestionEngine(),
		chron: engine.NewChronologyBuilder(),
		hpi:   engine.NewHPINarrativeGenerator(),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/chief-complaint/process", svc.ProcessComplaint)
	mux.HandleFunc("POST /api/chief-complaint/timeline", svc.BuildTimeline)
	mux.HandleFunc("POST /api/chief-complaint/questions", svc.GetQuestions)
	mux.HandleFunc("POST /api/chief-complaint/narrative", svc.GenerateNarrative)
	mux.HandleFunc("GET /api/chief-complaint/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"chief-complaint"}`))
	})

	log.Println("[Chief Complaint Engine] Listening on :8088")
	http.ListenAndServe(":8088", withCORS(mux))
}

func (s *ChiefComplaintService) ProcessComplaint(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID     string `json:"encounter_id"`
		PatientStatement string `json:"patient_statement"`
		Onset           string `json:"onset"`
		Severity        int    `json:"severity"`
		Reporter        string `json:"reporter"`
		EntryOrder      int    `json:"entry_order"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	onset, err := time.Parse(time.RFC3339, req.Onset)
	if err != nil {
		onset = time.Now()
	}

	if req.Reporter == "" {
		req.Reporter = "patient"
	}

	complaint := s.cce.ProcessComplaint(
		req.EncounterID,
		req.PatientStatement,
		onset,
		req.Severity,
		req.Reporter,
		req.EntryOrder,
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(complaint)
}

func (s *ChiefComplaintService) BuildTimeline(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Complaints []*engine.Complaint `json:"complaints"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	// Sort chronologically
	timeline := s.cce.BuildTimeline(req.Complaints)

	// Infer relationships
	s.cce.InferRelationships(timeline)

	// Build chronology narrative
	entries := s.chron.BuildChronology(timeline)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"timeline":      timeline,
		"chronology":    entries,
	})
}

func (s *ChiefComplaintService) GetQuestions(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ComplaintConcept string                 `json:"complaint_concept"`
		AnsweredIDs      []string               `json:"answered_ids,omitempty"`
		Context          map[string]interface{} `json:"context,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	questions := s.qe.GetNextQuestions(req.ComplaintConcept, req.AnsweredIDs, req.Context)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"questions": questions,
		"count":     len(questions),
	})
}

func (s *ChiefComplaintService) GenerateNarrative(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Complaint *engine.Complaint       `json:"complaint"`
		Questions []engine.Question       `json:"questions"`
		Answers   map[string]string       `json:"answers"`
		Pmh       []string                `json:"pmh,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	narrative := s.hpi.GenerateNarrative(req.Complaint, req.Questions, req.Answers, req.Pmh)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"narrative": narrative,
	})
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
