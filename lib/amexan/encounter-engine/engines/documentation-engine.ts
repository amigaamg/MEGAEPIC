import { Answer, Biodata, ChiefComplaint, TimelineEntry } from '../types/ces';
import { generateAiHpiNarrative } from '../ai/nvidia-service';
import { getSymptomNode } from '../knowledge/symptomKnowledge';
import type { StructuredFact, DocumentationRule, AssessmentFormat, SectionState, SymptomNode } from '../knowledge/symptom-types';

export interface HpiNarrativeContext {
  biodata: Biodata | null;
  chiefComplaints: ChiefComplaint[];
  answers: Record<string, Answer>;
  useAi?: boolean;
}

function safe(biodata: Biodata | null, field: keyof Biodata): string {
  const val = biodata?.[field];
  if (val === undefined || val === null || val === '') return '';
  return String(val);
}

function getAnswer(answers: Record<string, Answer>, key: string): string {
  const a = answers[key];
  if (!a) return '';
  if (Array.isArray(a.value)) return (a.value as string[]).join(', ');
  return String(a.value);
}

function findInAnswer(answers: Record<string, Answer>, key: string, search: string): boolean {
  const val = getAnswer(answers, key);
  return val.toLowerCase().includes(search.toLowerCase());
}

export function generateHpiNarrative(ctx: HpiNarrativeContext): string {
  const { biodata, chiefComplaints, answers } = ctx;
  const name = safe(biodata, 'patientName') || 'The patient';
  const age = safe(biodata, 'age');
  const sex = safe(biodata, 'sex');
  const occ = safe(biodata, 'occupation');
  const residence = safe(biodata, 'residence');

  const parts: string[] = [];

  const gender = sex === 'male' ? 'He' : 'She';

  const hasChronicIllness = getAnswer(answers, 'pmh_conditions') !== 'None' && getAnswer(answers, 'pmh_conditions') !== '';

  const introBits: string[] = [];
  if (name) introBits.push(name);
  if (age) introBits.push(`${age}-year-old`);
  if (occ) introBits.push(occ);
  if (residence) introBits.push(`residing in ${residence}`);

  const intro: string[] = [];
  if (introBits.length > 0) {
    const chronicState = hasChronicIllness
      ? `with a history of ${getAnswer(answers, 'pmh_conditions')}`
      : 'with no known chronic illness';
    intro.push(`${introBits.join(' ')}, ${chronicState}.`);
  }

  const ccPrimary = chiefComplaints.find(c => c.primary)?.complaint || getAnswer(answers, 'cc_primary');
  const ccDuration = chiefComplaints.find(c => c.primary)?.duration || getAnswer(answers, 'cc_duration');
  const ccOnset = chiefComplaints.find(c => c.primary)?.onset || getAnswer(answers, 'cc_onset');

  if (ccPrimary) {
    const wasWell = 'who was in usual state of good health';
    const durationPart = ccDuration ? ` ${ccDuration}` : '';
    const onsetPart = ccOnset ? ` ${ccOnset}` : '';
    intro.push(`${wasWell} until${onsetPart || ` approximately ${ccDuration} ago`}, when ${gender.toLowerCase()} developed ${ccPrimary.toLowerCase()}${durationPart}.`);
  }

  if (intro.length > 0) {
    parts.push(intro.join(' '));
  }

  // Delegate to constitutional path when symptom node documentation rules are available
  const complaintIds = chiefComplaints.map(c => c.id);
  const constitutionalPart = generateConstitutionalHpiNarrative(complaintIds, []);
  if (constitutionalPart) {
    parts.push(constitutionalPart);
  }

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return 'No history details captured yet.';
}

export function generateTimeline(
  chiefComplaints: ChiefComplaint[],
  answers: Record<string, Answer>
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  const now = new Date();

  for (const cc of chiefComplaints) {
    const days = parseDurationToDays(cc.duration);
    if (days > 0) {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      const ts = d.getTime();
      entries.push({
        id: `tl_${cc.id || ts}`,
        date: d.toISOString().split('T')[0],
        relative: `${days} days ago`,
        events: [cc.complaint],
        timestamp: ts,
      });
    }
  }

  entries.sort((a, b) => a.timestamp - b.timestamp);
  const nowTs = now.getTime();
  entries.push({
    id: 'tl_today',
    date: now.toISOString().split('T')[0],
    relative: 'Today',
    events: ['Presented to healthcare facility'],
    timestamp: nowTs,
  });

  return entries;
}

export async function generateEnhancedHpiNarrative(ctx: HpiNarrativeContext): Promise<string> {
  const { biodata, chiefComplaints, answers } = ctx;

  const ccPrimary = chiefComplaints.find(c => c.primary);
  const answersMap: Record<string, string> = {};
  for (const [key, a] of Object.entries(answers)) {
    if (Array.isArray(a.value)) {
      answersMap[key] = (a.value as string[]).join(', ');
    } else {
      answersMap[key] = String(a.value);
    }
  }

  const aiResult = await generateAiHpiNarrative({
    patientName: biodata?.patientName,
    age: biodata?.age,
    sex: biodata?.sex,
    occupation: biodata?.occupation,
    residence: biodata?.residence,
    chiefComplaint: ccPrimary?.complaint || answersMap['cc_primary'] || '',
    duration: ccPrimary?.duration || answersMap['cc_duration'],
    onset: ccPrimary?.onset || answersMap['cc_onset'],
    patientWords: ccPrimary?.patientWords || answersMap['cc_patient_words'],
    answers: answersMap,
  });

  if (aiResult.hpi) {
    return aiResult.hpi;
  }

  return generateHpiNarrative(ctx);
}

function parseDurationToDays(duration: string): number {
  if (!duration) return 0;
  const lower = duration.toLowerCase();
  const num = parseInt(duration) || 0;
  if (lower.includes('day') || lower.includes('d')) return num || 1;
  if (lower.includes('week') || lower.includes('wk')) return (num || 1) * 7;
  if (lower.includes('month') || lower.includes('mo')) return (num || 1) * 30;
  if (lower.includes('hour') || lower.includes('hr')) return 0;
  if (lower.includes('year') || lower.includes('yr')) return (num || 1) * 365;
  return num || 0;
}

