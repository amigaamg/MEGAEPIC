package crl

import (
	"time"
	"github.com/amexan/backend/crl/core"
)

// DermatologyRules returns all dermatology rules
func DermatologyRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// DERM-0001: Skin lesion / rash assessment
		{
			Code:        "DERM-0001",
			Name:        "Skin Lesion and Rash History",
			Description: "Comprehensive dermatological history for any skin complaint",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "rash", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "skin", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "lesion", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "lump", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "itch"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "When did the skin problem start?"},
				{Type: core.ActionRecommendQuestion, Target: "Where on the body did it start? Has it spread?"},
				{Type: core.ActionRecommendQuestion, Target: "Describe the appearance (red, scaly, blistered, raised, flat, ulcerated)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any itching, pain, or burning?"},
				{Type: core.ActionRecommendQuestion, Target: "Any associated fever or systemic symptoms?"},
				{Type: core.ActionRecommendQuestion, Target: "Any known triggers (foods, medications, stress, sunlight)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any previous similar episodes?"},
				{Type: core.ActionRecommendQuestion, Target: "Any new medications or topical products?"},
				{Type: core.ActionRecommendQuestion, Target: "Any family history of skin conditions?"},
				{Type: core.ActionRequireField, Target: "lesion_morphology"},
				{Type: core.ActionRequireField, Target: "lesion_distribution"},
				{Type: core.ActionRequireField, Target: "lesion_color_size_shape"},
				{Type: core.ActionAddDifferential, Target: "eczema_dermatitis"},
				{Type: core.ActionAddDifferential, Target: "psoriasis"},
				{Type: core.ActionAddDifferential, Target: "urticaria"},
				{Type: core.ActionAddDifferential, Target: "scabies"},
				{Type: core.ActionAddDifferential, Target: "fungal_infection"},
				{Type: core.ActionAddDifferential, Target: "bacterial_infection_cellulitis"},
				{Type: core.ActionAddDifferential, Target: "viral_exanthem"},
				{Type: core.ActionAddDifferential, Target: "drug_reaction"},
				{Type: core.ActionAddDifferential, Target: "skin_malignancy"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DERM-0002: Skin cancer / melanoma screening
		{
			Code:        "DERM-0002",
			Name:        "Skin Cancer / Melanoma Screening (ABCDE)",
			Description: "Suspicious pigmented lesion assessment using ABCDE criteria",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "pigmented_lesion", Operator: core.OpEquals, Value: true, Join: core.JoinOr},
				{Field: "mole_changing", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "asymmetry"},
				{Type: core.ActionRequireField, Target: "border_irregularity"},
				{Type: core.ActionRequireField, Target: "color_variegation"},
				{Type: core.ActionRequireField, Target: "diameter_greater_6mm"},
				{Type: core.ActionRequireField, Target: "evolution_changing"},
				{Type: core.ActionRecommendQuestion, Target: "Has the mole changed in size, shape, or color?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the lesion itching, bleeding, or crusting?"},
				{Type: core.ActionRecommendQuestion, Target: "Any history of sunburns or tanning bed use?"},
				{Type: core.ActionRecommendQuestion, Target: "Any family history of melanoma?"},
				{Type: core.ActionRecommendQuestion, Target: "Any new mole appearing after age 30?"},
				{Type: core.ActionAddDifferential, Target: "malignant_melanoma"},
				{Type: core.ActionAddDifferential, Target: "basal_cell_carcinoma"},
				{Type: core.ActionAddDifferential, Target: "squamous_cell_carcinoma"},
				{Type: core.ActionAddDifferential, Target: "benign_nevus"},
				{Type: core.ActionAddDifferential, Target: "seborrheic_keratosis"},
				{Type: core.ActionRecommendReferral, Target: "dermatology_for_biopsy"},
			},
			Evidence: "ABCDE criteria for melanoma detection; NICE guideline for skin cancer",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DERM-0003: Cellulitis red flag
		{
			Code:        "DERM-0003",
			Name:        "Cellulitis Severity Assessment",
			Description: "Assesses cellulitis severity and need for IV antibiotics vs admission",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "skin_red_warm_swollen", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "cellulitis_extent"},
				{Type: core.ActionRequireField, Target: "systemic_signs_of_infection"},
				{Type: core.ActionRequireField, Target: "comorbidities_diabetes_immunocompromise"},
				{Type: core.ActionRecommendQuestion, Target: "Did the redness start after an injury or wound?"},
				{Type: core.ActionRecommendQuestion, Target: "Any fever or chills?"},
				{Type: core.ActionRecommendQuestion, Target: "Any red streaks (lymphangitis)?"},
				{Type: core.ActionAddDifferential, Target: "cellulitis"},
				{Type: core.ActionAddDifferential, Target: "erysipelas"},
				{Type: core.ActionAddDifferential, Target: "necrotizing_fasciitis"},
				{Type: core.ActionTriggerAlert, Target: "Necrotizing fasciitis suspected if severe pain out of proportion, bullae, or crepitus"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DERM-0004: Necrotizing fasciitis red flag
		{
			Code:        "DERM-0004",
			Name:        "Necrotizing Fasciitis Red Flag",
			Description: "Severe pain out of proportion, systemic toxicity, crepitus, and rapid spread = surgical emergency",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "pain_out_of_proportion", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "skin_rapidly_spreading", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "systemic_toxicity", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED NECROTIZING FASCIITIS — Emergency surgical debridement, IV antibiotics, ICU"},
				{Type: core.ActionRequireField, Target: "crepitus_on_palpation"},
				{Type: core.ActionRequireField, Target: "lrac_necrotic_risk_score"},
				{Type: core.ActionRecommendInvestigation, Target: "emergency_ct_or_mri"},
				{Type: core.ActionRecommendInvestigation, Target: "blood_cultures"},
				{Type: core.ActionRecommendInvestigation, Target: "fbc_crp_creatinine"},
				{Type: core.ActionRecommendReferral, Target: "general_surgery_emergency"},
				{Type: core.ActionUpdateProbability, Target: "necrotizing_fasciitis", Parameters: map[string]interface{}{"delta": 4.5}},
			},
			Evidence: "Necrotizing fasciitis mortality increases without early surgical intervention. LRINEC score aids diagnosis.",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}
