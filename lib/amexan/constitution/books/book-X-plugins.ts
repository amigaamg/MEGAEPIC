export enum PluginDomain {
  FHIR = 'fhir',
  HL7 = 'hl7',
  DICOM = 'dicom',
  AI = 'ai',
  CountryModule = 'country_module',
  HospitalModule = 'hospital_module',
  Insurance = 'insurance',
  Research = 'research',
  Wearables = 'wearables',
  Laboratory = 'laboratory',
  Imaging = 'imaging',
  Robotics = 'robotics',
  Pharmacy = 'pharmacy',
  Billing = 'billing',
  Telemedicine = 'telemedicine',
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  domain: PluginDomain;
  description: string;
  author: string;
  homepage?: string;
  permissions: string[];
  hooks: PluginHook[];
  exposes: string[];
  dependencies: string[];
  config?: Record<string, unknown>;
}

export interface PluginHook {
  event: string;
  handler: string;
  priority: number;
  async: boolean;
}

export interface PluginContext {
  patientId?: string;
  encounterId?: string;
  userId?: string;
  facilityId?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}

export interface PluginResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const PLUGIN_REGISTRY: PluginManifest[] = [
  {
    id: 'plugin.fhir.r4',
    name: 'FHIR R4 Adapter',
    version: '1.0.0',
    domain: PluginDomain.FHIR,
    description: 'HL7 FHIR R4 interoperability layer',
    author: 'AMEXAN Core',
    permissions: ['read:patient', 'read:encounter', 'write:document'],
    hooks: [
      { event: 'patient.created', handler: 'exportPatientAsFHIR', priority: 5, async: true },
      { event: 'encounter.completed', handler: 'exportEncounterAsFHIR', priority: 5, async: true },
    ],
    exposes: ['/fhir/r4/Patient', '/fhir/r4/Encounter', '/fhir/r4/Observation'],
    dependencies: [],
  },
  {
    id: 'plugin.hl7.v2',
    name: 'HL7 v2 Adapter',
    version: '1.0.0',
    domain: PluginDomain.HL7,
    description: 'HL7 v2.x message parsing and generation',
    author: 'AMEXAN Core',
    permissions: ['read:patient', 'read:encounter', 'read:order', 'read:result'],
    hooks: [
      { event: 'order.created', handler: 'sendORM', priority: 5, async: true },
      { event: 'result.received', handler: 'sendORU', priority: 5, async: true },
    ],
    exposes: ['/hl7/v2/parse', '/hl7/v2/generate'],
    dependencies: [],
  },
  {
    id: 'plugin.ai.llm',
    name: 'AI Clinical Assistant',
    version: '1.0.0',
    domain: PluginDomain.AI,
    description: 'LLM-powered clinical decision support',
    author: 'AMEXAN Core',
    permissions: ['read:patient', 'read:encounter', 'read:knowledge', 'write:suggestion'],
    hooks: [
      { event: 'diagnosis.entered', handler: 'suggestDifferentials', priority: 3, async: true },
      { event: 'investigation.ordered', handler: 'suggestFollowUp', priority: 3, async: true },
    ],
    exposes: ['/ai/differentials', '/ai/summarize', '/ai/flag'],
    dependencies: [],
  },
  {
    id: 'plugin.dicom',
    name: 'DICOM Adapter',
    version: '1.0.0',
    domain: PluginDomain.DICOM,
    description: 'DICOM image management and viewing',
    author: 'AMEXAN Core',
    permissions: ['read:patient', 'read:imaging_result'],
    hooks: [
      { event: 'imaging.ordered', handler: 'createDICOMStudy', priority: 5, async: true },
    ],
    exposes: ['/dicom/studies', '/dicom/instances', '/dicom/wado'],
    dependencies: [],
  },
  {
    id: 'plugin.country.kenya',
    name: 'Kenya MoH Adapter',
    version: '1.0.0',
    domain: PluginDomain.CountryModule,
    description: 'Kenya Ministry of Health reporting and guidelines',
    author: 'AMEXAN Core',
    permissions: ['read:encounter', 'read:diagnosis', 'write:report'],
    hooks: [
      { event: 'diagnosis.confirmed', handler: 'checkNotifiableDisease', priority: 5, async: true },
    ],
    exposes: ['/kenya/moh/report', '/kenya/guidelines'],
    dependencies: [],
  },
  {
    id: 'plugin.insurance.nhif',
    name: 'NHIF Adapter',
    version: '1.0.0',
    domain: PluginDomain.Insurance,
    description: 'Kenya NHIF insurance claims and verification',
    author: 'AMEXAN Core',
    permissions: ['read:patient', 'read:encounter', 'write:claim'],
    hooks: [
      { event: 'encounter.created', handler: 'verifyCoverage', priority: 5, async: true },
      { event: 'discharge.completed', handler: 'submitClaim', priority: 5, async: true },
    ],
    exposes: ['/insurance/verify', '/insurance/claim', '/insurance/auth'],
    dependencies: [],
  },
];

export class PluginEngine {
  private plugins: Map<string, PluginManifest> = new Map();

  register(manifest: PluginManifest): void {
    this.plugins.set(manifest.id, manifest);
  }

  get(id: string): PluginManifest | null {
    return this.plugins.get(id) || null;
  }

  getByDomain(domain: PluginDomain): PluginManifest[] {
    return Array.from(this.plugins.values()).filter(p => p.domain === domain);
  }

  getHooks(event: string): PluginManifest[] {
    return Array.from(this.plugins.values()).filter(p =>
      p.hooks.some(h => h.event === event),
    );
  }

  validate(manifest: PluginManifest): string[] {
    const errors: string[] = [];
    if (!manifest.id) errors.push('Plugin ID required');
    if (!manifest.name) errors.push('Plugin name required');
    if (!manifest.version) errors.push('Plugin version required');
    if (!manifest.domain) errors.push('Plugin domain required');
    if (!manifest.hooks || manifest.hooks.length === 0) errors.push('Plugin must define at least one hook');
    return errors;
  }
}

export const pluginEngine = new PluginEngine();

for (const plugin of PLUGIN_REGISTRY) {
  pluginEngine.register(plugin);
}
