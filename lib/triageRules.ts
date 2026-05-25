// ─────────────────────────────────────────────────────────────────────────────
// lib/triageRules.ts
// Triage engine: evaluates patient readings → determines action level
// Actions: 'monitor' | 'video' | 'clinic' | 'hospital'
// ─────────────────────────────────────────────────────────────────────────────

export type TriageLevel = 'normal' | 'watch' | 'video' | 'clinic' | 'hospital';

export interface TriageResult {
  level: TriageLevel;
  color: string;
  label: string;
  message: string;
  actionLabel: string;
  actionDetail: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  alertDoctor: boolean;
  alertPatient: boolean;
  autoBookVideo?: boolean;
}

export interface BPReading {
  systolic: number;
  diastolic: number;
  pulse?: number;
}

export interface GlucoseReading {
  value: number; // mmol/L
  type: 'fasting' | 'random' | 'post_meal' | '2h_post_meal';
}

export interface HbA1cReading {
  value: number; // percentage
}

export interface PeakFlowReading {
  value: number;        // L/min actual
  predicted: number;    // L/min predicted (patient's personal best or standard)
}

export interface WeightReading {
  value: number;        // kg
  previousValue?: number;
  daysSincePrevious?: number;
}

export interface OxygenReading {
  spo2: number;         // %
  pulse?: number;
}

export interface PainReading {
  scale: number; // 0–10
  location?: string;
  character?: string;
}

export interface MoodReading {
  phq9Score?: number;   // 0–27
  gad7Score?: number;   // 0–21
  wellbeing?: number;   // 1–10
}

const TRIAGE_COLORS: Record<TriageLevel, string> = {
  normal:   '#10b981',
  watch:    '#f59e0b',
  video:    '#6366f1',
  clinic:   '#f97316',
  hospital: '#ef4444',
};

// ─── Blood Pressure ────────────────────────────────────────────────────────────
export function triageBP(reading: BPReading): TriageResult {
  const { systolic: s, diastolic: d } = reading;

  if (s >= 180 || d >= 120) return {
    level: 'hospital', color: TRIAGE_COLORS.hospital, label: '🚨 Hypertensive Crisis',
    message: `BP ${s}/${d} mmHg — hypertensive emergency. Seek immediate care.`,
    actionLabel: 'Go to Emergency NOW', urgency: 'emergency',
    actionDetail: 'Call emergency services or go to the nearest A&E immediately. Do not wait.',
    alertDoctor: true, alertPatient: true,
  };

  if (s >= 160 || d >= 100) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Stage 2 Hypertension',
    message: `BP ${s}/${d} mmHg — dangerously elevated. Urgent clinic review required.`,
    actionLabel: 'Visit Clinic Today', urgency: 'urgent',
    actionDetail: 'You need an in-person assessment today. Contact your clinic for an emergency slot.',
    alertDoctor: true, alertPatient: true,
  };

  if (s >= 140 || d >= 90) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 Stage 1 Hypertension',
    message: `BP ${s}/${d} mmHg — elevated. Doctor review recommended within 48h.`,
    actionLabel: 'Book Video Consultation', urgency: 'urgent',
    actionDetail: 'Please schedule a video call with your doctor to review your medication and lifestyle.',
    alertDoctor: true, alertPatient: true, autoBookVideo: true,
  };

  if (s >= 130 || d >= 80) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '👀 Elevated BP',
    message: `BP ${s}/${d} mmHg — slightly elevated. Monitor closely.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Log readings twice daily. Reduce salt, caffeine, and stress. Alert if rising.',
    alertDoctor: false, alertPatient: true,
  };

  if (s < 90 || d < 60) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '⬇️ Low BP',
    message: `BP ${s}/${d} mmHg — hypotension. Note symptoms.`,
    actionLabel: 'Monitor for Symptoms', urgency: 'routine',
    actionDetail: 'Stay hydrated. If you feel faint or dizzy, sit down and call your doctor.',
    alertDoctor: false, alertPatient: true,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Normal BP',
    message: `BP ${s}/${d} mmHg — within normal range. Great work!`,
    actionLabel: 'Keep Monitoring', urgency: 'routine',
    actionDetail: 'Continue logging daily. Maintain healthy lifestyle habits.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── Blood Glucose ─────────────────────────────────────────────────────────────
export function triageGlucose(reading: GlucoseReading): TriageResult {
  const { value: v, type } = reading;
  const fastingHigh  = type === 'fasting' ? 7.0  : 11.1;
  const randomHigh   = 11.1;
  const threshold    = type === 'fasting' ? fastingHigh : randomHigh;

  if (v >= 20) return {
    level: 'hospital', color: TRIAGE_COLORS.hospital, label: '🚨 Severe Hyperglycaemia',
    message: `Glucose ${v} mmol/L — critically high. Emergency care needed.`,
    actionLabel: 'Go to Emergency NOW', urgency: 'emergency',
    actionDetail: 'This level can cause diabetic ketoacidosis (DKA). Seek emergency care immediately.',
    alertDoctor: true, alertPatient: true,
  };

  if (v >= 15) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Very High Glucose',
    message: `Glucose ${v} mmol/L — very high. Urgent review needed today.`,
    actionLabel: 'Urgent Clinic Visit', urgency: 'urgent',
    actionDetail: 'Contact your clinic for an urgent appointment today. Check for symptoms of DKA.',
    alertDoctor: true, alertPatient: true,
  };

  if (v >= threshold) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 High Glucose',
    message: `Glucose ${v} mmol/L — above target. Medication review recommended.`,
    actionLabel: 'Book Video Consultation', urgency: 'urgent',
    actionDetail: 'Schedule a video call with your doctor to review your insulin or medication dose.',
    alertDoctor: true, alertPatient: true, autoBookVideo: true,
  };

  if (v <= 3.9 && v > 3.0) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '⬇️ Low Glucose',
    message: `Glucose ${v} mmol/L — mild hypoglycaemia. Treat and recheck.`,
    actionLabel: 'Treat & Recheck', urgency: 'routine',
    actionDetail: 'Take 15g fast-acting carbs (glucose tablets, juice). Recheck in 15 mins.',
    alertDoctor: false, alertPatient: true,
  };

  if (v <= 3.0) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '🚨 Severe Hypoglycaemia',
    message: `Glucose ${v} mmol/L — severe low. Treat immediately.`,
    actionLabel: 'Treat Now & Call Doctor', urgency: 'emergency',
    actionDetail: 'Take glucose immediately. If unable to swallow or unconscious, call emergency services.',
    alertDoctor: true, alertPatient: true,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Normal Glucose',
    message: `Glucose ${v} mmol/L — within target range.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Excellent control. Continue current medication and diet plan.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── HbA1c ────────────────────────────────────────────────────────────────────
