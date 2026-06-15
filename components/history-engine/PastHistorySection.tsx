'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const CHRONIC_DISEASES = [
  'Hypertension', 'Diabetes Type 2', 'Diabetes Type 1', 'HIV', 'Asthma',
  'COPD', 'Heart Failure', 'Chronic Kidney Disease', 'Sickle Cell Disease',
  'Epilepsy', 'Rheumatoid Arthritis', 'Thyroid Disease', 'Hepatitis B',
  'Mental Illness', 'Cancer',
];

export default function PastHistorySection() {
  const pastHistory = useHistoryStore(s => s.pastHistory);
  const setPastHistory = useHistoryStore(s => s.setPastHistory);
  const completeSection = useHistoryStore(s => s.completeSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const isComplete = completedSections.includes('past_history');

  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [newAdmission, setNewAdmission] = useState({ year: 0, reason: '', hospital: '', treatment: '' });
  const [selectedChronic, setSelectedChronic] = useState<string | null>(null);

  const addAdmission = () => {
    if (!newAdmission.year || !newAdmission.reason) return;
    setPastHistory({ admissions: [...pastHistory.admissions, newAdmission] });
    setNewAdmission({ year: 0, reason: '', hospital: '', treatment: '' });
    setShowAdmissionForm(false);
  };

  const addChronicDisease = (disease: string) => {
    if (pastHistory.chronicDiseases.some(d => d.condition === disease)) return;
    setPastHistory({
      chronicDiseases: [...pastHistory.chronicDiseases, {
        condition: disease, yearDiagnosed: 0, hospital: '', drugs: '', followUp: '', compliant: null,
      }],
    });
    setSelectedChronic(disease);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Past Medical & Surgical History</h2>
      </div>

      {/* Past Admissions */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">Past Admissions</span>
          <button onClick={() => setShowAdmissionForm(!showAdmissionForm)}
            className="text-[10px] text-teal-400 hover:text-teal-300">
            + Add
          </button>
        </div>
        {pastHistory.admissions.length > 0 && (
          <div className="space-y-1 mb-2">
            {pastHistory.admissions.map((a, i) => (
              <div key={i} className="text-[11px] text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                {a.year} — {a.reason} @ {a.hospital}
              </div>
            ))}
          </div>
        )}
        {showAdmissionForm && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input type="number" placeholder="Year" value={newAdmission.year || ''} onChange={e => setNewAdmission({ ...newAdmission, year: parseInt(e.target.value) || 0 })}
              className="col-span-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" />
            <input type="text" placeholder="Reason" value={newAdmission.reason} onChange={e => setNewAdmission({ ...newAdmission, reason: e.target.value })}
              className="col-span-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" />
            <input type="text" placeholder="Hospital" value={newAdmission.hospital} onChange={e => setNewAdmission({ ...newAdmission, hospital: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" />
            <input type="text" placeholder="Treatment given" value={newAdmission.treatment} onChange={e => setNewAdmission({ ...newAdmission, treatment: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" />
            <button onClick={addAdmission} className="col-span-2 text-xs bg-teal-600 text-white py-1.5 rounded hover:bg-teal-500">
              Save
            </button>
          </div>
        )}
      </div>

      {/* Chronic Diseases */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium mb-2 block">Chronic Conditions</span>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {CHRONIC_DISEASES.map(d => {
            const has = pastHistory.chronicDiseases.some(c => c.condition === d);
            return (
              <button key={d} onClick={() => addChronicDisease(d)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${has
                  ? 'bg-teal-500/20 border-teal-500/30 text-teal-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-teal-500/30'}`}>
                {d} {has ? '✓' : '+'}
              </button>
            );
          })}
        </div>
        {pastHistory.chronicDiseases.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 mt-2 p-2 bg-gray-800/30 rounded">
            <span className="text-xs text-teal-400 font-medium col-span-2">{c.condition}</span>
            <input type="number" placeholder="Year diagnosed" value={c.yearDiagnosed || ''} onChange={e => {
              const updated = [...pastHistory.chronicDiseases];
              updated[i] = { ...updated[i], yearDiagnosed: parseInt(e.target.value) || 0 };
              setPastHistory({ chronicDiseases: updated });
            }} className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-[11px] text-white" />
            <input type="text" placeholder="Current drugs" value={c.drugs} onChange={e => {
              const updated = [...pastHistory.chronicDiseases];
              updated[i] = { ...updated[i], drugs: e.target.value };
              setPastHistory({ chronicDiseases: updated });
            }} className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-[11px] text-white" />
            <input type="text" placeholder="Follow up facility" value={c.followUp} onChange={e => {
              const updated = [...pastHistory.chronicDiseases];
              updated[i] = { ...updated[i], followUp: e.target.value };
              setPastHistory({ chronicDiseases: updated });
            }} className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-[11px] text-white" />
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-gray-400">Compliant:</span>
              <button onClick={() => {
                const updated = [...pastHistory.chronicDiseases];
                updated[i] = { ...updated[i], compliant: true };
                setPastHistory({ chronicDiseases: updated });
              }} className={`text-[10px] px-2 py-0.5 rounded ${c.compliant === true ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>Yes</button>
              <button onClick={() => {
                const updated = [...pastHistory.chronicDiseases];
                updated[i] = { ...updated[i], compliant: false };
                setPastHistory({ chronicDiseases: updated });
              }} className={`text-[10px] px-2 py-0.5 rounded ${c.compliant === false ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>No</button>
            </div>
          </div>
        ))}
      </div>

      {/* Allergies */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium mb-2 block">Allergies</span>
        <input type="text" placeholder="Drug allergies (comma separated)" value={pastHistory.drugAllergies.join(', ')}
          onChange={e => setPastHistory({ drugAllergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white mb-2" />
        <input type="text" placeholder="Food allergies (comma separated)" value={pastHistory.foodAllergies.join(', ')}
          onChange={e => setPastHistory({ foodAllergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" />
      </div>

      {/* TB History */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium mb-2 block">TB History</span>
        <select value={pastHistory.tbHistory} onChange={e => setPastHistory({ tbHistory: e.target.value as any })}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white">
          <option value="none">No TB history</option>
          <option value="treated">Previous TB — treated</option>
          <option value="on_treatment">Currently on TB treatment</option>
          <option value="defaulted">Previous TB — defaulted</option>
        </select>
      </div>

      <button onClick={() => completeSection('past_history')}
        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
        Complete Past History
      </button>
    </div>
  );
}
