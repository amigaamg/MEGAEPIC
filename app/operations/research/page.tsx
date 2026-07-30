'use client';

import { useState } from 'react';
import { Microscope, Beaker, Database, FileText, Users, BookOpen, Search } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const studies = [
  { id: 'STU-001', name: 'AMEXAN Clinical Outcomes v2', phase: 'Phase III', status: 'active' as const, patients: 1240, dataPoints: 285000, publications: 3, pi: 'Dr. Sarah Chen', enrollmentOpen: true },
  { id: 'STU-002', name: 'AI Diagnostic Accuracy', phase: 'Phase II', status: 'active' as const, patients: 580, dataPoints: 92000, publications: 1, pi: 'Dr. James Wilson', enrollmentOpen: true },
  { id: 'STU-003', name: 'Drug Interaction Study', phase: 'Phase IV', status: 'active' as const, patients: 3200, dataPoints: 740000, publications: 7, pi: 'Dr. Maria Rodriguez', enrollmentOpen: false },
  { id: 'STU-004', name: 'Pediatric Vital Signs Norms', phase: 'Phase I', status: 'recruiting' as const, patients: 150, dataPoints: 18000, publications: 0, pi: 'Dr. Emily Park', enrollmentOpen: true },
  { id: 'STU-005', name: 'Telemedicine Efficacy RCT', phase: 'Phase III', status: 'completed' as const, patients: 890, dataPoints: 156000, publications: 5, pi: 'Dr. Alan Turing', enrollmentOpen: false },
  { id: 'STU-006', name: 'Genomic Marker Discovery', phase: 'Phase II', status: 'active' as const, patients: 420, dataPoints: 420000, publications: 2, pi: 'Dr. Lisa Zhang', enrollmentOpen: true },
  { id: 'STU-007', name: 'Post-Operative Recovery Protocol', phase: 'Phase III', status: 'recruiting' as const, patients: 310, dataPoints: 64000, publications: 0, pi: 'Dr. Robert Kim', enrollmentOpen: true },
  { id: 'STU-008', name: 'Mental Health Screening Tool', phase: 'Phase II', status: 'completed' as const, patients: 675, dataPoints: 89000, publications: 4, pi: 'Dr. Anna Novak', enrollmentOpen: false },
];

const statusColors = { active: C.green, recruiting: C.sky, completed: C.textMuted };

export default function ResearchPage() {
  const [search, setSearch] = useState('');

  const filtered = studies.filter(s =>
    !search || s.id.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()) || s.pi.toLowerCase().includes(search.toLowerCase())
  );

  const activeStudies = studies.filter(s => s.status !== 'completed').length;
  const totalPatients = studies.reduce((a, s) => a + s.patients, 0);
  const totalDataPoints = studies.reduce((a, s) => a + s.dataPoints, 0);
  const totalPublications = studies.reduce((a, s) => a + s.publications, 0);

  return (
    <div style={S.page}>
      <div style={S.h1}><Microscope size={20} color={C.sky} /> Research Operations</div>
      <div style={S.sub}>Level 9 · Study registry, data exports, cohort queries, and publication tracking</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{activeStudies}</div>
          <div style={S.statLabel}>Active Studies</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>{totalPatients.toLocaleString()}</div>
          <div style={S.statLabel}>Enrolled Patients</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.amber)}>{(totalDataPoints / 1000).toFixed(0)}K</div>
          <div style={S.statLabel}>Data Points Collected</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.purple)}>{totalPublications}</div>
          <div style={S.statLabel}>Publications</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search studies..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.grid2}>
        {filtered.map(s => (
          <div key={s.id} style={{ ...S.cardH }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: 600, color: '#f1f5f9' }}>{s.name}</div>
              <span style={S.badge(statusColors[s.status], `${statusColors[s.status]}15`)}>{s.status}</span>
            </div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: C.textMuted, marginBottom: 4 }}>{s.id} · {s.phase} · PI: {s.pi}</div>
            <div style={{ display: 'flex', gap: 'clamp(8px, 1vw, 16px)', marginTop: 10, flexWrap: 'wrap' as const }}>
              <div><span style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 700, color: C.sky }}>{s.patients}</span><span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: C.textMuted, marginLeft: 3 }}>patients</span></div>
              <div><span style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 700, color: C.amber }}>{(s.dataPoints / 1000).toFixed(0)}K</span><span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: C.textMuted, marginLeft: 3 }}>pts</span></div>
              <div><span style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 700, color: C.purple }}>{s.publications}</span><span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: C.textMuted, marginLeft: 3 }}>pubs</span></div>
            </div>
            <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: s.enrollmentOpen ? C.green : C.textMuted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              {s.enrollmentOpen ? 'Enrollment Open' : 'Enrollment Closed'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
