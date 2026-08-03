import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { type SubscriptionTier } from '@/lib/amexan/constitution/capability-engine';
import { getVerificationState } from '@/lib/firebase/verificationService';
import { getActorSession } from '@/lib/firebase/actorService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAdminAuth } from '@/lib/firebaseAdmin';



const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/quick-register',
  '/verify',
  '/recovery',
  '/clinical-auth',
  '/api/health',
  '/api/setup',
  '/api/payhero/callback',
  '/cos-landing',
  '/amexan-constitution',
  '/book-demo',
  '/cos-comprehensive',
  '/experience',
  '/demo',
  '/_next',
  '/favicon.ico',
]);

const PUBLIC_PREFIXES = [
  '/specialty-clinic',
  '/landing',
  '/book-demo',
  '/api/health',
  '/api/setup',
];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/admin',
  '/facility-admin',
  '/hmis',
  '/workspace',
  '/doctor',
  '/nurse',
  '/patients',
  '/patient',
  '/encounters',
  '/encounter-center',
  '/communications',
  '/search',
  '/prescribe',
  '/prescriptions',
  '/lab',
  '/laboratory',
  '/pharmacy',
  '/imaging',
  '/radiology',
  '/results',
  '/notes',
  '/documentation',
  '/referral',
  '/handover',
  '/assignments',
  '/care-team',
  '/schedule',
  '/billing',
  '/finance',
  '/inventory',
  '/reports',
  '/analytics',
  '/operations',
  '/api/encounters',
  '/api/patients',
  '/api/clinical',
  '/api/prescriptions',
  '/api/lab',
  '/api/imaging',
  '/api/pharmacy',
  '/api/billing',
  '/api/inventory',
];

const TIER_GATED_PATHS: Record<string, SubscriptionTier[]> = {
  '/analytics': ['professional', 'enterprise', 'national'],
  '/reports': ['professional', 'enterprise', 'national'],
  '/research': ['enterprise', 'national'],
  '/education': ['professional', 'enterprise', 'national'],
  '/marketplace': ['enterprise', 'national'],
  '/api/analytics': ['professional', 'enterprise', 'national'],
  '/api/research': ['enterprise', 'national'],
  '/api/education': ['professional', 'enterprise', 'national'],
  '/api/marketplace': ['enterprise', 'national'],
  '/api/fhir': ['enterprise', 'national'],
  '/api/pacs': ['enterprise', 'national'],
  '/api/lis': ['enterprise', 'national'],
  '/api/telemedicine': ['enterprise', 'national'],
};

const VERIFICATION_GATED_PATHS: Record<string, number> = {
  '/dashboard': 1,
  '/hmis': 2,
  '/prescribe': 3,
  '/api/prescriptions': 3,
  '/lab': 2,
  '/api/lab': 2,
  '/pharmacy': 2,
  '/api/pharmacy': 2,
  '/imaging': 2,
  '/api/imaging': 2,
  '/radiology': 2,
  '/api/radiology': 2,
  '/results': 2,
  '/api/results': 2,
  '/billing': 2,
  '/api/billing': 2,
  '/admin': 4,
  '/api/admin': 4,
  '/facility-admin': 3,
  '/api/facility-admin': 3,
};

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function isProtectedPath(pathname: string): boolean {
  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function getRequiredTiers(pathname: string): SubscriptionTier[] | null {
  for (const [prefix, tiers] of Object.entries(TIER_GATED_PATHS)) {
    if (pathname.startsWith(prefix)) return tiers;
  }
  return null;
}

async function getOrgSubscriptionTier(orgId: string): Promise<SubscriptionTier> {
  try {
    const orgSnap = await getDoc(doc(db, 'organizations', orgId));
    if (orgSnap.exists()) {
      const data = orgSnap.data();
      const tier = data.subscriptionTier;
      if (tier === 'starter' || tier === 'professional' || tier === 'enterprise' || tier === 'national') {
        return tier;
      }
    }
  } catch { /* ignore */ }
  return 'starter';
}

async function verifySubscriptionTier(uid: string, pathname: string): Promise<boolean> {
  try {
    const actorResult = await getActorSession(uid);
    if (!actorResult || !actorResult.activeOrganizationId) return false;
    const userTier = await getOrgSubscriptionTier(actorResult.activeOrganizationId);
    const requiredTiers = getRequiredTiers(pathname);
    if (!requiredTiers) return true;
    return requiredTiers.includes(userTier);
  } catch (e) {
    console.warn('Subscription tier check failed:', e);
    return false;
  }
}

function getRequiredVerificationLevel(pathname: string): number | null {
  for (const [prefix, level] of Object.entries(VERIFICATION_GATED_PATHS)) {
    if (pathname.startsWith(prefix)) return level;
  }
  return null;
}

async function verifyFirebaseToken(
  token: string
): Promise<{
  uid: string;
  email?: string;
  emailVerified?: boolean;
} | null> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);

    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified,
    };
  } catch (error) {
    console.error('Firebase Admin token verification failed:', error);
    return null;
  }
}
export default async function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const claims = await verifyFirebaseToken(sessionCookie);
  if (!claims) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('__session');
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-uid', claims.uid);
  if (claims.email) requestHeaders.set('x-user-email', claims.email);
  if (claims.emailVerified !== undefined) requestHeaders.set('x-user-email-verified', String(claims.emailVerified));

  // Subscription tier gating
  const requiredTiers = getRequiredTiers(pathname);
  if (requiredTiers) {
    try {
      const hasAccess = await verifySubscriptionTier(claims.uid, pathname);
      if (!hasAccess) {
        const forbiddenUrl = new URL('/dashboard', request.url);
        forbiddenUrl.searchParams.set('error', 'insufficient_subscription');
        return NextResponse.redirect(forbiddenUrl);
      }
    } catch (e) {
      console.warn('Subscription check failed:', e);
    }
  }

  // Verification level gating
  const requiredLevel = getRequiredVerificationLevel(pathname);
  if (requiredLevel) {
    try {
      const actorResult = await getActorSession(claims.uid);
      if (actorResult?.session.identity?.uid) {
        const vState = await getVerificationState(actorResult.session.identity.uid as string);
        const currentLevel = vState?.currentLevel ?? 0;
        if (currentLevel < requiredLevel) {
          const verifyUrl = new URL('/verify', request.url);
          verifyUrl.searchParams.set('next', pathname);
          verifyUrl.searchParams.set('required', String(requiredLevel));
          return NextResponse.redirect(verifyUrl);
        }
      }
    } catch (e) {
      console.warn('Verification check failed:', e);
    }
  }

  requestHeaders.set('x-verification-level', String(requiredLevel ?? 0));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.woff$|.*\\.woff2$).*)'],
};