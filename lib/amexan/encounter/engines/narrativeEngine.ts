// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Narrative Engine — DUMB formatter, NO reasoning
// ═══════════════════════════════════════════════════════════════════════════════
// Input: EncounterState
// Output: English text (HPI paragraph, symptom descriptions)
// The engine does NOT decide what to ask, does NOT update state, does NOT run
// clinical reasoning. It only formats structured data into readable English.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterState,
  SymptomId,
  StructuredSymptom,
  GenericSymptom,
  AbdominalPainSymptom,
  ChestPainSymptom,
  CoughSymptom,
  FeverSymptom,
  DyspneaSymptom,
  NauseaVomitingSymptom,
  DiarrheaSymptom,
} from '../encounterState';
import { SYMPTOM_SCHEMAS } from '../symptomSchemas';

// ── Value formatters ───────────────────────────────────────────────────────

function fmtSelect(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmtBoolean(value: boolean | undefined, label: string): string {
  if (value === undefined) return '';
  return value ? label : `no ${label.toLowerCase()}`;
}

// ── Symptom-specific description builders ──────────────────────────────────

function describeAbdominalPain(s: AbdominalPainSymptom): string {
  const parts: string[] = [`Abdominal pain`];
  if (s.location) parts.push(`located in the ${fmtSelect(s.location)}`);
  if (s.character) parts.push(`described as ${s.character}`);
  if (s.onset) parts.push(`with ${s.onset} onset`);
  if (s.duration) parts.push(`for ${s.duration}`);
  if (s.severity !== undefined) parts.push(`rated ${s.severity}/10 in severity`);
  if (s.radiation && s.radiation !== 'none') parts.push(`radiating to ${fmtSelect(s.radiation)}`);
  if (s.progression) parts.push(`and is ${fmtSelect(s.progression)}`);
  if (s.temporalPattern) parts.push(`with a ${fmtSelect(s.temporalPattern)} pattern`);
  if (s.aggravating?.length) parts.push(`worsened by ${s.aggravating.map(fmtSelect).join(', ')}`);
  if (s.relieving?.length) parts.push(`relieved by ${s.relieving.map(fmtSelect).join(', ')}`);
  if (s.timingRelativeToMeals) parts.push(`and is ${fmtSelect(s.timingRelativeToMeals)}`);
  return parts.join(', ') + '.';
}

function describeChestPain(s: ChestPainSymptom): string {
  const parts: string[] = [`Chest pain`];
  if (s.location) parts.push(`in the ${fmtSelect(s.location)} area`);
  if (s.character) parts.push(`described as ${s.character}`);
  if (s.onset) parts.push(`with ${s.onset} onset`);
  if (s.duration) parts.push(`lasting ${s.duration}`);
  if (s.severity !== undefined) parts.push(`rated ${s.severity}/10`);
  if (s.radiation && s.radiation !== 'none') parts.push(`radiating to ${fmtSelect(s.radiation)}`);
  if (s.exertional !== undefined) parts.push(s.exertional ? 'brought on by exertion' : 'not exertional');
  if (s.pleuritic !== undefined) parts.push(s.pleuritic ? 'pleuritic in nature' : 'non-pleuritic');
  if (s.relievingFactors?.length) parts.push(`relieved by ${s.relievingFactors.map(fmtSelect).join(', ')}`);
  return parts.join(', ') + '.';
}

function describeCough(s: CoughSymptom): string {
  const parts: string[] = [`Cough`];
  if (s.duration) parts.push(`for ${s.duration}`);
  if (s.character) {
    const charLabels: Record<string, string> = { dry: 'dry', productive: 'productive', barking: 'barking', paroxysmal: 'paroxysmal' };
    parts.push(charLabels[s.character] || s.character);
  }
  if (s.sputumColor && s.character === 'productive') parts.push(`with ${fmtSelect(s.sputumColor)} sputum`);
  if (s.hemoptysis !== undefined) parts.push(s.hemoptysis ? 'with haemoptysis' : 'without haemoptysis');
  if (s.nocturnal) parts.push('worse at night');
  if (s.exerciseTriggered) parts.push('triggered by exercise');
  if (s.postTussiveVomiting) parts.push('with post-tussive vomiting');
  return parts.join(', ') + '.';
}

function describeFever(s: FeverSymptom): string {
  const parts: string[] = [`Fever`];
  if (s.duration) parts.push(`for ${s.duration}`);
  if (s.pattern) parts.push(`with ${fmtSelect(s.pattern)} pattern`);
  if (s.highestTemp !== undefined) parts.push(`highest recorded temperature ${s.highestTemp}°C`);
  if (s.rigors) parts.push('associated with rigors');
  if (s.nightSweats) parts.push('with drenching night sweats');
  return parts.join(', ') + '.';
}

function describeDyspnea(s: DyspneaSymptom): string {
  const parts: string[] = [`Shortness of breath`];
  if (s.onset) parts.push(`with ${s.onset} onset`);
  if (s.severity) parts.push(`rated as ${fmtSelect(s.severity)}`);
  if (s.atRest) parts.push('present at rest');
  if (s.onExertion) parts.push(`triggered by ${s.onExertion}`);
  if (s.orthopnea) parts.push('worse when lying flat');
  if (s.PND) parts.push('with paroxysmal nocturnal dyspnea');
  return parts.join(', ') + '.';
}

function describeNauseaVomiting(s: NauseaVomitingSymptom): string {
  const parts: string[] = [`Nausea and vomiting`];
  if (s.frequency) parts.push(`occurring ${fmtSelect(s.frequency)}`);
  if (s.bilious) parts.push('bilious');
  if (s.projectile) parts.push('projectile');
  if (s.feculent) parts.push('feculent');
  if (s.hematemesis) parts.push('with blood in vomitus');
  if (s.timingRelativeToPain) parts.push(`occurring ${fmtSelect(s.timingRelativeToPain)}`);
  if (s.reliefAfterVomiting !== undefined) parts.push(s.reliefAfterVomiting ? 'relieved by vomiting' : 'not relieved by vomiting');
  return parts.join(', ') + '.';
}

function describeDiarrhea(s: DiarrheaSymptom): string {
  const parts: string[] = [`Diarrhoea`];
  if (s.duration) parts.push(`for ${fmtSelect(s.duration)}`);
  if (s.frequency) parts.push(`${s.frequency} times per day`);
  if (s.character) parts.push(`${fmtSelect(s.character)} in character`);
  if (s.volume) parts.push(`${s.volume} volume`);
  if (s.nocturnal) parts.push('nocturnal');
  return parts.join(', ') + '.';
}

// ── Generic symptom description ────────────────────────────────────────────

function describeGenericSymptom(symptomId: SymptomId, s: Record<string, any>): string {
  const schema = SYMPTOM_SCHEMAS[symptomId];
  const label = schema?.label ?? fmtSelect(symptomId);
  const parts: string[] = [label];

  if (s.duration) parts.push(`for ${s.duration}`);
  if (s.onset) parts.push(`with ${fmtSelect(s.onset)} onset`);
  if (s.severity) parts.push(`severity: ${fmtSelect(String(s.severity))}`);
  if (s.location) parts.push(`located ${s.location}`);

  return parts.join(', ') + '.';
}

// ── Public API ─────────────────────────────────────────────────────────────

export function describeSymptom(symptomId: SymptomId, data: Record<string, any>): string {
  switch (symptomId) {
    case 'abdominal_pain': return describeAbdominalPain(data as AbdominalPainSymptom);
    case 'chest_pain': return describeChestPain(data as ChestPainSymptom);
    case 'cough': return describeCough(data as CoughSymptom);
    case 'fever': return describeFever(data as FeverSymptom);
    case 'dyspnea': return describeDyspnea(data as DyspneaSymptom);
    case 'nausea_vomiting': return describeNauseaVomiting(data as NauseaVomitingSymptom);
    case 'diarrhea': return describeDiarrhea(data as DiarrheaSymptom);
    default: return describeGenericSymptom(symptomId, data);
  }
}

export function buildHPINarrative(state: EncounterState): string {
  const paragraphs: string[] = [];

  // Demographics & CC
  const demo = state.demographics;
  const cc = state.chiefComplaint;
  if (demo.name && cc.text) {
    const ageStr = demo.ageMonths < 12
      ? `${demo.ageMonths}-month-old`
      : `${Math.floor(demo.ageMonths / 12)}-year-old`;
    paragraphs.push(
      `${demo.name} is a ${ageStr} ${fmtSelect(demo.sex)} presenting with ${cc.text}`
      + (cc.duration ? ` of ${cc.duration} duration` : '')
      + '.'
    );
  }

  // Active symptoms
  const activeSymptomIds = Object.keys(state.symptoms) as SymptomId[];
  for (const symptomId of activeSymptomIds) {
    const data = state.symptoms[symptomId];
    if (data?.present) {
      paragraphs.push(describeSymptom(symptomId, data as Record<string, any>));
    }
  }

  // History
  const hx = state.history;
  if (hx.pmh.conditions.length > 0) {
    paragraphs.push(`Past medical history: ${hx.pmh.conditions.join(', ')}.`);
  }
  if (hx.medications.current.length > 0) {
    paragraphs.push(`Medications: ${hx.medications.current.map(m => `${m.name} ${m.dose}`).join(', ')}.`);
  }
  if (hx.medications.allergies.length > 0) {
    paragraphs.push(`Allergies: ${hx.medications.allergies.map(a => `${a.drug} (${a.reaction})`).join(', ')}.`);
  }

  // ROS summary
  const rosFilled: string[] = [];
  for (const [system, fields] of Object.entries(hx.ros)) {
    const positives = Object.entries(fields as Record<string, any>)
      .filter(([_, v]) => v === true)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());
    if (positives.length > 0) {
      rosFilled.push(`${system}: ${positives.join(', ')}`);
    }
  }
  if (rosFilled.length > 0) {
    paragraphs.push(`Review of systems positive for: ${rosFilled.join('; ')}.`);
  }

  return paragraphs.join('\n\n');
}
