'use client';
import React, { useState } from 'react';
import type { GECardDef, GEFindings } from '@/lib/clinical/constitutional/examination-engine';

interface Props {
  cards: GECardDef[];
  findings: GEFindings;
  ageBand: string;
  onAnswer: (cardId: string, value: unknown) => void;
  narrative: string;
}

export function GeneralExamPanel({ cards, findings, ageBand, onAnswer, narrative }: Props) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const isNeonatal = ageBand === 'neonate';
  const isPediatric = ['infant', 'toddler', 'child'].includes(ageBand);

  const visibleCards = cards.filter(c => {
    const cv = c.contextVisibility;
    if (cv.alwaysShow) return true;
    if (cv.hideForAgeBands?.includes(ageBand as any)) return false;
    if (cv.showForAgeBands && !cv.showForAgeBands.includes(ageBand as any)) return false;
    if (isNeonatal && ['ge_mobility', 'ge_clubbing', 'ge_breasts'].includes(c.id)) return false;
    if (isPediatric && c.id === 'ge_breasts') return false;
    return true;
  }).sort((a, b) => a.cardNumber - b.cardNumber);

  // Check if a card should be shown based on conditional expands
  const isCardExpanded = (card: GECardDef): boolean => {
    if (card.contextVisibility.alwaysShow === false && !card.conditionalExpand) {
      // It's a conditional-only card; check if its trigger was selected
      if (card.id.startsWith('ge_gcs')) {
        const consciousness = findings['ge_consciousness'];
        return consciousness != null && consciousness !== 'alert';
      }
      if (card.id === 'ge_resp_distress_severity') {
        const distress = findings['ge_distress'];
        return Array.isArray(distress) && distress.includes('respiratory');
      }
      if (card.id.startsWith('ge_dehydration_signs')) {
        const hydration = findings['ge_hydration'];
        return hydration != null && hydration !== 'normal';
      }
      if (card.id.startsWith('ge_pallor_sites')) {
        const pallor = findings['ge_pallor'];
        return pallor != null && pallor !== 'absent';
      }
      if (card.id.startsWith('ge_cyanosis_sites')) {
        const cyanosis = findings['ge_cyanosis'];
        return cyanosis != null && cyanosis !== 'absent';
      }
      if (card.id.startsWith('ge_ln_')) {
        const ln = findings['ge_lymphadenopathy'];
        return ln === 'present';
      }
      if (card.id.startsWith('ge_edema_site')) {
        const edema = findings['ge_edema'];
        return edema != null && edema !== 'absent';
      }
      return false;
    }
    return true;
  };

  const renderCard = (card: GECardDef) => {
    const value = findings[card.id];
    const answered = value != null && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0);

    return (
      <div key={card.id} className={`ec-card ${answered ? 'ec-card-done' : 'ec-card-active'}`}
        style={{ opacity: answered ? 0.55 : 1 }}>
        <div className="ec-card-q">
          <span style={{ fontSize: 7, fontWeight: 600, color: '#94A3B8', marginRight: 4 }}>
            #{card.cardNumber}
          </span>
          {card.question}
        </div>

        {card.type === 'single_select' && card.options.length > 0 && (
          <div className="ec-chips ec-chips-inline">
            {card.options.map(opt => (
              <button key={opt.value} className={`ec-chip ${value === opt.value ? 'ec-chip-on' : ''}`}
                onClick={() => onAnswer(card.id, value === opt.value ? null : opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {card.type === 'multi_select' && card.options.length > 0 && (
          <div className="ec-chips ec-chips-inline">
            {card.options.map(opt => {
              const currentArr = (Array.isArray(value) ? value : []) as string[];
              const on = currentArr.includes(opt.value);
              return (
                <button key={opt.value} className={`ec-chip ${on ? 'ec-chip-on' : ''}`}
                  onClick={() => {
                    const next = on
                      ? currentArr.filter(v => v !== opt.value)
                      : [...currentArr, opt.value];
                    onAnswer(card.id, next.length > 0 ? next : null);
                  }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {card.type === 'boolean' && (
          <div className="ec-chips ec-chips-inline">
            <button className={`ec-chip ${value === true ? 'ec-chip-on' : ''}`}
              onClick={() => onAnswer(card.id, value === true ? null : true)}>Yes</button>
            <button className={`ec-chip ${value === false ? 'ec-chip-on' : ''}`}
              onClick={() => onAnswer(card.id, value === false ? null : false)}>No</button>
          </div>
        )}

        {card.type === 'numeric' && (
          <input className="ec-input" type="number" placeholder="Enter value"
            value={(value != null ? String(value) : '')}
            onChange={e => onAnswer(card.id, e.target.value ? parseFloat(e.target.value) : null)}
            style={{ width: '100%', maxWidth: 120 }}
          />
        )}

        {card.type === 'text' && (
          <input className="ec-input" type="text" placeholder="Enter observation"
            value={(value != null ? String(value) : '')}
            onChange={e => onAnswer(card.id, e.target.value || null)}
          />
        )}
      </div>
    );
  };

  // Categorize cards into groups for the tab view
  const cardGroups = [
    { id: 'appearance', label: 'Appearance & Vital', cards: visibleCards.filter(c => c.cardNumber <= 3) },
    { id: 'systemic', label: 'Systemic Survey', cards: visibleCards.filter(c => c.cardNumber >= 4 && c.cardNumber <= 9) },
    { id: 'physical_signs', label: 'Physical Signs', cards: visibleCards.filter(c => c.cardNumber >= 10 && c.cardNumber <= 16) },
    { id: 'regional', label: 'Regional Survey', cards: visibleCards.filter(c => c.cardNumber >= 17) },
  ];

  const filteredCards = activeTab === 'all'
    ? visibleCards
    : cardGroups.find(g => g.id === activeTab)?.cards || [];
  const nonConditionalCards = filteredCards.filter(c => isCardExpanded(c) || c.contextVisibility.alwaysShow !== false);

  return (
    <div className="ec-exam-section">
      <div className="ec-exam-section-title">General Examination</div>

      {/* Tab navigation */}
      <div className="ec-exam-module-tabs">
        <button className={`ec-exam-module-tab ${activeTab === 'all' ? 'ec-exam-module-tab-active' : ''}`}
          onClick={() => setActiveTab('all')}>All Cards</button>
        {cardGroups.map(g => (
          <button key={g.id} className={`ec-exam-module-tab ${activeTab === g.id ? 'ec-exam-module-tab-active' : ''}`}
            onClick={() => setActiveTab(g.id)}>{g.label}</button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ padding: '8px 10px' }}>
        <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {nonConditionalCards.map(renderCard)}
        </div>

        {/* Conditional / expanded cards */}
        {filteredCards.filter(c => c.contextVisibility.alwaysShow === false && c.conditionalExpand).length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#EA580C', marginBottom: 4, textTransform: 'uppercase' }}>
              Conditional Findings
            </div>
            <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {filteredCards.filter(c => c.contextVisibility.alwaysShow === false && c.conditionalExpand).map(c => {
                if (isCardExpanded(c)) return renderCard(c);
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-time narrative */}
      {narrative && (
        <div style={{
          marginTop: 4, padding: '8px 10px', borderTop: '1px solid var(--border-light)',
          fontSize: 9, lineHeight: 1.4, color: '#334155', background: '#F8FAFC',
        }}>
          <div style={{ fontWeight: 600, fontSize: 8, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>
            General Exam Documentation
          </div>
          {narrative}
        </div>
      )}
    </div>
  );
}
