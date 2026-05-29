'use client';
import Link from 'next/link';
import type { ClinicalPathway } from '@/lib/encounterTypes';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';

interface PathwayCardProps {
  pathway: ClinicalPathway;
  hospitalId: string;
  compact?: boolean;
}

export default function PathwayCard({ pathway, hospitalId, compact }: PathwayCardProps) {
  const dept = DEPARTMENTS[pathway.departmentKey];
  const deptColor = dept?.color || '#06B6D4';

  return (
    <Link
      href={`/clinical-workspace/${hospitalId}/pathways/${pathway.id}`}
      className="frost-card p-4 flex flex-col gap-3 no-underline transition-all duration-200 hover:translate-y-[-2px] block"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>{dept?.icon || '📋'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', fontFamily: "'Syne',sans-serif" }}>
              {pathway.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: deptColor, display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#64748B' }}>{dept?.label || pathway.departmentKey}</span>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {pathway.phases.slice(0, 5).map(p => (
              <span key={p} style={{
                fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
                background: 'rgba(6,182,212,0.1)', color: '#06B6D4',
              }}>
                {p}
              </span>
            ))}
            {pathway.phases.length > 5 && (
              <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>
                +{pathway.phases.length - 5}
              </span>
            )}
          </div>

          <div className="flex gap-3 text-xs">
            <div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Protocols</div>
              <div style={{ fontSize: 11, color: '#E2E8F0' }}>{pathway.protocols.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Alerts</div>
              <div style={{ fontSize: 11, color: '#FF4560' }}>{pathway.alerts.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Scores</div>
              <div style={{ fontSize: 11, color: '#00D68F' }}>{pathway.scores.length}</div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {pathway.encounterTypes.map(et => (
          <span key={et} style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 4,
            background: 'rgba(255,255,255,0.05)', color: '#94A3B8',
          }}>
            {et}
          </span>
        ))}
      </div>
    </Link>
  );
}
