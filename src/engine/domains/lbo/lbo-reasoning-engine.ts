import { calculateLboScore, checkLboRedFlags, generateLboManagement, interpretAxr, interpretCt } from '../../clinical-rules/lbo';
import type { LboScoringInput } from '../../clinical-rules/lbo/lbo-scoring';
import type { VitalsInput, LabInput, ExamInput } from '../../clinical-rules/lbo/lbo-red-flags';
import type { LboManagementInput } from '../../clinical-rules/lbo/lbo-management';
import type { LboSubtype } from '../../clinical-rules/lbo/lbo-management';
import { reasonHistory } from './reasoning/lbo-history-reasoning';
import type { HistoryReasoningOutput } from './reasoning/lbo-history-reasoning';
import { reasonExam } from './reasoning/lbo-exam-reasoning';
import type { ExamReasoningOutput } from './reasoning/lbo-exam-reasoning';
import type { RegistrationData, HistoryData, ExamData } from './lbo-records';

export interface LboPatientData {
  vitals: VitalsInput;
  labs: LabInput;
  exam: ExamInput & {
    distensionSeverity: 'none' | 'mild' | 'moderate' | 'severe';
    constipationDays: number;
    painConstant: boolean;
    vomiting: boolean;
    previousEpisodes: boolean;
  };
  age: number;
  axrFindings?: {
    coffeeBeanSign: boolean;
    bentInnerTubeSign: boolean;
    freeAir: boolean;
    colonicDilationCm: number;
    airFluidLevels: boolean;
    haustraPattern: 'haustra' | 'valvulae' | 'absent';
  };
  ctFindings?: {
    transitionPoint: boolean;
    transitionLevel: 'sigmoid' | 'rectosigmoid' | 'descending' | 'splenic_flexure' | 'transverse' | 'hepatic_flexure' | 'ascending' | 'caecum' | 'none';
    mesentericSwirl: boolean;
    birdBeakSign: boolean;
    appleCoreLesion: boolean;
    colonicWallThickening: boolean;
    pneumatosis: boolean;
    portalVenousGas: boolean;
    freeFluid: boolean;
    freeAir: boolean;
    targetLesion: boolean;
    cecalDilationCm: number;
  };
  comorbidities: string[];
  patientStable: boolean;
  /** Full structured data for deep reasoning */
  registration?: RegistrationData;
  history?: HistoryData;
  examData?: ExamData;
}

export type DdxEntry = HistoryReasoningOutput['ddxClues'][0] & {
  examInFavor: { finding: string; reasoning: string }[];
  examAgainst: { finding: string; reasoning: string }[];
};

export interface LboReasoningOutput {
  diagnosis: string;
  subtype: LboSubtype;
  probability: number;
  redFlags: ReturnType<typeof checkLboRedFlags>;
  score: ReturnType<typeof calculateLboScore>;
  axrInterpretation?: ReturnType<typeof interpretAxr>;
  ctInterpretation?: ReturnType<typeof interpretCt>;
  managementPlan: ReturnType<typeof generateLboManagement>;
  confidence: 'low' | 'medium' | 'high';
  /** Enhanced clinical reasoning */
  historyReasoning?: HistoryReasoningOutput;
  examReasoning?: ExamReasoningOutput;
  /** Combined DDX with reasons for/against from both history and exam */
  detailedDdx?: DdxEntry[];
}

