// AMEXAN Facility Administration — Structure, Branding, Subscription & Compliance
// persistence. Kept separate from the constitutional FacilityAdminModel so the
// pure engine stays untouched while every COO setting is stored per-organization.

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export interface FacilityAdminSettings {
  structure: StructureEntry[];
  branding: BrandingConfig;
  subscription: SubscriptionConfig;
  compliance: ComplianceConfig;
  disasterRecovery: DisasterRecoveryConfig;
  updatedAt: number;
}

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
    seats: 100,
    renewedAt: Date.now(),
    expiresAt: Date.now() + 365 * 86400000,
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
  },
  disasterRecovery: {
    backupEnabled: true,
    backupFrequencyHours: 24,
    failoverEnabled: true,
    downtimeMode: false,
    lastBackupAt: Date.now(),
    recoveryTestingAt: Date.now() - 30 * 86400000,
  },
};

export async function loadFacilityAdminSettings(orgId: string): Promise<FacilityAdminSettings> {
  const ref = doc(db, 'organizations', orgId, 'facility-admin-settings', 'current');
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as FacilityAdminSettings;
  const seeded = { ...DEFAULT_SETTINGS, structure: [], updatedAt: Date.now() };
  await setDoc(ref, seeded);
  return seeded;
}

export async function saveFacilityAdminSettings(orgId: string, settings: FacilityAdminSettings): Promise<void> {
  const ref = doc(db, 'organizations', orgId, 'facility-admin-settings', 'current');
  await setDoc(ref, { ...settings, updatedAt: Date.now() });
}
