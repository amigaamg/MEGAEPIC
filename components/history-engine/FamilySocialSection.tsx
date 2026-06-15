'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const OCCUPATION_EXPOSURES = [
  'Pesticides', 'Livestock', 'Mining dust', 'Silica', 'Asbestos',
  'Smoke / fumes', 'Chemicals', 'Dust (organic)', 'Heavy metals',
  'Noise', 'Infectious patients', 'Needle stick risk',
];

const FAMILY_DISEASES = [
  'Hypertension', 'Diabetes', 'HIV', 'Tuberculosis', 'Asthma',
  'Cancer', 'Heart Disease', 'Stroke', 'Sickle Cell', 'Mental Illness',
];

export default function FamilySocialSection() {
  const fs = useHistoryStore(s => s.familySocial);
  const biodata = useHistoryStore(s => s.biodata);
  const setFamilySocial = useHistoryStore(s => s.setFamilySocial);
  const completeSection = useHistoryStore(s => s.completeSection);
  const completedSections = useHistoryStore(s => s.completedSections);

  const toggleExposure = (exp: string) => {
    const updated = fs.occupationExposure.includes(exp)
      ? fs.occupationExposure.filter(e => e !== exp)
      : [...fs.occupationExposure, exp];
    setFamilySocial({ occupationExposure: updated });
  };

  const toggleFamilyDisease = (d: string) => {
    const updated = fs.familyDiseases.includes(d)
      ? fs.familyDiseases.filter(f => f !== d)
      : [...fs.familyDiseases, d];
    setFamilySocial({ familyDiseases: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Family & Social History</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Marital Status</label>
          <select value={fs.maritalStatus} onChange={e => setFamilySocial({ maritalStatus: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Education Level</label>
          <select value={fs.education} onChange={e => setFamilySocial({ education: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="none">None</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="tertiary">Tertiary</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Income Level</label>
          <select value={fs.incomeLevel} onChange={e => setFamilySocial({ incomeLevel: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="low">Low</option>
            <option value="middle">Middle</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Housing</label>
          <select value={fs.housing} onChange={e => setFamilySocial({ housing: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="owned">Owned</option>
            <option value="rented">Rented</option>
            <option value="informal">Informal</option>
            <option value="homeless">Homeless</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Water Source</label>
          <select value={fs.water} onChange={e => setFamilySocial({ water: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="piped">Piped Water</option>
            <option value="well">Well Water</option>
            <option value="river">River/Stream</option>
            <option value="bottled">Bottled</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Sanitation</label>
          <select value={fs.sanitation} onChange={e => setFamilySocial({ sanitation: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="flush">Flush Toilet</option>
            <option value="pit">Pit Latrine</option>
            <option value="ventilated_pit">VIP Latrine</option>
            <option value="none">No facility</option>
          </select>
        </div>
      </div>

      {/* Smoking & Alcohol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Smoking</label>
          <select value={fs.smoking} onChange={e => setFamilySocial({ smoking: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="never">Never</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
          </select>
          {(fs.smoking === 'current' || fs.smoking === 'former') && (
            <input type="number" placeholder="Pack-years" value={fs.smokingPackYears || ''}
              onChange={e => setFamilySocial({ smokingPackYears: parseInt(e.target.value) || 0 })}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[11px] text-white" />
          )}
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Alcohol</label>
          <select value={fs.alcohol} onChange={e => setFamilySocial({ alcohol: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="never">Never</option>
            <option value="occasional">Occasional</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
            <option value="former">Former</option>
          </select>
          {fs.alcohol !== 'never' && (
            <input type="text" placeholder="Amount & frequency" value={fs.alcoholAmount || ''}
              onChange={e => setFamilySocial({ alcoholAmount: e.target.value })}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-[11px] text-white" />
          )}
        </div>
      </div>

      {/* Occupation Exposures */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium mb-2 block">Occupation Exposures</span>
        <div className="flex flex-wrap gap-1.5">
          {OCCUPATION_EXPOSURES.map(exp => (
            <button key={exp} onClick={() => toggleExposure(exp)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${fs.occupationExposure.includes(exp)
                ? 'bg-teal-500/20 border-teal-500/30 text-teal-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-teal-500/30'}`}>
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* Travel History */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium mb-2 block">Travel History (past 6 months)</span>
        <input type="text" placeholder="e.g. Nairobi, Mombasa, Tanzania" value={fs.travelHistory.join(', ')}
          onChange={e => setFamilySocial({ travelHistory: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" />
      </div>

      {/* Family History */}
      <div className="p-3 bg-[#12193a] rounded-lg border border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium mb-2 block">Family History of Chronic Illness</span>
        <div className="flex flex-wrap gap-1.5">
          {FAMILY_DISEASES.map(d => (
            <button key={d} onClick={() => toggleFamilyDisease(d)}
              className={`text-[10px] px-2 py-1 rounded border transition-colors ${fs.familyDiseases.includes(d)
                ? 'bg-teal-500/20 border-teal-500/30 text-teal-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-teal-500/30'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Transport & Insurance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Transport Access</label>
          <select value={fs.transportAccess} onChange={e => setFamilySocial({ transportAccess: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white">
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="walking">Walking</option>
            <option value="none">No access</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Health Insurance</label>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setFamilySocial({ healthInsurance: true })}
              className={`px-3 py-1.5 text-xs rounded-lg border ${fs.healthInsurance ? 'bg-teal-500/20 border-teal-500/40 text-teal-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              Yes
            </button>
            <button onClick={() => setFamilySocial({ healthInsurance: false })}
              className={`px-3 py-1.5 text-xs rounded-lg border ${!fs.healthInsurance ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              No
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => completeSection('family_social')}
        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
        Complete Family & Social
      </button>
    </div>
  );
}