export function reasonLbo(data: LboPatientData): LboReasoningOutput {
  // 1. Calculate clinical score
  const scoringInput: LboScoringInput = {
    distensionSeverity: data.exam.distensionSeverity,
    constipationDays: data.exam.constipationDays,
    painConstant: data.exam.painConstant,
    vomiting: data.exam.vomiting,
    fever: data.vitals.temperature !== undefined && data.vitals.temperature > 38,
    tachycardia: data.vitals.heartRate !== undefined && data.vitals.heartRate > 100,
    hypotension: data.vitals.systolicBP !== undefined && data.vitals.systolicBP < 90,
    peritonism: data.exam.peritonism || data.exam.guarding || data.exam.rigidity,
    lactate: data.labs.lactate,
    wbc: data.labs.wbc,
    previousEpisodes: data.exam.previousEpisodes,
    age: data.age,
  };
  const score = calculateLboScore(scoringInput);

  // 2. Check red flags
  const redFlags = checkLboRedFlags(data.vitals, data.labs, data.exam);

  // 3. Interpret imaging
  const axrInterpretation = data.axrFindings ? interpretAxr(data.axrFindings) : undefined;
  const ctInterpretation = data.ctFindings ? interpretCt(data.ctFindings) : undefined;

  // 4. Determine subtype
  let subtype: LboSubtype = 'other';
  if (ctInterpretation) {
    if (ctInterpretation.subtype === 'sigmoid_volvulus') subtype = 'sigmoid_volvulus';
    else if (ctInterpretation.subtype === 'obstructing_cancer') subtype = 'obstructing_cancer';
    else if (ctInterpretation.subtype === 'pseudo_obstruction') subtype = 'pseudo_obstruction';
  } else if (axrInterpretation && axrInterpretation.coffeeBeanSign) {
    subtype = 'sigmoid_volvulus';
  }

  // 5. Generate management plan
  const mgmtInput: LboManagementInput = {
    subtype,
    ischemiaPresent: (ctInterpretation?.ischemiaLikelihood === 'high') || score.ischemiaScore >= 50,
    perforationPresent: ctInterpretation?.freeAir || axrInterpretation?.freeAir || score.perforationScore >= 50,
    lactate: data.labs.lactate ?? 0,
    previousAttemps: data.exam.previousEpisodes ? 1 : 0,
    patientStable: data.patientStable,
    age: data.age,
    comorbidities: data.comorbidities,
  };
  const managementPlan = generateLboManagement(mgmtInput);

  // 6. Determine probability and confidence
  const probability = Math.min(100, Math.max(0,
    (score.volvulusScore * 0.3) +
    (score.ischemiaScore * 0.2) +
    (axrInterpretation && axrInterpretation.coffeeBeanSign ? 25 : 0) +
    (ctInterpretation && ctInterpretation.mesentericSwirl ? 25 : 0)
  ));

  const confidence: LboReasoningOutput['confidence'] =
    ctInterpretation && (ctInterpretation.mesentericSwirl || ctInterpretation.birdBeakSign) ? 'high'
    : axrInterpretation && axrInterpretation.coffeeBeanSign ? 'high'
    : score.volvulusScore >= 50 ? 'medium'
    : 'low';

  // 7. Build diagnosis string
  const diagnosis = subtype === 'sigmoid_volvulus'
    ? 'Sigmoid Volvulus'
    : subtype === 'obstructing_cancer'
      ? 'Obstructing Colorectal Carcinoma'
      : subtype === 'pseudo_obstruction'
        ? 'Pseudo-obstruction (Ogilvie\'s Syndrome)'
        : 'Large Bowel Obstruction — subtype undetermined';

  // 8. Enhanced clinical reasoning (if full structured data provided)
  let historyReasoning: HistoryReasoningOutput | undefined;
  let examReasoning: ExamReasoningOutput | undefined;
  let detailedDdx: DdxEntry[] | undefined;

  if (data.registration && data.history) {
    historyReasoning = reasonHistory(data.history, data.registration);
  }

  if (data.registration && data.history && data.examData) {
    examReasoning = reasonExam(data.examData, data.history, data.registration, historyReasoning);
  }

  // 9. Combine DDX from history + exam
  if (historyReasoning) {
    detailedDdx = historyReasoning.ddxClues.map((clue) => {
      const examClue = examReasoning?.ddxRefinement.find(e => e.diagnosis === clue.diagnosis);
      return {
        ...clue,
        examInFavor: examClue?.inFavor ?? [],
        examAgainst: examClue?.against ?? [],
      };
    });
  }

  return {
    diagnosis,
    subtype,
    probability,
    redFlags,
    score,
    axrInterpretation,
    ctInterpretation,
    managementPlan,
    confidence,
    historyReasoning,
    examReasoning,
    detailedDdx,
  };
}
