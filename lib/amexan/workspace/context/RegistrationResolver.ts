// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 1 — Registration Completeness Resolver
// Determines whether an actor has completed all required registration steps
// before reaching a dashboard. Returns a RegistrationCompleteness object
// with missing elements and the next onboarding step.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { RegistrationStep } from '../../constitution/registration';

export interface RegistrationCompleteness {
  identityComplete: boolean;
  professionalComplete: boolean;
  organizationSelected: boolean;
  employmentAccepted: boolean;
  departmentAssigned: boolean;
  licenseVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  paymentVerified: boolean;
  complete: boolean;
  missing: string[];
  nextStep: RegistrationStep | null;
}

export function resolveRegistrationCompleteness(
  workspace: ResolvedWorkspace,
  userData?: Record<string, unknown>,
): RegistrationCompleteness {
  const hasProfessional = !!workspace.professional;
  const hasIdentity = !!workspace.identity && !!workspace.identity.email;
  const hasOrganization = !!workspace.organization || !!workspace.activeMembership;
  const hasEmployment = !!workspace.activeEmployment;
  const hasAssignment = !!workspace.activeAssignment;
  const hasDepartment = !!workspace.department;
  const emailVerified = !!(userData?.emailVerified as boolean) || workspace.identity.verified;
  const phone = (userData?.phone as string) || workspace.identity.phone;
  const phoneVerified = !!phone && phone.length >= 10;

  const identityComplete = hasIdentity && emailVerified;
  const professionalComplete = hasProfessional;
  const organizationSelected = hasOrganization;
  const employmentAccepted = hasEmployment || !hasOrganization;
  const departmentAssigned = hasDepartment || !hasOrganization;
  const licenseVerified = !hasProfessional || (userData?.licenseVerified as boolean) !== false;
  const paymentVerified = true;

  const missing: string[] = [];
  if (!identityComplete) missing.push('identity');
  if (!professionalComplete) missing.push('professional');
  if (!organizationSelected) missing.push('organization');
  if (!employmentAccepted) missing.push('employment');
  if (!departmentAssigned) missing.push('department');
  if (!licenseVerified) missing.push('license');
  if (!emailVerified) missing.push('email_verification');
  if (!phoneVerified) missing.push('phone_verification');
  if (!paymentVerified) missing.push('payment');

  const complete = missing.length === 0;

  const stepOrder: RegistrationStep[] = [
    'identity',
    'professional',
    'organization_choice',
    'organization_create',
    'organization_join',
    'department_select',
    'assignment',
    'complete',
  ];

  let nextStep: RegistrationStep | null = null;
  if (!complete) {
    if (!identityComplete) nextStep = 'identity';
    else if (!professionalComplete) nextStep = 'professional';
    else if (!organizationSelected) nextStep = 'organization_choice';
    else if (!employmentAccepted) nextStep = 'assignment';
    else if (!departmentAssigned) nextStep = 'department_select';
    else if (!licenseVerified) nextStep = 'professional';
    else if (!emailVerified) nextStep = 'identity';
    else if (!phoneVerified) nextStep = 'identity';
    else nextStep = 'identity';
  }

  return {
    identityComplete,
    professionalComplete,
    organizationSelected,
    employmentAccepted,
    departmentAssigned,
    licenseVerified,
    emailVerified,
    phoneVerified,
    paymentVerified,
    complete,
    missing,
    nextStep,
  };
}