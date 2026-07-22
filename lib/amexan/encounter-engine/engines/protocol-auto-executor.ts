import { getProtocolsByDiseaseId, getCommonConditionProtocols } from '@/lib/clinical/protocols';
import type { InvestigationBundle, MedicationProtocol, NursingProtocol, MonitoringProtocol, InfusionProtocol, IsolationProtocol, SupportiveCareProtocol } from '@/lib/clinical/types/protocols';

export interface AutoExecutionVitals {
  temperature?: number
  spo2?: number
  respiratoryRate?: number
  heartRate?: number
  systolicBP?: number
  diastolicBP?: number
  consciousness?: 'alert' | 'confused' | 'unresponsive'
  urineOutput?: number
}

export interface AutoExecutionInput {
  diagnosisId: string
  diagnosisName: string
  severity: 'mild' | 'moderate' | 'severe'
  patientAge: number
  patientWeight?: number
  pregnant: boolean
  allergies: string[]
  renalImpairment: boolean
  hepaticImpairment: boolean
  comorbidities: string[]
  activeModules: string[]
  chiefComplaints: string[]
  vitals: AutoExecutionVitals
}

export interface AutoExecutedOrder {
  id: string
  type: 'investigation_lab' | 'investigation_imaging' | 'investigation_bedside' | 'investigation_microbiology'
       | 'medication' | 'nursing' | 'monitoring' | 'supportive' | 'isolation' | 'referral' | 'infusion'
  priority: 'stat' | 'urgent' | 'routine'
  action: string
  details: string
  rationale: string
  autoExecuted: boolean
  requiresApproval: boolean
  sourceProtocol: string
  category: string
  conditional?: string
}

export interface AutoExecutionPlan {
  diagnosisId: string
  diagnosisName: string
  severity: string
  orders: AutoExecutedOrder[]
  warnings: string[]
  recommendations: string[]
  suggestedLabs: string[]
  suggestedImaging: string[]
  suggestedMeds: { drug: string; dose: string; route: string; frequency: string; duration: string; notes: string }[]
  nursingPlan: { parameter: string; frequency: string; notes?: string }[]
  monitoringPlan: { parameter: string; frequency: string; target?: string; notes?: string }[]
  infusionPlan: { solution: string; rate: string; indication: string }[]
  isolationType: string | null
}

const DIAGNOSIS_TO_PROTOCOL_ID: Record<string, string> = {
  malaria: 'malaria',
  severe_malaria: 'malaria',
  falciparum_malaria: 'malaria',
  pneumonia: 'community_acquired_pneumonia',
  community_acquired_pneumonia: 'community_acquired_pneumonia',
  aspiration_pneumonia: 'aspiration_pneumonia',
  hospital_acquired_pneumonia: 'hospital_acquired_pneumonia',
  covid_19: 'covid_pneumonia',
  covid_pneumonia: 'covid_pneumonia',
  tuberculosis: 'tuberculosis',
  pulmonary_tuberculosis: 'tuberculosis',
  tb: 'tuberculosis',
  meningitis: 'meningitis',
  bacterial_meningitis: 'meningitis',
  viral_meningitis: 'meningitis',
  cryptococcal_meningitis: 'meningitis',
  meningococcal_meningitis: 'meningitis',
  uti: 'uti',
  urinary_tract_infection: 'uti',
  pyelonephritis: 'uti',
  gastroenteritis: 'gastroenteritis',
  acute_gastroenteritis: 'gastroenteritis',
  diarrheal_disease: 'gastroenteritis',
  typhoid: 'gastroenteritis',
  dysentery: 'gastroenteritis',
  hypertension: 'hypertension',
  htn: 'hypertension',
  diabetes: 'diabetes',
  diabetes_mellitus: 'diabetes',
  asthma: 'asthma',
  hiv: 'hiv',
  hiv_aids: 'hiv',
  sickle_cell: 'sickle_cell',
  sickle_cell_disease: 'sickle_cell',
  heart_disease: 'heart_disease',
  congestive_heart_failure: 'heart_disease',
  copd: 'copd',
  chronic_obstructive_pulmonary_disease: 'copd',
  ckd: 'ckd',
  chronic_kidney_disease: 'ckd',
  sepsis: 'sepsis',
  septic_shock: 'sepsis',
  bacteremia: 'sepsis',
  urosepsis: 'sepsis',
  bronchitis: 'bronchitis',
  acute_bronchitis: 'bronchitis',
  dengue: 'dengue',
  dengue_fever: 'dengue',
  dengue_hemorrhagic_fever: 'dengue',
  migraine: 'migraine',
  migraine_with_aura: 'migraine',
  migraine_without_aura: 'migraine',
  tension_headache: 'migraine',
  headache: 'migraine',
  pertussis: 'pertussis',
  whooping_cough: 'pertussis',
  acute_appendicitis: 'community_acquired_pneumonia',
}

