# Chapter 13: Event Model

## 13.1 Event Schema

```json
{
  "id": "uuid",
  "encounter_id": "uuid",
  "event_type": "patient.registered",
  "payload": {},
  "timestamp": "2024-06-28T08:00:00Z",
  "user_id": "uuid",
  "source": "system",
  "version": 1
}
```

## 13.2 Event Types

### Patient Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `patient.registered` | PAT-001 | `{ patient_id, method }` |
| `patient.merged` | Manual | `{ from_patient_id, to_patient_id }` |
| `patient.updated` | PAT-003 | `{ fields_changed: [...] }` |
| `patient.deceased` | Clinical | `{ date, cause, certifier }` |

### Encounter Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `encounter.created` | ENC-001 | `{ patient_id, visit_type, priority }` |
| `encounter.state_changed` | ENC-0100 | `{ from_state, to_state }` |
| `encounter.completed` | ENC-0103 | `{ completeness_score }` |
| `encounter.cancelled` | Manual | `{ reason, authorizer }` |

### Clinical Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `observation.recorded` | Any input | `{ concept_id, value }` |
| `diagnosis.added` | Diagnosis | `{ diagnosis_code, type }` |
| `diagnosis.confirmed` | Clinician | `{ diagnosis_code }` |
| `prescription.signed` | Prescription | `{ medication_count }` |
| `investigation.ordered` | Order | `{ investigation_type }` |
| `investigation.result` | Lab | `{ concept_id, value, flag }` |

### Safety Events
| Event | Trigger | Payload |
|-------|---------|---------|
| `safety.alert_raised` | QLY-001 | `{ alert_type, severity }` |
| `safety.violation` | WRK-001 | `{ rule_id, description }` |
| `safety.override` | WRK-002 | `{ rule_id, reason, authorizer }` |
