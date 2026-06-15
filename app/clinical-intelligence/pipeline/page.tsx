'use client';
import { useState, useMemo } from 'react';
import { getAllSymptoms, aggregateDifferentials } from '@/lib/history-engine/symptomLibrary';
import { enrichWithKgDifferentials } from '@/lib/history-engine/kgDifferentialBridge';
import { getInvestigationsForDiseases } from '@/lib/history-engine/investigations/investigationRegistry';
import { getTreatmentsForDiseases } from '@/lib/history-engine/treatment/treatmentRegistry';
import { getEducation } from '@/lib/history-engine/educationRegistry';

const ALL_SYMPTOMS = getAllSymptoms();

const CAT_ORDER = ['respiratory', 'cardiovascular', 'gastrointestinal', 'neurological', 'psychiatry', 'musculoskeletal', 'urological', 'gynecological', 'obstetrics', 'pediatrics', 'ent', 'ophthalmology', 'dermatological', 'constitutional', 'oncological', 'emergency', 'general'];
const CAT_LABELS: Record<string, string> = {
  respiratory: 'Respiratory', cardiovascular: 'Cardiovascular', gastrointestinal: 'Gastrointestinal',
  neurological: 'Neurology', psychiatry: 'Psychiatry', musculoskeletal: 'Musculoskeletal',
  urological: 'Urology', gynecological: 'Gynecology', obstetrics: 'Obstetrics',
  pediatrics: 'Pediatrics', ent: 'ENT', ophthalmology: 'Ophthalmology',
  dermatological: 'Dermatology', constitutional: 'Constitutional', oncological: 'Oncology',
  emergency: 'Emergency', general: 'General',
};

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#070B14', color: '#E2E8F0', fontFamily: "'DM Sans',sans-serif" },
  header: { borderBottom: '1px solid rgba(255,255,255,.06)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 },
  h1: { fontSize: 18, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: '#06B6D4' },
  badge: { fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'rgba(6,182,212,.12)', color: '#06B6D4', fontWeight: 600 },
  main: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, height: 'calc(100vh - 57px)' },
  sidebar: { borderRight: '1px solid rgba(255,255,255,.06)', overflowY: 'auto', padding: 16 },
  content: { overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  catLabel: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#475569', marginBottom: 6, marginTop: 12 },
  card: { background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 16 },
  cardT: { fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 },
};

function symBtnStyle(sel: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '6px 10px', borderRadius: 6, textAlign: 'left', cursor: 'pointer', fontSize: 11,
    border: `1px solid ${sel ? 'rgba(6,182,212,.4)' : 'rgba(255,255,255,.06)'}`,
    background: sel ? 'rgba(6,182,212,.1)' : 'rgba(255,255,255,.02)',
    color: sel ? '#06B6D4' : '#94A3B8', fontWeight: sel ? 500 : 400,
    transition: 'all .12s', fontFamily: "'DM Sans',sans-serif",
  };
}

