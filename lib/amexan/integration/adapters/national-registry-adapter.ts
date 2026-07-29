import type { IntegrationLog } from '../../hmis/integration-engine';

export interface RegistryConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  countryCode: 'KE' | 'UG' | 'TZ' | 'RW' | 'ET' | 'NG' | 'ZA' | 'GH';
}

export interface NotifiableDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  reportingRequired: boolean;
  reportTimeline: 'immediate' | 'within_24h' | 'within_72h' | 'weekly';
  category: 'epidemic_prone' | 'eradication_target' | 'public_health_importance' | 'international_concern';
}

export interface DiseaseReportPayload {
  facilityId: string;
  facilityName: string;
  county: string;
  subCounty: string;
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  patientAge: number;
  patientSex: string;
  patientOutcome: 'alive' | 'dead' | 'transferred' | 'unknown';
  dateOfDiagnosis: string;
  dateOfReporting: string;
  reportedBy: string;
  reporterContact: string;
  additionalNotes?: string;
}

export interface CoverageVerificationRequest {
  memberNumber: string;
  patientId: string;
  patientName: string;
  facilityCode: string;
  serviceType: 'outpatient' | 'inpatient' | 'maternity' | 'surgery' | 'dialysis' | 'oncology';
}

export interface CoverageVerificationResponse {
  active: boolean;
  memberName: string;
  membershipType: string;
  expiryDate: string;
  benefitLimits: Record<string, { used: number; limit: number; remaining: number }>;
  coPayRequired: boolean;
  coPayAmount: number;
}

export interface ClaimSubmissionPayload {
  claimNumber: string;
  memberNumber: string;
  patientId: string;
  encounterId: string;
  admissionDate?: string;
  dischargeDate?: string;
  diagnosisCodes: { code: string; type: 'primary' | 'secondary'; description: string }[];
  procedures: { code: string; description: string; date: string }[];
  medications: { drugCode: string; drugName: string; quantity: number; unitCost: number }[];
  totalAmount: number;
  facilityCode: string;
  submittedBy: string;
}

export interface ClaimStatus {
  claimNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved' | 'under_review';
  approvedAmount?: number;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

const NOTIFIABLE_DISEASES: NotifiableDisease[] = [
  { diseaseId: 'cholera', diseaseName: 'Cholera', icdCode: 'A00', reportingRequired: true, reportTimeline: 'immediate', category: 'epidemic_prone' },
  { diseaseId: 'plague', diseaseName: 'Plague', icdCode: 'A20', reportingRequired: true, reportTimeline: 'immediate', category: 'epidemic_prone' },
  { diseaseId: 'yellow_fever', diseaseName: 'Yellow Fever', icdCode: 'A95', reportingRequired: true, reportTimeline: 'immediate', category: 'epidemic_prone' },
  { diseaseId: 'viral_hemorrhagic', diseaseName: 'Viral Hemorrhagic Fevers (Ebola, Marburg, Rift Valley)', icdCode: 'A98', reportingRequired: true, reportTimeline: 'immediate', category: 'epidemic_prone' },
  { diseaseId: 'measles', diseaseName: 'Measles', icdCode: 'B05', reportingRequired: true, reportTimeline: 'within_24h', category: 'eradication_target' },
  { diseaseId: 'polio', diseaseName: 'Poliomyelitis', icdCode: 'A80', reportingRequired: true, reportTimeline: 'immediate', category: 'eradication_target' },
  { diseaseId: 'meningococcal', diseaseName: 'Meningococcal Meningitis', icdCode: 'A39', reportingRequired: true, reportTimeline: 'within_24h', category: 'epidemic_prone' },
  { diseaseId: 'tb', diseaseName: 'Tuberculosis', icdCode: 'A15-A19', reportingRequired: true, reportTimeline: 'within_72h', category: 'public_health_importance' },
  { diseaseId: 'hiv', diseaseName: 'HIV/AIDS', icdCode: 'B20-B24', reportingRequired: true, reportTimeline: 'within_72h', category: 'public_health_importance' },
  { diseaseId: 'malaria_severe', diseaseName: 'Severe Malaria', icdCode: 'B50-B54', reportingRequired: true, reportTimeline: 'within_72h', category: 'public_health_importance' },
  { diseaseId: 'typhoid', diseaseName: 'Typhoid Fever', icdCode: 'A01', reportingRequired: true, reportTimeline: 'within_24h', category: 'epidemic_prone' },
  { diseaseId: 'dengue', diseaseName: 'Dengue Fever', icdCode: 'A90', reportingRequired: true, reportTimeline: 'within_24h', category: 'international_concern' },
  { diseaseId: 'neonatal_tetanus', diseaseName: 'Neonatal Tetanus', icdCode: 'A33', reportingRequired: true, reportTimeline: 'immediate', category: 'eradication_target' },
  { diseaseId: 'rabies', diseaseName: 'Rabies (Human)', icdCode: 'A82', reportingRequired: true, reportTimeline: 'immediate', category: 'public_health_importance' },
];

const KNOWN_ICD_CODES = new Set(NOTIFIABLE_DISEASES.map(d => {
  const parts = d.icdCode.split('-');
  const codes: string[] = [];
  for (const p of parts) {
    const alphabet = p.match(/[A-Z]/)?.[0] || '';
    const rest = p.replace(/[A-Z]/, '');
    if (rest.includes(',')) {
      for (const r of rest.split(',')) codes.push(`${alphabet}${r}`);
    } else {
      codes.push(p);
    }
  }
  return codes;
}).flat());

export class NationalRegistryAdapter {
  private config: RegistryConfig;
  private logs: IntegrationLog[] = [];

