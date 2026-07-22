package reasoning

import (
	"math"
	"sort"
	"sync"
	"time"

	"github.com/amexan/backend/crl/core"
)

type Reasoner struct {
	mu       sync.RWMutex
	repo     core.Repository
	registry map[string][]EvidenceProfile
}

type EvidenceProfile struct {
	DiseaseID         string  `json:"disease_id"`
	DiseaseName       string  `json:"disease_name"`
	ObservationID     string  `json:"observation_id"`
	ObservationConcept string `json:"observation_concept"`
	LRPositive        float64 `json:"lr_positive"`
	LRNegative        float64 `json:"lr_negative"`
	Prevalence        float64 `json:"prevalence"`
	Source            string  `json:"source"`
	EvidenceLevel     string  `json:"evidence_level"`
	Direction         string  `json:"direction"`
}

var defaultRegistry = []EvidenceProfile{
	{DiseaseID: "acute_coronary_syndrome", DiseaseName: "Acute Coronary Syndrome", ObservationConcept: "chest_pain_crushing", LRPositive: 4.0, LRNegative: 0.5, Prevalence: 0.15},
	{DiseaseID: "acute_coronary_syndrome", DiseaseName: "Acute Coronary Syndrome", ObservationConcept: "radiation_left_arm", LRPositive: 3.5, LRNegative: 0.6, Prevalence: 0.15},
	{DiseaseID: "acute_coronary_syndrome", DiseaseName: "Acute Coronary Syndrome", ObservationConcept: "ecg_st_elevation", LRPositive: 20.0, LRNegative: 0.1, Prevalence: 0.15},
	{DiseaseID: "acute_coronary_syndrome", DiseaseName: "Acute Coronary Syndrome", ObservationConcept: "troponin_elevated", LRPositive: 50.0, LRNegative: 0.05, Prevalence: 0.15},
	{DiseaseID: "pulmonary_embolism", DiseaseName: "Pulmonary Embolism", ObservationConcept: "dyspnoea_sudden_onset", LRPositive: 3.0, LRNegative: 0.5, Prevalence: 0.05},
	{DiseaseID: "pulmonary_embolism", DiseaseName: "Pulmonary Embolism", ObservationConcept: "pleuritic_chest_pain", LRPositive: 2.5, LRNegative: 0.6, Prevalence: 0.05},
	{DiseaseID: "pulmonary_embolism", DiseaseName: "Pulmonary Embolism", ObservationConcept: "d_dimer_elevated", LRPositive: 2.5, LRNegative: 0.2, Prevalence: 0.05},
	{DiseaseID: "pulmonary_embolism", DiseaseName: "Pulmonary Embolism", ObservationConcept: "ctpa_positive", LRPositive: 50.0, LRNegative: 0.02, Prevalence: 0.05},
	{DiseaseID: "aortic_dissection", DiseaseName: "Aortic Dissection", ObservationConcept: "chest_pain_tearing", LRPositive: 8.0, LRNegative: 0.3, Prevalence: 0.01},
	{DiseaseID: "aortic_dissection", DiseaseName: "Aortic Dissection", ObservationConcept: "bp_differential_arms", LRPositive: 6.0, LRNegative: 0.3, Prevalence: 0.01},
	{DiseaseID: "acute_appendicitis", DiseaseName: "Acute Appendicitis", ObservationConcept: "pain_migration_rlf", LRPositive: 4.0, LRNegative: 0.4, Prevalence: 0.10},
	{DiseaseID: "acute_appendicitis", DiseaseName: "Acute Appendicitis", ObservationConcept: "rebound_tenderness", LRPositive: 3.0, LRNegative: 0.5, Prevalence: 0.10},
	{DiseaseID: "cholecystitis", DiseaseName: "Acute Cholecystitis", ObservationConcept: "murphy_sign", LRPositive: 6.0, LRNegative: 0.3, Prevalence: 0.06},
	{DiseaseID: "pancreatitis", DiseaseName: "Acute Pancreatitis", ObservationConcept: "epigastric_pain", LRPositive: 3.0, LRNegative: 0.5, Prevalence: 0.04},
	{DiseaseID: "pancreatitis", DiseaseName: "Acute Pancreatitis", ObservationConcept: "amylase_elevated", LRPositive: 15.0, LRNegative: 0.1, Prevalence: 0.04},
	{DiseaseID: "malaria", DiseaseName: "Malaria", ObservationConcept: "rigors", LRPositive: 3.0, LRNegative: 0.5, Prevalence: 0.20},
	{DiseaseID: "malaria", DiseaseName: "Malaria", ObservationConcept: "blood_smear_positive", LRPositive: 50.0, LRNegative: 0.05, Prevalence: 0.20},
	{DiseaseID: "sepsis", DiseaseName: "Sepsis", ObservationConcept: "hypotension", LRPositive: 4.0, LRNegative: 0.4, Prevalence: 0.08},
	{DiseaseID: "sepsis", DiseaseName: "Sepsis", ObservationConcept: "lactate_elevated", LRPositive: 5.0, LRNegative: 0.3, Prevalence: 0.08},
	{DiseaseID: "subarachnoid_haemorrhage", DiseaseName: "Subarachnoid Hemorrhage", ObservationConcept: "headache_thunderclap", LRPositive: 10.0, LRNegative: 0.2, Prevalence: 0.01},
	{DiseaseID: "meningitis", DiseaseName: "Meningitis", ObservationConcept: "neck_stiffness", LRPositive: 5.0, LRNegative: 0.3, Prevalence: 0.02},
	{DiseaseID: "meningitis", DiseaseName: "Meningitis", ObservationConcept: "kernig_sign", LRPositive: 4.0, LRNegative: 0.5, Prevalence: 0.02},
	{DiseaseID: "diabetic_ketoacidosis", DiseaseName: "Diabetic Ketoacidosis", ObservationConcept: "hyperglycemia", LRPositive: 5.0, LRNegative: 0.2, Prevalence: 0.03},
	{DiseaseID: "diabetic_ketoacidosis", DiseaseName: "Diabetic Ketoacidosis", ObservationConcept: "ketones_positive", LRPositive: 10.0, LRNegative: 0.1, Prevalence: 0.03},
}

