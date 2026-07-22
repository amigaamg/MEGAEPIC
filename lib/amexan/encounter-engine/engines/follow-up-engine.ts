// ═══════════════════════════════════════════════════════════════════════════════
// Follow-Up Engine
// Generates follow-up plans and referral criteria based on diagnosis,
// severity, and patient context.
// ═══════════════════════════════════════════════════════════════════════════════

export interface FollowUpContext {
  age: number
  admissionStatus: string
}

export interface FollowUpPlan {
  timeframe: string
  instructions: string[]
  specialty?: string
  urgency: string
}

export interface ReferralContext {
  severity: string
  complications: string[]
}

export interface ReferralCriteria {
  needsReferral: boolean
  specialty?: string
  urgency: string
  reason: string
}

const SEVERITY_TIMEFRAMES: Record<string, string> = {
  critical: 'Immediately — within 24 hours',
  severe: 'Within 48–72 hours',
  moderate: 'Within 1 week',
  mild: 'Within 2–4 weeks',
  resolved: 'As needed — routine follow-up within 3 months',
}

const SEVERITY_URGENCY: Record<string, string> = {
  critical: 'emergent',
  severe: 'urgent',
  moderate: 'semi-urgent',
  mild: 'routine',
  resolved: 'routine',
}

const FOLLOW_UP_DEFAULTS: Record<string, { timeframe: string; instructions: string[]; specialty?: string }> = {
  hypertension: {
    timeframe: 'Within 2 weeks',
    instructions: [
      'Check blood pressure daily and log readings',
      'Continue prescribed antihypertensives',
      'Repeat basic metabolic panel before visit',
    ],
    specialty: 'Cardiology or Internal Medicine',
  },
  diabetes: {
    timeframe: 'Within 1 week',
    instructions: [
      'Monitor blood glucose 2–4 times daily',
      'Continue insulin or oral hypoglycemics as prescribed',
      'Bring glucose log to follow-up',
    ],
    specialty: 'Endocrinology',
  },
  asthma: {
    timeframe: 'Within 1 week',
    instructions: [
      'Use peak flow meter daily and record readings',
      'Continue inhaler regimen as prescribed',
      'Avoid known triggers',
    ],
    specialty: 'Pulmonology',
  },
  pneumonia: {
    timeframe: 'Within 1 week',
    instructions: [
      'Complete full course of antibiotics',
      'Return if fever persists beyond 72 hours',
      'Repeat chest X-ray at follow-up',
    ],
  },
  appendicitis: {
    timeframe: 'Within 2 weeks',
    instructions: [
      'Keep surgical wound clean and dry',
      'Avoid heavy lifting for 4–6 weeks',
      'Return for suture removal per surgeon instruction',
    ],
    specialty: 'General Surgery',
  },
  fracture: {
    timeframe: 'Within 1 week',
    instructions: [
      'Keep cast or splint dry and intact',
      'Elevate the injured limb to reduce swelling',
      'Watch for signs of compartment syndrome (severe pain, numbness, pallor)',
    ],
    specialty: 'Orthopedics',
  },
  uti: {
    timeframe: 'Within 1 week if symptoms persist',
    instructions: [
      'Complete the full course of antibiotics',
      'Increase fluid intake',
      'Return for urine culture if symptoms do not resolve',
    ],
  },
  stroke: {
    timeframe: 'Within 1 week',
    instructions: [
      'Continue antiplatelet or anticoagulant therapy as prescribed',
      'Begin physical therapy and speech therapy if indicated',
      'Monitor blood pressure twice daily',
    ],
    specialty: 'Neurology',
  },
}

export function generateFollowUpPlan(
  diagnosis: string,
  severity: string,
  context: FollowUpContext,
): FollowUpPlan {
  const lowerDx = diagnosis.toLowerCase().trim()
  const matched = Object.keys(FOLLOW_UP_DEFAULTS).find(k => lowerDx.includes(k))
  const base = matched ? FOLLOW_UP_DEFAULTS[matched] : null

  const timeframe = base?.timeframe ?? SEVERITY_TIMEFRAMES[severity] ?? 'Within 2 weeks'
  const instructions = base ? [...base.instructions] : ['Return for clinical review as advised by your doctor.']
  const urgency = SEVERITY_URGENCY[severity] ?? 'routine'
  const specialty = base?.specialty

  if (context.admissionStatus === 'admitted') {
    instructions.unshift('Follow-up will be arranged prior to discharge.')
  }
  if (context.age >= 65) {
    instructions.push('Arrange transport assistance if needed for follow-up visit.')
  }
  if (context.age < 18) {
    instructions.push('A parent or guardian must accompany the patient to follow-up.')
  }
  if (severity === 'critical' || severity === 'severe') {
    instructions.push('If symptoms worsen before your follow-up appointment, return to the emergency department immediately.')
  }

  return { timeframe, instructions, specialty, urgency }
}

