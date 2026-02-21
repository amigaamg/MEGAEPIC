// client/app/api/payhero-callback/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "../../../lib/firebaseAdmin";

// ⚠️  getAdminDb() called INSIDE handlers only — not at module level.

export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    console.warn("⚠️  PayHero callback: empty or malformed body");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  console.log("📩 PayHero callback:", JSON.stringify(body, null, 2));

  // Respond 200 immediately, process in background
  void processCallback(body);
  return NextResponse.json({ received: true }, { status: 200 });
}

async function processCallback(body: Record<string, any>) {
  const adminDb = getAdminDb(); // lazy init inside async fn — safe

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
    console.warn("⚠️  Callback missing external_reference");
    return;
  }

  const isSuccess     = String(status ?? "").toUpperCase() === "SUCCESS";
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
    update.paymentFailReason =
      body.failure_reason ?? body.ResultDesc ?? "Payment declined or timed out";
  }

  try {
    await adminDb.collection("appointments").doc(String(appointmentId)).update(update);
    console.log(`✅ Appointment ${appointmentId} → ${paymentStatus}`);

    await adminDb.collection("payments").add({
      appointmentId: String(appointmentId),
      ...update,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Firestore update failed:", err.message);
  }
}