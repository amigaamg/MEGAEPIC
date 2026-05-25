import { PatientForm } from '../../types';
import { ClinicalInterpretation } from './clinicalInterpreter';
import { SyndromeResult } from './syndromeEngine';

export interface LocalizationResult {
  primary: string;
  secondary: string[];
  confidence: 'high' | 'moderate' | 'low';
  reasoning: string[];
}

interface LocalizationRule {
  name: string;
  weight: number;
  check: (interp: ClinicalInterpretation, form: PatientForm, syndromes: SyndromeResult) => boolean;
}

const LOCALIZATION_RULES: LocalizationRule[] = [
  {
    name: 'Upper airway (nose, pharynx, larynx)',
    weight: 5,
    check: (_, form) =>
      !!form.vitals.examStridor ||
      form.complaints.includes('stridor') ||
      form.hpi.coughChar === 'barking' ||
      !!form.hpi.hoarseness ||
      !!form.hpi.drooling,
  },
  {
    name: 'Lower airway / bronchi',
    weight: 4,
    check: (interp, form) =>
      !!form.vitals.examWheeze ||
      interp.respiratory.addedSounds.includes('wheeze') ||
      form.complaints.includes('wheeze'),
  },
  {
    name: 'Alveolar / lung parenchyma',
    weight: 5,
    check: (interp, form) =>
      !!form.vitals.examCrackles ||
      !!form.vitals.examBronchial ||
      interp.respiratory.percussion === 'dull' ||
      (interp.vitals.hypoxia && !!form.vitals.examCrackles),
  },
  {
    name: 'Pleural space',
    weight: 4,
    check: (interp, form) =>
      !!form.vitals.examReducedBS ||
      interp.respiratory.percussion === 'dull' ||
      !!form.vitals.examTrachealDeviation ||
      !!form.vitals.examHyperResonance ||
      interp.respiratory.percussion === 'hyperresonant',
  },
  {
    name: 'Cardiac',
    weight: 4,
    check: (_, form) =>
      (form.vitals.examMurmur !== '' && form.vitals.examMurmur !== 'none') ||
      !!form.vitals.examHepatomegaly ||
      !!form.vitals.edemaExam ||
      !!form.ros.cyanosisRos ||
      !!form.vitals.cyanosisExam ||
      form.vitals.examHeartSounds === 'gallop',
  },
  {
    name: 'Systemic / multi-organ',
    weight: 3,
    check: (interp, form, syndromes) => {
      const hasSepsis = syndromes.syndromes.some(s => s.name === 'Systemic Inflammatory Response / Sepsis' && s.score > 0.3);
      return hasSepsis || interp.dangerSigns.immediateDangerSigns.length > 0 || interp.avpu !== 'alert';
    },
  },
  {
    name: 'CNS / meningeal',
    weight: 4,
    check: (_, form, syndromes) => {
      const hasMeningeal = syndromes.syndromes.some(s => s.name === 'Meningeal Irritation' && s.score > 0.3);
      return hasMeningeal || !!form.vitals.examNeckStiffness || form.vitals.examFontanelle === 'bulging';
    },
  },
];

export function localizeDisease(
  syndromes: SyndromeResult,
  interpretation: ClinicalInterpretation,
  form: PatientForm,
): LocalizationResult {
  const scored: { name: string; score: number }[] = [];
  const reasoning: string[] = [];

  for (const rule of LOCALIZATION_RULES) {
    if (rule.check(interpretation, form, syndromes)) {
      const syndromeBoosts = syndromes.syndromes
        .filter(s => s.score > 0.4)
        .reduce((sum, s) => sum + s.score * 0.3, 0);
      const finalScore = rule.weight + syndromeBoosts;
      scored.push({ name: rule.name, score: finalScore });

      switch (rule.name) {
        case 'Upper airway (nose, pharynx, larynx)':
          reasoning.push('Stridor, barking cough, drooling, or hoarseness points to upper airway pathology');
          break;
        case 'Lower airway / bronchi':
          reasoning.push('Wheeze on auscultation suggests bronchi/bronchiolar involvement');
          break;
        case 'Alveolar / lung parenchyma':
          reasoning.push('Crackles, bronchial breathing, or dullness indicate parenchymal lung involvement');
          break;
        case 'Pleural space':
          reasoning.push('Reduced breath sounds, dullness/hyperresonance, or tracheal deviation suggests pleural pathology');
          break;
        case 'Cardiac':
          reasoning.push('Murmur, hepatomegaly, edema, or cyanosis point to cardiac origin');
          break;
        case 'Systemic / multi-organ':
          reasoning.push('Danger signs, altered consciousness, or sepsis syndrome suggest systemic illness');
          break;
        case 'CNS / meningeal':
          reasoning.push('Neck stiffness, bulging fontanelle, or meningeal syndrome suggests CNS involvement');
          break;
      }
    }
  }

  if (scored.length === 0) {
    return {
      primary: 'Unclear / not localizable',
      secondary: [],
      confidence: 'low',
      reasoning: ['Insufficient findings to localize the disease process'],
    };
  }

  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;

  const grouped = scored.filter(s => s.score >= topScore * 0.7);
  const primary = grouped[0].name;
  const secondary = grouped.slice(1).map(s => s.name);

  const ratio = grouped.length > 1 ? grouped[1].score / topScore : 0;
  let confidence: LocalizationResult['confidence'] = 'high';
  if (ratio > 0.85) confidence = 'moderate';
  if (ratio > 0.95 || scored.length < 2) confidence = 'low';

  return { primary, secondary, confidence, reasoning };
}
