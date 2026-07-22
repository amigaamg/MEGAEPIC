package engine

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

// ============================================================================
// COMPLAINT OBJECT - Per ACRS Volume 3 Specification
// ============================================================================

type ComplaintStatus string

const (
	StatusActive       ComplaintStatus = "active"
	StatusResolved     ComplaintStatus = "resolved"
	StatusRecurrent    ComplaintStatus = "recurrent"
	StatusIntermittent ComplaintStatus = "intermittent"
	StatusUnknown      ComplaintStatus = "unknown"
)

type RelationshipType string

const (
	RelPrecedes     RelationshipType = "precedes"
	RelFollows      RelationshipType = "follows"
	RelAssociated   RelationshipType = "associated"
	RelCausedBy     RelationshipType = "caused_by"
	RelAggravatedBy RelationshipType = "aggravated_by"
	RelIndependent  RelationshipType = "independent"
	RelUnknown      RelationshipType = "unknown"
)

type BodySystem string

const (
	SystemCardiovascular  BodySystem = "cardiovascular"
	SystemRespiratory     BodySystem = "respiratory"
	SystemGastrointestinal BodySystem = "gastrointestinal"
	SystemNeurological    BodySystem = "neurological"
	SystemMusculoskeletal BodySystem = "musculoskeletal"
	SystemGenitourinary   BodySystem = "genitourinary"
	SystemEndocrine       BodySystem = "endocrine"
	SystemDermatological  BodySystem = "dermatological"
	SystemPsychiatric     BodySystem = "psychiatric"
	SystemENT             BodySystem = "ent"
	SystemOphthalmological BodySystem = "ophthalmological"
	SystemHematological   BodySystem = "hematological"
	SystemInfectious      BodySystem = "infectious"
	SystemSystemic        BodySystem = "systemic"
	SystemUnknown         BodySystem = "unknown"
)

type Complaint struct {
	UUID              string           `json:"uuid"`
	EncounterID       string           `json:"encounter_id"`
	PatientStatement  string           `json:"patient_statement"`
	NormalizedConcept string           `json:"normalized_concept"`
	BodySystem        BodySystem       `json:"body_system"`
	IsPrimary         bool             `json:"is_primary"`
	Status            ComplaintStatus  `json:"status"`
	Severity          int              `json:"severity"`
	Onset             time.Time        `json:"onset"`
	Duration          string           `json:"duration"`
	DurationDays      int              `json:"duration_days"`
	Reporter          string           `json:"reporter"`
	Confidence        float64          `json:"confidence"`
	TimelineOrder     int              `json:"timeline_order"`
	EntryOrder        int              `json:"entry_order"`
	Relationships     []ComplaintRelationship `json:"relationships,omitempty"`
	CreatedAt         time.Time        `json:"created_at"`
}

type ComplaintRelationship struct {
	TargetComplaintID string           `json:"target_complaint_id"`
	Relationship      RelationshipType `json:"relationship"`
	Description       string           `json:"description,omitempty"`
}

// ============================================================================
// CHIEF COMPLAINT ENGINE
// ============================================================================

type ChiefComplaintEngine struct {
	normalizer *ConceptNormalizer
}

func NewChiefComplaintEngine() *ChiefComplaintEngine {
	return &ChiefComplaintEngine{
		normalizer: NewConceptNormalizer(),
	}
}

// ProcessComplaint takes raw patient input and produces a structured complaint
func (e *ChiefComplaintEngine) ProcessComplaint(
	encounterID string,
	patientStatement string,
	onset time.Time,
	severity int,
	reporter string,
	entryOrder int,
) *Complaint {

	normalized := e.normalizer.Normalize(patientStatement)
	bodySystem := e.normalizer.ClassifyBodySystem(normalized, patientStatement)

	return &Complaint{
		UUID:              generateUUID(),
		EncounterID:       encounterID,
		PatientStatement:  patientStatement,
		NormalizedConcept: normalized,
		BodySystem:        bodySystem,
		IsPrimary:         entryOrder == 0,
		Status:            StatusActive,
		Severity:          severity,
		Onset:             onset,
		Duration:          formatDuration(onset),
		DurationDays:      int(time.Since(onset).Hours() / 24),
		Reporter:          reporter,
		Confidence:        1.0,
		TimelineOrder:     entryOrder,
		EntryOrder:        entryOrder,
		Relationships:     make([]ComplaintRelationship, 0),
		CreatedAt:         time.Now(),
	}
}