function matchProtocolId(rawInput: string): string | null {
  const cleaned = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^dx_/, '')
  return DIAGNOSIS_TO_PROTOCOL_ID[cleaned] || null
}

function evaluateAutoCondition(condition: string, input: AutoExecutionInput): boolean {
  switch (condition) {
    case 'if_severe': return input.severity === 'severe'
    case 'if_moderate': return input.severity === 'moderate'
    case 'if_hypoxia': return (input.vitals.spo2 ?? 100) < 92
    case 'if_severe_hypoxia': return (input.vitals.spo2 ?? 100) < 85
    case 'if_shock': return (input.vitals.systolicBP ?? 120) < 90
    case 'if_hypotension': return (input.vitals.systolicBP ?? 120) < 90
    case 'if_tachycardia': return (input.vitals.heartRate ?? 80) > 120
    case 'if_bradycardia': return (input.vitals.heartRate ?? 80) < 50
    case 'if_fever': return (input.vitals.temperature ?? 37) > 38
    case 'if_high_fever': return (input.vitals.temperature ?? 37) > 39
    case 'if_tachypnea': return (input.vitals.respiratoryRate ?? 16) > 30
    case 'if_confused': return input.vitals.consciousness === 'confused' || input.vitals.consciousness === 'unresponsive'
    case 'if_pregnant': return input.pregnant
    case 'if_renal_impairment': return input.renalImpairment
    case 'if_hepatic_impairment': return input.hepaticImpairment
    case 'if_immunocompromised': return input.comorbidities.some(c =>
      ['hiv', 'cancer', 'diabetes', 'immunosuppression', 'transplant', 'chemotherapy'].includes(c.toLowerCase())
    )
    case 'if_ventilated': return false
    case 'if_arrhythmia': return false
    case 'if_renal_failure': return input.renalImpairment
    case 'if_pleural_effusion': return false
    case 'if_tb_possible': return input.comorbidities.some(c => c.toLowerCase().includes('tb'))
    case 'if_hyponatremia': return false
    default: return false
  }
}

function determinePriority(severity: string, isConditional: boolean): 'stat' | 'urgent' | 'routine' {
  if (severity === 'severe') return 'stat'
  if (severity === 'moderate' && isConditional) return 'urgent'
  return 'routine'
}

function resolveProtocol(input: AutoExecutionInput): {
  investigations: InvestigationBundle[]
  medications: MedicationProtocol[]
  nursing: NursingProtocol[]
  monitoring: MonitoringProtocol[]
  infusions: InfusionProtocol[]
  isolation: IsolationProtocol[]
  supportiveCare: SupportiveCareProtocol[]
} {
  const protocolId = matchProtocolId(input.diagnosisId) || matchProtocolId(input.diagnosisName)
  if (!protocolId) return { investigations: [], medications: [], nursing: [], monitoring: [], infusions: [], isolation: [], supportiveCare: [] }

  const protocol = getProtocolsByDiseaseId(protocolId)
  if (protocol) {
    const p = protocol as any
    return {
      investigations: p.investigationBundles || [],
      medications: p.medications || [],
      nursing: p.nursing || [],
      monitoring: p.monitoring || [],
      infusions: p.infusions || [],
      isolation: p.isolation || [],
      supportiveCare: p.supportiveCare || [],
    }
  }

  const conditionProtocol = getCommonConditionProtocols(protocolId)
  if (conditionProtocol) {
    const cp = conditionProtocol as any
    return {
      investigations: cp.investigationBundles || [],
      medications: cp.medications || [],
      nursing: cp.nursing || [],
      monitoring: [],
      infusions: [],
      isolation: [],
      supportiveCare: [],
    }
  }

  return { investigations: [], medications: [], nursing: [], monitoring: [], infusions: [], isolation: [], supportiveCare: [] }
}

