package questions

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/amexan/backend/crl/core"
)

type QuestionEngine struct {
	repo core.Repository
}

func NewQuestionEngine(repo core.Repository) *QuestionEngine {
	return &QuestionEngine{repo: repo}
}

type ClinicalQuestionTemplate struct {
	ID                    string   `json:"id"`
	ConceptID             string   `json:"concept_id"`
	System                string   `json:"system"`
	Category              string   `json:"category"`
	QuestionText          string   `json:"question_text"`
	AnswerType            string   `json:"answer_type"`
	Options               []string `json:"options,omitempty"`
	Unit                  string   `json:"unit,omitempty"`
	DependsOnConceptID    string   `json:"depends_on_concept_id,omitempty"`
	DependsOnValue        string   `json:"depends_on_value,omitempty"`
	Priority              int      `json:"priority"`
	TimeSensitive         bool     `json:"time_sensitive"`
	AppliesToChiefComplaint string `json:"applies_to_chief_complaint,omitempty"`
}

var questionLibrary = []ClinicalQuestionTemplate{
	{ID: "CP_001", ConceptID: "chest_pain_onset", System: "cardiac", Category: "chief_complaint", QuestionText: "When did the chest pain start?", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "chest_pain"},
	{ID: "CP_002", ConceptID: "chest_pain_type", System: "cardiac", Category: "chief_complaint", QuestionText: "Describe the chest pain (crushing, stabbing, burning, tearing)", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "chest_pain"},
	{ID: "CP_003", ConceptID: "chest_pain_location", System: "cardiac", Category: "chief_complaint", QuestionText: "Where is the pain located?", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "chest_pain"},
	{ID: "CP_004", ConceptID: "pain_radiation", System: "cardiac", Category: "chief_complaint", QuestionText: "Does the pain radiate anywhere?", AnswerType: "text", Priority: 1, AppliesToChiefComplaint: "chest_pain"},
	{ID: "CP_005", ConceptID: "chest_pain_exertional", System: "cardiac", Category: "chief_complaint", QuestionText: "Brought on by exertion?", AnswerType: "boolean", Priority: 1, AppliesToChiefComplaint: "chest_pain"},
	{ID: "CP_010", ConceptID: "associated_dyspnoea", System: "cardiac", Category: "chief_complaint", QuestionText: "Associated shortness of breath?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "chest_pain"},
	{ID: "CP_011", ConceptID: "chest_pain_tearing", System: "cardiac", Category: "chief_complaint", QuestionText: "Tearing or ripping sensation?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "chest_pain"},
	{ID: "HA_001", ConceptID: "headache_onset", System: "neuro", Category: "chief_complaint", QuestionText: "When did the headache start?", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "headache"},
	{ID: "HA_002", ConceptID: "headache_thunderclap", System: "neuro", Category: "chief_complaint", QuestionText: "Thunderclap onset (worst in seconds)?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "headache"},
	{ID: "HA_005", ConceptID: "neck_stiffness", System: "neuro", Category: "chief_complaint", QuestionText: "Neck stiffness?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "headache"},
	{ID: "HA_008", ConceptID: "fever", System: "neuro", Category: "chief_complaint", QuestionText: "Fever?", AnswerType: "boolean", Priority: 1, AppliesToChiefComplaint: "headache"},
	{ID: "AP_001", ConceptID: "abdominal_pain_onset", System: "gi", Category: "chief_complaint", QuestionText: "When did the pain start?", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "abdominal_pain"},
	{ID: "AP_002", ConceptID: "abdominal_pain_location", System: "gi", Category: "chief_complaint", QuestionText: "Where is the pain?", AnswerType: "text", Priority: 1, AppliesToChiefComplaint: "abdominal_pain"},
	{ID: "AP_005", ConceptID: "vomiting", System: "gi", Category: "associated", QuestionText: "Vomiting?", AnswerType: "boolean", Priority: 1, AppliesToChiefComplaint: "abdominal_pain"},
	{ID: "AP_008", ConceptID: "fever", System: "gi", Category: "associated", QuestionText: "Fever?", AnswerType: "boolean", Priority: 1, AppliesToChiefComplaint: "abdominal_pain"},
	{ID: "AP_010", ConceptID: "rebound_tenderness", System: "gi", Category: "physical_exam", QuestionText: "Rebound tenderness?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "abdominal_pain"},
	{ID: "FV_001", ConceptID: "fever_duration", System: "general", Category: "chief_complaint", QuestionText: "How long has the fever been present?", AnswerType: "text", Priority: 1, AppliesToChiefComplaint: "fever"},
	{ID: "FV_004", ConceptID: "rigors", System: "general", Category: "associated", QuestionText: "Rigors (severe shaking chills)?", AnswerType: "boolean", Priority: 1, AppliesToChiefComplaint: "fever"},
	{ID: "FV_006", ConceptID: "fever_travel_history", System: "general", Category: "epidemiological", QuestionText: "Recent travel?", AnswerType: "text", Priority: 2, AppliesToChiefComplaint: "fever"},
	{ID: "DY_001", ConceptID: "dyspnoea_onset", System: "respiratory", Category: "chief_complaint", QuestionText: "When did shortness of breath start?", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "dyspnoea"},
	{ID: "DY_002", ConceptID: "dyspnoea_sudden_onset", System: "respiratory", Category: "chief_complaint", QuestionText: "Sudden onset?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "dyspnoea"},
	{ID: "DY_004", ConceptID: "dyspnoea_at_rest", System: "respiratory", Category: "chief_complaint", QuestionText: "Shortness of breath at rest?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "dyspnoea"},
	{ID: "DY_008", ConceptID: "hemoptysis", System: "respiratory", Category: "associated", QuestionText: "Coughing up blood?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "dyspnoea"},
	{ID: "TR_001", ConceptID: "trauma_mechanism", System: "msk", Category: "chief_complaint", QuestionText: "Mechanism of injury?", AnswerType: "text", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "trauma"},
	{ID: "TR_003", ConceptID: "loss_of_consciousness", System: "neuro", Category: "associated", QuestionText: "Loss of consciousness?", AnswerType: "boolean", Priority: 1, AppliesToChiefComplaint: "trauma"},
	{ID: "TR_004", ConceptID: "trauma_bleeding", System: "msk", Category: "assessment", QuestionText: "Active bleeding?", AnswerType: "boolean", Priority: 1, TimeSensitive: true, AppliesToChiefComplaint: "trauma"},
	{ID: "ROS_001", ConceptID: "fever", System: "general", Category: "ros", QuestionText: "Fever?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_003", ConceptID: "fatigue", System: "general", Category: "ros", QuestionText: "Fatigue?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_005", ConceptID: "cough", System: "respiratory", Category: "ros", QuestionText: "Cough?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_008", ConceptID: "dyspnoea", System: "respiratory", Category: "ros", QuestionText: "Shortness of breath?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_009", ConceptID: "chest_pain", System: "cardiac", Category: "ros", QuestionText: "Chest pain?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_011", ConceptID: "nausea", System: "gi", Category: "ros", QuestionText: "Nausea or vomiting?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_013", ConceptID: "diarrhea", System: "gi", Category: "ros", QuestionText: "Diarrhea?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_017", ConceptID: "dysuria", System: "gu", Category: "ros", QuestionText: "Painful urination?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_019", ConceptID: "headache", System: "neuro", Category: "ros", QuestionText: "Headache?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_020", ConceptID: "dizziness", System: "neuro", Category: "ros", QuestionText: "Dizziness?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_023", ConceptID: "skin_rash", System: "skin", Category: "ros", QuestionText: "Skin rash?", AnswerType: "boolean", Priority: 3},
	{ID: "ROS_024", ConceptID: "joint_pain", System: "msk", Category: "ros", QuestionText: "Joint pain?", AnswerType: "boolean", Priority: 3},
	{ID: "PMH_001", ConceptID: "pmh_hypertension", System: "general", Category: "pmh", QuestionText: "History of hypertension?", AnswerType: "boolean", Priority: 3},
	{ID: "PMH_002", ConceptID: "pmh_diabetes", System: "general", Category: "pmh", QuestionText: "History of diabetes?", AnswerType: "boolean", Priority: 3},
	{ID: "PMH_003", ConceptID: "pmh_asthma", System: "general", Category: "pmh", QuestionText: "History of asthma?", AnswerType: "boolean", Priority: 3},
	{ID: "PMH_004", ConceptID: "pmh_surgery", System: "general", Category: "pmh", QuestionText: "Previous surgeries?", AnswerType: "text", Priority: 3},
	{ID: "MED_001", ConceptID: "medication_list", System: "general", Category: "medication", QuestionText: "Current medications?", AnswerType: "text", Priority: 3},
	{ID: "ALG_001", ConceptID: "allergy_list", System: "general", Category: "allergy", QuestionText: "Known allergies?", AnswerType: "text", Priority: 2},
}

func (qe *QuestionEngine) StartSession(encounterID string, chiefComplaint string) (*core.QuestionSession, []ClinicalQuestionTemplate, error) {
	questions := qe.FilterQuestions(chiefComplaint)

	session := &core.QuestionSession{
		ID:          core.GenerateUUID(),
		EncounterID: encounterID,
		ShownAt:     time.Now(),
		WasSkipped:  false,
	}

	if qe.repo != nil {
		qe.repo.SaveQuestionSession(session)
	}

	return session, questions, nil
}

func (qe *QuestionEngine) FilterQuestions(chiefComplaint string) []ClinicalQuestionTemplate {
	cc := strings.ToLower(chiefComplaint)
	cc = strings.ReplaceAll(cc, " ", "_")
	cc = strings.TrimSpace(cc)

	complaintMap := map[string]string{
		"chest_pain": "chest_pain", "chest": "chest_pain",
		"headache": "headache", "head": "headache",
		"abdominal_pain": "abdominal_pain", "abdominal": "abdominal_pain",
		"fever": "fever", "pyrexia": "fever",
		"dyspnoea": "dyspnoea", "dyspnea": "dyspnoea",
		"sob": "dyspnoea", "shortness_of_breath": "dyspnoea",
		"trauma": "trauma", "injury": "trauma",
		"cough": "cough", "vomiting": "vomiting",
	}

	mappedCC := complaintMap[cc]

	filtered := make([]ClinicalQuestionTemplate, 0)
	seen := make(map[string]bool)

	for _, q := range questionLibrary {
		if q.Category == "ros" && q.AppliesToChiefComplaint == "" {
			if !seen[q.ID] {
				filtered = append(filtered, q)
				seen[q.ID] = true
			}
		}
	}

	for _, q := range questionLibrary {
		if q.AppliesToChiefComplaint == cc || q.AppliesToChiefComplaint == mappedCC {
			if !seen[q.ID] {
				filtered = append(filtered, q)
				seen[q.ID] = true
			}
		}
	}

	sortQuestions(filtered)
	return filtered
}

func sortQuestions(qs []ClinicalQuestionTemplate) {
	for i := 0; i < len(qs); i++ {
		for j := i + 1; j < len(qs); j++ {
			if qs[j].Priority < qs[i].Priority {
				qs[i], qs[j] = qs[j], qs[i]
			}
		}
	}
}

type AnswerResult struct {
	Question          ClinicalQuestionTemplate
	Answer            string
	Observation       *core.HPIObservation
	RedFlagTriggered  bool
	RedFlagMessage    string
}

func (qe *QuestionEngine) ProcessAnswer(sessionID string, encounterID string, question ClinicalQuestionTemplate, answer string) (*AnswerResult, error) {
	obs := convertToObservation(encounterID, question, answer)

	if qe.repo != nil {
		qe.repo.SaveHPIObservation(obs)
	}

	result := &AnswerResult{
		Question:    question,
		Answer:      answer,
		Observation: obs,
	}

	result.RedFlagTriggered, result.RedFlagMessage = checkRedFlags(question, answer)

	return result, nil
}

func convertToObservation(encounterID string, question ClinicalQuestionTemplate, answer string) *core.HPIObservation {
	obs := &core.HPIObservation{
		ID:          core.GenerateUUID(),
		EncounterID: encounterID,
		ConceptID:   question.ConceptID,
		ObservationTime: time.Now(),
		Source:      "clinician_entry",
		ValueType:   question.AnswerType,
		Certainty:   1.0,
		Version:     1,
	}

	switch question.AnswerType {
	case "boolean":
		obs.Value = isAffirmative(answer)
	case "numeric":
		obs.Value = parseNumeric(answer)
		obs.Unit = question.Unit
	default:
		obs.Value = answer
	}

	return obs
}

func checkRedFlags(question ClinicalQuestionTemplate, answer string) (bool, string) {
	redFlags := map[string]string{
		"chest_pain_tearing":   "Tearing chest pain \u2014 rule out AORTIC DISSECTION, order CT aortogram",
		"headache_thunderclap": "Thunderclap headache \u2014 rule out SUBARACHNOID HEMORRHAGE, urgent CT head",
		"rebound_tenderness":   "Rebound tenderness \u2014 SUSPECT PERITONITIS, urgent surgical referral",
		"hemoptysis":           "Hemoptysis \u2014 urgent evaluation for PE/TB/malignancy",
		"neck_stiffness":       "Neck stiffness \u2014 SUSPECT MENINGITIS, urgent LP and antibiotics",
	}

	if !isAffirmative(answer) {
		return false, ""
	}
	msg, ok := redFlags[question.ConceptID]
	return ok, msg
}

func isAffirmative(answer string) bool {
	lower := strings.ToLower(strings.TrimSpace(answer))
	return lower == "yes" || lower == "true" || lower == "y" || lower == "1" || lower == "present"
}

func parseNumeric(s string) float64 {
	var val float64
	fmt.Sscanf(strings.TrimSpace(s), "%f", &val)
	return val
}

func (qe *QuestionEngine) AddToQuestionLibrary(q ClinicalQuestionTemplate) {
	questionLibrary = append(questionLibrary, q)
}

func (qe *QuestionEngine) BuildQuestionnaire(chiefComplaint string, includeROS bool) []ClinicalQuestionTemplate {
	questions := qe.FilterQuestions(chiefComplaint)
	sortQuestions(questions)
	return questions
}

func (qe *QuestionEngine) EstimateInformationGain(question ClinicalQuestionTemplate, differentials []*core.DifferentialDiagnosis) float64 {
	if len(differentials) == 0 {
		return float64(10 - question.Priority)
	}
	totalGain := 0.0
	for _, dd := range differentials {
		if dd.IsExcluded {
			continue
		}
		uncertainty := dd.Confidence
		if uncertainty < 0.01 {
			uncertainty = 0.01
		}
		gain := dd.Probability * (1 - uncertainty) * (1 / math.Log(1+uncertainty))
		totalGain += gain
	}
	return totalGain
}
