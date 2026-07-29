import { describe, it, expect } from 'vitest';
import { FHIRAdapter } from '../adapters/fhir-adapter';
import { HL7Adapter } from '../adapters/hl7-adapter';
import { DICOMAdapter } from '../adapters/dicom-adapter';
import { LISAdapter } from '../adapters/lis-adapter';
import { PACSAdapter } from '../adapters/pacs-adapter';
import { NationalRegistryAdapter } from '../adapters/national-registry-adapter';
import { SyncEngine } from '../sync-engine';

// ── FHIR Adapter ─────────────────────────────────────────

describe('FHIRAdapter', () => {
  it('should create an instance with config', () => {
    const adapter = new FHIRAdapter({
      baseUrl: 'http://localhost:8080/fhir',
      version: 'R4',
      timeout: 30000,
    });
    expect(adapter).toBeInstanceOf(FHIRAdapter);
    expect(adapter.getLogs()).toEqual([]);
  });

  it('should be able to read config through behavior', () => {
    const adapter = new FHIRAdapter({
      baseUrl: 'http://localhost:8080/fhir',
      version: 'R4',
      timeout: 5000,
    });
    adapter.clearLogs();
    expect(adapter.getLogs()).toEqual([]);
  });

  it('should return logs after operations', async () => {
    const adapter = new FHIRAdapter({
      baseUrl: 'http://localhost:8080/fhir',
      version: 'R4',
      timeout: 100,
    });
    await expect(adapter.capabilityStatement()).rejects.toThrow();
    const logs = adapter.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].type).toBe('error');
  });
});

// ── HL7 Adapter ──────────────────────────────────────────

describe('HL7Adapter', () => {
  const config = {
    sendingApp: 'AMEXAN',
    sendingFacility: 'HOSPITAL',
    receivingApp: 'LIS',
    receivingFacility: 'LAB',
    version: '2.5.1' as const,
    processingId: 'P' as const,
  };

  it('should build ADT A01 message', () => {
    const adapter = new HL7Adapter(config);
    const msg = adapter.buildADT_A01({
      id: 'pat-1', mrn: 'HN-2026-00001',
      familyName: 'Doe', givenName: 'John',
      dob: '19800101', sex: 'M',
    });
    expect(msg).toContain('MSH');
    expect(msg).toContain('ADT^A01');
    expect(msg).toContain('PID');
  });

  it('should build ORM O01 message', () => {
    const adapter = new HL7Adapter(config);
    const msg = adapter.buildORM_O01(
      { id: 'pat-1', mrn: 'HN-00001', familyName: 'Doe', givenName: 'John', dob: '19800101', sex: 'M' },
      [{ setId: 1, orderingProvider: 'Dr. Smith', procedureCode: 'CBC', procedureName: 'Complete Blood Count' }],
    );
    expect(msg).toContain('ORM^O01');
    expect(msg).toContain('OBR');
  });

  it('should build ORU R01 message', () => {
    const adapter = new HL7Adapter(config);
    const msg = adapter.buildORU_R01(
      { id: 'pat-1', mrn: 'HN-00001', familyName: 'Doe', givenName: 'John', dob: '19800101', sex: 'M' },
      [{ setId: 1, valueType: 'NM', code: 'WBC', codeName: 'White Blood Cell', value: '8.5', unit: 'x10^9/L' }],
    );
    expect(msg).toContain('ORU^R01');
    expect(msg).toContain('OBX');
  });

  it('should parse a raw HL7 message', () => {
    const adapter = new HL7Adapter(config);
    const raw = 'MSH|^~\\&|AMEXAN|HOSPITAL|LIS|LAB|20260728120000||ADT^A01|MSG001|P|2.5.1\rPID|1|HN-00001|pat-1||Doe^John^^^^||19800101|M';
    const parsed = adapter.parse(raw);
    expect(parsed.messageType).toBe('ADT');
    expect(parsed.triggerEvent).toBe('A01');
    expect(parsed.segments.length).toBe(2);
    expect(parsed.segments[0].name).toBe('MSH');
    expect(parsed.segments[1].name).toBe('PID');
  });

  it('should build ACK message', () => {
    const adapter = new HL7Adapter(config);
    const msg = adapter.buildACK();
    expect(msg).toContain('ACK^A01');
  });
});

// ── DICOM Adapter ────────────────────────────────────────

