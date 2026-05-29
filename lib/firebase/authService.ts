import {
  auth,
  initPersistence,
} from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { userRef, usersCol } from './collections';

export type AccountType = 'clinician' | 'facility';
export type ClinicianRole = 'doctor' | 'nurse' | 'consultant' | 'medical_officer' | 'pharmacist' | 'lab_technologist' | 'medical_student' | 'therapist' | 'admin';
export type OnboardingStatus = 'pending' | 'profile_pending' | 'complete';

export interface ClinicianProfile {
  uid: string;
  email: string;
  accountType: 'clinician';
  displayName: string;
  photoURL?: string;
  clinicianRole: ClinicianRole;
  specialty?: string;
  country: string;
  organizations: string[];
  activeOrganizationId?: string;
  onboardingStatus: OnboardingStatus;
  createdAt: number;
}

export interface FacilityProfile {
  uid: string;
  email: string;
  accountType: 'facility';
  displayName: string;
  photoURL?: string;
  facilityName: string;
  facilityType: 'hospital' | 'clinic' | 'specialist_center' | 'telemedicine' | 'teaching_hospital';
  country: string;
  departments: string[];
  organizations: string[];
  activeOrganizationId?: string;
  onboardingStatus: OnboardingStatus;
  createdAt: number;
}

export type UserProfile = ClinicianProfile | FacilityProfile;

// ── Account Type Enforcement ──────────────────────────────────────────────────
// ONE EMAIL = ONE ACCOUNT TYPE — enforced permanently at the Firestore level.

export class AccountTypeMismatchError extends Error {
  constructor(existingType: AccountType, attemptedType: AccountType) {
    super(
      `This email is already registered as a ${existingType === 'clinician' ? 'Clinician' : 'Facility'} account. ` +
      `It cannot be used as a ${attemptedType === 'clinician' ? 'Clinician' : 'Facility'} account. ` +
      `Please sign in with the correct account type or use a different email.`
    );
    this.name = 'AccountTypeMismatchError';
  }
}

export async function checkAccountType(email: string, attemptedType: AccountType): Promise<UserProfile | null> {
  const q = query(usersCol(), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const existing = snap.docs[0].data() as UserProfile;
  if (existing.accountType && existing.accountType !== attemptedType) {
    throw new AccountTypeMismatchError(existing.accountType, attemptedType);
  }
  return existing;
}

// ── Google Auth (popup with redirect fallback for COOP) ──────────────────────

let persistenceInitialized = false;

export function initAuthPersistence() {
  if (!persistenceInitialized) {
    initPersistence();
    persistenceInitialized = true;
  }
}

/**
 * Sign in with Google using redirect (avoids COOP popup issues).
 * Saves accountType to sessionStorage before redirect so it survives page reload.
 * Throws if redirect cannot be initiated (e.g. unauthorized domain).
 */
export async function signInWithGoogle(accountType: AccountType): Promise<void> {
  sessionStorage.setItem('clinicalAuth_type', accountType);
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithRedirect(auth, provider);
}

/**
 * Handle redirect result after returning from Google auth redirect.
 * Must be called on mount of the auth page.
 * Returns the signed-in user and clears the redirect state.
 */
export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch {
    return null;
  }
}

// ── Email / Password Auth ────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// ── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data() as UserProfile : null;
}

export async function createUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const ref = userRef(uid);
  await setDoc(ref, { ...profile, uid, createdAt: Date.now() }, { merge: true });
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const ref = userRef(uid);
  await setDoc(ref, updates, { merge: true });
}

// ── Auth State Listener ──────────────────────────────────────────────────────

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
