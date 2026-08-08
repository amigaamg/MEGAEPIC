// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN COS — Authorization Engine
//
// Constitutional rule: the UI does NOT grant authority. A button appearing in
// the UI means nothing until it passes the authorization engine. This module
// is the single gate every clinical action flows through.
//
// Auth → Facility → Department → Role → Credential → Privilege → Patient
//        → Encounter → Clinical State → Authorization Engine → Action
// ═══════════════════════════════════════════════════════════════════════════════
import type { EnvironmentContext } from './types';

export type ActionGrant =
  | 'note.create'
  | 'note.sign'
  | 'order.create'
  | 'order.cancel'
  | 'prescribe'
  | 'refer'
  | 'discharge'
  | 'admit'
  | 'followup'
  | 'review'
  | 'mdt'
  | 'procedure'
  | 'admin.observe';

export interface ActionRequest {
  action: ActionGrant;
  actor: {
    id: string;
    roleId?: string;
    credential?: string;
    isConsultant?: boolean;
  };
  env: EnvironmentContext;
}

export interface GrantDecision {
  allowed: boolean;
  reason: string;
  effectivePrivilege?: string;
}

const CLINICAL_CREDENTIAL = 'medical_doctor';
const PRINCIPAL_ROLES = [
  'doctor',
  'consultant',
  'clinical_officer',
  'medical_doctor',
  'specialist',
  'registrar',
];

const ACTIONS_REQUIRING_CREDENTIAL: ActionGrant[] = [
  'discharge',
  'note.sign',
  'procedure',
  'prescribe',
  'refer',
];

const ACTIONS_REQUIRING_PRESCRIBER: ActionGrant[] = [
  'prescribe',
  'order.create',
  'procedure',
];

const ACTIONS_REQUIRING_CONSULTANT: ActionGrant[] = ['discharge'];

export class ClinicalAuthorizer {
  /**
   * @param canCapability callback into the WorkspaceEngine's capability system
   *   (session `can(resource, action)`). Drives the true privilege grant.
   */
  constructor(private canCapability: (resource: string, action: string) => boolean) {}

  authorize(req: ActionRequest): GrantDecision {
    const { action, actor } = req;
    const effectivePrivilege = `${actor.roleId ?? 'clinician'}::${action}`;

    // 1) Administrator can observe operations but NEVER author clinical
    //    content solely because they hold admin privileges.
    if (action === 'admin.observe') {
      return { allowed: true, reason: 'Read-only operational observation', effectivePrivilege };
    }

    // 2) Clinical credential gate. A facility administrator does not gain
    //    clinical authority from administrative privilege.
    if (ACTIONS_REQUIRING_CREDENTIAL.includes(action) && !actor.isConsultant) {
      const hasCredential =
        actor.credential === CLINICAL_CREDENTIAL ||
        actor.roleId === 'consultant' ||
        actor.roleId === 'medical_doctor';
      if (!hasCredential) {
        return {
          allowed: false,
          reason: `'${action}' requires a clinical credential. Administrative privilege does not grant clinical authority (constitutional separation).`,
        };
      }
    }

    // 3) Prescriber requirement for clinical ordering.
    if (ACTIONS_REQUIRING_PRESCRIBER.includes(action)) {
      const isPrescriber =
        PRINCIPAL_ROLES.includes(actor.roleId ?? '') ||
        actor.credential === CLINICAL_CREDENTIAL;
      if (!isPrescriber) {
        return {
          allowed: false,
          reason: `Role '${actor.roleId}' is not a recognised prescriber for '${action}'.`,
        };
      }
    }

    // 4) Consultant-only dispositions.
    if (ACTIONS_REQUIRING_CONSULTANT.includes(action)) {
      const isConsultant =
        actor.isConsultant || actor.roleId === 'consultant' || actor.roleId === 'specialist';
      if (!isConsultant) {
        return {
          allowed: false,
          reason: `'${action}' requires consultant authority.`,
        };
      }
    }

    // 5) Capability grant from the single source of truth.
    const capability = this.canCapability(resourceFor(action), actionFor(action));
    if (!capability) {
      return {
        allowed: false,
        reason: `Capability '${resourceFor(action)}:${actionFor(action)}' not granted.`,
      };
    }

    return { allowed: true, reason: 'Authorized', effectivePrivilege };
  }
}

function resourceFor(action: ActionGrant): string {
  switch (action) {
    case 'note.create':
    case 'note.sign':
      return 'clinical_note';
    case 'order.create':
    case 'order.cancel':
      return 'lab_order';
    case 'prescribe':
      return 'prescription';
    case 'refer':
      return 'referral';
    case 'discharge':
      return 'discharge';
    case 'admit':
    case 'followup':
      return 'encounter';
    default:
      return 'patient';
  }
}

function actionFor(action: ActionGrant): string {
  switch (action) {
    case 'note.sign':
      return 'sign';
    case 'note.create':
      return 'create';
    case 'order.cancel':
      return 'update';
    case 'order.create':
      return 'create';
    default:
      return 'create';
  }
}

/** Lightweight convenience for building an authorizer from a `can()` fn. */
export function createAuthorizer(can: (resource: string, action: string) => boolean): ClinicalAuthorizer {
  return new ClinicalAuthorizer(can);
}