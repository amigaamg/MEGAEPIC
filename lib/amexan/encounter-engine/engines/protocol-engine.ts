import type { ConstitutionalContext } from '../knowledge/symptom-types';

export interface ProtocolRequest {
  diseaseId: string
  severity?: 'mild' | 'moderate' | 'severe' | 'critical'
  context: ConstitutionalContext
  pregnant: boolean
  age: number
  weight?: number
  allergies: string[]
  renalImpairment: boolean
  hepaticImpairment: boolean
}

export interface InvestigationBundle {
  id: string
  label: string
  diseaseId: string
  severity?: string
  bedside: string[]
  laboratory: string[]
  imaging: string[]
  microbiology: string[]
  conditional?: Record<string, string[]>
}

export interface MedicationProtocol {
  id: string
  name: string
  dose: string
  route: string
  frequency: string
  duration: string
  maxDose?: string
  contraindications: string[]
  renalAdjustment?: string
  hepaticAdjustment?: string
  pregnancyCategory?: string
  evidenceLevel: string
  isFirstLine: boolean
  alternatives: string[]
}

export interface NursingProtocol {
  id: string
  focus: string
  actions: string[]
  frequency: string
  monitoring: string[]
}

export interface ImagingProtocol {
  id: string
  modality: string
  indication: string
  contrast: boolean
  preparation: string
}

export interface ProtocolSet {
  diseaseId: string
  diseaseName: string
  investigations: InvestigationBundle[]
  medications: MedicationProtocol[]
  nursing: NursingProtocol[]
  imaging: ImagingProtocol[]
  monitoring: { parameter: string; frequency: string; alertThreshold: string }[]
  supportiveCare: string[]
  isolation: string[]
}

const DISEASE_PROTOCOL_MAP: Record<string, { get: () => Partial<ProtocolSet> }> = {};

export function registerDiseaseProtocols(
  diseaseId: string,
  diseaseName: string,
  getter: () => Partial<ProtocolSet>,
): void {
  DISEASE_PROTOCOL_MAP[diseaseId] = { get: getter };
}

export function getProtocolsForDisease(diseaseId: string): ProtocolSet | null {
  const entry = DISEASE_PROTOCOL_MAP[diseaseId];
  if (!entry) return null;
  const partial = entry.get();
  return {
    diseaseId,
    diseaseName: partial.diseaseName || diseaseId,
    investigations: partial.investigations || [],
    medications: partial.medications || [],
    nursing: partial.nursing || [],
    imaging: partial.imaging || [],
    monitoring: partial.monitoring || [],
    supportiveCare: partial.supportiveCare || [],
    isolation: partial.isolation || [],
  };
}

export function getProtocolsForDifferential(
  diseaseIds: string[],
): Record<string, ProtocolSet | null> {
  const result: Record<string, ProtocolSet | null> = {};
  for (const id of diseaseIds) {
    result[id] = getProtocolsForDisease(id);
  }
  return result;
}

export function suggestInvestigations(
  request: ProtocolRequest,
): InvestigationBundle[] {
  const protocols = getProtocolsForDisease(request.diseaseId);
  if (!protocols) return [];

  let bestBundle = protocols.investigations.find(b => b.severity === request.severity);
  if (!bestBundle) bestBundle = protocols.investigations[0];
  if (!bestBundle) return [];

  const result: InvestigationBundle = {
    id: bestBundle.id,
    label: bestBundle.label,
    diseaseId: bestBundle.diseaseId,
    bedside: [...bestBundle.bedside],
    laboratory: [...bestBundle.laboratory],
    imaging: [...bestBundle.imaging],
    microbiology: [...bestBundle.microbiology],
    conditional: {},
  };

  for (const [condition, tests] of Object.entries(bestBundle.conditional || {})) {
    if (evaluateCondition(condition, request)) {
      result.laboratory.push(...tests.filter(t => !result.laboratory.includes(t)));
      result.imaging.push(...tests.filter(t => !result.imaging.includes(t)));
      result.microbiology.push(...tests.filter(t => !result.microbiology.includes(t)));
    }
  }

  if (request.pregnant) {
    result.imaging = result.imaging.filter(i => !i.toLowerCase().includes('x-ray') || !i.toLowerCase().includes('ct'));
    result.imaging.push('Obstetric ultrasound');
  }

  if (request.allergies.length > 0) {
    result.laboratory = result.laboratory.filter(l => {
      const lower = l.toLowerCase();
      return !request.allergies.some(a => lower.includes(a.toLowerCase()));
    });
  }

  return [result];
}

