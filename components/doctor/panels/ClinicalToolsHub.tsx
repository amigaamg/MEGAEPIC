'use client';

import React, { useState, useMemo } from 'react';

interface ToolDef {
  id: string; name: string; category: string; icon: string;
  description: string; specialty: string[];
  component?: 'calculator' | 'scale' | 'guide' | 'protocol' | 'reference';
}

const ALL_TOOLS: ToolDef[] = [
  { id: 'bmi', name: 'BMI Calculator', category: 'Anthropometrics', icon: '⚖️', description: 'Calculate BMI from height & weight', specialty: ['General Practice','Cardiology','All'], component: 'calculator' },
  { id: 'bp_category', name: 'BP Classification', category: 'Cardiovascular', icon: '❤️', description: 'JNC 8 BP classification & staging', specialty: ['General Practice','Cardiology','Nephrology'], component: 'calculator' },
  { id: 'ascvd', name: 'ASCVD Risk Score', category: 'Cardiovascular', icon: '📊', description: '10-year cardiovascular risk (ACC/AHA)', specialty: ['Cardiology','General Practice','Internal Medicine'], component: 'calculator' },
  { id: 'cha2ds2', name: 'CHA₂DS₂-VASc', category: 'Cardiovascular', icon: '💓', description: 'Stroke risk in atrial fibrillation', specialty: ['Cardiology','Neurology'], component: 'scale' },
  { id: 'has_bled', name: 'HAS-BLED Score', category: 'Cardiovascular', icon: '🩸', description: 'Bleeding risk on anticoagulation', specialty: ['Cardiology'], component: 'scale' },
  { id: 'ecg_interpret', name: 'ECG Interpretation Guide', category: 'Cardiovascular', icon: '📈', description: 'Systematic ECG reading & common patterns', specialty: ['Cardiology','Emergency Medicine','General Practice'], component: 'guide' },
  { id: 'gfr', name: 'eGFR Calculator', category: 'Renal', icon: '🫘', description: 'Estimated GFR (CKD-EPI, MDRD)', specialty: ['Nephrology','General Practice','Internal Medicine'], component: 'calculator' },
  { id: 'ckd_staging', name: 'CKD Staging', category: 'Renal', icon: '🫘', description: 'CKD stage by GFR & albuminuria', specialty: ['Nephrology','General Practice','Internal Medicine'], component: 'protocol' },
  { id: 'nihss', name: 'NIH Stroke Scale', category: 'Neurology', icon: '🧠', description: 'National Institutes of Health Stroke Scale', specialty: ['Neurology','Emergency Medicine'], component: 'scale' },
  { id: 'glasgow', name: 'Glasgow Coma Scale', category: 'Neurology', icon: '🫀', description: 'GCS assessment tool for consciousness', specialty: ['Neurology','Emergency Medicine','Surgery','All'], component: 'scale' },
  { id: 'moca', name: 'MoCA Assessment', category: 'Neurology', icon: '🧩', description: 'Montreal Cognitive Assessment', specialty: ['Neurology','Psychiatry'], component: 'scale' },
  { id: 'phq9', name: 'PHQ-9 Depression', category: 'Mental Health', icon: '😔', description: 'Patient Health Questionnaire for depression', specialty: ['Psychiatry','General Practice','All'], component: 'scale' },
  { id: 'gad7', name: 'GAD-7 Anxiety', category: 'Mental Health', icon: '😰', description: 'Generalized Anxiety Disorder assessment', specialty: ['Psychiatry','General Practice'], component: 'scale' },
  { id: 'pediatric_drug', name: 'Pediatric Drug Dosing', category: 'Pediatrics', icon: '👶', description: 'Weight-based pediatric drug calculator', specialty: ['Pediatrics','General Practice'], component: 'calculator' },
  { id: 'apgar', name: 'Apgar Score', category: 'Pediatrics', icon: '🍼', description: 'Newborn assessment at 1 & 5 minutes', specialty: ['Pediatrics','Obstetrics & Gynecology'], component: 'scale' },
  { id: 'ballard', name: 'Ballard Score', category: 'Pediatrics', icon: '📏', description: 'Newborn gestational age assessment', specialty: ['Pediatrics'], component: 'scale' },
  { id: 'mews', name: 'MEWS Score', category: 'Emergency', icon: '🚨', description: 'Modified Early Warning Score for deterioration', specialty: ['Emergency Medicine','Internal Medicine','Surgery','All'], component: 'scale' },
  { id: 'qsofa', name: 'qSOFA Score', category: 'Emergency', icon: '🩺', description: 'Quick Sepsis Related Organ Failure Assessment', specialty: ['Emergency Medicine','Internal Medicine','All'], component: 'scale' },
  { id: 'curb65', name: 'CURB-65 Pneumonia', category: 'Respiratory', icon: '🫁', description: 'Pneumonia severity score', specialty: ['General Practice','Internal Medicine','Emergency Medicine'], component: 'scale' },
  { id: 'asthma_control', name: 'Asthma Control Test', category: 'Respiratory', icon: '💨', description: 'Asthma control assessment (ACT)', specialty: ['General Practice','Pediatrics','Internal Medicine'], component: 'scale' },
  { id: 'wells_dvt', name: 'Wells DVT Criteria', category: 'Vascular', icon: '🩸', description: 'Deep vein thrombosis clinical probability', specialty: ['General Practice','Emergency Medicine','Cardiology'], component: 'scale' },
  { id: 'wells_pe', name: 'Wells PE Criteria', category: 'Vascular', icon: '🫁', description: 'Pulmonary embolism clinical probability', specialty: ['Emergency Medicine','Cardiology','Internal Medicine'], component: 'scale' },
  { id: 'drug_calc', name: 'General Drug Calculator', category: 'Pharmacy', icon: '💊', description: 'Dose, dilution & infusion rate calculator', specialty: ['All'], component: 'calculator' },
  { id: 'iv_fluid', name: 'IV Fluid Prescribing', category: 'Pharmacy', icon: '💧', description: 'IV fluid choice & rate (NICE guidelines)', specialty: ['All'], component: 'protocol' },
  { id: 'dka_mgmt', name: 'DKA Management Protocol', category: 'Endocrinology', icon: '🩸', description: 'Diabetic ketoacidosis management protocol', specialty: ['Internal Medicine','Endocrinology','Pediatrics','Emergency Medicine'], component: 'protocol' },
  { id: 'htn_guide', name: 'Hypertension Guidelines', category: 'Cardiovascular', icon: '📋', description: 'HTN management (KDIGO/ISC/ACC-AHA)', specialty: ['Cardiology','General Practice','Nephrology'], component: 'guide' },
  { id: 'diabetes_mgmt', name: 'Diabetes Management', category: 'Endocrinology', icon: '🍬', description: 'Type 2 diabetes management algorithm', specialty: ['General Practice','Internal Medicine','Endocrinology'], component: 'protocol' },
  { id: 'abx_guide', name: 'Antibiotic Guide', category: 'Infectious Disease', icon: '🦠', description: 'Empiric antibiotic therapy by infection site', specialty: ['All'], component: 'guide' },
  { id: 'pain_mgmt', name: 'Pain Management Ladder', category: 'General', icon: '💉', description: 'WHO analgesic ladder & pain management', specialty: ['All'], component: 'protocol' },
  { id: 'triage_severity', name: 'Triage Severity Guide', category: 'Emergency', icon: '🚦', description: 'Emergency triage severity categorization', specialty: ['Emergency Medicine','All'], component: 'protocol' },

  // ── New Comprehensive Clinical Tools (with full interactive panels) ──
  { id: 'bp_trend', name: '📈 BP Trend Chart', category: 'Cardiovascular', icon: '📈', description: 'Track blood pressure over time with ESC/ESH classification & trend analysis', specialty: ['Cardiology','General Practice','Nephrology','All'], component: 'calculator' },
  { id: 'cv_risk_framingham', name: '🧮 CV Risk (Framingham)', category: 'Cardiovascular', icon: '🧮', description: '10-year cardiovascular risk assessment with Framingham equation', specialty: ['Cardiology','General Practice','Internal Medicine','All'], component: 'calculator' },
  { id: 'cha2ds2_vasc', name: '🧮 CHA₂DS₂-VASc Score', category: 'Cardiovascular', icon: '🧮', description: 'Stroke risk in atrial fibrillation with management recommendations', specialty: ['Cardiology','Neurology','All'], component: 'calculator' },
  { id: 'antihypertensive_protocol', name: '📋 Antihypertensive Protocol', category: 'Cardiovascular', icon: '📋', description: 'ESC/ESH 2023 stepwise medication protocol by hypertension stage', specialty: ['Cardiology','General Practice','Nephrology','All'], component: 'protocol' },
  { id: 'bp_target', name: '🎯 BP Target Achievement', category: 'Cardiovascular', icon: '🎯', description: 'Monitor bp goal attainment with configurable targets & trends', specialty: ['Cardiology','General Practice','Nephrology','All'], component: 'calculator' },
  { id: 'med_adherence', name: '💊 Medication Adherence', category: 'General', icon: '💊', description: 'Track medication compliance, identify barriers, and log doses', specialty: ['All'], component: 'calculator' },
  { id: 'renal_panel', name: '🧪 Order Renal Function Panel', category: 'Renal', icon: '🧪', description: 'Creatinine, eGFR, electrolytes with drug dose adjustment guide', specialty: ['Cardiology','Nephrology','General Practice','Internal Medicine','All'], component: 'calculator' },
  { id: 'ecg_echo', name: '🩻 Request ECG / Echo', category: 'Cardiovascular', icon: '🩻', description: 'Order cardiac imaging with HTN-specific interpretation guide', specialty: ['Cardiology','General Practice','All'], component: 'guide' },
  { id: 'home_bp_guide', name: '🏠 Home BP Monitoring Guide', category: 'Cardiovascular', icon: '🏠', description: 'Patient education for accurate home BP measurement technique', specialty: ['All'], component: 'guide' },
  { id: 'htn_staging', name: '📊 HTN Severity Staging', category: 'Cardiovascular', icon: '📊', description: 'ESC/ESH 2023 hypertension staging by BP level', specialty: ['Cardiology','General Practice','Nephrology','All'], component: 'calculator' },
  { id: 'hba1c_trend', name: '📈 HbA1c Trend', category: 'Endocrinology', icon: '📈', description: 'Track hba1c over time with diabetes control status & medication guide', specialty: ['Endocrinology','General Practice','Internal Medicine','All'], component: 'calculator' },
  { id: 'glucose_log', name: '🩸 Glucose Log', category: 'Endocrinology', icon: '🩸', description: 'Daily blood glucose tracking with meal context and trend analysis', specialty: ['Endocrinology','General Practice','All'], component: 'calculator' },
  { id: 'insulin_dose', name: '💉 Insulin Dose Tracker', category: 'Endocrinology', icon: '💉', description: 'Insulin titration & dosing with type-specific pharmacodynamics', specialty: ['Endocrinology','General Practice','All'], component: 'calculator' },
  { id: 'foot_exam', name: '🦶 Foot Examination Score', category: 'Endocrinology', icon: '🦶', description: 'Diabetic foot risk assessment (SINBAD/IDSA guideline)', specialty: ['Endocrinology','General Practice','Podiatry','All'], component: 'calculator' },
  { id: 'retinopathy', name: '👁️ Retinopathy Status', category: 'Endocrinology', icon: '👁️', description: 'Diabetic retinopathy staging (ETDRS/AAO) with screening schedule', specialty: ['Endocrinology','Ophthalmology','General Practice','All'], component: 'calculator' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Cardiovascular': '❤️', 'Neurology': '🧠', 'Respiratory': '🫁', 'Renal': '🫘',
  'Emergency': '🚨', 'Pediatrics': '👶', 'Mental Health': '🧘', 'Endocrinology': '🍬',
  'Pharmacy': '💊', 'Infectious Disease': '🦠', 'Vascular': '🩸', 'General': '🩺',
  'Anthropometrics': '📏',
};

interface Props {
  doctorSpecialty: string;
  onLaunchTool: (toolId: string) => void;
}

export default function ClinicalToolsHub({ doctorSpecialty, onLaunchTool }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

  const filtered = useMemo(() => {
    const bySpecialty = ALL_TOOLS.filter(t => t.specialty.includes('All') || t.specialty.includes(doctorSpecialty));
    const searched = search
      ? bySpecialty.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
        )
      : bySpecialty;
    const categorized = activeCategory === 'all' ? searched : searched.filter(t => t.category === activeCategory);
    return categorized;
  }, [doctorSpecialty, search, activeCategory]);

  const categories = useMemo(() => {
    return [...new Set(ALL_TOOLS.filter(t => t.specialty.includes('All') || t.specialty.includes(doctorSpecialty)).map(t => t.category))];
  }, [doctorSpecialty]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
        <input className="search-inp" style={{ paddingLeft: 40, width: '100%' }}
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tools by name, category, condition…" />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
          🧰 All Tools
        </button>
        {categories.map(cat => (
          <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {CATEGORY_ICONS[cat] || '📋'} {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="empty-sm" style={{ gridColumn: '1 / -1' }}>
            <p>No tools match your search.</p>
          </div>
        ) : filtered.map(tool => (
          <div key={tool.id} className="tool-card" onClick={() => onLaunchTool(tool.id)} style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
            background: 'var(--bg)', border: '1px solid var(--border)',
            transition: 'all .15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 28 }}>{tool.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12 }}>{tool.name}</div>
                <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>{tool.category}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{tool.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
