'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  type BreastCardDef,
  type BreastExamMode,
  type BreastSection,
  type BreastEvidenceGraphNode,
} from '@/lib/clinical/constitutional/examination-engine';

interface Props {
  mode: BreastExamMode;
  cards: BreastCardDef[];
  expandedCardIds: string[];
  narrative: string;
  escalated: boolean;
  evidenceGraph: BreastEvidenceGraphNode[];
  findings: Record<string, { value: unknown }>;
  onAnswer: (cardId: string, value: unknown) => void;
  onEscalate: () => void;
}

const SECTION_LABELS: Record<BreastSection, string> = {
  preparation: 'Preparation',
  inspection: 'Inspection',
  palpation: 'Palpation',
  nipple: 'Nipple & Discharge',
  axillary: 'Axillary',
  supraclavicular: 'Supraclavicular',
  chest_wall: 'Chest Wall',
  special_tests: 'Special Tests',
  cancer: 'Cancer Context',
  breastfeeding: 'Breastfeeding',
  postoperative: 'Postoperative',
  male_breast: 'Male Breast',
  summary: 'Summary',
};

const SECTION_ORDER: BreastSection[] = [
  'preparation', 'inspection', 'palpation', 'nipple',
  'axillary', 'supraclavicular', 'chest_wall', 'special_tests',
  'cancer', 'breastfeeding', 'postoperative', 'male_breast',
];

const ACCENT_COLOR = '#D53F8C';
const ACCENT_COLOR_LIGHT = '#D53F8C12';

const MODE_LABELS: Record<BreastExamMode, string> = {
  complete: 'Complete Breast Exam',
  screening: 'Breast Screening',
  pregnant: 'Pregnancy Breast Exam',
  lactating: 'Lactation Breast Exam',
  male: 'Male Breast Exam',
  pediatric: 'Pediatric Breast Exam',
  neonatal: 'Neonatal Breast Exam',
  postoperative: 'Postoperative Breast Exam',
  cancer_context: 'Breast Cancer Assessment',
  emergency: 'Emergency Breast Exam',
};

