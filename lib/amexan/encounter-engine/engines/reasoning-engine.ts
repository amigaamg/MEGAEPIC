import { Answer, Biodata, ChiefComplaint, Differential, ClinicalObjective, EncounterPhase } from '../types/ces';
import { getSymptomNodeByName } from '../knowledge/symptomKnowledge';
import { getMechanism } from '../knowledge/mechanisms';
import { DDX_KNOWLEDGE_BASE, DdxDiseaseEntry } from '../knowledge/symptom-ddx-knowledge';
import type { SymptomNode, PhenotypeRule, AssessmentContext } from '../knowledge/symptom-types';

interface ReasoningInput {
  biodata: Biodata | null;
  chiefComplaints: ChiefComplaint[];
  answers: Record<string, Answer>;
  activeModules: string[];
  currentPhase: EncounterPhase;
  completedPhases: EncounterPhase[];
}

function getAnswer(answers: Record<string, Answer>, key: string): string {
  const a = answers[key];
  if (!a) return '';
  if (Array.isArray(a.value)) return (a.value as string[]).join(', ');
  return String(a.value);
}

function hasAnswer(answers: Record<string, Answer>, key: string, val?: string): boolean {
  const a = getAnswer(answers, key);
  if (val !== undefined) return a.toLowerCase().includes(val.toLowerCase());
  return a.length > 0;
}

function age(answers: Record<string, Answer>, biodata: Biodata | null): number {
  return biodata?.age || parseInt(getAnswer(answers, 'age')) || 0;
}

function sexField(answers: Record<string, Answer>, biodata: Biodata | null): string {
  return biodata?.sex || getAnswer(answers, 'sex') || '';
}

interface RedFlagRule {
  id: string;
  label: string;
  condition: (input: ReasoningInput) => boolean;
  severity: 'critical' | 'warning';
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'rf_abdominal_pain_shock',
    label: 'Abdominal pain with signs of shock — suspect perforation / rupture',
    severity: 'critical',
    condition: (i) => hasAnswer(i.answers, 'associated_symptoms', 'fever') &&
      parseInt(getAnswer(i.answers, 'pain_severity')) >= 8 &&
      age(i.answers, i.biodata) > 50,
  },
  {
    id: 'rf_ectopic',
    label: 'Female of reproductive age with abdominal pain — rule out ectopic pregnancy',
    severity: 'critical',
    condition: (i) => sexField(i.answers, i.biodata) === 'female' &&
      age(i.answers, i.biodata) >= 12 && age(i.answers, i.biodata) <= 50 &&
      hasAnswer(i.answers, 'pain_site') && !hasAnswer(i.answers, 'pregnancy_possible'),
  },
  {
    id: 'rf_chest_pain_cardiac',
    label: 'Chest pain with cardiovascular risk factors — suspect ACS',
    severity: 'critical',
    condition: (i) => hasAnswer(i.answers, 'ros_chest_pain', 'true') &&
      (hasAnswer(i.answers, 'pmh_conditions', 'Hypertension') || hasAnswer(i.answers, 'pmh_conditions', 'Diabetes')),
  },
  {
    id: 'rf_headache_neuro',
    label: 'Severe headache with neurological signs — suspect intracranial pathology',
    severity: 'critical',
    condition: (i) => hasAnswer(i.answers, 'ros_headache', 'true') &&
      hasAnswer(i.answers, 'ros_seizures', 'true'),
  },
  {
    id: 'rf_hematemesis',
    label: 'Hematemesis or melena — suspect upper GI bleed',
    severity: 'critical',
    condition: (i) => hasAnswer(i.answers, 'ros_hematemesis', 'true') ||
      hasAnswer(i.answers, 'ros_melena', 'true'),
  },
  {
    id: 'rf_pregnancy_bleeding',
    label: 'Pregnant with vaginal bleeding — rule out abruption / previa',
    severity: 'critical',
    condition: (i) => i.activeModules.includes('pregnancy') &&
      hasAnswer(i.answers, 'preg_vaginal_bleeding', 'true'),
  },
  {
    id: 'rf_pregnancy_severe_headache',
    label: 'Pregnant with severe headache — rule out pre-eclampsia',
    severity: 'critical',
    condition: (i) => i.activeModules.includes('pregnancy') &&
      hasAnswer(i.answers, 'preg_severe_headache', 'true'),
  },
  {
    id: 'rf_suicidal',
    label: 'Suicidal ideation — immediate psychiatric assessment required',
    severity: 'critical',
    condition: (i) => hasAnswer(i.answers, 'psych_suicidal', 'true'),
  },
  {
    id: 'rf_elderly_falls',
    label: 'Elderly with falls — investigate cause and assess injury',
    severity: 'warning',
    condition: (i) => i.biodata?.ageGroup === 'elderly' &&
      hasAnswer(i.answers, 'geriatric_falls', 'true'),
  },
];

