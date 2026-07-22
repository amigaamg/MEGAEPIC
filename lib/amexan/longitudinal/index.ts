// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Longitudinal Care — Barrel Exports
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  TimelineEvent, TimelineEventType,
  HospitalDay, PatientStatus, VitalsSummary, TrendDirection,
  SoapNote, ProblemStatus, InvestigationStatus, MedicationStatus,
  DischargeReadiness,
  ToDoTask, TaskCategory, TaskPriority,
  WardRound, WardRoundPresentation,
  MonitoringParameter, MonitoringDataPoint, MonitoringSeries,
  ClinicalSnapshot, WarningItem, MedicationIssue,
  AdmissionRecord, DischargeData, DischargeMedication,
  IcuTransferNote, ConsultationNote, OperativeNote,
  PatientJourney,
} from './types';

export {
  createHospitalDay,
  generateSoapFromDelta,
  buildClinicalSnapshot,
  determinePatientStatus,
} from './dailyEvolutionEngine';

export {
  extractTasks,
  extractMedicationTasks,
  groupTasksByCategory,
  getUrgentTasks,
  getTodayTasks,
} from './taskExtractionEngine';

export {
  buildTimeline,
  filterTimelineByType,
  getEventsForDateRange,
  groupEventsByDate,
  getNotableEvents,
  formatEventTime,
  EVENT_TYPE_LABELS,
} from './timelineEngine';

export {
  buildMonitoringSeries,
  computeNEWS,
  interpretNEWS,
  getChartData,
} from './monitoringEngine';

export {
  generateDischargeData,
} from './dischargeEngine';
