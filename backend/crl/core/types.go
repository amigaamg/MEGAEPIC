package core

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

func GenerateUUID() string {
	return uuid.New().String()
}

func ObservationBoolValue(val interface{}) bool {
	if val == nil {
		return false
	}
	switch v := val.(type) {
	case bool:
		return v
	case string:
		return v == "true" || v == "yes" || v == "1" || v == "present"
	case float64:
		return v > 0
	default:
		return false
	}
}

func ObservationStringValue(val interface{}) string {
	if val == nil {
		return ""
	}
	switch v := val.(type) {
	case string:
		return v
	case fmt.Stringer:
		return v.String()
	default:
		return fmt.Sprintf("%v", val)
	}
}

func ObservationNumericValue(val interface{}) float64 {
	if val == nil {
		return 0
	}
	switch v := val.(type) {
	case float64:
		return v
	case int:
		return float64(v)
	case string:
		var f float64
		fmt.Sscanf(v, "%f", &f)
		return f
	default:
		return 0
	}
}

// ============================================================================
// LEVEL 1: ENTITY - Nouns in the clinical domain
// ============================================================================

type EntityType string

const (
	EntityPatient    EntityType = "patient"
	EntityEncounter  EntityType = "encounter"
	EntityClinician  EntityType = "clinician"
	EntityFacility   EntityType = "facility"
	EntityDepartment EntityType = "department"
	EntityDisease    EntityType = "disease"
	EntitySymptom    EntityType = "symptom"
	EntitySign       EntityType = "sign"
	EntityDrug       EntityType = "drug"
	EntityProcedure  EntityType = "procedure"
	EntityInvestigation EntityType = "investigation"
	EntityDiagnosis  EntityType = "diagnosis"
	EntityAllergy    EntityType = "allergy"
	EntityDocument   EntityType = "document"
)

type Entity struct {
	UUID       string     `json:"uuid"`
	Type       EntityType `json:"type"`
	Version    int        `json:"version"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	Deleted    bool       `json:"deleted"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}

// ============================================================================
// LEVEL 2: OBSERVATION - Everything entered by a clinician
// ============================================================================

type ObservationStatus string

const (
	ObservationActive    ObservationStatus = "active"
	ObservationResolved  ObservationStatus = "resolved"
	ObservationUnknown   ObservationStatus = "unknown"
	ObservationWithdrawn ObservationStatus = "withdrawn"
)

type ObservationSource string

const (
	SourcePatient   ObservationSource = "patient"
	SourceClinician ObservationSource = "clinician"
	SourceDevice    ObservationSource = "device"
	SourceLab       ObservationSource = "lab"
	SourceReferral  ObservationSource = "referral"
	SourceSystem    ObservationSource = "system"
)