const MISSING_INFO_RULES: Array<{
  id: string;
  label: string;
  condition: (input: ReasoningInput) => boolean;
  phase: EncounterPhase;
}> = [
  { id: 'miss_sex', label: 'Patient sex', condition: (i) => !i.biodata?.sex && !hasAnswer(i.answers, 'sex'), phase: 'registration' },
  { id: 'miss_age', label: 'Patient age', condition: (i) => !i.biodata?.age && !hasAnswer(i.answers, 'age'), phase: 'registration' },
  { id: 'miss_cc', label: 'Chief complaint', condition: (i) => i.chiefComplaints.length === 0 && !hasAnswer(i.answers, 'cc_primary'), phase: 'chief_complaint' },
  { id: 'miss_pain_site', label: 'Pain location', condition: (i) => i.chiefComplaints.some(c => c.complaint.toLowerCase().includes('pain')) && !hasAnswer(i.answers, 'pain_site'), phase: 'hpi' },
  { id: 'miss_pain_severity', label: 'Pain severity', condition: (i) => hasAnswer(i.answers, 'pain_site') && !hasAnswer(i.answers, 'pain_severity'), phase: 'hpi' },
  { id: 'miss_pain_character', label: 'Pain character', condition: (i) => hasAnswer(i.answers, 'pain_site') && !hasAnswer(i.answers, 'pain_character'), phase: 'hpi' },
  { id: 'miss_vitals', label: 'Vital signs', condition: (i) => !hasAnswer(i.answers, 'exam_temp'), phase: 'general_exam' },
  { id: 'miss_pmh', label: 'Past medical history', condition: (i) => !hasAnswer(i.answers, 'pmh_conditions'), phase: 'past_medical' },
  { id: 'miss_pregnancy', label: 'Pregnancy status (female of reproductive age)', condition: (i) =>
    sexField(i.answers, i.biodata) === 'female' && age(i.answers, i.biodata) >= 12 && age(i.answers, i.biodata) <= 55 &&
    !hasAnswer(i.answers, 'lmp'), phase: 'patient_context' },
  { id: 'miss_working_dx', label: 'Working diagnosis', condition: (i) => !hasAnswer(i.answers, 'working_diagnosis'), phase: 'differentials' },
  { id: 'miss_disposition', label: 'Disposition plan', condition: (i) => !hasAnswer(i.answers, 'disposition'), phase: 'disposition' },
];

export type { ReasoningInput };

function evaluatePhenotype(
  phenotype: PhenotypeRule,
  answers: Record<string, Answer>,
): { matched: boolean; score: number; supporting: string[] } {
  let matchedCount = 0;
  const supporting: string[] = [];
  for (const criterion of phenotype.criteria) {
    const ans = answers[criterion.factKey];
    if (!ans) continue;
    const val = ans.value;
    let match = false;
    switch (criterion.operator) {
      case 'eq': match = val === criterion.value; break;
      case 'neq': match = val !== criterion.value; break;
      case 'gt': match = typeof val === 'number' && val > (criterion.value as number); break;
      case 'lt': match = typeof val === 'number' && val < (criterion.value as number); break;
      case 'in': match = Array.isArray(criterion.value) && (criterion.value as string[]).includes(String(val)); break;
      case 'contains': match = String(val).toLowerCase().includes(String(criterion.value).toLowerCase()); break;
    }
    if (match) {
      matchedCount++;
      supporting.push(criterion.factKey.replace(/_/g, ' '));
    }
  }
  const ratio = phenotype.criteria.length > 0 ? matchedCount / phenotype.criteria.length : 0;
  return { matched: ratio > 0.3, score: Math.round(phenotype.probability * ratio * 100), supporting };
}

