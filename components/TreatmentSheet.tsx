'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PrescriptionDoc {
  id: string;
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  startDate?: any;
  endDate?: any;
  status: string;
  active: boolean;
  duration: string;
  indication: string;
  instructions: string;
  doctorName: string;
  [key: string]: any;
}

interface TreatmentSheetProps {
  patientId: string;
  doctorId?: string;
}

const TIMES = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00'];

export function TreatmentSheet({ patientId, doctorId }: TreatmentSheetProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      where('active', '==', true),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: PrescriptionDoc[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as PrescriptionDoc));
      list.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setPrescriptions(list);
      setLoading(false);
    }, (err) => {
      console.error('TreatmentSheet load error:', err);
      setLoading(false);
    });
    return unsub;
  }, [patientId]);

  const handleStop = async (id: string) => {
    setStopping(id);
    try {
      await updateDoc(doc(db, 'prescriptions', id), {
        active: false,
        status: 'stopped',
        endDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stoppedBy: doctorId || 'unknown',
      });
    } catch (err) {
      console.error('Failed to stop prescription:', err);
    } finally {
      setStopping(null);
    }
  };

  const activeRx = prescriptions.filter(p => p.active !== false && p.status !== 'stopped');

  if (loading) {
    return (
      <div className="text-xs text-gray-400 italic p-2">Loading treatment sheet...</div>
    );
  }

  if (activeRx.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic p-2">
        No active prescriptions. Use the dose calculator above to prescribe.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Active Prescriptions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">#</th>
              <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Medication</th>
              <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Dose</th>
              <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Route</th>
              <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Freq</th>
              <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Indication</th>
              <th className="text-left p-1.5 border border-gray-200 font-semibold text-gray-500">Prescribed By</th>
              <th className="text-center p-1.5 border border-gray-200 font-semibold text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeRx.map((rx, i) => (
              <tr key={rx.id} className="hover:bg-blue-50">
                <td className="p-1.5 border border-gray-200 text-gray-400 text-center">{i + 1}</td>
                <td className="p-1.5 border border-gray-200 text-gray-700 font-medium">{rx.medication}</td>
                <td className="p-1.5 border border-gray-200 text-gray-600 font-mono">{rx.dosage}</td>
                <td className="text-center p-1.5 border border-gray-200 text-gray-600">{rx.route}</td>
                <td className="text-center p-1.5 border border-gray-200 text-gray-600">{rx.frequency}</td>
                <td className="p-1.5 border border-gray-200 text-gray-500 max-w-[120px] truncate">{rx.indication || '—'}</td>
                <td className="p-1.5 border border-gray-200 text-gray-500">{rx.doctorName || '—'}</td>
                <td className="text-center p-1.5 border border-gray-200">
                  <button onClick={() => handleStop(rx.id)} disabled={stopping === rx.id}
                    className="text-[9px] px-2 py-0.5 rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50">
                    {stopping === rx.id ? '...' : 'Stop'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable T Sheet / Treatment Chart */}
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-3">
        <div className="text-center mb-2">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Treatment Chart (T Sheet)</p>
          <p className="text-[8px] text-gray-400">Patient: {patientId} | Date: {new Date().toLocaleDateString()}</p>
        </div>
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-1 border border-gray-200 text-left font-semibold text-gray-500">Medication</th>
              <th className="p-1 border border-gray-200 text-left font-semibold text-gray-500">Dose</th>
              <th className="p-1 border border-gray-200 text-center font-semibold text-gray-500">Route</th>
              {TIMES.map(t => (
                <th key={t} className="p-1 border border-gray-200 text-center font-semibold text-gray-500 text-[8px]">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeRx.map(rx => (
              <tr key={rx.id} className="hover:bg-gray-50">
                <td className="p-1 border border-gray-200 text-gray-700">{rx.medication}</td>
                <td className="p-1 border border-gray-200 text-gray-600 font-mono">{rx.dosage}</td>
                <td className="p-1 border border-gray-200 text-center text-gray-600">{rx.route}</td>
                {TIMES.map(t => (
                  <td key={t} className="p-1 border border-gray-200 text-center text-gray-300">
                    <span className="inline-block w-3 h-3 rounded border border-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-4 mt-2 text-[8px] text-gray-400">
          <span>✓ = Administered</span>
          <span>X = Missed</span>
          <span>R = Refused</span>
          <span className="ml-auto">Signature: _______________</span>
        </div>
      </div>
    </div>
  );
}
