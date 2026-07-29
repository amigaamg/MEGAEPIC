'use client';

import { Shield, BookOpen, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { C, S, rowStyle } from '@/app/operations/_shared/styles';

const sectionTitle = { fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 600, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 } as const;

export default function ConstitutionPage() {
  const laws = [
    { num: 'Law I', text: 'AGOC never alters clinical data. It observes, analyzes, recommends, flags, approves. Never edits patient care.', icon: Shield },
    { num: 'Law II', text: 'AGOC monitors engines, not users. Doctors are not evaluated. Reasoning engines, question engines, documentation engines are.', icon: Cpu },
    { num: 'Law III', text: 'Every engine explains itself. Nothing becomes a black box. Every decision is reconstructable from events.', icon: Search },
    { num: 'Law IV', text: 'Everything is versioned. Questions, protocols, documentation, rules, knowledge, reasoning — all carry version provenance.', icon: Clock },
    { num: 'Law V', text: 'Every improvement is evidence-based. Nothing changes because someone "felt like it."', icon: BarChart3 },
  ];

  const lifeCycle = [
    'Observation', 'Problem Detected', 'Evidence Collected', 'Clinical Review',
    'Rule Proposal', 'Knowledge Validation', 'Simulation Against Test Encounters',
    'Constitution Review', 'Staging', 'Hospital Pilot', 'Global Release', 'Continuous Monitoring',
  ];

  const reviewQuestions = [
    'Does it break Book I?',
    'Does it break reasoning?',
    'Does it violate graph relationships?',
    'Does it affect workflows?',
    'Is it backward compatible?',
    'Does it require knowledge migration?',
    'Does it affect existing hospitals?',
  ];

  return (
    <div style={S.page}>
      <div style={S.h1}><Shield size={20} color={C.sky} /> Constitutional Council</div>

      <div style={S.section}>
        <div style={sectionTitle}><BookOpen size={16} color={C.sky} /> Five Fundamental Laws</div>
        {laws.map(law => (
          <div key={law.num} style={{ background: 'rgba(47, 128, 237, 0.05)', border: '1px solid rgba(47, 128, 237, 0.15)', borderRadius: 12, padding: 'clamp(14px, 1.5vw, 20px)', marginBottom: 16 }}>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 700, color: C.sky, letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 8 }}>{law.num}</div>
            <div style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', color: '#cbd5e1', lineHeight: 1.6 }}>{law.text}</div>
          </div>
        ))}
      </div>

      <div style={S.section}>
        <div style={sectionTitle}><Scale size={16} color={C.amber} /> Constitutional Philosophy</div>
        <div style={{ display: 'flex', gap: 'clamp(8px, 1vw, 12px)', flexWrap: 'wrap' as const, marginBottom: 12 }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 'clamp(10px, 1.2vw, 14px)', flex: '1 1 clamp(180px, 20vw, 220px)' }}>
            <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 4 }}>Knowledge</div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', lineHeight: 1.5 }}>Everything AGOC observes derives from four sources: Knowledge, Facts, Events, Decisions. Never from UI, patients, or databases.</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 'clamp(10px, 1.2vw, 14px)', flex: '1 1 clamp(180px, 20vw, 220px)' }}>
            <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 4 }}>Separation</div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', lineHeight: 1.5 }}>AGOC never alters clinical data. It observes, analyzes, recommends, flags, approves. Never edits patient care directly.</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 'clamp(10px, 1.2vw, 14px)', flex: '1 1 clamp(180px, 20vw, 220px)' }}>
            <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 4 }}>Engine Focus</div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', lineHeight: 1.5 }}>AGOC monitors engines, not users. Doctors are not evaluated — reasoning engines, question engines, and documentation engines are.</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 'clamp(10px, 1.2vw, 14px)', flex: '1 1 clamp(180px, 20vw, 220px)' }}>
            <div style={{ fontSize: 'clamp(9px, 1vw, 10px)', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 4 }}>Versioning</div>
            <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', lineHeight: 1.5 }}>Everything is versioned: questions, protocols, documentation, rules, knowledge, reasoning. Nothing is lost or overwritten.</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 16px)', flexWrap: 'wrap' as const }}>
        <div style={{ ...S.section, flex: '1 1 min(400px, 100%)' }}>
          <div style={sectionTitle}><CheckCircle size={16} color={C.green} /> Improvement Lifecycle</div>
          {lifeCycle.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8' }}>
              {i > 0 && <span style={{ color: C.sky, fontSize: 'clamp(12px, 1.3vw, 14px)', fontWeight: 700 }}>↓</span>}
              <span>{i + 1}. {step}</span>
            </div>
          ))}
        </div>

        <div style={{ ...S.section, flex: '1 1 min(400px, 100%)' }}>
          <div style={sectionTitle}><AlertTriangle size={16} color={C.red} /> Constitutional Review Questions</div>
          <div style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', marginBottom: 12 }}>
            Every proposed change must be reviewed against the constitution. If any question is answered "yes," change is rejected or migrated safely.
          </div>
          <ul style={{ marginTop: 8, padding: 0, listStyle: 'none' as const }}>
            {reviewQuestions.map((q, i) => (
              <li key={i} style={{ padding: '4px 0', fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.amber }}>?</span> {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Cpu(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>; }
function Search(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>; }
function Clock(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function BarChart3(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18M3 20v-4M9 20v-8M15 20V4"/></svg>; }
