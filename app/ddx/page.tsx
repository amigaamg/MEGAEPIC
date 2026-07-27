'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  COUGH_COMPREHENSIVE, DDxResult, DDxScore, DISEASE_CATEGORIES,
  ddxEngine, generateCoughNarrative, CoughNarrativeInput, CoughCategory,
} from '@/lib/knowledge/cough-comprehensive';
import { createEmptyDocument, ClinicalDocument } from '@/lib/pdf/document-types';
import { downloadPdf, openPdfInTab } from '@/lib/pdf/pdf-renderer';

const ALL_CONTEXTS = [
  { id: 'ctx_pediatric', label: 'Child', icon: '🧒' },
  { id: 'ctx_neonatal', label: 'Neonate', icon: '👶' },
  { id: 'ctx_elderly', label: 'Geriatric', icon: '👴' },
  { id: 'ctx_pregnancy', label: 'Pregnant', icon: '🤰' },
  { id: 'ctx_hiv', label: 'HIV+', icon: '🦠' },
  { id: 'ctx_immunosuppressed', label: 'Immunocompromised', icon: '🔬' },
  { id: 'ctx_neutropenic', label: 'Neutropenic', icon: '⬇️' },
  { id: 'ctx_cancer', label: 'Cancer', icon: '🎗️' },
  { id: 'ctx_icu', label: 'ICU', icon: '🏥' },
  { id: 'ctx_post_covid', label: 'Post-COVID', icon: '🦠' },
  { id: 'ctx_tb_endemic', label: 'TB Endemic', icon: '🌍' },
  { id: 'ctx_occupational', label: 'Occupational', icon: '🏭' },
  { id: 'ctx_post_surgical', label: 'Post-Surgical', icon: '🔪' },
  { id: 'ctx_resource_limited', label: 'Resource-Limited', icon: '📋' },
];

const PHENOTYPE_OPTIONS = (COUGH_COMPREHENSIVE.phenotypes || []).map(p => ({
  id: p.id,
  name: p.name,
  features: p.features.join(', '),
  urgency: p.urgency || 'routine',
  suggests: p.suggests,
}));

const RED_FLAG_OPTIONS = [
  { id: 'hemoptysis', label: 'Hemoptysis' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'night_sweats', label: 'Night Sweats' },
  { id: 'stridor', label: 'Stridor' },
  { id: 'hypoxia', label: 'Hypoxia' },
  { id: 'massive_hemoptysis', label: 'Massive Hemoptysis' },
  { id: 'syncope', label: 'Syncope' },
  { id: 'chest_pain_severe', label: 'Severe Chest Pain' },
  { id: 'high_fever', label: 'High Fever (>39.5)' },
  { id: 'altered_mental_status', label: 'Altered Mental Status' },
  { id: 'respiratory_distress', label: 'Respiratory Distress' },
  { id: 'cough_>8_weeks', label: 'Cough >8 Weeks' },
];

