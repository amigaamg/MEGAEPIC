'use client';
import React from 'react';
import type { ExamFindingDef, ExamFindingType } from '@/lib/clinical/constitutional/examination-knowledge';

interface Props {
  finding: ExamFindingDef;
  value: unknown;
  onAnswer: (findingId: string, value: unknown) => void;
}

export function ExamFindingInput({ finding, value, onAnswer }: Props) {
  const answered = value != null && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0);

  if (finding.type === 'boolean') {
    return (
      <div className="ec-chips ec-chips-inline">
        <button className={`ec-chip ${value === true ? 'ec-chip-on' : ''}`}
          onClick={() => onAnswer(finding.id, value === true ? null : true)}>
          Yes
        </button>
        <button className={`ec-chip ${value === false ? 'ec-chip-on' : ''}`}
          onClick={() => onAnswer(finding.id, value === false ? null : false)}>
          No
        </button>
      </div>
    );
  }

  if (finding.type === 'single_select' && finding.options) {
    return (
      <div className="ec-chips ec-chips-inline">
        {finding.options.map(opt => (
          <button key={opt.value} className={`ec-chip ${value === opt.value ? 'ec-chip-on' : ''}`}
            onClick={() => onAnswer(finding.id, value === opt.value ? null : opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (finding.type === 'multi_select' && finding.options) {
    const currentVal = (Array.isArray(value) ? value : []) as string[];
    return (
      <div className="ec-chips ec-chips-inline">
        {finding.options.map(opt => {
          const on = currentVal.includes(opt.value);
          return (
            <button key={opt.value} className={`ec-chip ${on ? 'ec-chip-on' : ''}`}
              onClick={() => {
                const next = on
                  ? currentVal.filter(v => v !== opt.value)
                  : [...currentVal, opt.value];
                onAnswer(finding.id, next.length > 0 ? next : null);
              }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (finding.type === 'numeric' || finding.type === 'scale') {
    return (
      <input className="ec-input" type="number"
        min={finding.min} max={finding.max} step="any"
        placeholder={finding.unit ? `Enter value (${finding.unit})` : 'Enter value'}
        value={(value != null ? String(value) : '')}
        onChange={e => {
          const v = e.target.value;
          onAnswer(finding.id, v ? (finding.type === 'scale' ? parseInt(v, 10) : parseFloat(v)) : null);
        }}
        style={{ width: '100%', maxWidth: 140 }}
      />
    );
  }

  if (finding.type === 'text') {
    return (
      <input className="ec-input" type="text"
        placeholder="Enter observation"
        value={(value != null ? String(value) : '')}
        onChange={e => onAnswer(finding.id, e.target.value || null)}
      />
    );
  }

  return null;
}
