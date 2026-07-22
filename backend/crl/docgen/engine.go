package docgen

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/amexan/backend/crl/core"
)

type DocumentType string

const (
	DocHPI           DocumentType = "hpi"
	DocSOAP          DocumentType = "soap"
	DocDischarge     DocumentType = "discharge_summary"
	DocProgressNote  DocumentType = "progress_note"
	DocConsultation  DocumentType = "consultation"
	DocReferral      DocumentType = "referral"
)

type Section struct {
	Title       string   `json:"title"`
	Content     string   `json:"content"`
	Order       int      `json:"order"`
}

type Document struct {
	Type        DocumentType `json:"type"`
	Sections    []Section    `json:"sections"`
	GeneratedAt time.Time    `json:"generated_at"`
	WordCount   int          `json:"word_count"`
}

type Engine struct {
	repo core.Repository
}

func NewEngine(repo core.Repository) *Engine {
	return &Engine{repo: repo}
}

func (e *Engine) GenerateHPI(encounterID string, patientName string, age int, gender string) (*Document, error) {
	observations, err := e.repo.GetHPIObservations(encounterID)
	if err != nil {
		return nil, fmt.Errorf("get observations: %w", err)
	}

	timeline, _ := e.repo.GetTimeline(encounterID)
	complaints, _ := e.repo.GetComplaintsByEncounter(encounterID)
	differentials, _ := e.repo.GetDifferentials(encounterID)

	return buildHPIDocument(patientName, age, gender, observations, timeline, complaints, differentials), nil
}

func (e *Engine) GenerateSOAP(encounterID string, patientName string) (*Document, error) {
	observations, _ := e.repo.GetHPIObservations(encounterID)
	timeline, _ := e.repo.GetTimeline(encounterID)
	differentials, _ := e.repo.GetDifferentials(encounterID)

	doc := &Document{
		Type: DocSOAP,
		Sections: []Section{
			{Title: "Subjective", Content: buildNarrative(observations, timeline), Order: 1},
			{Title: "Objective", Content: buildObjective(observations), Order: 2},
			{Title: "Assessment", Content: buildAssessment(differentials), Order: 3},
			{Title: "Plan", Content: buildPlan(differentials), Order: 4},
		},
		GeneratedAt: time.Now(),
	}
	doc.WordCount = countWords(doc)
	return doc, nil
}

func (e *Engine) GenerateDischargeSummary(encounterID string, patientName string, admitDate, dischargeDate time.Time, dischargeDiagnosis, disposition, followUp string) (*Document, error) {
	observations, _ := e.repo.GetHPIObservations(encounterID)

	doc := &Document{
		Type: DocDischarge,
		Sections: []Section{
			{Title: "Admission Date", Content: admitDate.Format("January 2, 2006 15:04"), Order: 1},
			{Title: "Discharge Date", Content: dischargeDate.Format("January 2, 2006 15:04"), Order: 2},
			{Title: "Length of Stay", Content: fmtDuration(int64(dischargeDate.Sub(admitDate).Seconds())), Order: 3},
			{Title: "Admission Diagnosis", Content: buildNarrative(observations, nil), Order: 4},
			{Title: "Discharge Diagnosis", Content: dischargeDiagnosis, Order: 5},
			{Title: "Hospital Course", Content: buildHospitalCourse(observations), Order: 6},
			{Title: "Discharge Medications", Content: buildCategory(observations, "medication"), Order: 7},
			{Title: "Disposition", Content: disposition, Order: 8},
			{Title: "Follow-up Instructions", Content: followUp, Order: 9},
		},
		GeneratedAt: time.Now(),
	}
	doc.WordCount = countWords(doc)
	return doc, nil
}

func buildHPIDocument(patientName string, age int, gender string, observations []*core.HPIObservation, timeline []*core.TimelineEntry, complaints []*core.ComplaintConcept, differentials []*core.DifferentialDiagnosis) *Document {
	ccParts := make([]string, 0)
	for _, c := range complaints {
		ccParts = append(ccParts, fmt.Sprintf("%s x %s", c.PatientStatement, fmtDuration(0)))
	}
	if len(ccParts) == 0 {
		for _, obs := range observations {
			if strings.Contains(obs.ConceptID, "chief_complaint") {
				ccParts = append(ccParts, core.ObservationStringValue(obs.Value))
			}
		}
	}
	cc := strings.Join(ccParts, "; ")
	if cc == "" {
		cc = "Not specified"
	}

	sections := []Section{
		{Title: "Patient", Content: fmt.Sprintf("%s, %d-year-old %s", patientName, age, gender), Order: 1},
		{Title: "Chief Complaint", Content: cc, Order: 2},
		{Title: "History of Presenting Illness", Content: buildNarrative(observations, timeline), Order: 3},
		{Title: "Review of Systems", Content: buildROS(observations), Order: 4},
		{Title: "Past Medical History", Content: buildCategory(observations, "pmh"), Order: 5},
		{Title: "Medications", Content: buildCategory(observations, "medication"), Order: 6},
		{Title: "Allergies", Content: buildCategory(observations, "allergy"), Order: 7},
		{Title: "Social History", Content: buildCategory(observations, "social"), Order: 8},
		{Title: "Family History", Content: buildCategory(observations, "family_history"), Order: 9},
	}

	if len(differentials) > 0 {
		ddLines := make([]string, 0)
		for _, dd := range differentials {
			status := ""
			if dd.IsConfirmed {
				status = " [CONFIRMED]"
			} else if dd.IsExcluded {
				status = " [EXCLUDED]"
			}
			ddLines = append(ddLines, fmt.Sprintf("%d. %s \u2014 %.1f%%%s", dd.Rank, dd.DiseaseName, dd.Probability, status))
		}
		sections = append(sections, Section{Title: "Differential Diagnosis", Content: strings.Join(ddLines, "\n"), Order: 10})
	}

	doc := &Document{Type: DocHPI, Sections: sections, GeneratedAt: time.Now()}
	doc.WordCount = countWords(doc)
	return doc
}

