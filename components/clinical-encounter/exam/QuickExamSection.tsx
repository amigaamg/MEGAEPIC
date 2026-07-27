'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';

interface QuickCardDef {
  id: string;
  label: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: { value: string; label: string }[];
}

interface QuickSectionDef {
  id: string;
  label: string;
  cards: QuickCardDef[];
  order: number;
}

interface QuickExamSectionProps {
  section: QuickSectionDef;
  findings: Record<string, { value: unknown }>;
  onAnswer: (cardId: string, value: unknown) => void;
  accentColor: string;
  defaultExpanded?: boolean;
}

export function QuickExamSection({
  section, findings, onAnswer, accentColor, defaultExpanded = false,
}: QuickExamSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [quickStatus, setQuickStatus] = useState<'normal' | 'abnormal' | null>(null);

  const hasAnyAbnormal = useMemo(() => {
    for (const card of section.cards) {
      const v = findings[card.id]?.value;
      if (v == null || v === '' || v === false) continue;
      const strV = String(v);
      if (card.type === 'single_select') {
        if (strV !== 'normal' && strV !== 'none' && strV !== 'not_palpable' && strV !== 'not_examined') return true;
      }
      if (card.type === 'multi_select') {
        if (Array.isArray(v) && !v.includes('normal')) return true;
      }
      if (card.type === 'boolean') {
        if (strV === 'yes' || strV === 'positive' || strV === 'present') return true;
      }
    }
    return false;
  }, [section.cards, findings]);

  const handleQuickToggle = (status: 'normal' | 'abnormal') => {
    if (status === 'normal') {
      const hasValues = section.cards.some(c => findings[c.id]?.value != null);
      if (hasValues && !window.confirm('Setting to Normal will clear all findings in this section. Continue?')) {
        return;
      }
      for (const card of section.cards) {
        if (findings[card.id]?.value != null) {
          onAnswer(card.id, null);
        }
      }
    }
    setQuickStatus(status);
    setExpanded(status === 'abnormal');
  };

  return (
    <div style={{
      background: '#FFF', borderRadius: 6, border: `1px solid ${hasAnyAbnormal ? accentColor : '#E2E8F0'}`,
      marginBottom: 4, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 8px', background: expanded ? `${accentColor}06` : '#FAFAFA',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 600, color: '#4A5568', textTransform: 'uppercase',
          }}>
            {section.label}
          </span>
          {hasAnyAbnormal && (
            <span style={{ fontSize: 7, color: accentColor, fontWeight: 500 }}>
              abnormal findings
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {!expanded && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleQuickToggle('normal'); }}
                style={{
                  fontSize: 7, padding: '1px 6px', borderRadius: 3, border: 'none',
                  background: quickStatus === 'normal' ? '#38A169' : `${accentColor}10`,
                  color: quickStatus === 'normal' ? '#FFF' : accentColor,
                  cursor: 'pointer', fontWeight: 500,
                }}>
                Normal
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleQuickToggle('abnormal'); }}
                style={{
                  fontSize: 7, padding: '1px 6px', borderRadius: 3, border: 'none',
                  background: quickStatus === 'abnormal' ? '#E53E3E' : `${accentColor}10`,
                  color: quickStatus === 'abnormal' ? '#FFF' : accentColor,
                  cursor: 'pointer', fontWeight: 500,
                }}>
                Abnormal
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: 9, color: '#A0AEC0', background: 'none', border: 'none',
              cursor: 'pointer', padding: '0 4px',
            }}>
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {section.cards.map(card => (
            <QuickCard key={card.id} card={card}
              value={findings[card.id]?.value}
              accentColor={accentColor}
              onValueChange={onAnswer} />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuickCardProps {
  card: QuickCardDef;
  value: unknown;
  accentColor: string;
  onValueChange: (cardId: string, value: unknown) => void;
}

function QuickCard({ card, value, accentColor, onValueChange }: QuickCardProps) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => { setLocalVal(value); }, [value]);

  const handleChange = (newVal: unknown) => {
    setLocalVal(newVal);
    onValueChange(card.id, newVal);
  };

  if (card.type === 'boolean') {
    return (
      <div style={{
        background: `${accentColor}04`, border: `1px solid ${value != null && value !== false ? accentColor : '#E2E8F0'}`,
        borderRadius: 4, padding: '3px 5px', minWidth: 120, flex: '1 0 auto',
      }}>
        <div style={{ fontSize: 7, color: '#4A5568', marginBottom: 2 }}>{card.label}</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              onClick={() => handleChange(value === opt.value ? null : opt.value)}
              style={{
                flex: 1, fontSize: 7, padding: '1px 4px', borderRadius: 3, border: 'none',
                background: value === opt.value ? accentColor : '#EDF2F7',
                color: value === opt.value ? '#FFF' : '#4A5568', cursor: 'pointer',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (card.type === 'numeric') {
    return (
      <div style={{
        background: `${accentColor}04`, border: `1px solid ${value != null ? accentColor : '#E2E8F0'}`,
        borderRadius: 4, padding: '3px 5px', minWidth: 120, flex: '1 0 auto',
      }}>
        <div style={{ fontSize: 7, color: '#4A5568', marginBottom: 2 }}>{card.label}</div>
        <input type="number" step="any"
          style={{ width: '100%', fontSize: 7, border: '1px solid #E2E8F0', borderRadius: 2, padding: '1px 3px' }}
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'text') {
    return (
      <div style={{
        background: `${accentColor}04`, border: `1px solid ${value != null && value !== '' ? accentColor : '#E2E8F0'}`,
        borderRadius: 4, padding: '3px 5px', minWidth: 160, flex: '1 0 auto',
      }}>
        <div style={{ fontSize: 7, color: '#4A5568', marginBottom: 2 }}>{card.label}</div>
        <input type="text"
          style={{ width: '100%', fontSize: 7, border: '1px solid #E2E8F0', borderRadius: 2, padding: '1px 3px' }}
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'multi_select') {
    const selected: string[] = Array.isArray(value) ? value : (typeof value === 'string' && value ? [value] : []);
    const toggle = (optVal: string) => {
      const set = new Set(selected);
      if (set.has(optVal)) set.delete(optVal); else set.add(optVal);
      handleChange([...set]);
    };
    return (
      <div style={{
        background: `${accentColor}04`, border: `1px solid ${selected.length > 0 ? accentColor : '#E2E8F0'}`,
        borderRadius: 4, padding: '3px 5px', minWidth: 160, flex: '1 0 auto',
      }}>
        <div style={{ fontSize: 7, color: '#4A5568', marginBottom: 2 }}>{card.label}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              onClick={() => toggle(opt.value)}
              style={{
                fontSize: 7, padding: '1px 4px', borderRadius: 3, border: 'none',
                background: selected.includes(opt.value) ? accentColor : '#EDF2F7',
                color: selected.includes(opt.value) ? '#FFF' : '#4A5568', cursor: 'pointer',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: `${accentColor}04`, border: `1px solid ${value != null && value !== '' ? accentColor : '#E2E8F0'}`,
      borderRadius: 4, padding: '3px 5px', minWidth: 120, flex: '1 0 auto',
    }}>
      <div style={{ fontSize: 7, color: '#4A5568', marginBottom: 2 }}>{card.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {card.options.map(opt => (
          <button key={opt.value}
            onClick={() => handleChange(value === opt.value ? null : opt.value)}
            style={{
              fontSize: 7, padding: '1px 4px', borderRadius: 3, border: 'none', textAlign: 'left',
              background: value === opt.value ? accentColor : '#EDF2F7',
              color: value === opt.value ? '#FFF' : '#4A5568', cursor: 'pointer',
            }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function buildQuickSections(
  cards: { id: string; section: string; label: string; type: string; options: { value: string; label: string }[] }[],
  sectionLabels: Record<string, string>,
  sectionOrder: string[],
): QuickSectionDef[] {
  const map = new Map<string, QuickCardDef[]>();
  for (const card of cards) {
    const existing = map.get(card.section) || [];
    existing.push({ id: card.id, label: card.label, type: card.type as QuickCardDef['type'], options: card.options });
    map.set(card.section, existing);
  }
  return sectionOrder
    .filter(s => map.has(s))
    .map((s, i) => ({
      id: s,
      label: sectionLabels[s] || s,
      cards: map.get(s) || [],
      order: i,
    }));
}
