export function generateSurgicalHpi(complaint: string, findings: string): string {
  return `The patient presents with ${complaint.toLowerCase()}. ${findings ? `On examination, ${findings.toLowerCase()}.` : ''}`;
}

export function generateSurgicalExam(): string {
  return 'General examination reveals a patient in moderate distress. Abdominal examination reveals tenderness, guarding, and rebound tenderness in the affected quadrant. Bowel sounds are present.';
}

export function generateSurgicalAssessment(diagnosis: string, procedure: string): string {
  return `The patient is assessed to have ${diagnosis}. The recommended surgical intervention is ${procedure}.`;
}

export function generateSurgicalPlan(procedure: string, postOpCare: string): string {
  return `Plan: ${procedure}. Post-operative care includes ${postOpCare}. Monitor for complications including bleeding, infection, and ileus.`;
}

export function getSurgicalTemplate(): Record<string, Function> {
  return {
    hpi: generateSurgicalHpi,
    exam: generateSurgicalExam,
    assessment: generateSurgicalAssessment,
    plan: generateSurgicalPlan,
  };
}
