import {
  EXAM_SEQUENCES,
  VITAL_SIGNS,
  GENERAL_EXAM_FINDINGS,
  SYSTEMIC_EXAM_MODULES,
  SPECIAL_CASCADES,
  CROSS_CHECK_RULES,
  type ExamPhase,
  type ExamSequence,
  type SystemicExamModule,
  type SystemicModuleDef,
  type ExamFindingDef,
  type ExamFindingGroupDef,
  type EvidenceLinkDef,
  type ExamFindingType,
  type SpecialCascadeDef,
  type CrossCheckRule,
} from './examination-knowledge';

import {
  processAnthropometry,
  getAgeBand,
  type PatientGrowthContext,
  type AnthropometryEngineOutput,
  type AnthropometryMeasurement,
  type GrowthVelocityAnalysis,
  type AnthropometryAlert,
  type AgeBand,
} from './anatomometry-engine';

import {
  GENERAL_EXAMINATION_CARDS,
  generateGeneralExamNarrative,
  type GECardDef,
  type GEFindings,
  type GeneralExamContext,
} from './general-examination-engine';

import {
  detectRespiratoryMode,
  filterRespCards,
  getExpandedCardIds,
  shouldEscalateToPrimary,
  generateRespiratoryNarrative,
  buildEvidenceGraph,
  RESP_CARDS,
  RESP_SCREENING_CARDS,
  RESP_AUTO_ESCALATION_RULES,
  type RespCardDef,
  type RespContext,
  type RespExamMode,
  type EvidenceGraphNode,
} from './respiratory-examination-engine';

import {
  detectAbdominalMode,
  filterAbdCards,
  getAbdExpandedCardIds,
  shouldEscalateAbdToPrimary,
  generateAbdominalNarrative,
  buildAbdEvidenceGraph,
  ABD_CARDS,
  ABD_SCREENING_CARDS,
  ABD_AUTO_ESCALATION_RULES,
  type AbdCardDef,
  type AbdContext,
  type AbdExamMode,
  type AbdEvidenceGraphNode,
} from './abdominal-examination-engine';

import {
  detectCardiovascularMode,
  filterCvsCards,
  getCvsExpandedCardIds,
  shouldEscalateCvsToPrimary,
  generateCardiovascularNarrative,
  buildCvsEvidenceGraph,
  CVS_CARDS,
  CVS_SCREENING_CARDS,
  type CvsCardDef,
  type CvsContext,
  type CvsExamMode,
  type CvsEvidenceGraphNode,
} from './cardiovascular-examination-engine';

import {
  detectNeurologicalMode,
  filterNeuroCards,
  getNeuroExpandedCardIds,
  shouldEscalateNeuroToPrimary,
  generateNeurologicalNarrative,
  buildNeuroEvidenceGraph,
  NEURO_CARDS,
  NEURO_SCREENING_CARDS,
  type NeuroCardDef,
  type NeuroContext,
  type NeuroExamMode,
  type NeuroEvidenceGraphNode,
} from './neurological-examination-engine';

import {
  detectBreastExamMode,
  isBreastEngineRequired,
  filterBreastCards,
  getBreastExpandedCardIds,
  shouldEscalateBreastToPrimary,
  generateBreastNarrative,
  buildBreastEvidenceGraph,
  BREAST_CARDS,
  type BreastCardDef,
  type BreastContext,
  type BreastExamMode,
  type BreastEvidenceGraphNode,
} from './breast-examination-engine';

import {
  detectActiveUEOTypes,
  instantiateUEOObject,
  updateUEOObjectNarrative,
  type UEOObject,
} from './ueo-engine';

export type { ExamFindingGroupDef, ExamPhase, SystemicModuleDef, SpecialCascadeDef, CrossCheckRule, ExamFindingDef, EvidenceLinkDef, ExamFindingType };

export interface ExamFindings {
  [findingId: string]: {
    value: unknown;
    documentedAt: number;
  };
}

export interface PatientExamContext {
  ageMonths: number;
  ageGroup: string;
  sex: string;
  pregnant: boolean;
  chiefComplaints: string[];
  historyFacts: Record<string, unknown>;
  knownDiseases: string[];
  activeModules: string[];
}

export interface ExamNarrativeSection {
  phase: ExamPhase | SystemicExamModule | 'special_cascade';
  label: string;
  narrative: string;
}

