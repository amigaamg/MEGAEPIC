export function generateCardiologyHpi(complaint: string, findings: string): string {
  return `The patient presents with ${complaint.toLowerCase()} of cardiac nature. ${findings ? `Additional history: ${findings}.` : ''} Risk factors for cardiovascular disease are assessed.`;
}

export function generateCardiologyExam(): string {
  return 'Cardiovascular examination reveals regular rhythm. Heart sounds are normal with no added sounds or murmurs. Jugular venous pressure is not elevated. Peripheral pulses are palpable and symmetrical. No peripheral oedema.';
}

export function generateCardiologyAssessment(diagnosis: string, severity: string): string {
  return `Cardiological assessment: ${diagnosis}. New York Heart Association functional class assessed. Severity: ${severity}. Echocardiographic correlation recommended.`;
}

export function generateCardiologyPlan(treatment: string): string {
  return `Management plan: ${treatment}. Lifestyle modifications including diet, exercise, and smoking cessation. Pharmacological therapy as indicated. Regular follow-up for monitoring and dose adjustment.`;
}

export function getCardiologyTemplate(): Record<string, Function> {
  return {
    hpi: generateCardiologyHpi,
    exam: generateCardiologyExam,
    assessment: generateCardiologyAssessment,
    plan: generateCardiologyPlan,
  };
}
