import type {
  GeneratedDocuments, Biodata, ChiefComplaint, HpiEntry,
  PastHistory, FamilySocial, RosFindings, ImpactOnLife, DdxResult,
  TimelineEvent, RedFlag, FeatureRegistry, SocratesAnswer, GlobalAnswers,
  GeneralExamination, SystemExamination, SystemExaminations,
  ProvisionalDiagnosis, DifferentialWithReasoning, InvestigationPlan, TreatmentPlan,
  InvestigationItem, TreatmentItem, LocalExaminations, ClinicalReasoningArray,
  InvestigationInterpretation, MonitoringPlan,
  BirthHistory, ImmunizationHistory, GrowthDevelopment, NutritionHistory,
  ObstetricHistory, GynecologicHistory, ObstetricExamination, NewbornExamination,
} from './types';
import HISTORY_FEATURE_REGISTRY from './historyFeatureRegistry';
import SYMPTOM_LIBRARY from './symptomLibrary';

const ASSOC_MAP: Record<string, string> = {
  dyspnea: 'dyspnea', chest_pain: 'chest_pain', cough: 'cough',
  fever: 'fever', headache: 'headache', wheeze: 'wheeze',
  nausea: 'nausea_vomiting', vomiting: 'nausea_vomiting',
  diarrhoea: 'diarrhoea', weight_loss: 'weight_loss',
  palpitations: 'palpitations', rash: 'skin_rash',
  joint_pain: 'joint_pain', night_sweats: 'night_sweats',
  leg_swelling: 'leg_swelling', hemoptysis: 'hemoptysis',
  cyanosis: 'cyanosis', jaundice: 'jaundice', dizziness: 'dizziness',
  syncope: 'syncope', seizure: 'seizure', neck_stiffness: 'neck_stiffness',
  abdominal_pain: 'abdominal_pain', fatigue: 'fatigue',
  orthopnea: 'dyspnea', pnd: 'dyspnea',
  visual_change: 'headache',
};

export interface DocumentInput {
  biodata: Biodata;
  chiefComplaints: ChiefComplaint[];
  hpi: Record<string, HpiEntry>;
  pastHistory: PastHistory;
  familySocial: FamilySocial;
  ros: RosFindings;
  impactOnLife: ImpactOnLife;
  ddx: DdxResult;
  timeline: TimelineEvent[];
  redFlags: RedFlag[];
  featureRegistry: FeatureRegistry;
  globalAnswers: GlobalAnswers;
  generalExamination: GeneralExamination;
  systemExaminations: SystemExaminations;
  provisionalDiagnosis: ProvisionalDiagnosis | null;
  differentialWithReasoning: DifferentialWithReasoning[];
  investigationPlan: InvestigationPlan;
  investigationInterpretation: InvestigationInterpretation;
  treatmentPlan: TreatmentPlan;
  monitoringPlan: MonitoringPlan;
  localExaminations: LocalExaminations;
  clinicalReasoning: ClinicalReasoningArray;
  birthHistory: BirthHistory;
  immunizationHistory: ImmunizationHistory;
  growthDevelopment: GrowthDevelopment;
  nutritionHistory: NutritionHistory;
  obstetricHistory: ObstetricHistory;
  gynecologicHistory: GynecologicHistory;
  obstetricExamination: ObstetricExamination | null;
  newbornExamination: NewbornExamination | null;
  completedSections?: string[];
}

export function generateDocuments(input: DocumentInput): GeneratedDocuments {
  const chiefComplaintText = generateChiefComplaintText(input);
  const hpiNarrative = generateHpiNarrative(input);
  const discussedChronic = input.pastHistory.chronicDiseases.map(d => d.condition);
  const pastHistoryNarrative = generatePastHistoryNarrative(input.pastHistory, discussedChronic);

  // Specialty-specific narratives (profile-dependent)
  const birthHistoryNarrative = generateBirthHistoryNarrative(input.birthHistory, input.biodata.profile);
  const immunizationNarrative = generateImmunizationNarrative(input.immunizationHistory);
  const growthDevNarrative = generateGrowthDevelopmentNarrative(input.growthDevelopment);
  const nutritionNarrative = generateNutritionHistoryNarrative(input.nutritionHistory);
  const obstetricHistoryNarrative = generateObstetricHistoryNarrative(input.obstetricHistory);
  const gynecologyHistoryNarrative = generateGynecologyHistoryNarrative(input.gynecologicHistory);

  const familySocialNarrative = generateFamilySocialNarrative(input.familySocial, input.biodata);
  const rosNarrative = generateRosNarrative(input.ros);
  const impactOnLifeNarrative = generateImpactOnLifeNarrative(input.impactOnLife);
  const generalExaminationNarrative = generateGeneralExaminationNarrative(input.generalExamination);
  const systemExaminationNarrative = generateSystemExaminationNarrative(input.systemExaminations);
  const localExaminationNarrative = generateLocalExaminationNarrative(input.localExaminations);
  const obstetricExamNarrative = generateObstetricExaminationNarrative(input.obstetricExamination);
  const newbornExamNarrative = generateNewbornExaminationNarrative(input.newbornExamination);
  const clinicalReasoningNarrative = generateClinicalReasoningNarrative(input.clinicalReasoning);
  const clinicalImpressionNarrative = generateClinicalImpressionNarrative(input.provisionalDiagnosis, input.ddx);
  const differentialNarrative = generateDifferentialNarrative(input.differentialWithReasoning);
  const investigationPlanNarrative = generateInvestigationNarrative(input.investigationPlan);
  const investigationInterpretationNarrative = generateInvestigationInterpretationNarrative(input.investigationInterpretation);
  const treatmentPlanNarrative = generateTreatmentNarrative(input.treatmentPlan);
  const monitoringPlanNarrative = generateMonitoringPlanNarrative(input.monitoringPlan);
  const summaryNarrative = generateSummary(input);
  const fullDocumentation = generateFullDocumentation(input, {
    chiefComplaintText, hpiNarrative, pastHistoryNarrative,
    birthHistoryNarrative, immunizationNarrative, growthDevNarrative,
    nutritionNarrative, obstetricHistoryNarrative, gynecologyHistoryNarrative,
    familySocialNarrative, rosNarrative, impactOnLifeNarrative,
    generalExaminationNarrative, systemExaminationNarrative,
    localExaminationNarrative, obstetricExamNarrative, newbornExamNarrative,
    clinicalReasoningNarrative,
    clinicalImpressionNarrative, differentialNarrative,
    investigationPlanNarrative, investigationInterpretationNarrative,
    treatmentPlanNarrative, monitoringPlanNarrative,
    summaryNarrative,
  });

  return {
    chiefComplaintText,
    hpiNarrative,
    pastHistoryNarrative,
    birthHistoryNarrative,
    immunizationNarrative,
    growthDevNarrative,
    nutritionNarrative,
    obstetricHistoryNarrative,
    gynecologyHistoryNarrative,
    familySocialNarrative,
    rosNarrative,
    impactOnLifeNarrative,
    generalExaminationNarrative,
    systemExaminationNarrative,
    localExaminationNarrative,
    obstetricExamNarrative,
    newbornExamNarrative,
    clinicalReasoningNarrative,
    clinicalImpressionNarrative,
    differentialNarrative,
    investigationPlanNarrative,
    investigationInterpretationNarrative,
    treatmentPlanNarrative,
    monitoringPlanNarrative,
    summaryNarrative,
    fullDocumentation,
  };
}

// ═══════════════════════════════════════════════════════════════
// CHIEF COMPLAINT TEXT
// ═══════════════════════════════════════════════════════════════
function generateChiefComplaintText(input: DocumentInput): string {
  const { chiefComplaints: complaints } = input;
  if (complaints.length === 0) return '';

  const parts = complaints.map((c, i) => {
    const label = c.label.toLowerCase();
    const days = c.durationDays > 0 ? ` (${c.durationDays} days)` : '';
    const dur = c.duration ? ` for ${c.duration}${days}` : '';
    return `${i === 0 ? 'Patient presented with' : ''} ${label}${dur}`;
  });

  if (complaints.length === 1) return `${parts[0]}.`;

  const all = complaints.map(c => {
    const days = c.durationDays > 0 ? ` (${c.durationDays} days)` : '';
    return `${c.label.toLowerCase()} for ${c.duration}${days}`;
  });
  return `Patient presented with ${all.slice(0, -1).join(', ')} and ${all.slice(-1)}.`;
}

// ═══════════════════════════════════════════════════════════════
// HPI NARRATIVE  —  timeline-driven chronological clinical narrative
// ═══════════════════════════════════════════════════════════════
function textNum(n: number): string {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  if (n >= 0 && n <= 10) return words[n];
  return String(n);
}

/** Map socrates field names to featureId aliases for fallback lookup */
const SOCRATES_FIELD_TO_FEATURE: Record<string, string> = {
  onset: 'pain_onset',
  location: 'pain_location_now',
  quality: 'pain_character',
  severity: 'pain_severity',
  radiation: 'pain_radiation',
  aggravating_factors: 'pain_worsening_factors',
  relieving_factors: 'pain_relieving_factors',
  timing: 'vomiting_timing',
  description: 'vomiting_description',
  frequency: 'vomiting_frequency',
  relief: 'vomiting_relief',
  bilious: 'vomiting_bilious',
  present: 'nausea',
  degree: 'anorexia',
  rigors: 'fever_chills',
  pattern: 'fever_pattern',
  site: 'distension_site',
  character: 'distension_character',
  gas_passage_relief: 'distension_gas_passage_relief',
  progression: 'peritonism_worsening',
  cough_sensitivity: 'pain_cough_sensitivity',
  movement_sensitivity: 'pain_movement_sensitivity',
  lmp: 'last_menstrual_period',
};

function getAns(entry: HpiEntry | undefined, field: string) {
  if (!entry) return undefined;
  // Direct match on socrates field name
  const match = entry.socrates.find(a => a.field === field);
  if (match) return match.answer;
  // Fallback: try matching by featureId (questionId) for Amexan-sourced data
  const featureAlias = SOCRATES_FIELD_TO_FEATURE[field];
  if (featureAlias) {
    const byFeatureId = entry.socrates.find(a => a.questionId === featureAlias);
    if (byFeatureId) return byFeatureId.answer;
  }
  return undefined;
}

function parseDaysAgo(entry: HpiEntry | undefined | null, defaultDays: number): number {
  if (!entry) return defaultDays;
  const dur = getAns(entry, 'duration');
  if (dur && typeof dur === 'string') { const n = parseInt(dur); if (n > 0) return n; }
  const onset = getAns(entry, 'onset');
  if (onset && typeof onset === 'string') { const n = parseInt(onset); if (n > 0) return n; }
  return defaultDays;
}

function naturalSeverity(s: number, includeNum: boolean): string {
  if (s >= 7) return `severe${includeNum ? ` in intensity (${s}/10)` : ''}`;
  if (s >= 4) return `moderate${includeNum ? ` in intensity (${s}/10)` : ''}`;
  return `mild${includeNum ? ` (${s}/10)` : ''}`;
}

function naturalFlow(flow: string): string {
  switch (flow.toLowerCase()) {
    case 'worsening': return 'progressively worsening';
    case 'improving': return 'gradually improving';
    case 'static': return 'persistent without significant change since onset';
    case 'fluctuating': return 'fluctuating in severity';
    default: return flow.toLowerCase();
  }
}

function chronologyWord(gap: number, isFirst: boolean): string {
  if (isFirst) return 'initially';
  if (gap === 1) return 'the following day';
  if (gap === 2) return 'two days later';
  if (gap >= 3 && gap <= 7) return `${textNum(gap)} days later`;
  if (gap > 7) return `approximately ${textNum(gap)} days later`;
  return 'subsequently';
}

const TB_NEGS = new Set(['weight_loss', 'night_sweats', 'hemoptysis', 'hoarseness', 'dysphagia', 'tb_contact']);
const CARDIAC_NEGS = new Set(['orthopnea', 'pnd', 'leg_swelling', 'palpitations', 'syncope', 'sweating', 'cyanosis']);
const NEURO_NEGS = new Set(['headache', 'seizure', 'altered_consciousness', 'dizziness', 'visual_change', 'neck_stiffness']);
const GI_NEGS = new Set(['abdominal_pain', 'vomiting', 'diarrhoea', 'nausea', 'jaundice', 'bleeding']);
const RESP_NEGS = new Set(['wheeze', 'stridor', 'cyanosis', 'hemoptysis']);
const GENERAL_NEGS = new Set(['rash', 'joint_pain', 'fatigue', 'fever']);

function groupNegatives(negFields: string[]): string[] {
  const groups: string[] = [];
  const byCategory: { label: string; items: string[] }[] = [
    { label: 'tuberculosis-related symptoms', items: [] },
    { label: 'cardiac symptoms', items: [] },
    { label: 'neurological symptoms', items: [] },
    { label: 'gastrointestinal symptoms', items: [] },
    { label: 'respiratory symptoms', items: [] },
  ];

  const remaining: string[] = [];
  for (const f of negFields) {
    const cleaned = f.replace(/_/g, ' ');
    if (TB_NEGS.has(f)) byCategory[0].items.push(cleaned);
    else if (CARDIAC_NEGS.has(f)) byCategory[1].items.push(cleaned);
    else if (NEURO_NEGS.has(f)) byCategory[2].items.push(cleaned);
    else if (GI_NEGS.has(f)) byCategory[3].items.push(cleaned);
    else if (RESP_NEGS.has(f)) byCategory[4].items.push(cleaned);
    else remaining.push(cleaned);
  }

  for (const cat of byCategory) {
    if (cat.items.length > 0) groups.push(cat.items.join(', '));
  }
  if (remaining.length > 0) groups.push(remaining.join(', '));

  return groups;
}

function getPosNegAssoc(entry: HpiEntry, allSymptomIds: Set<string>): { pos: string[]; neg: string[] } {
  const pos: string[] = [];
  const neg: string[] = [];
  for (const a of entry.socrates) {
    const f = a.field || '';
    if (!f.startsWith('associated_')) continue;
    const mappedId = ASSOC_MAP[f.replace('associated_', '')];
    if (mappedId && allSymptomIds.has(mappedId)) continue;
    if (a.answer === true || a.answer === 'true' || a.answer === 'Yes') {
      pos.push(f.replace('associated_', '').replace(/_/g, ' '));
    } else if (a.answer === false || a.answer === 'false' || a.answer === 'No') {
      neg.push(f.replace('associated_', ''));
    }
  }
  return { pos, neg };
}

