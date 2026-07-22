package core

import (
	"context"
	"fmt"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
)

// RuleEngine is the heart of the Clinical Rules Language.
// It evaluates conditions, executes actions, and manages rule lifecycle.
type RuleEngine struct {
	mu           sync.RWMutex
	rules        map[string]*Rule
	categoryIndex map[RuleCategory][]string
	activePaths  map[string]bool
	observations map[string]*Observation
	events       []*ClinicalEvent
}

func NewRuleEngine() *RuleEngine {
	return &RuleEngine{
		rules:        make(map[string]*Rule),
		categoryIndex: make(map[RuleCategory][]string),
		activePaths:  make(map[string]bool),
		observations: make(map[string]*Observation),
	}
}

// LoadRules loads rules into the engine
func (e *RuleEngine) LoadRules(rules []*Rule) {
	e.mu.Lock()
	defer e.mu.Unlock()
	for _, r := range rules {
		e.rules[r.Code] = r
		e.categoryIndex[r.Category] = append(e.categoryIndex[r.Category], r.Code)
	}
}

// GetRule returns a rule by its code
func (e *RuleEngine) GetRule(code string) (*Rule, bool) {
	e.mu.RLock()
	defer e.mu.RUnlock()
	r, ok := e.rules[code]
	return r, ok
}

// GetRulesByCategory returns all rules in a category
func (e *RuleEngine) GetRulesByCategory(cat RuleCategory) []*Rule {
	e.mu.RLock()
	defer e.mu.RUnlock()
	codes := e.categoryIndex[cat]
	rules := make([]*Rule, 0, len(codes))
	for _, code := range codes {
		if r, ok := e.rules[code]; ok {
			rules = append(rules, r)
		}
	}
	return rules
}

// EvaluateAll evaluates all rules for a given context
func (e *RuleEngine) EvaluateAll(ctx context.Context, state *RuleState) []RuleResult {
	e.mu.RLock()
	defer e.mu.RUnlock()

	var results []RuleResult
	for _, rule := range e.rules {
		if rule.Status != RuleActive {
			continue
		}
		result := e.evaluateRule(rule, state)
		if result.Triggered {
			results = append(results, result)
		}
	}

	// Sort by priority (highest first)
	sort.Slice(results, func(i, j int) bool {
		return results[i].Rule.Priority > results[j].Rule.Priority
	})

	return results
}

// EvaluateByCategory evaluates rules in a specific category
func (e *RuleEngine) EvaluateByCategory(ctx context.Context, cat RuleCategory, state *RuleState) []RuleResult {
	e.mu.RLock()
	defer e.mu.RUnlock()

	var results []RuleResult
	codes := e.categoryIndex[cat]
	for _, code := range codes {
		rule, ok := e.rules[code]
		if !ok || rule.Status != RuleActive {
			continue
		}
		result := e.evaluateRule(rule, state)
		if result.Triggered {
			results = append(results, result)
		}
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Rule.Priority > results[j].Rule.Priority
	})

	return results
}

// EvaluateRule evaluates a single rule
func (e *RuleEngine) evaluateRule(rule *Rule, state *RuleState) RuleResult {
	result := RuleResult{
		Rule:      *rule,
		Triggered: false,
		Actions:   nil,
		Timestamp: time.Now(),
	}

	// Check dependencies
	for _, dep := range rule.Dependencies {
		if !state.IsCompleted(dep) {
			return result
		}
	}

	// Check exceptions first
	for _, exc := range rule.Exceptions {
		matched, _, err := e.evaluateCondition(exc, state)
		if err == nil && matched {
			return result
		}
	}

	// Evaluate all conditions
	for _, cond := range rule.Conditions {
		matched, _, err := e.evaluateCondition(cond, state)
		if err != nil || !matched {
			return result
		}
	}

	// All conditions met - execute actions
	result.Triggered = true
	executed := make([]ActionResult, 0, len(rule.Actions))
	for _, action := range rule.Actions {
		res := e.executeAction(action, state)
		executed = append(executed, res)
	}
	result.Actions = executed

	// Record the event
	e.recordEvent(ClinicalEvent{
		UUID:        generateUUID(),
		EncounterID: state.EncounterID,
		EventType:   EventRuleTriggered,
		Payload: map[string]interface{}{
			"rule_code": rule.Code,
			"rule_name": rule.Name,
			"actions":   len(executed),
		},
		Timestamp: time.Now(),
		UserID:    state.UserID,
		Version:   1,
	})

	return result
}

