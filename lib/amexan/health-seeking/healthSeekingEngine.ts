// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Health Seeking Engine — Journey tracking, narrative, gap detection
// ═══════════════════════════════════════════════════════════════════════════════

import type { HealthSeekingJourney, HealthSeekingStep } from '../encounter-brain/types';

export function createHealthSeekingJourney(patientId: string): HealthSeekingJourney {
  return {
    patientId,
    steps: [],
    totalDaysBeforePresentation: 0,
    numberOfFacilities: 0,
    hadSelfMedication: false,
    hadPreviousAdmission: false,
    hadSimilarEpisodes: false,
  };
}

export function addStep(
  journey: HealthSeekingJourney,
  step: HealthSeekingStep,
): HealthSeekingJourney {
  const updatedSteps = [...journey.steps, step];

  const facilityNames = new Set<string>();
  for (const s of updatedSteps) {
    if (s.facilityName) facilityNames.add(s.facilityName);
  }

  return {
    ...journey,
    steps: updatedSteps,
    numberOfFacilities: facilityNames.size,
    hadSelfMedication: updatedSteps.some(s => s.actionType === 'self_medication'),
    hadPreviousAdmission: updatedSteps.some(s => s.actionType === 'admission'),
  };
}

const ACTION_LABELS: Record<HealthSeekingStep['actionType'], string> = {
  stayed_home: 'stayed home',
  self_medication: 'self-medicated',
  pharmacy: 'visited a pharmacy',
  clinic: 'visited a clinic',
  health_centre: 'visited a health centre',
  hospital: 'visited a hospital',
  traditional_healer: 'visited a traditional healer',
  admission: 'was admitted',
  referral: 'attended a referral facility',
  transfer: 'was transferred',
};

export function getHealthSeekingNarrative(journey: HealthSeekingJourney): string {
  const { steps, totalDaysBeforePresentation } = journey;

  if (steps.length === 0) {
    return 'Health seeking journey not documented.';
  }

  const parts: string[] = [];

  if (totalDaysBeforePresentation > 0) {
    parts.push(`The patient first experienced symptoms ${totalDaysBeforePresentation} days ago.`);
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const actionLabel = ACTION_LABELS[step.actionType] || step.actionType;
    const locationDetail = step.facilityName
      ? `${actionLabel} at ${step.facilityName}`
      : actionLabel;

    if (i === 0) {
      let phrase = `Initially, they ${locationDetail}`;
      if (step.diagnosisGiven) {
        phrase += ` where they were diagnosed with ${step.diagnosisGiven}`;
      } else if (step.treatmentGiven) {
        phrase += ` where they received ${step.treatmentGiven}`;
      }
      parts.push(`${phrase}.`);
    } else {
      let phrase = `When this did not help, they ${locationDetail}`;
      if (step.diagnosisGiven) {
        phrase += ` where they were diagnosed with ${step.diagnosisGiven}`;
      } else if (step.treatmentGiven) {
        phrase += ` where they received ${step.treatmentGiven}`;
      }
      parts.push(`${phrase}.`);
    }
  }

  const lastStep = steps[steps.length - 1];
  if (lastStep.actionType === 'referral' || lastStep.actionType === 'transfer') {
    const reason = lastStep.reasonForEscalation || 'further management';
    parts.push(`They were then referred to our facility for ${reason}.`);
  }

  return parts.join(' ');
}

export function getHealthSeekingGaps(journey: HealthSeekingJourney): string[] {
  const gaps: string[] = [];
  const { steps } = journey;

  if (steps.length === 0) {
    gaps.push('self_medication');
    gaps.push('pharmacy_visit');
    gaps.push('clinic_visit');
    return gaps;
  }

  const lastStep = steps[steps.length - 1];

  if (steps.length === 1 && (lastStep.response === 'unknown' || lastStep.response == null)) {
    gaps.push('response_to_initial_care');
  }

  const hadReferral = steps.some(
    s => s.actionType === 'referral' || s.actionType === 'transfer',
  );
  if (hadReferral) {
    gaps.push('referral_document');
  }

  const hadAdmission = steps.some(s => s.actionType === 'admission');
  if (hadAdmission) {
    gaps.push('admission_details');
  }

  return gaps;
}

export function getReferralContext(
  journey: HealthSeekingJourney,
): {
  wasReferred: boolean;
  referralStep?: HealthSeekingStep;
  referringFacility?: string;
  referralReason?: string;
  hasReferralDocument: boolean;
} {
  const referralStep = journey.steps.find(
    s => s.actionType === 'referral' || s.actionType === 'transfer',
  );

  if (!referralStep) {
    return { wasReferred: false, hasReferralDocument: false };
  }

  return {
    wasReferred: true,
    referralStep,
    referringFacility: referralStep.facilityName,
    referralReason: referralStep.reasonForEscalation,
    hasReferralDocument: !!referralStep.referralDocument,
  };
}

export function getDelayBeforePresentation(journey: HealthSeekingJourney): number {
  return journey.totalDaysBeforePresentation;
}

export function getSimilarEpisodeHistory(
  journey: HealthSeekingJourney,
): {
  hadSimilarEpisodes: boolean;
  details?: string;
} {
  return {
    hadSimilarEpisodes: journey.hadSimilarEpisodes,
    details: journey.similarEpisodeDetails,
  };
}
