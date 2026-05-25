import { PatientForm } from '../../types';
import { ClinicalInterpretation } from './clinicalInterpreter';

export interface SyndromeScore {
  name: string;
  score: number;
  confidence: 'high' | 'moderate' | 'low';
  featuresPresent: string[];
  featuresAbsent: string[];
}

export interface SyndromeResult {
  syndromes: SyndromeScore[];
  primarySyndrome: string | null;
}

interface SyndromeDefinition {
  name: string;
  features: { id: string; label: string; weight: number }[];
  maxScore: number;
}

const SYNDROMES: SyndromeDefinition[] = [
  {
    name: 'Acute Respiratory Distress',
    features: [
      { id: 'tachypnea', label: 'Tachypnea', weight: 3 },
      { id: 'indrawing', label: 'Chest indrawing', weight: 3 },
      { id: 'nasalFlaring', label: 'Nasal flaring', weight: 2 },
      { id: 'grunting', label: 'Grunting', weight: 4 },
      { id: 'headBobbing', label: 'Head bobbing', weight: 2 },
      { id: 'dyspnea', label: 'Difficulty breathing', weight: 2 },
    ],
    maxScore: 16,
  },
  {
    name: 'Lower Respiratory Tract Infection',
    features: [
      { id: 'cough', label: 'Cough', weight: 3 },
      { id: 'fever', label: 'Fever', weight: 3 },
      { id: 'crackles', label: 'Crackles', weight: 4 },
      { id: 'tachypnea', label: 'Tachypnea', weight: 3 },
      { id: 'bronchial', label: 'Bronchial breathing', weight: 4 },
      { id: 'hypoxia', label: 'Hypoxia', weight: 3 },
    ],
    maxScore: 20,
  },
  {
    name: 'Upper Airway Obstruction',
    features: [
      { id: 'stridor', label: 'Stridor', weight: 4 },
      { id: 'barking_cough', label: 'Barking cough', weight: 3 },
      { id: 'drooling', label: 'Drooling', weight: 4 },
      { id: 'hoarseness', label: 'Hoarseness', weight: 2 },
      { id: 'tripod', label: 'Tripod posture', weight: 4 },
    ],
    maxScore: 17,
  },
  {
    name: 'Systemic Inflammatory Response / Sepsis',
    features: [
      { id: 'fever', label: 'Fever', weight: 3 },
      { id: 'tachycardia', label: 'Tachycardia', weight: 3 },
      { id: 'danger_immediate', label: 'Immediate danger signs', weight: 4 },
      { id: 'avpu_altered', label: 'Altered AVPU', weight: 4 },
      { id: 'hypotension', label: 'Hypotension', weight: 3 },
      { id: 'crt_prolonged', label: 'Prolonged CRT', weight: 3 },
      { id: 'toxic', label: 'Toxic appearance', weight: 3 },
    ],
    maxScore: 23,
  },
  {
    name: 'Air Leak Syndrome',
    features: [
      { id: 'sudden_onset', label: 'Sudden onset dyspnea', weight: 4 },
      { id: 'hyperresonance', label: 'Hyperresonance', weight: 4 },
      { id: 'reduced_bs', label: 'Reduced breath sounds', weight: 3 },
      { id: 'tracheal_deviation', label: 'Tracheal deviation', weight: 5 },
      { id: 'chest_pain', label: 'Chest pain', weight: 2 },
    ],
    maxScore: 18,
  },
  {
    name: 'Cardiac Failure',
    features: [
      { id: 'tachycardia', label: 'Tachycardia', weight: 3 },
      { id: 'hepatomegaly', label: 'Hepatomegaly', weight: 4 },
      { id: 'edema', label: 'Edema', weight: 3 },
      { id: 'poor_feeding', label: 'Poor feeding', weight: 2 },
      { id: 'sweating_feeds', label: 'Sweating during feeds', weight: 3 },
      { id: 'orthopnea', label: 'Orthopnea', weight: 3 },
      { id: 'murmur', label: 'Murmur', weight: 3 },
      { id: 'gallop', label: 'Gallop rhythm', weight: 4 },
    ],
    maxScore: 25,
  },
  {
    name: 'Meningeal Irritation',
    features: [
      { id: 'fever', label: 'Fever', weight: 3 },
      { id: 'neck_stiffness', label: 'Neck stiffness', weight: 4 },
      { id: 'convulsions', label: 'Convulsions', weight: 4 },
      { id: 'avpu_altered', label: 'Altered consciousness', weight: 4 },
      { id: 'bulging_fontanelle', label: 'Bulging fontanelle', weight: 4 },
      { id: 'photophobia', label: 'Photophobia', weight: 2 },
    ],
    maxScore: 21,
  },
  {
    name: 'Severe Malnutrition',
    features: [
      { id: 'muac_low', label: 'MUAC < 11.5 cm', weight: 5 },
      { id: 'edema', label: 'Bilateral pitting edema', weight: 5 },
      { id: 'wasting', label: 'Muscle wasting', weight: 3 },
      { id: 'growth_faltering', label: 'Growth faltering', weight: 3 },
    ],
    maxScore: 16,
  },
  {
    name: 'Acute Abdomen',
    features: [
      { id: 'abdominal_pain', label: 'Abdominal pain', weight: 3 },
      { id: 'distension', label: 'Distension', weight: 3 },
      { id: 'vomiting', label: 'Vomiting', weight: 3 },
      { id: 'tenderness', label: 'Tenderness', weight: 3 },
      { id: 'hepatomegaly', label: 'Hepatomegaly', weight: 2 },
    ],
    maxScore: 14,
  },
];

