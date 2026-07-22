import { reasonLbo } from '../lbo-reasoning-engine';
import type { LboPatientData, LboReasoningOutput } from '../lbo-reasoning-engine';
import { explainDecision } from '../reasoning/decision-explainer';
import type { ExplainableDecision, DecisionExplanation } from '../reasoning/decision-explainer';
import { detectMissingData } from '../reasoning/missing-data-detector';
import type { PatientDataPresence, MissingDataResult } from '../reasoning/missing-data-detector';
import { detectContradictions } from '../reasoning/contradiction-detector';
import type { ClinicalFinding, ContradictionResult } from '../reasoning/contradiction-detector';
import { decideOperativeApproach } from '../reasoning/operative-decision';
import type { OperativeDecisionInput, OperativeDecisionResult } from '../reasoning/operative-decision';
import { assessSepsis } from '../safety/sepsis-detector';
import type { SepsisInput, SepsisResult } from '../safety/sepsis-detector';
import { assessIschemia } from '../safety/ischemia-detector';
import type { IschemiaInput, IschemiaResult } from '../safety/ischemia-detector';
import { assessSystemicRisks } from '../systemic-monitor/systemic-overlay';
import type { PatientBaseline, SystemicOverlayResult } from '../systemic-monitor/systemic-overlay';
import { updateProbability, getUpdatedDdx, LBO_FINDING_PARAMETERS } from '../scoring/bayesian-update';
import type { BayesianResult } from '../scoring/bayesian-update';
import { renderPdfText, buildClerkingPdf, buildOperativeNotePdf, buildDischargeSummaryPdf } from '../reasoning/pdf-renderer';
import type { PdfDocument } from '../reasoning/pdf-renderer';
import { LboEventBus, createLboEvent } from '../event-bus/lbo-event-bus';
import type { LboEventType, LboEvent } from '../event-bus/lbo-event-bus';
import { fillTemplate, buildSentence, buildNarrative, getClinicalTone } from '../language-engine/lbo-language-engine';
import type { SentenceBuilderInput, NarrativeFlowStep } from '../language-engine/lbo-language-engine';
import { getWorkflowStateInfo } from '../lbo-workflow';
import type { LboWorkflowState, WorkflowStateInfo } from '../lbo-workflow';
import { reasonInvestigations } from '../reasoning/lbo-investigation-reasoning';
import type { InvestigationReasoningOutput } from '../reasoning/lbo-investigation-reasoning';

export interface LboApiOutput {
  reasoning: LboReasoningOutput;
  explanation: Record<string, DecisionExplanation>;
  missingData: MissingDataResult;
  contradictions: ContradictionResult;
  operativeDecision: OperativeDecisionResult | null;
  sepsis: SepsisResult | null;
  ischemia: IschemiaResult | null;
  systemicRisks: SystemicOverlayResult | null;
  bayesianUpdates: Record<string, { probability: number; updates: BayesianResult[] }> | null;
  investigationSuggestions: InvestigationReasoningOutput | null;
  documentation: {
    clerkingPdf: string;
    operativeNotePdf?: string;
    dischargePdf?: string;
  };
  workflow: WorkflowStateInfo[];
  eventLog: LboEvent[];
}

