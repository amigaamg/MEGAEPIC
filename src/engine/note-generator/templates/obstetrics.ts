export function generateObstetricHpi(complaint: string, gestation: string): string {
  return `The patient, at ${gestation} weeks gestation, presents with ${complaint.toLowerCase()}. Obstetric history reviewed including gravidity, parity, and prior delivery outcomes.`;
}

export function generateObstetricExam(): string {
  return 'Obstetric examination reveals a gravid uterus consistent with dates. Fetal heart rate is reassuring. Membranes are intact. No vaginal bleeding or leakage. Contractions are not noted.';
}

export function generateObstetricAssessment(diagnosis: string): string {
  return `Assessment: ${diagnosis}. Fetal and maternal well-being assessed. Plan for mode and timing of delivery discussed with patient.`;
}

export function generateObstetricPlan(treatment: string): string {
  return `Plan: ${treatment}. Monitor maternal and fetal status. Prepare for delivery if indicated. Provide appropriate counselling and support. Postpartum plan reviewed.`;
}

export function getObstetricTemplate(): Record<string, Function> {
  return {
    hpi: generateObstetricHpi,
    exam: generateObstetricExam,
    assessment: generateObstetricAssessment,
    plan: generateObstetricPlan,
  };
}
