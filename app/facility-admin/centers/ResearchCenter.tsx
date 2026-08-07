'use client';

import { useState } from 'react';
import {
  Activity, BarChart3, Beaker, BookOpen, Brain, CheckCircle2, ChevronRight,
  ClipboardList, Database, FlaskConical, Gauge, Landmark, Microscope, Network,
  ShieldCheck, Stethoscope, Users, Wallet,
} from 'lucide-react';
import { C } from '../ui';
import { FacilityAdministrationEngine, type FacilityAdminModel, type ClinicalResearchIntelligence, type TrialStage } from '@/lib/amexan/facility';

// ── Engine XV — Clinical Research Intelligence Center (CRIC) ───────────────────
// Transforms routine clinical care into ethical, structured, reusable research
// knowledge. Research becomes a natural by-product of care — never a duplication
// of documentation — while consent, privacy, ethics and governance stay intact.

type SectionId =
  | 'overview' | 'projects' | 'trials' | 'registries' | 'cohorts' | 'recruitment'
  | 'consent' | 'ethics' | 'datasets' | 'biobank' | 'analytics' | 'publications'
  | 'funding' | 'collaborations' | 'population' | 'wall' | 'executive';

const SECTIONS: { id: SectionId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Executive Research', icon: Landmark },
  { id: 'projects', label: 'Research Projects', icon: ClipboardList },
  { id: 'trials', label: 'Clinical Trials', icon: FlaskConical },
  { id: 'registries', label: 'Disease Registries', icon: Activity },
  { id: 'cohorts', label: 'Patient Cohorts', icon: Users },
  { id: 'recruitment', label: 'Recruitment', icon: Stethoscope },
  { id: 'consent', label: 'Consent Intelligence', icon: ShieldCheck },
  { id: 'ethics', label: 'Ethics', icon: Gauge },
  { id: 'datasets', label: 'Datasets & AI', icon: Database },
  { id: 'analytics', label: 'Statistics Studio', icon: BarChart3 },
  { id: 'biobank', label: 'Biobank', icon: Beaker },
  { id: 'publications', label: 'Publications', icon: BookOpen },
  { id: 'funding', label: 'Grants & Funding', icon: Wallet },
  { id: 'collaborations', label: 'Collaborations', icon: Network },
  { id: 'population', label: 'Population Intelligence', icon: Landmark },
  { id: 'wall', label: 'Real-time Wall', icon: Activity },
  { id: 'executive', label: 'Executive Intelligence', icon: Gauge },
];

export function ResearchCenter({ model, onPatch }: { model: FacilityAdminModel; onPatch: (next: ClinicalResearchIntelligence) => void }) {  const [section, setSection] = useState<SectionId>('overview');
  const cric = FacilityAdministrationEngine.getCRIC(model);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── Engine masthead ─────────────────────────────────────────────── */}
      <div style={{ padding: '20px 24px', borderRadius: 16, background: 'linear-gradient(120deg,#0b2c4d,#123d66 55%,#0ea5e9)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Microscope size={24} color="#fff" /></span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Clinical Research Intelligence Center</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>Engine XV · Research as a natural by-product of clinical care, with ethics, consent, privacy and governance intact.</div>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,.22)', border: '1px solid rgba(16,185,129,.5)', fontSize: 11.5, fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} /> Research Activity · Active
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', maxWidth: 760, lineHeight: 1.6 }}>
            Clinical trials, quality improvement, epidemiology, registries, public health, AI datasets, teaching, publications, grants and real-world evidence — generated from routine care, never duplicating documentation.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <aside style={{ width: 218, flexShrink: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 0 }}>
          {SECTIONS.map((s) => {
            const IconComp = s.icon;
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, border: 'none', background: active ? C.skyLight : 'transparent', color: active ? C.sky : C.slate, fontSize: 12, fontWeight: active ? 800 : 600, cursor: 'pointer', textAlign: 'left' }}>
                <IconComp size={15} /> {s.label}
              </button>
            );
          })}
        </aside>

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {section === 'overview' && <Overview cric={cric} onSection={setSection} />}
          {section === 'projects' && <Projects cric={cric} />}
          {section === 'trials' && <Trials cric={cric} />}
          {section === 'registries' && <Registries cric={cric} />}
          {section === 'cohorts' && <Cohorts cric={cric} />}
          {section === 'recruitment' && <Recruitment cric={cric} />}
          {section === 'consent' && <Consent cric={cric} onPatch={onPatch} />}
          {section === 'ethics' && <Ethics cric={cric} />}
          {section === 'datasets' && <Datasets cric={cric} />}
          {section === 'analytics' && <Analytics cric={cric} />}
          {section === 'biobank' && <Biobank cric={cric} />}
          {section === 'publications' && <Publications cric={cric} />}
          {section === 'funding' && <Funding cric={cric} />}
          {section === 'collaborations' && <Collaborations cric={cric} />}
          {section === 'population' && <Population cric={cric} />}
          {section === 'wall' && <Wall cric={cric} />}
          {section === 'executive' && <Executive cric={cric} />}
        </main>
      </div>
    </div>
  );
}

