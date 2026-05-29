'use client';

export interface ClinicalToolDef {
  id: string;
  name: string;
  icon: string;
  category: 'cardiovascular' | 'metabolic' | 'respiratory' | 'general' | 'assessment' | 'protocol' | 'education' | 'order';
  description: string;
  component: 'tracker' | 'calculator' | 'modal' | 'panel' | 'assessment' | 'protocol' | 'education' | 'order';
  color: string;
  diseases: string[];
  badges?: { label: string; color: string }[];
}

export interface DemoPatient {
  name: string;
  age: number;
  sex: 'Male' | 'Female';
  conditions: string[];
}

export const DEMO_PATIENT: DemoPatient = {
  name: 'Demo Patient',
  age: 55,
  sex: 'Male',
  conditions: ['Hypertension', 'Type 2 Diabetes', 'Dyslipidaemia'],
};

export const TOOLS_REGISTRY: ClinicalToolDef[] = [
  { id: 'bp_trend', name: 'BP Trend Chart', icon: '📈', category: 'cardiovascular', description: 'Track blood pressure over time with ESC/ESH classification', component: 'tracker', color: '#dc2626', diseases: ['Hypertension', 'Cardiology'] },
  { id: 'cv_risk_framingham', name: 'CV Risk (Framingham)', icon: '🧮', category: 'cardiovascular', description: '10-year cardiovascular risk assessment (Framingham)', component: 'calculator', color: '#7c3aed', diseases: ['Hypertension', 'Cardiology', 'DM'] },
  { id: 'cha2ds2_vasc', name: 'CHA₂DS₂-VASc Score', icon: '🧮', category: 'cardiovascular', description: 'Stroke risk in atrial fibrillation', component: 'calculator', color: '#0891b2', diseases: ['Cardiology', 'AF'] },
  { id: 'antihypertensive_protocol', name: 'Antihypertensive Protocol', icon: '📋', category: 'protocol', description: 'Stepwise medication protocol by ESC/ESH stage', component: 'protocol', color: '#0aaa76', diseases: ['Hypertension'] },
  { id: 'bp_target', name: 'BP Target Achievement', icon: '🎯', category: 'cardiovascular', description: 'Monitor if patient is at goal (<130/80)', component: 'tracker', color: '#f97316', diseases: ['Hypertension'] },
  { id: 'med_adherence', name: 'Medication Adherence', icon: '💊', category: 'general', description: 'Track medication compliance and identify barriers', component: 'tracker', color: '#6366f1', diseases: ['All'] },
  { id: 'renal_panel', name: 'Order Renal Function Panel', icon: '🧪', category: 'order', description: 'Creatinine, eGFR, electrolytes panel', component: 'order', color: '#059669', diseases: ['Hypertension', 'CKD', 'DM', 'HF'] },
  { id: 'ecg_echo', name: 'Request ECG / Echo', icon: '🩻', category: 'order', description: 'Cardiac imaging & rhythm strip', component: 'order', color: '#e11d48', diseases: ['Cardiology', 'HTN', 'HF', 'AF'] },
  { id: 'home_bp_guide', name: 'Home BP Monitoring Guide', icon: '🏠', category: 'education', description: 'Teach patient proper home BP monitoring technique', component: 'education', color: '#2563eb', diseases: ['Hypertension'] },
  { id: 'htn_staging', name: 'HTN Severity Staging', icon: '📊', category: 'assessment', description: 'Stage HTN by BP level per ESC/ESH 2023', component: 'assessment', color: '#dc2626', diseases: ['Hypertension'] },
  { id: 'hba1c_trend', name: 'HbA1c Trend', icon: '📈', category: 'metabolic', description: 'Track HbA1c over time with diabetes control status', component: 'tracker', color: '#7c3aed', diseases: ['Diabetes', 'Endocrinology'] },
  { id: 'glucose_log', name: 'Glucose Log', icon: '🩸', category: 'metabolic', description: 'Daily blood glucose readings with trend analysis', component: 'tracker', color: '#d97706', diseases: ['Diabetes'] },
  { id: 'insulin_dose', name: 'Insulin Dose Tracker', icon: '💉', category: 'metabolic', description: 'Insulin titration & dosing calculator', component: 'tracker', color: '#0891b2', diseases: ['Diabetes', 'Endocrinology'] },
  { id: 'foot_exam', name: 'Foot Examination Score', icon: '🦶', category: 'assessment', description: 'Diabetic foot risk assessment (SINBAD/IDSA)', component: 'assessment', color: '#059669', diseases: ['Diabetes', 'Podiatry'] },
  { id: 'retinopathy', name: 'Retinopathy Status', icon: '👁️', category: 'assessment', description: 'Diabetic retinopathy staging and screening tracker', component: 'assessment', color: '#6366f1', diseases: ['Diabetes', 'Ophthalmology'] },
];

export function getToolDef(id: string): ClinicalToolDef | undefined {
  return TOOLS_REGISTRY.find(t => t.id === id);
}

export const fmtDate = (d: Date) => d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtTime = (d: Date) => d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
export const fmtAgo = (d: Date) => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return fmtDate(d);
};