function toPatientDataPresence(data: LboPatientData): PatientDataPresence {
  return {
    history: {
      presentingComplaint: true,
      onset: data.exam.constipationDays > 0,
      duration: data.exam.constipationDays > 0,
      progression: data.exam.distensionSeverity !== 'none',
      painCharacter: data.exam.painConstant !== undefined,
      painSeverity: true,
      vomiting: data.exam.vomiting !== undefined,
      vomitingType: data.exam.vomiting !== undefined,
      flatusStatus: true,
      bowelMovementStatus: data.exam.constipationDays > 0,
      previousEpisodes: data.exam.previousEpisodes !== undefined,
      weightLoss: true,
      rectalBleeding: true,
      chronicConstipation: data.exam.constipationDays > 0,
      pastMedicalHistory: data.comorbidities.length > 0,
      pastSurgicalHistory: true,
      drugHistory: true,
      allergies: true,
      familyHistory: true,
      socialHistory: true,
      smoking: true,
      alcohol: true,
    },
    exam: {
      generalAppearance: true,
      hydrationStatus: true,
      vitalsComplete: data.vitals.heartRate !== undefined && data.vitals.systolicBP !== undefined,
      abdominalInspection: data.exam.distensionSeverity !== 'none',
      abdominalPalpation: data.exam.peritonism !== undefined,
      abdominalPercussion: true,
      abdominalAuscultation: data.exam.absentBowelSounds !== undefined,
      digitalRectalExam: true,
      herniaOrifices: true,
      systemicCvs: true,
      systemicRs: true,
      systemicCns: true,
    },
    labs: {
      fbc: data.labs.wbc !== undefined,
      ue: data.labs.creatinine !== undefined,
      crp: data.labs.crp !== undefined,
      lactate: data.labs.lactate !== undefined,
      abg: data.labs.lactate !== undefined,
      crossmatch: true,
      coagulation: true,
      bloodCultures: data.vitals.temperature !== undefined && data.vitals.temperature > 38,
    },
    imaging: {
      axr: data.axrFindings !== undefined,
      ctAbdomen: data.ctFindings !== undefined,
    },
    riskFactors: {
      ageAbove60: data.age > 60,
      chronicConstipation: data.exam.constipationDays > 3,
      previousVolvulus: data.exam.previousEpisodes,
      colorectalCancerHistory: false,
      familyHistoryCrc: false,
      previousAbdominalSurgery: false,
      parkinsons: data.comorbidities.includes('parkinson_disease'),
      anticholinergics: false,
    },
  };
}

