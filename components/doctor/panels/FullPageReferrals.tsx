'use client';

import React, { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot, doc, addDoc, updateDoc,
  getDoc, getDocs, serverTimestamp, orderBy, limit, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fmtDate, fmtDateTime } from '@/components/doctor/panels/DepartmentDefinitions';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  referredTo: string;
  referredToName: string;
  reason: string;
  notes?: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  createdAt: any;
  updatedAt?: any;
}

interface Props {
  doctorId: string;
  doctorName: string;
  enrolledPatients: any[];
  patients: { uid: string; name: string; condition?: string }[];
  onBack: () => void;
  onSelectPatient: (patientId: string) => void;
}

export default function FullPageReferrals({
  doctorId, doctorName, enrolledPatients, patients, onBack, onSelectPatient,
}: Props) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);

  // Compose state
  const [composePatient, setComposePatient] = useState('');
  const [composePatientSearch, setComposePatientSearch] = useState('');
  const [composeReferredTo, setComposeReferredTo] = useState('');
  const [composeReferredToName, setComposeReferredToName] = useState('');
  const [composeReason, setComposeReason] = useState('');
  const [composeNotes, setComposeNotes] = useState('');
  const [composePriority, setComposePriority] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [sending, setSending] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'declined'>('all');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'referrals'), where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'), limit(50)),
      snap => {
        setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral)));
        setLoading(false);
      },
      err => {
        console.error('Referrals sub error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, [doctorId]);

  const filteredReferrals = statusFilter === 'all'
    ? referrals
    : referrals.filter(r => r.status === statusFilter);

  const pendingCount = referrals.filter(r => r.status === 'pending').length;

  const allPatients = [
    ...enrolledPatients.map(ep => ({ uid: ep.patientId, name: ep.patientName })),
    ...patients,
  ].filter((p, i, arr) => arr.findIndex(x => x.uid === p.uid) === i);

  const filteredPatientsForCompose = allPatients.filter(p =>
    !composePatientSearch || p.name.toLowerCase().includes(composePatientSearch.toLowerCase())
  );

  const sendReferral = async () => {
    if (!composePatient || !composeReferredTo || !composeReason.trim()) return;
    setSending(true);
    try {
      const patient = allPatients.find(p => p.uid === composePatient);
      const patientName = patient?.name || 'Patient';

      await addDoc(collection(db, 'referrals'), {
        patientId: composePatient,
        patientName,
        doctorId,
        doctorName,
        referredTo: composeReferredTo,
        referredToName: composeReferredToName || composeReferredTo,
        reason: composeReason,
        notes: composeNotes,
        priority: composePriority,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'patientNotifications'), {
        patientId: composePatient, doctorId, doctorName,
        title: `📋 You have a new referral from Dr. ${doctorName}`,
        message: `You have been referred to ${composeReferredToName || composeReferredTo}. Reason: ${composeReason}. Please go to your Referrals tab to download your referral letter.`,
        type: 'referral_created', read: false,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'patient_timeline'), {
        patientId: composePatient, type: 'referral',
        title: `Referred to ${composeReferredToName || composeReferredTo}`,
        description: composeReason,
        icon: '📋', doctorId, doctorName, createdAt: serverTimestamp(),
      });

      setComposePatient('');
      setComposePatientSearch('');
      setComposeReferredTo('');
      setComposeReferredToName('');
      setComposeReason('');
      setComposeNotes('');
      setComposePriority('routine');
      setShowCompose(false);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const statusColor: Record<string, string> = {
    pending: '#d69e2e', accepted: '#38a169',
    completed: '#5a67d8', declined: '#e53e3e',
  };
  const statusBg: Record<string, string> = {
    pending: 'rgba(214,158,46,.1)', accepted: 'rgba(56,161,105,.1)',
    completed: 'rgba(90,103,216,.1)', declined: 'rgba(229,62,62,.1)',
  };
  const priorityColor: Record<string, string> = {
    routine: 'var(--muted)', urgent: '#d69e2e', emergency: '#e53e3e',
  };

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
          <span style={{ fontSize: 17, fontWeight: 800 }}>📋 Referrals</span>
          {pendingCount > 0 && (
            <span style={{
              background: 'rgba(214,158,46,.1)', color: '#d69e2e',
              borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px',
            }}>{pendingCount} pending</span>
          )}
        </div>
        <button onClick={() => setShowCompose(true)} style={{
          padding: '7px 16px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
          color: '#fff', border: 'none', borderRadius: 9, fontSize: 12,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          ➕ New Referral
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: 'var(--bg)' }}>

        {/* ═══ COMPOSE PANEL ═══ */}
        {showCompose && (
          <div style={{
            width: 380, flexShrink: 0, borderRight: '1px solid var(--border)',
            background: 'var(--white)', overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>📋 New Referral</div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Patient *</div>
              <input value={composePatientSearch} onChange={e => setComposePatientSearch(e.target.value)}
                placeholder="Search patients…"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)', marginBottom: 4, boxSizing: 'border-box' }}
              />
              <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredPatientsForCompose.slice(0, 8).map(p => (
                  <button key={p.uid} onClick={() => { setComposePatient(p.uid); setComposePatientSearch(p.name); }}
                    style={{
                      textAlign: 'left', padding: '6px 10px', border: composePatient === p.uid ? '1.5px solid #0F766E' : '1px solid var(--border)',
                      borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)',
                      background: composePatient === p.uid ? 'rgba(15,118,110,.06)' : 'var(--white)',
                    }}
                  >{p.name}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Refer To *</div>
              <input value={composeReferredTo} onChange={e => setComposeReferredTo(e.target.value)}
                placeholder="e.g. Dr. JACK OMOLA (General Practice)"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Specialist Name</div>
              <input value={composeReferredToName} onChange={e => setComposeReferredToName(e.target.value)}
                placeholder="Dr. Name"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Reason *</div>
              <textarea value={composeReason} onChange={e => setComposeReason(e.target.value)}
                rows={3} placeholder="Reason for referral…"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Additional Notes</div>
              <textarea value={composeNotes} onChange={e => setComposeNotes(e.target.value)}
                rows={2} placeholder="Clinical notes for the referral…"
                style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Priority</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['routine', 'urgent', 'emergency'] as const).map(p => (
                  <button key={p} onClick={() => setComposePriority(p)} style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)',
                    background: composePriority === p ? priorityColor[p] : 'var(--bg)',
                    color: composePriority === p ? '#fff' : 'var(--muted)',
                    border: 'none',
                  }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={() => setShowCompose(false)} style={{
                flex: 1, padding: '9px 0', background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
              }}>Cancel</button>
              <button onClick={sendReferral} disabled={sending || !composePatient || !composeReferredTo || !composeReason.trim()} style={{
                flex: 1, padding: '9px 0', background: sending ? 'var(--bg)' : 'linear-gradient(135deg,#0F766E,#06b6d4)',
                color: sending ? 'var(--muted)' : '#fff', border: 'none',
                borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: sending ? 'default' : 'pointer', fontFamily: 'var(--font)',
              }}>{sending ? 'Sending…' : '📨 Send Referral'}</button>
            </div>
          </div>
        )}

        {/* ═══ REFERRALS LIST ═══ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {(['all', 'pending', 'accepted', 'completed', 'declined'] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)',
                background: statusFilter === f ? '#0F766E' : 'var(--white)',
                color: statusFilter === f ? '#fff' : 'var(--muted)',
                border: statusFilter !== f ? '1.5px solid var(--border)' : '1.5px solid #0F766E',
              }}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#0aaa76', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13 }}>Loading referrals…</div>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>No referrals found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Click "New Referral" to refer a patient to a specialist.</div>
            </div>
          ) : filteredReferrals.map(r => (
            <div key={r.id} style={{
              background: 'var(--white)', borderRadius: 12, padding: 14,
              border: `1px solid ${statusColor[r.status]}40`,
              marginBottom: 8, transition: 'all .1s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: priorityColor[r.priority] + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>📋</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {r.patientName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      → {r.referredToName || r.referredTo}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, background: statusBg[r.status],
                    color: statusColor[r.status], borderRadius: 99, padding: '2px 8px',
                  }}>{r.status}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, background: `${priorityColor[r.priority]}15`,
                    color: priorityColor[r.priority], borderRadius: 99, padding: '2px 8px',
                  }}>{r.priority}</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 6 }}>{r.reason}</div>
              {r.notes && <div style={{ fontSize: 12, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 8, padding: '6px 10px', marginBottom: 6 }}>📝 {r.notes}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  {r.doctorName} · {fmtDateTime(r.createdAt)}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onSelectPatient(r.patientId)} style={{
                    fontSize: 10, fontWeight: 700, color: '#0F766E', background: 'rgba(15,118,110,.08)',
                    borderRadius: 99, padding: '3px 10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>👤 Patient</button>
                  {r.status === 'pending' && (
                    <button onClick={async () => {
                      try { await updateDoc(doc(db, 'referrals', r.id), { status: 'completed', updatedAt: serverTimestamp() }); } catch (e) { console.error(e); }
                    }} style={{
                      fontSize: 10, fontWeight: 700, color: '#38a169', background: 'rgba(56,161,105,.1)',
                      borderRadius: 99, padding: '3px 10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                    }}>✓ Complete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
