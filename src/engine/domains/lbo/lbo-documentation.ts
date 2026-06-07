export function generateLboHpi(params: {
  age: number;
  gender: string;
  distensionDurationDays: number;
  suddenOnset: boolean;
  constipationDays: number;
  painColicky: boolean;
  painConstant: boolean;
  vomiting: boolean;
  vomitingType: string;
  previousEpisodes: boolean;
  weightLoss: boolean;
  rectalBleeding: boolean;
  chronicConstipation: boolean;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  medications: string[];
  socialHistory: string[];
  familyHistory: string[];
}): string {
  const p = params.gender.toLowerCase() === 'female' ? { sub: 'She', obj: 'her', pos: 'her', title: 'lady' }
    : { sub: 'He', obj: 'him', pos: 'his', title: 'gentleman' };

  const parts: string[] = [];

  parts.push(`The patient is a ${params.age}-year-old ${p.title} who presents with a ${params.distensionDurationDays}-day history of abdominal distension and constipation.`);

  const onset = params.suddenOnset ? 'suddenly' : 'gradually';
  parts.push(`The abdominal distension began ${onset}, is located in the entire abdomen, and has progressively worsened over ${params.distensionDurationDays} days.`);

  if (params.painColicky) {
    parts.push(`It is associated with severe colicky abdominal pain`);
  } else if (params.painConstant) {
    parts.push(`It is associated with severe constant abdominal pain (suggests possible ischaemia)`);
  }

  if (params.vomiting) {
    parts.push(`and vomiting (${params.vomitingType}, multiple episodes)`);
  }

  parts.push(`and absolute constipation (no stool or flatus for ${params.constipationDays} days).`);

  if (params.previousEpisodes) {
    parts.push(`${p.sub} confirms having had similar episodes previously.`);
  } else {
    parts.push(`${p.sub} has had no similar episodes previously.`);
  }

  if (params.chronicConstipation) {
    parts.push(`${p.sub} reports chronic constipation for many years, requiring occasional laxatives.`);
  }

  if (params.painColicky && params.painConstant) {
    parts.push(`The pain was initially colicky in nature but has now become constant — this progression raises concern for bowel ischaemia.`);
  }

  parts.push(`${p.sub} has not passed stool for ${params.constipationDays} days.`);
  parts.push(`${p.sub} has not passed gas for ${params.constipationDays} days.`);

  if (params.rectalBleeding === true) {
    parts.push(`${p.sub} reports blood in ${p.pos} stool.`);
  } else {
    parts.push(`${p.sub} denies blood in ${p.pos} stool.`);
  }

  if (params.weightLoss === true) {
    parts.push(`${p.sub} reports unintentional weight loss.`);
  } else {
    parts.push(`${p.sub} denies weight loss.`);
  }

  if (params.pastMedicalHistory.length > 0) {
    parts.push(`${p.sub} has a past medical history of ${params.pastMedicalHistory.join(', ')}.`);
  }

  if (params.pastSurgicalHistory.length > 0) {
    parts.push(`${p.sub} underwent ${params.pastSurgicalHistory.join(', ')}.`);
  } else {
    parts.push(`${p.sub} has had no previous abdominal surgeries.`);
  }

  if (params.medications.length > 0) {
    parts.push(`${p.sub} takes ${params.medications.join(', ')}.`);
  }

  if (params.socialHistory.length > 0) {
    parts.push(`${p.sub} is ${params.socialHistory.join(', ')}.`);
  }

  if (params.familyHistory.length > 0) {
    parts.push(`There is a family history of ${params.familyHistory.join(', ')}.`);
  }

  return parts.join(' ');
}

