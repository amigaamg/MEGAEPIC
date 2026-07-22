package crl

import (
	"time"
	"github.com/amexan/backend/crl/core"
)

// OphthalmologyRules returns all ophthalmology rules
func OphthalmologyRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// OPHTH-0001: Eye symptom activation
		{
			Code:        "OPHTH-0001",
			Name:        "Activate Ophthalmology Pathway",
			Description: "Activates ophthalmology assessment when eye/vision complaint detected",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "complaint.body_system", Operator: core.OpEquals, Value: "ophthalmological"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "ophthalmology_assessment"},
				{Type: core.ActionInsertSection, Target: "ophthalmology_history"},
				{Type: core.ActionInsertSection, Target: "eye_examination"},
				{Type: core.ActionInsertSection, Target: "visual_acuity"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// OPHTH-0002: Eye symptom history
		{
			Code:        "OPHTH-0002",
			Name:        "Eye Symptom History",
			Description: "Comprehensive eye symptom history for any eye complaint",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "eye", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "vision", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "blur", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "red eye", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "blind"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Which eye? (left, right, or both)"},
				{Type: core.ActionRecommendQuestion, Target: "Is the vision affected? Blurred, double, or loss?"},
				{Type: core.ActionRecommendQuestion, Target: "Was onset sudden or gradual?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the eye painful or painless?"},
				{Type: core.ActionRecommendQuestion, Target: "Any redness, discharge, or swelling?"},
				{Type: core.ActionRecommendQuestion, Target: "Any sensitivity to light (photophobia)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any flashing lights or floaters?"},
				{Type: core.ActionRecommendQuestion, Target: "Any curtain or shadow over vision?"},
				{Type: core.ActionRecommendQuestion, Target: "Any eye trauma or foreign body?"},
				{Type: core.ActionRecommendQuestion, Target: "Any contact lens use?"},
				{Type: core.ActionRecommendQuestion, Target: "Any known eye conditions (glaucoma, cataracts, diabetes)?"},
				{Type: core.ActionRequireField, Target: "visual_acuity_measured"},
				{Type: core.ActionRequireField, Target: "pupil_reactions"},
				{Type: core.ActionAddDifferential, Target: "conjunctivitis"},
				{Type: core.ActionAddDifferential, Target: "keratitis"},
				{Type: core.ActionAddDifferential, Target: "acute_angle_closure_glaucoma"},
				{Type: core.ActionAddDifferential, Target: "cataract"},
				{Type: core.ActionAddDifferential, Target: "retinal_detachment"},
				{Type: core.ActionAddDifferential, Target: "optic_neuritis"},
				{Type: core.ActionAddDifferential, Target: "temporal_arteritis"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// OPHTH-0003: Acute angle closure glaucoma red flag
		{
			Code:        "OPHTH-0003",
			Name:        "Acute Angle Closure Glaucoma Red Flag",
			Description: "Red, painful eye with blurred vision, halos, and fixed mid-dilated pupil requires emergency ophthalmology",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "eye_pain_severe", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "eye_redness", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "blurred_vision", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "halos_around_lights", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED ACUTE ANGLE CLOSURE GLAUCOMA — Emergency ophthalmology review required"},
				{Type: core.ActionRecommendInvestigation, Target: "intraocular_pressure_measurement"},
				{Type: core.ActionRecommendInvestigation, Target: "gonioscopy"},
				{Type: core.ActionRecommendReferral, Target: "ophthalmology_emergency"},
				{Type: core.ActionAddDifferential, Target: "acute_angle_closure_glaucoma"},
				{Type: core.ActionUpdateProbability, Target: "acute_angle_closure_glaucoma", Parameters: map[string]interface{}{"delta": 3.5}},
			},
			Evidence: "Acute angle closure glaucoma is an ophthalmologic emergency requiring immediate IOP reduction.",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// OPHTH-0004: Retinal detachment red flag
		{
			Code:        "OPHTH-0004",
			Name:        "Retinal Detachment Red Flag",
			Description: "Flashes, floaters, and curtain-like vision loss requires urgent ophthalmology",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "flashing_lights", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "new_floaters", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "curtain_over_vision", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED RETINAL DETACHMENT — Urgent ophthalmology review within 24 hours"},
				{Type: core.ActionRecommendInvestigation, Target: "dilated_fundoscopy"},
				{Type: core.ActionRecommendInvestigation, Target: "ocular_ultrasound"},
				{Type: core.ActionRecommendReferral, Target: "ophthalmology_urgent"},
				{Type: core.ActionUpdateProbability, Target: "retinal_detachment", Parameters: map[string]interface{}{"delta": 3.0}},
			},
			Evidence: "Retinal detachment is a vision-threatening emergency requiring prompt surgical repair.",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// OPHTH-0005: Temporal arteritis red flag
		{
			Code:        "OPHTH-0005",
			Name:        "Temporal Arteritis Red Flag",
			Description: "Headache, scalp tenderness, jaw claudication with vision loss in elderly requires urgent steroids",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpEquals, Value: "older_adult", Join: core.JoinAnd},
				{Field: "headache", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "vision_loss", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "jaw_claudication", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED GIANT CELL ARTERITIS — Urgent high-dose steroids + ophthalmology"},
				{Type: core.ActionRecommendInvestigation, Target: "esr_crp"},
				{Type: core.ActionRecommendInvestigation, Target: "temporal_artery_biopsy"},
				{Type: core.ActionRecommendReferral, Target: "ophthalmology_urgent"},
				{Type: core.ActionRecommendReferral, Target: "rheumatology"},
				{Type: core.ActionUpdateProbability, Target: "giant_cell_arteritis", Parameters: map[string]interface{}{"delta": 3.5}},
			},
			Evidence: "Giant cell arteritis can cause permanent vision loss. Treatment should not wait for biopsy.",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// OPHTH-0006: Eye examination
		{
			Code:        "OPHTH-0006",
			Name:        "Ophthalmology Examination Modules",
			Description: "Activates eye examination techniques based on symptoms",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "ophthalmology_pathway_active", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendExam, Target: "visual_acuity_snellen"},
				{Type: core.ActionRecommendExam, Target: "pupillary_reflexes"},
				{Type: core.ActionRecommendExam, Target: "eye_movements"},
				{Type: core.ActionRecommendExam, Target: "confrontation_visual_fields"},
				{Type: core.ActionRecommendExam, Target: "fundoscopy"},
				{Type: core.ActionRecommendExam, Target: "slit_lamp_examination"},
				{Type: core.ActionRecommendExam, Target: "intraocular_pressure"},
				{Type: core.ActionRecommendExam, Target: "fluorescein_staining"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}