export function generateExamNarrative(answers: Record<string, Answer>): string {
  const sections: string[] = [];

  // General examination
  const consciousness = getAnswer(answers, 'exam_consciousness');
  const build = getAnswer(answers, 'exam_build');
  const dehydration = getAnswer(answers, 'exam_dehydration');
  const jaundice = getAnswer(answers, 'exam_jaundice');
  const pallor = getAnswer(answers, 'exam_pallor');
  if (consciousness || build || dehydration) {
    const parts: string[] = [];
    if (consciousness) parts.push(`Patient is ${consciousness.toLowerCase()}`);
    if (build) parts.push(`build is ${build.toLowerCase()}`);
    if (dehydration && dehydration !== 'None') parts.push(`${dehydration.toLowerCase()} dehydration`);
    if (jaundice === 'true') parts.push('jaundiced');
    if (pallor && pallor !== 'None') parts.push(`${pallor.toLowerCase()} pallor`);
    sections.push(`General examination: ${parts.join(', ')}.`);
  }

  // Vital signs
  const temp = getAnswer(answers, 'exam_temp');
  const pulse = getAnswer(answers, 'exam_pulse');
  const bpSys = getAnswer(answers, 'exam_bp_systolic');
  const bpDia = getAnswer(answers, 'exam_bp_diastolic');
  const rr = getAnswer(answers, 'exam_rr');
  const o2 = getAnswer(answers, 'exam_o2_sat');
  if (temp || pulse || bpSys || rr) {
    const parts: string[] = [];
    if (temp) parts.push(`T ${temp}°C`);
    if (pulse) parts.push(`HR ${pulse}/min`);
    if (bpSys) parts.push(`BP ${bpSys}/${bpDia || '?'} mmHg`);
    if (rr) parts.push(`RR ${rr}/min`);
    if (o2) parts.push(`SpO₂ ${o2}%`);
    sections.push(`Vitals: ${parts.join(', ')}.`);
  }

  // Abdominal examination
  const abdShape = getAnswer(answers, 'abd_inspect_shape');
  const abdScars = getAnswer(answers, 'abd_inspect_scars');
  const abdBowel = getAnswer(answers, 'abd_ausc_bowel_sounds');
  const abdTenderness = getAnswer(answers, 'abd_palp_tenderness');
  const abdGuarding = getAnswer(answers, 'abd_palp_guarding');
  if (abdShape || abdBowel || abdTenderness) {
    const parts: string[] = [];
    if (abdShape) parts.push(`abdomen ${abdShape.toLowerCase()}`);
    if (abdScars && abdScars !== 'None') parts.push(`scars: ${abdScars}`);
    if (abdBowel) parts.push(`bowel sounds ${abdBowel.toLowerCase()}`);
    if (abdTenderness && abdTenderness !== 'None') parts.push(`tenderness: ${abdTenderness.toLowerCase()}`);
    if (abdGuarding && abdGuarding !== 'None') parts.push(`guarding: ${abdGuarding.toLowerCase()}`);
    sections.push(`Abdominal examination: ${parts.join(', ')}.`);
  }

  // Cardiovascular examination
  const jvp = getAnswer(answers, 'cvs_jvp');
  const apex = getAnswer(answers, 'cvs_apex');
  const s1 = getAnswer(answers, 'cvs_s1');
  const s2 = getAnswer(answers, 'cvs_s2');
  const murmurs = getAnswer(answers, 'cvs_murmurs');
  if (jvp || s1 || murmurs) {
    const parts: string[] = [];
    if (jvp && jvp !== 'Not elevated') parts.push(`JVP ${jvp.toLowerCase()}`);
    if (apex && apex !== 'Normal (5th ICS MCL)') parts.push(`apex ${apex.toLowerCase()}`);
    if (s1 && s1 !== 'Normal') parts.push(`S1 ${s1.toLowerCase()}`);
    if (s2 && s2 !== 'Normal') parts.push(`S2 ${s2.toLowerCase()}`);
    if (murmurs && murmurs !== 'None') parts.push(`murmur: ${murmurs.toLowerCase()}`);
    sections.push(`Cardiovascular examination: ${parts.join(', ')}.`);
  }

  // Respiratory examination
  const respSym = getAnswer(answers, 'resp_symmetry');
  const breathSounds = getAnswer(answers, 'resp_breath_sounds');
  const wheeze = getAnswer(answers, 'resp_wheeze');
  const crackles = getAnswer(answers, 'resp_crackles');
  if (respSym || breathSounds) {
    const parts: string[] = [];
    if (respSym) parts.push(`chest ${respSym.toLowerCase()}`);
    if (breathSounds) parts.push(`breath sounds ${breathSounds.toLowerCase()}`);
    if (wheeze && wheeze !== 'None') parts.push(`wheezes: ${wheeze.toLowerCase()}`);
    if (crackles && crackles !== 'None') parts.push(`crackles: ${crackles.toLowerCase()}`);
    sections.push(`Respiratory examination: ${parts.join(', ')}.`);
  }

  // Neurological examination
  const pupils = getAnswer(answers, 'neuro_pupils');
  const tone = getAnswer(answers, 'neuro_tone');
  const powerArms = getAnswer(answers, 'neuro_power_arms');
  const powerLegs = getAnswer(answers, 'neuro_power_legs');
  const gait = getAnswer(answers, 'neuro_gait');
  if (pupils || tone || powerArms) {
    const parts: string[] = [];
    if (pupils && pupils !== 'Equal & reactive') parts.push(`pupils ${pupils.toLowerCase()}`);
    if (tone && tone !== 'Normal') parts.push(`tone ${tone.toLowerCase()}`);
    if (powerArms && powerArms !== '5/5') parts.push(`power UL ${powerArms}`);
    if (powerLegs && powerLegs !== '5/5') parts.push(`power LL ${powerLegs}`);
    if (gait && gait !== 'Normal') parts.push(`gait: ${gait.toLowerCase()}`);
    sections.push(`Neurological examination: ${parts.join(', ')}.`);
  }

  // Rectal examination
  const rectalTone = getAnswer(answers, 'rectal_tone');
  const rectalMass = getAnswer(answers, 'rectal_mass');
  if (rectalTone || rectalMass === 'true') {
    const parts: string[] = [];
    if (rectalTone && rectalTone !== 'Normal') parts.push(`tone ${rectalTone.toLowerCase()}`);
    if (rectalMass === 'true') parts.push('palpable mass');
    sections.push(`Rectal examination: ${parts.join(', ')}.`);
  }

  if (sections.length === 0) return '';

  return sections.join(' ');
}