func buildNarrative(observations []*core.HPIObservation, timeline []*core.TimelineEntry) string {
	if len(observations) == 0 {
		return "No clinical history recorded."
	}

	sorted := make([]*core.HPIObservation, len(observations))
	copy(sorted, observations)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].ObservationTime.Before(sorted[j].ObservationTime)
	})

	eventMap := make(map[string][]string)
	for _, obs := range sorted {
		eventID := obs.ComplaintID
		if eventID == "" {
			eventID = "_other"
		}
		var line string
		val := core.ObservationStringValue(obs.Value)
		if val != "" {
			line = val
		} else if obs.ValueType == "boolean" {
			if core.ObservationBoolValue(obs.Value) {
				line = niceName(obs.ConceptID) + " present"
			} else {
				line = niceName(obs.ConceptID) + " absent"
			}
		} else {
			line = niceName(obs.ConceptID)
		}
		eventMap[eventID] = append(eventMap[eventID], line)
	}

	var b strings.Builder

	if timeline != nil {
		for _, entry := range timeline {
			key := entry.EventType
			if lines, ok := eventMap[key]; ok {
				b.WriteString("- ")
				b.WriteString(niceName(key))
				b.WriteString(": ")
				b.WriteString(strings.Join(lines, ", "))
				b.WriteString("\n")
			}
		}
	}

	if lines, ok := eventMap["_other"]; ok && len(lines) > 0 {
		b.WriteString("- Details: ")
		b.WriteString(strings.Join(lines, "; "))
		b.WriteString("\n")
	}

	result := strings.TrimSpace(b.String())
	if result == "" {
		return "See clinical observations."
	}
	return result
}

func buildROS(observations []*core.HPIObservation) string {
	systemMap := map[string]string{
		"cardiac": "Cardiovascular", "cardiovascular": "Cardiovascular",
		"respiratory": "Respiratory", "pulmonary": "Respiratory",
		"gi": "Gastrointestinal", "gastrointestinal": "Gastrointestinal",
		"neuro": "Neurological", "neurological": "Neurological",
		"msk": "Musculoskeletal", "musculoskeletal": "Musculoskeletal",
		"gu": "Genitourinary", "genitourinary": "Genitourinary",
		"skin": "Skin", "dermatology": "Skin",
		"endocrin": "Endocrine", "endocrine": "Endocrine",
	}

	groups := make(map[string][]string)
	systemOrder := []string{"Cardiovascular", "Respiratory", "Gastrointestinal", "Neurological", "Musculoskeletal", "Genitourinary", "Skin", "Endocrine", "General", "Other"}

	rosConcepts := map[string]bool{
		"fever": true, "weight_loss": true, "fatigue": true, "night_sweats": true,
		"cough": true, "dyspnoea": true, "chest_pain": true, "palpitations": true,
		"nausea": true, "vomiting": true, "diarrhea": true, "constipation": true,
		"dysuria": true, "headache": true, "dizziness": true, "seizures": true,
		"weakness": true, "numbness": true, "skin_rash": true, "joint_pain": true,
	}

	for _, obs := range observations {
		if !rosConcepts[obs.ConceptID] {
			continue
		}
		system := "Other"
		for k, v := range systemMap {
			if strings.Contains(obs.ConceptID, k) || strings.Contains(strings.ToLower(obs.ValueType), k) {
				system = v
				break
			}
		}
		line := niceName(obs.ConceptID)
		val := core.ObservationStringValue(obs.Value)
		if val != "" {
			line += ": " + val
		} else if obs.ValueType == "boolean" {
			if core.ObservationBoolValue(obs.Value) {
				line += " present"
			} else {
				line += " absent"
			}
		}
		groups[system] = append(groups[system], line)
	}

	var b strings.Builder
	for _, g := range systemOrder {
		if items := groups[g]; len(items) > 0 {
			b.WriteString(g)
			b.WriteString(": ")
			b.WriteString(strings.Join(items, "; "))
			b.WriteString("\n")
		}
	}
	if rest := groups["Other"]; len(rest) > 0 {
		b.WriteString("Other: ")
		b.WriteString(strings.Join(rest, "; "))
	}
	result := strings.TrimSpace(b.String())
	if result == "" {
		return "Review of systems not documented."
	}
	return result
}