export interface CrossCheckResult {
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  conflictType: string;
  historyLabel: string;
  examLabel: string;
  resolved: boolean;
}

export interface ActiveCascade {
  cascadeId: string;
  label: string;
  triggerFindingId: string;
  groups: ExamFindingGroupDef[];
}

export interface ExamEngineOutput {
  sequence: ExamSequence;
  activeModules: SystemicModuleDef[];
  activeCascades: ActiveCascade[];
  vitalsNarrative: string;
  anthropometry: AnthropometryEngineOutput | null;
  generalExamNarrative: string;
  generalExamCards: GECardDef[];
  generalExamFindings: GEFindings;
  moduleNarratives: Record<string, string>;
  fullExaminationNarrative: string;
  crossCheckResults: CrossCheckResult[];
  evidenceScore: EvidenceScoreSummary;
  respExamMode: RespExamMode;
  respCards: RespCardDef[];
  respNarrative: string;
  respEscalated: boolean;
  respExpandedCardIds: string[];
  respEvidenceGraph: EvidenceGraphNode[];
  abdExamMode: AbdExamMode;
  abdCards: AbdCardDef[];
  abdNarrative: string;
  abdEscalated: boolean;
  abdExpandedCardIds: string[];
  abdEvidenceGraph: AbdEvidenceGraphNode[];
  cvsExamMode: CvsExamMode;
  cvsCards: CvsCardDef[];
  cvsNarrative: string;
  cvsEscalated: boolean;
  cvsExpandedCardIds: string[];
  cvsEvidenceGraph: CvsEvidenceGraphNode[];
  neuroExamMode: NeuroExamMode;
  neuroCards: NeuroCardDef[];
  neuroNarrative: string;
  neuroEscalated: boolean;
  neuroExpandedCardIds: string[];
  neuroEvidenceGraph: NeuroEvidenceGraphNode[];
  activeUEOs: Record<string, UEOObject>;
  ueoNarrative: string;
  breastExamMode: BreastExamMode;
  breastCards: BreastCardDef[];
  breastNarrative: string;
  breastEscalated: boolean;
  breastExpandedCardIds: string[];
  breastEvidenceGraph: BreastEvidenceGraphNode[];
}

export interface EvidenceScoreSummary {
  totalPositiveFindings: number;
  diseaseEvidenceMap: Record<string, { forDisease: number; againstDisease: number }>;
}

export { type AnthropometryEngineOutput, type AnthropometryMeasurement, type GrowthVelocityAnalysis, type AnthropometryAlert, type GECardDef, type GEFindings, type AgeBand };
export { processAnthropometry, getAgeBand, GENERAL_EXAMINATION_CARDS, generateGeneralExamNarrative };
export { type RespCardDef, type RespExamMode, type RespSection, type EvidenceGraphNode, RESP_CARDS, RESP_SCREENING_CARDS, RESP_AUTO_ESCALATION_RULES, detectRespiratoryMode, generateRespiratoryNarrative, filterRespCards } from './respiratory-examination-engine';
export { type AbdCardDef, type AbdExamMode, type AbdSection, type AbdEvidenceGraphNode, ABD_CARDS, ABD_SCREENING_CARDS, ABD_AUTO_ESCALATION_RULES, detectAbdominalMode, generateAbdominalNarrative, filterAbdCards } from './abdominal-examination-engine';
export { type CvsCardDef, type CvsExamMode, type CvsSection, type CvsEvidenceGraphNode, CVS_CARDS, CVS_SCREENING_CARDS, detectCardiovascularMode, generateCardiovascularNarrative, filterCvsCards } from './cardiovascular-examination-engine';
export { type NeuroCardDef, type NeuroExamMode, type NeuroSection, type NeuroEvidenceGraphNode, NEURO_CARDS, NEURO_SCREENING_CARDS, detectNeurologicalMode, generateNeurologicalNarrative, filterNeuroCards, getNeuroSectionOrder } from './neurological-examination-engine';
export { type BreastCardDef, type BreastExamMode, type BreastSection, type BreastEvidenceGraphNode, BREAST_CARDS, detectBreastExamMode, generateBreastNarrative, filterBreastCards, shouldEscalateBreastToPrimary, isBreastEngineRequired, getBreastExpandedCardIds } from './breast-examination-engine';
export { detectActiveUEOTypes, instantiateUEOObject, buildUEOEvidenceGraph, getUEOCardsForType, updateUEOObjectNarrative, UEO_GROUPS, type UEOObject, type UEOType, type UEOCardDef, type UEOEvidenceNode, type UEOMeasurement } from './ueo-engine';
export type { UEOContext } from './ueo-types';

