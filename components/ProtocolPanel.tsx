'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/amexan/ProtocolPanel.tsx
// Clinical protocol for a single diagnosis: steps, medications, targets,
// complications — sourced from DISEASE_PROTOCOLS in clinicalProtocols.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { DISEASE_PROTOCOLS, DEPARTMENTS, DRUG_DB } from '@/lib/clinicalProtocols';

interface ProtocolPanelProps {
  dxId: string;
}

type TabId = 'protocol' | 'medications' | 'targets';

export default function ProtocolPanel({ dxId }: ProtocolPanelProps) {
  const proto = DISEASE_PROTOCOLS[dxId];
  const dept  = proto ? DEPARTMENTS[proto.dept] : null;
  const [tab, setTab] = useState<TabId>('protocol');

  if (!proto || !dept) return null;

  const TABS: { id: TabId; label: string }[] = [
    { id: 'protocol',   label: 'Step Protocol' },
    { id: 'medications', label: 'Medications'  },
    { id: 'targets',    label: 'Targets'        },
  ];

  return (
    <div
      style={{
        background: '#0d1520',
        border: '1px solid #1e2d42',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#141f2e',
          padding: '10px 14px',
          borderBottom: '1px solid #1e2d42',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5' }}>{proto.name}</div>
          <div
            style={{
              fontSize: 9,
              color: dept.color,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: 2,
            }}
          >
            {dept.icon} {dept.label} · ICD {proto.icd}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '3px 8px',
                borderRadius: 3,
                border: '1px solid',
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                cursor: 'pointer',
                borderColor: tab === t.id ? '#06b6d4' : '#1e2d42',
                background: tab === t.id ? 'rgba(6,182,212,.12)' : 'transparent',
                color: tab === t.id ? '#06b6d4' : '#64748b',
                fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>

        {/* ── Step Protocol ── */}
        {tab === 'protocol' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {proto.stepProtocol.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: 'rgba(6,182,212,.1)',
                    border: '1px solid #06b6d425',
                    color: '#06b6d4',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}

            {/* Complications */}
            <div
              style={{
                marginTop: 8,
                padding: '8px 10px',
                background: 'rgba(239,68,68,.05)',
                borderRadius: 5,
                border: '1px solid #ef444418',
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#ef4444',
                  marginBottom: 5,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                Potential Complications
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {proto.complications.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: '#f87171',
                      background: 'rgba(239,68,68,.1)',
                      padding: '2px 6px',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 9, color: '#3a4a5e', marginTop: 2 }}>
              Review interval: {proto.review}
            </div>
          </div>
        )}

        {/* ── Medications ── */}
        {tab === 'medications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#3a4a5e',
                marginBottom: 2,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              First-line agents — per WHO / NICE guidelines
            </div>
            {proto.firstLine.map((drugId) => {
              const drug = DRUG_DB[drugId];
              return (
                <div
                  key={drugId}
                  style={{
                    padding: '8px 10px',
                    background: '#141f2e',
                    border: '1px solid #1e2d42',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#10d47a', marginBottom: 2 }}>
                    {drug?.name || drugId}
                  </div>
                  {drug && (
                    <>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{drug.class}</div>
                      <div
                        style={{
                          fontSize: 10,
                          color: '#94a3b8',
                          marginTop: 3,
                          fontFamily: 'IBM Plex Mono, monospace',
                        }}
                      >
                        Start: {drug.doses[0]?.start} — Max: {drug.doses[0]?.max}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Targets ── */}
        {tab === 'targets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Object.entries(proto.targets).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: '1px solid #141f2e',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    textTransform: 'capitalize',
                  }}
                >
                  {key.replace(/_/g, ' ')}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#10d47a',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 9, color: '#3a4a5e', marginTop: 6 }}>
              Monitoring: {proto.monitoring.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}