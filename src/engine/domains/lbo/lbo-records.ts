/**
 * LBO Patient Record Storage (localStorage-based)
 *
 * Stores complete encounter records with full clinical data.
 * Each record contains all phases: registration, history, exam,
 * investigations, imaging, reasoning results, management, operative,
 * discharge, and generated documents.
 */
import type { LboPatientData } from './lbo-reasoning-engine';
import type { LboApiOutput } from './api/lbo-api';

const STORAGE_KEY = 'amexan_lbo_records';
const ACTIVE_KEY = 'amexan_lbo_active';

export interface LboRecordMeta {
  id: string;
  patientName: string;
  mrn: string;
  age: number;
  encounterDate: string;
  encounterType: string;
  status: 'active' | 'completed' | 'discharged';
  diagnosis?: string;
  subtype?: string;
  surgeon?: string;
  lastModified: string;
}

export interface LboClinicalFacts {
  registration: RegistrationData;
  history: HistoryData;
  exam: ExamData;
  investigations: InvestigationsData;
  imaging: ImagingData;
  postOp?: PostOpMonitoringData;
}

export interface RegistrationData {
  patientName: string;
  mrn: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  encounterDate: string;
  encounterType: 'emergency' | 'inpatient' | 'ward_round' | 'follow_up';
  referringFacility: string;
  consultant: string;
  ward: string;
  bed: string;
  surgeon: string;
  bloodGroup: string;
  allergies: string[];
  anticoagulants: string[];
  previousSurgery: string;
}

export interface PmhConditionEntry {
  id: string;
  label: string;
  present: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  note: string;
}

export interface GynaeData {
  lmp: string;
  cycleRegular: boolean;
  pregnant: boolean;
  weeksPregnant: string;
  gravida: number;
  para: number;
  miscarriages: number;
  ovarianCyst: boolean;
  fibroids: boolean;
  pelvicSurgery: boolean;
  pelvicInflammatory: boolean;
  lastCervicalSmear: string;
  hormonalContraception: boolean;
  hrt: boolean;
  previousEctopic: boolean;
  ovarianCancerFamily: boolean;
  deniesPregnancy: boolean;
  deniesGynaeSymptoms: boolean;
}

export interface PostOpMonitoringData {
  pod: number;
  vitals: { hr: number; sbp: number; temp: number; rr: number; spo2: number };
  stoma: { outputMl24h: number; colour: string; functioning: boolean };
  wound: { condition: string; infectionSigns: boolean; discharge: string };
  drains: { outputMl24h: number; fluidCharacter: string };
  labs: { wbc: number; crp: number; lactate: number; creatinine: number };
  painScore: number;
  mobility: 'bedridden' | 'assisted' | 'independent';
  diet: 'nil' | 'sips' | 'soft' | 'full';
  bowelsOpen: boolean;
  flatusPassing: boolean;
  antibiotics: boolean;
  dvtProphylaxis: boolean;
}

export type StreamRole = 'first' | 'dominant' | 'progressive' | 'secondary' | 'late' | 'complication';

// ── Detailed Clinical Module Fields ─────────────────────────────────────────
// Each module collects focused data per clinical domain with minimal typing.
// These are NOT stored on SymptomStream (which is the temporal spine) but as
// optional HistoryData extensions for DDX fidelity.

export interface PainEvolutionModule {
  hasBecomeContinuous: boolean;
  hasGeneralized: boolean;
  severityInitial: number;
  severityCurrent: number;
  worseWithMovement: boolean;
  betterWithPosition: boolean;
  characterInitial?: 'colicky' | 'constant' | 'sharp' | 'burning';
}

export interface DistensionEvolutionModule {
  progressionRate: 'rapid_hours' | 'slow_days' | 'insidious_weeks';
  affectingBreathing: boolean;
  painWithDistension: boolean;
  distensionRelievedByVomiting: boolean;
}

export interface VomitingEvolutionModule {
  contentProgression: string[];
  contentCurrent: 'food' | 'bilious' | 'faeculent' | 'blood_stained';
  nauseaBeforeVomiting: boolean;
  vomitingRelievesPain: boolean;
  frequencyIncreasing: boolean;
}

