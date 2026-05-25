import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ActionTray({ patientId, doctor }: { patientId: string; doctor: any }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), where('patientId', '==', patientId), where('read', '==', false), orderBy('createdAt', 'desc'), limit(10));
    return onSnapshot(q, snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId), where('active', '==', true));
    return onSnapshot(q, snap => setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [patientId]);

  useEffect(() => {
    const q = query(collection(db, 'referrals'), where('patientId', '==', patientId), where('status', '==', 'pending'));
    return onSnapshot(q, snap => setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [patientId]);

  const markAlertRead = async (alertId: string) => {
    await updateDoc(doc(db, 'alerts', alertId), { read: true });
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>🔔 Alerts ({alerts.length})</div>
        {alerts.map(a => (
          <div key={a.id} style={{ background: '#fff7ed', padding: 8, borderRadius: 8, marginBottom: 6, fontSize: 12, cursor: 'pointer' }} onClick={() => markAlertRead(a.id)}>
            <div><strong>{a.title}</strong></div>
            <div style={{ color: '#64748b', fontSize: 10 }}>{a.message}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>💊 Active Rx ({prescriptions.length})</div>
        {prescriptions.map(p => (
          <div key={p.id} style={{ border: '1px solid #e2e9f3', padding: 8, borderRadius: 8, marginBottom: 6, fontSize: 12 }}>
            <div><strong>{p.medication}</strong> {p.dosage}</div>
            <div>{p.frequency}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>📋 Pending Referrals ({referrals.length})</div>
        {referrals.map(r => (
          <div key={r.id} style={{ background: '#eef2ff', padding: 8, borderRadius: 8, marginBottom: 6, fontSize: 12 }}>
            {r.specialty} – {r.urgency}
          </div>
        ))}
      </div>
    </div>
  );
}