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
  type UserSession,
  type DashboardTemplate,
  type ResourceType,
  type Action,
  type AmxUid,
} from '@/lib/amexan';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  session: UserSession;
  dashboard: DashboardTemplate | null;
  can: (resource: ResourceType, action: Action, scope?: { organizationId?: string; departmentId?: string; wardId?: string }) => boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
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
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<UserSession>(buildEmptySession);

  async function loadUserSession(firebaseUser: User) {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      const fetchedRole = userData?.role ?? null;
      setRole(fetchedRole);

      const amxUid = userData?.amxUid as AmxUid | undefined;

      if (amxUid) {
        const [identity, person, professional] = await Promise.all([
          getIdentity(amxUid),
          getPerson(amxUid),
          getProfessional(amxUid),
        ]);

        if (identity && person) {
          const fullSession = composeUserSession({
            identity,
            person,
            professional,
            organizations: [],
            employments: [],
            currentEmployment: null,
            currentOrganization: null,
            currentDepartment: null,
            currentAssignments: [],
            role: { id: fetchedRole || 'user', name: fetchedRole || 'User', description: '', type: 'system', permissions: getDefaultPermissions(fetchedRole), isAssignable: false, createdBy: '' as AmxUid, createdAt: 0, updatedAt: 0 },
            permissions: getDefaultPermissions(fetchedRole),
            responsibilities: [],
          });
          setSession(fullSession);
          return;
        }
      }

      // Fallback: legacy user without AMX-UID
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
    } catch (err) {
      console.error('Failed to load UserSession:', err);
      setSession(prev => ({ ...prev, isAuthenticated: true, isLoading: false }));
    }
  }

  useEffect(() => {
    initPersistence();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserSession(firebaseUser);
      } else {
        setRole(null);
        setSession(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const dashboard = useMemo(() => {
    if (session.isAuthenticated && !session.isLoading) {
      return generateDashboard(session);
    }
    return null;
  }, [session]);

  const login = async (email: string, password: string): Promise<string> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserSession(credential.user);
    return role ?? '';
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setSession(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
  };

  const checkPermission = (resource: ResourceType, action: Action, scope?: { organizationId?: string; departmentId?: string; wardId?: string }) => {
    return can(session.permissions, resource, action, scope);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, session, dashboard, can: checkPermission, login, logout }}>
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
