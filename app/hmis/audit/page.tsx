'use client';
import { useState, useMemo } from 'react';
import { AuditEventType, AuditCategory, AuditSeverity, createAuditEvent, verifyAuditChain, getAuditSummary, detectAnomalies } from '@/lib/amexan/hmis/audit-engine';
import type { AuditEvent } from '@/lib/amexan/hmis/audit-engine';

const MOCK_EVENTS: AuditEvent[] = [
  createAuditEvent({ eventType: AuditEventType.Login, category: AuditCategory.System, severity: AuditSeverity.Info, actorId: 'ACT-001', actorName: 'Dr. Smith', actorRole: 'clinician', resourceType: 'session', resourceId: 'SES-001', action: 'login', description: 'User logged in from IP 192.168.1.100', ipAddress: '192.168.1.100', sessionId: 'SES-001' }),
  createAuditEvent({ eventType: AuditEventType.OrderPlace, category: AuditCategory.Clinical, severity: AuditSeverity.Info, actorId: 'ACT-001', actorName: 'Dr. Smith', actorRole: 'clinician', resourceType: 'order', resourceId: 'ORD-001', action: 'place', description: 'STAT lab order placed for patient P-001', patientId: 'P-001', encounterId: 'ENC-001' }, 'prev-hash-1'),
  createAuditEvent({ eventType: AuditEventType.PrescriptionWrite, category: AuditCategory.Clinical, severity: AuditSeverity.Warning, actorId: 'ACT-001', actorName: 'Dr. Smith', actorRole: 'clinician', resourceType: 'prescription', resourceId: 'RX-001', action: 'write', description: 'Ceftriaxone 1g prescribed for patient P-003', patientId: 'P-003', encounterId: 'ENC-003' }, 'prev-hash-2'),
  createAuditEvent({ eventType: AuditEventType.ResultVerify, category: AuditCategory.Clinical, severity: AuditSeverity.Info, actorId: 'LAB-001', actorName: 'Lab Tech James', actorRole: 'lab_scientist', resourceType: 'result', resourceId: 'RES-001', action: 'verify', description: 'Critical result K+ 6.8 verified for patient P-002', patientId: 'P-002' }, 'prev-hash-3'),
  createAuditEvent({ eventType: AuditEventType.BreakGlassAccess, category: AuditCategory.Security, severity: AuditSeverity.Critical, actorId: 'ACT-002', actorName: 'Nurse Jane', actorRole: 'nurse', resourceType: 'patient_record', resourceId: 'P-001', action: 'access', description: 'Break-glass access to patient record - emergency override', patientId: 'P-001', ipAddress: '192.168.1.50' }, 'prev-hash-4'),
  createAuditEvent({ eventType: AuditEventType.PaymentProcess, category: AuditCategory.Billing, severity: AuditSeverity.Info, actorId: 'CASH-001', actorName: 'Cashier Mary', actorRole: 'finance_staff', resourceType: 'payment', resourceId: 'PAY-001', action: 'process', description: 'M-Pesa payment of KES 5,000 received for invoice INV-002', metadata: { amount: 5000, method: 'M-Pesa' } }, 'prev-hash-5'),
  createAuditEvent({ eventType: AuditEventType.SystemConfigChange, category: AuditCategory.System, severity: AuditSeverity.Warning, actorId: 'ADMIN-001', actorName: 'Admin User', actorRole: 'administrator', resourceType: 'config', resourceId: 'CFG-DRG', action: 'update', description: 'Drug pricing configuration updated', previousValue: 'amoxicillin:20', newValue: 'amoxicillin:25' }, 'prev-hash-6'),
  createAuditEvent({ eventType: AuditEventType.Logout, category: AuditCategory.System, severity: AuditSeverity.Info, actorId: 'ACT-001', actorName: 'Dr. Smith', actorRole: 'clinician', resourceType: 'session', resourceId: 'SES-001', action: 'logout', description: 'User logged out' }, 'prev-hash-7'),
];

const SEVERITY_COLORS: Record<string, string> = { info: '#3B82F6', warning: '#F59E0B', error: '#EF4444', critical: '#DC2626', security: '#7C3AED' };
const CATEGORY_COLORS: Record<string, string> = { clinical: '#06B6D4', administrative: '#8B5CF6', billing: '#10B981', security: '#7C3AED', compliance: '#EC4899', system: '#64748B', integration: '#F97316', research: '#14B8A6' };