function findingsToRecord(findings: ExamFindings): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(findings)) {
    rec[k] = v.value;
  }
  return rec;
}

function resolveContextKey(ageGroup: string, pregnant: boolean): string {
  if (pregnant) return 'obstetric';
  if (['neonate'].includes(ageGroup)) return 'neonatal';
  if (['infant', 'toddler', 'child', 'adolescent'].includes(ageGroup)) return 'pediatric';
  return 'adult';
}

function shouldShowModule(
  module: SystemicModuleDef,
  ageGroup: string,
  pregnant: boolean,
  chiefComplaints: string[],
  findings: ExamFindings,
): boolean {
  if (module.contextVisibility.alwaysShow) return true;
  if (module.contextVisibility.showForAgeGroups?.includes(ageGroup)) return true;
  if (module.contextVisibility.hideForAgeGroups?.includes(ageGroup)) return false;
  if (module.contextVisibility.showForPregnancy && pregnant) return true;
  if (module.contextVisibility.triggerOnFinding) {
    return module.contextVisibility.triggerOnFinding.some(tf =>
      chiefComplaints.some(c => c.toLowerCase().includes(tf)),
    );
  }
  return false;
}

function buildFindingDocumentation(finding: ExamFindingDef, value: unknown): string {
  if (value == null || value === '' || value === false) return '';
  const selectedOption = finding.options?.find(o => o.value === value);
  if (selectedOption) return selectedOption.documentationPhrase;
  if (finding.documentationTemplate) {
    return finding.documentationTemplate.replace(/\{value\}/g, String(value));
  }
  return `${finding.label}: ${String(value)}`;
}

function buildGroupNarrative(group: ExamFindingGroupDef, findings: ExamFindings): string {
  const parts: string[] = [];
  for (const finding of group.findings) {
    const val = findings[finding.id]?.value;
    if (val != null && val !== '' && val !== false && !(Array.isArray(val) && val.length === 0)) {
      const doc = buildFindingDocumentation(finding, val);
      if (doc) parts.push(doc);
    }
  }
  return parts.join('; ');
}

function buildVitalsNarrative(findings: ExamFindings): string {
  const parts: string[] = [];
  for (const group of VITAL_SIGNS) {
    const n = buildGroupNarrative(group, findings);
    if (n) parts.push(n);
  }
  return parts.join('; ');
}

function buildModuleNarrative(module: SystemicModuleDef, findings: ExamFindings): string {
  const parts: string[] = [];
  for (const group of module.findingGroups) {
    const n = buildGroupNarrative(group, findings);
    if (n) parts.push(`${group.label}: ${n}`);
  }
  return parts.join('; ');
}

function detectActiveCascades(findings: ExamFindings): ActiveCascade[] {
  const active: ActiveCascade[] = [];
  for (const cascade of SPECIAL_CASCADES) {
    for (const triggerId of cascade.triggerFindings) {
      const val = findings[triggerId]?.value;
      if (val != null && val !== '' && val !== false && !(Array.isArray(val) && val.length === 0)) {
        active.push({
          cascadeId: cascade.id,
          label: cascade.label,
          triggerFindingId: triggerId,
          groups: cascade.groups,
        });
      }
    }
  }
  return active;
}

