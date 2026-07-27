// ─────────────────────────────────────────────────────────────────
// AMEXAN HMIS Downstream Triggers
// Critical alerts, procedure prefills, nursing tasks, referrals
// ─────────────────────────────────────────────────────────────────

export type TriggerPriority = 'stat' | 'urgent' | 'routine' | 'scheduled';

export type TriggerAction = 'alert' | 'order' | 'task' | 'referral' | 'prefill' | 'monitor' | 'notification';

export interface HMISTrigger {
  id: string;
  priority: TriggerPriority;
  action: TriggerAction;
  title: string;
  description: string;
  targetRole: string[];
  destination?: string;
  details?: Record<string, unknown>;
}

export interface HMISTriggerPlan {
  triggers: HMISTrigger[];
  hasStat: boolean;
  hasUrgent: boolean;
  summary: string;
}

// ─────────────────────────────────────────────────────────────────
// CRITICAL FINDING → ALERT MAPPING
// ─────────────────────────────────────────────────────────────────

const CRITICAL_ALERTS: Record<string, { title: string; description: string; priority: TriggerPriority; targetRole: string[]; action: TriggerAction }[]> = {
  'resp_ausc_breath_sounds': [
    { title: 'Absent Breath Sounds', description: 'Absent breath sounds detected — consider pneumothorax, massive effusion, or complete lung collapse.', priority: 'urgent', targetRole: ['doctor', 'respiratory_therapist'], action: 'alert' },
  ],
  'neuro_consciousness_avpu': [
    { title: 'GCS ≤ 8 — Airway Risk', description: 'GCS of 8 or less indicates loss of airway protective reflexes. Immediate intubation should be considered.', priority: 'stat', targetRole: ['doctor', 'anaesthetist', 'icu_team'], action: 'alert' },
    { title: 'Deteriorating Consciousness', description: 'GCS trend declining — urgent CT head and neurosurgical review.', priority: 'urgent', targetRole: ['doctor', 'neurologist', 'radiologist'], action: 'notification' },
  ],
  'neuro_pupils_size': [
    { title: 'Fixed Dilated Pupil', description: 'Unilateral fixed dilated pupil — possible CN III compression from uncal herniation. Immediate neurosurgical referral.', priority: 'stat', targetRole: ['doctor', 'neurosurgeon'], action: 'alert' },
  ],
  'cvs_pulse_character': [
    { title: 'Cardiac Arrest / No Pulse', description: 'No palpable pulse — initiate CPR per ALS protocol.', priority: 'stat', targetRole: ['doctor', 'nurse', 'code_team'], action: 'alert' },
  ],
  'cvs_jvp': [
    { title: 'Elevated JVP + Hypotension', description: 'Elevated JVP with hypotension — consider cardiac tamponade (Beck\'s triad), massive PE, or tension pneumothorax.', priority: 'urgent', targetRole: ['doctor', 'cardiologist'], action: 'alert' },
  ],
  'breast_palp_mass': [
    { title: 'Suspicious Breast Mass', description: 'Palpable mass with malignant features — urgent triple assessment required (mammogram/US + core biopsy + clinical examination).', priority: 'urgent', targetRole: ['doctor', 'breast_nurse'], action: 'referral' },
  ],
};

// ─────────────────────────────────────────────────────────────────
// FINDING → ORDER PREFILLS
// ─────────────────────────────────────────────────────────────────

const ORDER_PREFILLS: Record<string, { title: string; orders: string[]; priority: TriggerPriority }> = {
  'resp_perc_note': { title: 'Abnormal Percussion', orders: ['Chest X-ray PA and lateral', 'Consider CT chest if unexplained'], priority: 'routine' },
  'resp_ausc_crackles': { title: 'Crackles on Auscultation', orders: ['Chest X-ray', 'CBC', 'CRP', 'Sputum culture if productive'], priority: 'routine' },
  'resp_ausc_wheeze': { title: 'Wheeze', orders: ['Peak flow measurement', 'Spirometry with bronchodilator reversibility'], priority: 'routine' },
  'breast_palp_mass': { title: 'Breast Mass', orders: ['Bilateral mammography', 'Breast ultrasound', 'Core needle biopsy or FNAC'], priority: 'urgent' },
  'breast_axillary_nodes': { title: 'Axillary Lymphadenopathy', orders: ['Axillary ultrasound', 'FNAC/core biopsy of abnormal nodes'], priority: 'urgent' },
  'breast_discharge_color': { title: 'Blood-stained Nipple Discharge', orders: ['Mammography', 'Breast ultrasound', 'Ductoscopy/ductography', 'Nipple discharge cytology'], priority: 'urgent' },
};