export function triageHbA1c(reading: HbA1cReading): TriageResult {
  const { value: v } = reading;

  if (v >= 10) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Very Poor Control',
    message: `HbA1c ${v}% — very high. Urgent medication review needed.`,
    actionLabel: 'Urgent Clinic Review', urgency: 'urgent',
    actionDetail: 'Your long-term sugar control is very poor. See your doctor this week for medication adjustment.',
    alertDoctor: true, alertPatient: true,
  };

  if (v >= 8) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 Poor Control',
    message: `HbA1c ${v}% — above target. Medication/lifestyle review recommended.`,
    actionLabel: 'Book Video Consultation', urgency: 'routine',
    actionDetail: 'Your diabetes is not well controlled. Schedule a video call to review your treatment plan.',
    alertDoctor: true, alertPatient: true, autoBookVideo: true,
  };

  if (v >= 6.5 && v < 8) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '👀 Borderline Control',
    message: `HbA1c ${v}% — slightly above ideal. Maintain improvements.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'You\'re close to target. Focus on diet and exercise. Retest in 3 months.',
    alertDoctor: false, alertPatient: true,
  };

  if (v < 5.7) return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Excellent Control',
    message: `HbA1c ${v}% — excellent long-term control.`,
    actionLabel: 'Maintain Current Plan', urgency: 'routine',
    actionDetail: 'Outstanding! Continue your current diabetes management plan.',
    alertDoctor: false, alertPatient: false,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Good Control',
    message: `HbA1c ${v}% — within acceptable range.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Good control. Retest in 3 months. Maintain your diet and medication routine.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── Peak Flow ────────────────────────────────────────────────────────────────
