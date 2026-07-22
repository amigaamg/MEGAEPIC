import {
  AssessmentFormat,
  PatientContext,
  SectionDefinition,
  SectionType,
  ActivationRule,
} from '../types';

export interface UCAEMFormatResult {
  format: AssessmentFormat;
  sections: SectionDefinition[];
  baseFormat: AssessmentFormat;
  contextModifiers: string[];
}

interface FormatTemplate {
  id: AssessmentFormat;
  label: string;
  description: string;
  baseFormat?: AssessmentFormat;
  sectionOverrides: Partial<Record<SectionType, Partial<SectionDefinition>>>;
  extraSections: SectionDefinition[];
  removedSections: SectionType[];
}

const BASE_SECTIONS: SectionDefinition[] = [
  { id: 'biodata', type: 'biodata', label: 'Patient Biodata', shortLabel: 'Biodata', icon: '📋', description: 'Patient demographics & clinical context', position: 0, required: true, activationRules: [{ type: 'always' }], prerequisites: [] },
  { id: 'chief_complaints', type: 'chief_complaint', label: 'Chief Complaint', shortLabel: 'CC', icon: '🗣️', description: 'Presenting complaints in chronological order', position: 1, required: true, activationRules: [{ type: 'always' }], prerequisites: ['biodata'] },
  { id: 'hpi', type: 'hpi', label: 'History of Presenting Illness', shortLabel: 'HPI', icon: '📝', description: 'Structured symptom exploration & chronology', position: 2, required: true, activationRules: [{ type: 'always' }], prerequisites: ['chief_complaints'] },
  { id: 'pmh', type: 'pmh', label: 'Past Medical History', shortLabel: 'PMH', icon: '🏥', description: 'Chronic conditions, surgeries, transfusions', position: 3, required: true, activationRules: [{ type: 'always' }], prerequisites: ['hpi'] },
  { id: 'past_surgical_history', type: 'past_surgical_history', label: 'Past Surgical History', shortLabel: 'PSH', icon: '🔪', description: 'Previous operations, anaesthetics, complications', position: 3.5, required: true, activationRules: [{ type: 'always' }], prerequisites: ['pmh'] },
  { id: 'drug_history', type: 'drug_history', label: 'Drug History', shortLabel: 'DH', icon: '💊', description: 'Current & past medications', position: 4, required: true, activationRules: [{ type: 'always' }], prerequisites: ['past_surgical_history'] },
  { id: 'allergy_history', type: 'allergy_history', label: 'Allergy History', shortLabel: 'AH', icon: '⚠️', description: 'Allergies & intolerances', position: 5, required: true, activationRules: [{ type: 'always' }], prerequisites: ['drug_history'] },
  { id: 'family_history', type: 'family_history', label: 'Family History', shortLabel: 'FH', icon: '👨‍👩‍👧‍👦', description: 'Genetic & environmental risks', position: 6, required: true, activationRules: [{ type: 'always' }], prerequisites: ['allergy_history'] },
  { id: 'social_history', type: 'social_history', label: 'Social History', shortLabel: 'SH', icon: '🏠', description: 'Occupation, lifestyle, environment', position: 7, required: true, activationRules: [{ type: 'always' }], prerequisites: ['family_history'] },
  { id: 'review_of_systems', type: 'review_of_systems', label: 'Review of Systems', shortLabel: 'ROS', icon: '🔍', description: '12-system review', position: 8, required: true, activationRules: [{ type: 'always' }], prerequisites: ['social_history'] },
  { id: 'summary', type: 'history_summary', label: 'History Summary', shortLabel: 'Summary', icon: '📄', description: 'Auto-generated history synthesis', position: 9, required: true, activationRules: [{ type: 'always' }], prerequisites: ['review_of_systems'] },
  { id: 'examination', type: 'examination', label: 'Examination', shortLabel: 'Exam', icon: '🩺', description: 'Vital signs & physical examination', position: 10, required: true, activationRules: [{ type: 'always' }], prerequisites: ['summary'] },
  { id: 'clinical_summary', type: 'clinical_summary', label: 'Clinical Summary', shortLabel: 'Summary', icon: '📋', description: 'Synthesis of history & examination', position: 11, required: true, activationRules: [{ type: 'always' }], prerequisites: ['examination'] },
  { id: 'syndromes', type: 'syndromes', label: 'Syndrome Identification', shortLabel: 'Syndromes', icon: '🧩', description: 'Recognised clinical syndromes', position: 12, required: true, activationRules: [{ type: 'always' }], prerequisites: ['clinical_summary'] },
  { id: 'mechanisms', type: 'mechanisms', label: 'Pathophysiological Mechanisms', shortLabel: 'Mechanisms', icon: '⚙️', description: 'Underlying disease mechanisms', position: 13, required: false, activationRules: [{ type: 'always' }], prerequisites: ['syndromes'] },
  { id: 'phenotypes', type: 'phenotypes', label: 'Clinical Phenotypes', shortLabel: 'Phenotypes', icon: '🧬', description: 'Disease phenotype classification', position: 14, required: false, activationRules: [{ type: 'always' }], prerequisites: ['mechanisms'] },
  { id: 'differentials', type: 'differentials', label: 'Differential Diagnoses', shortLabel: 'DDx', icon: '🧠', description: 'AI-supported differential generation', position: 15, required: true, activationRules: [{ type: 'always' }], prerequisites: ['clinical_summary'] },
  { id: 'problem_list', type: 'problem_list', label: 'Problem List', shortLabel: 'Problems', icon: '📋', description: 'Prioritised active problem list', position: 16, required: true, activationRules: [{ type: 'always' }], prerequisites: ['differentials'] },
  { id: 'investigations', type: 'investigations', label: 'Investigations', shortLabel: 'Ix', icon: '🔬', description: 'Laboratory & imaging orders', position: 17, required: true, activationRules: [{ type: 'always' }], prerequisites: ['problem_list'] },
  { id: 'results', type: 'results', label: 'Results Review', shortLabel: 'Results', icon: '📊', description: 'Investigation results & interpretation', position: 18, required: true, activationRules: [{ type: 'always' }], prerequisites: ['investigations'] },
  { id: 'diagnosis', type: 'diagnosis', label: 'Diagnosis', shortLabel: 'Dx', icon: '✅', description: 'Final diagnosis with ICD coding', position: 19, required: true, activationRules: [{ type: 'always' }], prerequisites: ['results'] },
  { id: 'management', type: 'management', label: 'Management Plan', shortLabel: 'Mx', icon: '💊', description: 'Treatment, medications & interventions', position: 20, required: true, activationRules: [{ type: 'always' }], prerequisites: ['diagnosis'] },
  { id: 'disposition', type: 'disposition', label: 'Disposition', shortLabel: 'Plan', icon: '📄', description: 'Admission, discharge, transfer or follow-up', position: 21, required: true, activationRules: [{ type: 'always' }], prerequisites: ['management'] },
];