function runCrossCheck(
  historyFacts: Record<string, unknown>,
  findings: ExamFindings,
): CrossCheckResult[] {
  const results: CrossCheckResult[] = [];
  for (const rule of CROSS_CHECK_RULES) {
    const historyVal = historyFacts[rule.historyFact];
    const examVal = findings[rule.examFinding]?.value;

    let isDiscordant = false;
    if (rule.historyValue === null && rule.examValue === null) {
      if (examVal != null && examVal !== '' && examVal !== false && !(Array.isArray(examVal) && examVal.length === 0)) {
        isDiscordant = true;
      }
    } else if (rule.examValue === null) {
      if (examVal != null && examVal !== '' && examVal !== false) {
        if (rule.conflictType === 'discordant') {
          const numVal = parseFloat(String(examVal));
          if (rule.historyValue === 'none' && numVal > 0) isDiscordant = true;
        }
      }
    }

    if (isDiscordant || (rule.conflictType === 'history_missed' && examVal != null)) {
      results.push({
        ruleId: rule.id,
        message: rule.conflictType === 'history_missed'
          ? rule.message
          : `Reported "${String(historyVal)}" but exam shows "${String(examVal)}". ${rule.message}`,
        severity: rule.severity,
        conflictType: rule.conflictType,
        historyLabel: rule.historyFact,
        examLabel: rule.examFinding,
        resolved: false,
      });
    }
  }
  return results;
}

function computeEvidenceScores(findings: ExamFindings): EvidenceScoreSummary {
  const allFindings: ExamFindingDef[] = [];
  for (const group of VITAL_SIGNS) allFindings.push(...group.findings);
  for (const group of GENERAL_EXAM_FINDINGS) allFindings.push(...group.findings);
  for (const module of SYSTEMIC_EXAM_MODULES) {
    for (const group of module.findingGroups) allFindings.push(...group.findings);
  }
  for (const cascade of SPECIAL_CASCADES) {
    for (const group of cascade.groups) allFindings.push(...group.findings);
  }

  const diseaseEvidenceMap: Record<string, { forDisease: number; againstDisease: number }> = {};
  let totalPositiveFindings = 0;

  for (const finding of allFindings) {
    const val = findings[finding.id]?.value;
    if (val == null || val === '' || val === false || (Array.isArray(val) && val.length === 0)) continue;
    totalPositiveFindings++;

    for (const link of finding.evidenceLinks) {
      for (const disease of link.supportsDisease) {
        if (!diseaseEvidenceMap[disease]) diseaseEvidenceMap[disease] = { forDisease: 0, againstDisease: 0 };
        diseaseEvidenceMap[disease].forDisease += link.weight;
      }
      if (link.contradictsDisease) {
        for (const disease of link.contradictsDisease) {
          if (!diseaseEvidenceMap[disease]) diseaseEvidenceMap[disease] = { forDisease: 0, againstDisease: 0 };
          diseaseEvidenceMap[disease].againstDisease += link.weight;
        }
      }
    }
  }

  return { totalPositiveFindings, diseaseEvidenceMap };
}