export function triagePeakFlow(reading: PeakFlowReading): TriageResult {
  const pct = Math.round((reading.value / reading.predicted) * 100);

  if (pct < 50) return {
    level: 'hospital', color: TRIAGE_COLORS.hospital, label: '🚨 Severe Obstruction',
    message: `Peak flow ${pct}% of predicted — severe attack. Emergency care needed.`,
    actionLabel: 'Call Emergency Services', urgency: 'emergency',
    actionDetail: 'Use your reliever inhaler immediately and call emergency services if no improvement in 15 mins.',
    alertDoctor: true, alertPatient: true,
  };

  if (pct < 70) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Moderate Obstruction',
    message: `Peak flow ${pct}% — moderate attack. Contact doctor urgently.`,
    actionLabel: 'Urgent Clinic Visit', urgency: 'urgent',
    actionDetail: 'Use reliever inhaler. If no improvement within 1 hour, go to clinic or A&E.',
    alertDoctor: true, alertPatient: true,
  };

  if (pct < 80) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 Mild Obstruction',
    message: `Peak flow ${pct}% — mild deterioration. Doctor review recommended.`,
    actionLabel: 'Book Video Consultation', urgency: 'routine',
    actionDetail: 'Use your preventer inhaler as prescribed. Schedule a video call with your doctor.',
    alertDoctor: true, alertPatient: true, autoBookVideo: true,
  };

  if (pct >= 80) return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Good Control',
    message: `Peak flow ${pct}% of predicted — good lung function.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Continue your preventer inhaler as prescribed. Monitor daily.',
    alertDoctor: false, alertPatient: false,
  };

  return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '👀 Monitor',
    message: `Peak flow ${pct}% — monitor closely.`,
    actionLabel: 'Monitor Daily', urgency: 'routine',
    actionDetail: 'Log readings daily at the same time. Watch for downward trends.',
    alertDoctor: false, alertPatient: true,
  };
}

// ─── Oxygen Saturation ────────────────────────────────────────────────────────
export function triageSpO2(reading: OxygenReading): TriageResult {
  const { spo2 } = reading;

  if (spo2 < 90) return {
    level: 'hospital', color: TRIAGE_COLORS.hospital, label: '🚨 Critical Low O₂',
    message: `SpO₂ ${spo2}% — critically low. Emergency care required.`,
    actionLabel: 'Call Emergency Services NOW', urgency: 'emergency',
    actionDetail: 'SpO₂ below 90% is a medical emergency. Call emergency services immediately.',
    alertDoctor: true, alertPatient: true,
  };

  if (spo2 < 94) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Low O₂ Saturation',
    message: `SpO₂ ${spo2}% — below normal. Urgent review needed.`,
    actionLabel: 'Urgent Clinic Visit', urgency: 'urgent',
    actionDetail: 'Please go to clinic or A&E for urgent assessment. Supplemental oxygen may be needed.',
    alertDoctor: true, alertPatient: true,
  };

  if (spo2 < 96) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '👀 Borderline SpO₂',
    message: `SpO₂ ${spo2}% — slightly low. Monitor closely.`,
    actionLabel: 'Monitor & Alert if Lower', urgency: 'routine',
    actionDetail: 'Rest and avoid exertion. Alert your doctor if it drops below 94% or you feel breathless.',
    alertDoctor: false, alertPatient: true,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Normal SpO₂',
    message: `SpO₂ ${spo2}% — normal oxygen saturation.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Oxygen levels are normal. Continue monitoring as directed.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── Pain Scale ───────────────────────────────────────────────────────────────
export function triagePain(reading: PainReading): TriageResult {
  const { scale } = reading;

  if (scale >= 9) return {
    level: 'hospital', color: TRIAGE_COLORS.hospital, label: '🚨 Severe Pain',
    message: `Pain ${scale}/10 — severe, unmanageable pain. Emergency assessment needed.`,
    actionLabel: 'Go to Emergency', urgency: 'emergency',
    actionDetail: 'Pain at this level requires urgent medical attention. Go to A&E or call emergency services.',
    alertDoctor: true, alertPatient: true,
  };

  if (scale >= 7) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ High Pain',
    message: `Pain ${scale}/10 — significant pain impacting function.`,
    actionLabel: 'Urgent Clinic Visit', urgency: 'urgent',
    actionDetail: 'This level of pain needs urgent review. Contact your clinic for a same-day appointment.',
    alertDoctor: true, alertPatient: true,
  };

  if (scale >= 5) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 Moderate Pain',
    message: `Pain ${scale}/10 — moderate pain affecting daily activities.`,
    actionLabel: 'Book Video Consultation', urgency: 'routine',
    actionDetail: 'Review your pain management with your doctor via video call.',
    alertDoctor: true, alertPatient: false, autoBookVideo: true,
  };

  if (scale >= 3) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '👀 Mild Pain',
    message: `Pain ${scale}/10 — mild but notable. Monitor for changes.`,
    actionLabel: 'Monitor & Log', urgency: 'routine',
    actionDetail: 'Continue prescribed pain management. Log daily. Alert if worsening.',
    alertDoctor: false, alertPatient: false,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Minimal/No Pain',
    message: `Pain ${scale}/10 — well controlled.`,
    actionLabel: 'Continue Current Plan', urgency: 'routine',
    actionDetail: 'Pain is well managed. Continue your current treatment.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── PHQ-9 Mental Health ──────────────────────────────────────────────────────
