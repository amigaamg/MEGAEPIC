// ═══════════════════════════════════════════════════════════════════════════════
// Alert Engine
// Generates, prioritizes, and escalates clinical alerts based on patient
// facts and context.
// ═══════════════════════════════════════════════════════════════════════════════

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ClinicalAlert {
  id: string
  type: 'drug_interaction' | 'allergy' | 'red_flag' | 'abnormal_vital' | 'follow_up_due' | 'guideline_reminder'
  message: string
  priority: AlertPriority
  source: string
  timestamp: number
}

export interface AlertContext {
  knownAllergies: string[]
  currentMedications: string[]
  age: number
  pregnant: boolean
}

const PRIORITY_ORDER: AlertPriority[] = ['critical', 'high', 'medium', 'low']

const ABNORMAL_VITAL_THRESHOLDS: Record<string, { min: number; max: number; message: (v: number) => string }> = {
  temperature: {
    min: 36.0,
    max: 38.0,
    message: (v) => v > 38.0 ? `Fever detected: temperature ${v}°C` : `Hypothermia detected: temperature ${v}°C`,
  },
  heart_rate: {
    min: 60,
    max: 100,
    message: (v) => v > 100 ? `Tachycardia: heart rate ${v} bpm` : `Bradycardia: heart rate ${v} bpm`,
  },
  respiratory_rate: {
    min: 12,
    max: 20,
    message: (v) => v > 20 ? `Tachypnea: respiratory rate ${v}/min` : `Bradypnea: respiratory rate ${v}/min`,
  },
  systolic_bp: {
    min: 90,
    max: 140,
    message: (v) => v > 140 ? `Hypertension: systolic BP ${v} mmHg` : `Hypotension: systolic BP ${v} mmHg`,
  },
  oxygen_saturation: {
    min: 95,
    max: 100,
    message: (v) => v < 95 ? `Hypoxia: SpO2 ${v}%` : '',
  },
}

const KNOWN_DRUG_INTERACTIONS: Array<{ drugA: string; drugB: string; reaction: string; priority: AlertPriority }> = [
  { drugA: 'warfarin', drugB: 'aspirin', reaction: 'Increased bleeding risk with concurrent warfarin and aspirin', priority: 'high' },
  { drugA: 'warfarin', drugB: 'ibuprofen', reaction: 'Increased bleeding risk with concurrent warfarin and NSAIDs', priority: 'high' },
  { drugA: 'lisinopril', drugB: 'spironolactone', reaction: 'Risk of hyperkalemia with ACE inhibitor and potassium-sparing diuretic', priority: 'medium' },
  { drugA: 'metformin', drugB: 'contrast dye', reaction: 'Risk of metformin-associated lactic acidosis with contrast — hold metformin', priority: 'high' },
  { drugA: 'clopidogrel', drugB: 'omeprazole', reaction: 'Reduced clopidogrel efficacy when used with omeprazole', priority: 'medium' },
  { drugA: 'ssri', drugB: 'triptan', reaction: 'Serotonin syndrome risk with SSRI and triptan combination', priority: 'high' },
  { drugA: 'theophylline', drugB: 'ciprofloxacin', reaction: 'Increased theophylline toxicity with ciprofloxacin', priority: 'high' },
]

const AGE_SPECIFIC_GUIDELINES: Array<{ ageMin: number; ageMax: number; message: string; priority: AlertPriority }> = [
  { ageMin: 65, ageMax: 200, message: 'Consider fall risk assessment for elderly patient', priority: 'medium' },
  { ageMin: 0, ageMax: 1, message: 'Ensure immunizations are up to date for infant', priority: 'medium' },
  { ageMin: 0, ageMax: 0.08, message: 'Neonatal sepsis precautions — monitor closely', priority: 'high' },
  { ageMin: 12, ageMax: 55, message: 'Age-appropriate cancer screening may be due', priority: 'low' },
]

