'use client';
import { useState, useMemo } from 'react';
import { ResultType, ResultCategory, ResultStatus, ResultPriority, createResult, addResultValues, verifyResult, releaseResult, acknowledgeResult, getResultSummary, getCriticalResultsPendingAcknowledgment, getDeltaCheck } from '@/lib/amexan/hmis/results-engine';
import type { Result, ResultValue } from '@/lib/amexan/hmis/results-engine';

const MOCK_RESULTS: Result[] = [
  createResult({ orderId: 'ORD-001', resultType: ResultType.LabHematology, category: ResultCategory.Hematology, patientId: 'P-001', encounterId: 'ENC-001', requesterId: 'ACT-001', departmentId: 'DEPT-006', priority: ResultPriority.STAT }),
  createResult({ orderId: 'ORD-002', resultType: ResultType.LabBiochemistry, category: ResultCategory.Biochemistry, patientId: 'P-002', encounterId: 'ENC-002', requesterId: 'ACT-001', departmentId: 'DEPT-006', priority: ResultPriority.Urgent }),
  createResult({ orderId: 'ORD-003', resultType: ResultType.ImagingCT, category: ResultCategory.Radiology, patientId: 'P-003', encounterId: 'ENC-003', requesterId: 'ACT-002', departmentId: 'DEPT-007', priority: ResultPriority.Routine }),
];

addResultValues(MOCK_RESULTS[0], [
  { parameter: 'Hb', value: '13.2', unit: 'g/dL', referenceRange: '13.5-17.5', isAbnormal: true, isCritical: false, flag: 'low', method: 'Automated' },
  { parameter: 'WBC', value: '14.5', unit: 'x10^9/L', referenceRange: '4.0-11.0', isAbnormal: true, isCritical: false, flag: 'high', method: 'Automated' },
  { parameter: 'PLT', value: '250', unit: 'x10^9/L', referenceRange: '150-450', isAbnormal: false, isCritical: false, flag: 'normal', method: 'Automated' },
  { parameter: 'Neutrophils', value: '11.2', unit: 'x10^9/L', referenceRange: '2.0-7.5', isAbnormal: true, isCritical: false, flag: 'high', method: 'Automated' },
]);
verifyResult(MOCK_RESULTS[0], 'lab-sci-01');
releaseResult(MOCK_RESULTS[0], 'lab-sci-01');

addResultValues(MOCK_RESULTS[1], [
  { parameter: 'Na', value: '138', unit: 'mmol/L', referenceRange: '135-145', isAbnormal: false, isCritical: false, flag: 'normal' },
  { parameter: 'K', value: '6.8', unit: 'mmol/L', referenceRange: '3.5-5.0', isAbnormal: true, isCritical: true, flag: 'critical_high' },
  { parameter: 'Urea', value: '12.5', unit: 'mmol/L', referenceRange: '2.5-7.5', isAbnormal: true, isCritical: false, flag: 'high' },
  { parameter: 'Cr', value: '145', unit: 'umol/L', referenceRange: '60-110', isAbnormal: true, isCritical: false, flag: 'high' },
]);
verifyResult(MOCK_RESULTS[1], 'lab-sci-01');
releaseResult(MOCK_RESULTS[1], 'lab-sci-01');

export default function ResultsPage() {
  const [results] = useState(MOCK_RESULTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResultStatus | 'all'>('all');
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const summary = useMemo(() => getResultSummary(results), [results]);
  const criticalPending = useMemo(() => getCriticalResultsPendingAcknowledgment(results), [results]);

  const filtered = useMemo(() => {
    return results.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.id.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q) || r.values.some(v => v.parameter.toLowerCase().includes(q));
      }
      return true;
    });
  }, [results, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Results Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book VIII — Specimen-to-acknowledgement, critical flags, delta checks</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total', value: summary.total, color: '#14B8A6' },
          { label: 'Processing', value: summary.pendingProcessing, color: '#F59E0B' },
          { label: 'Released', value: summary.released, color: '#10B981' },
          { label: 'Acknowledged', value: summary.acknowledged, color: '#3B82F6' },
          { label: 'Critical Pending', value: summary.criticalPending, color: '#EF4444' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {criticalPending.length > 0 && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', marginBottom: 4 }}>⚠ {criticalPending.length} Critical Result{criticalPending.length > 1 ? 's' : ''} Pending Acknowledgment</div>
          {criticalPending.map(r => <div key={r.id} style={{ fontSize: 11, color: '#FCA5A5' }}>{r.id} — {r.values.filter(v => v.isCritical).map(v => `${v.parameter}: ${v.value}`).join(', ')}</div>)}
        </div>
      )}

      <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by ID, patient, parameter..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ResultStatus | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none' }}>
          <option value="all">All Status</option>
          {Object.values(ResultStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(result => {
          const isSelected = selectedResult === result.id;
          return (
            <div
              key={result.id}
              onClick={() => setSelectedResult(isSelected ? null : result.id)}
              style={{
                padding: 14, borderRadius: 10, cursor: 'pointer',
                background: isSelected ? 'rgba(20,184,166,0.08)' : result.isCritical ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(20,184,166,0.3)' : result.isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                    {result.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>{result.resultType} · {result.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Order: {result.orderId} · Patient: {result.patientId}</div>
                </div>
                <div className="flex items-center gap-2">
                  {result.isCritical && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700 }}>CRITICAL</span>}
                  {result.isAbnormal && !result.isCritical && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Abnormal</span>}
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{result.status}</span>
                  <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                </div>
              </div>
              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                  {result.values.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr style={{ color: '#64748B', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Parameter</th>
                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Value</th>
                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Unit</th>
                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Ref Range</th>
                            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.values.map((v, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: v.isCritical ? '#EF4444' : v.isAbnormal ? '#F59E0B' : '#E2E8F0' }}>
                              <td style={{ padding: '6px 8px', fontWeight: 500 }}>{v.parameter}</td>
                              <td style={{ padding: '6px 8px', fontWeight: 700 }}>{v.value}</td>
                              <td style={{ padding: '6px 8px' }}>{v.unit}</td>
                              <td style={{ padding: '6px 8px', color: '#64748B' }}>{v.referenceRange}</td>
                              <td style={{ padding: '6px 8px' }}>{v.flag}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {result.criticalFlags.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', marginBottom: 4 }}>Critical Flags</div>
                      {result.criticalFlags.map((f, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#FCA5A5' }}>{f.parameter}: {f.value} (threshold: {f.threshold})</div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Timeline</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(result.timing).filter(([, v]) => v != null).map(([key, val]) => (
                      <span key={key} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}: {typeof val === 'number' ? new Date(val).toLocaleTimeString() : val}
                      </span>
                    ))}
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
