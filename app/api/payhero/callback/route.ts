/**
 * client/app/api/payhero/callback/route.ts
 *
 * NOTE: Your .env.local points PayHero callbacks to your Render backend:
 *   PAYHERO_CALLBACK_URL=https://megaepic.onrender.com/api/payhero-callback
 *
 * So this Next.js route is a FALLBACK / LOCAL DEV version.
 * For production, the actual callback handler lives in your Express server at:
 *   megaepic.onrender.com  →  /api/payhero-callback
 *
 * If you ever want to switch callbacks to Next.js instead, change
 * PAYHERO_CALLBACK_URL to:
 *   https://yourdomain.com/api/payhero/callback
 * and deploy this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * For your EXPRESS server (megaepic.onrender.com), add this route:
 *
 *   app.post('/api/payhero-callback', express.json(), async (req, res) => {
 *     const payload = req.body;
 *     const appointmentId = payload.external_reference ?? payload.data?.external_reference;
 *     if (!appointmentId) return res.json({ success: true });
 *
 *     const rawStatus = (payload.status ?? payload.data?.status ?? '').toUpperCase();
 *     const isSuccess = rawStatus === 'SUCCESS' || rawStatus === 'COMPLETED' || payload.ResultCode === 0;
 *     const ref = payload.reference ?? payload.CheckoutRequestID ?? payload.data?.reference ?? null;
 *
 *     const adminDb = getAdminDb(); // your Firebase Admin instance
 *     if (isSuccess) {
 *       await adminDb.collection('appointments').doc(appointmentId).update({
 *         paymentStatus: 'paid',
 *         paymentCompletedAt: new Date().toISOString(),
 *         ...(ref ? { payheroReference: ref } : {}),
 *       });
 *     } else {
 *       await adminDb.collection('appointments').doc(appointmentId).update({
 *         paymentStatus: 'failed',
 *         paymentFailReason: payload.ResultDesc ?? rawStatus ?? 'unknown',
 *       });
 *     }
 *     res.json({ success: true });
 *   });
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "../../../../lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  let payload: Record<string, any>;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[PayHero Callback]", JSON.stringify(payload, null, 2));

  const appointmentId: string | undefined =
    payload.external_reference ?? payload.data?.external_reference;

  if (!appointmentId) {
    console.warn("[PayHero Callback] No external_reference — ignoring");
    return NextResponse.json({ success: true, note: "no external_reference" });
  }

  const rawStatus = (payload.status ?? payload.data?.status ?? "").toString().toUpperCase();
  const isSuccess =
    rawStatus === "SUCCESS" ||
    rawStatus === "COMPLETED" ||
    payload.ResultCode === 0;

  const ref: string | null =
    payload.reference ??
    payload.CheckoutRequestID ??
    payload.data?.reference ??
    null;

  const adminDb = getAdminDb();

  try {
    if (isSuccess) {
      await adminDb.collection("appointments").doc(appointmentId).update({
        paymentStatus: "paid",
        paymentCompletedAt: new Date().toISOString(),
        ...(ref ? { payheroReference: ref } : {}),
        ...(payload.amount ? { amount: payload.amount } : {}),
      });
      console.log(`[PayHero Callback] ✅ PAID — appointment ${appointmentId}`);
    } else {
      const reason = payload.ResultDesc ?? rawStatus ?? "Payment failed";
      await adminDb.collection("appointments").doc(appointmentId).update({
        paymentStatus: "failed",
        paymentFailReason: reason,
        paymentFailedAt: new Date().toISOString(),
      });
      console.log(`[PayHero Callback] ❌ FAILED — appointment ${appointmentId}: ${reason}`);
    }
  } catch (err) {
    console.error("[PayHero Callback] Firestore update failed:", err);
    // Return 200 anyway — don't cause PayHero to retry indefinitely
  }

  return NextResponse.json({ success: true });
}