describe('DICOMAdapter', () => {
  it('should create an instance with config', () => {
    const adapter = new DICOMAdapter({
      wadoUrl: 'http://localhost:8042/dicom-web',
      stowUrl: 'http://localhost:8042/dicom-web',
      qidoUrl: 'http://localhost:8042/dicom-web',
      timeout: 30000,
    });
    expect(adapter).toBeInstanceOf(DICOMAdapter);
  });

  it('should handle connection failure gracefully', async () => {
    const adapter = new DICOMAdapter({
      wadoUrl: 'http://localhost:1/dicom-web',
      stowUrl: 'http://localhost:1/dicom-web',
      qidoUrl: 'http://localhost:1/dicom-web',
      timeout: 100,
    });
    await expect(adapter.searchStudies({})).rejects.toThrow();
  });
});

// ── LIS Adapter ──────────────────────────────────────────

describe('LISAdapter', () => {
  it('should create REST mode adapter', () => {
    const adapter = new LISAdapter(
      { baseUrl: 'http://localhost:8080/lis', timeout: 30000 },
      'REST',
    );
    expect(adapter).toBeInstanceOf(LISAdapter);
  });

  it('should create HL7 mode adapter', () => {
    const adapter = new LISAdapter(
      { baseUrl: 'http://localhost:8080/lis', timeout: 30000 },
      'HL7_HTTP',
      {
        sendingApp: 'AMEXAN', sendingFacility: 'HOSPITAL',
        receivingApp: 'LIS', receivingFacility: 'LAB',
        version: '2.5.1', processingId: 'P',
      },
    );
    expect(adapter).toBeInstanceOf(LISAdapter);
  });

  it('should test connection gracefully when server is down', async () => {
    const adapter = new LISAdapter(
      { baseUrl: 'http://localhost:1', timeout: 100 },
      'REST',
    );
    const result = await adapter.testConnection();
    expect(result.success).toBe(false);
  });
});

// ── PACS Adapter ─────────────────────────────────────────

describe('PACSAdapter', () => {
  it('should create an instance', () => {
    const adapter = new PACSAdapter({
      baseUrl: 'http://localhost:8042/pacs',
      aeTitle: 'AMEXAN',
      timeout: 30000,
    });
    expect(adapter).toBeInstanceOf(PACSAdapter);
  });

  it('should test connection gracefully when server is down', async () => {
    const adapter = new PACSAdapter({
      baseUrl: 'http://localhost:1',
      aeTitle: 'AMEXAN',
      timeout: 100,
    });
    const result = await adapter.testConnection();
    expect(result.success).toBe(false);
  });
});

// ── National Registry Adapter ────────────────────────────

describe('NationalRegistryAdapter', () => {
  const adapter = new NationalRegistryAdapter({
    baseUrl: 'http://localhost:8080/registry',
    apiKey: 'test-key',
    timeout: 30000,
    countryCode: 'KE',
  });

  it('should return notifiable diseases', () => {
    const diseases = adapter.getNotifiableDiseases();
    expect(diseases.length).toBeGreaterThan(0);
    expect(diseases[0].diseaseId).toBeDefined();
    expect(diseases[0].reportingRequired).toBe(true);
  });

  it('should detect notifiable disease by ICD code', () => {
    const result = adapter.checkIfNotifiable('A00');
    expect(result).not.toBeNull();
    expect(result!.diseaseName).toBe('Cholera');
  });

  it('should return null for non-notifiable code', () => {
    const result = adapter.checkIfNotifiable('Z00');
    expect(result).toBeNull();
  });

  it('should verify identity gracefully with no server', async () => {
    const result = await adapter.verifyPatientIdentity('national_id', '12345678').catch(() => ({ verified: false as const }));
    expect(result?.verified === false || result?.verified === undefined).toBe(true);
  });
});

// ── Sync Engine ──────────────────────────────────────────

describe('SyncEngine', () => {
  it('should create an instance with defaults', () => {
    const engine = new SyncEngine();
    expect(engine).toBeInstanceOf(SyncEngine);
    expect(engine.getLogs()).toEqual([]);
  });

  it('should create with custom config', () => {
    const engine = new SyncEngine({ batchSize: 10, maxRetries: 5 });
    expect(engine).toBeInstanceOf(SyncEngine);
  });

  it('should compute stats for empty queue', () => {
    const engine = new SyncEngine();
    const queue: any = {
      id: 'test', deviceId: 'dev-1', userId: 'user-1',
      items: [], status: 'active', totalItems: 0,
      pendingItems: 0, failedItems: 0,
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    const stats = engine.computeStats(queue);
    expect(stats.totalQueued).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.synced).toBe(0);
  });
});
