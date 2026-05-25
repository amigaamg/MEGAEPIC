"use client";
/**
 * AMEXAN MySQL Hooks
 * Uses SWR for caching + revalidation instead of Firebase onSnapshot.
 * Same return shape as Sprint 1 Firebase hooks — drop-in compatible.
 *
 * Install: npm install swr
 */

import useSWR, { mutate } from "swr";
import { useCallback, useState } from "react";
import { amexanApi } from "../lib/amexanApi";
import { computeBPStatus, computeBPStats, toBPChartData, addRollingAverage } from "../lib/bpStats";
import type {
  Patient, PatientTool, BPEntry, Prescription,
  ClinicalNote, FollowUp, LabOrder, SystemAlert,
  Complication, HTNDashboardData,
} from "../types";
import { API } from "../lib/amexanApi";

// ─────────────────────────────────────────────────────────────
// SWR config — poll every 30s for near-real-time feel
// ─────────────────────────────────────────────────────────────

const SWR_CONFIG = {
  refreshInterval:    30_000,   // re-fetch every 30s
  revalidateOnFocus:  true,
  dedupingInterval:   5_000,
};

// ─────────────────────────────────────────────────────────────
// useDashboard — single call, all HTN data
// Most panels should use this — one SQL query beats 8 round trips
// ─────────────────────────────────────────────────────────────

export function useDashboard(toolId: string) {
  const { data, error, isLoading } = useSWR<HTNDashboardData>(
    toolId ? API.dashboard(toolId) : null,
    () => amexanApi.getDashboard(toolId),
    SWR_CONFIG
  );
  return { dashboard: data, loading: isLoading, error };
}

// ─────────────────────────────────────────────────────────────
// usePatient
// ─────────────────────────────────────────────────────────────

export function usePatient(patientId: string) {
  const { data, error, isLoading } = useSWR<Patient>(
    patientId ? API.patient(patientId) : null,
    () => amexanApi.getPatient(patientId),
    SWR_CONFIG
  );
  return { patient: data, loading: isLoading, error };
}

// ─────────────────────────────────────────────────────────────
// useTool
// ─────────────────────────────────────────────────────────────

export function useTool(toolId: string) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<PatientTool>(
    toolId ? API.tool(toolId) : null,
    () => amexanApi.getTool(toolId),
    SWR_CONFIG
  );

  const updateThresholds = useCallback(
    async (thresholds: PatientTool["alertThresholds"]) => {
      await amexanApi.updateTool(toolId, { alertThresholds: thresholds });
      revalidate();
    },
    [toolId, revalidate]
  );

  return { tool: data, loading: isLoading, error, updateThresholds };
}

// ─────────────────────────────────────────────────────────────
// useBPEntries — with computed stats + chart data
// ─────────────────────────────────────────────────────────────

export function useBPEntries(
  toolId: string,
  patientId: string,
  thresholds?: PatientTool["alertThresholds"]
) {
  const [submitting, setSubmitting] = useState(false);

  const { data: entries = [], error, isLoading, mutate: revalidate } = useSWR<BPEntry[]>(
    toolId ? API.bpEntries(toolId) : null,
    () => amexanApi.getBPEntries(toolId),
    SWR_CONFIG
  );

  const defaultThresholds = thresholds ?? {
    systolicCritical: 180, diastolicCritical: 120,
    systolicWarning: 160,  diastolicWarning: 100,
    systolicTarget: 130,   diastolicTarget: 80,
    hypotensionSystolic: 90, adherenceLow: 70,
    bpReadingGapDays: 3, uncontrolledReadingsCount: 7, uncontrolledReadingsDays: 14,
  };

  const stats     = entries.length ? computeBPStats(entries, defaultThresholds) : null;
  const chartData = addRollingAverage(toBPChartData([...entries].reverse(), defaultThresholds));

  const logBP = useCallback(
    async (input: {
      systolic: number; diastolic: number;
      heartRate?: number; notes?: string;
      loggedBy: "doctor" | "patient"; loggedByUid: string;
    }) => {
      setSubmitting(true);
      try {
        const status = computeBPStatus(input.systolic, input.diastolic, defaultThresholds);
        const entry = await amexanApi.createBPEntry({
          toolId, patientId, ...input,
          flagged: status === "crisis" || status === "high",
          status,
        });
        // Optimistic prepend
        mutate(API.bpEntries(toolId), [entry, ...entries], false);
        revalidate();
        return entry;
      } finally {
        setSubmitting(false);
      }
    },
    [toolId, patientId, entries, defaultThresholds, revalidate]
  );

  return { entries, chartData, stats, loading: isLoading, submitting, error, logBP };
}

// ─────────────────────────────────────────────────────────────
// usePrescriptions
// ─────────────────────────────────────────────────────────────

export function usePrescriptions(toolId: string, patientId: string) {
  const { data: prescriptions = [], error, isLoading, mutate: revalidate } = useSWR<Prescription[]>(
    toolId ? API.prescriptions(toolId) : null,
    () => amexanApi.getPrescriptions(toolId),
    SWR_CONFIG
  );

  const active  = prescriptions.filter(p => p.status === "active");
  const stopped = prescriptions.filter(p => p.status !== "active");

  const prescribe = useCallback(
    async (data: Partial<Prescription>) => {
      const rx = await amexanApi.createPrescription({ ...data, toolId, patientId });
      revalidate();
      return rx;
    },
    [toolId, patientId, revalidate]
  );

  const adjustDose = useCallback(
    async (id: string, newDose: string, reason: string, doctorId: string) => {
      await amexanApi.adjustDose(id, newDose, reason, doctorId);
      revalidate();
    },
    [revalidate]
  );

  const stopDrug = useCallback(
    async (id: string, reason: string, doctorId: string) => {
      await amexanApi.stopDrug(id, reason, doctorId);
      revalidate();
    },
    [revalidate]
  );

  return { prescriptions, active, stopped, loading: isLoading, error, prescribe, adjustDose, stopDrug };
}

