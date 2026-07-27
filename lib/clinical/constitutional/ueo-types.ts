// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal Examination Object (UEO) Type System
// Constitutional Volume — cross-cutting local lesion objects
// ═══════════════════════════════════════════════════════════════

export type UEOType =
  | 'mass' | 'ulcer' | 'swelling' | 'rash' | 'wound'
  | 'discharge' | 'stoma' | 'lymph_node' | 'scar'
  | 'hernia' | 'burn' | 'pigmented_lesion' | 'pressure_sore'
  | 'edema' | 'sinus' | 'fistula' | 'drain' | 'catheter'
  | 'surgical_incision' | 'skin_graft' | 'flap' | 'deformity';

export type UEOActivationSource = 'finding' | 'manual';

export interface UEOIdentifiers {
  id: string;
  type: UEOType;
  label: string;
  activationSource: UEOActivationSource;
  triggerCardId?: string;
  triggerValue?: string;
  parentSystem?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UEOMeasurement {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  diameterCm?: number;
  depthCm?: number;
  volumeMl?: number;
  measuredAt: number;
}

export interface UEOPhotograph {
  id: string;
  url: string;
  annotation?: string;
  date: number;
  clinicianUid?: string;
  consentObtained: boolean;
}

export interface UEOFollowUp {
  measurementHistory: UEOMeasurement[];
  photographs: UEOPhotograph[];
  notes: string[];
}

export interface UEOOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersUeo?: UEOType;
  triggersFindings?: string[];
}

export interface UEOEvidenceLink {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  documentationPhrase: string;
}

export interface UEOExpandRule {
  triggerValues: string[];
  expandCardIds: string[];
}

export interface UEOCardDef {
  id: string;
  group: string;
  cardNumber: number;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: UEOOption[];
  documentationTemplate: string;
  expandRule?: UEOExpandRule;
  evidenceLinks: UEOEvidenceLink[];
  visibility?: {
    showForUeoTypes?: UEOType[];
    hideForUeoTypes?: UEOType[];
    showForTriggerValues?: string[];
    alwaysShow?: boolean;
  };
}

export interface UEOActivationRule {
  triggerCardIds: string[];
  triggerValues: string[];
  ueoType: UEOType;
  ueoLabel: string;
  priority: number;
}

export interface UEOObject {
  identifiers: UEOIdentifiers;
  findings: Record<string, unknown>;
  measurements: UEOMeasurement[];
  photographs: UEOPhotograph[];
  narrative: string;
  active: boolean;
}

export interface UEOGroupDef {
  type: UEOType;
  label: string;
  sectionOrder: number;
  cards: UEOCardDef[];
  activationRules: UEOActivationRule[];
  documentationTemplate: (findings: Record<string, unknown>, measurements: UEOMeasurement[]) => string;
  evidenceGraphBuilder: (findings: Record<string, unknown>) => UEOEvidenceNode[];
  icon?: string;
}

export interface UEOEvidenceNode {
  finding: string;
  findingLabel: string;
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];
  monitoring: string[];
}

export interface UEOContext {
  activeObjects: Record<string, UEOObject>;
  allFindings: Record<string, unknown>;
}
