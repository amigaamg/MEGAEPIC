// ─────────────────────────────────────────────────────────────────
// AMEXAN Consultant-Grade Narrative Engine
// Generates natural, flowing, physician-quality examination reports
// from structured evidence objects — not template-based
// ─────────────────────────────────────────────────────────────────

import type { EvidenceObject } from './evidence-object';

export interface NarrativeSection {
  system: string;
  systemLabel: string;
  findings: EvidenceObject[];
  narrative: string;
  abnormal: boolean;
}

export interface FullNarrativeReport {
  sections: NarrativeSection[];
  summary: string;
  impression: string;
  recommendations: string[];
}

// ─────────────────────────────────────────────────────────────────
// SECTION BUILDERS
// ─────────────────────────────────────────────────────────────────

function buildRespiratoryNarrative(findings: EvidenceObject[]): string {
  const abnormal = findings.filter(f => f.severity !== 'none' && f.severity !== 'mild');
  if (abnormal.length === 0) {
    return 'On respiratory examination, the chest is symmetrical with normal chest wall movement. Percussion note is resonant throughout both lung fields. Breath sounds are vesicular with no added sounds. Vocal resonance is normal.';
  }
  const parts: string[] = [];
  const expansion = findings.find(f => f.findingId.includes('expansion') || f.findingId.includes('inspection'));
  if (expansion && expansion.displayValue !== 'normal') parts.push(`There is ${expansion.displayValue} chest expansion on the affected side.`);
  const trachea = findings.find(f => f.findingId.includes('trachea'));
  if (trachea && trachea.displayValue !== 'central') parts.push(`The trachea is deviated to the ${trachea.displayValue}.`);
  const percussion = findings.find(f => f.findingId.includes('perc'));
  if (percussion && percussion.displayValue !== 'resonant') parts.push(`Percussion note is ${percussion.displayValue} over the affected area.`);
  const breathSounds = findings.find(f => f.findingId.includes('breath_sounds'));
  if (breathSounds && breathSounds.displayValue !== 'vesicular') parts.push(`Breath sounds are ${breathSounds.displayValue} in the affected region.`);
  const added = findings.filter(f => f.findingId.includes('wheeze') || f.findingId.includes('crackles') || f.findingId.includes('rub'));
  if (added.length > 0) {
    const desc = added.map(a => `${a.displayValue} ${a.findingLabel.toLowerCase()}`).join(', ');
    parts.push(`On auscultation, ${desc} are heard.`);
  }
  const vocal = findings.find(f => f.findingId.includes('vocal') || f.findingId.includes('bronchophony'));
  if (vocal && vocal.displayValue !== 'normal') parts.push(`Vocal resonance is ${vocal.displayValue}.`);
  return parts.length > 0 ? parts.join(' ') : 'Respiratory examination reveals abnormal findings as documented.';
}

function buildCardiovascularNarrative(findings: EvidenceObject[]): string {
  const abnormal = findings.filter(f => f.severity !== 'none' && f.severity !== 'mild');
  if (abnormal.length === 0) {
    return 'On cardiovascular examination, the pulse is regular with normal volume and character. Blood pressure is within normal limits. The apex beat is normally positioned and the heart sounds are normal with no added sounds or murmurs. JVP is not elevated. There is no peripheral oedema.';
  }
  const parts: string[] = [];
  const pulse = findings.find(f => f.findingId.includes('pulse'));
  if (pulse) parts.push(`The pulse is ${pulse.displayValue}.`);
  const bp = findings.find(f => f.findingId.includes('bp') || f.findingId.includes('blood_pressure'));
  if (bp) parts.push(`Blood pressure is ${bp.displayValue}.`);
  const jvp = findings.find(f => f.findingId.includes('jvp'));
  if (jvp && jvp.displayValue !== 'normal' && jvp.displayValue !== 'not_elevated') parts.push(`JVP is ${jvp.displayValue}.`);
  const apex = findings.find(f => f.findingId.includes('apex'));
  if (apex && apex.displayValue !== 'normal' && apex.displayValue !== 'not_displaced') parts.push(`The apex beat is ${apex.displayValue}.`);
  const heartSounds = findings.find(f => f.findingId.includes('heart_sounds') || f.findingId.includes('s1') || f.findingId.includes('s2'));
  if (heartSounds && heartSounds.displayValue !== 'normal' && heartSounds.displayValue !== 's1_s2_heard') parts.push(`Heart sounds: ${heartSounds.displayValue}.`);
  const murmurs = findings.filter(f => f.findingId.includes('murmur') || f.findingId.includes('added_sound'));
  if (murmurs.length > 0) parts.push(`A ${murmurs.map(m => m.displayValue).join(', ')} is auscultated.`);
  const oedema = findings.find(f => f.findingId.includes('oedema'));
  if (oedema && oedema.displayValue !== 'none') parts.push(`There is ${oedema.displayValue} peripheral oedema.`);
  return parts.length > 0 ? parts.join(' ') : 'Cardiovascular examination findings as documented.';
}