function getPediatricSections(): SectionDefinition[] {
  return [
    { id: 'birth_history', type: 'birth_history', label: 'Birth History', shortLabel: 'Birth', icon: '👶', description: 'Antenatal, delivery & neonatal', position: 3.1, required: false, activationRules: [{ type: 'age', maxMonths: 60 }], prerequisites: ['pmh'] },
    { id: 'development', type: 'development', label: 'Growth & Development', shortLabel: 'Devt', icon: '🧒', description: 'Milestones & growth tracking', position: 3.2, required: false, activationRules: [{ type: 'age', maxMonths: 60 }], prerequisites: ['birth_history'] },
    { id: 'immunization', type: 'immunization', label: 'Immunization', shortLabel: 'Immun', icon: '💉', description: 'Vaccination status', position: 3.3, required: false, activationRules: [{ type: 'age', maxMonths: 216 }], prerequisites: ['development'] },
    { id: 'nutrition', type: 'nutrition', label: 'Nutrition', shortLabel: 'Nutrition', icon: '🍽️', description: 'Feeding & anthropometry', position: 3.4, required: false, activationRules: [{ type: 'always' }], prerequisites: ['immunization'] },
  ];
}

function getNeonatalSections(): SectionDefinition[] {
  return [
    { id: 'perinatal_history', type: 'perinatal_history', label: 'Perinatal History', shortLabel: 'Perinatal', icon: '👶', description: 'Full antenatal, natal & postnatal', position: 2.5, required: true, activationRules: [{ type: 'age', maxMonths: 1 }], prerequisites: ['hpi'] },
    { id: 'birth_history', type: 'birth_history', label: 'Birth History', shortLabel: 'Birth', icon: '👶', description: 'Delivery details & condition at birth', position: 3.1, required: true, activationRules: [{ type: 'age', maxMonths: 1 }], prerequisites: ['perinatal_history'] },
    { id: 'nutrition', type: 'nutrition', label: 'Feeding & Nutrition', shortLabel: 'Feeding', icon: '🍼', description: 'Neonatal feeding assessment', position: 4.1, required: true, activationRules: [{ type: 'age', maxMonths: 1 }], prerequisites: ['social_history'] },
  ];
}

