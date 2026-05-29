'use client';
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ROUTES = ['IV', 'IM', 'PO', 'PR', 'Nebulised', 'SC', 'SL', 'Topical', 'Inhaler', 'NG', 'IO'];
const FREQUENCIES = [
  'Stat (single dose)',
  'OD (once daily)',
  'BD (twice daily)',
  'TDS (three times daily)',
  'QDS (four times daily)',
  'Q4H',
  'Q6H',
  'Q8H',
  'Q12H',
  'Nocte (at night)',
  'PRN (as needed)',
  'Continuous infusion',
];

interface PrescriptionFormProps {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  calculatedDose: string;
  defaultRoute?: string;
  defaultFrequency?: string;
  defaultIndication?: string;
  drugClass?: string;
  toolType?: string;
  onSaved: (result: { id: string; medication: string }) => void;
  onCancel: () => void;
}

export function PrescriptionForm({
  patientId, patientName, doctorId, doctorName,
  medication, calculatedDose,
  defaultRoute = 'PO', defaultFrequency = 'BD (twice daily)',
  defaultIndication = '', drugClass = '',
  toolType = 'clinical_intelligence',
  onSaved, onCancel,
}: PrescriptionFormProps) {
  return null;
  const [dosage, setDosage] = useState(calculatedDose);
  const [route, setRoute] = useState(defaultRoute);
  const [frequency, setFrequency] = useState(defaultFrequency);
  const [duration, setDuration] = useState('');
  const [indication, setIndication] = useState(defaultIndication);
  const [instructions, setInstructions] = useState('');
  const [warnings, setWarnings] = useState('');
  const [refills, setRefills] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!dosage || !route || !frequency) {
      setError('Dosage, route, and frequency are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        patientId,
        patientName,
        doctorId,
        doctorName,
        medication,
        drugClass: drugClass || 'general',
        dosage,
        route,
        frequency,
        duration: duration || 'As directed',
        indication: indication || defaultIndication,
        instructions: instructions || `Give ${dosage} ${route} ${frequency}${duration ? ' for ' + duration : ''}`,
        warnings: warnings || 'None documented',
        toolType,
        refills,
        active: true,
        status: 'active',
        changeHistory: [{
          changeType: 'prescribed',
          changedBy: doctorName,
          date: new Date().toISOString(),
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startDate: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'prescriptions'), payload);
      setDone(true);
      onSaved({ id: docRef.id, medication });
    } catch (err: any) {
      setError(err.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-600 text-sm">✓</span>
          <span className="text-xs font-semibold text-green-700">Prescription Saved</span>
        </div>
        <p className="text-[11px] text-green-600">{medication} {dosage} — {frequency}</p>
        <button onClick={onCancel}
          className="mt-2 text-[10px] px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">New Prescription</span>
          <p className="text-xs font-semibold text-gray-800 mt-0.5">{medication}</p>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold">
          {dosage}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Dosage</label>
          <input type="text" value={dosage} onChange={e => setDosage(e.target.value)}
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono" />
        </div>
        <div>
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Route</label>
          <select value={route} onChange={e => setRoute(e.target.value)}
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Frequency</label>
          <select value={frequency} onChange={e => setFrequency(e.target.value)}
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Duration</label>
          <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 7 days"
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="col-span-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Indication</label>
          <input type="text" value={indication} onChange={e => setIndication(e.target.value)}
            placeholder="Clinical indication for this medication"
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="col-span-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Instructions</label>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
            placeholder="Patient-facing instructions"
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[48px] resize-y" />
        </div>
        <div className="col-span-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Warnings / Side Effects to Watch</label>
          <input type="text" value={warnings} onChange={e => setWarnings(e.target.value)}
            placeholder="e.g. monitor for rash, GI upset, anaphylaxis"
            className="w-full px-2 py-1.5 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
      </div>

      {error && <p className="text-[10px] text-red-600">{error}</p>}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Refills</label>
          <select value={refills} onChange={e => setRefills(parseInt(e.target.value))}
            className="px-2 py-1 text-[11px] border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
            {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="text-[10px] px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="text-[10px] px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold">
            {saving ? 'Saving...' : 'Issue Prescription'}
          </button>
        </div>
      </div>

      <p className="text-[8px] text-gray-400">
        For {patientName} · Prescribed by {doctorName} · {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
