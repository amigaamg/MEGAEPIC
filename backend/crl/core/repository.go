package core

import (
	"database/sql"
	"encoding/json"
	"time"
)

// Repository defines the data access interface for the CRL engine
// All clinical data flows through this interface — no service touches SQL directly.
type Repository interface {
	// Encounters
	SaveEncounter(*Encounter) error
	GetEncounter(id string) (*Encounter, error)
	UpdateEncounter(*Encounter) error
	ListEncountersByPatient(patientID string) ([]*Encounter, error)

	// Observations (core.observations)
	SaveObservation(*Observation) error
	GetObservations(encounterID string) ([]*Observation, error)
	GetObservationsByConcept(encounterID, conceptID string) ([]*Observation, error)

	// Events (core.clinical_events)
	SaveEvent(*ClinicalEvent) error
	GetEvents(encounterID string) ([]*ClinicalEvent, error)

	// Rules (rules.clinical_rules)
	SaveRule(*Rule) error
	GetRule(code string) (*Rule, error)
	ListRules() ([]*Rule, error)
	ListRulesByCategory(category RuleCategory) ([]*Rule, error)

	// Patients
	SavePatientContext(*PatientContext) error
	GetPatientContext(patientID string) (*PatientContext, error)

	// ----- CCO Model: Complaint Timeline (core.complaint_timelines + core.complaint_concepts) -----
	SaveComplaintTimeline(timeline *ComplaintTimeline) error
	SaveComplaintConcept(concept *ComplaintConcept) error
	GetComplaintsByEncounter(encounterID string) ([]*ComplaintConcept, error)
	GetComplaintTimeline(encounterID string) ([]*ComplaintTimeline, error)

	// ----- CCO Model: HPI Observations (core.hpi_observations) -----
	SaveHPIObservation(obs *HPIObservation) error
	GetHPIObservations(encounterID string) ([]*HPIObservation, error)
	GetHPIObservationsByComplaint(complaintID string) ([]*HPIObservation, error)

	// ----- CCO Model: Clinical Context (core.clinical_context) -----
	SaveClinicalContext(ctx *ClinicalContext) error
	GetClinicalContext(encounterID string) (*ClinicalContext, error)
	UpdateRiskLevel(encounterID string, riskLevel string) error

	// ----- CCO Model: Clinical Timeline (core.clinical_timelines) -----
	SaveTimelineEntry(entry *TimelineEntry) error
	GetTimeline(encounterID string) ([]*TimelineEntry, error)

	// ----- CCO Model: Clinical Relationships (core.clinical_relationships) -----
	SaveRelationship(rel *ClinicalRelationship) error
	GetRelationships(encounterID string) ([]*ClinicalRelationship, error)

	// ----- Reasoning: Differential Diagnoses (reasoning.differential_diagnoses) -----
	SaveDifferential(dd *DifferentialDiagnosis) error
	GetDifferentials(encounterID string) ([]*DifferentialDiagnosis, error)
	UpdateDifferentialProbability(id string, probability float64) error
	ConfirmDifferential(id string) error
	ExcludeDifferential(id string) error

	// ----- Reasoning: Evidence (reasoning.reasoning_evidence) -----
	SaveEvidence(evidence *ReasoningEvidence) error
	GetEvidenceByInference(inferenceID string) ([]*ReasoningEvidence, error)

	// ----- Questions (knowledge.clinical_questions + workflow.question_sessions) -----
	GetQuestionsForConcept(conceptID string) ([]*ClinicalQuestion, error)
	SaveQuestionSession(session *QuestionSession) error
	GetUnansweredQuestions(encounterID string) ([]*QuestionSession, error)

	// ----- Documents (documentation.generated_summaries) -----
	SaveSummary(summary *GeneratedSummary) error
	GetSummaries(encounterID string) ([]*GeneratedSummary, error)
}

// PostgresRepository implements Repository using PostgreSQL
type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) SaveEncounter(e *Encounter) error {
	query := `
		INSERT INTO encounters (id, patient_id, provider_id, department_id, facility_id,
			visit_type, priority, status, clinical_state, reason_for_visit, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			status = $8, clinical_state = $9, updated_at = $12`

	_, err := r.db.Exec(query,
		e.ID, e.PatientID, e.ProviderID, e.DepartmentID, e.FacilityID,
		string(e.VisitType), string(e.Priority), string(e.Status), string(e.ClinicalState),
		e.ReasonForVisit, e.CreatedAt, e.UpdatedAt,
	)
	return err
}

