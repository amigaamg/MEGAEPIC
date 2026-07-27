export interface AtomicFact {
  id: string;
  patientId: string;
  encounterId?: string;
  concept: string;
  value: unknown;
  dataType: string;
  unit?: string;
  timestamp: number;
  recordedAt: number;
  provenance: {
    actorId: string;
    actorType: string;
    actorName?: string;
    source: 'user_input' | 'system_generated' | 'calculated' | 'imported' | 'ai_suggested';
    deviceId?: string;
  };
  status: 'active' | 'superseded' | 'invalidated';
  confidence?: number;
  tags: string[];
  sourceEventId?: string;
  previousFactId?: string;
  metadata: Record<string, unknown>;
}

export interface FactQuery {
  patientId?: string;
  encounterId?: string;
  concept?: string | string[];
  dataType?: string;
  status?: 'active' | 'superseded' | 'invalidated' | 'any';
  source?: string;
  actorId?: string;
  startTime?: number;
  endTime?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'recordedAt' | 'concept';
  sortOrder?: 'asc' | 'desc';
}

export interface FactAggregation {
  concept: string;
  count: number;
  latestValue: unknown;
  firstRecorded: number;
  lastRecorded: number;
  distinctValues: number;
}

export interface FactStoreStats {
  totalFacts: number;
  patientsWithFacts: number;
  conceptsUsed: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
}

export interface FactExportRow {
  id: string;
  patientId: string;
  encounterId: string | undefined;
  concept: string;
  value: unknown;
  dataType: string;
  unit: string | undefined;
  timestamp: number;
  recordedAt: number;
  actorName: string | undefined;
  source: string;
  status: string;
  tags: string[];
}
