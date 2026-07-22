import {
  ConstitutionalState,
  DocumentationBlock,
  Fact,
  SymptomObject,
  FindingObject,
  DiseaseObject,
  MedicationObject,
  AllergyObject,
  SectionType,
  PatientContext,
} from '../types';

export interface DocumentationInput {
  symptoms: SymptomObject[];
  findings: FindingObject[];
  diseases: DiseaseObject[];
  medications: MedicationObject[];
  allergies: AllergyObject[];
  facts: Fact[];
  ctx: PatientContext;
}

function formatDuration(duration?: string): string {
  return duration ? ` of ${duration}` : '';
}

function formatSeverity(severity?: number): string {
  if (severity === undefined) return '';
  if (severity <= 3) return ' mild in severity';
  if (severity <= 6) return ' moderate in severity';
  return ' severe in intensity';
}

function generateChiefComplaintNarrative(symptoms: SymptomObject[], ctx: PatientContext): string {
  const ordered = [...symptoms]
    .filter(s => s.present && s.source === 'chief_complaint')
    .sort((a, b) => (a.chronology ?? 99) - (b.chronology ?? 99));

  if (ordered.length === 0) return '';

  const ageDesc = ctx.age ? `${ctx.age.years}-year-old ${ctx.sex === 'male' ? 'male' : ctx.sex === 'female' ? 'female' : 'patient'}` : 'patient';
  const parts = ordered.map((s) => {
    const duration = s.duration ? ` for ${s.duration}` : '';
    const wording = s.patientDescription || s.label;
    return `${wording.toLowerCase()}${duration}`;
  });

  return `The ${ageDesc} presents with ${parts.join(', ')}.`;
}

function generateHPINarrative(symptoms: SymptomObject[]): string {
  const explored = symptoms.filter(s => s.explored && s.present && s.source === 'hpi');
  if (explored.length === 0) return '';

  const lines: string[] = [];
  for (const s of explored) {
    const elements: string[] = [`The ${s.label.toLowerCase()}`];
    if (s.onset) elements.push(`had ${s.onset} onset`);
    if (s.character) elements.push(`was ${s.character} in character`);
    if (s.duration) elements.push(`lasting ${s.duration}`);
    if (s.site) elements.push(`located at ${s.site}`);
    if (s.radiation) elements.push(`radiating to ${s.radiation}`);
    if (s.severity !== undefined) elements.push(`with severity ${s.severity}/10`);
    if (s.timeCourse) elements.push(`with a ${s.timeCourse} course`);
    if (s.associations?.length) elements.push(`associated with ${s.associations.join(', ')}`);
    if (s.exacerbatingFactors?.length) elements.push(`aggravated by ${s.exacerbatingFactors.join(', ')}`);
    if (s.relievingFactors?.length) elements.push(`relieved by ${s.relievingFactors.join(', ')}`);
    lines.push(elements.join(', ') + '.');
  }

  return lines.join(' ');
}

function generatePMHNarrative(diseases: DiseaseObject[]): string {
  if (diseases.length === 0) return 'No significant past medical history.';
  const active = diseases.filter(d => d.status === 'active' || d.status === 'chronic');
  const resolved = diseases.filter(d => d.status === 'resolved' || d.status === 'in_remission');

  const parts: string[] = [];
  if (active.length > 0) {
    parts.push(`Active conditions: ${active.map(d => {
      let desc = d.label;
      if (d.diagnosedYear) desc += ` (diagnosed ${d.diagnosedYear})`;
      if (d.control && d.control !== 'unknown') desc += `, ${d.control.replace(/_/g, ' ')}`;
      if (d.complications?.length) desc += `; complications: ${d.complications.join(', ')}`;
      return desc;
    }).join('; ')}.`);
  }
  if (resolved.length > 0) {
    parts.push(`Resolved conditions: ${resolved.map(d => {
      let desc = d.label;
      if (d.diagnosedYear) desc += ` (${d.diagnosedYear})`;
      return desc;
    }).join(', ')}.`);
  }
  return parts.join(' ');
}

function generateMedicationNarrative(medications: MedicationObject[]): string {
  const current = medications.filter(m => m.status === 'current');
  const past = medications.filter(m => m.status === 'past');

  if (current.length === 0) {
    return 'Not on any regular medications.';
  }

  const currentText = `Current medications: ${current.map(m => {
    let desc = m.label;
    if (m.dose) desc += ` ${m.dose}`;
    if (m.route) desc += ` ${m.route}`;
    if (m.frequency) desc += ` ${m.frequency}`;
    if (m.indication) desc += ` for ${m.indication}`;
    return desc;
  }).join('; ')}.`;

  if (past.length > 0) {
    const pastText = ` Previously: ${past.map(m => {
      let desc = m.label;
      if (m.stoppedReason) desc += ` (stopped: ${m.stoppedReason})`;
      return desc;
    }).join('; ')}.`;
    return currentText + pastText;
  }

  return currentText;
}

