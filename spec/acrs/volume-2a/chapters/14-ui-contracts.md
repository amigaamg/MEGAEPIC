# Chapter 14: UI Contracts

## 14.1 Universal Encounter Center

### UI-001 — Queue Display
```
Rule:        Queue items sorted by priority, then wait time
Input:       encounter_queue (array of queue items)
Behavior:    Sort by priority desc, then wait time asc
Display:     Priority indicator (color) + Patient name + Complaint + Wait time + Action
Priority colors:
  immediate    → #ef4444 (red)
  emergency    → #ef4444 (red)
  urgent       → #f59e0b (amber)
  semi_urgent  → #3b82f6 (blue)
  routine      → #64748b (gray)
```

### UI-002 — Context-Aware Section Visibility
```
Rule:        Sections are shown/hidden based on CTX rules
Input:       visible_sections, hidden_sections (from CRL engine)
Behavior:    Render only visible sections; never render hidden sections
Exception:   Clinician can override → audit trail required
```

### UI-003 — Required Field Indicators
```
Rule:        Required fields must be visually marked
Display:     Red asterisk (*) next to required field label
Behavior:    Cannot submit form if required fields are empty
Warning:     Yellow indicator for recommended fields
```

### UI-004 — Adaptive Questioning
```
Rule:        Questions appear based on previous answers
Input:       recommendations (array of questions from CRL engine)
Behavior:    Show questions one at a time or in logical groups
Flow:        Answer → Evaluate CRL → Show next questions → Repeat
```

### UI-005 — Emergency Override
```
Rule:        Emergency encounters show ABCDE panel first
Trigger:     visit_type = "emergency"
Display:     Full-screen ABCDE assessment panel
Hide:        Standard history panel (deferred)
Audit:       All overrides logged with reason and clinician ID
```

### UI-006 — Patient Search
```
Rule:        Search patients by name, HN, national ID, or phone
Behavior:    Fuzzy match with trigram similarity
Debounce:    300ms
Min chars:   2
Results:     Show top 10 matches with age, sex, last encounter date
```

### UI-007 — Chronological Complaint Display
```
Rule:        Chief complaints displayed oldest-first
Input:       complaints array with onset timestamps
Sort:        onset ASC (oldest first)
Display:     "Day X: {complaint}" with timeline visualization
```
