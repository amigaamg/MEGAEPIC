import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Fetches the role for a given Firebase UID from Firestore.
 * Always pass the UID explicitly — never rely on auth.currentUser
 * to avoid cross-tab session issues.
 *
 * Firestore structure:
 *   users/{uid}/role: "doctor" | "patient" | "admin"
 */
export const getUserRole = async (uid: string): Promise<string | null> => {
  if (!uid) return null;

  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    return snap.data().role ?? null;
  } catch (err) {
    console.error('getUserRole error:', err);
    return null;
  }
};