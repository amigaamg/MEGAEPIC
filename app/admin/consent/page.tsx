'use client';
import { useState, useMemo } from 'react';
import { Shield, Search, Filter, CheckCircle, XCircle, Clock, Ban, Eye, Edit3, Plus, ChevronDown, ChevronRight, User, Building2, FileText, Lock, Unlock, AlertTriangle, Calendar } from 'lucide-react';
import { ConsentType, ConsentStatus, type ConsentGrant, type ConsentScope, type ConsentDataType, type ConsentRestriction, type ConsentCondition, type ConsentEvent } from '@/lib/amexan/constitution/consent-engine';
import { VerificationLevel } from '@/lib/amexan/identity/types';

const CONSENT_TYPES: { value: ConsentType; label: string; icon: string }[] = [
  { value: 'guardian_authorization', label: 'Guardian Authorization', icon: '👤' },
  { value: 'caregiver_delegation', label: 'Caregiver Delegation', icon: '🤝' },
  { value: 'clinician_access', label: 'Clinician Access', icon: '🏥' },
  { value: 'research_consent', label: 'Research Consent', icon: '🔬' },
  { value: 'data_sharing', label: 'Data Sharing', icon: '📤' },
  { value: 'telemedicine_consent', label: 'Telemedicine Consent', icon: '📹' },
  { value: 'emergency_access', label: 'Emergency Access', icon: '🚨' },
  { value: 'third_party_access', label: 'Third Party Access', icon: '🔗' },
];

const DATA_TYPES: ConsentDataType[] = ['identity', 'encounters', 'clinical_notes', 'lab_results', 'imaging_results', 'prescriptions', 'vitals', 'appointments', 'billing', 'medications'];

const MOCK_CONSENTS: ConsentGrant[] = [
  {
    id: 'CONS-001', grantorAmxUid: 'PAT-001' as any, granteeAmxUid: 'DOC-001' as any, granteeName: 'Dr. Wanjiku', granteeRelationship: 'Primary Physician',
    type: 'clinician_access', scope: { resources: ['encounters', 'clinical_notes', 'lab_results', 'vitals'], departments: ['DEPT-MED'], organizations: ['org_1'], timeRange: { start: Date.now() - 31536000000, end: null }, dataTypes: ['encounters', 'clinical_notes', 'lab_results', 'vitals'], restrictions: [] },
    status: 'active', createdAt: Date.now() - 86400000 * 180, updatedAt: Date.now() - 86400000, expiresAt: null, revokedAt: null, reason: 'Routine clinical care', conditions: [], auditTrail: [] as ConsentEvent[],
  },
  {
    id: 'CONS-002', grantorAmxUid: 'PAT-002' as any, granteeAmxUid: 'NUR-001' as any, granteeName: 'Nurse Odera', granteeRelationship: 'Assigned Nurse',
    type: 'caregiver_delegation', scope: { resources: ['vitals', 'appointments'], departments: ['DEPT-MED'], organizations: ['org_1'], timeRange: { start: Date.now() - 86400000 * 30, end: Date.now() + 86400000 * 30 }, dataTypes: ['vitals', 'appointments'], restrictions: [{ type: 'deny_resource', value: 'clinical_notes' }] },
    status: 'active', createdAt: Date.now() - 86400000 * 30, updatedAt: Date.now() - 86400000, expiresAt: Date.now() + 86400000 * 30, revokedAt: null, reason: 'Post-surgery care delegation', conditions: [], auditTrail: [] as ConsentEvent[],
  },
  {
    id: 'CONS-003', grantorAmxUid: 'PAT-003' as any, granteeAmxUid: 'RES-001' as any, granteeName: 'Research Team', granteeRelationship: 'Research Study',
    type: 'research_consent', scope: { resources: ['encounters', 'lab_results', 'imaging_results'], departments: [], organizations: [], timeRange: { start: Date.now() - 86400000 * 90, end: Date.now() + 86400000 * 365 }, dataTypes: ['encounters', 'lab_results', 'imaging_results'], restrictions: [{ type: 'deidentify', value: 'true' }] },
    status: 'pending', createdAt: Date.now() - 86400000 * 7, updatedAt: Date.now() - 86400000 * 7, expiresAt: null, revokedAt: null, reason: 'Clinical trial participation', conditions: [{ type: 'time_limit', value: '1 year' }] as ConsentCondition[], auditTrail: [] as ConsentEvent[],
  },
  {
    id: 'CONS-004', grantorAmxUid: 'PAT-004' as any, granteeAmxUid: 'DOC-002' as any, granteeName: 'Dr. Kamau', granteeRelationship: 'Referring Physician',
    type: 'clinician_access', scope: { resources: ['encounters', 'clinical_notes'], departments: ['DEPT-SURG'], organizations: ['org_1'], timeRange: { start: Date.now() - 86400000 * 365, end: null }, dataTypes: ['encounters', 'clinical_notes'], restrictions: [] },
    status: 'revoked', createdAt: Date.now() - 86400000 * 200, updatedAt: Date.now() - 86400000 * 30, expiresAt: null, revokedAt: Date.now() - 86400000 * 30, reason: 'Patient requested revocation', conditions: [], auditTrail: [] as ConsentEvent[],
  },
  {
    id: 'CONS-005', grantorAmxUid: 'PAT-005' as any, granteeAmxUid: 'GUARDIAN-001' as any, granteeName: 'Parent (Guardian)', granteeRelationship: 'Legal Guardian',
    type: 'guardian_authorization', scope: { resources: ['identity', 'encounters', 'clinical_notes', 'lab_results', 'vitals', 'appointments', 'billing'], departments: ['DEPT-PED'], organizations: ['org_1'], timeRange: { start: Date.now() - 86400000 * 365, end: null }, dataTypes: ['identity', 'encounters', 'clinical_notes', 'lab_results', 'vitals', 'appointments', 'billing'], restrictions: [] },
    status: 'active', createdAt: Date.now() - 86400000 * 365, updatedAt: Date.now() - 86400000 * 100, expiresAt: null, revokedAt: null, reason: 'Minor patient - parental consent', conditions: [{ type: 'purpose_limit', value: 'pediatric care' }] as ConsentCondition[], auditTrail: [] as ConsentEvent[],
  },
];

