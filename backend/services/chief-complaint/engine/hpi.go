package engine

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

// ============================================================================
// HPI ENGINE - Dynamic Question Generator
// ACRS Volume 3: HPI-0001 to HPI-0010
// ============================================================================

type QuestionEngine struct {
	questionTree map[string][]Question
}

type Question struct {
	ID             string   `json:"id"`
	Text           string   `json:"text"`
	Category       string   `json:"category"`
	BodySystem     BodySystem `json:"body_system"`
	Priority       int      `json:"priority"`
	InformationGain float64 `json:"information_gain"`
	Options        []string `json:"options,omitempty"`
	InputType      string   `json:"input_type"`
	ConditionalOn  string   `json:"conditional_on,omitempty"`
}

type SymptomSchema struct {
	Concept     string            `json:"concept"`
	Label       string            `json:"label"`
	BodySystem  BodySystem        `json:"body_system"`
	Attributes  []SymptomAttribute `json:"attributes"`
	RedFlags    []string          `json:"red_flags"`
}

type SymptomAttribute struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Question string `json:"question"`
	Type     string `json:"type"`
}

func NewQuestionEngine() *QuestionEngine {
	return &QuestionEngine{
		questionTree: buildQuestionTree(),
	}
}

// GetNextQuestions returns questions sorted by information gain for a given concept
func (e *QuestionEngine) GetNextQuestions(concept string, answeredIDs []string, context map[string]interface{}) []Question {
	baseQuestions := e.questionTree[concept]
	if baseQuestions == nil {
		baseQuestions = e.questionTree["default"]
	}

	// Filter out already-answered
	filtered := make([]Question, 0)
	for _, q := range baseQuestions {
		skip := false
		for _, answered := range answeredIDs {
			if q.ID == answered {
				skip = true
				break
			}
		}
		if skip {
			continue
		}

		// Check conditional
		if q.ConditionalOn != "" {
			if context[q.ConditionalOn] == nil || context[q.ConditionalOn] == false {
				continue
			}
		}

		// Calculate information gain based on context
		q.InformationGain = e.calculateInformationGain(q, concept, context)
		filtered = append(filtered, q)
	}

	// Sort by information gain descending
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].InformationGain > filtered[j].InformationGain
	})

	// Return top 5
	if len(filtered) > 5 {
		filtered = filtered[:5]
	}

	return filtered
}

func (e *QuestionEngine) calculateInformationGain(q Question, concept string, context map[string]interface{}) float64 {
	// Base score by priority
	base := float64(10-q.Priority) * 0.2

	// Red flag questions get highest gain
	if q.Category == "red_flag" {
		base += 3.0
	}

	// Duration unknown → gain higher
	if context["duration_days"] == nil || context["duration_days"].(int) == 0 {
		if q.Category == "timing" {
			base += 2.0
		}
	}

	// Severity-related
	if q.Category == "severity" {
		base += 1.5
	}

	// Associated symptoms with unknown status
	if q.Category == "associated" {
		base += 1.0
	}

	return base
}

// GetSymptomSchema returns the universal symptom schema for a concept
func GetSymptomSchema(concept string) *SymptomSchema {
	return universalSymptomSchemas[concept]
}

// ============================================================================
// QUESTION LIBRARY
// ============================================================================

