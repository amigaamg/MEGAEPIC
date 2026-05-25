// lib/useBPMonitor.ts
// Real-time Firebase hooks for AMEXAN BP Intelligence

"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path to your firebase config

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  recordedAt: Date;
  source: "patient" | "clinic" | "device";
  notes?: string;
}

export interface Medication {
  id: string;
  drug: string;
  dose: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
}

export interface PatientActivity {
  id: string;
  type: "bp_logged" | "login" | "medication_confirmed";
  timestamp: Date;
}

// ─── BP Readings Hook ─────────────────────────────────────────────────────────

export function useBPReadings(patientId: string, limitCount = 90) {
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const q = query(
      collection(db, "patients", patientId, "bpReadings"),
      orderBy("recordedAt", "asc"),
      limit(limitCount)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data: BPReading[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            systolic: d.systolic,
            diastolic: d.diastolic,
            pulse: d.pulse,
            recordedAt:
              d.recordedAt instanceof Timestamp
                ? d.recordedAt.toDate()
                : new Date(d.recordedAt),
            source: d.source ?? "patient",
            notes: d.notes,
          };
        });
        setReadings(data);
        setLoading(false);
      },
      (err) => {
        console.error("BP readings error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [patientId, limitCount]);

  return { readings, loading, error };
}

// ─── Medications Hook ─────────────────────────────────────────────────────────

export function useMedications(patientId: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const q = query(
      collection(db, "patients", patientId, "medications"),
      orderBy("startDate", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Medication[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          drug: d.drug,
          dose: d.dose,
          startDate:
            d.startDate instanceof Timestamp
              ? d.startDate.toDate()
              : new Date(d.startDate),
          endDate:
            d.endDate instanceof Timestamp
              ? d.endDate.toDate()
              : d.endDate
              ? new Date(d.endDate)
              : undefined,
          prescribedBy: d.prescribedBy,
        };
      });
      setMedications(data);
      setLoading(false);
    });

    return () => unsub();
  }, [patientId]);

  return { medications, loading };
}

// ─── Patient Activity Hook ────────────────────────────────────────────────────

export function usePatientActivity(patientId: string, limitCount = 60) {
  const [activity, setActivity] = useState<PatientActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const q = query(
      collection(db, "patients", patientId, "activity"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data: PatientActivity[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          type: d.type,
          timestamp:
            d.timestamp instanceof Timestamp
              ? d.timestamp.toDate()
              : new Date(d.timestamp),
        };
      });
      setActivity(data);
      setLoading(false);
    });

    return () => unsub();
  }, [patientId]);

  return { activity, loading };
}

// ─── Chart Data Formatter ─────────────────────────────────────────────────────

export function formatReadingsForChart(readings: BPReading[]) {
  return readings.map((r) => ({
    date: r.recordedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    fullDate: r.recordedAt,
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse,
    source: r.source,
    category: classifyForChart(r.systolic, r.diastolic),
  }));
}

function classifyForChart(sys: number, dia: number): string {
  if (sys >= 180 || dia >= 120) return "crisis";
  if (sys >= 140 || dia >= 90) return "stage2";
  if (sys >= 130 || dia >= 80) return "stage1";
  if (sys >= 120) return "elevated";
  return "normal";
}