type Observation struct {
	UUID        string            `json:"uuid"`
	EncounterID string            `json:"encounter_id"`
	EntityID    string            `json:"entity_id"`
	ConceptID   string            `json:"concept_id"`
	Value       interface{}       `json:"value"`
	Unit        string            `json:"unit,omitempty"`
	Source      ObservationSource `json:"source"`
	Confidence  float64           `json:"confidence"`
	ObserverID  string            `json:"observer_id"`
	TimeObserved time.Time        `json:"time_observed"`
	Status      ObservationStatus `json:"status"`
	Version     int               `json:"version"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// ============================================================================
// LEVEL 3: EVENT - Immutable state changes
// ============================================================================

type EventType string

const (
	EventEncounterStarted     EventType = "encounter.started"
	EventEncounterCompleted   EventType = "encounter.completed"
	EventComplaintAdded       EventType = "complaint.added"
	EventHistoryCompleted     EventType = "history.completed"
	EventExamCompleted        EventType = "exam.completed"
	EventLabResultReceived    EventType = "lab.result.received"
	EventDiagnosisUpdated     EventType = "diagnosis.updated"
	EventDiagnosisConfirmed   EventType = "diagnosis.confirmed"
	EventPrescriptionSigned   EventType = "prescription.signed"
	EventPatientAdmitted      EventType = "patient.admitted"
	EventPatientDischarged    EventType = "patient.discharged"
	EventTransferRequested    EventType = "transfer.requested"
	EventRuleTriggered        EventType = "rule.triggered"
	EventAlertRaised          EventType = "alert.raised"
)

type ClinicalEvent struct {
	UUID      string    `json:"uuid"`
	EncounterID string  `json:"encounter_id"`
	EventType EventType `json:"event_type"`
	Payload   map[string]interface{} `json:"payload"`
	Timestamp time.Time `json:"timestamp"`
	UserID    string    `json:"user_id"`
	Version   int       `json:"version"`
}

// ============================================================================
// LEVEL 4: RULE - The CRL Core
// ============================================================================

type RuleCategory string

const (
	CategorySystem       RuleCategory = "SYS"
	CategoryPatient      RuleCategory = "PAT"
	CategoryEncounter    RuleCategory = "ENC"
	CategoryHistory      RuleCategory = "CLI"
	CategoryHPI          RuleCategory = "HPI"
	CategoryExamination  RuleCategory = "EXM"
	CategoryInvestigation RuleCategory = "INV"
	CategoryDiagnosis    RuleCategory = "DX"
	CategoryManagement   RuleCategory = "MGT"
	CategoryDocument     RuleCategory = "DOC"
	CategoryAI           RuleCategory = "AI"
	CategoryQuality      RuleCategory = "QLY"
)

type RulePriority int

const (
	PriorityCritical RulePriority = 100
	PriorityHigh     RulePriority = 80
	PriorityNormal   RulePriority = 50
	PriorityLow      RulePriority = 20
	PriorityOptional RulePriority = 10
)

type RuleStatus string

const (
	RuleActive      RuleStatus = "active"
	RuleInactive    RuleStatus = "inactive"
	RuleDeprecated  RuleStatus = "deprecated"
	RuleTestMode    RuleStatus = "test_mode"
)

type Rule struct {
	UUID        string            `json:"uuid"`
	Code        string            `json:"code"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Category    RuleCategory      `json:"category"`
	Priority    RulePriority      `json:"priority"`
	Status      RuleStatus        `json:"status"`
	Version     string            `json:"version"`
	Conditions  []Condition       `json:"conditions"`
	Actions     []Action          `json:"actions"`
	Exceptions  []Condition       `json:"exceptions,omitempty"`
	Dependencies []string         `json:"dependencies,omitempty"`
	Outputs     []string          `json:"outputs,omitempty"`
	Evidence    string            `json:"evidence,omitempty"`
	Tests       []RuleTestCase    `json:"tests,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// ============================================================================
// LEVEL 4a: CONDITION - The "WHEN" part of a rule
// ============================================================================

type ConditionOperator string

const (
	OpEquals       ConditionOperator = "eq"
	OpNotEquals    ConditionOperator = "neq"
	OpGreaterThan  ConditionOperator = "gt"
	OpLessThan     ConditionOperator = "lt"
	OpGreaterEqual ConditionOperator = "gte"
	OpLessEqual    ConditionOperator = "lte"
	OpIn           ConditionOperator = "in"
	OpNotIn        ConditionOperator = "not_in"
	OpExists       ConditionOperator = "exists"
	OpNotExists    ConditionOperator = "not_exists"
	OpContains     ConditionOperator = "contains"
	OpMatches      ConditionOperator = "matches"
	OpBetween      ConditionOperator = "between"
)

type ConditionJoin string

const (
	JoinAnd ConditionJoin = "and"
	JoinOr  ConditionJoin = "or"
)

type Condition struct {
	Field    string            `json:"field"`
	Operator ConditionOperator `json:"operator"`
	Value    interface{}       `json:"value"`
	Join     ConditionJoin     `json:"join,omitempty"`
	Weight   float64           `json:"weight,omitempty"`
	Negate   bool              `json:"negate,omitempty"`
}

// ============================================================================
// LEVEL 4b: ACTION - The "WHAT" part of a rule
// ============================================================================

type ActionType string

const (
	ActionShowSection      ActionType = "show_section"
	ActionHideSection      ActionType = "hide_section"
	ActionRequireField     ActionType = "require_field"
	ActionRecommendQuestion ActionType = "recommend_question"
	ActionRecommendExam    ActionType = "recommend_exam"
	ActionRecommendInvestigation ActionType = "recommend_investigation"
	ActionCalculateScore   ActionType = "calculate_score"
	ActionTriggerAlert     ActionType = "trigger_alert"
	ActionUpdateProbability ActionType = "update_probability"
	ActionGenerateSummary  ActionType = "generate_summary"
	ActionLockWorkflow     ActionType = "lock_workflow"
	ActionUnlockWorkflow   ActionType = "unlock_workflow"
	ActionRaiseWarning     ActionType = "raise_warning"
	ActionRequestReview    ActionType = "request_review"
	ActionActivatePathway  ActionType = "activate_pathway"
	ActionDeactivatePathway ActionType = "deactivate_pathway"
	ActionInsertSection    ActionType = "insert_section"
	ActionSetDefault       ActionType = "set_default"
	ActionFilterDifferential ActionType = "filter_differential"
	ActionAddDifferential  ActionType = "add_differential"
	ActionRemoveDifferential ActionType = "remove_differential"
	ActionRecommendReferral ActionType = "recommend_referral"
	ActionShowEducation    ActionType = "show_education"
	ActionAutoPopulate     ActionType = "auto_populate"
)

type Action struct {
	Type       ActionType             `json:"type"`
	Target     string                 `json:"target"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
	Priority   int                    `json:"priority,omitempty"`
}