function shouldExcludeMedication(med: MedicationProtocol, input: AutoExecutionInput): string | null {
  for (const ci of med.contraindications) {
    if (input.allergies.some(a => ci.toLowerCase().includes(a.toLowerCase()))) {
      return `Contraindicated: ${ci} (patient allergy: ${input.allergies.filter(a => ci.toLowerCase().includes(a.toLowerCase())).join(', ')})`
    }
    if (ci.toLowerCase().includes('pregnancy') && input.pregnant) {
      return 'Contraindicated in pregnancy'
    }
    if (ci.toLowerCase().includes('renal') && input.renalImpairment) {
      return 'Contraindicated in renal impairment'
    }
    if (ci.toLowerCase().includes('hepatic') && input.hepaticImpairment) {
      return 'Contraindicated in hepatic impairment'
    }
  }
  return null
}

export function autoExecuteProtocol(input: AutoExecutionInput): AutoExecutionPlan {
  const protocol = resolveProtocol(input)
  const orders: AutoExecutedOrder[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  const suggestedLabs: string[] = []
  const suggestedImaging: string[] = []
  const suggestedMeds: { drug: string; dose: string; route: string; frequency: string; duration: string; notes: string }[] = []
  const nursingPlan: { parameter: string; frequency: string; notes?: string }[] = []
  const monitoringPlan: { parameter: string; frequency: string; target?: string; notes?: string }[] = []
  const infusionPlan: { solution: string; rate: string; indication: string }[] = []
  let isolationType: string | null = null
  let orderId = 0

  function nextId(prefix: string): string {
    orderId++
    return `auto_${prefix}_${orderId}`
  }

  // ── 1. Auto-execute Investigation Bundles ──
  const bestBundle = protocol.investigations.find((b: InvestigationBundle) =>
    b.severity === input.severity
  ) || protocol.investigations[0]

  if (bestBundle) {
    const labs = bestBundle.laboratory || []
    const imaging = bestBundle.imaging || []
    const bedside = bestBundle.bedside || []
    const micro = bestBundle.microbiology || []

    for (const lab of labs) {
      suggestedLabs.push(lab)
      orders.push({
        id: nextId('lab'), type: 'investigation_lab', priority: determinePriority(input.severity, false),
        action: lab, details: `Auto-ordered for ${input.diagnosisName}`,
        rationale: `Part of ${bestBundle.label} workup`, autoExecuted: input.severity === 'severe',
        requiresApproval: input.severity !== 'severe', sourceProtocol: bestBundle.id, category: 'lab',
      })
    }
    for (const img of imaging) {
      suggestedImaging.push(img)
      orders.push({
        id: nextId('img'), type: 'investigation_imaging', priority: determinePriority(input.severity, false),
        action: img, details: `Auto-ordered for ${input.diagnosisName}`,
        rationale: `Part of ${bestBundle.label} workup`, autoExecuted: false,
        requiresApproval: true, sourceProtocol: bestBundle.id, category: 'imaging',
      })
    }
    for (const bed of bedside) {
      suggestedLabs.push(bed)
      orders.push({
        id: nextId('bed'), type: 'investigation_bedside', priority: 'routine',
        action: bed, details: `Bedside for ${input.diagnosisName}`,
        rationale: `Part of ${bestBundle.label} workup`, autoExecuted: true,
        requiresApproval: false, sourceProtocol: bestBundle.id, category: 'bedside',
      })
    }
    for (const mc of micro) {
      suggestedLabs.push(mc)
      orders.push({
        id: nextId('micro'), type: 'investigation_microbiology', priority: 'routine',
        action: mc, details: `Microbiology for ${input.diagnosisName}`,
        rationale: `Part of ${bestBundle.label} workup`, autoExecuted: false,
        requiresApproval: true, sourceProtocol: bestBundle.id, category: 'microbiology',
      })
    }

    // Evaluate conditional tests
    for (const [condition, tests] of Object.entries(bestBundle.conditional ?? {})) {
      if (evaluateAutoCondition(condition, input)) {
        for (const test of tests as string[]) {
          suggestedLabs.push(test)
          orders.push({
            id: nextId('cond'), type: 'investigation_lab', priority: determinePriority(input.severity, true),
            action: test, details: `Conditional: ${condition} triggered`,
            rationale: `Condition ${condition} met`, autoExecuted: input.severity === 'severe',
            requiresApproval: input.severity !== 'severe', sourceProtocol: bestBundle.id, category: 'lab',
            conditional: condition,
          })
        }
      }
    }
  }

  // ── 2. Auto-execute Medications ──
  for (const med of protocol.medications) {
    const exclusion = shouldExcludeMedication(med, input)
    if (exclusion) {
      warnings.push(exclusion)
      if (med.alternativeIfAllergy.length > 0) {
        recommendations.push(`Alternative for ${med.drug}: ${med.alternativeIfAllergy.join(', ')}`)
      }
      continue
    }

    const isFirstLine = med.severity !== 'severe' || input.severity === 'severe'
    const isPreferredForSeverity =
      (med.severity === 'mild' && input.severity === 'mild') ||
      (med.severity === 'moderate' && input.severity !== 'severe') ||
      (med.severity === 'severe' && input.severity === 'severe')

    suggestedMeds.push({
      drug: med.drug, dose: med.dose, route: med.route,
      frequency: med.frequency, duration: med.duration, notes: med.notes,
    })

    orders.push({
      id: nextId('med'), type: 'medication', priority: input.severity === 'severe' && med.severity === 'severe' ? 'stat' : 'urgent',
      action: `${med.drug} ${med.dose} ${med.route} ${med.frequency} x ${med.duration}`,
      details: med.notes || '',
      rationale: `Recommended for ${input.diagnosisName}${isFirstLine ? ' (first-line)' : ''}`,
      autoExecuted: isPreferredForSeverity,
      requiresApproval: !isPreferredForSeverity,
      sourceProtocol: med.id,
      category: 'medication',
    })
  }

  // ── 3. Auto-execute Nursing Plan ──
  const bestNursing = protocol.nursing.find((n: NursingProtocol) =>
    n.severity === input.severity
  ) || protocol.nursing[0]

  if (bestNursing) {
    if (bestNursing.care) {
      for (const c of bestNursing.care) {
        nursingPlan.push({ parameter: c.parameter, frequency: c.frequency, notes: c.notes })
        orders.push({
          id: nextId('nurse'), type: 'nursing', priority: 'routine',
          action: `Nursing: ${c.parameter} ${c.frequency}`,
          details: c.notes || '',
          rationale: `Nursing care for ${input.diagnosisName}`,
          autoExecuted: true, requiresApproval: false,
          sourceProtocol: bestNursing.id, category: 'nursing_care',
        })
      }
    }
    if (bestNursing.monitoring) {
      for (const m of bestNursing.monitoring) {
        orders.push({
          id: nextId('nurse_mon'), type: 'nursing', priority: 'routine',
          action: `Nursing monitor: ${m.parameter} ${m.frequency}${m.target ? ` (target: ${m.target})` : ''}`,
          details: m.notes || '',
          rationale: `Nursing monitoring for ${input.diagnosisName}`,
          autoExecuted: true, requiresApproval: false,
          sourceProtocol: bestNursing.id, category: 'nursing_monitoring',
        })
      }
    }
    if (bestNursing.escalation) {
      for (const esc of bestNursing.escalation) {
        orders.push({
          id: nextId('esc'), type: 'monitoring', priority: 'urgent',
          action: `Escalate if: ${esc.condition} (threshold: ${esc.threshold}) — ${esc.action}`,
          details: `Notify: ${esc.notify.join(', ')}`,
          rationale: `Escalation protocol for ${input.diagnosisName}`,
          autoExecuted: true, requiresApproval: false,
          sourceProtocol: bestNursing.id, category: 'escalation',
        })
      }
    }
  }

  // ── 4. Auto-execute Monitoring Plan ──
  const bestMonitoring = protocol.monitoring.find((m: MonitoringProtocol) =>
    m.severity === input.severity
  ) || protocol.monitoring[0]

  if (bestMonitoring) {
    const monItems: { parameter: string; frequency: string; target?: string; notes?: string }[] = [
      { parameter: 'Vitals', frequency: bestMonitoring.vitalsFrequency },
    ]
    if (bestMonitoring.urineOutput) monItems.push({ parameter: 'Urine output', frequency: bestMonitoring.urineOutputFrequency || 'Q8H', target: '≥0.5 mL/kg/h' })
    if (bestMonitoring.fluidBalance) monItems.push({ parameter: 'Fluid balance', frequency: bestMonitoring.vitalsFrequency })
    if (bestMonitoring.dailyWeight) monItems.push({ parameter: 'Daily weight', frequency: 'Daily' })
    if (bestMonitoring.painScore) monItems.push({ parameter: 'Pain score (0-10)', frequency: bestMonitoring.vitalsFrequency })
    if (bestMonitoring.consciousness) monItems.push({ parameter: 'Consciousness (GCS/AVPU)', frequency: bestMonitoring.vitalsFrequency })
    if (bestMonitoring.oxygenMonitoring) monItems.push({ parameter: 'SpO2', frequency: 'Continuous', target: '≥94%' })
    for (const s of bestMonitoring.special || []) {
      monItems.push({ parameter: s, frequency: 'Per order' })
    }

    for (const mi of monItems) {
      monitoringPlan.push(mi)
      orders.push({
        id: nextId('mon'), type: 'monitoring', priority: input.severity === 'severe' ? 'urgent' : 'routine',
        action: `Monitor: ${mi.parameter} ${mi.frequency}${mi.target ? ` (target: ${mi.target})` : ''}`,
        details: mi.notes || '',
        rationale: `Monitoring for ${input.diagnosisName} (severity: ${input.severity})`,
        autoExecuted: true, requiresApproval: false,
        sourceProtocol: bestMonitoring.id, category: 'monitoring',
      })
    }
  }

  // ── 5. Auto-execute Supportive Care ──
  for (const sc of protocol.supportiveCare) {
    const conditionMet = !sc.condition || sc.condition === input.diagnosisId || evaluateAutoCondition(sc.condition, input)
    if (!conditionMet) continue

    orders.push({
      id: nextId('sup'), type: 'supportive', priority: 'routine',
      action: `${sc.action}${sc.route ? ` (${sc.route})` : ''}`,
      details: sc.details || '',
      rationale: `Supportive care for ${sc.condition}`,
      autoExecuted: true, requiresApproval: false,
      sourceProtocol: sc.id || sc.condition, category: 'supportive',
    })
  }

  // ── 6. Auto-execute Infusions ──
  for (const inf of protocol.infusions) {
    const matchIndication = inf.indication
    const shouldInfuse =
      (matchIndication === 'Maintenance fluids') ||
      (matchIndication.includes('Hypotension') && (input.vitals.systolicBP ?? 120) < 90) ||
      (matchIndication.includes('antibiotic') || matchIndication.includes('Antibiotic'))

    if (shouldInfuse) {
      infusionPlan.push({ solution: inf.solution, rate: inf.rate, indication: inf.indication })
      orders.push({
        id: nextId('inf'), type: 'infusion', priority: input.severity === 'severe' ? 'stat' : 'routine',
        action: `Infuse: ${inf.solution} at ${inf.rate}${inf.additives?.length ? ` + ${inf.additives.join(', ')}` : ''}`,
        details: `Indication: ${inf.indication}. Monitoring: ${inf.monitoring.join(', ')}`,
        rationale: `IV therapy for ${input.diagnosisName}`,
        autoExecuted: input.severity === 'severe', requiresApproval: input.severity !== 'severe',
        sourceProtocol: inf.id, category: 'infusion',
      })
    }
  }

  // ── 7. Auto-execute Isolation ──
  const bestIsolation = protocol.isolation.find((i: IsolationProtocol) =>
    i.diseaseId === matchProtocolId(input.diagnosisId)
  )
  if (bestIsolation) {
    isolationType = `${bestIsolation.type} isolation — ${bestIsolation.ppe.join(', ')}. Room: ${bestIsolation.roomType}`
    orders.push({
      id: nextId('iso'), type: 'isolation', priority: 'urgent',
      action: `${bestIsolation.type.toUpperCase()} ISOLATION`,
      details: `PPE: ${bestIsolation.ppe.join(', ')}. Room: ${bestIsolation.roomType}. Transport: ${bestIsolation.patientTransport}. Duration: ${bestIsolation.duration}`,
      rationale: `Infection control for ${input.diagnosisName}`,
      autoExecuted: true, requiresApproval: false,
      sourceProtocol: bestIsolation.id, category: 'isolation',
    })
  }

  // ── 8. Severity-based admission/dispo recommendations ──
  if (input.severity === 'severe') {
    recommendations.push('ICU admission strongly recommended — severe criteria met')
    orders.push({
      id: nextId('admit'), type: 'referral', priority: 'stat',
      action: 'Admit to ICU',
      details: 'Severe clinical presentation requires intensive monitoring and organ support.',
      rationale: `Severe ${input.diagnosisName} with high-risk features`,
      autoExecuted: false, requiresApproval: true,
      sourceProtocol: 'severity_protocol', category: 'referral',
    })
  } else if (input.severity === 'moderate') {
    orders.push({
      id: nextId('admit'), type: 'referral', priority: 'urgent',
      action: 'Admit to general ward',
      details: 'Moderate severity requires close monitoring and IV therapy.',
      rationale: `${input.diagnosisName} requiring inpatient management`,
      autoExecuted: false, requiresApproval: true,
      sourceProtocol: 'severity_protocol', category: 'referral',
    })
  }

  // ── 9. Pregnancy / Allergy / Comorbidity Warnings ──
  if (input.pregnant) {
    warnings.push('PREGNANCY: Avoid tetracyclines, fluoroquinolones, and ACE inhibitors. Consult obstetrics.')
  }
  if (input.allergies.length > 0) {
    warnings.push(`ALLERGIES: ${input.allergies.join(', ')} — medications screened for contraindications.`)
  }
  if (input.renalImpairment) {
    recommendations.push('RENAL IMPAIRMENT: Adjust renally-cleared medications. Monitor creatinine and electrolytes.')
  }
  if (input.hepaticImpairment) {
    recommendations.push('HEPATIC IMPAIRMENT: Avoid hepatotoxic medications. Monitor LFTs.')
  }
  if (input.comorbidities.some(c => c.toLowerCase().includes('hiv'))) {
    recommendations.push('HIV: Check CD4 and viral load. Assess for OIs. Coordinate with HIV clinic.')
  }

  return {
    diagnosisId: input.diagnosisId,
    diagnosisName: input.diagnosisName,
    severity: input.severity,
    orders,
    warnings,
    recommendations,
    suggestedLabs: [...new Set(suggestedLabs)],
    suggestedImaging: [...new Set(suggestedImaging)],
    suggestedMeds,
    nursingPlan,
    monitoringPlan,
    infusionPlan,
    isolationType,
  }
}

export function estimateSeverityFromVitals(vitals: AutoExecutionVitals): 'mild' | 'moderate' | 'severe' {
  const sbp = vitals.systolicBP ?? 120
  const spo2 = vitals.spo2 ?? 100
  const rr = vitals.respiratoryRate ?? 16
  const hr = vitals.heartRate ?? 80
  const temp = vitals.temperature ?? 37
  const conscious = vitals.consciousness

  if (sbp < 65 || spo2 < 85 || conscious === 'unresponsive') return 'severe'
  if (sbp < 90 || spo2 < 92 || rr > 30 || hr > 130 || temp > 39.5 || conscious === 'confused') return 'severe'
  if (rr > 22 || hr > 100 || temp > 38) return 'moderate'
  return 'mild'
}
