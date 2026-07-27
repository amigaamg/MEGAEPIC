// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK IV
// CLINICAL CONTEXT BUILDER
// Merges biodata + encounter + presentation objects → ClinicalContext
// ═══════════════════════════════════════════════════════════════

import type {
  ClinicalContext, DemographicContext, EncounterContextState,
  EncounterCascadeFlags, WorkflowContextState, VisibilityRules,
  PermissionContext, DocumentationPlan, DSSContext,
  AgeGroup, ModuleType, Answer,
} from './registration-engine/types';
import type { ClinicalPresentationObject, PresentationType, ClinicalSyndrome } from './clinical-presentation-constitution';
import { CLINICAL_PRESENTATIONS } from './clinical-presentation-constitution';
import { resolveAgeGroup, computeChronologicalAgeMonths, computeCorrectedAgeMonths, computeDayOfLife } from './registration-engine/context-resolver';

export interface PresentationInput {
  id: string;
  originalWording: string;
  chronology: number;
  duration?: string;
  severity?: number;
}

export interface PresentationCaptureData {
  presentation: ClinicalPresentationObject;
  originalWording: string;
  chronology: number;
  duration?: string;
  severity?: number;
  relationshipToPrimary?: 'primary' | 'secondary' | 'associated' | 'consequence' | 'complication' | 'independent';
}

export interface PresentationContext {
  presentations: PresentationCaptureData[];
  primaryPresentation: PresentationCaptureData | null;
  syndrome: ClinicalSyndrome | null;
  syndromePresentations: string[];
  activationSummary: {
    showSections: Set<string>;
    hideSections: Set<string>;
    showTabs: Set<string>;
    hideTabs: Set<string>;
    showCards: Set<string>;
    hideCards: Set<string>;
    requiredQuestions: Set<string>;
    optionalQuestions: Set<string>;
    mechanisms: Set<string>;
    scoringSystems: Set<string>;
    workfowPathways: Set<string>;
  };
}

function mergeVisibility(acc: PresentationContext['activationSummary'], p: ClinicalPresentationObject): void {
  p.visibility.showSections.forEach(s => acc.showSections.add(s));
  p.visibility.hideSections.forEach(s => acc.hideSections.add(s));
  p.visibility.showTabs.forEach(s => acc.showTabs.add(s));
  p.visibility.hideTabs.forEach(s => acc.hideTabs.add(s));
  p.visibility.showCards.forEach(s => acc.showCards.add(s));
  p.visibility.hideCards.forEach(s => acc.hideCards.add(s));
  p.history.requiredQuestions.forEach(q => acc.requiredQuestions.add(q));
  p.history.optionalQuestions.forEach(q => acc.optionalQuestions.add(q));
  p.mechanisms.forEach(m => acc.mechanisms.add(m));
  p.examination.scoringSystems.forEach(s => acc.scoringSystems.add(s));
  p.workflow.pathways.forEach(w => acc.workfowPathways.add(w));
}

export function buildPresentationContext(input: PresentationContextBuilderInput): PresentationContext {
  const sorted = [...input.presentations].sort((a, b) => a.chronology - b.chronology);

  const captured: PresentationCaptureData[] = sorted.map((pi, _idx) => {
    const pres = CLINICAL_PRESENTATIONS[pi.id] || CLINICAL_PRESENTATIONS[resolveUnknownPresentation(pi.id)];
    return {
      presentation: pres || createUnknownPresentation(pi.id, pi.originalWording),
      originalWording: pi.originalWording,
      chronology: pi.chronology,
      duration: pi.duration,
      severity: pi.severity,
      relationshipToPrimary: _idx === 0 ? 'primary' : 'secondary',
    };
  });

  const primary = captured.length > 0 ? captured[0] : null;

  const activationSummary = {
    showSections: new Set<string>(),
    hideSections: new Set<string>(),
    showTabs: new Set<string>(),
    hideTabs: new Set<string>(),
    showCards: new Set<string>(),
    hideCards: new Set<string>(),
    requiredQuestions: new Set<string>(),
    optionalQuestions: new Set<string>(),
    mechanisms: new Set<string>(),
    scoringSystems: new Set<string>(),
    workfowPathways: new Set<string>(),
  };

  for (const c of captured) {
    mergeVisibility(activationSummary, c.presentation);
  }

  const syndrome = detectSyndrome(captured);
  const syndromePresentations = syndrome ? captured.filter(c => c.presentation.syndromes.includes(syndrome)).map(c => c.presentation.id) : [];

  return {
    presentations: captured,
    primaryPresentation: primary,
    syndrome,
    syndromePresentations,
    activationSummary,
  };
}

