package api

import (
	"encoding/json"
	"net/http"

	"github.com/amexan/lbo-engine/internal/models"
	"github.com/amexan/lbo-engine/internal/reasoning"
)

type LboRequest struct {
	Input models.LboEngineInput `json:"input"`
	Registration models.RegistrationData `json:"registration"`
}

type LboResponse struct {
	Ddx                []models.DdxEntry           `json:"ddx"`
	ComplicationScreen []models.ComplicationScreen  `json:"complicationScreening"`
	RedFlags           []string                     `json:"redFlags"`
	ManagementPlan     models.ManagementPlan        `json:"managementPlan"`
	OperativeDecision  *models.OperativeOption      `json:"operativeDecision,omitempty"`
	Narrative          string                       `json:"narrative"`
}

func RunLboEngine(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LboRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// 1. History narrative (pure story, no bias)
	narrative := reasoning.BuildHistoryNarrative(
		req.Input.History.SymptomStreams,
		req.Input.History,
		req.Registration.Sex,
	)

	// 2. DDX from history
	ddx := reasoning.ReasonHistory(req.Input.History, req.Registration)

	// 3. Complication screening
	complications := reasoning.ScreenComplications(
		req.Input.History,
		req.Input.Exam,
		req.Registration.Age,
	)

	// 4. Red flags
	redFlags := reasoning.DetectRedFlags(
		req.Input.History,
		req.Input.Exam,
		req.Input.Labs,
	)

	// 5. Management plan
	management := reasoning.GenerateManagement(req.Input)

	// 6. Operative decision
	operative := reasoning.DecideOperativeApproach(req.Input)

	resp := LboResponse{
		Ddx:                ddx,
		ComplicationScreen: complications,
		RedFlags:           redFlags,
		ManagementPlan:     management,
		OperativeDecision:  operative,
		Narrative:          narrative,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
