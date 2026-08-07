// AMEXAN Facility Administration — Structure, Branding, Subscription & Compliance
// persistence. Kept separate from the constitutional FacilityAdminModel so the
// pure engine stays untouched while every COO setting is stored per-organization.

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';

export type StructureEntryKind = 'departments' | 'units' | 'wards' | 'clinics' | 'theatres' | 'laboratories' | 'pharmacies';

export interface StructureEntry {
  id: string;
  kind: StructureEntryKind;
  name: string;
  parentId?: string;
  active: boolean;
  createdAt: number;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  fontFamily: string;
  headerTemplate: string;
  disclaimer: string;
}

export interface SubscriptionConfig {
  tier: string;
  status: string;
  seats: number;
  renewedAt: number;
  expiresAt: number;
}

export interface ComplianceConfig {
  licenseNumber: string;
  licenseStatus: string;
  accreditation: string;
  regulatoryBody: string;
  insurance: string;
  infectionControl: boolean;
  qualityAssurance: boolean;
  clinicalGovernance: boolean;
}

export interface DisasterRecoveryConfig {
  backupEnabled: boolean;
  backupFrequencyHours: number;
  failoverEnabled: boolean;
  downtimeMode: boolean;
  lastBackupAt: number;
  recoveryTestingAt: number;
}

// ── Hospital Identity, Governance & Experience Engine (Engine XII) ─────────────
// This engine defines who the hospital is. Everything AMEXAN generates inherits
// its branding, legal identity, signatures, compliance and communication policy
// from this single constitutional configuration.

export type HospitalOwnership =
  | 'private' | 'government' | 'faith_based' | 'county' | 'national' | 'university';

export interface HospitalIdentity {
  officialName: string;
  shortName: string;
  legalName: string;
  tradingName: string;
  motto: string;
  mission: string;
  vision: string;
  coreValues: string[];
  hospitalLevel: string;
  ownership: HospitalOwnership;
  established: string;
  registrationNumber: string;
  taxPin: string;
  postalAddress: string;
  physicalAddress: string;
  gpsCoordinates: string;
  website: string;
  primaryEmail: string;
  emergencyContacts: string;
}

export interface BrandThemeStyle {
  id: string;
  name: string;
  light: boolean;
  dark: boolean;
  executive: boolean;
  clinical: boolean;
  patient: boolean;
  emergency: boolean;
  pediatrics: boolean;
  cancer: boolean;
  mentalHealth: boolean;
}

export interface BrandKit {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  warning: string;
  success: string;
  neutral: string;
  themes: BrandThemeStyle[];
  logo: { primary?: string; white?: string; dark?: string; horizontal?: string; vertical?: string; stamp?: string; seal?: string; favicon?: string; appIcon?: string };
  fonts: { primary: string; secondary: string; clinical: string; reports: string; website: string };
  headerTemplate: string;
  disclaimer: string;
}

export interface ExecutiveSignatory {
  id: string;
  title: string;
  name: string;
  qualifications: string;
  signatureUrl: string;
  stampUrl: string;
  digitalSignature: boolean;
  certificate: string;
}

export interface DocumentTemplateConfig {
  id: string;
  name: string;
  enabled: boolean;
  autoSignatories: string[];
  updatedAt: number;
}

export interface CommunicationIdentity {
  emailDomain: string;
  smsSenderId: string;
  whatsapp: string;
  telegram: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  website: string;
  patientPortal: string;
  staffPortal: string;
  mobileApp: string;
  emergencyHotline: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'approved' | 'active';
  updatedAt: number;
}

export interface PublicWebsiteConfig {
  enabled: boolean;
  theme: string;
  sections: { id: string; name: string; enabled: boolean }[];
}

export interface ExperienceTemplate {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  active: boolean;
}

export interface ComplianceItem {
  id: string;
  name: string;
  reference?: string;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  expiresAt?: number;
}

export interface AnalyticsGauge {
  id: string;
  label: string;
  value: number;
  unit?: string;
}

