export type { VitalsData } from '../ddx-engine';

export interface AdmissionCriterion {
  criterion: string;
  weight: number;
  isAbsolute: boolean;
}

export interface AdmissionRecommendation {
  recommendAdmission: boolean;
  level: 'ward' | 'hdu' | 'icu';
  criteria: AdmissionCriterion[];
  reasons: string[];
}

export interface DischargeCriterion {
  criterion: string;
  met: boolean;
}

export interface DischargeReadiness {
  readyForDischarge: boolean;
  criteria: DischargeCriterion[];
  unmetCriteria: string[];
  recommendations: string[];
  followUpInterval: string;
}

export type AlertType = 'deterioration' | 'abnormal_lab' | 'medication_error' | 'fall_risk' | 'sepsis_screen';

export interface ClinicalAlert {
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  source: string;
  recommendedAction: string;
}

export { evaluateAdmission } from './admission-criteria';
export { evaluateDischarge } from './discharge-criteria';
export { checkVitalAlerts, checkLabAlerts, checkSepsisScreen, checkDeterioration } from './alerts';
export { detectComplications, checkPostOpWatch } from './complication-detection';
export type { PatientState, DetectedComplication } from './complication-detection';
