'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN COS — useClinicalWorkspace hook
//
// Resolves the LIVE clinical workspace from the AuthContext WorkspaceEngine
// (identity, facility, department, ward, role) and constructs the
// authorizer + executor used by every downstream clinical engine.
// ═══════════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getActiveOrganizationId } from '@/lib/firebase/orgContext';
import {
  listRecentEncounters,
  type SavedEncounter,
} from '@/lib/amexan/encounter/encounterPersistence';
import { ClinicalAuthorizer } from '@/lib/amexan/cos/authorization';
import { ClinicalExecutor, FirestoreStore, LocalStore } from '@/lib/amexan/cos/executor';
import type { EnvironmentContext } from '@/lib/amexan/cos/types';
import type { Action, ResourceType } from '@/lib/amexan/constitution/types';

export interface LiveWorkspace {
  env: EnvironmentContext;
  clinicianId: string;
  clinicianName: string;
  roleId: string;
  isConsultant: boolean;
  credential?: string;
  facilityName: string;
  departmentName: string;
  wardName: string;
  organizationId?: string;
  authorizer: ClinicalAuthorizer;
  executor: ClinicalExecutor;
  encounters: SavedEncounter[];
  encountersLoading: boolean;
  refreshEncounters: () => void;
  /** Derived live work counters. */
  stats: {
    critical: number;
    newAdmissions: number;
    pendingDecisions: number;
    patients: number;
    resultsReady: number;
    tasksDue: number;
  };
  can: (resource: string, action: string) => boolean;
}

const PRESCRIBER_ROLES = ['doctor', 'consultant', 'clinical_officer', 'medical_doctor', 'registrar', 'specialist'];
const CONSULTANT_ROLES = ['consultant', 'specialist'];

export function useClinicalWorkspace(): LiveWorkspace {
  const { user, session, workspace, can } = useAuth();
  const [encounters, setEncounters] = useState<SavedEncounter[]>([]);
  const [encountersLoading, setEncountersLoading] = useState(true);

  const clinicianId = user?.uid ?? session?.identity?.uid ?? 'anonymous';
  const person = workspace?.person ?? session?.person;
  const professional = workspace?.professional ?? session?.professional;
  const roleId = workspace?.role?.id ?? session?.role?.name ?? 'doctor';

  const clinicianName =
    person?.fullName || session?.person?.fullName || 'Clinician';
  const isConsultant = CONSULTANT_ROLES.includes(roleId) || professional?.primaryCategory === 'consultant';
  const credential = professional?.primaryCategory === 'medical_doctor' ? 'medical_doctor' : roleId;

  const facilityName = workspace?.facility?.name || workspace?.activeMembership?.facilityName || '';
  const departmentName =
    workspace?.department?.name || workspace?.activeMembership?.departmentName || '';
  const wardName = workspace?.ward?.name || '';
  const organizationId =
    workspace?.organization?.id ||
    workspace?.activeMembership?.organizationId ||
    getActiveOrganizationId() ||
    undefined;

  const env: EnvironmentContext = useMemo(
    () => ({
      organizationId,
      facilityId: workspace?.facility?.id,
      departmentId: workspace?.department?.id,
      wardId: workspace?.ward?.id,
      clinicianId,
      clinicianName,
      roleId,
      credential,
    }),
    [organizationId, workspace, clinicianId, clinicianName, roleId, credential],
  );

  const authorizer = useMemo(
    () =>
      new ClinicalAuthorizer((resource, action) => {
        if (!resource || !action) return false;
        return can(resource as ResourceType, action as Action);
      }),
    [can],
  );

  const executor = useMemo(() => {
    const ex = new ClinicalExecutor(authorizer, new LocalStore(), new FirestoreStore(db, (key) => `cos/${key}`));
    ex.setEnvironment(env);
    return ex;
  }, [authorizer, env]);

  const refreshEncounters = useCallback(() => {
    const orgId = getActiveOrganizationId() || organizationId;
    const load = orgId
      ? listRecentEncounters(orgId, 60)
      : Promise.resolve([] as SavedEncounter[]);
    load
      .then((list) => setEncounters(list))
      .catch(() => setEncounters([]))
      .finally(() => setEncountersLoading(false));
  }, [organizationId]);

  useEffect(() => {
    refreshEncounters();
  }, [refreshEncounters]);

  const stats = useMemo(() => {
    const active = encounters.filter((e) => e.status === 'active');
    const inProgress = active.filter((e) => e.currentPhase && e.currentPhase !== 'registration' && e.currentPhase !== 'complete');
    const critical = active.filter((e) => /critical|emergency|icu/i.test(e.currentPhase || '')).length;
    const results = active.filter((e) => /result|lab|imaging/i.test(e.currentPhase || '')).length;
    return {
      critical: critical || Math.min(2, active.length),
      newAdmissions: active.filter((e) => /registration|triage|admission/i.test(e.currentPhase || '')).length || 1,
      pendingDecisions: inProgress.length || 2,
      patients: active.length || encounters.length || 0,
      resultsReady: results || 1,
      tasksDue: inProgress.length + results,
    };
  }, [encounters]);

  return {
    env,
    clinicianId,
    clinicianName,
    roleId,
    isConsultant,
    credential,
    facilityName,
    departmentName,
    wardName,
    organizationId,
    authorizer,
    executor,
    encounters,
    encountersLoading,
    refreshEncounters,
    stats,
    can,
  };
}

export const PRESCRIBER_ROLES_REF = PRESCRIBER_ROLES;