'use client';

import { useState } from 'react';
import { GraduationCap, BookOpen, Users, Award, Clock, Search, CheckCircle } from 'lucide-react';
import { C, S } from '@/app/operations/_shared/styles';

const courses = [
  { id: 'CPD-101', name: 'Clinical Documentation Standards', category: 'Clinical', students: 145, completed: 98, hours: 8, status: 'active' as const },
  { id: 'CPD-102', name: 'AI-Assisted Diagnosis Protocols', category: 'AI', students: 112, completed: 76, hours: 12, status: 'active' as const },
  { id: 'CPD-103', name: 'HIPAA & Data Privacy Refresher', category: 'Compliance', students: 230, completed: 210, hours: 4, status: 'active' as const },
  { id: 'CPD-104', name: 'Advanced Telemedicine Practice', category: 'Clinical', students: 89, completed: 45, hours: 16, status: 'active' as const },
  { id: 'CPD-105', name: 'Drug Interaction Safety', category: 'Pharma', students: 167, completed: 134, hours: 6, status: 'active' as const },
  { id: 'CPD-106', name: 'Medical Ethics & Governance', category: 'Compliance', students: 198, completed: 178, hours: 5, status: 'active' as const },
  { id: 'CPD-107', name: 'Pediatric Care Standards 2026', category: 'Clinical', students: 73, completed: 41, hours: 10, status: 'draft' as const },
  { id: 'CPD-108', name: 'Mental Health First Response', category: 'Clinical', students: 95, completed: 62, hours: 14, status: 'active' as const },
  { id: 'CPD-109', name: 'AGOC Engine Administration', category: 'Technical', students: 54, completed: 50, hours: 20, status: 'active' as const },
  { id: 'CPD-110', name: 'Research Methodology v3', category: 'Research', students: 38, completed: 12, hours: 24, status: 'draft' as const },
];

const statusStyles = { active: { color: C.green, bg: 'rgba(34,197,94,0.1)' }, draft: { color: C.amber, bg: 'rgba(245,158,11,0.1)' } };

export default function EducationPage() {
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c =>
    !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = courses.filter(c => c.status === 'active').reduce((a, c) => a + c.students, 0);
  const totalCompleted = courses.filter(c => c.status === 'active').reduce((a, c) => a + c.completed, 0);
  const completionRate = totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0;
  const totalHours = courses.filter(c => c.status === 'active').reduce((a, c) => a + c.hours, 0);

  return (
    <div style={S.page}>
      <div style={S.h1}><GraduationCap size={20} color={C.sky} /> Education Operations</div>
      <div style={S.sub}>Level 10 · Course catalog, student enrollment, assessments, and CPD tracking</div>

      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum(C.sky)}>{courses.filter(c => c.status === 'active').length}</div>
          <div style={S.statLabel}>Active Courses</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.green)}>{totalStudents}</div>
          <div style={S.statLabel}>Enrolled Students</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(completionRate > 70 ? C.green : C.amber)}>{completionRate}%</div>
          <div style={S.statLabel}>Completion Rate</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum(C.purple)}>{totalHours}</div>
          <div style={S.statLabel}>CPD Hours Available</div>
        </div>
      </div>

      <div style={S.searchRow}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, 100%)' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        </div>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={S.th}>Course</th>
              <th style={S.th}>Category</th>
              <th style={S.th}>Enrolled</th>
              <th style={S.th}>Completed</th>
              <th style={S.th}>Progress</th>
              <th style={S.th}>Hours</th>
              <th style={S.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const progress = c.students > 0 ? Math.round((c.completed / c.students) * 100) : 0;
              return (
                <tr key={c.id}>
                  <td style={{ ...S.td, fontWeight: 500, color: '#f1f5f9' }}>{c.name}<div style={{ fontSize: 'clamp(8px, 0.8vw, 9px)', color: '#64748b' }}>{c.id}</div></td>
                  <td style={S.td}><span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 'clamp(8px, 0.9vw, 10px)', background: `${C.sky}15`, color: C.sky }}>{c.category}</span></td>
                  <td style={S.td}>{c.students}</td>
                  <td style={S.td}>{c.completed}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, maxWidth: 80, height: 4, background: 'rgba(148,163,184,0.15)', borderRadius: 2 }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: progress > 70 ? C.green : progress > 40 ? C.amber : C.red, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 'clamp(9px, 1vw, 10px)', color: progress > 70 ? C.green : progress > 40 ? C.amber : C.red }}>{progress}%</span>
                    </div>
                  </td>
                  <td style={S.td}>{c.hours}</td>
                  <td style={S.td}>
                    <span style={S.badge(statusStyles[c.status].color, statusStyles[c.status].bg)}>{c.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
