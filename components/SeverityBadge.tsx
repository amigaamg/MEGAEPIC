'use client';
import { useClinical } from '@/src/store/ClinicalContext';

export function SeverityBadge({ compact = false }: { compact?: boolean }) {
  const { state } = useClinical();
  const { severity } = state;

  if (!severity) return null;

  const config: Record<string, { border: string; bg: string; text: string; icon: string; label: string }> = {
    critical: { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-800', icon: '🚨', label: 'CRITICAL' },
    severe: { border: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-800', icon: '⚠️', label: 'SEVERE' },
    moderate: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-800', icon: '⚡', label: 'MODERATE' },
    mild: { border: 'border-green-300', bg: 'bg-green-50', text: 'text-green-800', icon: '✓', label: 'MILD' },
  };

  const cfg = config[severity.level];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg border ${cfg.border} ${cfg.bg} ${cfg.text}`}>
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
        {severity.redFlags.length > 0 && <span className="opacity-60">· {severity.redFlags.length}</span>}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
              Detected
            </span>
          </div>
          <p className={`text-sm font-medium ${cfg.text} mb-2`}>{severity.action}</p>
          {severity.redFlags.length > 0 && (
            <ul className="space-y-1">
              {severity.redFlags.map((flag, i) => (
                <li key={i} className={`text-xs ${cfg.text} flex items-start gap-1.5`}>
                  <span className="shrink-0 mt-0.5">›</span>
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
