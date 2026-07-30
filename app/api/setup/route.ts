import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import {
  getAllSeedEmails,
  getSeedProfileByEmail,
  SEED_ORGANIZATIONS,
  SEED_CLINICAL_USERS,
  SEED_NURSES,
  SEED_ALLIED_HEALTH,
  SEED_STAFF,
  SEED_STUDENTS,
  SEED_PATIENTS,
  SEED_API_TOKENS,
} from '@/lib/amexan/seed-config';

/**
 * GET  /api/setup?email=xxx  →  returns seed profile for that email
 * GET  /api/setup            →  returns list of all seed emails + count
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (email) {
    const profile = getSeedProfileByEmail(email);
    if (!profile) {
      return NextResponse.json({ found: false, email }, { status: 404 });
    }
    return NextResponse.json({ found: true, profile });
  }

  const allEmails = getAllSeedEmails();
  return NextResponse.json({
    total: allEmails.length,
    emails: allEmails,
    profiles: ['developer', 'minimal', 'teaching'],
  });
}

/**
 * POST /api/setup  →  seeds the full developer environment
 * Body: { profile: 'developer' | 'minimal' | 'teaching', dryRun?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const profile = body.profile || 'developer';
    const dryRun = body.dryRun === true;

    const auth = getAdminAuth();
    const db = getAdminDb();
    const results: Record<string, any> = { created: [], skipped: [], errors: [] };
    const batch = db.batch();
    let ops = 0;

    function queue(path: string, data: any) {
      if (dryRun) return;
      batch.set(db.doc(path), data, { merge: true });
      ops++;
    }

    // 1. Organizations
    for (const org of SEED_ORGANIZATIONS) {
      queue(`organizations/${org.id}`, {
        ...org,
        status: 'active',
        verified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pricingTier: org.pricingTier || 'free',
        config: {
          branding: { primaryColor: '#2F80ED', secondaryColor: '#1a5bbf', accentColor: '#14b8a6', fontFamily: 'Inter' },
          clinical: { defaultWards: [], defaultClinics: [], defaultTheatres: [], diagnosisCodeSystem: 'icd_10', medicationCodeSystem: 'local', labCodeSystem: 'local', imagingCodeSystem: 'local', enableTelemedicine: false, enableAI: true, enableResearch: false },
          billing: { currency: 'KES', taxRate: 0, consultationFees: {}, bedCharges: {}, pharmacyMarkup: 0, labMarkup: 0, imagingMarkup: 0, insuranceAccepted: [], paymentMethods: ['cash', 'mpesa'] },
          integrations: { fhirEnabled: false, hl7Enabled: false, externalHmisEnabled: false, aiServicesEnabled: true, apiEnabled: false },
          documentHeader: { logoUrl: '', facilityName: org.name, facilityAddress: '', facilityPhone: '', facilityEmail: '', headerTemplate: '', footerTemplate: '' },
        },
        license: { licenseNumber: `LIC-${org.id.toUpperCase()}`, licenseType: 'health_facility', issuingAuthority: 'MOH', issuedAt: Date.now(), expiresAt: Date.now() + 365 * 86400000, renewedAt: Date.now(), status: 'approved' },
      });
      results.created.push(`org/${org.id}`);
    }

    // 2. Users (Auth + Firestore)
    const allUsers = [...SEED_CLINICAL_USERS, ...SEED_NURSES, ...SEED_ALLIED_HEALTH, ...SEED_STAFF, ...SEED_STUDENTS];

    for (const user of allUsers) {
      try {
        let uid: string;
        if (!dryRun) {
          const existing = await auth.getUserByEmail(user.email).catch(() => null);
          if (existing) {
            uid = existing.uid;
            results.skipped.push(`auth/${user.email}`);
          } else {
            const record = await auth.createUser({
              email: user.email,
              password: user.password,
              displayName: user.name,
            });
            uid = record.uid;
            results.created.push(`auth/${user.email}`);
          }
        } else {
          uid = `dryrun_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }

        const amxUid = user.amxUid || `AMX-PERSON-${uid.slice(0, 8).toUpperCase()}`;

        queue(`users/${uid}`, {
          amxUid,
          email: user.email,
          name: user.name,
          role: user.role,
          registrationStep: 'complete',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        queue(`identities/${amxUid}`, {
          uid: amxUid,
          email: user.email,
          phone: user.phone || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLoginAt: Date.now(),
          verified: true,
          twoFactorEnabled: false,
          authProvider: 'email',
          status: 'active',
        });

        queue(`persons/${amxUid}`, {
          uid: amxUid,
          identityId: amxUid,
          fullName: user.name,
          givenName: user.name.split(' ')[0] || user.name,
          familyName: user.name.split(' ').slice(1).join(' ') || '',
          dateOfBirth: '',
          gender: 'undisclosed',
          nationality: 'Kenya',
          nationalId: '',
          address: { country: 'Kenya', county: '' },
        });

        if (user.role !== 'patient' && user.role !== 'medical_student') {
          queue(`professional_identities/${amxUid}`, {
            uid: amxUid,
            personId: amxUid,
            categories: [user.role],
            primaryCategory: user.role,
            specialties: user.specialty ? [user.specialty] : [],
            qualifications: [],
            yearsOfExperience: 5,
            licenseNumber: user.license || '',
            verified: true,
          });
        }
      } catch (err: any) {
        results.errors.push(`user/${user.email}: ${err.message}`);
      }
    }

    // 3. Patients
    for (const patient of SEED_PATIENTS) {
      try {
        let uid: string;
        if (!dryRun) {
          const existing = await auth.getUserByEmail(patient.email).catch(() => null);
          if (existing) {
            uid = existing.uid;
            results.skipped.push(`auth/${patient.email}`);
          } else {
            const record = await auth.createUser({
              email: patient.email,
              password: 'Patient123!',
              displayName: patient.name,
            });
            uid = record.uid;
            results.created.push(`auth/${patient.email}`);
          }
        } else {
          uid = `dryrun_${patient.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }

        const amxUid = `AMX-PATIENT-${uid.slice(0, 8).toUpperCase()}`;
        const amxpId = `AMXPID-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        queue(`users/${uid}`, { amxUid, email: patient.email, name: patient.name, role: 'patient', registrationStep: 'complete', createdAt: Date.now(), updatedAt: Date.now() });
        queue(`identities/${amxUid}`, { uid: amxUid, email: patient.email, phone: '', createdAt: Date.now(), updatedAt: Date.now(), lastLoginAt: Date.now(), verified: true, authProvider: 'email', status: 'active' });
        queue(`persons/${amxUid}`, { uid: amxUid, identityId: amxUid, fullName: patient.name, givenName: patient.name.split(' ')[0] || patient.name, familyName: patient.name.split(' ').slice(1).join(' ') || '', dateOfBirth: '', gender: patient.sex || 'undisclosed', nationality: 'Kenya', nationalId: '', address: { country: 'Kenya', county: '' } });
        queue(`patients/${uid}`, { amxpId, amxUid, fullName: patient.name, email: patient.email, context: patient.context, age: patient.age, sex: patient.sex, conditions: patient.conditions || [], pregnant: patient.pregnant || false, weeksPregnant: patient.weeksPregnant || 0, createdAt: Date.now(), updatedAt: Date.now() });

        results.created.push(`patient/${patient.email}`);
      } catch (err: any) {
        results.errors.push(`patient/${patient.email}: ${err.message}`);
      }
    }

    // 4. API Tokens
    for (const token of SEED_API_TOKENS) {
      queue(`api_tokens/${token.type}_${token.orgId}`, {
        ...token,
        active: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + 365 * 86400000,
      });
      results.created.push(`api_token/${token.type}_${token.orgId}`);
    }

    if (!dryRun && ops > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      profile,
      dryRun,
      ops,
      results,
      message: dryRun
        ? `Dry run complete. ${ops} operations would be committed.`
        : `Seeded ${results.created.length} resources (${results.skipped.length} skipped, ${results.errors.length} errors).`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