  constructor(config: RegistryConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
    };
  }

  private apiUrl(path: string): string {
    return `${this.config.baseUrl.replace(/\/+$/, '')}/api/${path.replace(/^\/+/, '')}`;
  }

  async verifyPatientIdentity(documentType: string, documentNumber: string): Promise<{
    verified: boolean; nationalId?: string; name?: string; dob?: string;
  }> {
    try {
      const resp = await fetch(`${this.apiUrl('identity/verify')}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ documentType, documentNumber }),
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      this.logs.push({ at: Date.now(), type: 'info', message: `Identity verification ${documentType} ${documentNumber} -> ${data.verified ? 'VERIFIED' : 'FAILED'}`, statusCode: resp.status });
      return data;
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `Identity verification -> ${(error as Error).message}` });
      return { verified: false };
    }
  }

  getNotifiableDiseases(): NotifiableDisease[] {
    return [...NOTIFIABLE_DISEASES];
  }

  checkIfNotifiable(icdCode: string): NotifiableDisease | null {
    return NOTIFIABLE_DISEASES.find(d => icdCode.startsWith(d.icdCode.split('-')[0].split(',')[0])) || null;
  }

  async reportDisease(report: DiseaseReportPayload): Promise<{ success: boolean; reportId?: string; message: string }> {
    try {
      const resp = await fetch(this.apiUrl('disease/report'), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(report),
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      this.logs.push({ at: Date.now(), type: 'info', message: `Disease report ${report.diseaseName} -> ${resp.ok ? 'SUBMITTED' : 'FAILED'}`, statusCode: resp.status });
      return { success: resp.ok, reportId: data.reportId, message: data.message || '' };
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `Disease report -> ${(error as Error).message}` });
      return { success: false, message: (error as Error).message };
    }
  }

  async verifyCoverage(request: CoverageVerificationRequest): Promise<CoverageVerificationResponse | null> {
    try {
      const resp = await fetch(this.apiUrl('insurance/verify'), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout),
      });
      if (!resp.ok) return null;
      return await resp.json() as CoverageVerificationResponse;
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `Coverage verification ${request.memberNumber} -> ${(error as Error).message}` });
      return null;
    }
  }

  async submitClaim(claim: ClaimSubmissionPayload): Promise<ClaimStatus> {
    try {
      const resp = await fetch(this.apiUrl('insurance/claim'), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(claim),
        signal: AbortSignal.timeout(this.config.timeout * 2),
      });
      this.logs.push({ at: Date.now(), type: 'info', message: `Claim ${claim.claimNumber} submitted -> ${resp.status}`, statusCode: resp.status });
      return resp.ok ? await resp.json() as ClaimStatus : { claimNumber: claim.claimNumber, status: 'pending', rejectionReason: 'API unavailable' };
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `Claim submission -> ${(error as Error).message}` });
      return { claimNumber: claim.claimNumber, status: 'pending', rejectionReason: (error as Error).message };
    }
  }

  async getClaimStatus(claimNumber: string): Promise<ClaimStatus | null> {
    try {
      const resp = await fetch(this.apiUrl(`insurance/claim/${claimNumber}`), {
        headers: this.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });
      if (!resp.ok) return null;
      return await resp.json() as ClaimStatus;
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `Claim status ${claimNumber} -> ${(error as Error).message}` });
      return null;
    }
  }

  async submitMonthlyReport(facilityCode: string, month: string, data: Record<string, number>): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await fetch(this.apiUrl('report/monthly'), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ facilityCode, month, data }),
        signal: AbortSignal.timeout(this.config.timeout * 2),
      });
      const result = await resp.json();
      return { success: resp.ok, message: result.message || '' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await fetch(this.apiUrl('health'), { signal: AbortSignal.timeout(5000) });
      return { success: resp.ok, message: resp.ok ? 'Registry reachable' : `Registry returned ${resp.status}` };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }
}