export function triagePHQ9(score: number): TriageResult {
  if (score >= 20) return {
    level: 'hospital', color: TRIAGE_COLORS.hospital, label: '🚨 Severe Depression',
    message: `PHQ-9 score ${score} — severe depression. Immediate support needed.`,
    actionLabel: 'Urgent Mental Health Support', urgency: 'emergency',
    actionDetail: 'Please contact a mental health crisis line or go to A&E if you are at risk of harming yourself. You are not alone.',
    alertDoctor: true, alertPatient: true,
  };

  if (score >= 15) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Moderately Severe',
    message: `PHQ-9 score ${score} — moderately severe depression. Urgent review needed.`,
    actionLabel: 'Urgent Clinic Visit', urgency: 'urgent',
    actionDetail: 'Please see your doctor this week for an urgent mental health assessment.',
    alertDoctor: true, alertPatient: true,
  };

  if (score >= 10) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 Moderate Depression',
    message: `PHQ-9 score ${score} — moderate depression. Doctor review recommended.`,
    actionLabel: 'Book Video Consultation', urgency: 'routine',
    actionDetail: 'Schedule a video call with your doctor to discuss treatment options.',
    alertDoctor: true, alertPatient: true, autoBookVideo: true,
  };

  if (score >= 5) return {
    level: 'watch', color: TRIAGE_COLORS.watch, label: '👀 Mild Depression',
    message: `PHQ-9 score ${score} — mild depression symptoms. Monitor.`,
    actionLabel: 'Monitor & Journal', urgency: 'routine',
    actionDetail: 'Practice self-care, stay social and active. Retest in 2 weeks.',
    alertDoctor: false, alertPatient: true,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Minimal Symptoms',
    message: `PHQ-9 score ${score} — no or minimal depression.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Great mental wellbeing. Continue regular check-ins.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── Weight Change ────────────────────────────────────────────────────────────
export function triageWeightChange(current: number, previous: number, days: number): TriageResult {
  const change   = current - previous;
  const rate     = Math.abs(change) / Math.max(days, 1); // kg/day
  const weekRate = rate * 7;

  if (weekRate > 5) return {
    level: 'clinic', color: TRIAGE_COLORS.clinic, label: '⚠️ Rapid Weight Change',
    message: `${Math.abs(change).toFixed(1)}kg ${change > 0 ? 'gained' : 'lost'} in ${days} days — rapid change.`,
    actionLabel: 'Clinic Review Needed', urgency: 'urgent',
    actionDetail: 'Rapid weight change can indicate serious medical issues. Please see your doctor this week.',
    alertDoctor: true, alertPatient: true,
  };

  if (weekRate > 2) return {
    level: 'video', color: TRIAGE_COLORS.video, label: '📹 Significant Weight Change',
    message: `${Math.abs(change).toFixed(1)}kg ${change > 0 ? 'gained' : 'lost'} in ${days} days.`,
    actionLabel: 'Book Video Consultation', urgency: 'routine',
    actionDetail: 'This weight change is notable. Discuss with your doctor via video call.',
    alertDoctor: true, alertPatient: false, autoBookVideo: true,
  };

  return {
    level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Stable Weight',
    message: `Weight stable — ${current}kg.`,
    actionLabel: 'Continue Monitoring', urgency: 'routine',
    actionDetail: 'Weight is within expected variation. Continue weekly weigh-ins.',
    alertDoctor: false, alertPatient: false,
  };
}

// ─── Master evaluate function ─────────────────────────────────────────────────
export function evaluateReading(
  toolType: string,
  data: Record<string, any>,
): TriageResult {
  switch (toolType) {
    case 'bp_monitor':
      return triageBP({ systolic: data.systolic, diastolic: data.diastolic, pulse: data.pulse });
    case 'glucose_tracker':
      return triageGlucose({ value: data.value, type: data.readingType || 'random' });
    case 'hba1c_tracker':
      return triageHbA1c({ value: data.value });
    case 'peak_flow':
      return triagePeakFlow({ value: data.value, predicted: data.predicted || data.personalBest || 500 });
    case 'spo2_monitor':
      return triageSpO2({ spo2: data.value, pulse: data.pulse });
    case 'pain_scale':
      return triagePain({ scale: data.value, location: data.location, character: data.character });
    case 'mood_tracker':
      return triagePHQ9(data.phq9 || 0);
    case 'weight_tracker':
      if (data.previousValue && data.daysSincePrevious) {
        return triageWeightChange(data.value, data.previousValue, data.daysSincePrevious);
      }
      return { level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Recorded', message: `Weight: ${data.value}kg`, actionLabel: 'Continue', urgency: 'routine', actionDetail: 'Keep logging weekly.', alertDoctor: false, alertPatient: false };
    default:
      return { level: 'normal', color: TRIAGE_COLORS.normal, label: '✅ Recorded', message: 'Reading logged successfully.', actionLabel: 'Continue', urgency: 'routine', actionDetail: '', alertDoctor: false, alertPatient: false };
  }
}