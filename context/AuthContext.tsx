'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth, initPersistence } from '@/lib/firebase';
import {
  getIdentity,
  getPerson,
  getProfessional,
  buildEmptySession,
  composeUserSession,
  can,
  generateDashboard,
  generateActorDashboard,
  type UserSession,
  type DashboardTemplate,
  type ResourceType,
  type Action,
  type AmxUid,
} from '@/lib/amexan';

import { getActorSession } from '@/lib/firebase/actorService';
import { getWorkspaceEngine } from '@/lib/amexan/workspace';
import { getVerificationState, syncEmailVerification } from '@/lib/firebase/verificationService';
import {
  setActiveOrganizationId as persistActiveOrganizationId,
  getActiveOrganizationId
} from '@/lib/firebase/orgContext';
import { setSessionCookie, clearSessionCookie } from '@/lib/client/session';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { VerificationState } from '@/lib/amexan/constitution/verification';

// WS-003: the persisted `workspaceChoice` is a narrow, constitutional union, not a
// free string. Keeps the gate (<- WorkspaceResolutionEngine) type-clean at runtime.
type WorkspaceChoice = 'individual' | 'organization' | 'create' | 'join' | null;

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  session: UserSession;
  dashboard: DashboardTemplate | null;
  can: (resource: ResourceType, action: Action, scope?: { organizationId?: string; departmentId?: string; wardId?: string }) => boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  needsToCompleteRegistration: boolean;
  registrationStep: string | null;
  /** Explicit 'Continue Individually' / organization choice persisted on `users/{uid}`. */
  workspaceChoice: WorkspaceChoice;
  activeOrganizationId: string | null;
  setActiveOrganizationId: (orgId: string) => void;
  verification: VerificationState | null;
  needsEmailVerification: boolean;
  refreshVerification: () => Promise<void>;
  // New: Workspace context
  workspace: any; // ResolvedWorkspace from WorkspaceEngine
  switchOrganization: (orgId: string) => Promise<void>;
  switchFacility: (facilityId: string) => Promise<void>;
  switchDepartment: (departmentId: string) => Promise<void>;
  /** Re-resolve the workspace from Firestore after onboarding completes. */
  refreshWorkspace: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  session: buildEmptySession(),
  dashboard: null,
  can: () => false,
  login: async () => '',
  logout: async () => {},
  needsToCompleteRegistration: false,
  registrationStep: null,
  workspaceChoice: null,
  activeOrganizationId: null,
  setActiveOrganizationId: () => {},
  verification: null,
  needsEmailVerification: false,
  refreshVerification: async () => {},
  workspace: null,
  switchOrganization: async () => {},
  switchFacility: async () => {},
  switchDepartment: async () => {},
  refreshWorkspace: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<UserSession>(buildEmptySession);
  const [needsToCompleteRegistration, setNeedsToCompleteRegistration] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<string | null>(null);
  const [workspaceChoice, setWorkspaceChoice] = useState<WorkspaceChoice>(null);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  // New: Workspace state
  const [workspace, setWorkspace] = useState<any>(null);

  // Persist the active organization to localStorage (immediate) and Firestore
  // (durable, cross-device). The workspace engine reads localStorage on init;
  // Firestore ensures the choice survives device changes.
  const persistActiveOrganization = (orgId: string | null) => {
    persistActiveOrganizationId(orgId || '');
    if (!user) return;
    try {
      updateDoc(doc(db, 'users', user.uid), {
        activeOrganizationId: orgId || null,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    } catch {
      // non-fatal
    }
  };

  const setActiveOrganizationId = (orgId: string) => {
    setActiveOrganizationIdState(orgId);
    persistActiveOrganizationId(orgId);
    persistActiveOrganization(orgId);
  };

// New: Switch functions using WorkspaceEngine
const switchOrganization = async (orgId: string) => {
  const engine = getWorkspaceEngine();
  const newWorkspace = await engine.switchOrganization(orgId);
  setWorkspace(newWorkspace);
  setSession(engine.getSession());
  setActiveOrganizationIdState(orgId);
  persistActiveOrganization(orgId);
};

const switchFacility = async (facilityId: string) => {
  const engine = getWorkspaceEngine();
  const newWorkspace = await engine.switchFacility(facilityId);
  setWorkspace(newWorkspace);
  setSession(engine.getSession());
};

const switchDepartment = async (departmentId: string) => {
  const engine = getWorkspaceEngine();
  const newWorkspace = await engine.switchDepartment(departmentId);
  setWorkspace(newWorkspace);
  setSession(engine.getSession());
};

// Re-resolve the workspace from Firestore after onboarding completes so the
// dashboard gate (CR-WS-001) sees an up-to-date, complete workspace.
const refreshWorkspace = async () => {
  if (!user) return;
  try {
    const engine = getWorkspaceEngine();
    const newWorkspace = await engine.initialize(user.uid as AmxUid, { forceRefresh: true });
    setWorkspace(newWorkspace);
    setSession(engine.getSession());
    setRole(newWorkspace.role?.id || null);
    setActiveOrganizationIdState(newWorkspace.activeMembership?.organizationId || newWorkspace.organization?.id || null);
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    const userData = userSnap.data() || {};
    const userRegistrationStep = userData.registrationStep as string | undefined;
    setRegistrationStep(userRegistrationStep || null);
    setWorkspaceChoice((userData.workspaceChoice as WorkspaceChoice | undefined) || null);
    setNeedsToCompleteRegistration(!!userRegistrationStep && userRegistrationStep !== 'complete');
    return newWorkspace;
  } catch (err) {
    console.error('Failed to refresh workspace:', err);
    return null;
  }
};

  const refreshVerification = async () => {
    if (!user || !session.identity?.uid) return;
    try {
      const amxUid = session.identity.uid as string;
      const state = await getVerificationState(amxUid);
      const synced = await syncEmailVerification(amxUid, { emailVerified: user.emailVerified, email: user.email || '' });
      setVerification(synced || state);
      setNeedsEmailVerification(!!user.email && !user.emailVerified);
    } catch (e) {
      console.error('Failed to refresh verification', e);
    }
  };

  async function loadUserSession(firebaseUser: User): Promise<string | null> {
    // Constitutional gate (CR-WS-001): the Workspace Engine must NEVER
    // initialize before registration is COMPLETE. Otherwise it persists a
    // partial workspace, hits unowned collections, and throws permission
    // errors for half-created accounts. Read the registration state first so
    // an interrupted account resumes onboarding instead of failing.
    let userData: Record<string, unknown> | null = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      userData = userDoc.exists() ? userDoc.data() : null;
    } catch {
      userData = null;
    }

    const userRegistrationStep = userData?.registrationStep as string | undefined;
    setRegistrationStep(userRegistrationStep || null);
    setWorkspaceChoice((userData?.workspaceChoice as WorkspaceChoice | undefined) || null);
    setNeedsToCompleteRegistration(!!userRegistrationStep && userRegistrationStep !== 'complete');

    // Registration not complete → do not touch the Workspace Engine. Load a
    // minimal session and let the register page resume onboarding.
    if (!userRegistrationStep || userRegistrationStep !== 'complete') {
      return loadUserSessionLegacy(firebaseUser);
    }

    try {
      // Use WorkspaceEngine for complete context resolution
      const engine = getWorkspaceEngine();
      const workspace = await engine.initialize(firebaseUser.uid as AmxUid);

      setWorkspace(workspace);
      setSession(engine.getSession());
      const resolvedRole = workspace.role?.id || null;
      setRole(resolvedRole);
      setActiveOrganizationIdState(workspace.activeMembership?.organizationId || workspace.organization?.id || null);

      // Load verification state
      if (workspace.identity?.uid) {
        const vState = await getVerificationState(workspace.identity.uid as string);
        const synced = await syncEmailVerification(workspace.identity.uid as string, { emailVerified: firebaseUser.emailVerified, email: firebaseUser.email || '' });
        setVerification(synced || vState);
        setNeedsEmailVerification(!!firebaseUser.email && !firebaseUser.emailVerified);
      }
      return resolvedRole;
    } catch (err) {
      console.error('Failed to load UserSession via WorkspaceEngine:', err);

      // Fallback to legacy implementation
      return loadUserSessionLegacy(firebaseUser);
    }
  }

  // Legacy fallback
  async function loadUserSessionLegacy(firebaseUser: User): Promise<string | null> {
    try {
      const actorResult = await getActorSession(firebaseUser.uid);
      if (actorResult) {
        const { session, activeOrganizationId, derivedRole } = actorResult;
        setSession(session);
        setRole(derivedRole);
        setActiveOrganizationIdState(activeOrganizationId);

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        const userRegistrationStep = userData?.registrationStep as string | undefined;
        setRegistrationStep(userRegistrationStep || null);
        setWorkspaceChoice((userData?.workspaceChoice as WorkspaceChoice | undefined) || null);
        setNeedsToCompleteRegistration(!!userRegistrationStep && userRegistrationStep !== 'complete');

        // Load verification state
        if (session.identity?.uid) {
          const vState = await getVerificationState(session.identity.uid as string);
          const synced = await syncEmailVerification(session.identity.uid as string, { emailVerified: firebaseUser.emailVerified, email: firebaseUser.email || '' });
          setVerification(synced || vState);
          setNeedsEmailVerification(!!firebaseUser.email && !firebaseUser.emailVerified);
        }
        return derivedRole;
      }

      // Fallback: legacy user without AMX-UID / actor not found
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      const fetchedRole = userData?.role ?? null;
      setRole(fetchedRole);

      const userRegistrationStep = userData?.registrationStep as string | undefined;
      setRegistrationStep(userRegistrationStep || null);
      setWorkspaceChoice((userData?.workspaceChoice as WorkspaceChoice | undefined) || null);
      setNeedsToCompleteRegistration(
        !!userRegistrationStep && userRegistrationStep !== 'complete'
      );

      setSession(prev => ({
        ...prev,
        identity: { uid: firebaseUser.uid as AmxUid, email: firebaseUser.email || '', phone: '', createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(), updatedAt: Date.now(), lastLoginAt: Date.now(), verified: firebaseUser.emailVerified, twoFactorEnabled: false, securityKeys: [], authProvider: 'email', status: 'active' },
        person: { uid: firebaseUser.uid as AmxUid, identityId: firebaseUser.uid as AmxUid, fullName: firebaseUser.displayName || fetchedRole || 'User', givenName: '', familyName: '', dateOfBirth: '', gender: 'undisclosed', nationality: '', nationalId: '', address: { country: 'Kenya', county: '' }, emergencyContact: undefined },
        isAuthenticated: true,
        isLoading: false,
        onDuty: true,
        professional: {
          uid: firebaseUser.uid as AmxUid,
          personId: firebaseUser.uid as AmxUid,
          categories: fetchedRole === 'doctor' ? ['medical_doctor'] : fetchedRole === 'nurse' ? ['nurse'] : fetchedRole === 'admin' ? ['facility_admin'] : ['other'],
          primaryCategory: fetchedRole === 'doctor' ? 'medical_doctor' : fetchedRole === 'nurse' ? 'nurse' : fetchedRole === 'admin' ? 'facility_admin' : (fetchedRole as any) || 'other',
          specialties: [],
          qualifications: [],
          yearsOfExperience: 0,
          verified: false,
          verificationDocuments: [],
        },
        permissions: getDefaultPermissions(fetchedRole),
        role: { id: fetchedRole || 'user', name: fetchedRole || 'User', description: '', type: 'system', permissions: getDefaultPermissions(fetchedRole), isAssignable: false, createdBy: '' as AmxUid, createdAt: 0, updatedAt: 0 },
      }));

      // Load verification for legacy user
      const vState = await getVerificationState(firebaseUser.uid);
      const synced = await syncEmailVerification(firebaseUser.uid, { emailVerified: firebaseUser.emailVerified, email: firebaseUser.email || '' });
      setVerification(synced || vState);
      setNeedsEmailVerification(!!firebaseUser.email && !firebaseUser.emailVerified);
      return fetchedRole;
    } catch (err) {
      console.error('Failed to load UserSession:', err);
      setNeedsToCompleteRegistration(false);
      setSession(prev => ({ ...prev, isAuthenticated: true, isLoading: false }));
      return null;
    }
  }

  useEffect(() => {
    initPersistence();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserSession(firebaseUser);
        await setSessionCookie();
      } else {
        setRole(null);
        setSession(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
        await clearSessionCookie();
      }
      setLoading(false);
    });

    // Periodic cookie refresh (every 45 min)
    const interval = setInterval(() => {
      if (auth.currentUser) {
        refreshSessionCookie();
      }
    }, 45 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const refreshSessionCookie = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      const { getIdToken } = await import('firebase/auth');
      const user = auth.currentUser;
      if (!user) return;
      const token = await getIdToken(user, true);
      if (typeof window !== 'undefined') {
        document.cookie = `__session=${token}; path=/; max-age=86400; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      }
    } catch (e) {
      console.warn('Failed to refresh session cookie', e);
    }
  };

  const dashboard = useMemo((): DashboardTemplate | null => {
    if (session.isAuthenticated && !session.isLoading) {
      const generated = generateActorDashboard(session);
      const config = workspace?.dashboard;
      if (config?.sections?.length) {
        return {
          ...generated,
          title: config.title || generated.title,
          greeting: config.greeting || generated.greeting,
          sections: config.sections,
        };
      }
      return generated;
    }
    return null;
  }, [workspace, session]);

  const login = async (email: string, password: string): Promise<string> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const resolvedRole = await loadUserSession(credential.user);
    return resolvedRole || '';
  };

  const logout = async () => {
    await signOut(auth);
    await clearSessionCookie();
    setUser(null);
    setRole(null);
    setSession(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
  };

  const checkPermission = (resource: ResourceType, action: Action, scope?: { organizationId?: string; departmentId?: string; wardId?: string }) => {
    return can(session.permissions, resource, action, scope);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, session, dashboard, can: checkPermission, login, logout, needsToCompleteRegistration, registrationStep, workspaceChoice, activeOrganizationId, setActiveOrganizationId, verification, needsEmailVerification, refreshVerification, workspace, switchOrganization, switchFacility, switchDepartment, refreshWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function getDefaultPermissions(role: string | null): any[] {
  if (!role) return [];
  switch (role) {
    case 'doctor':
    case 'consultant':
      return [
        { resource: 'patient', actions: ['create', 'read', 'update'], scope: { type: 'organization' }, deny: false },
        { resource: 'encounter', actions: ['create', 'read', 'update'], scope: { type: 'organization' }, deny: false },
        { resource: 'prescription', actions: ['create', 'read', 'update', 'delete'], scope: { type: 'organization' }, deny: false },
        { resource: 'lab_order', actions: ['create', 'read'], scope: { type: 'organization' }, deny: false },
        { resource: 'imaging_order', actions: ['create', 'read'], scope: { type: 'organization' }, deny: false },
        { resource: 'clinical_note', actions: ['create', 'read', 'update', 'sign'], scope: { type: 'organization' }, deny: false },
        { resource: 'referral', actions: ['create', 'read'], scope: { type: 'organization' }, deny: false },
        { resource: 'discharge', actions: ['create', 'update', 'sign'], scope: { type: 'organization' }, deny: false },
        { resource: 'patient', actions: ['read'], scope: { type: 'organization' }, deny: false },
      ];
    case 'nurse':
      return [
        { resource: 'patient', actions: ['read', 'update'], scope: { type: 'organization' }, deny: false },
        { resource: 'vitals', actions: ['create', 'read', 'update'], scope: { type: 'organization' }, deny: false },
        { resource: 'prescription', actions: ['read', 'administer'], scope: { type: 'organization' }, deny: false },
        { resource: 'encounter', actions: ['read'], scope: { type: 'organization' }, deny: false },
        { resource: 'clinical_note', actions: ['create', 'read'], scope: { type: 'organization' }, deny: false },
      ];
    case 'admin':
    case 'facility_admin':
      return [
        { resource: 'admin', actions: ['admin'], scope: { type: 'organization' }, deny: false },
        { resource: 'manage_staff', actions: ['create', 'read', 'update', 'delete'], scope: { type: 'organization' }, deny: false },
        { resource: 'manage_org', actions: ['update'], scope: { type: 'organization' }, deny: false },
        { resource: 'manage_roles', actions: ['create', 'read', 'update', 'delete'], scope: { type: 'organization' }, deny: false },
        { resource: 'view_finance', actions: ['read'], scope: { type: 'organization' }, deny: false },
        { resource: 'view_reports', actions: ['read'], scope: { type: 'organization' }, deny: false },
        { resource: 'view_analytics', actions: ['read'], scope: { type: 'organization' }, deny: false },
      ];
    case 'lab_technologist':
      return [
        { resource: 'lab_order', actions: ['read', 'update'], scope: { type: 'organization' }, deny: false },
        { resource: 'patient', actions: ['read'], scope: { type: 'organization' }, deny: false },
      ];
    case 'pharmacist':
      return [
        { resource: 'prescription', actions: ['read', 'update', 'dispense'], scope: { type: 'organization' }, deny: false },
        { resource: 'patient', actions: ['read'], scope: { type: 'organization' }, deny: false },
      ];
    default:
      return [
        { resource: 'patient', actions: ['read'], scope: { type: 'organization' }, deny: false },
      ];
  }
}