export default function ConsentPage() {
  const [consents] = useState<ConsentGrant[]>(MOCK_CONSENTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ConsentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ConsentStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return consents.filter(c => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (statusFilter !== 'all' && c.status !== c.status) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.granteeName.toLowerCase().includes(q) || c.granteeRelationship.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [consents, search, typeFilter, statusFilter]);

  const summary = useMemo(() => ({
    total: consents.length,
    active: consents.filter(c => c.status === 'active').length,
    pending: consents.filter(c => c.status === 'pending').length,
    revoked: consents.filter(c => c.status === 'revoked').length,
  }), [consents]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Consent & Delegation</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Manage consent grants, delegations, and data sharing authorizations</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Consent
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Grants', value: summary.total, color: '#06B6D4' },
          { label: 'Active', value: summary.active, color: '#10B981' },
          { label: 'Pending', value: summary.pending, color: '#F59E0B' },
          { label: 'Revoked', value: summary.revoked, color: '#EF4444' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input placeholder="Search by name, relationship, or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', height: 36, padding: '0 10px 0 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as ConsentType | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Types</option>
          {CONSENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ConsentStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(consent => {
          const isSelected = selectedId === consent.id;
          const consentType = CONSENT_TYPES.find(t => t.value === consent.type);
          const statusColor = consent.status === 'active' ? '#10B981' : consent.status === 'pending' ? '#F59E0B' : consent.status === 'revoked' ? '#EF4444' : '#64748B';
          return (
            <div key={consent.id} onClick={() => setSelectedId(isSelected ? null : consent.id)}
              style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{consentType?.icon || '📋'}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{consent.granteeName} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{consent.granteeRelationship}</span></div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>{consent.id} · {consentType?.label} · {consent.scope.dataTypes.slice(0, 3).join(', ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${statusColor}22`, color: statusColor }}>{consent.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Grantor</div>
                      <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{consent.grantorAmxUid}</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Grantee</div>
                      <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{consent.granteeAmxUid}</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Created</div>
                      <div style={{ fontSize: 12, color: '#E2E8F0' }}>{new Date(consent.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Expires</div>
                      <div style={{ fontSize: 12, color: consent.expiresAt ? '#E2E8F0' : '#64748B' }}>{consent.expiresAt ? new Date(consent.expiresAt).toLocaleDateString() : 'No expiry'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Scope</div>
                  <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Resources</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {consent.scope.resources.map(r => (
                        <span key={r} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>{r}</span>
                      ))}
                    </div>
                    {consent.scope.departments && consent.scope.departments.length > 0 && (
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>Departments: {consent.scope.departments.join(', ')}</div>
                    )}
                    {consent.scope.dataTypes.length > 0 && (
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Data Types: {consent.scope.dataTypes.join(', ')}</div>
                    )}
                    {consent.scope.restrictions.length > 0 && (
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Restrictions: {consent.scope.restrictions.map(r => `${r.type}: ${r.value}`).join(', ')}</div>
                    )}
                  </div>

                  {consent.conditions.length > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Conditions</div>
                  )}
                  {consent.conditions.map((cond, i) => (
                    <div key={i} style={{ padding: '6px 10', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 4, fontSize: 11, color: '#E2E8F0' }}>
                      {cond.type}: {cond.value}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {consent.status === 'pending' && (
                      <>
                        <button style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#10B981', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Approve</button>
                        <button style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Reject</button>
                      </>
                    )}
                    {consent.status === 'active' && (
                      <button style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Revoke</button>
                    )}
                    <button style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>View Audit Trail</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}