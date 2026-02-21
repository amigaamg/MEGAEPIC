// client/app/api/payhero-callback/route.ts
//
// PayHero posts to: https://epics-eyvx.onrender.com/api/payhero-callback
// (matches PAYHERO_CALLBACK_URL in your .env)
//
// PayHero callback body shape:
// {
//   "status": "SUCCESS" | "FAILED",
//   "external_reference": "<appointmentId you sent>",
//   "reference": "<payhero internal ref>",
//   "amount": 500,
//   "phone_number": "2547XXXXXXXX",
//   "transaction_date": "2024-01-01T12:00:00",
//   "MpesaReceiptNumber": "RGH23XYZ",
//   "description": "AMEXAN: Cardiology"
// }

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  // ── Always respond 200 immediately ────────────────────────────────────────
  // PayHero will keep retrying if we respond slowly. We acknowledge first,
  // then process asynchronously.
  let body: Record<string, any> = {};

  try {
    body = await req.json();
  } catch {
    // Malformed body — still return 200 to stop retries
    console.warn("PayHero callback: could not parse JSON body");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  console.log("📩 PayHero callback received:", JSON.stringify(body, null, 2));

  // Acknowledge PayHero immediately
  const acknowledgement = NextResponse.json({ received: true }, { status: 200 });

  // ── Process in background (Edge/Node streaming safe) ─────────────────────
  processCallback(body).catch((err) =>
    console.error("❌ Callback processing error:", err.message)
  );

  return acknowledgement;
}

async function processCallback(body: Record<string, any>) {
  const {
    status,
    external_reference: appointmentId,
    reference: payheroReference,
    amount,
    phone_number: phone,
    transaction_date: transactionDate,
    MpesaReceiptNumber: mpesaReceiptNumber,
    description,
  } = body;

  if (!appointmentId) {
    console.warn("⚠️  Callback missing external_reference — cannot update Firestore");
    return;
  }

  const isSuccess = String(status ?? "").toUpperCase() === "SUCCESS";
  const paymentStatus = isSuccess ? "paid" : "failed";

  const firestoreUpdate: Record<string, any> = {
    paymentStatus,
    paymentSettledAt: transactionDate ?? new Date().toISOString(),
    payheroReference: payheroReference ?? null,
    mpesaReceiptNumber: mpesaReceiptNumber ?? null,
    paymentCallbackRaw: body, // full payload for debugging
  };

  if (isSuccess) {
    firestoreUpdate.paidAmount = amount ?? null;
    firestoreUpdate.paidPhone = phone ?? null;
    firestoreUpdate.paidDescription = description ?? null;
  }

  // ── Update the appointment doc ────────────────────────────────────────────
  await adminDb
    .collection("appointments")
    .doc(String(appointmentId))
    .update(firestoreUpdate);

  console.log(`✅ Appointment ${appointmentId} → paymentStatus: ${paymentStatus}`);

  // ── Write audit record to /payments collection ────────────────────────────
  await adminDb.collection("payments").add({
    appointmentId: String(appointmentId),
    ...firestoreUpdate,
    createdAt: new Date().toISOString(),
  });

  console.log(`📝 Payment audit record written for appointment ${appointmentId}`);
}