export type ComplaintCategory =
  | 'Pain'
  | 'Respiratory'
  | 'Neurological'
  | 'GI'
  | 'GU'
  | 'Psychiatric'
  | 'General'
  | 'Dermatology'
  | 'ENT'
  | 'Eye'
  | 'Musculoskeletal'
  | 'Cardiovascular'
  | 'Endocrine'
  | 'Hematological'
  | 'Constitutional'
  | 'Trauma'
  | 'Other'
  ;

export type ComplaintStatus = 'Active' | 'Resolved' | 'Intermittent' | 'Unknown';

export type ComplaintCertainty = 'Definite' | 'Probable' | 'Possible' | 'Unknown';

export type ComplaintPriority = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';

export type ComplaintRelationship = 'Independent' | 'Progression' | 'Complication' | 'Associated' | 'Unknown';

export type ComplaintOnset = 'Sudden' | 'Gradual' | 'Intermittent' | 'Recurrent' | 'Unknown';

export type ComplaintSource = 'Patient' | 'Relative' | 'Caregiver' | 'EMS' | 'Referral' | 'Record' | 'Other';

export type ComplaintSeverity = 'Mild' | 'Moderate' | 'Severe' | 'Unknown';

export interface ComplaintTimelinePoint {
  label: string;
  relativeDay: number;
  description: string;
}

export interface ChiefComplaintObject {
  id: string;
  symptomId: string;
  name: string;
  label: string;
  duration: string;
  durationHours: number;
  onset: ComplaintOnset;
  primary: boolean;
  chronology: number;
  status: ComplaintStatus;
  certainty: ComplaintCertainty;
  relationship: ComplaintRelationship;
  source: ComplaintSource;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  severity: ComplaintSeverity;
  parentId: string | null;
  simultaneousGroup: string | null;
  schemaActivated: string | null;
  redFlagOverride: boolean;
  createdAt: number;
}

export interface ComplaintGraphNode {
  complaint: ChiefComplaintObject;
  children: ComplaintGraphNode[];
  depth: number;
}

export interface ChronologicalTimelineEntry {
  dayLabel: string;
  relativeHour: number;
  complaints: ChiefComplaintObject[];
  description: string;
}

export interface ComplaintConsistencyCheck {
  passed: boolean;
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  clarification: string | null;
}

export interface ComplaintCompletionCriteria {
  met: boolean;
  checks: {
    atLeastOneComplaint: boolean;
    exactlyOnePrimary: boolean;
    everyComplaintHasDuration: boolean;
    chronologyEstablished: boolean;
    simultaneousClarified: boolean;
    eachMappedToSchema: boolean;
    timelineGenerated: boolean;
    emergencyScreened: boolean;
  };
  missing: string[];
}

export interface ComplaintEngineOutput {
  complaints: ChiefComplaintObject[];
  primary: ChiefComplaintObject | null;
  chronologicalOrder: ChiefComplaintObject[];
  graph: ComplaintGraphNode | null;
  timeline: ChronologicalTimelineEntry[];
  consistencyChecks: ComplaintConsistencyCheck[];
  completion: ComplaintCompletionCriteria;
  activatedSchemas: string[];
  emergencyOverride: boolean;
  redFlagComplaints: ChiefComplaintObject[];
  narrative: {
    chiefComplaintText: string;
    timelineText: string;
    graphText: string;
  };
}
