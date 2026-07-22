package crl

import (
	"time"
	"github.com/amexan/backend/crl/core"
)

// LoadAllClinicalRules returns all rules organized by category.
// This is the master rule repository for AMEXAN Clinical OS.
func LoadAllClinicalRules() []*core.Rule {
	rules := make([]*core.Rule, 0)
	rules = append(rules, PatientClassificationRules()...)
	rules = append(rules, EncounterRules()...)
	rules = append(rules, ChiefComplaintRules()...)
	rules = append(rules, HPIRules()...)
	rules = append(rules, PastMedicalHistoryRules()...)
	rules = append(rules, ObstetricGynecologicRules()...)
	rules = append(rules, PediatricNeonatalRules()...)
	rules = append(rules, ExaminationRules()...)
	rules = append(rules, InvestigationRules()...)
	rules = append(rules, DiagnosticRules()...)
	rules = append(rules, ManagementRules()...)
	rules = append(rules, SurgicalRules()...)
	rules = append(rules, PsychiatricRules()...)
	rules = append(rules, DocumentationRules()...)
	rules = append(rules, SafetyRules()...)
	rules = append(rules, WorkflowRules()...)
	rules = append(rules, OrthopedicRules()...)
	rules = append(rules, ENTRules()...)
	rules = append(rules, OphthalmologyRules()...)
	rules = append(rules, ICURules()...)
	rules = append(rules, CardiologyRules()...)
	rules = append(rules, RespiratoryRules()...)
	rules = append(rules, GastroenterologyRules()...)
	rules = append(rules, NeurologyRules()...)
	rules = append(rules, DermatologyRules()...)
	rules = append(rules, EndocrinologyRules()...)
	return rules
}

// ============================================================================
// LEVEL 1: PATIENT CLASSIFICATION RULES (PAT-0000 series)
// ============================================================================

func PatientClassificationRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// PAT-0001: Age Classification
		{
			Code:        "PAT-0001",
			Name:        "Classify Patient by Age",
			Description: "Determines age category from patient age",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age", Operator: core.OpExists, Join: core.JoinAnd},
			},
			Actions: []core.Action{
				{
					Type: core.ActionCalculateScore,
					Parameters: map[string]interface{}{
						"formula": "age_classification",
					},
				},
			},
			Evidence: "Standard age categorization per WHO and Hutchison's Clinical Methods",
			Tests: []core.RuleTestCase{
				{Name: "Neonate under 28 days", Given: map[string]interface{}{"patient.age": 20, "patient.age_unit": "days"}, Expected: "neonate"},
				{Name: "Adult 20-64", Given: map[string]interface{}{"patient.age": 30, "patient.age_unit": "years"}, Expected: "adult"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0002: Sex-Based Pathway Selection
		{
			Code:        "PAT-0002",
			Name:        "Activate Sex-Specific Pathways",
			Description: "Activates or suppresses sections based on patient sex",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.sex", Operator: core.OpEquals, Value: "male", Join: core.JoinAnd},
			},
			Actions: []core.Action{
				{Type: core.ActionHideSection, Target: "menstrual_history"},
				{Type: core.ActionHideSection, Target: "obstetric_history"},
				{Type: core.ActionHideSection, Target: "pregnancy_screening"},
				{Type: core.ActionHideSection, Target: "gynecologic_exam"},
				{Type: core.ActionShowSection, Target: "urological_history"},
				{Type: core.ActionShowSection, Target: "prostate_screening"},
			},
			Exceptions: []core.Condition{
				{Field: "patient.sex", Operator: core.OpNotExists},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0003: Female Reproductive Age Pathway
		{
			Code:        "PAT-0003",
			Name:        "Activate Female Reproductive Pathway",
			Description: "Shows obstetric/gynecologic sections for females of reproductive age",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.sex", Operator: core.OpEquals, Value: "female", Join: core.JoinAnd},
				{Field: "patient.age", Operator: core.OpGreaterEqual, Value: 10, Join: core.JoinAnd},
				{Field: "patient.age", Operator: core.OpLessEqual, Value: 55},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "menstrual_history"},
				{Type: core.ActionInsertSection, Target: "obstetric_history"},
				{Type: core.ActionInsertSection, Target: "contraception_history"},
				{Type: core.ActionShowSection, Target: "pregnancy_screening"},
				{Type: core.ActionRequireField, Target: "pregnancy_status"},
				{Type: core.ActionRecommendQuestion, Target: "When was your last menstrual period (LMP)?"},
				{Type: core.ActionRecommendQuestion, Target: "Are you currently sexually active?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there any chance you could be pregnant?"},
			},
			Evidence: "Hutchison's Clinical Methods: Reproductive system history required for females 10-55",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0004: Pregnancy Status Gateway
		{
			Code:        "PAT-0004",
			Name:        "Pregnancy Status Gateway",
			Description: "If pregnant, activate obstetric pathway; if not, proceed with gynecologic",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "pregnancy_status", Operator: core.OpEquals, Value: "pregnant", Join: core.JoinAnd},
				{Field: "patient.sex", Operator: core.OpEquals, Value: "female"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "obstetric_care"},
				{Type: core.ActionHideSection, Target: "gynecologic_exam"},
				{Type: core.ActionInsertSection, Target: "antenatal_history"},
				{Type: core.ActionInsertSection, Target: "obstetric_examination"},
				{Type: core.ActionAddDifferential, Target: "pregnancy_related_conditions"},
				{Type: core.ActionRecommendQuestion, Target: "Gestational age?"},
				{Type: core.ActionRecommendQuestion, Target: "Any previous pregnancies?"},
				{Type: core.ActionRecommendQuestion, Target: "Any antenatal complications?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0005: Pregnancy Status Not Pregnant
		{
			Code:        "PAT-0005",
			Name:        "Non-Pregnant Female Pathway",
			Description: "Activates gynecologic history for non-pregnant females",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "pregnancy_status", Operator: core.OpEquals, Value: "not_pregnant", Join: core.JoinAnd},
				{Field: "patient.sex", Operator: core.OpEquals, Value: "female"},
			},
			Actions: []core.Action{
				{Type: core.ActionShowSection, Target: "gynecologic_history"},
				{Type: core.ActionRecommendQuestion, Target: "Any gynecologic symptoms?"},
				{Type: core.ActionRecommendQuestion, Target: "Any abnormal bleeding?"},
				{Type: core.ActionRecommendQuestion, Target: "Last cervical smear?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0006: Neonate Detection
		{
			Code:        "PAT-0006",
			Name:        "Neonate History Module Activation",
			Description: "If patient is <28 days old, activate neonatal history replacing pediatric/adult",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpEquals, Value: "neonate"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "neonatal_care"},
				{Type: core.ActionInsertSection, Target: "birth_history"},
				{Type: core.ActionInsertSection, Target: "maternal_history"},
				{Type: core.ActionInsertSection, Target: "feeding_history"},
				{Type: core.ActionInsertSection, Target: "neonatal_examination"},
				{Type: core.ActionHideSection, Target: "adult_history"},
				{Type: core.ActionHideSection, Target: "geriatric_history"},
				{Type: core.ActionHideSection, Target: "occupational_history"},
				{Type: core.ActionShowSection, Target: "immunization_history"},
				{Type: core.ActionRequireField, Target: "birth_weight"},
				{Type: core.ActionRequireField, Target: "gestational_age"},
				{Type: core.ActionRequireField, Target: "mode_of_delivery"},
				{Type: core.ActionRequireField, Target: "apgar_scores"},
				{Type: core.ActionRecommendQuestion, Target: "Was the baby full term?"},
				{Type: core.ActionRecommendQuestion, Target: "Any complications during delivery?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the baby breastfeeding?"},
				{Type: core.ActionRecommendQuestion, Target: "Any neonatal jaundice?"},
			},
			Evidence: "Hutchison's Clinical Methods: Neonatal history differs significantly from adult history",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0007: Pediatric (non-neonate)
		{
			Code:        "PAT-0007",
			Name:        "Pediatric History Module Activation",
			Description: "For patients 28 days to 17 years, activate pediatric history",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpIn, Value: "infant,child,adolescent"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "pediatric_care"},
				{Type: core.ActionInsertSection, Target: "birth_history"},
				{Type: core.ActionInsertSection, Target: "developmental_history"},
				{Type: core.ActionInsertSection, Target: "nutritional_history"},
				{Type: core.ActionInsertSection, Target: "immunization_history"},
				{Type: core.ActionInsertSection, Target: "growth_history"},
				{Type: core.ActionHideSection, Target: "adult_pmh"},
				{Type: core.ActionHideSection, Target: "occupational_history"},
				{Type: core.ActionRequireField, Target: "immunization_status"},
				{Type: core.ActionRequireField, Target: "growth_parameters"},
				{Type: core.ActionRecommendQuestion, Target: "Developmental milestones achieved?"},
				{Type: core.ActionRecommendQuestion, Target: "Immunization up to date?"},
				{Type: core.ActionRecommendQuestion, Target: "Any birth complications?"},
				{Type: core.ActionRecommendQuestion, Target: "Feeding history?"},
			},
			Evidence: "Hutchison's Clinical Methods: Pediatric history requires developmental and immunization assessment",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PAT-0008: Geriatric
		{
			Code:        "PAT-0008",
			Name:        "Geriatric History Module Activation",
			Description: "For patients 65+, activate geriatric assessment modules",
			Category:    core.CategoryPatient,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpEquals, Value: "older_adult"},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "functional_status"},
				{Type: core.ActionInsertSection, Target: "falls_assessment"},
				{Type: core.ActionInsertSection, Target: "cognitive_assessment"},
				{Type: core.ActionInsertSection, Target: "polypharmacy_review"},
				{Type: core.ActionInsertSection, Target: "social_support_assessment"},
				{Type: core.ActionRecommendQuestion, Target: "Any falls in the past 6 months?"},
				{Type: core.ActionRecommendQuestion, Target: "Any memory problems?"},
				{Type: core.ActionRecommendQuestion, Target: "Can you manage daily activities independently?"},
				{Type: core.ActionRecommendQuestion, Target: "How many medications do you take regularly?"},
			},
			Evidence: "Hutchison's Clinical Methods: Geriatric assessment requires functional, cognitive, and social evaluation",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 2: ENCOUNTER RULES (ENC-0000 series)