// ============================================================================
// LEVEL 5: INFERENCE - Bayesian evidence update
// ============================================================================

type InferenceDirection string

const (
	DirectionSupports    InferenceDirection = "supports"
	DirectionAgainst     InferenceDirection = "against"
	DirectionStrongly    InferenceDirection = "strongly_supports"
	DirectionExcludes    InferenceDirection = "excludes"
	DirectionRuleOut     InferenceDirection = "rules_out"
	DirectionRuleIn      InferenceDirection = "rules_in"
)

type ClinicalInference struct {
	DiseaseID     string              `json:"disease_id"`
	DiseaseName   string              `json:"disease_name"`
	ObservationID string              `json:"observation_id"`
	Observation   string              `json:"observation"`
	LR            float64             `json:"likelihood_ratio"`
	Weight        float64             `json:"weight"`
	Confidence    float64             `json:"confidence"`
	Direction     InferenceDirection  `json:"direction"`
	Source        string              `json:"source"`
	EvidenceLevel string              `json:"evidence_level"`
}

// ============================================================================
// LEVEL 6: WORKFLOW - State machine for encounters
// ============================================================================

type WorkflowState string

const (
	StateRegistered         WorkflowState = "registered"
	StateTriage             WorkflowState = "triage"
	StateHistory            WorkflowState = "history"
	StateExam               WorkflowState = "examination"
	StateInvestigation      WorkflowState = "investigation"
	StateDiagnosis          WorkflowState = "diagnosis"
	StateTreatment          WorkflowState = "treatment"
	StateMonitoring         WorkflowState = "monitoring"
	StateDisposition        WorkflowState = "disposition"
	StateFollowUp           WorkflowState = "follow_up"
	StateCompleted          WorkflowState = "completed"
	StateCancelled          WorkflowState = "cancelled"
)

type StateTransition struct {
	From        WorkflowState `json:"from"`
	To          WorkflowState `json:"to"`
	Required    []string      `json:"required,omitempty"`
	Blocking    []string      `json:"blocking,omitempty"`
	AutoTrigger bool          `json:"auto_trigger,omitempty"`
}

// ============================================================================
// LEVEL 7: DOCUMENT - Render views of observations
// ============================================================================

type DocumentType string

const (
	DocSOAPNote         DocumentType = "soap_note"
	DocProgressNote     DocumentType = "progress_note"
	DocDischargeSummary DocumentType = "discharge_summary"
	DocReferralLetter   DocumentType = "referral_letter"
	DocClinicNote       DocumentType = "clinic_note"
	DocOperativeNote    DocumentType = "operative_note"
	DocConsultationNote DocumentType = "consultation_note"
	DocDeathSummary     DocumentType = "death_summary"
	DocPrescription     DocumentType = "prescription"
	DocCertificate      DocumentType = "certificate"
)

