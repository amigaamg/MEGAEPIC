import { getDiseaseById } from '@/engine/knowledge-graph';

export interface SymptomSelection {
  symptomId: string;
  label: string;
  selected: boolean;
  details: {
    site?: string;
    onset?: string;
    duration?: string;
    character?: string;
    radiation?: string;
    severity?: number;
    exacerbating?: string;
    relieving?: string;
    associatedSymptoms?: string[];
    progression?: string;
    similarEpisodes?: boolean;
    previousDiagnosis?: string;
  };
  answeredQuestions: { questionId: string; question: string; answer: string | boolean }[];
}

export interface HpiGenerationInput {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  presentingComplaint: string;
  complaintDuration: string;
  symptoms: SymptomSelection[];
  pastMedicalHistory?: string[];
  pastSurgicalHistory?: string[];
  drugHistory?: string[];
  allergies?: string[];
  socialHistory?: string[];
  familyHistory?: string[];
  reviewOfSystems?: string[];
}

function formatList(items: string[]): string {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(', ')}, and ${filtered[filtered.length - 1]}`;
}

function getPronouns(gender?: string) {
  const f = gender?.toLowerCase() === 'female' || gender?.toLowerCase() === 'f';
  return {
    sub: f ? 'She' : 'He',
    obj: f ? 'her' : 'him',
    pos: f ? 'her' : 'his',
    title: f ? 'lady' : 'gentleman',
  };
}

function buildSymptomNarrative(
  symptom: SymptomSelection,
  p: ReturnType<typeof getPronouns>,
): string[] {
  const parts: string[] = [];
  const d = symptom.details;
  const label = symptom.label.toLowerCase();

  if (d.onset || d.site) {
    const words: string[] = [];
    if (d.onset) words.push(`began ${d.onset}`);
    if (d.site) {
      const prefix = words.length > 0 ? '' : 'is located';
      words.push(`${prefix} in the ${d.site}`);
    }
    parts.push(`The ${label} ${words.join(' and ')}.`);
    if (d.progression) {
      parts[parts.length - 1] = parts[parts.length - 1].replace(
        /\.$/,
        ` and has ${d.progression}.`,
      );
    }
  } else if (d.progression) {
    parts.push(`The ${label} has ${d.progression}.`);
  }

  if (d.character) {
    parts.push(`It is ${d.character} in nature.`);
  }

  if (d.duration && !d.onset && !d.site) {
    parts.push(`It has been present for ${d.duration}.`);
  }

  if (d.associatedSymptoms && d.associatedSymptoms.length > 0) {
    parts.push(`It is associated with ${formatList(d.associatedSymptoms)}.`);
  }

  if (d.radiation) {
    parts.push(`There is radiation to the ${d.radiation}.`);
  }

  if (d.exacerbating) {
    parts.push(`It is exacerbated by ${d.exacerbating}.`);
  }

  if (d.relieving) {
    const lc = d.relieving.toLowerCase();
    if (lc.startsWith('no ')) {
      parts.push(`${p.sub} reports ${d.relieving}.`);
    } else {
      parts.push(`It is relieved by ${d.relieving}.`);
    }
  }

  if (d.severity !== undefined) {
    parts.push(`On a scale of 1-10, the ${label} is currently ${d.severity}/10.`);
  }

  if (d.similarEpisodes !== undefined) {
    parts.push(
      d.similarEpisodes
        ? `${p.sub} has had similar episodes previously.`
        : `${p.sub} has had no similar episodes previously.`,
    );
  }

  if (d.previousDiagnosis) {
    parts.push(`${p.sub} carries a prior diagnosis of ${d.previousDiagnosis}.`);
  }

  return parts;
}

function categorizeQuestion(question: string): string {
  const q = question.toLowerCase();

  if (
    /^(start|begin|onset|when did|first notice)/.test(q) ||
    /(how long|duration|sudden|gradual)/.test(q)
  )
    return 'onset';

  if (
    /(describe|feel like|character|type of|what does it|nature|how would you describe)/.test(
      q,
    ) ||
    /(burning|sharp|dull|colicky|cramping|gnawing)/.test(q)
  )
    return 'character';

  if (
    /(associated|along with|accompany|also have|other symptom|anything else)/.test(q)
  )
    return 'associated';

  if (
    /(worse|better|reliev|aggravat|exacerbat|trigger|what makes|improve)/.test(q)
  )
    return 'context';

  if (
    /(smoke|alcohol|family history|past medical|comorbid|risk factor|history of|previous|medication|surgery|allerg)/.test(
      q,
    )
  )
    return 'risk';

  return 'character';
}

export function generateHPI(input: HpiGenerationInput): string {
  const p = getPronouns(input.patientGender);
  const parts: string[] = [];
  const ageStr = input.patientAge ? `${input.patientAge}-year-old` : '';
  const selectedSymptoms = input.symptoms.filter((s) => s.selected);

  const openingDemographics = ageStr
    ? `a ${ageStr} ${p.title}`
    : `a ${p.title}`;
  parts.push(
    `The patient is ${openingDemographics} who presents with a ${input.complaintDuration} history of ${input.presentingComplaint.toLowerCase()}.`,
  );

  for (const symptom of selectedSymptoms) {
    const narrative = buildSymptomNarrative(symptom, p);
    parts.push(...narrative);
  }

  for (const symptom of selectedSymptoms) {
    for (const q of symptom.answeredQuestions) {
      if (typeof q.answer === 'boolean') {
        parts.push(
          q.answer
            ? `${p.sub} confirms ${q.question.toLowerCase()}.`
            : `${p.sub} denies ${q.question.toLowerCase()}.`,
        );
      } else if (typeof q.answer === 'string' && q.answer.trim()) {
        parts.push(`${p.sub} reports ${q.answer}.`);
      }
    }
  }

  if (input.pastMedicalHistory?.length) {
    parts.push(
      `${p.sub} has a past medical history of ${formatList(input.pastMedicalHistory.map((s) => s.toLowerCase()))}.`,
    );
  }

  if (input.pastSurgicalHistory?.length) {
    parts.push(
      `${p.sub} underwent ${formatList(input.pastSurgicalHistory.map((s) => s.toLowerCase()))}.`,
    );
  }

  if (input.drugHistory?.length) {
    parts.push(`${p.sub} takes ${formatList(input.drugHistory)}.`);
  }

  if (input.allergies?.length) {
    parts.push(`${p.sub} has allergies to ${formatList(input.allergies)}.`);
  }

  if (input.socialHistory?.length) {
    const sh = input.socialHistory.filter(Boolean).map((s) => s.toLowerCase());
    if (sh.length > 0) {
      parts.push(`${p.sub} is ${formatList(sh)}.`);
    }
  }

  if (input.familyHistory?.length) {
    parts.push(
      `There is a family history of ${formatList(input.familyHistory.map((s) => s.toLowerCase()))}.`,
    );
  }

  if (input.reviewOfSystems?.length) {
    parts.push(
      `Review of systems is positive for ${formatList(input.reviewOfSystems.map((s) => s.toLowerCase()))}.`,
    );
  }

  return parts.join(' ');
}

export function getQuestionsForSymptom(
  diseaseId: string,
  _symptomId: string,
): { id: string; question: string; category: string }[] {
  const disease = getDiseaseById(diseaseId);
  if (!disease) return [];

  const legacyQuestions = (disease as any).history_questions as
    | { question: string; weight: number }[]
    | undefined;

  if (legacyQuestions) {
    return legacyQuestions.map((q, i) => ({
      id: `${diseaseId}_hq_${i}`,
      question: q.question,
      category: categorizeQuestion(q.question),
    }));
  }

  if (disease.historyFeatures) {
    return disease.historyFeatures
      .filter((hf) => hf.symptomId === _symptomId)
      .map((hf, i) => ({
        id: hf.symptomId || `${diseaseId}_hf_${i}`,
        question: hf.symptomId?.replace(/_/g, ' ') || '',
        category: 'character',
      }));
  }

  return [];
}
