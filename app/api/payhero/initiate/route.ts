// client/app/api/payhero/initiate/route.ts
// ⚠️  Rename/move the current initiate.ts into this file:
//     app/api/payhero/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

type RequestBody = {
  phone: string;
  amount: number;
  appointmentId: string;
  patientName: string;
  specialty?: string;
};

/** Normalise any KE number → 254XXXXXXXXX */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  return "254" + digits;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { phone, amount, appointmentId, patientName, specialty } = body;

  // ── Validate required fields ──────────────────────────────────────────────
  if (!phone || !amount || !appointmentId || !patientName) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  // ── Validate env vars ─────────────────────────────────────────────────────
  const channelId = Number(process.env.PAYHERO_CHANNEL_ID);
  const auth = process.env.PAYHERO_AUTH;
  const callbackUrl = process.env.PAYHERO_CALLBACK_URL;

  if (!channelId || !auth || !callbackUrl) {
    console.error("❌ PayHero env vars missing:", { channelId, auth: !!auth, callbackUrl });
    return NextResponse.json({ message: "Payment gateway not configured" }, { status: 500 });
  }

  const normalised = normalisePhone(phone);

  // ── 1. Pre-flight Firestore write (pending) ───────────────────────────────
  try {
    await adminDb.collection("appointments").doc(appointmentId).set(
      {
        paymentStatus: "pending",
        paymentInitiatedAt: new Date().toISOString(),
        patientPhone: normalised,
        amount,
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error("Firestore pre-write failed:", err.message);
    // non-fatal — still attempt STK push
  }

  // ── 2. Fire STK push ──────────────────────────────────────────────────────
  try {
    const payheroRes = await axios.post(
      "https://backend.payhero.co.ke/api/v2/payments",
      {
        amount,
        phone_number: normalised,
        channel_id: channelId,
        provider: "m-pesa",
        external_reference: appointmentId,   // ← echoed back in the callback
        customer_name: patientName,
        description: `AMEXAN: ${specialty ?? "Consultation"}`,
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        timeout: 30_000,
      }
    );

    const data = payheroRes.data ?? {};
    const payheroReference =
      data.reference ?? data.CheckoutRequestID ?? data.checkout_request_id ?? null;

    // ── 3. Save PayHero reference for reconciliation ──────────────────────
    if (payheroReference) {
      await adminDb
        .collection("appointments")
        .doc(appointmentId)
        .update({ payheroReference });
    }

    console.log(`✅ STK push sent for appointment ${appointmentId}`, data);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    const errData = error.response?.data;
    console.error("❌ STK Push Error:", errData ?? error.message);

    // Roll back status so the UI can surface a retry
    await adminDb
      .collection("appointments")
      .doc(appointmentId)
      .update({ paymentStatus: "failed" })
      .catch(() => {});

    return NextResponse.json(
      {
        success: false,
        message: errData?.message ?? "STK push failed",
        raw: errData,
      },
      { status: 500 }
    );
  }
}