function checkFeature(featureId: string, interpretation: ClinicalInterpretation, form: PatientForm): boolean {
  switch (featureId) {
    case 'tachypnea': return interpretation.vitals.tachypnea;
    case 'indrawing': return interpretation.respiratory.indrawing;
    case 'nasalFlaring': return interpretation.respiratory.nasalFlaring;
    case 'grunting': return interpretation.respiratory.grunting;
    case 'headBobbing': return interpretation.respiratory.headBobbing;
    case 'dyspnea': return form.complaints.includes('difficulty_breathing');
    case 'cough': return form.complaints.includes('cough');
    case 'fever': return interpretation.vitals.fever;
    case 'crackles': return !!form.vitals.examCrackles;
    case 'bronchial': return !!form.vitals.examBronchial;
    case 'hypoxia': return interpretation.vitals.hypoxia;
    case 'stridor': return !!form.vitals.examStridor || form.complaints.includes('stridor');
    case 'barking_cough': return form.hpi.coughChar === 'barking';
    case 'drooling': return !!form.hpi.drooling;
    case 'hoarseness': return !!form.hpi.hoarseness;
    case 'tripod': return !!form.hpi.tripodPosition;
    case 'tachycardia': return interpretation.vitals.tachycardia;
    case 'danger_immediate': return interpretation.dangerSigns.immediateDangerSigns.length > 0;
    case 'avpu_altered': return interpretation.avpu !== 'alert';
    case 'hypotension': return interpretation.vitals.hypotension;
    case 'crt_prolonged': return interpretation.perfusion === 'prolonged_crt' || interpretation.perfusion === 'shock';
    case 'toxic': return form.vitals.generalCondition === 'toxic' || form.vitals.generalCondition === 'severe';
    case 'sudden_onset': return !!form.hpi.suddenOnset;
    case 'hyperresonance': return !!form.vitals.examHyperResonance;
    case 'reduced_bs': return !!form.vitals.examReducedBS;
    case 'tracheal_deviation': return !!form.vitals.examTrachealDeviation;
    case 'chest_pain': return form.complaints.includes('chest_pain') || !!form.hpi.pleuriticPain;
    case 'hepatomegaly': return !!form.vitals.examHepatomegaly;
    case 'edema': return !!form.vitals.edemaExam;
    case 'poor_feeding': return !!form.hpi.feedingDiff || form.nutrition.appetite === 'poor';
    case 'sweating_feeds': return !!form.hpi.sweatingFeeds;
    case 'orthopnea': return !!form.hpi.orthopnea;
    case 'murmur': return form.vitals.examMurmur !== '' && form.vitals.examMurmur !== 'none';
    case 'gallop': return form.vitals.examHeartSounds === 'gallop';
    case 'neck_stiffness': return !!form.vitals.examNeckStiffness;
    case 'convulsions': return !!form.ros.seizures || !!form.hpi.seizureHPI;
    case 'bulging_fontanelle': return form.vitals.examFontanelle === 'bulging';
    case 'photophobia': return form.hpi.character?.includes('light') || form.hpi.site === 'head';
    case 'muac_low': return parseFloat(form.vitals.muac) < 11.5;
    case 'wasting': return !!form.vitals.examMuscleWasting;
    case 'growth_faltering': return !!form.hpi.weightLoss || !!form.development.concerns;
    case 'abdominal_pain': return form.complaints.includes('abdominal_pain') || !!form.ros.abdominalPain;
    case 'distension': return !!form.vitals.examAbdDistension;
    case 'vomiting': return !!form.ros.vomiting || !!form.hpi.vomitingHPI;
    case 'tenderness': return form.vitals.examTenderness !== '' && form.vitals.examTenderness !== 'none';
    default: return false;
  }
}

export function identifySyndromes(interpretation: ClinicalInterpretation, form: PatientForm): SyndromeResult {
  const syndromes: SyndromeScore[] = [];

  for (const def of SYNDROMES) {
    const present: string[] = [];
    const absent: string[] = [];
    let totalWeight = 0;

    for (const feat of def.features) {
      const isPresent = checkFeature(feat.id, interpretation, form);
      if (isPresent) {
        present.push(feat.label);
        totalWeight += feat.weight;
      } else {
        absent.push(feat.label);
      }
    }

    const score = def.maxScore > 0 ? totalWeight / def.maxScore : 0;
    const clampedScore = Math.min(1, Math.max(0, score));

    let confidence: SyndromeScore['confidence'] = 'low';
    if (clampedScore >= 0.6) confidence = 'high';
    else if (clampedScore >= 0.35) confidence = 'moderate';

    syndromes.push({
      name: def.name,
      score: clampedScore,
      confidence,
      featuresPresent: present,
      featuresAbsent: absent,
    });
  }

  syndromes.sort((a, b) => b.score - a.score);
  const primarySyndrome = syndromes.length > 0 && syndromes[0].score > 0 ? syndromes[0].name : null;

  return { syndromes, primarySyndrome };
}
