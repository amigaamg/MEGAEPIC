'use client';
import { useState, useMemo } from 'react';
import { DiseaseClassification, DiseaseReportStatus, DiseaseSeverity, DiseaseOutcome, ImmunizationStatus, OutbreakStatus, ResponseLevel, createDiseaseReport, getPublicHealthStats } from '@/lib/amexan/hmis/public-health-engine';
import type { DiseaseReport, ImmunizationRecord, OutbreakAlert } from '@/lib/amexan/hmis/public-health-engine';

const MOCK_REPORTS: DiseaseReport[] = [
  createDiseaseReport({ disease: 'Malaria', icdCode: 'B50.9', classification: DiseaseClassification.Notifiable, patientId: 'P-010', patientAge: 8, patientGender: 'F', patientLocation: 'Kisumu County', facilityId: 'HOS-001', facilityName: 'AMEXAN Hospital', reporterId: 'DOC-001', reporterName: 'Dr. Smith', dateOfOnset: '2026-07-20', dateOfDiagnosis: '2026-07-22', severity: DiseaseSeverity.Severe }),
  createDiseaseReport({ disease: 'Tuberculosis', icdCode: 'A15.0', classification: DiseaseClassification.Notifiable, patientId: 'P-011', patientAge: 34, patientGender: 'M', patientLocation: 'Nairobi', facilityId: 'HOS-001', facilityName: 'AMEXAN Hospital', reporterId: 'DOC-002', reporterName: 'Dr. Jones', dateOfOnset: '2026-07-15', dateOfDiagnosis: '2026-07-18', severity: DiseaseSeverity.Moderate }),
  createDiseaseReport({ disease: 'COVID-19', icdCode: 'U07.1', classification: DiseaseClassification.Sentinel, patientId: 'P-012', patientAge: 55, patientGender: 'F', patientLocation: 'Mombasa', facilityId: 'HOS-001', facilityName: 'AMEXAN Hospital', reporterId: 'DOC-001', reporterName: 'Dr. Smith', dateOfOnset: '2026-07-25', dateOfDiagnosis: '2026-07-26', severity: DiseaseSeverity.Mild }),
  createDiseaseReport({ disease: 'Cholera', icdCode: 'A00.9', classification: DiseaseClassification.Notifiable, patientId: 'P-013', patientAge: 28, patientGender: 'M', patientLocation: 'Garissa', facilityId: 'HOS-001', facilityName: 'AMEXAN Hospital', reporterId: 'DOC-003', reporterName: 'Dr. Akinyi', dateOfOnset: '2026-07-27', dateOfDiagnosis: '2026-07-28', severity: DiseaseSeverity.Critical }),
];

MOCK_REPORTS[0].outcome = DiseaseOutcome.Recovering;
MOCK_REPORTS[1].outcome = DiseaseOutcome.Recovering;
MOCK_REPORTS[3].outcome = DiseaseOutcome.Critical;
MOCK_REPORTS[3].hospitalizationRequired = true;
MOCK_REPORTS[3].hospitalizationDays = 5;

const MOCK_OUTBREAKS: OutbreakAlert[] = [
  { id: 'OBK-001', disease: 'Cholera', icdCode: 'A00.9', region: 'Garissa County', facilityIds: ['HOS-001'], firstCaseReportedAt: Date.now() - 604800000, numberOfCases: 23, numberOfDeaths: 2, attackRate: 3.2, caseFatalityRate: 8.7, status: OutbreakStatus.Confirmed, responseLevel: ResponseLevel.Level2, controlMeasures: ['Water chlorination', 'Oral rehydration centers', 'Contact tracing', 'Mass awareness'], investigationStatus: 'Source identified as contaminated borehole', sourceFound: true, sourceDescription: 'Contaminated community borehole', declaredAt: Date.now() - 432000000, containedAt: undefined, declaredOverAt: undefined },
];

const SEVERITY_COLORS: Record<string, string> = { mild: '#F59E0B', moderate: '#F97316', severe: '#EF4444', critical: '#DC2626', fatal: '#7F1D1D', asymptomatic: '#10B981' };

export default function PublicHealthPage() {
  const [reports] = useState(MOCK_REPORTS);
  const [outbreaks] = useState(MOCK_OUTBREAKS);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const stats = useMemo(() => getPublicHealthStats(reports, [], outbreaks), [reports, outbreaks]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Public Health Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XVIII — Disease surveillance, immunization, outbreak management</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#15803D,#166534)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Report Disease</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {[{ label: 'Reports', value: stats.totalReports, color: '#15803D' }, { label: 'Notifiable', value: stats.notifiableDiseases, color: '#EF4444' }, { label: 'Outbreaks', value: stats.activeOutbreaks, color: '#DC2626' }, { label: 'Mortality', value: `${stats.mortalityRate.toFixed(0)}%`, color: '#7F1D1D' }, { label: 'Facilities', value: stats.reportingFacilities, color: '#3B82F6' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {outbreaks.length > 0 && (
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>🚨 Active Outbreak: {outbreaks[0].disease}</div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(220,38,38,0.15)', color: '#DC2626' }}>{outbreaks[0].status} · Level {outbreaks[0].responseLevel}</span>
          </div>
          <div style={{ fontSize: 12, color: '#FCA5A5' }}>{outbreaks[0].region} · {outbreaks[0].numberOfCases} cases · {outbreaks[0].numberOfDeaths} deaths · CFR: {outbreaks[0].caseFatalityRate}%</div>
          <div style={{ fontSize: 11, color: '#FCA5A5', marginTop: 4 }}>Investigation: {outbreaks[0].investigationStatus}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {outbreaks[0].controlMeasures.map((m, i) => <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: '#FCA5A5' }}>{m}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reports.map(r => {
          const isSelected = selectedReport === r.id;
          return (
            <div key={r.id} onClick={() => setSelectedReport(isSelected ? null : r.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(21,128,61,0.08)' : r.severity === DiseaseSeverity.Critical || r.severity === DiseaseSeverity.Severe ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(21,128,61,0.3)' : r.severity === DiseaseSeverity.Critical ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{r.disease} ({r.icdCode}) <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {r.classification}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Patient: {r.patientId} · Age {r.patientAge} · {r.patientGender} · {r.patientLocation}</div>
                </div>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${SEVERITY_COLORS[r.severity]}20`, color: SEVERITY_COLORS[r.severity] }}>{r.severity}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{r.outcome}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Onset: <span style={{ color: '#E2E8F0' }}>{r.dateOfOnset}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Diagnosis: <span style={{ color: '#E2E8F0' }}>{r.dateOfDiagnosis}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Hospitalized: <span style={{ color: '#E2E8F0' }}>{r.hospitalizationRequired ? `${r.hospitalizationDays} days` : 'No'}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Contact tracing: <span style={{ color: '#E2E8F0' }}>{r.contactTracingDone ? `${r.contactsIdentified} identified` : 'Not done'}</span></div>
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