// ─────────────────────────────────────────────────────────────────
// FINDING → NURSING TASKS
// ─────────────────────────────────────────────────────────────────

const NURSING_TASKS: Record<string, { title: string; tasks: string[]; frequency: string }> = {
  'cvs_oedema': { title: 'Peripheral Oedema Monitoring', tasks: ['Daily weight', 'Measure calf/ankle circumference', 'Monitor for skin breakdown', 'Elevate legs when sitting'], frequency: 'daily' },
  'breast_postop_lymphedema': { title: 'Lymphoedema Surveillance', tasks: ['Arm circumference measurement', 'Skin inspection', 'Range of motion exercises', 'Compression garment compliance'], frequency: 'weekly' },
  'breast_postop_drains': { title: 'Drain Output Monitoring', tasks: ['Record drain output every shift', 'Observe for colour change (serous → bloody/chylous)', 'Ensure drain patency', 'Empty and re-prime drain'], frequency: 'every_shift' },
  'breast_postop_flap_viability': { title: 'Flap Monitoring', tasks: ['Assess flap colour q1h', 'Capillary refill check', 'Temperature assessment', 'Doppler signal check'], frequency: 'hourly' },
  'cvs_jvp': { title: 'JVP Monitoring', tasks: ['Serial JVP measurement', 'Strict fluid input/output chart', 'Daily weight'], frequency: 'daily' },
  'neuro_motor_power_arms': { title: 'Neurovascular Observations', tasks: ['Motor power assessment', 'Sensory check', 'Pain assessment'], frequency: '4_hourly' },
};

// ─────────────────────────────────────────────────────────────────
// MAIN TRIGGER ENGINE
// ─────────────────────────────────────────────────────────────────

export function generateHMISTriggers(
  findings: Record<string, unknown>,
  activeCardIds: string[],
  encounterType: string,
): HMISTriggerPlan {
  const triggers: HMISTrigger[] = [];
  let ctr = 0;

  for (const [cardId, alerts] of Object.entries(CRITICAL_ALERTS)) {
    const val = findings[cardId];
    if (val == null || val === '' || val === false) continue;
    const strVal = String(val);
    for (const alert of alerts) {
      const matched = cardId === 'resp_ausc_breath_sounds' && (strVal.includes('absent') || strVal.includes('no_air_entry'))
        || cardId === 'neuro_consciousness_avpu' && (strVal === 'unresponsive' || strVal === 'pain')
        || cardId === 'cvs_pulse_character' && (strVal === 'absent' || strVal === 'no_pulse');
      if (matched || strVal.includes('absent') || strVal === 'unresponsive' || strVal === 'critical' || strVal === 'fixed') {
        triggers.push({
          id: `hmis_alert_${ctr++}`,
          priority: alert.priority,
          action: alert.action,
          title: alert.title,
          description: alert.description,
          targetRole: alert.targetRole,
        });
      }
    }
  }

  for (const [cardId, prefill] of Object.entries(ORDER_PREFILLS)) {
    const val = findings[cardId];
    if (val != null && val !== '' && val !== false && val !== 'normal' && val !== 'none') {
      triggers.push({
        id: `hmis_order_${ctr++}`,
        priority: prefill.priority,
        action: 'order',
        title: prefill.title,
        description: `Suggested orders: ${prefill.orders.join(', ')}`,
        targetRole: ['doctor'],
        details: { orders: prefill.orders },
      });
    }
  }

  for (const [cardId, task] of Object.entries(NURSING_TASKS)) {
    const val = findings[cardId];
    if (val != null && val !== '' && val !== false && val !== 'none' && val !== 'normal') {
      triggers.push({
        id: `hmis_task_${ctr++}`,
        priority: 'routine',
        action: 'task',
        title: task.title,
        description: `Tasks: ${task.tasks.join(', ')} (Every ${task.frequency})`,
        targetRole: ['nurse'],
        details: { tasks: task.tasks, frequency: task.frequency },
      });
    }
  }

  return {
    triggers,
    hasStat: triggers.some(t => t.priority === 'stat'),
    hasUrgent: triggers.some(t => t.priority === 'urgent'),
    summary: triggers.length > 0 ? `${triggers.length} downstream actions triggered${triggers.some(t => t.priority === 'stat') ? ' — STAT alert present' : ''}` : 'No downstream actions required.',
  };
}

export function generateCriticalAlertBanner(triggers: HMISTrigger[]): string {
  const critical = triggers.filter(t => t.priority === 'stat' || t.priority === 'urgent');
  if (critical.length === 0) return '';
  return critical.map(t => {
    const icon = t.priority === 'stat' ? '🔴 STAT' : '🟡 URGENT';
    return `${icon}: ${t.title} — ${t.description}`;
  }).join('\n');
}
