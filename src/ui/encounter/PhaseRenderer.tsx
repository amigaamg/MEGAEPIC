import { PresentingComplaintPhase, HpiPhase, AdaptiveHpiPhase, PmhPhase, DdxPhase, TreatmentPhase } from './phases';
import type { EncounterState } from './useEncounterState';

interface PhaseRendererProps {
  phaseId: string;
  store: EncounterState;
  departmentColor: string;
}

export function PhaseRenderer({ phaseId, store, departmentColor }: PhaseRendererProps) {
  switch (phaseId) {
    case 'presenting_complaint':
      return <PresentingComplaintPhase form={store.form} setField={store.setField} toggleArray={store.toggleArray} addEvent={store.addEvent} addInsight={store.addInsight} deptColor={departmentColor} />;
    case 'hpi':
      return <AdaptiveHpiPhase form={store.form} setField={store.setField} addEvent={store.addEvent} addInsight={store.addInsight} deptColor={departmentColor} />;
    case 'pmh':
      return <PmhPhase form={store.form} setField={store.setField} addEvent={store.addEvent} deptColor={departmentColor} />;
    case 'ddx':
      return <DdxPhase form={store.form} setField={store.setField} addInsight={store.addInsight} deptColor={departmentColor} />;
    case 'treatment':
      return <TreatmentPhase form={store.form} setField={store.setField} addEvent={store.addEvent} deptColor={departmentColor} />;
    default:
      return <DefaultPhase phaseId={phaseId} deptColor={departmentColor} />;
  }
}

function DefaultPhase({ phaseId, deptColor }: { phaseId: string; deptColor: string }) {
  const labels: Record<string, { icon: string; label: string; desc: string }> = {
    registration:      { icon: '📋', label: 'Registration', desc: 'Patient identification and registration' },
    triage:            { icon: '🚦', label: 'Triage', desc: 'Vital signs and acuity assessment (PhaseRenderer placeholders active)' },
    abcde:             { icon: '🔍', label: 'ABCDE Assessment', desc: 'Systematic emergency assessment' },
    systems_review:    { icon: '🔬', label: 'Review of Systems', desc: 'Systematic review of all body systems' },
    drug_allergy:      { icon: '💊', label: 'Drug & Allergy', desc: 'Current medications and allergies' },
    social_history:    { icon: '👨‍👩‍👧', label: 'Social History', desc: 'Social context, habits, support' },
    examination:       { icon: '🩺', label: 'Examination', desc: 'Physical examination findings' },
    scores:            { icon: '📊', label: 'Bedside Scores', desc: 'Clinical scoring systems and risk calculators' },
    investigations:    { icon: '🧪', label: 'Investigations', desc: 'Lab tests, results, and interpretations' },
    imaging:           { icon: '📡', label: 'Imaging', desc: 'Radiology and imaging studies' },
    procedures:        { icon: '🔧', label: 'Procedures', desc: 'Bedside procedures and interventions' },
    progress:          { icon: '📄', label: 'Progress Notes', desc: 'Ongoing clinical documentation' },
    team_comm:         { icon: '👥', label: 'Team Communication', desc: 'MDT discussions, handover, referrals' },
    disposition:       { icon: '🚪', label: 'Disposition', desc: 'Discharge, transfer, or admission decision' },
    follow_up:         { icon: '📅', label: 'Follow-up Plan', desc: 'Review schedule and patient instructions' },
    audit:             { icon: '📈', label: 'Analytics & Audit', desc: 'Quality metrics and clinical audit' },
  };
  const info = labels[phaseId] || { icon: '📄', label: phaseId.replace(/_/g, ' '), desc: 'Clinical workspace for this phase' };
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>{info.icon}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>{info.label}</div>
      <div style={{ fontSize: '.875rem', color: '#64748B', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>{info.desc}</div>
      <div style={{ marginTop: 24, padding: '12px 20px', background: `${deptColor}10`, border: `1px solid ${deptColor}20`, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.8125rem', color: '#94A3B8' }}>
        <span>⚡</span> Phase content modules being deployed
      </div>
    </div>
  );
}