export interface BowelFunctionModule {
  lastNormalStoolDays: number;
  lastStoolDays: number;
  lastFlatusDays: number;
  stoolCaliberReduced: boolean;
  alternatingConstipationDiarrhea: boolean;
  progressiveConstipationMonths: boolean;
  straining: boolean;
  incompleteEvacuation: boolean;
}

export interface IschemiaPerforationModule {
  painNowConstant: boolean;
  painWorseThanBefore: boolean;
  fever: boolean;
  rigors: boolean;
  confusion: boolean;
  reducedUrine: boolean;
  unableToStand: boolean;
  severeWeakness: boolean;
  tachycardia: boolean;
  hypotension: boolean;
}

export interface CancerScreeningModule {
  weightLoss: boolean;
  weightLossAmount: string;
  appetiteLoss: boolean;
  bloodPerRectum: boolean;
  pencilStools: boolean;
  progressiveConstipation: boolean;
  familyHistoryCRC: boolean;
}

export interface VolvulusRiskModule {
  previousAttacks: boolean;
  chronicConstipation: boolean;
  highFiberDiet: boolean;
  psychiatricDisease: boolean;
  parkinsons: boolean;
  institutionalized: boolean;
}

export interface DehydrationRenalModule {
  thirst: boolean;
  dryMouth: boolean;
  dizziness: boolean;
  reducedUrine: boolean;
  darkUrine: boolean;
  syncope: boolean;
}

export interface FocusedRosZone {
  confirmedLbo: string[];
  redFlagSystemic: string[];
  alternativeDiagnosis: string[];
}

export interface SymptomStream {
  id: string;
  type: 'pain' | 'distension' | 'vomiting' | 'constipation' | 'flatus_loss' | 'nausea' | 'fever' | 'weight_loss' | 'bleeding' | 'previous_episodes';
  label: string;
  present: boolean;
  denied?: boolean;
  /** Time-anchored: Day 0 = reference (day of presentation), onset_day=1 means started 1 day before presentation */
  onset_day: number;
  /** Role in the disease evolution timeline */
  role: StreamRole;
  onset_speed?: 'sudden' | 'acute' | 'subacute' | 'gradual';
  duration?: string;
  progression?: 'worsening' | 'stable' | 'intermittent' | 'resolving';
  character?: 'colicky' | 'constant' | 'colicky_then_constant' | 'sharp' | 'burning';
  location?: string;
  radiation?: string;
  severity?: number;
  frequency?: string;
  content?: 'bilious' | 'faeculent' | 'undigested_food' | 'clear' | 'blood_stained';
  lastBowelDays?: number;
  flatusStatus?: 'passing' | 'not_passing';
  bleedingType?: 'fresh_blood' | 'dark_blood' | 'melaena' | 'mixed' | 'on_tissue';
  weightLossAmount?: string;
}

