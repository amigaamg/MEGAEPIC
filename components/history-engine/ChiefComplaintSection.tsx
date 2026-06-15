'use client';
import { useState, useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { searchSymptoms, getAllSymptoms } from '@/lib/history-engine/symptomLibrary';

export default function ChiefComplaintSection() {
  const complaints = useHistoryStore(s => s.chiefComplaints);
  const addChiefComplaint = useHistoryStore(s => s.addChiefComplaint);
  const removeChiefComplaint = useHistoryStore(s => s.removeChiefComplaint);
  const setPrimaryComplaint = useHistoryStore(s => s.setPrimaryComplaint);
  const completeSection = useHistoryStore(s => s.completeSection);
  const uncompleteSection = useHistoryStore(s => s.uncompleteSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const isComplete = completedSections.includes('chief_complaints');

  const [search, setSearch] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [durationDays, setDurationDays] = useState(0);

  const results = useMemo(() => {
    if (!search.trim()) return getAllSymptoms().slice(0, 8);
    return searchSymptoms(search).slice(0, 10);
  }, [search]);

  const handleAdd = () => {
    if (!selectedSymptom || !duration) return;
    const symptom = searchSymptoms(selectedSymptom)[0] || getAllSymptoms().find(s => s.id === selectedSymptom);
    if (symptom) {
      const days = durationDays > 0 ? durationDays : parseInt(duration) || 0;
      addChiefComplaint(symptom.id, symptom.label, duration, days);
      setSelectedSymptom(null);
      setDuration('');
      setDurationDays(0);
      setSearch('');
    }
  };

  if (isComplete) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <span className="font-medium text-sm text-green-400">Chief Complaints Completed</span>
          </div>
          <button onClick={() => uncompleteSection('chief_complaints')}
            className="text-xs text-blue-400 hover:text-blue-300 underline">
            Edit
          </button>
        </div>
        <div className="mt-2 space-y-1">
          {complaints.map(c => (
            <div key={c.id} className="text-xs text-gray-300 flex items-center gap-2">
              <span className={c.isPrimary ? 'text-yellow-400' : 'text-gray-500'}>
                {c.isPrimary ? '★' : '○'}
              </span>
              {c.label}
              <span className="text-gray-500">— {c.duration}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Chief Complaints</h2>
      </div>

      {/* Symptom Search */}
      <div className="relative">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2.5 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          placeholder="Search symptom..." />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
      </div>

      {/* Search Results */}
      {search && results.length > 0 && (
        <div className="bg-[#12193a] border border-gray-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
          {results.map(s => (
            <button key={s.id} onClick={() => { setSelectedSymptom(s.id); setSearch(s.label); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#1b234f] transition-colors ${selectedSymptom === s.id ? 'bg-teal-500/10 text-teal-400' : 'text-gray-300'}`}>
              {s.label}
              <span className="text-gray-600 text-xs ml-2">{s.category}</span>
            </button>
          ))}
        </div>
      )}

      {/* Duration Input */}
      {selectedSymptom && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Duration (text)</label>
            <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
              className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              placeholder="e.g. 3 weeks" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Days (approx)</label>
            <input type="number" value={durationDays || ''} onChange={e => setDurationDays(parseInt(e.target.value) || 0)}
              className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              placeholder="e.g. 21" min={0} />
          </div>
        </div>
      )}

      {selectedSymptom && (
        <button onClick={handleAdd} disabled={!duration}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors">
          Add Complaint
        </button>
      )}

      {/* Complaint List */}
      {complaints.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Selected Complaints</div>
          {complaints.map(c => (
            <div key={c.id}
              className={`flex items-center justify-between bg-[#12193a] border rounded-lg px-3 py-2 ${c.isPrimary ? 'border-yellow-500/30' : 'border-gray-700'}`}>
              <div className="flex items-center gap-2">
                <button onClick={() => setPrimaryComplaint(c.id)}
                  className="text-sm hover:scale-110 transition-transform"
                  title={c.isPrimary ? 'Primary complaint' : 'Click to set as primary'}>
                  {c.isPrimary ? '★' : '○'}
                </button>
                <span className="text-sm text-white">{c.label}</span>
                <span className="text-xs text-gray-500">— {c.duration}</span>
                {c.isPrimary && <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">Primary</span>}
              </div>
              <button onClick={() => removeChiefComplaint(c.id)}
                className="text-gray-600 hover:text-red-400 text-sm transition-colors">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {complaints.length > 0 && (
        <button onClick={() => completeSection('chief_complaints')}
          className="mt-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
          Complete & Continue
        </button>
      )}

    </div>
  );
}
