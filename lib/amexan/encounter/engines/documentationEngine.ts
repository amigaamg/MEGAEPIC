// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Documentation Engine — Universal Clinical Note Generator
// ═══════════════════════════════════════════════════════════════════════════════
// Governed by the AMEXAN Documentation Constitution.
//
// Principle 1: Documentation is generated, not written.
// Principle 2: The note is a narrative, not a collection of fields.
// Principle 3: Natural medical English with linguistic variation.
// Principle 4: Chronology, not symptom-by-symptom.
// Principle 10: Never invents facts. "Not assessed" if unanswered.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterState, GeneratedNote, NoteSection, DocumentationState,
  SignatureInfo, Addendum, ManagementItem, MedicationCard, DispositionCard,
  DifferentialDiagnosisCard, ProvisionalDiagnosisCard, ProblemListItem,
} from '../encounterState';

export type NoteType = GeneratedNote['type'];
import type { SystemExaminations } from '../examination/systemExaminationTypes';
import { buildFullHPISection } from './hpiGenerator';
import { generateClinicalSummary, buildClinicalSummaryInput } from './clinicalSummaryEngine';
import { generateFullPhysicalExamination } from './systemNarrativeEngine';
import { generateGeneralExaminationNarrative } from './generalExaminationEngine';

// ── Linguistic helpers ───────────────────────────────────────────────────────

const TRANSITIONS = ['Additionally', 'Furthermore', 'In addition', 'Moreover'];
const CONTRASTS = ['However', 'Nevertheless', 'Notwithstanding'];
const SUMMARIES = ['Overall', 'In summary', 'On balance'];

function pick(index: number, pool: readonly string[]): string {
  return pool[index % pool.length];
}

function fmtSelect(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/_/g, ' ');
}