function clinicalDocumentFromDdx(
  result: DDxResult,
  phenotypes: string[],
  contexts: string[],
  redFlags: string[],
  narrativeText: string,
): ClinicalDocument {
  const doc = createEmptyDocument();
  doc.metadata.title = 'AMEXAN Differential Diagnosis Report';
  doc.metadata.documentType = 'ddx';
  doc.metadata.generatedAt = Date.now();
  doc.metadata.generatedBy = 'AMEXAN Clinical Intelligence — DDx Engine v3.0';

  doc.encounter.chiefComplaint = 'Cough (' + phenotypes.join(', ') + ')';
  doc.encounter.duration = phenotypes.some(p => PHENOTYPE_OPTIONS.find(po => po.id === p)?.urgency === 'emergency') ? 'Acute' : 'Subacute/Chronic';

  doc.subjective.chiefComplaint = doc.encounter.chiefComplaint;
  doc.subjective.historyOfPresentingIllness = narrativeText || 'Patient presents with cough. Full clinical context below.';
  doc.subjective.symptomReview = PHENOTYPE_OPTIONS.filter(p => phenotypes.includes(p.id)).map(p => ({
    symptom: p.name,
    present: true,
    notes: p.features,
  }));

  doc.differentials.topDiagnoses = result.topDifferentials.map((d, i) => {
    const disease = COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId);
    return {
      rank: i + 1,
      diseaseId: d.diseaseId,
      diseaseName: disease?.name || d.diseaseId,
      icd10: disease?.icd10,
      probability: d.score >= 4 ? 'high' : d.score >= 2 ? 'moderate' : 'low',
      score: d.score,
      isRedFlag: d.isRedFlag,
      supports: disease?.phenotypes?.filter(p => phenotypes.includes(p)) || [],
      opposes: [],
    };
  });

  doc.differentials.ddxNarrative = narrativeText;
  doc.differentials.reasoningRationale = `DDx Engine evaluated ${phenotypes.length} phenotype(s), ${contexts.length} context(s), and ${redFlags.length} red flag(s). Top category: ${result.category}. Uncertainty reflects overlapping phenotypes across ${result.topDifferentials.length} candidate diagnoses.`;
  doc.differentials.category = result.category;
  doc.differentials.uncertaintyScore = result.topDifferentials.length > 1 ? result.topDifferentials[0].score / (result.topDifferentials.reduce((a, b) => a + b.score, 0) || 1) : 0.9;

  doc.investigations.recommended = result.investigationSuggestions.map(invId => {
    const inv = COUGH_COMPREHENSIVE.investigations?.find(i => i.id === invId);
    const forDiseases = result.topDifferentials.filter(d => {
      const disease = COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId);
      return disease?.investigations?.some(di => di.investigationId === invId);
    }).map(d => d.diseaseId);
    return {
      investigationId: invId,
      name: inv?.name || invId,
      purpose: '',
      priority: result.urgentAction ? 'immediate' : 'urgent',
      diseaseIds: forDiseases,
    };
  });

  doc.monitoring.frequency = result.urgentAction ? 'Continuous monitoring' : 'As clinically indicated';
  doc.monitoring.escalationCriteria = result.urgentAction
    ? [{ condition: 'Any clinical deterioration', action: 'Immediate senior review and escalation' }]
    : [];

  doc.assessment.clinicalImpression = narrativeText || 'See differential diagnosis section.';

  doc.references.guidelines = [];
  const seenGuids = new Set<string>();
  result.topDifferentials.forEach(d => {
    const disease = COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId);
    disease?.guidelines?.forEach(gid => {
      if (!seenGuids.has(gid)) {
        seenGuids.add(gid);
        const g = COUGH_COMPREHENSIVE.guidelines?.find(gl => gl.id === gid);
        if (g) doc.references.guidelines.push({ id: g.id, title: g.title, issuingBody: g.issuingBody, year: g.year });
      }
    });
  });

  return doc;
}

