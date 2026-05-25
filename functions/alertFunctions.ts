/**
 * AMEXAN Cloud Functions — Alert Engine
 *
 * Triggers:
 *   onBPEntryCreated   — evaluates all BP alert rules on every new reading
 *   onNightlyCheck     — scheduled function: checks gaps, overdue labs, missed visits
 *
 * Deploy:
 *   firebase deploy --only functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type {
  BPEntry,
  PatientTool,
  Prescription,
  AdherenceEntry,
  FollowUp,
  LabOrder,
  SystemAlert,
} from "../types";
import {
  evalBPCrisis,
  evalHypotension,
  evalEmergencyPattern,
  evalUncontrolledPattern,
  evalNonAdherence,
  evalMissedFollowUp,
  evalOverdueLab,
  evalBPImproving,
  buildAlert,
} from "../lib/alertEngine";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────
// TRIGGER 1: ON BP ENTRY CREATED
// ─────────────────────────────────────────────────────────────

export const onBPEntryCreated = functions
  .region("us-central1")
  .firestore.document("bpEntries/{entryId}")
  .onCreate(async (snap, context) => {
    const entry = { id: snap.id, ...snap.data() } as BPEntry;
    const { toolId, patientId } = entry;

    console.log(`[AlertEngine] New BP entry: ${entry.systolic}/${entry.diastolic} for patient ${patientId}`);

    // ── Load tool + recent entries in parallel ──────────────────
    const [toolSnap, recentEntriesSnap, followUpsSnap, labsSnap] = await Promise.all([
      db.doc(`patientTools/${toolId}`).get(),
      db.collection("bpEntries")
        .where("toolId", "==", toolId)
        .orderBy("timestamp", "desc")
        .limit(30)
        .get(),
      db.collection("followUps")
        .where("toolId", "==", toolId)
        .where("status", "==", "scheduled")
        .get(),
      db.collection("labOrders")
        .where("toolId", "==", toolId)
        .where("status", "==", "pending")
        .get(),
    ]);

    if (!toolSnap.exists) {
      console.warn(`[AlertEngine] Tool ${toolId} not found`);
      return null;
    }

    const tool = { id: toolSnap.id, ...toolSnap.data() } as PatientTool;
    const recentEntries = recentEntriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as BPEntry));
    const doctorId = tool.doctorId;

    // ── Evaluate all rules ───────────────────────────────────────
    const evaluations = [
      evalBPCrisis(entry, tool),
      evalHypotension(entry, tool),
      evalEmergencyPattern(recentEntries, tool),
      evalUncontrolledPattern(recentEntries, tool),
      evalBPImproving(recentEntries, tool),
    ];

    const alertsToWrite: Omit<SystemAlert, "id">[] = [];

    for (const evaluation of evaluations) {
      if (!evaluation.shouldFire) continue;

      // Deduplicate: don't fire same trigger twice in 24h
      const recentAlert = await db.collection("systemAlerts")
        .where("toolId", "==", toolId)
        .where("trigger", "==", evaluation.trigger)
        .where("isActive", "==", true)
        .orderBy("sentAt", "desc")
        .limit(1)
        .get();

      if (!recentAlert.empty) {
        const lastFired = recentAlert.docs[0].data().sentAt?.toMillis() ?? 0;
        if (Date.now() - lastFired < 24 * 60 * 60 * 1000) {
          console.log(`[AlertEngine] Skipping ${evaluation.trigger} — already fired in last 24h`);
          continue;
        }
      }

      alertsToWrite.push(buildAlert(evaluation, toolId, patientId, doctorId));
    }

    // ── Write all alerts in batch ────────────────────────────────
    if (alertsToWrite.length > 0) {
      const batch = db.batch();
      for (const alertData of alertsToWrite) {
        const ref = db.collection("systemAlerts").doc();
        batch.set(ref, alertData);
      }
      await batch.commit();
      console.log(`[AlertEngine] Wrote ${alertsToWrite.length} alert(s) for patient ${patientId}`);
    }

    // ── Send push notifications via FCM ─────────────────────────
    const criticalAlerts = alertsToWrite.filter(a => a.type === "critical");
    if (criticalAlerts.length > 0) {
      await sendCriticalPushNotifications(patientId, doctorId, criticalAlerts);
    }

    return null;
  });

// ─────────────────────────────────────────────────────────────
// TRIGGER 2: NIGHTLY SCHEDULED CHECK
// Runs at 06:00 EAT (03:00 UTC) every day
// ─────────────────────────────────────────────────────────────

export const nightlyCheck = functions
  .region("us-central1")
  .pubsub.schedule("0 3 * * *")
  .timeZone("Africa/Nairobi")
  .onRun(async () => {
    console.log("[NightlyCheck] Starting...");

    // Get all active tools
    const toolsSnap = await db.collection("patientTools")
      .where("status", "==", "active")
      .get();

    let alertsCreated = 0;

    for (const toolDoc of toolsSnap.docs) {
      const tool = { id: toolDoc.id, ...toolDoc.data() } as PatientTool;
      const { id: toolId, patientId, doctorId } = tool;

      const msDay = 86_400_000;

      // ── Check BP reading gap ──────────────────────────────────
      const lastBPSnap = await db.collection("bpEntries")
        .where("toolId", "==", toolId)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (!lastBPSnap.empty) {
        const lastBP = lastBPSnap.docs[0].data();
        const daysSince = (Date.now() - lastBP.timestamp.toMillis()) / msDay;
        if (daysSince >= tool.alertThresholds.bpReadingGapDays) {
          await createAlertIfNew(toolId, patientId, doctorId, "bp_reading_gap", {
            shouldFire: true,
            trigger: "bp_reading_gap",
            type: "info",
            message: `📊 BP READING GAP: No BP readings logged for ${Math.floor(daysSince)} days. Patient reminder sent.`,
            patientMessage: `It's been ${Math.floor(daysSince)} days since your last blood pressure reading. Please log your BP today.`,
            value: { daysSince: Math.floor(daysSince) },
          });
          alertsCreated++;
        }
      }

      // ── Check missed follow-ups ───────────────────────────────
      const scheduledVisitsSnap = await db.collection("followUps")
        .where("toolId", "==", toolId)
        .where("status", "==", "scheduled")
        .get();

      for (const visitDoc of scheduledVisitsSnap.docs) {
        const visit = { id: visitDoc.id, ...visitDoc.data() } as FollowUp;
        const evaluation = evalMissedFollowUp(visit);
        if (evaluation.shouldFire) {
          await db.doc(`followUps/${visit.id}`).update({ status: "missed" });
          await createAlertIfNew(toolId, patientId, doctorId, "missed_follow_up", evaluation);
          alertsCreated++;
        }
      }

      // ── Check overdue labs ────────────────────────────────────
      const pendingLabsSnap = await db.collection("labOrders")
        .where("toolId", "==", toolId)
        .where("status", "==", "pending")
        .get();

      for (const labDoc of pendingLabsSnap.docs) {
        const lab = { id: labDoc.id, ...labDoc.data() } as LabOrder;
        const evaluation = evalOverdueLab(lab);
        if (evaluation.shouldFire) {
          await createAlertIfNew(toolId, patientId, doctorId, "overdue_lab", evaluation);
          alertsCreated++;
        }
      }

      // ── Send 48h visit reminders ──────────────────────────────
      const upcoming48hSnap = await db.collection("followUps")
        .where("toolId", "==", toolId)
        .where("status", "==", "scheduled")
        .where("reminderSent", "==", false)
        .get();

      for (const visitDoc of upcoming48hSnap.docs) {
        const visit = visitDoc.data() as FollowUp;
        const hoursUntil = (visit.scheduledDate.toMillis() - Date.now()) / (1000 * 3600);
        if (hoursUntil > 0 && hoursUntil <= 48) {
          await db.doc(`followUps/${visitDoc.id}`).update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`[NightlyCheck] Sent reminder for visit ${visitDoc.id}`);
        }
      }
    }

    console.log(`[NightlyCheck] Done. ${alertsCreated} alerts created.`);
    return null;
  });

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

async function createAlertIfNew(
  toolId: string,
  patientId: string,
  doctorId: string,
  trigger: string,
  evaluation: { shouldFire: boolean; trigger: any; type: any; message: string; patientMessage: string; value: any }
) {
  const recent = await db.collection("systemAlerts")
    .where("toolId", "==", toolId)
    .where("trigger", "==", trigger)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (!recent.empty) return; // already active

  const alertData = buildAlert(evaluation, toolId, patientId, doctorId);
  await db.collection("systemAlerts").add(alertData);
}

async function sendCriticalPushNotifications(
  patientId: string,
  doctorId: string,
  alerts: Omit<SystemAlert, "id">[]
) {
  // Fetch FCM tokens from patient and doctor documents
  const [patientSnap, doctorSnap] = await Promise.all([
    db.doc(`patients/${patientId}`).get(),
    db.doc(`doctors/${doctorId}`).get(),
  ]);

  const tokens: string[] = [];
  const patientToken = patientSnap.data()?.fcmToken;
  const doctorToken  = doctorSnap.data()?.fcmToken;
  if (patientToken) tokens.push(patientToken);
  if (doctorToken)  tokens.push(doctorToken);

  if (!tokens.length) return;

  for (const alert of alerts) {
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title: alert.type === "critical" ? "⚠️ AMEXAN Critical Alert" : "AMEXAN Alert",
        body:  alert.patientMessage ?? alert.message,
      },
      data: {
        trigger:   alert.trigger,
        toolId:    alert.toolId,
        patientId: alert.patientId,
      },
      android: { priority: "high" },
      apns:    { payload: { aps: { sound: "default", badge: 1 } } },
    });
  }
}