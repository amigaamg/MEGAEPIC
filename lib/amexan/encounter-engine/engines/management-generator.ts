import { Answer, Biodata, ChiefComplaint, Differential, ManagementItem, EncounterPhase } from '../types/ces';
import { getMechanismProtocols, mergeMechanismActions } from '../knowledge/mechanism-protocol-map';
import { scoreMechanisms, computeDifferentials, computeRedFlags, MechanismScore, ReasoningInput } from './reasoning-engine';
import { getProtocolsByDiseaseId, getCommonConditionProtocols } from '@/lib/clinical/protocols';
import { getSymptomNodeByName } from '../knowledge/symptomKnowledge';

export interface ManagementGeneratorInput {
  biodata: Biodata | null
  chiefComplaints: ChiefComplaint[]
  answers: Record<string, Answer>
  activeModules: string[]
  currentPhase: EncounterPhase
  completedPhases: EncounterPhase[]
}

export interface GeneratedManagementPlan {
  investigations: ManagementItem[]
  medications: ManagementItem[]
  nursing: ManagementItem[]
  monitoring: ManagementItem[]
  supportive: ManagementItem[]
  referrals: ManagementItem[]
  all: ManagementItem[]
}

const DIFFERENTIAL_TO_PROTOCOL_ID: Record<string, string> = {
  malaria: 'community_acquired_pneumonia',
  severe_malaria: 'community_acquired_pneumonia',
  pneumonia: 'community_acquired_pneumonia',
  community_acquired_pneumonia: 'community_acquired_pneumonia',
  aspiration_pneumonia: 'aspiration_pneumonia',
  hospital_acquired_pneumonia: 'hospital_acquired_pneumonia',
  tuberculosis: 'tuberculosis',
  pulmonary_tuberculosis: 'tuberculosis',
  covid_19: 'covid_pneumonia',
  hypertension: 'hypertension',
  diabetes: 'diabetes',
  asthma: 'asthma',
  hiv: 'hiv',
  sickle_cell: 'sickle_cell',
  sickle_cell_disease: 'sickle_cell',
  heart_disease: 'heart_disease',
  copd: 'copd',
  ckd: 'ckd',
  chronic_kidney_disease: 'ckd',
}

function getTopDifferentialProtocols(differential: Differential): {
  investigations: any[]
  medications: any[]
  nursing: any[]
} {
  if (!differential) return { investigations: [], medications: [], nursing: [] }

  const rawId = differential.diseaseId.replace(/^dx_/, '').toLowerCase()
  const protocolId = DIFFERENTIAL_TO_PROTOCOL_ID[rawId]

  if (protocolId) {
    const protocol = getProtocolsByDiseaseId(protocolId)
    if (protocol) {
      const investigations = (protocol as any).investigationBundles || []
      const medications = (protocol as any).medications || []
      const nursing = (protocol as any).nursing || []
      return { investigations, medications, nursing }
    }
    const conditionProtocol = getCommonConditionProtocols(protocolId)
    if (conditionProtocol) {
      const investigations = (conditionProtocol as any).investigationBundles || []
      const medications = (conditionProtocol as any).medications || []
      const nursing = (conditionProtocol as any).nursing || []
      return { investigations, medications, nursing }
    }
  }

  return { investigations: [], medications: [], nursing: [] }
}