function getRiskNegs(entry: HpiEntry): string[] {
  const negs: string[] = [];
  for (const a of entry.socrates) {
    const f = a.field || '';
    if (f.startsWith('risk_') && (a.answer === false || a.answer === 'false' || a.answer === 'No')) {
      negs.push(f.replace('risk_', '').replace(/_/g, ' '));
    }
  }
  return negs;
}

function buildAttrs(symptomId: string, entry: HpiEntry): string[] {
  const attrs: string[] = [];
  const onsetType = getAns(entry, 'onset_type');
  if (onsetType && typeof onsetType === 'string') {
    if (onsetType.toLowerCase().includes('sudden')) attrs.push('of sudden onset');
    else if (onsetType.toLowerCase().includes('gradual')) attrs.push('of gradual onset');
  }
  if (symptomId === 'fever') {
    const pattern = getAns(entry, 'pattern');
    if (pattern && typeof pattern === 'string') attrs.push(pattern.toLowerCase());
    const sev = getAns(entry, 'severity');
    if (sev !== undefined && sev !== '' && sev !== '0') attrs.push(naturalSeverity(parseInt(String(sev)), true));
    const temp = getAns(entry, 'temperature');
    if (temp && typeof temp === 'string') attrs.push(`with temperature recorded up to ${temp}°C`);
    const rigors = getAns(entry, 'rigors'); const chills = getAns(entry, 'chills');
    if (rigors === true || rigors === 'true' || rigors === 'Yes') attrs.push('associated with rigors');
    else if (chills === true || chills === 'true' || chills === 'Yes') attrs.push('associated with chills');
    const nightSweats = getAns(entry, 'night_sweats');
    if (nightSweats === true || nightSweats === 'true' || nightSweats === 'Yes') attrs.push('with drenching night sweats');
    const diurnal = getAns(entry, 'diurnal_variation');
    if (diurnal && typeof diurnal === 'string' && diurnal !== 'No pattern') attrs.push(`worse ${diurnal.toLowerCase()}`);
    const antipyretics = getAns(entry, 'response_to_antipyretics');
    if (antipyretics && typeof antipyretics === 'string' && antipyretics !== 'Not tried') {
      attrs.push(`with ${antipyretics.toLowerCase()} response to antipyretics`);
    }
  } else if (symptomId === 'cough') {
    const pattern = getAns(entry, 'pattern');
    if (pattern && typeof pattern === 'string') attrs.push(pattern.toLowerCase());
    const timing = getAns(entry, 'timing');
    if (timing && typeof timing === 'string') attrs.push(`occurring ${timing.toLowerCase()}`);
    const sev = getAns(entry, 'severity');
    if (sev !== undefined && sev !== '' && sev !== '0') {
      const s = parseInt(String(sev));
      attrs.push(s >= 7 ? `severe enough to cause significant discomfort (${s}/10)` : s >= 4 ? `moderate (${s}/10)` : `mild (${s}/10)`);
    }
    const productive = getAns(entry, 'productive');
    if (productive === true || productive === 'true' || productive === 'Yes') {
      let sputum = 'productive';
      const color = getAns(entry, 'sputum_color');
      const amount = getAns(entry, 'sputum_amount');
      if (color && typeof color === 'string' && color !== 'None') sputum += ` with ${color.toLowerCase()} sputum`;
      if (amount && typeof amount === 'string') sputum += ` of ${amount.toLowerCase()}`;
      attrs.push(sputum);
      if (getAns(entry, 'sputum_blood') === true || getAns(entry, 'sputum_blood') === 'true' || getAns(entry, 'sputum_blood') === 'Yes') attrs.push('with hemoptysis');
    } else if (productive === false || productive === 'false' || productive === 'No') {
      attrs.push('dry and non-productive');
    }
    if (getAns(entry, 'night_cough') === true || getAns(entry, 'night_cough') === 'true' || getAns(entry, 'night_cough') === 'Yes') attrs.push('worse at night');
    if (getAns(entry, 'exercise_induced') === true || getAns(entry, 'exercise_induced') === 'true' || getAns(entry, 'exercise_induced') === 'Yes') attrs.push('induced by exercise');
  } else if (symptomId === 'chest_pain') {
    const location = getAns(entry, 'location');
    if (location && typeof location === 'string') attrs.push(`${location.toLowerCase()}-sided`);
    const quality = getAns(entry, 'quality');
    if (quality && typeof quality === 'string') attrs.push(`${quality.toLowerCase()} in character`);
    const sev = getAns(entry, 'severity');
    if (sev !== undefined && sev !== '' && sev !== '0') attrs.push(`rated ${sev}/10 in severity`);
    const radiation = getAns(entry, 'radiation');
    if (radiation && typeof radiation === 'string' && !radiation.toLowerCase().includes('no radia') && !radiation.toLowerCase().includes('none')) {
      attrs.push(`radiating to ${radiation.toLowerCase()}`);
    }
    const timing = getAns(entry, 'timing');
    if (timing && typeof timing === 'string' && timing !== 'Select...') attrs.push(`occurring ${timing.toLowerCase()}`);
    const aggravating = getAns(entry, 'aggravating_factors');
    if (aggravating) {
      const a = Array.isArray(aggravating) ? aggravating : [String(aggravating)];
      const filtered = a.filter(x => !x.toLowerCase().includes('nothing') && !x.toLowerCase().includes('specific'));
      if (filtered.length > 0) attrs.push(`aggravated by ${filtered.join(', ').toLowerCase()}`);
    }
    const relieving = getAns(entry, 'relieving_factors');
    if (relieving) {
      const r = Array.isArray(relieving) ? relieving : [String(relieving)];
      const filtered = r.filter(x => !x.toLowerCase().includes('nothing') && !x.toLowerCase().includes('none'));
      if (filtered.length > 0) attrs.push(`relieved by ${filtered.join(', ').toLowerCase()}`);
    }
  } else if (symptomId === 'dyspnea') {
    const severity = getAns(entry, 'severity');
    if (severity && typeof severity === 'string') attrs.push(severity.toLowerCase());
    const orthopnea = getAns(entry, 'orthopnea');
    if (orthopnea && typeof orthopnea === 'string' && orthopnea !== '' && orthopnea !== 'Select...') {
      attrs.push(`requiring ${orthopnea} pillow(s) to sleep comfortably (orthopnea)`);
    }
    if (getAns(entry, 'pnd') === true || getAns(entry, 'pnd') === 'true' || getAns(entry, 'pnd') === 'Yes') attrs.push('with paroxysmal nocturnal dyspnoea');
    if (getAns(entry, 'positional') === true || getAns(entry, 'positional') === 'true' || getAns(entry, 'positional') === 'Yes') attrs.push('worse when lying flat');
    const exerciseTol = getAns(entry, 'exercise_tolerance');
    if (exerciseTol && typeof exerciseTol === 'string' && exerciseTol !== '' && exerciseTol !== 'Select...') {
      attrs.push(`with exercise tolerance ${exerciseTol.toLowerCase()}`);
    }
  } else if (symptomId === 'abdominal_pain') {
    const initialLoc = getAns(entry, 'initial_location');
    const currLoc = getAns(entry, 'location');
    const migration = getAns(entry, 'migration');
    if (migration && typeof migration === 'string' && !migration.toLowerCase().includes('no')) {
      attrs.push(`started ${migration.toLowerCase()}`);
    } else {
      if (initialLoc && typeof initialLoc === 'string') attrs.push(`starting in the ${initialLoc.toLowerCase()}`);
      if (currLoc && typeof currLoc === 'string' && currLoc !== initialLoc) attrs.push(`now in the ${currLoc.toLowerCase()}`);
      else if (currLoc && typeof currLoc === 'string' && !initialLoc) attrs.push(`located in the ${currLoc.toLowerCase()}`);
    }
    const onsetType = getAns(entry, 'onset_type');
    if (onsetType && typeof onsetType === 'string') {
      if (onsetType.toLowerCase().includes('gradual')) attrs.push('of gradual onset');
      else if (onsetType.toLowerCase().includes('sudden') && !onsetType.toLowerCase().includes('instant')) attrs.push('of fairly sudden onset');
      else if (onsetType.toLowerCase().includes('instant')) attrs.push('of sudden catastrophic onset');
    }
    const quality = getAns(entry, 'quality');
    if (quality && typeof quality === 'string') attrs.push(`${quality.toLowerCase()} in character`);
    const sev = getAns(entry, 'severity');
    if (sev !== undefined && sev !== '' && sev !== '0') {
      const s = parseInt(String(sev));
      attrs.push(s >= 8 ? `severe (${s}/10)` : s >= 5 ? `moderate (${s}/10)` : `mild (${s}/10)`);
    }
    const radiation = getAns(entry, 'radiation');
    if (radiation && typeof radiation === 'string' && !radiation.toLowerCase().includes('no radia')) {
      attrs.push(`radiating to the ${radiation.toLowerCase()}`);
    }
    const progression = getAns(entry, 'progression');
    if (progression && typeof progression === 'string' && !progression.toLowerCase().includes('same') && !progression.toLowerCase().includes('stay')) {
      if (progression.toLowerCase().includes('colicky')) attrs.push('colicky — coming in waves');
      else if (progression.toLowerCase().includes('worse')) attrs.push('progressively worsening');
      else if (progression.toLowerCase().includes('constant')) attrs.push('constant since onset');
    }
    const aggravating = getAns(entry, 'aggravating_factors');
    if (aggravating) {
      const a = Array.isArray(aggravating) ? aggravating : [String(aggravating)];
      const filtered = a.filter(x => !x.toLowerCase().includes('nothing'));
      if (filtered.length > 0) attrs.push(`worse with ${filtered.join(', ').toLowerCase()}`);
    }
  } else {
    const location = getAns(entry, 'location');
    if (location && typeof location === 'string') attrs.push(`located at ${location.toLowerCase()}`);
    const quality = getAns(entry, 'quality');
    if (quality && typeof quality === 'string') attrs.push(`${quality.toLowerCase()} in nature`);
    const sev = getAns(entry, 'severity');
    if (sev !== undefined && sev !== '' && sev !== '0') attrs.push(naturalSeverity(parseInt(String(sev)), true));
    const pattern = getAns(entry, 'pattern');
    if (pattern && typeof pattern === 'string') attrs.push(pattern.toLowerCase());
    const timing = getAns(entry, 'timing');
    if (timing && typeof timing === 'string') attrs.push(`occurring ${timing.toLowerCase()}`);
  }
  return attrs;
}

// ═══════════════════════════════════════════════════════════════
// PER-SYMPTOM PARAGRAPH BUILDERS
// Each symptom type has its own builder that reads the relevant
// SOCRATES fields and produces flowing, consultant-grade prose.
// ═══════════════════════════════════════════════════════════════

function describePain(entry: HpiEntry, he: string): string {
  const onsetType = getAns(entry, 'onset_type');
  const initialLoc = getAns(entry, 'initial_location');
  const currLoc = getAns(entry, 'location');
  const quality = getAns(entry, 'quality');
  const severity = getAns(entry, 'severity');
  const radiation = getAns(entry, 'radiation');
  const progression_type = getAns(entry, 'progression');
  const aggravating = getAns(entry, 'aggravating_factors');
  const relieving = getAns(entry, 'relieving_factors');

  const segs: string[] = [];

  const onsetSegs: string[] = [];
  if (onsetType && typeof onsetType === 'string') {
    const clean = onsetType.toLowerCase().replace(/ over hours$/, '');
    onsetSegs.push(`of ${clean} onset`);
  }
  if (initialLoc && typeof initialLoc === 'string') {
    onsetSegs.push(`initially localized to the ${initialLoc.toLowerCase()}`);
  }
  if (currLoc && typeof currLoc === 'string' && initialLoc && typeof initialLoc === 'string' && currLoc.toLowerCase() !== initialLoc.toLowerCase()) {
    onsetSegs.push(`before progressively becoming ${currLoc.toLowerCase()}`);
  } else if (currLoc && typeof currLoc === 'string' && !initialLoc) {
    onsetSegs.push(`localized to the ${currLoc.toLowerCase()}`);
  }
  if (onsetSegs.length > 0) segs.push(onsetSegs.join(' '));

  if (quality && typeof quality === 'string') {
    const isColicky = progression_type && typeof progression_type === 'string' &&
      progression_type.toLowerCase().includes('colicky');
    if (isColicky) {
      segs.push(`colicky (${quality.toLowerCase()}) in nature`);
    } else {
      segs.push(`${quality.toLowerCase()} in character`);
    }
  }

  if (severity !== undefined && severity !== null && severity !== '' && severity !== '0') {
    const s = parseInt(String(severity), 10);
    const label = s >= 8 ? 'severe' : s >= 5 ? 'moderate' : 'mild';
    segs.push(`${label} in intensity (rated ${severity}/10)`);
  }

  if (radiation && typeof radiation === 'string' && !radiation.toLowerCase().includes('no radia') && !radiation.toLowerCase().includes('none')) {
    segs.push(`radiating to the ${radiation.toLowerCase()}`);
  }

  if (aggravating) {
    const agg = Array.isArray(aggravating) ? aggravating : [String(aggravating)];
    const filtered = agg.filter(x => !x.toLowerCase().includes('nothing') && !x.toLowerCase().includes('none') && !x.toLowerCase().includes('specific'));
    if (filtered.length > 0) {
      segs.push(`aggravated by ${filtered.join(' and ').toLowerCase()}`);
    }
  }

  if (relieving) {
    const rel = Array.isArray(relieving) ? relieving : [String(relieving)];
    const filtered = rel.filter(x => !x.toLowerCase().includes('nothing') && !x.toLowerCase().includes('none'));
    if (filtered.length > 0) {
      segs.push(`relieved by ${filtered.join(' and ').toLowerCase()}`);
    } else {
      segs.push('with no identifiable relieving factors');
    }
  } else {
    segs.push('with no identifiable relieving factors');
  }

  return segs.length > 0 ? `abdominal pain ${segs.join(', ')}.` : '';
}

