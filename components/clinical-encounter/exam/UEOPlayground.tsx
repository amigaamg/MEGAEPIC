'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  type UEOCardDef,
  type UEOObject,
  type UEOType,
  type UEOEvidenceNode,
  type UEOMeasurement,
  type UEOPhotograph,
} from '@/lib/clinical/constitutional/ueo-types';
import {
  UEO_GROUPS,
  getUEOCardsForType,
  buildUEOEvidenceGraph,
  updateUEOObjectNarrative,
} from '@/lib/clinical/constitutional/ueo-engine';

const GROUP_COLORS: Record<string, string> = {
  mass: '#D53F8C',
  swelling: '#D53F8C',
  ulcer: '#DD6B20',
  rash: '#38A169',
  wound: '#3182CE',
  lymph_node: '#805AD5',
  hernia: '#E53E3E',
  discharge: '#D69E2E',
  stoma: '#319795',
  scar: '#718096',
  burn: '#C05621',
  drain: '#B83280',
  catheter: '#2B6CB0',
  edema: '#4FD1C5',
  sinus: '#A0AEC0',
  fistula: '#A0AEC0',
  skin_graft: '#9F7AEA',
  flap: '#9F7AEA',
  deformity: '#4A5568',
  pigmented_lesion: '#744210',
  pressure_sore: '#C53030',
  surgical_incision: '#2D3748',
};

interface Props {
  activeUEOs: Record<string, UEOObject>;
  allFindings: Record<string, unknown>;
  onFindingChange: (cardId: string, value: unknown) => void;
  context?: Record<string, unknown>;
}

