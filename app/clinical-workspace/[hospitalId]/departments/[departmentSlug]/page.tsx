'use client';
import { useParams, useRouter } from 'next/navigation';
import { getDepartment } from '@/lib/workspaceData';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import { useSingleDepartmentStats } from '@/src/hooks/useFirebaseDepartmentStats';
import SectionCard from '@/src/components/departments/section-card';

export default function DepartmentHomePage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const deptKey = params?.departmentSlug as string;

  const deptDef = getDepartment(deptKey.toUpperCase());
  const registry = DEPARTMENTS[deptKey.toUpperCase()];
  const { activeCases, todayEncounters, avgWaitMinutes, loading } = useSingleDepartmentStats(deptKey.toUpperCase());

  if (!deptDef) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>Department not found</h2>
        <p style={{ fontSize: 13, color: '#64748B' }}>The department &quot;{deptKey}&quot; does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="frost-card p-5 flex items-start gap-4">
        <div style={{ fontSize: 36 }}>{registry?.icon || deptDef.icon}</div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
              {registry?.label || deptDef.label}
            </h1>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: registry?.color || deptDef.color,
            }} />
          </div>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{deptDef.description}</p>
          <div className="flex gap-4 mt-3">
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#00D68F' }}>
                {loading ? '...' : activeCases}
              </div>
              <div style={{ fontSize: 10, color: '#475569' }}>Active Cases</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#06B6D4' }}>
                {loading ? '...' : todayEncounters}
              </div>
              <div style={{ fontSize: 10, color: '#475569' }}>Today</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#FFB020' }}>{avgWaitMinutes}m</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Avg. Wait</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/clinical-workspace/${hospitalId}/patient-records?dept=${deptKey}`)}
          style={{
            padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 11,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          👤 View Patients
        </button>
        <button
          onClick={() => router.push(`/clinical-workspace/${hospitalId}/encounters/new?dept=${deptKey}`)}
          style={{
            padding: '8px 14px', borderRadius: 6, border: 'none',
            background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
            color: '#fff', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          ➕ New Encounter
        </button>
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>Clinical Sections ({deptDef.units.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {deptDef.units.map(unit => (
            <SectionCard key={unit.id} unit={unit} departmentKey={deptKey.toUpperCase()} hospitalId={hospitalId} />
          ))}
        </div>
      </div>
    </div>
  );
}