export function suggestMedications(
  request: ProtocolRequest,
): MedicationProtocol[] {
  const protocols = getProtocolsForDisease(request.diseaseId);
  if (!protocols) return [];

  let candidates = [...protocols.medications];

  if (request.pregnant) {
    candidates = candidates.filter(m => m.pregnancyCategory !== 'X' && m.pregnancyCategory !== 'D');
  }

  if (request.renalImpairment) {
    candidates = candidates.filter(m => !m.renalAdjustment || m.renalAdjustment !== 'contraindicated');
  }

  if (request.hepaticImpairment) {
    candidates = candidates.filter(m => !m.hepaticAdjustment || m.hepaticAdjustment !== 'contraindicated');
  }

  if (request.allergies.length > 0) {
    candidates = candidates.filter(m =>
      !m.contraindications.some(c =>
        request.allergies.some(a => c.toLowerCase().includes(a.toLowerCase())),
      ),
    );
  }

  return candidates;
}

function evaluateCondition(condition: string, request: ProtocolRequest): boolean {
  const ctx = request.context;
  switch (condition) {
    case 'if_severe': return request.severity === 'severe' || request.severity === 'critical';
    case 'if_immunocompromised': return ctx.knownDiseases.some(d => ['hiv', 'cancer', 'diabetes'].includes(d.name.toLowerCase()));
    case 'if_tb_possible': return ctx.knownDiseases.some(d => d.name.toLowerCase().includes('tb')) || ctx.capturedFacts['cough_tb_contact'] === true;
    case 'if_pleural_effusion': return false;
    case 'if_hypoxia': return (ctx.capturedFacts['cough_dyspnea_rest'] as boolean) === true;
    case 'if_renal_impairment': return request.renalImpairment;
    case 'if_hyponatremia': return false;
    default: return false;
  }
}

export function hasProtocolsForDisease(diseaseId: string): boolean {
  return diseaseId in DISEASE_PROTOCOL_MAP;
}

export function getAllRegisteredDiseaseIds(): string[] {
  return Object.keys(DISEASE_PROTOCOL_MAP);
}

export async function loadExistingProtocols(): Promise<void> {
  try {
    const protocols = await import('../../../clinical/protocols');
    if (protocols.getProtocolsByDiseaseId) {
      const knownIds = [
        'community_acquired_pneumonia', 'aspiration_pneumonia',
        'hospital_acquired_pneumonia', 'covid_pneumonia', 'tuberculosis',
        'hypertension', 'diabetes', 'asthma', 'hiv', 'sickle_cell',
        'heart_disease', 'copd', 'ckd',
      ];
      const conditionIds = ['hypertension', 'diabetes', 'asthma', 'hiv', 'sickle_cell', 'heart_disease', 'copd', 'ckd'];

      for (const id of knownIds) {
        const isCondition = conditionIds.includes(id);
        const p = isCondition
          ? protocols.getCommonConditionProtocols(id)
          : protocols.getProtocolsByDiseaseId(id);
        if (p) {
          const investigations = isCondition
            ? (p as any).investigationBundles || []
            : (p as any).investigationBundles || [];
          const medications = isCondition
            ? (p as any).medications || []
            : (p as any).medications || [];
          const nursing = isCondition
            ? (p as any).nursing || []
            : (p as any).nursing || [];

          registerDiseaseProtocols(id, id.replace(/_/g, ' '), () => ({
            diseaseName: id.replace(/_/g, ' '),
            investigations,
            medications: (medications || []).map((m: any) => ({
              id: m.id, name: m.drug || m.name, dose: m.dose,
              route: m.route, frequency: m.frequency, duration: m.duration,
              maxDose: m.maxDose, contraindications: m.contraindications || m.allergies || [],
              evidenceLevel: m.severity === 'critical' || m.severity === 'severe' ? 'a' : 'c',
              isFirstLine: m.severity !== 'severe',
              alternatives: m.alternativeIfAllergy || [],
            })),
            nursing: (nursing || []).map((n: any) => ({
              id: n.id, focus: n.diseaseId || id,
              actions: (n.care || []).map((c: any) => `${c.parameter} ${c.frequency}`).filter(Boolean),
              frequency: n.care?.[0]?.frequency || 'routine',
              monitoring: (n.monitoring || []).map((m: any) => m.parameter || `${m.parameter} ${m.frequency}`),
            })),
            imaging: ((p as any).imagingProtocols || []).map((ip: any) => ({
              id: `img_${id}`, modality: ip.modality || 'X-ray',
              indication: ip.views?.join(', ') || ip.name || '',
              contrast: !!ip.contrast, preparation: ip.preparation || '',
            })),
            monitoring: ((p as any).monitoring || []).map((m: any) => ({
              parameter: m.vitals?.join(', ') || 'vitals',
              frequency: m.vitalsFrequency || '4 hourly',
              alertThreshold: m.special?.join('; ') || '',
            })),
            supportiveCare: ((p as any).supportiveCare || []).map((s: any) =>
              `${s.condition}: ${s.action}`,
            ),
            isolation: ((p as any).isolation || []).map((i: any) =>
              `${i.type} isolation — ${i.ppe.join(', ')}`,
            ),
          }));
        }
      }
    }
  } catch {
    // Protocols not available — registry remains empty
  }
}