export default function DdxPage() {
  const [selectedPhenotypes, setSelectedPhenotypes] = useState<string[]>([]);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [narrativeInput, setNarrativeInput] = useState<CoughNarrativeInput>({});
  const [exporting, setExporting] = useState<'pdf' | 'print' | null>(null);
  const [searchPhenotype, setSearchPhenotype] = useState('');

  const result: DDxResult | null = useMemo(() => {
    if (selectedPhenotypes.length === 0) return null;
    return ddxEngine.evaluate(selectedPhenotypes, selectedContexts, selectedRedFlags);
  }, [selectedPhenotypes, selectedContexts, selectedRedFlags]);

  const narrativeText = useMemo(() => {
    const template = selectedPhenotypes.some(p => {
      const phen = PHENOTYPE_OPTIONS.find(po => po.id === p);
      return phen?.urgency === 'emergency';
    }) ? 'hemoptysis' : selectedPhenotypes.some(p => ['phen_chronic_productive', 'phen_chronic_dry_cough'].includes(p)) ? 'chronic_cough' : 'acute_cough';
    return generateCoughNarrative(template, narrativeInput);
  }, [selectedPhenotypes, narrativeInput]);

  const togglePhenotype = useCallback((id: string) => {
    setSelectedPhenotypes(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }, []);

  const toggleContext = useCallback((id: string) => {
    setSelectedContexts(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }, []);

  const toggleRedFlag = useCallback((id: string) => {
    setSelectedRedFlags(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (!result) return;
    setExporting('pdf');
    try {
      const doc = clinicalDocumentFromDdx(result, selectedPhenotypes, selectedContexts, selectedRedFlags, narrativeText);
      doc.patient.name = patientName || 'Unnamed Patient';
      doc.patient.age = parseInt(patientAge) || 0;
      doc.patient.gender = patientGender || 'Not specified';
      await downloadPdf(doc, 'amexan-ddx-report-' + Date.now() + '.pdf');
    } finally {
      setExporting(null);
    }
  }, [result, selectedPhenotypes, selectedContexts, selectedRedFlags, narrativeText, patientName, patientAge, patientGender]);

  const handlePrint = useCallback(async () => {
    if (!result) return;
    setExporting('print');
    try {
      const doc = clinicalDocumentFromDdx(result, selectedPhenotypes, selectedContexts, selectedRedFlags, narrativeText);
      doc.patient.name = patientName || 'Unnamed Patient';
      doc.patient.age = parseInt(patientAge) || 0;
      doc.patient.gender = patientGender || 'Not specified';
      await openPdfInTab(doc);
    } finally {
      setExporting(null);
    }
  }, [result, selectedPhenotypes, selectedContexts, selectedRedFlags, narrativeText, patientName, patientAge, patientGender]);

  const filteredPhenotypes = PHENOTYPE_OPTIONS.filter(p =>
    !searchPhenotype || p.name.toLowerCase().includes(searchPhenotype.toLowerCase()) || p.id.toLowerCase().includes(searchPhenotype.toLowerCase()),
  );

  const urgencyColor = (u: string) => {
    switch (u) {
      case 'emergency': return '#e74c3c';
      case 'urgent': return '#f39c12';
      case 'routine': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const categoryColor = (c: CoughCategory | 'mixed') => {
    const map: Record<string, string> = {
      infectious: '#e74c3c', obstructive: '#3498db', cardiovascular: '#e91e63',
      interstitial: '#9b59b6', neoplastic: '#2c3e50', upper_airway: '#1abc9c',
      gi: '#f39c12', drug_induced: '#e67e22', occupational: '#7f8c8d',
      congenital: '#8e44ad', immunological: '#c0392b', psychogenic: '#95a5a6',
      trauma: '#d35400', icu_postop: '#2c3e50', other: '#bdc3c7', mixed: '#34495e',
    };
    return map[c] || '#95a5a6';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: 'clamp(8px, 2vw, 24px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(8px, 1.5vw, 20px)',
    }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
        @media (max-width: 640px) {
          .ddx-grid { grid-template-columns: 1fr !important; }
          .phenotype-grid { grid-template-columns: 1fr 1fr !important; }
          .context-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .phenotype-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .ddx-scroll::-webkit-scrollbar { width: 4px; }
        .ddx-scroll::-webkit-scrollbar-thumb { background: #bdc3c7; border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>

      {/* Header */}
      <header className="no-print" style={{
        background: 'linear-gradient(135deg, #005f73 0%, #0a9396 100%)',
        borderRadius: 12,
        padding: 'clamp(12px, 2vw, 24px)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 700, letterSpacing: '-0.5px' }}>AMEXAN DDx Engine</h1>
          <p style={{ margin: '4px 0 0', fontSize: 'clamp(12px, 1.5vw, 14px)', opacity: 0.85 }}>
            Universal Differential Diagnosis — v3.0 | {COUGH_COMPREHENSIVE.diseases?.length || 0} diseases across 14 categories
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleExportPdf} disabled={!result || exporting === 'pdf'}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '2px solid #fff',
              background: exporting === 'pdf' ? '#fff' : 'transparent',
              color: exporting === 'pdf' ? '#005f73' : '#fff',
              fontWeight: 600, fontSize: 14, cursor: !result || exporting ? 'not-allowed' : 'pointer',
              opacity: !result ? 0.5 : 1,
            }}>
            {exporting === 'pdf' ? 'Generating PDF...' : '⬇ PDF'}
          </button>
          <button onClick={handlePrint} disabled={!result || exporting === 'print'}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: '#fff', color: '#005f73', fontWeight: 600,
              fontSize: 14, cursor: !result || exporting ? 'not-allowed' : 'pointer',
              opacity: !result ? 0.5 : 1,
            }}>
            {exporting === 'print' ? 'Opening...' : '🖨 Print / View PDF'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="ddx-grid" style={{
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: 'clamp(8px, 1.5vw, 16px)',
        flex: 1,
      }}>

        {/* Left Panel — Selection */}
        <div className="no-print" style={{
          background: '#fff',
          borderRadius: 12,
          padding: 'clamp(12px, 2vw, 20px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
        }}>
          {/* Patient Info */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#005f73', textTransform: 'uppercase', letterSpacing: 1 }}>Patient Demographics</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input placeholder="Name" value={patientName} onChange={e => setPatientName(e.target.value)}
                style={{ flex: 1, minWidth: 80, padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 13 }} />
              <input placeholder="Age" type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)}
                style={{ width: 60, padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 13 }} />
              <select value={patientGender} onChange={e => setPatientGender(e.target.value)}
                style={{ width: 80, padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 13 }}>
                <option value="">Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Phenotype Search */}
          <div style={{ marginBottom: 12 }}>
            <input placeholder="Search phenotypes..." value={searchPhenotype} onChange={e => setSearchPhenotype(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #dce4e8', fontSize: 13, boxSizing: 'border-box' }} />
          </div>

          {/* Phenotypes */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#005f73', textTransform: 'uppercase', letterSpacing: 1 }}>
              Phenotypes / Syndromes ({selectedPhenotypes.length} selected)
            </h3>
            <div className="phenotype-grid" style={{
              display: 'grid', gridTemplateColumns: '1fr',
              gap: 4, maxHeight: 240, overflowY: 'auto',
            }}>
              {filteredPhenotypes.map(p => {
                const selected = selectedPhenotypes.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePhenotype(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 6, border: selected ? '2px solid #005f73' : '1px solid #e8edf0',
                      background: selected ? '#eef8fa' : '#fff',
                      cursor: 'pointer', fontSize: 12, textAlign: 'left',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: urgencyColor(p.urgency), flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: selected ? 600 : 400 }}>{p.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#7f8c8d' }}>{p.urgency}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contexts */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#005f73', textTransform: 'uppercase', letterSpacing: 1 }}>
              Patient Contexts
            </h3>
            <div className="context-grid" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 4,
            }}>
              {ALL_CONTEXTS.map(ctx => {
                const selected = selectedContexts.includes(ctx.id);
                return (
                  <button key={ctx.id} onClick={() => toggleContext(ctx.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 8px', borderRadius: 6, border: selected ? '1.5px solid #0a9396' : '1px solid #e8edf0',
                      background: selected ? '#e6f7f7' : '#fff',
                      cursor: 'pointer', fontSize: 11, textAlign: 'left',
                    }}>
                    <span>{ctx.icon}</span>
                    <span style={{ fontWeight: selected ? 600 : 400 }}>{ctx.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Red Flags */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#c0392b', textTransform: 'uppercase', letterSpacing: 1 }}>
              ⚑ Red Flags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {RED_FLAG_OPTIONS.map(rf => {
                const selected = selectedRedFlags.includes(rf.id);
                return (
                  <button key={rf.id} onClick={() => toggleRedFlag(rf.id)}
                    style={{
                      padding: '4px 10px', borderRadius: 14, border: selected ? '1.5px solid #c0392b' : '1px solid #f5c6cb',
                      background: selected ? '#fce4e4' : '#fff',
                      cursor: 'pointer', fontSize: 11,
                      color: selected ? '#c0392b' : '#7f8c8d',
                      fontWeight: selected ? 600 : 400,
                    }}>
                    {selected ? '✓ ' : ''}{rf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Narrative Input */}
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#005f73', textTransform: 'uppercase', letterSpacing: 1 }}>
              Documentation Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input placeholder="Associated symptoms (e.g., fever, dyspnea, chest pain)" value={narrativeInput.associated_symptoms || ''}
                onChange={e => setNarrativeInput(prev => ({ ...prev, associated_symptoms: e.target.value }))}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 12 }} />
              <input placeholder="Exam findings (e.g., crackles, wheeze, normal)" value={narrativeInput.exam_findings || ''}
                onChange={e => setNarrativeInput(prev => ({ ...prev, exam_findings: e.target.value }))}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 12 }} />
              <input placeholder="Risk factors (e.g., smoker, TB contact, HIV)" value={narrativeInput.risk_factors || ''}
                onChange={e => setNarrativeInput(prev => ({ ...prev, risk_factors: e.target.value }))}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 12 }} />
              <input placeholder="Initial plan (e.g., CXR, sputum culture, start abx)" value={narrativeInput.initial_plan || ''}
                onChange={e => setNarrativeInput(prev => ({ ...prev, initial_plan: e.target.value }))}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #dce4e8', fontSize: 12 }} />
            </div>
          </div>
        </div>

        {/* Right Panel — Results */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(8px, 1.5vw, 16px)',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 140px)',
        }}>
          {!result ? (
            <div style={{
              background: '#fff', borderRadius: 12, padding: 48,
              textAlign: 'center', flex: 1, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h2 style={{ margin: '0 0 8px', color: '#2c3e50', fontSize: 20 }}>Select Phenotypes to Begin</h2>
              <p style={{ color: '#7f8c8d', fontSize: 14, maxWidth: 400 }}>
                Choose one or more clinical phenotypes from the left panel. The DDx Engine will evaluate {COUGH_COMPREHENSIVE.diseases?.length || 0} diseases across {COUGH_COMPREHENSIVE.mechanisms?.length || 0} pathophysiological mechanisms to generate a ranked differential.
              </p>
            </div>
          ) : (
            <>
              {/* Urgent Banner */}
              {result.urgentAction && (
                <div className="fade-in" style={{
                  background: '#fce4e4', border: '1px solid #e74c3c', borderRadius: 10,
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>🚨</span>
                  <div>
                    <strong style={{ color: '#c0392b', fontSize: 14 }}>URGENT — Red Flags Detected</strong>
                    <p style={{ margin: '2px 0 0', color: '#e74c3c', fontSize: 12 }}>
                      Immediate clinical evaluation required. Some differentials carry high-risk features.
                    </p>
                  </div>
                </div>
              )}

              {/* Differentials Table */}
              <div className="fade-in" style={{
                background: '#fff', borderRadius: 12, padding: 'clamp(12px, 2vw, 20px)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 'clamp(14px, 2vw, 18px)', color: '#2c3e50' }}>
                    Differential Diagnosis
                  </h2>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: categoryColor(result.category), color: '#fff', fontWeight: 600 }}>
                      {result.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: '#7f8c8d' }}>
                      {result.topDifferentials.length} candidates
                    </span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 1.2vw, 13px)' }}>
                    <thead>
                      <tr style={{ background: '#f0f4f8' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#7f8c8d', fontWeight: 600, fontSize: 11 }}>Rank</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#7f8c8d', fontWeight: 600, fontSize: 11 }}>Diagnosis</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#7f8c8d', fontWeight: 600, fontSize: 11 }}>Score</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#7f8c8d', fontWeight: 600, fontSize: 11 }}>Probability</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#7f8c8d', fontWeight: 600, fontSize: 11 }}>Red Flag</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#7f8c8d', fontWeight: 600, fontSize: 11 }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.topDifferentials.map((d, i) => {
                        const disease = COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId);
                        const cat = DISEASE_CATEGORIES[d.diseaseId];
                        return (
                          <tr key={d.diseaseId} style={{
                            borderBottom: '1px solid #f0f4f8',
                            background: d.isRedFlag ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#fafcfe',
                          }}>
                            <td style={{ padding: '10px', fontWeight: 700, color: '#2c3e50', width: 40 }}>{i + 1}</td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: 600, color: '#2c3e50' }}>{disease?.name || d.diseaseId}</div>
                              <div style={{ fontSize: 10, color: '#95a5a6' }}>{disease?.icd10 || ''} {disease?.synonyms?.slice(0, 2).join(', ')}</div>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block', width: 28, height: 28, lineHeight: '28px',
                                borderRadius: '50%', background: d.score >= 4 ? '#e74c3c' : d.score >= 2 ? '#f39c12' : '#95a5a6',
                                color: '#fff', fontWeight: 700, fontSize: 12,
                              }}>{d.score}</span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{ fontSize: 11, color: '#7f8c8d' }}>
                                {d.score >= 4 ? 'High' : d.score >= 2 ? 'Moderate' : 'Low'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              {d.isRedFlag ? <span style={{ color: '#e74c3c', fontWeight: 700 }}>⚠</span> : <span style={{ color: '#bdc3c7' }}>—</span>}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: categoryColor(cat) + '22', color: categoryColor(cat), fontWeight: 600 }}>
                                {cat || 'other'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Investigations */}
              <div className="fade-in" style={{
                background: '#fff', borderRadius: 12, padding: 'clamp(12px, 2vw, 20px)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(14px, 2vw, 18px)', color: '#2c3e50' }}>
                  🧪 Recommended Investigations
                </h2>
                {result.investigationSuggestions.length === 0 ? (
                  <p style={{ color: '#95a5a6', fontSize: 13 }}>No specific investigations suggested for the current selection.</p>
                ) : (
                  <div className="phenotype-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                    {result.investigationSuggestions.map(invId => {
                      const inv = COUGH_COMPREHENSIVE.investigations?.find(i => i.id === invId);
                      const forDiseases = result.topDifferentials
                        .filter(d => COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId)?.investigations?.some(di => di.investigationId === invId))
                        .map(d => COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId)?.name || d.diseaseId);
                      return (
                        <div key={invId} style={{
                          padding: '8px 12px', borderRadius: 8,
                          border: '1px solid #e8edf0', fontSize: 12,
                        }}>
                          <div style={{ fontWeight: 600, color: '#2c3e50' }}>{inv?.name || invId}</div>
                          {forDiseases.length > 0 && (
                            <div style={{ fontSize: 10, color: '#7f8c8d', marginTop: 2 }}>
                              For: {forDiseases.join(', ')}
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: '#95a5a6' }}>{inv?.category} | {inv?.specimen || ''}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Documentation Narrative */}
              <div className="fade-in" style={{
                background: '#fff', borderRadius: 12, padding: 'clamp(12px, 2vw, 20px)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(14px, 2vw, 18px)', color: '#2c3e50' }}>
                  📝 Clinical Documentation Narrative
                </h2>
                <div style={{
                  background: '#f8fafb', borderRadius: 8, padding: 16,
                  fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.7,
                  color: '#2c3e50', whiteSpace: 'pre-wrap',
                  border: '1px solid #e8edf0',
                }}>
                  {narrativeText || 'Complete the documentation details in the left panel to generate a clinical narrative.'}
                </div>
              </div>

              {/* Guidelines */}
              {(() => {
                const seenGuids = new Set<string>();
                const guids: { id: string; title: string; issuingBody: string; year: number }[] = [];
                result.topDifferentials.forEach(d => {
                  const disease = COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId);
                  disease?.guidelines?.forEach(gid => {
                    if (!seenGuids.has(gid)) {
                      seenGuids.add(gid);
                      const g = COUGH_COMPREHENSIVE.guidelines?.find(gl => gl.id === gid);
                      if (g) guids.push({ id: g.id, title: g.title, issuingBody: g.issuingBody, year: g.year });
                    }
                  });
                });
                if (guids.length === 0) return null;
                return (
                  <div className="fade-in" style={{
                    background: '#fff', borderRadius: 12, padding: 'clamp(12px, 2vw, 20px)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(14px, 2vw, 18px)', color: '#2c3e50' }}>
                      📚 Supporting Guidelines
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {guids.map(g => (
                        <span key={g.id} style={{
                          padding: '4px 10px', borderRadius: 14,
                          background: '#eef8fa', color: '#005f73',
                          fontSize: 11, fontWeight: 500,
                        }}>
                          {g.issuingBody} ({g.year})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
