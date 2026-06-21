export type TriState = boolean | null;

export interface ACETSchema {
  assessmentId: string;
  clinicalContext: Record<string, unknown>;
  evidence: {
    supporting: string[];
    against: string[];
    weight: number;
  };
  treatment: {
    action: string;
    rationale: string;
    priority: 'routine' | 'urgent' | 'emergency';
  };
}

export interface FeatureEntry {
  id: string;
  present: TriState;
  weight: number;
  diseaseWeights: Record<string, number>;
  negativeDiseaseWeights: Record<string, number>;
  source?: 'history' | 'exam' | 'vital' | 'lab' | 'imaging' | 'score';
  modifier?: {
    key: string;
    value: string | number | boolean;
    weightBoost?: number;
  };
  temporal?: {
    onsetDays?: number;
    durationDays?: number;
    progression?: 'acute' | 'subacute' | 'chronic';
    resolved?: boolean;
    recurrent?: boolean;
  };
}

export interface FeatureRegistry {
  [featureId: string]: FeatureEntry;
}

export interface AmexanEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
}

export interface EngineInterface {
  name: string;
  version: string;
  init(): void;
  process(event: AmexanEvent): void;
  destroy(): void;
}