func NewReasoner(repo core.Repository) *Reasoner {
	r := &Reasoner{
		repo:     repo,
		registry: make(map[string][]EvidenceProfile),
	}
	for _, p := range defaultRegistry {
		r.registry[p.ObservationConcept] = append(r.registry[p.ObservationConcept], p)
	}
	return r
}

func (r *Reasoner) RegisterProfile(p EvidenceProfile) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.registry[p.ObservationConcept] = append(r.registry[p.ObservationConcept], p)
}

func (r *Reasoner) Evaluate(encounterID string, sessionID string, observations []*core.HPIObservation, priorProbabilities map[string]float64) ([]*core.DifferentialDiagnosis, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	probs := make(map[string]float64)
	for diseaseID, prob := range priorProbabilities {
		probs[diseaseID] = prob
	}

	supportingEvidence := make(map[string]float64)
	opposingEvidence := make(map[string]float64)
	evidenceDetails := make(map[string][]core.ReasoningEvidence)

	for _, obs := range observations {
		profiles := r.registry[obs.ConceptID]
		for _, profile := range profiles {
			diseaseID := profile.DiseaseID

			lr := profile.LRPositive
			if obs.ValueType == "boolean" && !core.ObservationBoolValue(obs.Value) {
				lr = profile.LRNegative
			} else if obs.ValueType == "string" && core.ObservationStringValue(obs.Value) == "" {
				lr = profile.LRNegative
			} else if obs.Value == nil {
				lr = profile.LRNegative
			}

			priorProb := probs[diseaseID]
			if priorProb == 0 {
				priorProb = profile.Prevalence
				probs[diseaseID] = priorProb
			}

			if priorProb > 0 && priorProb < 1 {
				priorOdds := priorProb / (1 - priorProb)
				posteriorOdds := priorOdds * lr
				posteriorProb := posteriorOdds / (1 + posteriorOdds)
				if posteriorProb < 0.001 {
					posteriorProb = 0.001
				} else if posteriorProb > 0.999 {
					posteriorProb = 0.999
				}
				probs[diseaseID] = posteriorProb
			}

			if lr > 1 {
				supportingEvidence[diseaseID] += math.Log(lr)
			} else if lr < 1 {
				opposingEvidence[diseaseID] += -math.Log(lr)
			}

			evidenceDetails[diseaseID] = append(evidenceDetails[diseaseID], core.ReasoningEvidence{
				ID:              core.GenerateUUID(),
				InferenceID:     diseaseID,
				ObservationID:   obs.ID,
				Weight:          math.Log(lr),
				LikelihoodRatio: lr,
				Direction:       profile.Direction,
				Source:          profile.Source,
				CreatedAt:       time.Now(),
			})
		}
	}

	differentials := make([]*core.DifferentialDiagnosis, 0)
	rank := 1
	for diseaseID, prob := range probs {
		dd := &core.DifferentialDiagnosis{
			ID:              core.GenerateUUID(),
			EncounterID:     encounterID,
			SessionID:       sessionID,
			DiseaseID:       diseaseID,
			DiseaseName:     diseaseName(diseaseID),
			Probability:     math.Round(prob*1000) / 10,
			Confidence:      0.7,
			SupportingScore: supportingEvidence[diseaseID],
			OpposingScore:   opposingEvidence[diseaseID],
			Rank:            rank,
			IsActive:        true,
			IsConfirmed:     false,
			IsExcluded:      false,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}
		differentials = append(differentials, dd)
		rank++
	}

	sort.Slice(differentials, func(i, j int) bool {
		return differentials[i].Probability > differentials[j].Probability
	})

	for i, dd := range differentials {
		dd.Rank = i + 1
	}

	for _, dd := range differentials {
		if r.repo != nil {
			r.repo.SaveDifferential(dd)
			for _, ev := range evidenceDetails[dd.DiseaseID] {
				ev.InferenceID = dd.ID
				r.repo.SaveEvidence(&ev)
			}
		}
	}

	return differentials, nil
}

