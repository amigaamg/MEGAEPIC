'use client';

// AMEXAN COS — Clinical Status Strip
// Constant situational awareness: Facility / Department / Personal work.
import { Building2, BedDouble, Users, ListChecks, FileSignature, FlaskConical, Activity } from 'lucide-react';
import type { LiveWorkspace } from './useClinicalWorkspace';

export default function ClinicalStatusStrip({ ws, onJump }: { ws: LiveWorkspace; onJump: (kind: string) => void }) {
  const { stats, facilityName, departmentName, wardName } = ws;
  return (
    <div className="cos-ctx-bar">
      <span className="cos-ctx-item"><Building2 size={13} /> <strong>{facilityName || 'Facility'}</strong></span>
      <span className="cos-ctx-sep" />
      <span className="cos-ctx-item"><Activity size={13} /> <strong style={{ textTransform: 'capitalize' }}>{departmentName || 'Department'}</strong></span>
      <span className="cos-ctx-sep" />
      <span className="cos-ctx-item"><BedDouble size={13} /> <strong>{wardName || 'Ward'}</strong></span>
      <span className="cos-ctx-sep" />
      <span className="cos-ctx-item"><Users size={13} /> <span className="cos-ctx-count" style={{ fontWeight: 800, color: 'var(--sky-700)' }}>{stats.patients}</span> patients</span>
      <span className="cos-ctx-item" style={{ color: 'var(--red)' }}>· <span style={{ fontWeight: 800 }}>{stats.critical}</span> critical</span>
      <span className="cos-ctx-item" style={{ color: 'var(--amber)' }}>· <span style={{ fontWeight: 800 }}>{stats.resultsReady}</span> results</span>
      <span className="cos-ctx-sep" />
      <button className="cos-chip" style={{ padding: '3px 10px' }} onClick={() => onJump('tasks')}>
        <ListChecks size={12} /> <strong>{stats.tasksDue}</strong> tasks
      </button>
      <button className="cos-chip" style={{ padding: '3px 10px' }} onClick={() => onJump('signatures')}>
        <FileSignature size={12} /> <strong>{3}</strong> to sign
      </button>
      <button className="cos-chip" style={{ padding: '3px 10px' }} onClick={() => onJump('results')}>
        <FlaskConical size={12} /> <strong>{stats.resultsReady}</strong> results
      </button>
    </div>
  );
}