function getPmhProtocolItems(answers: Record<string, Answer>): ManagementItem[] {
  const items: ManagementItem[] = []
  const pmhValue = answers['q_pmh_conditions']?.value
  if (!pmhValue || !Array.isArray(pmhValue)) return items

  const seen = new Set<string>()
  for (const cond of pmhValue) {
    if (cond === 'None') continue
    const condId = cond.toLowerCase().replace(/\s+/g, '_')
    const condProtocol = getCommonConditionProtocols(condId)
    if (!condProtocol) continue

    const bundle = (condProtocol as any).investigationBundles?.[0]
    if (bundle) {
      for (const lab of (bundle.laboratory || []).slice(0, 5)) {
        if (seen.has(lab)) continue
        seen.add(lab)
        items.push({
          id: `pmh_inv_${lab.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
          category: 'monitoring',
          action: `[${cond}] ${lab} — routine monitoring`,
          details: 'From PMH condition protocol',
          status: 'pending',
        })
      }
    }
  }
  return items
}

function getVitalsBasedSupportiveCare(answers: Record<string, Answer>): ManagementItem[] {
  const items: ManagementItem[] = []
  const temp = answers['exam_temp']?.value
  const spo2 = answers['exam_spo2']?.value
  const rr = answers['exam_rr']?.value
  const sbp = answers['exam_bp_systolic']?.value
  const hr = answers['exam_hr']?.value

  if (spo2 !== undefined && Number(spo2) < 92) {
    items.push({
      id: 'sup_o2', category: 'supportive', action: 'Oxygen therapy — target SpO2 ≥94%',
      details: `Current SpO2 ${spo2}%. Nasal cannula 2-4 L/min. Titrate to target.`,
      status: 'pending',
    })
  }
  if (spo2 !== undefined && Number(spo2) < 85) {
    items.push({
      id: 'sup_o2_high', category: 'supportive', action: 'High-flow oxygen or non-rebreather mask',
      details: 'Severe hypoxia. Consider CPAP/BiPAP or intubation if refractory.',
      status: 'pending',
    })
  }
  if (temp !== undefined && Number(temp) > 39) {
    items.push({
      id: 'sup_antipyretic', category: 'supportive', action: 'Antipyretic therapy',
      details: `Temp ${temp}°C. Paracetamol 1 g PO/PR q4-6h PRN.`,
      status: 'pending',
    })
  }
  if (sbp !== undefined && Number(sbp) < 90) {
    items.push({
      id: 'sup_fluids', category: 'supportive', action: 'IV fluid resuscitation',
      details: `SBP ${sbp} mmHg. 30 mL/kg crystalloid bolus. Reassess.`,
      status: 'pending',
    })
  }
  if (sbp !== undefined && Number(sbp) < 65) {
    items.push({
      id: 'sup_vasopressor', category: 'emergency', action: 'Vasopressor support',
      details: 'Fluid-refractory hypotension. Start norepinephrine. Titrate to MAP ≥65 mmHg. ICU referral.',
      status: 'pending',
    })
  }
  if (rr !== undefined && Number(rr) > 30) {
    items.push({
      id: 'sup_abg', category: 'supportive', action: 'Arterial blood gas',
      details: `RR ${rr}/min. Assess for respiratory failure.`,
      status: 'pending',
    })
  }
  if (hr !== undefined && (Number(hr) > 120 || Number(hr) < 50)) {
    items.push({
      id: 'sup_ecg', category: 'supportive', action: 'ECG — assess for arrhythmia',
      details: `HR ${hr}/min. Rule out tachyarrhythmia/bradyarrhythmia.`,
      status: 'pending',
    })
  }
  return items
}

function getReasoningHookItems(chiefComplaints: ChiefComplaint[]): ManagementItem[] {
  const items: ManagementItem[] = []
  const seen = new Set<string>()
  for (const cc of chiefComplaints) {
    const node = getSymptomNodeByName(cc.complaint)
    if (!node) continue
    for (const hook of node.reasoningHooks || []) {
      if (hook.action === 'suggest_investigations') {
        for (const inv of hook.payload) {
          if (seen.has(inv)) continue
          seen.add(inv)
          items.push({
            id: `hook_inv_${inv.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
            category: 'supportive',
            action: `Consider: ${inv}`,
            details: `Suggested by ${node.identity.canonicalName} clinical pathway`,
            status: 'pending',
          })
        }
      }
    }
  }
  return items
}

const INFECTION_SEVERITY_CATEGORIES: Record<string, string[]> = {
  mild: ['Temperature monitoring q6h', 'Oral antibiotics', 'Encourage oral hydration'],
  moderate: ['Temperature monitoring q4h', 'IV antibiotics', 'IV fluids if needed', 'Monitor vitals q4h'],
  severe: ['ICU monitoring', 'IV broad-spectrum antibiotics', 'IV fluid resuscitation', 'Vasopressors if needed', 'Organ support'],
}