function generateAllergyNarrative(allergies: AllergyObject[]): string {
  if (allergies.length === 0) return 'No known allergies.';
  return `Allergies: ${allergies.map(a => {
    let desc = a.label;
    if (a.type === 'true_allergy') desc += ' [true allergy]';
    else if (a.type === 'intolerance') desc += ' [intolerance]';
    else if (a.type === 'side_effect') desc += ' [side effect]';
    if (a.reaction) desc += ` - ${a.reaction}`;
    if (a.severity) desc += ` (${a.severity})`;
    if (a.verification !== 'confirmed') desc += ` [${a.verification}]`;
    return desc;
  }).join('; ')}.`;
}

function generateFamilyNarrative(
  diseases: DiseaseObject[],
  facts: Fact[]
): string {
  const familyFacts = facts.filter(f => f.type === 'family');
  if (familyFacts.length === 0) return 'No significant family history reported.';
  const parts = familyFacts.map(f => String(f.value));
  return parts.join(' ');
}

function generateSocialNarrative(facts: Fact[]): string {
  const socialFacts = facts.filter(f => f.type === 'social');
  if (socialFacts.length === 0) return '';
  return socialFacts.map(f => String(f.value)).join(' ');
}

function generateROSNarrative(symptoms: SymptomObject[], facts: Fact[]): string {
  const rosSymptoms = symptoms.filter(s => s.source === 'ros');
  const rosFacts = facts.filter(f => f.type === 'ros');

  if (rosSymptoms.length === 0 && rosFacts.length === 0) return '';

  const positive = rosSymptoms.filter(s => s.present);
  const negative = rosSymptoms.filter(s => !s.present);

  const parts: string[] = [];
  if (positive.length > 0) {
    parts.push(`Positive: ${positive.map(s => s.label).join(', ')}.`);
  }
  if (negative.length > 0) {
    parts.push(`Negative: ${negative.map(s => s.label).join(', ')}.`);
  }

  const reviewedSystems = [...new Set(rosSymptoms.map(s => s.label.split(' ')[0]))];
  if (positive.length === 0 && negative.length === 0 && reviewedSystems.length > 0) {
    parts.push(`All systems reviewed were unremarkable.`);
  }

  return parts.join(' ');
}

function generateExaminationNarrative(findings: FindingObject[]): string {
  if (findings.length === 0) return '';

  const positive = findings.filter(f => f.present === true);
  const negative = findings.filter(f => f.present === false);
  const screened = findings.filter(f => f.screening && f.present !== null);

  const parts: string[] = [];
  if (positive.length > 0) {
    parts.push(`Positive findings: ${positive.map(f => {
      let desc = f.label;
      if (f.site) desc += ` at ${f.site}`;
      if (f.laterality && f.laterality !== 'midline') desc += ` (${f.laterality})`;
      if (f.character) desc += `, ${f.character}`;
      if (f.size) desc += `, ${f.size}`;
      if (f.severity) desc += ` (${f.severity})`;
      return desc;
    }).join('; ')}.`);
  }
  if (negative.length > 0) {
    const reviewedSystems = [...new Set(negative.map(f => f.system))];
    parts.push(`Unremarkable: ${reviewedSystems.join(', ')}.`);
  }
  if (positive.length === 0 && negative.length === 0 && screened.length > 0) {
    const allSystems = [...new Set(screened.map(f => f.system))];
    parts.push(`${allSystems.join(', ')} examination was unremarkable.`);
  }
  return parts.join(' ');
}

function generateHistorySummary(input: DocumentationInput): string {
  const { symptoms, diseases, medications, allergies, ctx } = input;

  const sentences: string[] = [];

  const ccText = generateChiefComplaintNarrative(symptoms.filter(s => s.source === 'chief_complaint'), ctx);
  if (ccText) {
    sentences.push(ccText);
  } else {
    const ageDesc = ctx.age ? `${ctx.age.years}-year-old ${ctx.sex === 'male' ? 'male' : ctx.sex === 'female' ? 'female' : 'patient'}` : 'patient';
    sentences.push(`The ${ageDesc} presented for clinical assessment.`);
  }

  const pmhText = generatePMHNarrative(diseases);
  if (pmhText !== 'No significant past medical history.') {
    sentences.push(pmhText);
  }

  const activeMedications = medications.filter(m => m.status === 'current');
  if (activeMedications.length > 0) {
    sentences.push(generateMedicationNarrative(medications));
  }

  if (allergies.length > 0) {
    sentences.push(generateAllergyNarrative(allergies));
  }

  return sentences.join(' ');
}