func buildQuestionTree() map[string][]Question {
	return map[string][]Question{
		"chest_pain": {
			{ID: "cp1", Text: "When did the chest pain start?", Category: "timing", Priority: 1, InputType: "date"},
			{ID: "cp2", Text: "Was the onset sudden or gradual?", Category: "timing", Priority: 1, Options: []string{"sudden", "gradual"}, InputType: "select"},
			{ID: "cp3", Text: "Describe the pain (sharp, dull, burning, pressure)?", Category: "quality", Priority: 2, InputType: "text"},
			{ID: "cp4", Text: "Rate the severity (0-10)", Category: "severity", Priority: 1, InputType: "number"},
			{ID: "cp5", Text: "Does it radiate anywhere?", Category: "radiation", Priority: 2, Options: []string{"left_arm", "jaw", "back", "shoulder", "no"}, InputType: "select"},
			{ID: "cp6", Text: "What makes it better or worse?", Category: "modifying", Priority: 3, InputType: "text"},
			{ID: "cp7", Text: "Any associated shortness of breath?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "cp8", Text: "Any associated sweating (diaphoresis)?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "cp9", Text: "Any associated nausea or vomiting?", Category: "associated", Priority: 3, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "cp10", Text: "RED FLAG: Is the pain crushing or tearing?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "cp11", Text: "RED FLAG: Any history of heart disease or risk factors?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
		},
		"abdominal_pain": {
			{ID: "ap1", Text: "When did the abdominal pain start?", Category: "timing", Priority: 1, InputType: "date"},
			{ID: "ap2", Text: "Was onset sudden or gradual?", Category: "timing", Priority: 1, Options: []string{"sudden", "gradual"}, InputType: "select"},
			{ID: "ap3", Text: "Where exactly is the pain located?", Category: "location", Priority: 1, Options: []string{"epigastric", "right_upper", "left_upper", "right_lower", "left_lower", "diffuse", "periumbilical"}, InputType: "select"},
			{ID: "ap4", Text: "Does the pain move (migrate)?", Category: "quality", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "ap5", Text: "Rate severity (0-10)", Category: "severity", Priority: 1, InputType: "number"},
			{ID: "ap6", Text: "Describe the pain (sharp, colicky, burning, dull)?", Category: "quality", Priority: 2, InputType: "text"},
			{ID: "ap7", Text: "Any associated vomiting?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "ap8", Text: "Any change in bowel habits?", Category: "associated", Priority: 3, Options: []string{"constipation", "diarrhoea", "normal"}, InputType: "select"},
			{ID: "ap9", Text: "Any fever?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "ap10", Text: "RED FLAG: Is there blood in stool or vomit?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "ap11", Text: "RED FLAG: For women — any chance of pregnancy?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select", ConditionalOn: "is_female_reproductive_age"},
		},
		"dyspnoea": {
			{ID: "dy1", Text: "When did the shortness of breath start?", Category: "timing", Priority: 1, InputType: "date"},
			{ID: "dy2", Text: "Was onset sudden or gradual?", Category: "timing", Priority: 1, Options: []string{"sudden", "gradual"}, InputType: "select"},
			{ID: "dy3", Text: "At what activity level does it occur?", Category: "severity", Priority: 1, Options: []string{"rest", "minimal_exertion", "moderate", "climbing_stairs"}, InputType: "select"},
			{ID: "dy4", Text: "Can you lie flat (orthopnoea)?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "dy5", Text: "Any associated cough?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "dy6", Text: "Any associated wheezing?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "dy7", Text: "Any associated chest pain?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "dy8", Text: "Any swelling of legs or feet?", Category: "associated", Priority: 3, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "dy9", Text: "RED FLAG: Any stridor or airway compromise?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
		},
		"headache": {
			{ID: "hd1", Text: "When did the headache start?", Category: "timing", Priority: 1, InputType: "date"},
			{ID: "hd2", Text: "Was onset sudden or gradual?", Category: "timing", Priority: 1, Options: []string{"sudden", "gradual"}, InputType: "select"},
			{ID: "hd3", Text: "Where is the headache located?", Category: "location", Priority: 1, Options: []string{"frontal", "temporal", "occipital", "unilateral", "diffuse", "behind_eyes"}, InputType: "select"},
			{ID: "hd4", Text: "Describe the pain (throbbing, pressure, stabbing)?", Category: "quality", Priority: 2, InputType: "text"},
			{ID: "hd5", Text: "Rate severity (0-10)", Category: "severity", Priority: 1, InputType: "number"},
			{ID: "hd6", Text: "Any associated visual changes?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "hd7", Text: "Any associated nausea or vomiting?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "hd8", Text: "Any photophobia or phonophobia?", Category: "associated", Priority: 3, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "hd9", Text: "RED FLAG: Thunderclap (worst headache of life)?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "hd10", Text: "RED FLAG: Any neck stiffness or fever?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "hd11", Text: "RED FLAG: Any neurological deficit or altered consciousness?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
		},
		"fever": {
			{ID: "fv1", Text: "When did the fever start?", Category: "timing", Priority: 1, InputType: "date"},
			{ID: "fv2", Text: "Was the onset sudden or gradual?", Category: "timing", Priority: 1, Options: []string{"sudden", "gradual"}, InputType: "select"},
			{ID: "fv3", Text: "Highest recorded temperature?", Category: "severity", Priority: 1, InputType: "number"},
			{ID: "fv4", Text: "Does it come and go or is it continuous?", Category: "quality", Priority: 2, Options: []string{"continuous", "intermittent", "remittent"}, InputType: "select"},
			{ID: "fv5", Text: "Any associated chills or rigors?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "fv6", Text: "Any associated cough?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "fv7", Text: "Any associated urinary symptoms?", Category: "associated", Priority: 2, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "fv8", Text: "Any rash?", Category: "associated", Priority: 3, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "fv9", Text: "RED FLAG: Any neck stiffness?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
			{ID: "fv10", Text: "RED FLAG: Any altered consciousness?", Category: "red_flag", Priority: 0, Options: []string{"yes", "no"}, InputType: "select"},
		},
		"default": {
			{ID: "df1", Text: "When did the symptom start?", Category: "timing", Priority: 1, InputType: "date"},
			{ID: "df2", Text: "Was the onset sudden or gradual?", Category: "timing", Priority: 1, Options: []string{"sudden", "gradual"}, InputType: "select"},
			{ID: "df3", Text: "Rate the severity (0-10)", Category: "severity", Priority: 1, InputType: "number"},
			{ID: "df4", Text: "Describe the symptom in detail", Category: "quality", Priority: 2, InputType: "textarea"},
			{ID: "df5", Text: "What makes it better or worse?", Category: "modifying", Priority: 3, InputType: "text"},
			{ID: "df6", Text: "Any associated symptoms?", Category: "associated", Priority: 3, InputType: "textarea"},
		},
	}
}

// ============================================================================
// UNIVERSAL SYMPTOM SCHEMA
// ============================================================================

var universalSymptomSchemas = map[string]*SymptomSchema{
	"chest_pain": {
		Concept:    "chest_pain",
		Label:      "Chest Pain",
		BodySystem: SystemCardiovascular,
		Attributes: []SymptomAttribute{
			{ID: "onset", Label: "Onset", Question: "When did the chest pain start?", Type: "datetime"},
			{ID: "quality", Label: "Quality", Question: "Describe the pain", Type: "text"},
			{ID: "severity", Label: "Severity", Question: "Rate pain 0-10", Type: "number"},
			{ID: "radiation", Label: "Radiation", Question: "Does it radiate?", Type: "text"},
			{ID: "duration", Label: "Duration", Question: "How long does each episode last?", Type: "text"},
			{ID: "modifying", Label: "Modifying Factors", Question: "What makes it better/worse?", Type: "text"},
			{ID: "associated", Label: "Associated Symptoms", Question: "Any SOB, sweating, nausea?", Type: "text"},
		},
		RedFlags: []string{"crushing_tearing", "radiation_to_jaw_arm", "with_diaphoresis", "with_dyspnoea"},
	},
	"abdominal_pain": {
		Concept:    "abdominal_pain",
		Label:      "Abdominal Pain",
		BodySystem: SystemGastrointestinal,
		Attributes: []SymptomAttribute{
			{ID: "onset", Label: "Onset", Question: "When did the pain start?", Type: "datetime"},
			{ID: "location", Label: "Location", Question: "Where is the pain?", Type: "select"},
			{ID: "quality", Label: "Quality", Question: "Describe the pain", Type: "text"},
			{ID: "severity", Label: "Severity", Question: "Rate pain 0-10", Type: "number"},
			{ID: "migration", Label: "Migration", Question: "Has the pain moved?", Type: "boolean"},
			{ID: "modifying", Label: "Modifying Factors", Question: "What makes it better/worse?", Type: "text"},
		},
		RedFlags: []string{"haematemesis", "melaena", "peritonism", "pregnant"},
	},
}

// ============================================================================
// CHRONOLOGY BUILDER - Generates natural language timeline
// ============================================================================

type ChronologyBuilder struct{}

func NewChronologyBuilder() *ChronologyBuilder {
	return &ChronologyBuilder{}
}

type TimelineEntry struct {
	Day              int        `json:"day"`
	Date             string     `json:"date"`
	ComplaintConcept string     `json:"complaint_concept"`
	PatientStatement string     `json:"patient_statement"`
	Summary          string     `json:"summary"`
	Events           []TimelineEvent `json:"events"`
}

type TimelineEvent struct {
	Type    string `json:"type"`
	Detail  string `json:"detail"`
}

func (b *ChronologyBuilder) BuildChronology(complaints []*Complaint) []TimelineEntry {
	timeline := make([]TimelineEntry, 0)
	dayCount := 0
	var lastDate time.Time

	for i, c := range complaints {
		// Determine day offset
		if i == 0 {
			dayCount = 0
		} else if !lastDate.IsZero() && !c.Onset.IsZero() {
			daysSince := int(c.Onset.Sub(lastDate).Hours() / 24)
			if daysSince > 0 {
				dayCount += daysSince
			} else {
				dayCount++
			}
		} else {
			dayCount++
		}

		_ = lastDate
		lastDate = c.Onset

		entry := TimelineEntry{
			Day:              dayCount,
			Date:             c.Onset.Format("Mon 2 Jan 2006"),
			ComplaintConcept: c.NormalizedConcept,
			PatientStatement: c.PatientStatement,
			Summary:          b.generateSummary(c),
			Events: []TimelineEvent{
				{Type: "complaint_onset", Detail: fmt.Sprintf("%s reported %s", c.Reporter, c.PatientStatement)},
			},
		}

		// Add relationship events
		for _, rel := range c.Relationships {
			entry.Events = append(entry.Events, TimelineEvent{
				Type:   "relationship",
				Detail: rel.Description,
			})
		}

		timeline = append(timeline, entry)
	}

	return timeline
}

func (b *ChronologyBuilder) generateSummary(c *Complaint) string {
	days := int(time.Since(c.Onset).Hours() / 24)
	duration := formatDuration(c.Onset)

	switch {
	case c.Severity >= 8:
		return fmt.Sprintf("Severe %s (%s) — onset %s", c.NormalizedConcept, duration, c.Onset.Format("Jan 2"))
	case c.Severity >= 5:
		return fmt.Sprintf("Moderate %s — started %s", c.NormalizedConcept, duration)
	case c.Severity >= 1:
		return fmt.Sprintf("Mild %s — %s duration", c.NormalizedConcept, duration)
	default:
		_ = days
		return fmt.Sprintf("%s — %s", c.NormalizedConcept, duration)
	}
}

// HPI Narrative Generator - produces the natural language HPI paragraph
type HPINarrativeGenerator struct{}

func NewHPINarrativeGenerator() *HPINarrativeGenerator {
	return &HPINarrativeGenerator{}
}

func (g *HPINarrativeGenerator) GenerateNarrative(complaint *Complaint, questions []Question, answers map[string]string, pmh []string) string {
	var sb strings.Builder

	// Opening with PMH context
	if len(pmh) > 0 {
		chronicCondition := pmh[0]
		sb.WriteString(fmt.Sprintf("This is a known %s patient", chronicCondition))
	} else {
		sb.WriteString("This patient")
	}

	// Age/demographics context (if available)
	if age, ok := answers["patient_age"]; ok {
		if sb.Len() > 0 {
			sb.WriteString(",")
		}
		sb.WriteString(fmt.Sprintf(" a %s-year-old", age))
	}
	if sex, ok := answers["patient_sex"]; ok {
		sb.WriteString(fmt.Sprintf(" %s", sex))
	}

	// Main complaint
	sb.WriteString(fmt.Sprintf(", presents with %s", complaint.PatientStatement))
	if !complaint.Onset.IsZero() {
		sb.WriteString(fmt.Sprintf(" of %s duration", strings.ToLower(complaint.Duration)))
	}

	// Severity
	if complaint.Severity > 0 {
		sb.WriteString(fmt.Sprintf(", rated %d/10 in severity", complaint.Severity))
	}

	// Quality
	if quality, ok := answers["quality"]; ok {
		sb.WriteString(fmt.Sprintf(". The pain is described as %s", quality))
	}

	// Location (for pain)
	if location, ok := answers["location"]; ok {
		sb.WriteString(fmt.Sprintf(" and located in the %s", location))
	}

	// Modifying factors
	if modifying, ok := answers["modifying"]; ok && modifying != "" {
		sb.WriteString(fmt.Sprintf(". It is %s", modifying))
	}

	// Associated symptoms
	associatedSymptoms := make([]string, 0)
	for _, q := range questions {
		if q.Category == "associated" {
			if ans, ok := answers[q.ID]; ok && ans == "yes" {
				associatedSymptoms = append(associatedSymptoms, strings.ToLower(q.Text))
			}
		}
	}
	if len(associatedSymptoms) > 0 {
		sb.WriteString(". Associated symptoms include ")
		for i, s := range associatedSymptoms {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(strings.TrimPrefix(s, "any associated "))
		}
	}

	sb.WriteString(".")
	return sb.String()
}