export function generateLboExamNarrative(params: {
  generalAppearance: string;
  hydrationStatus: string;
  bp: string;
  hr: number;
  rr: number;
  temp: number;
  spo2: number;
  distensionSeverity: string;
  distensionAsymmetry: boolean;
  visiblePeristalsis: boolean;
  scars: boolean;
  hernia: boolean;
  tympany: boolean;
  tenderness: string;
  guarding: boolean;
  rigidity: boolean;
  percussionNote: string;
  bowelSounds: string;
  dreSphincterTone: string;
  dreMass: boolean;
  dreBlood: boolean;
  dreStool: string;
  cvsFindings: string;
  rsFindings: string;
  cnsFindings: string;
}): string[] {
  const sections: string[] = [];

  sections.push('## General Examination');
  sections.push(`- Patient appears ${params.generalAppearance}.`);
  sections.push(`- Hydration: ${params.hydrationStatus}.`);
  sections.push(`- Vital signs: BP ${params.bp}, HR ${params.hr} bpm, RR ${params.rr}/min, Temp ${params.temp}°C, SpO2 ${params.spo2}% RA.`);

  sections.push('');
  sections.push('## Abdominal Examination');
  sections.push('### Inspection');
  sections.push(`- Abdomen is ${params.distensionSeverity}ly distended${params.distensionAsymmetry ? ', asymmetrical (dome-shaped)' : ''} and tense.`);
  if (params.visiblePeristalsis) sections.push('- Visible peristalsis present.');
  if (params.scars) sections.push('- Surgical scars present.');
  if (params.hernia) sections.push('- Hernia orifices — no hernia detected.');
  sections.push('');
  sections.push('### Percussion');
  sections.push(`- ${params.percussionNote} throughout abdomen. Shifting dullness negative.`);
  sections.push('');
  sections.push('### Palpation');
  sections.push(`- Tense distension. ${params.tenderness ? `${params.tenderness} tenderness.` : 'No tenderness.'}`);
  if (params.guarding) sections.push('- Guarding present (suggests peritonism).');
  if (params.rigidity) sections.push('- Rigidity present — suggests perforation.');
  sections.push('- No palpable masses separate from distended loops.');
  sections.push('');
  sections.push('### Auscultation');
  sections.push(`- Bowel sounds: ${params.bowelSounds}.`);
  sections.push('');
  sections.push('### Digital Rectal Examination');
  sections.push(`- Sphincter tone: ${params.dreSphincterTone}.`);
  sections.push(`- Stool in rectum: ${params.dreStool}.`);
  if (params.dreMass) sections.push('- Palpable mass noted.');
  if (params.dreBlood) sections.push('- Blood on examining finger noted.');
  if (!params.dreMass && !params.dreBlood) sections.push('- No masses palpable. No blood on examining finger.');

  sections.push('');
  sections.push('## Systemic Examination');
  sections.push(`- CVS: ${params.cvsFindings}`);
  sections.push(`- RS: ${params.rsFindings}`);
  sections.push(`- CNS: ${params.cnsFindings}`);

  return sections;
}

export function generateLboOperativeNote(params: {
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  procedure: string;
  findings: string;
  procedureDetails: string;
  bloodLoss: string;
  specimens: string[];
  complications: string[];
  surgeon: string;
  anaesthesia: string;
  disposition: string;
}): string {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return [
    '# OPERATIVE NOTE — LARGE BOWEL OBSTRUCTION',
    '',
    `**Date:** ${date}`,
    '',
    '---',
    '',
    '**Pre-operative Diagnosis:** ' + params.preOpDiagnosis,
    '',
    '**Post-operative Diagnosis:** ' + params.postOpDiagnosis,
    '',
    '**Procedure:** ' + params.procedure,
    '',
    '**Surgeon:** ' + params.surgeon,
    '',
    '**Anaesthesia:** ' + params.anaesthesia,
    '',
    '---',
    '',
    '## Findings',
    params.findings,
    '',
    '## Procedure Details',
    params.procedureDetails,
    '',
    '## Blood Loss',
    params.bloodLoss,
    '',
    '## Specimens',
    params.specimens.length > 0 ? params.specimens.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'None sent',
    '',
    '## Complications',
    params.complications.length > 0 ? params.complications.map((c, i) => `${i + 1}. ${c}`).join('\n') : 'None',
    '',
    '## Disposition',
    params.disposition,
    '',
    '---',
    '*Generated by AMEXAN Clinical Reasoning System — LBO Module*',
  ].join('\n');
}