function generateBirthHistoryNarrative(facts: Fact[], ctx: PatientContext): string {
  const birthFacts = facts.filter(f => f.type === 'biodata' || f.type === 'hpi');
  if (birthFacts.length === 0) {
    if (ctx.age.totalMonths <= 1) return 'Birth history not yet obtained.';
    return '';
  }
  const lines = birthFacts.map(f => String(f.value));
  return lines.join(' ');
}

function generateDevelopmentNarrative(facts: Fact[], ctx: PatientContext): string {
  const devFacts = facts.filter(f => f.type === 'biodata' || f.type === 'hpi');
  if (devFacts.length === 0) {
    if (ctx.age.totalMonths <= 60) return 'Growth and development milestones reviewed per maternal recall.';
    return '';
  }
  const lines = devFacts.map(f => String(f.value));
  return lines.join(' ');
}

function generateImmunizationNarrative(facts: Fact[], ctx: PatientContext): string {
  const immFacts = facts.filter(f => f.type === 'hpi' || f.type === 'pmh');
  if (immFacts.length === 0) {
    if (ctx.age.totalMonths <= 216) return 'Immunization status reviewed with caregiver. Vaccination card seen where available.';
    return '';
  }
  const lines = immFacts.map(f => String(f.value));
  return lines.join(' ');
}

function generateNutritionNarrative(facts: Fact[], ctx: PatientContext): string {
  const nutFacts = facts.filter(f => f.type === 'hpi' || f.type === 'social');
  if (nutFacts.length === 0) {
    if (ctx.age.totalMonths <= 60) return 'Breastfeeding and complementary feeding history obtained per maternal report.';
    return '';
  }
  const lines = nutFacts.map(f => String(f.value));
  return lines.join(' ');
}

export function generateDocumentation(
  sectionType: SectionType,
  input: DocumentationInput,
  existingState?: ConstitutionalState
): DocumentationBlock {
  let narrative = '';

  switch (sectionType) {
    case 'chief_complaint':
      narrative = generateChiefComplaintNarrative(input.symptoms, input.ctx);
      break;
    case 'hpi':
      narrative = generateHPINarrative(input.symptoms);
      break;
    case 'pmh':
      narrative = generatePMHNarrative(input.diseases);
      break;
    case 'drug_history':
      narrative = generateMedicationNarrative(input.medications);
      break;
    case 'allergy_history':
      narrative = generateAllergyNarrative(input.allergies);
      break;
    case 'family_history':
      narrative = generateFamilyNarrative(input.diseases, input.facts);
      break;
    case 'social_history':
      narrative = generateSocialNarrative(input.facts);
      break;
    case 'review_of_systems':
      narrative = generateROSNarrative(input.symptoms, input.facts);
      break;
    case 'history_summary':
      narrative = generateHistorySummary(input);
      break;
    case 'examination':
      narrative = generateExaminationNarrative(input.findings);
      break;
    case 'birth_history':
      narrative = generateBirthHistoryNarrative(input.facts, input.ctx);
      break;
    case 'development':
      narrative = generateDevelopmentNarrative(input.facts, input.ctx);
      break;
    case 'immunization':
      narrative = generateImmunizationNarrative(input.facts, input.ctx);
      break;
    case 'nutrition':
      narrative = generateNutritionNarrative(input.facts, input.ctx);
      break;
    case 'perinatal_history':
      narrative = generateBirthHistoryNarrative(input.facts, input.ctx);
      break;
    case 'menstrual_history':
    case 'pregnancy_history':
    case 'obstetric_history':
    case 'gynecological_history':
      narrative = generatePMHNarrative(input.diseases);
      break;
    case 'clinical_summary':
      narrative = generateHistorySummary(input);
      break;
    default:
      narrative = '';
  }

  return {
    sectionId: sectionType,
    sectionType,
    narrative: narrative.trim(),
    generatedAt: Date.now(),
  };
}

export function generateAllDocumentation(
  state: ConstitutionalState,
  ctx: PatientContext
): Record<string, DocumentationBlock> {
  const input: DocumentationInput = {
    symptoms: Object.values(state.symptoms),
    findings: Object.values(state.findings),
    diseases: Object.values(state.diseases),
    medications: Object.values(state.medications || {}),
    allergies: Object.values(state.allergies || {}),
    facts: state.facts,
    ctx,
  };

  const sections = state.completedSectionIds;
  const docs: Record<string, DocumentationBlock> = {};

  for (const sectionId of sections) {
    const section = state.sections.find(s => s.id === sectionId);
    if (section) {
      docs[sectionId] = generateDocumentation(section.type, input, state);
    }
  }

  return docs;
}
