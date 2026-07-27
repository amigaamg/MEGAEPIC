'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  type RespCardDef,
  type RespExamMode,
  type RespSection,
  type EvidenceGraphNode,
  RESP_AUTO_ESCALATION_RULES,
} from '@/lib/clinical/constitutional/examination-engine';

interface Props {
  mode: RespExamMode;
  cards: RespCardDef[];
  expandedCardIds: string[];
  narrative: string;
  escalated: boolean;
  evidenceGraph: EvidenceGraphNode[];
  findings: Record<string, { value: unknown }>;
  onAnswer: (cardId: string, value: unknown) => void;
  onEscalate: () => void;
}

const SECTION_LABELS: Record<RespSection, string> = {
  preparation: 'Preparation',
  observation: 'Observation from Foot of Bed',
  hands: 'Hands',
  face: 'Face',
  neck: 'Neck',
  chest_inspection: 'Chest Inspection',
  palpation: 'Palpation',
  percussion: 'Percussion',
  auscultation: 'Auscultation',
  special_manoeuvres: 'Special Manoeuvres',
  summary: 'Summary',
};

const SECTION_ORDER: RespSection[] = [
  'preparation', 'observation', 'hands', 'face', 'neck',
  'chest_inspection', 'palpation', 'percussion', 'auscultation',
  'special_manoeuvres',
];

