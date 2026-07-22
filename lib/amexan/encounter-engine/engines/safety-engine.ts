// ═══════════════════════════════════════════════════════════════════════════════
// Safety Engine
// Runs a structured safety checklist against an encounter to identify
// potential risks or oversights.
// ═══════════════════════════════════════════════════════════════════════════════

export interface SafetyCheck {
  id: string
  check: string
  passed: boolean
  details?: string
}

export interface EncounterForSafety {
  chiefComplaints: string[]
  age: number
  sex: string
  pregnant: boolean
  knownAllergies: string[]
  currentMedications: string[]
  vitals: Record<string, number>
}

const AGE_BASED_DOSING_RULES: Array<{ ageMin: number; ageMax: number; note: string }> = [
  { ageMin: 0, ageMax: 0.08, note: 'Neonatal dosing required — consult neonatal formulary' },
  { ageMin: 0.08, ageMax: 1, note: 'Infant dosing required — weight-based dosing recommended' },
  { ageMin: 1, ageMax: 12, note: 'Pediatric dosing required — use weight-based calculations' },
  { ageMin: 65, ageMax: 200, note: 'Geriatric dosing adjustments may be needed — check renal function' },
]

export function runSafetyChecklist(encounter: EncounterForSafety): SafetyCheck[] {
  const checks: SafetyCheck[] = []
  const vitals = encounter.vitals

  // ── Airway Check ──────────────────────────────────────────────────────
  const hasAirwayComplaint = encounter.chiefComplaints.some(c =>
    /breath|choking|stridor|wheezing|dysphagia|airway/i.test(c),
  )
  checks.push({
    id: 'safety_airway',
    check: 'Airway patency assessment',
    passed: !hasAirwayComplaint,
    details: hasAirwayComplaint
      ? `Chief complaint suggests possible airway compromise: ${encounter.chiefComplaints.join(', ')}`
      : 'No airway concerns identified',
  })

  // ── Breathing Check ───────────────────────────────────────────────────
  const rr = vitals['respiratory_rate']
  const o2 = vitals['oxygen_saturation']
  let breathingPassed = true
  const breathingIssues: string[] = []

  if (rr !== undefined && (rr < 12 || rr > 20)) {
    breathingPassed = false
    breathingIssues.push(`abnormal respiratory rate: ${rr}/min`)
  }
  if (o2 !== undefined && o2 < 95) {
    breathingPassed = false
    breathingIssues.push(`low oxygen saturation: ${o2}%`)
  }

  checks.push({
    id: 'safety_breathing',
    check: 'Breathing adequacy assessment',
    passed: breathingPassed,
    details: breathingPassed ? 'Breathing adequate' : `Breathing concern: ${breathingIssues.join(', ')}`,
  })

  // ── Circulation Check ─────────────────────────────────────────────────
  const hr = vitals['heart_rate'] || vitals['pulse']
  const sbp = vitals['systolic_bp'] || vitals['blood_pressure_systolic']
  let circulationPassed = true
  const circulationIssues: string[] = []

  if (hr !== undefined && (hr < 60 || hr > 100)) {
    circulationPassed = false
    circulationIssues.push(`abnormal heart rate: ${hr} bpm`)
  }
  if (sbp !== undefined && (sbp < 90 || sbp > 180)) {
    circulationPassed = false
    circulationIssues.push(`abnormal systolic BP: ${sbp} mmHg`)
  }

  checks.push({
    id: 'safety_circulation',
    check: 'Circulation assessment',
    passed: circulationPassed,
    details: circulationPassed ? 'Circulation stable' : `Circulation concern: ${circulationIssues.join(', ')}`,
  })

  // ── Allergy Check ─────────────────────────────────────────────────────
  const hasAllergy = encounter.knownAllergies.length > 0
  checks.push({
    id: 'safety_allergy',
    check: 'Allergy documentation review',
    passed: true,
    details: hasAllergy
      ? `Documented allergies: ${encounter.knownAllergies.join(', ')}`
      : 'No known allergies documented',
  })

  // ── Medication Interaction Check ──────────────────────────────────────
  const onMultipleMeds = encounter.currentMedications.length >= 2
  checks.push({
    id: 'safety_medication_interaction',
    check: 'Medication interaction screening',
    passed: !onMultipleMeds,
    details: onMultipleMeds
      ? `Patient on ${encounter.currentMedications.length} medications — screen for interactions`
      : 'No medication interaction concerns',
  })

  // ── Pregnancy Check ───────────────────────────────────────────────────
  const pregnancyCheckPassed = !encounter.pregnant || encounter.sex === 'female'
  checks.push({
    id: 'safety_pregnancy',
    check: 'Pregnancy safety check',
    passed: pregnancyCheckPassed,
    details: encounter.pregnant
      ? 'Pregnant patient — ensure all interventions are pregnancy-safe'
      : 'Not applicable',
  })

  // ── Age-Appropriate Dosing Check ──────────────────────────────────────
  const matchedRule = AGE_BASED_DOSING_RULES.find(
    r => encounter.age >= r.ageMin && encounter.age <= r.ageMax,
  )
  checks.push({
    id: 'safety_age_dosing',
    check: 'Age-appropriate dosing verification',
    passed: !matchedRule,
    details: matchedRule?.note ?? 'Standard adult dosing applicable',
  })

  return checks
}

export function allChecksPassed(checks: SafetyCheck[]): boolean {
  return checks.every(c => c.passed)
}

export function getFailedChecks(checks: SafetyCheck[]): SafetyCheck[] {
  return checks.filter(c => !c.passed)
}