export function generateAlerts(
  facts: { key: string; value: any }[],
  context: AlertContext,
): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = []
  const now = Date.now()

  // ── Allergy Alerts ────────────────────────────────────────────────────
  for (const allergy of context.knownAllergies) {
    for (const med of context.currentMedications) {
      const medLower = med.toLowerCase()
      const allergyLower = allergy.toLowerCase()
      if (medLower.includes(allergyLower) || allergyLower.includes(medLower)) {
        alerts.push({
          id: `alert_allergy_${allergy.replace(/\s+/g, '_')}_${med.replace(/\s+/g, '_')}`,
          type: 'allergy',
          message: `Patient has documented allergy to ${allergy} — current medication ${med} may be contraindicated`,
          priority: 'critical',
          source: 'medication_list',
          timestamp: now,
        })
      }
    }
  }

  // ── Drug Interaction Alerts ───────────────────────────────────────────
  for (const interaction of KNOWN_DRUG_INTERACTIONS) {
    const hasA = context.currentMedications.some(m => m.toLowerCase().includes(interaction.drugA))
    const hasB = context.currentMedications.some(m => m.toLowerCase().includes(interaction.drugB))
    if (hasA && hasB) {
      alerts.push({
        id: `alert_interaction_${interaction.drugA}_${interaction.drugB}`,
        type: 'drug_interaction',
        message: interaction.reaction,
        priority: interaction.priority,
        source: 'drug_database',
        timestamp: now,
      })
    }
  }

  // ── Abnormal Vital Alerts ─────────────────────────────────────────────
  for (const fact of facts) {
    const key = fact.key.replace(/_/g, '').toLowerCase()
    const threshold = ABNORMAL_VITAL_THRESHOLDS[key]

    if (threshold && typeof fact.value === 'number') {
      if (fact.value < threshold.min || fact.value > threshold.max) {
        const msg = threshold.message(fact.value)
        if (msg) {
          const isCritical = fact.value < threshold.min * 0.8 || fact.value > threshold.max * 1.2
          alerts.push({
            id: `alert_vital_${fact.key}`,
            type: 'abnormal_vital',
            message: msg,
            priority: isCritical ? 'high' : 'medium',
            source: 'vitals',
            timestamp: now,
          })
        }
      }
    }
  }

  // ── Red Flag Alerts ───────────────────────────────────────────────────
  for (const fact of facts) {
    const lowerKey = fact.key.toLowerCase()
    if ((lowerKey.includes('red_flag') || lowerKey.includes('alert')) && fact.value === true) {
      alerts.push({
        id: `alert_redflag_${fact.key}`,
        type: 'red_flag',
        message: `Red flag detected: ${fact.key.replace(/_/g, ' ')}`,
        priority: 'critical',
        source: fact.key,
        timestamp: now,
      })
    }
  }

  // ── Age-specific and Pregnancy Guideline Reminders ────────────────────
  for (const guideline of AGE_SPECIFIC_GUIDELINES) {
    if (context.age >= guideline.ageMin && context.age <= guideline.ageMax) {
      alerts.push({
        id: `alert_guideline_age_${guideline.ageMin}_${guideline.ageMax}`,
        type: 'guideline_reminder',
        message: guideline.message,
        priority: guideline.priority,
        source: 'age_guidelines',
        timestamp: now,
      })
    }
  }

  if (context.pregnant) {
    alerts.push({
      id: 'alert_pregnancy_check',
      type: 'guideline_reminder',
      message: 'Verify all medications and procedures are safe in pregnancy',
      priority: 'high',
      source: 'pregnancy_protocol',
      timestamp: now,
    })
  }

  return alerts
}

export function prioritizeAlerts(alerts: ClinicalAlert[]): ClinicalAlert[] {
  return [...alerts].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  )
}

export function shouldEscalate(alerts: ClinicalAlert[]): boolean {
  return alerts.some(a => a.priority === 'critical')
}
