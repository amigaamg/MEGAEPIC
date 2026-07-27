'use client';
import React, { useMemo, useCallback, useState } from 'react';
import {
  processExaminationEngine,
  getVisibleFindingsForPhase,
  getVisibleModules,
  type ExamEngineOutput,
  type ExamFindings,
  type CrossCheckResult,
  type ActiveCascade,
  type AnthropometryEngineOutput,
  type GECardDef,
  type GEFindings,
} from '@/lib/clinical/constitutional/examination-engine';
import {
  type ExamPhase,
  type ExamFindingGroupDef,
  type SystemicModuleDef,
} from '@/lib/clinical/constitutional/examination-knowledge';
import {
  type RespCardDef,
  type RespExamMode,
  type EvidenceGraphNode,
  type AbdCardDef,
  type AbdExamMode,
  type AbdEvidenceGraphNode,
  type CvsCardDef,
  type CvsExamMode,
  type CvsEvidenceGraphNode,
  type NeuroCardDef,
  type NeuroExamMode,
  type NeuroEvidenceGraphNode,
  type UEOObject,
  type BreastCardDef,
  type BreastExamMode,
  type BreastEvidenceGraphNode,
} from '@/lib/clinical/constitutional/examination-engine';

export interface ExamBridgeResult {
  engineOutput: ExamEngineOutput;
  visibleVitals: ExamFindingGroupDef[];
  visibleGeneralExam: ExamFindingGroupDef[];
  visibleModules: SystemicModuleDef[];
  activeCascades: ActiveCascade[];
  crossCheckResults: CrossCheckResult[];
  anthropometry: AnthropometryEngineOutput | null;
  generalExamCards: GECardDef[];
  generalExamFindings: GEFindings;
  handleExamAnswer: (findingId: string, value: unknown) => void;
  handleAnthropometryValue: (measurementId: string, value: number | null) => void;
  handleGeneralExamAnswer: (cardId: string, value: unknown) => void;
  handleRespiratoryAnswer: (cardId: string, value: unknown) => void;
  anthropometryValues: Record<string, number | null>;
  respMode: RespExamMode;
  respCards: RespCardDef[];
  respNarrative: string;
  respEscalated: boolean;
  respExpandedCardIds: string[];
  respEvidenceGraph: EvidenceGraphNode[];
  abdMode: AbdExamMode;
  abdCards: AbdCardDef[];
  abdNarrative: string;
  abdEscalated: boolean;
  abdExpandedCardIds: string[];
  abdEvidenceGraph: AbdEvidenceGraphNode[];
  handleAbdominalAnswer: (cardId: string, value: unknown) => void;
  cvsMode: CvsExamMode;
  cvsCards: CvsCardDef[];
  cvsNarrative: string;
  cvsEscalated: boolean;
  cvsExpandedCardIds: string[];
  cvsEvidenceGraph: CvsEvidenceGraphNode[];
  handleCardiovascularAnswer: (cardId: string, value: unknown) => void;
  neuroMode: NeuroExamMode;
  neuroCards: NeuroCardDef[];
  neuroNarrative: string;
  neuroEscalated: boolean;
  neuroExpandedCardIds: string[];
  neuroEvidenceGraph: NeuroEvidenceGraphNode[];
  handleNeurologicalAnswer: (cardId: string, value: unknown) => void;
  activeUEOs: Record<string, UEOObject>;
  ueoNarrative: string;
  breastMode: BreastExamMode;
  breastCards: BreastCardDef[];
  breastNarrative: string;
  breastEscalated: boolean;
  breastExpandedCardIds: string[];
  breastEvidenceGraph: BreastEvidenceGraphNode[];
  handleBreastAnswer: (cardId: string, value: unknown) => void;
}

