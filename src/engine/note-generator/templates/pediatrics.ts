export function generatePediatricHpi(complaint: string, age: string): string {
  return `The ${age} child presents with ${complaint.toLowerCase()}. The illness has been progressing over the past several days.`;
}

export function generatePediatricExam(): string {
  return 'On examination, the child appears well/non-toxic. Vital signs are within normal limits for age. Respiratory examination reveals clear breath sounds bilaterally. Cardiovascular examination reveals normal heart sounds with no murmurs.';
}

export function generatePediatricAssessment(diagnosis: string, severity: string): string {
  return `Assessment: ${diagnosis}. Severity: ${severity}. The child requires ${severity === 'severe' ? 'urgent' : 'routine'} management per paediatric protocols.`;
}

export function generatePediatricPlan(treatment: string): string {
  return `Management plan: ${treatment}. Monitor response to therapy. Provide supportive care including hydration, nutrition, and antipyretics as needed. Educate caregivers on warning signs.`;
}

export function getPediatricTemplate(): Record<string, Function> {
  return {
    hpi: generatePediatricHpi,
    exam: generatePediatricExam,
    assessment: generatePediatricAssessment,
    plan: generatePediatricPlan,
  };
}