function estimateSeverity(answers: Record<string, Answer>): 'mild' | 'moderate' | 'severe' {
  const temp = Number(answers['exam_temp']?.value) || 0
  const rr = Number(answers['exam_rr']?.value) || 0
  const hr = Number(answers['exam_hr']?.value) || 0
  const sbp = Number(answers['exam_bp_systolic']?.value) || 0
  const spo2 = Number(answers['exam_spo2']?.value) || 100
  const conscious = String(answers['exam_consciousness']?.value || '').toLowerCase()

  if (sbp < 65 || spo2 < 85 || conscious === 'unresponsive' || conscious === 'confused') return 'severe'
  if (temp > 39.5 || rr > 30 || hr > 120 || sbp < 90 || spo2 < 92) return 'severe'
  if (temp > 38 || rr > 20 || hr > 100) return 'moderate'
  return 'mild'
}

export function generateManagementPlan(input: ManagementGeneratorInput): GeneratedManagementPlan {
  const reasoningInput: ReasoningInput = {
    biodata: input.biodata,
    chiefComplaints: input.chiefComplaints,
    answers: input.answers,
    activeModules: input.activeModules,
    currentPhase: input.currentPhase,
    completedPhases: input.completedPhases,
  }

  const differentials = computeDifferentials(reasoningInput)
  const mechanismScores = scoreMechanisms(reasoningInput)
  const topDifferential = differentials[0]
  const severity = estimateSeverity(input.answers)

  const seenActions = new Set<string>()
  const all: ManagementItem[] = []

  function addUnique(item: ManagementItem): void {
    const key = item.action.toLowerCase().slice(0, 80)
    if (seenActions.has(key)) return
    seenActions.add(key)
    all.push(item)
  }

  // ── STEP 1: Disease-specific protocols for top differential ──
  if (topDifferential) {
    const protocol = getTopDifferentialProtocols(topDifferential)
    if (protocol.investigations.length > 0) {
      const bundle = protocol.investigations.find((b: any) =>
        !b.severity || b.severity === severity
      ) || protocol.investigations[0]
      if (bundle) {
        for (const lab of bundle.laboratory || []) {
          addUnique({
            id: `dx_inv_lab_${lab.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
            category: 'supportive',
            action: `[${topDifferential.diseaseName}] Lab: ${lab}`,
            details: 'From disease-specific protocol',
            status: 'pending',
          })
        }
        for (const img of bundle.imaging || []) {
          addUnique({
            id: `dx_inv_img_${img.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
            category: 'supportive',
            action: `[${topDifferential.diseaseName}] Imaging: ${img}`,
            details: 'From disease-specific protocol',
            status: 'pending',
          })
        }
        for (const bed of bundle.bedside || []) {
          addUnique({
            id: `dx_inv_bed_${bed.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
            category: 'supportive',
            action: `[${topDifferential.diseaseName}] Bedside: ${bed}`,
            details: 'From disease-specific protocol',
            status: 'pending',
          })
        }
        for (const micro of bundle.microbiology || []) {
          addUnique({
            id: `dx_inv_micro_${micro.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
            category: 'supportive',
            action: `[${topDifferential.diseaseName}] Micro: ${micro}`,
            details: 'From disease-specific protocol',
            status: 'pending',
          })
        }
      }
    }

    for (const med of protocol.medications) {
      addUnique({
        id: `dx_med_${med.id || med.drug?.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
        category: 'supportive',
        action: `[${topDifferential.diseaseName}] ${med.drug} ${med.dose} ${med.route} ${med.frequency} — ${med.duration}`,
        details: med.notes || '',
        status: 'pending',
      })
    }

    const nursingPlan = protocol.nursing.find((n: any) =>
      !n.severity || n.severity === severity
    ) || protocol.nursing[0]
    if (nursingPlan) {
      for (const care of nursingPlan.care || []) {
        addUnique({
          id: `dx_nurse_${care.id || care.parameter?.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
          category: 'supportive',
          action: `Nursing: ${care.parameter} ${care.frequency}`,
          details: care.notes || '',
          status: 'pending',
        })
      }
      for (const mon of nursingPlan.monitoring || []) {
        addUnique({
          id: `dx_monitor_${mon.id || mon.parameter?.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
          category: 'monitoring',
          action: `Monitor: ${mon.parameter} ${mon.frequency}${mon.target ? ` (target: ${mon.target})` : ''}`,
          details: mon.notes || '',
          status: 'pending',
        })
      }
    }

    // Severity-based admission/dispo recommendation
    if (severity === 'severe') {
      addUnique({
        id: 'dx_admit_icu',
        category: 'referral',
        action: 'Admit to ICU — severe criteria met',
        details: 'Severe clinical presentation requires intensive monitoring and organ support.',
        status: 'pending',
      })
    } else if (severity === 'moderate') {
      addUnique({
        id: 'dx_admit_ward',
        category: 'referral',
        action: 'Admit to general ward for inpatient care',
        details: 'Moderate severity requires close monitoring and IV therapy.',
        status: 'pending',
      })
    }
  }

  // ── STEP 2: Mechanism-based generic actions (for top mechanisms) ──
  const topMechanisms = mechanismScores.slice(0, 5)
  if (topMechanisms.length > 0) {
    const mechActions = mergeMechanismActions(
      getMechanismProtocols(topMechanisms.map(m => m.mechanismId))
    )

    for (const inv of mechActions.investigations) {
      addUnique({
        id: `mech_inv_${inv.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
        category: 'supportive',
        action: `Investigate: ${inv}`,
        details: 'Suggested by identified pathophysiology',
        status: 'pending',
      })
    }
    for (const med of mechActions.medications) {
      addUnique({
        id: `mech_med_${med.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
        category: 'supportive',
        action: `Consider: ${med}`,
        details: 'Based on underlying disease mechanism',
        status: 'pending',
      })
    }
    for (const nurse of mechActions.nursing) {
      addUnique({
        id: `mech_nurse_${nurse.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
        category: 'supportive',
        action: `Nursing: ${nurse}`,
        details: '',
        status: 'pending',
      })
    }
    for (const mon of mechActions.monitoring) {
      addUnique({
        id: `mech_mon_${mon.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
        category: 'monitoring',
        action: `Monitor: ${mon}`,
        details: '',
        status: 'pending',
      })
    }
    for (const sc of mechActions.supportiveCare) {
      addUnique({
        id: `mech_sup_${sc.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
        category: 'supportive',
        action: `Supportive: ${sc}`,
        details: '',
        status: 'pending',
      })
    }
  }

  // ── STEP 3: PMH-based monitoring items ──
  for (const item of getPmhProtocolItems(input.answers)) {
    addUnique(item)
  }

  // ── STEP 4: Vitals-based supportive care ──
  for (const item of getVitalsBasedSupportiveCare(input.answers)) {
    addUnique(item)
  }

  // ── STEP 5: Reasoning hooks from symptom nodes ──
  for (const item of getReasoningHookItems(input.chiefComplaints)) {
    addUnique(item)
  }

  // ── STEP 6: Severity-level general monitoring template ──
  const severityActions = INFECTION_SEVERITY_CATEGORIES[severity] || INFECTION_SEVERITY_CATEGORIES.mild
  for (const action of severityActions) {
    addUnique({
      id: `sev_${action.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40)}`,
      category: severity === 'severe' ? 'monitoring' : 'supportive',
      action,
      details: `${severity.toUpperCase()} severity care level`,
      status: 'pending',
    })
  }

  // ── Categorize ──
  const investigations = all.filter(i => i.action.includes('Lab:') || i.action.includes('Imaging:') || i.action.includes('Bedside:') || i.action.includes('Micro:') || i.action.includes('Investigate:'))
  const medications = all.filter(i => i.action.includes('Consider:') || (i.action.includes('[') && i.action.includes(']') && i.action.includes('mg')))
  const nursing = all.filter(i => i.action.startsWith('Nursing:'))
  const monitoring = all.filter(i => i.category === 'monitoring')
  const supportive = all.filter(i => i.category === 'supportive' && !investigations.includes(i) && !medications.includes(i) && !nursing.includes(i))
  const referrals = all.filter(i => i.category === 'referral')

  return { investigations, medications, nursing, monitoring, supportive, referrals, all }
}
