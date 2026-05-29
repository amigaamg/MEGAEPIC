'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import { getDepartment, getUnit } from '@/lib/workspaceData';
import { getDiseasesForSection } from '@/lib/diseases';
import DiseaseGrid from '@/src/components/departments/disease-grid';

export default function SectionPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;
  const deptKey = params?.departmentSlug as string;
  const sectionSlug = params?.sectionSlug as string;
  const [search, setSearch] = useState('');

  const dept = getDepartment(deptKey.toUpperCase());
  const unit = getUnit(deptKey.toUpperCase(), sectionSlug);
  const diseases = getDiseasesForSection(sectionSlug);
  const registry = DEPARTMENTS[deptKey.toUpperCase()];

  if (!unit) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>Section not found</h2>
        <p style={{ fontSize: 13, color: '#64748B' }}>The section &quot;{sectionSlug}&quot; was not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="frost-card p-5 flex items-start gap-4">
        <div style={{ fontSize: 32 }}>{unit.icon}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
            {unit.label}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{unit.description}</p>
          <div className="flex gap-4 mt-3">
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#00D68F' }}>{unit.activeCases}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Active Cases</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#06B6D4' }}>{diseases.length}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Diseases</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#FFB020' }}>{unit.encounterTypes.length}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>Encounter Types</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 12 }}>Diseases & Conditions</h2>
        <DiseaseGrid
          diseases={diseases}
          departmentKey={deptKey.toUpperCase()}
          sectionSlug={sectionSlug}
          hospitalId={hospitalId}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
