import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

const SEED_USERS = [
  {
    email: 'doctor@amexan.test',
    password: 'Doctor123!',
    displayName: 'Dr. Chris Mugambi',
    profile: {
      accountType: 'clinician',
      clinicianRole: 'doctor',
      specialty: 'GENERAL',
      country: 'Kenya',
      onboardingStatus: 'profile_pending',
      organizations: [],
    },
  },
  {
    email: 'hospital@amexan.test',
    password: 'Hospital123!',
    displayName: 'Aga Khan Hospital Admin',
    profile: {
      accountType: 'facility',
      facilityName: 'Aga Khan University Hospital',
      facilityType: 'hospital',
      country: 'Kenya',
      departments: ['Internal Medicine', 'Surgery', 'Pediatrics', 'OB/GYN'],
      onboardingStatus: 'profile_pending',
      organizations: [],
    },
  },
];

export async function GET() {
  const results: { email: string; uid?: string; status: string; error?: string }[] = [];

  for (const user of SEED_USERS) {
    try {
      const existing = await getAdminAuth().getUserByEmail(user.email).catch(() => null);
      if (existing) {
        results.push({ email: user.email, uid: existing.uid, status: 'already exists' });
        continue;
      }
      const record = await getAdminAuth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
      });
      await getAdminDb().collection('users').doc(record.uid).set({
        uid: record.uid,
        email: user.email,
        displayName: user.displayName,
        ...user.profile,
        createdAt: Date.now(),
      });
      results.push({ email: user.email, uid: record.uid, status: 'created' });
    } catch (err: any) {
      results.push({ email: user.email, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({ success: true, users: results });
}
