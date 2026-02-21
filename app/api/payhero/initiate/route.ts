// client/app/api/payhero/initiate/route.ts
//
// ⚠️  IMPORTANT — FILE LOCATION:
//     The file MUST live at:  app/api/payhero/initiate/route.ts
//     NOT at:                 app/api/payhero/initiate.ts
//
//     If initiate.ts exists alongside this folder, DELETE it — Next.js
//     will try to serve the old file and return an HTML error page.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

/** Normalise any KE number to 254XXXXXXXXX */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  return "254" + digits;
}

export async function POST(req: NextRequest) {
  // ── Parse body safely ─────────────────────────────────────────────────
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { phone, amount, appointmentId, patientName, specialty } = body;

  // ── Validate required fields ──────────────────────────────────────────
  if (!phone || !amount || !appointmentId || !patientName) {
    return NextResponse.json(
      { success: false, message: "Missing required fields: phone, amount, appointmentId, patientName" },
      { status: 400 }
    );
  }

  // ── Validate env vars (fail fast with a clear message) ───────────────
  const channelId = Number(process.env.PAYHERO_CHANNEL_ID);
  const auth      = process.env.PAYHERO_AUTH;
  const callbackUrl = process.env.PAYHERO_CALLBACK_URL;

  if (!channelId || !auth || !callbackUrl) {
    console.error("❌ PayHero env vars not set:", {
      PAYHERO_CHANNEL_ID: !!process.env.PAYHERO_CHANNEL_ID,
      PAYHERO_AUTH:       !!process.env.PAYHERO_AUTH,
      PAYHERO_CALLBACK_URL: !!process.env.PAYHERO_CALLBACK_URL,
    });
    return NextResponse.json(
      { success: false, message: "Payment gateway is not configured. Contact support." },
      { status: 500 }
    );
  }

  const normalisedPhone = normalisePhone(phone);

  // ── 1. Write "pending" to Firestore before STK push ──────────────────
  try {
    await adminDb.collection("appointments").doc(appointmentId).set(
      {
        paymentStatus: "pending",
        paymentInitiatedAt: new Date().toISOString(),
        patientPhone: normalisedPhone,
        amount,
      },
      { merge: true }
    );
  } catch (err: any) {
    // Non-fatal — log and continue
    console.warn("Firestore pre-write warning:", err.message);
  }

  // ── 2. Fire STK push ──────────────────────────────────────────────────
  let payheroRes: Response;
  try {
    payheroRes = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        phone_number: normalisedPhone,
        channel_id: channelId,
        provider: "m-pesa",
        external_reference: appointmentId,   // echoed in callback
        customer_name: patientName,
        description: `AMEXAN: ${specialty ?? "Consultation"}`,
        callback_url: callbackUrl,
      }),
      // @ts-ignore — Node 18+ supports signal
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: any) {
    console.error("❌ PayHero network error:", err.message);
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: err.message })
      .catch(() => {});
    return NextResponse.json(
      { success: false, message: "Could not reach payment gateway. Please try again." },
      { status: 502 }
    );
  }

  // ── 3. Parse PayHero response ─────────────────────────────────────────
  let payheroData: Record<string, any>;
  try {
    payheroData = await payheroRes.json();
  } catch {
    const raw = await payheroRes.text().catch(() => "");
    console.error("❌ PayHero non-JSON response:", raw);
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: "Invalid response from gateway" })
      .catch(() => {});
    return NextResponse.json(
      { success: false, message: "Unexpected response from payment gateway." },
      { status: 502 }
    );
  }

  if (!payheroRes.ok) {
    const msg = payheroData?.message ?? `PayHero error ${payheroRes.status}`;
    console.error("❌ STK push rejected:", payheroData);
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: msg })
      .catch(() => {});
    return NextResponse.json(
      { success: false, message: msg, raw: payheroData },
      { status: 400 }
    );
  }

  // ── 4. Save PayHero reference for reconciliation ──────────────────────
  const payheroReference =
    payheroData?.reference ??
    payheroData?.CheckoutRequestID ??
    payheroData?.checkout_request_id ??
    null;

  if (payheroReference) {
    await adminDb.collection("appointments").doc(appointmentId)
      .update({ payheroReference, paymentStatus: "processing" })
      .catch(() => {});
  }

  console.log(`✅ STK push sent — appointment: ${appointmentId}, ref: ${payheroReference}`);
  return NextResponse.json({ success: true, data: payheroData }, { status: 200 });
}