export function UEOPlayground({ activeUEOs, allFindings, onFindingChange, context }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('identification');

  const objects = useMemo(() => Object.values(activeUEOs).filter(o => o.active), [activeUEOs]);

  if (objects.length === 0) return null;

  return (
    <div className="ec-exam-section" style={{ borderTop: '2px solid #A0AEC0', marginTop: 8 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase',
        marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        Universal Examination Objects
        <span style={{ fontSize: 8, color: '#718096', fontWeight: 400, textTransform: 'none' }}>
          ({objects.length} active)
        </span>
      </div>

      {objects.map(obj => (
        <UEOObjectCard
          key={obj.identifiers.id}
          obj={obj}
          expanded={expandedId === obj.identifiers.id}
          onToggle={() => setExpandedId(expandedId === obj.identifiers.id ? null : obj.identifiers.id)}
          allFindings={allFindings}
          onFindingChange={onFindingChange}
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
        />
      ))}
    </div>
  );
}

interface UEOObjectCardProps {
  obj: UEOObject;
  expanded: boolean;
  onToggle: () => void;
  allFindings: Record<string, unknown>;
  onFindingChange: (cardId: string, value: unknown) => void;
  activeGroup: string;
  onGroupChange: (g: string) => void;
}

function UEOObjectCard({
  obj, expanded, onToggle, allFindings, onFindingChange, activeGroup, onGroupChange,
}: UEOObjectCardProps) {
  const color = GROUP_COLORS[obj.identifiers.type] || '#4A5568';
  const group = UEO_GROUPS[obj.identifiers.type];
  const cards = group ? group.cards : [];
  const evidenceNodes = useMemo(() => buildUEOEvidenceGraph(obj), [obj]);

  const groups = useMemo(() => {
    const gs = new Map<string, UEOCardDef[]>();
    for (const card of cards) {
      const g = gs.get(card.group) || [];
      g.push(card);
      gs.set(card.group, g);
    }
    return gs;
  }, [cards]);

  const currentCards = useMemo(() => groups.get(activeGroup) || [], [groups, activeGroup]);

  const completedCount = useMemo(() => {
    let count = 0;
    for (const card of cards) {
      const v = allFindings[card.id];
      if (v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)) count++;
    }
    return count;
  }, [cards, allFindings]);

  const totalCount = cards.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleChange = useCallback((cardId: string, value: unknown) => {
    onFindingChange(cardId, value);
  }, [onFindingChange]);

  return (
    <div style={{
      background: '#FFFFFF', border: `1px solid ${color}22`, borderRadius: 6,
      marginBottom: 6, overflow: 'hidden',
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 8px', cursor: 'pointer', background: `${color}08`,
          borderBottom: expanded ? `1px solid ${color}22` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block',
          }} />
          <span style={{ fontSize: 9, fontWeight: 600, color }}>{obj.identifiers.label}</span>
          {obj.narrative && !expanded && (
            <span style={{
              fontSize: 8, color: '#718096', maxWidth: 400, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {obj.narrative}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 7, background: `${color}12`, color, padding: '1px 4px', borderRadius: 3,
            fontWeight: 500,
          }}>
            {completedCount}/{totalCount}
          </span>
          <span style={{ fontSize: 10, color }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: 6 }}>
          <div style={{
            height: 2, background: '#E2E8F0', borderRadius: 1, marginBottom: 6, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${Math.min(progressPct, 100)}%`, background: color,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {groups.size > 1 && (
            <div style={{ display: 'flex', gap: 3, marginBottom: 6, flexWrap: 'wrap' }}>
              {[...groups.keys()].map(g => (
                <button key={g}
                  onClick={() => onGroupChange(g)}
                  style={{
                    fontSize: 7, padding: '2px 5px', borderRadius: 3, border: 'none',
                    background: g === activeGroup ? color : `${color}08`,
                    color: g === activeGroup ? '#FFF' : color, cursor: 'pointer',
                  }}>
                  {g.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}

          {currentCards.length > 0 ? (
            <div className="ec-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {currentCards.map(card => (
                <SingleUEOCard key={card.id} card={card}
                  value={allFindings[card.id]}
                  accentColor={color}
                  onValueChange={handleChange} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 8, color: '#A0AEC0', padding: 4 }}>
              No characterization cards for this object type yet.
            </div>
          )}

          {evidenceNodes.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{
                fontSize: 8, fontWeight: 700, color, marginBottom: 3,
              }}>Evidence</div>
              {evidenceNodes.filter(n => n.mechanisms.length > 0 || n.diseases.length > 0).map(node => (
                <div key={node.finding} style={{
                  background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4,
                  padding: '3px 5px', marginBottom: 2, fontSize: 7,
                }}>
                  {node.mechanisms.length > 0 && <div>Mechanisms: {node.mechanisms.join(' → ')}</div>}
                  {node.phenotypes.length > 0 && <div>Phenotypes: {node.phenotypes.join(', ')}</div>}
                  {node.diseases.length > 0 && <div>Differential: {node.diseases.join(', ')}</div>}
                  {node.investigations.length > 0 && <div>Investigations: {node.investigations.join(', ')}</div>}
                </div>
              ))}
            </div>
          )}

          {obj.narrative && (
            <div className="ec-narrative-box" style={{
              marginTop: 6, fontSize: 9, lineHeight: 1.4, color: '#4A5568', padding: 4,
            }}>
              {obj.narrative}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SingleUEOCardProps {
  card: UEOCardDef;
  value: unknown;
  accentColor: string;
  onValueChange: (cardId: string, value: unknown) => void;
}

function SingleUEOCard({ card, value, accentColor, onValueChange }: SingleUEOCardProps) {
  const [localVal, setLocalVal] = useState<unknown>(value);

  useEffect(() => { setLocalVal(value); }, [value]);

  const handleChange = (newVal: unknown) => {
    setLocalVal(newVal);
    onValueChange(card.id, newVal);
  };

  const borderColor = value != null && value !== '' && value !== false
    && !(Array.isArray(value) && value.length === 0)
    ? accentColor : '#E2E8F0';

  if (card.type === 'numeric') {
    return (
      <div className="ec-card ec-card-active" style={{ borderColor }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <input className="ec-input" type="number" step="any" style={{ width: '100%', fontSize: 8 }}
          placeholder="Value"
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'text') {
    return (
      <div className="ec-card ec-card-active" style={{ borderColor }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <input className="ec-input" type="text" style={{ width: '100%', fontSize: 8 }}
          placeholder="Enter..."
          value={localVal != null ? String(localVal) : ''}
          onChange={e => handleChange(e.target.value || null)} />
      </div>
    );
  }

  if (card.type === 'boolean') {
    return (
      <div className="ec-card ec-card-active" style={{ borderColor }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {card.options.map(opt => (
            <button key={opt.value}
              className={`ec-option-btn ${value === opt.value ? 'ec-option-btn-active' : ''}`}
              onClick={() => handleChange(opt.value)}
              style={{ flex: 1, fontSize: 7, padding: '1px 3px' }}>
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
      handleChange([...current]);
    };
    return (
      <div className="ec-card ec-card-active" style={{ borderColor }}>
        <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
    <div className="ec-card ec-card-active" style={{ borderColor }}>
      <div className="ec-card-q" style={{ fontSize: 8 }}>{card.label}</div>
      <div className="ec-card-options" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {card.options.map(opt => (
          <button key={opt.value}
            className={`ec-option-btn ${value === opt.value ? 'ec-option-btn-active' : ''}`}
            onClick={() => handleChange(opt.value)}
            style={{ fontSize: 7, padding: '1px 3px', textAlign: 'left' }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