export function BreastPanel({
  mode, cards, expandedCardIds, narrative, escalated,
  evidenceGraph, findings, onAnswer, onEscalate,
}: Props) {
  const [activeSection, setActiveSection] = useState<BreastSection>('inspection');

  const sections = useMemo(() => {
    const secs = new Map<BreastSection, BreastCardDef[]>();
    for (const card of cards) {
      const existing = secs.get(card.section) || [];
      existing.push(card);
      secs.set(card.section, existing);
    }
    return secs;
  }, [cards]);

  const visibleCards = useMemo(() => {
    return cards.filter(c => expandedCardIds.includes(c.id) || !c.conditionalExpand);
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
    const group = sections.get(activeSection);
    return group || [];
  }, [sections, activeSection]);

  const handleValueChange = useCallback((cardId: string, value: unknown) => {
    onAnswer(cardId, value);
  }, [onAnswer]);

  return (
    <div className="ec-exam-section">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: ACCENT_COLOR,
            textTransform: 'uppercase',
          }}>
            {MODE_LABELS[mode] || 'Breast Examination'}
          </span>
          <span style={{
            fontSize: 8, background: ACCENT_COLOR_LIGHT, color: ACCENT_COLOR,
            padding: '1px 5px', borderRadius: 3, fontWeight: 500,
          }}>
            {completedCount}/{totalCount} complete
          </span>
          {escalated && (
            <span style={{
              fontSize: 8, background: '#FED7D7', color: '#C53030',
              padding: '1px 5px', borderRadius: 3, fontWeight: 600,
            }}>
              Suspicious features
            </span>
          )}
        </div>
      </div>

      <div style={{
        height: 3, background: '#E2E8F0', borderRadius: 2, marginBottom: 8, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${Math.min(progressPct, 100)}%`,
          background: ACCENT_COLOR,
          transition: 'width 0.3s ease', borderRadius: 2,
        }} />
      </div>

      <div className="ec-exam-module-tabs" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
        {SECTION_ORDER.filter(s => {
          const secCards = sections.get(s);
          return secCards && secCards.length > 0;
        }).map(s => (
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
            <BreastCard key={card.id} card={card} value={findings[card.id]?.value}
              expanded={expandedCardIds.includes(card.id)} onValueChange={handleValueChange}
              accentColor={ACCENT_COLOR} />
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
            fontSize: 9, fontWeight: 700, color: ACCENT_COLOR, marginBottom: 4,
            textTransform: 'uppercase',
          }}>Evidence Graph</div>
          {evidenceGraph.filter(n => n.diseases.length > 0 || n.mechanisms.length > 0).map(node => (
            <div key={node.finding} style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4,
              padding: '4px 6px', marginBottom: 3, fontSize: 8,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 1 }}>{node.findingLabel}</div>
              {node.anatomicalLocation && <div>Location: {node.anatomicalLocation}</div>}
              {node.breastArchitecture && node.breastArchitecture.length > 0 && <div>Architecture: {node.breastArchitecture.join(', ')}</div>}
              {node.mechanisms.length > 0 && <div>Mechanism: {node.mechanisms.join(' → ')}</div>}
              {node.phenotypes.length > 0 && <div>Phenotype: {node.phenotypes.join(', ')}</div>}
              {node.diseases.length > 0 && <div>Diseases: {node.diseases.join(', ')}</div>}
              {node.investigations.length > 0 && <div>Investigations: {node.investigations.join(', ')}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BreastCardProps {
  card: BreastCardDef;
  value: unknown;
  expanded: boolean;
  onValueChange: (cardId: string, value: unknown) => void;
  accentColor: string;
}

function BreastCard({ card, value, expanded, onValueChange, accentColor }: BreastCardProps) {
  const [localVal, setLocalVal] = useState<unknown>(value);

  useEffect(() => { setLocalVal(value); }, [value]);

  const handleChange = (newVal: unknown) => {
    setLocalVal(newVal);
    onValueChange(card.id, newVal);
  };

  const borderColor = value != null && value !== '' && value !== false
    && !(Array.isArray(value) && value.length === 0)
    ? accentColor : '#E2E8F0';

  if (card.type === 'boolean') {
    return (
      <div className={`ec-card ${value != null && value !== '' && value !== false ? 'ec-card-active' : ''}`}
        style={{ borderColor, background: expanded ? `${accentColor}04` : '#FFF' }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <div className="ec-card-options" style={{ display: 'flex', gap: 2 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              className={`ec-option-btn ${value === opt.value ? 'ec-option-btn-active' : ''}`}
              onClick={() => handleChange(value === opt.value ? null : opt.value)}
              style={{ flex: 1, fontSize: 7, padding: '1px 3px' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (card.type === 'numeric') {
    return (
      <div className={`ec-card ${value != null ? 'ec-card-active' : ''}`}
        style={{ borderColor, background: expanded ? `${accentColor}04` : '#FFF' }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <input className="ec-input" type="number" step="any"
          style={{ width: '100%', fontSize: 8 }}
          placeholder="Value"
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'text') {
    return (
      <div className={`ec-card ${value != null && value !== '' ? 'ec-card-active' : ''}`}
        style={{ borderColor, background: expanded ? `${accentColor}04` : '#FFF' }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <input className="ec-input" type="text"
          style={{ width: '100%', fontSize: 8 }}
          placeholder="Enter..."
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'multi_select') {
    const selectedVals: string[] = Array.isArray(value) ? value as string[]
      : typeof value === 'string' && value ? [value] : [];
    const toggleMulti = (optVal: string) => {
      const current = new Set(selectedVals);
      if (current.has(optVal)) {
        current.delete(optVal);
      } else {
        current.add(optVal);
      }
      const arr = [...current];
      handleChange(arr.length > 0 ? arr : null);
    };
    return (
      <div className={`ec-card ${selectedVals.length > 0 ? 'ec-card-active' : ''}`}
        style={{ borderColor, background: expanded ? `${accentColor}04` : '#FFF' }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <div className="ec-card-options" style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              className={`ec-option-btn ${selectedVals.includes(opt.value) ? 'ec-option-btn-active' : ''}`}
              onClick={() => toggleMulti(opt.value)}
              style={{ fontSize: 7, padding: '1px 3px' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`ec-card ${value != null && value !== '' && value !== false ? 'ec-card-active' : ''}`}
      style={{ borderColor, background: expanded ? `${accentColor}04` : '#FFF' }}>
      <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
      <div className="ec-card-options" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {card.options.map(opt => (
          <button key={opt.value}
            className={`ec-option-btn ${value === opt.value ? 'ec-option-btn-active' : ''}`}
            onClick={() => handleChange(value === opt.value ? null : opt.value)}
            style={{ fontSize: 7, padding: '1px 3px', textAlign: 'left' }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
