'use client';
// ─── AMEXAN — SeverityAlert ──────────────────────────────────────────────────
import { SeverityResult } from '@/src/types';

interface Props {
  severity: SeverityResult;
  onDismiss?: () => void;
}

const config = {
  critical: {
    border:  'border-red-400',
    bg:      'bg-red-50',
    icon:    '🚨',
    label:   'CRITICAL',
    text:    'text-red-800',
    subtext: 'text-red-600',
    badge:   'bg-red-100 text-red-700',
  },
  severe: {
    border:  'border-orange-400',
    bg:      'bg-orange-50',
    icon:    '⚠️',
    label:   'SEVERE',
    text:    'text-orange-800',
    subtext: 'text-orange-600',
    badge:   'bg-orange-100 text-orange-700',
  },
  moderate: {
    border:  'border-amber-300',
    bg:      'bg-amber-50',
    icon:    '⚡',
    label:   'MODERATE',
    text:    'text-amber-800',
    subtext: 'text-amber-700',
    badge:   'bg-amber-100 text-amber-700',
  },
  mild: {
    border:  'border-green-300',
    bg:      'bg-green-50',
    icon:    '✓',
    label:   'MILD',
    text:    'text-green-800',
    subtext: 'text-green-700',
    badge:   'bg-green-100 text-green-700',
  },
};

export function SeverityAlert({ severity, onDismiss }: Props) {
  // Don't render anything for mild with no flags
  if (severity.level === 'mild' && severity.redFlags.length === 0) return null;

  const cfg = config[severity.level];

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.badge}`}>
              Severity detected
            </span>
          </div>
          <p className={`text-sm font-medium ${cfg.text} mb-2`}>
            {severity.action}
          </p>
          {severity.redFlags.length > 0 && (
            <ul className="flex flex-col gap-1">
              {severity.redFlags.map((flag, i) => (
                <li key={i} className={`text-xs ${cfg.subtext} flex items-start gap-1.5`}>
                  <span className="shrink-0 mt-0.5">›</span>
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (severity.level === 'mild' || severity.level === 'moderate') && (
          <button
            onClick={onDismiss}
            className={`text-xs ${cfg.subtext} hover:opacity-70 transition-opacity shrink-0`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}