export interface HistoryData {
  /** Structured PMH conditions with severity */
  pmhConditions?: PmhConditionEntry[];
  /** Gynaecological history (auto-injected for females 10-55) */
  gynae?: GynaeData;
  /** Constipation risk score from drug analysis */
  drugConstipationRiskScore?: number;
  /** Multi-stream chief complaints — each symptom has independent temporal profile */
  symptomStreams?: SymptomStream[];
  /** Detailed clinical modules for high-fidelity DDX */
  painEvolution?: PainEvolutionModule;
  distensionEvolution?: DistensionEvolutionModule;
  vomitingEvolution?: VomitingEvolutionModule;
  bowelFunction?: BowelFunctionModule;
  ischemiaPerforation?: IschemiaPerforationModule;
  cancerScreening?: CancerScreeningModule;
  volvulusRisk?: VolvulusRiskModule;
  dehydrationRenal?: DehydrationRenalModule;
  focusedRos?: FocusedRosZone;
  /** Surgical story fields — context, function, evolution narrative */
  contextAtOnset: string;
  firstSensation: string;
  functionalImpact: string;
  eatingImpact: 'normal' | 'reduced' | 'stopped';
  sleepImpact: 'normal' | 'disturbed' | 'unable';
  workCapacity: 'normal' | 'limited' | 'stopped';
  presentingComplaint: string;
  complaintDuration: string;
  complaintSeverity: number;
  hpiOnset: string;
  hpiDuration: string;
  hpiProgression: string;
  hpiPainCharacter: string;
  hpiPainLocation: string;
  hpiPainRadiation: string;
  hpiAssociatedVomiting: boolean;
  hpiVomitingFrequency: string;
  hpiVomitContent: string;
  hpiFlatusStatus: 'passing' | 'not_passing' | 'unknown';
  hpiBowelStatus: 'open' | 'constipated' | 'absolute_constipation';
  hpiLastBowelDays: number;
  hpiWeightLoss: boolean;
  hpiWeightLossAmount: string;
  hpiBleeding: boolean;
  hpiBleedingType: string;
  hpiPreviousEpisodes: boolean;
  /** Explicit negative history — user must tick to confirm absence */
  deniesNausea: boolean;
  deniesVomiting: boolean;
  deniesFever: boolean;
  deniesWeightLoss: boolean;
  deniesRectalBleeding: boolean;
  deniesPreviousEpisodes: boolean;
  deniesAbdominalSurgery: boolean;
  deniesChronicConstipation: boolean;
  deniesFamilyHistoryCRC: boolean;
  deniesSmoking: boolean;
  deniesAlcohol: boolean;
  deniesAnticoagulants: boolean;
  deniesSteroids: boolean;
  deniesNSAIDs: boolean;
  pmh: string;
  surgicalHistory: string;
  drugHistory: string;
  allergies_text: string;
  familyHistory: string;
  socialHistory: string;
  rosFever: boolean;
  rosWeightLoss: boolean;
  rosNightSweats: boolean;
  rosFatigue: boolean;
  rosNausea: boolean;
  rosDysphagia: boolean;
  rosEarlySatiety: boolean;
  rosAbdominalPain: boolean;
  rosChangeBowelHabit: boolean;
  rosPalpitations: boolean;
  rosUrinarySymptoms: boolean;
  rosChestPain: boolean;
  rosDyspnoea: boolean;
  rosCough: boolean;
  rosHeadache: boolean;
  rosDizziness: boolean;
  rosSyncope: boolean;
  rosRash: boolean;
  rosJointPain: boolean;
  rosBackPain: boolean;
}

export interface SystemicExamData {
  cvs: {
    jvp: string;
    heartSounds: string;
    murmurs: string;
    peripheralOedema: 'none' | 'mild' | 'moderate' | 'severe';
    capillaryRefill: string;
    peripheralPulses: string;
  };
  respiratory: {
    chestWall: string;
    breathSounds: string;
    addedSounds: string;
    percussion: string;
    accessoryMuscleUse: boolean;
  };
  cns: {
    alertness: 'alert' | 'confused' | 'drowsy' | 'unresponsive';
    gcs: number;
    power: string;
    sensation: string;
    speech: string;
  };
  msk: {
    spineTenderness: boolean;
    jointSwelling: string;
    deformity: string;
    mobility: 'independent' | 'assisted' | 'bedridden';
  };
}

export interface ExamData {
  vitals: {
    heartRate: number;
    systolicBP: number;
    diastolicBP: number;
    temperature: number;
    respiratoryRate: number;
    spO2: number;
    gcs: number;
  };
  generalAppearance: string;
  hydrationStatus: string;
  distressLevel: string;
  jaundice?: boolean;
  anaemia?: boolean;
  lymphadenopathy?: boolean;
  systemic?: SystemicExamData;
  abdominalInspection: string;
  distensionSeverity: 'none' | 'mild' | 'moderate' | 'severe';
  abdominalMass: boolean;
  massLocation?: string;
  scars: string;
  hernialOrifices: string;
  abdominalTenderness: 'none' | 'mild' | 'moderate' | 'severe';
  tendernessLocation: string;
  peritonism: boolean;
  guarding: boolean;
  rigidity: boolean;
  reboundTenderness: boolean;
  murphySign?: boolean;
  rovsingSign?: boolean;
  percussionTympanic: boolean;
  percussionDull: boolean;
  bowelSounds: 'normal' | 'reduced' | 'absent' | 'high_pitched' | 'tinkling';
  drePerformed: boolean;
  dreSphincterTone?: string;
  dreFinding: string;
  dreStoolColour: string;
  dreMass: boolean;
  dreBlood: boolean;
}

export interface InvestigationsData {
  wbc: number;
  hemoglobin: number;
  platelets: number;
  neutrophils: number;
  crp: number;
  lactate: number;
  sodium: number;
  potassium: number;
  creatinine: number;
  urea: number;
  glucose: number;
  bicarbonate: number;
  gcs: number;
  ph: number;
  baseExcess: number;
  crossmatch: boolean;
  ecg: string;
}

