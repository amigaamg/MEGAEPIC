'use client';

import React, { useState } from 'react';

interface Docket {
  id: string; name: string; specialty: string; description?: string;
  tools: string[]; patientCount: number; createdBy: string;
  createdAt: any; isActive: boolean;
}

const AVAILABLE_TOOLS = [
  'clinical_clerking', 'vital_tracking', 'prescription_writer', 'lab_order',
  'imaging_order', 'referral_writer', 'patient_education', 'inhaler_education',
  'oxygen_monitoring', 'asthma_tracker', 'bronchiolitis_score', 'act_score',
  'respiratory_clerking', 'htn_management', 'diabetes_tracker', 'ckd_staging',
  'stroke_scale', 'pain_assessment', 'wound_care', 'maternity_tracker',
  'antenatal_schedule', 'growth_chart', 'immunization_tracker', 'tb_dot',
  'hiv_art_tracker', 'palliative_symptom', 'sepsis_screening', 'falls_risk',
  'mews_scoring', 'nurce_handover',
];

const TOOL_LABELS: Record<string, string> = {
  clinical_clerking: 'Clinical Clerking', vital_tracking: 'Vital Tracking',
  prescription_writer: 'Prescription Writer', lab_order: 'Lab Orders',
  imaging_order: 'Imaging Orders', referral_writer: 'Referral Writer',
  patient_education: 'Patient Education', inhaler_education: 'Inhaler Education',
  oxygen_monitoring: 'O₂ Monitoring', asthma_tracker: 'Asthma Tracker',
  bronchiolitis_score: 'Bronchiolitis Score', act_score: 'ACT Score',
  respiratory_clerking: 'Respiratory Clerking', htn_management: 'HTN Management',
  diabetes_tracker: 'Diabetes Tracker', ckd_staging: 'CKD Staging',
  stroke_scale: 'Stroke Scale', pain_assessment: 'Pain Assessment',
  wound_care: 'Wound Care', maternity_tracker: 'Maternity Tracker',
  antenatal_schedule: 'Antenatal Schedule', growth_chart: 'Growth Chart',
  immunization_tracker: 'Immunization Tracker', tb_dot: 'TB DOT Tracker',
  hiv_art_tracker: 'HIV ART Tracker', palliative_symptom: 'Palliative Symptom Control',
  sepsis_screening: 'Sepsis Screening', falls_risk: 'Falls Risk Assessment',
  mews_scoring: 'MEWS Scoring', nurce_handover: 'Nurse Handover',
  ecg_reader: 'ECG Reader', spirometry: 'Spirometry',
};

const TOOL_ICONS: Record<string, string> = {
  clinical_clerking: '📋', vital_tracking: '❤️', prescription_writer: '💊',
  lab_order: '🔬', imaging_order: '🩻', referral_writer: '📨',
  patient_education: '📖', inhaler_education: '🫁', oxygen_monitoring: '🫧',
  asthma_tracker: '🌬️', bronchiolitis_score: '👶', act_score: '📝',
  respiratory_clerking: '🫁', htn_management: '❤️', diabetes_tracker: '🍬',
  ckd_staging: '🫘', stroke_scale: '🧠', pain_assessment: '💉',
  wound_care: '🩹', maternity_tracker: '🤰', antenatal_schedule: '📅',
  growth_chart: '📈', immunization_tracker: '💉', tb_dot: '🦠',
  hiv_art_tracker: '🧬', palliative_symptom: '🌅', sepsis_screening: '🦠',
  falls_risk: '🚶', mews_scoring: '📊', nurce_handover: '🤝',
  ecg_reader: '📈', spirometry: '🫁',
};

interface Props {
  dockets: Docket[];
  onCreateDocket: (data: { name: string; specialty: string; description: string; tools: string[] }) => Promise<Docket | null>;
  onActivateDocket: (docketId: string, active: boolean) => void;
  onSelectDocket: (docket: Docket) => void;
  activeDocketId?: string;
  doctorSpecialty: string;
}

