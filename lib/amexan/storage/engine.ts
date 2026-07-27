import type { AtomicFact, FactQuery, FactAggregation, FactStoreStats, FactExportRow } from './types';

let _idCounter = 0;
function uid(): string {
  _idCounter++;
  return `fact_${_idCounter}_${Date.now()}`;
}

const _store: Map<string, AtomicFact> = new Map();

export class AtomicFactStore {
  insert(fact: Omit<AtomicFact, 'id' | 'recordedAt'>): AtomicFact {
    const record: AtomicFact = {
      ...fact,
      id: uid(),
      recordedAt: Date.now(),
    };
    _store.set(record.id, record);
    return record;
  }

  insertMany(facts: Omit<AtomicFact, 'id' | 'recordedAt'>[]): AtomicFact[] {
    return facts.map(f => this.insert(f));
  }

  getById(id: string): AtomicFact | undefined {
    return _store.get(id);
  }

  query(query: FactQuery): AtomicFact[] {
    let results = Array.from(_store.values());

    if (query.patientId) results = results.filter(f => f.patientId === query.patientId);
    if (query.encounterId) results = results.filter(f => f.encounterId === query.encounterId);
    if (query.concept) {
      const concepts = Array.isArray(query.concept) ? query.concept : [query.concept];
      results = results.filter(f => concepts.includes(f.concept));
    }
    if (query.dataType) results = results.filter(f => f.dataType === query.dataType);
    if (query.source) results = results.filter(f => f.provenance.source === query.source);
    if (query.actorId) results = results.filter(f => f.provenance.actorId === query.actorId);
    if (query.startTime) results = results.filter(f => f.timestamp >= query.startTime!);
    if (query.endTime) results = results.filter(f => f.timestamp <= query.endTime!);

    if (query.status && query.status !== 'any') {
      results = results.filter(f => f.status === query.status);
    } else if (!query.status || query.status === 'any') {
    } else {
      results = results.filter(f => f.status === 'active');
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(f => query.tags!.some(t => f.tags.includes(t)));
    }

    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    results.sort((a, b) => {
      const aVal = a[sortBy] as number | string;
      const bVal = b[sortBy] as number | string;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return sortOrder === 'desc'
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });

    if (query.offset) results = results.slice(query.offset);
    if (query.limit) results = results.slice(0, query.limit);

    return results;
  }

  getLatestFact(patientId: string, concept: string): AtomicFact | undefined {
    const facts = this.query({
      patientId,
      concept,
      status: 'active',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      limit: 1,
    });
    return facts[0];
  }

  getFactsForEncounter(encounterId: string): AtomicFact[] {
    return this.query({ encounterId, status: 'any', sortBy: 'timestamp', sortOrder: 'asc' });
  }

  getPatientTimeline(patientId: string): AtomicFact[] {
    return this.query({ patientId, status: 'any', sortBy: 'timestamp', sortOrder: 'asc' });
  }

  supersedeFact(factId: string, replacement?: Omit<AtomicFact, 'id' | 'recordedAt'>): AtomicFact | undefined {
    const fact = _store.get(factId);
    if (!fact) return undefined;
    fact.status = 'superseded';
    if (replacement) {
      const newFact = this.insert({ ...replacement, previousFactId: factId });
      return newFact;
    }
    return undefined;
  }

  invalidateFact(factId: string): boolean {
    const fact = _store.get(factId);
    if (!fact) return false;
    fact.status = 'invalidated';
    return true;
  }

  aggregateByConcept(patientId: string): FactAggregation[] {
    const facts = this.query({ patientId, status: 'active' });
    const groups = new Map<string, AtomicFact[]>();
    for (const f of facts) {
      if (!groups.has(f.concept)) groups.set(f.concept, []);
      groups.get(f.concept)!.push(f);
    }
    return Array.from(groups.entries()).map(([concept, items]) => ({
      concept,
      count: items.length,
      latestValue: items.reduce((a, b) => a.timestamp > b.timestamp ? a : b).value,
      firstRecorded: items.reduce((a, b) => a.timestamp < b.timestamp ? a : b).timestamp,
      lastRecorded: items.reduce((a, b) => a.timestamp > b.timestamp ? a : b).timestamp,
      distinctValues: new Set(items.map(i => JSON.stringify(i.value))).size,
    }));
  }

  getStats(): FactStoreStats {
    const all = Array.from(_store.values());
    const patients = new Set(all.map(f => f.patientId));
    const concepts = new Set(all.map(f => f.concept));
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const f of all) {
      byStatus[f.status] = (byStatus[f.status] || 0) + 1;
      bySource[f.provenance.source] = (bySource[f.provenance.source] || 0) + 1;
    }
    return {
      totalFacts: all.length,
      patientsWithFacts: patients.size,
      conceptsUsed: concepts.size,
      byStatus,
      bySource,
    };
  }

  exportFacts(query: FactQuery): FactExportRow[] {
    return this.query(query).map(f => ({
      id: f.id,
      patientId: f.patientId,
      encounterId: f.encounterId,
      concept: f.concept,
      value: f.value,
      dataType: f.dataType,
      unit: f.unit,
      timestamp: f.timestamp,
      recordedAt: f.recordedAt,
      actorName: f.provenance.actorName,
      source: f.provenance.source,
      status: f.status,
      tags: f.tags,
    }));
  }

  clear(): void {
    _store.clear();
  }

  count(): number {
    return _store.size;
  }

  fromEvent(eventType: string, payload: Record<string, unknown>, meta: {
    patientId: string;
    encounterId?: string;
    actorId: string;
    actorType: string;
    actorName?: string;
    source: 'user_input' | 'system_generated' | 'calculated' | 'imported' | 'ai_suggested';
    eventId: string;
  }): AtomicFact[] {
    const facts: Omit<AtomicFact, 'id' | 'recordedAt'>[] = [];
    const ts = Date.now();

    for (const [key, value] of Object.entries(payload)) {
      if (value === null || value === undefined) continue;
      facts.push({
        patientId: meta.patientId,
        encounterId: meta.encounterId,
        concept: `${eventType}.${key}`,
        value,
        dataType: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
        unit: undefined,
        timestamp: ts,
        provenance: {
          actorId: meta.actorId,
          actorType: meta.actorType,
          actorName: meta.actorName,
          source: meta.source,
        },
        status: 'active',
        tags: [eventType],
        sourceEventId: meta.eventId,
        metadata: {},
      });
    }

    return this.insertMany(facts);
  }
}
