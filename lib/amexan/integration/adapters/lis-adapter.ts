import type { IntegrationLog } from '../../hmis/integration-engine';
import type { HL7ParsedMessage } from './hl7-adapter';
import { HL7Adapter } from './hl7-adapter';

export interface LISClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface LabOrderRequest {
  patientId: string;
  patientMrn: string;
  patientName: { family: string; given: string };
  patientDob: string;
  patientSex: string;
  panelCode: string;
  panelName: string;
  orderingProvider: string;
  priority: 'routine' | 'urgent' | 'stat';
}

export interface LabResult {
  testCode: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  abnormalFlag: 'H' | 'L' | 'HH' | 'LL' | 'N' | null;
  status: 'pending' | 'completed' | 'cancelled' | 'corrected';
  performedAt: string;
  performer: string;
}

export interface LabReport {
  orderId: string;
  patientId: string;
  panelCode: string;
  panelName: string;
  orderedAt: string;
  completedAt: string;
  results: LabResult[];
  status: 'pending' | 'partial' | 'completed' | 'cancelled';
}

export type LISProtocol = 'REST' | 'HL7_MLLP' | 'HL7_HTTP';

export class LISAdapter {
  private config: LISClientConfig;
  private protocol: LISProtocol;
  private hl7: HL7Adapter | null = null;
  private logs: IntegrationLog[] = [];

  constructor(config: LISClientConfig, protocol: LISProtocol = 'REST', hl7Config?: ConstructorParameters<typeof HL7Adapter>[0]) {
    this.config = config;
    this.protocol = protocol;
    if (protocol !== 'REST' && hl7Config) {
      this.hl7 = new HL7Adapter(hl7Config);
    }
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.config.apiKey) h['X-API-Key'] = this.config.apiKey;
    return h;
  }

  async placeOrder(order: LabOrderRequest): Promise<{ orderId: string; message: string }> {
    if (this.protocol === 'HL7_MLLP' || this.protocol === 'HL7_HTTP') {
      return this.placeOrderHL7(order);
    }
    try {
      const resp = await fetch(`${this.config.baseUrl.replace(/\/+$/, '')}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(order),
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      this.logs.push({ at: Date.now(), type: 'info', message: `LIS order ${order.panelCode} -> ${resp.status}`, statusCode: resp.status });
      return { orderId: data.orderId || `LIS-${Date.now()}`, message: 'Order placed' };
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `LIS order failed -> ${(error as Error).message}` });
      throw error;
    }
  }

  private async placeOrderHL7(order: LabOrderRequest): Promise<{ orderId: string; message: string }> {
    if (!this.hl7) throw new Error('HL7 adapter not configured');
    const orm = this.hl7.buildORM_O01(
      { id: order.patientId, mrn: order.patientMrn, familyName: order.patientName.family, givenName: order.patientName.given, dob: order.patientDob, sex: order.patientSex },
      [{ setId: 1, orderingProvider: order.orderingProvider, procedureCode: order.panelCode, procedureName: order.panelName }],
    );
    if (this.protocol === 'HL7_HTTP') {
      const resp = await fetch(`${this.config.baseUrl.replace(/\/+$/, '')}/hl7`, {
        method: 'POST',
        headers: { 'Content-Type': 'x-application/hl7-v2+er' },
        body: orm,
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const text = await resp.text();
      return { orderId: `HL7-${Date.now()}`, message: text };
    }
    return { orderId: `HL7-${Date.now()}`, message: 'HL7 message prepared for MLLP' };
  }

  async getResults(orderId: string): Promise<LabReport> {
    try {
      const resp = await fetch(`${this.config.baseUrl.replace(/\/+$/, '')}/results/${orderId}`, {
        headers: this.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      this.logs.push({ at: Date.now(), type: 'info', message: `LIS results ${orderId} -> ${resp.status}`, statusCode: resp.status });
      return data as LabReport;
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `LIS results ${orderId} -> ${(error as Error).message}` });
      throw error;
    }
  }

  async getPatientResults(patientId: string): Promise<LabReport[]> {
    try {
      const resp = await fetch(`${this.config.baseUrl.replace(/\/+$/, '')}/patients/${patientId}/results`, {
        headers: this.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });
      const data = await resp.json();
      return data as LabReport[];
    } catch (error) {
      this.logs.push({ at: Date.now(), type: 'error', message: `LIS patient results ${patientId} -> ${(error as Error).message}` });
      throw error;
    }
  }

  parseHL7Result(hl7Raw: string): LabReport {
    if (!this.hl7) throw new Error('HL7 adapter not configured');
    const parsed = this.hl7.parse(hl7Raw);
    const obxSegments = parsed.segments.filter(s => s.name === 'OBX');
    const results: LabResult[] = obxSegments.map(s => {
      const field = s.fields;
      return {
        testCode: (field[2] || '').split('^')[0],
        testName: (field[2] || '').split('^')[1] || '',
        value: field[4] || '',
        unit: field[5] || '',
        referenceRange: field[6] || '',
        abnormalFlag: parseAbnormalFlag(field[7] || ''),
        status: mapOBXStatus(field[10] || 'F'),
        performedAt: '',
        performer: '',
      };
    });
    return {
      orderId: parsed.messageControlId,
      patientId: '',
      panelCode: '',
      panelName: '',
      orderedAt: '',
      completedAt: '',
      results,
      status: results.length > 0 ? 'completed' : 'pending',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await fetch(`${this.config.baseUrl.replace(/\/+$/, '')}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return { success: resp.ok, message: resp.ok ? 'LIS reachable' : `LIS returned ${resp.status}` };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }
}

function parseAbnormalFlag(flag: string): LabResult['abnormalFlag'] {
  const map: Record<string, LabResult['abnormalFlag']> = { H: 'H', L: 'L', HH: 'HH', LL: 'LL', N: 'N' };
  return map[flag] || null;
}

function mapOBXStatus(status: string): LabResult['status'] {
  const map: Record<string, LabResult['status']> = { P: 'pending', F: 'completed', C: 'cancelled', R: 'corrected' };
  return map[status] || 'pending';
}
