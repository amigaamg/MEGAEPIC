import { getDiseaseById } from '../knowledge-graph';
import type { Complication } from '../knowledge-graph/types';

export interface PatientState {
  vitals?: {
    hr?: number;
    bpSystolic?: number;
    temp?: number;
    rr?: number;
    spO2?: number;
  };
  labs?: {
    testId: string;
    value: number;
    flag?: 'normal' | 'abnormal' | 'critical';
  }[];
  examFindings?: {
    findingId: string;
    present: boolean;
  }[];
  imagingFindings?: {
    studyId: string;
    finding: string;
    positive: boolean;
  }[];
  timeSinceAdmissionHours?: number;
  timeSinceSurgeryHours?: number;
}

export interface DetectedComplication {
  diseaseId: string;
  name: string;
  probability: number;
  severityBoost: number;
  confidence: number;
  matchedTriggers: string[];
  matchedClues: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
}

const TRIGGER_PATTERNS: Record<string, (state: PatientState) => boolean> = {
  'lactate >2': (s) => (s.labs || []).some((l) => l.testId.includes('lactate') && l.value > 2),
  'lactate >4': (s) => (s.labs || []).some((l) => l.testId.includes('lactate') && l.value > 4),
  'wbc >15': (s) => (s.labs || []).some((l) => l.testId === 'wbc' && l.value > 15),
  'wbc >20': (s) => (s.labs || []).some((l) => l.testId === 'wbc' && l.value > 20),
  'acidosis': (s) => (s.labs || []).some((l) => l.testId === 'bicarb' && l.value < 18),
  'fever >38.5': (s) => (s.vitals?.temp ?? 0) > 38.5,
  'fever': (s) => (s.vitals?.temp ?? 0) > 37.5,
  'tachycardia': (s) => (s.vitals?.hr ?? 0) > 100,
  'hypotension': (s) => (s.vitals?.bpSystolic ?? 200) < 90,
  'tachycardia_out_of_proportion': (s) => (s.vitals?.hr ?? 0) > 120,
  'peritonitis': (s) => (s.examFindings || []).some((e) =>
    ['peritonitis', 'rebound', 'rigidity', 'guarding'].includes(e.findingId)),
  'generalized_peritonitis': (s) => (s.examFindings || []).some((e) =>
    e.findingId === 'generalized_peritonitis' && e.present),
  'septic_shock': (s) => (s.vitals?.bpSystolic ?? 200) < 90 && (s.vitals?.hr ?? 0) > 100,
  'free_air_on_xray': (s) => (s.imagingFindings || []).some((i) =>
    i.finding.toLowerCase().includes('free air') || i.finding.toLowerCase().includes('pneumoperitoneum')),
  'stoma_dark': (s) => (s.examFindings || []).some((e) => e.findingId === 'stoma_dark' && e.present),
  'stoma_purple': (s) => (s.examFindings || []).some((e) => e.findingId === 'stoma_purple' && e.present),
  'stoma_black': (s) => (s.examFindings || []).some((e) => e.findingId === 'stoma_black' && e.present),
  'stoma_retraction': (s) => (s.examFindings || []).some((e) => e.findingId === 'stoma_retraction' && e.present),
  'wound_erythema': (s) => (s.examFindings || []).some((e) => e.findingId === 'wound_erythema' && e.present),
  'wound_discharge': (s) => (s.examFindings || []).some((e) => e.findingId === 'wound_discharge_purulent' && e.present),
  'wound_pain': (s) => (s.examFindings || []).some((e) => e.findingId === 'wound_pain_increasing' && e.present),
  'bulge_around_stoma': (s) => (s.examFindings || []).some((e) => e.findingId === 'bulge_around_stoma' && e.present),
  'difficulty_bagging': (s) => (s.examFindings || []).some((e) => e.findingId === 'difficulty_bagging' && e.present),
  'obstruction': (s) => (s.examFindings || []).some((e) => e.findingId === 'obstruction' && e.present),
  'fever_day3_7': (s) => {
    const postopHrs = s.timeSinceSurgeryHours ?? 0;
    return postopHrs >= 72 && postopHrs <= 168 && (s.vitals?.temp ?? 0) > 37.5;
  },
  'drain_fluid_feculent': (s) => (s.examFindings || []).some((e) =>
    e.findingId === 'drain_fluid_feculent' && e.present),
  'free_air': (s) => (s.imagingFindings || []).some((i) =>
    i.finding.toLowerCase().includes('free air') || i.finding.toLowerCase().includes('pneumoperitoneum')),
};

const COMPLICATION_NAMES: Record<string, string> = {
  bowel_gangrene: 'Bowel Gangrene / Ischemia',
  bowel_perforation: 'Bowel Perforation',
  anastomotic_leak: 'Anastomotic Leak',
  stoma_ischemia: 'Stoma Ischemia',
  wound_infection: 'Surgical Site Infection',
  parastomal_hernia: 'Parastomal Hernia',
};