export interface BuildContextInput {
  biodata: {
    age?: number;
    ageUnit?: string;
    dateOfBirth?: string;
    sex?: string;
  };
  encounter: {
    encounterType?: string;
    department?: string;
    modeOfArrival?: string;
    triageCategory?: string;
    referralSource?: string;
    service?: string;
    unit?: string;
  };
  presentations: PresentationInput[];
  knownConditions?: string[];
  rawAnswers?: Record<string, Answer>;
}

export interface BuiltContext {
  demographic: DemographicContext;
  encounter: EncounterContextState;
  presentation: PresentationContext;
  workflow: WorkflowContextState;
  visibility: VisibilityRules;
  permissions: PermissionContext;
  documentation: DocumentationPlan;
  decisionSupport: DSSContext;
}

export function buildClinicalContextFromPresentations(input: BuildContextInput): BuiltContext {
  const ageMonths = computeChronologicalAgeMonths(input.biodata.age || 0, input.biodata.ageUnit || 'years');
  const sex = input.biodata.sex || 'unknown';
  const ageGroup = resolveAgeGroup(ageMonths);
  const correctedAgeMonths = computeCorrectedAgeMonths(ageMonths, 40);
  const dayOfLife = computeDayOfLife(input.biodata.dateOfBirth || '');

  const demographic: DemographicContext = {
    age: { value: input.biodata.age ?? null, state: 'captured', source: 'system', confidence: 1, timestamp: Date.now(), author: 'system' },
    ageUnit: { value: (input.biodata.ageUnit as any) || 'years', state: 'captured', source: 'system', confidence: 1, timestamp: Date.now(), author: 'system' },
    ageGroup,
    developmentalStage: 'unknown' as any,
    clinicalCohort: 'unknown' as any,
    reproductiveStage: 'unknown' as any,
    geriatricSubtype: 'not_geriatric' as any,
    sex: { value: sex as any, state: 'captured', source: 'system', confidence: 1, timestamp: Date.now(), author: 'system' },
    dateOfBirth: { value: input.biodata.dateOfBirth || null, state: 'captured', source: 'system', confidence: 1, timestamp: Date.now(), author: 'system' },
    chronologicalAgeMonths: ageMonths,
    correctedAgeMonths,
    dayOfLife,
    neonatal: null as any,
    pediatricGrowth: null as any,
  };

  const cascadeFlags: EncounterCascadeFlags = {
    showPrehospitalCare: input.encounter.modeOfArrival === 'ambulance' || input.encounter.modeOfArrival === 'stretcher',
    showMedicoLegal: input.encounter.modeOfArrival === 'police',
    showTransferNotes: input.encounter.referralSource === 'hospital_transfer' || input.encounter.encounterType === 'transfer',
    showAbcdeResuscitation: input.encounter.encounterType === 'emergency' && input.encounter.triageCategory === 'red',
    skipFullHistory: (input.encounter.encounterType === 'emergency' && input.encounter.triageCategory === 'red')
                     || input.encounter.encounterType === 'ward_round',
    showReferralDetails: input.encounter.encounterType === 'referral' || input.encounter.encounterType === 'transfer'
                         || input.encounter.referralSource === 'hospital_transfer',
  };

  const encounter: EncounterContextState = {
    encounterType: (input.encounter.encounterType || 'outpatient') as any,
    department: (input.encounter.department || 'general') as any,
    specialty: input.encounter.department || 'general',
    service: input.encounter.service || '',
    unit: input.encounter.unit || '',
    ward: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
    bed: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
    team: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
    consultant: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
    triageCategory: (input.encounter.triageCategory || 'none') as any,
    modeOfArrival: (input.encounter.modeOfArrival || 'walking') as any,
    referralSource: input.encounter.referralSource || 'self',
    cascadeFlags,
    isEmergency: input.encounter.encounterType === 'emergency',
    isInpatient: ['inpatient', 'icu', 'theatre', 'admission'].includes(input.encounter.encounterType || ''),
    isWardRound: input.encounter.encounterType === 'ward_round',
    isFollowUp: input.encounter.encounterType === 'follow_up',
    isTransfer: input.encounter.encounterType === 'transfer',
    isReferral: input.encounter.encounterType === 'referral',
    isNewConsultation: input.encounter.encounterType === 'new_consultation',
    isReview: input.encounter.encounterType === 'review',
    isProcedure: input.encounter.encounterType === 'procedure',
    isOperation: input.encounter.encounterType === 'operation',
    isDischarge: input.encounter.encounterType === 'discharge',
    isTelemedicine: input.encounter.encounterType === 'telemedicine',
    isCommunityVisit: ['community_visit', 'home_visit'].includes(input.encounter.encounterType || ''),
  };

  const presentation = buildPresentationContext({ presentations: input.presentations });

  const activeModules: ModuleType[] = resolveModules(ageGroup, sex, input.encounter.department || '', input.encounter.encounterType || '', input.knownConditions || [], presentation);

  const omittedSections: string[] = [];
  if (cascadeFlags.skipFullHistory) omittedSections.push('biodata', 'full_history', 'full_examination');
  if (input.encounter.encounterType === 'ward_round') omittedSections.push('biodata', 'full_history');
  if (input.encounter.encounterType === 'discharge') omittedSections.push('hpi', 'examination');

  const workflow: WorkflowContextState = {
    workflowType: 'full_clerking' as any,
    availableHpiTemplates: ['general_hpi', ...(presentation.primaryPresentation ? [`${presentation.primaryPresentation.presentation.id}_hpi`] : [])],
    availableExaminationModules: ['general_examination', 'vital_signs', ...presentation.activationSummary.showSections],
    activeDocumentationFlows: ['hpi', 'examination', 'summary'],
    requiredScoringSystems: [...presentation.activationSummary.scoringSystems],
    suggestedQuestionGroups: [...presentation.activationSummary.requiredQuestions, ...presentation.activationSummary.optionalQuestions],
  };

  const visibility: VisibilityRules = {
    visibleSections: new Set(['identity', 'encounter', 'demographics', 'residence', 'contact', ...presentation.activationSummary.showSections]),
    requiredFields: {},
    hiddenFields: new Set(presentation.activationSummary.hideSections),
    disabledFields: new Set(),
    visibleModules: new Set(activeModules),
  };

  const permissions: PermissionContext = {
    canEdit: true, canSign: true, canDelete: false, canOverride: false, canViewSensitive: false,
    restrictedFields: [],
  };

  const documentation: DocumentationPlan = {
    prefilledSections: [],
    omittedSections,
    autoGenerateSections: ['clinical_summary', 'hpi_narrative'],
    requiresClinicianInput: ['assessment', 'plan'],
    signatureRequired: !cascadeFlags.skipFullHistory,
  };

  const decisionSupport: DSSContext = {
    activeRules: activeModules.map(m => `${m}_rules`),
    activeCalculators: [...presentation.activationSummary.scoringSystems],
    activeAlerts: cascadeFlags.showMedicoLegal ? ['medico_legal_case'] : [],
    suggestedDifferentialCategories: [...presentation.activationSummary.mechanisms],
  };

  return {
    demographic,
    encounter,
    presentation,
    workflow,
    visibility,
    permissions,
    documentation,
    decisionSupport,
  };
}