export function processExaminationEngine(
  ageMonths: number,
  sex: string,
  pregnant: boolean,
  chiefComplaints: string[],
  historyFacts: Record<string, unknown>,
  findings: ExamFindings,
  anthropometryValues?: Record<string, number | null>,
  anthropometryPrevious?: Record<string, { id: string; value: number; ageMonths: number; date: string }>,
  knownDiseases?: string[],
  activeModules?: string[],
): ExamEngineOutput {
  const ageBand = getAgeBand(ageMonths);
  const ageGroup = ageBand;
  const contextKey = resolveContextKey(ageGroup, pregnant);
  const sequence = EXAM_SEQUENCES[contextKey] || EXAM_SEQUENCES.adult;

  const activeSysModules = SYSTEMIC_EXAM_MODULES.filter(mod =>
    shouldShowModule(mod, ageGroup, pregnant, chiefComplaints, findings),
  );

  const activeCascades = detectActiveCascades(findings);

  const vitalsNarrative = buildVitalsNarrative(findings);

  const growthCtx: PatientGrowthContext = {
    ageMonths,
    ageBand,
    sex: sex as any,
    pregnant,
    gestationalWeeksAtBirth: undefined,
    knownDiseases: knownDiseases || [],
    activeModules: activeModules || [],
    chiefComplaints,
    hasPreviousMeasurements: !!anthropometryPrevious,
  };
  const anthropometry = processAnthropometry(growthCtx, anthropometryValues || {}, anthropometryPrevious);

  const respCtx: RespContext = {
    ageBand,
    sex: sex as any,
    pregnant,
    knownDiseases: knownDiseases || [],
    chiefComplaints,
    activeModules: activeModules || [],
    findings: Object.fromEntries(
      Object.entries(findings).map(([k, v]) => [k, v.value]),
    ),
  };
  const respExamMode = detectRespiratoryMode(respCtx);
  const respSourceCards = respExamMode === 'secondary' ? RESP_SCREENING_CARDS : RESP_CARDS;
  const respCards = filterRespCards(respSourceCards, respCtx, respExamMode);
  const respExpandedCardIds = [...getExpandedCardIds(findingsToRecord(findings), respCards)];
  const respEscalated = respExamMode === 'secondary'
    ? shouldEscalateToPrimary(findingsToRecord(findings))
    : false;
  const respActiveCards = respEscalated
    ? filterRespCards(RESP_CARDS, respCtx, 'primary')
    : respCards;
  const respNarrative = generateRespiratoryNarrative(respActiveCards, findingsToRecord(findings), respEscalated ? 'primary' : respExamMode, respCtx);
  const respEvidenceGraph = buildEvidenceGraph(findingsToRecord(findings), respActiveCards);

  const abdCtx: AbdContext = {
    ageBand,
    sex: sex as any,
    pregnant,
    knownDiseases: knownDiseases || [],
    chiefComplaints,
    activeModules: activeModules || [],
    findings: Object.fromEntries(
      Object.entries(findings).map(([k, v]) => [k, v.value]),
    ),
  };
  const abdExamMode = detectAbdominalMode(abdCtx);
  const abdSourceCards = abdExamMode === 'secondary' ? ABD_SCREENING_CARDS : ABD_CARDS;
  const abdCards = filterAbdCards(abdSourceCards, abdCtx, abdExamMode);
  const abdExpandedCardIds = [...getAbdExpandedCardIds(findingsToRecord(findings), abdCards)];
  const abdEscalated = abdExamMode === 'secondary'
    ? shouldEscalateAbdToPrimary(findingsToRecord(findings))
    : false;
  const abdActiveCards = abdEscalated
    ? filterAbdCards(ABD_CARDS, abdCtx, 'primary')
    : abdCards;
  const abdNarrative = generateAbdominalNarrative(abdActiveCards, findingsToRecord(findings), abdEscalated ? 'primary' : abdExamMode);
  const abdEvidenceGraph = buildAbdEvidenceGraph(findingsToRecord(findings), abdActiveCards);

  const cvsCtx: CvsContext = {
    ageBand,
    sex: sex as any,
    pregnant,
    knownDiseases: knownDiseases || [],
    chiefComplaints,
    activeModules: activeModules || [],
    findings: Object.fromEntries(
      Object.entries(findings).map(([k, v]) => [k, v.value]),
    ),
  };
  const cvsExamMode = detectCardiovascularMode(cvsCtx);
  const cvsSourceCards = cvsExamMode === 'secondary' ? CVS_SCREENING_CARDS : CVS_CARDS;
  const cvsCards = filterCvsCards(cvsSourceCards, cvsCtx, cvsExamMode);
  const cvsExpandedCardIds = [...getCvsExpandedCardIds(findingsToRecord(findings), cvsCards)];
  const cvsEscalated = cvsExamMode === 'secondary'
    ? shouldEscalateCvsToPrimary(findingsToRecord(findings))
    : false;
  const cvsActiveCards = cvsEscalated
    ? filterCvsCards(CVS_CARDS, cvsCtx, 'primary')
    : cvsCards;
  const cvsNarrative = generateCardiovascularNarrative(cvsActiveCards, findingsToRecord(findings), cvsEscalated ? 'primary' : cvsExamMode);
  const cvsEvidenceGraph = buildCvsEvidenceGraph(findingsToRecord(findings), cvsActiveCards);

  const neuroCtx: NeuroContext = {
    ageBand,
    sex: sex as any,
    pregnant,
    knownDiseases: knownDiseases || [],
    chiefComplaints,
    activeModules: activeModules || [],
    findings: Object.fromEntries(
      Object.entries(findings).map(([k, v]) => [k, v.value]),
    ),
  };
  const neuroExamMode = detectNeurologicalMode(neuroCtx);
  const neuroSourceCards = neuroExamMode === 'secondary' ? NEURO_SCREENING_CARDS : NEURO_CARDS;
  const neuroCards = filterNeuroCards(neuroSourceCards, neuroCtx, neuroExamMode);
  const neuroExpandedCardIds = [...getNeuroExpandedCardIds(findingsToRecord(findings), neuroCards)];
  const neuroEscalated = neuroExamMode === 'secondary'
    ? shouldEscalateNeuroToPrimary(findingsToRecord(findings))
    : false;
  const neuroActiveCards = neuroEscalated
    ? filterNeuroCards(NEURO_CARDS, neuroCtx, 'medical')
    : neuroCards;
  const neuroNarrative = generateNeurologicalNarrative(neuroActiveCards, findingsToRecord(findings), neuroEscalated ? 'medical' : neuroExamMode);
  const neuroEvidenceGraph = buildNeuroEvidenceGraph(findingsToRecord(findings), neuroActiveCards);

  const breastCtx: BreastContext = {
    ageBand,
    sex: sex as any,
    pregnant,
    lactating: false,
    knownDiseases: knownDiseases || [],
    chiefComplaints,
    activeModules: activeModules || [],
    findings: Object.fromEntries(
      Object.entries(findings).map(([k, v]) => [k, v.value]),
    ),
    previousBreastSurgery: false,
    breastCancerHistory: false,
    brcaMutation: false,
    implantHistory: false,
    breastfeedingIssues: false,
    postpartum: false,
  };
  const breastEngineRequired = isBreastEngineRequired(breastCtx);
  let breastExamMode: BreastExamMode = 'screening';
  let breastCards: BreastCardDef[] = [];
  let breastNarrative = '';
  let breastEscalated = false;
  let breastExpandedCardIds: string[] = [];
  let breastEvidenceGraph: BreastEvidenceGraphNode[] = [];
  if (breastEngineRequired) {
    breastExamMode = detectBreastExamMode(breastCtx);
    breastCards = filterBreastCards(breastExamMode, breastCtx, findingsToRecord(findings));
    breastExpandedCardIds = getBreastExpandedCardIds(findingsToRecord(findings));
    breastEscalated = shouldEscalateBreastToPrimary(findingsToRecord(findings), breastCards);
    breastNarrative = generateBreastNarrative(breastCards, findingsToRecord(findings), breastExamMode);
    breastEvidenceGraph = buildBreastEvidenceGraph(findingsToRecord(findings), breastCards);
  }

  const allRecord = findingsToRecord(findings);
  const detectedUEOTypes = detectActiveUEOTypes(allRecord);
  const activeUEOs: Record<string, UEOObject> = {};
  for (const det of detectedUEOTypes) {
    const objId = `ueo_inst_${det.type}`;
    activeUEOs[objId] = instantiateUEOObject(det.type, allRecord, det.triggerCardId, det.triggerValue);
  }
  const ueoNarrative = Object.values(activeUEOs).map(o => o.narrative).filter(Boolean).join('\n');

  const geCtx: GeneralExamContext = {
    ageBand,
    sex: sex as any,
    pregnant,
    knownDiseases: knownDiseases || [],
    chiefComplaints,
    consciousLevel: String(findings['ge_consciousness']?.value || 'alert'),
  };

  const generalExamFindings: GEFindings = {};
  for (const [k, v] of Object.entries(findings)) {
    if (k.startsWith('ge_')) {
      const val = v.value;
      if (val === null || val === undefined) continue;
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || Array.isArray(val)) {
        generalExamFindings[k] = val as any;
      }
    }
  }
  const generalExamNarrative = generateGeneralExamNarrative(GENERAL_EXAMINATION_CARDS, generalExamFindings, geCtx);

  const moduleNarratives: Record<string, string> = {};
  for (const mod of activeSysModules) {
    const n = buildModuleNarrative(mod, findings);
    if (n) moduleNarratives[mod.id] = n;
  }

  const narrativeParts: string[] = [];
  if (vitalsNarrative) narrativeParts.push(vitalsNarrative);
  if (anthropometry.narrative) narrativeParts.push(anthropometry.narrative);
  if (generalExamNarrative) narrativeParts.push(generalExamNarrative);
  for (const mod of activeSysModules) {
    const n = moduleNarratives[mod.id];
    if (n) narrativeParts.push(`${mod.label}: ${n}`);
  }
  for (const cascade of activeCascades) {
    const cascadeNarrative = cascade.groups.map(g => buildGroupNarrative(g, findings)).filter(Boolean).join('; ');
    if (cascadeNarrative) narrativeParts.push(`${cascade.label}: ${cascadeNarrative}`);
  }
  const ueoNarratives = Object.values(activeUEOs).map(o => o.narrative).filter(Boolean);
  if (ueoNarratives.length > 0) narrativeParts.push(...ueoNarratives);
  const fullExaminationNarrative = narrativeParts.length > 0 ? narrativeParts.join('\n') : '';

  const crossCheckResults = runCrossCheck(historyFacts, findings);
  const evidenceScore = computeEvidenceScores(findings);

  return {
    sequence,
    activeModules: activeSysModules,
    activeCascades,
    vitalsNarrative,
    anthropometry,
    generalExamNarrative,
    generalExamCards: GENERAL_EXAMINATION_CARDS,
    generalExamFindings,
    moduleNarratives,
    fullExaminationNarrative,
    crossCheckResults,
    evidenceScore,
    respExamMode,
    respCards: respActiveCards,
    respNarrative,
    respEscalated,
    respExpandedCardIds,
    respEvidenceGraph,
    abdExamMode,
    abdCards: abdActiveCards,
    abdNarrative,
    abdEscalated,
    abdExpandedCardIds,
    abdEvidenceGraph,
    cvsExamMode,
    cvsCards: cvsActiveCards,
    cvsNarrative,
    cvsEscalated,
    cvsExpandedCardIds,
    cvsEvidenceGraph,
    neuroExamMode,
    neuroCards: neuroActiveCards,
    neuroNarrative,
    neuroEscalated,
    neuroExpandedCardIds,
    neuroEvidenceGraph,
    activeUEOs,
    ueoNarrative,
    breastExamMode,
    breastCards,
    breastNarrative,
    breastEscalated,
    breastExpandedCardIds,
    breastEvidenceGraph,
  };
}

