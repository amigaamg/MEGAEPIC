package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/amexan/backend/crl/core"
	"github.com/amexan/backend/crl/docgen"
	"github.com/amexan/backend/crl/questions"
	"github.com/amexan/backend/crl/reasoning"
	_ "github.com/lib/pq"
)

type EngineServer struct {
	repo      core.Repository
	reasoner  *reasoning.Reasoner
	docEngine *docgen.Engine
	qEngine   *questions.QuestionEngine
}

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/amexan?sslmode=disable"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("[Engine Server] Failed to open database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Printf("[Engine Server] WARNING: Database not reachable: %v", err)
		log.Println("[Engine Server] Starting in OFFLINE mode (no persistence)")
	}

	repo := core.NewPostgresRepository(db)
	svc := &EngineServer{
		repo:      repo,
		reasoner:  reasoning.NewReasoner(repo),
		docEngine: docgen.NewEngine(repo),
		qEngine:   questions.NewQuestionEngine(repo),
	}

	mux := http.NewServeMux()

	// Reasoning endpoints
	mux.HandleFunc("POST /api/reasoning/evaluate", svc.Evaluate)
	mux.HandleFunc("POST /api/reasoning/investigations", svc.RecommendInvestigations)

	// Documentation endpoints
	mux.HandleFunc("POST /api/documentation/hpi", svc.GenerateHPI)
	mux.HandleFunc("POST /api/documentation/soap", svc.GenerateSOAP)
	mux.HandleFunc("POST /api/documentation/discharge", svc.GenerateDischarge)

	// Question endpoints
	mux.HandleFunc("POST /api/questions/start", svc.StartSession)
	mux.HandleFunc("POST /api/questions/answer", svc.ProcessAnswer)
	mux.HandleFunc("POST /api/questions/filter", svc.FilterQuestions)

	// Health
	mux.HandleFunc("GET /api/engine/healthz", func(w http.ResponseWriter, r *http.Request) {
		dbStatus := "connected"
		if db.Ping() != nil {
			dbStatus = "disconnected"
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "ok",
			"service":  "engine-server",
			"database": dbStatus,
		})
	})

	port := os.Getenv("ENGINE_PORT")
	if port == "" {
		port = "8089"
	}

	log.Printf("[Engine Server] Listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, withCORS(mux)))
}

// ============================================================================
// REASONING HANDLERS
// ============================================================================

func (s *EngineServer) Evaluate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID       string             `json:"encounter_id"`
		SessionID         string             `json:"session_id"`
		ObservationIDs    []string           `json:"observation_ids"`
		PriorProbabilities map[string]float64 `json:"prior_probabilities,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	observations := make([]*core.HPIObservation, 0)
	for _, oid := range req.ObservationIDs {
		obs, err := s.repo.GetHPIObservations(req.EncounterID)
		if err != nil {
			continue
		}
		for _, o := range obs {
			if o.ID == oid {
				observations = append(observations, o)
			}
		}
	}

	differentials, err := s.reasoner.Evaluate(req.EncounterID, req.SessionID, observations, req.PriorProbabilities)
	if err != nil {
		http.Error(w, `{"error":"evaluation failed"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"differentials": differentials,
		"count":         len(differentials),
	})
}

func (s *EngineServer) RecommendInvestigations(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID    string   `json:"encounter_id"`
		TopN           int      `json:"top_n"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	differentials, _ := s.repo.GetDifferentials(req.EncounterID)
	recommendations := s.reasoner.RankInvestigations(differentials, req.TopN)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"recommendations": recommendations,
		"count":           len(recommendations),
	})
}

// ============================================================================
// DOCUMENTATION HANDLERS
// ============================================================================

func (s *EngineServer) GenerateHPI(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string `json:"encounter_id"`
		PatientName string `json:"patient_name"`
		Age         int    `json:"age"`
		Gender      string `json:"gender"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	doc, err := s.docEngine.GenerateHPI(req.EncounterID, req.PatientName, req.Age, req.Gender)
	if err != nil {
		http.Error(w, `{"error":"hpi generation failed"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(doc)
}

func (s *EngineServer) GenerateSOAP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string `json:"encounter_id"`
		PatientName string `json:"patient_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	doc, err := s.docEngine.GenerateSOAP(req.EncounterID, req.PatientName)
	if err != nil {
		http.Error(w, `{"error":"soap generation failed"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(doc)
}

func (s *EngineServer) GenerateDischarge(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID         string `json:"encounter_id"`
		PatientName         string `json:"patient_name"`
		AdmitDate           string `json:"admit_date"`
		DischargeDate       string `json:"discharge_date"`
		DischargeDiagnosis  string `json:"discharge_diagnosis"`
		Disposition         string `json:"disposition"`
		FollowUpInstructions string `json:"follow_up_instructions"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	admitDate, _ := time.Parse(time.RFC3339, req.AdmitDate)
	dischargeDate, _ := time.Parse(time.RFC3339, req.DischargeDate)
	if dischargeDate.IsZero() {
		dischargeDate = time.Now()
	}

	doc, err := s.docEngine.GenerateDischargeSummary(req.EncounterID, req.PatientName, admitDate, dischargeDate, req.DischargeDiagnosis, req.Disposition, req.FollowUpInstructions)
	if err != nil {
		http.Error(w, `{"error":"discharge generation failed"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(doc)
}

// ============================================================================
// QUESTION HANDLERS
// ============================================================================

func (s *EngineServer) StartSession(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID    string `json:"encounter_id"`
		ChiefComplaint string `json:"chief_complaint"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	session, questions, err := s.qEngine.StartSession(req.EncounterID, req.ChiefComplaint)
	if err != nil {
		http.Error(w, `{"error":"session start failed"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"session":   session,
		"questions": questions,
		"count":     len(questions),
	})
}

func (s *EngineServer) ProcessAnswer(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EncounterID string `json:"encounter_id"`
		SessionID   string `json:"session_id"`
		QuestionID  string `json:"question_id"`
		Answer      string `json:"answer"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	// Find the template
	templates := s.qEngine.FilterQuestions("")
	var template *questions.ClinicalQuestionTemplate
	for _, q := range templates {
		if q.ID == req.QuestionID {
			t := q
			template = &t
			break
		}
	}
	if template == nil {
		http.Error(w, `{"error":"question not found"}`, http.StatusNotFound)
		return
	}

	result, err := s.qEngine.ProcessAnswer(req.SessionID, req.EncounterID, *template, req.Answer)
	if err != nil {
		http.Error(w, `{"error":"answer processing failed"}`, http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(result)
}

func (s *EngineServer) FilterQuestions(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ChiefComplaint string `json:"chief_complaint"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	questions := s.qEngine.FilterQuestions(req.ChiefComplaint)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"questions": questions,
		"count":     len(questions),
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
