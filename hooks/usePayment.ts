// client/hooks/usePayment.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase"; // your existing CLIENT-side Firebase instance

export type PaymentStatus = "idle" | "pending" | "paid" | "failed";

interface UsePaymentOptions {
  appointmentId: string;
  phone: string;
  amount: number;
  patientName: string;
  specialty?: string;
}

export function usePayment({
  appointmentId,
  phone,
  amount,
  patientName,
  specialty,
}: UsePaymentOptions) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Cleanup Firestore listener on unmount
  useEffect(() => () => { unsubRef.current?.(); }, []);

  async function initiatePayment() {
    setStatus("pending");
    setError(null);
    setMpesaReceipt(null);

    try {
      const res = await fetch("/api/payhero/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount, appointmentId, patientName, specialty }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "STK push failed. Please try again.");
      }

      // STK push sent — now listen for the callback via Firestore
      listenForResult();
    } catch (err: any) {
      setStatus("failed");
      setError(err.message);
    }
  }

  function listenForResult() {
    // Clear any existing listener
    unsubRef.current?.();

    const ref = doc(db, "appointments", appointmentId);

    // Auto-expire after 3 minutes (M-Pesa prompt times out at ~2 min)
    const timeout = setTimeout(() => {
      unsubRef.current?.();
      setStatus((prev) => (prev === "pending" ? "failed" : prev));
      setError("Payment timed out. Please check your M-Pesa and try again.");
    }, 3 * 60 * 1000);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data();
        if (!data) return;

        const ps: PaymentStatus = data.paymentStatus;

        if (ps === "paid") {
          clearTimeout(timeout);
          unsub();
          setStatus("paid");
          setMpesaReceipt(data.mpesaReceiptNumber ?? null);
        } else if (ps === "failed") {
          clearTimeout(timeout);
          unsub();
          setStatus("failed");
          setError("Payment was not completed. Please try again.");
        }
      },
      (err) => {
        clearTimeout(timeout);
        console.error("Firestore listener error:", err.message);
        setStatus("failed");
        setError("Could not verify payment status. Please contact support.");
      }
    );

    unsubRef.current = () => {
      clearTimeout(timeout);
      unsub();
    };
  }

  function reset() {
    unsubRef.current?.();
    setStatus("idle");
    setError(null);
    setMpesaReceipt(null);
  }

  return { status, error, mpesaReceipt, initiatePayment, reset };
}