'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const OCCUPATIONS = [
  'Farmer', 'Miner', 'Healthcare Worker', 'Teacher', 'Driver',
  'Office Worker', 'Student', 'Retired', 'Unemployed', 'Business Owner',
  'Mechanic', 'Housewife', 'Fisherman', 'Construction Worker', 'Other',
];

const INFORMANT_OPTIONS = [
  { value: 'patient', label: 'Patient' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'ems', label: 'EMS' },
  { value: 'other', label: 'Other' },
];

const RELIABILITY_OPTIONS = [
  { value: 'reliable', label: 'Reliable' },
  { value: 'partially_reliable', label: 'Partially Reliable' },
  { value: 'poor_historian', label: 'Poor Historian' },
  { value: 'obtained_from_relative', label: 'From Relative' },
  { value: 'obtained_from_caregiver', label: 'From Caregiver' },
  { value: 'unavailable', label: 'Unavailable' },
];

export default function BiodataSection() {
  const biodata = useHistoryStore(s => s.biodata);
  const setBiodata = useHistoryStore(s => s.setBiodata);
  const completeSection = useHistoryStore(s => s.completeSection);
  const uncompleteSection = useHistoryStore(s => s.uncompleteSection);
  const completedSections = useHistoryStore(s => s.completedSections);
  const isComplete = completedSections.includes('biodata');

  if (isComplete) {
    return (
      <div className="rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[var(--success)] text-lg">✓</span>
            <span className="font-medium text-sm text-[var(--success)]">Patient Details Completed</span>
          </div>
          <button onClick={() => uncompleteSection('biodata')}
            className="text-xs text-[var(--info)] hover:text-[var(--info)]/80 underline">
            Edit
          </button>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {biodata.name}, {biodata.age}yrs, {biodata.sex}, {biodata.occupation} — {biodata.residence}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-[var(--accent)] rounded-full" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Patient Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Full Name</label>
          <input type="text" value={biodata.name} onChange={e => setBiodata({ ...biodata, name: e.target.value })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="e.g. Julius Magambo" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Age (Years)</label>
          <input type="number" value={biodata.age || ''} onChange={e => setBiodata({ ...biodata, age: parseInt(e.target.value) || 0 })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="e.g. 67" min={0} max={150} />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Sex</label>
          <select value={biodata.sex} onChange={e => setBiodata({ ...biodata, sex: e.target.value as any })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
            <option value="unknown">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Occupation</label>
          <select value={biodata.occupation} onChange={e => setBiodata({ ...biodata, occupation: e.target.value, occupationType: e.target.value.toLowerCase().replace(/\s+worker$/, '') as any })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
            <option value="">Select...</option>
            {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Residence / County</label>
          <input type="text" value={biodata.residence} onChange={e => setBiodata({ ...biodata, residence: e.target.value })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="e.g. Kenyenya, Kisii County" />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Informant</label>
          <select value={biodata.informant || 'patient'} onChange={e => setBiodata({ ...biodata, informant: e.target.value as any })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
            {INFORMANT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">History Reliability</label>
          <select value={biodata.reliability || 'reliable'} onChange={e => setBiodata({ ...biodata, reliability: e.target.value as any })}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
            {RELIABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <button onClick={() => completeSection('biodata')}
        disabled={!biodata.name || !biodata.age || biodata.sex === 'unknown'}
        className="mt-2 px-5 py-2 bg-[var(--accent)] hover:brightness-110 disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-muted)] text-white text-sm font-medium rounded-lg transition-all">
        Complete & Continue
      </button>
    </div>
  );
}
