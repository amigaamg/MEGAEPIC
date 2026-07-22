// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Red Flag Engine — pure clinical rules, no reasoning, no AI
// ═══════════════════════════════════════════════════════════════════════════════
// Runs independently on every state update. Only reads EncounterState.
// Writes red flags to assessment.severity.redFlags.
// No other engine detects danger. No other engine writes red flags.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId } from '../encounterState';

// ── Red flag rule definition ───────────────────────────────────────────────

export interface RedFlagRule {
  id: string;
  label: string;
  priority: 'critical' | 'high' | 'moderate';
  check: (state: EncounterState) => string | null;
}

// ── Rules ──────────────────────────────────────────────────────────────────

const RULES: RedFlagRule[] = [
  // ── Airway / Breathing ──────────────────────────────────────────────
  {
    id: 'stridor_severe',
    label: 'Stridor with respiratory distress',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['stridor'];
      if (sym?.present && (sym as any).severity === 'critical_exhaustion') {
        return 'Critical stridor with exhaustion — impending airway loss';
      }
      return null;
    },
  },
  {
    id: 'stridor_drooling',
    label: 'Stridor with drooling',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['stridor'];
      if (sym?.present && (sym as any).drooling) {
        return 'Stridor with drooling — suspect epiglottitis. Do NOT examine throat.';
      }
      return null;
    },
  },
  {
    id: 'cyanosis_at_rest',
    label: 'Cyanosis at rest',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['cyanosis'];
      if (sym?.present && (sym as any).context === 'at_rest') {
        return 'Cyanosis at rest — critical hypoxia, immediate oxygenation required';
      }
      return null;
    },
  },
  {
    id: 'dyspnea_at_rest',
    label: 'Dyspnea at rest',
    priority: 'high',
    check: (s) => {
      const sym = s.symptoms['dyspnea'];
      if (sym?.present && (sym as any).at_rest) {
        return 'Breathlessness at rest — assess ABC immediately';
      }
      return null;
    },
  },
  {
    id: 'chest_pain_exertional',
    label: 'Exertional chest pain',
    priority: 'high',
    check: (s) => {
      const sym = s.symptoms['chest_pain'];
      if (sym?.present && (sym as any).exertional) {
        return 'Exertional chest pain — suspect cardiac ischaemia';
      }
      return null;
    },
  },

  // ── Circulation ─────────────────────────────────────────────────────
  {
    id: 'gi_bleed_syncope',
    label: 'GI bleed with syncope',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['gi_bleeding'];
      if (sym?.present && (sym as any).syncope) {
        return 'GI bleeding with syncope — haemodynamic compromise, urgent resuscitation';
      }
      return null;
    },
  },
  {
    id: 'gi_bleed_large',
    label: 'Massive GI bleeding',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['gi_bleeding'];
      if (sym?.present && (sym as any).volume === 'large_massive') {
        return 'Massive GI bleeding — immediate transfusion and endoscopy';
      }
      return null;
    },
  },

  // ── Neurology ───────────────────────────────────────────────────────
  {
    id: 'seizure_status',
    label: 'Prolonged seizure',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['seizure'];
      if (sym?.present && (sym as any).duration === 'more_than_5_min') {
        return 'Seizure >5 minutes — status epilepticus protocol';
      }
      return null;
    },
  },
  {
    id: 'headache_worst',
    label: 'Worst headache of life',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['headache'];
      if (sym?.present && (sym as any).severity === 'worst_of_life') {
        return 'Worst headache of life — rule out subarachnoid haemorrhage';
      }
      return null;
    },
  },
  {
    id: 'lethargy_severe',
    label: 'Severe lethargy',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['lethargy'];
      if (sym?.present && (sym as any).severity === 'severe_unrousable') {
        return 'Unrousable — coma protocol, check ABC and glucose';
      }
      return null;
    },
  },

  // ── Abdomen ─────────────────────────────────────────────────────────
  {
    id: 'bilious_vomiting_infant',
    label: 'Bilious vomiting in infant',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['nausea_vomiting'];
      if (sym?.present && (sym as any).bilious && s.demographics.ageMonths < 12) {
        return 'Bilious vomiting in infant — surgical emergency until proven otherwise';
      }
      return null;
    },
  },
  {
    id: 'abdominal_pain_severe',
    label: 'Severe abdominal pain',
    priority: 'high',
    check: (s) => {
      const sym = s.symptoms['abdominal_pain'];
      if (sym?.present && (sym as any).severity >= 8) {
        return 'Severe abdominal pain (8/10+) — consider peritonitis, obstruction, rupture';
      }
      return null;
    },
  },

  // ── Obstetric ───────────────────────────────────────────────────────
  {
    id: 'vaginal_bleeding_pregnant',
    label: 'Vaginal bleeding in pregnancy',
    priority: 'critical',
    check: (s) => {
      const sym = s.symptoms['vaginal_bleeding'];
      if (sym?.present && s.history.obstetric && s.history.obstetric.LMP) {
        return 'Vaginal bleeding in pregnancy — rule out ectopic, placenta praevia, abruption';
      }
      return null;
    },
  },

  // ── Vitals ──────────────────────────────────────────────────────────
  {
    id: 'hypoxia',
    label: 'Low oxygen saturation',
    priority: 'critical',
    check: (s) => {
      const spo2 = s.examination.vitals.spo2;
      if (spo2 !== undefined && spo2 < 90) {
        return `Oxygen saturation ${spo2}% — critical hypoxia, administer oxygen immediately`;
      }
      return null;
    },
  },
  {
    id: 'tachypnea',
    label: 'Tachypnoea',
    priority: 'high',
    check: (s) => {
      const rr = s.examination.vitals.rr;
      if (rr !== undefined) {
        const ageMonths = s.demographics.ageMonths;
        const threshold = ageMonths < 12 ? 50 : ageMonths < 60 ? 40 : 30;
        if (rr > threshold) {
          return `Respiratory rate ${rr} (above threshold ${threshold}) — respiratory distress`;
        }
      }
      return null;
    },
  },
  {
    id: 'hypotension',
    label: 'Hypotension',
    priority: 'critical',
    check: (s) => {
      const bp = s.examination.vitals.bpSystolic;
      if (bp !== undefined && bp < 90) {
        return `Systolic BP ${bp} — hypotension, start resuscitation`;
      }
      return null;
    },
  },
  {
    id: 'hyperthermia',
    label: 'High fever',
    priority: 'high',
    check: (s) => {
      const temp = s.examination.vitals.temp;
      if (temp !== undefined && temp > 40) {
        return `Temperature ${temp}°C — severe hyperthermia, consider antipyretics and cooling`;
      }
      return null;
    },
  },
  {
    id: 'hypothermia',
    label: 'Hypothermia',
    priority: 'high',
    check: (s) => {
      const temp = s.examination.vitals.temp;
      if (temp !== undefined && temp < 35) {
        return `Temperature ${temp}°C — hypothermia, warm patient immediately`;
      }
      return null;
    },
  },

  // ── Danger signs by age ─────────────────────────────────────────────
  {
    id: 'under_2mo_fever',
    label: 'Fever in infant under 2 months',
    priority: 'critical',
    check: (s) => {
      const fever = s.symptoms['fever'];
      if (fever?.present && s.demographics.ageMonths < 2) {
        return 'Fever in infant <2 months — admit for full sepsis workup';
      }
      return null;
    },
  },
  {
    id: 'reduced_feeding_severe',
    label: 'Severe reduced feeding in child',
    priority: 'high',
    check: (s) => {
      const rf = s.symptoms['reduced_feeding'];
      if (rf?.present && (rf as any).severity === 'severe_75_percent') {
        return 'Severe reduced feeding — risk of dehydration and hypoglycaemia';
      }
      return null;
    },
  },
];

