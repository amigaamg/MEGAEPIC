'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, orderBy, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { writeTimelineEvent } from '@/lib/firebaseTimeline';

interface AdherenceRecord {
  id?: string;
  patientId: string;
  medication: string;
  expectedDoses: number;
  takenDoses: number;
  periodDays: number;
  adherencePercent: number;
  periodStart: Timestamp | any;
  periodEnd: Timestamp | any;
  riskFlags: string[];
  lastReportedAt?: Timestamp | any;
  trend: 'improving' | 'stable' | 'declining' | 'critical';
}

interface PatientReport {
  id?: string;
  patientId: string;
  reportType: 'medication_use' | 'symptom_check' | 'side_effect' | 'general';
  medication?: string;
  taken?: boolean;
  symptoms?: string[];
  sideEffects?: string[];
  note?: string;
  reportedAt: Timestamp | any;
}

interface Props {
  patientId: string; doctorId: string; doctorName: string;
  compact?: boolean;
}

const fmtDate = (ts: any) => {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function MedicationAdherence({ patientId, doctorId, doctorName, compact }: Props) {
  return null;
  const [adherenceRecords, setAdherenceRecords] = useState<AdherenceRecord[]>([]);
  const [patientReports, setPatientReports] = useState<PatientReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState<string | null>(null);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'medicationAdherence'), where('patientId', '==', patientId), orderBy('periodEnd', 'desc')),
      snap => setAdherenceRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdherenceRecord))),
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'patient_reports'), where('patientId', '==', patientId), orderBy('reportedAt', 'desc')),
      snap => setPatientReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as PatientReport))),
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'prescriptions'), where('patientId', '==', patientId)),
      snap => setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    ));

    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, [patientId]);

  // Group adherence by medication
  const adherenceByMed: Record<string, AdherenceRecord[]> = {};
  adherenceRecords.forEach(rec => {
    if (!adherenceByMed[rec.medication]) adherenceByMed[rec.medication] = [];
    adherenceByMed[rec.medication].push(rec);
  });

  // Latest adherence per medication
  const latestAdherence: Record<string, AdherenceRecord> = {};
  Object.entries(adherenceByMed).forEach(([med, recs]) => {
    latestAdherence[med] = recs.sort((a, b) => {
      const da = a.periodEnd?.toDate ? a.periodEnd.toDate() : new Date(0);
      const db2 = b.periodEnd?.toDate ? b.periodEnd.toDate() : new Date(0);
      return db2.getTime() - da.getTime();
    })[0];
  });

  const activeMeds = prescriptions.filter((p: any) => p.status === 'active');

  const getAdherenceColor = (pct: number) => {
    if (pct >= 90) return '#10b981';
    if (pct >= 75) return '#f59e0b';
    if (pct >= 50) return '#f97316';
    return '#ef4444';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      case 'critical': return '🚨';
      default: return '➖';
    }
  };

  const handleFlagAlert = useCallback(async (medication: string, adherencePercent: number) => {
    await writeTimelineEvent({
      patientId, type: 'alert_triggered',
      title: `⚠️ Adherence Alert: ${medication}`,
      description: `${medication} adherence dropped to ${adherencePercent}%. Review and intervene.`,
      severity: adherencePercent < 50 ? 'critical' : 'warning',
      createdBy: doctorId,
      metadata: { medication, adherencePercent },
    });
  }, [patientId, doctorId]);

  const recentReports = patientReports.slice(0, compact ? 5 : 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* Overall adherence summary */}
      <div style={{
        padding: compact ? 10 : 14, borderRadius: 12,
        background: 'var(--bg)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontWeight: 700, fontSize: compact ? 12 : 13, marginBottom: 8 }}>💊 Medication Adherence Overview</div>
        {Object.keys(latestAdherence).length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--muted)', fontSize: 12 }}>
            No adherence data yet. Data appears when patients report medication use.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(latestAdherence).map(([med, rec]) => {
              const color = getAdherenceColor(rec.adherencePercent);
              return (
                <div key={med}
                  onClick={() => setSelectedMed(selectedMed === med ? null : med)}
                  style={{
                    padding: compact ? 8 : 10, borderRadius: 8,
                    background: 'var(--surface)', border: `1px solid ${color}30`,
                    cursor: 'pointer', transition: 'all .14s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12 }}>{med}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                        {rec.expectedDoses} expected · {rec.takenDoses} taken · {rec.periodDays}d period
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{getTrendIcon(rec.trend)}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: compact ? 16 : 18, fontWeight: 900,
                          fontFamily: 'var(--mono)', color,
                        }}>
                          {rec.adherencePercent}%
                        </div>
                        {rec.riskFlags.length > 0 && (
                          <div style={{ fontSize: 9, color: 'var(--red)', fontWeight: 700 }}>
                            ⚠️ {rec.riskFlags.length} flags
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Adherence bar */}
                  <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: `${rec.adherencePercent}%`, height: '100%', borderRadius: 99, background: color, transition: 'width .5s ease' }} />
                  </div>

                  {selectedMed === med && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        <button className="btn-sm-accent" style={{ fontSize: 10, padding: '3px 8px' }}
                          onClick={() => handleFlagAlert(med, rec.adherencePercent)}>
                          🚨 Generate Alert
                        </button>
                      </div>
                      {rec.riskFlags.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)' }}>Risk Flags:</div>
                          {rec.riskFlags.map((flag, i) => (
                            <div key={i} style={{ fontSize: 10, color: 'var(--text-2)', padding: '2px 6px', background: 'var(--red-dim)', borderRadius: 4 }}>⚠️ {flag}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active medications without adherence data */}
      {activeMeds.filter((m: any) => !latestAdherence[m.medication]).length > 0 && (
        <div style={{
          padding: compact ? 8 : 10, borderRadius: 10,
          background: '#f59e0b10', border: '1px solid #f59e0b30',
        }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>
            ⏳ Medications Awaiting Adherence Data
          </div>
          {activeMeds.filter((m: any) => !latestAdherence[m.medication]).map((m: any) => (
            <div key={m.id} style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 0' }}>
              💊 {m.medication} — {m.dosage} · Started {fmtDate(m.createdAt)}
            </div>
          ))}
        </div>
      )}

      {/* Patient self-reports */}
      <div>
        <div style={{ fontWeight: 700, fontSize: compact ? 11 : 12, marginBottom: 6 }}>
          📝 Patient Self-Reports
          {patientReports.length > 0 && <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>({patientReports.length} total)</span>}
        </div>
        {loading ? (
          [1,2].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 4 }} />)
        ) : recentReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--muted)', fontSize: 12 }}>
            No patient reports yet. Reports appear when patients log medication use or symptoms.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentReports.map(report => (
              <div key={report.id} style={{
                padding: compact ? 6 : 8, borderRadius: 8,
                background: 'var(--bg)', border: '1px solid var(--border)',
                fontSize: compact ? 11 : 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>
                    {report.reportType === 'medication_use' ? '💊' : report.reportType === 'symptom_check' ? '🩺' : report.reportType === 'side_effect' ? '⚠️' : '📋'} {report.reportType.replace('_', ' ')}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(report.reportedAt)}</span>
                </div>
                {report.medication && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>
                    {report.taken !== undefined ? (report.taken ? '✅ Taken' : '❌ Missed') : ''} {report.medication}
                  </div>
                )}
                {report.symptoms && report.symptoms.length > 0 && (
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
                    {report.symptoms.map((s, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 99, background: '#f59e0b15', color: '#f59e0b', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                )}
                {report.note && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>"{report.note}"</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
