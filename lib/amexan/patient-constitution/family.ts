import {
  type AmxpId,
  type LinkedAccount,
  type FamilyRelationship,
  type FamilyPermission,
  type PatientIdentity,
  type EmergencyContactPerson,
} from './types';
import { linkPatientAccount, unlinkPatientAccount, checkFamilyPermission } from './identity';

export function addFamilyMember(
  identity: PatientIdentity,
  params: {
    amxpId: AmxpId;
    relationship: FamilyRelationship;
    fullName: string;
    permissions?: FamilyPermission[];
  }
): PatientIdentity {
  const member: LinkedAccount = {
    amxpId: params.amxpId,
    relationship: params.relationship,
    fullName: params.fullName,
    permissions: params.permissions || getDefaultPermissionsForRelationship(params.relationship),
    linkedSince: Date.now(),
    isActive: true,
  };
  return linkPatientAccount(identity, member);
}

export function removeFamilyMember(
  identity: PatientIdentity,
  amxpId: AmxpId
): PatientIdentity {
  return unlinkPatientAccount(identity, amxpId);
}

export function getDefaultPermissionsForRelationship(
  relationship: FamilyRelationship
): FamilyPermission[] {
  const guardianPerms: FamilyPermission[] = [
    'view_appointments', 'view_medications', 'view_labs', 'view_imaging',
    'view_diagnoses', 'view_allergies', 'view_vitals', 'view_immunizations',
    'view_growth', 'book_appointments', 'receive_notifications', 'emergency_access',
  ];
  const parentPerms: FamilyPermission[] = [
    ...guardianPerms, 'full_access',
  ];
  const spousePerms: FamilyPermission[] = [
    'view_appointments', 'view_medications', 'view_labs', 'view_imaging',
    'book_appointments', 'receive_notifications', 'emergency_access',
  ];
  const childPerms: FamilyPermission[] = [
    'receive_notifications', 'emergency_access',
  ];
  const siblingPerms: FamilyPermission[] = [
    'receive_notifications', 'emergency_access',
  ];
  const emergencyPerms: FamilyPermission[] = [
    'emergency_access',
  ];

  switch (relationship) {
    case 'guardian': return guardianPerms;
    case 'mother': case 'father': case 'parent': return parentPerms;
    case 'spouse': case 'husband': case 'wife': return spousePerms;
    case 'son': case 'daughter': case 'child': return childPerms;
    case 'brother': case 'sister': case 'sibling': return siblingPerms;
    case 'emergency_contact': return emergencyPerms;
    default: return ['emergency_access', 'receive_notifications'];
  }
}

export const RELATIONSHIP_LABELS: Record<FamilyRelationship, string> = {
  self: 'Self',
  mother: 'Mother', father: 'Father', parent: 'Parent',
  son: 'Son', daughter: 'Daughter', child: 'Child',
  brother: 'Brother', sister: 'Sister', sibling: 'Sibling',
  grandmother: 'Grandmother', grandfather: 'Grandfather', grandparent: 'Grandparent',
  grandson: 'Grandson', granddaughter: 'Granddaughter', grandchild: 'Grandchild',
  aunt: 'Aunt', uncle: 'Uncle',
  nephew: 'Nephew', niece: 'Niece',
  cousin: 'Cousin',
  husband: 'Husband', wife: 'Wife', spouse: 'Spouse',
  guardian: 'Guardian', ward: 'Ward',
  dependent: 'Dependent',
  emergency_contact: 'Emergency Contact',
  other: 'Other',
};

export const PERMISSION_LABELS: Record<FamilyPermission, string> = {
  view_appointments: 'View Appointments',
  view_medications: 'View Medications',
  view_labs: 'View Lab Results',
  view_imaging: 'View Imaging Reports',
  view_diagnoses: 'View Diagnoses',
  view_allergies: 'View Allergies',
  view_vitals: 'View Vital Signs',
  view_immunizations: 'View Immunizations',
  view_growth: 'View Growth Charts',
  book_appointments: 'Book Appointments',
  receive_notifications: 'Receive Notifications',
  emergency_access: 'Emergency Access',
  full_access: 'Full Access',
};

export function canAccessPatientData(
  linkedAccounts: LinkedAccount[],
  accessorAmxpId: AmxpId,
  requiredPermission: FamilyPermission
): { allowed: boolean; reason?: string } {
  const isFullAccess = linkedAccounts.some(
    l => l.amxpId === accessorAmxpId && l.isActive && l.permissions.includes('full_access')
  );
  if (isFullAccess) return { allowed: true };

  const hasPermission = checkFamilyPermission(linkedAccounts, accessorAmxpId, requiredPermission);
  if (hasPermission) return { allowed: true };

  return {
    allowed: false,
    reason: `You do not have ${PERMISSION_LABELS[requiredPermission]} permission for this patient.`,
  };
}

export function getEmergencyContacts(identity: PatientIdentity): EmergencyContactPerson[] {
  const emergencyFromFamily: EmergencyContactPerson[] = identity.linkedAccounts
    .filter(l => l.isActive && l.permissions.includes('emergency_access'))
    .map(l => ({
      name: l.fullName,
      relationship: RELATIONSHIP_LABELS[l.relationship] || l.relationship,
      phone: '',
      email: undefined,
    }));

  if (identity.human.emergencyContact) {
    const exists = emergencyFromFamily.some(e => e.name === identity.human.emergencyContact!.name);
    if (!exists) {
      emergencyFromFamily.unshift(identity.human.emergencyContact);
    }
  }

  return emergencyFromFamily;
}

export function createFamilyTree(identity: PatientIdentity): FamilyTreeNode[] {
  const tree: FamilyTreeNode[] = [];
  for (const member of identity.linkedAccounts) {
    if (!member.isActive) continue;
    tree.push({
      amxpId: member.amxpId,
      name: member.fullName,
      relationship: member.relationship,
      relationshipLabel: RELATIONSHIP_LABELS[member.relationship] || member.relationship,
      permissions: member.permissions.map(p => PERMISSION_LABELS[p]),
      linkedSince: member.linkedSince,
    });
  }
  return tree;
}

export interface FamilyTreeNode {
  amxpId: AmxpId;
  name: string;
  relationship: FamilyRelationship;
  relationshipLabel: string;
  permissions: string[];
  linkedSince: number;
}