// ─────────────────────────────────────────────────────────────
// useFollowUps
// ─────────────────────────────────────────────────────────────

export function useFollowUps(toolId: string, patientId: string) {
  const { data: followUps = [], error, isLoading, mutate: revalidate } = useSWR<FollowUp[]>(
    toolId ? API.followUps(toolId) : null,
    () => amexanApi.getFollowUps(toolId),
    SWR_CONFIG
  );

  const upcoming       = followUps.filter(f => f.status === "scheduled");
  const attended       = followUps.filter(f => f.status === "attended");
  const missed         = followUps.filter(f => f.status === "missed");
  const attendanceRate = attended.length + missed.length > 0
    ? Math.round((attended.length / (attended.length + missed.length)) * 100) : 100;

  const scheduleVisit = useCallback(
    async (data: { scheduledDate: Date; type: FollowUp["type"]; notes?: string; scheduledBy: string }) => {
      const fu = await amexanApi.createFollowUp({ toolId, patientId, ...data, status: "scheduled" } as any);
      revalidate();
      return fu;
    },
    [toolId, patientId, revalidate]
  );

  const markAttended = useCallback(
    async (id: string, noteId?: string) => {
      await amexanApi.updateFollowUp(id, { status: "attended", ...(noteId ? { linkedNoteId: noteId } : {}) });
      revalidate();
    },
    [revalidate]
  );

  const markMissed = useCallback(
    async (id: string, reason?: string) => {
      await amexanApi.updateFollowUp(id, { status: "missed", reasonForMissing: reason });
      revalidate();
    },
    [revalidate]
  );

  return { followUps, upcoming, attended, missed, attendanceRate, loading: isLoading, error, scheduleVisit, markAttended, markMissed };
}

// ─────────────────────────────────────────────────────────────
// useClinicalNotes
// ─────────────────────────────────────────────────────────────

export function useClinicalNotes(toolId: string) {
  const { data: notes = [], error, isLoading, mutate: revalidate } = useSWR<ClinicalNote[]>(
    toolId ? API.notes(toolId) : null,
    () => amexanApi.getNotes(toolId),
    SWR_CONFIG
  );

  const addNote = useCallback(
    async (data: Partial<ClinicalNote>) => {
      const note = await amexanApi.createNote(data);
      revalidate();
      return note;
    },
    [revalidate]
  );

  return { notes, loading: isLoading, error, addNote };
}

// ─────────────────────────────────────────────────────────────
// useAlerts
// ─────────────────────────────────────────────────────────────

export function useAlerts(toolId: string) {
  const { data: alerts = [], error, isLoading, mutate: revalidate } = useSWR<SystemAlert[]>(
    toolId ? API.alerts(toolId) : null,
    () => amexanApi.getAlerts(toolId),
    { ...SWR_CONFIG, refreshInterval: 10_000 } // poll more aggressively for alerts
  );

  const active   = alerts.filter(a => a.isActive);
  const critical = active.filter(a => a.type === "critical");
  const warnings = active.filter(a => a.type === "warning");

  const acknowledge = useCallback(
    async (id: string) => {
      await amexanApi.acknowledgeAlert(id);
      revalidate();
    },
    [revalidate]
  );

  return { alerts, active, critical, warnings, loading: isLoading, error, acknowledge };
}

// ─────────────────────────────────────────────────────────────
// useLabOrders
// ─────────────────────────────────────────────────────────────

export function useLabOrders(toolId: string, patientId: string, doctorId: string) {
  const { data: orders = [], error, isLoading, mutate: revalidate } = useSWR<LabOrder[]>(
    toolId ? API.labs(toolId) : null,
    () => amexanApi.getLabs(toolId),
    SWR_CONFIG
  );

  const orderLabs = useCallback(
    async (tests: string[], priority: LabOrder["priority"], indication: string) => {
      const lab = await amexanApi.createLab({ toolId, patientId, orderedBy: doctorId, tests, priority, indication, status: "pending" });
      revalidate();
      return lab;
    },
    [toolId, patientId, doctorId, revalidate]
  );

  const pending  = orders.filter(o => o.status === "pending");
  const resulted = orders.filter(o => ["resulted", "reviewed"].includes(o.status));

  return { orders, pending, resulted, loading: isLoading, error, orderLabs };
}

// ─────────────────────────────────────────────────────────────
// useComplications
// ─────────────────────────────────────────────────────────────

export function useComplications(toolId: string) {
  const { data: complications = [], error, isLoading, mutate: revalidate } = useSWR<Complication[]>(
    toolId ? API.complications(toolId) : null,
    () => amexanApi.getComplications(toolId),
    SWR_CONFIG
  );

  const active = complications.filter(c => c.status === "active");

  const logComplication = useCallback(
    async (data: Partial<Complication>) => {
      const comp = await amexanApi.createComplication(data);
      revalidate();
      return comp;
    },
    [revalidate]
  );

  return { complications, active, loading: isLoading, error, logComplication };
}