type DocumentSection struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Order    int    `json:"order"`
	Required bool   `json:"required"`
}

type Document struct {
	UUID         string            `json:"uuid"`
	EncounterID  string            `json:"encounter_id"`
	DocumentType DocumentType      `json:"document_type"`
	Sections     []DocumentSection `json:"sections"`
	GeneratedAt  time.Time         `json:"generated_at"`
	GeneratedBy  string            `json:"generated_by"`
	Status       string            `json:"status"`
	Version      int               `json:"version"`
	SignedAt     *time.Time        `json:"signed_at,omitempty"`
	SignedBy     string            `json:"signed_by,omitempty"`
}

// ============================================================================
// RULE TEST CASE
// ============================================================================

type RuleTestCase struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Given       map[string]interface{} `json:"given"`
	Expected    interface{} `json:"expected"`
	Assertions  []string    `json:"assertions"`
}

// ============================================================================
// ENCOUNTER - Universal encounter object
// ============================================================================

type EncounterStatus string

const (
	EncounterActive    EncounterStatus = "active"
	EncounterPaused    EncounterStatus = "paused"
	EncounterCompleted EncounterStatus = "completed"
	EncounterCancelled EncounterStatus = "cancelled"
)

type VisitType string

const (
	VisitOutpatient     VisitType = "outpatient"
	VisitEmergency      VisitType = "emergency"
	VisitInpatient      VisitType = "inpatient"
	VisitWardRound      VisitType = "ward_round"
	VisitFollowUp       VisitType = "follow_up"
	VisitProcedure      VisitType = "procedure"
	VisitTelemedicine   VisitType = "telemedicine"
	VisitAntenatal      VisitType = "antenatal"
	VisitPostnatal      VisitType = "postnatal"
	VisitHomeVisit      VisitType = "home_visit"
	VisitReferral       VisitType = "referral"
	VisitMDT            VisitType = "mdt"
)

type Priority string

const (
	PriorityImmediate   Priority = "immediate"
	PriorityEmergency   Priority = "emergency"
	PriorityUrgent      Priority = "urgent"
	PrioritySemiUrgent  Priority = "semi_urgent"
	PriorityRoutine     Priority = "routine"
	PriorityElective    Priority = "elective"
)

