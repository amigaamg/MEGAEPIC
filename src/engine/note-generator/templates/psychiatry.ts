export function generatePsychiatricHpi(complaint: string, history: string): string {
  return `The patient presents with ${complaint.toLowerCase()}. ${history ? `Psychiatric history: ${history}.` : ''} Mental state examination performed. Risk assessment completed.`;
}

export function generatePsychiatricExam(): string {
  return 'Mental state examination reveals a well-groomed patient, cooperative and calm. Mood is euthymic. Thought process is logical and goal-directed. No perceptual abnormalities. Insight and judgement are intact. No suicidal or homicidal ideation.';
}

export function generatePsychiatricAssessment(diagnosis: string): string {
  return `Psychiatric assessment: ${diagnosis}. Risk assessment: low risk of harm to self or others. Capacity assessment: patient has capacity to make decisions regarding treatment.`;
}

export function generatePsychiatricPlan(treatment: string): string {
  return `Management plan: ${treatment}. Pharmacotherapy and psychotherapy as indicated. Regular monitoring for side effects and treatment response. Safety plan reviewed. Follow-up arranged.`;
}

export function getPsychiatricTemplate(): Record<string, Function> {
  return {
    hpi: generatePsychiatricHpi,
    exam: generatePsychiatricExam,
    assessment: generatePsychiatricAssessment,
    plan: generatePsychiatricPlan,
  };
}
