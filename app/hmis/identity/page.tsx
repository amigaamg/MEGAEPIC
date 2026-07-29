'use client';
import { useState, useMemo } from 'react';
import { IdentityType, VerificationLevel, IdentityStatus, BiometricType, DocumentType, getPrimaryHospitalNumber, getPrimaryInsurance, getPrimaryLicense, isLicenseValid } from '@/lib/amexan/hmis/identity';
import type { UniversalIdentity, PatientIdentifiers, ClinicianIdentifiers } from '@/lib/amexan/hmis/identity';

const MOCK_IDENTITIES: UniversalIdentity[] = [
  {
    amxUid: 'AMX-P-001', type: IdentityType.Patient,
    patientIdentifiers: {
      hospitalNumbers: [{ facilityId: 'HOS-001', number: 'HN-10001', isPrimary: true, issuedAt: Date.now() - 94608000000, facilityName: 'AMEXAN Teaching Hospital' }],
      nationalId: 'ID-12345678', insuranceNumbers: [{ provider: 'NHIF', number: 'NH-987654', scheme: 'Supreme', expiryDate: '2027-12-31', isPrimary: true, memberName: 'John Kamau', relationship: 'self' }],
      socialHealthInsurance: { provider: 'SHA', number: 'SHA-456789', status: 'active', membershipType: 'primary', expiryDate: '2028-06-30' },
    },
    clinicianIdentifiers: { professionalLicenses: [], councilRegistrations: [] },
    biometrics: [{ type: BiometricType.Fingerprint, hash: 'fp-hash-001', enrolledAt: Date.now() - 31536000000, isActive: true }],
    documents: [{ type: DocumentType.NationalID, documentNumber: 'ID-12345678', issuingAuthority: 'Government', issueDate: '2015-06-01', expiryDate: '2030-06-01', country: 'Kenya', verified: true, verifiedAt: Date.now() - 31536000000 }],
    linkedIdentities: [], verifiedAt: Date.now() - 31536000000, verificationLevel: VerificationLevel.BiometricVerified, status: IdentityStatus.Active, createdAt: Date.now() - 94608000000, updatedAt: Date.now() - 86400000,
  },
  {
    amxUid: 'AMX-C-001', type: IdentityType.Clinician,
    patientIdentifiers: { hospitalNumbers: [], insuranceNumbers: [] },
    clinicianIdentifiers: {
      professionalLicenses: [{ body: 'KMPDC', licenseNumber: 'KMPDC-7890', category: 'Medical Practitioner', issueDate: '2018-03-15', expiryDate: '2026-03-15', status: 'valid', verifiedAt: Date.now() - 15768000000, country: 'Kenya' }],
      councilRegistrations: [{ council: 'KMPDC', registrationNumber: 'REG-5678', category: 'Specialist', issueDate: '2018-03-15', expiryDate: '2026-03-15', status: 'active' }],
      nationalId: 'ID-87654321',
    },
    biometrics: [{ type: BiometricType.Fingerprint, hash: 'fp-hash-002', enrolledAt: Date.now() - 15768000000, isActive: true }, { type: BiometricType.Face, hash: 'face-hash-001', enrolledAt: Date.now() - 15768000000, isActive: true }],
    documents: [{ type: DocumentType.ProfessionalLicense, documentNumber: 'KMPDC-7890', issuingAuthority: 'KMPDC', issueDate: '2018-03-15', expiryDate: '2026-03-15', country: 'Kenya', verified: true }],
    linkedIdentities: [], verifiedAt: Date.now() - 15768000000, verificationLevel: VerificationLevel.FullyVerified, status: IdentityStatus.Active, createdAt: Date.now() - 15768000000, updatedAt: Date.now() - 86400000,
  },
  {
    amxUid: 'AMX-P-002', type: IdentityType.Patient,
    patientIdentifiers: {
      hospitalNumbers: [{ facilityId: 'HOS-001', number: 'HN-10002', isPrimary: true, issuedAt: Date.now() - 63072000000, facilityName: 'AMEXAN Teaching Hospital' }],
      insuranceNumbers: [{ provider: 'AAR', number: 'AAR-456123', scheme: 'Corporate', expiryDate: '2026-09-30', isPrimary: true, memberName: 'Mary Wanjiku', relationship: 'self' }],
    },
    clinicianIdentifiers: { professionalLicenses: [], councilRegistrations: [] },
    biometrics: [], documents: [], linkedIdentities: [], verifiedAt: 0, verificationLevel: VerificationLevel.DocumentUploaded, status: IdentityStatus.Active, createdAt: Date.now() - 63072000000, updatedAt: Date.now() - 259200000,
  },
];

