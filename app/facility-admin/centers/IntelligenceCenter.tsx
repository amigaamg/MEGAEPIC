'use client';

import { useState } from 'react';
import {
  AlertTriangle, ArrowDown, ArrowUp, BadgeCheck, BookOpen, Brain,
  CheckCircle2, ChevronDown, Clock, Database, Eye, FlaskConical, GitBranch,
  GraduationCap, HeartPulse, LineChart, Lock, Microscope, ShieldAlert,
  ShieldCheck, Sparkles, Stethoscope, Timer, TrendingUp, Zap,
} from 'lucide-react';
import { FacilityAdministrationEngine, type FacilityAdminModel, type ClinicalIntelligenceSnapshot } from '@/lib/amexan/facility';
import { C, Card, NumberFields } from '../ui';

// Center 15 — Clinical Intelligence Observatory. The administrator OBSERVES
// Clinical Intelligence; it never overrides contextual reasoning (constitutionally
// preserved, FACILITY_ADMIN_FORBIDDEN → override_clinical_intelligence).
//
// This is the "heart" of AMEXAN: a continuous, evidence-based observatory that
// answers "could this patient have been managed even better?" without ever
// interrupting care. Numbers below describe observed clinical activity and
// behaviour; they are never a substitute for licensed clinical judgement.

