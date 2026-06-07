export interface BayesianInput {
  priorProbability: number;
  findingLikelihood: number;
  findingFalsePositive: number;
}

export interface BayesianResult {
  posteriorProbability: number;
  probabilityChange: number;
  likelihoodRatio: number;
  interpretation: string;
}

export function bayesianUpdate(input: BayesianInput): BayesianResult {
  const { priorProbability, findingLikelihood, findingFalsePositive } = input;
  const priorOdds = priorProbability / (100 - priorProbability);
  const likelihoodRatio = findingLikelihood / findingFalsePositive;
  const posteriorOdds = priorOdds * likelihoodRatio;
  const posteriorProbability = (posteriorOdds / (1 + posteriorOdds)) * 100;

  return {
    posteriorProbability: Math.min(100, Math.max(0, posteriorProbability)),
    probabilityChange: posteriorProbability - priorProbability,
    likelihoodRatio,
    interpretation: likelihoodRatio > 10
      ? 'Strong diagnostic test — large shift in probability'
      : likelihoodRatio > 5
        ? 'Moderate diagnostic value — useful but not definitive alone'
        : likelihoodRatio > 2
          ? 'Weak diagnostic value — limited impact on probability'
          : 'Poor diagnostic test — minimal impact on probability',
  };
}

export const LBO_FINDING_PARAMETERS: Record<string, { likelihood: number; falsePositive: number }> = {
  coffee_bean_sign_axr: { likelihood: 0.85, falsePositive: 0.02 },
  mesenteric_swirl_ct: { likelihood: 0.93, falsePositive: 0.01 },
  bird_beak_sign_ct: { likelihood: 0.90, falsePositive: 0.01 },
  apple_core_lesion_ct: { likelihood: 0.85, falsePositive: 0.03 },
  lactate_above_4: { likelihood: 0.75, falsePositive: 0.05 },
  lactate_above_2: { likelihood: 0.85, falsePositive: 0.15 },
  previous_volvulus_episode: { likelihood: 0.70, falsePositive: 0.10 },
  massive_distension_exam: { likelihood: 0.80, falsePositive: 0.15 },
  empty_rectum_dre: { likelihood: 0.70, falsePositive: 0.25 },
  peritonism_exam: { likelihood: 0.60, falsePositive: 0.05 },
  pneumatosis_ct: { likelihood: 0.90, falsePositive: 0.01 },
  free_air_axr: { likelihood: 0.95, falsePositive: 0.005 },
  high_pitched_bs: { likelihood: 0.65, falsePositive: 0.20 },
  absolute_constipation: { likelihood: 0.75, falsePositive: 0.15 },
  weight_loss_cancer: { likelihood: 0.55, falsePositive: 0.10 },
  rectal_bleeding_cancer: { likelihood: 0.60, falsePositive: 0.08 },
};

export function updateProbability(
  priorProbability: number,
  findings: string[],
  findingParams: Record<string, { likelihood: number; falsePositive: number }>,
): { finalProbability: number; updates: BayesianResult[] } {
  let currentProb = priorProbability;
  const updates: BayesianResult[] = [];

  for (const finding of findings) {
    const params = findingParams[finding];
    if (!params) continue;

    const result = bayesianUpdate({
      priorProbability: currentProb,
      findingLikelihood: params.likelihood,
      findingFalsePositive: params.falsePositive,
    });

    updates.push(result);
    currentProb = result.posteriorProbability;
  }

  return { finalProbability: currentProb, updates };
}

export function getUpdatedDdx(findings: string[], initialProbabilities: Record<string, number>): Record<string, { probability: number; updates: BayesianResult[] }> {
  const result: Record<string, { probability: number; updates: BayesianResult[] }> = {};

  for (const [disease, prior] of Object.entries(initialProbabilities)) {
    const applicableFindings: string[] = [];

    if (disease === 'sigmoid_volvulus') {
      if (findings.includes('coffee_bean_sign_axr')) applicableFindings.push('coffee_bean_sign_axr');
      if (findings.includes('mesenteric_swirl_ct')) applicableFindings.push('mesenteric_swirl_ct');
      if (findings.includes('bird_beak_sign_ct')) applicableFindings.push('bird_beak_sign_ct');
      if (findings.includes('massive_distension_exam')) applicableFindings.push('massive_distension_exam');
      if (findings.includes('empty_rectum_dre')) applicableFindings.push('empty_rectum_dre');
      if (findings.includes('previous_volvulus_episode')) applicableFindings.push('previous_volvulus_episode');
      if (findings.includes('high_pitched_bs')) applicableFindings.push('high_pitched_bs');
      if (findings.includes('absolute_constipation')) applicableFindings.push('absolute_constipation');
    } else if (disease === 'obstructing_cancer') {
      if (findings.includes('apple_core_lesion_ct')) applicableFindings.push('apple_core_lesion_ct');
      if (findings.includes('weight_loss_cancer')) applicableFindings.push('weight_loss_cancer');
      if (findings.includes('rectal_bleeding_cancer')) applicableFindings.push('rectal_bleeding_cancer');
      if (findings.includes('empty_rectum_dre')) applicableFindings.push('empty_rectum_dre');
      if (findings.includes('absolute_constipation')) applicableFindings.push('absolute_constipation');
    } else if (disease === 'pseudo_obstruction') {
      // Pseudo-obstruction has negative findings (absence of mechanical signs)
      if (!findings.includes('mesenteric_swirl_ct') && !findings.includes('bird_beak_sign_ct') && !findings.includes('apple_core_lesion_ct')) {
        applicableFindings.push('absence_of_mechanical_signs');
      }
    }

    if (disease === 'pseudo_obstruction' && applicableFindings.length > 0) {
      const update = bayesianUpdate({ priorProbability: prior, findingLikelihood: 0.60, findingFalsePositive: 0.10 });
      result[disease] = { probability: update.posteriorProbability, updates: [update] };
    } else if (applicableFindings.length > 0) {
      const { finalProbability, updates } = updateProbability(prior, applicableFindings, LBO_FINDING_PARAMETERS);
      result[disease] = { probability: finalProbability, updates };
    } else {
      result[disease] = { probability: prior, updates: [] };
    }
  }

  return result;
}