export function generateLboDischargeSummary(params: {
  patientName: string;
  mrn: string;
  admissionDate: string;
  dischargeDate: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  procedures: string[];
  hospitalCourse: string;
  dischargeMeds: { drug: string; dose: string; frequency: string; duration: string }[];
  dietInstructions: string[];
  activityRestrictions: string[];
  woundCare: string[];
  stomaCare: string[];
  followUp: string[];
  redFlags: string[];
}): string {
  const sections: string[] = [
    '# DISCHARGE SUMMARY — LARGE BOWEL OBSTRUCTION',
    '',
    `**Patient:** ${params.patientName} (MRN: ${params.mrn})`,
    `**Admission:** ${params.admissionDate}`,
    `**Discharge:** ${params.dischargeDate}`,
    '',
    '---',
    '',
    '## Diagnoses',
    '**Primary:** ' + params.primaryDiagnosis,
    params.secondaryDiagnoses.length > 0 ? '**Secondary:** ' + params.secondaryDiagnoses.join(', ') : '',
    '',
    '## Procedures Performed',
    params.procedures.map((p) => '- ' + p).join('\n'),
    '',
    '## Hospital Course',
    params.hospitalCourse,
    '',
    '## Discharge Medications',
    '| Drug | Dose | Frequency | Duration |',
    '|------|------|-----------|----------|',
    params.dischargeMeds.map((m) => `| ${m.drug} | ${m.dose} | ${m.frequency} | ${m.duration} |`).join('\n'),
    '',
    '## Diet Instructions',
    params.dietInstructions.map((d) => '- ' + d).join('\n'),
    '',
    '## Activity Restrictions',
    params.activityRestrictions.map((a) => '- ' + a).join('\n'),
    '',
    '## Wound Care',
    params.woundCare.map((w) => '- ' + w).join('\n'),
    '',
  ];

  if (params.stomaCare.length > 0) {
    sections.push('## Stoma Care');
    sections.push(params.stomaCare.map((s) => '- ' + s).join('\n'));
    sections.push('');
  }

  sections.push('## Follow-Up');
  sections.push(params.followUp.map((f) => '- ' + f).join('\n'));
  sections.push('');
  sections.push('## Red Flags — Return to Hospital If:');
  sections.push(params.redFlags.map((r) => '- ' + r).join('\n'));
  sections.push('');
  sections.push('---');
  sections.push('*Generated by AMEXAN Clinical Reasoning System — LBO Module*');

  return sections.filter(Boolean).join('\n');
}

export function generateLboWardRound(params: {
  patientName: string;
  mrn: string;
  pod: number;
  date: string;
  subjective: string;
  vitals: { bp: string; hr: number; rr: number; temp: number; spo2: number };
  abdomen: string;
  wound: string;
  stoma: string;
  drains: string;
  labs: { test: string; value: string; trend: string }[];
  assessment: string;
  plan: string[];
  author: string;
}): string {
  return [
    `# WARD ROUND NOTE — Post-Op Day ${params.pod}`,
    '',
    `**Patient:** ${params.patientName} (MRN: ${params.mrn})`,
    `**Date:** ${params.date}`,
    `**Clinician:** ${params.author}`,
    '',
    '---',
    '',
    '## SUBJECTIVE',
    params.subjective,
    '',
    '## OBJECTIVE',
    `Vitals: BP ${params.vitals.bp} | HR ${params.vitals.hr} | RR ${params.vitals.rr} | Temp ${params.vitals.temp}°C | SpO2 ${params.vitals.spo2}%`,
    `Abdomen: ${params.abdomen}`,
    `Wound: ${params.wound}`,
    `Stoma: ${params.stoma}`,
    `Drains: ${params.drains}`,
    '',
    'Labs:',
    params.labs.map((l) => `- ${l.test}: ${l.value} (${l.trend})`).join('\n'),
    '',
    '## ASSESSMENT',
    params.assessment,
    '',
    '## PLAN',
    params.plan.map((p, i) => `  ${String.fromCharCode(97 + i)}. ${p}`).join('\n'),
    '',
    '---',
    '*Generated by AMEXAN Clinical Reasoning System — LBO Module*',
  ].join('\n');
}
