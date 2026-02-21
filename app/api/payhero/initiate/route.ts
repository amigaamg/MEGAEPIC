// client/app/api/payhero/initiate/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "../../../../lib/firebaseAdmin";

// ⚠️  getAdminDb() is called INSIDE the handler, not at module level.
//     This means Firebase Admin only initialises on a real HTTP request,
//     never during `next build`.

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0"))   return "254" + digits.slice(1);
  return "254" + digits;
}

export async function POST(req: NextRequest) {
  // Lazy init — safe at runtime, not touched at build time
  const adminDb = getAdminDb();

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { phone, amount, appointmentId, patientName, specialty } = body;

  if (!phone || !amount || !appointmentId || !patientName) {
    return NextResponse.json(
      { success: false, message: "Missing fields: phone, amount, appointmentId, patientName" },
      { status: 400 }
    );
  }

  const channelId   = Number(process.env.PAYHERO_CHANNEL_ID);
  const auth        = process.env.PAYHERO_AUTH;
  const callbackUrl = process.env.PAYHERO_CALLBACK_URL;

  if (!channelId || !auth || !callbackUrl) {
    console.error("❌ PayHero env vars missing");
    return NextResponse.json(
      { success: false, message: "Payment gateway not configured." },
      { status: 500 }
    );
  }

  const normalisedPhone = normalisePhone(phone);

  // 1. Mark pending in Firestore
  try {
    await adminDb.collection("appointments").doc(appointmentId).set(
      { paymentStatus: "pending", paymentInitiatedAt: new Date().toISOString(), patientPhone: normalisedPhone, amount },
      { merge: true }
    );
  } catch (e: any) {
    console.warn("Firestore pre-write warning:", e.message);
  }

  // 2. Fire STK push
  let payheroRes: Response;
  try {
    payheroRes = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method:  "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        phone_number:       normalisedPhone,
        channel_id:         channelId,
        provider:           "m-pesa",
        external_reference: appointmentId,
        customer_name:      patientName,
        description:        `AMEXAN: ${specialty ?? "Consultation"}`,
        callback_url:       callbackUrl,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e: any) {
    console.error("❌ PayHero network error:", e.message);
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: e.message }).catch(() => {});
    return NextResponse.json(
      { success: false, message: "Could not reach payment gateway." },
      { status: 502 }
    );
  }

  // 3. Parse response
  let payheroData: Record<string, any>;
  try {
    payheroData = await payheroRes.json();
  } catch {
    console.error("❌ PayHero non-JSON response, status:", payheroRes.status);
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: "Invalid gateway response" }).catch(() => {});
    return NextResponse.json(
      { success: false, message: "Unexpected response from payment gateway." },
      { status: 502 }
    );
  }

  if (!payheroRes.ok) {
    const msg = payheroData?.message ?? `PayHero error ${payheroRes.status}`;
    console.error("❌ STK push rejected:", payheroData);
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: msg }).catch(() => {});
    return NextResponse.json(
      { success: false, message: msg, raw: payheroData },
      { status: 400 }
    );
  }

  // 4. Save reference
  const ref =
    payheroData?.reference ??
    payheroData?.CheckoutRequestID ??
    payheroData?.checkout_request_id ?? null;

  if (ref) {
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ payheroReference: ref, paymentStatus: "processing" }).catch(() => {});
  }

  console.log(`✅ STK push sent — appt: ${appointmentId}, ref: ${ref}`);
  return NextResponse.json({ success: true, data: payheroData }, { status: 200 });
}