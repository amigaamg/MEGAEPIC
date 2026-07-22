'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

export default function BiodataSection() {
  const biodata = useHistoryStore(s => s.biodata);
  const setBiodata = useHistoryStore(s => s.setBiodata);
  const completeSection = useHistoryStore(s => s.completeSection);
  const uncompleteSection = useHistoryStore(s => s.uncompleteSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const isComplete = completedSections.includes('biodata');

  if (isComplete) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <span className="font-medium text-sm text-green-400">Patient Details</span>
          </div>
          <button onClick={() => uncompleteSection('biodata')}
            className="text-xs text-blue-400 hover:text-blue-300 underline">
            Edit
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {biodata.name}, {biodata.age}yrs, {biodata.sex}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Patient Details</h2>
        <span className="text-[9px] text-gray-500 ml-2">Minimum required</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Name</label>
          <input type="text" value={biodata.name}
            onChange={e => setBiodata({ ...biodata, name: e.target.value })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            placeholder="Patient name" />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Age</label>
          <input type="number" value={biodata.age || ''}
            onChange={e => setBiodata({ ...biodata, age: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            placeholder="Years" min={0} max={150} />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Sex</label>
          <select value={biodata.sex}
            onChange={e => setBiodata({ ...biodata, sex: e.target.value as any })}
            className="w-full bg-[#12193a] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500">
            <option value="unknown">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {biodata.name && biodata.age > 0 && biodata.sex !== 'unknown' && (
        <button onClick={() => completeSection('biodata')}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors">
          ✓ Done
        </button>
      )}
      {(!biodata.name || biodata.age <= 0 || biodata.sex === 'unknown') && (
        <p className="text-[10px] text-gray-500">Name, Age, and Sex required to proceed</p>
      )}
    </div>
  );
}