export function useExaminationEngine(
  ageMonths: number,
  sex: string,
  pregnant: boolean,
  chiefComplaints: string[],
  historyFacts: Record<string, unknown>,
  findings: ExamFindings,
  onFindingChange: (findingId: string, value: unknown) => void,
  knownDiseases?: string[],
  activeModules?: string[],
): ExamBridgeResult {
  const [anthropometryValues, setAnthropometryValues] = useState<Record<string, number | null>>({});

  const engineOutput = useMemo(() =>
    processExaminationEngine(
      ageMonths, sex, pregnant, chiefComplaints, historyFacts, findings,
      anthropometryValues, undefined, knownDiseases, activeModules,
    ),
    [ageMonths, sex, pregnant, chiefComplaints, historyFacts, findings, anthropometryValues, knownDiseases, activeModules],
  );

  const visibleVitals = useMemo(() =>
    getVisibleFindingsForPhase('vitals', ageMonths, sex, pregnant, findings),
    [ageMonths, sex, pregnant, findings],
  );

  const visibleGeneralExam = useMemo(() =>
    getVisibleFindingsForPhase('general_exam', ageMonths, sex, pregnant, findings),
    [ageMonths, sex, pregnant, findings],
  );

  const visibleModules = useMemo(() =>
    getVisibleModules(ageMonths, sex, pregnant, chiefComplaints, findings),
    [ageMonths, sex, pregnant, chiefComplaints, findings],
  );

  const handleExamAnswer = useCallback((findingId: string, value: unknown) => {
    onFindingChange(findingId, value);
  }, [onFindingChange]);

  const handleAnthropometryValue = useCallback((measurementId: string, value: number | null) => {
    setAnthropometryValues(prev => ({ ...prev, [measurementId]: value }));
    onFindingChange(measurementId, value);
  }, [onFindingChange]);

  const handleGeneralExamAnswer = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  const handleRespiratoryAnswer = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  const handleAbdominalAnswer = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  const handleCardiovascularAnswer = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  const handleNeurologicalAnswer = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  const handleBreastAnswer = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  return {
    engineOutput,
    visibleVitals,
    visibleGeneralExam,
    visibleModules,
    activeCascades: engineOutput.activeCascades,
    crossCheckResults: engineOutput.crossCheckResults,
    anthropometry: engineOutput.anthropometry,
    generalExamCards: engineOutput.generalExamCards,
    generalExamFindings: engineOutput.generalExamFindings,
    handleExamAnswer,
    handleAnthropometryValue,
    handleGeneralExamAnswer,
    handleRespiratoryAnswer,
    anthropometryValues,
    respMode: engineOutput.respExamMode,
    respCards: engineOutput.respCards,
    respNarrative: engineOutput.respNarrative,
    respEscalated: engineOutput.respEscalated,
    respExpandedCardIds: engineOutput.respExpandedCardIds,
    respEvidenceGraph: engineOutput.respEvidenceGraph,
    abdMode: engineOutput.abdExamMode,
    abdCards: engineOutput.abdCards,
    abdNarrative: engineOutput.abdNarrative,
    abdEscalated: engineOutput.abdEscalated,
    abdExpandedCardIds: engineOutput.abdExpandedCardIds,
    abdEvidenceGraph: engineOutput.abdEvidenceGraph,
    handleAbdominalAnswer,
    cvsMode: engineOutput.cvsExamMode,
    cvsCards: engineOutput.cvsCards,
    cvsNarrative: engineOutput.cvsNarrative,
    cvsEscalated: engineOutput.cvsEscalated,
    cvsExpandedCardIds: engineOutput.cvsExpandedCardIds,
    cvsEvidenceGraph: engineOutput.cvsEvidenceGraph,
    handleCardiovascularAnswer,
    neuroMode: engineOutput.neuroExamMode,
    neuroCards: engineOutput.neuroCards,
    neuroNarrative: engineOutput.neuroNarrative,
    neuroEscalated: engineOutput.neuroEscalated,
    neuroExpandedCardIds: engineOutput.neuroExpandedCardIds,
    neuroEvidenceGraph: engineOutput.neuroEvidenceGraph,
    activeUEOs: engineOutput.activeUEOs,
    ueoNarrative: engineOutput.ueoNarrative,
    handleNeurologicalAnswer,
    breastMode: engineOutput.breastExamMode,
    breastCards: engineOutput.breastCards,
    breastNarrative: engineOutput.breastNarrative,
    breastEscalated: engineOutput.breastEscalated,
    breastExpandedCardIds: engineOutput.breastExpandedCardIds,
    breastEvidenceGraph: engineOutput.breastEvidenceGraph,
    handleBreastAnswer,
  };
}
