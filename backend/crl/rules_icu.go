package crl

import (
	"time"
	"github.com/amexan/backend/crl/core"
)

// ICURules returns all Intensive Care Unit critical care rules
func ICURules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// ICU-0001: ICU / critical care activation
		{
			Code:        "ICU-0001",
			Name:        "Activate Critical Care Pathway",
			Description: "Activates ICU/Critical Care assessment for unstable patients",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpEquals, Value: "emergency", Join: core.JoinOr},
				{Field: "triage_priority", Operator: core.OpIn, Value: "immediate,emergency"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "critical_care"},
				{Type: core.ActionInsertSection, Target: "abcde_assessment"},
				{Type: core.ActionInsertSection, Target: "icu_monitoring"},
				{Type: core.ActionInsertSection, Target: "ventilation_assessment"},
				{Type: core.ActionInsertSection, Target: "hemodynamic_monitoring"},
				{Type: core.ActionRequireField, Target: "airway_patent"},
				{Type: core.ActionRequireField, Target: "breathing_effort"},
				{Type: core.ActionRequireField, Target: "circulation_status"},
				{Type: core.ActionRequireField, Target: "consciousness_level_gcs"},
				{Type: core.ActionRequireField, Target: "oxygen_saturation"},
			},
			Evidence: "ALSO: ABCDE approach for critically ill patients",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0002: Sepsis screening
		{
			Code:        "ICU-0002",
			Name:        "Sepsis Screening (qSOFA/SIRS)",
			Description: "Screens for sepsis using qSOFA criteria: altered mentation, RR>=22, SBP<=100",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "suspected_infection", Operator: core.OpEquals, Value: true, Join: core.JoinOr},
				{Field: "fever", Operator: core.OpEquals, Value: true, Join: core.JoinOr},
				{Field: "hypotension", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Any altered mental status?"},
				{Type: core.ActionRecommendQuestion, Target: "Respiratory rate?"},
				{Type: core.ActionRecommendQuestion, Target: "Systolic blood pressure?"},
				{Type: core.ActionRequireField, Target: "sepsis_screening"},
				{Type: core.ActionRequireField, Target: "source_of_infection"},
				{Type: core.ActionRequireField, Target: "organ_dysfunction_assessment"},
				{Type: core.ActionRecommendInvestigation, Target: "blood_cultures_x2"},
				{Type: core.ActionRecommendInvestigation, Target: "lactate"},
				{Type: core.ActionRecommendInvestigation, Target: "fbc_crp_procalcitonin"},
				{Type: core.ActionRecommendInvestigation, Target: "septic_screen"},
				{Type: core.ActionTriggerAlert, Target: "qSOFA >=2: HIGH RISK OF SEPSIS — Sepsis 6 within 1 hour"},
				{Type: core.ActionAddDifferential, Target: "sepsis"},
				{Type: core.ActionAddDifferential, Target: "septic_shock"},
			},
			Evidence: "Sepsis Trust / Surviving Sepsis Campaign: qSOFA and Sepsis 6 protocol",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0003: Shock classification
		{
			Code:        "ICU-0003",
			Name:        "Shock Classification",
			Description: "Classifies shock type based on clinical features: hypovolemic, cardiogenic, distributive, obstructive",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "hypotension", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "tachycardia", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "signs_of_hypoperfusion", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Is there fluid loss? (hemorrhage, vomiting, diarrhea, burns)"},
				{Type: core.ActionRecommendQuestion, Target: "Is there heart failure or chest pain?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there fever or signs of infection?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there chest pain or difficulty breathing?"},
				{Type: core.ActionRequireField, Target: "cvl_jvp_assessment"},
				{Type: core.ActionRequireField, Target: "skin_perfusion"},
				{Type: core.ActionRequireField, Target: "urine_output"},
				{Type: core.ActionRecommendInvestigation, Target: "arterial_blood_gas"},
				{Type: core.ActionRecommendInvestigation, Target: "lactate"},
				{Type: core.ActionRecommendInvestigation, Target: "echo_focused"},
				{Type: core.ActionAddDifferential, Target: "hypovolemic_shock"},
				{Type: core.ActionAddDifferential, Target: "cardiogenic_shock"},
				{Type: core.ActionAddDifferential, Target: "distributive_shock"},
				{Type: core.ActionAddDifferential, Target: "obstructive_shock"},
			},
			Evidence: "ICU management: Shock classification guides fluid, inotrope, and vasopressor management",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0004: Ventilator management
		{
			Code:        "ICU-0004",
			Name:        "Mechanical Ventilation Assessment",
			Description: "When patient is intubated or in respiratory failure, activates ventilation protocol",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "intubated", Operator: core.OpEquals, Value: true, Join: core.JoinOr},
				{Field: "respiratory_failure", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "mechanical_ventilation"},
				{Type: core.ActionRequireField, Target: "ventilator_mode"},
				{Type: core.ActionRequireField, Target: "fio2"},
				{Type: core.ActionRequireField, Target: "peep"},
				{Type: core.ActionRequireField, Target: "tidal_volume"},
				{Type: core.ActionRequireField, Target: "respiratory_rate_set"},
				{Type: core.ActionRequireField, Target: "abg_results"},
				{Type: core.ActionRequireField, Target: "lung_compliance"},
				{Type: core.ActionRecommendInvestigation, Target: "arterial_blood_gas_q4h"},
				{Type: core.ActionRecommendInvestigation, Target: "cxr_daily"},
			},
			Evidence: "ARDSNet: Lung protective ventilation (6 mL/kg IBW, plateau pressure <30 cmH2O)",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0005: Fluid resuscitation protocol
		{
			Code:        "ICU-0005",
			Name:        "Fluid Resuscitation Protocol",
			Description: "Standardized fluid resuscitation for hypovolemia or shock",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "hypotension", Operator: core.OpEquals, Value: true, Join: core.JoinOr},
				{Field: "shock_state", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendExam, Target: "fluid_responsiveness_assessment"},
				{Type: core.ActionRequireField, Target: "bolus_given"},
				{Type: core.ActionRequireField, Target: "fluid_type"},
				{Type: core.ActionRequireField, Target: "total_fluids_24h"},
				{Type: core.ActionRequireField, Target: "urine_output_hourly"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0006: Vasopressor management
		{
			Code:        "ICU-0006",
			Name:        "Vasopressor and Inotrope Management",
			Description: "Protocol for initiating and titrating vasopressors in shock",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "persistent_hypotension_after_fluids", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendExam, Target: "invasive_arterial_monitoring"},
				{Type: core.ActionRequireField, Target: "vasopressor_type"},
				{Type: core.ActionRequireField, Target: "vasopressor_dose"},
				{Type: core.ActionRequireField, Target: "mean_arterial_pressure_goal"},
				{Type: core.ActionRequireField, Target: "central_venous_access"},
			},
			Evidence: "Surviving Sepsis: Norepinephrine first-line, target MAP >=65 mmHg",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0007: ICU daily review / rounding
		{
			Code:        "ICU-0007",
			Name:        "ICU Daily Review Checklist",
			Description: "Daily ICU round checklist: systems review, sedation, nutrition, lines, plan",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpEquals, Value: "inpatient", Join: core.JoinOr},
				{Field: "critical_care_pathway_active", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "sedation_assessment"},
				{Type: core.ActionInsertSection, Target: "analgesia_assessment"},
				{Type: core.ActionInsertSection, Target: "delirium_screening"},
				{Type: core.ActionInsertSection, Target: "nutrition_assessment"},
				{Type: core.ActionInsertSection, Target: "line_and_tube_review"},
				{Type: core.ActionInsertSection, Target: "vap_prevention"},
				{Type: core.ActionInsertSection, Target: "dvt_prophylaxis"},
				{Type: core.ActionInsertSection, Target: "stress_ulcer_prophylaxis"},
				{Type: core.ActionInsertSection, Target: "mobilisation_plan"},
				{Type: core.ActionRequireField, Target: "richmond_agitation_sedation_scale"},
				{Type: core.ActionRequireField, Target: "cpat_cam_icu_delirium"},
				{Type: core.ActionRequireField, Target: "spontaneous_awakening_trial"},
				{Type: core.ActionRequireField, Target: "spontaneous_breathing_trial"},
			},
			Evidence: "ICU best practices: ABCDEF bundle (Awakening, Breathing, Coordination, Delirium, Early mobility, Family)",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ICU-0008: Acute Kidney Injury
		{
			Code:        "ICU-0008",
			Name:        "Acute Kidney Injury Assessment and Management",
			Description: "KDIGO-based AKI staging and management for critically ill patients",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "creatinine_elevated", Operator: core.OpEquals, Value: true, Join: core.JoinOr},
				{Field: "urine_output_less_than_0.5ml_kg_hr", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "aki_stage_kidgo"},
				{Type: core.ActionRequireField, Target: "urine_output_hourly"},
				{Type: core.ActionRequireField, Target: "creatinine_trend"},
				{Type: core.ActionRequireField, Target: "nephrotoxic_drug_review"},
				{Type: core.ActionRecommendInvestigation, Target: "renal_ultrasound"},
				{Type: core.ActionRecommendInvestigation, Target: "urine_electrolytes"},
				{Type: core.ActionRecommendExam, Target: "fluid_status_assessment"},
			},
			Evidence: "KDIGO Clinical Practice Guidelines for Acute Kidney Injury (2012)",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}