export interface PresentationContextBuilderInput {
  presentations: PresentationInput[];
}

function resolveUnknownPresentation(_id: string): string {
  return 'fever';
}

function createUnknownPresentation(id: string, wording: string): ClinicalPresentationObject {
  return {
    id, displayName: wording, synonyms: [id], patientLanguage: [wording],
    presentationType: 'symptom', bodySystems: ['general'],
    ageRules: {}, genderRules: [], pregnancyRules: [], activationRules: [],
    mechanisms: [], phenotypes: [], syndromes: [], redFlags: [],
    timeCategories: [], emergencyLevel: 'green',
    visibility: { showSections: [], hideSections: [], showTabs: [], hideTabs: [], showCards: [], hideCards: [], showButtons: [], hideButtons: [] },
    history: { requiredQuestions: [], optionalQuestions: [], conditionalQuestions: [], negativeQuestions: [], sequence: [], stoppingRules: [] },
    ros: { primarySystems: ['general'], secondarySystems: [], optionalSystems: [], hiddenSystems: [], crossSystemLinks: [] },
    examination: { generalExam: ['vital_signs'], focusedExam: [], mandatoryExam: ['vital_signs'], optionalExam: [], hiddenExam: [], specialTests: [], scoringSystems: [] },
    reasoning: { excludeDiagnoses: [], mechanisms: [], syndromes: [], reasoningStage: 'history_only', minimumDataFields: [] },
    investigationReadiness: { potentialTests: [], conditions: [], urgency: [], dependencies: [] },
    managementReadiness: { domains: ['supportive'], emergencyActions: [], monitoringRequired: [], referralCriteria: [] },
    monitoring: { vitalsFrequency: 'routine', requiredScores: [], observationCharts: [], alerts: [], escalationThresholds: [] },
    workflow: { isolationRequired: false, pathways: [], teamActivation: [], admissionCriteria: [], dischargeCriteria: [] },
    documentation: { narrativeTemplate: 'general_hpi', summaryTemplate: 'general_summary', problemRepresentation: '', timelineRequired: false, soapFormat: 'subjective_objective' },
    ai: { confidenceThreshold: 0.5, missingDataThreshold: 0.5, reasoningThreshold: 0.5, unsafeThreshold: 0.9, escalationThreshold: 0.8, humanConfirmationRequired: [], neverInfer: [], canAutoComplete: [], cannotAutoComplete: [] },
  };
}

