package crl

import (
	"time"
	"github.com/amexan/backend/crl/core"
)

// OrthopedicRules returns all orthopedic surgery rules
func OrthopedicRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// ORTHO-0001: Orthopedic consultation activation
		{
			Code:        "ORTHO-0001",
			Name:        "Activate Orthopedic Pathway",
			Description: "Activates orthopedic assessment when musculoskeletal complaint detected",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "complaint.body_system", Operator: core.OpEquals, Value: "musculoskeletal"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "orthopedic_assessment"},
				{Type: core.ActionInsertSection, Target: "orthopedic_history"},
				{Type: core.ActionInsertSection, Target: "musculoskeletal_examination"},
				{Type: core.ActionInsertSection, Target: "fracture_assessment"},
				{Type: core.ActionInsertSection, Target: "joint_examination"},
				{Type: core.ActionInsertSection, Target: "spinal_assessment"},
			},
			Evidence: "Hutchison's Clinical Methods: Musculoskeletal examination chapter",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0002: Fracture history questions
		{
			Code:        "ORTHO-0002",
			Name:        "Fracture-Specific History",
			Description: "When fracture suspected, ask mechanism, neurovascular status, and deformity",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "orthopedic_pathway_active", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "suspected_fracture", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "What was the mechanism of injury?"},
				{Type: core.ActionRecommendQuestion, Target: "Was there a popping or snapping sound?"},
				{Type: core.ActionRecommendQuestion, Target: "Could you bear weight / use the limb after injury?"},
				{Type: core.ActionRecommendQuestion, Target: "Any numbness, tingling, or weakness distal to injury?"},
				{Type: core.ActionRecommendQuestion, Target: "Any previous fractures or bone problems?"},
				{Type: core.ActionRequireField, Target: "neurovascular_status_distal"},
				{Type: core.ActionRequireField, Target: "deformity_present"},
				{Type: core.ActionRequireField, Target: "open_or_closed_fracture"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0003: Joint pain evaluation
		{
			Code:        "ORTHO-0003",
			Name:        "Joint Pain History",
			Description: "Comprehensive joint pain history for monoarticular or polyarticular presentation",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "joint", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: " arthritis", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "swelling"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Which joints are affected?"},
				{Type: core.ActionRecommendQuestion, Target: "Is it one joint or multiple?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the joint swollen, red, or warm?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the pain worse with movement or at rest?"},
				{Type: core.ActionRecommendQuestion, Target: "Any morning stiffness? How long does it last?"},
				{Type: core.ActionRecommendQuestion, Target: "Any history of trauma to the joint?"},
				{Type: core.ActionRecommendQuestion, Target: "Any previous similar episodes?"},
				{Type: core.ActionRecommendQuestion, Target: "Any skin rash, eye symptoms, or fever?"},
				{Type: core.ActionAddDifferential, Target: "septic_arthritis"},
				{Type: core.ActionAddDifferential, Target: "gout"},
				{Type: core.ActionAddDifferential, Target: "rheumatoid_arthritis"},
				{Type: core.ActionAddDifferential, Target: "osteoarthritis"},
				{Type: core.ActionAddDifferential, Target: "traumatic_arthritis"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0004: Back pain evaluation
		{
			Code:        "ORTHO-0004",
			Name:        "Back Pain Assessment",
			Description: "Structured back pain history with red flag screening",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "back pain", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "spine", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "spinal"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Where exactly is the pain? (cervical, thoracic, lumbar, sacral)"},
				{Type: core.ActionRecommendQuestion, Target: "Did the pain start after an injury or gradually?"},
				{Type: core.ActionRecommendQuestion, Target: "Does the pain radiate to the legs (sciatica)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any numbness or weakness in the legs?"},
				{Type: core.ActionRecommendQuestion, Target: "Any bladder or bowel dysfunction?"},
				{Type: core.ActionRecommendQuestion, Target: "Any fever, weight loss, or night sweats?"},
				{Type: core.ActionRecommendQuestion, Target: "Any history of cancer?"},
				{Type: core.ActionRecommendQuestion, Target: "Any recent trauma or fall?"},
				{Type: core.ActionRecommendQuestion, Target: "Does anything make it better or worse?"},
				{Type: core.ActionRequireField, Target: "red_flag_cauda_equina"},
				{Type: core.ActionRequireField, Target: "red_flag_malignancy"},
				{Type: core.ActionRequireField, Target: "red_flag_infection"},
				{Type: core.ActionRequireField, Target: "red_flag_fracture"},
				{Type: core.ActionAddDifferential, Target: "mechanical_back_pain"},
				{Type: core.ActionAddDifferential, Target: "lumbar_disc_herniation"},
				{Type: core.ActionAddDifferential, Target: "spinal_stenosis"},
				{Type: core.ActionAddDifferential, Target: "vertebral_fracture"},
				{Type: core.ActionAddDifferential, Target: "cauda_equina_syndrome"},
				{Type: core.ActionAddDifferential, Target: "spinal_infection"},
				{Type: core.ActionAddDifferential, Target: "spinal_malignancy"},
			},
			Evidence: "NICE guidelines: Low back pain and sciatica (NG59); Red flags for cauda equina syndrome",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0005: Orthopedic examination
		{
			Code:        "ORTHO-0005",
			Name:        "Orthopedic Examination Modules",
			Description: "Activates examination modules based on affected joint or body part",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "orthopedic_pathway_active", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendExam, Target: "look_feel_move"},
				{Type: core.ActionRecommendExam, Target: "neurovascular_assessment"},
				{Type: core.ActionRecommendExam, Target: "range_of_motion"},
				{Type: core.ActionRecommendExam, Target: "special_tests"},
				{Type: core.ActionRecommendExam, Target: "gait_assessment"},
				{Type: core.ActionRecommendExam, Target: "postural_assessment"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0006: Septic arthritis red flag
		{
			Code:        "ORTHO-0006",
			Name:        "Septic Arthritis Red Flag",
			Description: "Hot, swollen, painful joint with fever requires urgent orthopedic referral",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "joint_swollen_hot", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "fever", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "joint_pain_severe", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED SEPTIC ARTHRITIS — Urgent orthopedic review required"},
				{Type: core.ActionRecommendInvestigation, Target: "urgent_aspiration"},
				{Type: core.ActionRecommendInvestigation, Target: "blood_cultures"},
				{Type: core.ActionRecommendInvestigation, Target: "crp_esr_wcc"},
				{Type: core.ActionRecommendInvestigation, Target: "x_ray_joint"},
				{Type: core.ActionRecommendReferral, Target: "orthopedic_surgery"},
				{Type: core.ActionAddDifferential, Target: "septic_arthritis"},
				{Type: core.ActionUpdateProbability, Target: "septic_arthritis", Parameters: map[string]interface{}{"delta": 3.0}},
			},
			Evidence: "Septic arthritis is an orthopedic emergency. Joint aspiration is diagnostic gold standard.",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0007: Fracture management
		{
			Code:        "ORTHO-0007",
			Name:        "Fracture Management Protocol",
			Description: "Standard fracture management including reduction, immobilization, and follow-up",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "fracture_confirmed", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendExam, Target: "neurovascular_check"},
				{Type: core.ActionRecommendExam, Target: "compartment_syndrome_assessment"},
				{Type: core.ActionRecommendInvestigation, Target: "xray_2_views"},
				{Type: core.ActionRecommendInvestigation, Target: "ct_if_intra_articular"},
				{Type: core.ActionRecommendQuestion, Target: "Is the fracture open or closed?"},
				{Type: core.ActionRecommendQuestion, Target: "Tetanus immunization status?"},
				{Type: core.ActionActivatePathway, Target: "fracture_management"},
				{Type: core.ActionRequireField, Target: "reduction_status"},
				{Type: core.ActionRequireField, Target: "immobilization_type"},
				{Type: core.ActionRequireField, Target: "follow_up_plan"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ORTHO-0008: Compartment syndrome alert
		{
			Code:        "ORTHO-0008",
			Name:        "Compartment Syndrome Red Flag",
			Description: "Pain out of proportion, pallor, pulselessness, paresthesia, paralysis requires emergency fasciotomy",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "pain_out_of_proportion", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "injury_type", Operator: core.OpIn, Value: "fracture,crush,compression"},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED COMPARTMENT SYNDROME — Emergency fasciotomy required"},
				{Type: core.ActionRecommendInvestigation, Target: "compartment_pressure_measurement"},
				{Type: core.ActionRecommendReferral, Target: "orthopedic_emergency"},
				{Type: core.ActionUpdateProbability, Target: "compartment_syndrome", Parameters: map[string]interface{}{"delta": 4.0}},
			},
			Evidence: "Compartment syndrome is a surgical emergency. Delayed fasciotomy >6 hours leads to irreversible damage.",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}