export default function AuditPage() {
  const [events] = useState(MOCK_EVENTS);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const summary = useMemo(() => getAuditSummary(events), [events]);
  const anomalies = useMemo(() => detectAnomalies(events), [events]);
  const chainValid = useMemo(() => verifyAuditChain(events), [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.id.toLowerCase().includes(q) || e.actorName.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.resourceType.toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, search, severityFilter, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Audit Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XX — Hash-chained immutable audit, chain verification, anomaly detection</p>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, background: chainValid.valid ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: chainValid.valid ? '#10B981' : '#EF4444' }}>
            {chainValid.valid ? '✓ Chain Verified' : '✗ Chain Broken at {chainValid.breakPoint}'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Events', value: summary.total, color: '#F472B6' },
          { label: 'Clinical', value: summary.clinicalEvents, color: '#06B6D4' },
          { label: 'Security', value: summary.securityIncidents, color: '#7C3AED' },
          { label: 'Critical', value: summary.criticalEvents, color: '#EF4444' },
          { label: 'Anomalies', value: anomalies.length, color: '#DC2626' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {anomalies.length > 0 && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>⚠ {anomalies.length} Anomal{anomalies.length > 1 ? 'ies' : 'y'} Detected</div>
          {anomalies.map(a => <div key={a.id} style={{ fontSize: 11, color: '#FCA5A5' }}>{a.eventType}: {a.description} — {a.actorName}</div>)}
        </div>
      )}

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by actor, event, resource..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as AuditSeverity | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Severity</option>
          {Object.values(AuditSeverity).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as AuditCategory | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Categories</option>
          {Object.values(AuditCategory).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(event => {
          const isSelected = selectedEvent === event.id;
          const isAnomaly = anomalies.some(a => a.id === event.id);
          return (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(isSelected ? null : event.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(244,114,182,0.08)' : isAnomaly ? 'rgba(220,38,38,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(244,114,182,0.3)' : isAnomaly ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${SEVERITY_COLORS[event.severity]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: SEVERITY_COLORS[event.severity] }}>
                    {event.eventType === AuditEventType.Login || event.eventType === AuditEventType.Logout ? '🔑' : event.eventType === AuditEventType.BreakGlassAccess ? '🔓' : event.eventType === AuditEventType.SecurityIncident ? '🚨' : event.eventType === AuditEventType.PaymentProcess ? '💰' : event.eventType === AuditEventType.PrescriptionWrite ? '💊' : '📝'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{event.eventType} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {event.actorName} ({event.actorRole})</span></div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{event.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  {isAnomaly && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(220,38,38,0.15)', color: '#DC2626' }}>ANOMALY</span>}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${CATEGORY_COLORS[event.category]}20`, color: CATEGORY_COLORS[event.category] }}>{event.category}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${SEVERITY_COLORS[event.severity]}20`, color: SEVERITY_COLORS[event.severity] }}>{event.severity}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Actor: <span style={{ color: '#E2E8F0' }}>{event.actorId} ({event.actorName})</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Resource: <span style={{ color: '#E2E8F0' }}>{event.resourceType} #{event.resourceId}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Action: <span style={{ color: '#E2E8F0' }}>{event.action}</span></div>
                    {event.ipAddress && <div style={{ fontSize: 11, color: '#64748B' }}>IP: <span style={{ color: '#E2E8F0' }}>{event.ipAddress}</span></div>}
                    {event.patientId && <div style={{ fontSize: 11, color: '#64748B' }}>Patient: <span style={{ color: '#E2E8F0' }}>{event.patientId}</span></div>}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Timestamp: <span style={{ color: '#E2E8F0' }}>{new Date(event.timestamp).toLocaleString()}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Integrity Hash: <span style={{ fontFamily: 'monospace', color: '#10B981', fontSize: 10 }}>{event.integrityHash}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Previous Hash: <span style={{ fontFamily: 'monospace', color: '#64748B', fontSize: 10 }}>{event.previousHash || '(none)'}</span></div>
                  {event.previousValue && <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Previous: <span style={{ color: '#EF4444' }}>{event.previousValue}</span> → New: <span style={{ color: '#10B981' }}>{event.newValue}</span></div>}
                  {Object.keys(event.metadata).length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>Metadata</div>
                      {Object.entries(event.metadata).map(([k, v]) => <div key={k} style={{ fontSize: 11, color: '#64748B' }}>{k}: <span style={{ color: '#E2E8F0' }}>{String(v)}</span></div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