func (r *PostgresRepository) GetEncounter(id string) (*Encounter, error) {
	query := `SELECT id, patient_id, provider_id, department_id, facility_id,
		visit_type, priority, status, clinical_state, reason_for_visit, created_at, updated_at
		FROM encounters WHERE id = $1 AND deleted = false`

	e := &Encounter{}
	var visitType, priority, status, clinicalState string
	err := r.db.QueryRow(query, id).Scan(
		&e.ID, &e.PatientID, &e.ProviderID, &e.DepartmentID, &e.FacilityID,
		&visitType, &priority, &status, &clinicalState,
		&e.ReasonForVisit, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	e.VisitType = VisitType(visitType)
	e.Priority = Priority(priority)
	e.Status = EncounterStatus(status)
	e.ClinicalState = WorkflowState(clinicalState)

	return e, nil
}

func (r *PostgresRepository) UpdateEncounter(e *Encounter) error {
	return r.SaveEncounter(e)
}

func (r *PostgresRepository) ListEncountersByPatient(patientID string) ([]*Encounter, error) {
	query := `SELECT id, patient_id, provider_id, department_id, facility_id,
		visit_type, priority, status, clinical_state, reason_for_visit, created_at, updated_at
		FROM encounters WHERE patient_id = $1 AND deleted = false
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query, patientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var encounters []*Encounter
	for rows.Next() {
		e := &Encounter{}
		var visitType, priority, status, clinicalState string
		if err := rows.Scan(
			&e.ID, &e.PatientID, &e.ProviderID, &e.DepartmentID, &e.FacilityID,
			&visitType, &priority, &status, &clinicalState,
			&e.ReasonForVisit, &e.CreatedAt, &e.UpdatedAt,
		); err != nil {
			return nil, err
		}
		e.VisitType = VisitType(visitType)
		e.Priority = Priority(priority)
		e.Status = EncounterStatus(status)
		e.ClinicalState = WorkflowState(clinicalState)
		encounters = append(encounters, e)
	}

	return encounters, nil
}

func (r *PostgresRepository) SaveObservation(o *Observation) error {
	valueJSON, _ := json.Marshal(o.Value)
	query := `
		INSERT INTO observations (id, encounter_id, entity_id, concept_id, value, unit,
			source, confidence, observer_id, time_observed, status, version)
		VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			value = $5::jsonb, status = $11, version = $12`

	_, err := r.db.Exec(query,
		o.UUID, o.EncounterID, o.EntityID, o.ConceptID, string(valueJSON),
		o.Unit, string(o.Source), o.Confidence, o.ObserverID,
		o.TimeObserved, string(o.Status), o.Version,
	)
	return err
}

func (r *PostgresRepository) GetObservations(encounterID string) ([]*Observation, error) {
	query := `SELECT id, encounter_id, entity_id, concept_id, value, unit,
		source, confidence, observer_id, time_observed, status, version
		FROM observations WHERE encounter_id = $1 AND status != 'withdrawn'
		ORDER BY time_observed ASC`

	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var observations []*Observation
	for rows.Next() {
		o := &Observation{}
		var valueJSON, source, status string
		if err := rows.Scan(
			&o.UUID, &o.EncounterID, &o.EntityID, &o.ConceptID,
			&valueJSON, &o.Unit, &source, &o.Confidence,
			&o.ObserverID, &o.TimeObserved, &status, &o.Version,
		); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(valueJSON), &o.Value)
		o.Source = ObservationSource(source)
		o.Status = ObservationStatus(status)
		observations = append(observations, o)
	}

	return observations, nil
}

func (r *PostgresRepository) GetObservationsByConcept(encounterID, conceptID string) ([]*Observation, error) {
	query := `SELECT id, encounter_id, entity_id, concept_id, value, unit,
		source, confidence, observer_id, time_observed, status, version
		FROM observations WHERE encounter_id = $1 AND concept_id = $2 AND status != 'withdrawn'
		ORDER BY time_observed DESC`

	rows, err := r.db.Query(query, encounterID, conceptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var observations []*Observation
	for rows.Next() {
		o := &Observation{}
		var valueJSON, source, status string
		if err := rows.Scan(
			&o.UUID, &o.EncounterID, &o.EntityID, &o.ConceptID,
			&valueJSON, &o.Unit, &source, &o.Confidence,
			&o.ObserverID, &o.TimeObserved, &status, &o.Version,
		); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(valueJSON), &o.Value)
		o.Source = ObservationSource(source)
		o.Status = ObservationStatus(status)
		observations = append(observations, o)
	}

	return observations, nil
}

func (r *PostgresRepository) SaveEvent(e *ClinicalEvent) error {
	payloadJSON, _ := json.Marshal(e.Payload)
	query := `
		INSERT INTO clinical_events (id, encounter_id, event_type, payload, timestamp, user_id, version)
		VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`

	_, err := r.db.Exec(query,
		e.UUID, e.EncounterID, string(e.EventType), string(payloadJSON),
		e.Timestamp, e.UserID, e.Version,
	)
	return err
}

func (r *PostgresRepository) GetEvents(encounterID string) ([]*ClinicalEvent, error) {
	query := `SELECT id, encounter_id, event_type, payload, timestamp, user_id, version
		FROM clinical_events WHERE encounter_id = $1 ORDER BY timestamp ASC`

	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*ClinicalEvent
	for rows.Next() {
		e := &ClinicalEvent{}
		var eventType, payloadJSON string
		if err := rows.Scan(
			&e.UUID, &e.EncounterID, &eventType, &payloadJSON,
			&e.Timestamp, &e.UserID, &e.Version,
		); err != nil {
			return nil, err
		}
		e.EventType = EventType(eventType)
		json.Unmarshal([]byte(payloadJSON), &e.Payload)
		events = append(events, e)
	}

	return events, nil
}

func (r *PostgresRepository) SaveRule(rule *Rule) error {
	conditionsJSON, _ := json.Marshal(rule.Conditions)
	actionsJSON, _ := json.Marshal(rule.Actions)
	exceptionsJSON, _ := json.Marshal(rule.Exceptions)
	testsJSON, _ := json.Marshal(rule.Tests)

	query := `
		INSERT INTO rules (id, code, name, description, category, priority, status, version,
			conditions, actions, exceptions, dependencies, outputs, evidence, tests, metadata,
			created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
			$9::jsonb, $10::jsonb, $11::jsonb, $12, $13, $14, $15::jsonb, $16::jsonb,
			$17, $18)
		ON CONFLICT (code) DO UPDATE SET
			status = $7, version = $8, updated_at = $18`

	_, err := r.db.Exec(query,
		rule.UUID, rule.Code, rule.Name, rule.Description,
		string(rule.Category), int(rule.Priority), string(rule.Status), rule.Version,
		string(conditionsJSON), string(actionsJSON), string(exceptionsJSON),
		rule.Dependencies, rule.Outputs, rule.Evidence, string(testsJSON),
		"{}", rule.CreatedAt, rule.UpdatedAt,
	)
	return err
}

func (r *PostgresRepository) GetRule(code string) (*Rule, error) {
	query := `SELECT id, code, name, description, category, priority, status, version,
		conditions, actions, exceptions, dependencies, outputs, evidence, tests,
		created_at, updated_at
		FROM rules WHERE code = $1`

	rule := &Rule{}
	var conditionsJSON, actionsJSON, exceptionsJSON, testsJSON string
	var deps, outputs []string

	err := r.db.QueryRow(query, code).Scan(
		&rule.UUID, &rule.Code, &rule.Name, &rule.Description,
		&rule.Category, &rule.Priority, &rule.Status, &rule.Version,
		&conditionsJSON, &actionsJSON, &exceptionsJSON,
		&deps, &outputs, &rule.Evidence, &testsJSON,
		&rule.CreatedAt, &rule.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	json.Unmarshal([]byte(conditionsJSON), &rule.Conditions)
	json.Unmarshal([]byte(actionsJSON), &rule.Actions)
	json.Unmarshal([]byte(exceptionsJSON), &rule.Exceptions)
	json.Unmarshal([]byte(testsJSON), &rule.Tests)
	rule.Dependencies = deps
	rule.Outputs = outputs

	return rule, nil
}

func (r *PostgresRepository) ListRules() ([]*Rule, error) {
	query := `SELECT id, code, name, description, category, priority, status, version,
		conditions, actions, exceptions, dependencies, outputs, evidence, tests,
		created_at, updated_at
		FROM rules ORDER BY priority DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []*Rule
	for rows.Next() {
		rule := &Rule{}
		var conditionsJSON, actionsJSON, exceptionsJSON, testsJSON string
		var deps, outputs []string

		if err := rows.Scan(
			&rule.UUID, &rule.Code, &rule.Name, &rule.Description,
			&rule.Category, &rule.Priority, &rule.Status, &rule.Version,
			&conditionsJSON, &actionsJSON, &exceptionsJSON,
			&deps, &outputs, &rule.Evidence, &testsJSON,
			&rule.CreatedAt, &rule.UpdatedAt,
		); err != nil {
			return nil, err
		}

		json.Unmarshal([]byte(conditionsJSON), &rule.Conditions)
		json.Unmarshal([]byte(actionsJSON), &rule.Actions)
		json.Unmarshal([]byte(exceptionsJSON), &rule.Exceptions)
		json.Unmarshal([]byte(testsJSON), &rule.Tests)
		rule.Dependencies = deps
		rule.Outputs = outputs
		rules = append(rules, rule)
	}

	return rules, nil
}

func (r *PostgresRepository) ListRulesByCategory(category RuleCategory) ([]*Rule, error) {
	allRules, err := r.ListRules()
	if err != nil {
		return nil, err
	}

	var filtered []*Rule
	for _, rule := range allRules {
		if rule.Category == category && rule.Status == RuleActive {
			filtered = append(filtered, rule)
		}
	}
	return filtered, nil
}

func (r *PostgresRepository) SavePatientContext(pc *PatientContext) error {
	query := `
		INSERT INTO patient_contexts (patient_id, age_category, is_pregnant, pregnancy_status,
			has_uterus, is_postpartum, is_breastfeeding, is_menstruating,
			lmp, weight_kg, height_cm, bmi, requires_guardian, derived_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (patient_id) DO UPDATE SET
			age_category = $2, is_pregnant = $3, pregnancy_status = $4,
			has_uterus = $5, derived_at = $14`

	_, err := r.db.Exec(query,
		pc.PatientID, string(pc.AgeCategory), pc.IsPregnant, string(pc.PregnancyStatus),
		pc.HasUterus, pc.IsPostpartum, pc.IsBreastfeeding, pc.IsMenstruating,
		pc.LMP, pc.WeightKg, pc.HeightCm, pc.BMI, pc.IsDependent, time.Now(),
	)
	return err
}

func (r *PostgresRepository) GetPatientContext(patientID string) (*PatientContext, error) {
	query := `SELECT patient_id, age_category, is_pregnant, pregnancy_status,
		has_uterus, is_postpartum, is_breastfeeding, is_menstruating,
		lmp, weight_kg, height_cm, bmi, requires_guardian, derived_at
		FROM patient_contexts WHERE patient_id = $1`

	pc := &PatientContext{}
	var ageCategory, pregnancyStatus string

	err := r.db.QueryRow(query, patientID).Scan(
		&pc.PatientID, &ageCategory, &pc.IsPregnant, &pregnancyStatus,
		&pc.HasUterus, &pc.IsPostpartum, &pc.IsBreastfeeding, &pc.IsMenstruating,
		&pc.LMP, &pc.WeightKg, &pc.HeightCm, &pc.BMI, &pc.IsDependent, &time.Time{},
	)
	if err != nil {
		return nil, err
	}

	pc.AgeCategory = AgeCategory(ageCategory)
	pc.PregnancyStatus = PregnancyStatus(pregnancyStatus)
	return pc, nil
}

// ============================================================================
// CCO REPOSITORY IMPLEMENTATIONS
// ============================================================================

func (r *PostgresRepository) SaveComplaintTimeline(t *ComplaintTimeline) error {
	query := `
		INSERT INTO core.complaint_timelines (id, encounter_id, parent_complaint_id,
			timeline_position, onset_datetime, onset_precision, duration_value, duration_unit,
			status, reporter, patient_priority, doctor_priority)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (id) DO UPDATE SET
			status = $9, timeline_position = $4, updated_at = NOW()`
	_, err := r.db.Exec(query,
		t.ID, t.EncounterID, t.ParentComplaintID, t.TimelinePosition,
		t.OnsetDatetime, t.OnsetPrecision, t.DurationValue, t.DurationUnit,
		t.Status, t.Reporter, t.PatientPriority, t.DoctorPriority)
	return err
}

func (r *PostgresRepository) SaveComplaintConcept(c *ComplaintConcept) error {
	query := `
		INSERT INTO core.complaint_concepts (id, complaint_timeline_id, encounter_id,
			patient_statement, normalized_concept, body_system, severity, is_primary, confidence)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (id) DO UPDATE SET is_active = true`
	_, err := r.db.Exec(query,
		c.ID, c.ComplaintTimelineID, c.EncounterID, c.PatientStatement,
		c.NormalizedConcept, c.BodySystem, c.Severity, c.IsPrimary, c.Confidence)
	return err
}

func (r *PostgresRepository) GetComplaintsByEncounter(encounterID string) ([]*ComplaintConcept, error) {
	query := `SELECT cc.id, cc.complaint_timeline_id, cc.encounter_id, cc.patient_statement,
		cc.normalized_concept, cc.body_system, cc.severity, cc.is_primary, cc.confidence, cc.is_active, cc.created_at
		FROM core.complaint_concepts cc
		JOIN core.complaint_timelines ct ON ct.id = cc.complaint_timeline_id
		WHERE cc.encounter_id = $1 AND cc.is_active = true
		ORDER BY ct.onset_datetime ASC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*ComplaintConcept
	for rows.Next() {
		c := &ComplaintConcept{}
		if err := rows.Scan(&c.ID, &c.ComplaintTimelineID, &c.EncounterID, &c.PatientStatement,
			&c.NormalizedConcept, &c.BodySystem, &c.Severity, &c.IsPrimary, &c.Confidence, &c.IsActive, &c.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, c)
	}
	return result, nil
}

func (r *PostgresRepository) GetComplaintTimeline(encounterID string) ([]*ComplaintTimeline, error) {
	query := `SELECT id, encounter_id, parent_complaint_id, timeline_position,
		onset_datetime, onset_precision, duration_value, duration_unit,
		status, reporter, patient_priority, doctor_priority, created_at, updated_at
		FROM core.complaint_timelines WHERE encounter_id = $1 ORDER BY onset_datetime ASC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*ComplaintTimeline
	for rows.Next() {
		t := &ComplaintTimeline{}
		if err := rows.Scan(&t.ID, &t.EncounterID, &t.ParentComplaintID, &t.TimelinePosition,
			&t.OnsetDatetime, &t.OnsetPrecision, &t.DurationValue, &t.DurationUnit,
			&t.Status, &t.Reporter, &t.PatientPriority, &t.DoctorPriority,
			&t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		result = append(result, t)
	}
	return result, nil
}

func (r *PostgresRepository) SaveHPIObservation(o *HPIObservation) error {
	valJSON, _ := json.Marshal(o.Value)
	query := `
		INSERT INTO core.hpi_observations (id, encounter_id, complaint_id, concept_id, value, unit,
			value_type, observation_time, certainty, source, entered_by, version)
		VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12)`
	_, err := r.db.Exec(query,
		o.ID, o.EncounterID, o.ComplaintID, o.ConceptID, string(valJSON),
		o.Unit, o.ValueType, o.ObservationTime, o.Certainty, o.Source, o.EnteredBy, o.Version)
	return err
}

func (r *PostgresRepository) GetHPIObservations(encounterID string) ([]*HPIObservation, error) {
	query := `SELECT id, encounter_id, complaint_id, concept_id, value, unit,
		value_type, observation_time, certainty, source, entered_by, version
		FROM core.hpi_observations WHERE encounter_id = $1 ORDER BY observation_time ASC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*HPIObservation
	for rows.Next() {
		o := &HPIObservation{}
		var valJSON string
		if err := rows.Scan(&o.ID, &o.EncounterID, &o.ComplaintID, &o.ConceptID,
			&valJSON, &o.Unit, &o.ValueType, &o.ObservationTime, &o.Certainty,
			&o.Source, &o.EnteredBy, &o.Version); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(valJSON), &o.Value)
		result = append(result, o)
	}
	return result, nil
}

func (r *PostgresRepository) GetHPIObservationsByComplaint(complaintID string) ([]*HPIObservation, error) {
	query := `SELECT id, encounter_id, complaint_id, concept_id, value, unit,
		value_type, observation_time, certainty, source, entered_by, version
		FROM core.hpi_observations WHERE complaint_id = $1 ORDER BY observation_time ASC`
	rows, err := r.db.Query(query, complaintID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*HPIObservation
	for rows.Next() {
		o := &HPIObservation{}
		var valJSON string
		if err := rows.Scan(&o.ID, &o.EncounterID, &o.ComplaintID, &o.ConceptID,
			&valJSON, &o.Unit, &o.ValueType, &o.ObservationTime, &o.Certainty,
			&o.Source, &o.EnteredBy, &o.Version); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(valJSON), &o.Value)
		result = append(result, o)
	}
	return result, nil
}

func (r *PostgresRepository) SaveClinicalContext(ctx *ClinicalContext) error {
	query := `
		INSERT INTO core.clinical_context (id, encounter_id, patient_id, age_group, sex,
			pregnancy_status, specialty, acuity, current_phase, workflow_state, risk_level,
			active_pathways, active_rules)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		ON CONFLICT (encounter_id) DO UPDATE SET
			age_group = $4, pregnancy_status = $6, acuity = $8,
			current_phase = $9, workflow_state = $10, risk_level = $11,
			active_pathways = $12, active_rules = $13, updated_at = NOW()`
	_, err := r.db.Exec(query,
		ctx.ID, ctx.EncounterID, ctx.PatientID, ctx.AgeGroup, ctx.Sex,
		ctx.PregnancyStatus, ctx.Specialty, ctx.Acuity, ctx.CurrentPhase,
		ctx.WorkflowState, ctx.RiskLevel, ctx.ActivePathways, ctx.ActiveRules)
	return err
}

func (r *PostgresRepository) GetClinicalContext(encounterID string) (*ClinicalContext, error) {
	query := `SELECT id, encounter_id, patient_id, age_group, sex, pregnancy_status,
		specialty, acuity, current_phase, workflow_state, risk_level,
		active_pathways, active_rules, derived_at, updated_at
		FROM core.clinical_context WHERE encounter_id = $1`
	ctx := &ClinicalContext{}
	err := r.db.QueryRow(query, encounterID).Scan(
		&ctx.ID, &ctx.EncounterID, &ctx.PatientID, &ctx.AgeGroup, &ctx.Sex,
		&ctx.PregnancyStatus, &ctx.Specialty, &ctx.Acuity, &ctx.CurrentPhase,
		&ctx.WorkflowState, &ctx.RiskLevel, &ctx.ActivePathways, &ctx.ActiveRules,
		&ctx.DerivedAt, &ctx.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return ctx, nil
}

func (r *PostgresRepository) UpdateRiskLevel(encounterID string, riskLevel string) error {
	query := `UPDATE core.clinical_context SET risk_level = $2, updated_at = NOW() WHERE encounter_id = $1`
	_, err := r.db.Exec(query, encounterID, riskLevel)
	return err
}

func (r *PostgresRepository) SaveTimelineEntry(e *TimelineEntry) error {
	query := `
		INSERT INTO core.clinical_timelines (id, encounter_id, event_type, reference_table,
			reference_id, timeline_date, timeline_order, certainty, source, summary)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := r.db.Exec(query,
		e.ID, e.EncounterID, e.EventType, e.ReferenceTable,
		e.ReferenceID, e.TimelineDate, e.TimelineOrder, e.Certainty, e.Source, e.Summary)
	return err
}

func (r *PostgresRepository) GetTimeline(encounterID string) ([]*TimelineEntry, error) {
	query := `SELECT id, encounter_id, event_type, reference_table, reference_id,
		timeline_date, timeline_order, certainty, source, summary, created_at
		FROM core.clinical_timelines WHERE encounter_id = $1 ORDER BY timeline_date ASC, timeline_order ASC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*TimelineEntry
	for rows.Next() {
		e := &TimelineEntry{}
		if err := rows.Scan(&e.ID, &e.EncounterID, &e.EventType, &e.ReferenceTable,
			&e.ReferenceID, &e.TimelineDate, &e.TimelineOrder, &e.Certainty,
			&e.Source, &e.Summary, &e.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, nil
}

func (r *PostgresRepository) SaveRelationship(rel *ClinicalRelationship) error {
	query := `
		INSERT INTO core.clinical_relationships (id, source_observation, target_observation,
			relationship_type, confidence, description)
		VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.Exec(query,
		rel.ID, rel.SourceObservation, rel.TargetObservation,
		rel.RelationshipType, rel.Confidence, rel.Description)
	return err
}

func (r *PostgresRepository) GetRelationships(encounterID string) ([]*ClinicalRelationship, error) {
	query := `SELECT cr.id, cr.source_observation, cr.target_observation,
		cr.relationship_type, cr.confidence, cr.description, cr.created_at
		FROM core.clinical_relationships cr
		JOIN core.hpi_observations ho_source ON ho_source.id = cr.source_observation
		WHERE ho_source.encounter_id = $1`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*ClinicalRelationship
	for rows.Next() {
		rel := &ClinicalRelationship{}
		if err := rows.Scan(&rel.ID, &rel.SourceObservation, &rel.TargetObservation,
			&rel.RelationshipType, &rel.Confidence, &rel.Description, &rel.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, rel)
	}
	return result, nil
}

func (r *PostgresRepository) SaveDifferential(dd *DifferentialDiagnosis) error {
	query := `
		INSERT INTO reasoning.differential_diagnoses (id, encounter_id, session_id, disease_id,
			disease_name, probability, confidence, supporting_score, opposing_score, rank, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (id) DO UPDATE SET
			probability = $6, rank = $10, updated_at = NOW()`
	_, err := r.db.Exec(query,
		dd.ID, dd.EncounterID, dd.SessionID, dd.DiseaseID,
		dd.DiseaseName, dd.Probability, dd.Confidence, dd.SupportingScore,
		dd.OpposingScore, dd.Rank, dd.IsActive)
	return err
}

func (r *PostgresRepository) GetDifferentials(encounterID string) ([]*DifferentialDiagnosis, error) {
	query := `SELECT id, encounter_id, session_id, disease_id, disease_name,
		probability, confidence, supporting_score, opposing_score, rank,
		is_active, is_confirmed, is_excluded, created_at, updated_at
		FROM reasoning.differential_diagnoses
		WHERE encounter_id = $1 AND is_active = true ORDER BY rank ASC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*DifferentialDiagnosis
	for rows.Next() {
		dd := &DifferentialDiagnosis{}
		if err := rows.Scan(&dd.ID, &dd.EncounterID, &dd.SessionID, &dd.DiseaseID,
			&dd.DiseaseName, &dd.Probability, &dd.Confidence, &dd.SupportingScore,
			&dd.OpposingScore, &dd.Rank, &dd.IsActive, &dd.IsConfirmed, &dd.IsExcluded,
			&dd.CreatedAt, &dd.UpdatedAt); err != nil {
			return nil, err
		}
		result = append(result, dd)
	}
	return result, nil
}

func (r *PostgresRepository) UpdateDifferentialProbability(id string, probability float64) error {
	query := `UPDATE reasoning.differential_diagnoses SET probability = $2, updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(query, id, probability)
	return err
}

func (r *PostgresRepository) ConfirmDifferential(id string) error {
	_, err := r.db.Exec(`UPDATE reasoning.differential_diagnoses SET is_confirmed = true, updated_at = NOW() WHERE id = $1`, id)
	return err
}

func (r *PostgresRepository) ExcludeDifferential(id string) error {
	_, err := r.db.Exec(`UPDATE reasoning.differential_diagnoses SET is_excluded = true, is_active = false, updated_at = NOW() WHERE id = $1`, id)
	return err
}

func (r *PostgresRepository) SaveEvidence(ev *ReasoningEvidence) error {
	query := `
		INSERT INTO reasoning.reasoning_evidence (id, inference_id, observation_id,
			weight, likelihood_ratio, direction, source)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.Exec(query,
		ev.ID, ev.InferenceID, ev.ObservationID,
		ev.Weight, ev.LikelihoodRatio, ev.Direction, ev.Source)
	return err
}

func (r *PostgresRepository) GetEvidenceByInference(inferenceID string) ([]*ReasoningEvidence, error) {
	query := `SELECT id, inference_id, observation_id, weight, likelihood_ratio, direction, source, created_at
		FROM reasoning.reasoning_evidence WHERE inference_id = $1`
	rows, err := r.db.Query(query, inferenceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*ReasoningEvidence
	for rows.Next() {
		ev := &ReasoningEvidence{}
		if err := rows.Scan(&ev.ID, &ev.InferenceID, &ev.ObservationID,
			&ev.Weight, &ev.LikelihoodRatio, &ev.Direction, &ev.Source, &ev.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, ev)
	}
	return result, nil
}

func (r *PostgresRepository) GetQuestionsForConcept(conceptID string) ([]*ClinicalQuestion, error) {
	query := `SELECT id, concept_id, question, reason, priority, information_gain,
		is_required, input_type, options, conditional_on, terminates_on,
		documentation_field, depends_on
		FROM knowledge.clinical_questions WHERE concept_id = $1 ORDER BY priority, information_gain DESC`
	rows, err := r.db.Query(query, conceptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*ClinicalQuestion
	for rows.Next() {
		q := &ClinicalQuestion{}
		var optsJSON, dependsJSON string
		if err := rows.Scan(&q.ID, &q.ConceptID, &q.Question, &q.Reason, &q.Priority,
			&q.InformationGain, &q.IsRequired, &q.InputType, &optsJSON,
			&q.ConditionalOn, &q.TerminatesOn, &q.DocumentationField, &dependsJSON); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(optsJSON), &q.Options)
		json.Unmarshal([]byte(dependsJSON), &q.DependsOn)
		result = append(result, q)
	}
	return result, nil
}

func (r *PostgresRepository) SaveQuestionSession(s *QuestionSession) error {
	valJSON, _ := json.Marshal(s.AnswerValue)
	query := `
		INSERT INTO workflow.question_sessions (id, encounter_id, question_id,
			shown_at, answered_at, answer_observation_id, answer_value, was_skipped, skip_reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
		ON CONFLICT (encounter_id, question_id) DO UPDATE SET
			answered_at = $5, answer_value = $7::jsonb, was_skipped = $8, skip_reason = $9`
	_, err := r.db.Exec(query,
		s.ID, s.EncounterID, s.QuestionID, s.ShownAt, s.AnsweredAt,
		s.AnswerObservationID, string(valJSON), s.WasSkipped, s.SkipReason)
	return err
}

func (r *PostgresRepository) GetUnansweredQuestions(encounterID string) ([]*QuestionSession, error) {
	query := `SELECT qs.id, qs.encounter_id, qs.question_id, qs.shown_at, qs.answered_at,
		qs.answer_observation_id, qs.answer_value, qs.was_skipped, qs.skip_reason
		FROM workflow.question_sessions qs
		WHERE qs.encounter_id = $1 AND qs.answered_at IS NULL AND qs.was_skipped = false
		ORDER BY qs.shown_at ASC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*QuestionSession
	for rows.Next() {
		s := &QuestionSession{}
		var valJSON string
		if err := rows.Scan(&s.ID, &s.EncounterID, &s.QuestionID, &s.ShownAt,
			&s.AnsweredAt, &s.AnswerObservationID, &valJSON, &s.WasSkipped, &s.SkipReason); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(valJSON), &s.AnswerValue)
		result = append(result, s)
	}
	return result, nil
}

func (r *PostgresRepository) SaveSummary(s *GeneratedSummary) error {
	contentJSON, _ := json.Marshal(s.Content)
	query := `
		INSERT INTO documentation.generated_summaries (id, encounter_id, document_type, template_id,
			content, narrative, observation_count, rule_count, generated_by, version)
		VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)`
	_, err := r.db.Exec(query,
		s.ID, s.EncounterID, s.DocumentType, s.TemplateID,
		string(contentJSON), s.Narrative, s.ObservationCount, s.RuleCount,
		s.GeneratedBy, s.Version)
	return err
}

func (r *PostgresRepository) GetSummaries(encounterID string) ([]*GeneratedSummary, error) {
	query := `SELECT id, encounter_id, document_type, template_id, content, narrative,
		observation_count, rule_count, generated_at, generated_by, version
		FROM documentation.generated_summaries WHERE encounter_id = $1 ORDER BY generated_at DESC`
	rows, err := r.db.Query(query, encounterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []*GeneratedSummary
	for rows.Next() {
		s := &GeneratedSummary{}
		var contentJSON string
		if err := rows.Scan(&s.ID, &s.EncounterID, &s.DocumentType, &s.TemplateID,
			&contentJSON, &s.Narrative, &s.ObservationCount, &s.RuleCount,
			&s.GeneratedAt, &s.GeneratedBy, &s.Version); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(contentJSON), &s.Content)
		result = append(result, s)
	}
	return result, nil
}
