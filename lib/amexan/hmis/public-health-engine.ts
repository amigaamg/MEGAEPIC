// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XVIII: Public Health Engine
// Disease surveillance, immunization tracking, outbreak management, reporting.
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiseaseReport {
  id: string;
  disease: string;
  icdCode: string;
  classification: DiseaseClassification;
  patientId: string;
  patientAge: number;
  patientGender: string;
  patientLocation: string;
  facilityId: string;
  facilityName: string;
  reporterId: string;
  reporterName: string;
  dateOfOnset: string;
  dateOfDiagnosis: string;
  dateOfReport: number;
  status: DiseaseReportStatus;
  severity: DiseaseSeverity;
  outcome: DiseaseOutcome;
  hospitalizationRequired: boolean;
  hospitalizationDays?: number;
  complications: string[];
  riskFactors: string[];
  contactTracingDone: boolean;
  contactsIdentified: number;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export enum DiseaseClassification {
  Notifiable = 'notifiable',
  Reportable = 'reportable',
  Sentinel = 'sentinel',
  Emerging = 'emerging',
  Eradicated = 'eradicated',
  Imported = 'imported',
  Other = 'other',
}

export enum DiseaseReportStatus {
  Reported = 'reported',
  Verified = 'verified',
  Investigated = 'investigated',
  Closed = 'closed',
  Duplicate = 'duplicate',
}

export enum DiseaseSeverity {
  Mild = 'mild',
  Moderate = 'moderate',
  Severe = 'severe',
  Critical = 'critical',
  Fatal = 'fatal',
  Asymptomatic = 'asymptomatic',
}

export enum DiseaseOutcome {
  Recovered = 'recovered',
  Recovering = 'recovering',
  Critical = 'critical',
  Died = 'died',
  Transferred = 'transferred',
  LostToFollowUp = 'lost_to_follow_up',
  Palliative = 'palliative',
  Unknown = 'unknown',
}

export interface ImmunizationRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  vaccine: string;
  vaccineCode: string;
  batchNumber: string;
  manufacturer: string;
  doseNumber: number;
  totalDoses: number;
  dateAdministered: string;
  administeredBy: string;
  administeredAt: string;
  route: string;
  site: string;
  facilityId: string;
  facilityName: string;
  isScheduled: boolean;
  scheduledDate?: string;
  dueDate?: string;
  reactions: VaccineReaction[];
  status: ImmunizationStatus;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export enum ImmunizationStatus {
  Scheduled = 'scheduled',
  Administered = 'administered',
  Missed = 'missed',
  Refused = 'refused',
  Contraindicated = 'contraindicated',
  Postponed = 'postponed',
  Completed = 'completed',
}

export interface VaccineReaction {
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  onset: string;
  duration: string;
  management: string;
  reported: boolean;
}

export interface OutbreakAlert {
  id: string;
  disease: string;
  icdCode: string;
  region: string;
  facilityIds: string[];
  firstCaseReportedAt: number;
  numberOfCases: number;
  numberOfDeaths: number;
  attackRate: number;
  caseFatalityRate: number;
  status: OutbreakStatus;
  responseLevel: ResponseLevel;
  controlMeasures: string[];
  investigationStatus: string;
  sourceFound: boolean;
  sourceDescription?: string;
  declaredAt: number;
  containedAt?: number;
  declaredOverAt?: number;
}

export enum OutbreakStatus {
  Suspected = 'suspected',
  Confirmed = 'confirmed',
  Contained = 'contained',
  Over = 'over',
  Monitored = 'monitored',
}

export enum ResponseLevel {
  Level1 = 'level_1',
  Level2 = 'level_2',
  Level3 = 'level_3',
  National = 'national',
  International = 'international',
}

export interface PublicHealthStats {
  totalReports: number;
  notifiableDiseases: number;
  activeOutbreaks: number;
  vaccinationsToday: number;
  vaccinationCoverage: number;
  diseaseBreakdown: Record<string, number>;
  mortalityRate: number;
  byRegion: Record<string, number>;
  reportingFacilities: number;
}

export function createDiseaseReport(params: {
  disease: string; icdCode: string; classification: DiseaseClassification;
  patientId: string; patientAge: number; patientGender: string; patientLocation: string;
  facilityId: string; facilityName: string; reporterId: string; reporterName: string;
  dateOfOnset: string; dateOfDiagnosis: string; severity: DiseaseSeverity;
}): DiseaseReport {
  return {
    id: `PHR-${Date.now().toString(36).toUpperCase()}`,
    disease: params.disease, icdCode: params.icdCode, classification: params.classification,
    patientId: params.patientId, patientAge: params.patientAge, patientGender: params.patientGender,
    patientLocation: params.patientLocation, facilityId: params.facilityId, facilityName: params.facilityName,
    reporterId: params.reporterId, reporterName: params.reporterName,
    dateOfOnset: params.dateOfOnset, dateOfDiagnosis: params.dateOfDiagnosis, dateOfReport: Date.now(),
    status: DiseaseReportStatus.Reported, severity: params.severity, outcome: DiseaseOutcome.Unknown,
    hospitalizationRequired: false, complications: [], riskFactors: [],
    contactTracingDone: false, contactsIdentified: 0,
    metadata: {}, createdAt: Date.now(), updatedAt: Date.now(),
  };
}

export function getPublicHealthStats(reports: DiseaseReport[], immunizations: ImmunizationRecord[], outbreaks: OutbreakAlert[]): PublicHealthStats {
  const diseaseBreakdown: Record<string, number> = {};
  const byRegion: Record<string, number> = {};
  for (const r of reports) {
    diseaseBreakdown[r.disease] = (diseaseBreakdown[r.disease] || 0) + 1;
    byRegion[r.patientLocation] = (byRegion[r.patientLocation] || 0) + 1;
  }
  const today = new Date().toISOString().split('T')[0];
  const deaths = reports.filter(r => r.outcome === DiseaseOutcome.Died).length;
  const uniqueFacilities = new Set(reports.map(r => r.facilityId)).size;
  return {
    totalReports: reports.length,
    notifiableDiseases: reports.filter(r => r.classification === DiseaseClassification.Notifiable || r.classification === DiseaseClassification.Reportable).length,
    activeOutbreaks: outbreaks.filter(o => o.status === OutbreakStatus.Suspected || o.status === OutbreakStatus.Confirmed).length,
    vaccinationsToday: immunizations.filter(i => i.dateAdministered === today).length,
    vaccinationCoverage: 0,
    diseaseBreakdown, byRegion, mortalityRate: reports.length > 0 ? (deaths / reports.length) * 100 : 0,
    reportingFacilities: uniqueFacilities,
  };
}