function detectSyndrome(captured: PresentationCaptureData[]): ClinicalSyndrome | null {
  const syndromeCounts = new Map<ClinicalSyndrome, number>();
  for (const c of captured) {
    for (const s of c.presentation.syndromes) {
      syndromeCounts.set(s, (syndromeCounts.get(s) || 0) + 1);
    }
  }
  let best: ClinicalSyndrome | null = null;
  let bestCount = 0;
  for (const [syndrome, count] of syndromeCounts) {
    if (count > bestCount) { best = syndrome; bestCount = count; }
  }
  return best;
}

function resolveModules(
  ageGroup: AgeGroup, _sex: string, department: string, encounterType: string,
  knownConditions: string[], presentation: PresentationContext,
): ModuleType[] {
  const modules: Set<ModuleType> = new Set();
  if (ageGroup === 'preterm_neonate' || ageGroup === 'term_neonate') {
    modules.add('neonatal'); modules.add('pediatric');
  } else if (['infant', 'toddler', 'preschool', 'school_age'].includes(ageGroup)) {
    modules.add('pediatric');
  }
  if (ageGroup === 'adult') modules.add('adult');
  if (ageGroup === 'older_adult') { modules.add('geriatric'); modules.add('adult'); }
  for (const c of presentation.presentations) {
    for (const mod of getModulesForPresentation(c.presentation)) {
      modules.add(mod as ModuleType);
    }
  }
  const deptMap: Record<string, ModuleType> = {
    surgery: 'surgery', pediatrics: 'pediatric', neonatology: 'neonatal',
    cardiology: 'cardiology', respiratory: 'respiratory', neurology: 'neurology',
    psychiatry: 'psychiatry', icu: 'icu_critical_care', 'emergency_medicine': 'emergency',
  };
  if (deptMap[department]) modules.add(deptMap[department]);
  if (encounterType === 'emergency') modules.add('emergency');
  if (knownConditions.includes('trauma')) modules.add('trauma');
  return Array.from(modules);
}

function getModulesForPresentation(p: ClinicalPresentationObject): string[] {
  const moduleMap: Record<string, string> = {
    respiratory: 'respiratory', cardiovascular: 'cardiology',
    gi: 'gi', neurological: 'neurology', musculoskeletal: 'orthopedics',
    obgyn: 'obstetrics', psychiatric: 'psychiatry',
    endocrine: 'endo', renal: 'renal', hematology: 'hematology',
  };
  return p.bodySystems.map(bs => moduleMap[bs]).filter(Boolean);
}