// ── Section 1 · Executive Overview ─────────────────────────────────────────────

function Overview({ cric, onSection }: { cric: ClinicalResearchIntelligence; onSection: (s: SectionId) => void }) {
  const m = cric.metrics;
  const chips: { label: string; value: string | number; tone: string; section: SectionId }[] = [
    { label: 'Research Activity', value: 'ACTIVE', tone: m.ethicsCompliance === 100 ? C.green : C.amber, section: 'overview' },
    { label: 'Projects', value: m.projects, tone: C.navy, section: 'projects' },
    { label: 'Clinical Trials', value: m.clinicalTrials, tone: C.navy, section: 'trials' },
    { label: 'Participants', value: m.participants.toLocaleString(), tone: C.sky, section: 'recruitment' },
    { label: 'Recruitment Rate', value: `${m.recruitmentRate}%`, tone: C.green, section: 'recruitment' },
    { label: 'Ethics Compliance', value: `${m.ethicsCompliance}%`, tone: C.green, section: 'ethics' },
    { label: 'Publications', value: m.publications, tone: C.navy, section: 'publications' },
    { label: 'Active Grants', value: `KES ${m.activeGrantsKES}M`, tone: C.purple, section: 'funding' },
    { label: 'Research Quality Score', value: `${m.researchQualityScore}%`, tone: C.sky, section: 'wall' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <SectionCard title="Clinical Research Intelligence Center" subtitle="Research as a natural by-product of clinical care — constitutional, ethical, patient-first.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {chips.map((k) => (
            <button key={k.label} onClick={() => onSection(k.section)} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', minWidth: 130, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.tone }}>{k.value}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10.5, fontWeight: 700, color: C.sky }}>Open <ChevronRight size={12} /></div>
            </button>
          ))}
        </div>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        <SectionCard title="Constitutional Mission" subtitle="Transform routine care into ethical clinical knowledge.">
          <div style={{ fontSize: 12.5, color: C.slate, lineHeight: 1.7 }}>
            Support clinical research, clinical trials, quality improvement, epidemiology, registries, public health, AI datasets, teaching, publications, grant management and real-world evidence — <b>without duplicating documentation</b>. Every participant, consent decision, ethics approval, publication and grant stays constitutionally linked to the underlying care while preserving patient privacy and auditability.
          </div>
        </SectionCard>
        <ReStudioCard cric={cric} />
      </div>
    </div>
  );
}

// ── Section 2 · Research Projects ──────────────────────────────────────────────

