'use client';

interface FilterPillsProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export default function FilterPills({ options, selected, onChange, className = '' }: FilterPillsProps) {
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map(opt => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              border: `1px solid ${active ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: active ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
              color: active ? '#22D3EE' : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'uppercase',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
