// ═══════════════════════════════════════════════════════════════════════════════
// Patient Education Engine
// Generates patient-facing education materials, red flag instructions,
// and medication instructions for common diagnoses.
// ═══════════════════════════════════════════════════════════════════════════════

export interface PatientEducationContext {
  age: number
  pregnant: boolean
  language?: string
}

export interface MedicationInstructionInput {
  name: string
  dose: string
  frequency: string
  duration: string
}

const EDUCATION_MAP: Record<string, string[]> = {
  hypertension: [
    'Reduce salt intake to less than 5g (1 teaspoon) per day',
    'Exercise for at least 30 minutes most days of the week',
    'Take your blood pressure medication exactly as prescribed',
    'Monitor your blood pressure regularly at home',
    'Limit alcohol consumption and avoid smoking',
    'Maintain a healthy body weight',
  ],
  diabetes: [
    'Monitor your blood sugar levels as advised by your doctor',
    'Follow a balanced diabetic diet low in refined sugars',
    'Take your diabetes medication or insulin as prescribed',
    'Check your feet daily for cuts, blisters, or sores',
    'Stay physically active — aim for 150 minutes per week',
    'Attend regular follow-up appointments for HbA1c checks',
  ],
  asthma: [
    'Use your inhaler as prescribed — do not skip doses',
    'Avoid known triggers such as dust, smoke, and pollen',
    'Keep your reliever inhaler with you at all times',
    'Rinse your mouth after using steroid inhalers',
    'Have an asthma action plan and know when to seek help',
    'Get your annual flu vaccination',
  ],
  uti: [
    'Drink plenty of water to help flush out bacteria',
    'Urinate frequently and completely — do not hold urine',
    'Wipe from front to back after using the toilet',
    'Avoid using scented soaps or feminine hygiene products',
    'Take the full course of antibiotics even if you feel better',
    'Urinate shortly after sexual intercourse',
  ],
  malaria: [
    'Take the full course of antimalarial medication as prescribed',
    'Use insecticide-treated bed nets while sleeping',
    'Apply mosquito repellent during dusk and dawn',
    'Wear long-sleeved clothing in mosquito-prone areas',
    'Seek medical attention if fever returns after treatment',
    'Eliminate standing water around your home',
  ],
  pneumonia: [
    'Take all antibiotics as prescribed — do not stop early',
    'Rest until your fever resolves and you feel stronger',
    'Drink plenty of fluids to loosen mucus',
    'Use a humidifier or steam inhalation to ease breathing',
    'Avoid smoking and second-hand smoke',
    'Seek urgent care if breathing worsens or chest pain develops',
  ],
  gastroenteritis: [
    'Drink oral rehydration solution (ORS) frequently in small sips',
    'Avoid dairy, spicy foods, and fatty foods until recovered',
    'Eat bland foods like rice, bananas, toast, and applesauce',
    'Wash hands thoroughly after using the bathroom',
    'Do not take anti-diarrheal medication without asking a doctor',
    'Return if you cannot keep fluids down for more than 24 hours',
  ],
  headache_tension: [
    'Rest in a quiet, dark room until the headache subsides',
    'Apply a cold or warm compress to your forehead or neck',
    'Stay hydrated and avoid skipping meals',
    'Limit caffeine intake to avoid rebound headaches',
    'Practice stress management techniques such as deep breathing',
    'Over-the-counter pain relievers can help — use as directed',
  ],
}

const RED_FLAG_INSTRUCTIONS: Record<string, string> = {
  default: 'Seek immediate emergency care. Do not wait. Call emergency services or go to the nearest emergency department.',
  chest_pain: 'If you have chest pain with shortness of breath, nausea, or sweating, call an ambulance immediately. Do not drive yourself.',
  head_injury: 'If you have loss of consciousness, vomiting, confusion, or severe headache after a head injury, go to the emergency department immediately.',
  breathing: 'If you are having difficulty breathing, chest tightness, or your lips turn blue, call emergency services immediately.',
  bleeding: 'If you are bleeding heavily and cannot stop it with direct pressure, or if you are coughing up or vomiting blood, go to the nearest emergency room.',
  pregnancy: 'If you are pregnant and have vaginal bleeding, severe abdominal pain, or severe headache, go to the emergency department immediately.',
}

export function generatePatientEducation(
  diagnosis: string,
  context: PatientEducationContext,
): string[] {
  const key = diagnosis.toLowerCase().trim()
  const matched = Object.keys(EDUCATION_MAP).find(k => key.includes(k))
  const baseTips = matched ? [...EDUCATION_MAP[matched]] : [`Follow your doctor's advice for managing ${diagnosis}.`]

  if (context.pregnant) {
    baseTips.push('Inform all your healthcare providers that you are pregnant before starting any new treatment.')
  }

  if (context.age < 18) {
    baseTips.push('Ensure a parent or guardian supervises all medication administration.')
  }

  if (context.age >= 65) {
    baseTips.push('Be aware that side effects may be more likely at your age — report any new symptoms promptly.')
  }

  return baseTips
}

export function getRedFlagInstructions(redFlags: string[]): string {
  for (const flag of redFlags) {
    const lower = flag.toLowerCase()
    for (const [key, instruction] of Object.entries(RED_FLAG_INSTRUCTIONS)) {
      if (key !== 'default' && lower.includes(key)) {
        return instruction
      }
    }
  }
  return RED_FLAG_INSTRUCTIONS.default
}

export function getMedicationInstructions(medications: MedicationInstructionInput[]): string {
  if (medications.length === 0) return 'No medications prescribed.'

  const parts: string[] = ['Your prescribed medications:']

  for (const med of medications) {
    parts.push(
      `- ${med.name}: Take ${med.dose} ${med.frequency} for ${med.duration}.`,
    )
  }

  parts.push('')
  parts.push('Important: Complete the full course of all medications unless your doctor advises otherwise. Do not share medications with others.')

  return parts.join('\n')
}
