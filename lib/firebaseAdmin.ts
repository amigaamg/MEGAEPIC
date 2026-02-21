// client/lib/firebaseAdmin.ts
//
// KEY DESIGN: Nothing runs at module import time.
// getAdminDb() is called INSIDE route handlers only → safe during build.

import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _db: Firestore | null = null;

function createApp(): App {
  if (_app) return _app;

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey      = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      `Firebase Admin env vars missing at runtime.\n` +
      `FIREBASE_PROJECT_ID:   ${projectId   ? "✓" : "✗ MISSING"}\n` +
      `FIREBASE_CLIENT_EMAIL: ${clientEmail ? "✓" : "✗ MISSING"}\n` +
      `FIREBASE_PRIVATE_KEY:  ${rawKey      ? "✓" : "✗ MISSING"}`
    );
  }

  // Normalise the private key regardless of how Render stored it
  const privateKey = rawKey
    .replace(/^["']|["']$/g, "") // strip any wrapping quotes
    .replace(/\\n/g, "\n");      // literal \n → real newline

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY does not look like a valid PEM key. " +
      "Check the value in your Render environment variables."
    );
  }

  _app = getApps().length === 0
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    : getApps()[0];

  return _app;
}

/** Call this inside route handlers — never at the top level of a module */
export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(createApp());
  return _db;
}