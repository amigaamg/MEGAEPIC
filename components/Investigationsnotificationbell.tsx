'use client';
// ═══════════════════════════════════════════════════════════════════════════
// InvestigationsNotificationBell.tsx
//
// Drop-in notification bell for the navbar.
// Shows unread count badge. Click opens dropdown with notification list.
// Works for both DOCTOR and PATIENT portals.
//
// DOCTOR sees:
//   - "John uploaded HbA1c result" (result_uploaded)
//   - "Jane uploaded CT Abdomen report"
//
// PATIENT sees:
//   - "New Lab Test Ordered: HbA1c" (order_placed)
//   - "Dr. Smith reviewed your HbA1c result" (result_reviewed)
//   - "Result sent to doctor confirmed" (upload_confirmed)
// ═══════════════════════════════════════════════════════════════════════════

'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: any;
}

interface Props {
  userId: string;
  role: 'doctor' | 'patient';
}

const fmtRelative = (ts: any) => {
  if (!ts) return '';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });
  } catch { return ''; }
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626', warning: '#d97706', info: '#0ea5e9',
};
const TYPE_ICON: Record<string, string> = {
  result_uploaded: '📋', order_placed: '🧪', result_reviewed: '✅',
  upload_confirmed: '📤', patient_message: '💬',
};

export default function InvestigationsNotificationBell({ userId, role }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const col = role === 'doctor' ? 'doctorNotifications' : 'patientNotifications';
  const field = role === 'doctor' ? 'doctorId' : 'patientId';

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, col),
      where(field, '==', userId),
      orderBy('createdAt', 'desc'),
      limit(30),
    );
    return onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    }, () => {});
  }, [userId, col, field]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await updateDoc(doc(db, col, id), { read: true }).catch(() => {});
  };

  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.read).map(n => updateDoc(doc(db, col, n.id), { read: true }))).catch(() => {});
  };

  return (
    <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', border: 'none',
          cursor: 'pointer', padding: '6px', borderRadius: 10,
          color: 'var(--text2, #8b9bbf)',
          background: open ? 'var(--surface2, #1a2338)' : 'transparent',
        }}
        aria-label={`${unread} unread notifications`}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 1, right: 1,
            minWidth: 16, height: 16, borderRadius: 99,
            background: '#dc2626', color: '#fff',
            fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1, border: '1.5px solid var(--surface, #111827)',
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6,
          width: 340, maxHeight: 480, overflowY: 'auto',
          background: 'var(--surface, #111827)', border: '1px solid var(--border, #243047)',
          borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.4)', zIndex: 9999,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text, #e8edf5)' }}>
              {role === 'doctor' ? '🩺' : '💊'} Notifications {unread > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>({unread} new)</span>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent, #00e5cc)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                Mark all read
              </button>
            )}
          </div>

          {notifs.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted, #546382)', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
              No notifications yet
            </div>
          )}

          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,.04)',
                cursor: 'pointer',
                background: n.read ? 'transparent' : 'rgba(0,229,204,.03)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
                transition: 'background .15s',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[n.type] || '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: n.read ? 600 : 800, color: 'var(--text, #e8edf5)', lineHeight: 1.4, marginBottom: 2 }}>{n.title}</div>
                {n.message && <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)', lineHeight: 1.5, marginBottom: 4 }}>{n.message.slice(0, 80)}</div>}
                <div style={{ fontSize: 10, color: 'var(--muted, #546382)' }}>{fmtRelative(n.createdAt)}</div>
              </div>
              {!n.read && (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: SEVERITY_COLOR[n.severity] || '#0ea5e9', flexShrink: 0, marginTop: 4 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}