'use client';

import React, { useState } from 'react';

interface Props { patientName?: string; onClose?: () => void; }

interface OrderForm {
  modality: 'ECG' | 'Echocardiogram' | 'Stress Echo';
  indication: string;
  priority: 'routine' | 'urgent' | 'emergency';
  clinicalInfo: string;
  contrast?: boolean;
}

export default function ECGEchoRequest({ patientName, onClose }: Props) {
  const [form, setForm] = useState<OrderForm>({
    modality: 'ECG',
    indication: 'Hypertension with dyspnoea — rule out HF',
    priority: 'routine',
    clinicalInfo: '55y M with HTN, DM, SOB on exertion NYHA II. No chest pain. ECG requested for baseline + echo to assess LVH and diastolic function.',
  });
  const [submitted, setSubmitted] = useState(false);
  const [modality, setModality] = useState<OrderForm['modality']>('ECG');

  const INDICATIONS: Record<string, string[]> = {
    'ECG': ['Routine baseline', 'Hypertension with LV strain', 'Palpitations', 'Chest pain assessment', 'Pre-operative', 'Drug monitoring (QTc)', 'Syncope workup'],
    'Echocardiogram': ['LVH assessment in HTN', 'Heart failure evaluation', 'Valvular disease', 'Cardiomyopathy', 'Source of emboli', 'Endocarditis', 'Pericardial effusion'],
    'Stress Echo': ['Inducible ischaemia', 'Chest pain evaluation', 'Post-MI assessment', 'Valvular heart disease'],
  };

  const ECG_INDICATIONS_EXTRA = [
    { label: 'LVH (Cornell criteria)', detail: 'S in V3 + R in aVL >28 mm for men, >20 mm for women' },
    { label: 'Left atrial abnormality', detail: 'P mitrale in II, negative P in V1 >40 ms' },
    { label: 'QTc prolongation', detail: 'QTc >450 ms men, >460 ms women — risk of torsades' },
    { label: 'ST-T changes', detail: 'Strain pattern in lateral leads suggests LV pressure overload' },
  ];

  const submit = () => {
    setSubmitted(true);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 12px rgba(0,0,0,.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#e11d48,#fb7185)', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .7, marginBottom: 2 }}>🩻 Request ECG / Echo</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Cardiac Imaging & Rhythm Assessment</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{patientName || 'Demo Patient'}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>}
        </div>
      </div>

      {submitted ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e11d48', marginBottom: 6 }}>Order Submitted</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{modality} — {form.indication}</div>
          <button onClick={() => setSubmitted(false)} style={{ padding: '11px 28px', background: '#e11d48', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>New Order</button>
        </div>
      ) : (
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Order form */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📋 Order Details</div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 6 }}>Modality *</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['ECG', 'Echocardiogram', 'Stress Echo'] as const).map(m => (
                    <button key={m} onClick={() => { setModality(m); setForm(f => ({ ...f, modality: m })); }} style={{ flex: 1, padding: '9px 6px', borderRadius: 9, border: `1.5px solid ${modality === m ? '#e11d48' : '#e2e9f3'}`, background: modality === m ? '#fef2f2' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: modality === m ? '#e11d48' : '#64748b', textAlign: 'center' }}>
                      {m.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Indication *</label>
                <select value={form.indication} onChange={e => setForm(f => ({ ...f, indication: e.target.value }))} style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
                  <option value="">Select indication…</option>
                  {(INDICATIONS[modality] || []).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Priority</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['routine', 'urgent', 'emergency'] as const).map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{ flex: 1, padding: '8px 4px', borderRadius: 9, border: `1.5px solid ${form.priority === p ? (p === 'emergency' ? '#ef4444' : p === 'urgent' ? '#f97316' : '#10b981') : '#e2e9f3'}`, background: form.priority === p ? (p === 'emergency' ? '#fef2f2' : p === 'urgent' ? '#fff7ed' : '#f0fdf4') : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: form.priority === p ? (p === 'emergency' ? '#ef4444' : p === 'urgent' ? '#f97316' : '#10b981') : '#64748b', textTransform: 'uppercase' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 4 }}>Clinical Information</label>
                <textarea value={form.clinicalInfo} onChange={e => setForm(f => ({ ...f, clinicalInfo: e.target.value }))} rows={4} placeholder="Relevant history, current meds, specific questions for cardiology…" style={{ width: '100%', padding: '9px', background: '#fff', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 11, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
              </div>

              <button onClick={submit} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#e11d48,#fb7185)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                🩻 Submit Order
              </button>
            </div>
          </div>

          {/* Right: Guidance */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a', marginBottom: 12 }}>📖 Clinical Reference</div>

            {modality === 'ECG' && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>📈 ECG Interpretation — HTN Findings</div>
                {ECG_INDICATIONS_EXTRA.map(item => (
                  <div key={item.label} style={{ padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #e2e9f3', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#e11d48' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{item.detail}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                  <strong>HTN ECG Assessment Protocol:</strong><br />
                  1. Rate & rhythm (sinus, AF)<br />
                  2. LVH by voltage (Sokolow-Lyon, Cornell)<br />
                  3. Left atrial abnormality<br />
                  4. QT interval (drug monitoring)<br />
                  5. ST-T changes (strain, ischaemia)<br />
                  6. Conduction defects (LBBB, RBBB)
                </div>
              </div>
            )}

            {modality === 'Echocardiogram' && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>🫀 Echo Evaluation in HTN</div>
                {[
                  { label: 'LVH Assessment', detail: 'LV mass index >115 g/m² (M), >95 g/m² (F)' },
                  { label: 'Diastolic Function', detail: 'E/e\', LA volume index, TR jet velocity' },
                  { label: 'LV Ejection Fraction', detail: 'Simpson biplane, normal ≥52% (M), ≥54% (F)' },
                  { label: 'LA Size', detail: 'LA volume index >34 mL/m² = abnormality' },
                  { label: 'Aortic Root', detail: 'Dilatation risk in chronic HTN' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #e2e9f3', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#e11d48' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            )}

            {modality === 'Stress Echo' && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e9f3' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>🏃 Stress Echo Protocol</div>
                <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 16, margin: 0, color: '#334155' }}>
                  <li><strong>Indication:</strong> Chest pain, dyspnoea, pre-op risk</li>
                  <li><strong>Protocol:</strong> Exercise or dobutamine stress</li>
                  <li><strong>Positive:</strong> New wall motion abnormality</li>
                  <li><strong>Target HR:</strong> 85% age-predicted max</li>
                  <li><strong>Contraindications:</strong> Unstable CAD, severe AS, uncontrolled HTN</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