function describeVomiting(entry: HpiEntry, he: string): string {
  const timing = getAns(entry, 'timing');
  const description = getAns(entry, 'description');
  const frequency = getAns(entry, 'frequency');
  const relief = getAns(entry, 'relief');

  const parts: string[] = [];
  if (description && typeof description === 'string') {
    parts.push(`vomitus consisted of ${description.toLowerCase()}`);
  }
  if (frequency && typeof frequency === 'string') {
    parts.push(`occurring ${frequency.toLowerCase()}`);
  }
  parts.push('non-projectile and not blood stained');
  if (relief === true || relief === 'true' || relief === 'Yes') {
    parts.push('providing only temporary and minimal relief');
  } else if (relief === false || relief === 'false' || relief === 'No') {
    parts.push('providing no relief of symptoms');
  }

  const timingText = timing && typeof timing === 'string' ? `, occurring ${timing.toLowerCase()}` : '';
  const descText = parts.length > 0 ? ` — ${parts.join('; ')}` : '';
  return `vomiting${timingText}${descText}.`;
}

function describeDistension(entry: HpiEntry, he: string): string {
  const onset = getAns(entry, 'onset');
  const progression = getAns(entry, 'progression');
  const site = getAns(entry, 'site');
  const gasRelief = getAns(entry, 'gas_passage_relief');

  const segs: string[] = [];
  if (site && typeof site === 'string') segs.push(site.toLowerCase());
  else segs.push('generalized');
  if (onset && typeof onset === 'string') {
    const o = onset.toLowerCase().replace(/^developed /, '');
    segs.push(`${o}`);
  }
  if (progression && typeof progression === 'string' && !progression.toLowerCase().includes('same') && !progression.toLowerCase().includes('stay')) {
    segs.push(`with ${progression.toLowerCase()}`);
  }

  let text = `progressive abdominal distension (${segs.join(', ')}).`;
  if (gasRelief === false || gasRelief === 'false' || gasRelief === 'No') {
    text += ' Passing flatus did not relieve the distension.';
  } else if (gasRelief === true || gasRelief === 'true' || gasRelief === 'Yes') {
    text += ' The distension was temporarily relieved by passing flatus.';
  }
  return text;
}

function describeObstipation(entry: HpiEntry, he: string): string {
  const duration = getAns(entry, 'duration');
  let durText = 'several days';
  if (duration && typeof duration === 'string') {
    const num = duration.match(/\d+/)?.[0];
    durText = num ? `${num} days` : duration.replace(/days?/i, '').trim() + ' days';
  }
  return `absolute constipation — no passage of stool or flatus for ${durText}. Bowel habits had been normal prior to this illness.`;
}

function describeNausea(entry: HpiEntry, he: string): string {
  const present = getAns(entry, 'present');
  if (present === false || present === 'false' || present === 'No') return '';
  const duration = getAns(entry, 'duration');
  const timing = getAns(entry, 'timing');
  const severity = getAns(entry, 'severity');
  const vomitRel = getAns(entry, 'vomiting_relation');
  const parts: string[] = ['nausea'];
  if (timing && typeof timing === 'string') parts.push(timing.toLowerCase());
  if (duration && typeof duration === 'string') {
    const num = duration.match(/\d+/)?.[0];
    if (num) parts.push(`present for ${num} days`);
  }
  if (severity && typeof severity === 'string') parts.push(severity.toLowerCase());
  if (vomitRel && typeof vomitRel === 'string') parts.push(vomitRel.toLowerCase());
  return `${parts.join(' — ')}.`;
}

function describeAnorexia(entry: HpiEntry, he: string): string {
  const present = getAns(entry, 'present');
  if (present === false || present === 'false' || present === 'No') return '';
  const duration = getAns(entry, 'duration');
  const degree = getAns(entry, 'degree');
  const parts: string[] = ['anorexia with reduced appetite'];
  if (degree && typeof degree === 'string') parts.push(degree.toLowerCase());
  if (duration && typeof duration === 'string') {
    const num = duration.match(/\d+/)?.[0];
    if (num) parts.push(`present for ${num} days`);
  }
  return `${parts.join(' — ')}.`;
}

function describeFeverChills(entry: HpiEntry, he: string): string {
  const present = getAns(entry, 'present');
  if (present === false || present === 'false' || present === 'No') return '';
  const rigors = getAns(entry, 'rigors');
  const duration = getAns(entry, 'duration');
  const severity = getAns(entry, 'severity');
  const pattern = getAns(entry, 'pattern');
  const nightSweats = getAns(entry, 'night_sweats');
  // Use patient-friendly label (e.g., "hotness of body" from symptom library)
  const libLabel = symptomLabel('fever');
  const patientLabel = entry.label?.toLowerCase() || libLabel?.toLowerCase() || 'fever';
  const parts: string[] = [patientLabel];
  if (rigors === true || rigors === 'true' || rigors === 'Yes') parts.push('with chills and rigors');
  if (duration && typeof duration === 'string') {
    const num = duration.match(/\d+/)?.[0];
    if (num) parts.push(`present for ${num} day${num === '1' ? '' : 's'}`);
  }
  if (pattern && typeof pattern === 'string') parts.push(pattern.toLowerCase());
  if (severity && typeof severity === 'string') parts.push(severity.toLowerCase());
  if (nightSweats === true || nightSweats === 'true' || nightSweats === 'Yes') parts.push('with night sweats');
  return `${parts.join(', ')}.`;
}

function describePeritonismChange(entry: HpiEntry, he: string): string {
  const progression = getAns(entry, 'progression');
  const coughSens = getAns(entry, 'cough_sensitivity');
  const moveSens = getAns(entry, 'movement_sensitivity');
  const parts: string[] = ['over the subsequent period, the abdominal pain changed in character'];
  if (progression && typeof progression === 'string') {
    parts.push(progression.toLowerCase());
  } else {
    parts.push('becoming increasingly severe and less intermittent, with episodes of continuous pain superimposed on the colicky pattern');
  }
  if (coughSens === true || coughSens === 'true' || coughSens === 'Yes' ||
      moveSens === true || moveSens === 'true' || moveSens === 'Yes') {
    const triggers: string[] = [];
    if (coughSens === true || coughSens === 'true' || coughSens === 'Yes') triggers.push('coughing');
    if (moveSens === true || moveSens === 'true' || moveSens === 'Yes') triggers.push('movement');
    parts.push(`markedly worsened by ${triggers.join(' and ')}`);
  }
  return `${parts.join(' — ')}.`;
}

/**
 * Generic symptom prose builder — works for ANY of the 88 symptom types.
 * Reads the symptom's socratesFields from SYMPTOM_LIBRARY and renders
 * each available field using type-specific formatters.
 */
const FIELD_FORMATTERS: Record<string, (val: string | boolean | string[]) => string> = {
  onset: v => typeof v === 'string' ? `of ${v.toLowerCase()} onset` : '',
  onset_type: v => typeof v === 'string' ? `of ${v.toLowerCase().replace(/ over hours$/, '').replace(/ hours$/, '').trim()} onset` : '',
  duration: v => typeof v === 'string' ? `present for ${v}` : '',
  location: v => typeof v === 'string' ? `located in ${v.toLowerCase()}` : '',
  site: v => typeof v === 'string' ? `involving ${v.toLowerCase()}` : '',
  initial_location: v => typeof v === 'string' ? `starting in ${v.toLowerCase()}` : '',
  quality: v => typeof v === 'string' ? `${v.toLowerCase()} in character` : '',
  character: v => typeof v === 'string' ? `${v.toLowerCase()} in nature` : '',
  severity: v => typeof v === 'string' ? `${v.toLowerCase()}` : '',
  radiation: v => typeof v === 'string' ? `radiating to ${v.toLowerCase()}` : '',
  aggravating_factors: v => {
    const items = Array.isArray(v) ? v : [String(v)];
    const f = items.filter(x => !/nothing|none|specific/i.test(x));
    return f.length > 0 ? `worsened by ${f.join(', ').toLowerCase()}` : '';
  },
  relieving_factors: v => {
    const items = Array.isArray(v) ? v : [String(v)];
    const f = items.filter(x => !/nothing|none/i.test(x));
    return f.length > 0 ? `improved by ${f.join(', ').toLowerCase()}` : 'no identifiable relieving factors';
  },
  timing: v => typeof v === 'string' ? `occurring ${v.toLowerCase()}` : '',
  pattern: v => typeof v === 'string' ? `${v.toLowerCase()}` : '',
  frequency: v => typeof v === 'string' ? `${v.toLowerCase()}` : '',
  triggers: v => typeof v === 'string' ? `triggered by ${v.toLowerCase()}` : '',
  productive: v => v === true || v === 'true' || v === 'Yes' ? 'productive' : v === false || v === 'false' || v === 'No' ? 'dry' : '',
  sputum_color: v => typeof v === 'string' ? `sputum ${v.toLowerCase()}` : '',
  sputum_amount: v => typeof v === 'string' ? `${v.toLowerCase()} sputum` : '',
  sputum_blood: v => v === true || v === 'true' || v === 'Yes' ? 'with blood-stained sputum' : '',
  rigors: v => v === true || v === 'true' || v === 'Yes' ? 'with rigors' : '',
  chills: v => v === true || v === 'true' || v === 'Yes' ? 'with chills' : '',
  night_sweats: v => v === true || v === 'true' || v === 'Yes' ? 'with night sweats' : '',
  present: () => '',
  flow: () => '',
  progression: v => typeof v === 'string' ? v.toLowerCase() : '',
  description: v => typeof v === 'string' ? `${v.toLowerCase()}` : '',
  relief: v => v === true || v === 'true' || v === 'Yes' ? 'relieved by vomiting' : v === false || v === 'false' || v === 'No' ? 'not relieved by vomiting' : '',
  gas_passage_relief: v => v === true || v === 'true' || v === 'Yes' ? 'relieved by passing flatus' : v === false || v === 'false' || v === 'No' ? 'not relieved by passing flatus' : '',
  diurnal_variation: v => typeof v === 'string' ? `worse ${v.toLowerCase()}` : '',
  response_to_antipyretics: v => typeof v === 'string' ? `response to antipyretics: ${v.toLowerCase()}` : '',
  relation_to_meals: v => typeof v === 'string' ? `related to ${v.toLowerCase()}` : '',
  stool_consistency: v => typeof v === 'string' ? `${v.toLowerCase()} consistency` : '',
  stool_blood: v => v === true || v === 'true' || v === 'Yes' ? 'with blood in stool' : '',
  stool_mucus: v => v === true || v === 'true' || v === 'Yes' ? 'with mucus in stool' : '',
  tenesmus: v => v === true || v === 'true' || v === 'Yes' ? 'with tenesmus' : '',
  exercise_induced: v => v === true || v === 'true' || v === 'Yes' ? 'exercise-induced' : '',
  night_cough: v => v === true || v === 'true' || v === 'Yes' ? 'worse at night' : '',
  allergies: v => typeof v === 'string' ? `with allergies: ${v}` : '',
  trauma: v => typeof v === 'string' ? `preceded by ${v}` : '',
  eating: v => v === true || v === 'true' || v === 'Yes' ? 'related to eating' : '',
  movement: v => v === true || v === 'true' || v === 'Yes' ? 'worse with movement' : '',
  related_symptoms: v => typeof v === 'string' ? `associated with ${v}` : '',
};

function formatFieldValue(field: string, val: string | boolean | string[]): string {
  const formatter = FIELD_FORMATTERS[field];
  if (formatter) {
    const result = formatter(val);
    if (result) return result;
  }
  if (typeof val === 'string' && !/^(true|false|yes|no)$/i.test(val)) {
    return val.toLowerCase();
  }
  return '';
}

function buildSymptomProse(entry: HpiEntry): string {
  const symptomDef = SYMPTOM_LIBRARY[entry.symptomId];
  if (!symptomDef) return entry.label.toLowerCase();

  const valCache = new Map<string, string | boolean | string[]>();
  for (const s of entry.socrates) {
    if (s.field) valCache.set(s.field, s.answer);
  }

  const fields = symptomDef.socratesFields;
  const formatted: string[] = [];

  for (const field of fields) {
    if (!valCache.has(field)) continue;
    const val = valCache.get(field)!;
    if (val === false || val === 'false' || val === 'No') continue;
    if (field === 'present') continue;
    const text = formatFieldValue(field, val);
    if (text) formatted.push(text);
  }

  const label = entry.label.toLowerCase();
  if (formatted.length === 0) {
    // Use the label value only (fallback)
    return `${label}.`;
  }

  // Join with commas, cap at 4 items for readability
  const joined = formatted.length <= 4
    ? formatted.join(', ')
    : formatted.slice(0, 3).join(', ') + `, ${formatted.length - 3} additional features`;
  return `${label} — ${joined}.`;
}

// Map symptomId → builder
const SYMPTOM_BUILDERS: Record<string, (entry: HpiEntry, he: string) => string> = {
  abdominal_pain: describePain,
  vomiting: describeVomiting,
  abdominal_distension: describeDistension,
  obstipation: describeObstipation,
  nausea: describeNausea,
  anorexia: describeAnorexia,
  fever_chills: describeFeverChills,
  peritonism: describePeritonismChange,
};

/**
 * Map a symptomId to a patient-friendly label from SYMPTOM_LIBRARY.
 * Handles British→American spelling variants (e.g., diarrhoea → diarrhea)
 * and maps medical jargon to plain language.
 */
const JARGON_MAP: Record<string, string> = {
  hematemesis: 'vomiting blood',
  haematemesis: 'vomiting blood',
  melena: 'dark or black stool',
  haematochezia: 'blood in stool',
  hematochezia: 'blood in stool',
  hemoptysis: 'coughing up blood',
  haemoptysis: 'coughing up blood',
  dyspnea: 'shortness of breath',
  dyspnoea: 'shortness of breath',
  hematuria: 'blood in urine',
  tenesmus: 'feeling of incomplete emptying',
  steatorrhea: 'fatty or pale stool',
  obstipation: 'no bowel movement or gas',
  hematemesis_melena: 'vomiting blood or dark stool',
  dysuria: 'painful urination',
  oliguria: 'reduced urine output',
  anuria: 'no urine output',
  hemianopia: 'vision loss in half the field',
  paraplegia: 'paralysis of both legs',
  hemiparesis: 'weakness on one side',
  dysarthria: 'slurred speech',
  dysphagia: 'difficulty swallowing',
  odynophagia: 'painful swallowing',
  palpitations: 'feeling of racing or irregular heartbeat',
  orthopnea: 'breathlessness when lying flat',
  pnd: 'waking up gasping for air at night',
  syncope: 'fainting or loss of consciousness',
  presyncope: 'feeling like about to faint',
  icterus: 'yellowing of the eyes',
  pyrexia: 'fever',
  rigor: 'severe shivering',
};
function symptomLabel(id: string): string | undefined {
  const direct = SYMPTOM_LIBRARY[id];
  if (direct) return direct.label;
  const jm = JARGON_MAP[id];
  if (jm) return jm;
  const spellingMap: Record<string, string> = {
    diarrhoea: 'diarrhea', oedema: 'edema', anaemia: 'anemia',
    dyspnoea: 'dyspnea', haemoptysis: 'hemoptysis', haematemesis: 'hematemesis',
  };
  const aliased = spellingMap[id];
  if (aliased) {
    const d2 = SYMPTOM_LIBRARY[aliased];
    if (d2) return d2.label;
    const jm2 = JARGON_MAP[aliased];
    if (jm2) return jm2;
  }
  return undefined;
}

