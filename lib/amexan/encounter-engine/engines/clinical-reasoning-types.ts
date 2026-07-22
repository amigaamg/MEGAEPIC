import type { Biodata, ChiefComplaint, Answer, Differential } from '../types/ces';

export interface ClinicalSynopsis {
  narrative: string;
  generatedAt: number;
}

export interface SeverityScores {
  news: { value: number; risk: 'low' | 'medium' | 'high'; interpretation: string } | null;
  curb65: { value: number; risk: 'low' | 'medium' | 'high'; interpretation: string } | null;
  qsofa: { value: number; risk: 'low' | 'high'; interpretation: string } | null;
  mews: { value: number; risk: 'low' | 'medium' | 'high'; interpretation: string } | null;
  shockIndex: { value: number; risk: 'normal' | 'elevated' | 'critical'; interpretation: string } | null;
}

export interface AssociatedCondition {
  id: string;
  condition: string;
  confidence: number;
  mechanism: string;
  evidence: string[];
  pendingEvidence: string[];
  managementPreview: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface ClinicalAction {
  id: string;
  priority: number;
  category: 'immediate' | 'urgent' | 'routine';
  action: string;
  details: string;
  source: string;
}

export interface MechanismDrivenInvestigation {
  id: string;
  name: string;
  method: 'bedside' | 'laboratory' | 'imaging' | 'microbiology' | 'pathology' | 'special';
  reason: string;
  clinicalValue: string;
  expectedFindings: string;
  whatItProves: string[];
  whatItExcludes: string[];
  priority: 'routine' | 'urgent' | 'stat';
  confidence: number;
  status: 'suggested' | 'ordered' | 'pending' | 'resulted';
  result?: string;
  resultInterpretation?: string;
}

export interface ClinicalReasoningWorkspaceData {
  synopsis: ClinicalSynopsis;
  severity: SeverityScores;
  associatedConditions: AssociatedCondition[];
  topDifferential: Differential | null;
  mechanismDrivenInvestigations: MechanismDrivenInvestigation[];
  clinicalActions: ClinicalAction[];
  provisionalDiagnosis: string | null;
  provisionalDiagnosisConfirmed: boolean;
}

export function emptyClinicalReasoningWorkspace(): ClinicalReasoningWorkspaceData {
  return {
    synopsis: { narrative: '', generatedAt: 0 },
    severity: { news: null, curb65: null, qsofa: null, mews: null, shockIndex: null },
    associatedConditions: [],
    topDifferential: null,
    mechanismDrivenInvestigations: [],
    clinicalActions: [],
    provisionalDiagnosis: null,
    provisionalDiagnosisConfirmed: false,
  };
}
