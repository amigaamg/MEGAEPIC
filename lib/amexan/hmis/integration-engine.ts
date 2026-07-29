// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XXI: Integration Engine
// FHIR, HL7, DICOM, custom integration adapters for interoperability.
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntegrationEndpoint {
  id: string;
  name: string;
  type: IntegrationType;
  protocol: IntegrationProtocol;
  version: string;
  status: EndpointStatus;
  config: EndpointConfig;
  authMethod: AuthMethod;
  credentials?: EndpointCredentials;
  mappings: DataMapping[];
  schedule?: SyncSchedule;
  logs: IntegrationLog[];
  lastConnectionAt?: number;
  lastSyncAt?: number;
  errorCount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export enum IntegrationType {
  FHIR = 'fhir',
  HL7v2 = 'hl7_v2',
  HL7v3 = 'hl7_v3',
  DICOM = 'dicom',
  XDS = 'xds',
  Mirth = 'mirth',
  REST = 'rest',
  SOAP = 'soap',
  CSV = 'csv',
  FlatFile = 'flat_file',
  Custom = 'custom',
  NationalRegistry = 'national_registry',
  NHIF = 'nhif',
  SHA = 'sha',
  LabAdapter = 'lab_adapter',
  PACS = 'pacs',
  PharmacyAdapter = 'pharmacy_adapter',
  InsuranceGateway = 'insurance_gateway',
  PaymentGateway = 'payment_gateway',
}

export enum IntegrationProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  MLLP = 'mllp',
  DICOM = 'dicom',
  WebSocket = 'websocket',
  SFTP = 'sftp',
  S3 = 's3',
  MQTT = 'mqtt',
  AMQP = 'amqp',
  Kafka = 'kafka',
}

export enum EndpointStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Maintenance = 'maintenance',
  Configuring = 'configuring',
  Retrying = 'retrying',
}

export interface EndpointConfig {
  baseUrl?: string;
  port?: number;
  path?: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  batchSize: number;
  maxConcurrent: number;
  tlsEnabled: boolean;
  caCert?: string;
  additionalHeaders?: Record<string, string>;
}

export enum AuthMethod {
  None = 'none',
  Basic = 'basic',
  Bearer = 'bearer',
  OAuth2 = 'oauth2',
  ClientCredentials = 'client_credentials',
  APIKey = 'api_key',
  MutualTLS = 'mutual_tls',
  Custom = 'custom',
}

export interface EndpointCredentials {
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  apiKey?: string;
  certificate?: string;
  privateKey?: string;
}

export interface DataMapping {
  sourceSystem: string;
  sourceField: string;
  targetSystem: string;
  targetField: string;
  transform: TransformType;
  transformExpression?: string;
  isRequired: boolean;
  defaultValue?: string;
}

export enum TransformType {
  Direct = 'direct',
  Map = 'map',
  Concat = 'concat',
  DateFormat = 'date_format',
  Lookup = 'lookup',
  Regex = 'regex',
  Conditional = 'conditional',
  Custom = 'custom',
  CodeSystem = 'code_system',
}

export interface SyncSchedule {
  type: 'realtime' | 'periodic' | 'manual';
  interval?: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
  cronExpression?: string;
  dailyAt?: string;
  daysOfWeek?: number[];
}

export interface IntegrationLog {
  at: number;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  resourceType?: string;
  resourceId?: string;
  statusCode?: number;
  duration?: number;
  payload?: string;
}

export interface FHIRResource {
  resourceType: string;
  id: string;
  meta: FHIRMeta;
  identifier?: { system: string; value: string }[];
  code?: { coding: { system: string; code: string }[] };
  subject?: { reference: string };
  status?: string;
  [key: string]: unknown;
}

export interface FHIRMeta {
  versionId: string;
  lastUpdated: string;
  source: string;
  tag?: { system: string; code: string }[];
}

export interface HL7Message {
  messageType: string;
  triggerEvent: string;
  messageStructure: string;
  segments: HL7Segment[];
  rawMessage: string;
  parsedFields: Record<string, string>;
  encoding: string;
}

export interface HL7Segment {
  name: string;
  fields: string[];
  rawText: string;
}

export interface DICOMStudy {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  studyDate: string;
  studyDescription: string;
  modality: string;
  accessionNumber: string;
  referringPhysician: string;
  seriesCount: number;
  instanceCount: number;
}

export interface IntegrationStats {
  totalEndpoints: number;
  connected: number;
  errors: number;
  totalMappings: number;
  lastSyncAt?: number;
  byType: Record<string, number>;
  todayExchanges: number;
  failedExchanges: number;
}

export function createEndpoint(params: {
  name: string; type: IntegrationType; protocol: IntegrationProtocol; version: string;
  config: EndpointConfig; authMethod: AuthMethod; mappings?: DataMapping[];
}): IntegrationEndpoint {
  return {
    id: `INT-${Date.now().toString(36).toUpperCase()}`,
    name: params.name, type: params.type, protocol: params.protocol, version: params.version,
    status: EndpointStatus.Configuring, config: params.config, authMethod: params.authMethod,
    mappings: params.mappings || [], logs: [], errorCount: 0, isActive: true,
    createdAt: Date.now(), updatedAt: Date.now(),
  };
}

export function getIntegrationStats(endpoints: IntegrationEndpoint[]): IntegrationStats {
  const byType: Record<string, number> = {};
  let todayExchanges = 0;
  let failedExchanges = 0;
  const today = Date.now() - 86400000;
  for (const e of endpoints) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    todayExchanges += e.logs.filter(l => l.at >= today).length;
    failedExchanges += e.logs.filter(l => l.at >= today && (l.type === 'error' || l.type === 'critical')).length;
  }
  return {
    totalEndpoints: endpoints.length,
    connected: endpoints.filter(e => e.status === EndpointStatus.Connected).length,
    errors: endpoints.filter(e => e.status === EndpointStatus.Error).length,
    totalMappings: endpoints.reduce((s, e) => s + e.mappings.length, 0),
    byType, todayExchanges, failedExchanges,
  };
}
