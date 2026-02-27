/**
 * client/lib/payment-utils.ts
 *
 * Shared client-side payment helpers.
 * Import safePost and handlePay in your booking component.
 */

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── safePost ─────────────────────────────────────────────────────────────────
/**
 * POST JSON to an internal Next.js API route.
 * Throws a human-readable Error on any non-2xx response.
 */
export async function safePost<T = Record<string, any>>(
  url: string,
  body: Record<string, any>
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status}). Please try again.`);
  }

  if (!res.ok) {
    // Prefer the server's own error message
    const msg =
      data?.error ?? data?.message ?? data?.detail ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

// ─── Phone validation ─────────────────────────────────────────────────────────
/**
 * Validates Kenyan Safaricom / Airtel numbers in all common formats.
 *
 * Valid examples:
 *   0712345678   0112345678
 *   +254712345678  +254112345678
 *   254712345678   254112345678
 */
export function validateKenyanPhone(phone: string): boolean {
  const p = phone.trim();
  return /^(07\d{8}|01\d{8}|\+2547\d{8}|\+2541\d{8}|2547\d{8}|2541\d{8})$/.test(p);
}

// ─── handlePay ────────────────────────────────────────────────────────────────
export interface HandlePayParams {
  phone: string;
  apptId: string;
  svc: { price: number; specialty: string };
  patient: { name: string };
  setLoading: (v: boolean) => void;
  setError: (msg: string) => void;
  setStep: (s: string) => void;
  setExistingApptId: (id: string) => void;
}

/**
 * Initiates M-Pesa payment for an appointment.
 *
 * Usage:
 *   await handlePay({ phone, apptId, svc, patient, setLoading, setError, setStep, setExistingApptId });
 *   // or with an override ID (retry flow):
 *   await handlePay({ ... }, existingApptId);
 */
export async function handlePay(
  params: HandlePayParams,
  targetApptId?: string
): Promise<void> {
  const { phone, apptId, svc, patient, setLoading, setError, setStep, setExistingApptId } = params;
  const id = targetApptId ?? apptId;

  /* 1 — Validate phone */
  if (!validateKenyanPhone(phone)) {
    setError("Enter a valid Safaricom/Airtel number (e.g. 0712 345 678 or +254712345678)");
    return;
  }

  setLoading(true);
  setError("");

  try {
    /* 2 — Call the Next.js API route */
    const data = await safePost<{ success: boolean; data?: Record<string, any> }>(
      "/api/payhero/initiate",
      {
        phone: phone.trim(),
        amount: svc.price,
        appointmentId: id,
        patientName: patient.name,
        specialty: svc.specialty,
      }
    );

    /* 3 — Optimistic Firestore update
           The PayHero callback at megaepic.onrender.com/api/payhero-callback
           will set the authoritative final status ("paid" or "failed").
           We write "processing" immediately so the UI responds without waiting. */
    const paymentRef =
      data?.data?.reference ??
      data?.data?.CheckoutRequestID ??
      data?.data?.checkout_request_id ??
      "";

    await updateDoc(doc(db, "appointments", id), {
      paymentRef,
      paymentStatus: "processing",
      phone: phone.trim(),
    });

    setStep("done");
  } catch (e: any) {
    setError(e?.message ?? "Payment failed. Please try again.");
    setExistingApptId(id); // allow retry without re-creating the appointment
  } finally {
    setLoading(false);
  }
}