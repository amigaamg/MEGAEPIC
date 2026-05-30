export type EncounterPhase =
  | 'registration'
  | 'presenting_complaint'
  | 'hpi'
  | 'examination'
  | 'bedside_scores'
  | 'ddx'
  | 'investigations'
  | 'imaging'
  | 'treatment'
  | 'operative_note'
  | 'ward_rounds'
  | 'disposition'
  | 'complications';

export interface RegistrationData {
  encounterType: string;
  referringFacility?: string;
  consultant: string;
  ward: string;
  bed: string;
  surgicalRisk?: {
    bloodGroup: string;
    allergies: string[];
    anticoagulants: string[];
    previousSurgery: boolean;
  };
}

export interface PresentingComplaintData {
  complaint: string;
  duration: string;
  severity: number;
  priority: 'high' | 'medium' | 'low';
  selectedDiseaseHint?: string;
}

export interface HPIEntry {
  id: string;
  questionId: string;
  question: string;
  answer: string | boolean;
  timestamp: number;
  autoAdded?: boolean;
}

export interface ExamEntry {
  id: string;
  findingId: string;
  findingText: string;
  present: boolean | null;
  value?: number;
  comment?: string;
  timestamp: number;
}

export interface BedsideScoreEntry {
  id: string;
  scoreName: string;
  totalPoints: number;
  maxPoints: number;
  riskCategory: string;
  components: { name: string; points: number; factValue: any }[];
  timestamp: number;
}

export interface DDXEntry {
  id: string;
  timestamp: number;
  diseases: { diseaseId: string; diseaseName: string; probability: number; keyFactors: string[] }[];
  basedOnFactCount: number;
}

export interface InvestigationEntry {
  id: string;
  testId: string;
  testName: string;
  status: 'ordered' | 'pending' | 'resulted';
  result: any;
  interpretation: string;
  flag: 'normal' | 'abnormal' | 'critical';
  timestamp: number;
}

export interface ImagingEntry {
  id: string;
  studyId: string;
  studyName: string;
  status: 'ordered' | 'completed';
  finding: string;
  impression: string;
  ddxImpact: number;
  timestamp: number;
}

export interface TreatmentEntry {
  id: string;
  planType: 'initial' | 'definitive' | 'postop';
  items: string[];
  definitiveProcedure?: string;
  timestamp: number;
}

export interface OperativeNoteData {
  id: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  procedure: string;
  surgeon: string;
  assistant: string;
  anaesthesia: string;
  findings: string;
  procedureDetails: string;
  bloodLoss: string;
  specimens: string[];
  complications: string[];
  disposition: string;
  templateDisease?: string;
  timestamp: number;
}

export interface WardRoundEntry {
  id: string;
  date: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  author: string;
  version: number;
}

export interface ComplicationEntry {
  id: string;
  type: string;
  onsetDate: number;
  severity: string;
  management: string;
  resolved: boolean;
}

export interface DispositionData {
  decision: 'admit' | 'discharge' | 'transfer' | 'surgery' | 'icu';
  dischargePlan?: {
    medications: string[];
    instructions: string[];
    followUp: string;
    warningSigns: string[];
  };
  timestamp: number;
}

export interface EncounterState {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  departmentSlug: string;
  unitSlug: string;
  status: 'active' | 'admitted' | 'discharged' | 'post-op';
  encounterType: string;
  consultant: string;
  ward: string;
  bed: string;
  registration?: RegistrationData;
  presentingComplaint?: PresentingComplaintData;
  activePhase: EncounterPhase;
  completedPhases: EncounterPhase[];
  timeline: any[];
  createdAt: number;
  updatedAt: number;
}

export type SubcollectionName =
  | 'hpi'
  | 'examination'
  | 'bedsideScores'
  | 'ddx'
  | 'investigations'
  | 'imaging'
  | 'treatment'
  | 'operativeNote'
  | 'wardRounds'
  | 'complications'
  | 'disposition';
