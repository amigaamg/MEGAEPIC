import type { EventEngine } from '../events/engine';
import type { ClinicalEvent } from '../events/types';
import { AtomicFactStore } from './engine';

const FACT_EVENT_TYPES = new Set([
  'symptom.recorded', 'symptom.updated', 'symptom.resolved',
  'fact.recorded', 'fact.updated',
  'finding.recorded', 'finding.updated',
  'vital.recorded',
  'examination.performed',
  'investigation.ordered', 'investigation.resulted',
  'diagnosis.added', 'diagnosis.updated', 'diagnosis.removed',
  'treatment.prescribed', 'treatment.administered', 'treatment.discontinued',
  'medication.ordered', 'medication.administered',
  'procedure.performed',
  'score.calculated',
  'admission.ordered', 'discharge.ordered', 'transfer.ordered',
  'outcome.recorded',
]);

export function connectEventStore(eventEngine: EventEngine, factStore: AtomicFactStore): () => void {
  return eventEngine.onCascade((_effect, event) => {
    if (!FACT_EVENT_TYPES.has(event.type)) return;
    if (event.patient.id === 'unknown' || event.patient.id === 'demo') return;

    const payload = event.payload as Record<string, unknown> | undefined;
    if (!payload) return;

    factStore.fromEvent(event.type, payload, {
      patientId: event.patient.id,
      encounterId: event.patient.encounterId,
      actorId: event.actor.id,
      actorType: event.actor.type,
      actorName: event.actor.name,
      source: event.metadata.provenance,
      eventId: event.id,
    });
  });
}
