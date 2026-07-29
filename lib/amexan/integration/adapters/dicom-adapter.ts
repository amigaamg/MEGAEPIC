import type { DICOMStudy } from '../../hmis/integration-engine';
import type { IntegrationLog } from '../../hmis/integration-engine';

export interface DICOMClientConfig {
  wadoUrl: string;
  stowUrl: string;
  qidoUrl: string;
  timeout: number;
  authToken?: string;
}

export interface DICOMInstance {
  sopInstanceUid: string;
  studyInstanceUid: string;
  seriesInstanceUid: string;
  instanceNumber: number;
  numberOfFrames?: number;
  transferSyntaxUid: string;
}

export interface DICOMSeries {
  seriesInstanceUid: string;
  studyInstanceUid: string;
  seriesNumber: number;
  modality: string;
  seriesDescription: string;
  instances: DICOMInstance[];
}

export interface QIDOResult {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  studyDate: string;
  studyDescription: string;
  modality: string;
  accessionNumber: string;
  numberOfSeries: number;
  numberOfInstances: number;
}

export class DICOMAdapter {
  private config: DICOMClientConfig;
  private logs: IntegrationLog[] = [];

  constructor(config: DICOMClientConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/dicom+json,application/json',
    };
    if (this.config.authToken) h['Authorization'] = `Bearer ${this.config.authToken}`;
    return h;
  }

  async searchStudies(params: {
    patientId?: string; patientName?: string;
    studyDate?: string; modality?: string; accessionNumber?: string;
  }): Promise<QIDOResult[]> {
    const searchParams = new URLSearchParams();
    if (params.patientId) searchParams.set('PatientID', params.patientId);
    if (params.patientName) searchParams.set('PatientName', params.patientName);
    if (params.studyDate) searchParams.set('StudyDate', params.studyDate);
    if (params.modality) searchParams.set('Modality', params.modality);
    if (params.accessionNumber) searchParams.set('AccessionNumber', params.accessionNumber);
    const url = `${this.config.qidoUrl.replace(/\/+$/, '')}/studies?${searchParams.toString()}`;
    try {
      const resp = await fetch(url, { headers: this.headers, signal: AbortSignal.timeout(this.config.timeout) });
      const data: any[] = await resp.json();
      this.logs.push({ at: Date.now(), type: 'info', message: `QIDO search studies -> ${data.length} results`, statusCode: resp.status, duration: 0 });
      return data.map(r => ({
        studyInstanceUid: r['0020000D']?.Value?.[0] || '',
        patientId: r['00100020']?.Value?.[0] || '',
        patientName: r['00100010']?.Value?.[0]?.Alphabetic || '',
        studyDate: r['00080020']?.Value?.[0] || '',
        studyDescription: r['00081030']?.Value?.[0] || '',
        modality: r['00080061']?.Value?.[0] || '',
        accessionNumber: r['00080050']?.Value?.[0] || '',
        numberOfSeries: parseInt(r['00201206']?.Value?.[0] || '0'),
        numberOfInstances: parseInt(r['00201208']?.Value?.[0] || '0'),
      }));
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `QIDO search studies -> ${(error as Error).message}`, duration: 0 });
      throw error;
    }
  }

  async retrieveStudy(studyInstanceUid: string): Promise<ArrayBuffer> {
    const url = `${this.config.wadoUrl.replace(/\/+$/, '')}/studies/${studyInstanceUid}`;
    try {
      const resp = await fetch(url, { headers: { ...this.headers, Accept: 'application/dicom' }, signal: AbortSignal.timeout(this.config.timeout * 2) });
      const buffer = await resp.arrayBuffer();
      this.logs.push({ at: Date.now(), type: 'info', message: `WADO retrieve study ${studyInstanceUid} -> ${buffer.byteLength} bytes`, statusCode: resp.status, duration: 0 });
      return buffer;
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `WADO retrieve study ${studyInstanceUid} -> ${(error as Error).message}`, duration: 0 });
      throw error;
    }
  }

  async retrieveSeries(studyInstanceUid: string, seriesInstanceUid: string): Promise<ArrayBuffer> {
    const url = `${this.config.wadoUrl.replace(/\/+$/, '')}/studies/${studyInstanceUid}/series/${seriesInstanceUid}`;
    const resp = await fetch(url, { headers: { ...this.headers, Accept: 'application/dicom' }, signal: AbortSignal.timeout(this.config.timeout * 2) });
    return resp.arrayBuffer();
  }

  async storeInstances(dicomData: ArrayBuffer): Promise<{ studyInstanceUid: string; instanceCount: number }> {
    const url = `${this.config.stowUrl.replace(/\/+$/, '')}/studies`;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/dicom',
          ...(this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {}),
        },
        body: dicomData,
        signal: AbortSignal.timeout(this.config.timeout * 3),
      });
      const result = await resp.text();
      this.logs.push({ at: Date.now(), type: 'info', message: `STOW-RS store -> status ${resp.status}`, statusCode: resp.status, duration: 0 });
      return { studyInstanceUid: 'stored', instanceCount: 1 };
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `STOW-RS store -> ${(error as Error).message}`, duration: 0 });
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.searchStudies({});
      return { success: true, message: 'DICOM QIDO endpoint reachable' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }
}