// evaluateCondition evaluates a single condition against state
func (e *RuleEngine) evaluateCondition(cond Condition, state *RuleState) (bool, interface{}, error) {
	actualValue := state.GetValue(cond.Field)

	var match bool
	switch cond.Operator {
	case OpEquals:
		match = fmt.Sprintf("%v", actualValue) == fmt.Sprintf("%v", cond.Value)
	case OpNotEquals:
		match = fmt.Sprintf("%v", actualValue) != fmt.Sprintf("%v", cond.Value)
	case OpGreaterThan:
		match = compareNumeric(actualValue, cond.Value) > 0
	case OpLessThan:
		match = compareNumeric(actualValue, cond.Value) < 0
	case OpGreaterEqual:
		match = compareNumeric(actualValue, cond.Value) >= 0
	case OpLessEqual:
		match = compareNumeric(actualValue, cond.Value) <= 0
	case OpIn:
		match = inList(actualValue, cond.Value)
	case OpNotIn:
		match = !inList(actualValue, cond.Value)
	case OpExists:
		match = actualValue != nil
	case OpNotExists:
		match = actualValue == nil
	case OpContains:
		match = contains(actualValue, cond.Value)
	case OpMatches:
		match = regexMatch(actualValue, cond.Value)
	case OpBetween:
		match = between(actualValue, cond.Value)
	default:
		return false, nil, fmt.Errorf("unknown operator: %s", cond.Operator)
	}

	if cond.Negate {
		match = !match
	}

	return match, actualValue, nil
}

// executeAction executes a single action
func (e *RuleEngine) executeAction(action Action, state *RuleState) ActionResult {
	result := ActionResult{
		Action:    action,
		Executed:  false,
		Timestamp: time.Now(),
	}

	switch action.Type {
	case ActionShowSection:
		state.ShowSection(action.Target)
		result.Executed = true

	case ActionHideSection:
		state.HideSection(action.Target)
		result.Executed = true

	case ActionRequireField:
		state.RequireField(action.Target, action.Parameters)
		result.Executed = true

	case ActionRecommendQuestion:
		state.RecommendQuestion(action.Target, action.Parameters)
		result.Executed = true

	case ActionRecommendExam:
		state.RecommendExam(action.Target, action.Parameters)
		result.Executed = true

	case ActionRecommendInvestigation:
		state.RecommendInvestigation(action.Target, action.Parameters)
		result.Executed = true

	case ActionCalculateScore:
		score := state.CalculateScore(action.Target, action.Parameters)
		result.Output = score
		result.Executed = true

	case ActionTriggerAlert:
		state.RaiseAlert(action.Target, action.Parameters)
		result.Executed = true

	case ActionUpdateProbability:
		if disease, ok := action.Parameters["disease"].(string); ok {
			delta := 0.0
			if d, ok := action.Parameters["delta"].(float64); ok {
				delta = d
			}
			state.UpdateProbability(disease, delta)
			result.Executed = true
		}

	case ActionActivatePathway:
		state.ActivatePathway(action.Target)
		e.activePaths[action.Target] = true
		result.Executed = true

	case ActionRaiseWarning:
		state.AddWarning(action.Target, action.Parameters)
		result.Executed = true

	case ActionInsertSection:
		state.InsertSection(action.Target, action.Parameters)
		result.Executed = true

	case ActionFilterDifferential:
		state.FilterDifferential(action.Target, action.Parameters)
		result.Executed = true

	case ActionAddDifferential:
		state.AddDifferential(action.Target)
		result.Executed = true

	case ActionRemoveDifferential:
		state.RemoveDifferential(action.Target)
		result.Executed = true

	case ActionRecommendReferral:
		state.RecommendReferral(action.Target, action.Parameters)
		result.Executed = true

	case ActionAutoPopulate:
		state.AutoPopulate(action.Target, action.Parameters)
		result.Executed = true
	}

	return result
}

func (e *RuleEngine) recordEvent(event ClinicalEvent) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.events = append(e.events, &event)
}