function Projects({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <SectionCard title="Research Projects" subtitle="Each project is a constitutional object — disease, PI, department, participants, recruitment, funding and status.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {cric.projects.map((p) => (
          <div key={p.id} style={{ padding: 14, borderRadius: 12, border: '1px solid #e3e9f2', background: '#fbfdff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Microscope size={16} color={C.sky} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{p.title}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{p.disease} · {p.department}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
              <Meta label="Principal Investigator" value={p.principalInvestigator} />
              <Meta label="Status" value={p.status} tone={C.green} />
              <Meta label="Participants" value={p.participants.toLocaleString()} />
              <Meta label="Recruitment" value={`${p.recruitmentRate}%`} tone={C.sky} />
              <Meta label="Funding" value={p.funding} tone={C.purple} />
            </div>
            <div style={{ marginTop: 10 }}>
              <Bar label="Recruitment" pct={p.recruitmentRate} tone={C.sky} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Section 3 · Clinical Trials (Kanban) ───────────────────────────────────────

function Trials({ cric }: { cric: ClinicalResearchIntelligence }) {
  const stages: { id: TrialStage; label: string }[] = [
    { id: 'recruiting', label: 'Recruiting' },
    { id: 'screening', label: 'Screening' },
    { id: 'randomized', label: 'Randomized' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'follow_up', label: 'Follow-up' },
    { id: 'completed', label: 'Completed' },
  ];
  return (
    <SectionCard title="Clinical Trials" subtitle="Progress board — recruiting → screening → randomized → treatment → follow-up → completed.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {stages.map((l) => (
          <div key={l.id} style={{ background: '#f6f8fb', borderRadius: 12, padding: 10, minHeight: 120 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.id === 'completed' ? C.green : l.id === 'recruiting' ? C.sky : l.id === 'screening' ? C.purple : C.amber }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: C.navy }}>{l.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cric.trials.filter((t) => t.stage === l.id).map((t) => (
                <div key={t.id} style={{ background: '#fff', border: '1px solid #e3e9f2', borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: C.navy, lineHeight: 1.4 }}>{t.title}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Phase {t.phase} · {t.sponsor}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.sky, marginTop: 6 }}>{t.enrolled}/{t.target} enrolled</div>
                </div>
              ))}
              {cric.trials.filter((t) => t.stage === l.id).length === 0 && <div style={{ fontSize: 10.5, color: C.muted }}>No trials</div>}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Section 4 · Disease Registries ─────────────────────────────────────────────

function Registries({ cric }: { cric: ClinicalResearchIntelligence }) {
  const [selected, setSelected] = useState<string>('d-breast');
  const reg = cric.registries.find((r) => r.id === selected) ?? cric.registries[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <SectionCard title="Disease Registries" subtitle="Automatically built and continuously updated from routine care — no manual dataset creation.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cric.registryNames.map((n) => (
            <span key={n} style={{ padding: '5px 11px', borderRadius: 14, background: `${C.sky}12`, color: C.sky, fontSize: 11, fontWeight: 700 }}>{n}</span>
          ))}
        </div>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        <SectionCard title="Registries" subtitle="Select a registry to inspect live disease intelligence.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {cric.registries.map((r) => (
              <button key={r.id} onClick={() => setSelected(r.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: selected === r.id ? C.sky : '#eef2f7', color: selected === r.id ? '#fff' : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {r.name} <span style={{ opacity: .7 }}>({r.totalPatients.toLocaleString()})</span>
              </button>
            ))}
          </div>
        </SectionCard>
        <DiseaseDashboard reg={reg} />
      </div>
    </div>
  );
}