export interface FacilityAdminSettings {
  structure: StructureEntry[];
  branding: BrandingConfig;
  subscription: SubscriptionConfig & { users: number; seats: number; storageGb: number; aiCredits: number; apiCalls: number; modules: string[]; renewal: string };
  compliance: ComplianceConfig & { complianceItems: ComplianceItem[] };
  disasterRecovery: DisasterRecoveryConfig & { realtimeReplication: boolean; geoBackup: boolean; recoveryPointObjective: string; recoveryTimeObjective: string; offlineMode: boolean; disasterTestingEnabled: boolean };

  // Engine XII — Hospital Identity & Experience
  identity: HospitalIdentity;
  brandKit: BrandKit;
  signatories: ExecutiveSignatory[];
  executiveDocumentRules: { document: string; signatories: string[] }[];
  documentTemplates: DocumentTemplateConfig[];
  communicationIdentity: CommunicationIdentity;
  hospitalStamp: { officialStamp: boolean; roundSeal: boolean; drySeal: boolean; digitalSeal: boolean; qrVerification: boolean };
  legalDocuments: LegalDocument[];
  publicWebsite: PublicWebsiteConfig;
  patientExperience: ExperienceTemplate[];
  staffExperience: ExperienceTemplate[];
  analytics: AnalyticsGauge[];
  updatedAt: number;
}

const DEMO_THEMES: BrandThemeStyle[] = [
  { id: 'default', name: 'Default 24', light: true, dark: false, executive: false, clinical: false, patient: false, emergency: false, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'light', name: 'Light', light: true, dark: false, executive: false, clinical: false, patient: false, emergency: false, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'dark', name: 'Dark', light: false, dark: true, executive: false, clinical: false, patient: false, emergency: false, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'executive', name: 'Executive', light: true, dark: false, executive: true, clinical: false, patient: false, emergency: false, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'clinical', name: 'Clinical', light: true, dark: false, executive: false, clinical: true, patient: false, emergency: false, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'patient', name: 'Patient', light: true, dark: false, executive: false, clinical: false, patient: true, emergency: false, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'emergency', name: 'Emergency', light: true, dark: false, executive: false, clinical: false, patient: false, emergency: true, pediatrics: false, cancer: false, mentalHealth: false },
  { id: 'pediatrics', name: 'Pediatics', light: true, dark: false, executive: false, clinical: false, patient: false, emergency: false, pediatrics: true, cancer: false, mentalHealth: false },
  { id: 'cancer', name: 'Cancer', light: true, dark: false, executive: false, clinical: false, patient: false, emergency: false, pediatrics: false, cancer: true, mentalHealth: false },
  { id: 'mental-health', name: 'Mental Health', light: true, dark: false, executive: false, clinical: false, patient: false, emergency: false, pediatrics: false, cancer: false, mentalHealth: true },
];

const DOCUMENT_CATALOG: { id: string; name: string }[] = [
  { id: 'prescription', name: 'Prescription' },
  { id: 'laboratory', name: 'Laboratory' },
  { id: 'radiology', name: 'Radiology' },
  { id: 'admission', name: 'Admission' },
  { id: 'discharge', name: 'Discharge Summary' },
  { id: 'referral', name: 'Referral Letter' },
  { id: 'death', name: 'Death Certificate' },
  { id: 'birth', name: 'Birth Notification' },
  { id: 'invoice', name: 'Invoice' },
  { id: 'receipt', name: 'Receipt' },
  { id: 'employment', name: 'Employment Letter' },
  { id: 'purchase-order', name: 'Purchase Order' },
  { id: 'consent', name: 'Consent Form' },
  { id: 'certificate', name: 'Certificate' },
];

const LEGAL_DOCUMENT_DEFAULTS: LegalDocument[] = [
  'Privacy Notice', 'Patient Rights', 'Terms of Service', 'Consent Templates',
  'Research Consent', 'Surgery Consent', 'Anaesthesia Consent', 'Blood Transfusion Consent',
  'Telemedicine Consent', 'Photography Consent', 'Genetics Consent', 'AI Usage Notice',
].map((name, i) => ({ id: `legal-${i}`, name, version: '1.0', status: 'active', updatedAt: Date.now() }));

const BUSINESS_CHANNEL_DEFAULTS: CommunicationIdentity = {
  emailDomain: 'hospital.example.org', smsSenderId: 'AMEXAN', whatsapp: '', telegram: '',
  facebook: '', twitter: '', instagram: '', linkedin: '', website: 'hospital.example.org',
  patientPortal: 'portal.example.org', staffPortal: 'staff.example.org', mobileApp: 'AMEXAN App', emergencyHotline: '+254 700 000 000',
};