export default function DocketManager({ dockets, onCreateDocket, onActivateDocket, onSelectDocket, activeDocketId, doctorSpecialty }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState(doctorSpecialty);
  const [newDescription, setNewDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTools, setSearchTools] = useState('');
  const [expandedDocket, setExpandedDocket] = useState<string | null>(null);

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]);
  };

  const handleCreate = async () => {
    if (!newName || !newSpecialty) return;
    setCreating(true);
    try {
      const result = await onCreateDocket({ name: newName, specialty: newSpecialty, description: newDescription, tools: selectedTools });
      if (result) {
        setMessage(`✅ Docket "${result.name}" created`);
        setTimeout(() => setMessage(''), 3000);
        setShowCreate(false);
        setNewName(''); setNewDescription(''); setSelectedTools([]);
      }
    } finally { setCreating(false); }
  };

  const filteredTools = AVAILABLE_TOOLS.filter(t =>
    !searchTools || TOOL_LABELS[t]?.toLowerCase().includes(searchTools.toLowerCase()) || t.includes(searchTools.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
            {dockets.length} Care Dockets
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
            · {dockets.filter(d => d.isActive).length} active
          </span>
        </div>
        <button className="btn-accent" onClick={() => setShowCreate(!showCreate)} style={{ fontSize: 11, padding: '7px 14px' }}>
          {showCreate ? '✕ Cancel' : '＋ Create Docket'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div style={{ padding: 16, borderRadius: 14, border: '2px solid var(--accent-dim)', background: 'var(--surface)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>📋 Create New Care Docket</div>
          {message && <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>{message}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Docket Name *</label>
                <input className="search-inp" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Pediatric Respiratory Care" />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Specialty</label>
                <input className="search-inp" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder={doctorSpecialty} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Description</label>
              <textarea className="search-inp" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Purpose and scope of this care docket…" style={{ minHeight: 60, resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Tools · {selectedTools.length} selected</label>
              <input className="search-inp" value={searchTools} onChange={e => setSearchTools(e.target.value)} placeholder="Search tools…" style={{ marginBottom: 8, fontSize: 12 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 140, overflowY: 'auto', padding: '4px 0' }}>
                {filteredTools.map(t => {
                  const selected = selectedTools.includes(t);
                  return (
                    <button key={t} onClick={() => toggleTool(t)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'var(--accent-dim)' : 'var(--bg)',
                        color: selected ? 'var(--accent)' : 'var(--text-2)',
                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .12s',
                      }}>
                      {TOOL_ICONS[t] || '🔧'} {TOOL_LABELS[t] || t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-accent" onClick={handleCreate} disabled={creating || !newName} style={{ flex: 2 }}>
                {creating ? '⏳ Creating…' : '✅ Create Docket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docket List */}
      {dockets.length === 0 && !showCreate ? (
        <div className="empty-sm">
          <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
          <p>No care dockets yet. Create your first clinical workspace.</p>
        </div>
      ) : dockets.map(docket => {
        const isExpanded = expandedDocket === docket.id;
        const isActive = docket.id === activeDocketId;
        return (
          <div key={docket.id} style={{
            borderRadius: 14, border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            background: isActive ? 'var(--accent-dim)' : 'var(--surface)',
            overflow: 'hidden', transition: 'all .15s',
          }}>
            <div onClick={() => { setExpandedDocket(isExpanded ? null : docket.id); onSelectDocket(docket); }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}>
              <div style={{ fontSize: 28 }}>📂</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {docket.name}
                  {isActive && <span className="status-pill" style={{ background: 'rgba(16,185,129,.15)', color: '#10b981', fontSize: 9, padding: '2px 8px' }}>● Active</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{docket.specialty}{docket.description ? ` · ${docket.description}` : ''}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10, color: 'var(--text-2)' }}>
                  <span>👥 {docket.patientCount} patients</span>
                  <span>🔧 {docket.tools?.length || 0} tools</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className={`${docket.isActive ? 'btn-start' : 'btn-secondary'}`} style={{ fontSize: 10, padding: '4px 10px', width: 'auto' }}
                  onClick={e => { e.stopPropagation(); onActivateDocket(docket.id, !docket.isActive); }}>
                  {docket.isActive ? '● Active' : '○ Inactive'}
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 8 }}>
                  Configured Tools ({docket.tools?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {(docket.tools?.length ? docket.tools : ['No tools configured']).map((tool, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)',
                    }}>
                      {TOOL_ICONS[tool] || '🔧'} {TOOL_LABELS[tool] || tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