function getPsychiatricSections(): SectionDefinition[] {
  const psychiatricExtras: SectionDefinition[] = [
    { id: 'past_psychiatric_history', type: 'past_psychiatric_history', label: 'Past Psychiatric History', shortLabel: 'Psych Hx', icon: '🧠', description: 'Previous psychiatric diagnoses, admissions, treatments', position: 3.1, required: true, activationRules: [{ type: 'always' }], prerequisites: ['hpi'] },
    { id: 'substance_use_history', type: 'substance_use_history', label: 'Substance Use History', shortLabel: 'Substance', icon: '🍺', description: 'Alcohol, tobacco & recreational drug use', position: 6.1, required: true, activationRules: [{ type: 'always' }], prerequisites: ['family_history'] },
    { id: 'forensic_history', type: 'forensic_history', label: 'Forensic & Legal History', shortLabel: 'Forensic', icon: '⚖️', description: 'Legal issues, incarceration, forensic involvement', position: 6.2, required: false, activationRules: [{ type: 'always' }], prerequisites: ['substance_use_history'] },
    { id: 'premorbid_personality', type: 'premorbid_personality', label: 'Premorbid Personality', shortLabel: 'Personality', icon: '🧑', description: 'Pre-illness personality traits & function', position: 6.3, required: false, activationRules: [{ type: 'always' }], prerequisites: ['forensic_history'] },
  ];

  const sections = BASE_SECTIONS.map(s => {
    if (s.id === 'examination') {
      return { ...s, label: 'Mental State Examination', shortLabel: 'MSE', icon: '🧠' };
    }
    return s;
  });
  return insertSections(sections, psychiatricExtras);
}

function getFormatForContext(ctx: PatientContext): AssessmentFormat {
  const { totalMonths } = ctx.age;
  const { specialty } = ctx;

  if (totalMonths <= 1) return 'neonatal';
  if (totalMonths < 156) return 'pediatric';
  if (specialty === 'psychiatry' || specialty === 'mental_health') return 'psychiatric';
  if (specialty === 'obstetrics' || (ctx.sex === 'female' && ctx.age.totalMonths >= 120 && ctx.pregnancyStatus === 'pregnant')) {
    if (specialty === 'gynae_oncology' || specialty === 'gynecology') return 'adult_medical';
    return 'obstetric';
  }
  if (specialty?.includes('surgery') || ctx.encounterType === 'surgical') return 'adult_surgical';
  return 'adult_medical';
}

function getFemaleSections(isPregnant: boolean): SectionDefinition[] {
  const sections: SectionDefinition[] = [];

  // FG-009: Current Pregnancy / Antenatal Profile (only when pregnant)
  if (isPregnant) {
    sections.push({
      id: 'pregnancy_history', type: 'pregnancy_history', label: 'Current Pregnancy / Antenatal Profile',
      shortLabel: 'Pregnancy', icon: '🤰', description: 'Antenatal profile, EDD, gestational age',
      position: 2.5, required: true,
      activationRules: [{ type: 'sex', values: ['female'] }, { type: 'pregnancy', status: ['pregnant'] }],
      prerequisites: ['hpi'],
    });
  }

  // FG-006 + FG-009: Past Obstetric History (G/P/A/L, previous pregnancies)
  sections.push({
    id: 'obstetric_history', type: 'obstetric_history', label: 'Past Obstetric History',
    shortLabel: 'Obstetric', icon: '👶', description: 'G/P/A/L, previous pregnancies, complications',
    position: isPregnant ? 2.6 : 2.5, required: true,
    activationRules: [{ type: 'sex', values: ['female'] }, { type: 'age', minMonths: 144 }],
    prerequisites: isPregnant ? ['pregnancy_history'] : ['hpi'],
  });

  // FG-006 + FG-009: Gynecological History (includes menstrual history, contraception, screening)
  // NOTE: Does NOT require obstetric_history as prerequisite — gynecological history is independent
  // (e.g., a 10-year-old post-menarche has gynecological but no obstetric history)
  sections.push({
    id: 'gynecological_history', type: 'gynecological_history', label: 'Gynecological History',
    shortLabel: 'Gynae', icon: '🩺', description: 'Menstrual history, contraception, cervical screening, fertility',
    position: isPregnant ? 2.7 : 2.6, required: true,
    activationRules: [{ type: 'sex', values: ['female'] }, { type: 'age', minMonths: 120 }],
    prerequisites: ['hpi'],
  });

  return sections;
}

