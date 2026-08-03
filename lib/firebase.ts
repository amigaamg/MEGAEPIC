import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}

// The Firebase App can be initialized during SSR — it is safe and inert until
// a network call is made. Only Auth truly requires a browser environment.
const _app = getFirebaseApp();
const _db = getFirestore(_app);
const _storage = getStorage(_app);

// Auth is browser-only: `onAuthStateChanged`, `setPersistence` etc. throw without
// a window/navigator. Initialize lazily and fall back to a no-op stub during SSR.
function getAuthSafe() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return undefined as unknown as ReturnType<typeof getAuth>;
  }
  return getAuth(_app);
}

export const app = _app;
export const db = _db;
export const storage = _storage;
export const auth = getAuthSafe();

export function initPersistence() {
  if (!auth) return;
  setPersistence(auth, browserSessionPersistence).catch((err) =>
    console.error('Failed to set auth persistence:', err)
  );
}

export default app;
