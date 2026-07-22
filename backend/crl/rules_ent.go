package crl

import (
	"time"
	"github.com/amexan/backend/crl/core"
)

// ENTRules returns all Ear, Nose, and Throat rules
func ENTRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// ENT-0001: ENT symptom activation
		{
			Code:        "ENT-0001",
			Name:        "Activate ENT Pathway",
			Description: "Activates ENT assessment when ear/nose/throat complaint detected",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "complaint.body_system", Operator: core.OpEquals, Value: "ent"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "ent_assessment"},
				{Type: core.ActionInsertSection, Target: "ent_history"},
				{Type: core.ActionInsertSection, Target: "ear_examination"},
				{Type: core.ActionInsertSection, Target: "nose_examination"},
				{Type: core.ActionInsertSection, Target: "throat_examination"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0002: Ear pain / discharge
		{
			Code:        "ENT-0002",
			Name:        "Ear Symptom History",
			Description: "Comprehensive ear symptom history for otalgia, discharge, or hearing loss",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "ear", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "hearing", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "otalgia", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "tinnitus"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Which ear is affected? (left, right, or both)"},
				{Type: core.ActionRecommendQuestion, Target: "Is there ear pain, discharge, or both?"},
				{Type: core.ActionRecommendQuestion, Target: "If discharge: what color? Any blood or pus?"},
				{Type: core.ActionRecommendQuestion, Target: "Any hearing loss? Sudden or gradual?"},
				{Type: core.ActionRecommendQuestion, Target: "Any ringing in the ear (tinnitus)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any dizziness or vertigo?"},
				{Type: core.ActionRecommendQuestion, Target: "Any recent swimming, water exposure, or foreign body?"},
				{Type: core.ActionRecommendQuestion, Target: "Any fever or recent upper respiratory infection?"},
				{Type: core.ActionRecommendQuestion, Target: "Any ear surgeries in the past?"},
				{Type: core.ActionRequireField, Target: "hearing_status"},
				{Type: core.ActionRequireField, Target: "tympanic_membrane_status"},
				{Type: core.ActionAddDifferential, Target: "otitis_externa"},
				{Type: core.ActionAddDifferential, Target: "otitis_media"},
				{Type: core.ActionAddDifferential, Target: "eustachian_tube_dysfunction"},
				{Type: core.ActionAddDifferential, Target: "foreign_body"},
				{Type: core.ActionAddDifferential, Target: "cholesteatoma"},
				{Type: core.ActionAddDifferential, Target: "sensorineural_hearing_loss"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0003: Nasal / sinus symptoms
		{
			Code:        "ENT-0003",
			Name:        "Nasal and Sinus Symptom History",
			Description: "Comprehensive nasal/sinus history for congestion, discharge, or facial pain",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "nose", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "sinus", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "nasal", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "snoring", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "epistaxis"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Is there nasal congestion, discharge, or both?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the discharge clear, yellow, green, or bloody?"},
				{Type: core.ActionRecommendQuestion, Target: "Any facial pain or pressure? Where?"},
				{Type: core.ActionRecommendQuestion, Target: "Any loss of smell (anosmia)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any history of allergies or hay fever?"},
				{Type: core.ActionRecommendQuestion, Target: "Any nosebleeds? How often? Which side?"},
				{Type: core.ActionRecommendQuestion, Target: "Any snoring or sleep apnea symptoms?"},
				{Type: core.ActionRecommendQuestion, Target: "Any recent trauma to the nose or face?"},
				{Type: core.ActionAddDifferential, Target: "acute_sinusitis"},
				{Type: core.ActionAddDifferential, Target: "allergic_rhinitis"},
				{Type: core.ActionAddDifferential, Target: "nasal_polyps"},
				{Type: core.ActionAddDifferential, Target: "deviated_nasal_septum"},
				{Type: core.ActionAddDifferential, Target: "epistaxis"},
				{Type: core.ActionAddDifferential, Target: "sleep_apnoea"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0004: Sore throat / dysphagia
		{
			Code:        "ENT-0004",
			Name:        "Throat and Swallowing Symptom History",
			Description: "Comprehensive throat/sore throat/dysphagia history",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "sore throat", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "dysphagia", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "swallowing", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "hoarse", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "tonsil"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "How long have you had the sore throat?"},
				{Type: core.ActionRecommendQuestion, Target: "Is swallowing painful (odynophagia) or difficult (dysphagia)?"},
				{Type: core.ActionRecommendQuestion, Target: "Any fever or chills?"},
				{Type: core.ActionRecommendQuestion, Target: "Any voice changes or hoarseness?"},
				{Type: core.ActionRecommendQuestion, Target: "Any cough or sputum production?"},
				{Type: core.ActionRecommendQuestion, Target: "Any neck swelling or lumps?"},
				{Type: core.ActionRecommendQuestion, Target: "Any history of tonsillitis or quinsy?"},
				{Type: core.ActionRequireField, Target: "tonsillar_appearance"},
				{Type: core.ActionRequireField, Target: "cervical_lymphadenopathy"},
				{Type: core.ActionAddDifferential, Target: "tonsillitis"},
				{Type: core.ActionAddDifferential, Target: "pharyngitis"},
				{Type: core.ActionAddDifferential, Target: "peritonsillar_abscess"},
				{Type: core.ActionAddDifferential, Target: "laryngitis"},
				{Type: core.ActionAddDifferential, Target: "gastroesophageal_reflux"},
				{Type: core.ActionAddDifferential, Target: "epiglottitis"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0005: Epiglottitis red flag
		{
			Code:        "ENT-0005",
			Name:        "Epiglottitis Red Flag",
			Description: "Sore throat with drooling, stridor, and respiratory distress is an emergency",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "sore_throat", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "drooling", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "stridor", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "respiratory_distress", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED EPIGLOTTITIS — Do NOT examine throat. Emergency airway management required."},
				{Type: core.ActionLockWorkflow, Target: "throat_examination"},
				{Type: core.ActionRecommendReferral, Target: "ent_emergency"},
				{Type: core.ActionRecommendReferral, Target: "anaesthesia_emergency"},
			},
			Evidence: "Epiglottitis is a life-threatening emergency. Throat examination may precipitate complete airway obstruction.",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0006: ENT examination
		{
			Code:        "ENT-0006",
			Name:        "ENT Examination Modules",
			Description: "Activates ENT examination techniques based on symptoms",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "ent_pathway_active", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendExam, Target: "otoscopy"},
				{Type: core.ActionRecommendExam, Target: "rhinoscopy"},
				{Type: core.ActionRecommendExam, Target: "oral_cavity_examination"},
				{Type: core.ActionRecommendExam, Target: "tonsillar_grading"},
				{Type: core.ActionRecommendExam, Target: "cranial_nerve_examination"},
				{Type: core.ActionRecommendExam, Target: "neck_palpation"},
				{Type: core.ActionRecommendExam, Target: "tuning_fork_tests_rinne_weber"},
				{Type: core.ActionRecommendExam, Target: "whisper_test"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0007: Peritonsillar abscess
		{
			Code:        "ENT-0007",
			Name:        "Peritonsillar Abscess (Quinsy) Assessment",
			Description: "Severe unilateral sore throat with trismus and hot potato voice",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "sore_throat_severe", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "unilateral", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "trismus", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "SUSPECTED PERITONSILLAR ABSCESS — ENT review for drainage"},
				{Type: core.ActionRecommendInvestigation, Target: "needle_aspiration"},
				{Type: core.ActionRecommendReferral, Target: "ent"},
				{Type: core.ActionAddDifferential, Target: "peritonsillar_abscess"},
				{Type: core.ActionUpdateProbability, Target: "peritonsillar_abscess", Parameters: map[string]interface{}{"delta": 2.5}},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENT-0008: Vertigo assessment
		{
			Code:        "ENT-0008",
			Name:        "Vertigo and Dizziness Assessment",
			Description: "Vertigo history with central vs peripheral differentiation",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpContains, Value: "vertigo", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "dizzy", Join: core.JoinOr},
				{Field: "chief_complaint", Operator: core.OpContains, Value: "spinning"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Is it a spinning sensation (vertigo) or lightheadedness?"},
				{Type: core.ActionRecommendQuestion, Target: "Did it start suddenly or gradually?"},
				{Type: core.ActionRecommendQuestion, Target: "How long do episodes last? (seconds, minutes, hours, days)"},
				{Type: core.ActionRecommendQuestion, Target: "Is it triggered by head movement or position change?"},
				{Type: core.ActionRecommendQuestion, Target: "Any associated hearing loss or tinnitus?"},
				{Type: core.ActionRecommendQuestion, Target: "Any nausea or vomiting?"},
				{Type: core.ActionRecommendQuestion, Target: "Any neurological symptoms? (double vision, slurred speech, weakness)"},
				{Type: core.ActionRecommendQuestion, Target: "Any recent viral illness?"},
				{Type: core.ActionRequireField, Target: "nystagmus_type"},
				{Type: core.ActionRequireField, Target: "dix_hallpike_test"},
				{Type: core.ActionAddDifferential, Target: "benign_paroxysmal_positional_vertigo"},
				{Type: core.ActionAddDifferential, Target: "vestibular_neuritis"},
				{Type: core.ActionAddDifferential, Target: "meniere_disease"},
				{Type: core.ActionAddDifferential, Target: "central_vertigo_cva"},
				{Type: core.ActionAddDifferential, Target: "labyrinthitis"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}