// ============================================================================

func EncounterRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// ENC-0001: Emergency Encounter Protocol
		{
			Code:        "ENC-0001",
			Name:        "Emergency Encounter Protocol - ABCDE First",
			Description: "In emergency, ABCDE assessment takes priority over history",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpEquals, Value: "emergency"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "emergency_care"},
				{Type: core.ActionInsertSection, Target: "abcde_assessment"},
				{Type: core.ActionInsertSection, Target: "triage_vitals"},
				{Type: core.ActionRequireField, Target: "airway_patent"},
				{Type: core.ActionRequireField, Target: "breathing_rate"},
				{Type: core.ActionRequireField, Target: "circulation_status"},
				{Type: core.ActionRequireField, Target: "consciousness_level"},
				{Type: core.ActionRequireField, Target: "triage_priority"},
				{Type: core.ActionRecommendQuestion, Target: "What is the patient's GCS?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the airway compromised?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there active hemorrhage?"},
			},
			Evidence: "ATLS Protocol: ABCDE assessment before detailed history in emergencies",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENC-0002: Outpatient Clinic Protocol
		{
			Code:        "ENC-0002",
			Name:        "Outpatient Clinic Protocol - History First",
			Description: "Standard outpatient: history first, then examination, then plan",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpEquals, Value: "outpatient"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "outpatient_care"},
				{Type: core.ActionShowSection, Target: "chief_complaint"},
				{Type: core.ActionShowSection, Target: "hpi_full"},
				{Type: core.ActionShowSection, Target: "past_medical_history"},
				{Type: core.ActionShowSection, Target: "examination_standard"},
				{Type: core.ActionShowSection, Target: "assessment_plan"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENC-0003: Inpatient Protocol
		{
			Code:        "ENC-0003",
			Name:        "Inpatient Protocol - Full Admission",
			Description: "Full admission workup with all sections",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpIn, Value: "inpatient,ward_round"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "inpatient_care"},
				{Type: core.ActionRequireField, Target: "admission_notes"},
				{Type: core.ActionRequireField, Target: "progress_notes"},
				{Type: core.ActionRequireField, Target: "monitoring_plan"},
				{Type: core.ActionInsertSection, Target: "daily_progress"},
				{Type: core.ActionInsertSection, Target: "nursing_notes"},
				{Type: core.ActionInsertSection, Target: "multidisciplinary_notes"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// ENC-0004: Antenatal Protocol
		{
			Code:        "ENC-0004",
			Name:        "Antenatal Protocol - Obstetric Assessment",
			Description: "Full obstetric assessment for pregnant patients",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpEquals, Value: "antenatal"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "gestational_age"},
				{Type: core.ActionRequireField, Target: "fundal_height"},
				{Type: core.ActionRequireField, Target: "fetal_heart_rate"},
				{Type: core.ActionRequireField, Target: "presentation"},
				{Type: core.ActionRequireField, Target: "bp_measurement"},
				{Type: core.ActionRequireField, Target: "urine_protein"},
				{Type: core.ActionRequireField, Target: "gravida_para"},
				{Type: core.ActionRecommendQuestion, Target: "Any contractions or pain?"},
				{Type: core.ActionRecommendQuestion, Target: "Any vaginal bleeding?"},
				{Type: core.ActionRecommendQuestion, Target: "Fetal movements felt?"},
				{Type: core.ActionRecommendQuestion, Target: "Any swelling of face or hands?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 3: CHIEF COMPLAINT RULES (CLI-2000 series)
// ============================================================================

func ChiefComplaintRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// CLI-2000: Store complaints individually
		{
			Code:        "CLI-2000",
			Name:        "Store Chief Complaints as Individual Events",
			Description: "Each complaint is stored separately with its own timeline",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "complaint_onset"},
				{Type: core.ActionRequireField, Target: "complaint_duration"},
				{Type: core.ActionRequireField, Target: "complaint_severity"},
				{Type: core.ActionRequireField, Target: "complaint_status"},
			},
			Evidence: "Hutchison's Clinical Methods: Record each complaint with onset, duration, and severity",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// CLI-2001: Display complaints chronologically
		{
			Code:        "CLI-2001",
			Name:        "Display Chief Complaints in Chronological Order",
			Description: "Complaints ordered by onset (oldest first), not entry order",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionAutoPopulate, Target: "complaint_display_order", Parameters: map[string]interface{}{
					"method": "chronological",
				}},
			},
			Tests: []core.RuleTestCase{
				{
					Name: "Chronological sorting",
					Given: map[string]interface{}{
						"complaints": []map[string]interface{}{
							{"text": "Foot ulcer", "onset": "3 months ago"},
							{"text": "Fever", "onset": "5 days ago"},
							{"text": "Vomiting", "onset": "1 day ago"},
						},
					},
					Expected: []string{"Foot ulcer", "Fever", "Vomiting"},
				},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// CLI-2002: Chief complaint SOCRATES framework
		{
			Code:        "CLI-2002",
			Name:        "Apply SOCRATES Framework to Each Complaint",
			Description: "Each complaint must have SOCRATES exploration",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "complaint_type", Operator: core.OpEquals, Value: "pain"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "pain_site"},
				{Type: core.ActionRequireField, Target: "pain_onset"},
				{Type: core.ActionRequireField, Target: "pain_character"},
				{Type: core.ActionRequireField, Target: "pain_radiation"},
				{Type: core.ActionRequireField, Target: "pain_associations"},
				{Type: core.ActionRequireField, Target: "pain_time_course"},
				{Type: core.ActionRequireField, Target: "pain_exacerbating"},
				{Type: core.ActionRequireField, Target: "pain_relieving"},
				{Type: core.ActionRequireField, Target: "pain_severity"},
			},
			Evidence: "SOCRATES framework for pain assessment: Site, Onset, Character, Radiation, Associations, Time course, Exacerbating, Relieving, Severity",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 4: HPI RULES (HPI-0000 series)
// ============================================================================

func HPIRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// HPI-0001: HPI must start with significant PMH
		{
			Code:        "HPI-0001",
			Name:        "HPI Narrative Must Begin with Significant Past Medical History",
			Description: "If patient has significant PMH relevant to presentation, HPI starts with known conditions",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "pmh.significant", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionAutoPopulate, Target: "hpi_opening", Parameters: map[string]interface{}{
					"template": "This is a known {{pmh.condition}} patient diagnosed in {{pmh.year}}, on {{pmh.medications}}, with {{pmh.compliance}} adherence, last seen {{pmh.last_visit}}.",
				}},
				{Type: core.ActionRecommendQuestion, Target: "Are your medications being taken as prescribed?"},
				{Type: core.ActionRecommendQuestion, Target: "When were you last seen for your {{pmh.condition}}?"},
				{Type: core.ActionRecommendQuestion, Target: "Have you had any recent admissions for {{pmh.condition}}?"},
			},
			Evidence: "Clinical method: HPI opens with relevant background before describing current illness. Example: 'This is a known type 2 diabetic patient...'",
			Tests: []core.RuleTestCase{
				{
					Name: "Diabetic foot ulcer",
					Given: map[string]interface{}{
						"pmh.condition": "type 2 diabetes mellitus",
						"pmh.year": "2018",
						"pmh.medications": "metformin 500mg BD",
						"pmh.compliance": "irregular",
						"pmh.last_visit": "3 months ago",
					},
					Expected: "This is a known type 2 diabetes mellitus patient diagnosed in 2018, on metformin 500mg BD, with irregular adherence, last seen 3 months ago.",
				},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// HPI-0002: Each complaint gets its own HPI
		{
			Code:        "HPI-0002",
			Name:        "Each Symptom Gets Independent HPI Exploration",
			Description: "Do not mix symptoms in HPI; explore each independently then merge chronologically",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "chief_complaint.count", Operator: core.OpGreaterThan, Value: 1},
			},
			Actions: []core.Action{
				{Type: core.ActionRaiseWarning, Target: "Multiple chief complaints detected - explore each independently"},
				{Type: core.ActionAutoPopulate, Target: "hpi_merge_instructions", Parameters: map[string]interface{}{
					"rule": "chronological_integration",
				}},
			},
			Evidence: "Hutchison's Clinical Methods: Explore each symptom fully before integrating into a timeline",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// HPI-0003: Don't ask duplicate questions
		{
			Code:        "HPI-0003",
			Name:        "Prevent Duplicate Questioning",
			Description: "If information already documented, don't ask again",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "smoking_status", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionHideSection, Target: "smoking_questions"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// HPI-0004: Unknown answers stored as unknown
		{
			Code:        "HPI-0004",
			Name:        "Store Unknown Answers Explicitly",
			Description: "Never infer or fabricate; store 'unknown' explicitly",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "answer_unknown", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionAutoPopulate, Target: "stored_value", Parameters: map[string]interface{}{
					"value": "unknown",
				}},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// HPI-0005: HPI completeness check
		{
			Code:        "HPI-0005",
			Name:        "HPI Completeness Validation",
			Description: "HPI must cover: onset, duration, evolution, current status, and impact on daily life",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "hpi.submitted", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "hpi_onset_complete"},
				{Type: core.ActionRequireField, Target: "hpi_duration_complete"},
				{Type: core.ActionRequireField, Target: "hpi_evolution_complete"},
				{Type: core.ActionRequireField, Target: "hpi_current_status_complete"},
				{Type: core.ActionRequireField, Target: "hpi_functional_impact_complete"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 5: PAST MEDICAL HISTORY RULES (CLI-4000 series)
// ============================================================================

func PastMedicalHistoryRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// PMH-0001: Chronic disease association
		{
			Code:        "CLI-4001",
			Name:        "Chronic Disease Association Check",
			Description: "Check known chronic diseases and their relevance to current presentation",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "foot", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "ulcer", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "wound"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Do you have diabetes mellitus?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you have peripheral vascular disease?"},
				{Type: core.ActionRecommendQuestion, Target: "Have you had any previous foot ulcers?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you smoke?"},
				{Type: core.ActionInsertSection, Target: "diabetes_screening"},
				{Type: core.ActionInsertSection, Target: "vascular_assessment"},
			},
			Evidence: "Diabetic foot ulcers are a common complication of diabetes; peripheral vascular disease must be excluded",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PMH-0002: Surgical history requirement
		{
			Code:        "CLI-4002",
			Name:        "Surgical History for Abdominal Complaints",
			Description: "If abdominal complaint, ask about previous surgeries",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "abdominal", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "abdomen", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "belly"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Have you had any previous abdominal surgeries?"},
				{Type: core.ActionRecommendQuestion, Target: "When was your last surgery?"},
				{Type: core.ActionRecommendQuestion, Target: "Any complications after surgery?"},
				{Type: core.ActionInsertSection, Target: "surgical_history"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PMH-0003: Drug history for all patients
		{
			Code:        "CLI-4003",
			Name:        "Complete Drug History",
			Description: "Document all current medications including OTC and herbal",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.visit_type", Operator: core.OpNotEquals, Value: "emergency"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "current_medications"},
				{Type: core.ActionRequireField, Target: "medication_dosages"},
				{Type: core.ActionRequireField, Target: "medication_frequency"},
				{Type: core.ActionRequireField, Target: "medication_compliance"},
				{Type: core.ActionRequireField, Target: "allergies"},
				{Type: core.ActionRecommendQuestion, Target: "What medications are you currently taking?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you take any traditional/herbal remedies?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you have any drug allergies?"},
			},
			Evidence: "Hutchison's Clinical Methods: Complete drug history including OTC, herbal, and traditional medications",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 6: OBSTETRIC & GYNECOLOGIC RULES
// ============================================================================

func ObstetricGynecologicRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// OBG-0001: Full obstetric history
		{
			Code:        "CLI-4010",
			Name:        "Comprehensive Obstetric History",
			Description: "If female reproductive age, collect full obstetric history",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.sex", Operator: core.OpEquals, Value: "female", Join: core.JoinAnd},
				{Field: "patient.age", Operator: core.OpGreaterEqual, Value: 10, Join: core.JoinAnd},
				{Field: "patient.age", Operator: core.OpLessEqual, Value: 55},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "gravida"},
				{Type: core.ActionRequireField, Target: "para"},
				{Type: core.ActionRequireField, Target: "live_children"},
				{Type: core.ActionRequireField, Target: "miscarriages"},
				{Type: core.ActionRequireField, Target: "terminations"},
				{Type: core.ActionRequireField, Target: "lmp_date"},
				{Type: core.ActionRequireField, Target: "menstrual_cycle"},
				{Type: core.ActionRequireField, Target: "contraception"},
				{Type: core.ActionRecommendQuestion, Target: "How many pregnancies have you had?"},
				{Type: core.ActionRecommendQuestion, Target: "How many live births?"},
				{Type: core.ActionRecommendQuestion, Target: "Any miscarriages or terminations?"},
				{Type: core.ActionRecommendQuestion, Target: "When was your last menstrual period?"},
				{Type: core.ActionRecommendQuestion, Target: "Are your periods regular?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you use any contraception?"},
			},
			Evidence: "Hutchison's Clinical Methods: Full obstetric history in reproductive-age females",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// OBG-0002: Gynecologic review of systems
		{
			Code:        "CLI-4011",
			Name:        "Gynecologic Review of Systems",
			Description: "For females, include gynecologic ROS items",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.sex", Operator: core.OpEquals, Value: "female", Join: core.JoinAnd},
				{Field: "patient.age", Operator: core.OpGreaterEqual, Value: 12},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Any abnormal vaginal bleeding?"},
				{Type: core.ActionRecommendQuestion, Target: "Any vaginal discharge?"},
				{Type: core.ActionRecommendQuestion, Target: "Any pelvic pain?"},
				{Type: core.ActionRecommendQuestion, Target: "When was your last cervical smear?"},
				{Type: core.ActionRecommendQuestion, Target: "Any breast lumps or discharge?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you perform breast self-examination?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 7: PEDIATRIC & NEONATAL RULES
// ============================================================================

func PediatricNeonatalRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// PED-0001: Growth parameters
		{
			Code:        "CLI-4020",
			Name:        "Pediatric Growth Parameters Required",
			Description: "For children, measure and plot growth parameters",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpIn, Value: "neonate,infant,child,adolescent"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "weight"},
				{Type: core.ActionRequireField, Target: "height_length"},
				{Type: core.ActionRequireField, Target: "head_circumference"},
				{Type: core.ActionRequireField, Target: "weight_for_age_percentile"},
				{Type: core.ActionRequireField, Target: "height_for_age_percentile"},
				{Type: core.ActionRequireField, Target: "growth_chart_reference"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PED-0002: Developmental milestones
		{
			Code:        "CLI-4021",
			Name:        "Developmental Milestones Assessment",
			Description: "Age-appropriate developmental screening for children",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpIn, Value: "infant,child"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendQuestion, Target: "Can the child sit without support?"},
				{Type: core.ActionRecommendQuestion, Target: "Can the child walk?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the child talking?"},
				{Type: core.ActionRecommendQuestion, Target: "How many words can the child say?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the child社交 interacting appropriately?"},
				{Type: core.ActionRequireField, Target: "developmental_stage"},
				{Type: core.ActionInsertSection, Target: "milestone_assessment"},
			},
			Evidence: "Hutchison's Clinical Methods: Developmental assessment must be age-appropriate",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PED-0003: Immunization check
		{
			Code:        "CLI-4022",
			Name:        "Immunization Status Check",
			Description: "Verify immunization status for all children",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpIn, Value: "neonate,infant,child,adolescent"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "immunization_status"},
				{Type: core.ActionRequireField, Target: "vaccines_received"},
				{Type: core.ActionRequireField, Target: "last_immunization_date"},
				{Type: core.ActionRecommendQuestion, Target: "Are your child's immunizations up to date?"},
				{Type: core.ActionRecommendQuestion, Target: "Which vaccines has your child received?"},
				{Type: core.ActionRecommendQuestion, Target: "Any reactions to previous vaccines?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 8: EXAMINATION RULES
// ============================================================================

func ExaminationRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// EXM-0001: Universal examination structure
		{
			Code:        "EXM-0001",
			Name:        "Universal Examination Structure",
			Description: "Every examination follows: Inspection, Palpation, Percussion, Auscultation",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "examination", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "exam_inspection"},
				{Type: core.ActionRequireField, Target: "exam_palpation"},
				{Type: core.ActionRequireField, Target: "exam_percussion"},
				{Type: core.ActionRequireField, Target: "exam_auscultation"},
				{Type: core.ActionRequireField, Target: "exam_summary"},
				{Type: core.ActionRequireField, Target: "exam_interpretation"},
			},
			Evidence: "Standard clinical examination follows IPPA sequence",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// EXM-0002: History-driven examination
		{
			Code:        "EXM-0002",
			Name:        "History Must Drive Examination Selection",
			Description: "Examination modules should be activated by history findings",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "chest", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "breathless", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "cough"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "respiratory_examination"},
				{Type: core.ActionInsertSection, Target: "chest_inspection"},
				{Type: core.ActionInsertSection, Target: "chest_palpation"},
				{Type: core.ActionInsertSection, Target: "chest_percussion"},
				{Type: core.ActionInsertSection, Target: "chest_auscultation"},
				{Type: core.ActionRequireField, Target: "respiratory_rate"},
				{Type: core.ActionRequireField, Target: "oxygen_saturation"},
				{Type: core.ActionRequireField, Target: "auscultation_findings"},
				{Type: core.ActionRecommendQuestion, Target: "Any added sounds on auscultation?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there any chest wall tenderness?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// EXM-0003: Cardiovascular exam
		{
			Code:        "EXM-0003",
			Name:        "Cardiovascular Examination Activation",
			Description: "Activate CVS exam for cardiac/chest complaints",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "chest", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "palpitation", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "syncope", Join: core.JoinOr},
				{Field: "pmh.condition", Operator: core.OpContains, Value: "hypertension", Join: core.JoinOr},
				{Field: "pmh.condition", Operator: core.OpContains, Value: "heart"},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "cardiovascular_examination"},
				{Type: core.ActionRequireField, Target: "heart_rate"},
				{Type: core.ActionRequireField, Target: "bp_both_arms"},
				{Type: core.ActionRequireField, Target: "heart_sounds"},
				{Type: core.ActionRequireField, Target: "murmurs"},
				{Type: core.ActionRequireField, Target: "jvp"},
				{Type: core.ActionRequireField, Target: "peripheral_pulses"},
				{Type: core.ActionRequireField, Target: "pedal_edema"},
				{Type: core.ActionRecommendQuestion, Target: "Any murmurs heard?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the JVP elevated?"},
				{Type: core.ActionRecommendQuestion, Target: "Are peripheral pulses present and equal?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// EXM-0004: Abdominal exam
		{
			Code:        "EXM-0004",
			Name:        "Abdominal Examination Activation",
			Description: "Activate abdominal exam for GI complaints",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "abdominal", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "abdomen", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "vomit", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "diarrh", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "constipation"},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "abdominal_examination"},
				{Type: core.ActionRequireField, Target: "abdominal_inspection"},
				{Type: core.ActionRequireField, Target: "abdominal_palpation"},
				{Type: core.ActionRequireField, Target: "abdominal_percussion"},
				{Type: core.ActionRequireField, Target: "abdominal_auscultation"},
				{Type: core.ActionRequireField, Target: "liver_size"},
				{Type: core.ActionRequireField, Target: "spleen_palpable"},
				{Type: core.ActionRequireField, Target: "rebound_tenderness"},
				{Type: core.ActionRequireField, Target: "bowel_sounds"},
				{Type: core.ActionRecommendQuestion, Target: "Any guarding or rigidity?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the liver enlarged?"},
				{Type: core.ActionRecommendQuestion, Target: "Are bowel sounds normal?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// EXM-0005: Neurological exam
		{
			Code:        "EXM-0005",
			Name:        "Neurological Examination Activation",
			Description: "Activate neuro exam for neurological complaints",
			Category:    core.CategoryExamination,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "headache", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "dizzy", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "weakness", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "numbness", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "seizure", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "stroke"},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "neurological_examination"},
				{Type: core.ActionRequireField, Target: "mental_status"},
				{Type: core.ActionRequireField, Target: "cranial_nerves"},
				{Type: core.ActionRequireField, Target: "motor_system"},
				{Type: core.ActionRequireField, Target: "sensory_system"},
				{Type: core.ActionRequireField, Target: "reflexes"},
				{Type: core.ActionRequireField, Target: "coordination"},
				{Type: core.ActionRequireField, Target: "gait"},
				{Type: core.ActionRequireField, Target: "gcs"},
				{Type: core.ActionRecommendQuestion, Target: "What is the GCS?"},
				{Type: core.ActionRecommendQuestion, Target: "Are cranial nerves intact?"},
				{Type: core.ActionRecommendQuestion, Target: "Any focal neurological deficit?"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 9: INVESTIGATION RULES
// ============================================================================

func InvestigationRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// INV-0001: Differential-driven investigations
		{
			Code:        "INV-0001",
			Name:        "Investigations Driven by Active Differential",
			Description: "Recommend investigations based on the active differential diagnosis",
			Category:    core.CategoryInvestigation,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "differential.count", Operator: core.OpGreaterThan, Value: 0},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendInvestigation, Target: "fbc", Parameters: map[string]interface{}{
					"reason": "Baseline for all patients",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "urs_cr_elec", Parameters: map[string]interface{}{
					"reason": "Baseline renal function",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "blood_glucose", Parameters: map[string]interface{}{
					"reason": "Baseline metabolic screen",
				}},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// INV-0002: Chest pain investigations
		{
			Code:        "INV-0002",
			Name:        "Chest Pain Investigation Protocol",
			Description: "ECG and cardiac markers for chest pain patients",
			Category:    core.CategoryInvestigation,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "chest pain"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendInvestigation, Target: "ecg", Parameters: map[string]interface{}{
					"urgency": "immediate",
					"reason": "Rule out ACS",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "troponin", Parameters: map[string]interface{}{
					"urgency": "immediate",
					"reason": "Cardiac biomarker",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "cxr", Parameters: map[string]interface{}{
					"reason": "Rule out pneumothorax, effusion, pneumonia",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "d_dimer", Parameters: map[string]interface{}{
					"condition": "if low-moderate probability",
					"reason": "Rule out PE",
				}},
			},
			Evidence: "ESC Guidelines for ACS; NICE Guidelines for chest pain",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// INV-0003: Diabetic foot investigations
		{
			Code:        "INV-0003",
			Name:        "Diabetic Foot Investigation Protocol",
			Description: "Comprehensive workup for diabetic foot ulcers",
			Category:    core.CategoryInvestigation,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "foot", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "ulcer", Join: core.JoinOr},
				{Field: "pmh.condition", Operator: core.OpContains, Value: "diabetes"},
			},
			Actions: []core.Action{
				{Type: core.ActionRecommendInvestigation, Target: "hba1c", Parameters: map[string]interface{}{
					"reason": "Glycemic control assessment",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "foot_doppler", Parameters: map[string]interface{}{
					"reason": "Peripheral vascular assessment",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "monofilament_test", Parameters: map[string]interface{}{
					"reason": "Peripheral neuropathy assessment",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "wound_swab", Parameters: map[string]interface{}{
					"reason": "Microbiology and sensitivities",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "xray_foot", Parameters: map[string]interface{}{
					"reason": "Rule out osteomyelitis",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "crp_esr", Parameters: map[string]interface{}{
					"reason": "Infection markers",
				}},
			},
			Evidence: "IWGDF Guidelines for Diabetic Foot; NICE NG19",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 10: DIAGNOSTIC RULES
// ============================================================================

func DiagnosticRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// DX-0001: Red flags first
		{
			Code:        "DX-0001",
			Name:        "Red Flag Screening Priority",
			Description: "Always screen for red flags before building differential",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "red_flag_screening"},
				{Type: core.ActionRequireField, Target: "red_flags_screened"},
				{Type: core.ActionRecommendQuestion, Target: "Are there any red flag symptoms?"},
				{Type: core.ActionRecommendQuestion, Target: "Any features of sepsis?"},
				{Type: core.ActionRecommendQuestion, Target: "Any signs of hemodynamic instability?"},
			},
			Evidence: "Hutchison's Clinical Methods: Red flags first, always",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DX-0002: Differential generation
		{
			Code:        "DX-0002",
			Name:        "Generate Differential from History and Exam",
			Description: "Differential diagnosis combines history, exam, and risk factors",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "history_completed", Operator: core.OpEquals, Value: true, Join: core.JoinAnd},
				{Field: "exam_completed", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionUnlockWorkflow, Target: "differential_generation"},
				{Type: core.ActionAutoPopulate, Target: "differential_method", Parameters: map[string]interface{}{
					"method": "bayesian_update",
				}},
				{Type: core.ActionShowSection, Target: "differential_list"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DX-0003: Bayesian probability update
		{
			Code:        "DX-0003",
			Name:        "Bayesian Probability Update Rule",
			Description: "Each finding updates disease probabilities using likelihood ratios",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityNormal,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "observation.positive", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionUpdateProbability, Parameters: map[string]interface{}{
					"delta": 0.15,
					"method": "multiply_lr",
				}},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DX-0004: Diagnosis completeness
		{
			Code:        "DX-0004",
			Name:        "Diagnosis Must Have Supporting Evidence",
			Description: "Every diagnosis must be linked to supporting clinical evidence",
			Category:    core.CategoryDiagnosis,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "final_diagnosis", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "diagnosis_evidence"},
				{Type: core.ActionRequireField, Target: "diagnosis_confidence"},
				{Type: core.ActionRequireField, Target: "diagnosis_type"},
				{Type: core.ActionRequireField, Target: "diagnosis_date"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 11: MANAGEMENT RULES
// ============================================================================

func ManagementRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// MGT-0001: Universal management structure
		{
			Code:        "MGT-0001",
			Name:        "Universal Management Plan Structure",
			Description: "Every management plan follows: immediate, definitive, monitoring, follow-up",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "management_plan", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "immediate_stabilization"},
				{Type: core.ActionRequireField, Target: "definitive_treatment"},
				{Type: core.ActionRequireField, Target: "medication_plan"},
				{Type: core.ActionRequireField, Target: "monitoring_plan"},
				{Type: core.ActionRequireField, Target: "follow_up_plan"},
				{Type: core.ActionRequireField, Target: "patient_education"},
			},
			Evidence: "Standard clinical management plan structure",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// MGT-0002: Evidence-based treatment
		{
			Code:        "MGT-0002",
			Name:        "Treatment Must Be Evidence-Based",
			Description: "Link treatment to diagnosis, severity, patient factors, and guidelines",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "treatment_plan", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "treatment_diagnosis_linked"},
				{Type: core.ActionRequireField, Target: "treatment_guideline_referenced"},
				{Type: core.ActionRequireField, Target: "treatment_dose_appropriate"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// MGT-0003: Diabetic foot management protocol
		{
			Code:        "MGT-0003",
			Name:        "Diabetic Foot Ulcer Management Protocol",
			Description: "Structured management for diabetic foot ulcers",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "diagnosis", Operator: core.OpContains, Value: "diabetic foot"},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "diabetic_foot_care"},
				{Type: core.ActionRecommendQuestion, Target: "Wagner grade of the ulcer?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there active infection?"},
				{Type: core.ActionRecommendQuestion, Target: "Is there evidence of osteomyelitis?"},
				{Type: core.ActionRequireField, Target: "wagner_grade"},
				{Type: core.ActionRequireField, Target: "wound_care_plan"},
				{Type: core.ActionRequireField, Target: "offloading_plan"},
				{Type: core.ActionRequireField, Target: "infection_management"},
				{Type: core.ActionRequireField, Target: "glycemic_target"},
				{Type: core.ActionRequireField, Target: "vascular_surgery_referral"},
			},
			Evidence: "IWGDF Guidelines for Diabetic Foot Management",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 12: SURGICAL RULES
// ============================================================================

func SurgicalRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// SURG-0001: Surgical abdomen pathway
		{
			Code:        "CLI-5001",
			Name:        "Surgical Abdomen Pathway",
			Description: "Activate surgical pathway for acute abdomen",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "acute abdomen", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "abdominal pain", Join: core.JoinOr},
				{Field: "exam.rebound_tenderness", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionActivatePathway, Target: "surgical_abdomen"},
				{Type: core.ActionRequireField, Target: "alvarado_score"},
				{Type: core.ActionRequireField, Target: "surgical_history"},
				{Type: core.ActionRequireField, Target: "last_meal_time"},
				{Type: core.ActionRecommendQuestion, Target: "When did the pain start?"},
				{Type: core.ActionRecommendQuestion, Target: "Is the pain localized or diffuse?"},
				{Type: core.ActionRecommendQuestion, Target: "Any previous abdominal surgeries?"},
				{Type: core.ActionRecommendQuestion, Target: "When did you last eat?"},
				{Type: core.ActionRecommendInvestigation, Target: "abdominal_ct", Parameters: map[string]interface{}{
					"condition": "if peritonism present",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "erect_cxr", Parameters: map[string]interface{}{
					"reason": "Rule out perforation",
				}},
			},
			Evidence: "Alvarado Score for appendicitis; WHO Surgical Safety Checklist",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// SURG-0002: Pre-operative assessment
		{
			Code:        "CLI-5002",
			Name:        "Pre-operative Assessment Requirements",
			Description: "Required assessments before any surgical procedure",
			Category:    core.CategoryManagement,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "procedure_planned", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "preop_assessment"},
				{Type: core.ActionRequireField, Target: "asa_grade"},
				{Type: core.ActionRequireField, Target: "informed_consent"},
				{Type: core.ActionRequireField, Target: "nil_by_mouth_duration"},
				{Type: core.ActionRequireField, Target: "thromboprophylaxis_plan"},
				{Type: core.ActionRequireField, Target: "antibiotic_prophylaxis"},
				{Type: core.ActionRecommendInvestigation, Target: "ecg", Parameters: map[string]interface{}{
					"condition": "if age > 45 or cardiac history",
				}},
				{Type: core.ActionRecommendInvestigation, Target: "chest_xray", Parameters: map[string]interface{}{
					"condition": "if age > 60 or respiratory history",
				}},
			},
			Evidence: "WHO Surgical Safety Checklist; NICE Guidelines for perioperative care",
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 13: PSYCHIATRIC RULES
// ============================================================================

func PsychiatricRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// PSY-0001: Mental state examination
		{
			Code:        "CLI-6001",
			Name:        "Mental State Examination Activation",
			Description: "If psychiatric presentation, activate MSE",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter_type", Operator: core.OpEquals, Value: "psychiatric", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "depressed", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "anxiety", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "hallucination", Join: core.JoinOr},
				{Field: "presenting_complaint", Operator: core.OpContains, Value: "suicidal"},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "mental_state_examination"},
				{Type: core.ActionRequireField, Target: "appearance"},
				{Type: core.ActionRequireField, Target: "behavior"},
				{Type: core.ActionRequireField, Target: "speech"},
				{Type: core.ActionRequireField, Target: "mood"},
				{Type: core.ActionRequireField, Target: "affect"},
				{Type: core.ActionRequireField, Target: "thought_process"},
				{Type: core.ActionRequireField, Target: "thought_content"},
				{Type: core.ActionRequireField, Target: "perception"},
				{Type: core.ActionRequireField, Target: "cognition"},
				{Type: core.ActionRequireField, Target: "insight"},
				{Type: core.ActionRequireField, Target: "judgment"},
				{Type: core.ActionRecommendQuestion, Target: "Do you have any thoughts of harming yourself?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you hear voices or see things others don't?"},
				{Type: core.ActionRecommendQuestion, Target: "Do you have trouble sleeping?"},
				{Type: core.ActionRecommendQuestion, Target: "Have you lost interest in activities?"},
				{Type: core.ActionTriggerAlert, Target: "suicide_risk_assessment", Parameters: map[string]interface{}{
					"required": true,
				}},
			},
			Evidence: "Hutchison's Clinical Methods: Mental state examination for psychiatric presentations",
			CreatedAt: now,
			UpdatedAt: now,
		},

		// PSY-0002: Suicide risk assessment
		{
			Code:        "CLI-6002",
			Name:        "Suicide Risk Assessment Mandatory",
			Description: "If suicidal ideation present, comprehensive risk assessment is mandatory",
			Category:    core.CategoryHistory,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "suicidal_ideation", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionInsertSection, Target: "suicide_risk_assessment"},
				{Type: core.ActionRequireField, Target: "suicide_plan"},
				{Type: core.ActionRequireField, Target: "suicide_means"},
				{Type: core.ActionRequireField, Target: "suicide_intent"},
				{Type: core.ActionRequireField, Target: "protective_factors"},
				{Type: core.ActionRequireField, Target: "risk_level"},
				{Type: core.ActionTriggerAlert, Target: "HIGH_SUICIDE_RISK"},
				{Type: core.ActionLockWorkflow, Target: "discharge"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 14: DOCUMENTATION RULES
// ============================================================================

func DocumentationRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// DOC-0001: SOAP format
		{
			Code:        "DOC-0001",
			Name:        "Clinical Note in SOAP Format",
			Description: "All clinical notes follow Subjective, Objective, Assessment, Plan structure",
			Category:    core.CategoryDocument,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "document.type", Operator: core.OpEquals, Value: "soap_note"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "subjective_section"},
				{Type: core.ActionRequireField, Target: "objective_section"},
				{Type: core.ActionRequireField, Target: "assessment_section"},
				{Type: core.ActionRequireField, Target: "plan_section"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DOC-0002: Discharge summary structure
		{
			Code:        "DOC-0002",
			Name:        "Discharge Summary Mandatory Sections",
			Description: "Discharge summary must include specific sections",
			Category:    core.CategoryDocument,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "document.type", Operator: core.OpEquals, Value: "discharge_summary"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "admission_date"},
				{Type: core.ActionRequireField, Target: "discharge_date"},
				{Type: core.ActionRequireField, Target: "admission_diagnosis"},
				{Type: core.ActionRequireField, Target: "discharge_diagnosis"},
				{Type: core.ActionRequireField, Target: "summary_of_hospital_course"},
				{Type: core.ActionRequireField, Target: "discharge_medications"},
				{Type: core.ActionRequireField, Target: "follow_up_instructions"},
				{Type: core.ActionRequireField, Target: "discharge_condition"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// DOC-0003: Observations vs documents separation
		{
			Code:        "DOC-0003",
			Name:        "Documents Render Observations, Never Duplicate",
			Description: "Documents are views of underlying observations; never store duplicate data",
			Category:    core.CategoryDocument,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "document.generate", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionAutoPopulate, Target: "document_method", Parameters: map[string]interface{}{
					"method": "render_from_observations",
					"source": "encounter_observations",
				}},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 15: SAFETY RULES
// ============================================================================

func SafetyRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// SFT-0001: Allergy check before prescription
		{
			Code:        "QLY-0001",
			Name:        "Allergy Check Before Any Prescription",
			Description: "Must document allergies before prescribing any medication",
			Category:    core.CategoryQuality,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "prescription", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "allergy_status"},
				{Type: core.ActionRequireField, Target: "drug_allergies"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// SFT-0002: Drug interaction check
		{
			Code:        "QLY-0002",
			Name:        "Drug Interaction Check",
			Description: "Check for interactions between new and existing medications",
			Category:    core.CategoryQuality,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "current_medications.count", Operator: core.OpGreaterThan, Value: 0, Join: core.JoinAnd},
				{Field: "new_prescription", Operator: core.OpExists},
			},
			Actions: []core.Action{
				{Type: core.ActionTriggerAlert, Target: "drug_interaction_check"},
				{Type: core.ActionRequireField, Target: "interaction_check_completed"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// SFT-0003: Dosing weight check
		{
			Code:        "QLY-0003",
			Name:        "Weight-Based Dosing Check",
			Description: "For children and certain medications, dose must be weight-based",
			Category:    core.CategoryQuality,
			Priority:    core.PriorityHigh,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "patient.age_category", Operator: core.OpIn, Value: "neonate,infant,child"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "weight_for_dosing"},
				{Type: core.ActionRequireField, Target: "dose_per_kg"},
				{Type: core.ActionRequireField, Target: "max_dose_check"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}

// ============================================================================
// LEVEL 16: WORKFLOW RULES
// ============================================================================

func WorkflowRules() []*core.Rule {
	now := time.Now()
	return []*core.Rule{
		// WRK-0001: Cannot skip to treatment without diagnosis
		{
			Code:        "WRK-0001",
			Name:        "Diagnosis Required Before Treatment",
			Description: "Cannot proceed to treatment without at least a working diagnosis",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.clinical_state", Operator: core.OpEquals, Value: "treatment", Join: core.JoinAnd},
				{Field: "working_diagnosis", Operator: core.OpNotExists},
			},
			Actions: []core.Action{
				{Type: core.ActionLockWorkflow, Target: "treatment"},
				{Type: core.ActionRaiseWarning, Target: "Cannot proceed to treatment without a working diagnosis"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// WRK-0002: Emergency override with audit
		{
			Code:        "WRK-0002",
			Name:        "Emergency Override Requires Audit Trail",
			Description: "In emergency, workflows can be skipped but must be audited",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "override_workflow", Operator: core.OpEquals, Value: true},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "override_reason"},
				{Type: core.ActionRequireField, Target: "override_clinician"},
				{Type: core.ActionTriggerAlert, Target: "workflow_override_audit"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},

		// WRK-0003: Encounter completeness
		{
			Code:        "WRK-0003",
			Name:        "Encounter Completeness Validation",
			Description: "Before closing an encounter, verify all required sections are complete",
			Category:    core.CategoryEncounter,
			Priority:    core.PriorityCritical,
			Status:      core.RuleActive,
			Version:     "1.0.0",
			Conditions: []core.Condition{
				{Field: "encounter.status", Operator: core.OpEquals, Value: "completed"},
			},
			Actions: []core.Action{
				{Type: core.ActionRequireField, Target: "encounter_completeness_check"},
				{Type: core.ActionRequireField, Target: "diagnosis_recorded"},
				{Type: core.ActionRequireField, Target: "management_recorded"},
				{Type: core.ActionRequireField, Target: "disposition_recorded"},
			},
			CreatedAt: now,
			UpdatedAt: now,
		},
	}
}