// BuildTimeline sorts complaints chronologically by onset (oldest first)
// This is the KEY rule: CC-0007 - Chronology auto-generated
func (e *ChiefComplaintEngine) BuildTimeline(complaints []*Complaint) []*Complaint {
	sorted := make([]*Complaint, len(complaints))
	copy(sorted, complaints)

	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Onset.Before(sorted[j].Onset)
	})

	// Assign timeline positions
	for i, c := range sorted {
		c.TimelineOrder = i
	}

	return sorted
}

// InferRelationships attempts to determine relationships between complaints
func (e *ChiefComplaintEngine) InferRelationships(complaints []*Complaint) {
	for i := 1; i < len(complaints); i++ {
		current := complaints[i]
		previous := complaints[i-1]

		// If current started after previous, it likely follows or is caused by
		if current.Onset.After(previous.Onset) {
			// Check if durations overlap significantly
			overlapDays := min(current.DurationDays, previous.DurationDays)
			if overlapDays > 0 {
				current.Relationships = append(current.Relationships, ComplaintRelationship{
					TargetComplaintID: previous.UUID,
					Relationship:      RelFollows,
					Description:       "Started after " + previous.NormalizedConcept,
				})
				previous.Relationships = append(previous.Relationships, ComplaintRelationship{
					TargetComplaintID: current.UUID,
					Relationship:      RelPrecedes,
					Description:       "Preceded " + current.NormalizedConcept,
				})
			}
		}
	}
}

// ============================================================================
// CONCEPT NORMALIZER
// ============================================================================

type ConceptNormalizer struct {
	synonymMap map[string]string
	systemMap  map[string]BodySystem
}

func NewConceptNormalizer() *ConceptNormalizer {
	n := &ConceptNormalizer{
		synonymMap: map[string]string{
			// Pain variants
			"hurt": "pain", "aches": "pain", "sore": "pain", "discomfort": "pain",
			"stabbing": "pain", "burning": "pain", "cramping": "pain",

			// Chest
			"chest pain": "chest_pain", "chest discomfort": "chest_pain",
			"chest tightness": "chest_pain", "heart pain": "chest_pain",
			"palpitations": "palpitation",

			// Abdominal
			"stomach ache": "abdominal_pain", "stomach pain": "abdominal_pain",
			"belly pain": "abdominal_pain", "tummy ache": "abdominal_pain",

			// Respiratory
			"short of breath": "dyspnoea", "breathless": "dyspnoea",
			"difficulty breathing": "dyspnoea", "can't breathe": "dyspnoea",
			"coughing": "cough",

			// Fever
			"hot": "fever", "temperature": "fever", "feeling hot": "fever",
			"chills": "fever", "rigors": "fever",

			// Neurological
			"dizzy": "dizziness", "spinning": "vertigo", "lightheaded": "dizziness",
			"passing out": "syncope", "fainted": "syncope", "blacked out": "syncope",
			"fit": "seizure", "convulsion": "seizure",

			// Gastrointestinal
			"throwing up": "vomiting", "sick": "nausea",
			"loose stools": "diarrhoea", "running stomach": "diarrhoea",
			"blocked": "constipation",

			// Foot
			"foot sore": "foot_ulcer", "foot wound": "foot_ulcer",
			"diabetic foot": "foot_ulcer", "leg ulcer": "foot_ulcer",

			// Psychiatric
			"feeling down": "depression", "feeling low": "depression",
			"sad": "depression", "nervous": "anxiety", "worried": "anxiety",
			"hearing voices": "hallucination_auditory",
			"seeing things": "hallucination_visual",
		},
		systemMap: map[string]BodySystem{
			"chest_pain":     SystemCardiovascular,
			"palpitation":    SystemCardiovascular,
			"dyspnoea":       SystemRespiratory,
			"cough":          SystemRespiratory,
			"wheeze":         SystemRespiratory,
			"abdominal_pain": SystemGastrointestinal,
			"vomiting":       SystemGastrointestinal,
			"diarrhoea":      SystemGastrointestinal,
			"constipation":   SystemGastrointestinal,
			"headache":       SystemNeurological,
			"dizziness":      SystemNeurological,
			"syncope":        SystemNeurological,
			"seizure":        SystemNeurological,
			"weakness":       SystemNeurological,
			"fever":          SystemInfectious,
			"foot_ulcer":     SystemEndocrine,
			"pain":           SystemMusculoskeletal,
			"depression":     SystemPsychiatric,
			"anxiety":        SystemPsychiatric,
			"hallucination":  SystemPsychiatric,
		},
	}
	return n
}