export default function PipelinePage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof ALL_SYMPTOMS> = {};
    for (const sym of ALL_SYMPTOMS) {
      const cat = sym.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sym);
    }
    return groups;
  }, []);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const aggregated = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    const map = enrichWithKgDifferentials(selectedSymptoms, aggregateDifferentials(selectedSymptoms));
    return Array.from(map.entries())
      .map(([diseaseId, data]) => ({ diseaseId, ...data }))
      .sort((a, b) => b.totalWeight - a.totalWeight);
  }, [selectedSymptoms]);

  const topIds = useMemo(() => aggregated.slice(0, 5).map(d => d.diseaseId), [aggregated]);

  const investigations = useMemo(() => {
    if (topIds.length === 0) return [];
    return getInvestigationsForDiseases(topIds);
  }, [topIds]);

  const treatments = useMemo(() => {
    if (topIds.length === 0) return [];
    return getTreatmentsForDiseases(topIds);
  }, [topIds]);

  const education = useMemo(() => {
    if (aggregated.length === 0) return null;
    return getEducation(aggregated[0].diseaseId);
  }, [aggregated]);

  const maxWeight = aggregated.length > 0 ? aggregated[0].totalWeight : 1;

  return (
    <div style={st.page}>
      <div style={st.header}>
        <span style={st.h1}>Clinical Pipeline</span>
        <span style={st.badge}>Phase 1.9</span>
        <span style={{ fontSize: 11, color: '#64748B', marginLeft: 'auto' }}>
          {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
          {aggregated.length > 0 && ` · ${aggregated.length} differentials`}
        </span>
      </div>
      <div style={st.main}>
        <div style={st.sidebar}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>Symptoms</div>
          {CAT_ORDER.map(cat => {
            const symptoms = grouped[cat];
            if (!symptoms || symptoms.length === 0) return null;
            return (
              <div key={cat}>
                <div style={st.catLabel}>{CAT_LABELS[cat] || cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {symptoms.map(sym => (
                    <button
                      key={sym.id}
                      onClick={() => toggleSymptom(sym.id)}
                      style={symBtnStyle(selectedSymptoms.includes(sym.id))}
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={st.content}>
          {selectedSymptoms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '120px 0', color: '#475569' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🩺</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Select symptoms from the left panel</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>The pipeline will compute differentials, investigations, treatments, and education</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={st.card}>
                  <div style={st.cardT}>Differential Diagnoses ({aggregated.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {aggregated.slice(0, 10).map((d, i) => {
                      const pct = Math.round((d.totalWeight / maxWeight) * 100);
                      return (
                        <div key={d.diseaseId}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: i === 0 ? '#06B6D4' : i < 3 ? '#3B82F6' : 'rgba(255,255,255,.06)',
                                color: i < 3 ? '#070B14' : '#64748B',
                                fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>{i + 1}</span>
                              <span style={{ fontSize: 12, fontWeight: 500 }}>{d.diseaseName}</span>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#06B6D4' : '#94A3B8', fontFamily: "'JetBrains Mono',monospace" }}>{pct}%</span>
                          </div>
                          <div style={{ width: '100%', height: 3, borderRadius: 3, background: 'rgba(255,255,255,.04)', overflow: 'hidden', marginLeft: 26 }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: i === 0 ? '#06B6D4' : i < 3 ? '#3B82F6' : '#475569', transition: 'width .3s' }} />
                          </div>
                          <div style={{ fontSize: 9, color: '#475569', marginLeft: 26, marginTop: 1 }}>
                            {d.matchedSymptoms.join(', ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={st.card}>
                  <div style={st.cardT}>Investigations ({investigations.length} suggested)</div>
                  {investigations.slice(0, 12).map(inv => (
                    <div key={inv.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 11 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                        <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{inv.name}</span>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: inv.priority === 'essential' ? 'rgba(239,68,68,.1)' : inv.priority === 'supportive' ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.04)',
                          color: inv.priority === 'essential' ? '#FCA5A5' : inv.priority === 'supportive' ? '#FCD34D' : '#64748B',
                        }}>{inv.priority}</span>
                      </div>
                      <div style={{ color: '#475569', fontSize: 9 }}>{inv.category} · {inv.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={st.card}>
                  <div style={st.cardT}>Treatments ({treatments.length} suggested)</div>
                  {treatments.slice(0, 12).map(tx => (
                    <div key={tx.intervention + tx.forCondition[0]} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 11 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                        <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{tx.intervention}</span>
                        <span style={{
                          fontSize: 9, padding: '1px 5px', borderRadius: 3,
                          background: 'rgba(255,255,255,.04)', color: '#64748B',
                        }}>{tx.category}</span>
                      </div>
                      <div style={{ color: '#475569', fontSize: 9 }}>
                        {tx.forCondition.filter(Boolean).join(', ')}
                        {tx.dosage ? ` · ${tx.dosage}` : ''}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={st.card}>
                  <div style={st.cardT}>Education{education ? ` · ${education.diseaseName}` : ''}</div>
                  {education ? (
                    <div>
                      <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5, marginBottom: 10 }}>{education.overview}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>Key Presentations</div>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, color: '#94A3B8', lineHeight: 1.6 }}>
                        {education.typicalPresentation.slice(0, 4).map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', marginTop: 8, marginBottom: 4 }}>First-Line Treatment</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.5 }}>{education.firstLineTreatment}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', marginTop: 8, marginBottom: 4 }}>Prognosis</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.5 }}>{education.prognosis}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#475569' }}>No educational content available for top differential.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
