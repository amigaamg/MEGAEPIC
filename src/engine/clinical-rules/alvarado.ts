export interface AlvaradoInput {
  migratoryPain: boolean;
  anorexia: boolean;
  nauseaVomiting: boolean;
  rlqTenderness: boolean;
  reboundPain: boolean;
  fever: boolean;
  leukocytosis: boolean;
  leftShift: boolean;
}

export interface AlvaradoResult {
  totalPoints: number;
  riskCategory: 'low' | 'moderate' | 'high' | 'very_high';
  recommendation: string;
  components: { name: string; points: number; met: boolean }[];
}

export function calculateAlvarado(input: AlvaradoInput): AlvaradoResult {
  const components: { name: string; points: number; met: boolean }[] = [
    { name: 'Migratory pain to RLQ', points: 1, met: input.migratoryPain },
    { name: 'Anorexia', points: 1, met: input.anorexia },
    { name: 'Nausea / Vomiting', points: 1, met: input.nauseaVomiting },
    { name: 'RLQ Tenderness', points: 2, met: input.rlqTenderness },
    { name: 'Rebound Pain', points: 1, met: input.reboundPain },
    { name: 'Fever (>37.3°C)', points: 1, met: input.fever },
    { name: 'Leukocytosis (>10,000)', points: 2, met: input.leukocytosis },
    { name: 'Left Shift (>75% neutrophils)', points: 1, met: input.leftShift },
  ];

  const totalPoints = components.reduce((sum, c) => sum + (c.met ? c.points : 0), 0);

  let riskCategory: AlvaradoResult['riskCategory'];
  let recommendation: string;

  if (totalPoints <= 4) {
    riskCategory = 'low';
    recommendation = 'Can be observed. Consider alternative diagnoses.';
  } else if (totalPoints <= 6) {
    riskCategory = 'moderate';
    recommendation = 'Admit for observation, serial examinations, and imaging (US/CT).';
  } else if (totalPoints <= 8) {
    riskCategory = 'high';
    recommendation = 'Probable appendicitis. Surgical consult. Likely appendicectomy.';
  } else {
    riskCategory = 'very_high';
    recommendation = 'Very high probability. Emergency surgical consult and appendicectomy.';
  }

  return { totalPoints, riskCategory, recommendation, components };
}