func buildCategory(observations []*core.HPIObservation, category string) string {
	var items []string
	for _, obs := range observations {
		if strings.Contains(obs.ConceptID, category) || obs.ValueType == category {
			items = append(items, core.ObservationStringValue(obs.Value))
		}
	}
	if len(items) == 0 {
		return "None documented."
	}
	return strings.Join(items, "; ")
}

func buildObjective(observations []*core.HPIObservation) string {
	var vitals, exam []string
	for _, obs := range observations {
		val := core.ObservationStringValue(obs.Value)
		if val == "" {
			continue
		}
		if strings.Contains(obs.ConceptID, "vital") || strings.Contains(obs.ConceptID, "bp_") || strings.Contains(obs.ConceptID, "hr_") || strings.Contains(obs.ConceptID, "temp") || strings.Contains(obs.ConceptID, "rr_") || strings.Contains(obs.ConceptID, "spo2") {
			vitals = append(vitals, niceName(obs.ConceptID)+": "+val)
		} else if strings.Contains(obs.ConceptID, "exam_") || strings.Contains(obs.ConceptID, "physical") {
			exam = append(exam, niceName(obs.ConceptID)+": "+val)
		}
	}

	var b strings.Builder
	if len(vitals) > 0 {
		b.WriteString("Vital Signs:\n")
		for _, v := range vitals {
			b.WriteString("  ")
			b.WriteString(v)
			b.WriteString("\n")
		}
	}
	if len(exam) > 0 {
		b.WriteString("Physical Examination:\n")
		for _, e := range exam {
			b.WriteString("  ")
			b.WriteString(e)
			b.WriteString("\n")
		}
	}
	result := strings.TrimSpace(b.String())
	if result == "" {
		return "No objective data recorded."
	}
	return result
}

func buildAssessment(differentials []*core.DifferentialDiagnosis) string {
	if len(differentials) == 0 {
		return "Assessment pending."
	}
	lines := make([]string, 0)
	for _, dd := range differentials {
		if dd.IsExcluded {
			continue
		}
		status := ""
		if dd.IsConfirmed {
			status = " [CONFIRMED]"
		}
		lines = append(lines, fmt.Sprintf("%d. %s (%.1f%%)%s", dd.Rank, dd.DiseaseName, dd.Probability, status))
	}
	if len(lines) == 0 {
		return "All differentials excluded."
	}
	return strings.Join(lines, "\n")
}

func buildPlan(differentials []*core.DifferentialDiagnosis) string {
	lines := make([]string, 0)
	for _, dd := range differentials {
		if dd.IsExcluded || dd.IsConfirmed {
			continue
		}
		if dd.Probability > 50 {
			lines = append(lines, fmt.Sprintf("- Investigate and manage %s (urgent)", dd.DiseaseName))
		} else if dd.Probability > 10 {
			lines = append(lines, fmt.Sprintf("- Consider further workup for %s", dd.DiseaseName))
		}
	}
	if len(lines) == 0 {
		lines = append(lines, "- Plan pending further assessment.")
	}
	return strings.Join(lines, "\n")
}

func buildHospitalCourse(observations []*core.HPIObservation) string {
	if len(observations) == 0 {
		return "Hospital course not documented."
	}
	var b strings.Builder
	for _, obs := range observations {
		if strings.Contains(obs.ConceptID, "course_") {
			b.WriteString("- ")
			b.WriteString(obs.ObservationTime.Format("02-Jan 15:04"))
			b.WriteString(": ")
			b.WriteString(core.ObservationStringValue(obs.Value))
			b.WriteString("\n")
		}
	}
	result := strings.TrimSpace(b.String())
	if result == "" {
		return "See timeline for hospital course."
	}
	return result
}

func fmtDuration(seconds int64) string {
	if seconds <= 0 {
		return "duration unknown"
	}
	if seconds < 60 {
		return fmt.Sprintf("%d seconds", seconds)
	}
	minutes := seconds / 60
	if minutes < 60 {
		return fmt.Sprintf("%d minutes", minutes)
	}
	hours := minutes / 60
	if hours < 24 {
		return fmt.Sprintf("%d hours", hours)
	}
	days := hours / 24
	return fmt.Sprintf("%d days", days)
}

func countWords(doc *Document) int {
	total := 0
	for _, s := range doc.Sections {
		total += len(strings.Fields(s.Content))
	}
	return total
}

func niceName(s string) string {
	s = strings.ReplaceAll(s, "_", " ")
	s = strings.ReplaceAll(s, "-", " ")
	if len(s) == 0 {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}
