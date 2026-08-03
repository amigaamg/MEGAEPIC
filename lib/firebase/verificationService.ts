import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  type VerificationState,
  type VerificationLevel,
  createVerificationState,
  upgradeVerificationLevel,
} from '@/lib/amexan/constitution/verification';
import type { AmxUid } from '@/lib/amexan/constitution/types';

function verificationDoc(uid: string) {
  return doc(db, 'verifications', uid);
}

export async function getVerificationState(uid: string): Promise<VerificationState | null> {
  if (typeof window === 'undefined') return null;
  try {
    const snap = await getDoc(verificationDoc(uid));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<VerificationState>;
    return {
      uid: ((data.uid as string) || uid) as AmxUid,
      currentLevel: (data.currentLevel ?? 0) as VerificationLevel,
      levels: data.levels ?? createVerificationState(uid as any).levels,
      updatedAt: data.updatedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export async function saveVerificationState(uid: string, state: VerificationState): Promise<void> {
  if (typeof window === 'undefined') return;
  await setDoc(verificationDoc(uid), state);
}

export async function syncEmailVerification(
  uid: string,
  info: { emailVerified: boolean; email?: string },
): Promise<VerificationState | null> {
  if (typeof window === 'undefined') return null;
  try {
    const existing = await getVerificationState(uid);
    let state = existing ?? createVerificationState(uid as any);

    if (info.emailVerified && state.currentLevel < 1) {
      state = upgradeVerificationLevel(
        state,
        1,
        'firebase_auth',
        [info.email ? `Email verified by provider: ${info.email}` : 'Email verified by provider'],
      );
    }

    await saveVerificationState(uid, state);
    return state;
  } catch {
    return null;
  }
}

export async function setVerificationLevel(
  uid: string,
  level: VerificationLevel,
  achievedBy: string,
  evidence: string[],
): Promise<VerificationState | null> {
  try {
    const existing = await getVerificationState(uid);
    let state = existing ?? createVerificationState(uid as any);
    state = upgradeVerificationLevel(state, level, achievedBy, evidence);
    await saveVerificationState(uid, state);
    return state;
  } catch {
    return null;
  }
}
