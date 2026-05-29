'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WORKSPACE_DATA } from '@/lib/workspaceData';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import StatsCards from '@/src/components/dashboard/stats-cards';
import DepartmentOverview from '@/src/components/dashboard/department-overview';
import RecentEncounters from '@/src/components/dashboard/recent-encounters';
import SearchBar from '@/src/components/shared/search-bar';
import PathwayCard from '@/src/components/shared/pathway-card';
import { CLINICAL_PATHWAYS } from '@/lib/encounterTypes';

const MOCK_ENCOUNTERS = [
  { id: 'e1', patientName: 'Amara Nwosu', department: 'Paediatric Emergency', type: 'Emergency Visit', time: '10 min ago', status: 'active' as const },
  { id: 'e2', patientName: 'John Kamau', department: 'Cardiology', type: 'Outpatient Visit', time: '25 min ago', status: 'active' as const },
  { id: 'e3', patientName: 'Mary Wanjiku', department: 'Internal Medicine', type: 'Ward Round', time: '45 min ago', status: 'active' as const },
  { id: 'e4', patientName: 'Baby Ochieng', department: 'Neonatology', type: 'ICU Review', time: '1h ago', status: 'active' as const },
  { id: 'e5', patientName: 'Grace Mwangi', department: 'OB/GYN', type: 'Discharge Summary', time: '2h ago', status: 'completed' as const },
  { id: 'e6', patientName: 'Samuel Ochieng', department: 'Surgery', type: 'Post-op Review', time: '2h ago', status: 'active' as const },
];

export default function HospitalDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const [search, setSearch] = useState('');

  const totalPatients = WORKSPACE_DATA.reduce((s, d) => s + d.activeCases, 0) + 146;
  const totalActive = WORKSPACE_DATA.reduce((s, d) => s + d.activeCases, 0);
  const totalDepts = WORKSPACE_DATA.length;
  const todayAdmissions = WORKSPACE_DATA.reduce((s, d) => s + d.todayEncounters, 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>
            Hospital Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            {totalDepts} departments · {totalActive} active cases
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/clinical-workspace/${hospitalId}/patient-records`)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}
          >
            👤 Find Patient
          </button>
          <button
            onClick={() => router.push(`/clinical-workspace/${hospitalId}/departments`)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}
          >
            🏥 Browse Departments
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>Clinical Pathways</h2>
          <button
            onClick={() => router.push(`/clinical-workspace/${hospitalId}/pathways`)}
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 11,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
            }}
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CLINICAL_PATHWAYS.slice(0, 3).map(p => (
            <PathwayCard key={p.id} pathway={p} hospitalId={hospitalId} compact />
          ))}
        </div>
      </div>

      <StatsCards stats={[
        { label: 'Total Patients', value: totalPatients.toLocaleString(), icon: '👤', color: '#3b82f6' },
        { label: 'Active Encounters', value: totalActive, icon: '🩺', color: '#00D68F', trend: '12%', trendUp: true },
        { label: 'Departments', value: totalDepts, icon: '🏥', color: '#06B6D4' },
        { label: "Today's Admissions", value: todayAdmissions, icon: '📋', color: '#FFB020', trend: '8%', trendUp: true },
      ]} />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>Departments</h2>
            <div className="w-64">
              <SearchBar value={search} onChange={setSearch} placeholder="Search departments..." />
            </div>
          </div>
          <DepartmentOverview departments={WORKSPACE_DATA} hospitalId={hospitalId} searchQuery={search} />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <RecentEncounters encounters={MOCK_ENCOUNTERS} />
        </div>
      </div>
    </div>
  );
}
