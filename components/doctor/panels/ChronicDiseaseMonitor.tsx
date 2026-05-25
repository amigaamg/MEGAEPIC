'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';

type DiseaseType = 'hypertension' | 'diabetes_t2' | 'asthma' | 'hiv' | 'ckd' | 'heart_failure' | 'copd' | 'sickle_cell';

interface DiseaseConfig {
  type: DiseaseType;
  label: string;
  icon: string;
  metrics: { key: string; label: string; unit: string; normalRange: string; icon: string }[];
  milestones: { label: string; description: string }[];
}

const DISEASE_CONFIGS: Record<DiseaseType, DiseaseConfig> = {
  hypertension: {
    type: 'hypertension', label: 'Hypertension Management', icon: '❤️',
    metrics: [
      { key: 'systolic', label: 'Systolic BP', unit: 'mmHg', normalRange: '<130', icon: '⬆️' },
      { key: 'diastolic', label: 'Diastolic BP', unit: 'mmHg', normalRange: '<80', icon: '⬇️' },
      { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', normalRange: '60-100', icon: '💓' },
      { key: 'weight', label: 'Weight', unit: 'kg', normalRange: 'BMI <25', icon: '⚖️' },
    ],
    milestones: [
      { label: 'BP Controlled (<130/80)', description: 'Sustained BP target achieved' },
      { label: 'On Single Agent', description: 'Monotherapy adequate' },
      { label: 'Lifestyle Modified', description: 'Diet, exercise, salt reduction' },
      { label: '6-month Target', description: 'Sustained control at 6 months' },
      { label: 'CV Risk Assessed', description: 'Full cardiovascular risk profile' },
    ],
  },
  diabetes_t2: {
    type: 'diabetes_t2', label: 'Type 2 Diabetes Management', icon: '🍬',
    metrics: [
      { key: 'hba1c', label: 'HbA1c', unit: '%', normalRange: '<7.0', icon: '🅰️' },
      { key: 'fastingGlucose', label: 'Fasting Glucose', unit: 'mmol/L', normalRange: '4.0-7.0', icon: '🌅' },
      { key: 'postPrandial', label: 'Post-prandial', unit: 'mmol/L', normalRange: '<10.0', icon: '🍽️' },
      { key: 'weight', label: 'Weight', unit: 'kg', normalRange: 'BMI <25', icon: '⚖️' },
    ],
    milestones: [
      { label: 'HbA1c < 7.0%', description: 'Glycemic target achieved' },
      { label: 'Monotherapy', description: 'Controlled on single agent' },
      { label: 'Foot Exam Done', description: 'Annual foot assessment complete' },
      { label: 'Eye Screening', description: 'Retinal screening up to date' },
      { label: 'Nephropathy Screening', description: 'Urine ACR / eGFR checked' },
    ],
  },
  asthma: {
    type: 'asthma', label: 'Asthma Management', icon: '🌬️',
    metrics: [
      { key: 'peakFlow', label: 'Peak Flow', unit: 'L/min', normalRange: '>80% predicted', icon: '💨' },
      { key: 'actScore', label: 'ACT Score', unit: '/25', normalRange: '>20', icon: '📝' },
      { key: 'exacerbations', label: 'Exacerbations', unit: '/year', normalRange: '<2', icon: '⚠️' },
      { key: 'inhalerAdherence', label: 'Inhaler Adherence', unit: '%', normalRange: '>80%', icon: '💊' },
    ],
    milestones: [
      { label: 'ACT Score > 20', description: 'Well controlled asthma' },
      { label: 'Step-down Achieved', description: 'Treatment stepped down successfully' },
      { label: 'No Exacerbations (6mo)', description: 'No acute attacks in 6 months' },
      { label: 'Inhaler Technique Correct', description: 'Proper inhaler technique confirmed' },
      { label: 'Action Plan in Place', description: 'Written asthma action plan given' },
    ],
  },
  hiv: {
    type: 'hiv', label: 'HIV Care', icon: '🧬',
    metrics: [
      { key: 'viralLoad', label: 'Viral Load', unit: 'copies/mL', normalRange: '<50', icon: '🧬' },
      { key: 'cd4', label: 'CD4 Count', unit: 'cells/µL', normalRange: '>500', icon: '🛡️' },
      { key: 'cd4Percent', label: 'CD4 %', unit: '%', normalRange: '>25%', icon: '📊' },
      { key: 'artAdherence', label: 'ART Adherence', unit: '%', normalRange: '>95%', icon: '💊' },
    ],
    milestones: [
      { label: 'Viral Load Suppressed', description: 'VL < 50 copies/mL' },
      { label: 'On ART', description: 'Initiated and stable on antiretroviral therapy' },
      { label: 'OI Prophylaxis', description: 'Opportunistic infection prophylaxis complete' },
      { label: 'Contact Tracing', description: 'Partner notification and testing done' },
      { label: 'CD4 > 500', description: 'Immune reconstitution achieved' },
    ],
  },
  ckd: {
    type: 'ckd', label: 'CKD Management', icon: '🫘',
    metrics: [
      { key: 'egfr', label: 'eGFR', unit: 'mL/min', normalRange: '>60', icon: '🫘' },
      { key: 'creatinine', label: 'Creatinine', unit: 'µmol/L', normalRange: '60-110', icon: '🧪' },
      { key: 'potassium', label: 'Potassium', unit: 'mmol/L', normalRange: '3.5-5.2', icon: '⚡' },
      { key: 'acr', label: 'Urine ACR', unit: 'mg/mmol', normalRange: '<3', icon: '🔬' },
    ],
    milestones: [
      { label: 'BP Controlled', description: 'BP < 130/80 for CKD' },
      { label: 'ACEi/ARB Initiated', description: 'Reno-protective therapy started' },
      { label: 'eGFR Stable', description: 'No decline > 5mL/min/year' },
      { label: 'Dialysis Planned', description: 'AV fistula / PD catheter arranged' },
      { label: 'Anemia Corrected', description: 'Hb > 10 g/dL on ESA' },
    ],
  },
  heart_failure: {
    type: 'heart_failure', label: 'Heart Failure Management', icon: '💔',
    metrics: [
      { key: 'ef', label: 'Ejection Fraction', unit: '%', normalRange: '>50%', icon: '💓' },
      { key: 'b np', label: 'BNP/NT-proBNP', unit: 'pg/mL', normalRange: '<125', icon: '🧪' },
      { key: 'weight', label: 'Daily Weight', unit: 'kg', normalRange: 'Stable', icon: '⚖️' },
      { key: 'sixMinWalk', label: '6-min Walk', unit: 'm', normalRange: '>350', icon: '🚶' },
    ],
    milestones: [
      { label: 'Guideline Therapy', description: 'On GDMT (ACEi/ARB, BB, MRA, SGLT2i)' },
      { label: 'Euvolemic', description: 'No fluid overload on exam' },
      { label: 'No Admissions (6mo)', description: 'No HF hospitalizations in 6 months' },
      { label: 'Self-management', description: 'Daily weights, symptom monitoring' },
    ],
  },
  copd: {
    type: 'copd', label: 'COPD Management', icon: '🫁',
    metrics: [
      { key: 'fev1', label: 'FEV1', unit: '% predicted', normalRange: '>50%', icon: '💨' },
      { key: 'catScore', label: 'CAT Score', unit: '/40', normalRange: '<10', icon: '📝' },
      { key: 'exacerbations', label: 'Exacerbations', unit: '/year', normalRange: '<2', icon: '⚠️' },
      { key: 'spo2', label: 'SpO₂', unit: '%', normalRange: '>92%', icon: '🫧' },
    ],
    milestones: [
      { label: 'Smoking Cessation', description: 'Successfully quit smoking' },
      { label: 'Inhaler Optimized', description: 'On appropriate inhaler regimen' },
      { label: 'Pulmonary Rehab', description: 'Completed pulmonary rehabilitation' },
      { label: 'Vaccinations Up-to-date', description: 'Flu, pneumococcal, COVID' },
    ],
  },
  sickle_cell: {
    type: 'sickle_cell', label: 'Sickle Cell Disease', icon: '🩸',
    metrics: [
      { key: 'hb', label: 'Hemoglobin', unit: 'g/dL', normalRange: '>9', icon: '🩸' },
      { key: 'hbF', label: 'HbF', unit: '%', normalRange: '>20%', icon: '🧬' },
      { key: 'crises', label: 'Painful Crises', unit: '/year', normalRange: '<3', icon: '💉' },
      { key: 'transfusions', label: 'Transfusions', unit: '/year', normalRange: '<2', icon: '🩸' },
    ],
    milestones: [
      { label: 'Hydroxyurea Optimized', description: 'On maximally tolerated dose' },
      { label: 'Pain Protocol', description: 'Individualized pain management plan' },
      { label: 'Stroke Screen', description: 'TCD screening completed' },
      { label: 'Immunizations', description: 'Penicillin prophylaxis, vaccines current' },
      { label: 'Crisis-free (6mo)', description: 'No acute crises in 6 months' },
    ],
  },
};

interface DiseaseReading {
  id?: string;
  patientId: string; diseaseType: DiseaseType;
  metricKey: string; value: number; unit: string;
  recordedAt: Timestamp | any; recordedBy: string;
  note?: string; source?: string;
}

interface DiseaseEnrollment {
  id?: string;
  patientId: string; doctorId: string;
  diseaseType: DiseaseType;
  enrolledAt: Timestamp | any;
  milestones: { label: string; achieved: boolean; achievedAt?: Timestamp | any }[];
  currentStage?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
  status: 'active' | 'completed' | 'lost_to_follow_up';
}

interface Props {
  patientId: string; doctorId: string; doctorName: string;
  diseaseType: DiseaseType;
  compact?: boolean;
}

const fmtDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtShort = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};

