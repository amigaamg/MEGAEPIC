import { savePhaseData, listenPhaseData } from '@/lib/firebase/encounterService';
import { addEvidence } from '@/lib/amexan/knowledge-graph/neo4jService';

const EXAMINATION_PHASE = 'examination';

export interface PersistedExamFindings {
  cardiology?: Record<string, { value: unknown; documentedAt: number }>;
  respiratory?: Record<string, { value: unknown; documentedAt: number }>;
  abdominal?: Record<string, { value: unknown; documentedAt: number }>;
  neurological?: Record<string, { value: unknown; documentedAt: number }>;
  breast?: Record<string, { value: unknown; documentedAt: number }>;
  anthropometry?: Record<string, number | null>;
  general?: Record<string, unknown>;
  vitals?: Record<string, unknown>;
  narratives?: Record<string, string>;
  evidenceGraph?: Record<string, unknown[]>;
  ueo?: Record<string, unknown>;
}

export async function persistExamFindings(
  orgId: string,
  deptId: string,
  unitId: string,
  encounterId: string,
  findings: PersistedExamFindings,
): Promise<void> {
  await savePhaseData(deptId, unitId, encounterId, EXAMINATION_PHASE, findings as Record<string, unknown>, orgId);
}

export function listenExamFindings(
  orgId: string,
  deptId: string,
  unitId: string,
  encounterId: string,
  onData: (data: PersistedExamFindings | null) => void,
): () => void {
  return listenPhaseData(deptId, unitId, encounterId, EXAMINATION_PHASE, onData, orgId);
}

export function persistEvidenceGraph(
  encounterId: string,
  evidenceNodes: { finding: string; findingLabel: string; value: unknown; mechanisms: string[]; phenotypes: string[]; diseases: string[]; investigations: string[] }[],
): void {
  for (const node of evidenceNodes) {
    const val = String(node.value ?? '');
    addEvidence({
      encounterId,
      evidenceId: `ev_${encounterId}_${node.finding}`,
      type: 'examination_finding',
      category: node.diseases.length > 0 ? 'diagnostic' : 'screening',
      name: node.findingLabel,
      value: val,
      timestamp: new Date().toISOString(),
      source: 'examination_engine',
      confidence: node.diseases.length > 0 ? 0.7 : 0.5,
    }).catch(() => {});
  }
}