func (n *ConceptNormalizer) Normalize(statement string) string {
	lower := strings.ToLower(strings.TrimSpace(statement))

	// Check direct synonym match first
	if mapped, ok := n.synonymMap[lower]; ok {
		return mapped
	}

	// Check partial matches
	for synonym, concept := range n.synonymMap {
		if strings.Contains(lower, synonym) {
			return concept
		}
	}

	// Return lowercased trimmed as-is if no match
	return lower
}

func (n *ConceptNormalizer) ClassifyBodySystem(concept string, original string) BodySystem {
	if system, ok := n.systemMap[concept]; ok {
		return system
	}

	// Fall back to keyword matching on original
	lower := strings.ToLower(original)
	switch {
	case strings.Contains(lower, "chest") || strings.Contains(lower, "heart") || strings.Contains(lower, "bp"):
		return SystemCardiovascular
	case strings.Contains(lower, "cough") || strings.Contains(lower, "breath") || strings.Contains(lower, "lung"):
		return SystemRespiratory
	case strings.Contains(lower, "stomach") || strings.Contains(lower, "abdomen") || strings.Contains(lower, "vomit") || strings.Contains(lower, "diarrhoea"):
		return SystemGastrointestinal
	case strings.Contains(lower, "head") || strings.Contains(lower, "dizzy") || strings.Contains(lower, "seizure"):
		return SystemNeurological
	case strings.Contains(lower, "fever") || strings.Contains(lower, "temperature") || strings.Contains(lower, "hot"):
		return SystemInfectious
	case strings.Contains(lower, "foot") || strings.Contains(lower, "ulcer") || strings.Contains(lower, "diabetes"):
		return SystemEndocrine
	case strings.Contains(lower, "depressed") || strings.Contains(lower, "anxiety") || strings.Contains(lower, "hallucination"):
		return SystemPsychiatric
	case strings.Contains(lower, "joint") || strings.Contains(lower, "bone") || strings.Contains(lower, "muscle"):
		return SystemMusculoskeletal
	}

	return SystemUnknown
}

// ============================================================================
// HELPERS
// ============================================================================

func formatDuration(onset time.Time) string {
	days := int(time.Since(onset).Hours() / 24)
	switch {
	case days == 0:
		return "today"
	case days == 1:
		return "yesterday"
	case days < 7:
		return fmt.Sprintf("%d days ago", days)
	case days < 30:
		weeks := days / 7
		return fmt.Sprintf("%d weeks ago", weeks)
	case days < 365:
		months := days / 30
		return fmt.Sprintf("%d months ago", months)
	default:
		years := days / 365
		return fmt.Sprintf("%d years ago", years)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
