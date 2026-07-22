# AMEXAN Migration Guide — 3 Systems → 1 EncounterState

## Principle

Every piece of clinical data lives in exactly one place: `EncounterState`.
Every engine reads from `EncounterState`, processes, and writes back via `encounterReducer`.
No engine maintains its own state. No component bypasses the reducer.
English is generated only at the end by `DocumentationEngine`.

---

## Phase 1: Replace State Systems

### DELETE these files (and all imports of them):

| Old File | Why Delete | Replaced By |
|---|---|---|
| `src/store/ClinicalContext.tsx` | Competing state store | `lib/amexan/encounter/EncounterContext.tsx` |
| `src/store/ClinicalContext.tsx` | Competing state | `encounterReducer.ts` |
| `src/state/patientStore.ts` | Zustand store duplicating symptoms | `EncounterState.symptoms` + `encounterReducer` |
| `src/state/uiStore.ts` | Zustand duplicating phases | `EncounterState.workflow` + `workflowEngine.ts` |
| `src/types.ts` (PatientForm) | Flat form incompatible with structured symptoms | `EncounterState.symptoms` (structured symptom objects) |
| `src/types/encounter.ts` | Partial Firestore mapping | `EncounterState` (complete) |
| `src/types/clinical.ts` | ClinicalContext type | `EncounterState` |
| `src/types/encounter.ts` | Partial types | None — unified in `encounterState.ts` |

### UPDATE these files to use EncounterContext instead of old stores:

| Old File | Change |
|---|---|
| `app/consultation/respiratory/page.tsx` | Remove imports of `patientStore`, `uiStore`, `ClinicalContext`. Use `useEncounter()`. |
| `app/clinical-intelligence/page.tsx` | Same — replace all state reads with `useEncounter().state` |
| `src/components/DifferentialSidebar.tsx` | Read `state.assessment.differentials` instead of old ClinicalContext |

---

## Phase 2: Delete Competing Question Engines

### DELETE these files (no replacement needed — use `questionEngine.ts`):

| Old File | Replaced By |
|---|---|
| `src/engine/respiratory/questionEngine.ts` | `lib/amexan/encounter/engines/questionEngine.ts` |
| `src/engine/cough/ClinicalEngine.ts` | `questionEngine.ts` (uses symptom schemas) |
| `src/engine/inference/adaptive-questioner.ts` | `questionEngine.ts` |
| `lib/amexan/reasoning/questionEngine.ts` | `questionEngine.ts` (EIG-based — replaced by schema-driven) |

### KEEP these files (they remain as-is, called by new architecture):

| File | Role | Called By |
|---|---|---|
| `lib/amexan/reasoning/bayesianEngine.ts` | Disease probability computation | `ddxEngine.ts` adapter |
| `lib/amexan/knowbase/` | Disease nodes, feature library | Bayesian engine |
| `lib/amexan/reasoning/priorityScorer.ts` | Feature prioritization | Question engine (optional enhancement) |

---

## Phase 3: Replace Fragmented Completion Logic

### DELETE these files:

| Old File | Replaced By |
|---|---|
| `lib/amexan/reasoning/completenessEngine.ts` | `lib/amexan/encounter/completionEngine.ts` (single authority) |

### UPDATE:
- Any file importing `computeCompleteness` from old path → import `evaluateCompleteness` from new path

---

## Phase 4: Replace HPI/Narrative Engines

### DELETE these files:

| Old File | Replaced By |
|---|---|
| `src/engine/inference/hpi-engine.ts` | `narrativeEngine.ts` (dumb formatter) + `completionEngine.ts` (missing questions) |
| `src/engine/inference/clinicalNoteBuilder.ts` | `documentationEngine.ts` |
| `src/engine/respiratory/narrativeEngine.ts` | `documentationEngine.ts` |
| `src/engine/inference/managementPlanGenerator.ts` | Can be kept but refactored to read from `EncounterState.plan` |

---

## Phase 5: Replace Danger/Alert Engines

### DELETE these files:

| Old File | Replaced By |
|---|---|
| `lib/amexan/reasoning/dangerScoringEngine.ts` | `redFlagEngine.ts` |
| `src/engine/clinical-rules/alerts.ts` | `redFlagEngine.ts` |

---

## Phase 6: Keep These Files (they are the strong parts)

These files are NOT replaced. They are the core reasoning layer that the new architecture calls:

| File | Keep Reason |
|---|---|
| `lib/amexan/knowbase/diseaseNode.ts` | Disease tree definition |
| `lib/amexan/knowbase/features/` | Feature library |
| `lib/amexan/knowbase/highways/` | Clinical highways (kept but called via `chiefComplaint.activeHighways`) |
| `lib/amexan/reasoning/bayesianEngine.ts` | Bayesian inference engine |
| `lib/amexan/reasoning/priorityScorer.ts` | Feature scoring (used by question engine) |
| `lib/amexan/reasoning/narrativeEngine.ts` | Can be kept as an alternative formatter |
| `src/engine/reference/` | Reference data (age bands, drugs, milestones) |

---

## Phase 7: Delete Old Encounter Services

### DELETE or rewrite these files:

| Old File | Replaced By |
|---|---|
| `src/services/encounterService.ts` | `EncounterContext.saveToFirestore()` + `loadFromFirestore()` |
| `src/services/encounter-repository.ts` | Same |

---

## Migration Order

```
Phase 1 (State)
  ↓
Phase 2 (Question Engines)
  ↓
Phase 6 (Keep core reasoning)
  ↓
Phase 3 (Completion)
  ↓
Phase 4 (Narrative/HPI)
  ↓
Phase 5 (Danger/Alerts)
  ↓
Phase 7 (Services)
```

Each phase is independent. You can do them one at a time. The old and new systems can coexist during migration — just don't use both on the same encounter.

---

## Files in the unified module (`lib/amexan/encounter/`)

```
encounter/
├── encounterState.ts          # One state type, one factory
├── encounterReducer.ts        # One reducer, 40+ actions
├── symptomSchemas.ts          # 25+ symptom field definitions
├── completionEngine.ts        # Single completion authority
├── EncounterContext.tsx        # React context/provider
├── index.ts                    # Barrel export
├── MIGRATION.md                # This file
└── engines/
    ├── workflowEngine.ts      # One workflow progression
    ├── questionEngine.ts      # Universal question selector
    ├── redFlagEngine.ts       # Pure clinical rules
    ├── rosEngine.ts           # Targeted review of systems
    ├── narrativeEngine.ts     # Dumb formatter (HPI text)
    ├── documentationEngine.ts # SOAP, Admission, Referral, Discharge
    └── ddxEngine.ts           # Adapter between state & Bayesian engine
```
