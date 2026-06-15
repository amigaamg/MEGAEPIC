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
}

export function generateDocuments(input: DocumentInput): GeneratedDocuments {
  const chiefComplaintText = generateChiefComplaintText(input);
  const hpiNarrative = generateHpiNarrative(input);
  const pastHistoryNarrative = generatePastHistoryNarrative(input.pastHistory);

  // Specialty-specific narratives (profile-dependent)
  const birthHistoryNarrative = generateBirthHistoryNarrative(input.birthHistory, input.biodata.profile);
  const immunizationNarrative = generateImmunizationNarrative(input.immunizationHistory);
  const growthDevNarrative = generateGrowthDevelopmentNarrative(input.growthDevelopment);
  const nutritionNarrative = generateNutritionHistoryNarrative(input.nutritionHistory);
  const obstetricHistoryNarrative = generateObstetricHistoryNarrative(input.obstetricHistory);
  const gynecologyHistoryNarrative = generateGynecologyHistoryNarrative(input.gynecologicHistory);

  const familySocialNarrative = generateFamilySocialNarrative(input.familySocial, input.biodata);
  const rosNarrative = generateRosNarrative(input.ros);
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
    familySocialNarrative, rosNarrative,
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
  if (complaints.length === 0) return 'No chief complaints recorded.';

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

function getAns(entry: HpiEntry | undefined, field: string) {
  return entry?.socrates.find(a => a.field === field)?.answer;
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
    case 'worsening': return 'has been progressively worsening';
    case 'improving': return 'has been gradually improving';
    case 'static': return 'has remained persistent without significant change since onset';
    case 'fluctuating': return 'has been fluctuating in severity';
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
    const location = getAns(entry, 'location');
    if (location && typeof location === 'string') attrs.push(`located in the ${location.toLowerCase()}`);
    const quality = getAns(entry, 'quality');
    if (quality && typeof quality === 'string') attrs.push(`${quality.toLowerCase()} in nature`);
    const sev = getAns(entry, 'severity');
    if (sev !== undefined && sev !== '' && sev !== '0') attrs.push(`rated ${sev}/10`);
    const radiation = getAns(entry, 'radiation');
    if (radiation && typeof radiation === 'string' && !radiation.toLowerCase().includes('no')) attrs.push(`radiating to ${radiation.toLowerCase()}`);
    const timing = getAns(entry, 'timing');
    if (timing && typeof timing === 'string') attrs.push(`occurring ${timing.toLowerCase()}`);
    const aggravating = getAns(entry, 'aggravating_factors');
    if (aggravating) {
      const a = Array.isArray(aggravating) ? aggravating : [String(aggravating)];
      const filtered = a.filter(x => !x.toLowerCase().includes('nothing'));
      if (filtered.length > 0) attrs.push(`aggravated by ${filtered.join(', ').toLowerCase()}`);
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

function generateHpiNarrative(input: DocumentInput): string {
  const { biodata, chiefComplaints: complaints, hpi, featureRegistry, globalAnswers } = input;
  const isMale = biodata.sex === 'male';
  const he = isMale ? 'he' : 'she';
  const He = he.charAt(0).toUpperCase() + he.slice(1);
  const his = isMale ? 'his' : 'her';

  if (complaints.length === 0) return `${He} was apparently well until the present illness.`;

  // ── Build sorted symptom list ──
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

  const allSymptomIds = new Set(allSymptoms.map(s => s.symptomId));
  const paragraphs: string[] = [];
  let prevDaysAgo = 0;
  const mentionedRiskFields = new Set<string>();

  for (let i = 0; i < allSymptoms.length; i++) {
    const si = allSymptoms[i];
    const { symptomId, label, daysAgo, entry } = si;
    const lc = label.toLowerCase();

    if (!entry || entry.socrates.length === 0) {
      if (i === 0) paragraphs.push(`The patient was apparently well until ${daysAgo > 0 ? `${textNum(daysAgo)} days` : 'recently'} prior to presentation when ${he} developed ${lc}.`);
      else {
        const gap = prevDaysAgo - daysAgo;
        if (gap === 1) paragraphs.push(`The following day, ${he} developed ${lc}.`);
        else if (gap > 1) paragraphs.push(`${textNum(gap)} days later, ${he} developed ${lc}.`);
        else paragraphs.push(`${He} also developed ${lc}.`);
      }
      if (daysAgo > 0) prevDaysAgo = daysAgo;
      continue;
    }

    // ── Opening ──
    let opening: string;
    if (i === 0) {
      opening = `The patient was apparently well until ${textNum(daysAgo)} days prior to presentation when ${he} developed ${lc}`;
    } else {
      const gap = prevDaysAgo - daysAgo;
      if (gap <= 0) {
        const trans = i === 1 ? 'As the illness progressed,' : 'Additionally,';
        opening = `${trans} ${he} developed ${lc}`;
      } else if (gap === 1) {
        opening = `One day after the onset of the ${allSymptoms[0].label.toLowerCase()}, ${he} developed ${lc}`;
      } else if (gap === daysAgo) {
        opening = `Approximately ${textNum(gap)} days prior to presentation, ${he} developed ${lc}`;
      } else {
        const trans = chronologyWord(gap, false);
        opening = `${trans.charAt(0).toUpperCase() + trans.slice(1)}, ${he} developed ${lc}`;
      }
    }
    if (daysAgo > 0) prevDaysAgo = daysAgo;

    // ── Attributes ──
    const attrs = buildAttrs(symptomId, entry);
    const attrPart = attrs.length > 0 ? ` ${attrs.join(', ')}` : '';

    // ── Positives & negatives ──
    const { pos, neg } = getPosNegAssoc(entry, allSymptomIds);
    const socratesRiskNegs = getRiskNegs(entry);
    const registryRiskNegs: string[] = [];
    for (const [fid, fentry] of Object.entries(featureRegistry)) {
      if (fid.startsWith('risk_') && fentry.present === false) {
        registryRiskNegs.push(fid.replace('risk_', '').replace(/_/g, ' '));
      }
    }
    const riskNegs = [...new Set([...socratesRiskNegs, ...registryRiskNegs])].filter(r => {
      if (mentionedRiskFields.has(r)) return false;
      mentionedRiskFields.add(r);
      return true;
    });

    let sentence = `${opening}.${attrPart.length > 0 ? '' : ''}`;

    // Build a flowing paragraph
    const parts: string[] = [];
    if (attrPart) parts.push(attrPart.trim());

    if (pos.length > 0 && neg.length > 0) {
      parts.push(`was associated with ${pos.join(', ')}`);
      const negGroups = groupNegatives(neg);
      parts.push(`but not with ${negGroups.join(', or ')}`);
    } else if (pos.length > 0) {
      parts.push(`was associated with ${pos.join(', ')}`);
    } else if (neg.length > 0) {
      const negGroups = groupNegatives(neg);
      parts.push(`He denied ${negGroups.join(', or ')}`);
    }

    let midText = '';
    if (parts.length > 0) {
      const idx = opening.length;
      midText = ` ${parts[0]}`;
      for (let j = 1; j < parts.length; j++) {
        midText += ` ${parts[j]}`;
      }
      sentence = `${opening}${attrPart}${midText}.`;
    }

    // Risk factors
    if (riskNegs.length > 0) {
      sentence += ` There was no history of ${riskNegs.join(', ')}.`;
    }

    // Flow
    const flow = getAns(entry, 'flow');
    if (flow && typeof flow === 'string' && flow !== 'Select...') {
      sentence += ` The ${lc} ${naturalFlow(flow)}.`;
    } else if (globalAnswers?.flow && i === allSymptoms.length - 1) {
      sentence += ` The symptoms ${naturalFlow(globalAnswers.flow)}.`;
    }

    paragraphs.push(sentence);
  }

  // ── Impact & care-seeking ──
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

  return paragraphs.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════
// PAST MEDICAL & SURGICAL HISTORY  —  comprehensive with negatives
// ═══════════════════════════════════════════════════════════════
function generatePastHistoryNarrative(pmh: PastHistory): string {
  const lines: string[] = [];

  // Admissions
  if (pmh.admissions.length > 0) {
    const admits = pmh.admissions.map(a => `${a.year}: admitted for ${a.reason} at ${a.hospital} (treatment: ${a.treatment})`);
    lines.push(`PAST ADMISSIONS: ${admits.join('; ')}.`);
  } else {
    lines.push('PAST ADMISSIONS: No history of previous hospital admissions.');
  }

  // Surgeries
  if (pmh.surgeries.length > 0) {
    const surgs = pmh.surgeries.map(s => `${s.year}: ${s.procedure} at ${s.hospital}`);
    lines.push(`PAST SURGERIES: ${surgs.join('; ')}.`);
  } else {
    lines.push('PAST SURGERIES: No history of previous surgeries.');
  }

  // Transfusions
  if (pmh.transfusions.length > 0) {
    const trans = pmh.transfusions.map(t => `${t.year}: ${t.indication} at ${t.hospital}`);
    lines.push(`BLOOD TRANSFUSIONS: ${trans.join('; ')}.`);
  } else {
    lines.push('BLOOD TRANSFUSIONS: No history of blood transfusions.');
  }

  // TB history
  if (pmh.tbHistory && pmh.tbHistory !== 'none') {
    lines.push(`TB HISTORY: ${pmh.tbHistory.replace(/_/g, ' ')}.`);
  } else {
    lines.push('TB HISTORY: No known history of tuberculosis.');
  }

  // Chronic conditions
  if (pmh.chronicDiseases.length > 0) {
    lines.push(`CHRONIC CONDITIONS:`);
    pmh.chronicDiseases.forEach(c => {
      const compliance = c.compliant === true ? 'compliant' : c.compliant === false ? 'non-compliant' : 'compliance not documented';
      const drugs = c.drugs ? `on ${c.drugs}` : 'medications not specified';
      const followUp = c.followUp ? `follows at ${c.followUp}` : 'follow-up not documented';
      const diagYear = c.yearDiagnosed ? `diagnosed ${c.yearDiagnosed}` : 'diagnosis year not specified';
      lines.push(`- ${c.condition} (${diagYear}, ${drugs}, ${followUp}, ${compliance})`);
    });
  } else {
    lines.push('CHRONIC CONDITIONS: No known chronic medical conditions.');
  }

  // Allergies
  const allAllergies = [...pmh.drugAllergies, ...pmh.foodAllergies, ...pmh.allergies].filter(Boolean);
  if (allAllergies.length > 0) {
    lines.push(`ALLERGIES: ${allAllergies.join(', ')}.`);
  } else {
    lines.push('ALLERGIES: No known drug or food allergies.');
  }

  // Long-term medications
  if (pmh.longTermMeds.length > 0) {
    lines.push(`LONG-TERM MEDICATIONS: ${pmh.longTermMeds.join(', ')}.`);
  } else {
    lines.push('LONG-TERM MEDICATIONS: Not on any long-term medications.');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// FAMILY & SOCIAL HISTORY
// ═══════════════════════════════════════════════════════════════
function generateFamilySocialNarrative(fs: FamilySocial, biodata: Biodata): string {
  const lines: string[] = [];

  lines.push(`SOCIAL HISTORY:`);

  const spouseInfo = fs.numberOfSpouses ? ` (${fs.numberOfSpouses} spouse(s))` : '';
  lines.push(`- Marital status: ${fs.maritalStatus}${spouseInfo}.`);

  if (biodata.occupation) lines.push(`- Occupation: ${biodata.occupation}.`);
  lines.push(`- Education level: ${fs.education}.`);
  lines.push(`- Income level: ${fs.incomeLevel}.`);

  // Social determinants
  lines.push(`- Housing: ${fs.housing}.`);
  lines.push(`- Water source: ${fs.water}.`);
  lines.push(`- Sanitation: ${fs.sanitation}.`);
  lines.push(`- Transport access: ${fs.transportAccess}.`);
  lines.push(`- Health insurance: ${fs.healthInsurance ? 'Yes' : 'No'}.`);

  // Smoking
  if (fs.smoking === 'never') {
    lines.push('- Smoking: Never smoked.');
  } else {
    const pk = fs.smokingPackYears ? ` (${fs.smokingPackYears} pack-years)` : '';
    lines.push(`- Smoking: ${fs.smoking}${pk}.`);
  }

  // Alcohol
  if (fs.alcohol === 'never') {
    lines.push('- Alcohol: Does not consume alcohol.');
  } else {
    const amt = fs.alcoholAmount ? ` (${fs.alcoholAmount})` : '';
    lines.push(`- Alcohol: ${fs.alcohol}${amt}.`);
  }

  // Substance use
  if (fs.substanceUse.length > 0) {
    lines.push(`- Substance use: ${fs.substanceUse.join(', ')}.`);
  } else {
    lines.push('- Substance use: None reported.');
  }

  // Occupation exposures
  if (fs.occupationExposure.length > 0) {
    lines.push(`- Occupational exposures: ${fs.occupationExposure.join(', ')}.`);
  } else {
    lines.push('- Occupational exposures: None identified.');
  }

  // Travel history
  if (fs.travelHistory.length > 0) {
    lines.push(`- Travel history (past 6 months): ${fs.travelHistory.join(', ')}.`);
  } else {
    lines.push('- Travel history: No recent travel reported.');
  }

  lines.push(`\nFAMILY HISTORY:`);
  if (fs.familyDiseases.length > 0) {
    lines.push(`- Family history of: ${fs.familyDiseases.join(', ')}.`);
  } else {
    lines.push('- No significant family history of chronic illness reported.');
  }
  if (fs.familyHistory.length > 0) {
    lines.push(`- Additional family history: ${fs.familyHistory.join(', ')}.`);
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
// GENERAL EXAMINATION NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateGeneralExaminationNarrative(ge: GeneralExamination): string {
  const lines: string[] = [];
  lines.push('GENERAL EXAMINATION');
  lines.push('─'.repeat(40));

  // A. Overall Appearance
  if (ge.appearance.appearance) {
    lines.push(`General appearance: ${ge.appearance.appearance}.`);
  }

  // B. Vital Signs + C. Anthropometry
  const v = ge.vitals;
  const vitalsLine = [
    v.temperature ? `Temp: ${v.temperature}°C` : null,
    v.heartRate ? `HR: ${v.heartRate}/min` : null,
    v.bloodPressureSystolic ? `BP: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic || '?'} mmHg` : null,
    v.respiratoryRate ? `RR: ${v.respiratoryRate}/min` : null,
    v.oxygenSaturation ? `SpO₂: ${v.oxygenSaturation}%` : null,
    v.bloodSugar ? `RBS: ${v.bloodSugar} mmol/L` : null,
  ].filter(Boolean).join(' · ');
  if (vitalsLine) lines.push(`Vitals: ${vitalsLine}.`);

  if (v.weight) {
    const bmi = v.bmi || (v.height ? (v.weight / ((v.height / 100) ** 2)).toFixed(1) : null);
    lines.push(`Anthropometry: Weight ${v.weight} kg${v.height ? `, Height ${v.height} cm${bmi ? `, BMI ${bmi}` : ''}` : ''}.`);
  }

  // D. Hydration
  if (ge.hydration.status !== 'normal') {
    const signs: string[] = [];
    if (ge.hydration.dryMucosa) signs.push('dry mucosa');
    if (ge.hydration.sunkenEyes) signs.push('sunken eyes');
    if (ge.hydration.reducedSkinTurgor) signs.push('reduced skin turgor');
    const signStr = signs.length > 0 ? ` (${signs.join(', ')})` : '';
    lines.push(`Hydration: ${ge.hydration.status.replace(/_/g, ' ')}${signStr}.`);
  }

  // E. Nutritional Status
  if (ge.nutrition.status !== 'normal') {
    lines.push(`Nutritional status: ${ge.nutrition.status}.`);
  }

  // F. Level of Consciousness
  lines.push(`Consciousness: ${ge.consciousness.level.replace(/_/g, ' ')}${ge.consciousness.gcs ? ` (GCS ${ge.consciousness.gcs}/15)` : ''}.`);

  // G. Distress Assessment
  const distressTypes: string[] = [];
  if (ge.distress.pain) distressTypes.push('pain');
  if (ge.distress.respiratory) distressTypes.push('respiratory');
  if (ge.distress.cardiovascular) distressTypes.push('cardiovascular');
  if (ge.distress.neurological) distressTypes.push('neurological');
  if (distressTypes.length > 0) {
    lines.push(`Distress: ${distressTypes.join(', ')}.`);
  } else {
    lines.push('No apparent distress.');
  }

  // H. Adaptive General Signs
  const abnormalSigns = ge.generalSigns.filter(s => s.present && s.details && s.details !== 'Not present');
  if (abnormalSigns.length > 0) {
    lines.push('General signs:');
    for (const s of abnormalSigns) {
      lines.push(`  • ${s.label}: ${s.details}.`);
    }
  } else if (ge.generalSigns.length > 0) {
    lines.push('General signs: Unremarkable — no pallor, jaundice, cyanosis, clubbing, lymphadenopathy or peripheral edema.');
  }

  if (ge.notes) lines.push(`Additional notes: ${ge.notes}.`);

  if (lines.length === 2) lines.push('General examination findings pending documentation.');
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
    const normal = sys.findings.filter(f => f.finding === 'normal');
    if (normal.length > 0) {
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
  const lines: string[] = [];
  lines.push('BIRTH HISTORY');
  lines.push('─'.repeat(40));

  const an = bh.antenatal;
  lines.push(`Antenatal: ${an.antenatalCare === 'yes' ? `${an.ancVisits} ANC visits` : 'No ANC'}. ` +
    `Tetanus toxoid: ${an.tetanusToxoid ? 'given' : 'not given'}. HIV: ${an.hivStatus}. ` +
    `Malaria prophylaxis: ${an.malariaProphylaxis ? 'yes' : 'no'}.${an.maternalIllness.length ? ` Maternal illness: ${an.maternalIllness.join(', ')}.` : ''}`);

  const na = bh.natal;
  lines.push(`Natal: Delivered at ${na.placeOfDelivery || 'unknown'}. Type: ${na.deliveryType.replace(/_/g, ' ')}. ` +
    `Presentation: ${na.presentation}. Birth weight: ${na.birthWeight ? `${na.birthWeight}g` : 'unknown'}. ` +
    `Gestation: ${na.gestationalAgeWeeks ? `${na.gestationalAgeWeeks} weeks` : 'unknown'}. ` +
    `Cry: ${na.cry}. Resuscitation: ${na.resuscitation || 'none'}.`);

  const pn = bh.postnatal;
  lines.push(`Postnatal: Feeding: ${pn.immediateFeeding.replace(/_/g, ' ')}. ` +
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
  const lines: string[] = [];
  lines.push('GROWTH & DEVELOPMENT');
  lines.push('─'.repeat(40));

  const m = gd.milestones;
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
  const lines: string[] = [];
  lines.push('GYNECOLOGY HISTORY');
  lines.push('─'.repeat(40));

  const m = gyh.menstrual;
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
  const lines: string[] = [];
  lines.push('CLINICAL REASONING');
  lines.push('─'.repeat(40));

  if (reasoning.length === 0) {
    lines.push('Clinical reasoning pending — complete history and examination first.');
    return lines.join('\n');
  }

  for (const entry of reasoning) {
    lines.push(`\n${entry.diseaseName} (${Math.round(entry.probability)}%):`);
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
  const lines: string[] = [];
  lines.push('CLINICAL IMPRESSION');
  lines.push('─'.repeat(40));

  if (provisional) {
    lines.push(`Provisional Diagnosis: ${provisional.diagnosis}`);
    lines.push(`Estimated Probability: ${provisional.probability}%`);
    if (provisional.reasoning.fromHistory.length > 0) {
      lines.push(`Based on history: ${provisional.reasoning.fromHistory.join('; ')}.`);
    }
    if (provisional.reasoning.fromExamination.length > 0) {
      lines.push(`Based on examination: ${provisional.reasoning.fromExamination.join('; ')}.`);
    }
  } else {
    lines.push('Provisional diagnosis pending formulation after history and examination review.');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// DIFFERENTIAL DIAGNOSIS NARRATIVE
// ═══════════════════════════════════════════════════════════════
function generateDifferentialNarrative(differentials: DifferentialWithReasoning[]): string {
  const lines: string[] = [];
  lines.push('DIFFERENTIAL DIAGNOSES');
  lines.push('─'.repeat(40));

  if (differentials.length === 0) {
    lines.push('Differential diagnoses pending formulation.');
    return lines.join('\n');
  }

  for (const dd of differentials) {
    lines.push(`\n${dd.diseaseName} (${Math.round(dd.probability)}%)`);
    if (dd.reasonsFor.length > 0) {
      lines.push(`  In favour: ${dd.reasonsFor.join('; ')}.`);
    }
    if (dd.reasonsAgainst.length > 0) {
      lines.push(`  Against: ${dd.reasonsAgainst.join('; ')}.`);
    }
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

  // Key positive/negative findings
  const keyFindings: string[] = [];
  const { hpi, featureRegistry } = input;
  const complaintSymptomIds = new Set(input.chiefComplaints.map(c => c.symptomId));
  for (const [, entry] of Object.entries(featureRegistry)) {
    if (complaintSymptomIds.has(entry.id)) continue;
    if (entry.present === true) keyFindings.push(entry.id.replace(/_/g, ' '));
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
  const parts: string[] = [];

  // ── HEADER ──
  parts.push('═'.repeat(60));
  parts.push('AMEXAN — COMPLETE CLINICAL CLERKING NOTE');
  parts.push('═'.repeat(60));
  parts.push('');

  // ── 1. BIODATA ──
  parts.push('1. PATIENT DETAILS');
  parts.push('─'.repeat(40));
  parts.push(`Name: ${b.name || 'Unnamed'}`);
  parts.push(`Age: ${b.age || '?'} years`);
  parts.push(`Sex: ${b.sex}`);
  if (b.occupation) parts.push(`Occupation: ${b.occupation}`);
  if (b.residence) parts.push(`Residence: ${b.residence}`);
  if (b.informant) parts.push(`History obtained from: ${b.informant.replace(/_/g, ' ')}`);
  if (b.reliability) parts.push(`Reliability: ${b.reliability.replace(/_/g, ' ')}`);
  parts.push('');

  // ── 2. CHIEF COMPLAINTS ──
  parts.push('2. CHIEF COMPLAINTS');
  parts.push('─'.repeat(40));
  parts.push(narratives.chiefComplaintText);
  parts.push('');

  // ── 3. HISTORY OF PRESENTING ILLNESS ──
  parts.push('3. HISTORY OF PRESENTING ILLNESS');
  parts.push('─'.repeat(40));
  parts.push(narratives.hpiNarrative);
  parts.push('');

  // ── 4. PAST MEDICAL & SURGICAL HISTORY ──
  parts.push('4. PAST MEDICAL & SURGICAL HISTORY');
  parts.push('─'.repeat(40));
  parts.push(narratives.pastHistoryNarrative);
  parts.push('');

  // ── 4b. BIRTH HISTORY (Pediatric/Newborn profile) ──
  if (narratives.birthHistoryNarrative) {
    parts.push('4b. BIRTH HISTORY');
    parts.push('─'.repeat(40));
    parts.push(narratives.birthHistoryNarrative);
    parts.push('');
  }

  // ── 4c. IMMUNIZATION HISTORY (Pediatric profile) ──
  if (narratives.immunizationNarrative && narratives.immunizationNarrative !== 'Immunization history not documented.') {
    parts.push('4c. IMMUNIZATION HISTORY');
    parts.push('─'.repeat(40));
    parts.push(narratives.immunizationNarrative);
    parts.push('');
  }

  // ── 4d. GROWTH & DEVELOPMENT (Pediatric profile) ──
  if (narratives.growthDevNarrative) {
    parts.push('4d. GROWTH & DEVELOPMENT');
    parts.push('─'.repeat(40));
    parts.push(narratives.growthDevNarrative);
    parts.push('');
  }

  // ── 4e. NUTRITION HISTORY (Pediatric profile) ──
  if (narratives.nutritionNarrative) {
    parts.push('4e. NUTRITION HISTORY');
    parts.push('─'.repeat(40));
    parts.push(narratives.nutritionNarrative);
    parts.push('');
  }

  // ── 5. FAMILY & SOCIAL HISTORY ──
  parts.push('5. FAMILY & SOCIAL HISTORY');
  parts.push('─'.repeat(40));
  parts.push(narratives.familySocialNarrative);
  parts.push('');

  // ── 5b. OBSTETRIC HISTORY (OB/GYN profile) ──
  if (narratives.obstetricHistoryNarrative) {
    parts.push('5b. OBSTETRIC HISTORY');
    parts.push('─'.repeat(40));
    parts.push(narratives.obstetricHistoryNarrative);
    parts.push('');
  }

  // ── 5c. GYNECOLOGY HISTORY (OB/GYN profile) ──
  if (narratives.gynecologyHistoryNarrative) {
    parts.push('5c. GYNECOLOGY HISTORY');
    parts.push('─'.repeat(40));
    parts.push(narratives.gynecologyHistoryNarrative);
    parts.push('');
  }

  // ── 6. REVIEW OF SYSTEMS ──
  if (narratives.rosNarrative && narratives.rosNarrative !== 'Review of systems not yet completed.') {
    parts.push('6. REVIEW OF SYSTEMS');
    parts.push('─'.repeat(40));
    parts.push(narratives.rosNarrative);
    parts.push('');
  }

  // ── 7. HISTORY SUMMARY ──
  parts.push('7. HISTORY SUMMARY');
  parts.push('─'.repeat(40));
  const hpiSummary = generateHpiNarrative(input);
  const firstTwo = hpiSummary.split(/(?<=\.)\s+/).slice(0, 2).join(' ');
  parts.push(`${b.name || 'Unnamed'}, ${b.age || '?'} years, ${isMale ? 'male' : 'female'}${b.occupation ? `, ${b.occupation}` : ''}, presented with ${input.chiefComplaints.map(c => `${c.label.toLowerCase()} of ${c.duration} (${c.durationDays} days)`).join(', ')}.`);
  if (firstTwo) parts.push(firstTwo);
  const pmhHighlights: string[] = [];
  const ph = input.pastHistory;
  if (ph.chronicDiseases.length > 0) pmhHighlights.push(`Known ${ph.chronicDiseases.map(d => d.condition).join(', ')}`);
  if (ph.admissions.length > 0) pmhHighlights.push(`Previous admissions: ${ph.admissions.length}`);
  if (ph.surgeries.length > 0) pmhHighlights.push(`Previous surgeries: ${ph.surgeries.length}`);
  if (pmhHighlights.length > 0) parts.push(`PMH: ${pmhHighlights.join('; ')}.`);
  const socHighlights: string[] = [];
  const fs = input.familySocial;
  if (fs.smoking && fs.smoking !== 'never') socHighlights.push(`Smoker (${fs.smoking})`);
  if (fs.alcohol && fs.alcohol !== 'never') socHighlights.push(`Alcohol (${fs.alcohol})`);
  if (b.residence) socHighlights.push(`Lives in ${b.residence}`);
  if (socHighlights.length > 0) parts.push(`Social: ${socHighlights.join('; ')}.`);
  const redCritical = input.redFlags.filter(r => r.severity === 'critical');
  const redHigh = input.redFlags.filter(r => r.severity === 'high');
  if (redCritical.length > 0) parts.push(`⚠ Critical red flags: ${redCritical.map(r => r.message).join('; ')}.`);
  else if (redHigh.length > 0) parts.push(`⚠ Red flags: ${redHigh.map(r => r.message).join('; ')}.`);
  parts.push('');

  // ── 8. GENERAL EXAMINATION ──
  parts.push('8. GENERAL EXAMINATION');
  parts.push('─'.repeat(40));
  if (narratives.generalExaminationNarrative && narratives.generalExaminationNarrative !== 'General examination findings pending documentation.') {
    parts.push(narratives.generalExaminationNarrative);
  } else {
    parts.push('General examination findings pending documentation.');
  }
  parts.push('');

  // ── 9. SYSTEMIC EXAMINATION ──
  parts.push('9. SYSTEMIC EXAMINATION');
  parts.push('─'.repeat(40));
  if (narratives.systemExaminationNarrative && narratives.systemExaminationNarrative !== 'Systemic examination findings pending documentation.') {
    parts.push(narratives.systemExaminationNarrative);
  } else {
    parts.push('Systemic examination findings pending documentation.');
  }
  parts.push('');

  // ── 9b. OBSTETRIC EXAMINATION (pregnancy) ──
  if (narratives.obstetricExamNarrative && narratives.obstetricExamNarrative !== 'Obstetric examination not performed.') {
    parts.push('9b. OBSTETRIC EXAMINATION (Leopold\'s Maneuvers)');
    parts.push('─'.repeat(40));
    parts.push(narratives.obstetricExamNarrative);
    parts.push('');
  }

  // ── 9c. NEWBORN EXAMINATION (head-to-toe) ──
  if (narratives.newbornExamNarrative && narratives.newbornExamNarrative !== 'Newborn examination not performed.') {
    parts.push('9c. NEWBORN EXAMINATION (Head-to-Toe)');
    parts.push('─'.repeat(40));
    parts.push(narratives.newbornExamNarrative);
    parts.push('');
  }

  // ── 9d. LOCAL EXAMINATION (surgery/ortho) ──
  const hasLocal = input.localExaminations && input.localExaminations.length > 0;
  if (hasLocal) {
    parts.push('9d. LOCAL EXAMINATION');
    parts.push('─'.repeat(40));
    parts.push(narratives.localExaminationNarrative);
    parts.push('');
  }

  // ── 10. CLINICAL REASONING ──
  parts.push('10. CLINICAL REASONING');
  parts.push('─'.repeat(40));
  parts.push(narratives.clinicalReasoningNarrative);
  parts.push('');

  // ── 11. PROVISIONAL DIAGNOSIS ──
  parts.push('11. PROVISIONAL DIAGNOSIS');
  parts.push('─'.repeat(40));
  parts.push(narratives.clinicalImpressionNarrative);
  parts.push('');

  // ── 12. DIFFERENTIAL DIAGNOSES ──
  parts.push('12. DIFFERENTIAL DIAGNOSES');
  parts.push('─'.repeat(40));
  parts.push(narratives.differentialNarrative);
  parts.push('');

  // ── 13. INVESTIGATIONS REQUESTED ──
  parts.push('13. INVESTIGATIONS REQUESTED');
  parts.push('─'.repeat(40));
  parts.push(narratives.investigationPlanNarrative);
  parts.push('');

  // ── 14. INVESTIGATION INTERPRETATION ──
  const hasInterpretation = input.investigationInterpretation &&
    input.investigationInterpretation.items.length > 0;
  if (hasInterpretation) {
    parts.push('14. INVESTIGATION INTERPRETATION');
    parts.push('─'.repeat(40));
    parts.push(narratives.investigationInterpretationNarrative);
    parts.push('');
  }

  // ── 15. TREATMENT PLAN ──
  parts.push('15. TREATMENT PLAN');
  parts.push('─'.repeat(40));
  parts.push(narratives.treatmentPlanNarrative);
  parts.push('');

  // ── 16. MONITORING PLAN ──
  parts.push('16. MONITORING PLAN');
  parts.push('─'.repeat(40));
  parts.push(narratives.monitoringPlanNarrative);
  parts.push('');

  // ── 17. SUMMARY / DISPOSITION ──
  parts.push(narratives.summaryNarrative);

  return parts.join('\n');
}
