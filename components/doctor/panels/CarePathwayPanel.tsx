'use client';

import React, { useState } from 'react';

interface PathwayDef {
  id: string; name: string; condition: string; icon: string;
  description: string; milestones: string[]; duration: string;
  activePatients?: number;
}

const PATHWAYS: PathwayDef[] = [
  { id: 'hypertension', name: 'Hypertension Care', condition: 'Hypertension', icon: '❤️',
    description: 'Structured HTN management — diagnosis, staging, meds, lifestyle, follow-up',
    milestones: ['Diagnosis & Staging', 'Medication Initiation', '4-week Review', '3-month Optimization', '6-month Maintenance', 'Annual Review'],
    duration: 'Lifelong',
  },
  { id: 'diabetes_t2', name: 'Type 2 Diabetes', condition: 'Diabetes', icon: '🍬',
    description: 'Comprehensive T2DM care — glycemic control, complication screening, lifestyle',
    milestones: ['New Diagnosis Workup', 'Metformin Initiation', '3-month HbA1c', 'Annual Eye Exam', 'Foot Assessment', 'Renal Screening'],
    duration: 'Lifelong',
  },
  { id: 'asthma', name: 'Asthma Management', condition: 'Asthma', icon: '🫁',
    description: 'Stepwise asthma control — inhaler therapy, action plans, exacerbation prevention',
    milestones: ['Diagnosis Confirmation', 'Inhaler Start', 'Step-up Review', 'Asthma Action Plan', 'Peak Flow Monitoring', '3-month Control Check'],
    duration: 'Lifelong',
  },
  { id: 'antenatal', name: 'Antenatal Care', condition: 'Pregnancy', icon: '🤰',
    description: 'Full ANC schedule — booking visits, scans, labs, risk assessment, delivery planning',
    milestones: ['Booking Visit <16wks', 'First Trimester Screen', '20-week Anomaly Scan', '24-week GTT', '28-week Review', '36-week Delivery Plan'],
    duration: '40 weeks',
  },
  { id: 'ckd', name: 'CKD Management', condition: 'CKD', icon: '🫘',
    description: 'Chronic kidney disease — staging, BP control, anemia, dialysis planning',
    milestones: ['CKD Staging', 'BP Optimization', 'Anemia Workup', 'Bone Mineral Management', 'Vascular Access Planning', 'RRT Decision'],
    duration: 'Lifelong',
  },
  { id: 'tb', name: 'TB Treatment', condition: 'Tuberculosis', icon: '🦠',
    description: 'Directly observed therapy — intensive & continuation phases, monitoring',
    milestones: ['Diagnosis & Registration', 'Intensive Phase Start', '2-month Sputum Check', 'Continuation Phase', '5-month Review', 'Treatment Completion'],
    duration: '6-12 months',
  },
  { id: 'hiv', name: 'HIV Care', condition: 'HIV', icon: '🧬',
    description: 'ART initiation, viral load monitoring, OI prophylaxis, long-term follow-up',
    milestones: ['Linkage to Care', 'ART Initiation', '6-week VL Check', '6-month Viral Suppression', 'Annual CD4', 'OI Prophylaxis Review'],
    duration: 'Lifelong',
  },
  { id: 'stroke_rehab', name: 'Stroke Rehabilitation', condition: 'Post-Stroke', icon: '🧠',
    description: 'Post-stroke care — acute management, rehab therapy, secondary prevention',
    milestones: ['Acute Phase (0-72h)', 'Inpatient Rehab', 'Discharge Planning', 'Outpatient PT/OT', '3-month Assessment', 'Secondary Prevention'],
    duration: '6-12 months',
  },
  { id: 'preop', name: 'Pre-operative Assessment', condition: 'Surgery', icon: '🔪',
    description: 'Pre-surgical optimization — risk assessment, labs, clearance, planning',
    milestones: ['Risk Stratification', 'Cardiac Clearance', 'Lab Optimization', 'Medication Management', 'Day-of-Surgery Check', 'Post-op Planning'],
    duration: 'Peri-operative',
  },
  { id: 'palliative', name: 'Palliative Care', condition: 'Palliative', icon: '🌅',
    description: 'Symptom control, advance directives, family support, end-of-life planning',
    milestones: ['Needs Assessment', 'Symptom Management', 'Advance Directive', 'Family Conference', 'Home Care Setup', 'Bereavement Support'],
    duration: 'Variable',
  },
];

