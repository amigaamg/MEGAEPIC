'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CLINICAL_PATHWAYS } from '@/lib/encounterTypes';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import PathwayCard from '@/src/components/shared/pathway-card';
import SearchBar from '@/src/components/shared/search-bar';
import BreadcrumbNav from '@/src/components/shared/breadcrumb-nav';

const DEPT_ORDER = ['SURG', 'IM', 'PAED', 'CARD', 'ENDO'];

export default function PathwaysPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const filtered = CLINICAL_PATHWAYS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.departmentKey.toLowerCase().includes(search.toLowerCase());
    const matchDept = !selectedDept || p.departmentKey === selectedDept;
    return matchSearch && matchDept;
  });

  const grouped = DEPT_ORDER.map(key => ({
    key,
    dept: DEPARTMENTS[key],
    pathways: filtered.filter(p => p.departmentKey === key),
  })).filter(g => g.pathways.length > 0);

  const orphaned = filtered.filter(p => !DEPT_ORDER.includes(p.departmentKey));
  if (orphaned.length > 0) {
    grouped.push({ key: 'other', dept: { label: 'Other', color: '#64748B', icon: '📋' }, pathways: orphaned });
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <BreadcrumbNav items={[
        { label: 'Dashboard', href: `/clinical-workspace/${hospitalId}` },
        { label: 'Clinical Pathways' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
            Clinical Pathways
          </h1>
          <p style={{ fontSize: 12, color: '#64748B' }}>
            {CLINICAL_PATHWAYS.length} evidence-based pathways
          </p>
        </div>
        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search pathways..." />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedDept(null)}
          style={{
            padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600,
            background: !selectedDept ? 'linear-gradient(135deg,#06B6D4,#0891B2)' : 'rgba(255,255,255,0.06)',
            color: !selectedDept ? '#fff' : '#94A3B8', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          All
        </button>
        {DEPT_ORDER.map(key => {
          const d = DEPARTMENTS[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedDept(selectedDept === key ? null : key)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600,
                background: selectedDept === key ? `${d.color}22` : 'rgba(255,255,255,0.06)',
                color: selectedDept === key ? d.color : '#94A3B8', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {d.icon} {d.label}
            </button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <div className="frost-card p-8 text-center">
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>No pathways found</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            Try adjusting your search or filter selection.
          </div>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 16 }}>{group.dept.icon}</span>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>
                {group.dept.label}
              </h2>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.dept.color }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>{group.pathways.length} pathways</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.pathways.map(p => (
                <PathwayCard key={p.id} pathway={p} hospitalId={hospitalId} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
