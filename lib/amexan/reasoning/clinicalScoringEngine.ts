// ═══════════════════════════════════════════════════════════════════════════════
// Clinical Scoring Engine
// Computes validated clinical scores from answered features.
// Runs as part of the DDX update pipeline to populate scoreResults.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ClinicalScore, AnswerRecord, CandidateDiseaseState } from '../knowbase/diseaseNode';
import { answerToPolarity } from './bayesianEngine';

export interface ScoreComputationResult {
  name: string;
  score: number;
  maxScore: number;
  interpretation: string;
  metItems: string[];
  unmetItems: string[];
}

/**
 * Compute a single clinical score given answered features.
 * Returns null if no items of the score have been answered yet.
 */
export function computeScore(
  scoreDef: ClinicalScore,
  answers: AnswerRecord[],
): ScoreComputationResult | null {
  const answerMap = new Map(answers.map(a => [a.featureId, a]));

  let totalScore = 0;
  const metItems: string[] = [];
  const unmetItems: string[] = [];
  let anyAnswered = false;

  for (const item of scoreDef.items) {
    const ans = answerMap.get(item.featureId);
    if (!ans) {
      // Not yet answered — skip but don't penalise
      continue;
    }
    const polarity = answerToPolarity(ans.value);
    if (polarity === 'present') {
      totalScore += item.pointsWhenPresent;
      metItems.push(item.label);
      anyAnswered = true;
    } else {
      unmetItems.push(item.label);
      anyAnswered = true;
    }
  }

  if (!anyAnswered) return null;

  // Find matching threshold
  let interpretation = 'Insufficient data';
  for (const t of scoreDef.interpretationThresholds) {
    if (totalScore <= t.maxScore) {
      interpretation = t.label;
      break;
    }
  }

  return {
    name: scoreDef.name,
    score: totalScore,
    maxScore: scoreDef.maxScore,
    interpretation,
    metItems,
    unmetItems,
  };
}

/**
 * Compute all clinical scores for a candidate disease.
 * Populates scoreResults on the candidate.
 */
export function computeDiseaseScores(
  candidate: CandidateDiseaseState,
  scoreDefs: ClinicalScore[],
  answers: AnswerRecord[],
): CandidateDiseaseState {
  const updated = { ...candidate };
  const scoreResults: Record<string, { score: number; interpretation: string }> = {};

  for (const scoreDef of scoreDefs) {
    const result = computeScore(scoreDef, answers);
    if (result) {
      scoreResults[scoreDef.name] = {
        score: result.score,
        interpretation: result.interpretation,
      };
    }
  }

  updated.scoreResults = scoreResults;
  return updated;
}