interface EnrolledPatient {
  patientId: string; patientName: string; pathwayId: string;
  currentMilestone: number; startDate: string; status: 'active' | 'completed' | 'paused';
}

interface Props {
  patients: { uid: string; name: string; condition?: string }[];
  enrolled: EnrolledPatient[];
  onEnrollInPathway: (patientId: string, pathwayId: string) => void;
  onUpdateMilestone: (patientId: string, pathwayId: string, milestone: number) => void;
  onEnrollClick?: () => void;
}

export default function CarePathwayPanel({ patients, enrolled, onEnrollInPathway, onUpdateMilestone, onEnrollClick }: Props) {
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredEnrolled = filter === 'all' ? enrolled : enrolled.filter(e => e.status === filter);
  const activePathways = PATHWAYS.filter(p => filteredEnrolled.some(e => e.pathwayId === p.id));
  const availablePathways = PATHWAYS.filter(p => !enrolled.some(e => e.pathwayId === p.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'completed'] as const).map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '📋 All' : f === 'active' ? '● Active' : '✅ Completed'}
            </button>
          ))}
        </div>
        <button className="btn-accent" onClick={() => onEnrollClick?.()} style={{ fontSize: 12, padding: '7px 14px' }}>
          ➕ Enroll Patient
        </button>
      </div>

      {activePathways.length === 0 && (
        <div className="empty-sm">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛤️</div>
          <p>No active care pathways. Enroll patients in structured care programs.</p>
          <button className="btn-accent" onClick={() => onEnrollClick?.()} style={{ marginTop: 12 }}>➕ Enroll First Patient</button>
        </div>
      )}

      {activePathways.map(pathway => {
        const pathwayEnrollees = filteredEnrolled.filter(e => e.pathwayId === pathway.id);
        const isExpanded = expandedPathway === pathway.id;
        return (
          <div key={pathway.id} className="pathway-card" style={{
            borderRadius: 14, border: '1px solid var(--border)',
            overflow: 'hidden', background: 'var(--bg)', transition: 'all .15s',
          }}>
            <div className="pathway-header" onClick={() => setExpandedPathway(isExpanded ? null : pathway.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}>
              <div style={{ fontSize: 32 }}>{pathway.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{pathway.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pathway.condition} · {pathway.duration} · {pathwayEnrollees.length} patients</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{isExpanded ? '▲' : '▼'}</div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Milestones: {pathway.milestones.join(' → ')}</div>
                {pathwayEnrollees.map(enrollee => (
                  <div key={enrollee.patientId} className="enrollee-row" style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 13, flex: 1, fontWeight: 600 }}>{enrollee.patientName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>Step {enrollee.currentMilestone + 1}/{pathway.milestones.length}</span>
                      <select className="filter-chip" value={enrollee.currentMilestone} onChange={e => onUpdateMilestone(enrollee.patientId, enrollee.pathwayId, parseInt(e.target.value))}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                        {pathway.milestones.map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <span className={`status-pill`} style={{
                      background: enrollee.status === 'active' ? 'rgba(16,185,129,.15)' : enrollee.status === 'completed' ? 'rgba(99,102,241,.15)' : 'rgba(245,158,11,.15)',
                      color: enrollee.status === 'active' ? '#10b981' : enrollee.status === 'completed' ? '#6366f1' : '#f59e0b',
                      fontSize: 10,
                    }}>{enrollee.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}


    </div>
  );
}
