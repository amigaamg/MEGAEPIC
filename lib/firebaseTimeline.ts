'use client';

import { db } from './firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, limit, Timestamp,
} from 'firebase/firestore';

export type TimelineEventType =
  | 'consultation' | 'admission' | 'discharge' | 'transfer'
  | 'medication_prescribed' | 'medication_stopped' | 'medication_adherence'
  | 'lab_ordered' | 'lab_result' | 'imaging_ordered' | 'imaging_result'
  | 'clinical_note' | 'procedure' | 'referral' | 'referral_response'
  | 'vital_recorded' | 'monitoring_alert'
  | 'education_delivered' | 'care_pathway_enrolled' | 'care_pathway_milestone'
  | 'alert_triggered' | 'task_assigned' | 'task_completed'
  | 'docket_assigned' | 'follow_up' | 'vaccination'
  | 'education' | 'referral' | 'communication' | 'system';

export interface TimelineEvent {
  id?: string;
  patientId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
  createdBy: string;
  createdAt: Timestamp | any;
  linkedDocId?: string;
  linkedCollection?: string;
  metadata?: Record<string, any>;
}

export async function writeTimelineEvent(event: Omit<TimelineEvent, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, 'timeline_events'), {
      ...event,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error('Failed to write timeline event:', e);
    return null;
  }
}

export function watchPatientTimeline(
  patientId: string,
  maxEvents: number = 100,
  onData: (events: TimelineEvent[]) => void,
  onError?: (err: Error) => void,
) {
  const q = query(
    collection(db, 'timeline_events'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc'),
    limit(maxEvents),
  );
  return onSnapshot(
    q,
    snap => {
      const events = snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent));
      onData(events);
    },
    error => onError?.(error),
  );
}

export const TIMELINE_EVENT_ICONS: Record<TimelineEventType, string> = {
  consultation: '🩺',
  admission: '🏥',
  discharge: '🏡',
  transfer: '🔄',
  medication_prescribed: '💊',
  medication_stopped: '⛔',
  medication_adherence: '✅',
  lab_ordered: '🔬',
  lab_result: '📊',
  imaging_ordered: '🩻',
  imaging_result: '📷',
  clinical_note: '📝',
  procedure: '🔧',
  referral: '📨',
  referral_response: '📩',
  vital_recorded: '❤️',
  monitoring_alert: '⚠️',
  education_delivered: '📖',
  education: '📚',
  care_pathway_enrolled: '🛤️',
  care_pathway_milestone: '🏁',
  alert_triggered: '🔔',
  task_assigned: '📋',
  task_completed: '✔️',
  docket_assigned: '📁',
  follow_up: '📅',
  vaccination: '💉',
  communication: '💬',
  system: '⚙️',
};

export const TIMELINE_SEVERITY_COLORS: Record<string, string> = {
  info: 'var(--accent)',
  warning: '#f59e0b',
  critical: '#ef4444',
  success: '#10b981',
};