export default function IdentityPage() {
  const [identities] = useState(MOCK_IDENTITIES);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<IdentityType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<number>(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return identities.filter(id => {
      if (typeFilter !== 'all' && id.type !== typeFilter) return false;
      if (levelFilter >= 0 && id.verificationLevel !== levelFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return id.amxUid.toLowerCase().includes(q) || id.patientIdentifiers.hospitalNumbers.some(h => h.number.includes(q)) || id.patientIdentifiers.nationalId?.includes(q) || id.clinicianIdentifiers.nationalId?.includes(q);
      }
      return true;
    });
  }, [identities, search, typeFilter, levelFilter]);

  const summary = useMemo(() => ({
    total: identities.length,
    patients: identities.filter(i => i.type === IdentityType.Patient || i.type === IdentityType.Both).length,
    clinicians: identities.filter(i => i.type === IdentityType.Clinician || i.type === IdentityType.Both).length,
    verified: identities.filter(i => i.verificationLevel >= VerificationLevel.InPersonVerified).length,
    pending: identities.filter(i => i.verificationLevel < VerificationLevel.DocumentVerified).length,
  }), [identities]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Identity</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book III — AMXUID, patient/clinician identifiers, biometrics, verification</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#EC4899,#DB2777)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Register Identity
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Identities', value: summary.total, color: '#EC4899' },
          { label: 'Patients', value: summary.patients, color: '#06B6D4' },
          { label: 'Clinicians', value: summary.clinicians, color: '#8B5CF6' },
          { label: 'Fully Verified', value: summary.verified, color: '#10B981' },
          { label: 'Pending Verification', value: summary.pending, color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by AMXUID, hospital number, national ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as IdentityType | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Types</option>
          {Object.values(IdentityType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(id => {
          const isSelected = selectedId === id.amxUid;
          const name = `Person-${id.amxUid.substring(8)}`;
          const primaryHospNo = getPrimaryHospitalNumber(id.patientIdentifiers);
          const primaryLicense = getPrimaryLicense(id.clinicianIdentifiers);
          return (
            <div
              key={id.amxUid}
              onClick={() => setSelectedId(isSelected ? null : id.amxUid)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(236,73,153,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(236,73,153,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(236,73,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#EC4899' }}>
                    {id.type === IdentityType.Patient ? 'P' : 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{name} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{id.amxUid}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      {primaryHospNo && <span>Hospital No: {primaryHospNo} · </span>}
                      {primaryLicense && <span>License: {primaryLicense.licenseNumber} · </span>}
                      Level {id.verificationLevel}/8
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: id.status === IdentityStatus.Active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: id.status === IdentityStatus.Active ? '#10B981' : '#EF4444' }}>
                    {id.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Patient Identifiers</div>
                      <div style={{ fontSize: 11, color: '#E2E8F0' }}>Hospital Numbers: {id.patientIdentifiers.hospitalNumbers.map(h => `${h.number} (${h.facilityName})`).join(', ') || 'None'}</div>
                      <div style={{ fontSize: 11, color: '#E2E8F0' }}>National ID: {id.patientIdentifiers.nationalId || '—'}</div>
                      <div style={{ fontSize: 11, color: '#E2E8F0' }}>Insurance: {id.patientIdentifiers.insuranceNumbers.map(i => `${i.provider} ${i.number}`).join(', ') || 'None'}</div>
                      {id.patientIdentifiers.socialHealthInsurance && (
                        <div style={{ fontSize: 11, color: '#E2E8F0' }}>SHA: {id.patientIdentifiers.socialHealthInsurance.number} ({id.patientIdentifiers.socialHealthInsurance.status})</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Clinician Identifiers</div>
                      <div style={{ fontSize: 11, color: '#E2E8F0' }}>Licenses: {id.clinicianIdentifiers.professionalLicenses.map(l => `${l.licenseNumber} (${l.body}, ${l.status === 'valid' && isLicenseValid(l) ? 'Valid' : 'Expired'})`).join(', ') || 'None'}</div>
                      <div style={{ fontSize: 11, color: '#E2E8F0' }}>Council: {id.clinicianIdentifiers.councilRegistrations.map(c => `${c.registrationNumber} (${c.council})`).join(', ') || 'None'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Verification Progress (Level {id.verificationLevel}/8)</div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(id.verificationLevel / 8) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #EC4899, #8B5CF6)', borderRadius: 3 }} />
                    </div>
                  </div>
                  {id.biometrics.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Biometrics</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {id.biometrics.map(b => (
                          <span key={b.type} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(236,73,153,0.1)', color: '#F472B6' }}>{b.type}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Documents ({id.documents.length})</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {id.documents.map(d => (
                        <span key={d.documentNumber} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{d.type}: {d.documentNumber} {d.verified ? '✓' : '✗'}</span>
                      ))}
                    </div>
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