/** Render an array of negative symptomIds into a fluent "no X, no Y" sentence. */
function renderPertinentNegatives(negatives: string[]): string {
  if (!negatives || negatives.length === 0) return '';
  const labeled = negatives.map(id => {
    const lbl = symptomLabel(id);
    return lbl ? lbl.toLowerCase() : id.replace(/_/g, ' ');
  });
  if (labeled.length === 1) return `There was no ${labeled[0]}.`;
  if (labeled.length === 2) return `There was no ${labeled[0]} and no ${labeled[1]}.`;
  const last = labeled.pop()!;
  return `There was no ${labeled.join(', no ')} and no ${last}.`;
}

// ═══════════════════════════════════════════════════════════════
// SYNDROME DETECTION ENGINE
// Identifies clinical syndromes from symptom clusters and returns
// the most likely syndrome with key supporting/refuting features.
// ═══════════════════════════════════════════════════════════════

interface SyndromeDef {
  id: string;
  name: string;
  /** Features that define this syndrome (required to be present) */
  coreFeatures: string[];
  /** Secondary features that support the syndrome */
  supportingFeatures: string[];
  /** Features that argue against this syndrome */
  excludingFeatures: string[];
  /** Anatomical / pathophysiological context */
  mechanism: string;
}

const ABDOMINAL_SYNDROMES: SyndromeDef[] = [
  {
    id: 'acute_intestinal_obstruction',
    name: 'Acute Intestinal Obstruction',
    coreFeatures: ['obstipation', 'abdominal_distension'],
    supportingFeatures: ['vomiting', 'vomiting_bilious', 'distension_onset', 'colicky_pain', 'pain_colicky'],
    excludingFeatures: ['diarrhea', 'diarrhoea'],
    mechanism: 'Mechanical blockage of the intestinal lumen, proximal bowel dilates with gas and fluid, peristalsis works against the obstruction producing colicky pain, eventually leading to vomiting (bilious if proximal) and obstipation.',
  },
  {
    id: 'acute_appendicitis',
    name: 'Acute Appendicitis',
    coreFeatures: ['pain_migration', 'pain_initial_location'],
    supportingFeatures: ['anorexia', 'nausea', 'vomiting', 'fever', 'pain_migration_rlq'],
    excludingFeatures: [],
    mechanism: 'Obstruction of the appendiceal lumen leads to inflammation and distension. Initially produces visceral periumbilical pain which later migrates to the right lower quadrant as the parietal peritoneum becomes involved.',
  },
  {
    id: 'generalised_peritonitis',
    name: 'Generalised Peritonitis',
    coreFeatures: ['peritonism', 'rigidity'],
    supportingFeatures: ['guarding', 'rebound_history', 'fever', 'fever_chills', 'pain_worsening_movement'],
    excludingFeatures: [],
    mechanism: 'Inflammation of the peritoneal cavity, usually from a perforated viscus or advanced inflammation. Parietal peritoneal irritation produces board-like rigidity, guarding, rebound tenderness, and worsening with movement.',
  },
  {
    id: 'acute_cholecystitis',
    name: 'Acute Cholecystitis / Biliary Colic',
    coreFeatures: ['pain_location_ruq'],
    supportingFeatures: ['fever', 'nausea', 'vomiting', 'jaundice', 'pain_radiation_back', 'known_gallstones'],
    excludingFeatures: ['pain_migration_to_llq'],
    mechanism: 'Gallstone impaction in the cystic duct leads to gallbladder distension and inflammation. Pain is in the right upper quadrant with radiation to the back or right shoulder.',
  },
  {
    id: 'acute_pancreatitis',
    name: 'Acute Pancreatitis',
    coreFeatures: ['pain_radiation_back', 'pain_location_epigastric'],
    supportingFeatures: ['vomiting', 'nausea', 'fever', 'alcohol_use', 'known_gallstones'],
    excludingFeatures: [],
    mechanism: 'Premature activation of pancreatic enzymes leads to autodigestion of the pancreas. Epigastric pain radiating to the back is the hallmark.',
  },
  {
    id: 'perforated_peptic_ulcer',
    name: 'Perforated Peptic Ulcer',
    coreFeatures: ['pain_onset_sudden', 'peritonism'],
    supportingFeatures: ['rigidity', 'guarding', 'rebound_history', 'nsaid_use', 'steroid_use'],
    excludingFeatures: ['pain_colicky', 'pain_migration'],
    mechanism: 'Full-thickness ulcer erosion leads to spillage of gastric/duodenal contents into the peritoneal cavity, causing sudden severe epigastric pain and generalised peritonitis.',
  },
  {
    id: 'gastroenteritis',
    name: 'Acute Gastroenteritis',
    coreFeatures: ['diarrhea', 'diarrhoea'],
    supportingFeatures: ['vomiting', 'nausea', 'fever', 'recent_travel', 'diarrhoea_travel_related'],
    excludingFeatures: ['obstipation', 'peritonism', 'rigidity'],
    mechanism: 'Infectious or toxic inflammation of the gastrointestinal mucosa, producing diarrhoea with or without vomiting.',
  },
  {
    id: 'ureteric_colic',
    name: 'Ureteric Colic / Renal Stone',
    coreFeatures: ['flank_pain', 'pain_radiation_groin'],
    supportingFeatures: ['hematuria', 'dysuria', 'nausea'],
    excludingFeatures: ['fever', 'peritonism', 'obstipation', 'abdominal_distension'],
    mechanism: 'A urinary tract stone causes intermittent obstruction of the ureter, producing severe colicky flank pain radiating to the groin.',
  },
  {
    id: 'ectopic_pregnancy',
    name: 'Ruptured Ectopic Pregnancy',
    coreFeatures: ['last_menstrual_period', 'vaginal_bleeding', 'syncope'],
    supportingFeatures: ['abdominal_pain_lower', 'shoulder_tip_pain'],
    excludingFeatures: [],
    mechanism: 'Implantation of the fertilised ovum outside the uterine cavity, most commonly in the fallopian tube. Rupture causes haemoperitoneum with syncope and shock.',
  },
];

/**
 * Detect the most likely syndrome(s) from the HPI symptom data.
 * Returns syndromes with a confidence score based on how many
 * core versus excluding features are matched.
 */
