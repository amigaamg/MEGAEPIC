// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Intelligence Engine
// Orchestrates: Investigation → Medication → Nursing → Monitoring → Supportive
// Takes clinical reasoning output + vitals → produces full care plan
// ═══════════════════════════════════════════════════════════════════════════════

import type { CoughDiseaseProbability } from '@/lib/amexan/clinical-reasoning/coughReasoning'
import type { CoughRedFlag } from '@/lib/amexan/clinical-reasoning/coughReasoning'
import type { InvestigationBundle, MedicationProtocol, NursingProtocol, MonitoringProtocol, SupportiveCareProtocol, InfusionProtocol, IsolationProtocol } from '../types/protocols'
import { getProtocolsByDiseaseId } from '../protocols'

export interface PatientVitals {
  oxygenSaturation?: number
  respiratoryRate?: number
  heartRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  temperature?: number
  consciousness?: 'alert' | 'confused' | 'unresponsive'
  urineOutput?: number
}

export interface ClinicalIntelligenceInput {
  differentials: CoughDiseaseProbability[]
  redFlags: CoughRedFlag[]
  vitals: PatientVitals
  comorbidities: string[]
  allergies: string[]
  age: number
  pregnancy: boolean
}

export interface InvestigationOrder {
  bundleId: string
  bundleLabel: string
  laboratory: string[]
  imaging: string[]
  microbiology: string[]
  bedside: string[]
  conditional: { label: string; tests: string[] }[]
}

export interface MedicationOrder {
  drug: string
  route: string
  dose: string
  frequency: string
  duration: string
  alternativeIfAllergy: string[]
  notes: string
}

export interface NursingOrderPlan {
  protocolId: string
  monitoring: { parameter: string; frequency: string; target?: string; notes?: string }[]
  care: { parameter: string; frequency: string; notes?: string }[]
  escalation: { condition: string; threshold: string; action: string; notify: string[] }[]
}

export interface MonitoringPlan {
  vitalsFrequency: string
  urineOutput: boolean
  fluidBalance: boolean
  dailyWeight: boolean
  painScore: boolean
  special: string[]
}

export interface SupportiveCarePlan {
  oxygen: SupportiveCareProtocol | null
  fluids: SupportiveCareProtocol | null
  vasopressors: SupportiveCareProtocol | null
  fever: SupportiveCareProtocol | null
  nutrition: SupportiveCareProtocol | null
  dvtProphylaxis: SupportiveCareProtocol | null
  chestPhysio: SupportiveCareProtocol | null
  mobilization: SupportiveCareProtocol | null
  sepsisBundle: SupportiveCareProtocol | null
}

export interface ClinicalIntelligenceOutput {
  leadingDiagnosis: string
  severity: 'mild' | 'moderate' | 'severe'
  investigations: InvestigationOrder
  medications: MedicationOrder[]
  nursing: NursingOrderPlan | null
  monitoring: MonitoringPlan | null
  supportive: SupportiveCarePlan
  infusion: InfusionProtocol[]
  isolation: IsolationProtocol | null
  recommendations: string[]
  warnings: string[]
}