const COMPLICATION_ACTIONS: Record<string, string> = {
  bowel_gangrene: 'Emergency laparotomy — resection of gangrenous segment. ICU care required.',
  bowel_perforation: 'Emergency laparotomy — washout and repair/resection. Broad-spectrum antibiotics.',
  anastomotic_leak: 'Urgent laparotomy — take down anastomosis, end colostomy. Resuscitation and antibiotics.',
  stoma_ischemia: 'Urgent stoma revision — immediate surgical review. If systemic signs, emergency laparotomy.',
  wound_infection: 'Wound exploration, drainage, culture-directed antibiotics. Daily wound care.',
  parastomal_hernia: 'Elective surgical repair. If obstructed, urgent surgery. Stoma therapy consult.',
};

function evaluateTrigger(trigger: string, state: PatientState): boolean {
  const evaluator = TRIGGER_PATTERNS[trigger];
  if (evaluator) return evaluator(state);
  return false;
}

function evaluateClue(clue: string, state: PatientState): boolean {
  const clueLower = clue.toLowerCase();

  const foundInExam = (state.examFindings || []).some((e) =>
    e.present && (e.findingId.toLowerCase() === clueLower || e.findingId.toLowerCase().includes(clueLower)));
  if (foundInExam) return true;

  const foundInLab = (state.labs || []).some((l) =>
    l.flag === 'abnormal' || l.flag === 'critical');
  if (foundInLab && clueLower.includes('lab')) return true;

  const foundInImaging = (state.imagingFindings || []).some((i) =>
    i.positive && (i.finding.toLowerCase().includes(clueLower)));
  if (foundInImaging) return true;

  return false;
}

export function detectComplications(
  diseaseIds: string[],
  state: PatientState,
  activeDiagnosisId?: string,
): DetectedComplication[] {
  const results: DetectedComplication[] = [];
  const seen = new Set<string>();

  for (const did of diseaseIds) {
    const disease = getDiseaseById(did);
    if (!disease?.complications) continue;

    for (const comp of disease.complications) {
      if (seen.has(comp.diseaseId)) continue;
      seen.add(comp.diseaseId);

      const matchedTriggers: string[] = [];
      const matchedClues: string[] = [];

      const triggers = (comp as any).triggers as string[] | undefined;
      if (triggers) {
        for (const t of triggers) {
          if (evaluateTrigger(t, state)) matchedTriggers.push(t);
        }
      }

      const clues = comp.clues || [];
      for (const c of clues) {
        if (evaluateClue(c, state)) matchedClues.push(c);
      }

      const triggerScore = triggers ? matchedTriggers.length / Math.max(triggers.length, 1) : 0;
      const clueScore = clues.length > 0 ? matchedClues.length / clues.length : 0;
      const confidence = Math.min(1, triggerScore * 0.6 + clueScore * 0.4);

      if (confidence < 0.15) continue;

      const urgency = getUrgency(comp, confidence, matchTriggerTimeWindow(comp, state));
      const name = COMPLICATION_NAMES[comp.diseaseId] || comp.diseaseId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      results.push({
        diseaseId: comp.diseaseId,
        name,
        probability: comp.probability,
        severityBoost: comp.severityBoost,
        confidence: Math.round(confidence * 100),
        matchedTriggers,
        matchedClues,
        urgency,
        recommendedAction: COMPLICATION_ACTIONS[comp.diseaseId] || 'Clinical review — monitor closely.',
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

function matchTriggerTimeWindow(comp: Complication, state: PatientState): boolean {
  if (!comp.lagDays) return true;
  const [minDays, maxDays] = comp.lagDays;
  const elapsed = Math.max(state.timeSinceAdmissionHours ?? 0, state.timeSinceSurgeryHours ?? 0) / 24;
  return elapsed >= minDays && elapsed <= maxDays;
}

function getUrgency(
  comp: Complication,
  confidence: number,
  inTimeWindow: boolean,
): 'low' | 'medium' | 'high' | 'critical' {
  const severityBase = comp.severityBoost;

  if (severityBase >= 0.5 && confidence >= 0.5 && inTimeWindow) return 'critical';
  if (severityBase >= 0.4 && confidence >= 0.4) return 'high';
  if (confidence >= 0.3) return 'medium';
  return 'low';
}

export function checkPostOpWatch(
  diseaseId: string,
  timeSinceSurgeryHours: number,
): { window: string; items: { complication: string; watchFor: string[] }[] }[] {
  const disease = getDiseaseById(diseaseId);
  const triggers = (disease as any)?.complicationTrigers as Record<string, { complication: string; watchFor: string[] }[]> | undefined;
  if (!triggers) return [];

  const windows: { window: string; items: { complication: string; watchFor: string[] }[] }[] = [];
  for (const [key, items] of Object.entries(triggers)) {
    windows.push({ window: key, items });
  }
  return windows;
}