export default function ChronicDiseaseMonitor({ patientId, doctorId, doctorName, diseaseType, compact }: Props) {
  const cfg = DISEASE_CONFIGS[diseaseType];
  const [readings, setReadings] = useState<DiseaseReading[]>([]);
  const [enrollment, setEnrollment] = useState<DiseaseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReading, setNewReading] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'disease_readings'), where('patientId', '==', patientId), where('diseaseType', '==', diseaseType), orderBy('recordedAt', 'desc')),
      snap => { setReadings(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiseaseReading))); setLoading(false); },
      () => setLoading(false),
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'disease_enrollments'), where('patientId', '==', patientId), where('diseaseType', '==', diseaseType), where('status', '==', 'active')),
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as DiseaseEnrollment));
        setEnrollment(docs[0] || null);
      },
    ));

    return () => unsubs.forEach(u => u());
  }, [patientId, diseaseType]);

  // Latest reading per metric
  const latestByMetric: Record<string, DiseaseReading> = {};
  readings.forEach(r => { if (!latestByMetric[r.metricKey]) latestByMetric[r.metricKey] = r; });

  const handleSaveReading = useCallback(async () => {
    const entries = Object.entries(newReading).filter(([_, v]) => v.trim() !== '');
    if (entries.length === 0) return;
    setSaving(true);
    try {
      const now = serverTimestamp();
      for (const [key, val] of entries) {
        const reading = {
          patientId, diseaseType, metricKey: key,
          value: parseFloat(val) || 0, unit: cfg.metrics.find(m => m.key === key)?.unit || '',
          recordedAt: now, recordedBy: doctorId, note: note || '',
          source: 'doctor_entry',
        };
        const ref = await addDoc(collection(db, 'disease_readings'), reading);
        await writeTimelineEvent({
          patientId, type: 'vital_recorded',
          title: `${cfg.icon} ${cfg.label}: ${cfg.metrics.find(m => m.key === key)?.label} = ${val} ${cfg.metrics.find(m => m.key === key)?.unit || ''}`,
          description: note || `Routine ${diseaseType.replace('_', ' ')} monitoring`,
          severity: getSeverity(diseaseType, key, parseFloat(val)),
          createdBy: doctorId, linkedDocId: ref.id, linkedCollection: 'disease_readings',
          metadata: { diseaseType, metricKey: key, value: val },
        });
      }
      // Check and update milestones
      if (enrollment?.id) {
        await checkMilestones(enrollment, latestByMetric, readings);
      } else {
        // Auto-enroll
        const enrolled = await addDoc(collection(db, 'disease_enrollments'), {
          patientId, doctorId, diseaseType, enrolledAt: serverTimestamp(),
          milestones: cfg.milestones.map(m => ({ label: m.label, achieved: false })),
          riskLevel: 'moderate', status: 'active',
        });
        await writeTimelineEvent({
          patientId, type: 'care_pathway_enrolled',
          title: `${cfg.icon} Enrolled in ${cfg.label}`,
          severity: 'success', createdBy: doctorId,
          linkedDocId: enrolled.id, linkedCollection: 'disease_enrollments',
        });
      }
      setNewReading({});
      setNote('');
    } catch (e) { console.error('Save reading failed:', e); }
    setSaving(false);
  }, [newReading, note, patientId, doctorId, diseaseType, cfg, enrollment, latestByMetric, readings]);

  const getSeverity = (dt: DiseaseType, key: string, val: number): 'info' | 'warning' | 'critical' | 'success' => {
    if (dt === 'hypertension' && key === 'systolic') return val >= 180 ? 'critical' : val >= 140 ? 'warning' : val < 130 ? 'success' : 'info';
    if (dt === 'diabetes_t2' && key === 'hba1c') return val > 10 ? 'critical' : val > 8 ? 'warning' : val < 7 ? 'success' : 'info';
    if (dt === 'asthma' && key === 'actScore') return val <= 15 ? 'critical' : val < 20 ? 'warning' : 'success';
    if (dt === 'hiv' && key === 'viralLoad') return val > 10000 ? 'critical' : val > 50 ? 'warning' : 'success';
    if (dt === 'ckd' && key === 'egfr') return val < 15 ? 'critical' : val < 30 ? 'warning' : val > 60 ? 'success' : 'info';
    return 'info';
  };

  const checkMilestones = async (enr: DiseaseEnrollment, latest: Record<string, DiseaseReading>, all: DiseaseReading[]) => {
    const updated = [...enr.milestones];
    let changed = false;

    if (diseaseType === 'hypertension') {
      const sys = all.filter(r => r.metricKey === 'systolic').slice(0, 3);
      const allControlled = sys.every(r => r.value < 130);
      if (allControlled && sys.length >= 2 && !updated.find(m => m.label === 'BP Controlled (<130/80)')?.achieved) {
        const idx = updated.findIndex(m => m.label === 'BP Controlled (<130/80)');
        if (idx >= 0) { updated[idx] = { ...updated[idx], achieved: true, achievedAt: new Date() as any }; changed = true; }
      }
    }

    if (changed && enr.id) {
      await updateDoc(doc(db, 'disease_enrollments', enr.id), { milestones: updated });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{cfg.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: compact ? 13 : 15 }}>{cfg.label}</div>
          {enrollment && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: '#10b98120', color: '#10b981', fontWeight: 700 }}>
                ● Enrolled {fmtDate(enrollment.enrolledAt)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                {enrollment.milestones.filter(m => m.achieved).length}/{enrollment.milestones.length} milestones
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Current metrics display */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cfg.metrics.length, 4)}, 1fr)`, gap: compact ? 6 : 8 }}>
        {cfg.metrics.map(metric => {
          const reading = latestByMetric[metric.key];
          const sev = reading ? getSeverity(diseaseType, metric.key, reading.value) : 'info';
          const color = sev === 'success' ? '#10b981' : sev === 'warning' ? '#f59e0b' : sev === 'critical' ? '#ef4444' : 'var(--text)';
          return (
            <div key={metric.key} style={{
              padding: compact ? 8 : 12, borderRadius: 12, textAlign: 'center',
              background: 'var(--bg)', border: `1px solid ${color}30`,
            }}>
              <div style={{ fontSize: 18 }}>{metric.icon}</div>
              <div style={{ fontSize: compact ? 16 : 20, fontWeight: 900, fontFamily: 'var(--mono)', color, marginTop: 2 }}>
                {reading ? reading.value : '—'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .3 }}>{metric.label}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>Norm: {metric.normalRange}</div>
              {reading && (
                <div style={{ fontSize: 8, color: 'var(--muted)', marginTop: 1 }}>{fmtShort(reading.recordedAt)}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* New reading entry */}
      <div style={{ padding: compact ? 10 : 14, borderRadius: 12, border: '2px solid var(--accent-dim)', background: 'var(--surface)' }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>📝 Record New Measurements</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cfg.metrics.length, 4)}, 1fr)`, gap: 8, marginBottom: 8 }}>
          {cfg.metrics.map(metric => (
            <div key={metric.key} className="field-col">
              <span className="field-lbl">{metric.icon} {metric.label} ({metric.unit})</span>
              <input className="field-inp" type="number" step="0.1" style={{ fontSize: 12, padding: '6px 8px' }}
                placeholder={metric.normalRange}
                value={newReading[metric.key] || ''}
                onChange={e => setNewReading(prev => ({ ...prev, [metric.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="field-col" style={{ marginBottom: 8 }}>
          <span className="field-lbl">Note (optional)</span>
          <input className="field-inp" style={{ fontSize: 12, padding: '6px 8px' }}
            placeholder="e.g. Fasting, post-exercise, morning reading..."
            value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button className="btn-sm-accent" onClick={handleSaveReading} disabled={saving || Object.values(newReading).every(v => !v.trim())}>
          {saving ? 'Saving...' : '💾 Record & Check Milestones'}
        </button>
      </div>

      {/* Milestones */}
      {cfg.milestones.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>🏁 Care Milestones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cfg.milestones.map((ms, i) => {
              const achieved = enrollment?.milestones.find(m => m.label === ms.label)?.achieved || false;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: compact ? 6 : 8, borderRadius: 8,
                  background: achieved ? '#10b98110' : 'var(--bg)',
                  border: achieved ? '1px solid #10b98130' : '1px solid var(--border)',
                  opacity: achieved ? 1 : 0.7,
                }}>
                  <span style={{ fontSize: 16 }}>{achieved ? '✅' : '⭕'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: compact ? 11 : 12, color: achieved ? '#10b981' : 'var(--text)' }}>
                      {ms.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{ms.description}</div>
                  </div>
                  {achieved && enrollment?.milestones.find(m => m.label === ms.label)?.achievedAt && (
                    <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                      {fmtDate(enrollment!.milestones.find(m => m.label === ms.label)!.achievedAt)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Readings history */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>📊 Readings History</span>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{readings.length} total</span>
        </div>
        <div style={{ maxHeight: compact ? 150 : 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 32, borderRadius: 6 }} />)
          ) : readings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--muted)', fontSize: 12 }}>No readings yet.</div>
          ) : (
            readings.slice(0, compact ? 10 : 20).map(r => {
              const m = cfg.metrics.find(m => m.key === r.metricKey);
              const sev = getSeverity(diseaseType, r.metricKey, r.value);
              return (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderRadius: 6, background: 'var(--bg)', fontSize: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{m?.icon || '📊'}</span>
                    <span style={{ fontWeight: 600 }}>{m?.label || r.metricKey}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: sev === 'success' ? '#10b981' : sev === 'warning' ? '#f59e0b' : sev === 'critical' ? '#ef4444' : 'var(--text)' }}>
                      {r.value} {r.unit}
                    </span>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 10 }}>{fmtShort(r.recordedAt)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
