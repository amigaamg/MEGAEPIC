import type { IntegrationLog } from '../../hmis/integration-engine';

export interface HL7MessageConfig {
  sendingApp: string;
  sendingFacility: string;
  receivingApp: string;
  receivingFacility: string;
  version: '2.3' | '2.3.1' | '2.4' | '2.5' | '2.5.1' | '2.6' | '2.7';
  processingId: 'P' | 'D' | 'T';
}

export interface HL7SegmentDef {
  name: string;
  fields: string[];
}

export interface HL7ParsedMessage {
  messageType: string;
  triggerEvent: string;
  messageControlId: string;
  segments: HL7SegmentDef[];
  raw: string;
}

const FIELD_SEP = '|';
const COMP_SEP = '^';
const REP_SEP = '~';
const ESC_CHAR = '\\';
const SUB_COMP_SEP = '&';

export class HL7Adapter {
  private config: HL7MessageConfig;
  private messageCounter = 0;
  private logs: IntegrationLog[] = [];

  constructor(config: HL7MessageConfig) {
    this.config = config;
  }

  private nextControlId(): string {
    this.messageCounter++;
    return `MSG${Date.now().toString(36).toUpperCase()}${String(this.messageCounter).padStart(4, '0')}`;
  }

  private encodeField(value: string): string {
    return value.replace(/[|^~\\&]/g, c => `\\${ESC_CHAR}${c.charCodeAt(0).toString(16).padStart(2, '0')}\\`);
  }

  private decodeField(value: string): string {
    return value.replace(/\\([0-9A-Fa-f]{2})\\/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  private mshSegment(triggerEvent: string, messageType: string): string {
    const dt = new Date();
    const dateStr = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}${String(dt.getHours()).padStart(2, '0')}${String(dt.getMinutes()).padStart(2, '0')}`;
    const msh = [
      'MSH',
      '^~\\&',
      this.encodeField(this.config.sendingApp),
      this.encodeField(this.config.sendingFacility),
      this.encodeField(this.config.receivingApp),
      this.encodeField(this.config.receivingFacility),
      dateStr,
      '',
      `${messageType}^${triggerEvent}`,
      this.nextControlId(),
      this.config.processingId,
      this.config.version,
    ];
    return msh.join(FIELD_SEP);
  }

  private pidSegment(patient: {
    id: string; mrn: string; familyName: string; givenName: string;
    dob: string; sex: string; phone?: string; address?: string;
  }): string {
    const pid = [
      'PID',
      '1',
      patient.mrn,
      patient.id,
      `${this.encodeField(patient.familyName)}^${this.encodeField(patient.givenName)}^^^^`,
      '',
      patient.dob.replace(/-/g, ''),
      patient.sex,
      '',
      patient.address ? this.encodeField(patient.address) : '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      patient.phone || '',
    ];
    return pid.join(FIELD_SEP);
  }

  private obrSegment(order: {
    setId: number; orderingProvider: string; procedureCode: string; procedureName: string;
    orderDateTime?: string; reason?: string;
  }): string {
    const dt = order.orderDateTime || new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const obr = [
      'OBR',
      String(order.setId),
      '',
      `${order.procedureCode}^${this.encodeField(order.procedureName)}`,
      '',
      '',
      dt,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      this.encodeField(order.orderingProvider),
    ];
    return obr.join(FIELD_SEP);
  }

  private obxSegment(observation: {
    setId: number; valueType: string; code: string; codeName: string;
    value: string; unit?: string; referenceRange?: string; abnormalFlags?: string;
    observationDateTime?: string; status?: string;
  }): string {
    const dt = observation.observationDateTime || new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const obx = [
      'OBX',
      String(observation.setId),
      observation.valueType,
      `${observation.code}^${this.encodeField(observation.codeName)}`,
      '',
      this.encodeField(observation.value),
      observation.unit ? this.encodeField(observation.unit) : '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      observation.status || 'F',
      '',
      '',
      '',
      dt,
      observation.referenceRange || '',
      observation.abnormalFlags || '',
    ];
    return obx.join(FIELD_SEP);
  }

  buildMessage(type: 'ADT' | 'ORM' | 'ORU' | 'ACK', triggerEvent: string, segments: string[]): string {
    const msh = this.mshSegment(triggerEvent, type);
    const allSegments = [msh, ...segments];
    const raw = allSegments.join('\r') + '\r';
    this.logs.push({ at: Date.now(), type: 'info', message: `Built HL7 ${type}^${triggerEvent} (${allSegments.length} segments)`, duration: 0 });
    return raw;
  }

  buildADT_A01(patient: {
    id: string; mrn: string; familyName: string; givenName: string;
    dob: string; sex: string; phone?: string; address?: string;
  }): string {
    return this.buildMessage('ADT', 'A01', [this.pidSegment(patient)]);
  }

  buildADT_A03(patientId: string, mrn: string, familyName: string, givenName: string): string {
    return this.buildMessage('ADT', 'A03', [
      this.pidSegment({ id: patientId, mrn, familyName, givenName, dob: '', sex: '' }),
    ]);
  }

  buildORM_O01(patient: {
    id: string; mrn: string; familyName: string; givenName: string;
    dob: string; sex: string;
  }, orders: { setId: number; orderingProvider: string; procedureCode: string; procedureName: string }[]): string {
    const segments = [
      this.pidSegment({ ...patient, dob: patient.dob, sex: patient.sex }),
      ...orders.map(o => this.obrSegment({ ...o, orderDateTime: new Date().toISOString() })),
    ];
    return this.buildMessage('ORM', 'O01', segments);
  }

  buildORU_R01(patient: {
    id: string; mrn: string; familyName: string; givenName: string;
    dob: string; sex: string;
  }, observations: {
    setId: number; valueType: string; code: string; codeName: string;
    value: string; unit?: string; referenceRange?: string; abnormalFlags?: string;
  }[]): string {
    const segments = [
      this.pidSegment({ ...patient, dob: patient.dob, sex: patient.sex }),
      this.obrSegment({ setId: 1, orderingProvider: 'AMEXAN', procedureCode: 'ALL', procedureName: 'Panel' }),
      ...observations.map(o => this.obxSegment({ ...o, observationDateTime: new Date().toISOString(), status: 'F' })),
    ];
    return this.buildMessage('ORU', 'R01', segments);
  }

  buildACK(): string {
    return this.buildMessage('ACK', 'A01', []);
  }

  parse(raw: string): HL7ParsedMessage {
    const segments = raw.split('\r').filter(s => s.trim().length > 0);
    const parsedSegments: HL7SegmentDef[] = segments.map(s => {
      const parts = s.split(FIELD_SEP);
      return { name: parts[0], fields: parts.slice(1) };
    });
    const msh = parsedSegments[0];
    const msgType = msh.fields[7]?.split('^') || ['UNKNOWN', 'UNKNOWN'];
    this.logs.push({ at: Date.now(), type: 'info', message: `Parsed HL7 ${msgType[0]}^${msgType[1]} (${parsedSegments.length} segments)`, duration: 0 });
    return {
      messageType: msgType[0] || 'UNKNOWN',
      triggerEvent: msgType[1] || 'UNKNOWN',
      messageControlId: msh.fields[9] || '',
      segments: parsedSegments,
      raw,
    };
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
