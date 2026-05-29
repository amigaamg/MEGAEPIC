'use client';
import Link from 'next/link';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import type { UnitInfo } from '@/lib/workspaceData';

interface SectionCardProps {
  unit: UnitInfo;
  departmentKey: string;
  hospitalId: string;
}

export default function SectionCard({ unit, departmentKey, hospitalId }: SectionCardProps) {
  const dept = DEPARTMENTS[departmentKey];

  return (
    <Link
      href={`/clinical-workspace/${hospitalId}/departments/${departmentKey}/${unit.id}`}
      className="frost-card p-4 flex flex-col gap-2 no-underline transition-all duration-200 hover:translate-y-[-2px] block"
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 22 }}>{unit.icon}</span>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {unit.pathways.length > 0 && (
            <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: 'rgba(0,229,204,0.1)', color: '#00E5CC' }}>
              {unit.pathways.length} pathways
            </span>
          )}
          <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: `${dept?.color || '#06B6D4'}15`, color: dept?.color || '#06B6D4' }}>
            {unit.activeCases} active
          </span>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{unit.label}</div>
      <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {unit.description}
      </div>
      <div style={{ fontSize: 10, color: '#475569' }}>
        {unit.encounterTypes.length} encounter types
      </div>
    </Link>
  );
}