export function IntelligenceCenter({ model, onPatch }: { model: FacilityAdminModel; onPatch: (patch: any) => void }) {
  const snaps = FacilityAdministrationEngine.getClinicalIntelligence(model);
  const [explain, setExplain] = useState<null | string>(null);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const online = snaps.status === 'online';

  const counters = [
    { id: 'aiUsageCount', label: 'AI Usage', value: snaps.aiUsageCount },
    { id: 'decisionSupportCount', label: 'Decision Support', value: snaps.decisionSupportCount },
    { id: 'protocolCompliancePercent', label: 'Protocol Compliance %', value: snaps.protocolCompliancePercent },
    { id: 'clinicalRecommendations', label: 'Clinical Recommendations', value: snaps.clinicalRecommendations },
    { id: 'missedOpportunities', label: 'Missed Opportunities', value: snaps.missedOpportunities },
    { id: 'knowledgeUpdates', label: 'Knowledge Updates', value: snaps.knowledgeUpdates },
    { id: 'newGuidelines', label: 'New Guidelines', value: snaps.newGuidelines },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ── Observatory masthead ─────────────────────────────────────────── */}
      <ObservatoryHero snaps={snaps} online={online} />

      {/* ── Today's Clinical Activity ────────────────────────────────────── */}
      <Card
        title="Today's Clinical Activity"
        subtitle="Observed activity across every patient journey — AMEXAN never interrupts care."
        action={<Pill icon={Clock} label="Live · Today" tone="green" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <Stat label="Patients Observed" value={snaps.patientsObserved} icon={Eye} color={C.navy} />
          <Stat label="Clinical Decisions Analysed" value={snaps.clinicalDecisionsAnalysed} icon={Brain} color={C.sky} />
          <Stat label="Clinical Rules Executed" value={snaps.clinicalRulesExecuted} icon={GitBranch} color={C.purple} />
          <Stat label="Protocols Activated" value={snaps.protocolsActivated} icon={ShieldCheck} color={C.green} />
          <Stat label="Recommendations Generated" value={snaps.clinicalRecommendations || snaps.recommendationsByType.reduce((a, r) => a + r.count, 0)} icon={Sparkles} color={C.sky} />
          <Stat label="Recommendations Accepted" value={snaps.recommendationsAccepted} icon={BadgeCheck} color={C.green} />
          <Stat label="Potential Errors Prevented" value={snaps.potentialErrorsPrevented} icon={ShieldAlert} color={C.amber} />
          <Stat label="High-Risk Patients Escalated" value={snaps.highRiskPatientsEscalated} icon={AlertTriangle} color={C.red} />
        </div>
      </Card>

      {/* ── Adoption · Compliance ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card title="Clinical Intelligence Adoption" subtitle="How actively each department uses AMEXAN intelligence.">
          {snaps.adoptionByDepartment.map((d) => <BarRow key={d.department} label={d.department} value={d.percent} suffix="%" tone={d.percent >= 90 ? C.green : d.percent >= 80 ? C.sky : C.amber} />)}
        </Card>
        <ComplianceCard snaps={snaps} />
      </div>

      {/* ── Recommendations · Missed opportunities ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card
          title="Today's Clinical Recommendations"
          subtitle="Click any recommendation to see exactly why AMEXAN surfaced it."
          action={<Pill icon={Sparkles} label={`${snaps.recommendationsAccepted} accepted · ${snaps.clinicalRecommendations} generated`} tone="green" />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {snaps.recommendationsByType.map((r) => (
              <button key={r.type} onClick={() => setExplain(r.type)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid #e3e9f2', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={15} color={C.sky} /></span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.navy }}>{r.type}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.sky }}>{r.count}</span>
                <ChevronDown size={14} color={C.muted} />
              </button>
            ))}
          </div>
        </Card>
        <Card
          title="Missed Opportunities"
          subtitle="Not errors — moments where the next best action could have come sooner."
          action={<Pill icon={Eye} label={`${snaps.missedOpportunitiesByType.reduce((a, r) => a + r.count, 0)} today`} tone="amber" />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {snaps.missedOpportunitiesByType.map((m) => (
              <div key={m.type} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid #e3e9f2', background: '#fffaf2' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amber}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={15} color={C.amber} /></span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.navy }}>{m.type}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.amber }}>{m.count}</span>
              </div>
            ))}
          </div>
          <MissedStory />
        </Card>
      </div>

      {/* ── Knowledge · Guidelines ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card title="Knowledge Updates" subtitle="Evidence sources refreshed into AMEXAN's reasoning surface.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {snaps.knowledgeUpdateFeed.map((k) => (
              <div key={k.source + k.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid #e3e9f2', background: '#fff' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Database size={15} color={C.navy} /></span>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.sky, width: 90 }}>{k.source}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.navy }}>{k.title}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Recently Activated" subtitle="Guidelines automatically loaded into clinical workflows.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {snaps.recentlyActivatedGuidelines.map((g) => (
              <span key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: C.skyLight, fontSize: 11.5, fontWeight: 700, color: C.sky }}>
                <BookOpen size={13} /> {g.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Intelligence snapshot ────────────────────────────────────────── */}
      <Card
        title="Hospital Intelligence Snapshot"
        subtitle="Today's story — the measurable value AMEXAN delivers."
        action={<Pill icon={LineChart} label="Updated moments ago" tone="sky" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <Stat label="Clinical Decisions" value={snaps.clinicalDecisionsAnalysed} icon={Brain} color={C.navy} />
          <Stat label="AI Compared" value="100%" icon={GitBranch} color={C.sky} />
          <Stat label="Protocols Activated" value={snaps.protocolsActivated} icon={ShieldCheck} color={C.purple} />
          <Stat label="Doctors Assisted" value={snaps.doctorsAssisted} icon={Stethoscope} color={C.green} />
          <Stat label="Patients Escalated" value={snaps.highRiskPatientsEscalated} icon={AlertTriangle} color={C.amber} />
          <Stat label="Documentation Improved" value={`${snaps.documentationImprovedPercent}%`} icon={FileDraftIcon} color={C.sky} />
          <Stat label="Time Saved" value={`${snaps.estimatedTimeSavedHours} Hours`} icon={Timer} color={C.purple} />
          <Stat label="Adverse Events Prevented" value={snaps.potentialErrorsPrevented} icon={ShieldCheck} color={C.green} />
        </div>
      </Card>

      {/* ── Explainability ───────────────────────────────────────────────── */}
      <Card title="Explainability" subtitle="Every recommendation is transparent — observed evidence, cited, and reviewable.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <ExplanationCard title="AKI Recommendation" icon={FlaskConical} color={C.purple} onOpen={() => setExplain('AKI Alerts')} />
          <ExplanationCard title="Sepsis Recognition" icon={HeartPulse} color={C.red} onOpen={() => setExplain('Early Sepsis Recognition')} />
          <ExplanationCard title="Drug Interaction" icon={Zap} color={C.amber} onOpen={() => setExplain('Drug Interaction Alerts')} />
        </div>
        {explain && <ExplainPanel title={explain} onClose={() => setExplain(null)} />}
      </Card>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <Card
        title="Clinical Intelligence Timeline"
        subtitle="Every recommendation becomes an auditable, time-stamped story."
        action={<Pill icon={Clock} label="Today" tone="green" />}
      >
        <button onClick={() => setTimelineOpen(!timelineOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.sky, marginBottom: 10 }}>
          <ChevronDown size={14} style={{ transform: timelineOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} /> {timelineOpen ? 'Hide' : 'Show'} today's timeline
        </button>
        {timelineOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {snaps.timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.tone === 'critical' ? C.red : t.tone === 'positive' ? C.green : C.sky, marginTop: 4 }} />
                  {i < snaps.timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: '#e3e9f2' }} />}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 12 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: C.muted, fontFamily: "'JetBrains Mono', monospace", minWidth: 42 }}>{t.at}</span>
                  <span style={{ fontSize: 13, fontWeight: t.tone === 'critical' ? 700 : 500, color: t.tone === 'critical' ? C.red : C.navy }}>{t.text}</span>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: `${C.green}12`, fontSize: 12, fontWeight: 700, color: C.green }}>
              <CheckCircle2 size={15} /> Outcome — Improving
            </div>
          </div>
        )}
      </Card>

      {/* ── Department intelligence ──────────────────────────────────────── */}
      <Card title="Department Intelligence" subtitle="Every department observes a different signature — AMEXAN adapts to each.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {snaps.departmentIntelligence.map((d) => (
            <div key={d.department} style={{ padding: 14, borderRadius: 12, border: '1px solid #e3e9f2', background: '#fbfdff' }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy, marginBottom: 8 }}>{d.department}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {d.alerts.map((a) => (
                  <span key={a} style={{ padding: '3px 9px', borderRadius: 20, background: '#f0f4fa', fontSize: 10.5, fontWeight: 700, color: C.slate }}>{a}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Learning engine ──────────────────────────────────────────────── */}
      <Card
        title="Hospital Learning"
        subtitle="AMEXAN observes, compares, and improves — continuously, without overriding judgement."
        action={<Pill icon={GraduationCap} label="Learning Engine" tone="purple" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <Stat label="Cases Reviewed" value={snaps.learning.casesReviewed} icon={Microscope} color={C.purple} />
          <Stat label="Clinical Patterns Learned" value={snaps.learning.patternsLearned} icon={Brain} color={C.sky} />
          <Stat label="Protocols Improved" value={snaps.learning.protocolsImproved} icon={ShieldCheck} color={C.green} />
          <Stat label="Research Opportunities" value={snaps.learning.researchOpportunities} icon={FlaskConical} color={C.amber} />
          <Stat label="New AI Rules Suggested" value={snaps.learning.newRulesSuggested} icon={Sparkles} color={C.purple} />
        </div>
      </Card>

      {/* ── Impact ───────────────────────────────────────────────────────── */}
      <Card
        title="Clinical Intelligence Impact"
        subtitle="Estimated measurable impact observed since the observatory went live."
        action={<Pill icon={TrendingUp} label="Improving" tone="green" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <BarRow label="Documentation Quality" value={snaps.impact.documentationQuality} suffix="%" tone={C.green} />
            <BarRow label="Guideline Adherence" value={snaps.impact.guidelineAdherence} suffix="%" tone={C.sky} />
            <BarRow label="Medication Safety" value={snaps.impact.medicationSafety} suffix="%" tone={C.purple} />
            <BarRow label="Early Recognition" value={snaps.impact.earlyRecognition} suffix="%" tone={C.amber} />
            <BarRow label="Time Saved" value={snaps.impact.timeSavedHours} suffix=" hrs" tone={C.green} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg,#0b2c4d,#0ea5e9)', color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: .85, textTransform: 'uppercase', letterSpacing: '.06em' }}>Mortality Reduction Potential</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{snaps.impact.mortalityReduction}</div>
            <div style={{ fontSize: 12, opacity: .9, lineHeight: 1.6 }}>Modeled from earlier recognition, faster escalation, and improved protocol adherence. Clinical outcomes remain owned by the care team.</div>
          </div>
        </div>
      </Card>

      {/* ── Editable source-of-truth counters ────────────────────────────── */}
      <NumberFields
        title="Observed Activity Counters"
        sub="Admins may record observed clinical activity; the Observatory always derives its story from observation, never from override."
        fields={counters}
        onSave={(patch) => onPatch(patch)}
      />

      {/* ── Constitutional footer ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid #e3e9f2', background: '#f0f4fa', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: C.navy }}><Lock size={15} color={C.purple} /> Constitutional guarantee</div>
        <div style={{ fontSize: 12, color: C.slate, flex: 1, minWidth: 220, lineHeight: 1.6 }}>
          Clinical Intelligence is observation-only. AMEXAN never overrides contextual reasoning and never becomes the doctor — it watches, reasons, compares, explains, and learns while clinicians remain legally responsible.
        </div>
      </div>
    </div>
  );
}

// ── Presentational helpers ────────────────────────────────────────────────────

function ObservatoryHero({ snaps, online }: { snaps: ClinicalIntelligenceSnapshot; online: boolean }) {
  return (
    <div style={{ padding: '20px 22px', borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#123d66 55%,#0ea5e9)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={24} color="#fff" /></span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Clinical Intelligence Observatory</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>Hospital Intelligence Status</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: online ? 'rgba(16,185,129,.22)' : 'rgba(239,68,68,.22)', border: `1px solid ${online ? 'rgba(16,185,129,.5)' : 'rgba(239,68,68,.5)'}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: online ? C.green : C.red, boxShadow: online ? '0 0 0 4px rgba(16,185,129,.25)' : 'none' }} />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>{online ? 'ONLINE' : 'DEGRADED'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Learning Sources</span>
          {['WHO', 'MOH Kenya', 'NICE', 'CDC', 'RCOG', 'ATLS', 'ACLS', 'AMEXAN Intelligence'].map((s) => (
            <span key={s} style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,.12)', fontSize: 10.5, fontWeight: 700, color: '#fff' }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, maxWidth: 720 }}>
          The observatory continuously watches every patient journey and answers <b>"could this patient have been managed even better?"</b> — without interrupting care.
        </div>
      </div>
    </div>
  );
}

function ComplianceCard({ snaps }: { snaps: ClinicalIntelligenceSnapshot }) {
  const sorted = [...snaps.protocolComplianceByPathway].sort((a, b) => b.compliance - a.compliance);
  const top = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const improving = [...snaps.protocolComplianceByPathway].sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0];
  const overall = Math.round(sorted.reduce((a, p) => a + p.compliance, 0) / sorted.length);
  return (
    <Card
      title="Hospital Protocol Compliance"
      subtitle="Where protocols are followed — and where support is needed."
      action={<Pill icon={ShieldCheck} label={`Overall ${overall}%`} tone={overall >= 80 ? 'green' : overall >= 60 ? 'amber' : 'red'} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {snaps.protocolComplianceByPathway.map((p) => (
          <div key={p.pathway}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: C.slate }}>{p.pathway}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: p.compliance >= 80 ? C.green : p.compliance >= 60 ? C.amber : C.red }}>
                {p.compliance}%
                {typeof p.change === 'number' && (
                  p.change >= 0
                    ? <span style={{ fontSize: 10.5, fontWeight: 700, color: C.green }}><ArrowUp size={12} />{p.change}</span>
                    : <span style={{ fontSize: 10.5, fontWeight: 700, color: C.red }}><ArrowDown size={12} />{Math.abs(p.change)}</span>
                )}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: '#eef2f8', overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(2, p.compliance)}%`, height: '100%', borderRadius: 4, background: p.compliance >= 80 ? C.green : p.compliance >= 60 ? C.amber : C.red }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 12 }}>
        <MiniKpi label="Top Performing" value={top.pathway} sub={`${top.compliance}%`} tone={C.green} />
        <MiniKpi label="Needs Support" value={lowest.pathway} sub={`${lowest.compliance}%`} tone={C.amber} />
        <MiniKpi label="Improving" value={improving.pathway} sub={`+${improving.change ?? 0}%`} tone={C.sky} />
      </div>
    </Card>
  );
}

function MissedStory() {
  const story = [
    { text: 'Patient arrived with sepsis-suggestive vitals', tone: C.slate },
    { text: 'No lactate ordered', tone: C.slate },
    { text: 'Sepsis protocol delayed', tone: C.amber },
    { text: 'Missed Opportunity', tone: C.red, bold: true },
  ];
  return (
    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: '#fdf6ee', border: '1px dashed #f59e0b55' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {story.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.tone }} />
            <span style={{ fontSize: 11.5, fontWeight: s.bold ? 800 : 500, color: s.tone }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExplanationCard({ title, icon: Icon, color, onOpen }: { title: string; icon: any; color: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={19} color={color} /></span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.navy }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: C.muted, marginTop: 2 }}>Observed → Recommendation → Evidence → Confidence</span>
      </span>
      <ChevronDown size={15} color={C.muted} />
    </button>
  );
}

function ExplainPanel({ title, onClose }: { title: string; onClose: () => void }) {
  const [tab, setTab] = useState<'observed' | 'recommendation' | 'evidence'>('observed');
  const observed = [
    { label: 'Creatinine ↑', value: '1.8 → 2.4 mg/dL in 12h', tone: C.red },
    { label: 'Urine Output ↓', value: '< 0.5 mL/kg/h for 6h', tone: C.red },
    { label: 'Nephrotoxic Drug Present', value: 'Ibuprofen ordered', tone: C.amber },
    { label: 'KDIGO Criteria Met', value: 'Stage 2 AKI', tone: C.amber },
  ];
  const recommendation = [
    'Review nephrotoxic medication',
    'Order U&E repeat in 6 hours',
    'Consider nephrology referral',
  ];
  const evidence = [
    { source: 'KDIGO 2024', detail: 'KDIGO clinical practice guideline for AKI' },
    { source: 'MOH Kenya', detail: 'National clinical guidelines — renal care' },
    { source: 'AMEXAN Rule AKI-011', detail: 'Composite creatinine + urine output + drug rule' },
  ];
  return (
    <div style={{ marginTop: 14, borderRadius: 14, border: '1px solid #0ea5e9', background: '#f7fbff', padding: 18, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: C.muted }}>×</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Brain size={16} color={C.purple} />
        <span style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{title}</span>
        <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, background: `${C.green}18`, fontSize: 11, fontWeight: 800, color: C.green }}>Confidence · High</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['observed', 'recommendation', 'evidence'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', borderRadius: 8, border: tab === t ? 'none' : '1px solid #e3e9f2', background: tab === t ? C.sky : '#fff', color: tab === t ? '#fff' : C.slate, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
            {t === 'observed' ? 'Observed' : t === 'recommendation' ? 'Recommendation' : 'Evidence'}
          </button>
        ))}
      </div>
      {tab === 'observed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {observed.map((o) => (
            <div key={o.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: '#fff', border: '1px solid #e3e9f2' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>{o.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: o.tone }}>{o.value}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'recommendation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recommendation.map((r, i) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#fff', border: '1px solid #e3e9f2' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.sky }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.navy }}>{r}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: C.muted, padding: '0 4px' }}>Clinician remains responsible for every action. AMEXAN only observes and suggests.</div>
        </div>
      )}
      {tab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {evidence.map((e) => (
            <div key={e.source} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#fff', border: '1px solid #e3e9f2', alignItems: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={14} color={C.navy} /></span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{e.source}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{e.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarRow({ label, value, suffix, tone }: { label: string; value: number; suffix?: string; tone: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.slate }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: tone }}>{value}{suffix ?? ''}</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: '#eef2f8', overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(2, Math.min(100, value))}%`, height: '100%', borderRadius: 4, background: tone }} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e3e9f2', borderRadius: 14, padding: '14px 16px', minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={14} color={color} /></span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

function MiniKpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafd', border: '1px solid #e3e9f2' }}>
      <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: tone }}>{sub}</div>
    </div>
  );
}

function Pill({ icon: Icon, label, tone }: { icon: any; label: string; tone: 'green' | 'amber' | 'red' | 'sky' | 'purple' }) {
  const color = tone === 'green' ? C.green : tone === 'amber' ? C.amber : tone === 'red' ? C.red : tone === 'sky' ? C.sky : C.purple;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: `${color}16`, fontSize: 10.5, fontWeight: 800, color }}>
      <Icon size={12} /> {label}
    </span>
  );
}

const FileDraftIcon = (p: any) => <BookOpen {...p} />;