function buildAbdominalNarrative(findings: EvidenceObject[]): string {
  const abnormal = findings.filter(f => f.severity !== 'none' && f.severity !== 'mild');
  if (abnormal.length === 0) {
    return 'On abdominal examination, the abdomen is flat and symmetrical with no visible masses or scars. There is no tenderness or guarding on palpation. The liver and spleen are not palpable. Bowel sounds are normal.';
  }
  const parts: string[] = [];
  const inspection = findings.filter(f => f.findingId.includes('insp') || f.findingId.includes('shape') || f.findingId.includes('distension'));
  if (inspection.length > 0) {
    const inspPhrases = inspection.map(f => f.displayValue).join(', ');
    parts.push(`The abdomen is ${inspPhrases}.`);
  }
  const tenderness = findings.find(f => f.findingId.includes('tenderness'));
  if (tenderness && tenderness.displayValue !== 'none') parts.push(`There is ${tenderness.displayValue} abdominal tenderness.`);
  const guarding = findings.find(f => f.findingId.includes('guarding'));
  if (guarding && guarding.displayValue !== 'none') parts.push(`Guarding is ${guarding.displayValue}.`);
  const mass = findings.find(f => f.findingId.includes('mass'));
  if (mass && mass.displayValue !== 'none') parts.push(`A mass is palpable in the ${mass.displayValue}.`);
  const organomegaly = findings.filter(f => f.findingId.includes('liver') || f.findingId.includes('spleen') || f.findingId.includes('kidney') || f.findingId.includes('hepatomegaly') || f.findingId.includes('splenomegaly'));
  if (organomegaly.length > 0) parts.push(`${organomegaly.map(f => f.displayValue).join(', ')}.`);
  const bowelSounds = findings.find(f => f.findingId.includes('bowel_sounds'));
  if (bowelSounds && bowelSounds.displayValue !== 'normal') parts.push(`Bowel sounds are ${bowelSounds.displayValue}.`);
  return parts.length > 0 ? parts.join(' ') : 'Abdominal examination findings as documented.';
}

function buildNeurologicalNarrative(findings: EvidenceObject[]): string {
  const abnormal = findings.filter(f => f.severity !== 'none' && f.severity !== 'mild');
  if (abnormal.length === 0) {
    return 'On neurological examination, the patient is alert and orientated. Cranial nerves are intact. Motor power is normal in all four limbs. Sensation is intact to light touch throughout. Reflexes are symmetrical and plantar responses are flexor. Coordination and gait are normal.';
  }
  const parts: string[] = [];
  const consciousness = findings.find(f => f.findingId.includes('consciousness') || f.findingId.includes('gcs') || f.findingId.includes('avpu'));
  if (consciousness) parts.push(`The patient is ${consciousness.displayValue}.`);
  const pupils = findings.filter(f => f.findingId.includes('pupil'));
  if (pupils.length > 0) parts.push(`Pupils: ${pupils.map(p => p.displayValue).join(', ')}.`);
  const motor = findings.filter(f => f.findingId.includes('power') || f.findingId.includes('motor'));
  if (motor.length > 0) parts.push(`Motor power: ${motor.map(m => m.displayValue).join(', ')}.`);
  const reflexes = findings.filter(f => f.findingId.includes('reflex'));
  if (reflexes.length > 0) parts.push(`Reflexes: ${reflexes.map(r => r.displayValue).join(', ')}.`);
  const sensory = findings.filter(f => f.findingId.includes('sensory') || f.findingId.includes('sensation'));
  if (sensory.length > 0) parts.push(`Sensation: ${sensory.map(s => s.displayValue).join(', ')}.`);
  const speech = findings.find(f => f.findingId.includes('speech') || f.findingId.includes('language'));
  if (speech) parts.push(`Speech: ${speech.displayValue}.`);
  return parts.length > 0 ? parts.join(' ') : 'Neurological examination findings as documented.';
}

