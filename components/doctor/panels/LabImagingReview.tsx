'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy,
} from 'firebase/firestore';

interface LabResult {
  id?: string;
  patientId: string; testName: string; category: string;
  result: string; resultValue?: number; unit?: string;
  referenceRange?: string; status: string;
  resultDate: any; orderedBy: string;
  flag?: 'normal' | 'borderline' | 'abnormal' | 'critical';
  notes?: string;
}

interface ImagingResult {
  id?: string;
  patientId: string; studyName: string; modality: string;
  result?: string; impression?: string; bodyPart?: string;
  resultDate: any; status: string; orderedBy: string;
  resultUrl?: string;
}

interface Props {
  patientId: string; compact?: boolean;
}

const fmtDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getFlagColor = (flag?: string) => {
  switch (flag) {
    case 'normal': return { bg: '#10b98110', color: '#10b981', dot: '🟢' };
    case 'borderline': return { bg: '#f59e0b10', color: '#f59e0b', dot: '🟡' };
    case 'abnormal': return { bg: '#f9731610', color: '#f97316', dot: '🟠' };
    case 'critical': return { bg: '#ef444410', color: '#ef4444', dot: '🔴' };
    default: return { bg: 'var(--bg)', color: 'var(--muted)', dot: '⚪' };
  }
};

// Define flagging rules for common labs
const getFlag = (testName: string, value: number): 'normal' | 'borderline' | 'abnormal' | 'critical' | undefined => {
  const t = testName.toLowerCase();
  if (t.includes('hba1c')) {
    if (value > 12) return 'critical';
    if (value > 8) return 'abnormal';
    if (value > 7) return 'borderline';
    return 'normal';
  }
  if (t.includes('creatinine')) {
    if (value > 500) return 'critical';
    if (value > 200) return 'abnormal';
    if (value > 110) return 'borderline';
    return 'normal';
  }
  if (t.includes('potassium') || t.includes('k+')) {
    if (value > 6.5 || value < 2.5) return 'critical';
    if (value > 5.2 || value < 3.5) return 'abnormal';
    if (value > 5.0 || value < 3.8) return 'borderline';
    return 'normal';
  }
  if (t.includes('sodium') || t.includes('na+')) {
    if (value > 160 || value < 120) return 'critical';
    if (value > 150 || value < 130) return 'abnormal';
    if (value > 145 || value < 135) return 'borderline';
    return 'normal';
  }
  if (t.includes('hemoglobin') || t.includes('hb')) {
    if (value < 6) return 'critical';
    if (value < 10) return 'abnormal';
    if (value < 12) return 'borderline';
    return 'normal';
  }
  if (t.includes('wcc') || t.includes('white')) {
    if (value > 30 || value < 1) return 'critical';
    if (value > 15 || value < 3) return 'abnormal';
    if (value > 12 || value < 4) return 'borderline';
    return 'normal';
  }
  if (t.includes('crp')) {
    if (value > 200) return 'critical';
    if (value > 50) return 'abnormal';
    if (value > 10) return 'borderline';
    return 'normal';
  }
  return undefined;
};