// GetEvents returns all events for an encounter
func (e *RuleEngine) GetEvents(encounterID string) []*ClinicalEvent {
	e.mu.RLock()
	defer e.mu.RUnlock()
	var filtered []*ClinicalEvent
	for _, ev := range e.events {
		if ev.EncounterID == encounterID {
			filtered = append(filtered, ev)
		}
	}
	return filtered
}

// ============================================================================
// RULE STATE - The context for rule evaluation
// ============================================================================

type RuleState struct {
	EncounterID   string
	UserID        string
	PatientID     string
	Patient       *PatientContext
	Encounter     *Encounter
	Values        map[string]interface{}
	VisibleSections map[string]bool
	RequiredFields  map[string]bool
	Recommendations []string
	Warnings        []string
	Alerts          []string
	ActivePathways  []string
	Differential    map[string]float64
	Probabilities   map[string]float64
	CompletedChecks []string
	Scored          map[string]float64
	Actions         []ActionResult
}

func NewRuleState(encounterID, userID, patientID string) *RuleState {
	return &RuleState{
		EncounterID:      encounterID,
		UserID:           userID,
		PatientID:        patientID,
		Values:           make(map[string]interface{}),
		VisibleSections:  make(map[string]bool),
		RequiredFields:   make(map[string]bool),
		Recommendations:  make([]string, 0),
		Warnings:         make([]string, 0),
		Alerts:           make([]string, 0),
		ActivePathways:   make([]string, 0),
		Differential:     make(map[string]float64),
		Probabilities:    make(map[string]float64),
		CompletedChecks:  make([]string, 0),
		Scored:           make(map[string]float64),
		Actions:          make([]ActionResult, 0),
	}
}

func (s *RuleState) SetValue(key string, value interface{}) {
	s.Values[key] = value
}

func (s *RuleState) GetValue(key string) interface{} {
	// Check direct values first
	if v, ok := s.Values[key]; ok {
		return v
	}
	// Check patient context
	if s.Patient != nil {
		switch key {
		case "patient.age":
			return s.Patient.Age
		case "patient.age_category":
			return string(s.Patient.AgeCategory)
		case "patient.sex":
			return string(s.Patient.Sex)
		case "patient.is_pregnant":
			return s.Patient.IsPregnant
		case "patient.has_uterus":
			return s.Patient.HasUterus
		case "patient.is_breastfeeding":
			return s.Patient.IsBreastfeeding
		case "patient.weight_kg":
			return s.Patient.WeightKg
		}
	}
	// Check encounter
	if s.Encounter != nil {
		switch key {
		case "encounter.visit_type":
			return string(s.Encounter.VisitType)
		case "encounter.priority":
			return string(s.Encounter.Priority)
		case "encounter.status":
			return string(s.Encounter.Status)
		case "encounter.clinical_state":
			return string(s.Encounter.ClinicalState)
		}
	}
	return nil
}

func (s *RuleState) IsCompleted(check string) bool {
	for _, c := range s.CompletedChecks {
		if c == check {
			return true
		}
	}
	return false
}

func (s *RuleState) ShowSection(section string) {
	s.VisibleSections[section] = true
}

func (s *RuleState) HideSection(section string) {
	s.VisibleSections[section] = false
}

func (s *RuleState) RequireField(field string, params map[string]interface{}) {
	s.RequiredFields[field] = true
}

func (s *RuleState) RecommendQuestion(question string, params map[string]interface{}) {
	s.Recommendations = append(s.Recommendations, question)
}

func (s *RuleState) RecommendExam(exam string, params map[string]interface{}) {
	s.Recommendations = append(s.Recommendations, fmt.Sprintf("exam:%s", exam))
}

func (s *RuleState) RecommendInvestigation(inv string, params map[string]interface{}) {
	s.Recommendations = append(s.Recommendations, fmt.Sprintf("investigation:%s", inv))
}

func (s *RuleState) CalculateScore(score string, params map[string]interface{}) float64 {
	// Score calculation is handled by specific scoring functions
	// This returns the score or 0 if not implemented
	if val, ok := params["value"].(float64); ok {
		s.Scored[score] = val
		return val
	}
	return 0
}

func (s *RuleState) RaiseAlert(alert string, params map[string]interface{}) {
	s.Alerts = append(s.Alerts, alert)
}

