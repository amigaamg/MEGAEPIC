import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Lazy Firestore getter – initializes Admin only once
function getFirestoreAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // If you paste the private key as a multi-line string, the replace may not be needed.
    // But it's safe: it replaces literal "\n" with actual newlines if present.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin environment variables missing. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('PayHero callback received:', body);

    const { status, reference, external_reference } = body;

    if (!external_reference) {
      return NextResponse.json({ error: 'Missing external_reference' }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const appointmentRef = db.collection('appointments').doc(external_reference);

    await appointmentRef.update({
      paymentStatus: status === 'success' ? 'paid' : 'failed',
      paymentRef: reference || null,
      paymentUpdatedAt: new Date().toISOString(),
    });

    // Optional: notify the doctor
    if (status === 'success') {
      const appointment = await appointmentRef.get();
      if (appointment.exists) {
        const data = appointment.data();
        if (data?.doctorId) {
          await db.collection('alerts').add({
            doctorId: data.doctorId,
            patientId: data.patientId,
            title: 'Payment received',
            body: `Payment of KES ${data.amount} confirmed.`,
            severity: 'low',
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayHero callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}