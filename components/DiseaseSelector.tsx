'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/amexan/DiseaseSelector.tsx
// Full-screen modal — browse and toggle disease protocols across all departments
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { DISEASE_PROTOCOLS, DEPARTMENTS } from '@/lib/clinicalProtocols';

interface DiseaseSelectorProps {
  activeDiagnoses: string[];
  onToggle: (dxId: string) => void;
  onClose: () => void;
}

export default function DiseaseSelector({ activeDiagnoses, onToggle, onClose }: DiseaseSelectorProps) {
  const [search,     setSearch]     = useState('');
  const [activeDept, setActiveDept] = useState('ALL');

  const filtered = Object.entries(DISEASE_PROTOCOLS).filter(([, d]) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.icd.toLowerCase().includes(search.toLowerCase());
    const matchDept = activeDept === 'ALL' || d.dept === activeDept;
    return matchSearch && matchDept;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.88)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 660,
          maxWidth: '95vw',
          maxHeight: '82vh',
          background: '#0d1520',
          border: '1px solid #2a3d57',
          borderRadius: 10,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: '#141f2e',
            padding: '14px 18px',
            borderBottom: '1px solid #1e2d42',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>
              Clinical Protocol Browser
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
              {activeDiagnoses.length} active · {Object.keys(DISEASE_PROTOCOLS).length} protocols available
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2a3d57',
              color: '#94a3b8',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Close
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #1e2d42',
            flexShrink: 0,
          }}
        >
          <input
            autoFocus
            placeholder="Search by diagnosis name or ICD code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: 12,
              borderRadius: 5,
              background: '#060b14',
              border: '1px solid #2a3d57',
              color: '#e8edf5',
              marginBottom: 8,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['ALL', ...Object.keys(DEPARTMENTS)].map((k) => {
              const dept = DEPARTMENTS[k];
              const isActive = activeDept === k;
              const color = dept?.color || '#06b6d4';
              return (
                <button
                  key={k}
                  onClick={() => setActiveDept(k)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 3,
                    border: `1px solid ${isActive ? color : '#1e2d42'}`,
                    background: isActive ? `${color}18` : 'transparent',
                    color: isActive ? color : '#3a4a5e',
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'inherit',
                  }}
                >
                  {k === 'ALL' ? 'All Depts' : k}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results grid */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 7,
            }}
          >
            {filtered.map(([id, d]) => {
              const isActive = activeDiagnoses.includes(id);
              const dept = DEPARTMENTS[d.dept];
              const color = dept?.color || '#06b6d4';
              return (
                <div
                  key={id}
                  onClick={() => onToggle(id)}
                  style={{
                    padding: '10px 12px',
                    background: isActive ? `${color}0f` : '#141f2e',
                    border: `1px solid ${isActive ? color : '#1e2d42'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 3,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: isActive ? color : '#e8edf5',
                        lineHeight: 1.3,
                      }}
                    >
                      {d.name}
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: color,
                        fontFamily: 'IBM Plex Mono, monospace',
                        flexShrink: 0,
                        marginLeft: 4,
                      }}
                    >
                      {d.icd}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: dept?.color || '#3a4a5e',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    {dept?.icon} {dept?.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: 9, color: '#10d47a', marginTop: 5 }}>
                      ✓ Active · {d.monitoring.length} tools · {d.firstLine.length} medications
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  color: '#3a4a5e',
                  padding: '30px 0',
                  fontSize: 12,
                }}
              >
                No protocols matching "{search}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}