function DiseaseDashboard({ reg }: { reg: any }) {
  const stats: { label: string; value: string | number }[] = [
    { label: 'Total Patients', value: reg.totalPatients.toLocaleString() },
    { label: 'Average Age', value: reg.avgAge ?? '—' },
    { label: 'Mortality', value: reg.mortality ?? '—' },
    { label: 'Recurrence', value: reg.recurrence ?? '—' },
    { label: 'Median Follow-up', value: reg.followUp ?? '—' },
    { label: 'Most Common Risk Factor', value: reg.riskFactor ?? '—' },
  ];
  return (
    <SectionCard title={`Disease Intelligence · ${reg.name}`} subtitle="Live, auto-updated from routine care.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafd', border: '1px solid #e3e9f2' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{s.value}</div>
            <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {reg.breakdown && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Stage distribution</div>
          <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden' }}>
            {reg.breakdown.map((b: any) => <div key={b.label} style={{ width: `${b.pct}%`, background: [C.sky, C.purple, C.green, C.amber, C.red][Math.min(4, reg.breakdown.findIndex((x: any) => x.label === b.label))] }} />)}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {reg.breakdown.map((b: any, i: number) => <span key={b.label} style={{ fontSize: 10.5, color: C.slate }}><b style={{ color: [C.sky, C.purple, C.green, C.amber, C.red][i] }}>{b.pct}%</b> {b.label}</span>)}
          </div>
        </div>
      )}
      {reg.metrics && (
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {reg.metrics.map((mt: any) => <div key={mt.label} style={{ padding: '8px 10px', borderRadius: 8, background: `${C.purple}0e`, fontSize: 11 }}><div style={{ color: C.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase' }}>{mt.label}</div><div style={{ fontWeight: 800, color: C.navy, marginTop: 2 }}>{mt.value}</div></div>)}
        </div>
      )}
    </SectionCard>
  );
}

// ── Section 5 · Patient Cohorts ─────────────────────────────────────────────────

function Cohorts({ cric }: { cric: ClinicalResearchIntelligence }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
      <SectionCard title="Patient Cohorts" subtitle="Researcher-defined filters — one click turns them into a dataset.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cric.cohorts.map((c, i) => (
            <div key={c.id} style={{ padding: 12, borderRadius: 10, border: '1px solid #e3e9f2', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={15} color={C.sky} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{c.participants} participants · {c.createdAt}</div>
                </div>
                <button onClick={() => setOpen(open === i ? null : i)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><ChevronRight size={15} style={{ transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} color={C.sky} /></button>
              </div>
              {open === i && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                  {c.criteria.map((cr) => <span key={cr} style={{ padding: '3px 8px', borderRadius: 12, background: '#f0f4fa', fontSize: 10, fontWeight: 700, color: C.slate }}>{cr}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
        <button style={{ marginTop: 12, padding: '8px 14px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Create Cohort</button>
      </SectionCard>

      <SectionCard title="Cohort Builder" subtitle="Compose filters — the dataset is generated automatically.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FilterGroup label="Diagnosis" items={['Breast Cancer', 'Diabetes', 'Stroke', 'Sepsis']} />
          <FilterGroup label="Demographics" items={['Female', 'Age 40-60', 'County: Nairobi']} />
          <FilterGroup label="Biology & Treatment" items={['ER Positive', 'HER2 Negative', 'Stage II', 'Received AC-T', 'Follow-up >24 months']} />
          <button style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#0ea5e9,#8b5cf6)', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Generate Cohort Dataset</button>
        </div>
      </SectionCard>
    </div>
  );
}

function FilterGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map((i) => <span key={i} style={{ padding: '4px 9px', borderRadius: 8, border: '1px solid #e3e9f2', background: '#f8fafd', fontSize: 11, fontWeight: 700, color: C.slate }}>{i}</span>)}
      </div>
    </div>
  );
}

// ── Section 6 · Recruitment ─────────────────────────────────────────────────────

function Recruitment({ cric }: { cric: ClinicalResearchIntelligence }) {
  const r = cric.recruitment;
  const funnel: { label: string; value: number }[] = [
    { label: 'Eligible', value: r.eligible },
    { label: 'Approached', value: r.approached },
    { label: 'Consented', value: r.consented },
    { label: 'Enrolled', value: r.consented },
    { label: 'Completed', value: r.completed },
  ];
  const max = Math.max(...funnel.map((f) => f.value), 1);
  return (
    <SectionCard title="Recruitment Intelligence" subtitle="The full funnel across every study.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {[
          { label: 'Eligible', value: r.eligible },
          { label: 'Consented', value: r.consented },
          { label: 'Declined', value: r.declined },
          { label: 'Withdrawn', value: r.withdrawn },
          { label: 'Completed', value: r.completed },
          { label: 'Lost Follow-up', value: r.lostFollowUp },
        ].map((s) => (
          <KeyStat key={s.label} label={s.label} value={s.value} tone={s.label === 'Declined' ? C.amber : s.label === 'Lost Follow-up' ? C.red : C.sky} />
        ))}
      </div>
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'flex-end', gap: 0, height: 140 }}>
        {funnel.map((f) => (
          <div key={f.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ fontWeight: 800, color: C.sky, fontSize: 13, marginBottom: 4 }}>{f.value}</div>
            <div style={{ width: '70%', height: `${(f.value / max) * 100}%`, background: 'linear-gradient(180deg,#0ea5e9,#0369a1)', borderRadius: '6px 6px 0 0' }} />
            <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 700, marginTop: 6 }}>{f.label}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Section 7 · Consent Intelligence ───────────────────────────────────────────

function Consent({ cric, onPatch }: { cric: ClinicalResearchIntelligence; onPatch: (next: ClinicalResearchIntelligence) => void }) {
  const toggle = (id: string) => onPatch({
    ...cric,
    consentScopes: cric.consentScopes.map((s) => s.id === id ? { ...s, granted: !s.granted } : s),
  });
  return (
    <SectionCard title="Consent Intelligence" subtitle="Every patient, every research scope — digital, no paper, version-controlled. Toggle to update a consent decision.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {cric.consentScopes.map((s) => (
          <button key={s.id} onClick={() => toggle(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid #e3e9f2', background: s.granted ? '#f6fef9' : '#fffdf5', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: s.granted ? `${C.green}18` : `${C.amber}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.granted ? <CheckCircle2 size={15} color={C.green} /> : <span style={{ fontSize: 15, fontWeight: 800, color: C.amber }}>✕</span>}</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{s.scope}</div>
              <div style={{ fontSize: 10, color: s.granted ? C.green : C.amber, fontWeight: 700 }}>{s.granted ? 'YES · Consented' : 'NO · Not consented'}</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: '#f0f4fa', fontSize: 11, color: C.slate, lineHeight: 1.6 }}>
        <b>Research Profile:</b> Current studies 3 · Eligible studies 6 · Consented 4 · Declined 2 · Samples: Blood, DNA, Tumor · Follow-up 24 months.
      </div>
    </SectionCard>
  );
}

// ── Section 8 · Ethics ─────────────────────────────────────────────────────────

function Ethics({ cric }: { cric: ClinicalResearchIntelligence }) {
  const e = cric.ethics;
  return (
    <SectionCard title="Ethics Dashboard" subtitle="Review, approval, expiry and adverse event oversight.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <KeyStat label="Pending Approval" value={e.pending} tone={C.amber} />
        <KeyStat label="Approved" value={e.approved} tone={C.green} />
        <KeyStat label="Expired" value={e.expired} tone={C.red} />
        <KeyStat label="Renewal Due" value={e.renewalDue} tone={C.amber} />
        <KeyStat label="Protocol Deviations" value={e.protocolDeviations} tone={C.purple} />
        <KeyStat label="Serious Adverse Events" value={e.seriousAdverseEvents} tone={C.red} />
      </div>
    </SectionCard>
  );
}

// ── Section 9 · Datasets & AI ────────────────────────────────────────────────────

function Datasets({ cric }: { cric: ClinicalResearchIntelligence }) {
  const q = cric.aiQuality;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
      <SectionCard title="Dataset Builder" subtitle="One click to research-ready data in every format.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cric.exportFormats.map((f) => <span key={f} style={{ padding: '5px 11px', borderRadius: 12, background: `${C.sky}14`, color: C.sky, fontSize: 11, fontWeight: 800 }}>{f}</span>)}
        </div>
      </SectionCard>
      <SectionCard title="AI Dataset Quality" subtitle="Ready for AI use, verified.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <KeyStat label="Completeness" value={`${q.completeness}%`} tone={C.green} />
          <KeyStat label="Missing Values" value={`${q.missingValues}%`} tone={C.amber} />
          <KeyStat label="Duplicates" value={`${q.duplicates}%`} tone={C.green} />
          <KeyStat label="Bias" value={q.bias} tone={C.sky} />
        </div>
        <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 10, background: `${C.green}12`, color: C.green, fontWeight: 800, fontSize: 12, textAlign: 'center' }}>
          {q.readyForAi ? '✓ READY FOR AI' : 'Needs review'}
        </div>
      </SectionCard>
      <ReStudioCard cric={cric} />
    </div>
  );
}

// ── Section 10 · Statistics Studio ──────────────────────────────────────────────

function Analytics({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
      <SectionCard title="Statistics Studio" subtitle="SPSS-class statistics built in — no need to leave AMEXAN.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {cric.statisticsStudio.map((s) => <span key={s} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e3e9f2', background: '#f8fafd', fontSize: 11, fontWeight: 700, color: C.navy }}>{s}</span>)}
        </div>
        <button style={{ marginTop: 14, padding: '8px 14px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Open Statistics Studio</button>
      </SectionCard>
      <SectionCard title="CRF Builder" subtitle="Visual, drag-and-drop — like REDCap, built in.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cric.crfTypes.map((s) => <span key={s} style={{ padding: '5px 11px', borderRadius: 12, background: `${C.purple}12`, color: C.purple, fontSize: 11, fontWeight: 700 }}>{s}</span>)}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Section 11 · Biobank ─────────────────────────────────────────────────────────

function Biobank({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <SectionCard title="Biobank" subtitle="Samples automatically linked to patients, consent, studies and provenance.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {cric.biobank.map((b) => (
          <div key={b.type} style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #e3e9f2', background: '#fff' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.sky }}>{b.count.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>{b.type}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Section 12 · Publications ────────────────────────────────────────────────────

function Publications({ cric }: { cric: ClinicalResearchIntelligence }) {
  const p = cric.publications;
  return (
    <SectionCard title="Publication Tracker" subtitle="Submission to citation — the research output pipeline.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <KeyStat label="Submitted" value={p.submitted} tone={C.amber} />
        <KeyStat label="Accepted" value={p.accepted} tone={C.sky} />
        <KeyStat label="Published" value={p.published} tone={C.green} />
        <KeyStat label="Citations" value={p.citations} tone={C.purple} />
        <KeyStat label="Impact Factor" value={p.impactFactor} tone={C.navy} />
      </div>
    </SectionCard>
  );
}

// ── Section 13 · Grants & Funding ────────────────────────────────────────────────

function Funding({ cric }: { cric: ClinicalResearchIntelligence }) {
  const g = cric.grants;
  const availableNum = parseInt(g.available.replace(/\D/g, ''), 10) || 0;
  const totalNum = parseInt(g.label.replace(/\D/g, '').replace('M', ''), 10) || 482;
  const pct = Math.round((availableNum / Math.max(1, totalNum)) * 100);
  return (
    <SectionCard title="Grant Intelligence" subtitle="Live funding position across all studies.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <StatBox label="Total Funding" value={g.label} tone={C.green} />
        <StatBox label="Available" value={g.available} tone={C.sky} />
        <StatBox label="Utilized" value={g.utilized} tone={C.purple} />
        <StatBox label="Remaining" value={g.remaining} tone={C.amber} />
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
          <span>Funding position</span><span>{pct}% available</span>
        </div>
        <div style={{ height: 12, borderRadius: 6, background: '#eef2f8', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#0ea5e9)', borderRadius: 6 }} />
        </div>
      </div>
    </SectionCard>
  );
}

// ── Section 14 · Collaborations ──────────────────────────────────────────────────

function Collaborations({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <SectionCard title="Collaboration Map" subtitle="Academic, research, international and agency partners in one graph.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {cric.collaborations.map((c) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid #e3e9f2', background: '#fff' }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Network size={18} color={C.sky} /></span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{c.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{c.kind}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Section 15 · Population Intelligence ─────────────────────────────────────────

function Population({ cric }: { cric: ClinicalResearchIntelligence }) {
  const pg = cric.pregnancy;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <SectionCard title="Disease Trends" subtitle="Epidemiology automatically observed across the catchment.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {cric.diseasePeaks.map((d) => (
            <div key={d.disease} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e3e9f2', background: '#fff' }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{d.disease}</div>
              <div style={{ fontSize: 11, color: C.sky, fontWeight: 700 }}>Peak: {d.peak}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        <SectionCard title="Pregnancy Intelligence" subtitle="Observed maternal cohort.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <KeyStat label="Pregnant Women" value={pg.current} tone={C.sky} />
            <KeyStat label="Malaria" value={pg.malaria} tone={C.amber} />
            <KeyStat label="Diabetes" value={pg.diabetes} tone={C.purple} />
            <KeyStat label="Preeclampsia" value={pg.preeclampsia} tone={C.red} />
            <KeyStat label="Anaemia" value={pg.anaemia} tone={C.amber} />
          </div>
        </SectionCard>
        <SectionCard title="Treatment Outcomes" subtitle="Evidence across pathways.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cric.treatmentOutcomes.map((t) => (
              <div key={t.treatment} style={{ padding: 12, borderRadius: 10, border: '1px solid #e3e9f2', background: '#fff' }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{t.treatment}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
                  <Meta label="Response" value={t.outcome} tone={C.green} />
                  <Meta label="Complications" value={t.completion} tone={C.amber} />
                  <Meta label="Readmission" value={t.recurrence} tone={C.purple} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Section 16 · Real-time Wall ──────────────────────────────────────────────────

function Wall({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <SectionCard title="Real-time Research Wall" subtitle="Hospital-wide, live.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {cric.wall.map((w) => <KeyStat key={w.label} label={w.label} value={w.value} tone={C.sky} />)}
      </div>
    </SectionCard>
  );
}

// ── Section 17 · Executive Intelligence ──────────────────────────────────────────

function Executive({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <SectionCard title="Executive Intelligence" subtitle="What the CEO cares about.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {cric.executive.map((e) => (
          <div key={e.label} style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #e3e9f2', background: '#fff' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy }}>{e.value}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>{e.label}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── AI Research Studio ───────────────────────────────────────────────────────────

function ReStudioCard({ cric }: { cric: ClinicalResearchIntelligence }) {
  return (
    <SectionCard title="AI Research Studio" subtitle="Ask, and AMEXAN builds the dataset, regression and graphs.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#f0f4fa' }}>
        <Brain size={15} color={C.purple} />
        <span style={{ fontSize: 12, fontWeight: 600, color: C.slate }}>"{cric.assistant}"</span>
      </div>
      <button style={{ marginTop: 12, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#8b5cf6,#0ea5e9)', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Generate study</button>
    </SectionCard>
  );
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, margin: 0 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Meta({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: tone || C.navy }}>{value}</div>
    </div>
  );
}

function KeyStat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  const c = tone || C.navy;
  return (
    <div style={{ background: '#fff', border: '1px solid #e3e9f2', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #e3e9f2', background: tone + '0c', borderColor: tone }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: tone }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function Bar({ label, pct, tone }: { label: string; pct: number; tone: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, color: C.slate, marginBottom: 4 }}>
        <span>{label}</span><span style={{ color: tone }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: '#eef2f8', overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(3, pct)}%`, height: '100%', background: tone, borderRadius: 4 }} />
      </div>
    </div>
  );
}