export function getVisibleFindingsForPhase(
  phase: ExamPhase,
  ageMonths: number,
  sex: string,
  pregnant: boolean,
  findings: ExamFindings,
): ExamFindingGroupDef[] {
  const ageGroup = getAgeBand(ageMonths);

  if (phase === 'vitals') {
    return VITAL_SIGNS.map(group => ({
      ...group,
      findings: group.findings.filter(f => {
        if (!f.contextVisibility) return true;
        const cv = f.contextVisibility;
        if (cv.hideForAgeGroups?.includes(ageGroup)) return false;
        if (cv.showForAgeGroups && !cv.showForAgeGroups.includes(ageGroup)) return false;
        if (cv.triggerOnFindings && !cv.triggerOnFindings.some(tf => findings[tf]?.value != null)) return false;
        return true;
      }),
    })).filter(g => g.findings.length > 0);
  }

  if (phase === 'general_exam') {
    return GENERAL_EXAM_FINDINGS.map(group => ({
      ...group,
      findings: group.findings.filter(f => {
        if (!f.contextVisibility) return true;
        const cv = f.contextVisibility;
        if (cv.hideForAgeGroups?.includes(ageGroup)) return false;
        if (cv.showForAgeGroups && !cv.showForAgeGroups.includes(ageGroup)) return false;
        return true;
      }),
    })).filter(g => g.findings.length > 0);
  }

  if (phase === 'systemic_exam') return [];
  if (phase === 'special_exam') return [];
  return [];
}

export function getVisibleModules(
  ageMonths: number,
  sex: string,
  pregnant: boolean,
  chiefComplaints: string[],
  findings: ExamFindings,
): SystemicModuleDef[] {
  const ageGroup = getAgeBand(ageMonths);
  return SYSTEMIC_EXAM_MODULES.filter(mod =>
    shouldShowModule(mod, ageGroup, pregnant, chiefComplaints, findings),
  ).map(mod => ({
    ...mod,
    findingGroups: mod.findingGroups.map(group => ({
      ...group,
      findings: group.findings.filter(f => {
        if (!f.contextVisibility) return true;
        const cv = f.contextVisibility;
        if (cv.hideForAgeGroups?.includes(ageGroup)) return false;
        if (cv.showForAgeGroups && !cv.showForAgeGroups.includes(ageGroup)) return false;
        if (cv.triggerOnFindings && !cv.triggerOnFindings.some(tf => findings[tf]?.value != null)) return false;
        return true;
      }),
    })).filter(g => g.findings.length > 0),
  }));
}
