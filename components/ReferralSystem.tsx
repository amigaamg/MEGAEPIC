'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Referral {
  id: string;
  patientId: string;
  patientName?: string;
  specialty: string;
  reason: string;
  urgency: string;
  status: string;
  fromDoctorId?: string;
  referringDoctorName?: string;
  createdAt: any;
}

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ReferralSystem({ doctorId: _doctorId, doctorName: _doctorName, doctorSpecialty: _doctorSpecialty, doctorFacility: _doctorFacility, doctorPhone: _doctorPhone }: {
  doctorId?: string; doctorName?: string; doctorSpecialty?: string; doctorFacility?: string; doctorPhone?: string;
  mode?: string; patientId?: string; patientName?: string;
}) {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const constraints: any[] = [];
    if (_doctorId) constraints.push(where('fromDoctorId', '==', _doctorId));
    constraints.push(orderBy('createdAt', 'desc'));
    const q = query(collection(db, 'referrals'), ...constraints);
    const unsub = onSnapshot(q, snap => {
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral)));
    });
    return () => unsub();
  }, [_doctorId]);

  return (
    <div style={{ background: 'var(--card,#fff)', borderRadius: 16, border: '1px solid var(--border,#e2e8f0)', padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text,#1e293b)', marginBottom: 16 }}>📋 Referral System</h3>
      {referrals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <p>No referrals yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {referrals.map(r => (
            <div key={r.id} style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{r.patientName || 'Patient'} → {r.specialty}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.reason}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(r.createdAt)}</span>
                <span style={{ padding: '1px 6px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#ecfdf5', color: '#10b981' }}>{r.status}</span>
                <span style={{ padding: '1px 6px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#fffbeb', color: '#f59e0b' }}>{r.urgency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
