'use client';

// AMEXAN COS — Command Palette (universal, clinically-aware search)
import { useState } from 'react';
import { Search, CornerDownLeft, UserRound, FileText, FlaskConical, BedDouble, X, Clock, Radar } from 'lucide-react';
import type { SavedEncounter } from '@/lib/amexan/encounter/encounterPersistence';

export interface PaletteItem {
  kind: 'patient' | 'action' | 'route';
  label: string;
  sub?: string;
  hint?: string;
  icon: 'patient' | 'result' | 'round' | 'document' | 'time' | 'search' | 'case';
  run: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  encounters,
  onOpenPatient,
  onQuickAction,
}: {
  open: boolean;
  onClose: () => void;
  encounters: SavedEncounter[];
  onOpenPatient: (e: SavedEncounter) => void;
  onQuickAction: (kind: string) => void;
}) {
  const [q, setQ] = useState('');

  if (!open) return null;

  const term = q.trim().toLowerCase();
  const patientItems: PaletteItem[] = encounters.map((e) => ({
    kind: 'patient',
    label: e.patientName,
    sub: `${e.hospitalNumber || '—'} · ${e.status} · ${e.currentPhase || 'triage'}`,
    icon: 'search',
    run: () => {
      onOpenPatient(e);
      onClose();
    },
  }));

  const actionItems: PaletteItem[] = [
    { kind: 'action', label: 'Start Ward Round', hint: 'Round', icon: 'round', run: () => onQuickAction('wardround') },
    { kind: 'action', label: 'New Clinical Encounter', hint: 'Encourage', icon: 'document', run: () => onQuickAction('encounter') },
    { kind: 'action', label: 'Review Results', hint: 'Review', icon: 'case', run: () => onQuickAction('results') },
    { kind: 'route', label: 'Open Patient Directory', hint: 'Patients', icon: 'search', run: () => onQuickAction('patients') },
  ];

  // Clinically-aware: search a name, MRN, phase, or action keyword.
  const filteredPatients = term
    ? patientItems.filter(
        (p) =>
          (p.label + ' ' + (p.sub || '')).toLowerCase().includes(term) ||
          /(pneumonia|malaria|fever|appendix|stroke|hb|blood|lab|ct|ultrasound|cbc)/.test(term),
      )
    : patientItems;

  const filteredActions = !term
    ? actionItems
    : actionItems.filter((a) => (a.label + ' ' + (a.hint || '')).toLowerCase().includes(term));

  const iconFor = (i: string): React.ReactNode => {
    switch (i) {
      case 'round':
        return <BedDouble size={14} />;
      case 'document':
        return <FileText size={14} />;
      case 'case':
        return <FlaskConical size={14} />;
      case 'time':
        return <Clock size={14} />;
      case 'patient':
        return <UserRound size={14} />;
      default:
        return <Search size={14} />;
    }
  };

  return (
    <div className="cos-modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '12vh' }}>
      <div className="cos-cmd" onClick={(e) => e.stopPropagation()} style={cmdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--f-200)', padding: '12px 16px' }}>
          <Search size={16} color="var(--f-500)" />
          <input
            autoFocus
            className="cos-cmd-input"
            placeholder="Search patient, MRN, term, action…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: "'Inter',sans-serif", background: 'transparent' }}
          />
          <button className="cos-topbar-btn" onClick={onClose} style={{ width: 26, height: 26 }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 420, overflowY: 'auto', padding: '8px' }}>
          {filteredActions.map((a, i) => (
            <button key={`a${i}`} className="cos-cmd-item" onClick={() => { a.run(); onClose(); }} style={cmdItem}>
              <span style={{ color: 'var(--sky-500)', display: 'flex' }}>{iconFor(a.icon)}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{a.label}</span>
              {a.hint && <span className="cos-pill blue">{a.hint}</span>}
            </button>
          ))}

          {filteredPatients.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--f-400)', padding: '10px 8px 4px' }}>
                Patients
              </div>
              {filteredPatients.slice(0, 8).map((p, i) => (
                <button key={`p${i}`} className="cos-cmd-item" onClick={() => { p.run(); onClose(); }} style={cmdItem}>
                  <span style={{ color: 'var(--f-400)', display: 'flex' }}>
                    <UserRound size={14} />
                  </span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--f-500)' }}>{p.sub}</span>
                  <span style={{ color: 'var(--f-400)', display: 'flex', marginLeft: 8 }}><CornerDownLeft size={13} /></span>
                </button>
              ))}
            </>
          )}

          {filteredPatients.length === 0 && term && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--f-500)', fontSize: 12 }}>
              <Radar size={20} style={{ margin: '0 auto 8px' }} />
              No clinical match for “{q}”. Search understands names, MRNs, and clinical terms.
            </div>
          )}
          {filteredPatients.length === 0 && !term && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--f-400)', fontSize: 12 }}>Type to search patients and actions.</div>
          )}
        </div>
        <div style={{ borderTop: '1px solid var(--f-100)', padding: '8px 12px', fontSize: 10, color: 'var(--f-400)', display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Search size={11} /> Search</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CornerDownLeft size={11} /> Select</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><X size={11} /> Esc</span>
        </div>
      </div>
    </div>
  );
}

const cmdStyle = {
  width: 560,
  maxWidth: '94vw',
  background: 'var(--white)',
  borderRadius: 'var(--r-lg)',
  overflow: 'hidden',
  boxShadow: 'var(--sh-lg)',
  border: '1px solid var(--f-200)',
} as React.CSSProperties;

const cmdItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 10px',
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: "'Inter',sans-serif",
  transition: 'background .1s',
};