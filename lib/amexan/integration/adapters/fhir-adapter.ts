import type { FhirPatient, FhirEncounter, FhirObservation } from '../../data/types';
import type { IntegrationEndpoint, IntegrationLog } from '../../hmis/integration-engine';
import { EndpointStatus } from '../../hmis/integration-engine';

export interface FHIRClientConfig {
  baseUrl: string;
  version: 'R4' | 'STU3' | 'DSTU2';
  timeout: number;
  headers?: Record<string, string>;
  authToken?: string;
}

export interface FHIRSearchParams {
  resourceType: string;
  filters?: Record<string, string>;
  sort?: string;
  count?: number;
  page?: number;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'searchset' | 'batch' | 'transaction';
  total?: number;
  entry: {
    resource?: unknown;
    fullUrl?: string;
    search?: { mode: string };
    request?: { method: string; url: string };
    response?: { status: string };
  }[];
  link?: { relation: string; url: string }[];
}

export class FHIRAdapter {
  private config: FHIRClientConfig;
  private logs: IntegrationLog[] = [];

  constructor(config: FHIRClientConfig) {
    this.config = config;
  }

  private get baseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
      ...this.config.headers,
    };
    if (this.config.authToken) headers['Authorization'] = `Bearer ${this.config.authToken}`;
    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<{ data: T; status: number }> {
    const url = `${this.config.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    const start = Date.now();
    try {
      const response = await fetch(url, {
        method,
        headers: this.baseHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await response.json();
      this.logs.push({ at: Date.now(), type: response.ok ? 'info' : 'warning', message: `${method} ${path} -> ${response.status}`, statusCode: response.status, duration: Date.now() - start });
      return { data: data as T, status: response.status };
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `${method} ${path} -> ${(error as Error).message}`, duration: Date.now() - start });
      throw error;
    }
  }

  async readPatient(patientId: string): Promise<FhirPatient> {
    const { data } = await this.request<FhirPatient>('GET', `Patient/${patientId}`);
    return data;
  }

  async createPatient(patient: FhirPatient): Promise<FhirPatient> {
    const { data } = await this.request<FhirPatient>('POST', 'Patient', patient);
    return data;
  }

  async updatePatient(patientId: string, patient: Partial<FhirPatient>): Promise<FhirPatient> {
    const { data } = await this.request<FhirPatient>('PUT', `Patient/${patientId}`, patient);
    return data;
  }

  async searchPatient(params: { name?: string; birthDate?: string; mrn?: string; identifier?: string }): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.set('name', params.name);
    if (params.birthDate) searchParams.set('birthdate', params.birthDate);
    if (params.mrn) searchParams.set('identifier', params.mrn);
    if (params.identifier) searchParams.set('identifier', params.identifier);
    const { data } = await this.request<FHIRBundle>('GET', `Patient?${searchParams.toString()}`);
    return data;
  }

  async createEncounter(encounter: FhirEncounter): Promise<FhirEncounter> {
    const { data } = await this.request<FhirEncounter>('POST', 'Encounter', encounter);
    return data;
  }

  async updateEncounter(encounterId: string, encounter: Partial<FhirEncounter>): Promise<FhirEncounter> {
    const { data } = await this.request<FhirEncounter>('PUT', `Encounter/${encounterId}`, encounter);
    return data;
  }

  async readEncounter(encounterId: string): Promise<FhirEncounter> {
    const { data } = await this.request<FhirEncounter>('GET', `Encounter/${encounterId}`);
    return data;
  }

  async createObservation(observation: FhirObservation): Promise<FhirObservation> {
    const { data } = await this.request<FhirObservation>('POST', 'Observation', observation);
    return data;
  }

  async searchObservation(patientId: string, code?: string, category?: string): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams({ subject: patientId });
    if (code) searchParams.set('code', code);
    if (category) searchParams.set('category', category);
    const { data } = await this.request<FHIRBundle>('GET', `Observation?${searchParams.toString()}`);
    return data;
  }

  async batch(entries: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; url: string; resource?: unknown }[]): Promise<FHIRBundle> {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'batch',
      entry: entries.map(e => ({
        request: { method: e.method, url: e.url },
        ...(e.resource ? { resource: e.resource } : {}),
      })),
    };
    const { data } = await this.request<FHIRBundle>('POST', '', bundle);
    return data;
  }

  async capabilityStatement(): Promise<Record<string, unknown>> {
    const { data } = await this.request<Record<string, unknown>>('GET', 'metadata');
    return data;
  }

  async testConnection(endpoint: IntegrationEndpoint): Promise<{ success: boolean; status: EndpointStatus; message: string }> {
    try {
      const metadata = await this.capabilityStatement();
      return { success: true, status: EndpointStatus.Connected, message: `Connected to FHIR server: ${(metadata as any)?.name || 'FHIR'}` };
    } catch (error) {
      return { success: false, status: EndpointStatus.Error, message: (error as Error).message };
    }
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
