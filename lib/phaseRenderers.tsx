import React, { useMemo, useState } from 'react';
import type { PhaseContent, DepartmentClinicalContent } from './departmentContent';

export interface PhaseRendererProps {
  phase: PhaseContent;
  dept: DepartmentClinicalContent;
  data: Record<string, any>;
  onDataChange: (key: string, value: any) => void;
  theme: any;
}

export type PhaseRenderer = React.ComponentType<PhaseRendererProps>;

const STYLES = (t: any) => ({
  section: { marginBottom: 24 } as React.CSSProperties,
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.border || 'rgba(255,255,255,.06)'}` },
  field: { marginBottom: 12 } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 5 } as React.CSSProperties,
  input: { width: '100%', boxSizing: 'border-box' as const, padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border || 'rgba(255,255,255,.06)'}`, background: t.surface || 'rgba(255,255,255,.02)', color: t.text || '#E2E8F0', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  textarea: { width: '100%', boxSizing: 'border-box' as const, padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border || 'rgba(255,255,255,.06)'}`, background: t.surface || 'rgba(255,255,255,.02)', color: t.text || '#E2E8F0', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' as const } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 } as React.CSSProperties,
  pill: (sel: boolean) => ({ padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1px solid ${sel ? (t.accent || '#22d3ee') : t.border || 'rgba(255,255,255,.06)'}`, background: sel ? 'rgba(34,211,238,.12)' : 'transparent', color: sel ? '#22d3ee' : '#64748B', fontWeight: sel ? 600 : 400, transition: 'all 0.12s', fontFamily: 'Inter, sans-serif' } as React.CSSProperties),
  pillsContainer: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 } as React.CSSProperties,
  card: { background: t.surface || 'rgba(255,255,255,.02)', border: `1px solid ${t.border || 'rgba(255,255,255,.06)'}`, borderRadius: 12, padding: 24 } as React.CSSProperties,
  phaseHeader: { marginBottom: 20 } as React.CSSProperties,
  phaseTitle: { fontSize: 20, fontWeight: 700, margin: 0, color: t.text || '#E2E8F0', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  phaseSub: { fontSize: 13, color: '#64748B', margin: '6px 0 0', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  pillBtn: (sel: boolean, c?: string) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8, border: `1px solid ${sel ? ((c||t.accent)||'#22d3ee') : t.border || 'rgba(255,255,255,.06)'}`, background: sel ? 'rgba(34,211,238,.12)' : 'transparent', color: sel ? '#22d3ee' : '#64748B', fontSize: 13, cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap' as const, fontFamily: 'Inter, sans-serif' } as React.CSSProperties),
  protoBox: { marginBottom: 12, padding: '10px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 8, border: `1px solid ${t.border || 'rgba(255,255,255,.06)'}` } as React.CSSProperties,
  protoName: { fontWeight: 700, fontSize: 12, color: t.text || '#E2E8F0', marginBottom: 6 } as React.CSSProperties,
  step: { fontSize: 11, color: '#94A3B8', padding: '2px 0', paddingLeft: 14, position: 'relative' as const } as React.CSSProperties,
  stepDot: { position: 'absolute' as const, left: 0, color: '#22d3ee' } as React.CSSProperties,
  diffItem: (sel: boolean) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', transition: 'all 0.12s', background: sel ? 'rgba(34,211,238,.08)' : 'transparent', color: sel ? '#22d3ee' : '#94A3B8', border: 'none', fontFamily: 'Inter, sans-serif' } as React.CSSProperties),
});

function GenericInput({ value, onChange, placeholder, type }: any) {
  const s = useStyles();
  return <input style={{...s.input}} type={type||'text'} value={value||''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />;
}

function GenericTextarea({ value, onChange, placeholder }: any) {
  const s = useStyles();
  return <textarea style={{...s.textarea}} value={value||''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />;
}

function useStyles() {
  const [t] = useState(() => ({ border: 'rgba(255,255,255,.06)', surface: 'rgba(255,255,255,.02)', text: '#E2E8F0', accent: '#22d3ee' }));
  return useMemo(() => STYLES(t), [t]);
}

function BoolToggle({ label, value, onChange, warn }: { label: string; value: boolean; onChange: (v: boolean) => void; warn?: boolean }) {
  const s = useStyles();
  return <button onClick={()=>onChange(!value)} style={s.pillBtn(value, warn ? '#ef4444' : undefined)}>
    <span style={{width:15,height:15,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',border:`1.5px solid ${value?'#22d3ee':'rgba(255,255,255,.2)'}`,background:value?'#22d3ee':'transparent',fontSize:9,color:'white',fontWeight:700}}>{value?'✓':''}</span>
    {label}
  </button>;
}

function Pills({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  const s = useStyles();
  return <div style={s.pillsContainer}>
    {options.map(o => <button key={o} onClick={()=>onChange(o)} style={s.pill(value===o)}>{o}</button>)}
  </div>;
}

function renderProtocols(protocols: { name: string; steps: string[] }[]) {
  const s = useStyles();
  return <div>
    {(protocols||[]).map(p => <div key={p.name} style={s.protoBox}>
      <div style={s.protoName}>{p.name}</div>
      {p.steps.map((step,i) => <div key={i} style={s.step}><span style={s.stepDot}>•</span>{step}</div>)}
    </div>)}
  </div>;
}

function renderDifferentials(items: string[], selected: string[], onToggle: (item: string) => void) {
  const s = useStyles();
  return <div>
    {(items||[]).map(d => {
      const sel = selected.includes(d);
      return <button key={d} onClick={()=>onToggle(d)} style={s.diffItem(sel)}>
        <span style={{width:16,height:16,borderRadius:3,border:`1px solid ${sel?'#22d3ee':'rgba(255,255,255,.2)'}`,background:sel?'#22d3ee':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',flexShrink:0}}>{sel?'✓':''}</span>
        {d}
      </button>;
    })}
  </div>;
}

function renderInvestigations(items: string[], selected: string[], onToggle: (item: string) => void) {
  return renderDifferentials(items, selected, onToggle);
}

const GenericBaseRenderer: PhaseRenderer = ({ phase, dept, data, onDataChange }) => {
  const s = useStyles();
  return <div>
    <div style={s.phaseHeader}>
      <h2 style={s.phaseTitle}>{phase.icon} {phase.label}</h2>
      <p style={s.phaseSub}>{phase.desc}</p>
    </div>
    <div style={s.card}>
      {phase.questions && <div style={s.section}>
        <div style={s.sectionTitle}>Clinical Data</div>
        {phase.questions.map(q => {
          if (q.type === 'text') return <div key={q.key} style={s.field}>
            <div style={s.label}>{q.label}</div>
            <GenericInput value={data[q.key]} onChange={v=>onDataChange(q.key,v)} placeholder={`Enter ${q.label.toLowerCase()}`} />
          </div>;
          if (q.type === 'boolean') return <div key={q.key} style={s.field}>
            <BoolToggle label={q.label} value={!!data[q.key]} onChange={v=>onDataChange(q.key,v)} />
          </div>;
          if (q.type === 'select' && q.options) return <div key={q.key} style={s.field}>
            <div style={s.label}>{q.label}</div>
            <Pills options={q.options} value={data[q.key]} onChange={v=>onDataChange(q.key,v)} />
          </div>;
          if (q.type === 'multi' && q.options) return <div key={q.key} style={s.field}><div style={s.label}>{q.label} (select all that apply)</div>
            <div style={s.pillsContainer}>{(q.options||[]).map(o => {
              const arr: string[] = data[q.key]||[];
              const sel = arr.includes(o);
              return <button key={o} onClick={()=>onDataChange(q.key, sel ? arr.filter((x:string)=>x!==o) : [...arr,o])} style={s.pill(sel)}>{o}</button>;
            })}</div>
          </div>;
          return null;
        })}
      </div>}
      {phase.protocols && phase.protocols.length > 0 && <div style={s.section}>
        <div style={s.sectionTitle}>Protocols</div>
        {renderProtocols(phase.protocols)}
      </div>}
      <div style={s.section}>
        <div style={s.sectionTitle}>Clinical Notes</div>
        <GenericTextarea value={data._notes} onChange={v=>onDataChange('_notes',v)} placeholder={`Observations for ${phase.label.toLowerCase()}...`} />
      </div>
    </div>
  </div>;
};

const InvestigationsRenderer: PhaseRenderer = ({ phase, dept, data, onDataChange }) => {
  const s = useStyles();
  const invSelected: string[] = data._selectedInvestigations || [];
  return <div>
    <div style={s.phaseHeader}>
      <h2 style={s.phaseTitle}>{phase.icon} {phase.label}</h2>
      <p style={s.phaseSub}>{phase.desc}</p>
    </div>
    <div style={s.card}>
      <div style={s.section}>
        <div style={s.sectionTitle}>Key Investigations</div>
        {renderInvestigations(dept.keyInvestigations, invSelected, (item) => onDataChange('_selectedInvestigations', invSelected.includes(item) ? invSelected.filter((x:string)=>x!==item) : [...invSelected, item]))}
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Scoring Systems</div>
        {dept.scoringSystems.map(ss => <div key={ss.name} style={{...s.protoBox, background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.2)'}}>
          <div style={{fontWeight:700,fontSize:12,color:'#818cf8',marginBottom:4}}>{ss.name}</div>
          <div style={{fontSize:11,color:'#94A3B8'}}>{ss.calc}</div>
        </div>)}
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Clinical Notes</div>
        <GenericTextarea value={data._notes} onChange={v=>onDataChange('_notes',v)} placeholder='Investigation results and interpretation...' />
      </div>
    </div>
  </div>;
};

const DifferentialsRenderer: PhaseRenderer = ({ phase, dept, data, onDataChange }) => {
  const s = useStyles();
  const diffSelected: string[] = data._selectedDifferentials || [];
  return <div>
    <div style={s.phaseHeader}>
      <h2 style={s.phaseTitle}>{phase.icon} {phase.label}</h2>
      <p style={s.phaseSub}>{phase.desc}</p>
    </div>
    <div style={s.card}>
      <div style={s.section}>
        <div style={s.sectionTitle}>Common Differentials</div>
        <div style={{fontSize:11,color:'#64748B',marginBottom:8}}>Select the most likely differentials based on clinical assessment</div>
        {renderDifferentials(dept.commonDifferentials, diffSelected, (item) => onDataChange('_selectedDifferentials', diffSelected.includes(item) ? diffSelected.filter((x:string)=>x!==item) : [...diffSelected, item]))}
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Clinical Notes</div>
        <GenericTextarea value={data._notes} onChange={v=>onDataChange('_notes',v)} placeholder='Differential justification and reasoning...' />
      </div>
    </div>
  </div>;
};

const TreatmentRenderer: PhaseRenderer = ({ phase, dept, data, onDataChange }) => {
  const s = useStyles();
  return <div>
    <div style={s.phaseHeader}>
      <h2 style={s.phaseTitle}>{phase.icon} {phase.label}</h2>
      <p style={s.phaseSub}>{phase.desc}</p>
    </div>
    <div style={s.card}>
      <div style={s.section}>
        <div style={s.sectionTitle}>Protocol References</div>
        {renderProtocols(dept.protocolReferences)}
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Prescribed Medications</div>
        <GenericTextarea value={data._medications} onChange={v=>onDataChange('_medications',v)} placeholder='Medication name, dose, route, frequency...' />
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Treatment Notes</div>
        <GenericTextarea value={data._notes} onChange={v=>onDataChange('_notes',v)} placeholder='Treatment rationale, monitoring plan...' />
      </div>
    </div>
  </div>;
};

const PlanRenderer: PhaseRenderer = ({ phase, dept, data, onDataChange }) => {
  const s = useStyles();
  const admissionStatus = data._admission || '';
  return <div>
    <div style={s.phaseHeader}>
      <h2 style={s.phaseTitle}>{phase.icon} {phase.label}</h2>
      <p style={s.phaseSub}>{phase.desc}</p>
    </div>
    <div style={s.card}>
      <div style={s.section}>
        <div style={s.sectionTitle}>Disposition</div>
        <Pills options={['Discharge Home', 'Admit to Ward', 'ICU Admission', 'Transfer Out', 'Observe in ED']} value={admissionStatus} onChange={v=>onDataChange('_admission',v)} />
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Follow-up Plan</div>
        <GenericTextarea value={data._followUp} onChange={v=>onDataChange('_followUp',v)} placeholder='Follow-up interval, specialty referral, pending results...' />
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Summary</div>
        <GenericTextarea value={data._summary} onChange={v=>onDataChange('_summary',v)} placeholder='Clinical summary and key action items...' />
      </div>
    </div>
  </div>;
};

const VitalsRenderer: PhaseRenderer = ({ phase, dept, data, onDataChange }) => {
  const s = useStyles();
  const warnFn = (val: number, low: number, high: number, label: string) => val < low ? `Low ${label}` : val > high ? `High ${label}` : null;
  return <div>
    <div style={s.phaseHeader}>
      <h2 style={s.phaseTitle}>{phase.icon} {phase.label}</h2>
      <p style={s.phaseSub}>{phase.desc}</p>
    </div>
    <div style={s.card}>
      <div style={s.section}>
        <div style={s.sectionTitle}>Vital Signs</div>
        <div style={s.grid}>
          {[{key:'hr',label:'Heart Rate',unit:'bpm',low:40,high:120},{key:'bpSystolic',label:'Systolic BP',unit:'mmHg',low:90,high:180},{key:'bpDiastolic',label:'Diastolic BP',unit:'mmHg',low:60,high:110},{key:'rr',label:'Respiratory Rate',unit:'/min',low:10,high:30},{key:'spo2',label:'SpO2',unit:'%',low:92,high:100},{key:'temp',label:'Temperature',unit:'°C',low:36,high:39}].map(v => {
            const val = parseFloat(data[v.key]);
            const warn = val ? warnFn(val, v.low, v.high, v.label) : null;
            return <div key={v.key} style={s.field}>
              <div style={s.label}>{v.label} <span style={{fontWeight:400,color:'#475569'}}>({v.unit})</span></div>
              <input style={{...s.input, borderColor: warn ? '#f59e0b' : (s.input.border as string)}} type='number' value={data[v.key]||''} onChange={e=>onDataChange(v.key,e.target.value)} />
              {warn && <div style={{fontSize:11,color:'#f59e0b',marginTop:3}}>⚠ {warn}</div>}
            </div>;
          })}
        </div>
      </div>
      <div style={s.section}>
        <div style={s.sectionTitle}>Physical Exam Findings</div>
        <GenericTextarea value={data._examFindings} onChange={v=>onDataChange('_examFindings',v)} placeholder='Relevant findings on examination...' />
      </div>
    </div>
  </div>;
};

const DefaultRenderer: PhaseRenderer = GenericBaseRenderer;

export function getPhaseRenderer(phaseId: string, deptKey: string): PhaseRenderer {
  const specialRenderers: Record<string, Record<string, PhaseRenderer>> = {
    CARD: {
      ecg: GenericBaseRenderer,
      scores: GenericBaseRenderer,
      investigations: InvestigationsRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    IM: {
      investigations: InvestigationsRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    RESP: {
      abg: GenericBaseRenderer,
      imaging: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    RENAL: {
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    NEURO: {
      imaging: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    GI: {
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    OB: {
      monitoring: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    PSYCH: {
      mse: GenericBaseRenderer,
      risk: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    SURG: {
      imaging: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    ORTHO: {
      imaging: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    DERM: {
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    HAEM: {
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    ONCO: {
      staging: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      treatment: TreatmentRenderer,
      plan: PlanRenderer,
    },
    PAED: {
      biodata: GenericBaseRenderer,
      complaints: GenericBaseRenderer,
      hpi: GenericBaseRenderer,
      pmh: GenericBaseRenderer,
      birth: GenericBaseRenderer,
      development: GenericBaseRenderer,
      immunization: GenericBaseRenderer,
      nutrition: GenericBaseRenderer,
      family: GenericBaseRenderer,
      vitals: VitalsRenderer,
      ddx: DifferentialsRenderer,
      management: TreatmentRenderer,
      plan: PlanRenderer,
    },
  };
  if (specialRenderers[deptKey]?.[phaseId]) return specialRenderers[deptKey][phaseId];
  if (phaseId === 'vitals') return VitalsRenderer;
  if (phaseId === 'ddx') return DifferentialsRenderer;
  if (phaseId === 'treatment' || phaseId === 'management') return TreatmentRenderer;
  if (phaseId === 'plan') return PlanRenderer;
  if (phaseId === 'investigations') return InvestigationsRenderer;
  return GenericBaseRenderer;
}

export { GenericBaseRenderer, InvestigationsRenderer, DifferentialsRenderer, TreatmentRenderer, PlanRenderer, VitalsRenderer, renderProtocols, renderDifferentials, renderInvestigations };