const DEFAULT_SETTINGS_NEW_ONLY = {
  identity: {
    officialName: 'AMEXAN University Teaching Hospital',
    shortName: 'AMEXAN',
    legalName: 'AMEXAN University Teaching Hospital',
    tradingName: 'AMEXAN Health',
    motto: 'Care that never sleeps',
    mission: 'Deliver safe, dignified, evidence-based care to every patient who arrives.',
    vision: 'A hospital where no clinical decision is made alone.',
    coreValues: ['Safety', 'Excellence', 'Dignity', 'Integrity', 'Innovation', 'Equity'],
    hospitalLevel: 'Level 6',
    ownership: 'university' as HospitalOwnership,
    established: '2015',
    registrationNumber: 'HMIS/FH/2024/01847',
    taxPin: 'P051784221X',
    postalAddress: 'P.O. Box 1800-00100, Nairobi',
    physicalAddress: 'Ngong Road, Nairobi',
    gpsCoordinates: '-1.286389, 36.817223',
    website: 'https://hospital.example.org',
    primaryEmail: 'info@hospital.example.org',
    emergencyContacts: 'Emergency: 0800 720 720\nAccidents: 0800 720 721',
  },
  brandKit: {
    primary: '#0ea5e9',
    secondary: '#0369a1',
    accent: '#8b5cf6',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    neutral: '#64748b',
    themes: DEMO_THEMES,
    logo: {},
    fonts: { primary: 'Inter', secondary: 'Noto Sans', clinical: 'Inter', reports: 'Inter', website: 'Inter' },
    headerTemplate: '--- {facility} ---',
    disclaimer: 'This document contains confidential patient information protected by law.',
  },
  signatories: [
    { id: 'ceo', title: 'Chief Executive Officer', name: 'Dr. A. Mwangi', qualifications: 'MBA, FRS(PH)', signatureUrl: '', stampUrl: '', digitalSignature: true, certificate: 'CEO-2024' },
    { id: 'medical-director', title: 'Medical Director', name: 'Dr. N. Otieno', qualifications: 'MMed, FCS', signatureUrl: '', stampUrl: '', digitalSignature: true, certificate: 'MD-2024' },
    { id: 'hospital-admin', title: 'Hospital Administrator', name: 'B. Wanjiku', qualifications: 'MBA, HA', signatureUrl: '', stampUrl: '', digitalSignature: true, certificate: 'HA-2024' },
    { id: 'nursing', title: 'Director of Nursing', name: 'Sr. J. Achieng', qualifications: 'MSc Nursing', signatureUrl: '', stampUrl: '', digitalSignature: true, certificate: 'DN-2024' },
    { id: 'finance', title: 'Finance Director', name: 'G. Kipchoge', qualifications: 'CPA, MBA', signatureUrl: '', stampUrl: '', digitalSignature: true, certificate: 'FIN-2024' },
  ] ,
  executiveDocumentRules: [
    { document: 'Prescription', signatories: ['Treating Doctor'] },
    { document: 'Discharge Summary', signatories: ['Consultant', 'Medical Officer'] },
    { document: 'Employment Letter', signatories: ['CEO', 'Head HR'] },
    { document: 'Purchase Order', signatories: ['Finance Director', 'CEO'] },
    { document: 'Birth Notification', signatories: ['Attending Midwife'] },
    { document: 'Death Certificate', signatories: ['Medical Officer', 'Hospital Administrator'] },
  ],
  documentTemplates: DOCUMENT_CATALOG.map((d) => ({ id: d.id, name: d.name, enabled: true, autoSignatories: [], updatedAt: Date.now() })),
  communicationIdentity: BUSINESS_CHANNEL_DEFAULTS,
  hospitalStamp: { officialStamp: true, roundSeal: true, drySeal: false, digitalSeal: true, qrVerification: true },
  legalDocuments: LEGAL_DOCUMENT_DEFAULTS,
  publicWebsite: {
    enabled: true,
    theme: 'default',
    sections: [
      { id: 'homepage', name: 'Homepage', enabled: true },
      { id: 'departments', name: 'Departments', enabled: true },
      { id: 'doctors', name: 'Doctors', enabled: true },
      { id: 'appointments', name: 'Appointments', enabled: true },
      { id: 'careers', name: 'Careers', enabled: true },
      { id: 'news', name: 'News', enabled: true },
      { id: 'events', name: 'Events', enabled: true },
      { id: 'contact', name: 'Contact', enabled: true },
      { id: 'emergency', name: 'Emergency', enabled: true },
    ],
  },
  patientExperience: [
    { id: 'appointment', name: 'Appointment Reminder', channel: 'SMS', subject: 'Your appointment', body: 'Dear {patient}, your appointment is confirmed for {date} at {time} at {clinic}. — {facility}', active: true },
    { id: 'admission', name: 'Admission Message', channel: 'SMS', subject: 'Admission', body: 'Dear {patient}, you have been admitted under Dr. {doctor}. Ward {ward}.', active: true },
    { id: 'discharge', name: 'Discharge Message', channel: 'SMS', subject: 'Discharged', body: 'Dear {patient}, thank you for choosing {facility}. {dischargeInstructions}', active: true },
    { id: 'birthday', name: 'Birthday Wishes', channel: 'SMS', subject: 'Birthday', body: 'Happy birthday {name}! Stay healthy with {facility}.', active: false },
    { id: 'followup', name: 'Follow-up Message', channel: 'SMS', subject: 'Follow-up', body: 'Dear {patient}, a reminder to attend your follow-up review on {date}.', active: true },
    { id: 'medication', name: 'Medication Reminder', channel: 'SMS', subject: 'Medication', body: 'Reminder: take {medication} at {time}. {facility}', active: true },
    { id: 'vaccination', name: 'Vaccination Reminder', channel: 'SMS', subject: 'Vaccination', body: 'Dear {parent}, {child} is due for {vaccine} on {date}.', active: true },
  ],
  staffExperience: [
    { id: 'welcome', name: 'Welcome Message', channel: 'Email', subject: 'Welcome', body: 'Welcome to {facility}! Your onboarding begins {date}.', active: true },
    { id: 'onboarding', name: 'Onboarding', channel: 'Email', subject: 'Onboarding', body: 'Complete your onboarding checklist at {portal}.', active: true },
    { id: 'birthday', name: 'Birthday', channel: 'Email', subject: 'Happy Birthday', body: 'Happy birthday {name}! From your {facility} family.', active: true },
    { id: 'recognition', name: 'Recognition', channel: 'Email', subject: 'You were recognised', body: 'You were recognised by {colleague}: {note}', active: true },
    { id: 'training', name: 'Training / CME', channel: 'Email', subject: 'CME', body: 'New CME session available: {course}.', active: true },
  ],
  analytics: [
    { id: 'doc-downloads', label: 'Document Downloads', value: 2148 },
    { id: 'most-printed', label: 'Most Printed', value: 62, unit: 'Prescription' },
    { id: 'most-signed', label: 'Most Signed', value: 41, unit: 'Discharge' },
    { id: 'patient-satisfaction', label: 'Patient Satisfaction', value: 87, unit: '%' },
    { id: 'website-traffic', label: 'Website Traffic', value: 12840 },
    { id: 'portal-usage', label: 'Portal Usage', value: 3921 },
    { id: 'email-delivery', label: 'Email Delivery', value: 98, unit: '%' },
    { id: 'sms-delivery', label: 'SMS Delivery', value: 97, unit: '%' },
  ],
};

