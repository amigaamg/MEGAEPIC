export { detectMissingData } from './missing-data-detector';
export type { MissingDataItem, MissingDataResult, PatientDataPresence, MissingDataCategory } from './missing-data-detector';

export { detectContradictions } from './contradiction-detector';
export type { ClinicalFinding, Contradiction, ContradictionResult } from './contradiction-detector';

export { explainDecision } from './decision-explainer';
export type { ExplainableDecision, DecisionExplanation, DecisionStep, ExplainInput } from './decision-explainer';

export { decideOperativeApproach } from './operative-decision';
export type { OperativeDecisionInput, OperativeDecisionResult, OperativeOption, OperativeIndicationUrgency } from './operative-decision';

export { renderPdfText, buildClerkingPdf, buildOperativeNotePdf, buildDischargeSummaryPdf } from './pdf-renderer';
export type { PdfDocument, PdfSection } from './pdf-renderer';

export { reasonHistory } from './lbo-history-reasoning';
export type { HistoryReasoningOutput } from './lbo-history-reasoning';

export { reasonExam } from './lbo-exam-reasoning';
export type { ExamReasoningOutput } from './lbo-exam-reasoning';

export { reasonInvestigations } from './lbo-investigation-reasoning';
export type { InvestigationReasoningOutput, InvestigationSuggestion } from './lbo-investigation-reasoning';

export { generateCasePresentationPdf, downloadPdf, getPdfBlobUrl } from './lbo-pdf-generator';

export { renderClinicalNarrative, generateSocrates, compressNarrative, PHRASES, enforceTemporalProgression } from './lbo-language-renderer';
export type { RenderInput, RenderedOutput, SocratesOutput } from './lbo-language-renderer';
export { synthesizeStreamsFromHistory, syncHistoryFromStreams } from '../lbo-records';
export type { SymptomStream } from '../lbo-records';