export function runClinicalIntelligence(input: ClinicalIntelligenceInput): ClinicalIntelligenceOutput {
  const topDisease = input.differentials[0]
  const diseaseId = topDisease?.diseaseId || 'community_acquired_pneumonia'
  const protocols = getProtocolsByDiseaseId(diseaseId) || getProtocolsByDiseaseId('community_acquired_pneumonia')!

  // ── Determine severity from vitals + CURB-65 equivalents ──
  const hasSevereCriteria = input.redFlags.some(r => r.critical) ||
    (input.vitals.respiratoryRate || 0) >= 30 ||
    (input.vitals.bloodPressureSystolic || 0) < 90 ||
    (input.vitals.oxygenSaturation || 100) < 90 ||
    input.vitals.consciousness === 'confused' ||
    input.vitals.consciousness === 'unresponsive'

  const finalSeverity: 'mild' | 'moderate' | 'severe' = hasSevereCriteria ? 'severe' : 'moderate'

  // ── Get appropriate investigation bundle ──
  const bundle = protocols.investigationBundles.find(b =>
    b.diseaseId === (topDisease?.diseaseId || 'community_acquired_pneumonia') &&
    b.severity === finalSeverity
  ) || protocols.investigationBundles[0]

  // ── Get medications ──
  const meds = protocols.medications.filter(m =>
    m.diseaseId === (topDisease?.diseaseId || 'community_acquired_pneumonia')
  )

  const primaryMeds = meds.length > 0
    ? meds.map(m => ({
        drug: m.drug,
        route: m.route,
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        alternativeIfAllergy: m.alternativeIfAllergy,
        notes: m.notes,
      }))
    : [{
        drug: 'Ceftriaxone 2g IV OD + Azithromycin 500mg PO OD',
        route: 'IV + PO',
        dose: 'As ordered',
        frequency: 'OD',
        duration: '5-7 days',
        alternativeIfAllergy: ['Levofloxacin 750 mg IV/PO OD'],
        notes: 'Empiric CAP coverage per Kenya guidelines',
      }]

  // ── Get nursing plan ──
  const nursingProto = protocols.nursing.find(n =>
    n.diseaseId === (topDisease?.diseaseId || 'community_acquired_pneumonia') &&
    n.severity === finalSeverity
  ) || protocols.nursing[0]

  const nursingPlan: NursingOrderPlan | null = nursingProto ? {
    protocolId: nursingProto.id,
    monitoring: nursingProto.monitoring,
    care: nursingProto.care,
    escalation: nursingProto.escalation,
  } : null

  // ── Get monitoring plan ──
  const monitorProto = protocols.monitoring.find(m =>
    m.diseaseId === (topDisease?.diseaseId || 'community_acquired_pneumonia') &&
    m.severity === finalSeverity
  ) || protocols.monitoring[0]

  const monitoringPlan: MonitoringPlan = monitorProto ? {
    vitalsFrequency: monitorProto.vitalsFrequency,
    urineOutput: monitorProto.urineOutput,
    fluidBalance: monitorProto.fluidBalance,
    dailyWeight: monitorProto.dailyWeight,
    painScore: monitorProto.painScore,
    special: monitorProto.special,
  } : { vitalsFrequency: 'Q4H', urineOutput: true, fluidBalance: true, dailyWeight: false, painScore: true, special: [] }

  // ── Build supportive care plan ──
  const spo2 = input.vitals.oxygenSaturation || 98
  const sbp = input.vitals.bloodPressureSystolic || 120
  const temp = input.vitals.temperature || 37
  const rr = input.vitals.respiratoryRate || 18

  const supportive: SupportiveCarePlan = {
    oxygen: spo2 < 92 ? findProtocol(protocols.supportiveCare, spo2 < 85 ? 'oxygen_severe_hypoxia' : 'oxygen_hypoxia') : null,
    fluids: sbp < 90 ? findProtocol(protocols.supportiveCare, 'fluid_resuscitation') : null,
    vasopressors: sbp < 65 ? findProtocol(protocols.supportiveCare, 'vasopressor_shock') : null,
    fever: temp > 39 ? findProtocol(protocols.supportiveCare, 'fever_management') : null,
    nutrition: findProtocol(protocols.supportiveCare, 'nutrition'),
    dvtProphylaxis: finalSeverity === 'severe' ? findProtocol(protocols.supportiveCare, 'dvt_prophylaxis') : null,
    chestPhysio: null,
    mobilization: finalSeverity !== 'severe' ? findProtocol(protocols.supportiveCare, 'early_mobilization') : null,
    sepsisBundle: hasSevereCriteria ? findProtocol(protocols.supportiveCare, 'sepsis_bundle') : null,
  }

  // ── Get infusion protocols ──
  const infusions: InfusionProtocol[] = []
  if (sbp < 90) infusions.push(...protocols.infusions.filter(i => i.indication === 'Hypotension / shock'))
  infusions.push(...protocols.infusions.filter(i => i.indication === 'Maintenance fluids'))
  infusions.push(...protocols.infusions.filter(i => i.indication === 'CAP empiric antibiotics'))

  // ── Get isolation ──
  const isolation = protocols.isolation.find(i => i.diseaseId === (topDisease?.diseaseId || 'community_acquired_pneumonia')) || null

  // ── Build recommendations & warnings ──
  const recommendations: string[] = []
  const warnings: string[] = []

  recommendations.push('Admission for inpatient care recommended')
  if (finalSeverity === 'severe') recommendations.push('ICU admission strongly recommended — meet severe CAP criteria')
  recommendations.push(`Start empiric antibiotics per protocol`)
  recommendations.push('Obtain blood cultures before first antibiotic dose (within 1 hour)')
  recommendations.push('Monitor SpO2 continuously — target >92%')
  if (rr > 30) recommendations.push('ABG to assess for respiratory failure')
  if (topDisease?.diseaseId === 'tuberculosis') recommendations.push('Place in airborne isolation. Start 4-drug TB therapy. Notify TB program.')

  if (input.vitals.oxygenSaturation !== undefined && input.vitals.oxygenSaturation < 90) {
    warnings.push('HYPOXIA: SpO2 <90% — immediate oxygen therapy required')
  }
  if (hasSevereCriteria) {
    warnings.push('SEVERE PNEUMONIA: ICU referral indicated — high severity criteria met')
  }
  if (input.allergies.includes('penicillin')) {
    warnings.push('PENICILLIN ALLERGY: Avoid beta-lactams. Use levofloxacin or clarithromycin-based regimen.')
  }
  if (input.pregnancy) {
    warnings.push('PREGNANCY: Avoid doxycycline, fluoroquinolones. Consult obstetrics for antibiotic selection.')
  }
  if (topDisease?.diseaseId === 'tuberculosis') {
    recommendations.push('Notify TB program. Initiate contact tracing. Test for HIV.')
  }

  return {
    leadingDiagnosis: topDisease?.diseaseName || 'Pending diagnosis',
    severity: finalSeverity,
    investigations: {
      bundleId: bundle.id,
      bundleLabel: bundle.label,
      laboratory: bundle.laboratory,
      imaging: bundle.imaging,
      microbiology: bundle.microbiology,
      bedside: bundle.bedside,
      conditional: Object.entries(bundle.conditional ?? {}).map(([label, tests]) => ({ label, tests: tests as string[] })),
    },
    medications: primaryMeds,
    nursing: nursingPlan,
    monitoring: monitoringPlan,
    supportive,
    infusion: infusions,
    isolation,
    recommendations,
    warnings,
  }
}

function findProtocol(protocols: SupportiveCareProtocol[], id: string): SupportiveCareProtocol | null {
  return protocols.find(p => p.id === id) || null
}