const DEFAULT_SETTINGS: Omit<FacilityAdminSettings, 'updatedAt' | 'structure'> = {
  branding: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#0369a1',
    logoUrl: '',
    fontFamily: 'Inter',
    headerTemplate: '--- {facility} ---',
    disclaimer: 'This document contains confidential patient information.',
  },
  subscription: {
    tier: 'enterprise',
    status: 'active',
    seats: 500,
    renewedAt: Date.now(),
    expiresAt: Date.now() + 365 * 86400000,
    users: 412,
    storageGb: 2048,
    aiCredits: 125000,
    apiCalls: 840000,
    modules: ['EMR', 'LIS', 'PACS', 'ICU', 'Pharmacy', 'Billing'],
    renewal: 'Renews 12/06/2026',
  },
  compliance: {
    licenseNumber: '',
    licenseStatus: 'pending',
    accreditation: '',
    regulatoryBody: 'MOH',
    insurance: '',
    infectionControl: true,
    qualityAssurance: true,
    clinicalGovernance: true,
    complianceItems: [
      { id: 'moh-license', name: 'MOH License', reference: 'MOH/F/2024/11874', status: 'active', expiresAt: Date.now() + 300 * 86400000 },
      { id: 'iso', name: 'ISO 9001', status: 'active' },
      { id: 'jci', name: 'JCI Accreditation', status: 'expiring', expiresAt: Date.now() - 10 * 86400000 },
      { id: 'safe-care', name: 'SafeCare', status: 'active' },
      { id: 'sha', name: 'SHA Provider', status: 'active' },
      { id: 'nhif', name: 'NHIF', status: 'active' },
      { id: 'radiation', name: 'Radiation License', status: 'expiring', expiresAt: Date.now() - 30 * 86400000 },
      { id: 'lab', name: 'Laboratory Accreditation', status: 'active' },
      { id: 'blood-bank', name: 'Blood Bank License', status: 'active' },
      { id: 'pharmacy', name: 'Pharmacy License', status: 'active' },
      { id: 'fire', name: 'Fire Certificate', status: 'expired', expiresAt: Date.now() - 60 * 86400000 },
      { id: 'occ-safety', name: 'Occupational Safety', status: 'pending' },
      { id: 'waste', name: 'Waste Management', status: 'active' },
      { id: 'bio-med', name: 'Biomedical', status: 'active' },
      { id: 'ethics', name: 'Research Ethics', status: 'active' },
      { id: 'moh-accredit', name: 'Hospital Accreditation', status: 'active' },
    ],
  },
  disasterRecovery: {
    backupEnabled: true,
    backupFrequencyHours: 24,
    failoverEnabled: true,
    downtimeMode: false,
    lastBackupAt: Date.now(),
    recoveryTestingAt: Date.now() - 30 * 86400000,
    realtimeReplication: true,
    geoBackup: true,
    recoveryPointObjective: 'Previous write · < 5 min',
    recoveryTimeObjective: '< 15 minutes',
    offlineMode: true,
    disasterTestingEnabled: true,
  },
  ...DEFAULT_SETTINGS_NEW_ONLY,
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Firestore call timed out after ${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

/** Deep-merge persisted settings over defaults so older documents render every
 *  section of the Hospital Identity Engine without losing stored values. */
function mergeWithDefaults(stored: any, defaults: any): any {
  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) && stored.length > 0) ? stored : defaults;
  }
  if (stored === undefined || stored === null || typeof stored !== 'object') return stored ?? defaults;
  const out: any = { ...stored };
  for (const key of Object.keys(defaults)) {
    const d = defaults[key];
    const s = stored[key];
    if (Array.isArray(d)) {
      if (Array.isArray(s) && s.length) out[key] = s;
      else out[key] = d;
    } else if (d && typeof d === 'object') {
      out[key] = mergeWithDefaults(s, d);
    } else {
      out[key] = s ?? d;
    }
  }
  return out;
}

export async function loadFacilityAdminSettings(orgId: string): Promise<FacilityAdminSettings> {
  const defaults: FacilityAdminSettings = { ...DEFAULT_SETTINGS, structure: [], updatedAt: Date.now() };
  const ref = doc(db, 'organizations', orgId, 'facility-admin-settings', 'current');

  // Fast path: persisted settings. On any error/timeout we fall through to defaults.
  try {
    const snap = await withTimeout(getDoc(ref), 8000);
    if (snap.exists()) return mergeWithDefaults(snap.data() as FacilityAdminSettings, defaults) as FacilityAdminSettings;
    const seeded = { ...defaults, updatedAt: Date.now() };
    await setDoc(ref, seeded).catch(() => {}); // non-fatal if rules block the write
    return seeded;
  } catch {
    return defaults;
  }
}

export async function saveFacilityAdminSettings(orgId: string, settings: FacilityAdminSettings): Promise<void> {
  const ref = doc(db, 'organizations', orgId, 'facility-admin-settings', 'current');
  await setDoc(ref, sanitizeForFirestore({ ...settings, updatedAt: Date.now() }));
}
