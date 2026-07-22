package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"fmt"

	"github.com/amexan/backend/crl/core"
	"github.com/amexan/backend/pkg/database"
)

type PatientService struct {
	db  *core.PostgresRepository
	ctx *core.RuleEngine
}

func (s *PatientService) RegisterPatient(w http.ResponseWriter, r *http.Request) {
	var req struct {
		HospitalNumber string `json:"hospital_number"`
		GivenName      string `json:"given_name"`
		FamilyName     string `json:"family_name"`
		DateOfBirth    string `json:"date_of_birth"`
		Age            int    `json:"age"`
		Sex            string `json:"sex"`
		Residence      string `json:"residence"`
		Occupation     string `json:"occupation"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, http.StatusBadRequest)
		return
	}

	patientID := generateID()

	// Save patient
	// (In production, this goes to the database)

	// Derive clinical context via PAT rules
	context := &core.PatientContext{
		PatientID: patientID,
		Age:       req.Age,
		Sex:       core.Sex(req.Sex),
	}

	// Age classification
	switch {
	case req.Age <= 0:
		context.AgeCategory = core.AgeNeonate
	case req.Age <= 1:
		context.AgeCategory = core.AgeInfant
	case req.Age <= 9:
		context.AgeCategory = core.AgeChild
	case req.Age <= 19:
		context.AgeCategory = core.AgeAdolescent
	case req.Age <= 64:
		context.AgeCategory = core.AgeAdult
	default:
		context.AgeCategory = core.AgeOlderAdult
	}

	// Female reproductive context
	if req.Sex == "female" && req.Age >= 10 && req.Age <= 55 {
		context.HasUterus = true
		context.IsMenstruating = true
	}

	s.db.SavePatientContext(context)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"patient_id": patientID,
		"context":    context,
		"message":    "Patient registered. CRL context derived.",
	})
}

func (s *PatientService) GetPatient(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, `{"error":"patient ID required"}`, http.StatusBadRequest)
		return
	}

	context, err := s.db.GetPatientContext(id)
	if err != nil {
		http.Error(w, `{"error":"patient not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(context)
}

func main() {
	dbCfg := database.DefaultConfig()
	db, err := database.NewPool(dbCfg)
	if err != nil {
		log.Printf("Warning: Database not available: %v", err)
	}
	if db != nil {
		defer db.Close()
	}

	repo := core.NewPostgresRepository(db)
	engine := core.NewRuleEngine()

	service := &PatientService{db: repo, ctx: engine}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/patients/register", service.RegisterPatient)
	mux.HandleFunc("GET /api/patients/{id}", service.GetPatient)
	mux.HandleFunc("GET /api/patients/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok","service":"patient"}`))
	})

	log.Println("[Patient Service] Listening on :8082")
	http.ListenAndServe(":8082", withCORS(mux))
}

func generateID() string {
	return fmt.Sprintf("PAT-%d", time.Now().UnixNano())
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
