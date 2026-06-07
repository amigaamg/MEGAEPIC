export type LboWorkflowState =
  | 'registration'
  | 'history'
  | 'examination'
  | 'ddx'
  | 'investigations'
  | 'imaging'
  | 'diagnosis'
  | 'resuscitation'
  | 'management_decision'
  | 'operative_if_needed'
  | 'postop_monitoring'
  | 'discharge_planning'
  | 'discharge'
  | 'followup';

export interface WorkflowTransition {
  from: LboWorkflowState;
  to: LboWorkflowState;
  condition: string;
  requiredData: string[];
  optional: boolean;
}

export interface WorkflowStateInfo {
  state: LboWorkflowState;
  label: string;
  description: string;
  requiredActions: string[];
  completed: boolean;
  canProceed: boolean;
  blockingReasons: string[];
}

const STATE_FLOW: LboWorkflowState[] = [
  'registration',
  'history',
  'examination',
  'ddx',
  'investigations',
  'imaging',
  'diagnosis',
  'resuscitation',
  'management_decision',
  'operative_if_needed',
  'postop_monitoring',
  'discharge_planning',
  'discharge',
  'followup',
];

const STATE_LABELS: Record<LboWorkflowState, string> = {
  registration: 'Patient Registration',
  history: 'Clinical History',
  examination: 'Physical Examination',
  ddx: 'Differential Diagnosis',
  investigations: 'Laboratory Investigations',
  imaging: 'Radiological Imaging',
  diagnosis: 'Final Diagnosis',
  resuscitation: 'Resuscitation & Stabilisation',
  management_decision: 'Management Decision',
  operative_if_needed: 'Operative Intervention',
  postop_monitoring: 'Post-Operative Monitoring',
  discharge_planning: 'Discharge Planning',
  discharge: 'Discharge',
  followup: 'Follow-Up',
};

export function getCurrentStateIndex(state: LboWorkflowState): number {
  return STATE_FLOW.indexOf(state);
}

export function canTransitionTo(from: LboWorkflowState, to: LboWorkflowState): boolean {
  const fromIdx = STATE_FLOW.indexOf(from);
  const toIdx = STATE_FLOW.indexOf(to);
  return toIdx >= fromIdx && toIdx - fromIdx <= 2;
}

export function shouldSkipOperative(subtype: string, ischemiaPresent: boolean): boolean {
  if (subtype === 'pseudo_obstruction') return true;
  if (!ischemiaPresent && subtype === 'sigmoid_volvulus') return false;
  return false;
}

export function getNextRequiredState(currentState: LboWorkflowState, data: {
  subtype: string;
  ischemiaPresent: boolean;
  conservativeOnly: boolean;
}): LboWorkflowState {
  const currentIdx = STATE_FLOW.indexOf(currentState);

  if (currentState === 'diagnosis' && data.conservativeOnly) {
    return 'discharge_planning';
  }

  if (currentState === 'management_decision') {
    if (data.ischemiaPresent || data.subtype !== 'pseudo_obstruction') {
      return 'operative_if_needed';
    }
    return 'discharge_planning';
  }

  if (currentState === 'operative_if_needed') {
    return 'postop_monitoring';
  }

  if (currentIdx < STATE_FLOW.length - 1) {
    return STATE_FLOW[currentIdx + 1];
  }

  return currentState;
}

export function getWorkflowStateInfo(
  currentState: LboWorkflowState,
  completedStates: Set<LboWorkflowState>,
  missingData: string[],
): WorkflowStateInfo[] {
  return STATE_FLOW.map((state) => {
    const currentIdx = STATE_FLOW.indexOf(state);
    const activeIdx = STATE_FLOW.indexOf(currentState);
    const completed = completedStates.has(state) || currentIdx < activeIdx;
    const isCurrent = state === currentState;

    let blockingReasons: string[] = [];
    if (isCurrent && missingData.length > 0) {
      blockingReasons.push(`Missing data: ${missingData.join(', ')}`);
    }

    if (!completed && !isCurrent && currentIdx > activeIdx + 2) {
      blockingReasons.push('Previous state must be completed first');
    }

    const stateRequiredActions: Record<LboWorkflowState, string[]> = {
      registration: ['Patient identifiers', 'Age, sex', 'Mode of arrival', 'Referring facility'],
      history: ['Presenting complaint', 'HPI (SOCRATES)', 'PMH', 'Drug history', 'Social history'],
      examination: ['General exam', 'Abdominal exam', 'DRE', 'Systemic exam'],
      ddx: ['Symptom-based differentials', 'Risk factor assessment'],
      investigations: ['FBC', 'U&E', 'CRP', 'Lactate', 'ABG', 'Crossmatch'],
      imaging: ['AXR (erect + supine)', 'CT Abdomen + Pelvis with IV contrast'],
      diagnosis: ['CT interpretation', 'Lactate risk stratification', 'Subtype determination'],
      resuscitation: ['IV access x2', 'IV fluids 30 mL/kg', 'NG tube', 'Catheter', 'Antibiotics', 'Analgesia'],
      management_decision: ['Ischemia assessment', 'Subtype review', 'Surgical vs conservative decision'],
      operative_if_needed: ['Consent', 'Pre-op optimisation', 'Operation', 'Post-op ICU/ward'],
      postop_monitoring: ['Vitals q1h', 'Lactate q4-6h', 'Stoma output', 'Wound care', 'Drains'],
      discharge_planning: ['Diet tolerance', 'Pain control PO', 'Stoma care teaching', 'Follow-up arranged'],
      discharge: ['Discharge summary', 'Medications', 'Red flags counselling', 'Follow-up appointment'],
      followup: ['1 week wound check', '6 week stoma review', 'Histology review', 'Reversal planning'],
    };

    return {
      state,
      label: STATE_LABELS[state],
      description: `Required actions for ${STATE_LABELS[state].toLowerCase()}`,
      requiredActions: stateRequiredActions[state] || [],
      completed,
      canProceed: blockingReasons.length === 0,
      blockingReasons,
    };
  });
}
