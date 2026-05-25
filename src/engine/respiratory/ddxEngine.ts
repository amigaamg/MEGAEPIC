import { symptomWeights } from '@/src/data/respiratory/symptomWeights';
import { respiratoryDiseases } from '@/src/data/respiratory/diseases';
import { DiseaseId, DiseaseScore } from '@/src/types';
import { DdxExplanation, ClinicalContext } from '@/src/types/clinical';

export class DdxEngine {
  private lastAnswers: Record<string, string | string[] | boolean | number> = {};

  calculate(
    answers: Record<string, string | string[] | boolean | number>,
    symptoms: string[]
  ): DiseaseScore[] {
    this.lastAnswers = answers;
    const scores: Record<string, number> = {};

    respiratoryDiseases.forEach(d => { scores[d.id] = 0; });

    Object.entries(answers).forEach(([key, value]) => {
      if (!value || value === 'false') return;

      symptomWeights.forEach(w => {
        if (w.symptomKey === key || this.matchesAnswer(key, w.symptomKey, value)) {
          scores[w.diseaseId] = (scores[w.diseaseId] || 0) + w.weight;
        }
      });
    });

    const ageScore = this.calculateAgeScore(answers);
    Object.entries(ageScore).forEach(([id, score]) => {
      scores[id] = (scores[id] || 0) + score;
    });

    return respiratoryDiseases
      .map(disease => ({
        diseaseId: disease.id,
        name: disease.name,
        score: Math.max(0, scores[disease.id] || 0),
        confidence: this.getConfidence(scores[disease.id] || 0),
      }))
      .sort((a, b) => b.score - a.score);
  }

  private matchesAnswer(
    answerKey: string,
    symptomKey: string,
    value: string | string[] | boolean | number
  ): boolean {
    if (answerKey === symptomKey) return true;

    if (symptomKey === 'age_under_2') {
      return answerKey === 'age_months' && typeof value === 'number' && value < 24;
    }
    if (symptomKey === 'age_over_24mo') {
      return answerKey === 'age_months' && typeof value === 'number' && value >= 24;
    }
    if (symptomKey === 'age_6mo_to_3yr') {
      return answerKey === 'age_months' && typeof value === 'number' && value >= 6 && value <= 36;
    }
    if (symptomKey === 'viral_prodrome') {
      return (answerKey === 'fever_present' && this.isTruthy(value)) ||
             (answerKey === 'runny_nose' && this.isTruthy(value));
    }
    if (symptomKey === 'productive_cough') {
      return answerKey === 'cough_character' && typeof value === 'string' && value.includes('Productive');
    }
    if (symptomKey === 'barking_cough') {
      return answerKey === 'cough_character' && typeof value === 'string' && value.includes('Barking');
    }
    if (symptomKey === 'mild_cough') {
      return answerKey === 'cough_character' && typeof value === 'string' && value.includes('Dry');
    }
    if (symptomKey === 'runny_nose') {
      return answerKey === 'cough_character' || answerKey === 'nasal_discharge';
    }
    if (symptomKey === 'chronic_cough') {
      return (answerKey === 'cough_duration' && typeof value === 'string' && value.includes('More than 4'));
    }
    if (symptomKey === 'acute_onset') {
      return (answerKey === 'cough_duration' && typeof value === 'string' && value.includes('Less than'));
    }
    if (symptomKey === 'crackles') {
      return answerKey === 'auscultation_crackles' && this.isTruthy(value);
    }
    if (symptomKey === 'dull_percussion') {
      return answerKey === 'percussion_dull' && this.isTruthy(value);
    }
    if (symptomKey === 'absent_breath_sounds') {
      return answerKey === 'auscultation_breath_sounds' && typeof value === 'string' && value.includes('Absent');
    }
    if (symptomKey === 'tachypnea') {
      return answerKey === 'vitals_rr' && typeof value === 'number' && value > 40;
    }
    if (symptomKey === 'hypoxia') {
      return answerKey === 'vitals_spo2' && typeof value === 'number' && value < 92;
    }

    return false;
  }

  private calculateAgeScore(answers: Record<string, string | string[] | boolean | number>): Record<string, number> {
    const age = answers['age_months'];
    if (typeof age !== 'number') return {};
    const result: Record<string, number> = {};
    if (age < 24) {
      result['bronchiolitis'] = 6;
      result['asthma'] = -2;
    } else {
      result['bronchiolitis'] = -4;
    }
    if (age >= 60) {
      result['tb'] = 2;
      result['pneumonia'] = 1;
    }
    return result;
  }

  private getConfidence(score: number): 'low' | 'medium' | 'high' {
    if (score >= 15) return 'high';
    if (score >= 8) return 'medium';
    return 'low';
  }

  generateExplanations(diseaseScores: DiseaseScore[]): DdxExplanation[] {
    const topDx = diseaseScores.filter(d => d.score > 0).slice(0, 5);

    return topDx.map(dx => {
      const disease = respiratoryDiseases.find(d => d.id === dx.diseaseId);
      if (!disease) return null;

      const supportingPoints: string[] = [];
      const againstPoints: string[] = [];
      const keyFindings: string[] = [];

      symptomWeights
        .filter(w => w.diseaseId === dx.diseaseId)
        .forEach(w => {
          const answered = this.lastAnswers[w.symptomKey];
          const present = this.isTruthy(answered) || this.matchesAnswer(
            Object.keys(this.lastAnswers).find(k => this.matchesAnswer(k, w.symptomKey, this.lastAnswers[k])) || '',
            w.symptomKey,
            answered
          );

          if (w.weight > 0) {
            supportingPoints.push(this.formatEvidence(w.symptomKey, w.weight));
            if (present) keyFindings.push(this.formatEvidence(w.symptomKey, w.weight));
          } else if (w.weight < 0) {
            againstPoints.push(this.formatEvidence(w.symptomKey, w.weight));
          }
        });

      const action = dx.confidence === 'high'
        ? `Initiate ${dx.name} management. Confirm with appropriate investigations.`
        : dx.confidence === 'medium'
          ? `Consider ${dx.name}. Look for additional supporting or refuting features.`
          : `Low probability for ${dx.name}. Consider if typical features emerge.`;

      return {
        diseaseId: dx.diseaseId,
        diseaseName: dx.name,
        score: dx.score,
        confidence: dx.confidence,
        supportingPoints: supportingPoints.slice(0, 4),
        againstPoints: againstPoints.slice(0, 3),
        keyFindings: keyFindings.slice(0, 3),
        recommendedAction: action,
      };
    }).filter(Boolean) as DdxExplanation[];
  }

  private formatEvidence(key: string, weight: number): string {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const direction = weight > 0 ? 'supports' : 'argues against';
    return `${label} (${direction}, weight: ${Math.abs(weight)})`;
  }

  private isTruthy(val: unknown): boolean {
    if (val === true || val === 'true' || val === 'present') return true;
    if (Array.isArray(val) && val.length > 0) return true;
    return false;
  }
}