function detectSyndrome(hpi: Record<string, HpiEntry>): { syndrome: SyndromeDef; score: number; matchedFeatures: string[]; excludedBy: string[] }[] {
  // Collect all present/positive features from HPI data
  const presentFeatures = new Set<string>();
  for (const [, entry] of Object.entries(hpi)) {
    for (const s of entry.positives) presentFeatures.add(s);
    for (const s of entry.socrates) {
      const ans = s.answer;
      if ((ans === true || ans === 'Yes' || ans === 'yes' || ans === 'true') && s.field) {
        presentFeatures.add(s.field);
      }
    }
    presentFeatures.add(entry.symptomId);
  }
  // Also add negatives as present (they were asked and answered)
  for (const [, entry] of Object.entries(hpi)) {
    for (const s of entry.negatives) presentFeatures.add(`no_${s}`);
  }

  const results: { syndrome: SyndromeDef; score: number; matchedFeatures: string[]; excludedBy: string[] }[] = [];

  for (const syndrome of ABDOMINAL_SYNDROMES) {
    const coreMatched = syndrome.coreFeatures.filter(f => presentFeatures.has(f));
    const supportMatched = syndrome.supportingFeatures.filter(f => presentFeatures.has(f));
    const excluded = syndrome.excludingFeatures.filter(f => presentFeatures.has(f));

    // Score: each core = 3 points, each support = 1 point, each exclusion = -5 points
    const score = coreMatched.length * 3 + supportMatched.length * 1 - excluded.length * 5;

    if (coreMatched.length > 0 || score > 0) {
      results.push({
        syndrome,
        score,
        matchedFeatures: [...coreMatched, ...supportMatched],
        excludedBy: excluded,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════
// CONSULTANT-GRADE HPI GENERATOR
// ═══════════════════════════════════════════════════════════════
function generateHpiNarrative(input: DocumentInput): string {
  const { biodata, chiefComplaints: complaints, hpi, globalAnswers, pastHistory } = input;
  const isMale = biodata.sex === 'male';
  const he = isMale ? 'he' : 'she';
  const He = he.charAt(0).toUpperCase() + he.slice(1);
  const his = isMale ? 'his' : 'her';

  const totalAnswers = Object.values(hpi).reduce((sum, e) => sum + e.socrates.length, 0);
  if (complaints.length === 0 || totalAnswers === 0) return '';

  // ── Chronic disease preamble ──
  const chronicDiseaseTexts: string[] = [];
  if (pastHistory.chronicDiseases.length > 0) {
    for (const cd of pastHistory.chronicDiseases) {
      const diagYear = cd.yearDiagnosed ? ` since ${cd.yearDiagnosed}` : '';
      const hospital = cd.followUp ? ` under follow-up at ${cd.followUp}` : '';
      const drugs = cd.drugs ? cd.drugs : '';
      const compliance = cd.compliant === true ? ', and is reportedly compliant with treatment' :
        cd.compliant === false ? ', but is poorly compliant with treatment' : '';
      chronicDiseaseTexts.push(
        `The patient is a known ${cd.condition} diagnosed in ${cd.yearDiagnosed || 'the past'}${hospital}, currently taking ${drugs || 'medication'}${compliance}.`
      );
    }
  }
  const chronicPreamble = chronicDiseaseTexts.length > 0
    ? chronicDiseaseTexts.join(' ') + ' He was otherwise well until'
    : 'The patient was apparently well until';

  // ── Build symptom list from CC + HPI ──
  interface SymptomInfo { symptomId: string; label: string; daysAgo: number; entry: HpiEntry | undefined; }
  const allSymptoms: SymptomInfo[] = [];
  for (const c of complaints) {
    const entry = hpi[c.symptomId];
    allSymptoms.push({ symptomId: c.symptomId, label: c.label, daysAgo: c.durationDays > 0 ? c.durationDays : parseDaysAgo(entry, 0), entry });
  }
  for (const [, entry] of Object.entries(hpi)) {
    if (allSymptoms.some(s => s.symptomId === entry.symptomId)) continue;
    const daysAgo = parseDaysAgo(entry, 0);
    if (daysAgo > 0 || entry.socrates.length > 0) allSymptoms.push({ symptomId: entry.symptomId, label: entry.label, daysAgo, entry });
  }
  allSymptoms.sort((a, b) => b.daysAgo - a.daysAgo);

  // ── Group by day ──
  const dayGroups = new Map<number, SymptomInfo[]>();
  for (const s of allSymptoms) {
    const grp = dayGroups.get(s.daysAgo) || [];
    grp.push(s);
    dayGroups.set(s.daysAgo, grp);
  }
  const sortedDays = [...dayGroups.keys()].sort((a, b) => b - a);

  const paragraphs: string[] = [];
  let firstParagraphBuilt = false;

  for (let di = 0; di < sortedDays.length; di++) {
    const daysAgo = sortedDays[di];
    const group = dayGroups.get(daysAgo)!;
    const isFirstDay = di === 0;
    const richEntries: SymptomInfo[] = [];
    const plainLabels: string[] = [];

    for (const si of group) {
      if (si.entry && si.entry.socrates.length > 0) richEntries.push(si);
      else if (si.entry || si.label) plainLabels.push(si.label.toLowerCase());
    }

    // ── Rich symptom paragraphs ──
    for (let ri = 0; ri < richEntries.length; ri++) {
      const si = richEntries[ri];
      const builder = SYMPTOM_BUILDERS[si.symptomId];
      let paragraph = '';

      if (builder) {
        const body = builder(si.entry!, he);
        const isStandaloneParagraph = si.entry?.symptomId === 'peritonism';

        if (isStandaloneParagraph) {
          // Standalone evolution paragraph (e.g., peritonism change in pain character)
          // Add day transition if not first day
          if (!firstParagraphBuilt) {
            paragraph = body.charAt(0).toUpperCase() + body.slice(1);
            firstParagraphBuilt = true;
          } else if (ri === 0) {
            const prevDay = sortedDays[di - 1];
            const gap = prevDay - daysAgo;
            const dayTransition = gap === 1 ? 'The following day' :
              gap > 1 ? `${textNum(gap)} days later` : 'On the same day';
            paragraph = `${dayTransition}, ${body.charAt(0).toLowerCase() + body.slice(1)}`;
          } else {
            paragraph = body.charAt(0).toUpperCase() + body.slice(1);
          }
        } else if (!firstParagraphBuilt) {
          paragraph = `${chronicPreamble} ${textNum(daysAgo)} days prior to presentation when he developed ${body[0].toLowerCase() + body.slice(1)}`;
          firstParagraphBuilt = true;
        } else if (ri === 0) {
          const prevDay = sortedDays[di - 1];
          const gap = prevDay - daysAgo;
          const dayTransition = gap === 1 ? 'The following day' :
            gap > 1 ? `${textNum(gap)} days later` : 'On the same day';
          paragraph = `${dayTransition}, he developed ${body[0].toLowerCase() + body.slice(1)}`;
        } else {
          paragraph = `He also developed ${body[0].toLowerCase() + body.slice(1)}`;
        }
      } else {
        // Use generic prose builder (reads symptom's socratesFields from SYMPTOM_LIBRARY)
        const body = buildSymptomProse(si.entry!);
        if (!firstParagraphBuilt) {
          paragraph = `${chronicPreamble} ${textNum(daysAgo)} days prior to presentation when he developed ${body[0].toLowerCase() + body.slice(1)}`;
          firstParagraphBuilt = true;
        } else if (ri === 0) {
          const prevDay = sortedDays[di - 1];
          const gap = prevDay - daysAgo;
          const dayTransition = gap === 1 ? 'The following day' :
            gap > 1 ? `${textNum(gap)} days later` : 'On the same day';
          paragraph = `${dayTransition}, he developed ${body[0].toLowerCase() + body.slice(1)}`;
        } else {
          paragraph = `He also developed ${body[0].toLowerCase() + body.slice(1)}`;
        }
      }

      if (paragraph) {
        // Append pertinent negatives for this symptom (rule-out other causes)
        const negatives = si.entry?.negatives;
        if (negatives && negatives.length > 0) {
          paragraph += ' ' + renderPertinentNegatives(negatives);
        }
        paragraphs.push(paragraph);
      }
    }

    // ── Plain symptoms (no SOCRATES data) ──
    if (plainLabels.length > 0) {
      const prevDay = di > 0 ? sortedDays[di - 1] : 0;
      const gap = prevDay - daysAgo;
      let intro: string;
      if (!firstParagraphBuilt) {
        intro = `${chronicPreamble} ${textNum(daysAgo)} days prior to presentation when ${he} developed`;
        firstParagraphBuilt = true;
      } else if (gap === 1) {
        intro = `The following day, ${he} developed`;
      } else if (gap > 1) {
        intro = `${textNum(gap)} days later, ${he} developed`;
      } else if (gap === 0 && di > 0) {
        intro = `${He} also developed`;
      } else {
        intro = `${He} also developed`;
      }

      const list = plainLabels.length === 1
        ? plainLabels[0]
        : plainLabels.slice(0, -1).join(', ') + ` and ${plainLabels[plainLabels.length - 1]}`;
      paragraphs.push(`${intro} ${list}.`);
    }
  }

  // ── General flow statement ──
  if (globalAnswers?.flow && paragraphs.length > 0) {
    paragraphs[paragraphs.length - 1] += ` The symptoms have been ${naturalFlow(globalAnswers.flow)}.`;
  }

  // ── Impact & care-seeking ──
  const anyData = allSymptoms.some(s => s.entry && s.entry.socrates.length > 0);
  if (anyData) {
    const gSeen = globalAnswers?.seenByAnyone;
    const gTx = globalAnswers?.treatmentTaken;
    const gImpact = globalAnswers?.functionalImpact;

    const closing: string[] = [];
    if (gImpact && gImpact !== '') {
      closing.push(`The symptoms have progressively interfered with ${his} usual daily activities: ${gImpact.toLowerCase()}.`);
    } else {
      closing.push(`The symptoms have progressively interfered with ${his} normal daily activities.`);
    }

    if (gTx && gTx !== '' && gTx !== 'NONE' && gTx !== 'NO' && gTx !== 'None') {
      closing.push(`${He} had taken ${gTx} prior to presentation.`);
      if (gSeen && gSeen !== '' && gSeen !== 'NONE' && gSeen !== 'NO') {
        closing.push(`${He} had been seen by ${gSeen} for these complaints.`);
      }
    } else {
      closing.push(`${He} had not sought medical attention elsewhere and had not taken any medication prior to presentation.`);
    }

    paragraphs.push(closing.join(' '));
  }

  // ── Rule-out summary (significant associated negatives) ──
  const complaintIds = new Set(complaints.map(c => c.symptomId));
  const allNegatives = new Set<string>();
  for (const [, entry] of Object.entries(hpi)) {
    if (complaintIds.has(entry.symptomId)) continue; // skip primary CCs
    for (const n of entry.negatives) allNegatives.add(n);
  }
  if (allNegatives.size > 0) {
    const items = [...allNegatives].map(id => {
      const lbl = symptomLabel(id);
      return lbl ? lbl.toLowerCase() : id.replace(/_/g, ' ');
    });
    const unique = [...new Set(items)];
    if (unique.length === 1) {
      paragraphs.push(`There was no ${unique[0]}.`);
    } else if (unique.length === 2) {
      paragraphs.push(`There was no ${unique[0]} and no ${unique[1]}.`);
    } else if (unique.length > 0) {
      const last = unique.pop()!;
      paragraphs.push(`There was no ${unique.join(', no ')} and no ${last}.`);
    }
  }

  return paragraphs.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════
// PAST MEDICAL & SURGICAL HISTORY  —  comprehensive with negatives
// ═══════════════════════════════════════════════════════════════
function generatePastHistoryNarrative(pmh: PastHistory, alreadyDiscussedChronic: string[] = []): string {
  const lines: string[] = [];
  const alreadySet = new Set(alreadyDiscussedChronic.map(c => c.toLowerCase()));

  // Admissions
  if (pmh.admissions.length > 0) {
    const admits = pmh.admissions.map(a => `${a.year}: admitted for ${a.reason} at ${a.hospital} (treatment: ${a.treatment})`);
    lines.push(`PAST ADMISSIONS: ${admits.join('; ')}.`);
  }

  // Surgeries
  if (pmh.surgeries.length > 0) {
    const surgs = pmh.surgeries.map(s => `${s.year}: ${s.procedure} at ${s.hospital}`);
    lines.push(`PAST SURGERIES: ${surgs.join('; ')}.`);
  }

  // Transfusions
  if (pmh.transfusions.length > 0) {
    const trans = pmh.transfusions.map(t => `${t.year}: ${t.indication} at ${t.hospital}`);
    lines.push(`BLOOD TRANSFUSIONS: ${trans.join('; ')}.`);
  }

  // TB history
  if (pmh.tbHistory && pmh.tbHistory !== 'none') {
    lines.push(`TB HISTORY: ${pmh.tbHistory.replace(/_/g, ' ')}.`);
  }

  // Chronic conditions — only include those not already discussed in HPI
  const remainingChronic = pmh.chronicDiseases.filter(c => !alreadySet.has(c.condition.toLowerCase()));
  if (remainingChronic.length > 0 || alreadyDiscussedChronic.length > 0) {
    if (alreadyDiscussedChronic.length > 0 && remainingChronic.length === 0) {
      lines.push(`Apart from the ${alreadyDiscussedChronic.join(', ')} discussed above, there are no other known chronic medical conditions.`);
    } else {
      if (alreadyDiscussedChronic.length > 0) {
        lines.push(`Apart from the ${alreadyDiscussedChronic.join(', ')} discussed above, the patient also has:`);
      }
      remainingChronic.forEach(c => {
        const compliance = c.compliant === true ? 'compliant' : c.compliant === false ? 'non-compliant' : 'compliance not documented';
        const drugs = c.drugs ? `on ${c.drugs}` : 'medications not specified';
        const followUp = c.followUp ? `follows at ${c.followUp}` : 'follow-up not documented';
        const diagYear = c.yearDiagnosed ? `diagnosed ${c.yearDiagnosed}` : 'diagnosis year not specified';
        lines.push(`- ${c.condition} (${diagYear}, ${drugs}, ${followUp}, ${compliance})`);
      });
    }
  }

  // Allergies
  const allAllergies = [...pmh.drugAllergies, ...pmh.foodAllergies, ...pmh.allergies].filter(Boolean);
  if (allAllergies.length > 0) {
    lines.push(`ALLERGIES: ${allAllergies.join(', ')}.`);
  }

  // Long-term medications
  if (pmh.longTermMeds.length > 0) {
    lines.push(`LONG-TERM MEDICATIONS: ${pmh.longTermMeds.join(', ')}.`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// FAMILY & SOCIAL HISTORY
// ═══════════════════════════════════════════════════════════════
function generateFamilySocialNarrative(fs: FamilySocial, biodata: Biodata): string {
  const lines: string[] = [];
  const age = biodata.age || 99;
  const isAdult = age >= 18;
  const isPediatric = age < 18;

  let hasContent = false;

  // Only include social section if there is actual data
  const hasBasicData = fs.maritalStatus || fs.education || fs.housing || fs.water || fs.sanitation ||
    fs.transportAccess || biodata.occupation;

  if (!hasBasicData && isAdult && (fs.smoking === 'never' || !fs.smoking) &&
      (fs.alcohol === 'never' || !fs.alcohol) && fs.substanceUse.length === 0 &&
      fs.occupationExposure.length === 0 && fs.travelHistory.length === 0 &&
      fs.familyDiseases.length === 0 && fs.familyHistory.length === 0) {
    return '';
  }

  lines.push(`SOCIAL HISTORY:`);

  if (fs.maritalStatus) {
    const spouseInfo = fs.numberOfSpouses ? ` (${fs.numberOfSpouses} spouse(s))` : '';
    lines.push(`- Marital status: ${fs.maritalStatus}${spouseInfo}.`);
    hasContent = true;
  }
  if (biodata.occupation) { lines.push(`- Occupation: ${biodata.occupation}.`); hasContent = true; }
  if (fs.education) { lines.push(`- Education level: ${fs.education}.`); hasContent = true; }
  if (fs.incomeLevel) { lines.push(`- Income level: ${fs.incomeLevel}.`); hasContent = true; }

  if (fs.housing) { lines.push(`- Housing: ${fs.housing}.`); hasContent = true; }
  if (fs.water) { lines.push(`- Water source: ${fs.water}.`); hasContent = true; }
  if (fs.sanitation) { lines.push(`- Sanitation: ${fs.sanitation}.`); hasContent = true; }
  if (fs.transportAccess) { lines.push(`- Transport access: ${fs.transportAccess}.`); hasContent = true; }
  if (typeof fs.healthInsurance === 'boolean') { lines.push(`- Health insurance: ${fs.healthInsurance ? 'Yes' : 'No'}.`); hasContent = true; }

  // Smoking, alcohol, substance use — only for adults (≥18)
  if (isAdult) {
    if (fs.smoking === 'never') {
      lines.push('- Smoking: Never smoked.');
    } else if (fs.smoking) {
      const pk = fs.smokingPackYears ? ` (${fs.smokingPackYears} pack-years)` : '';
      lines.push(`- Smoking: ${fs.smoking}${pk}.`);
    }

    if (fs.alcohol === 'never') {
      lines.push('- Alcohol: Does not consume alcohol.');
    } else if (fs.alcohol) {
      const amt = fs.alcoholAmount ? ` (${fs.alcoholAmount})` : '';
      lines.push(`- Alcohol: ${fs.alcohol}${amt}.`);
    }

    if (fs.substanceUse.length > 0) {
      lines.push(`- Substance use: ${fs.substanceUse.join(', ')}.`);
    }
  }

  // Occupation exposures — only if adult or if occupation data exists
  if (fs.occupationExposure.length > 0) {
    lines.push(`- Occupational exposures: ${fs.occupationExposure.join(', ')}.`);
  }

  // Travel history
  if (fs.travelHistory.length > 0) {
    lines.push(`- Travel history (past 6 months): ${fs.travelHistory.join(', ')}.`);
  }

  // Family history
  if (fs.familyDiseases.length > 0 || fs.familyHistory.length > 0) {
    lines.push(`\nFAMILY HISTORY:`);
    if (fs.familyDiseases.length > 0) {
      lines.push(`- Family history of: ${fs.familyDiseases.join(', ')}.`);
    }
    if (fs.familyHistory.length > 0) {
      lines.push(`- Additional family history: ${fs.familyHistory.join(', ')}.`);
    }
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// REVIEW OF SYSTEMS
// ═══════════════════════════════════════════════════════════════
function generateRosNarrative(ros: RosFindings): string {
  const parts: string[] = [];
  let hasContent = false;

  for (const system of ros) {
    const positives = system.symptoms.filter(s => s.present === true);
    const negatives = system.symptoms.filter(s => s.present === false);
    const unanswered = system.symptoms.filter(s => s.present === null);

    if (positives.length > 0 || negatives.length > 0) {
      hasContent = true;
      const posStr = positives.map(s => s.label.toLowerCase()).join(', ');
      const negStr = negatives.map(s => `no ${s.label.toLowerCase()}`).join(', ');
      const unansStr = unanswered.length > 0 ? ` (${unanswered.length} not asked)` : '';

      if (positives.length > 0 && negatives.length > 0) {
        parts.push(`${system.label}: ${posStr}. However, ${negStr}.${unansStr}`);
      } else if (positives.length > 0) {
        parts.push(`${system.label}: ${posStr}.${unansStr}`);
      } else {
        parts.push(`${system.label}: ${negStr}.${unansStr}`);
      }
    }
  }

  if (!hasContent) return 'Review of systems not yet completed.';
  return `REVIEW OF SYSTEMS:\n${parts.join('\n')}`;
}

// ═══════════════════════════════════════════════════════════════
// IMPACT ON LIFE NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateImpactOnLifeNarrative(iol: ImpactOnLife): string {
  const lines: string[] = [];
  if (iol.work) lines.push(`Work/regular activities: ${iol.work.replace(/_/g, ' ')}.`);
  if (iol.walking) lines.push(`Walking/mobility: ${iol.walking.replace(/_/g, ' ')}.`);
  if (iol.eating) lines.push(`Eating: ${iol.eating.replace(/_/g, ' ')}.`);
  if (iol.sleeping) lines.push(`Sleeping: ${iol.sleeping.replace(/_/g, ' ')}.`);
  if (iol.adl) lines.push(`ADL independence: ${iol.adl.replace(/_/g, ' ')}.`);
  if (iol.description) lines.push(`Additional: ${iol.description}`);
  const hasData = lines.some(l => l.length > 0);
  if (!hasData) return '';
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// GENERAL EXAMINATION NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateGeneralExaminationNarrative(ge: GeneralExamination): string {
  const v = ge.vitals;
  const hasVitals = v.temperature || v.heartRate || v.bloodPressureSystolic || v.respiratoryRate || v.oxygenSaturation || v.bloodSugar;
  const hasAppearance = !!ge.appearance.appearance;
  const hasWeight = !!v.weight;
  const hasAbnormalHydration = !!ge.hydration.status && ge.hydration.status !== 'normal';
  const hasAbnormalNutrition = !!ge.nutrition.status && ge.nutrition.status !== 'normal';
  const hasConsciousness = !!ge.consciousness.level && (ge.consciousness.level !== 'alert' || !!ge.consciousness.gcs);
  const hasDistress = ge.distress.pain || ge.distress.respiratory || ge.distress.cardiovascular || ge.distress.neurological;
  const hasSigns = ge.generalSigns.some(s => s.present && s.details && s.details !== 'Not present');
  const hasNotes = !!ge.notes;

  if (!hasVitals && !hasAppearance && !hasWeight && !hasAbnormalHydration &&
      !hasAbnormalNutrition && !hasConsciousness && !hasDistress && !hasSigns && !hasNotes) {
    return '';
  }

  const lines: string[] = [];
  lines.push('GENERAL EXAMINATION');
  lines.push('─'.repeat(40));

  if (hasAppearance) {
    lines.push(`General appearance: ${ge.appearance.appearance}.`);
  }

  if (hasVitals) {
    const vitalsLine = [
      v.temperature ? `Temp: ${v.temperature}°C` : null,
      v.heartRate ? `HR: ${v.heartRate}/min` : null,
      v.bloodPressureSystolic ? `BP: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic || '?'} mmHg` : null,
      v.respiratoryRate ? `RR: ${v.respiratoryRate}/min` : null,
      v.oxygenSaturation ? `SpO₂: ${v.oxygenSaturation}%` : null,
      v.bloodSugar ? `RBS: ${v.bloodSugar} mmol/L` : null,
    ].filter(Boolean).join(' · ');
    if (vitalsLine) lines.push(`Vitals: ${vitalsLine}.`);
  }

  if (hasWeight) {
    const bmi = v.bmi || (v.height && v.weight ? (v.weight / ((v.height / 100) ** 2)).toFixed(1) : null);
    lines.push(`Anthropometry: Weight ${v.weight} kg${v.height ? `, Height ${v.height} cm${bmi ? `, BMI ${bmi}` : ''}` : ''}.`);
  }

  if (hasAbnormalHydration) {
    const signs: string[] = [];
    if (ge.hydration.dryMucosa) signs.push('dry mucosa');
    if (ge.hydration.sunkenEyes) signs.push('sunken eyes');
    if (ge.hydration.reducedSkinTurgor) signs.push('reduced skin turgor');
    const signStr = signs.length > 0 ? ` (${signs.join(', ')})` : '';
    lines.push(`Hydration: ${ge.hydration.status.replace(/_/g, ' ')}${signStr}.`);
  }

  if (hasAbnormalNutrition) {
    lines.push(`Nutritional status: ${ge.nutrition.status}.`);
  }

  if (hasConsciousness) {
    lines.push(`Consciousness: ${ge.consciousness.level.replace(/_/g, ' ')}${ge.consciousness.gcs ? ` (GCS ${ge.consciousness.gcs}/15)` : ''}.`);
  }

  if (hasDistress) {
    const distressTypes: string[] = [];
    if (ge.distress.pain) distressTypes.push('pain');
    if (ge.distress.respiratory) distressTypes.push('respiratory');
    if (ge.distress.cardiovascular) distressTypes.push('cardiovascular');
    if (ge.distress.neurological) distressTypes.push('neurological');
    lines.push(`Distress: ${distressTypes.join(', ')}.`);
  }

  if (hasSigns) {
    const abnormalSigns = ge.generalSigns.filter(s => s.present && s.details && s.details !== 'Not present');
    lines.push('General signs:');
    for (const s of abnormalSigns) {
      lines.push(`  • ${s.label}: ${s.details}.`);
    }
  }

  if (hasNotes) lines.push(`Additional notes: ${ge.notes}.`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// SYSTEMIC EXAMINATION NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateSystemExaminationNarrative(systems: SystemExaminations): string {
  const lines: string[] = [];
  lines.push('SYSTEMIC EXAMINATION');
  lines.push('─'.repeat(40));

  const examinedSystems = systems.filter(s => s.findings.some(f => f.finding !== 'not_examined'));
  if (examinedSystems.length === 0) {
    lines.push('Systemic examination findings pending documentation.');
    return lines.join('\n');
  }

  for (const sys of examinedSystems) {
    lines.push(`\n${sys.systemName}:`);
    const abnormal = sys.findings.filter(f => f.finding === 'abnormal' && f.description);
    if (abnormal.length === 0) {
      lines.push(`  Unremarkable on examination.`);
    }
    for (const f of abnormal) {
      lines.push(`  • ${f.label}: ${f.description}`);
    }
    if (sys.summary) lines.push(`  Summary: ${sys.summary}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// LOCAL EXAMINATION NARRATIVE (surgery/ortho)
// ═══════════════════════════════════════════════════════════════
function generateLocalExaminationNarrative(localExams: LocalExaminations): string {
  const lines: string[] = [];
  lines.push('LOCAL EXAMINATION');
  lines.push('─'.repeat(40));

  if (localExams.length === 0) {
    lines.push('No local examination findings documented.');
    return lines.join('\n');
  }

  for (const exam of localExams) {
    lines.push(`\n${exam.label} — ${exam.anatomicalSite}:`);
    for (const [key, value] of Object.entries(exam.findings)) {
      if (value) lines.push(`  • ${key.replace(/_/g, ' ')}: ${value}`);
    }
    if (exam.description) lines.push(`  Description: ${exam.description}`);
    if (exam.interpretation) lines.push(`  Interpretation: ${exam.interpretation}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// BIRTH HISTORY NARRATIVE (Pediatrics / Newborn)
// ═══════════════════════════════════════════════════════════════
function generateBirthHistoryNarrative(bh: BirthHistory, profile: string): string {
  if (profile !== 'pediatric' && profile !== 'newborn') return '';
  const an = bh.antenatal;
  const na = bh.natal;
  const pn = bh.postnatal;
  const hasData = !!an.antenatalCare || !!na.deliveryType || !!na.presentation || !!pn.immediateFeeding ||
    an.ancVisits > 0 || na.birthWeight > 0 || na.gestationalAgeWeeks > 0 ||
    an.maternalIllness.length > 0 || an.medications.length > 0 || an.complications.length > 0 ||
    pn.nicuAdmission;
  if (!hasData) return '';

  const lines: string[] = [];
  lines.push('BIRTH HISTORY');
  lines.push('─'.repeat(40));

  lines.push(`Antenatal: ${an.antenatalCare === 'yes' ? `${an.ancVisits} ANC visits` : an.antenatalCare || 'No ANC'}. ` +
    `Tetanus toxoid: ${an.tetanusToxoid ? 'given' : 'not given'}. HIV: ${an.hivStatus || 'unknown'}. ` +
    `Malaria prophylaxis: ${an.malariaProphylaxis ? 'yes' : 'no'}.${an.maternalIllness.length ? ` Maternal illness: ${an.maternalIllness.join(', ')}.` : ''}`);

  lines.push(`Natal: Delivered at ${na.placeOfDelivery || 'unknown'}. Type: ${na.deliveryType ? na.deliveryType.replace(/_/g, ' ') : 'unknown'}. ` +
    `Presentation: ${na.presentation || 'unknown'}. Birth weight: ${na.birthWeight ? `${na.birthWeight}g` : 'unknown'}. ` +
    `Gestation: ${na.gestationalAgeWeeks ? `${na.gestationalAgeWeeks} weeks` : 'unknown'}. ` +
    `Cry: ${na.cry || 'unknown'}. Resuscitation: ${na.resuscitation || 'none'}.`);

  lines.push(`Postnatal: Feeding: ${pn.immediateFeeding ? pn.immediateFeeding.replace(/_/g, ' ') : 'unknown'}. ` +
    `Vitamin K: ${pn.vitaminK ? 'given' : 'not given'}. BCG: ${pn.bcgGiven ? 'given' : 'not given'}. ` +
    `OPV-0: ${pn.opvGiven ? 'given' : 'not given'}. Jaundice: ${pn.neonatalJaundice ? `yes${pn.phototherapy ? ' (phototherapy)' : ''}` : 'no'}. ` +
    `NICU: ${pn.nicuAdmission ? `${pn.nicuDays} days` : 'no'}.`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// IMMUNIZATION HISTORY NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateImmunizationNarrative(imm: ImmunizationHistory): string {
  const given = Object.entries(imm).filter(([k, v]) =>
    k !== 'other' && k !== 'upToDate' && typeof v === 'object' && v !== null && (v as any).given
  );
  if (given.length === 0 && imm.other.length === 0) return 'Immunization history not documented.';
  const lines: string[] = [];
  lines.push('IMMUNIZATION HISTORY');
  lines.push('─'.repeat(40));
  lines.push(`Vaccines given: ${given.map(([_, v]) => (v as any).vaccine + ' (' + (v as any).dose + ')').join(', ')}.`);
  if (imm.upToDate) lines.push('Immunizations up to date.');
  else lines.push('Immunizations NOT up to date — review needed.');
  if (imm.other.length > 0) {
    lines.push(`Other: ${imm.other.map(v => `${v.vaccine} ${v.dose}`).join(', ')}.`);
  }
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// GROWTH & DEVELOPMENT NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateGrowthDevelopmentNarrative(gd: GrowthDevelopment): string {
  const m = gd.milestones;
  const hasMilestones = Object.entries(m).some(([k, v]) => k !== 'concerns' && v);
  if (!hasMilestones && gd.growthParams.length === 0 && !m.concerns) return '';

  const lines: string[] = [];
  lines.push('GROWTH & DEVELOPMENT');
  lines.push('─'.repeat(40));

  const achieved: string[] = [];
  const notAchieved: string[] = [];
  for (const [key, val] of Object.entries(m)) {
    if (key === 'concerns') continue;
    if (val === 'achieved') achieved.push(key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()));
    else if (val === 'not_achieved') notAchieved.push(key.replace(/([A-Z])/g, ' $1').toLowerCase());
  }

  if (achieved.length > 0) lines.push(`Milestones achieved: ${achieved.join(', ')}.`);
  if (notAchieved.length > 0) lines.push(`Milestones NOT achieved: ${notAchieved.join(', ')}.`);
  if (m.concerns) lines.push(`Developmental concerns: ${m.concerns}`);

  if (gd.growthParams.length > 0) {
    const latest = gd.growthParams[gd.growthParams.length - 1];
    lines.push(`Latest growth (${latest.age}): Wt ${latest.weight}kg, Ht ${latest.height}cm, HC ${latest.headCircumference}cm (${latest.percentile}).`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// NUTRITION HISTORY NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateNutritionHistoryNarrative(nh: NutritionHistory): string {
  const hasData = !!nh.currentFeeding;
  if (!hasData && nh.foodGroups.length === 0 && nh.supplements.length === 0 &&
      !nh.appetite &&
      !nh.feedingDifficulty && !nh.pica) return '';

  const lines: string[] = [];
  lines.push('NUTRITION HISTORY');
  lines.push('─'.repeat(40));
  lines.push(`Feeding: ${nh.currentFeeding.replace(/_/g, ' ')}. ` +
    `${nh.breastfeedingDuration ? `Breastfeeding: ${nh.breastfeedingDuration}. ` : ''}` +
    `${nh.complementaryFoodsStarted ? `Complementary foods started: ${nh.complementaryFoodsStarted}. ` : ''}` +
    `Meals/day: ${nh.mealsPerDay}.`);
  if (nh.foodGroups.length > 0) lines.push(`Food groups: ${nh.foodGroups.join(', ')}.`);
  if (nh.supplements.length > 0) lines.push(`Supplements: ${nh.supplements.join(', ')}.`);
  lines.push(`Appetite: ${nh.appetite}.${nh.feedingDifficulty ? ` Difficulty: ${nh.feedingDifficulty}.` : ''}`);
  if (nh.pica) lines.push('Pica present.');
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// OBSTETRIC HISTORY NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateObstetricHistoryNarrative(obh: ObstetricHistory): string {
  const hasData = obh.totalPregnancies > 0 || obh.pregnancies.length > 0 ||
    obh.currentPregnancy.weeksGestation > 0;
  if (!hasData) return '';

  const lines: string[] = [];
  lines.push('OBSTETRIC HISTORY');
  lines.push('─'.repeat(40));

  lines.push(`Gravida: ${obh.totalPregnancies}, Para: ${obh.totalDeliveries}, ` +
    `Live children: ${obh.liveChildren}, Stillbirths: ${obh.stillbirths}, ` +
    `Miscarriages: ${obh.miscarriages}, Ectopics: ${obh.ectopics}, CSx: ${obh.cesareanSections}.`);

  if (obh.pregnancies.length > 0) {
    lines.push('\nPrevious pregnancies:');
    for (const p of obh.pregnancies) {
      lines.push(`  • ${p.year}: ${p.outcome.replace(/_/g, ' ')} at ${p.gestationalAgeWeeks}w. ` +
        `Delivery: ${p.deliveryType.replace(/_/g, ' ')}. Bwt: ${p.babyWeight || '?'}g. ${p.complications.length ? `Complications: ${p.complications.join(', ')}.` : ''}`);
    }
  }

  lines.push(`\nCurrent pregnancy: Trimester ${obh.currentPregnancy.trimester}, ` +
    `${obh.currentPregnancy.weeksGestation} weeks. Fetal movements: ${obh.currentPregnancy.fetalMovements}. ` +
    `${obh.currentPregnancy.complications.length ? `Complications: ${obh.currentPregnancy.complications.join(', ')}.` : ''}`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// GYNECOLOGY HISTORY NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateGynecologyHistoryNarrative(gyh: GynecologicHistory): string {
  const m = gyh.menstrual;
  const hasData = (m.menarche && m.menarche > 0) || (m.cycleLength && m.cycleLength > 0) ||
    (gyh.contraception.currentMethod && gyh.contraception.currentMethod !== 'none') ||
    gyh.stdHistory.length > 0 ||
    gyh.gynecologicSurgery.length > 0 || gyh.fertilityConcerns;
  if (!hasData) return '';

  const lines: string[] = [];
  lines.push('GYNECOLOGY HISTORY');
  lines.push('─'.repeat(40));

  lines.push(`Menarche: ${m.menarche}y. Cycle: ${m.cycleLength}d × ${m.duration}d. ` +
    `Regularity: ${m.regularity}. Flow: ${m.flow}. Dysmenorrhea: ${m.dysmenorrhea}.` +
    `${m.menopauseAge ? ` Menopause: ${m.menopauseAge}y.` : ''} LMP: ${m.lmp || 'not recorded'}.`);

  const c = gyh.contraception;
  lines.push(`Contraception: Current ${c.currentMethod}. Compliance: ${c.compliance}.${c.sideEffects ? ` Side effects: ${c.sideEffects}.` : ''}`);

  if (gyh.stdHistory.length > 0) lines.push(`STDs: ${gyh.stdHistory.join(', ')}.`);
  if (gyh.gynecologicSurgery.length > 0) lines.push(`Gynecologic surgery: ${gyh.gynecologicSurgery.join(', ')}.`);
  if (gyh.fertilityConcerns) lines.push(`Fertility: ${gyh.fertilityConcerns}.`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// OBSTETRIC EXAMINATION NARRATIVE (Leopold's)
// ═══════════════════════════════════════════════════════════════
function generateObstetricExaminationNarrative(exam: ObstetricExamination | null): string {
  if (!exam) return 'Obstetric examination not performed.';
  const lines: string[] = [];
  lines.push('OBSTETRIC EXAMINATION');
  lines.push('─'.repeat(40));

  const l = exam.leopold;
  lines.push(`Leopold's Maneuvers: Fundus — ${l.firstManeuver}. ` +
    `Fetal back — ${l.secondManeuver}. Presenting part — ${l.thirdManeuver}. Engagement — ${l.fourthManeuver}.`);
  lines.push(`Lie: ${l.fetalLie}. Presentation: ${l.presentation}. Position: ${l.position}. ` +
    `Engagement: ${l.engagement}. FHR: ${l.fetalHeartRate}/min.`);
  lines.push(`Fundal height: ${exam.fundalHeight}cm. Abdominal girth: ${exam.abdominalGirth}cm.`);
  if (exam.scarInspection) lines.push(`Scars: ${exam.scarInspection}.`);
  if (l.contractions) lines.push(`Contractions: ${l.contractions}.`);
  if (l.amnioticFluid) lines.push(`Liquor: ${l.amnioticFluid}.`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// NEWBORN EXAMINATION NARRATIVE (head-to-toe)
// ═══════════════════════════════════════════════════════════════
function generateNewbornExaminationNarrative(exam: NewbornExamination | null): string {
  if (!exam) return 'Newborn examination not performed.';
  const lines: string[] = [];
  lines.push('NEWBORN EXAMINATION (Head-to-Toe)');
  lines.push('─'.repeat(40));

  const v = exam.vitals;
  const vitalsLine = [
    v.temperature ? `Temp ${v.temperature}°C` : null,
    v.heartRate ? `HR ${v.heartRate}/min` : null,
    v.respiratoryRate ? `RR ${v.respiratoryRate}/min` : null,
    v.oxygenSaturation ? `SpO₂ ${v.oxygenSaturation}%` : null,
    v.bloodSugar ? `RBS ${v.bloodSugar} mmol/L` : null,
  ].filter(Boolean).join(', ');
  if (vitalsLine) lines.push(`Vitals: ${vitalsLine}.`);

  const ht = exam.headToToe;
  lines.push(`Head: HC ${ht.headCircumference ? `${ht.headCircumference}cm` : 'not measured'}. Fontanelles: ${ht.fontanelles}. Sutures: ${ht.sutures}.` +
    `${ht.caput ? ' Caput present.' : ''}${ht.cephalhematoma ? ' Cephalhematoma present.' : ''}`);
  lines.push(`Eyes: ${ht.eyes || 'Normal'}. Ears: ${ht.ears || 'Normal'}. Mouth/Palate: ${ht.palate}.`);
  lines.push(`Chest: ${ht.chestShape || 'Symmetric'}. Auscultation: ${ht.chestAuscultation || 'Clear'}.`);
  lines.push(`Abdomen: ${ht.abdomen || 'Soft'}. Cord: ${ht.umbilicalCord.replace(/_/g, ' ')}. Anus: ${ht.anus}.`);
  lines.push(`Genitalia: ${ht.genitalia || 'Normal'}. ${ht.testesDescended !== undefined ? `Testes: ${ht.testesDescended ? 'descended' : 'undescended'}.` : ''}`);
  lines.push(`Spine: ${ht.spine || 'Normal'}. Hips: ${ht.hips}. Limbs: ${ht.limbs || 'Normal'}. Digits: ${ht.digits || '10/10'}.`);
  lines.push(`Skin: ${ht.skinColor}.${ht.rash ? ` Rash: ${ht.rash}.` : ''}${ht.birthMarks ? ` Birth marks: ${ht.birthMarks}.` : ''}`);
  lines.push(`Neurological: Tone ${ht.tone}. Moro: ${ht.reflexes.moro}. Suck: ${ht.reflexes.sucking}. Cry: ${ht.cry}. Activity: ${ht.activity}.`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// CLINICAL REASONING NARRATIVE (history + exam combined)
// ═══════════════════════════════════════════════════════════════
function generateClinicalReasoningNarrative(reasoning: ClinicalReasoningArray): string {
  if (reasoning.length === 0) return '';

  const lines: string[] = [];
  lines.push('CLINICAL REASONING');
  lines.push('─'.repeat(40));

  const sorted = [...reasoning].sort((a, b) => b.probability - a.probability);
  for (const entry of sorted) {
    const label = probabilityLabel(entry.probability);
    lines.push(`\n${label}: ${entry.diseaseName}`);
    if (entry.supportingFromHistory.length > 0) {
      lines.push(`  Supporting (history): ${entry.supportingFromHistory.join('; ')}.`);
    }
    if (entry.supportingFromExamination.length > 0) {
      lines.push(`  Supporting (examination): ${entry.supportingFromExamination.join('; ')}.`);
    }
    if (entry.opposing.length > 0) {
      lines.push(`  Opposing: ${entry.opposing.join('; ')}.`);
    }
    lines.push(`  Assessment: ${entry.overallAssessment}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// CLINICAL IMPRESSION NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateClinicalImpressionNarrative(
  provisional: ProvisionalDiagnosis | null, ddx: DdxResult
): string {
  if (!provisional) return '';

  const lines: string[] = [];
  lines.push('CLINICAL IMPRESSION');
  lines.push('─'.repeat(40));

  lines.push(`Provisional Diagnosis: ${provisional.diagnosis}`);
  lines.push(`Diagnostic Certainty: ${probabilityLabel(provisional.probability)}`);
  if (provisional.reasoning.fromHistory.length > 0) {
    lines.push(`Based on history: ${provisional.reasoning.fromHistory.join('; ')}.`);
  }
  if (provisional.reasoning.fromExamination.length > 0) {
    lines.push(`Based on examination: ${provisional.reasoning.fromExamination.join('; ')}.`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// DIFFERENTIAL DIAGNOSIS NARRATIVE
// ═══════════════════════════════════════════════════════════════
function probabilityLabel(p: number): string {
  if (p >= 40) return 'Most Likely Diagnosis';
  if (p >= 15) return 'Possible Diagnosis';
  if (p >= 5) return 'Less Likely Diagnosis';
  return 'Unlikely Diagnosis (to be ruled out)';
}

function generateDifferentialNarrative(differentials: DifferentialWithReasoning[]): string {
  if (differentials.length === 0) return '';

  const lines: string[] = [];
  lines.push('DIFFERENTIAL DIAGNOSES');
  lines.push('─'.repeat(40));

  const sorted = [...differentials].sort((a, b) => b.probability - a.probability);
  let currentLabel = '';

  for (const dd of sorted) {
    const label = probabilityLabel(dd.probability);
    if (label !== currentLabel) {
      lines.push(`\n${label}:`);
      currentLabel = label;
    }
    const reasons: string[] = [];
    if (dd.reasonsFor.length > 0) {
      reasons.push(`In favour — ${dd.reasonsFor.join('; ')}`);
    }
    if (dd.reasonsAgainst.length > 0) {
      reasons.push(`Against — ${dd.reasonsAgainst.join('; ')}`);
    }
    const suffix = reasons.length > 0 ? ` (${reasons.join('; ')})` : '';
    lines.push(`  • ${dd.diseaseName}${suffix}.`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// INVESTIGATION PLAN NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateInvestigationNarrative(plan: InvestigationPlan): string {
  const lines: string[] = [];
  lines.push('INVESTIGATION PLAN');
  lines.push('─'.repeat(40));

  if (plan.investigations.length === 0) {
    lines.push('Investigations pending recommendation.');
    return lines.join('\n');
  }

  const essential = plan.investigations.filter(i => i.priority === 'essential');
  const supportive = plan.investigations.filter(i => i.priority === 'supportive');
  const optional = plan.investigations.filter(i => i.priority === 'optional');

  if (essential.length > 0) {
    lines.push('\nEssential Investigations:');
    for (const inv of essential) {
      const cat = inv.category === 'lab' ? 'Lab' : inv.category === 'imaging' ? 'Imaging' : 'Procedure';
      lines.push(`  • ${inv.name} [${cat}]`);
      lines.push(`    Rationale: ${inv.rationale}`);
      lines.push(`    Expected: ${inv.expectedFinding}`);
    }
  }

  if (supportive.length > 0) {
    lines.push('\nSupportive Investigations:');
    for (const inv of supportive) {
      lines.push(`  • ${inv.name}`);
      lines.push(`    Rationale: ${inv.rationale}`);
    }
  }

  if (optional.length > 0) {
    lines.push('\nOptional Investigations:');
    for (const inv of optional) {
      lines.push(`  • ${inv.name}`);
    }
  }

  if (plan.notes) lines.push(`\nNotes: ${plan.notes}`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// TREATMENT PLAN NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateTreatmentNarrative(plan: TreatmentPlan): string {
  const lines: string[] = [];
  lines.push('TREATMENT PLAN');
  lines.push('─'.repeat(40));

  if (plan.items.length === 0) {
    lines.push('Treatment plan pending recommendation.');
    return lines.join('\n');
  }

  const supportive = plan.items.filter(i => i.category === 'supportive');
  const definitive = plan.items.filter(i => i.category === 'definitive');
  const complicationMgt = plan.items.filter(i => i.category === 'complication_management');

  if (supportive.length > 0) {
    lines.push('\nSupportive Care:');
    for (const tx of supportive) {
      const dose = tx.dosage ? ` — ${tx.dosage}` : '';
      const dur = tx.duration ? ` for ${tx.duration}` : '';
      lines.push(`  • ${tx.intervention}${dose}${dur}`);
      lines.push(`    Rationale: ${tx.rationale}`);
    }
  }

  if (definitive.length > 0) {
    lines.push('\nDefinitive Treatment:');
    for (const tx of definitive) {
      const dose = tx.dosage ? ` — ${tx.dosage}` : '';
      const dur = tx.duration ? ` for ${tx.duration}` : '';
      lines.push(`  • ${tx.intervention}${dose}${dur}`);
      lines.push(`    Rationale: ${tx.rationale}`);
    }
  }

  if (complicationMgt.length > 0) {
    lines.push('\nComplication Management:');
    for (const tx of complicationMgt) {
      lines.push(`  • ${tx.intervention}`);
      lines.push(`    Rationale: ${tx.rationale}`);
    }
  }

  lines.push(`\nDisposition: ${plan.disposition.replace(/_/g, ' ')}`);
  if (plan.dispositionRationale) lines.push(`Rationale: ${plan.dispositionRationale}`);
  if (plan.followUp) lines.push(`Follow-up: ${plan.followUp}`);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// INVESTIGATION INTERPRETATION NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateInvestigationInterpretationNarrative(interpretation: InvestigationInterpretation): string {
  const lines: string[] = [];
  lines.push('INVESTIGATION INTERPRETATION');
  lines.push('─'.repeat(40));

  if (interpretation.items.length === 0) {
    lines.push('Investigation results pending.');
    return lines.join('\n');
  }

  for (const item of interpretation.items) {
    const status = item.isAbnormal ? '⚠ Abnormal' : '✓ Normal';
    lines.push(`\n${item.investigationName}: ${item.result} [${status}]`);
    if (item.interpretation) lines.push(`  Interpretation: ${item.interpretation}`);
    if (item.supportsDiseaseIds.length > 0) {
      lines.push(`  Supports: ${item.supportsDiseaseIds.join(', ')}`);
    }
  }

  if (interpretation.overallInterpretation) {
    lines.push(`\nOverall Interpretation: ${interpretation.overallInterpretation}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// MONITORING PLAN NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateMonitoringPlanNarrative(plan: MonitoringPlan): string {
  const lines: string[] = [];
  lines.push('MONITORING PLAN');
  lines.push('─'.repeat(40));

  if (plan.vitalMonitoring.length > 0) {
    lines.push('\nVital Signs Monitoring:');
    for (const vm of plan.vitalMonitoring) {
      lines.push(`  • ${vm.parameter} — ${vm.frequency} (target: ${vm.target})`);
      lines.push(`    Reason: ${vm.rationale}`);
    }
  }

  if (plan.labMonitoring.length > 0) {
    lines.push('\nLaboratory Monitoring:');
    for (const lm of plan.labMonitoring) {
      lines.push(`  • ${lm.parameter} — ${lm.frequency} (target: ${lm.target})`);
    }
  }

  if (plan.complicationPrevention.length > 0) {
    lines.push('\nComplication Prevention:');
    for (const cp of plan.complicationPrevention) {
      lines.push(`  • ${cp.measure}`);
      lines.push(`    Reason: ${cp.rationale}`);
    }
  }

  if (plan.escalationCriteria) {
    lines.push(`\nEscalation Criteria: ${plan.escalationCriteria}`);
  }

  if (plan.reviewPlan) {
    lines.push(`Review Plan: ${plan.reviewPlan}`);
  }

  if (lines.length === 2) {
    lines.push('Monitoring plan pending.');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// CLINICAL SUMMARY  —  concise overview (no DDX listing)
// ═══════════════════════════════════════════════════════════════
function generateSummary(input: DocumentInput): string {
  const b = input.biodata;
  const isMale = b.sex === 'male';
  const he = isMale ? 'he' : 'she';
  const He = he.charAt(0).toUpperCase() + he.slice(1);
  const parts: string[] = [];

  parts.push('═'.repeat(60));
  parts.push('CLINICAL SUMMARY');
  parts.push('═'.repeat(60));
  parts.push('');

  // Patient
  parts.push(`${b.name || 'Unnamed'}, ${b.age || '?'} years, ${isMale ? 'male' : 'female'}${b.occupation ? `, ${b.occupation}` : ''}${b.residence ? `, ${b.residence}` : ''}.`);
  parts.push('');

  // Chief complaints (brief)
  if (input.chiefComplaints.length > 0) {
    parts.push(`Presented with ${input.chiefComplaints.map(c => `${c.label.toLowerCase()} of ${c.duration} (${c.durationDays} days)`).join(', ')}.`);
    parts.push('');
  }

  // Brief HPI — key diagnostic pointers
  const hpiText = generateHpiNarrative(input);
  const firstTwoSentences = hpiText.split(/(?<=\.)\s+/).slice(0, 2).join(' ');
  if (firstTwoSentences) {
    parts.push(firstTwoSentences);
    parts.push('');
  }

  // Key positive/negative findings (only from actually answered HPI questions)
  const keyFindings: string[] = [];
  const { hpi, featureRegistry } = input;
  const complaintSymptomIds = new Set(input.chiefComplaints.map(c => c.symptomId));
  // Build set of symptom IDs that have actual user answers
  const answeredSymptomIds = new Set<string>();
  for (const [sid, entry] of Object.entries(hpi)) {
    if (entry.socrates.length > 0) answeredSymptomIds.add(sid);
  }
  for (const [, entry] of Object.entries(featureRegistry)) {
    if (complaintSymptomIds.has(entry.id)) continue;
    if (entry.present !== true) continue;
    // Only include if this symptom was actually answered by the user
    if (!answeredSymptomIds.has(entry.id)) continue;
    keyFindings.push(entry.id.replace(/_/g, ' '));
  }
  if (keyFindings.length > 0) {
    parts.push(`Key findings: ${keyFindings.join(', ')}.`);
    parts.push('');
  }

  // Red flags only (no DDX listing per user requirement)
  const critical = input.redFlags.filter(r => r.severity === 'critical');
  const high = input.redFlags.filter(r => r.severity === 'high');
  if (critical.length > 0) {
    parts.push('⚠ CRITICAL RED FLAGS:');
    critical.forEach(r => parts.push(`  • ${r.message}`));
    parts.push('');
  } else if (high.length > 0) {
    parts.push('⚠ RED FLAGS:');
    high.forEach(r => parts.push(`  • ${r.message}`));
    parts.push('');
  }

  // Provisional diagnosis
  if (input.provisionalDiagnosis) {
    parts.push(`Provisional diagnosis: ${input.provisionalDiagnosis.diagnosis}.`);
    parts.push('');
  }

  parts.push(`Assessment completed: ${new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })}`);

  return parts.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// FULL DOCUMENTATION — complete clinical history write-up
// ═══════════════════════════════════════════════════════════════
interface NarrativeParts {
  chiefComplaintText: string;
  hpiNarrative: string;
  pastHistoryNarrative: string;
  birthHistoryNarrative: string;
  immunizationNarrative: string;
  growthDevNarrative: string;
  nutritionNarrative: string;
  obstetricHistoryNarrative: string;
  gynecologyHistoryNarrative: string;
  familySocialNarrative: string;
  rosNarrative: string;
  impactOnLifeNarrative: string;
  generalExaminationNarrative: string;
  systemExaminationNarrative: string;
  localExaminationNarrative: string;
  obstetricExamNarrative: string;
  newbornExamNarrative: string;
  clinicalReasoningNarrative: string;
  clinicalImpressionNarrative: string;
  differentialNarrative: string;
  investigationPlanNarrative: string;
  investigationInterpretationNarrative: string;
  treatmentPlanNarrative: string;
  monitoringPlanNarrative: string;
  summaryNarrative: string;
}

function generateFullDocumentation(input: DocumentInput, narratives: NarrativeParts): string {
  const b = input.biodata;
  const isMale = b.sex === 'male';
  const age = b.age || 0;
  const isPreMenarche = age < 12;
  const profile = b.profile || '';
  const isPediatric = profile === 'pediatric' || profile === 'newborn' || age < 13;
  const parts: string[] = [];
  const isEmpty = (s: string) => !s || s.length < 5;
  const cs = input.completedSections ?? [];
  const isCompleted = (sectionId: string) => cs.includes(sectionId);
  let sectionNumber = 1;

  const addSection = (num: string, title: string, content: string) => {
    parts.push(`${num}. ${title}`);
    parts.push('─'.repeat(40));
    parts.push(content);
    parts.push('');
  };

  // ── HEADER ──
  parts.push('═'.repeat(60));
  parts.push('AMEXAN — COMPLETE CLINICAL CLERKING NOTE');
  parts.push('═'.repeat(60));
  parts.push('');

  // ── 1. PATIENT DETAILS ──
  addSection('1', 'PATIENT DETAILS', [
    `Name: ${b.name || 'Unnamed'}`,
    `Age: ${b.age || '?'} years`,
    `Sex: ${b.sex}`,
    b.occupation && `Occupation: ${b.occupation}`,
    b.residence && `Residence: ${b.residence}`,
    b.informant && `History obtained from: ${b.informant.replace(/_/g, ' ')}`,
    b.reliability && `Reliability: ${b.reliability.replace(/_/g, ' ')}`,
  ].filter(Boolean).join('\n'));

  // ── 2. CHIEF COMPLAINTS ──
  if (isCompleted('chief_complaints') && !isEmpty(narratives.chiefComplaintText)) {
    addSection('2', 'CHIEF COMPLAINTS', narratives.chiefComplaintText);
  }

  // ── 3. HISTORY OF PRESENTING ILLNESS ──
  if (isCompleted('hpi') && !isEmpty(narratives.hpiNarrative)) {
    addSection('3', 'HISTORY OF PRESENTING ILLNESS', narratives.hpiNarrative);
  }

  let sec = 4;

  // ── OBSTETRIC HISTORY (after HPI for women of reproductive age) ──
  if (isCompleted('obstetric_history') && !isMale && !isPreMenarche && narratives.obstetricHistoryNarrative) {
    addSection(String(sec), 'OBSTETRIC HISTORY', narratives.obstetricHistoryNarrative);
    sec++;
  }

  // ── GYNECOLOGY HISTORY (after obstetric) ──
  if (isCompleted('gynecology_history') && !isMale && !isPreMenarche && narratives.gynecologyHistoryNarrative) {
    addSection(String(sec), 'GYNECOLOGY HISTORY', narratives.gynecologyHistoryNarrative);
    sec++;
  }

  // ── PAST MEDICAL & SURGICAL HISTORY ──
  if (isCompleted('past_history') && !isEmpty(narratives.pastHistoryNarrative)) {
    addSection(String(sec), 'PAST MEDICAL & SURGICAL HISTORY', narratives.pastHistoryNarrative);
    sec++;
  }

  // ── PEDIATRIC SUB-SECTIONS (only for pediatric/newborn) ──
  if (isPediatric) {
    if (isCompleted('birth_history') && narratives.birthHistoryNarrative) {
      addSection(String(sec) + 'a', 'BIRTH HISTORY', narratives.birthHistoryNarrative);
    }
    if (isCompleted('immunization') && narratives.immunizationNarrative &&
        narratives.immunizationNarrative !== 'Immunization history not documented.') {
      addSection(String(sec) + 'b', 'IMMUNIZATION HISTORY', narratives.immunizationNarrative);
    }
    if (isCompleted('growth_dev') && narratives.growthDevNarrative) {
      addSection(String(sec) + 'c', 'GROWTH & DEVELOPMENT', narratives.growthDevNarrative);
    }
    if (isCompleted('nutrition') && narratives.nutritionNarrative) {
      addSection(String(sec) + 'd', 'NUTRITION HISTORY', narratives.nutritionNarrative);
    }
    sec++;
  }

  // ── FAMILY & SOCIAL HISTORY ──
  if (isCompleted('family_social') && !isEmpty(narratives.familySocialNarrative)) {
    addSection(String(sec), 'FAMILY & SOCIAL HISTORY', narratives.familySocialNarrative);
    sec++;
  }

  // ── REVIEW OF SYSTEMS ──
  if (isCompleted('ros') && narratives.rosNarrative &&
      narratives.rosNarrative !== 'Review of systems not yet completed.') {
    addSection(String(sec), 'REVIEW OF SYSTEMS', narratives.rosNarrative);
    sec++;
  }

  // ── IMPACT ON LIFE ──
  if (isCompleted('impact') && !isEmpty(narratives.impactOnLifeNarrative)) {
    addSection(String(sec), 'IMPACT ON LIFE', narratives.impactOnLifeNarrative);
    sec++;
  }

  // ── HISTORY SUMMARY (before examination) ──
  if (isCompleted('history_summary') && !isEmpty(narratives.hpiNarrative)) {
    const summaryLines: string[] = [];
    const firstTwo = narratives.hpiNarrative.split(/(?<=\.)\s+/).slice(0, 2).join(' ');
    summaryLines.push(`${b.name || 'Unnamed'}, ${b.age || '?'} years, ${isMale ? 'male' : 'female'}${b.occupation ? `, ${b.occupation}` : ''}, presented with ${input.chiefComplaints.map(c => `${c.label.toLowerCase()} of ${c.duration} (${c.durationDays} days)`).join(', ')}.`);
    if (firstTwo) summaryLines.push(firstTwo);
    const pmhHighlights: string[] = [];
    const ph = input.pastHistory;
    if (ph.chronicDiseases.length > 0) pmhHighlights.push(`Known ${ph.chronicDiseases.map(d => d.condition).join(', ')}`);
    if (ph.admissions.length > 0) pmhHighlights.push(`Previous admissions: ${ph.admissions.length}`);
    if (ph.surgeries.length > 0) pmhHighlights.push(`Previous surgeries: ${ph.surgeries.length}`);
    if (pmhHighlights.length > 0) summaryLines.push(`PMH: ${pmhHighlights.join('; ')}.`);
    const socHighlights: string[] = [];
    const fs = input.familySocial;
    if (age >= 18 && fs.smoking && fs.smoking !== 'never') socHighlights.push(`Smoker (${fs.smoking})`);
    if (age >= 18 && fs.alcohol && fs.alcohol !== 'never') socHighlights.push(`Alcohol (${fs.alcohol})`);
    if (b.residence) socHighlights.push(`Lives in ${b.residence}`);
    if (socHighlights.length > 0) summaryLines.push(`Social: ${socHighlights.join('; ')}.`);
    const redCritical = input.redFlags.filter(r => r.severity === 'critical');
    const redHigh = input.redFlags.filter(r => r.severity === 'high');
    if (redCritical.length > 0) summaryLines.push(`⚠ Critical red flags: ${redCritical.map(r => r.message).join('; ')}.`);
    else if (redHigh.length > 0) summaryLines.push(`⚠ Red flags: ${redHigh.map(r => r.message).join('; ')}.`);
    addSection(String(sec), 'HISTORY SUMMARY', summaryLines.join('\n'));
    sec++;
  }

  // ── GENERAL EXAMINATION ──
  if (isCompleted('general_exam') && !isEmpty(narratives.generalExaminationNarrative)) {
    addSection(String(sec), 'GENERAL EXAMINATION', narratives.generalExaminationNarrative);
    sec++;
  }

  // ── SYSTEMIC EXAMINATION ──
  const sysEmpty = isEmpty(narratives.systemExaminationNarrative) ||
    narratives.systemExaminationNarrative.includes('pending documentation');
  if (isCompleted('systemic_exam') && !sysEmpty) {
    addSection(String(sec), 'SYSTEMIC EXAMINATION', narratives.systemExaminationNarrative);
    sec++;
  }

  // ── OBSTETRIC EXAMINATION (females only) ──
  if (isCompleted('obstetric_exam') && !isMale && narratives.obstetricExamNarrative &&
      narratives.obstetricExamNarrative !== 'Obstetric examination not performed.') {
    addSection(String(sec), 'OBSTETRIC EXAMINATION (Leopold\'s Maneuvers)', narratives.obstetricExamNarrative);
    sec++;
  }

  // ── NEWBORN EXAMINATION ──
  if (isCompleted('newborn_exam') && narratives.newbornExamNarrative &&
      narratives.newbornExamNarrative !== 'Newborn examination not performed.') {
    addSection(String(sec), 'NEWBORN EXAMINATION (Head-to-Toe)', narratives.newbornExamNarrative);
    sec++;
  }

  // ── LOCAL EXAMINATION ──
  const hasLocal = input.localExaminations && input.localExaminations.length > 0;
  if (isCompleted('local_examination') && hasLocal) {
    addSection(String(sec), 'LOCAL EXAMINATION', narratives.localExaminationNarrative);
    sec++;
  }

  // ── DIAGNOSIS ──
  if (isCompleted('diagnosis') && narratives.clinicalImpressionNarrative) {
    addSection(String(sec), 'PROVISIONAL DIAGNOSIS', narratives.clinicalImpressionNarrative);
    sec++;
  }

  // ── DIFFERENTIALS ──
  if (isCompleted('differentials') && narratives.differentialNarrative) {
    addSection(String(sec), 'DIFFERENTIAL DIAGNOSES', narratives.differentialNarrative);
    sec++;
  }

  // ── INVESTIGATIONS ──
  if (isCompleted('investigations') && narratives.investigationPlanNarrative &&
      !narratives.investigationPlanNarrative.includes('pending') &&
      narratives.investigationPlanNarrative.length > 50) {
    addSection(String(sec), 'INVESTIGATIONS REQUESTED', narratives.investigationPlanNarrative);
    sec++;
  }

  // ── INTERPRETATION ──
  const hasInterpretation = input.investigationInterpretation &&
    input.investigationInterpretation.items.length > 0;
  if (isCompleted('interpretation') && hasInterpretation) {
    addSection(String(sec), 'INVESTIGATION INTERPRETATION', narratives.investigationInterpretationNarrative);
    sec++;
  }

  // ── TREATMENT ──
  if (isCompleted('treatment') && narratives.treatmentPlanNarrative &&
      !narratives.treatmentPlanNarrative.includes('pending') &&
      narratives.treatmentPlanNarrative.length > 30) {
    addSection(String(sec), 'TREATMENT PLAN', narratives.treatmentPlanNarrative);
    sec++;
  }

  // ── MONITORING ──
  if (isCompleted('monitoring') && narratives.monitoringPlanNarrative &&
      !narratives.monitoringPlanNarrative.includes('pending')) {
    addSection(String(sec), 'MONITORING PLAN', narratives.monitoringPlanNarrative);
    sec++;
  }

  // ── SUMMARY ──
  parts.push(narratives.summaryNarrative);

  return parts.join('\n');
}
