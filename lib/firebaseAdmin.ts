/**
 * client/lib/firebaseAdmin.ts
 *
 * Firebase Admin SDK — singleton initialisation.
 * Server-only. Never import this in client components.
 *
 * Your .env.local already has the correct vars:
 *   FIREBASE_PROJECT_ID=telemed-a98cf
 *   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@telemed-a98cf.iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 */

import * as admin from "firebase-admin";

function getAdminApp(): admin.app.App {
  // Reuse across hot-reloads in Next.js dev mode
  if (admin.apps.length > 0) return admin.apps[0]!;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set in .env.local");

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // .env.local escapes newlines as \n — restore real newlines here
      privateKey:  privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

/** Call inside API route handlers only — never at module top-level */
export function getAdminDb(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}