export function RespiratoryPanel({
  mode, cards, expandedCardIds, narrative, escalated,
  evidenceGraph, findings, onAnswer, onEscalate,
}: Props) {
  const [activeSection, setActiveSection] = useState<RespSection>('observation');

  const sections = useMemo(() => {
    const secs = new Map<RespSection, RespCardDef[]>();
    for (const card of cards) {
      const existing = secs.get(card.section) || [];
      existing.push(card);
      secs.set(card.section, existing);
    }
    return secs;
  }, [cards]);

  const visibleCards = useMemo(() => {
    const all = cards.filter(c => expandedCardIds.includes(c.id) || !c.conditionalExpand);
    return all;
  }, [cards, expandedCardIds]);

  const completedCount = useMemo(() => {
    let count = 0;
    for (const card of visibleCards) {
      const v = findings[card.id]?.value;
      if (v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)) {
        count++;
      }
    }
    return count;
  }, [visibleCards, findings]);

  const totalCount = visibleCards.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentCards = useMemo(() => {
    const secCards = sections.get(activeSection) || [];
    return secCards.filter(c => visibleCards.some(vc => vc.id === c.id));
  }, [sections, activeSection, visibleCards]);

  const isExpanded = (cardId: string) => expandedCardIds.includes(cardId);

  const handleValueChange = useCallback((cardId: string, value: unknown) => {
    onAnswer(cardId, value);
  }, [onAnswer]);

  if (mode === 'secondary' && !escalated) {
    return (
      <div className="ec-exam-section">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
          fontSize: 10, fontWeight: 600, color: '#6366F1', textTransform: 'uppercase',
        }}>
          {mode === 'secondary' && <span>Respiratory Screening Mode</span>}
        </div>

        <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {cards.map(card => (
            <RespCard key={card.id} card={card} value={findings[card.id]?.value}
              expanded={false} onValueChange={handleValueChange} />
          ))}
        </div>

        {escalated && (
          <div style={{
            marginTop: 10, padding: '6px 10px', background: '#FEF3C7', border: '1px solid #F59E0B',
            borderRadius: 5, fontSize: 10, color: '#92400E',
          }}>
            Additional respiratory findings detected.
            <button onClick={onEscalate}
              style={{
                marginLeft: 8, background: '#F59E0B', color: '#fff', border: 'none',
                borderRadius: 3, padding: '3px 8px', fontSize: 9, cursor: 'pointer', fontWeight: 600,
              }}>
              Expand to Full Respiratory Examination
            </button>
          </div>
        )}

        {narrative && (
          <div className="ec-narrative-box" style={{ marginTop: 8, fontSize: 10, lineHeight: 1.5 }}>
            {narrative}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ec-exam-section">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: mode === 'primary' ? '#059669' : '#6366F1',
            textTransform: 'uppercase',
          }}>
            {mode === 'primary' ? 'Primary Respiratory Exam' : 'Respiratory Screening'}
          </span>
          <span style={{
            fontSize: 8, background: mode === 'primary' ? '#05966912' : '#6366F112',
            color: mode === 'primary' ? '#059669' : '#6366F1',
            padding: '1px 5px', borderRadius: 3, fontWeight: 500,
          }}>
            {completedCount}/{totalCount} complete
          </span>
        </div>
      </div>

      <div style={{
        height: 3, background: '#E2E8F0', borderRadius: 2, marginBottom: 8, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${Math.min(progressPct, 100)}%`,
          background: progressPct === 100 ? '#059669' : '#3B82F6',
          transition: 'width 0.3s ease', borderRadius: 2,
        }} />
      </div>

      <div className="ec-exam-module-tabs" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
        {SECTION_ORDER.filter(s => sections.has(s) && (sections.get(s)?.length ?? 0) > 0).map(s => (
          <button key={s}
            className={`ec-exam-module-tab ${s === activeSection ? 'ec-exam-module-tab-active' : ''}`}
            onClick={() => setActiveSection(s)}
            style={{ fontSize: 8, padding: '3px 6px' }}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="ec-exam-module-content">
        <div className="ec-exam-module-header" style={{ fontSize: 10 }}>
          {SECTION_LABELS[activeSection]}
        </div>
        <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {currentCards.map(card => (
            <RespCard key={card.id} card={card} value={findings[card.id]?.value}
              expanded={isExpanded(card.id)} onValueChange={handleValueChange} />
          ))}
        </div>
      </div>

      {narrative && (
        <div className="ec-narrative-box" style={{ marginTop: 8, fontSize: 10, lineHeight: 1.5 }}>
          {narrative}
        </div>
      )}

      {evidenceGraph.length > 0 && (
        <div className="ec-evidence-graph" style={{ marginTop: 8 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: '#6366F1', marginBottom: 4,
            textTransform: 'uppercase',
          }}>Evidence Graph</div>
          {evidenceGraph.filter(n => n.mechanisms.length > 0 || n.diseases.length > 0).map(node => (
            <div key={node.finding} style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4,
              padding: '4px 6px', marginBottom: 3, fontSize: 8,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 1 }}>{node.findingLabel}</div>
              {node.mechanisms.length > 0 && (
                <div>Mechanism: {node.mechanisms.join(' → ')}</div>
              )}
              {node.phenotypes.length > 0 && (
                <div>Phenotype: {node.phenotypes.join(', ')}</div>
              )}
              {node.diseases.length > 0 && (
                <div>Diseases: {node.diseases.join(', ')}</div>
              )}
              {node.investigations.length > 0 && (
                <div>Investigations: {node.investigations.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single respiratory card component ──

interface RespCardProps {
  card: RespCardDef;
  value: unknown;
  expanded: boolean;
  onValueChange: (cardId: string, value: unknown) => void;
}

function RespCard({ card, value, expanded, onValueChange }: RespCardProps) {
  const [localVal, setLocalVal] = useState<unknown>(value);

  useEffect(() => { setLocalVal(value); }, [value]);

  const handleChange = (newVal: unknown) => {
    setLocalVal(newVal);
    onValueChange(card.id, newVal);
  };

  const borderColor = value != null && value !== '' && value !== false
    && !(Array.isArray(value) && value.length === 0)
    ? '#3B82F6' : '#E2E8F0';

  if (card.type === 'numeric') {
    return (
      <div className="ec-card ec-card-active" style={{
        opacity: expanded || !card.conditionalExpand ? 1 : 0, borderColor,
      }}>
        <div className="ec-card-q" style={{ fontSize: 9 }}>{card.label}</div>
        <input className="ec-input" type="number" step="any" style={{ width: '100%', fontSize: 10 }}
          placeholder="Enter value"
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'text') {
    return (
      <div className="ec-card ec-card-active" style={{ borderColor }}>
        <div className="ec-card-q" style={{ fontSize: 9 }}>{card.label}</div>
        <input className="ec-input" type="text" style={{ width: '100%', fontSize: 10 }}
          placeholder="Enter text"
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'boolean') {
    return (
      <div className="ec-card ec-card-active" style={{ borderColor }}>
        <div className="ec-card-q" style={{ fontSize: 9 }}>{card.label}</div>
        <div className="ec-card-options" style={{ display: 'flex', gap: 4 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              className={`ec-option-btn ${value === opt.value ? 'ec-option-btn-active' : ''}`}
              onClick={() => handleChange(opt.value)}
              style={{ flex: 1, fontSize: 9, padding: '2px 4px' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (card.type === 'multi_select') {
    const selectedVals: string[] = Array.isArray(value) ? value as string[]
      : typeof value === 'string' && value ? [value] : [];

    const toggleMulti = (optVal: string) => {
      const current = new Set(selectedVals);
      if (current.has(optVal)) current.delete(optVal);
      else current.add(optVal);
      const result = [...current];
      handleChange(result.length > 0 ? result : null);
    };

    return (
      <div className="ec-card ec-card-active" style={{
        opacity: expanded || !card.conditionalExpand ? 1 : 0, borderColor,
      }}>
        <div className="ec-card-q" style={{ fontSize: 9 }}>{card.label}</div>
        <div className="ec-card-options" style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              className={`ec-option-btn ${selectedVals.includes(opt.value) ? 'ec-option-btn-active' : ''}`}
              onClick={() => toggleMulti(opt.value)}
              style={{ fontSize: 8, padding: '2px 4px' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // single_select (default)
  return (
    <div className="ec-card ec-card-active" style={{
      opacity: expanded || !card.conditionalExpand ? 1 : 0, borderColor,
    }}>
      <div className="ec-card-q" style={{ fontSize: 9 }}>{card.label}</div>
      <div className="ec-card-options" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {card.options.map(opt => (
          <button key={opt.value}
            className={`ec-option-btn ${value === opt.value ? 'ec-option-btn-active' : ''}`}
            onClick={() => handleChange(opt.value)}
            style={{ fontSize: 8, padding: '2px 4px', textAlign: 'left' }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
