'use client';
// components/wall/PatientBanner.tsx

import { Patient } from '@/components/PatientWallPage';
import { ToolAssignment, ToolReading } from '@/lib/diseaseTools';
import { TOOL_CONFIGS } from '@/lib/diseaseTools';

const LC: Record<string, string> = { normal:'#10b981', watch:'#f59e0b', video:'#6366f1', clinic:'#f97316', hospital:'#ef4444' };

interface Props {
  patient: Patient;
  overall: { label: string; color: string; bg: string; icon: string };
  assignments: ToolAssignment[];
  allReadings: Record<string, ToolReading[]>;
}

const fmtAge = (dob?: string) => {
  if (!dob) return '—';
  const birth = new Date(dob);
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} yrs`;
};

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtAgo = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return fmtDate(ts);
};

export default function PatientBanner({ patient, overall, assignments, allReadings }: Props) {
  const initials = patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={s.banner}>
      <div style={s.inner}>

        {/* Left: avatar + core identity */}
        <div style={s.left}>
          <div style={s.avatar}>{initials}</div>
          <div>
            <div style={s.name}>{patient.name}</div>
            <div style={s.meta}>
              {patient.gender} · {fmtAge(patient.dob)} · {patient.dob}
              {patient.bloodGroup && ` · ${patient.bloodGroup}`}
              {patient.phone && ` · ${patient.phone}`}
            </div>
            <div style={s.location}>📍 {patient.location}</div>
            <div style={s.chips}>
              <span style={{ ...s.chip, background: overall.bg, color: overall.color, border: `1px solid ${overall.color}40` }}>
                {overall.icon} {overall.label}
              </span>
              {patient.conditions?.map(c => (
                <span key={c} style={s.chipTag}>{c}</span>
              ))}
              {patient.allergies?.map(a => (
                <span key={a.drug} style={s.chipAllergy}>⚠ {a.drug}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Centre: live vitals summary */}
        <div style={s.vitals}>
          {assignments.slice(0, 5).map(a => {
            const cfg = TOOL_CONFIGS[a.toolType];
            const lat = allReadings[a.id]?.[0];
            const lc  = LC[lat?.triage?.level || 'normal'];
            const val = a.toolType === 'bp_monitor'
              ? `${lat?.data?.systolic ?? '—'}/${lat?.data?.diastolic ?? '—'}`
              : cfg?.chartFields?.[0] ? (lat?.data?.[cfg.chartFields[0]] ?? '—') : '—';
            return (
              <div key={a.id} style={s.vitalCard}>
                <div style={s.vitalIcon}>{cfg?.icon}</div>
                <div style={{ ...s.vitalVal, color: lc }}>{val}</div>
                <div style={s.vitalUnit}>{cfg?.unit || cfg?.chartRef?.unit || ''}</div>
                <div style={s.vitalName}>{cfg?.name?.split(' ')[0]}</div>
                {lat && <div style={s.vitalTime}>{fmtAgo(lat.recordedAt)}</div>}
              </div>
            );
          })}
          {assignments.length === 0 && (
            <div style={s.noTools}>No monitoring tools assigned yet</div>
          )}
        </div>

        {/* Right: primary doctor */}
        <div style={s.right}>
          <div style={s.doctorLabel}>Primary doctor</div>
          <div style={s.doctorCard}>
            <div style={s.doctorAv}>
              {patient.primaryDoctorName?.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={s.doctorName}>{patient.primaryDoctorName}</div>
              <div style={s.doctorSpec}>{patient.primaryDoctorSpec || 'General Practitioner'}</div>
              <div style={s.doctorFacility}>{patient.primaryDoctorFacility}</div>
            </div>
          </div>
          <div style={s.patientId}>ID: {patient.id.slice(0, 12).toUpperCase()}</div>
          <div style={s.since}>Patient since: {fmtDate(patient.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  banner: { background: '#fff', borderBottom: '1px solid #e8eef5', padding: '14px 20px' },
  inner: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  left: { display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 280 },
  avatar: {
    width: 54, height: 54, borderRadius: '50%',
    background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0,
    boxShadow: '0 2px 8px rgba(99,102,241,.3)',
  },
  name: { fontSize: 18, fontWeight: 800, color: '#0d1b2a', lineHeight: 1.2 },
  meta: { fontSize: 11, color: '#64748b', marginTop: 3 },
  location: { fontSize: 11, color: '#8fa3bd', marginTop: 2 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7 },
  chip: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 3 },
  chipTag: { fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
  chipAllergy: { fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', fontWeight: 700 },
  vitals: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', flex: 2 },
  vitalCard: {
    background: '#f8fafc', border: '1.5px solid #e8eef5', borderRadius: 12,
    padding: '10px 14px', textAlign: 'center', minWidth: 80,
    transition: 'border-color .2s',
  },
  vitalIcon: { fontSize: 18, marginBottom: 4 },
  vitalVal: { fontSize: 20, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 },
  vitalUnit: { fontSize: 9, color: '#8fa3bd', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 },
  vitalName: { fontSize: 9, color: '#8fa3bd', marginTop: 2, textTransform: 'uppercase', letterSpacing: .5 },
  vitalTime: { fontSize: 9, color: '#c4d0de', marginTop: 3 },
  noTools: { fontSize: 12, color: '#8fa3bd', padding: '16px 0' },
  right: { flexShrink: 0, minWidth: 180 },
  doctorLabel: { fontSize: 9, color: '#8fa3bd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 },
  doctorCard: { display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e8eef5', borderRadius: 10, padding: '8px 11px', marginBottom: 8 },
  doctorAv: { width: 32, height: 32, borderRadius: '50%', background: '#e0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0aaa76', flexShrink: 0 },
  doctorName: { fontSize: 12, fontWeight: 700, color: '#0d1b2a' },
  doctorSpec: { fontSize: 10, color: '#64748b', marginTop: 1 },
  doctorFacility: { fontSize: 10, color: '#8fa3bd', marginTop: 1 },
  patientId: { fontSize: 10, color: '#8fa3bd', fontFamily: 'monospace' },
  since: { fontSize: 10, color: '#8fa3bd', marginTop: 2 },
};