// ── Run all rules ──────────────────────────────────────────────────────────

export interface RedFlagResult {
  redFlags: string[];
  criticalCount: number;
  highCount: number;
  hasCritical: boolean;
}

export function evaluateRedFlags(state: EncounterState): RedFlagResult {
  const redFlags: string[] = [];
  let criticalCount = 0;
  let highCount = 0;

  for (const rule of RULES) {
    const result = rule.check(state);
    if (result) {
      redFlags.push(`[${rule.priority.toUpperCase()}] ${result}`);
      if (rule.priority === 'critical') criticalCount++;
      if (rule.priority === 'high') highCount++;
    }
  }

  return {
    redFlags,
    criticalCount,
    highCount,
    hasCritical: criticalCount > 0,
  };
}

// ── Build severity assessment from red flags ───────────────────────────────

export function assessSeverity(state: EncounterState) {
  const redFlagResult = evaluateRedFlags(state);
  const { redFlags, hasCritical, criticalCount, highCount } = redFlagResult;

  let level: 'mild' | 'moderate' | 'severe' | 'critical' = 'mild';
  let triagePriority: 'green' | 'yellow' | 'orange' | 'red' = 'green';

  if (hasCritical) {
    level = 'critical';
    triagePriority = 'red';
  } else if (criticalCount > 0) {
    level = 'severe';
    triagePriority = 'orange';
  } else if (highCount >= 2) {
    level = 'severe';
    triagePriority = 'orange';
  } else if (highCount >= 1) {
    level = 'moderate';
    triagePriority = 'yellow';
  }

  return {
    level,
    triagePriority,
    redFlags,
    scores: [],
  };
}