function capitalise(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function possessive(sex: string): string {
  return sex === 'female' ? 'her' : 'his';
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTATION STATE
// ═══════════════════════════════════════════════════════════════════════════════

export function createDocumentationState(): DocumentationState {
  return {
    currentNote: null,
    noteHistory: [],
    signature: null,
    signedAt: null,
    encounterLocked: false,
    addenda: [],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Patient Information
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePatientIdentification(state: EncounterState): string {
  const d = state.demographics;
  const ageStr = d.ageYears > 0
    ? `${d.ageYears} years`
    : d.ageMonths > 0
      ? `${d.ageMonths} months`
      : 'Not specified';

  return [
    `Name: ${d.name || 'Not provided'}`,
    `Age: ${ageStr}`,
    `Sex: ${d.sex || 'Not specified'}`,
    `MRN: ${d.mrn || 'Not assigned'}`,
    `Encounter ID: ${d.encounterId || state.id || 'Not assigned'}`,
    `Date of assessment: ${new Date(state.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })}`,
    `Department: ${d.departmentSlug ? d.departmentSlug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not specified'}`,
    `Informant: ${d.informant || 'Not documented'}${d.informantRelation ? ` (${d.informantRelation})` : ''}`,
    `Reliability of history: ${d.historyReliability === 'unknown' ? 'Not assessed' : d.historyReliability}`,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Chief Complaints
// ═══════════════════════════════════════════════════════════════════════════════

export function generateChiefComplaints(state: EncounterState): string {
  const cc = state.chiefComplaint;
  if (!cc.text) return 'Chief complaint not documented.';

  const ageStr = state.demographics.ageYears > 0
    ? `${state.demographics.ageYears}-year-old`
    : `${state.demographics.ageMonths}-month-old`;

  const sexLabel = state.demographics.sex === 'female' ? 'lady' : 'gentleman';
  const p = state.demographics.sex === 'female' ? 'She' : 'He';

  let result = `This ${ageStr} ${sexLabel} presented with ${cc.text}`;
  if (cc.duration) result += ` of ${cc.duration} duration`;
  result += '.';

  if (cc.severity && cc.severity > 0) {
    const severityLabels: Record<number, string> = { 1: 'very mild', 2: 'mild', 3: 'mild', 4: 'mild to moderate', 5: 'moderate', 6: 'moderate', 7: 'moderate to severe', 8: 'severe', 9: 'severe', 10: 'very severe' };
    result += ` ${p} rated the severity as ${severityLabels[cc.severity] || cc.severity}.`;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — History of Present Illness
// ═══════════════════════════════════════════════════════════════════════════════

export function generateHPISection(state: EncounterState): string {
  const hpi = buildFullHPISection(state);
  return hpi || 'History of present illness not documented.';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Past Medical History
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePastMedicalHistory(state: EncounterState): string {
  const pmh = state.history.pmh;
  const p = possessive(state.demographics.sex);

  const conditions: string[] = [];
  if (pmh.hypertension) conditions.push('hypertension');
  if (pmh.diabetes) conditions.push('diabetes mellitus');
  if (pmh.asthma) conditions.push('asthma');
  if (pmh.sickleCell) conditions.push('sickle cell disease');
  if (pmh.cardiacDisease) conditions.push('cardiac disease');
  if (pmh.immunodeficiency) conditions.push('immunodeficiency');
  if (pmh.hiv === 'positive') conditions.push('HIV positivity');
  if (pmh.hiv === 'negative') conditions.push('HIV negativity (tested)');
  if (pmh.tb === 'treated') conditions.push('tuberculosis (treated)');
  if (pmh.tb === 'current') conditions.push('tuberculosis (current treatment)');
  if (pmh.tb === 'none') conditions.push('no history of tuberculosis');
  conditions.push(...pmh.conditions);

  if (conditions.length > 0) {
    return `${capitalise(p)} past medical history includes ${conditions.join(', ')}.`;
  }

  if (pmh.admissions.length > 0) {
    return `There is no significant chronic medical illness. ${capitalise(p)} past admissions include ${pmh.admissions.join(', ')}.`;
  }

  return 'There is no significant past medical history.';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Past Surgical History
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePastSurgicalHistory(state: EncounterState): string {
  const surgeries = state.history.pmh.surgeries;

  if (surgeries.length === 0) return 'There is no history of previous surgical procedures.';

  return `Previous surgical history includes: ${surgeries.join(', ')}.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Drug History
// ═══════════════════════════════════════════════════════════════════════════════

export function generateDrugHistory(state: EncounterState): string {
  const meds = state.history.medications;
  const p = possessive(state.demographics.sex);
  const parts: string[] = [];

  if (meds.current.length > 0) {
    const medList = meds.current.map(m => {
      let s = `${m.name}`;
      if (m.dose) s += ` ${m.dose}`;
      if (m.route) s += ` ${m.route}`;
      if (m.frequency) s += ` ${m.frequency}`;
      if (m.indication) s += ` (${m.indication})`;
      return s;
    });
    parts.push(`${capitalise(p)} current medications include ${medList.join(', ')}.`);

    if (meds.anticoagulants) parts.push('The patient is taking anticoagulants.');
    if (meds.nsaids) parts.push(`${capitalise(p)} medication includes NSAIDs.`);
    if (meds.steroids) parts.push('The patient is on steroid therapy.');
  } else {
    parts.push('The patient is not on any regular medications.');
  }

  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — Allergy History
// ═══════════════════════════════════════════════════════════════════════════════

export function generateAllergyHistory(state: EncounterState): string {
  const meds = state.history.medications;

  if (meds.allergies.length === 0) {
    return 'No known drug allergies. There is no reported history of food, contrast, latex, or environmental allergies.';
  }

  const allergyList = meds.allergies.map(a =>
    `${a.drug} (${a.reaction}) — ${a.severity} severity`
  );

  return `Known allergies include: ${allergyList.join('; ')}.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8 — Family History
// ═══════════════════════════════════════════════════════════════════════════════

export function generateFamilyHistory(state: EncounterState): string {
  const fh = state.history.family;
  const conditions: string[] = [];

  if (fh.diabetes) conditions.push('diabetes mellitus');
  if (fh.hypertension) conditions.push('hypertension');
  if (fh.asthma) conditions.push('asthma');
  if (fh.tb) conditions.push('tuberculosis');
  if (fh.sickleCell) conditions.push('sickle cell disease');
  if (fh.cancer.length > 0) conditions.push(`cancer (${fh.cancer.join(', ')})`);
  if (fh.geneticDiseases.length > 0) conditions.push(`genetic conditions (${fh.geneticDiseases.join(', ')})`);
  if (fh.similarIllness) conditions.push('similar illness in family members');

  if (conditions.length > 0) {
    return `Family history is positive for ${conditions.join(', ')}.`;
  }

  return 'There is no significant family history of chronic or hereditary diseases.';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9 — Social History
// ═══════════════════════════════════════════════════════════════════════════════

export function generateSocialHistory(state: EncounterState): string {
  const soc = state.history.social;
  const p = possessive(state.demographics.sex);
  const parts: string[] = [];
  const facts: string[] = [];

  if (soc.occupation) facts.push(`${capitalise(p)} occupation is ${soc.occupation}`);
  if (soc.housingConditions) facts.push(`${capitalise(p)} housing conditions are ${fmtSelect(soc.housingConditions)}`);
  if (soc.waterSource) facts.push(`the water source is ${fmtSelect(soc.waterSource)}`);
  if (soc.sanitation) facts.push(`sanitation facilities are ${fmtSelect(soc.sanitation)}`);

  // Smoking
  if (soc.smoking === 'current') facts.push('the patient is a current smoker');
  else if (soc.smoking === 'former') facts.push('the patient is an ex-smoker');
  else if (soc.smoking === 'never') facts.push('there is no history of smoking');

  // Alcohol
  if (soc.alcohol && soc.alcohol !== 'none' && soc.alcohol !== 'never') {
    facts.push(`alcohol consumption is ${soc.alcohol}`);
  } else if (soc.alcohol === 'none' || soc.alcohol === 'never') {
    facts.push('there is no alcohol consumption');
  }

  if (soc.travelHistory?.length > 0) {
    facts.push(`recent travel history includes ${soc.travelHistory.join(', ')}`);
  }

  if (soc.exposureToTb) facts.push('there is a history of tuberculosis exposure');

  if (soc.schoolAttendance) facts.push(`school attendance: ${soc.schoolAttendance}`);

  if (facts.length === 0) {
    return 'Social history is unremarkable.';
  }

  // Build natural paragraph with grouping
  const sentenceGroups: string[] = [];

  // Group occupation/housing first
  const social = facts.filter(f => f.includes('occupation') || f.includes('housing') || f.includes('water') || f.includes('sanitation'));
  if (social.length > 0) {
    sentenceGroups.push(social.join('. ') + '.');
  }

  // Substance use
  const substances = facts.filter(f => f.includes('smok') || f.includes('alcohol'));
  if (substances.length > 0) {
    const subStr = substances.join(', and ');
    sentenceGroups.push(capitalise(subStr) + '.');
  }

  // Travel
  const travel = facts.filter(f => f.includes('travel'));
  if (travel.length > 0) sentenceGroups.push(capitalise(travel.join(', ')) + '.');

  // TB
  const tb = facts.filter(f => f.includes('TB') || f.includes('tuberculosis'));
  if (tb.length > 0) sentenceGroups.push(capitalise(tb.join(', ')) + '.');

  // Other
  const other = facts.filter(f => f.includes('school') || f.includes('support') || f.includes('insurance'));
  if (other.length > 0) sentenceGroups.push(capitalise(other.join(', ')) + '.');

  return sentenceGroups.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10 — Review of Systems
// ═══════════════════════════════════════════════════════════════════════════════

export function generateReviewOfSystems(state: EncounterState): string {
  const ros = state.history.ros;
  const sections: string[] = [];

  const ROS_MAP: Record<string, Record<string, string>> = {
    general: { fever: 'Fever', weightLoss: 'Weight loss', nightSweats: 'Night sweats', fatigue: 'Fatigue', appetite: 'Appetite change' },
    respiratory: { cough: 'Cough', dyspnea: 'Dyspnoea', wheeze: 'Wheeze', hemoptysis: 'Haemoptysis' },
    cardiovascular: { chestPain: 'Chest pain', palpitations: 'Palpitations', orthopnea: 'Orthopnoea', edema: 'Oedema' },
    gastrointestinal: { nausea: 'Nausea', vomiting: 'Vomiting', diarrhea: 'Diarrhoea', constipation: 'Constipation', dysphagia: 'Dysphagia', bleeding: 'GI bleeding', jaundice: 'Jaundice' },
    genitourinary: { dysuria: 'Dysuria', frequency: 'Urinary frequency', hematuria: 'Haematuria', discharge: 'Discharge', flankPain: 'Flank pain' },
    musculoskeletal: { jointPain: 'Joint pain', swelling: 'Joint swelling', weakness: 'Weakness', backPain: 'Back pain' },
    neurological: { headache: 'Headache', dizziness: 'Dizziness', seizures: 'Seizures', numbness: 'Numbness', visionChanges: 'Vision changes', tinnitus: 'Tinnitus' },
    endocrine: { heatCold: 'Heat/cold intolerance', tremor: 'Tremor', skinChanges: 'Skin changes', goitre: 'Goitre' },
    psychiatric: { depression: 'Depression', anxiety: 'Anxiety', sleepChanges: 'Sleep disturbance' },
  };

  for (const [system, fields] of Object.entries(ROS_MAP)) {
    const rosSystem = (ros as any)[system];
    if (!rosSystem) continue;

    const positive: string[] = [];
    const negative: string[] = [];
    const assessed: string[] = [];

    for (const [key, label] of Object.entries(fields)) {
      if (rosSystem[key] === true) {
        positive.push(label.toLowerCase());
        assessed.push(label.toLowerCase());
      } else if (rosSystem[key] === false) {
        negative.push(label.toLowerCase());
        assessed.push(label.toLowerCase());
      }
    }

    // Only include systems with assessed items
    if (assessed.length > 0) {
      const systemLabel = system.charAt(0).toUpperCase() + system.slice(1);
      if (positive.length > 0 && negative.length > 0) {
        sections.push(
          `${systemLabel}: Positive for ${positive.join(', ')}. Negative for ${negative.join(', ')}.`
        );
      } else if (positive.length > 0) {
        sections.push(`${systemLabel}: Positive for ${positive.join(', ')}.`);
      } else {
        sections.push(`${systemLabel}: No ${negative.join(', ')} reported.`);
      }
    }
  }

  // Check for unassessed systems
  const UNASSESSED = Object.keys(ROS_MAP).filter(sys => {
    const rosSystem = (ros as any)[sys];
    if (!rosSystem) return true;
    return Object.keys(ROS_MAP[sys]).every(key => rosSystem[key] === undefined);
  });

  if (sections.length === 0 && UNASSESSED.length > 0) {
    return 'Review of systems not documented.';
  }

  let result = sections.join(' ');

  // If some systems were assessed and others weren't, note it
  if (UNASSESSED.length > 0 && sections.length > 0) {
    const unassessedLabels = UNASSESSED.map(s => s.replace(/([A-Z])/g, ' $1').toLowerCase().trim());
    result += ` The following systems were not assessed: ${unassessedLabels.join(', ')}.`;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11 — Physical Examination
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePhysicalExamination(state: EncounterState): string {
  const exam = state.examination;
  const parts: string[] = [];

  // ── General Examination ───────────────────────────────────────────────
  const genExamNarrative = generateGeneralExaminationNarrative(exam.generalExamination);
  if (genExamNarrative) {
    parts.push(`General Examination:\n${genExamNarrative}`);
  }

  // ── Vital Signs ───────────────────────────────────────────────────────
  const v = exam.vitals;
  const vitalsItems: string[] = [];
  if (v.temp !== undefined) vitalsItems.push(`Temperature: ${v.temp}°C`);
  if (v.hr !== undefined) vitalsItems.push(`Heart rate: ${v.hr} bpm`);
  if (v.rr !== undefined) vitalsItems.push(`Respiratory rate: ${v.rr}/min`);
  if (v.bpSystolic !== undefined && v.bpDiastolic !== undefined)
    vitalsItems.push(`Blood pressure: ${v.bpSystolic}/${v.bpDiastolic} mmHg`);
  if (v.spo2 !== undefined) vitalsItems.push(`SpO₂: ${v.spo2}% on room air`);
  if (v.avpu) vitalsItems.push(`AVPU: ${v.avpu}`);
  if (v.bloodGlucose !== undefined) vitalsItems.push(`Blood glucose: ${v.bloodGlucose} mmol/L`);
  if (v.capRefill !== undefined) vitalsItems.push(`Capillary refill: ${v.capRefill}s`);
  if (v.weight !== undefined) vitalsItems.push(`Weight: ${v.weight} kg`);
  if (v.height !== undefined) vitalsItems.push(`Height: ${v.height} cm`);

  if (vitalsItems.length > 0) {
    parts.push(`Vital Signs:\n${vitalsItems.join(', ')}.`);
  }

  // ── Legacy Physical Exam (system-based) ───────────────────────────────
  const legacyLabels: Record<string, string> = {
    general: 'General',
    respiratory: 'Respiratory',
    cardiovascular: 'Cardiovascular',
    abdominal: 'Abdominal',
    neurological: 'Neurological',
    musculoskeletal: 'Musculoskeletal',
    skin: 'Skin',
    ent: 'ENT',
  };

  const legacyItems: string[] = [];
  for (const [key, label] of Object.entries(legacyLabels)) {
    const data = (exam.physical as any)[key];
    if (data && Object.keys(data).length > 0) {
      const findings = Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== '' && v !== false && v !== null)
        .map(([k, val]) => {
          if (typeof val === 'boolean') return k.replace(/([A-Z])/g, ' $1').toLowerCase();
          return `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${String(val).replace(/_/g, ' ')}`;
        });
      if (findings.length > 0) {
        legacyItems.push(`${label}: ${findings.join(', ')}.`);
      }
    }
  }
  if (legacyItems.length > 0) parts.push(legacyItems.join('\n'));

  // ── System Examinations (Volume IIB) ──────────────────────────────────
  const sysNarrative = generateFullPhysicalExamination(
    exam.systemExaminations,
    { ageYears: state.demographics.ageYears, ageMonths: state.demographics.ageMonths, sex: state.demographics.sex },
  );
  if (sysNarrative && sysNarrative !== 'No system examinations documented.') {
    parts.push(`System Examinations:\n${sysNarrative}`);
  }

  // ── Bedside Scores ────────────────────────────────────────────────────
  if (exam.scores.length > 0) {
    const scoreLines = exam.scores.map(s =>
      `${s.name}: ${s.totalPoints}/${s.maxPoints} (${s.riskCategory})`
    );
    parts.push(`Bedside Scores:\n${scoreLines.join('\n')}.`);
  }

  if (parts.length === 0) return 'Physical examination not documented.';

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12 — Clinical Summary
// ═══════════════════════════════════════════════════════════════════════════════

export function generateClinicalSummarySection(state: EncounterState): string {
  const csInput = buildClinicalSummaryInput(state);
  const summary = generateClinicalSummary(csInput);

  // If the clinical summary has been edited, use the edited version
  const csState = state.clinicalSummary;
  if (csState?.isEdited && csState?.edited) {
    return csState.edited;
  }

  return summary;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13 — Assessment (Provisional + Differential Diagnoses)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateAssessment(state: EncounterState): string {
  const assessment = state.assessment;
  const parts: string[] = [];

  // Provisional diagnosis
  const provisional = state.provisionalDiagnosis;
  if (provisional) {
    parts.push(`Provisional Diagnosis:\n${provisional.diagnosis}`);
    if (provisional.isPrimary) parts.push(`This is the primary diagnosis.`);
    if (provisional.severity) parts.push(`Severity: ${provisional.severity}.`);
    if (provisional.requiresUrgentAction) {
      parts.push(`Urgent action required: ${provisional.actionMessage || 'Immediate intervention needed.'}`);
    }
    if (provisional.clinicalReasoning) {
      parts.push(`Clinical reasoning: ${provisional.clinicalReasoning}`);
    }
  } else if (assessment.finalDiagnosis) {
    parts.push(`Primary diagnosis: ${assessment.finalDiagnosis}.`);
  }

  // Differential diagnoses
  const differentials = state.differentialDiagnoses;
  if (differentials.length > 0) {
    const sorted = [...differentials].sort((a, b) => a.rank - b.rank);
    const ddxParts: string[] = ['Differential diagnoses in order of likelihood:'];
    for (const ddx of sorted) {
      let line = `  ${ddx.rank}. ${ddx.diagnosis}`;
      if (ddx.certainty) line += ` (${ddx.certainty})`;
      if (ddx.icd10) line += ` [${ddx.icd10}]`;
      if (ddx.dangerLevel && ddx.mustNotMiss) line += ` — MUST NOT MISS (${ddx.dangerLevel} danger)`;
      ddxParts.push(line);
      if (ddx.supportingFindings.length > 0) {
        ddxParts.push(`     Supporting: ${ddx.supportingFindings.join(', ')}`);
      }
      if (ddx.contradictingFindings.length > 0) {
        ddxParts.push(`     Against: ${ddx.contradictingFindings.join(', ')}`);
      }
      if (ddx.clinicalReasoning) {
        ddxParts.push(`     Reasoning: ${ddx.clinicalReasoning}`);
      }
    }
    parts.push(ddxParts.join('\n'));
  }

  // Problem list
  const problemList = state.problemList;
  if (problemList.length > 0) {
    const sortedProblems = [...problemList].sort((a, b) => a.priority - b.priority);
    const probParts: string[] = ['Problem List:'];
    for (const prob of sortedProblems) {
      const status = prob.status === 'active' ? '' : ` (${prob.status})`;
      probParts.push(`  ${prob.priority}. [${prob.category}] ${prob.problem}${status}`);
      if (prob.icd10) probParts.push(`     ICD-10: ${prob.icd10}`);
    }
    parts.push(probParts.join('\n'));
  }

  // Red flags
  if (assessment.severity.redFlags.length > 0) {
    parts.push(`Red Flags:\n  ${assessment.severity.redFlags.join('\n  ')}`);
  }

  // Severity score
  const level = assessment.severity.level;
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  parts.push(`Clinical severity assessment: ${label}.`);

  if (parts.length === 0) return 'Assessment not documented.';

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14 — Investigations
// ═══════════════════════════════════════════════════════════════════════════════

export function generateInvestigations(state: EncounterState): string {
  const inv = state.investigations;
  const parts: string[] = [];

  if (inv.labs.length > 0) {
    const ordered = inv.labs.filter(l => l.status !== 'cancelled');
    if (ordered.length > 0) {
      parts.push('Laboratory investigations:');
      for (const lab of ordered) {
        const result = lab.result !== null
          ? `${lab.result} ${lab.unit || ''} (${lab.flag || 'resulted'})`
          : 'Pending';
        const refRange = lab.referenceRange ? ` [Ref: ${lab.referenceRange}]` : '';
        parts.push(`  • ${lab.testName}: ${result}${refRange}`);
        if (lab.interpretation) parts.push(`    ${lab.interpretation}`);
      }
    }
  }

  if (inv.imaging.length > 0) {
    parts.push('Imaging studies:');
    for (const img of inv.imaging) {
      const finding = img.finding || 'Pending';
      const impression = img.impression ? ` — ${img.impression}` : '';
      parts.push(`  • ${img.studyName}: ${finding}${impression}`);
    }
  }

  if (parts.length === 0) {
    return 'No investigations have been ordered.';
  }

  return parts.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15 — Management
// ═══════════════════════════════════════════════════════════════════════════════

export function generateManagement(state: EncounterState): string {
  const plan = state.plan;
  const managementItems = state.managementPlan;
  const medications = state.medications;
  const sections: string[] = [];

  // Admission decision
  const disp = state.disposition;
  if (disp) {
    const decisionLabels: Record<string, string> = {
      discharge: 'Discharge',
      admit_ward: 'Admission to ward',
      admit_hdu: 'Admission to High Dependency Unit',
      admit_icu: 'Admission to Intensive Care Unit',
      refer: 'Referral',
      transfer: 'Transfer',
      death_certification: 'Death certification',
      against_medical_advice: 'Discharge against medical advice',
    };
    sections.push(`Admission decision: ${decisionLabels[disp.type] || disp.type}.`);
    if (disp.reason) sections.push(`Reason: ${disp.reason}.`);
    if (disp.destination) sections.push(`Destination: ${disp.destination}.`);
    if (disp.followUpPlan) sections.push(`Follow-up plan: ${disp.followUpPlan}.`);
    if (disp.safetyNetting) sections.push(`Safety-netting advice: ${disp.safetyNetting}.`);
  } else if (plan.admissionDecision && plan.admissionDecision !== 'discharge') {
    sections.push(`Admission decision: ${plan.admissionDecision.replace(/_/g, ' ')}.`);
    if (plan.admissionReason) sections.push(`Reason: ${plan.admissionReason}.`);
    if (plan.followUp) sections.push(`Follow-up: ${plan.followUp}.`);
    if (plan.safetyNetting) sections.push(`Safety-netting: ${plan.safetyNetting}.`);
  }

  // ABCDE/FGH Management Items
  if (managementItems.length > 0) {
    const categoryLabels: Record<string, string> = {
      A: 'A — Airway & Breathing',
      B: 'B — Breathing Support',
      C: 'C — Circulation & Resuscitation',
      D: 'D — Disability & Neurological',
      E: 'E — Exposure & Environment',
      F: 'F — Fluids & Nutrition',
      G: 'G — Gastrointestinal & Genitourinary',
      H: 'H — Haematological & Homeostasis',
    };

    const grouped: Record<string, ManagementItem[]> = {};
    for (const item of managementItems) {
      const cat = item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }

    const catOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const planParts: string[] = ['Management Plan (ABCDE/FGH):'];
    for (const cat of catOrder) {
      const items = grouped[cat];
      if (items?.length) {
        planParts.push(`  ${categoryLabels[cat] || cat}:`);
        for (const item of items) {
          const prio = item.priority === 'stat' ? ' [STAT]' : item.priority === 'urgent' ? ' [Urgent]' : '';
          planParts.push(`    • ${item.description}${prio}`);
          if (item.detail) planParts.push(`      ${item.detail}`);
        }
      }
    }
    sections.push(planParts.join('\n'));
  }

  // Medications
  if (medications.length > 0) {
    const medParts: string[] = ['Medications:'];
    for (const med of medications) {
      if (med.status === 'draft' || med.status === 'discontinued') continue;
      let line = `  • ${med.genericName}`;
      if (med.brandName) line += ` (${med.brandName})`;
      const doseVal = med.calculatedDose ?? med.dose.value;
      line += ` ${doseVal}${med.dose.unit}`;
      if (med.route) line += ` ${med.route.toUpperCase()}`;
      if (med.frequency) line += ` ${med.frequency.toUpperCase()}`;
      if (med.durationDays) line += ` × ${med.durationDays} days`;
      if (med.indication) line += ` — ${med.indication}`;
      if (med.administrationInstructions) line += ` [${med.administrationInstructions}]`;
      if (!med.allergyCheckPassed || !med.interactionCheckPassed) {
        line += ' ⚠ CHECK REQUIRED';
      }
      medParts.push(line);
    }
    if (medParts.length > 1) sections.push(medParts.join('\n'));
  }

  // Legacy treatments
  if (plan.treatments.length > 0 && managementItems.length === 0) {
    const txParts: string[] = ['Treatment Plan:'];
    for (const t of plan.treatments) {
      txParts.push(`  • ${t.step}: ${t.detail}`);
      if (t.condition) txParts.push(`    (If: ${t.condition})`);
    }
    sections.push(txParts.join('\n'));
  }

  // Legacy medications (if new system not used)
  if (plan.medications.length > 0 && medications.length === 0) {
    const medParts: string[] = ['Medications:'];
    for (const m of plan.medications) {
      const indication = (m as any).indication || '';
      const items = [m.name, m.dose, m.route, m.frequency];
      if (m.duration) items.push(`× ${m.duration}`);
      if (indication) items.push(`— ${indication}`);
      medParts.push(`  • ${items.filter(Boolean).join(' ')}`);
    }
    sections.push(medParts.join('\n'));
  }

  // Monitoring
  if (plan.monitoring.length > 0) {
    sections.push(`Monitoring:\n  • ${plan.monitoring.join('\n  • ')}`);
  }

  // Education
  if (plan.patientEducation.length > 0) {
    sections.push(`Patient education:\n  • ${plan.patientEducation.join('\n  • ')}`);
  }

  if (sections.length > 0) {
    return sections.join('\n\n');
  }

  return 'Management plan not yet documented.';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16 — Disposition
// ═══════════════════════════════════════════════════════════════════════════════

export function generateDisposition(state: EncounterState): string {
  const disp = state.disposition;
  if (!disp) {
    // Fall back to plan data
    const plan = state.plan;
    if (plan.admissionDecision && plan.admissionDecision !== 'discharge') {
      return `The patient was admitted for further management. ${plan.admissionReason || ''}`;
    }
    return 'Disposition not documented.';
  }

  const typeLabels: Record<string, string> = {
    discharge: 'The patient was discharged home.',
    admit_ward: 'The patient was admitted to the ward.',
    admit_hdu: 'The patient was admitted to the High Dependency Unit.',
    admit_icu: 'The patient was admitted to the Intensive Care Unit.',
    refer: 'The patient was referred for further care.',
    transfer: 'The patient was transferred.',
    death_certification: 'Death certification was completed.',
    against_medical_advice: 'The patient left against medical advice.',
  };

  const parts: string[] = [typeLabels[disp.type] || `Disposition: ${disp.type}.`];
  if (disp.reason) parts.push(`Reason: ${disp.reason}.`);
  if (disp.destination) parts.push(`Transferred to ${disp.destination}.`);
  if (disp.followUpPlan) parts.push(`Follow-up: ${disp.followUpPlan}.`);
  if (disp.safetyNetting) parts.push(`Safety-netting: ${disp.safetyNetting}.`);
  if (disp.escortRequired) parts.push('Escort was provided.');
  if (disp.documentsPrepared.length > 0) {
    parts.push(`Documents prepared: ${disp.documentsPrepared.join(', ')}.`);
  }
  if (!disp.medicationReconciliationDone) parts.push('Medication reconciliation is pending.');
  if (!disp.nursingHandoverDone) parts.push('Nursing handover is pending.');

  return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL INITIAL ASSESSMENT — composed from all 16 sections
// ═══════════════════════════════════════════════════════════════════════════════

export function generateInitialAssessment(state: EncounterState): GeneratedNote {
  const sections: NoteSection[] = [];

  const sectionGenerators: [string, () => string, () => boolean][] = [
    ['Patient Information', () => generatePatientIdentification(state), () => !state.demographics.name],
    ['Chief Complaint(s)', () => generateChiefComplaints(state), () => !state.chiefComplaint.text],
    ['History of Present Illness', () => generateHPISection(state), () => false],
    ['Past Medical History', () => generatePastMedicalHistory(state), () => false],
    ['Past Surgical History', () => generatePastSurgicalHistory(state), () => false],
    ['Drug History', () => generateDrugHistory(state), () => false],
    ['Allergy History', () => generateAllergyHistory(state), () => false],
    ['Family History', () => generateFamilyHistory(state), () => false],
    ['Social History', () => generateSocialHistory(state), () => false],
    ['Review of Systems', () => generateReviewOfSystems(state), () => false],
    ['Physical Examination', () => generatePhysicalExamination(state), () => false],
    ['Clinical Summary', () => generateClinicalSummarySection(state), () => false],
    ['Assessment', () => generateAssessment(state), () => false],
    ['Investigations', () => generateInvestigations(state), () => false],
    ['Management Plan', () => generateManagement(state), () => false],
    ['Disposition', () => generateDisposition(state), () => false],
  ];

  for (const [heading, generator, isEmptyCheck] of sectionGenerators) {
    const body = generator();
    sections.push({
      heading,
      body,
      isEmpty: isEmptyCheck(),
    });
  }

  const content = sections
    .filter(s => !s.isEmpty)
    .map(s => `## ${s.heading}\n\n${s.body}`)
    .join('\n\n---\n\n');

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const noteHistory = state.documentation?.noteHistory || [];

  return {
    title: `Initial Assessment — ${state.demographics.name || 'Unnamed Patient'}`,
    type: 'initial_assessment',
    content,
    sections,
    generatedAt: Date.now(),
    wordCount,
    version: noteHistory.length + 1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS NOTE (SOAP)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateProgressNote(state: EncounterState): GeneratedNote {
  const sections: NoteSection[] = [];

  sections.push({
    heading: 'Subjective',
    body: generateHPISection(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Objective',
    body: generatePhysicalExamination(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Assessment',
    body: generateAssessment(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Plan',
    body: `${generateManagement(state)}\n\n${generateDisposition(state)}`,
    isEmpty: false,
  });

  const content = sections.map(s => `## ${s.heading}\n\n${s.body}`).join('\n\n');
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    title: `Progress Note — ${state.demographics.name || 'Unnamed Patient'}`,
    type: 'progress_note',
    content,
    sections,
    generatedAt: Date.now(),
    wordCount,
    version: 1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERRAL LETTER
// ═══════════════════════════════════════════════════════════════════════════════

export function generateReferralLetter(state: EncounterState): GeneratedNote {
  const d = state.demographics;
  const sections: NoteSection[] = [];

  sections.push({
    heading: 'Referral Details',
    body: [
      `Patient: ${d.name || 'Not specified'}`,
      `Age: ${d.ageYears > 0 ? d.ageYears + ' years' : d.ageMonths + ' months'}`,
      `Sex: ${d.sex}`,
      `MRN: ${d.mrn || 'Not assigned'}`,
      `Department: ${d.departmentSlug || 'Not specified'}`,
      `Date of referral: ${new Date().toLocaleDateString('en-GB')}`,
    ].join('\n'),
    isEmpty: false,
  });

  sections.push({
    heading: 'Clinical Summary',
    body: generateClinicalSummarySection(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Reason for Referral',
    body: state.disposition?.reason || 'Please see patient for further evaluation and management.',
    isEmpty: false,
  });

  sections.push({
    heading: 'Investigations',
    body: generateInvestigations(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Current Medications',
    body: generateDrugHistory(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Allergies',
    body: generateAllergyHistory(state),
    isEmpty: false,
  });

  const content = sections.map(s => `## ${s.heading}\n\n${s.body}`).join('\n\n');
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    title: `Referral Letter — ${d.name || 'Unnamed Patient'}`,
    type: 'referral_letter',
    content,
    sections,
    generatedAt: Date.now(),
    wordCount,
    version: 1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISCHARGE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

export function generateDischargeSummary(state: EncounterState): GeneratedNote {
  const d = state.demographics;
  const sections: NoteSection[] = [];

  sections.push({
    heading: 'Patient Information',
    body: generatePatientIdentification(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Admission Date',
    body: new Date(state.createdAt).toLocaleDateString('en-GB'),
    isEmpty: false,
  });

  sections.push({
    heading: 'Discharge Date',
    body: new Date().toLocaleDateString('en-GB'),
    isEmpty: false,
  });

  sections.push({
    heading: 'Diagnosis at Discharge',
    body: state.assessment.finalDiagnosis || state.provisionalDiagnosis?.diagnosis || 'Not documented',
    isEmpty: false,
  });

  sections.push({
    heading: 'Summary of Admission',
    body: generateClinicalSummarySection(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Investigations and Procedures',
    body: generateInvestigations(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Medications on Discharge',
    body: generateDrugHistory(state),
    isEmpty: false,
  });

  sections.push({
    heading: 'Follow-up Plan',
    body: state.plan.followUp || state.disposition?.followUpPlan || 'Follow-up plan not documented.',
    isEmpty: false,
  });

  sections.push({
    heading: 'Safety-netting Advice',
    body: state.plan.safetyNetting || state.disposition?.safetyNetting || 'Not documented.',
    isEmpty: false,
  });

  sections.push({
    heading: 'Discharge Disposition',
    body: generateDisposition(state),
    isEmpty: false,
  });

  const content = sections.map(s => `## ${s.heading}\n\n${s.body}`).join('\n\n');
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    title: `Discharge Summary — ${d.name || 'Unnamed Patient'}`,
    type: 'discharge_summary',
    content,
    sections,
    generatedAt: Date.now(),
    wordCount,
    version: 1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE DOCUMENTATION UPDATE (Constitutional Principle 11)
// ═══════════════════════════════════════════════════════════════════════════════

export function regenerateDocumentation(
  state: EncounterState,
  noteType: GeneratedNote['type'] = 'initial_assessment',
): GeneratedNote {
  switch (noteType) {
    case 'progress_note':
      return generateProgressNote(state);
    case 'referral_letter':
      return generateReferralLetter(state);
    case 'discharge_summary':
      return generateDischargeSummary(state);
    default:
      return generateInitialAssessment(state);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF-COMPATIBLE HTML GENERATION (Constitutional Principle 16)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateHTML(
  state: EncounterState,
  note?: GeneratedNote,
): string {
  const currentNote = note || state.documentation?.currentNote || generateInitialAssessment(state);
  const d = state.demographics;
  const doc = state.documentation;

  const sectionHtml = currentNote.sections
    .filter(s => !s.isEmpty)
    .map(s => {
      const bodyEscaped = s.body
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      return `
    <div class="section">
      <h2>${s.heading}</h2>
      <div class="body">${bodyEscaped}</div>
    </div>`;
    }).join('');

  const signatureHtml = doc?.signature ? `
    <div class="signature">
      <p><strong>Electronically signed by:</strong> ${doc.signature.signedBy}</p>
      <p><strong>Role:</strong> ${doc.signature.role}</p>
      <p><strong>UID:</strong> ${doc.signature.uid}</p>
      <p><strong>Date:</strong> ${new Date(doc.signature.signedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })}</p>
    </div>` : '';

  const addendaHtml = doc?.addenda?.length ? `
    <div class="addenda">
      <h2>Addenda</h2>
      ${doc.addenda.map(a => `
        <div class="addendum">
          <p><strong>${a.addedBy}</strong> — ${new Date(a.addedAt).toLocaleDateString('en-GB')}</p>
          <p>${a.content}</p>
          <p class="reason">Reason: ${a.reason}</p>
        </div>
      `).join('')}
    </div>` : '';

  const footerMeta = [
    `Document ID: ${state.id || 'Not assigned'}`,
    `Version: ${currentNote.version}`,
    `Generated: ${new Date(currentNote.generatedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })}`,
  ].join(' | ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${currentNote.title}</title>
  <style>
    @page { margin: 18mm 22mm; }
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; line-height: 1.55; color: #1a1a1a; max-width: 210mm; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 25px; border-bottom: 2.5px solid #1a1a1a; padding-bottom: 12px; }
    .header h1 { font-size: 16pt; margin: 0 0 4px 0; letter-spacing: 0.5px; }
    .header .institution { font-size: 10pt; color: #555; margin: 2px 0; }
    .header .meta { font-size: 9pt; color: #666; margin: 1px 0; }
    .section { margin-bottom: 14px; page-break-inside: avoid; }
    .section h2 { font-size: 12pt; border-bottom: 1px solid #bbb; padding-bottom: 3px; margin: 12px 0 6px 0; color: #111; }
    .section .body { padding-left: 3px; font-size: 11pt; }
    .section .body br { margin-bottom: 2px; }
    .signature { margin-top: 30px; padding: 15px; border: 1px solid #ccc; background: #fafafa; page-break-inside: avoid; }
    .signature p { margin: 3px 0; font-size: 10pt; }
    .addenda { margin-top: 25px; border-top: 2px dashed #999; padding-top: 10px; }
    .addendum { margin-bottom: 12px; padding: 8px; background: #fcfcfc; border-left: 3px solid #ccc; }
    .addendum .reason { font-style: italic; color: #888; font-size: 9pt; }
    .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 8px; font-size: 8pt; text-align: center; color: #888; }
    .footer p { margin: 2px 0; }
    @media print {
      body { padding: 0; font-size: 10.5pt; }
      .section { page-break-inside: avoid; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${currentNote.title}</h1>
    <div class="institution">AMEXAN Clinical Documentation System</div>
    <div class="meta">${d.name || 'Unnamed'} | ${d.ageYears > 0 ? d.ageYears + ' years' : d.ageMonths > 0 ? d.ageMonths + ' months' : 'Age N/S'} | ${d.sex || 'Sex N/S'} | MRN: ${d.mrn || 'N/A'}</div>
  </div>

  ${sectionHtml}

  ${signatureHtml}
  ${addendaHtml}

  <div class="footer">
    <p>${footerMeta}</p>
    ${doc?.encounterLocked ? '<p>This document is electronically signed and legally binding. Any subsequent amendments are recorded as addenda.</p>' : '<p>This document is a draft and has not been electronically signed.</p>'}
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGN ENCOUNTER (electronic signature + immutability)
// ═══════════════════════════════════════════════════════════════════════════════

export function signEncounter(
  state: EncounterState,
  signedBy: string,
  role: string,
  uid: string,
): { state: EncounterState; note: GeneratedNote } {
  const note = generateInitialAssessment(state);
  const now = Date.now();

  const signature: SignatureInfo = {
    signedBy,
    signedAt: now,
    role,
    uid,
    isElectronicSignature: true,
  };

  return {
    state: {
      ...state,
      documentation: {
        currentNote: note,
        noteHistory: state.documentation?.noteHistory
          ? [...state.documentation.noteHistory, note]
          : [note],
        signature,
        signedAt: now,
        encounterLocked: true,
        addenda: state.documentation?.addenda || [],
      },
    },
    note,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD ADDENDUM (post-signature corrections, Constitutional Principle 15)
// ═══════════════════════════════════════════════════════════════════════════════

export function addAddendum(
  documentation: DocumentationState,
  addedBy: string,
  content: string,
  reason: string,
): DocumentationState {
  const addendum: Addendum = {
    id: `add_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    addedBy,
    addedAt: Date.now(),
    content,
    reason,
  };

  return {
    ...documentation,
    addenda: [...documentation.addenda, addendum],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE UPDATE — regenerates note, preserves edit layer (Constitutional Principle 14)
// ═══════════════════════════════════════════════════════════════════════════════

export function updateDocumentation(
  state: EncounterState,
  noteType: GeneratedNote['type'] = 'initial_assessment',
): GeneratedNote {
  const note = regenerateDocumentation(state, noteType);

  // Preserve the current note in history if one exists
  if (state.documentation?.currentNote) {
    const updatedState = {
      ...state,
      documentation: {
        ...state.documentation,
        currentNote: note,
        noteHistory: [...state.documentation.noteHistory, state.documentation.currentNote],
      },
    };
    // Return the note; the caller updates state
    return note;
  }

  return note;
}
