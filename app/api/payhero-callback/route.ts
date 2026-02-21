// client/app/api/payhero-callback/route.ts
//
// PayHero posts to: https://epics-eyvx.onrender.com/api/payhero-callback
//
// Callback body PayHero sends:
// {
//   "status": "SUCCESS" | "FAILED",
//   "external_reference": "<appointmentId>",
//   "reference": "<payhero ref>",
//   "amount": 500,
//   "phone_number": "2547XXXXXXXX",
//   "transaction_date": "2024-01-01T12:00:00",
//   "MpesaReceiptNumber": "RGH23XYZ",
//   "description": "AMEXAN: Consultation"
// }

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  // ── ALWAYS respond 200 immediately ───────────────────────────────────
  // PayHero retries until it gets 200. Acknowledge first, process after.
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    console.warn("⚠️  PayHero callback: empty or invalid body");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  console.log("📩 PayHero callback:", JSON.stringify(body, null, 2));

  // Process asynchronously so we return 200 instantly
  void processCallback(body);

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processCallback(body: Record<string, any>) {
  const {
    status,
    external_reference: appointmentId,
    reference:          payheroReference,
    amount,
    phone_number:       phone,
    transaction_date:   transactionDate,
    MpesaReceiptNumber: mpesaReceiptNumber,
    description,
  } = body;

  if (!appointmentId) {
    console.warn("⚠️  Callback has no external_reference — skipping Firestore update");
    return;
  }

  const isSuccess    = String(status ?? "").toUpperCase() === "SUCCESS";
  const paymentStatus = isSuccess ? "paid" : "failed";

  const update: Record<string, any> = {
    paymentStatus,
    paymentSettledAt:   transactionDate ?? new Date().toISOString(),
    payheroReference:   payheroReference   ?? null,
    mpesaReceiptNumber: mpesaReceiptNumber ?? null,
    paymentCallbackRaw: body,
  };

  if (isSuccess) {
    update.paidAmount      = amount      ?? null;
    update.paidPhone       = phone       ?? null;
    update.paidDescription = description ?? null;
    update.paidAt          = new Date().toISOString();
  } else {
    update.paymentFailReason = body.failure_reason ?? body.ResultDesc ?? "Payment declined";
  }

  try {
    // Update the appointment document
    await adminDb
      .collection("appointments")
      .doc(String(appointmentId))
      .update(update);

    console.log(`✅ Appointment ${appointmentId} → ${paymentStatus}`);

    // Write audit record
    await adminDb.collection("payments").add({
      appointmentId: String(appointmentId),
      ...update,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Firestore update failed after callback:", err.message);
  }
}