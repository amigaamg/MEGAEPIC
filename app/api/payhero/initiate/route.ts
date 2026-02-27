/**
 * client/app/api/payhero/initiate/route.ts
 *
 * Initiates an M-Pesa STK push via PayHero.
 *
 * Your .env.local values used here:
 *   PAYHERO_AUTH=Basic QTBKWHY0VVhlaVl4N1A4ZzhpdFA6ZWEzNVllSDhWcHpHeEoyUDNzN2VndTh5NnBHcVdRdWFjUjYyVjBKUQ==
 *   PAYHERO_CHANNEL_ID=3183
 *   PAYHERO_CALLBACK_URL=https://megaepic.onrender.com/api/payhero-callback
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

// ─── Phone normalisation ──────────────────────────────────────────────────────
// PayHero expects plain digits: 254712345678 (no + prefix, no spaces)
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;       // 254712345678
  if (digits.startsWith("0"))   return "254" + digits.slice(1); // 0712... → 254712...
  return "254" + digits;                             // 712... → 254712...
}

// ─── Auth header ──────────────────────────────────────────────────────────────
// PAYHERO_AUTH in .env.local is already "Basic <base64>" — use it directly.
// This function handles all three storage formats just in case.
function buildAuthHeader(): string {
  const raw = (process.env.PAYHERO_AUTH ?? "").trim();
  if (!raw) throw new Error("PAYHERO_AUTH env variable is not set");
  if (raw.startsWith("Basic ")) return raw;         // already complete ✓
  if (raw.includes(":"))        return "Basic " + Buffer.from(raw).toString("base64"); // user:pass
  return "Basic " + raw;                            // bare base64
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  /* 1 ── Parse body */
  let body: {
    phone?: string;
    amount?: number;
    appointmentId?: string;
    patientName?: string;
    specialty?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { phone, amount, appointmentId, patientName, specialty } = body;

  if (!phone || !amount || !appointmentId || !patientName) {
    return NextResponse.json(
      { success: false, error: "phone, amount, appointmentId and patientName are all required" },
      { status: 400 }
    );
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return NextResponse.json(
      { success: false, error: "amount must be a positive number" },
      { status: 400 }
    );
  }

  /* 2 ── Guard env vars */
  const channelId = Number(process.env.PAYHERO_CHANNEL_ID); // 3183
  const callbackUrl = process.env.PAYHERO_CALLBACK_URL;     // https://megaepic.onrender.com/api/payhero-callback

  if (!channelId || isNaN(channelId)) {
    console.error("[PayHero] PAYHERO_CHANNEL_ID is missing or not a number");
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: channel" },
      { status: 500 }
    );
  }
  if (!callbackUrl) {
    console.error("[PayHero] PAYHERO_CALLBACK_URL is not set");
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: callback URL" },
      { status: 500 }
    );
  }

  const normalisedPhone = normalisePhone(phone);

  /* 3 ── Mark appointment as pending in Firestore */
  const adminDb = getAdminDb();

  try {
    await adminDb
      .collection("appointments")
      .doc(appointmentId)
      .set(
        {
          paymentStatus: "pending",
          paymentInitiatedAt: new Date().toISOString(),
          amount: numericAmount,
          patientPhone: normalisedPhone,
        },
        { merge: true }
      );
  } catch (err) {
    console.error("[PayHero] Firestore pending-write failed:", err);
    return NextResponse.json(
      { success: false, error: "Database error — please retry" },
      { status: 500 }
    );
  }

  /* 4 ── Send STK push to PayHero */
  let payheroRes: Response;
  let data: Record<string, any>;

  try {
    payheroRes = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: {
        Authorization: buildAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: numericAmount,
        phone_number: normalisedPhone,
        channel_id: channelId,                            // 3183
        provider: "m-pesa",
        external_reference: appointmentId,                // used by callback to find the appointment
        customer_name: patientName,
        description: `AMEXAN: ${specialty ?? "Consultation"}`,
        callback_url: callbackUrl,                        // https://megaepic.onrender.com/api/payhero-callback
      }),
    });

    data = await payheroRes.json();
  } catch (err: any) {
    console.error("[PayHero] Network/parse error:", err);
    await adminDb
      .collection("appointments")
      .doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: err.message })
      .catch(() => {});
    return NextResponse.json(
      { success: false, error: "Could not reach PayHero — please try again" },
      { status: 502 }
    );
  }

  /* 5 ── Handle PayHero error */
  if (!payheroRes.ok) {
    const reason =
      data?.message ?? data?.error ?? data?.detail ?? `PayHero error ${payheroRes.status}`;
    console.error("[PayHero] STK push failed:", data);
    await adminDb
      .collection("appointments")
      .doc(appointmentId)
      .update({ paymentStatus: "failed", paymentFailReason: reason })
      .catch(() => {});
    return NextResponse.json({ success: false, error: reason, data }, { status: 400 });
  }

  /* 6 ── Save reference returned by PayHero */
  // PayHero can return the reference under several field names — check all of them
  const ref: string | null =
    data?.reference ??
    data?.CheckoutRequestID ??
    data?.checkout_request_id ??
    data?.data?.reference ??
    data?.data?.CheckoutRequestID ??
    data?.data?.checkout_request_id ??
    null;

  if (ref) {
    await adminDb
      .collection("appointments")
      .doc(appointmentId)
      .update({ paymentStatus: "processing", payheroReference: ref })
      .catch((err) => console.warn("[PayHero] Could not save reference:", err));
  } else {
    console.warn("[PayHero] No reference field in response:", data);
  }

  console.log(`[PayHero] STK push sent — appointment: ${appointmentId}, ref: ${ref}`);

  return NextResponse.json({ success: true, data });
}