function buildBreastNarrative(findings: EvidenceObject[]): string {
  const abnormal = findings.filter(f => f.severity !== 'none' && f.severity !== 'mild');
  if (abnormal.length === 0) {
    return 'On breast examination, the breasts are symmetrical with no visible skin changes, masses or nipple abnormalities. On palpation, both breasts are soft with no focal tenderness or palpable masses. There is no nipple discharge. Axillary, supraclavicular and infraclavicular lymph nodes are not enlarged.';
  }
  const parts: string[] = [];
  const symmetry = findings.find(f => f.findingId.includes('symmetry'));
  if (symmetry && symmetry.displayValue !== 'normal') parts.push(`The breasts are ${symmetry.displayValue}.`);
  const skin = findings.find(f => f.findingId.includes('skin'));
  if (skin && skin.displayValue !== 'normal') parts.push(`Skin changes: ${skin.displayValue}.`);
  const nipple = findings.find(f => f.findingId.includes('nipple') && !f.findingId.includes('discharge'));
  if (nipple && nipple.displayValue !== 'normal') parts.push(`The nipple is ${nipple.displayValue}.`);
  const mass = findings.find(f => f.findingId.includes('mass'));
  if (mass && mass.displayValue !== 'none' && mass.displayValue !== 'no mass') {
    const site = findings.find(f => f.findingId === 'breast_mass_site');
    const quadrant = findings.find(f => f.findingId === 'breast_mass_quadrant');
    const size = findings.find(f => f.findingId === 'breast_mass_size');
    const consistency = findings.find(f => f.findingId === 'breast_mass_consistency');
    const margins = findings.find(f => f.findingId === 'breast_mass_margins');
    const mobility = findings.find(f => f.findingId === 'breast_mass_mobility');

    let massDesc = 'A mass is palpable';
    if (site) massDesc += ` in the ${site.displayValue} breast`;
    if (quadrant) massDesc += `, ${quadrant.displayValue}`;
    if (size) massDesc += `, measuring approximately ${size.displayValue} cm`;
    if (consistency) massDesc += `. It is ${consistency.displayValue} in consistency`;
    if (margins) massDesc += ` with ${margins.displayValue}`;
    if (mobility) massDesc += ` and is ${mobility.displayValue}`;
    parts.push(`${massDesc}.`);
  }
  const axillary = findings.find(f => f.findingId.includes('axillary_nodes'));
  if (axillary && axillary.displayValue !== 'not palpable') {
    parts.push(`Axillary lymph nodes are ${axillary.displayValue}.`);
  }
  const discharge = findings.find(f => f.findingId.includes('discharge'));
  if (discharge && discharge.displayValue !== 'none') parts.push(`Nipple discharge is ${discharge.displayValue}.`);
  return parts.length > 0 ? parts.join(' ') : 'Breast examination findings as documented.';
}

const SYSTEM_NARRATIVES: Record<string, (findings: EvidenceObject[]) => string> = {
  respiratory: buildRespiratoryNarrative,
  cardiovascular: buildCardiovascularNarrative,
  abdominal: buildAbdominalNarrative,
  neurological: buildNeurologicalNarrative,
  breast: buildBreastNarrative,
};

// ─────────────────────────────────────────────────────────────────
// MASTER NARRATIVE GENERATOR
// ─────────────────────────────────────────────────────────────────

export function generateConsultantNarrative(
  evidenceBySystem: Record<string, EvidenceObject[]>,
): FullNarrativeReport {
  const sections: NarrativeSection[] = [];
  const systemOrder = ['general', 'respiratory', 'cardiovascular', 'abdominal', 'neurological', 'breast'];
  const systemLabels: Record<string, string> = {
    general: 'General Examination', vitals: 'Vital Signs',
    respiratory: 'Respiratory System', cardiovascular: 'Cardiovascular System',
    abdominal: 'Abdominal Examination', neurological: 'Neurological Examination',
    breast: 'Breast Examination',
  };

  for (const sys of systemOrder) {
    const findings = evidenceBySystem[sys];
    if (!findings || findings.length === 0) continue;
    const builder = SYSTEM_NARRATIVES[sys];
    const narrative = builder ? builder(findings) : `${systemLabels[sys] || sys} examination performed.`;
    const abnormal = findings.some(f => f.severity === 'moderate' || f.severity === 'severe' || f.severity === 'critical');
    sections.push({ system: sys, systemLabel: systemLabels[sys] || sys, findings, narrative, abnormal });
  }

  const abnormalSystems = sections.filter(s => s.abnormal).map(s => s.systemLabel);
  const summary = abnormalSystems.length === 0
    ? 'No significant abnormality detected on systemic examination.'
    : `Abnormal findings noted on examination of: ${abnormalSystems.join(', ')}.`;

  const impression = abnormalSystems.length === 0
    ? 'Examination unremarkable.'
    : `Clinically significant findings present in ${abnormalSystems.length} system(s).`;

  const recommendations: string[] = [];
  for (const sec of sections) {
    for (const f of sec.findings) {
      if (f.requiresFollowUp) recommendations.push(`Follow up ${f.findingLabel} — currently ${f.displayValue} (${f.severity}).`);
      if (f.isCritical) recommendations.push(`URGENT: ${f.findingLabel} requires immediate attention.`);
    }
  }

  return { sections, summary, impression, recommendations };
}