export function generateFormat(ctx: PatientContext): UCAEMFormatResult {
  const format = getFormatForContext(ctx);
  let baseSections = [...BASE_SECTIONS];
  const contextModifiers: string[] = [];

  switch (format) {
    case 'pediatric': {
      contextModifiers.push('Pediatric');
      const pedsSections = getPediatricSections();
      baseSections = insertSections(baseSections, pedsSections);
      baseSections = removeNonsense(baseSections, ctx);
      break;
    }
    case 'neonatal': {
      contextModifiers.push('Neonatal');
      const neonatalSections = getNeonatalSections();
      baseSections = insertSections(baseSections, neonatalSections);
      baseSections = baseSections.filter(s =>
        !['drug_history', 'allergy_history', 'family_history', 'social_history', 'differentials', 'problem_list', 'mechanisms', 'phenotypes', 'syndromes', 'results'].includes(s.type)
      );
      break;
    }
    case 'psychiatric': {
      contextModifiers.push('Psychiatric');
      baseSections = getPsychiatricSections();
      break;
    }
    case 'adult_surgical': {
      contextModifiers.push('Surgical');
      break;
    }
    default: {
      contextModifiers.push('Adult Medical');
    }
  }

  // ── Female reproductive sections per FG-006 / FG-009 ──
  // FG-006 (non-pregnant female of reproductive potential):
  //   HPI → Past Obstetric History → Gynecological History → PMH
  // FG-009 (pregnant):
  //   HPI → Current Pregnancy / Antenatal Profile → Past Obstetric History → Past Gynecological History → PMH
  // Menstrual history questions are consolidated under Gynecological History (not a separate section).
  if (ctx.sex === 'female' && ctx.age.totalMonths >= 120 && format !== 'neonatal' && format !== 'pediatric' && format !== 'psychiatric') {
    const isPregnant = ctx.pregnancyStatus === 'pregnant';
    const femaleSections = getFemaleSections(isPregnant);
    for (const fs of femaleSections) {
      if (!baseSections.find(s => s.type === fs.type)) {
        const insertIdx = baseSections.findIndex(s => s.position > fs.position);
        if (insertIdx === -1) {
          baseSections.push(fs);
        } else {
          baseSections.splice(insertIdx, 0, fs);
        }
      }
    }
  }

  const resorted = baseSections.sort((a, b) => a.position - b.position);
  const reindexed = resorted.map((s, i) => ({ ...s, position: i }));

  return {
    format,
    sections: reindexed,
    baseFormat: format,
    contextModifiers,
  };
}

function insertSections(
  base: SectionDefinition[],
  extras: SectionDefinition[]
): SectionDefinition[] {
  const result = [...base];
  for (const extra of extras) {
    const insertIdx = result.findIndex(s => s.position > extra.position);
    if (insertIdx === -1) {
      result.push(extra);
    } else {
      result.splice(insertIdx, 0, extra);
    }
  }
  return result;
}

function removeNonsense(
  sections: SectionDefinition[],
  ctx: PatientContext
): SectionDefinition[] {
  return sections.filter(s => {
    if (s.type === 'birth_history' && ctx.age.totalMonths > 60) return false;
    if (s.type === 'development' && ctx.age.totalMonths > 60) return false;
    if (s.type === 'immunization' && ctx.age.totalMonths > 216) return false;
    return true;
  });
}
