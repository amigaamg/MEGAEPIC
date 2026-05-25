// lib/wallTimeline.ts
// ═══════════════════════════════════════════════════════════════════════════
// Merges toolReadings, clinicalNotes, prescriptions, labOrders,
// imagingOrders, referrals, and alerts into ONE chronological stream
// for the "Full timeline" view and for chart drug-event markers
// ═══════════════════════════════════════════════════════════════════════════

import {
  collection, query, where, orderBy, limit,
  onSnapshot, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TimelineEventType =
  | 'reading'
  | 'note'
  | 'prescription_start'
  | 'prescription_stop'
  | 'lab_ordered'
  | 'lab_resulted'
  | 'imaging_ordered'
  | 'imaging_reported'
  | 'referral'
  | 'alert'
  | 'milestone';

export interface TimelineEvent {
  id:        string;
  type:      TimelineEventType;
  timestamp: Date;
  toolType?: string;
  title:     string;
  summary:   string;
  severity:  'normal' | 'info' | 'warning' | 'critical';
  data:      any;
}

// ── Convert Firestore timestamp to JS Date ───────────────────────────────────
const toDate = (ts: any): Date => {
  if (!ts) return new Date(0);
  if (ts?.toDate) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

// ── Severity mapping ─────────────────────────────────────────────────────────
const triageToSeverity = (level?: string): TimelineEvent['severity'] => {
  if (!level || level === 'normal') return 'normal';
  if (level === 'watch')    return 'info';
  if (level === 'video')    return 'info';
  if (level === 'clinic')   return 'warning';
  if (level === 'hospital') return 'critical';
  return 'normal';
};

const urgencyToSeverity = (urgency?: string): TimelineEvent['severity'] => {
  if (urgency === 'emergency') return 'critical';
  if (urgency === 'urgent')    return 'warning';
  return 'info';
};

// ── Subscribe to the full merged timeline ────────────────────────────────────
export function subscribeToTimeline(
  patientId: string,
  callback: (events: TimelineEvent[]) => void,
  options: { limit?: number } = {}
): () => void {
  const maxItems = options.limit ?? 300;
  const accumulated: Record<string, TimelineEvent> = {};

  const notify = () => {
    const sorted = Object.values(accumulated)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems);
    callback(sorted);
  };

  // Tool readings
  const u1 = onSnapshot(
    query(collection(db,'toolReadings'), where('patientId','==',patientId), orderBy('recordedAt','desc'), limit(200)),
    snap => {
      snap.docs.forEach(d => {
        const r = { id:d.id, ...d.data() } as any;
        const cfg = r.toolType || 'unknown';
        const val = r.toolType==='bp_monitor'
          ? `${r.data?.systolic}/${r.data?.diastolic} mmHg`
          : r.data?.[Object.keys(r.data||{})[0]] ?? '—';
        accumulated[`reading-${d.id}`] = {
          id: `reading-${d.id}`, type:'reading', toolType:r.toolType,
          timestamp: toDate(r.recordedAt),
          title: `${r.toolType} reading: ${val}`,
          summary: r.triage?.message || r.triage?.label || 'Reading logged',
          severity: triageToSeverity(r.triage?.level),
          data: r,
        };
      });
      notify();
    }
  );

  // Clinical notes
  const u2 = onSnapshot(
    query(collection(db,'clinicalNotes'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(100)),
    snap => {
      snap.docs.forEach(d => {
        const n = { id:d.id, ...d.data() } as any;
        accumulated[`note-${d.id}`] = {
          id:`note-${d.id}`, type:'note', toolType:n.toolType,
          timestamp: toDate(n.createdAt),
          title: `${n.type?.toUpperCase()} note${n.tags?.length ? ` — ${n.tags.slice(0,2).join(', ')}` : ''}`,
          summary: n.type==='soap'
            ? n.content?.assessment || n.content?.subjective || 'Clinical note'
            : n.content?.text?.slice(0,80) || 'Clinical note',
          severity: 'info',
          data: n,
        };
      });
      notify();
    }
  );

  // Prescriptions
  const u3 = onSnapshot(
    query(collection(db,'prescriptions'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(100)),
    snap => {
      snap.docs.forEach(d => {
        const p = { id:d.id, ...d.data() } as any;
        accumulated[`rx-start-${d.id}`] = {
          id:`rx-start-${d.id}`, type:'prescription_start', toolType:p.toolType,
          timestamp: toDate(p.startDate || p.createdAt),
          title: `${p.medication} ${p.dosage} started`,
          summary: `${p.frequency} · ${p.indication || ''}${p.reason ? ` · Reason: ${p.reason}` : ''}`,
          severity: 'info',
          data: p,
        };
        if (!p.active && p.endDate) {
          accumulated[`rx-stop-${d.id}`] = {
            id:`rx-stop-${d.id}`, type:'prescription_stop', toolType:p.toolType,
            timestamp: toDate(p.endDate),
            title: `${p.medication} stopped`,
            summary: p.stoppedReason || 'Medication discontinued',
            severity: 'warning',
            data: p,
          };
        }
      });
      notify();
    }
  );

  // Lab orders
  const u4 = onSnapshot(
    query(collection(db,'labOrders'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(100)),
    snap => {
      snap.docs.forEach(d => {
        const l = { id:d.id, ...d.data() } as any;
        accumulated[`lab-${d.id}`] = {
          id:`lab-${d.id}`, type:'lab_ordered', toolType:l.toolType,
          timestamp: toDate(l.createdAt),
          title: `Lab ordered: ${l.tests?.slice(0,3).join(', ')}${l.tests?.length>3?'…':''}`,
          summary: `${l.priority?.toUpperCase()} · ${l.clinicalInfo || ''}`,
          severity: urgencyToSeverity(l.priority==='stat'?'emergency':l.priority),
          data: l,
        };
        if (l.resultedAt) {
          accumulated[`lab-result-${d.id}`] = {
            id:`lab-result-${d.id}`, type:'lab_resulted', toolType:l.toolType,
            timestamp: toDate(l.resultedAt),
            title: 'Lab results available',
            summary: l.results?.map((r:any)=>`${r.test}: ${r.value} ${r.unit}${r.flag&&r.flag!=='N'?` [${r.flag}]`:''}`).join(' · ') || 'Results ready',
            severity: l.results?.some((r:any)=>r.flag==='H'||r.flag==='L') ? 'warning' : 'normal',
            data: l,
          };
        }
      });
      notify();
    }
  );

  // Imaging orders
  const u5 = onSnapshot(
    query(collection(db,'imagingOrders'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50)),
    snap => {
      snap.docs.forEach(d => {
        const im = { id:d.id, ...d.data() } as any;
        accumulated[`img-${d.id}`] = {
          id:`img-${d.id}`, type:'imaging_ordered', toolType:im.toolType,
          timestamp: toDate(im.createdAt),
          title: `${im.modality} — ${im.region} ordered`,
          summary: `${im.priority?.toUpperCase()} · ${im.indication}`,
          severity: urgencyToSeverity(im.priority),
          data: im,
        };
        if (im.report) {
          accumulated[`img-report-${d.id}`] = {
            id:`img-report-${d.id}`, type:'imaging_reported', toolType:im.toolType,
            timestamp: toDate(im.createdAt), // use same date; ideal would have reportedAt
            title: `${im.modality} report available`,
            summary: im.report.slice(0, 100),
            severity: 'info',
            data: im,
          };
        }
      });
      notify();
    }
  );

  // Referrals
  const u6 = onSnapshot(
    query(collection(db,'referrals'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50)),
    snap => {
      snap.docs.forEach(d => {
        const r = { id:d.id, ...d.data() } as any;
        accumulated[`ref-${d.id}`] = {
          id:`ref-${d.id}`, type:'referral', toolType:r.toolType,
          timestamp: toDate(r.createdAt),
          title: `Referral → ${r.specialty}`,
          summary: `${r.urgency?.toUpperCase()} · ${r.reason}`,
          severity: urgencyToSeverity(r.urgency),
          data: r,
        };
      });
      notify();
    }
  );

  // Alerts
  const u7 = onSnapshot(
    query(collection(db,'alerts'), where('patientId','==',patientId), orderBy('createdAt','desc'), limit(100)),
    snap => {
      snap.docs.forEach(d => {
        const a = { id:d.id, ...d.data() } as any;
        accumulated[`alert-${d.id}`] = {
          id:`alert-${d.id}`, type:'alert',
          timestamp: toDate(a.createdAt),
          title: a.title,
          summary: a.message,
          severity: urgencyToSeverity(a.urgency),
          data: a,
        };
      });
      notify();
    }
  );

  return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); };
}

// ── Get drug events for a date range (for chart markers) ────────────────────
export function getDrugEventsForChart(
  events: TimelineEvent[],
  toolType?: string
): Array<{ date: Date; medication: string; type: 'start' | 'stop'; reason?: string }> {
  return events
    .filter(e => e.type === 'prescription_start' || e.type === 'prescription_stop')
    .map(e => ({
      date:       e.timestamp,
      medication: e.data?.medication || '—',
      type:       e.type === 'prescription_start' ? 'start' as const : 'stop' as const,
      reason:     e.data?.reason || e.data?.stoppedReason,
    }));
}

// ── Format timeline event for display ────────────────────────────────────────
export function formatTimelineEvent(event: TimelineEvent): {
  icon: string; color: string; bg: string;
} {
  const ICON: Record<TimelineEventType, string> = {
    reading:              '📊',
    note:                 '📝',
    prescription_start:   '💊',
    prescription_stop:    '🚫',
    lab_ordered:          '🔬',
    lab_resulted:         '✅',
    imaging_ordered:      '🏥',
    imaging_reported:     '📋',
    referral:             '📨',
    alert:                '🔔',
    milestone:            '⭐',
  };
  const SEVERITY_COLOR: Record<TimelineEvent['severity'], string> = {
    normal:   '#10b981', info:'#6366f1', warning:'#f59e0b', critical:'#ef4444',
  };
  const SEVERITY_BG: Record<TimelineEvent['severity'], string> = {
    normal:'#f0fdf4', info:'#eef2ff', warning:'#fffbeb', critical:'#fef2f2',
  };
  return {
    icon:  ICON[event.type] || '📌',
    color: SEVERITY_COLOR[event.severity],
    bg:    SEVERITY_BG[event.severity],
  };
}

export default subscribeToTimeline;