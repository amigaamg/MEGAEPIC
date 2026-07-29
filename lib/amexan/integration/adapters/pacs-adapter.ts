import type { IntegrationLog } from '../../hmis/integration-engine';

export interface PACSClientConfig {
  baseUrl: string;
  aeTitle: string;
  timeout: number;
  authToken?: string;
}

export interface PACSStudyInfo {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  accessionNumber: string;
  referringPhysician: string;
  modality: string;
  seriesCount: number;
  instanceCount: number;
  studyStatus: 'completed' | 'partial' | 'cancelled' | 'scheduled';
}

export interface PACSSeriesInfo {
  seriesInstanceUid: string;
  seriesNumber: number;
  modality: string;
  seriesDescription: string;
  bodyPartExamined: string;
  laterality: string;
  instanceCount: number;
  seriesDate: string;
  seriesTime: string;
}

export class PACSAdapter {
  private config: PACSClientConfig;
  private logs: IntegrationLog[] = [];

  constructor(config: PACSClientConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { Accept: 'application/json' };
    if (this.config.authToken) h['Authorization'] = `Bearer ${this.config.authToken}`;
    return h;
  }

  private apiUrl(path: string): string {
    return `${this.config.baseUrl.replace(/\/+$/, '')}/api/${path.replace(/^\/+/, '')}`;
  }

  async searchStudies(params: {
    patientId?: string; patientName?: string; modality?: string;
    fromDate?: string; toDate?: string; accessionNumber?: string;
  }): Promise<PACSStudyInfo[]> {
    const searchParams = new URLSearchParams();
    if (params.patientId) searchParams.set('PatientID', params.patientId);
    if (params.patientName) searchParams.set('PatientName', params.patientName);
    if (params.modality) searchParams.set('Modality', params.modality);
    if (params.fromDate) searchParams.set('StudyDateFrom', params.fromDate);
    if (params.toDate) searchParams.set('StudyDateTo', params.toDate);
    if (params.accessionNumber) searchParams.set('AccessionNumber', params.accessionNumber);
    try {
      const resp = await fetch(`${this.apiUrl('studies')}?${searchParams.toString()}`, {
        headers: this.headers, signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      this.logs.push({ at: Date.now(), type: 'info', message: `PACS search studies -> ${data.length || 0} results`, statusCode: resp.status });
      return (data as PACSStudyInfo[]) || [];
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `PACS search studies -> ${(error as Error).message}` });
      throw error;
    }
  }

  async getStudy(studyInstanceUid: string): Promise<PACSStudyInfo | null> {
    try {
      const resp = await fetch(`${this.apiUrl('studies')}/${studyInstanceUid}`, {
        headers: this.headers, signal: AbortSignal.timeout(this.config.timeout),
      });
      if (!resp.ok) return null;
      return await resp.json() as PACSStudyInfo;
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `PACS get study ${studyInstanceUid} -> ${(error as Error).message}` });
      return null;
    }
  }

  async getSeries(studyInstanceUid: string): Promise<PACSSeriesInfo[]> {
    try {
      const resp = await fetch(`${this.apiUrl('studies')}/${studyInstanceUid}/series`, {
        headers: this.headers, signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      return (data as PACSSeriesInfo[]) || [];
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `PACS get series ${studyInstanceUid} -> ${(error as Error).message}` });
      return [];
    }
  }

  async getViewerUrl(studyInstanceUid: string): Promise<string> {
    return `${this.config.baseUrl.replace(/\/+$/, '')}/viewer/${studyInstanceUid}`;
  }

  async getThumbnailUrl(studyInstanceUid: string, seriesInstanceUid?: string): Promise<string> {
    const base = `${this.config.baseUrl.replace(/\/+$/, '')}/thumbnail/${studyInstanceUid}`;
    return seriesInstanceUid ? `${base}/${seriesInstanceUid}` : base;
  }

  async exportStudy(studyInstanceUid: string, format: 'DICOM' | 'JPEG' | 'PNG' | 'MP4' = 'DICOM'): Promise<ArrayBuffer> {
    try {
      const resp = await fetch(`${this.apiUrl('studies')}/${studyInstanceUid}/export?format=${format}`, {
        headers: this.headers, signal: AbortSignal.timeout(this.config.timeout * 3),
      });
      this.logs.push({ at: Date.now(), type: 'info', message: `PACS export study ${studyInstanceUid} as ${format}`, statusCode: resp.status });
      return await resp.arrayBuffer();
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `PACS export study ${studyInstanceUid} -> ${(error as Error).message}` });
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await fetch(this.apiUrl('health'), { signal: AbortSignal.timeout(5000) });
      return { success: resp.ok, message: resp.ok ? 'PACS reachable' : `PACS returned ${resp.status}` };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }
}