export function generateProblemList(
  chiefComplaints: ChiefComplaint[],
  answers: Record<string, Answer>
): string[] {
  const problems: string[] = [];
  for (const cc of chiefComplaints) {
    problems.push(cc.complaint);
  }
  const assoc = getAnswer(answers, 'associated_symptoms');
  if (assoc) {
    for (const s of assoc.split(', ')) {
      const trimmed = s.trim();
      if (trimmed && !problems.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
        problems.push(trimmed);
      }
    }
  }
  return problems;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTITUTIONAL DOCUMENTATION ENGINE (UCAEM-SB-014)
// Generates narrative from SymptomNode documentation rules + captured facts.
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConstitutionalDocInput {
  complaintId: string
  facts: StructuredFact[]
  format: AssessmentFormat
  sectionStates: Record<string, SectionState>
}

export function generateSectionNarrative(
  sectionId: string,
  facts: StructuredFact[],
): string {
  const factMap = new Map<string, StructuredFact>();
  for (const f of facts) {
    factMap.set(f.key, f);
  }

  const parts: string[] = [];

  // Generate narrative from documentation phrases on facts
  for (const f of facts) {
    if (f.type === 'reported' && f.documentationPhrase) {
      const phrase = f.documentationPhrase
        .replace(/\{\{value\}\}/g, String(f.value))
        .replace(/\{\{(\w+)\}\}/g, (_, key) => {
          const ref = factMap.get(key);
          return ref ? String(ref.value) : `{{${key}}}`;
        });
      if (phrase && !parts.includes(phrase)) {
        parts.push(phrase);
      }
    }
  }

  return parts.join(' ');
}

export function generateConstitutionalHpiNarrative(
  complaintIds: string[],
  facts: StructuredFact[],
): string {
  const parts: string[] = [];

  for (const complaintId of complaintIds) {
    const symptomId = complaintId.startsWith('SX') ? complaintId : undefined;
    const node = symptomId ? getSymptomNode(symptomId) : undefined;

    if (node) {
      const docParts: string[] = [];
      const sortedRules = [...node.documentation].sort((a, b) => a.priority - b.priority);

      for (const rule of sortedRules) {
        const matchingFacts = facts.filter(f => f.key === rule.condition.factKey);
        for (const fact of matchingFacts) {
          if (evaluateDocCondition(rule, fact)) {
            const phrase = rule.template.replace(
              /\{\{(\w+)\}\}/g,
              (_, key) => {
                const ref = facts.find(f => f.key === key);
                return ref ? String(ref.value) : `{{${key}}}`;
              },
            );
            if (phrase && !docParts.includes(phrase)) {
              docParts.push(phrase);
            }
          }
        }
      }

      if (docParts.length > 0) {
        parts.push(docParts.join(' '));
      } else {
        // No documentation rules matched — fall back to fact documentation phrases
        const sectionFacts = facts.filter(f => f.questionId.startsWith(complaintId.slice(0, 4)));
        if (sectionFacts.length > 0) {
          const narrative = generateSectionNarrative(complaintId, sectionFacts);
          if (narrative) parts.push(narrative);
        }
      }
    } else {
      // Fallback: use fact documentation phrases
      const sectionFacts = facts.filter(f => f.questionId.startsWith(complaintId.slice(0, 4)));
      if (sectionFacts.length > 0) {
        const narrative = generateSectionNarrative(complaintId, sectionFacts);
        if (narrative) parts.push(narrative);
      }
    }
  }

  return parts.join('\n');
}

export function generateUniversalHpiNarrative(
  biodata: any,
  chiefComplaints: { complaint: string; symptomId?: string }[],
  facts: StructuredFact[],
  symptomMap?: Record<string, SymptomNode>
): string {
  const parts: string[] = [];

  const name = biodata?.patientName || 'The patient';
  const age = biodata?.age || '';
  const sex = biodata?.sex || '';
  const occ = biodata?.occupation || '';
  const residence = biodata?.residence || '';

  const gender = sex === 'male' ? 'He' : 'She';

  const introBits: string[] = [];
  if (name) introBits.push(name);
  if (age) introBits.push(`${age}-year-old`);
  if (occ) introBits.push(occ);
  if (residence) introBits.push(`residing in ${residence}`);

  if (introBits.length > 0) {
    const complaintList = chiefComplaints.map(c => c.complaint).filter(Boolean);
    const chronicState = biodata?.pmh_conditions
      ? `with a history of ${biodata.pmh_conditions}`
      : 'with no known chronic illness';
    if (complaintList.length > 0) {
      const last = complaintList.pop()!;
      const list = complaintList.length > 0 ? `${complaintList.join(', ')} and ${last}` : last;
      parts.push(`${introBits.join(' ')}, ${chronicState}, who was in usual state of good health until ${gender.toLowerCase()} developed ${list}.`);
    }
  }

  // For each complaint, use constitutional path if symptom node is available
  for (const cc of chiefComplaints) {
    const symptomId = cc.symptomId;
    const node = symptomId
      ? (symptomMap ? symptomMap[symptomId] : getSymptomNode(symptomId))
      : undefined;

    if (node) {
      const narrative = generateConstitutionalHpiNarrative([symptomId!], facts);
      if (narrative) parts.push(narrative);
    } else {
      // Fall back to section narrative from facts
      const sectionFacts = facts.filter(f => f.questionId && f.questionId.toLowerCase().includes(cc.complaint.toLowerCase().replace(/\s+/g, '_')));
      if (sectionFacts.length > 0) {
        const narrative = generateSectionNarrative(cc.complaint, sectionFacts);
        if (narrative) parts.push(narrative);
      }
    }
  }

  if (parts.length > 0) return parts.join(' ');

  return `${name} presents with ${chiefComplaints.map(c => c.complaint).join(', ')}.`;
}

function evaluateDocCondition(rule: DocumentationRule, fact: StructuredFact): boolean {
  switch (rule.condition.operator) {
    case 'present':
      return fact.value !== undefined && fact.value !== null && fact.value !== '';
    case 'absent':
      return fact.value === undefined || fact.value === null || fact.value === '';
    case 'eq':
      return fact.value === rule.condition.value;
    case 'neq':
      return fact.value !== rule.condition.value;
    default:
      return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CQAE SECTION NARRATIVE GENERATORS (UCAEM-CQAE-003)
// Each section generator produces natural-language text from captured answers.
// ═══════════════════════════════════════════════════════════════════════════════

function getSectionAnswer(answers: Record<string, Answer>, key: string): string {
  const a = answers[key];
  if (!a) return '';
  if (Array.isArray(a.value)) return (a.value as string[]).join(', ');
  return String(a.value);
}

function hasAnswer(answers: Record<string, Answer>, key: string): boolean {
  const a = answers[key];
  return a !== undefined && a.value !== '' && a.value !== null;
}

function valInArray(answers: Record<string, Answer>, key: string, search: string): boolean {
  const a = answers[key];
  if (!a || !Array.isArray(a.value)) return false;
  return (a.value as string[]).some(v => v.toLowerCase() === search.toLowerCase());
}

function valIs(answers: Record<string, Answer>, key: string, expected: string | boolean): boolean {
  const a = answers[key];
  if (!a) return false;
  if (typeof expected === 'boolean') return a.value === expected;
  return String(a.value).toLowerCase() === String(expected).toLowerCase();
}

/** PMH + PSH combined section */
export function generatePastMedicalSurgicalNarrative(answers: Record<string, Answer>): string {
  const parts: string[] = [];

  // ── Chronic Medical Conditions ──
  const pmhHas = getSectionAnswer(answers, 'pmh_has_conditions');
  const conditions = getSectionAnswer(answers, 'pmh_conditions');
  if (conditions && conditions !== 'None') {
    const condList = conditions.split(', ');
    const details: string[] = [];
    for (const c of condList) {
      const trimmed = c.trim();
      if (!trimmed || trimmed === 'None') continue;
      const detail = generateConditionDetail(trimmed, answers);
      details.push(detail);
    }
    if (details.length > 0) {
      parts.push(`Known conditions: ${details.join('; ')}.`);
    } else {
      parts.push('No known chronic medical illnesses such as hypertension, diabetes, tuberculosis, or other chronic conditions.');
    }
  } else if (conditions === 'None' || pmhHas === 'None') {
    parts.push('No known chronic medical illnesses such as hypertension, diabetes, tuberculosis, or other chronic conditions.');
  }

  // ── Previous Hospital Admissions ──
  const prevAdmission = getSectionAnswer(answers, 'prev_admission');
  if (prevAdmission === 'Yes') {
    const hospital = getSectionAnswer(answers, 'prev_admission_hospital');
    const year = getSectionAnswer(answers, 'prev_admission_year');
    const reason = getSectionAnswer(answers, 'prev_admission_reason');
    const dur = getSectionAnswer(answers, 'prev_admission_duration');
    const outcome = getSectionAnswer(answers, 'prev_admission_outcome');
    const items: string[] = ['Previous admission'];
    if (hospital) items.push(`at ${hospital}`);
    if (year) items.push(`(${year})`);
    if (reason) items.push(`for ${reason.toLowerCase()}`);
    if (dur) items.push(`duration ${dur.toLowerCase()}`);
    if (outcome) items.push(`outcome: ${outcome.toLowerCase()}`);
    parts.push(`${items.join(' ')}.`);
  } else if (prevAdmission === 'No') {
    parts.push('No previous hospital admissions reported.');
  }

  // ── Previous Serious Acute Illnesses ──
  const seriousIllness = getSectionAnswer(answers, 'prev_serious_illness');
  if (seriousIllness === 'Yes') {
    const illType = getSectionAnswer(answers, 'prev_serious_illness_type');
    const illYear = getSectionAnswer(answers, 'prev_serious_illness_year');
    const illComp = getSectionAnswer(answers, 'prev_serious_illness_complications');
    const items: string[] = ['Previous significant illness'];
    if (illType) items.push(`: ${illType.toLowerCase()}`);
    if (illYear) items.push(`(${illYear})`);
    if (illComp) items.push(`complicated by ${illComp.toLowerCase()}`);
    parts.push(`${items.join(' ')}.`);
  }

  // ── Surgical History ──
  const psh = answers['q_psh_previous_surgery'];
  if (psh) {
    if (psh.value === true) {
      const details = getSectionAnswer(answers, 'psh_details');
      const comp = getSectionAnswer(answers, 'psh_complications');
      const transfusion = getSectionAnswer(answers, 'blood_transfusion');
      const anaesthetic = getSectionAnswer(answers, 'anaesthetic_issues');
      const items: string[] = [];
      if (details) items.push(details);
      else items.push('previous surgery (details pending)');
      if (comp && comp !== 'None') items.push(`complicated by ${comp}`);
      if (transfusion === 'true') items.push('received blood transfusion');
      if (anaesthetic) items.push(`anaesthetic issues: ${anaesthetic}`);
      parts.push(`Surgical history: ${items.join('; ')}.`);
    } else if (psh.value === false) {
      parts.push('No previous surgical history.');
    }
  }

  // ── Implants / Devices / Transplants ──
  const implants = getSectionAnswer(answers, 'implants_devices');
  if (implants && implants !== 'None') {
    const year = getSectionAnswer(answers, 'implant_year');
    const implantItems: string[] = [`Implanted devices: ${implants}`];
    if (year) implantItems.push(`(since ${year})`);
    parts.push(`${implantItems.join(' ')}.`);
  }
  const ostomy = answers['q_psh_ostomy'];
  if (ostomy?.value === true) parts.push('Has a stoma (colostomy/ileostomy).');
  const amputation = answers['q_psh_amputation'];
  if (amputation?.value === true) parts.push('Has an amputation.');
  const transplant = answers['q_psh_transplant'];
  if (transplant?.value === true) {
    const organ = getSectionAnswer(answers, 'transplant_organ');
    const txYear = getSectionAnswer(answers, 'transplant_year');
    const txItems: string[] = ['History of organ transplant'];
    if (organ) txItems.push(`(${organ})`);
    if (txYear) txItems.push(`since ${txYear}`);
    parts.push(`${txItems.join(' ')}.`);
  }

  return parts.length > 0 ? parts.join(' ') : '';
}

function generateConditionDetail(condition: string, answers: Record<string, Answer>): string {
  const cLower = condition.toLowerCase();
  if (cLower.includes('hypertension') || cLower === 'hypertension') {
    const year = getSectionAnswer(answers, 'htn_year');
    const treatment = getSectionAnswer(answers, 'htn_treatment');
    const compliance = getSectionAnswer(answers, 'htn_compliance');
    const control = getSectionAnswer(answers, 'htn_control');
    let s = condition;
    if (year) s += ` (since ${year})`;
    if (treatment === 'true' || treatment === 'Yes') {
      s += ', on treatment';
      if (compliance) s += `, compliance ${compliance.toLowerCase()}`;
      if (control) s += `, ${control.toLowerCase()}`;
    } else if (treatment === 'false' || treatment === 'No') {
      s += ', not on treatment';
    }
    return s;
  }
  if (cLower.includes('diabetes') || cLower === 'diabetes') {
    const year = getSectionAnswer(answers, 'dm_year');
    const type = getSectionAnswer(answers, 'dm_type');
    const treatment = getSectionAnswer(answers, 'dm_treatment');
    const comp = getSectionAnswer(answers, 'dm_complications');
    let s = condition;
    if (type) s += ` (${type})`;
    if (year) s += ` since ${year}`;
    if (treatment) s += `, on ${treatment.toLowerCase()}`;
    if (comp && comp !== 'None') s += `, complicated by ${comp.toLowerCase()}`;
    return s;
  }
  if (cLower === 'asthma') {
    const ageDx = getSectionAnswer(answers, 'asthma_age_diagnosis');
    const sev = getSectionAnswer(answers, 'asthma_severity');
    const triggers = getSectionAnswer(answers, 'asthma_triggers');
    const control = getSectionAnswer(answers, 'asthma_control');
    const lastExac = getSectionAnswer(answers, 'asthma_last_exacerbation');
    let s = 'Asthma';
    if (ageDx) s += ` (diagnosed age ${ageDx})`;
    if (sev) s += `, ${sev.toLowerCase()}`;
    if (control) s += `, ${control.toLowerCase()}`;
    if (triggers) s += `; triggers: ${triggers}`;
    if (lastExac) s += `; last exacerbation: ${lastExac}`;
    return s;
  }
  if (cLower === 'tb') {
    const year = getSectionAnswer(answers, 'tb_year');
    const site = getSectionAnswer(answers, 'tb_site');
    const completed = getSectionAnswer(answers, 'tb_treatment_completed');
    const resistance = getSectionAnswer(answers, 'tb_drug_resistance');
    let s = 'TB';
    if (year) s += ` (${year})`;
    if (site) s += `, ${site.toLowerCase()}`;
    if (completed === 'true') s += ', treatment completed';
    else if (completed === 'false') s += ', treatment incomplete';
    if (resistance && resistance !== 'None') s += `, ${resistance}`;
    return s;
  }
  if (cLower === 'hiv') {
    const year = getSectionAnswer(answers, 'hiv_year');
    const onArt = getSectionAnswer(answers, 'hiv_on_art');
    const regimen = getSectionAnswer(answers, 'hiv_art_regimen');
    const cd4 = getSectionAnswer(answers, 'hiv_latest_cd4');
    const vl = getSectionAnswer(answers, 'hiv_latest_viral_load');
    const oi = getSectionAnswer(answers, 'hiv_oi_history');
    let s = 'HIV';
    if (year) s += ` (diagnosed ${year})`;
    if (onArt === 'true') {
      s += ', on ART';
      if (regimen) s += ` (${regimen})`;
    } else if (onArt === 'false') {
      s += ', not on ART';
    }
    if (cd4) s += `, CD4 ${cd4}`;
    if (vl) s += `, VL ${vl.toLowerCase()}`;
    if (oi && oi !== 'None') s += `; OIs: ${oi}`;
    return s;
  }
  if (cLower === 'sickle cell') {
    const genotype = getSectionAnswer(answers, 'scd_genotype');
    const freq = getSectionAnswer(answers, 'scd_crisis_frequency');
    const comp = getSectionAnswer(answers, 'scd_complications');
    const huu = getSectionAnswer(answers, 'scd_hydroxyurea');
    const trans = getSectionAnswer(answers, 'scd_transfusion_program');
    let s = 'Sickle cell disease';
    if (genotype) s += ` (${genotype})`;
    if (freq) s += `, crises ${freq.toLowerCase()}`;
    if (comp && comp !== 'None') s += `, complicated by ${comp.toLowerCase()}`;
    if (huu === 'true') s += ', on hydroxyurea';
    if (trans === 'true') s += ', on chronic transfusion program';
    return s;
  }
  if (cLower === 'ckd') {
    const stage = getSectionAnswer(answers, 'ckd_stage');
    const etiology = getSectionAnswer(answers, 'ckd_etiology');
    const egfr = getSectionAnswer(answers, 'ckd_latest_egfr');
    const dialysis = getSectionAnswer(answers, 'ckd_dialysis');
    const transplant = getSectionAnswer(answers, 'ckd_transplant');
    let s = 'CKD';
    if (stage) s += ` (${stage})`;
    if (etiology) s += `, etiology: ${etiology.toLowerCase()}`;
    if (egfr) s += `, eGFR ${egfr}`;
    if (dialysis === 'true') s += ', on dialysis';
    if (transplant === 'true') s += ', post-transplant';
    return s;
  }
  if (cLower === 'cancer') {
    const primary = getSectionAnswer(answers, 'cancer_primary');
    const year = getSectionAnswer(answers, 'cancer_year');
    const treatment = getSectionAnswer(answers, 'cancer_treatment');
    const status = getSectionAnswer(answers, 'cancer_status');
    let s = primary ? `Cancer (${primary})` : 'Cancer';
    if (year) s += ` (${year})`;
    if (treatment) s += `, treated with ${treatment.toLowerCase()}`;
    if (status) s += `, currently ${status.toLowerCase()}`;
    return s;
  }
  if (cLower === 'epilepsy') {
    const ageOnset = getSectionAnswer(answers, 'epilepsy_age_onset');
    const type = getSectionAnswer(answers, 'epilepsy_seizure_type');
    const freq = getSectionAnswer(answers, 'epilepsy_frequency');
    const last = getSectionAnswer(answers, 'epilepsy_last_seizure');
    let s = 'Epilepsy';
    if (type) s += ` (${type.toLowerCase()})`;
    if (ageOnset) s += `, onset age ${ageOnset}`;
    if (freq) s += `, frequency ${freq.toLowerCase()}`;
    if (last) s += `, last seizure ${last}`;
    return s;
  }
  if (cLower === 'heart disease') {
    const type = getSectionAnswer(answers, 'heart_disease_type');
    const year = getSectionAnswer(answers, 'heart_disease_year');
    const nyha = getSectionAnswer(answers, 'heart_disease_nyha');
    const surgery = getSectionAnswer(answers, 'heart_disease_surgery');
    let s = 'Heart disease';
    if (type) s += ` (${type.toLowerCase()})`;
    if (year) s += ` since ${year}`;
    if (nyha) s += `, NYHA ${nyha}`;
    if (surgery === 'true') s += ', post-cardiac surgery';
    return s;
  }
  if (cLower === 'stroke') {
    const year = getSectionAnswer(answers, 'stroke_year');
    const type = getSectionAnswer(answers, 'stroke_type');
    const residual = getSectionAnswer(answers, 'stroke_residual');
    let s = 'Stroke';
    if (year) s += ` (${year})`;
    if (type) s += `, ${type.toLowerCase()}`;
    if (residual && residual !== 'None') s += `, residual: ${residual.toLowerCase()}`;
    return s;
  }
  if (cLower === 'liver disease') {
    const etiology = getSectionAnswer(answers, 'liver_disease_etiology');
    const comp = getSectionAnswer(answers, 'liver_disease_complications');
    let s = 'Liver disease';
    if (etiology) s += ` (${etiology.toLowerCase()})`;
    if (comp && comp !== 'None') s += `, complicated by ${comp.toLowerCase()}`;
    return s;
  }
  if (cLower === 'copd') {
    const year = getSectionAnswer(answers, 'copd_year');
    const stage = getSectionAnswer(answers, 'copd_gold_stage');
    const exac = getSectionAnswer(answers, 'copd_exacerbations');
    const o2 = getSectionAnswer(answers, 'copd_home_o2');
    let s = 'COPD';
    if (year) s += ` (since ${year})`;
    if (stage) s += `, ${stage.toLowerCase()}`;
    if (exac) s += `, ${exac} exacerbations in past year`;
    if (o2 === 'true') s += ', on home oxygen';
    return s;
  }
  if (cLower === 'thyroid') {
    const type = getSectionAnswer(answers, 'thyroid_type');
    const treatment = getSectionAnswer(answers, 'thyroid_treatment');
    let s = type || 'Thyroid disease';
    if (treatment) s += `, on ${treatment.toLowerCase()}`;
    return s;
  }
  if (cLower === 'anemia') {
    const type = getSectionAnswer(answers, 'anemia_type');
    const sev = getSectionAnswer(answers, 'anemia_severity');
    const hb = getSectionAnswer(answers, 'anemia_latest_hb');
    let s = 'Anemia';
    if (type) s += ` (${type.toLowerCase()})`;
    if (hb) s += `, Hb ${hb}`;
    else if (sev) s += `, ${sev.toLowerCase()}`;
    return s;
  }
  if (cLower === 'peptic ulcer') {
    const year = getSectionAnswer(answers, 'pud_year');
    const hp = getSectionAnswer(answers, 'pud_hpylori_treated');
    const comp = getSectionAnswer(answers, 'pud_complications');
    let s = 'Peptic ulcer disease';
    if (year) s += ` (since ${year})`;
    if (hp === 'true') s += ', H. pylori treated';
    if (comp && comp !== 'None') s += `, complicated by ${comp.toLowerCase()}`;
    return s;
  }
  if (cLower === 'cerebral palsy') {
    const type = getSectionAnswer(answers, 'cp_type');
    const topo = getSectionAnswer(answers, 'cp_topography');
    const gmfcs = getSectionAnswer(answers, 'cp_gmfcs');
    const mobility = getSectionAnswer(answers, 'cp_mobility');
    const speech = getSectionAnswer(answers, 'cp_speech');
    const feed = getSectionAnswer(answers, 'cp_feeding');
    const seizures = getSectionAnswer(answers, 'cp_seizures');
    const cognition = getSectionAnswer(answers, 'cp_cognition');
    const therapies = getSectionAnswer(answers, 'cp_therapies');
    const ortho = getSectionAnswer(answers, 'cp_orthopedic');
    let s = 'Cerebral palsy';
    if (type) s += ` (${type.toLowerCase()}`;
    if (topo) s += `, ${topo.toLowerCase()}`;
    if (type) s += ')';
    if (gmfcs) s += `, GMFCS ${gmfcs}`;
    if (mobility) s += `, ${mobility.toLowerCase()}`;
    if (speech && speech !== 'Normal') s += `, speech: ${speech.toLowerCase()}`;
    if (feed && feed !== 'None') s += `, feeding: ${feed.toLowerCase()}`;
    if (seizures === 'true') s += ', associated seizures';
    if (cognition && cognition !== 'None') s += `, cognition: ${cognition.toLowerCase()}`;
    if (therapies && therapies !== 'None') s += `; therapies: ${therapies}`;
    if (ortho && ortho !== 'None') s += `; orthopedic: ${ortho.toLowerCase()}`;
    return s;
  }
  return condition;
}

export function generateDrugAllergyNarrative(answers: Record<string, Answer>): string {
  const parts: string[] = [];

  // ── Structured medications ──
  const medName = getSectionAnswer(answers, 'med_name');
  if (medName && medName.trim()) {
    const dose = getSectionAnswer(answers, 'med_dose');
    const freq = getSectionAnswer(answers, 'med_frequency');
    const route = getSectionAnswer(answers, 'med_route');
    const indication = getSectionAnswer(answers, 'med_indication');
    const duration = getSectionAnswer(answers, 'med_duration');
    const adherence = getSectionAnswer(answers, 'med_adherence');
    const se = getSectionAnswer(answers, 'med_side_effects');
    const source = getSectionAnswer(answers, 'med_source');
    const items: string[] = [medName];
    if (dose) items.push(dose);
    if (freq) items.push(freq.toLowerCase());
    if (route) items.push(`(${route.toLowerCase()})`);
    if (indication) items.push(`for ${indication.toLowerCase()}`);
    if (duration) items.push(`since ${duration}`);
    if (adherence) items.push(`adherence ${adherence.toLowerCase()}`);
    if (se) items.push(`side effects: ${se}`);
    parts.push(`Current medications: ${items.join(' ')}.`);
  }

  // ── Free-text medications (fallback) ──
  const freeMeds = getSectionAnswer(answers, 'current_medications');
  if (freeMeds && freeMeds.trim() && !medName) {
    parts.push(`Current medications: ${freeMeds}.`);
  }

  // ── Herbal / Traditional ──
  const herbalUse = answers['q_dh_herbal_use'];
  if (herbalUse?.value === true) {
    const herbalName = getSectionAnswer(answers, 'herbal_name');
    const herbalFreq = getSectionAnswer(answers, 'herbal_frequency');
    const herbItems: string[] = ['Uses herbal/traditional remedies'];
    if (herbalName) herbItems.push(`: ${herbalName}`);
    if (herbalFreq) herbItems.push(`(${herbalFreq.toLowerCase()})`);
    parts.push(`${herbItems.join(' ')}.`);
  }

  // ── OTC (only if no structured meds) ──
  if (!medName) {
    const otc = getSectionAnswer(answers, 'otc_medications');
    if (otc && otc.trim()) {
      parts.push(`Over-the-counter: ${otc}.`);
    }
  }

  // ── Medication compliance ──
  const compliance = getSectionAnswer(answers, 'med_compliance');
  if (compliance && compliance !== 'Not applicable') {
    parts.push(`Medication compliance: ${compliance.toLowerCase()}.`);
  }

  // ── If no medications at all ──
  if (!medName && !freeMeds && !herbalUse?.value) {
    const hasAnyMeds = ['q_dh_current_meds', 'q_dh_otc'].some(k => hasAnswer(answers, k));
    if (!hasAnyMeds && !getSectionAnswer(answers, 'med_name')) {
      parts.push('The patient reports no regular medications and no recent use of prescription, over-the-counter or herbal preparations.');
    }
  }

  // ── Complete Allergy Domains ──
  const allergyCat = getSectionAnswer(answers, 'allergy_category');
  if (allergyCat && allergyCat !== 'None known') {
    const catList = allergyCat.split(', ');
    for (const cat of catList) {
      const c = cat.trim();
      if (c === 'Drug') {
        const drug = getSectionAnswer(answers, 'allergy_drug');
        const reaction = getSectionAnswer(answers, 'allergy_drug_reaction');
        const severity = getSectionAnswer(answers, 'allergy_drug_severity');
        const year = getSectionAnswer(answers, 'allergy_year');
        const confirmed = answers['q_all_confirmed'];
        const items: string[] = ['Drug allergy'];
        if (drug) items.push(`: ${drug}`);
        if (reaction) items.push(`(${reaction.toLowerCase()})`);
        if (severity) items.push(`severity ${severity.toLowerCase()}`);
        if (year) items.push(`since ${year}`);
        if (confirmed?.value === true) items.push('[confirmed]');
        parts.push(`${items.join(' ')}.`);
      } else if (c === 'Food') {
        const food = getSectionAnswer(answers, 'allergy_food');
        const reaction = getSectionAnswer(answers, 'allergy_drug_reaction');
        const items: string[] = ['Food allergy'];
        if (food) items.push(`: ${food}`);
        if (reaction) items.push(`(${reaction})`);
        parts.push(`${items.join(' ')}.`);
      } else if (c === 'Environmental') {
        const env = getSectionAnswer(answers, 'allergy_environmental');
        parts.push(`Environmental allergy: ${env || 'yes'}.`);
      } else if (c === 'Latex') {
        parts.push('Latex allergy.');
      } else if (c === 'Contrast') {
        const contrast = getSectionAnswer(answers, 'allergy_contrast_type');
        parts.push(`Contrast allergy${contrast ? ` (${contrast})` : ''}.`);
      } else if (c === 'Other') {
        const other = getSectionAnswer(answers, 'allergy_reaction_description');
        parts.push(`Other allergy: ${other || 'yes'}.`);
      }
    }
  } else if (allergyCat === 'None known') {
    parts.push('No known drug, food, environmental, latex, or contrast allergies reported.');
  } else {
    const hasAnyAllergy = hasAnswer(answers, 'allergy_category');
    if (!hasAnyAllergy) parts.push('Allergy status not yet assessed.');
  }

  return parts.join(' ');
}

export function generateFamilyHistoryNarrative(answers: Record<string, Answer>): string {
  const parents = getSectionAnswer(answers, 'fh_parents');
  const conditions = getSectionAnswer(answers, 'fh_conditions');

  const parts: string[] = [];
  if (parents) {
    parts.push(`${parents}.`);
  }
  if (conditions && conditions !== 'None') {
    parts.push(`Family history of ${conditions}.`);
  } else if (conditions === 'None') {
    parts.push('No family history of diabetes, hypertension, cancer, asthma, or other hereditary conditions.');
  }

  return parts.length > 0 ? parts.join(' ') : '';
}

export function generateSocialHistoryNarrative(answers: Record<string, Answer>, biodata?: any): string {
  const parts: string[] = [];

  const smoking = getSectionAnswer(answers, 'smoking');
  if (smoking) {
    const py = getSectionAnswer(answers, 'smoking_pack_years');
    if (smoking.toLowerCase() === 'never') {
      parts.push('No history of smoking.');
    } else {
      parts.push(`Smoking: ${smoking.toLowerCase()}${py ? ` (${py} pack-years)` : ''}.`);
    }
  }
  const alcohol = getSectionAnswer(answers, 'alcohol');
  if (alcohol) {
    if (alcohol.toLowerCase() === 'none') {
      if (!smoking) parts.push('No history of alcohol use.');
    } else {
      parts.push(`Alcohol: ${alcohol.toLowerCase()}.`);
    }
  }
  const drugs = getSectionAnswer(answers, 'recreational_drugs');
  if (drugs) {
    if (drugs === 'None') {
      if (!smoking && !alcohol) parts.push('No history of smoking, alcohol, or recreational drug use.');
    } else {
      parts.push(`Recreational drugs: ${drugs}.`);
    }
  }

  if (biodata?.occupation) {
    const occDetails = getSectionAnswer(answers, 'occupation_details');
    parts.push(`Occupation: ${biodata.occupation}${occDetails ? ` (${occDetails})` : ''}.`);
  }
  if (biodata?.residence) {
    parts.push(`Residence: ${biodata.residence}.`);
  }

  const living = getSectionAnswer(answers, 'living_situation');
  if (living) {
    parts.push(`Living situation: ${living}.`);
  }
  const travel = getSectionAnswer(answers, 'recent_travel');
  if (travel) {
    parts.push(`Recent travel: ${travel}.`);
  }

  return parts.length > 0 ? parts.join(' ') : '';
}

export function generateReviewOfSystemsNarrative(answers: Record<string, Answer>): string {
  interface RosSystem {
    label: string;
    gatewayKey: string;
    symptoms: { key: string; detailKeys?: string[]; label?: string }[];
    durationKey?: string;
  }

  const rosSystems: RosSystem[] = [
    {
      label: 'General',
      gatewayKey: 'q_ros_general_review',
      symptoms: [
        { key: 'q_ros_fever', detailKeys: ['q_ros_fever_duration'], label: 'Fever' },
        { key: 'q_ros_weight_loss', detailKeys: ['q_ros_weight_loss_detail'], label: 'Weight loss' },
        { key: 'q_ros_night_sweats', label: 'Night sweats' },
        { key: 'q_ros_fatigue', detailKeys: ['q_ros_fatigue_detail'], label: 'Fatigue' },
      ],
      durationKey: 'q_ros_general_duration',
    },
    {
      label: 'Cardiovascular',
      gatewayKey: 'q_ros_cv_review',
      symptoms: [
        { key: 'q_ros_chest_pain', detailKeys: ['q_ros_chest_pain_detail'], label: 'Chest pain' },
        { key: 'q_ros_palpitations', label: 'Palpitations' },
        { key: 'q_ros_sob', detailKeys: ['q_ros_sob_detail'], label: 'SOB' },
        { key: 'q_ros_orthopnea', label: 'Orthopnea' },
        { key: 'q_ros_edema', detailKeys: ['q_ros_edema_detail'], label: 'Leg swelling' },
      ],
      durationKey: 'q_ros_cv_duration',
    },
    {
      label: 'Respiratory',
      gatewayKey: 'q_ros_resp_review',
      symptoms: [
        { key: 'q_ros_cough', detailKeys: ['q_ros_cough_duration'], label: 'Cough' },
        { key: 'q_ros_sputum', label: 'Sputum' },
        { key: 'q_ros_wheeze', label: 'Wheezing' },
        { key: 'q_ros_hemoptysis', label: 'Hemoptysis' },
      ],
      durationKey: 'q_ros_resp_duration',
    },
    {
      label: 'Gastrointestinal',
      gatewayKey: 'q_ros_gi_review',
      symptoms: [
        { key: 'q_ros_dysphagia', label: 'Dysphagia' },
        { key: 'q_ros_nausea', label: 'Nausea' },
        { key: 'q_ros_vomiting', detailKeys: ['q_ros_vomiting_detail'], label: 'Vomiting' },
        { key: 'q_ros_diarrhea', detailKeys: ['q_ros_diarrhea_detail'], label: 'Diarrhea' },
        { key: 'q_ros_constipation', detailKeys: ['q_ros_constipation_detail'], label: 'Constipation' },
        { key: 'q_ros_hematemesis', label: 'Hematemesis' },
        { key: 'q_ros_melena', label: 'Melena' },
        { key: 'q_ros_hematochezia', label: 'Hematochezia' },
        { key: 'q_ros_jaundice', label: 'Jaundice' },
      ],
      durationKey: 'q_ros_gi_duration',
    },
    {
      label: 'Genitourinary',
      gatewayKey: 'q_ros_gu_review',
      symptoms: [
        { key: 'q_ros_dysuria', label: 'Dysuria' },
        { key: 'q_ros_frequency', label: 'Frequency' },
        { key: 'q_ros_urgency', label: 'Urgency' },
        { key: 'q_ros_hematuria', label: 'Hematuria' },
        { key: 'q_ros_flank_pain', label: 'Flank pain' },
      ],
      durationKey: 'q_ros_gu_duration',
    },
    {
      label: 'Musculoskeletal',
      gatewayKey: 'q_ros_msk_review',
      symptoms: [
        { key: 'q_ros_joint_pain', detailKeys: ['q_ros_joint_pain_detail'], label: 'Joint pain' },
        { key: 'q_ros_joint_swelling', label: 'Joint swelling' },
        { key: 'q_ros_back_pain', detailKeys: ['q_ros_back_pain_detail'], label: 'Back pain' },
      ],
      durationKey: 'q_ros_msk_duration',
    },
    {
      label: 'Neurological',
      gatewayKey: 'q_ros_neuro_review',
      symptoms: [
        { key: 'q_ros_headache', detailKeys: ['q_ros_headache_detail'], label: 'Headache' },
        { key: 'q_ros_dizziness', detailKeys: ['q_ros_dizziness_detail'], label: 'Dizziness' },
        { key: 'q_ros_seizures', detailKeys: ['q_ros_seizure_detail'], label: 'Seizures' },
        { key: 'q_ros_weakness', label: 'Weakness/numbness' },
        { key: 'q_ros_vision', label: 'Vision changes' },
      ],
      durationKey: 'q_ros_neuro_duration',
    },
    {
      label: 'Endocrine',
      gatewayKey: 'q_ros_endo_review',
      symptoms: [
        { key: 'q_ros_thirst', label: 'Polydipsia' },
        { key: 'q_ros_urination', label: 'Polyuria' },
        { key: 'q_ros_heat_intolerance', label: 'Temp intolerance' },
      ],
      durationKey: 'q_ros_endo_duration',
    },
  ];

  function getDetailAnswer(key: string): string | undefined {
    const ans = answers[key];
    if (!ans) return undefined;
    const val = ans.value;
    if (typeof val === 'string' && val !== '' && val !== 'None' && val !== 'No') return val;
    if (typeof val === 'boolean' && val === true) return 'present';
    return undefined;
  }

  function getSymptomLine(symptom: RosSystem['symptoms'][0]): string | null {
    const val = answers[symptom.key]?.value;
    if (val === undefined || val === null || val === '' || val === 'No') return null;
    const label = symptom.label || symptom.key.replace('q_ros_', '').replace(/_/g, ' ');
    let detail = '';
    if (symptom.detailKeys) {
      const parts: string[] = [];
      for (const dk of symptom.detailKeys) {
        const da = getDetailAnswer(dk);
        if (da) parts.push(da);
      }
      if (parts.length > 0) detail = ` (${parts.join(', ')})`;
    }
    const valStr = typeof val === 'boolean' ? '' : `: ${val}`;
    return `${label}${valStr}${detail}`;
  }

  const lines: string[] = [];
  for (const system of rosSystems) {
    const gateway = answers[system.gatewayKey]?.value;
    if (gateway === undefined || gateway === null) continue;

    if (gateway === 'No') {
      lines.push(`${system.label}: patient reports no symptoms in this system.`);
      continue;
    }

    const symptomLines: string[] = [];
    for (const symptom of system.symptoms) {
      const line = getSymptomLine(symptom);
      if (line) symptomLines.push(line);
    }

    if (symptomLines.length > 0) {
      let text = `${system.label}: ${symptomLines.join('; ')}.`;
      if (system.durationKey) {
        const durationVal = getDetailAnswer(system.durationKey);
        if (durationVal) text += ` Duration: ${durationVal}.`;
      }
      lines.push(text);
    } else {
      lines.push(`${system.label}: reviewed, no additional symptoms beyond HPI.`);
    }
  }

  if (lines.length > 0) return lines.join(' ');
  const rosKeys = Object.keys(answers).filter(k => k.startsWith('q_ros_'));
  if (rosKeys.length > 0) return 'No significant findings on review of systems.';
  return '';
}

export function generateSummaryNarrative(
  answers: Record<string, Answer>,
  biodata?: any,
  chiefComplaints?: { complaint: string; duration?: string }[]
): string {
  const name = biodata?.patientName || '';
  const age = biodata?.age || 0;
  const sex = biodata?.sex || '';
  const gender = sex === 'male' ? 'male' : 'female';

  const complaints = chiefComplaints && chiefComplaints.length > 0
    ? chiefComplaints.map(c => `${c.complaint}${c.duration ? ` for ${c.duration}` : ''}`).join(', ')
    : '';

  const conditions = getSectionAnswer(answers, 'pmh_conditions');
  const hasChronic = conditions && conditions !== 'None';

  if (complaints) {
    if (name && age) {
      return hasChronic
        ? `${name}, ${age}-year-old ${gender}, with known ${conditions}, presents with ${complaints}.`
        : `${name}, ${age}-year-old ${gender}, with no known chronic illness, presents with ${complaints}.`;
    }
    return `Presents with ${complaints}.`;
  }

  return name ? `${name}, ${age}-year-old ${gender}.` : '';
}