func (s *RuleState) UpdateProbability(disease string, delta float64) {
	current := s.Probabilities[disease]
	s.Probabilities[disease] = current + delta
}

func (s *RuleState) ActivatePathway(pathway string) {
	s.ActivePathways = append(s.ActivePathways, pathway)
}

func (s *RuleState) AddWarning(warning string, params map[string]interface{}) {
	s.Warnings = append(s.Warnings, warning)
}

func (s *RuleState) InsertSection(section string, params map[string]interface{}) {
	s.VisibleSections[section] = true
}

func (s *RuleState) FilterDifferential(filter string, params map[string]interface{}) {
	// Remove diseases not matching the filter
	for disease := range s.Differential {
		if !strings.Contains(strings.ToLower(disease), strings.ToLower(filter)) {
			delete(s.Differential, disease)
		}
	}
}

func (s *RuleState) AddDifferential(disease string) {
	s.Differential[disease] = 0.0
}

func (s *RuleState) RemoveDifferential(disease string) {
	delete(s.Differential, disease)
}

func (s *RuleState) RecommendReferral(specialty string, params map[string]interface{}) {
	s.Recommendations = append(s.Recommendations, fmt.Sprintf("referral:%s", specialty))
}

func (s *RuleState) AutoPopulate(field string, params map[string]interface{}) {
	if val, ok := params["value"]; ok {
		s.Values[field] = val
	}
}

// ============================================================================
// RULE RESULT
// ============================================================================

type RuleResult struct {
	Rule      Rule          `json:"rule"`
	Triggered bool          `json:"triggered"`
	Actions   []ActionResult `json:"actions,omitempty"`
	Error     string        `json:"error,omitempty"`
	Timestamp time.Time     `json:"timestamp"`
}

type ActionResult struct {
	Action    Action    `json:"action"`
	Executed  bool      `json:"executed"`
	Output    interface{} `json:"output,omitempty"`
	Error     string    `json:"error,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

func compareNumeric(a, b interface{}) int {
	af, aok := toFloat64(a)
	bf, bok := toFloat64(b)
	if !aok || !bok {
		return -2
	}
	if af < bf {
		return -1
	} else if af > bf {
		return 1
	}
	return 0
}

func toFloat64(v interface{}) (float64, bool) {
	switch val := v.(type) {
	case float64:
		return val, true
	case float32:
		return float64(val), true
	case int:
		return float64(val), true
	case int64:
		return float64(val), true
	case string:
		var f float64
		if _, err := fmt.Sscanf(val, "%f", &f); err == nil {
			return f, true
		}
	}
	return 0, false
}

func inList(value, list interface{}) bool {
	listStr := fmt.Sprintf("%v", list)
	valStr := fmt.Sprintf("%v", value)
	items := strings.Split(listStr, ",")
	for _, item := range items {
		if strings.TrimSpace(item) == valStr {
			return true
		}
	}
	return false
}

func contains(value, substr interface{}) bool {
	return strings.Contains(
		strings.ToLower(fmt.Sprintf("%v", value)),
		strings.ToLower(fmt.Sprintf("%v", substr)),
	)
}

func regexMatch(value, pattern interface{}) bool {
	re, err := regexp.Compile(fmt.Sprintf("%v", pattern))
	if err != nil {
		return false
	}
	return re.MatchString(fmt.Sprintf("%v", value))
}

func between(value, bounds interface{}) bool {
	boundsStr := fmt.Sprintf("%v", bounds)
	parts := strings.Split(boundsStr, ",")
	if len(parts) != 2 {
		return false
	}
	val, ok := toFloat64(value)
	if !ok {
		return false
	}
	lower, ok1 := toFloat64(strings.TrimSpace(parts[0]))
	upper, ok2 := toFloat64(strings.TrimSpace(parts[1]))
	if !ok1 || !ok2 {
		return false
	}
	return val >= lower && val <= upper
}

func generateUUID() string {
	return fmt.Sprintf("%x-%x-%x-%x-%x",
		time.Now().UnixNano(),
		time.Now().UnixMilli(),
		time.Now().Unix(),
		time.Now().UnixMicro(),
		time.Now().UnixNano()>>32)
}