type Encounter struct {
	ID            string          `json:"id"`
	PatientID     string          `json:"patient_id"`
	ProviderID    string          `json:"provider_id"`
	DepartmentID  string          `json:"department_id"`
	FacilityID    string          `json:"facility_id"`
	VisitType     VisitType       `json:"visit_type"`
	Priority      Priority        `json:"priority"`
	Status        EncounterStatus `json:"status"`
	ClinicalState WorkflowState   `json:"clinical_state"`
	ReasonForVisit string         `json:"reason_for_visit"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// ============================================================================
// PATIENT CONTEXT - Derived from biodata
// ============================================================================

type AgeCategory string

const (
	AgeNeonate   AgeCategory = "neonate"
	AgeInfant    AgeCategory = "infant"
	AgeChild     AgeCategory = "child"
	AgeAdolescent AgeCategory = "adolescent"
	AgeAdult     AgeCategory = "adult"
	AgeOlderAdult AgeCategory = "older_adult"
)

type Sex string

const (
	SexMale   Sex = "male"
	SexFemale Sex = "female"
	SexIntersex Sex = "intersex"
)

type PregnancyStatus string

const (
	PregnancyPregnant       PregnancyStatus = "pregnant"
	PregnancyNotPregnant    PregnancyStatus = "not_pregnant"
	PregnancyUnknown        PregnancyStatus = "unknown"
	PregnancyPostpartum     PregnancyStatus = "postpartum"
	PregnancyPostAbortion   PregnancyStatus = "post_abortion"
)

type PatientContext struct {
	PatientID       string          `json:"patient_id"`
	Age             int             `json:"age"`
	AgeUnit         string          `json:"age_unit"`
	AgeCategory     AgeCategory     `json:"age_category"`
	Sex             Sex             `json:"sex"`
	PregnancyStatus PregnancyStatus `json:"pregnancy_status"`
	IsPregnant      bool            `json:"is_pregnant"`
	HasUterus       bool            `json:"has_uterus"`
	IsPostpartum    bool            `json:"is_postpartum"`
	IsBreastfeeding bool            `json:"is_breastfeeding"`
	IsMenstruating  bool            `json:"is_menstruating"`
	LMP             *time.Time      `json:"lmp,omitempty"`
	WeightKg        float64         `json:"weight_kg,omitempty"`
	HeightCm        float64         `json:"height_cm,omitempty"`
	BMI             float64         `json:"bmi,omitempty"`
	IsDependent     bool            `json:"is_dependent"`
	RequiresGuardian bool           `json:"requires_guardian"`
}

// ============================================================================
// CCO TYPES - Canonical Clinical Observation Model
// ============================================================================

// ComplaintTimeline represents a complaint timeline node (core.complaint_timelines)
type ComplaintTimeline struct {
	ID                string     `json:"id"`
	EncounterID       string     `json:"encounter_id"`
	ParentComplaintID *string    `json:"parent_complaint_id,omitempty"`
	TimelinePosition  int        `json:"timeline_position"`
	OnsetDatetime     time.Time  `json:"onset_datetime"`
	OnsetPrecision    string     `json:"onset_precision"`
	DurationValue     int        `json:"duration_value,omitempty"`
	DurationUnit      string     `json:"duration_unit,omitempty"`
	Status            string     `json:"status"`
	Reporter          string     `json:"reporter"`
	PatientPriority   int        `json:"patient_priority"`
	DoctorPriority    int        `json:"doctor_priority,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// ComplaintConcept stores normalized complaint data (core.complaint_concepts)
type ComplaintConcept struct {
	ID                  string    `json:"id"`
	ComplaintTimelineID string    `json:"complaint_timeline_id"`
	EncounterID         string    `json:"encounter_id"`
	PatientStatement    string    `json:"patient_statement"`
	NormalizedConcept   string    `json:"normalized_concept"`
	BodySystem          string    `json:"body_system"`
	Severity            int       `json:"severity"`
	IsPrimary           bool      `json:"is_primary"`
	Confidence          float64   `json:"confidence"`
	IsActive            bool      `json:"is_active"`
	CreatedAt           time.Time `json:"created_at"`
}

// HPIObservation stores atomic HPI facts (core.hpi_observations)
type HPIObservation struct {
	ID              string      `json:"id"`
	EncounterID     string      `json:"encounter_id"`
	ComplaintID     string      `json:"complaint_id,omitempty"`
	ConceptID       string      `json:"concept_id"`
	Value           interface{} `json:"value"`
	Unit            string      `json:"unit,omitempty"`
	ValueType       string      `json:"value_type"`
	ObservationTime time.Time   `json:"observation_time"`
	Certainty       float64     `json:"certainty"`
	Source          string      `json:"source"`
	EnteredBy       string      `json:"entered_by,omitempty"`
	Version         int         `json:"version"`
	SupersededBy    string      `json:"superseded_by,omitempty"`
}

// ClinicalContext is the runtime clinical context cache (core.clinical_context)
type ClinicalContext struct {
	ID              string    `json:"id"`
	EncounterID     string    `json:"encounter_id"`
	PatientID       string    `json:"patient_id"`
	AgeGroup        string    `json:"age_group"`
	Sex             string    `json:"sex"`
	PregnancyStatus string    `json:"pregnancy_status"`
	Specialty       string    `json:"specialty"`
	Acuity          string    `json:"acuity"`
	CurrentPhase    string    `json:"current_phase"`
	WorkflowState   string    `json:"workflow_state"`
	RiskLevel       string    `json:"risk_level"`
	ActivePathways  []string  `json:"active_pathways"`
	ActiveRules     []string  `json:"active_rules"`
	DerivedAt       time.Time `json:"derived_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// TimelineEntry represents a point on the clinical timeline (core.clinical_timelines)
type TimelineEntry struct {
	ID            string    `json:"id"`
	EncounterID   string    `json:"encounter_id"`
	EventType     string    `json:"event_type"`
	ReferenceTable string   `json:"reference_table,omitempty"`
	ReferenceID   string    `json:"reference_id,omitempty"`
	TimelineDate  time.Time `json:"timeline_date"`
	TimelineOrder int       `json:"timeline_order"`
	Certainty     float64   `json:"certainty"`
	Source        string    `json:"source"`
	Summary       string    `json:"summary,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// ClinicalRelationship links two observations (core.clinical_relationships)
type ClinicalRelationship struct {
	ID                 string    `json:"id"`
	SourceObservation  string    `json:"source_observation"`
	TargetObservation  string    `json:"target_observation"`
	RelationshipType   string    `json:"relationship_type"`
	Confidence         float64   `json:"confidence"`
	Description        string    `json:"description,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
}

// DifferentialDiagnosis is a ranked hypothesis (reasoning.differential_diagnoses)
type DifferentialDiagnosis struct {
	ID              string    `json:"id"`
	EncounterID     string    `json:"encounter_id"`
	SessionID       string    `json:"session_id,omitempty"`
	DiseaseID       string    `json:"disease_id"`
	DiseaseName     string    `json:"disease_name"`
	Probability     float64   `json:"probability"`
	Confidence      float64   `json:"confidence"`
	SupportingScore float64   `json:"supporting_score"`
	OpposingScore   float64   `json:"opposing_score"`
	Rank            int       `json:"rank"`
	IsActive        bool      `json:"is_active"`
	IsConfirmed     bool      `json:"is_confirmed"`
	IsExcluded      bool      `json:"is_excluded"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// ReasoningEvidence links observations to inferences (reasoning.reasoning_evidence)
type ReasoningEvidence struct {
	ID              string    `json:"id"`
	InferenceID     string    `json:"inference_id"`
	ObservationID   string    `json:"observation_id"`
	Weight          float64   `json:"weight"`
	LikelihoodRatio float64   `json:"likelihood_ratio,omitempty"`
	Direction       string    `json:"direction"`
	Source          string    `json:"source,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// ClinicalQuestion represents a dynamic question (knowledge.clinical_questions)
type ClinicalQuestion struct {
	ID                string      `json:"id"`
	ConceptID         string      `json:"concept_id"`
	Question          string      `json:"question"`
	Reason            string      `json:"reason,omitempty"`
	Priority          int         `json:"priority"`
	InformationGain   float64     `json:"information_gain"`
	IsRequired        bool        `json:"is_required"`
	InputType         string      `json:"input_type"`
	Options           interface{} `json:"options,omitempty"`
	ConditionalOn     string      `json:"conditional_on,omitempty"`
	TerminatesOn      string      `json:"terminates_on,omitempty"`
	DocumentationField string     `json:"documentation_field,omitempty"`
	DependsOn         []string    `json:"depends_on,omitempty"`
}

// QuestionSession tracks per-encounter question state (workflow.question_sessions)
type QuestionSession struct {
	ID                     string      `json:"id"`
	EncounterID            string      `json:"encounter_id"`
	QuestionID             string      `json:"question_id"`
	ShownAt                time.Time   `json:"shown_at"`
	AnsweredAt             *time.Time  `json:"answered_at,omitempty"`
	AnswerObservationID    string      `json:"answer_observation_id,omitempty"`
	AnswerValue            interface{} `json:"answer_value,omitempty"`
	WasSkipped             bool        `json:"was_skipped"`
	SkipReason             string      `json:"skip_reason,omitempty"`
	InformationGainRealized float64    `json:"information_gain_realized,omitempty"`
}

// GeneratedSummary is a rendered document (documentation.generated_summaries)
type GeneratedSummary struct {
	ID               string      `json:"id"`
	EncounterID      string      `json:"encounter_id"`
	DocumentType     string      `json:"document_type"`
	TemplateID       string      `json:"template_id,omitempty"`
	Content          interface{} `json:"content"`
	Narrative        string      `json:"narrative,omitempty"`
	ObservationCount int         `json:"observation_count"`
	RuleCount        int         `json:"rule_count"`
	GeneratedAt      time.Time   `json:"generated_at"`
	GeneratedBy      string      `json:"generated_by,omitempty"`
	Version          int         `json:"version"`
}