const REFERRAL_RULES: Array<{
  condition: string
  severityThreshold: string
  complicationTriggers: string[]
  specialty: string
  urgency: string
  reason: string
}> = [
  {
    condition: 'hypertension',
    severityThreshold: 'severe',
    complicationTriggers: ['hypertensive emergency', 'stroke', 'renal failure', 'heart failure'],
    specialty: 'Cardiology',
    urgency: 'urgent',
    reason: 'Severe hypertension or end-organ damage requires specialist management.',
  },
  {
    condition: 'diabetes',
    severityThreshold: 'severe',
    complicationTriggers: ['ketoacidosis', 'foot ulcer', 'retinopathy', 'nephropathy'],
    specialty: 'Endocrinology',
    urgency: 'urgent',
    reason: 'Complicated diabetes requires specialist endocrine review.',
  },
  {
    condition: 'fracture',
    severityThreshold: 'moderate',
    complicationTriggers: ['open fracture', 'displacement', 'nerve injury', 'vascular compromise'],
    specialty: 'Orthopedics',
    urgency: 'urgent',
    reason: 'Complex or complicated fracture requires orthopedic assessment.',
  },
  {
    condition: 'chest pain',
    severityThreshold: 'moderate',
    complicationTriggers: ['arrhythmia', 'heart failure', 'abnormal ecg', 'elevated troponin'],
    specialty: 'Cardiology',
    urgency: 'emergent',
    reason: 'Cardiac chest pain or suspected acute coronary syndrome requires immediate cardiology input.',
  },
  {
    condition: 'stroke',
    severityThreshold: 'moderate',
    complicationTriggers: ['hemorrhage', 'seizure', 'deteriorating gcs'],
    specialty: 'Neurology',
    urgency: 'emergent',
    reason: 'Acute stroke or neurological deterioration requires specialist neurology evaluation.',
  },
  {
    condition: 'cancer',
    severityThreshold: 'mild',
    complicationTriggers: ['metastasis', 'obstruction', 'bleeding'],
    specialty: 'Oncology',
    urgency: 'urgent',
    reason: 'Suspected or confirmed malignancy requires oncology referral.',
  },
  {
    condition: 'pregnancy',
    severityThreshold: 'moderate',
    complicationTriggers: ['bleeding', 'pre-eclampsia', 'preterm labor', 'reduced fetal movement'],
    specialty: 'Obstetrics & Gynecology',
    urgency: 'emergent',
    reason: 'Obstetric complication requires immediate specialist review.',
  },
  {
    condition: 'mental health',
    severityThreshold: 'moderate',
    complicationTriggers: ['suicidal ideation', 'psychosis', 'severe depression', 'mania'],
    specialty: 'Psychiatry',
    urgency: 'emergent',
    reason: 'Acute psychiatric presentation with safety concerns requires immediate mental health assessment.',
  },
  {
    condition: 'uti',
    severityThreshold: 'moderate',
    complicationTriggers: ['recurrent infection', 'pregnancy', 'renal abscess', 'sepsis'],
    specialty: 'Urology',
    urgency: 'semi-urgent',
    reason: 'Complicated urinary tract infection requires urology evaluation.',
  },
]

export function generateReferralCriteria(
  condition: string,
  context: ReferralContext,
): ReferralCriteria {
  const lowerCondition = condition.toLowerCase().trim()
  const matchedRule = REFERRAL_RULES.find(rule => lowerCondition.includes(rule.condition))

  if (!matchedRule) {
    return { needsReferral: false, urgency: 'routine', reason: 'No referral criteria met for this condition.' }
  }

  const severityLevels = ['mild', 'moderate', 'severe', 'critical']
  const severityIndex = severityLevels.indexOf(context.severity)
  const thresholdIndex = severityLevels.indexOf(matchedRule.severityThreshold)

  const hasComplication = context.complications.some(c =>
    matchedRule.complicationTriggers.some(t => c.toLowerCase().includes(t.toLowerCase())),
  )

  if (severityIndex >= thresholdIndex || hasComplication) {
    return {
      needsReferral: true,
      specialty: matchedRule.specialty,
      urgency: matchedRule.urgency,
      reason: matchedRule.reason,
    }
  }

  return { needsReferral: false, urgency: 'routine', reason: 'Condition severity is below referral threshold and no complications present.' }
}