func (r *Reasoner) RankInvestigations(differentials []*core.DifferentialDiagnosis, topN int) []InvestigationRecommendation {
	recommendations := make([]InvestigationRecommendation, 0)
	seen := make(map[string]bool)

	for _, dd := range differentials {
		if len(recommendations) >= topN && topN > 0 {
			break
		}
		investigations := investigationsForDisease(dd.DiseaseID)
		for _, inv := range investigations {
			if seen[inv.ConceptID] {
				continue
			}
			seen[inv.ConceptID] = true
			inv.ClinicalUrgency = dd.Probability * inv.DiagnosticValue
			recommendations = append(recommendations, inv)
		}
	}

	sort.Slice(recommendations, func(i, j int) bool {
		return recommendations[i].ClinicalUrgency > recommendations[j].ClinicalUrgency
	})
	return recommendations
}

type InvestigationRecommendation struct {
	ConceptID       string  `json:"concept_id"`
	Name            string  `json:"name"`
	Category        string  `json:"category"`
	DiagnosticValue float64 `json:"diagnostic_value"`
	TurnaroundHours int     `json:"turnaround_hours,omitempty"`
	IsBedside       bool    `json:"is_bedside"`
	ClinicalUrgency float64 `json:"clinical_urgency"`
}

func investigationsForDisease(diseaseID string) []InvestigationRecommendation {
	registry := map[string][]InvestigationRecommendation{
		"acute_coronary_syndrome": {
			{ConceptID: "ecg_12_lead", Name: "12-Lead ECG", Category: "cardiac", DiagnosticValue: 0.9, IsBedside: true},
			{ConceptID: "high_sensitivity_troponin", Name: "High-Sensitivity Troponin", Category: "laboratory", DiagnosticValue: 0.95, TurnaroundHours: 1},
		},
		"pulmonary_embolism": {
			{ConceptID: "d_dimer", Name: "D-Dimer", Category: "laboratory", DiagnosticValue: 0.85, TurnaroundHours: 1},
			{ConceptID: "ctpa", Name: "CT Pulmonary Angiogram", Category: "imaging", DiagnosticValue: 0.98, TurnaroundHours: 2},
		},
		"aortic_dissection": {
			{ConceptID: "ct_aortogram", Name: "CT Aortogram", Category: "imaging", DiagnosticValue: 0.99, TurnaroundHours: 1},
		},
		"acute_appendicitis": {
			{ConceptID: "abdominal_ultrasound", Name: "Abdominal Ultrasound", Category: "imaging", DiagnosticValue: 0.8, TurnaroundHours: 1},
			{ConceptID: "ct_abdomen_pelvis", Name: "CT Abdomen/Pelvis", Category: "imaging", DiagnosticValue: 0.97, TurnaroundHours: 2},
		},
		"pancreatitis": {
			{ConceptID: "amylase_lipase", Name: "Serum Amylase/Lipase", Category: "laboratory", DiagnosticValue: 0.95, TurnaroundHours: 1},
		},
		"sepsis": {
			{ConceptID: "blood_cultures_x2", Name: "Blood Cultures x2", Category: "microbiology", DiagnosticValue: 0.8, TurnaroundHours: 48},
			{ConceptID: "lactate", Name: "Lactate", Category: "laboratory", DiagnosticValue: 0.85, IsBedside: true},
		},
		"malaria": {
			{ConceptID: "blood_smear_mps", Name: "Blood Film for Malaria Parasites", Category: "microbiology", DiagnosticValue: 0.95, TurnaroundHours: 1},
			{ConceptID: "rdt_malaria", Name: "RDT", Category: "point_of_care", DiagnosticValue: 0.9, IsBedside: true},
		},
		"meningitis": {
			{ConceptID: "lumbar_puncture_csf", Name: "LP + CSF Analysis", Category: "pathology", DiagnosticValue: 0.98, TurnaroundHours: 1},
		},
		"diabetic_ketoacidosis": {
			{ConceptID: "blood_glucose_stat", Name: "Stat Blood Glucose", Category: "point_of_care", DiagnosticValue: 0.9, IsBedside: true},
			{ConceptID: "capillary_ketones", Name: "Capillary Ketones", Category: "point_of_care", DiagnosticValue: 0.95, IsBedside: true},
		},
		"subarachnoid_haemorrhage": {
			{ConceptID: "ct_head_emergency", Name: "CT Head (non-contrast)", Category: "imaging", DiagnosticValue: 0.95, IsBedside: true},
		},
	}
	return registry[diseaseID]
}

func diseaseName(diseaseID string) string {
	names := map[string]string{
		"acute_coronary_syndrome":  "Acute Coronary Syndrome",
		"pulmonary_embolism":       "Pulmonary Embolism",
		"aortic_dissection":        "Aortic Dissection",
		"acute_appendicitis":       "Acute Appendicitis",
		"cholecystitis":            "Acute Cholecystitis",
		"pancreatitis":             "Acute Pancreatitis",
		"sepsis":                   "Sepsis",
		"malaria":                  "Malaria",
		"meningitis":               "Meningitis",
		"subarachnoid_haemorrhage": "Subarachnoid Hemorrhage",
		"diabetic_ketoacidosis":    "Diabetic Ketoacidosis",
	}
	if name, ok := names[diseaseID]; ok {
		return name
	}
	return diseaseID
}