export default function LabImagingReview({ patientId, compact }: Props) {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [imaging, setImaging] = useState<ImagingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'labs' | 'imaging'>('labs');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedLab, setExpandedLab] = useState<string | null>(null);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', patientId), orderBy('resultDate', 'desc')),
      snap => { setLabs(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabResult))); setLoading(false); },
      () => setLoading(false),
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'imagingOrders'), where('patientId', '==', patientId), orderBy('resultDate', 'desc')),
      snap => setImaging(snap.docs.map(d => ({ id: d.id, ...d.data() } as ImagingResult))),
    ));

    return () => unsubs.forEach(u => u());
  }, [patientId]);

  // Group labs by test name for trending
  const labsByName: Record<string, LabResult[]> = {};
  labs.forEach(lab => {
    if (!labsByName[lab.testName]) labsByName[lab.testName] = [];
    labsByName[lab.testName].push(lab);
  });

  // Only show tests with trend data (2+ results)
  const trendedTests = Object.entries(labsByName).filter(([_, results]) => results.length >= 2);

  // Categories
  const categories = [...new Set(labs.map(l => l.category))];
  const filteredLabs = selectedCategory === 'all' ? labs : labs.filter(l => l.category === selectedCategory);

  // Critical/abnormal alerts
  const abnormalFlags = labs.filter(l => l.flag === 'abnormal' || l.flag === 'critical');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        <button className={`filter-chip ${tab === 'labs' ? 'active' : ''}`} onClick={() => setTab('labs')}>
          🔬 Lab Results {abnormalFlags.length > 0 && <span style={{ marginLeft: 4, color: '#ef4444' }}>({abnormalFlags.length} flags)</span>}
        </button>
        <button className={`filter-chip ${tab === 'imaging' ? 'active' : ''}`} onClick={() => setTab('imaging')}>
          🩻 Imaging Results ({imaging.length})
        </button>
      </div>

      {tab === 'labs' && (
        <>
          {/* Abnormal flags banner */}
          {abnormalFlags.length > 0 && (
            <div style={{
              padding: compact ? 8 : 10, borderRadius: 10,
              background: '#ef444410', border: '1px solid #ef444430',
            }}>
              <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12, color: '#ef4444', marginBottom: 4 }}>
                ⚠️ {abnormalFlags.length} Abnormal / Critical Result{abnormalFlags.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {abnormalFlags.slice(0, compact ? 3 : 5).map(lab => {
                  const fc = getFlagColor(lab.flag);
                  return (
                    <div key={lab.id} style={{ fontSize: compact ? 10 : 11, color: 'var(--text-2)' }}>
                      {fc.dot} {lab.testName}: <span style={{ fontWeight: 700, color: fc.color }}>{lab.result}</span>
                      {lab.referenceRange && <span style={{ color: 'var(--muted)' }}> (ref: {lab.referenceRange})</span>}
                      <span style={{ color: 'var(--muted)', marginLeft: 6 }}>· {fmtDate(lab.resultDate)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`} style={{ fontSize: 10, padding: '4px 10px' }}
              onClick={() => setSelectedCategory('all')}>
              All ({labs.length})
            </button>
            {categories.map(cat => (
              <button key={cat} className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`} style={{ fontSize: 10, padding: '4px 10px' }}
                onClick={() => setSelectedCategory(cat)}>
                {cat} ({labs.filter(l => l.category === cat).length})
              </button>
            ))}
          </div>

          {/* Longitudinal trends */}
          {trendedTests.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12, marginBottom: 6 }}>📈 Longitudinal Trends</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {trendedTests.slice(0, compact ? 3 : 5).map(([testName, results]) => {
                  const sorted = [...results].sort((a, b) => {
                    const da = a.resultDate?.toDate ? a.resultDate.toDate() : new Date(a.resultDate || 0);
                    const db2 = b.resultDate?.toDate ? b.resultDate.toDate() : new Date(b.resultDate || 0);
                    return da.getTime() - db2.getTime();
                  });
                  const latest = sorted[sorted.length - 1];
                  const first = sorted[0];
                  const numVal = parseFloat(latest.result);
                  const firstVal = parseFloat(first.result);
                  const trendIcon = !isNaN(numVal) && !isNaN(firstVal)
                    ? (numVal > firstVal * 1.1 ? '📈' : numVal < firstVal * 0.9 ? '📉' : '➡️')
                    : '➡️';
                  const fc = getFlagColor(latest.flag);

                  return (
                    <div key={testName} style={{
                      padding: compact ? 8 : 10, borderRadius: 8,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12 }}>{trendIcon} {testName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 900, color: fc.color, fontSize: compact ? 13 : 15 }}>
                            {latest.result}
                          </span>
                          {latest.unit && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{latest.unit}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                        <span>Range: {sorted.map(r => r.result).join(' → ')}</span>
                        <span>· {sorted.length} values</span>
                        <span>· Latest: {fmtDate(latest.resultDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lab result list */}
          <div>
            <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12, marginBottom: 6 }}>
              All Results ({filteredLabs.length})
            </div>
            {loading ? (
              [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 4 }} />)
            ) : filteredLabs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 16, color: 'var(--muted)', fontSize: 12 }}>No lab results available.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filteredLabs.slice(0, compact ? 10 : 20).map(lab => {
                  const fc = getFlagColor(lab.flag);
                  const isExpanded = expandedLab === lab.id;

                  return (
                    <div key={lab.id}
                      onClick={() => setExpandedLab(isExpanded ? null : (lab.id || null))}
                      style={{
                        padding: compact ? 6 : 8, borderRadius: 8,
                        background: fc.bg, border: `1px solid ${fc.color}20`,
                        cursor: 'pointer', transition: 'all .14s',
                        fontSize: compact ? 11 : 12,
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{fc.dot}</span>
                          <span style={{ fontWeight: 600 }}>{lab.testName}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: fc.color }}>
                            {lab.result}
                          </span>
                          {lab.unit && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{lab.unit}</span>}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(lab.resultDate)}</span>
                      </div>
                      {lab.referenceRange && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                          Ref: {lab.referenceRange}
                        </div>
                      )}
                      {isExpanded && lab.notes && (
                        <div style={{ marginTop: 6, padding: 6, borderRadius: 6, background: 'var(--bg)', fontSize: 11, fontStyle: 'italic', color: 'var(--text-2)' }}>
                          📝 {lab.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'imaging' && (
        <>
          {loading ? (
            [1,2].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8, marginBottom: 4 }} />)
          ) : imaging.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>
              🩻 No imaging results yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {imaging.slice(0, compact ? 8 : 15).map(img => {
                const hasResult = img.status === 'completed' && img.result;
                const isExpanded = expandedLab === img.id;
                return (
                  <div key={img.id}
                    onClick={() => setExpandedLab(isExpanded ? null : (img.id || null))}
                    style={{
                      padding: compact ? 8 : 10, borderRadius: 10,
                      background: hasResult ? '#10b98105' : 'var(--bg)',
                      border: '1px solid var(--border)', cursor: 'pointer',
                      transition: 'all .14s',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: compact ? 12 : 13 }}>
                          🩻 {img.studyName}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                          {img.modality.toUpperCase()}{img.bodyPart ? ` · ${img.bodyPart}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: img.status === 'completed' ? '#10b98120' : '#f59e0b20', color: img.status === 'completed' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                          {img.status}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(img.resultDate)}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {img.impression && (
                          <div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>Impression:</span>
                            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{img.impression}</div>
                          </div>
                        )}
                        {img.result && (
                          <div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>Findings:</span>
                            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{img.result}</div>
                          </div>
                        )}
                        {img.resultUrl && (
                          <button className="btn-action" style={{ fontSize: 10, padding: '4px 10px', alignSelf: 'flex-start' }}
                            onClick={() => window.open(img.resultUrl, '_blank')}>
                            📷 View Image
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