export interface ImagingData {
  axrCoffeeBeanSign: boolean;
  axrBentInnerTubeSign: boolean;
  axrFreeAir: boolean;
  axrColonicDilationCm: number;
  axrAirFluidLevels: boolean;
  axrHaustraPattern: 'haustra' | 'valvulae' | 'absent';
  ctTransitionPoint: boolean;
  ctTransitionLevel: string;
  ctMesentericSwirl: boolean;
  ctBirdBeakSign: boolean;
  ctAppleCoreLesion: boolean;
  ctColonicWallThickening: boolean;
  ctPneumatosis: boolean;
  ctPortalVenousGas: boolean;
  ctFreeFluid: boolean;
  ctFreeAir: boolean;
  ctTargetLesion: boolean;
  ctCecalDilationCm: number;
}

export interface LboFullRecord extends LboRecordMeta {
  clinicalFacts: LboClinicalFacts;
  engineInput: LboPatientData;
  engineOutput?: LboApiOutput;
  documents: {
    clerkingPdf: string;
    operativeNotePdf?: string;
    dischargePdf?: string;
  };
  timeline: ClinicalEvent[];
}

export interface ClinicalEvent {
  timestamp: string;
  phase: string;
  action: string;
  details: string;
  user: string;
}

function generateId(): string {
  return `LBO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getRecords(): LboFullRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecords(records: LboFullRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save LBO records:', e);
  }
}

export function createRecord(meta: Partial<LboRecordMeta>): LboFullRecord {
  const now = new Date().toISOString();
  const record: LboFullRecord = {
    id: generateId(),
    patientName: meta.patientName || 'Unknown',
    mrn: meta.mrn || 'N/A',
    age: meta.age || 0,
    encounterDate: now,
    encounterType: meta.encounterType || 'emergency',
    status: 'active',
    lastModified: now,
    clinicalFacts: {
      registration: {
        patientName: '', mrn: '', age: 0, sex: 'male',
        encounterDate: now, encounterType: 'emergency',
        referringFacility: '', consultant: '', ward: '', bed: '',
        surgeon: '', bloodGroup: '', allergies: [], anticoagulants: [],
        previousSurgery: '',
      },
      history: {
        presentingComplaint: '', complaintDuration: '', complaintSeverity: 5,
        hpiOnset: '', hpiDuration: '', hpiProgression: '',
        hpiPainCharacter: '', hpiPainLocation: '', hpiPainRadiation: '',
        hpiAssociatedVomiting: false, hpiVomitingFrequency: '', hpiVomitContent: '',
        hpiFlatusStatus: 'unknown', hpiBowelStatus: 'open', hpiLastBowelDays: 0,
        hpiWeightLoss: false, hpiWeightLossAmount: '', hpiBleeding: false,
        hpiBleedingType: '', hpiPreviousEpisodes: false,
        deniesNausea: false, deniesVomiting: false, deniesFever: false,
        deniesWeightLoss: false, deniesRectalBleeding: false,
        deniesPreviousEpisodes: false, deniesAbdominalSurgery: false,
        deniesChronicConstipation: false, deniesFamilyHistoryCRC: false,
        deniesSmoking: false, deniesAlcohol: false, deniesAnticoagulants: false,
        deniesSteroids: false, deniesNSAIDs: false,
        pmh: '', surgicalHistory: '', drugHistory: '', allergies_text: '',
        familyHistory: '', socialHistory: '',
        rosFever: false, rosWeightLoss: false, rosNightSweats: false, rosFatigue: false,
        rosNausea: false, rosDysphagia: false, rosEarlySatiety: false,
        rosAbdominalPain: false, rosChangeBowelHabit: false,
        rosPalpitations: false,
        rosUrinarySymptoms: false, rosChestPain: false, rosDyspnoea: false,
        rosCough: false, rosHeadache: false, rosDizziness: false,
        rosSyncope: false, rosRash: false, rosJointPain: false, rosBackPain: false,
        contextAtOnset: '', firstSensation: '', functionalImpact: '',
        eatingImpact: 'normal', sleepImpact: 'normal', workCapacity: 'normal',
        painEvolution: { hasBecomeContinuous: false, hasGeneralized: false, severityInitial: 5, severityCurrent: 5, worseWithMovement: false, betterWithPosition: false },
        distensionEvolution: { progressionRate: 'slow_days', affectingBreathing: false, painWithDistension: false, distensionRelievedByVomiting: false },
        vomitingEvolution: { contentProgression: [], contentCurrent: 'food', nauseaBeforeVomiting: false, vomitingRelievesPain: false, frequencyIncreasing: false },
        bowelFunction: { lastNormalStoolDays: 0, lastStoolDays: 0, lastFlatusDays: 0, stoolCaliberReduced: false, alternatingConstipationDiarrhea: false, progressiveConstipationMonths: false, straining: false, incompleteEvacuation: false },
        ischemiaPerforation: { painNowConstant: false, painWorseThanBefore: false, fever: false, rigors: false, confusion: false, reducedUrine: false, unableToStand: false, severeWeakness: false, tachycardia: false, hypotension: false },
        cancerScreening: { weightLoss: false, weightLossAmount: '', appetiteLoss: false, bloodPerRectum: false, pencilStools: false, progressiveConstipation: false, familyHistoryCRC: false },
        volvulusRisk: { previousAttacks: false, chronicConstipation: false, highFiberDiet: false, psychiatricDisease: false, parkinsons: false, institutionalized: false },
        dehydrationRenal: { thirst: false, dryMouth: false, dizziness: false, reducedUrine: false, darkUrine: false, syncope: false },
      },
      exam: {
        vitals: { heartRate: 80, systolicBP: 120, diastolicBP: 80, temperature: 37.0, respiratoryRate: 16, spO2: 98, gcs: 15 },
        generalAppearance: '', hydrationStatus: '', distressLevel: '',
        systemic: {
          cvs: { jvp: '', heartSounds: '', murmurs: '', peripheralOedema: 'none', capillaryRefill: '', peripheralPulses: '' },
          respiratory: { chestWall: '', breathSounds: '', addedSounds: '', percussion: '', accessoryMuscleUse: false },
          cns: { alertness: 'alert', gcs: 15, power: '', sensation: '', speech: '' },
          msk: { spineTenderness: false, jointSwelling: '', deformity: '', mobility: 'independent' },
        },
        abdominalInspection: '', distensionSeverity: 'none', abdominalMass: false,
        scars: '', hernialOrifices: '', abdominalTenderness: 'none',
        tendernessLocation: '', peritonism: false, guarding: false, rigidity: false,
        reboundTenderness: false, percussionTympanic: false, percussionDull: false,
        bowelSounds: 'normal', drePerformed: false, dreFinding: '',
        dreStoolColour: '', dreMass: false, dreBlood: false,
      },
      investigations: {
        wbc: 0, hemoglobin: 0, platelets: 0, neutrophils: 0,
        crp: 0, lactate: 0, sodium: 0, potassium: 0,
        creatinine: 0, urea: 0, glucose: 0, bicarbonate: 0,
        gcs: 15, ph: 7.4, baseExcess: 0,
        crossmatch: false, ecg: '',
      },
      imaging: {
        axrCoffeeBeanSign: false, axrBentInnerTubeSign: false, axrFreeAir: false,
        axrColonicDilationCm: 0, axrAirFluidLevels: false, axrHaustraPattern: 'haustra',
        ctTransitionPoint: false, ctTransitionLevel: 'none',
        ctMesentericSwirl: false, ctBirdBeakSign: false, ctAppleCoreLesion: false,
        ctColonicWallThickening: false, ctPneumatosis: false, ctPortalVenousGas: false,
        ctFreeFluid: false, ctFreeAir: false, ctTargetLesion: false, ctCecalDilationCm: 0,
      },
    },
    engineInput: {
      age: 0, comorbidities: [], patientStable: true,
      vitals: { heartRate: undefined, systolicBP: undefined, temperature: undefined, respiratoryRate: undefined, spO2: undefined },
      labs: { wbc: undefined, lactate: undefined, crp: undefined, creatinine: undefined },
      exam: {
        distensionSeverity: 'none', constipationDays: 0, painConstant: false,
        vomiting: false, previousEpisodes: false,
        peritonism: false, guarding: false, rigidity: false,
        absentBowelSounds: false, massPalpable: false,
      },
    },
    documents: { clerkingPdf: '' },
    timeline: [{ timestamp: now, phase: 'registration', action: 'Record created', details: 'New LBO encounter started', user: 'system' }],
  };

  const records = getRecords();
  records.push(record);
  saveRecords(records);
  setActiveRecordId(record.id);
  return record;
}

export function updateRecord(id: string, updates: Partial<LboFullRecord>): LboFullRecord | null {
  const records = getRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...updates, lastModified: new Date().toISOString() };
  saveRecords(records);
  return records[idx];
}

export function getRecord(id: string): LboFullRecord | null {
  return getRecords().find(r => r.id === id) || null;
}

export function getAllRecords(): LboFullRecord[] {
  return getRecords().sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter(r => r.id !== id);
  saveRecords(records);
  const activeId = getActiveRecordId();
  if (activeId === id) localStorage.removeItem(ACTIVE_KEY);
}

export function setActiveRecordId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function getActiveRecordId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function addTimelineEvent(id: string, phase: string, action: string, details: string, user = 'clinician'): LboFullRecord | null {
  const record = getRecord(id);
  if (!record) return null;
  const event: ClinicalEvent = {
    timestamp: new Date().toISOString(),
    phase, action, details, user,
  };
  return updateRecord(id, { timeline: [...record.timeline, event] });
}

// ── Multi-Stream Syndrome Synthesis ───────────────────────────────────────────
// Converts flat history fields to independent symptom streams, each with
// its own temporal profile (onset, duration, progression).

let streamCounter = 0;
function nextStreamId(): string { return `ss_${++streamCounter}_${Date.now().toString(36)}`; }

const ROLE_PRIORITY: Record<string, number> = {
  first: 0, dominant: 1, progressive: 2, secondary: 3, late: 4, complication: 5,
};

function inferRole(streams: { type: string; present: boolean }[], newType: string): StreamRole {
  const existingPresent = streams.filter(s => s.present && s.type !== newType);
  if (existingPresent.length === 0) return 'first';
  const painExists = streams.some(s => s.type === 'pain' && s.present);
  const dominant = (t: string) => t === 'pain' ? 'dominant' : 'progressive';
  if (!painExists && newType === 'pain') return 'first';
  if (newType === 'fever' || newType === 'weight_loss' || newType === 'bleeding') return 'complication';
  if (newType === 'vomiting') return existingPresent.length <= 1 ? 'secondary' : 'late';
  if (newType === 'constipation' || newType === 'flatus_loss') return 'late';
  return 'progressive';
}

function inferOnsetDay(streams: { type: string }[], newType: string, h?: HistoryData): number {
  if (newType === 'pain') return 1;
  if (newType === 'distension') return 1;
  if (newType === 'vomiting') return 2;
  if (newType === 'constipation' || newType === 'flatus_loss') return 3;
  if (newType === 'fever' || newType === 'bleeding') return 3;
  return 0;
}

export function synthesizeStreamsFromHistory(history: HistoryData): SymptomStream[] {
  const streams: SymptomStream[] = [];
  const h = history;

  // Pain stream
  if (h.hpiPainCharacter || h.hpiPainLocation || h.hpiOnset || h.hpiProgression) {
    streams.push({
      id: nextStreamId(),
      type: 'pain', label: 'Abdominal pain', present: true,
      onset_day: 1, role: 'first',
      onset_speed: (h.hpiOnset as any) || undefined,
      duration: h.hpiDuration || h.complaintDuration || undefined,
      progression: (h.hpiProgression as any) || undefined,
      character: (h.hpiPainCharacter as any) || undefined,
      location: h.hpiPainLocation || undefined,
      radiation: h.hpiPainRadiation || undefined,
      severity: h.complaintSeverity || undefined,
    });
  }

  // Vomiting stream
  if (h.hpiAssociatedVomiting || h.deniesVomiting || h.deniesNausea) {
    streams.push({
      id: nextStreamId(),
      type: 'vomiting', label: 'Vomiting',
      present: h.hpiAssociatedVomiting,
      denied: !h.hpiAssociatedVomiting && (h.deniesVomiting || h.deniesNausea) || undefined,
      onset_day: 2, role: 'secondary',
      frequency: h.hpiVomitingFrequency || undefined,
      content: (h.hpiVomitContent as any) || undefined,
    });
  }

  // Constipation stream
  if (h.hpiBowelStatus !== 'open' || h.hpiLastBowelDays > 0) {
    streams.push({
      id: nextStreamId(),
      type: 'constipation', label: 'Constipation',
      present: h.hpiBowelStatus !== 'open',
      onset_day: 3, role: 'late',
      lastBowelDays: h.hpiLastBowelDays || undefined,
    });
  }

  // Flatus loss stream
  if (h.hpiFlatusStatus !== 'unknown') {
    streams.push({
      id: nextStreamId(),
      type: 'flatus_loss', label: 'Flatus loss',
      present: h.hpiFlatusStatus === 'not_passing',
      onset_day: 3, role: 'late',
      flatusStatus: h.hpiFlatusStatus,
    });
  }

  // Weight loss stream
  if (h.hpiWeightLoss || h.deniesWeightLoss) {
    streams.push({
      id: nextStreamId(),
      type: 'weight_loss', label: 'Weight loss',
      present: h.hpiWeightLoss,
      denied: h.deniesWeightLoss && !h.hpiWeightLoss || undefined,
      onset_day: 0, role: 'complication',
      weightLossAmount: h.hpiWeightLossAmount || undefined,
    });
  }

  // Rectal bleeding stream
  if (h.hpiBleeding || h.deniesRectalBleeding) {
    streams.push({
      id: nextStreamId(),
      type: 'bleeding', label: 'Rectal bleeding',
      present: h.hpiBleeding,
      denied: h.deniesRectalBleeding && !h.hpiBleeding || undefined,
      onset_day: 3, role: 'complication',
      bleedingType: (h.hpiBleedingType as any) || undefined,
    });
  }

  // Fever stream
  if (h.rosFever || h.deniesFever) {
    streams.push({
      id: nextStreamId(),
      type: 'fever', label: 'Fever',
      present: h.rosFever,
      denied: h.deniesFever && !h.rosFever || undefined,
      onset_day: 3, role: 'complication',
    });
  }

  // Nausea stream
  if (h.deniesNausea || h.rosNausea) {
    if (!streams.some(s => s.type === 'vomiting' && s.present)) {
      streams.push({
        id: nextStreamId(),
        type: 'nausea', label: 'Nausea',
        present: h.rosNausea,
        denied: h.deniesNausea && !h.rosNausea || undefined,
        onset_day: 2, role: 'secondary',
      });
    }
  }

  // Previous episodes stream
  if (h.hpiPreviousEpisodes || h.deniesPreviousEpisodes) {
    streams.push({
      id: nextStreamId(),
      type: 'previous_episodes', label: 'Previous episodes',
      present: h.hpiPreviousEpisodes,
      denied: h.deniesPreviousEpisodes && !h.hpiPreviousEpisodes || undefined,
      onset_day: 0, role: 'complication',
    });
  }

  return streams;
}

export function syncHistoryFromStreams(history: HistoryData, streams: SymptomStream[]): HistoryData {
  const out = { ...history, symptomStreams: streams };

  // Reset dependent fields
  out.hpiOnset = '';
  out.hpiDuration = '';
  out.hpiProgression = '';
  out.hpiPainCharacter = '';
  out.hpiPainLocation = '';
  out.hpiPainRadiation = '';
  out.hpiAssociatedVomiting = false;
  out.hpiVomitingFrequency = '';
  out.hpiVomitContent = '';
  out.hpiFlatusStatus = 'unknown';
  out.hpiBowelStatus = 'open';
  out.hpiLastBowelDays = 0;
  out.hpiWeightLoss = false;
  out.hpiWeightLossAmount = '';
  out.hpiBleeding = false;
  out.hpiBleedingType = '';
  out.hpiPreviousEpisodes = false;
  out.deniesNausea = false;
  out.deniesVomiting = false;
  out.deniesFever = false;
  out.deniesWeightLoss = false;
  out.deniesRectalBleeding = false;
  out.deniesPreviousEpisodes = false;
  out.rosFever = false;
  out.rosNausea = false;

  for (const s of streams) {
    if (s.type === 'pain' && s.present) {
      if (s.onset_speed) out.hpiOnset = s.onset_speed;
      if (s.duration) out.hpiDuration = s.duration;
      if (s.progression) out.hpiProgression = s.progression;
      if (s.character) out.hpiPainCharacter = s.character;
      if (s.location) out.hpiPainLocation = s.location;
      if (s.radiation) out.hpiPainRadiation = s.radiation;
      if (s.severity) out.complaintSeverity = s.severity;
    }
    if (s.type === 'vomiting') {
      out.hpiAssociatedVomiting = s.present;
      if (s.frequency) out.hpiVomitingFrequency = s.frequency;
      if (s.content) out.hpiVomitContent = s.content;
      if (s.denied) out.deniesVomiting = true;
    }
    if (s.type === 'nausea') {
      if (s.present) out.rosNausea = true;
      if (s.denied) out.deniesNausea = true;
    }
    if (s.type === 'constipation') {
      if (s.present) out.hpiBowelStatus = 'constipated';
      if (s.lastBowelDays !== undefined) out.hpiLastBowelDays = s.lastBowelDays;
    }
    if (s.type === 'flatus_loss') {
      out.hpiFlatusStatus = s.flatusStatus || 'unknown';
    }
    if (s.type === 'weight_loss') {
      out.hpiWeightLoss = s.present;
      if (s.weightLossAmount) out.hpiWeightLossAmount = s.weightLossAmount;
      if (s.denied) out.deniesWeightLoss = true;
    }
    if (s.type === 'bleeding') {
      out.hpiBleeding = s.present;
      if (s.bleedingType) out.hpiBleedingType = s.bleedingType;
      if (s.denied) out.deniesRectalBleeding = true;
    }
    if (s.type === 'fever') {
      out.rosFever = s.present;
      if (s.denied) out.deniesFever = true;
    }
    if (s.type === 'previous_episodes') {
      out.hpiPreviousEpisodes = s.present;
      if (s.denied) out.deniesPreviousEpisodes = true;
    }
  }

  // If absolute constipation is indicated by both constipation + flatus not passing
  if (out.hpiBowelStatus === 'constipated' && out.hpiFlatusStatus === 'not_passing') {
    out.hpiBowelStatus = 'absolute_constipation';
  }

  return out;
}

export function buildEngineInput(facts: LboClinicalFacts): LboPatientData {
  const e = facts.exam;
  const v = e.vitals;
  const i = facts.investigations;
  const img = facts.imaging;
  const reg = facts.registration;
  const hist = facts.history;
  return {
    age: reg.age || 0,
    comorbidities: [],
    patientStable: !(e.peritonism || e.rigidity || e.distensionSeverity === 'severe'),
    vitals: {
      heartRate: v.heartRate || undefined,
      systolicBP: v.systolicBP || undefined,
      temperature: v.temperature || undefined,
      respiratoryRate: v.respiratoryRate || undefined,
      spO2: v.spO2 || undefined,
    },
    labs: {
      wbc: i.wbc || undefined,
      lactate: i.lactate || undefined,
      crp: i.crp || undefined,
      creatinine: i.creatinine || undefined,
    },
    exam: {
      distensionSeverity: e.distensionSeverity,
      constipationDays: hist.hpiLastBowelDays,
      painConstant: hist.hpiPainCharacter === 'constant',
      vomiting: hist.hpiAssociatedVomiting,
      previousEpisodes: hist.hpiPreviousEpisodes,
      peritonism: e.peritonism,
      guarding: e.guarding,
      rigidity: e.rigidity,
      absentBowelSounds: e.bowelSounds === 'absent',
      massPalpable: e.abdominalMass,
    },
    axrFindings: {
      coffeeBeanSign: img.axrCoffeeBeanSign,
      bentInnerTubeSign: img.axrBentInnerTubeSign,
      freeAir: img.axrFreeAir,
      colonicDilationCm: img.axrColonicDilationCm,
      airFluidLevels: img.axrAirFluidLevels,
      haustraPattern: img.axrHaustraPattern,
    },
    ctFindings: {
      transitionPoint: img.ctTransitionPoint,
      transitionLevel: img.ctTransitionLevel as any,
      mesentericSwirl: img.ctMesentericSwirl,
      birdBeakSign: img.ctBirdBeakSign,
      appleCoreLesion: img.ctAppleCoreLesion,
      colonicWallThickening: img.ctColonicWallThickening,
      pneumatosis: img.ctPneumatosis,
      portalVenousGas: img.ctPortalVenousGas,
      freeFluid: img.ctFreeFluid,
      freeAir: img.ctFreeAir,
      targetLesion: img.ctTargetLesion,
      cecalDilationCm: img.ctCecalDilationCm,
    },
  };
}
