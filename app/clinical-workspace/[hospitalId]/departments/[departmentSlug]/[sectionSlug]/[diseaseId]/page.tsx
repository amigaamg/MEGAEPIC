'use client';
import { useParams, useRouter } from 'next/navigation';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import { DISEASE_PROTOCOLS } from '@/lib/clinicalProtocols';
import { getDepartment, getUnit } from '@/lib/workspaceData';
import { getDiseaseById } from '@/lib/diseases';

const SEVERITY_COLORS: Record<string, string> = {
  mild: '#00D68F', moderate: '#FFB020', severe: '#FF4560', critical: '#FF4560',
};

export default function DiseaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.hospitalId as string;
  const deptKey = params?.departmentSlug as string;
  const sectionSlug = params?.sectionSlug as string;
  const diseaseId = params?.diseaseId as string;

  const disease = getDiseaseById(sectionSlug, diseaseId);
  const protocol = DISEASE_PROTOCOLS[diseaseId];
  const unit = getUnit(deptKey.toUpperCase(), sectionSlug);
  const registry = DEPARTMENTS[deptKey.toUpperCase()];

  if (!disease) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🩺</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>Disease not found</h2>
        <p style={{ fontSize: 13, color: '#64748B' }}>The disease &quot;{diseaseId}&quot; was not found.</p>
      </div>
    );
  }

  const SECTION_LABEL = (title: string) => (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      <div className="frost-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div style={{ fontSize: 28 }}>{registry?.icon || '🩺'}</div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>
                {disease.name}
              </h1>
              {disease.emergency && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,69,96,0.15)', color: '#FF4560' }}>
                  EMERGENCY
                </span>
              )}
              {disease.mustNotMiss && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,176,32,0.15)', color: '#FFB020' }}>
                  MUST NOT MISS
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span style={{ fontSize: 12, color: '#64748B' }}>{registry?.label || deptKey}</span>
              <span style={{ fontSize: 12, color: '#475569' }}>·</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>{unit?.label || sectionSlug}</span>
            </div>
          </div>
        </div>

        {protocol && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {protocol.targets && Object.keys(protocol.targets).length > 0 && (
              <div className="frost-card-sm p-3">
                {SECTION_LABEL('Treatment Targets')}
                <div className="flex flex-col gap-1">
                  {Object.entries(protocol.targets).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8' }}>
                      <span style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ color: '#00D68F' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {protocol.alerts && protocol.alerts.length > 0 && (
              <div className="frost-card-sm p-3">
                {SECTION_LABEL('Alert Rules')}
                <div className="flex flex-col gap-1.5">
                  {protocol.alerts.slice(0, 4).map((alert, i) => (
                    <div key={i} style={{
                      padding: '6px 8px', borderRadius: 6, fontSize: 11,
                      background: alert.level === 'emergency' ? 'rgba(255,69,96,0.08)' : alert.level === 'urgent' ? 'rgba(255,176,32,0.08)' : 'rgba(0,214,143,0.08)',
                      border: `1px solid ${alert.level === 'emergency' ? 'rgba(255,69,96,0.15)' : alert.level === 'urgent' ? 'rgba(255,176,32,0.15)' : 'rgba(0,214,143,0.15)'}`,
                      color: alert.level === 'emergency' ? '#FF4560' : alert.level === 'urgent' ? '#FFB020' : '#00D68F',
                      lineHeight: 1.4,
                    }}>
                      {alert.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {protocol.stepProtocol && protocol.stepProtocol.length > 0 && (
              <div className="frost-card-sm p-3 md:col-span-2">
                {SECTION_LABEL('Management Pathway')}
                <div className="flex flex-col gap-2">
                  {protocol.stepProtocol.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: '6px 0',
                      borderBottom: i < protocol.stepProtocol.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(6,182,212,0.15)', color: '#06B6D4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {protocol.firstLine && protocol.firstLine.length > 0 && (
              <div className="frost-card-sm p-3">
                {SECTION_LABEL('First-Line Therapy')}
                <div className="flex flex-wrap gap-1.5">
                  {protocol.firstLine.map(drug => (
                    <span key={drug} style={{
                      padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                      background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.15)',
                      color: '#00D68F',
                    }}>
                      {drug.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {protocol.monitoring && protocol.monitoring.length > 0 && (
              <div className="frost-card-sm p-3">
                {SECTION_LABEL('Monitoring')}
                <div className="flex flex-wrap gap-1.5">
                  {protocol.monitoring.map(m => (
                    <span key={m} style={{
                      padding: '3px 9px', borderRadius: 999, fontSize: 10,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      color: '#64748B',
                    }}>
                      {m.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {protocol.complications && protocol.complications.length > 0 && (
              <div className="frost-card-sm p-3">
                {SECTION_LABEL('Complications')}
                <div className="flex flex-wrap gap-1.5">
                  {protocol.complications.map(c => (
                    <span key={c} style={{
                      padding: '3px 9px', borderRadius: 999, fontSize: 10,
                      background: 'rgba(255,69,96,0.06)', border: '1px solid rgba(255,69,96,0.1)',
                      color: '#FF4560',
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {protocol.review && (
              <div className="frost-card-sm p-3">
                {SECTION_LABEL('Review Schedule')}
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{protocol.review}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/clinical-workspace/${hospitalId}/encounters/new?disease=${diseaseId}&dept=${deptKey}&section=${sectionSlug}`)}
          style={{
            padding: '8px 16px', borderRadius: 6, border: 'none',
            background: 'linear-gradient(135deg,#06B6D4,#0891B2)',
            color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          🧠 Open in DDX Workspace
        </button>
        <button
          style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}
        >
          📋 View Related Protocols
        </button>
      </div>
    </div>
  );
}
