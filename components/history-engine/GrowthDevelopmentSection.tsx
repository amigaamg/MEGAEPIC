'use client';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

const MILESTONE_KEYS: { key: string; label: string }[] = [
  { key: 'socialSmile', label: 'Social Smile' },
  { key: 'headControl', label: 'Head Control' },
  { key: 'sitting', label: 'Sitting' },
  { key: 'crawling', label: 'Crawling' },
  { key: 'standing', label: 'Standing' },
  { key: 'walking', label: 'Walking' },
  { key: 'firstWords', label: 'First Words' },
  { key: 'sentences', label: 'Sentences' },
  { key: 'toiletTraining', label: 'Toilet Training' },
];

const MILESTONE_OPTIONS = [
  { value: 'achieved', label: 'Achieved' },
  { value: 'not_achieved', label: 'Not Achieved' },
  { value: 'unknown', label: 'Unknown' },
];

export default function GrowthDevelopmentSection() {
  const growthDev = useHistoryStore(s => s.growthDevelopment);
  const setDevelopmentalMilestone = useHistoryStore(s => s.setDevelopmentalMilestone);
  const setGrowthConcerns = useHistoryStore(s => s.setGrowthConcerns);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Growth & Development</h2>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Growth Parameters</span>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Weight (kg)</label>
            <input type="number" step="0.01" value={growthDev.growthParams[0]?.weight || ''}
              onChange={e => {
                const updated = [...growthDev.growthParams];
                if (!updated[0]) updated[0] = { age: '', weight: 0, height: 0, headCircumference: 0, percentile: '' };
                updated[0] = { ...updated[0], weight: parseFloat(e.target.value) || 0 };
                useHistoryStore.setState({ growthDevelopment: { ...growthDev, growthParams: updated } });
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Height (cm)</label>
            <input type="number" step="0.1" value={growthDev.growthParams[0]?.height || ''}
              onChange={e => {
                const updated = [...growthDev.growthParams];
                if (!updated[0]) updated[0] = { age: '', weight: 0, height: 0, headCircumference: 0, percentile: '' };
                updated[0] = { ...updated[0], height: parseFloat(e.target.value) || 0 };
                useHistoryStore.setState({ growthDevelopment: { ...growthDev, growthParams: updated } });
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Head Circumference (cm)</label>
            <input type="number" step="0.1" value={growthDev.growthParams[0]?.headCircumference || ''}
              onChange={e => {
                const updated = [...growthDev.growthParams];
                if (!updated[0]) updated[0] = { age: '', weight: 0, height: 0, headCircumference: 0, percentile: '' };
                updated[0] = { ...updated[0], headCircumference: parseFloat(e.target.value) || 0 };
                useHistoryStore.setState({ growthDevelopment: { ...growthDev, growthParams: updated } });
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]" />
          </div>
        </div>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Developmental Milestones</span>
        <div className="grid grid-cols-3 gap-3">
          {MILESTONE_KEYS.map(m => {
            const value = (growthDev.milestones as any)[m.key] as string;
            return (
              <div key={m.key}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{m.label}</label>
                <select value={value} onChange={e => setDevelopmentalMilestone(m.key, e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)]">
                  {MILESTONE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border)]">
        <span className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Growth Concerns</span>
        <textarea value={growthDev.concerns} onChange={e => setGrowthConcerns(e.target.value)}
          className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] min-h-[80px]" />
      </div>
    </div>
  );
}