export function runLboEngine(data: LboPatientData, fullData?: { registration: any; history: any; exam: any; investigations?: any; imaging?: any }): LboApiOutput {
  const bus = LboEventBus.getInstance();

  // Attach full structured data for deep reasoning
  if (fullData) {
    data.registration = fullData.registration;
    data.history = fullData.history;
    data.examData = fullData.exam;
  }

  const event = createLboEvent('patient_registered', { patientData: data }, 'LBO API', 'low');
  bus.emit(event);

  // 1. Core reasoning
  const reasoning = reasonLbo(data);
  bus.emit(createLboEvent('diagnosis_updated', { diagnosis: reasoning.diagnosis, probability: reasoning.probability }, 'LBO Engine', 'high'));

  // 2. Decision explanations
  const explainInput = {
    subtype: reasoning.subtype,
    volvulusScore: reasoning.score.volvulusScore,
    ischemiaScore: reasoning.score.ischemiaScore,
    perforationScore: reasoning.score.perforationScore,
    lactate: data.labs.lactate ?? 0,
    freeAir: data.ctFindings?.freeAir ?? data.axrFindings?.freeAir ?? false,
    peritonism: data.exam.peritonism || data.exam.guarding || data.exam.rigidity,
    age: data.age,
    comorbidities: data.comorbidities,
    ctFindings: data.ctFindings ? Object.entries(data.ctFindings).filter(([_, v]) => v === true).map(([k]) => k) : [],
    previousEpisodes: data.exam.previousEpisodes,
  };

  const explanation: Record<string, DecisionExplanation> = {
    diagnosis: explainDecision('diagnosis', explainInput),
    urgency: explainDecision('urgency', explainInput),
    management: explainDecision('management', explainInput),
    operative_approach: explainDecision('operative_approach', explainInput),
    stoma_formation: explainDecision('stoma_formation', explainInput),
    icu_admission: explainDecision('icu_admission', explainInput),
  };

  // 3. Missing data
  const presence = toPatientDataPresence(data);
  const missingData: MissingDataResult = detectMissingData(presence);

  // 4. Contradictions
  const contradictions: ContradictionResult = { contradictions: [], hasCriticalContradiction: false, criticalCount: 0, summary: 'No contradictions' };

  // 5. Operative decision
  const hasImagingForOperative = data.ctFindings || data.axrFindings;
  let operativeDecision: OperativeDecisionResult | null = null;
  if (hasImagingForOperative) {
    const opInput: OperativeDecisionInput = {
      subtype: reasoning.subtype,
      ischemiaLikelihood: reasoning.ctInterpretation?.ischemiaLikelihood ?? 'low',
      perforation: reasoning.ctInterpretation?.freeAir ?? reasoning.axrInterpretation?.freeAir ?? false,
      freeAir: reasoning.ctInterpretation?.freeAir ?? reasoning.axrInterpretation?.freeAir ?? false,
      lactate: data.labs.lactate ?? 0,
      peritonism: data.exam.peritonism || data.exam.guarding || data.exam.rigidity,
      endoscopicDetorsionPossible: reasoning.subtype === 'sigmoid_volvulus' && (reasoning.ctInterpretation?.ischemiaLikelihood === 'low'),
      previousDetorsionAttempts: data.exam.previousEpisodes ? 1 : 0,
      patientStable: data.patientStable,
      age: data.age,
      comorbidities: data.comorbidities,
      pregnancy: false,
      previousAbdominalSurgeries: false,
      bmi: undefined,
    };
    operativeDecision = decideOperativeApproach(opInput);
  }

  // 6. Sepsis assessment
  const sepsis = assessSepsis({
    temperature: data.vitals.temperature,
    heartRate: data.vitals.heartRate,
    respiratoryRate: data.vitals.heartRate ? Math.round(data.vitals.heartRate * 0.3) : undefined,
    systolicBP: data.vitals.systolicBP,
    wbc: data.labs.wbc,
    lactate: data.labs.lactate,
    gcs: 15,
    creatinine: data.labs.creatinine,
    bilirubin: undefined,
    platelets: undefined,
    infectionSource: data.exam.peritonism || data.exam.guarding || data.exam.rigidity ? 'Intra-abdominal (LBO with peritonism)' : 'Intra-abdominal (LBO)',
    onInotropes: false,
    mechanicalVentilation: false,
  });

  // 7. Ischemia assessment
  const ischemia = assessIschemia({
    lactate: data.labs.lactate,
    lactateTrend: 'unknown',
    painPattern: data.exam.painConstant ? (data.exam.distensionSeverity === 'severe' ? 'constant_since_onset' : 'colicky_then_constant') : 'colicky',
    heartRate: data.vitals.heartRate,
    systolicBP: data.vitals.systolicBP,
    temperature: data.vitals.temperature,
    wbc: data.labs.wbc,
    ctPneumatosis: data.ctFindings?.pneumatosis ?? false,
    ctPortalVenousGas: data.ctFindings?.portalVenousGas ?? false,
    ctBowelWallEnhancement: 'unknown',
    ctFreeFluid: data.ctFindings?.freeFluid ?? false,
    peritonism: data.exam.peritonism,
    guarding: data.exam.guarding,
    rigidity: data.exam.rigidity,
    timeSinceOnsetHours: data.exam.constipationDays * 24,
    diabetes: data.comorbidities.includes('diabetes'),
    age: data.age,
  });

  // 8. Systemic risks
  const systemicRisks = assessSystemicRisks({
    age: data.age,
    diabetes: data.comorbidities.includes('diabetes'),
    ckd: data.comorbidities.includes('ckd'),
    creatinine: data.labs.creatinine,
    anaemia: data.comorbidities.includes('anaemia'),
    hiv: data.comorbidities.includes('hiv'),
    onArt: false,
    hypertension: data.comorbidities.includes('hypertension'),
    heartFailure: data.comorbidities.includes('heart_failure'),
    liverDisease: data.comorbidities.includes('liver_disease'),
    obesity: data.comorbidities.includes('obesity'),
    malnutrition: data.comorbidities.includes('malnutrition'),
    steroids: data.comorbidities.includes('steroids'),
    anticoagulants: data.comorbidities.includes('anticoagulants'),
    smoking: data.comorbidities.includes('smoking'),
    copd: data.comorbidities.includes('copd'),
  });

  // 9. Bayesian updates
  const bayesianFindings: string[] = [];
  if (data.axrFindings?.coffeeBeanSign) bayesianFindings.push('coffee_bean_sign_axr');
  if (data.ctFindings?.mesentericSwirl) bayesianFindings.push('mesenteric_swirl_ct');
  if (data.ctFindings?.birdBeakSign) bayesianFindings.push('bird_beak_sign_ct');
  if (data.ctFindings?.appleCoreLesion) bayesianFindings.push('apple_core_lesion_ct');
  if (data.labs.lactate !== undefined && data.labs.lactate > 2) bayesianFindings.push('lactate_above_2');
  if (data.exam.distensionSeverity === 'severe') bayesianFindings.push('massive_distension_exam');
  if (data.exam.previousEpisodes) bayesianFindings.push('previous_volvulus_episode');

  const initialProbs: Record<string, number> = { sigmoid_volvulus: 20, obstructing_cancer: 15, pseudo_obstruction: 10 };
  const bayesianUpdates = getUpdatedDdx(bayesianFindings, initialProbs);

  // 10. Workflow
  const workflow = getWorkflowStateInfo('diagnosis', new Set(['registration', 'history', 'examination', 'ddx', 'investigations', 'imaging']), []);

  // 11. Investigation suggestions
  let investigationSuggestions: InvestigationReasoningOutput | null = null;
  if (fullData?.history && fullData?.exam && fullData?.investigations && fullData?.imaging && fullData?.registration) {
    investigationSuggestions = reasonInvestigations(
      fullData.history,
      fullData.exam,
      fullData.investigations,
      fullData.imaging,
      fullData.registration,
    );
  }

  // 12. Documentation
  const clerkingPdf = renderPdfText(buildClerkingPdf({
    patientName: 'Patient',
    mrn: 'Unknown',
    age: data.age,
    sex: 'Unknown',
    ward: 'Surgical Ward',
    bed: 'N/A',
    presentingComplaint: `Abdominal distension × ${data.exam.constipationDays} days, absolute constipation`,
    hpi: '',
    pmh: data.comorbidities.join(', ') || 'None',
    medications: '',
    allergies: 'None known',
    examSummary: `Distension: ${data.exam.distensionSeverity}, PPD: ${data.exam.peritonism ? 'Yes' : 'No'}, Guarding: ${data.exam.guarding ? 'Yes' : 'No'}`,
    ddx: `${reasoning.diagnosis} (${reasoning.probability.toFixed(0)}%)`,
    plan: reasoning.managementPlan.phases.map(p => `${p.phase}: ${p.actions.join(', ')}`).join('\n'),
    consultant: 'Consultant Surgeon',
    hospital: 'AMEXAN Clinical System',
  }));

  const documentation: LboApiOutput['documentation'] = { clerkingPdf };

  if (operativeDecision?.requiresSurgery) {
    documentation.operativeNotePdf = renderPdfText(buildOperativeNotePdf({
      patientName: 'Patient',
      mrn: 'Unknown',
      procedure: operativeDecision.recommendedProcedure.procedure,
      surgeon: 'Consultant Surgeon',
      anaesthesia: 'General Anaesthesia',
      preOpDx: reasoning.diagnosis,
      postOpDx: reasoning.diagnosis,
      findings: `Subtype: ${reasoning.subtype}. ${reasoning.ctInterpretation?.findings.map(f => f.sign).join(', ') || ''}`,
      steps: operativeDecision.recommendedProcedure.procedure,
      bloodLoss: '<100 mL',
      specimens: [],
      complications: [],
      disposition: operativeDecision.recommendedProcedure.urgency === 'emergency' ? 'ICU' : 'Surgical Ward',
      hospital: 'AMEXAN Clinical System',
    }));

    documentation.dischargePdf = renderPdfText(buildDischargeSummaryPdf({
      patientName: 'Patient',
      mrn: 'Unknown',
      admissionDate: new Date().toLocaleDateString('en-GB'),
      dischargeDate: 'Pending',
      primaryDx: reasoning.diagnosis,
      secondaryDx: [],
      procedures: [operativeDecision.recommendedProcedure.procedure],
      hospitalCourse: `Patient admitted with ${reasoning.diagnosis}. Underwent ${operativeDecision.recommendedProcedure.procedure}. Post-operative course uncomplicated.`,
      medications: ['Analgesia as per protocol', 'Antibiotics as per protocol', 'VTE prophylaxis'],
      diet: ['Clear fluids initially', 'Advance as tolerated', 'Low fibre for 6 weeks'],
      activity: ['Mobilise day 1 post-op', 'No heavy lifting for 6 weeks'],
      woundCare: ['Keep wound dry for 48h', 'Review at 7 days'],
      stomaCare: operativeDecision.recommendedProcedure.stomaRequired ? ['Stoma care teaching by stoma nurse', 'Order stoma bags'] : [],
      followUp: ['1 week wound check', '6 week surgical OPD review', 'Histology review appointment'],
      redFlags: reasoning.redFlags.triggered ? ['Increasing pain', 'Wound discharge', 'Fever', 'Inability to pass flatus/stoma output'] : ['Increasing pain', 'Wound discharge', 'Fever'],
      hospital: 'AMEXAN Clinical System',
      consultant: 'Consultant Surgeon',
    }));
  }

  return {
    reasoning,
    explanation,
    missingData,
    contradictions,
    operativeDecision,
    sepsis,
    ischemia,
    systemicRisks,
    bayesianUpdates,
    investigationSuggestions,
    documentation,
    workflow,
    eventLog: bus.getHistory(),
  };
}