export function computeDifferentials(input: ReasoningInput): Differential[] {
  const phenotypeDdx: Differential[] = [];

  // ── UNIVERSAL: Evaluate SymptomNode phenotypes for each chief complaint ──
  for (const cc of input.chiefComplaints) {
    const node = getSymptomNodeByName(cc.complaint);
    if (!node || !node.phenotypes) continue;

    for (const phenotype of node.phenotypes) {
      const { matched, score, supporting } = evaluatePhenotype(phenotype, input.answers);
      if (!matched) continue;

      for (const dxId of phenotype.suggestsDifferentials) {
        phenotypeDdx.push({
          diseaseId: dxId.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          diseaseName: dxId,
          probability: Math.min(score + phenotype.emergencyWeight, 99),
          rank: 0,
          supporting: [...supporting, ...phenotype.suggestsMechanisms],
          against: [],
          missing: [],
          redFlag: phenotype.emergencyWeight >= 60,
        });
      }
    }
  }

  // ── GENERAL DDX FALLBACK: Knowledge base for ANY presentation ──
  const generalDdx = computeGeneralDdx(input);
  const merged = mergeDifferentials(phenotypeDdx, generalDdx);

  // ── FINAL: Re-rank and cap ──
  merged.forEach((d, i) => { d.rank = i + 1; });
  return merged.slice(0, 10);
}

export interface MechanismScore {
  mechanismId: string
  mechanismLabel: string
  category: string
  bodySystem: string
  score: number
  supportingPhenotypes: string[]
}

export function scoreMechanisms(input: ReasoningInput): MechanismScore[] {
  const mechanismScores = new Map<string, { score: number; supportingPhenotypes: string[] }>()

  for (const cc of input.chiefComplaints) {
    const node = getSymptomNodeByName(cc.complaint)
    if (!node || !node.phenotypes) continue

    for (const phenotype of node.phenotypes) {
      const { matched } = evaluatePhenotype(phenotype, input.answers)
      if (!matched) continue

      const contribution = Math.round(phenotype.probability * 100)

      for (const mechId of phenotype.suggestsMechanisms) {
        const existing = mechanismScores.get(mechId)
        if (existing) {
          existing.score += contribution
          if (!existing.supportingPhenotypes.includes(phenotype.label)) {
            existing.supportingPhenotypes.push(phenotype.label)
          }
        } else {
          mechanismScores.set(mechId, {
            score: contribution,
            supportingPhenotypes: [phenotype.label],
          })
        }
      }
    }
  }

  const results: MechanismScore[] = []
  for (const [mechId, data] of mechanismScores) {
    const def = getMechanism(mechId)
    results.push({
      mechanismId: mechId,
      mechanismLabel: def?.label || mechId,
      category: def?.category || 'unknown',
      bodySystem: def?.bodySystem || 'unknown',
      score: data.score,
      supportingPhenotypes: data.supportingPhenotypes,
    })
  }

  results.sort((a, b) => b.score - a.score)
  return results
}

function getAnswerString(answers: Record<string, Answer>, key: string): string {
  const a = answers[key]
  if (!a) return ''
  if (Array.isArray(a.value)) return (a.value as string[]).join(', ').toLowerCase()
  return String(a.value).toLowerCase()
}

