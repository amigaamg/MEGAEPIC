import { ModuleDefinition, Biodata, ChiefComplaint, ClinicalFact, ModuleType } from '../types/ces';

export const MODULES: ModuleDefinition[] = [
  {
    id: 'neonatal',
    label: 'Neonatal',
    icon: '👶',
    condition: (b: Biodata) => b.ageGroup === 'neonate',
    phases: ['patient_context', 'past_medical', 'social_history', 'review_of_systems'],
    questionGroups: ['neonatal_birth', 'neonatal_feeding', 'neonatal_maternal'],
  },
  {
    id: 'infant',
    label: 'Infant',
    icon: '👶',
    condition: (b: Biodata) => b.ageGroup === 'infant',
    phases: ['patient_context', 'past_medical', 'review_of_systems'],
    questionGroups: ['infant_growth', 'infant_feeding', 'infant_vaccines'],
  },
  {
    id: 'pediatric',
    label: 'Pediatric',
    icon: '🧒',
    condition: (b: Biodata) => b.ageGroup === 'child' || b.ageGroup === 'adolescent',
    phases: ['patient_context', 'past_medical', 'social_history', 'review_of_systems'],
    questionGroups: ['pediatric_growth', 'pediatric_development', 'pediatric_vaccines'],
  },
  {
    id: 'adolescent',
    label: 'Adolescent',
    icon: '🧑',
    condition: (b: Biodata) => b.ageGroup === 'adolescent',
    phases: ['social_history', 'review_of_systems'],
    questionGroups: ['adolescent_mental', 'adolescent_sexual', 'adolescent_risk'],
  },
  {
    id: 'geriatric',
    label: 'Geriatric',
    icon: '👴',
    condition: (b: Biodata) => b.ageGroup === 'elderly',
    phases: ['patient_context', 'functional_assessment', 'social_history', 'review_of_systems'],
    questionGroups: ['geriatric_frailty', 'geriatric_falls', 'geriatric_adl', 'geriatric_cognition'],
  },
  {
    id: 'female',
    label: 'Women\'s Health',
    icon: '👩',
    condition: (b: Biodata) => b.sex === 'female' && b.age >= 10,
    phases: ['patient_context', 'review_of_systems'],
    questionGroups: ['female_lmp', 'female_contraception', 'female_obgyn'],
  },
  {
    id: 'male',
    label: 'Men\'s Health',
    icon: '👨',
    condition: (b: Biodata) => b.sex === 'male' && b.age >= 40,
    phases: ['review_of_systems'],
    questionGroups: ['male_prostate', 'male_sexual'],
  },
  {
    id: 'pregnancy',
    label: 'Pregnancy',
    icon: '🤰',
    condition: (b: Biodata, c: ChiefComplaint[], f: Record<string, ClinicalFact>) => {
      if (b.sex !== 'female') return false;
      const preg = f['pregnancy_possible']?.value;
      return preg?.value === true || preg?.value === 'yes' || c.some(cc => cc.complaint.toLowerCase().includes('preg'));
    },
    phases: ['patient_context', 'review_of_systems', 'management'],
    questionGroups: ['pregnancy_antenatal', 'pregnancy_danger', 'pregnancy_history'],
  },
  {
    id: 'psychiatry',
    label: 'Psychiatry',
    icon: '🧠',
    condition: (_b: Biodata, c: ChiefComplaint[]) =>
      c.some(cc =>
        ['depression', 'anxiety', 'hallucination', 'suicidal', 'mood', 'psychosis', 'mental'].some(k =>
          cc.complaint.toLowerCase().includes(k)
        )
      ),
    phases: ['review_of_systems', 'management'],
    questionGroups: ['psychiatry_mse', 'psychiatry_risk'],
  },
  {
    id: 'surgery',
    label: 'Surgery',
    icon: '🔪',
    condition: (_b: Biodata, c: ChiefComplaint[]) =>
      c.some(cc =>
        ['pain', 'mass', 'swelling', 'trauma', 'wound', 'bleeding', 'abscess'].some(k =>
          cc.complaint.toLowerCase().includes(k)
        )
      ) || _b.encounterType === 'operative_note' || _b.encounterType === 'post_op',
    phases: ['patient_context', 'examination', 'investigations', 'management'],
    questionGroups: ['surgery_wound', 'surgery_drains', 'surgery_postop'],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: '🚨',
    condition: (b: Biodata) => b.triageCategory === 'resuscitation' || b.triageCategory === 'emergency' || b.encounterType === 'emergency',
    phases: ['review_of_systems', 'examination', 'management'],
    questionGroups: ['emergency_abcde', 'emergency_airway', 'emergency_breathing', 'emergency_circulation'],
  },
];

export function detectActiveModules(biodata: Biodata, complaints: ChiefComplaint[], facts: Record<string, ClinicalFact>): ModuleType[] {
  return MODULES.filter(m => m.condition(biodata, complaints, facts)).map(m => m.id);
}
