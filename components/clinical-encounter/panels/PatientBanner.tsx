'use client';
import React from 'react';
import { PatientContext } from '@/lib/amexan/encounter-engine/engines/context-engine';
import { EncounterPhase } from '@/lib/amexan/encounter-engine/types/ces';

interface Props {
  patientContext: PatientContext | null;
  currentPhase: EncounterPhase;
  reliability?: string;
  encounterId?: string;
}

export function PatientBanner({ patientContext, currentPhase, reliability, encounterId }: Props) {
  if (!patientContext) {
    return (
      <div className="ce-banner">
        <div className="ce-banner-inner">
          <div className="ce-banner-item">
            <span className="ce-banner-label">Status</span>
            <span className="ce-banner-value">Awaiting patient data…</span>
          </div>
        </div>
        <style>{bannerStyles}</style>
      </div>
    );
  }

  const { biodata, activeModules } = patientContext;
  const phaseLabel = currentPhase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="ce-banner">
      <div className="ce-banner-inner">
        {/* Patient Name + HN */}
        <div className="ce-banner-section">
          <div className="ce-banner-name">{biodata.patientName || 'Unknown'}</div>
          <div className="ce-banner-meta">{biodata.hospitalNumber || '—'}</div>
        </div>

        {/* Demographics */}
        <div className="ce-banner-divider" />
        <div className="ce-banner-item">
          <span className="ce-banner-label">Age</span>
          <span className="ce-banner-value">{biodata.age || '—'}y</span>
        </div>
        <div className="ce-banner-item">
          <span className="ce-banner-label">Sex</span>
          <span className="ce-banner-value">{biodata.sex || '—'}</span>
        </div>
        <div className="ce-banner-item">
          <span className="ce-banner-label">Weight</span>
          <span className="ce-banner-value">{biodata.weight || '—'} kg</span>
        </div>

        <div className="ce-banner-divider" />

        {/* Encounter Info */}
        <div className="ce-banner-item">
          <span className="ce-banner-label">Phase</span>
          <span className="ce-banner-value ceb-phase">{phaseLabel}</span>
        </div>
        <div className="ce-banner-item">
          <span className="ce-banner-label">Dept</span>
          <span className="ce-banner-value">{biodata.department || '—'}</span>
        </div>
        <div className="ce-banner-item">
          <span className="ce-banner-label">Reliability</span>
          <span className={`ce-banner-value ceb-rel-${reliability || 'unknown'}`}>
            {reliability || '—'}
          </span>
        </div>

        {/* Active Modules (badges) */}
        {activeModules.length > 0 && (
          <div className="ce-banner-modules">
            {activeModules.map(m => (
              <span key={m} className="ce-banner-module">{m}</span>
            ))}
          </div>
        )}
      </div>

      <style>{bannerStyles}</style>
    </div>
  );
}

const bannerStyles = `
  .ce-banner {
    background: var(--ce-banner-bg);
    border-bottom: 1px solid var(--ce-banner-border);
    padding: 10px 20px;
    flex-shrink: 0;
  }
  .ce-banner-inner {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 100%;
    overflow-x: auto;
  }
  .ce-banner-section {
    display: flex;
    flex-direction: column;
  }
  .ce-banner-name {
    font-size: 15px; font-weight: 700; color: var(--ce-text);
    white-space: nowrap;
  }
  .ce-banner-meta {
    font-size: 11px; color: var(--ce-text-muted);
    font-family: var(--ce-font-mono);
  }
  .ce-banner-divider {
    width: 1px; height: 28px;
    background: var(--ce-border-light);
    flex-shrink: 0;
  }
  .ce-banner-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
    white-space: nowrap;
  }
  .ce-banner-label {
    font-size: 9px; font-weight: 600; color: var(--ce-text-muted);
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .ce-banner-value {
    font-size: 13px; font-weight: 500; color: var(--ce-text);
  }
  .ceb-phase {
    color: var(--ce-sky-600); font-weight: 600;
  }
  .ceb-rel-Good { color: var(--ce-success); }
  .ceb-rel-Fair { color: var(--ce-warning); }
  .ceb-rel-Poor { color: var(--ce-danger); }
  .ce-banner-modules {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap;
  }
  .ce-banner-module {
    font-size: 10px; padding: 2px 8px;
    border-radius: 999px;
    background: var(--ce-sky-50);
    color: var(--ce-sky-600);
    font-weight: 500;
    text-transform: capitalize;
    white-space: nowrap;
  }
`;