function hasSymptomKey(answers: Record<string, Answer>, complaints: ChiefComplaint[], symptomKey: string): boolean {
  if (symptomKey.startsWith('cc_')) {
    const target = symptomKey.replace('cc_', '').replace(/_/g, ' ')
    return complaints.some(c => c.complaint.toLowerCase().includes(target))
  }
  if (symptomKey.startsWith('exam_')) {
    const val = getAnswerString(answers, symptomKey)
    if (!val) return false
    if (symptomKey === 'exam_temp') return false  // handled by numeric check elsewhere
    if (symptomKey === 'exam_pallor_severe') return val.includes('severe')
    if (symptomKey === 'exam_consciousness_confused') return val === 'confused'
    if (symptomKey === 'exam_consciousness_unconscious') return val === 'unconscious'
    if (val === 'true') return true
    return val.length > 0 && val !== 'none' && val !== 'no'
  }
  if (symptomKey.startsWith('pain_site_')) {
    const site = symptomKey.replace('pain_site_', '').replace(/_/g, ' ')
    const painSite = getAnswerString(answers, 'pain_site')
    return painSite.includes(site)
  }
  if (symptomKey.startsWith('associated_symptoms_')) {
    const target = symptomKey.replace('associated_symptoms_', '').replace(/_/g, ' ')
    const assoc = getAnswerString(answers, 'associated_symptoms')
    const assocArr = answers['associated_symptoms']
    if (assoc.includes(target)) return true
    if (Array.isArray(assocArr?.value)) {
      return (assocArr.value as string[]).some(v => v.toLowerCase().includes(target))
    }
    return false
  }
  if (symptomKey.startsWith('ros_')) {
    const val = getAnswerString(answers, symptomKey)
    return val === 'yes' || val === 'true'
  }
  if (symptomKey === 'recent_travel') {
    const travel = getAnswerString(answers, 'recent_travel')
    return travel.length > 0 && travel !== 'none' && travel !== 'no'
  }
  const val = getAnswerString(answers, symptomKey)
  return val === 'yes' || val === 'true' || val.length > 0
}

function getPmhList(answers: Record<string, Answer>): string[] {
  const v = answers['q_pmh_conditions']?.value
  if (Array.isArray(v)) return (v as string[]).filter(c => c !== 'None').map(c => c.toLowerCase())
  return []
}

export function computeGeneralDdx(input: ReasoningInput): Differential[] {
  const results: Differential[] = []
  const pmhList = getPmhList(input.answers)
  const age = input.biodata?.age || 0
  const sex = input.biodata?.sex || ''

  for (const disease of DDX_KNOWLEDGE_BASE) {
    // Epidemiology filter
    if (disease.epidemiology.minAge !== undefined && age < disease.epidemiology.minAge) continue
    if (disease.epidemiology.maxAge !== undefined && age > disease.epidemiology.maxAge) continue
    if (disease.epidemiology.sex && sex && disease.epidemiology.sex !== sex) continue

    let score = 0
    const supporting: string[] = []
    let hasAnySymptom = false

    // Score positive symptoms
    for (const s of disease.symptoms) {
      if (hasSymptomKey(input.answers, input.chiefComplaints, s.key)) {
        score += s.weight
        hasAnySymptom = true
        supporting.push(s.key.replace(/_/g, ' ').replace(/^(cc|ros|exam|pain site|associated symptoms) /, ''))
      }
    }

    // Must have at least one symptom match
    if (!hasAnySymptom) continue

    // Subtract negative symptoms
    for (const a of disease.against) {
      if (hasSymptomKey(input.answers, input.chiefComplaints, a.key)) {
        score -= a.weight
      }
    }

    // Risk factor bonus from PMH
    for (const rf of disease.riskFactors) {
      if (pmhList.some(p => p.includes(rf))) {
        score += 5
        supporting.push(`risk factor: ${rf}`)
      }
      if (rf === 'smoking' || rf === 'smoking_risk') {
        const smoking = getAnswerString(input.answers, 'smoking')
        if (smoking === 'current' || smoking === 'former') { score += 5; supporting.push('smoking') }
      }
      if (rf === 'alcohol') {
        const alcohol = getAnswerString(input.answers, 'alcohol')
        if (alcohol === 'heavy' || alcohol === 'regular') { score += 3; supporting.push('alcohol use') }
      }
    }

    if (score <= 0) continue

    results.push({
      diseaseId: disease.id,
      diseaseName: disease.name,
      probability: Math.min(Math.round(score * 2), 95),
      rank: 0,
      supporting: supporting.slice(0, 6),
      against: [],
      missing: [],
      redFlag: disease.emergencyWeight >= 70,
    })
  }

  results.sort((a, b) => b.probability - a.probability)
  results.forEach((d, i) => { d.rank = i + 1 })
  return results.slice(0, 10)
}

