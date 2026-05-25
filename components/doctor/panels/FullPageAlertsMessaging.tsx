'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  collection, query, where, onSnapshot, doc, addDoc, updateDoc,
  getDoc, getDocs, serverTimestamp, orderBy, limit, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fmtDate, fmtDateTime } from '@/components/doctor/panels/DepartmentDefinitions';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface AlertType {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: any;
  category?: string;
}

interface MessageType {
  id: string;
  patientId: string;
  patientName?: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  subject?: string;
  priority: 'normal' | 'urgent' | 'critical';
  status: 'sent' | 'read';
  sentAt: any;
  readAt?: any;
}

interface Conversation {
  patientId: string;
  patientName: string;
  lastMessage: string;
  lastMessageAt: any;
  unread: number;
  status?: string;
}

interface Props {
  doctorId: string;
  doctorName: string;
  enrolledPatients: any[];
  patients: { uid: string; name: string; condition?: string }[];
  onBack: () => void;
  onSelectPatient: (patientId: string) => void;
}

type AlertsView = 'alerts' | 'messages' | 'compose';

export default function FullPageAlertsMessaging({
  doctorId, doctorName, enrolledPatients, patients, onBack, onSelectPatient,
}: Props) {
  const [viewMode, setViewMode] = useState<AlertsView>('alerts');
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose
  const [composePatient, setComposePatient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composePriority, setComposePriority] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [sending, setSending] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // Filter
  const [alertFilter, setAlertFilter] = useState<'all' | 'clinical' | 'lab' | 'education' | 'pathway' | 'message' | 'referral'>('all');

  // ─── FIREBASE SUBSCRIPTIONS ───

  useEffect(() => {
    const subs: (() => void)[] = [];

    // Patient notifications (alerts sent by this doctor)
    subs.push(onSnapshot(
      query(collection(db, 'patientNotifications'), where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'), limit(50)),
      snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertType)))
    ));

    // Also read from alerts collection
    subs.push(onSnapshot(
      query(collection(db, 'alerts'), where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'), limit(50)),
      snap => {
        const extraAlerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertType));
        // Merge with existing alerts by id
        setAlerts(prev => {
          const merged = [...prev];
          extraAlerts.forEach(a => {
            if (!merged.some(m => m.id === a.id)) merged.push(a);
          });
          merged.sort((a, b) => {
            const ta = a.createdAt?.toDate?.()?.getTime() || 0;
            const tb = b.createdAt?.toDate?.()?.getTime() || 0;
            return tb - ta;
          });
          return merged.slice(0, 50);
        });
      }
    ));

    // Doctor messages (sent and received)
    subs.push(onSnapshot(
      query(collection(db, 'doctorMessages'), where('senderId', '==', doctorId), orderBy('sentAt', 'desc'), limit(30)),
      snap => setMessages(prev => {
        const sent = snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageType));
        return [...sent, ...prev.filter(p => !sent.some(s => s.id === p.id))];
      })
    ));

    // Build conversations from enrolled patients
    setLoading(true);
    const buildConversations = async () => {
      const uniquePatients = new Map<string, { name: string; status?: string; }>();
      enrolledPatients.forEach(ep => {
        if (!uniquePatients.has(ep.patientId)) {
          uniquePatients.set(ep.patientId, { name: ep.patientName, status: ep.status });
        }
      });
      patients.forEach(p => {
        if (!uniquePatients.has(p.uid)) {
          uniquePatients.set(p.uid, { name: p.name });
        }
      });

      const convos: Conversation[] = [];
      for (const [patientId, info] of uniquePatients) {
        try {
          const msgSnap = await getDocs(
            query(collection(db, 'doctorMessages'), where('patientId', '==', patientId), orderBy('sentAt', 'desc'), limit(1))
          );
          const unreadSnap = await getDocs(
            query(collection(db, 'doctorMessages'), where('patientId', '==', patientId), where('recipientId', '==', doctorId), where('status', '==', 'sent'))
          );
          convos.push({
            patientId,
            patientName: info.name,
            lastMessage: msgSnap.docs[0]?.data()?.content || 'No messages yet',
            lastMessageAt: msgSnap.docs[0]?.data()?.sentAt || null,
            unread: unreadSnap.size,
            status: info.status,
          });
        } catch (e) {}
      }
      convos.sort((a, b) => {
        const ta = a.lastMessageAt?.toDate?.()?.getTime() || 0;
        const tb = b.lastMessageAt?.toDate?.()?.getTime() || 0;
        return tb - ta;
      });
      setConversations(convos);
      setLoading(false);
    };
    buildConversations();

    return () => subs.forEach(u => u());
  }, [doctorId, enrolledPatients, patients]);

  // ─── ACTIONS ───

  const markAlertRead = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'patientNotifications', alertId), { read: true });
    } catch (e) {
      try {
        await updateDoc(doc(db, 'alerts', alertId), { read: true });
      } catch (e2) {}
    }
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    for (const a of unread) {
      try { await updateDoc(doc(db, 'patientNotifications', a.id), { read: true }); } catch (e) {
        try { await updateDoc(doc(db, 'alerts', a.id), { read: true }); } catch (e2) {}
      }
    }
  };

  const sendMessage = async () => {
    if (!composePatient || !composeContent.trim()) return;
    setSending(true);
    try {
      const patient = patients.find(p => p.uid === composePatient) || enrolledPatients.find(e => e.patientId === composePatient);
      const patientName = patient ? ('name' in patient ? patient.name : patient.patientName) : 'Patient';

      // Send to doctorMessages
      await addDoc(collection(db, 'doctorMessages'), {
        patientId: composePatient, patientName,
        senderId: doctorId, senderName: doctorName,
        recipientId: composePatient,
        content: composeContent, subject: composeSubject || `${composePriority.charAt(0).toUpperCase() + composePriority.slice(1)} message`,
        priority: composePriority, status: 'sent',
        sentAt: serverTimestamp(),
      });

      // Also send as patient notification
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: composePatient, doctorId, doctorName,
        title: composeSubject || `📋 Message from Dr. ${doctorName}`,
        message: composeContent,
        type: 'message', read: false,
        createdAt: serverTimestamp(),
      });

      setComposeSubject('');
      setComposeContent('');
      setComposePatient('');
      setViewMode('messages');
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const filteredAlerts = alertFilter === 'all'
    ? alerts
    : alerts.filter(a => a.type === alertFilter || (alertFilter === 'referral' && a.type?.startsWith('referral')));

  const unreadCount = alerts.filter(a => !a.read).length;
  const byPatient = [...new Set(alerts.map(a => a.patientId))].length;

  const filteredPatientsForCompose = patients.filter(p =>
    !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeUp .25s ease' }}>

      {/* ── HEADER ── */}
      <div style={{
        flexShrink: 0, background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: 'var(--bg)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 800 }}>
            {viewMode === 'alerts' ? '🔔 Alerts & Notifications' :
             viewMode === 'messages' ? '💬 Patient Messages' :
             '✉️ New Message'}
          </span>
          {viewMode === 'alerts' && (
            <span style={{
              background: unreadCount > 0 ? 'rgba(229,62,62,.1)' : 'rgba(15,118,110,.08)',
              color: unreadCount > 0 ? '#e53e3e' : '#0F766E',
              borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px',
            }}>{unreadCount} unread · {byPatient} patients</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {viewMode === 'alerts' && (
            <>
              <button onClick={() => setViewMode('messages')} style={{
                padding: '7px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
              }}>💬 Messages</button>
              <button onClick={() => setViewMode('compose')} style={{
                padding: '7px 14px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
                color: '#fff', border: 'none', borderRadius: 9, fontSize: 12,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>✉️ New Message</button>
            </>
          )}
          {viewMode === 'messages' && (
            <>
              <button onClick={() => setViewMode('alerts')} style={{
                padding: '7px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
              }}>🔔 Alerts</button>
              <button onClick={() => setViewMode('compose')} style={{
                padding: '7px 14px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
                color: '#fff', border: 'none', borderRadius: 9, fontSize: 12,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>✉️ New</button>
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: 'var(--bg)' }}>

        {/* ═══ ALERTS VIEW ═══ */}
        {viewMode === 'alerts' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
            {/* Filter + actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['all', 'clinical', 'lab', 'education', 'pathway', 'message', 'referral'] as const).map(f => (
                  <button key={f} onClick={() => setAlertFilter(f)} style={{
                    padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)',
                    background: alertFilter === f ? '#0F766E' : 'var(--white)',
                    color: alertFilter === f ? '#fff' : 'var(--muted)',
                    border: alertFilter !== f ? '1.5px solid var(--border)' : '1.5px solid #0F766E',
                  }}>{f === 'referral' ? 'Referral' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <button onClick={markAllRead} disabled={unreadCount === 0} style={{
                padding: '6px 14px', background: unreadCount > 0 ? '#0F766E' : 'var(--bg)',
                color: unreadCount > 0 ? '#fff' : 'var(--muted)', border: 'none',
                borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: unreadCount > 0 ? 'pointer' : 'default',
                fontFamily: 'var(--font)',
              }}>✓ Mark All Read</button>
            </div>

            {filteredAlerts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>No alerts found</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Alerts appear here when you send messages or orders to patients.</div>
              </div>
            ) : filteredAlerts.slice(0, 20).map(a => {
              const colorMap: Record<string, string> = {
                clinical: '#e53e3e', lab: '#5a67d8', education: '#38a169',
                pathway: '#0F766E', message: '#d69e2e', system: '#718096',
                referral: '#d69e2e', referral_created: '#d69e2e',
              };
              const color = colorMap[a.type || ''] || '#718096';
              return (
                <div key={a.id} onClick={() => markAlertRead(a.id)} style={{
                  display: 'flex', gap: 12, padding: '12px 14px',
                  background: a.read ? 'var(--white)' : `${color}06`,
                  border: `1px solid ${a.read ? 'var(--border)' : `${color}30`}`,
                  borderRadius: 12, marginBottom: 8, cursor: 'pointer',
                  transition: 'all .1s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = a.read ? 'var(--border)' : `${color}30`; }}
                >
                  {!a.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                      <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                        {fmtDateTime(a.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>{a.message}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, borderRadius: 99, padding: '2px 8px' }}>{(a.type || 'general').replace('_', ' ')}</span>
                      {a.patientName && (
                        <button onClick={e => { e.stopPropagation(); onSelectPatient(a.patientId); }} style={{
                          fontSize: 10, fontWeight: 700, color: '#0F766E', background: 'rgba(15,118,110,.08)',
                          borderRadius: 99, padding: '2px 8px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                        }}>👤 {a.patientName}</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ MESSAGES VIEW ═══ */}
        {viewMode === 'messages' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading conversations…</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>No conversations yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Messages you send to patients will appear here.</div>
              </div>
            ) : conversations.map(conv => (
              <div
                key={conv.patientId}
                onClick={() => onSelectPatient(conv.patientId)}
                style={{
                  display: 'flex', gap: 12, padding: '13px 14px',
                  background: conv.unread > 0 ? 'rgba(15,118,110,.04)' : 'var(--white)',
                  border: `1px solid ${conv.unread > 0 ? 'rgba(15,118,110,.25)' : 'var(--border)'}`,
                  borderRadius: 12, marginBottom: 6, cursor: 'pointer',
                  transition: 'all .12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0F766E40'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = conv.unread > 0 ? 'rgba(15,118,110,.25)' : 'var(--border)'; }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: conv.unread > 0 ? 'linear-gradient(135deg,#0F766E,#06b6d4)' : 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: conv.unread > 0 ? '#fff' : 'var(--muted)',
                  flexShrink: 0,
                }}>{conv.patientName[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {conv.patientName}
                      {conv.unread > 0 && (
                        <span style={{
                          marginLeft: 8, background: '#e53e3e', color: '#fff',
                          borderRadius: '50%', width: 18, height: 18, fontSize: 9,
                          fontWeight: 700, display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center',
                        }}>{conv.unread}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                      {conv.lastMessageAt ? fmtDate(conv.lastMessageAt) : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMessage}
                  </div>
                  {conv.status && (
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                      Status: {conv.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ COMPOSE VIEW ═══ */}
        {viewMode === 'compose' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>✉️ Compose Clinical Message</div>

              {/* Patient selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>To (Patient)</label>
                <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                  placeholder="Search patient…"
                  style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', marginBottom: 8 }}
                />
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredPatientsForCompose.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)', padding: 4 }}>No patients found.</div>}
                  {filteredPatientsForCompose.slice(0, 10).map(p => {
                    const isSelected = composePatient === p.uid;
                    const existingEnroll = enrolledPatients.filter(e => e.patientId === p.uid);
                    return (
                      <button key={p.uid} onClick={() => setComposePatient(p.uid)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        background: isSelected ? 'rgba(15,118,110,.06)' : 'var(--white)',
                        border: `1.5px solid ${isSelected ? '#0F766E' : 'var(--border)'}`,
                        borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', width: '100%',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: isSelected ? '#0F766E' : 'var(--bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isSelected ? '#fff' : 'var(--muted)', fontWeight: 700, fontSize: 13,
                        }}>{p.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                          {existingEnroll.length > 0 && (
                            <span style={{ marginLeft: 8, fontSize: 10, color: '#0F766E' }}>
                              ({existingEnroll.length} pathways)
                            </span>
                          )}
                        </div>
                        {isSelected && <span style={{ color: '#0F766E', fontSize: 14 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Subject (optional)</label>
                <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                  placeholder="Brief subject for the message…"
                  style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}
                />
              </div>

              {/* Priority */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['normal', 'urgent', 'critical'] as const).map(p => (
                    <button key={p} onClick={() => setComposePriority(p)} style={{
                      flex: 1, padding: '8px', borderRadius: 9, cursor: 'pointer',
                      fontWeight: 700, fontSize: 12, fontFamily: 'var(--font)',
                      background: composePriority === p
                        ? (p === 'critical' ? '#e53e3e' : p === 'urgent' ? '#d69e2e' : '#0F766E')
                        : 'var(--bg)',
                      color: composePriority === p ? '#fff' : 'var(--muted)',
                      border: 'none',
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Message</label>
                <textarea value={composeContent} onChange={e => setComposeContent(e.target.value)}
                  rows={6} placeholder="Type your clinical message to the patient…"
                  style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setViewMode('alerts')} style={{
                  flex: 1, background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px', fontSize: 13, color: 'var(--muted)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Cancel</button>
                <button onClick={sendMessage} disabled={sending || !composePatient || !composeContent.trim()} style={{
                  flex: 2, background: 'linear-gradient(135deg,#0F766E,#06b6d4)', color: '#fff',
                  border: 'none', borderRadius: 10, padding: '10px', fontSize: 14,
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>{sending ? 'Sending…' : '✉️ Send Message'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