function mergeDifferentials(phenotypeDdx: Differential[], generalDdx: Differential[]): Differential[] {
  const seen = new Map<string, Differential>()
  const addOrMerge = (d: Differential) => {
    const existing = seen.get(d.diseaseId)
    if (existing) {
      existing.probability = Math.max(existing.probability, d.probability)
      existing.supporting = [...new Set([...existing.supporting, ...d.supporting])].slice(0, 6)
      if (d.redFlag) existing.redFlag = true
    } else {
      seen.set(d.diseaseId, { ...d })
    }
  }
  for (const d of phenotypeDdx) addOrMerge(d)
  for (const d of generalDdx) addOrMerge(d)
  const merged = [...seen.values()]
  merged.sort((a, b) => b.probability - a.probability)
  merged.forEach((d, i) => { d.rank = i + 1 })
  return merged
}

export function computeRedFlags(input: ReasoningInput): string[] {
  const rules = [...RED_FLAG_RULES];

  // ── UNIVERSAL: Scan reasoningHooks from all matched symptom nodes ──
  for (const cc of input.chiefComplaints) {
    const node = getSymptomNodeByName(cc.complaint);
    if (!node || !node.reasoningHooks) continue;

    for (const hook of node.reasoningHooks) {
      if (hook.action !== 'flag_red_flag') continue;

      // Evaluate the trigger: check if the referenced fact has been captured
      const factCaptured = hook.trigger.on === 'fact_captured' && hasAnswer(input.answers, hook.trigger.ref, 'true');
      const objectiveComplete = hook.trigger.on === 'objective_complete' && input.completedPhases.includes(hook.trigger.ref as EncounterPhase);

      if (factCaptured || objectiveComplete) {
        for (const label of hook.payload) {
          rules.push({
            id: `rf_symptom_${hook.id}`,
            label,
            severity: 'critical' as const,
            condition: () => true,
          });
        }
      }
    }
  }

  return rules
    .filter(r => r.condition(input))
    .map(r => `${r.severity === 'critical' ? '🚨' : '⚠️'} ${r.label}`);
}

export function computeMissingInfo(input: ReasoningInput): string[] {
  return MISSING_INFO_RULES
    .filter(r => r.condition(input))
    .map(r => r.label);
}

export function computeObjectives(
  currentPhase: EncounterPhase,
  completedPhases: EncounterPhase[],
  answers: Record<string, Answer>,
  input: ReasoningInput
): ClinicalObjective[] {
  const objectives: ClinicalObjective[] = [
    { id: 'obj_patient_id', label: 'Patient Identity', phase: 'registration', required: 4, completed: 0 },
    { id: 'obj_cc', label: 'Chief Complaint', phase: 'chief_complaint', required: 2, completed: 0 },
    { id: 'obj_pain_char', label: 'Pain Characterization', phase: 'hpi', required: 5, completed: 0 },
    { id: 'obj_safety', label: 'Safety Screening', phase: 'hpi', required: 3, completed: 0 },
    { id: 'obj_pmh', label: 'Past Medical History', phase: 'past_medical', required: 1, completed: 0 },
    { id: 'obj_exam', label: 'Physical Examination', phase: 'general_exam', required: 3, completed: 0 },
    { id: 'obj_vitals', label: 'Vital Signs', phase: 'general_exam', required: 5, completed: 0 },
    { id: 'obj_ddx', label: 'Differential Diagnosis', phase: 'differentials', required: 1, completed: 0 },
    { id: 'obj_mgt', label: 'Management Plan', phase: 'management', required: 2, completed: 0 },
    { id: 'obj_disp', label: 'Disposition', phase: 'disposition', required: 1, completed: 0 },
  ];

  if (input.activeModules.includes('pregnancy')) {
    objectives.push({ id: 'obj_preg_safety', label: 'Obstetric Safety', phase: 'review_of_systems', required: 3, completed: 0 });
  }
  if (input.activeModules.includes('psychiatry')) {
    objectives.push({ id: 'obj_psych_risk', label: 'Psychiatric Risk', phase: 'management', required: 2, completed: 0 });
  }
  if (input.biodata?.ageGroup === 'elderly') {
    objectives.push({ id: 'obj_geriatric', label: 'Geriatric Assessment', phase: 'functional_assessment', required: 3, completed: 0 });
  }

  const phaseCompletedMap: Record<string, boolean> = {};
  for (const p of completedPhases) {
    phaseCompletedMap[p] = true;
  }

  for (const obj of objectives) {
    const completed = phaseCompletedMap[obj.phase] ? obj.required : 0;
    obj.completed = completed;
  }

  return objectives;
}
