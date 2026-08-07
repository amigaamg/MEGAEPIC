'use client';

// AMEXAN — Clinical Education & Professional Development Engine (Book V, dash. 12)
// The Facility Administrator runs the hospital's entire academic ecosystem, not a
// medical school. This centre consolidates CME, grand rounds, department teaching,
// morbidity & mortality meetings, journal clubs, clinical audits, simulation,
// competency, student rotations, residency, internship, CPD, research presentations
// and the unified teaching calendar into one constitutional engine.

import { useMemo, useState } from 'react';
import {
  LayoutDashboard, BarChart3, Stethoscope, Building2, Presentation, AlertTriangle,
  HeartPulse, BookOpen, ClipboardCheck, FlaskConical, Award, GraduationCap, UserCheck,
  ClipboardList, Medal, Microscope, CalendarDays, Sparkles, Plus,
} from 'lucide-react';
import {
  FacilityAdministrationEngine,
  type EducationMetrics,
  type EducationRecordDomain,
  type FacilityAdminModel,
} from '@/lib/amexan/facility';
import { C, Card, Kpi } from '../ui';

type EduNavId =
  | 'overview' | 'analytics'
  | 'cme' | 'grandRounds' | 'departmentTeaching' | 'morbidity' | 'mortality'
  | 'journalClub' | 'audits' | 'simulation' | 'competency' | 'rotations'
  | 'residency' | 'internship' | 'cpd' | 'research' | 'calendar';

const NAV_GROUPS: { label: string; items: { id: EduNavId; label: string; icon: any }[] }[] = [
  {
    label: 'Command',
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Education Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { id: 'cme', label: 'CME Centre', icon: Stethoscope },
      { id: 'grandRounds', label: 'Grand Rounds', icon: Building2 },
      { id: 'departmentTeaching', label: 'Department Teaching', icon: Presentation },
      { id: 'morbidity', label: 'Morbidity Meetings', icon: AlertTriangle },
      { id: 'mortality', label: 'Mortality Meetings', icon: HeartPulse },
      { id: 'journalClub', label: 'Journal Club', icon: BookOpen },
      { id: 'audits', label: 'Clinical Audits', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Centres',
    items: [
      { id: 'simulation', label: 'Simulation Centre', icon: FlaskConical },
      { id: 'competency', label: 'Competency Centre', icon: Award },
      { id: 'rotations', label: 'Student Rotations', icon: GraduationCap },
      { id: 'residency', label: 'Residency Programme', icon: UserCheck },
      { id: 'internship', label: 'Intern Programme', icon: ClipboardList },
    ],
  },
  {
    label: 'Professional',
    items: [
      { id: 'cpd', label: 'CPD', icon: Medal },
      { id: 'research', label: 'Research Presentations', icon: Microscope },
      { id: 'calendar', label: 'Teaching Calendar', icon: CalendarDays },
    ],
  },
];

const DAY = 86400000;

// Normalise a persisted education object (older models may lack the record
// arrays) so every view can read them safely.
function normalizeEducation(e: EducationMetrics | undefined): EducationMetrics {
  return {
    students: e?.students ?? 0, residents: e?.residents ?? 0, interns: e?.interns ?? 0,
    activeRotations: e?.activeRotations ?? 0, logbookEntries: e?.logbookEntries ?? 0,
    competenciesAssessed: e?.competenciesAssessed ?? 0, teachingSessions: e?.teachingSessions ?? 0,
    osceSessions: e?.osceSessions ?? 0, mandatoryTrainings: e?.mandatoryTrainings ?? 0,
    cpdCreditsEarned: e?.cpdCreditsEarned ?? 0, cpdCompliancePercent: e?.cpdCompliancePercent ?? 0,
    attendanceRatePercent: e?.attendanceRatePercent ?? 0, trainingHours: e?.trainingHours ?? 0,
    simulationHours: e?.simulationHours ?? 0,
    cmeSessions: e?.cmeSessions ?? [], grandRounds: e?.grandRounds ?? [],
    departmentTeaching: e?.departmentTeaching ?? [], morbidityMeetings: e?.morbidityMeetings ?? [],
    mortalityMeetings: e?.mortalityMeetings ?? [], journalClubs: e?.journalClubs ?? [],
    clinicalAudits: e?.clinicalAudits ?? [], simulationSessions: e?.simulationSessions ?? [],
    competencies: e?.competencies ?? [], rotations: e?.rotations ?? [],
    residency: e?.residency ?? [], internship: e?.internship ?? [],
    cpdRecords: e?.cpdRecords ?? [], researchPresentations: e?.researchPresentations ?? [],
    calendar: e?.calendar ?? [],
  };
}

const fmtDate = (t?: number) => (t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');

const toneOf = (t: string) => t === 'green' ? C.green : t === 'red' ? C.red : t === 'amber' ? C.amber : C.slate;

function Chip({ text, tone = 'slate' }: { text: string; tone?: 'green' | 'red' | 'amber' | 'slate' }) {
  const c = toneOf(tone);
  return <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${c}18`, color: c, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{text}</span>;
}

// ── Generic record list module (form + rows) ──────────────────────────────────

type FieldCfg = { key: string; label: string; placeholder?: string; type?: 'text' | 'number' | 'select' | 'date'; options?: string[] };
type Cell = { text?: string; strong?: boolean; muted?: boolean };
type RowDef = { key: string; cells: Cell[]; statusText?: string; statusTone?: 'green' | 'red' | 'amber' | 'slate' };
type KpiDef = { label: string; value: string | number; accent?: 'green' | 'red' | 'amber' };
type ModuleCfg = {
  id: EduNavId;
  title: string;
  subtitle: string;
  domain: EducationRecordDomain;
  kpis: (e: EducationMetrics) => KpiDef[];
  fields: FieldCfg[];
  submitLabel: string;
  rows: (e: EducationMetrics) => RowDef[];
  action?: { label: string; match: (r: any) => boolean; next: (r: any) => any; tone?: 'green' | 'red' };
};

function ModuleView({ cfg, edu, onAdd, onUpdate }: {
  cfg: ModuleCfg; edu: EducationMetrics;
  onAdd: (domain: EducationRecordDomain, rec: any) => void;
  onUpdate: (domain: EducationRecordDomain, id: string, patch: any) => void;
}) {
  const kpis = cfg.kpis(edu);
  const list = (edu[cfg.domain] as any[]) ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {kpis.map(k => <Kpi key={k.label} label={k.label} value={k.value} accent={k.accent} />)}
      </div>

      <RecordForm cfg={cfg} onSubmit={(vals) => onAdd(cfg.domain, buildRecord(cfg, vals))} />

      <Card title={`${cfg.title} Registry`} subtitle={`${list.length} record(s) on file — everything searchable from one place.`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {list.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No records yet. Add the first one above.</div>}
          {list.map(r => (
            <div key={r.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', flex: 1 }}>
                {cfg.rows(edu).find(x => x.key === r.id)?.cells.map((c, i) => (
                  <span key={i} style={{ fontWeight: c.strong ? 700 : 500, color: c.strong ? C.navy : c.muted ? C.muted : C.slate }}>{c.text ?? '—'}</span>
                ))}
              </div>
              {cfg.rows(edu).find(x => x.key === r.id)?.statusText && (() => {
                const rd = cfg.rows(edu).find(x => x.key === r.id)!;
                return <Chip text={rd.statusText!} tone={rd.statusTone} />;
              })()}
              {cfg.action && cfg.action.match(r) && (
                <button onClick={() => onUpdate(cfg.domain, r.id, cfg.action!.next(r))} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: cfg.action!.tone === 'red' ? C.red : C.green, color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>{cfg.action!.label}</button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function buildRecord(cfg: ModuleCfg, vals: Record<string, string>) {
  const rec: any = { id: `edu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` };
  cfg.fields.forEach(f => {
    const raw = vals[f.key] ?? '';
    if (f.type === 'number') rec[f.key] = Number(raw) || 0;
    else if (f.type === 'date') rec[f.key] = raw ? new Date(raw).getTime() : Date.now();
    else rec[f.key] = raw;
  });
  return rec;
}

function RecordForm({ cfg, onSubmit }: { cfg: ModuleCfg; onSubmit: (vals: Record<string, string>) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const fieldStyle: React.CSSProperties = { height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit' };
  return (
    <Card title={`Add ${cfg.title} Record`} subtitle="New entries synchronise to the teaching calendar, CPD and analytics automatically.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
        {cfg.fields.map(f => (
          f.type === 'select' ? (
            <select key={f.key} value={vals[f.key] ?? ''} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} style={fieldStyle}>
              <option value="">{f.placeholder ?? f.label}</option>
              {(f.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input key={f.key} type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'} value={vals[f.key] ?? ''} placeholder={f.placeholder ?? f.label} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} style={fieldStyle} />
          )
        ))}
      </div>
      <button onClick={() => onSubmit(vals)} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> {cfg.submitLabel}</button>
    </Card>
  );
}

// ── Module configurations ─────────────────────────────────────────────────────

const DEPARTMENTS = ['Medicine', 'Surgery', 'Emergency', 'Paediatrics', 'Obstetrics & Gynaecology', 'Orthopaedics', 'Cardiology', 'Pharmacy', 'Laboratory', 'Radiology', 'ICU', 'Nursing'];

const MODULES: ModuleCfg[] = [
  {
    id: 'cme', title: 'CME', subtitle: 'Continuing Medical Education — attendance, speakers, CPD credits, accreditation.',
    domain: 'cmeSessions',
    kpis: (e) => [
      { label: 'Scheduled CME', value: e.cmeSessions.length },
      { label: 'Total Attendance', value: e.cmeSessions.reduce((a, r) => a + (r.attendance || 0), 0) },
      { label: 'CPD Credits', value: e.cmeSessions.reduce((a, r) => a + (r.cpdCredits || 0), 0) },
      { label: 'Avg Attendance', value: e.cmeSessions.length ? `${Math.round(e.cmeSessions.reduce((a, r) => a + (r.attendance || 0), 0) / e.cmeSessions.length)}%` : '—' },
    ],
    fields: [
      { key: 'title', label: 'Topic' }, { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'speaker', label: 'Speaker' }, { key: 'durationHours', type: 'number', label: 'Duration (h)' },
      { key: 'cpdCredits', type: 'number', label: 'CPD Credits' }, { key: 'attendance', type: 'number', label: 'Attendance' },
      { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Schedule CME',
    rows: (e) => e.cmeSessions.map(r => ({
      key: r.id,
      cells: [
        { text: r.title, strong: true }, { text: r.department }, { text: r.speaker },
        { text: `${r.durationHours}h · ${r.cpdCredits} CPD` }, { text: `Att: ${r.attendance}`, muted: true }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'grandRounds', title: 'Grand Rounds', subtitle: 'Hospital-wide learning — patient presented, discussant, recommendations, follow-up.',
    domain: 'grandRounds',
    kpis: (e) => [
      { label: 'Grand Rounds', value: e.grandRounds.length },
      { label: 'Avg Attendance', value: e.grandRounds.length ? `${Math.round(e.grandRounds.reduce((a, r) => a + (r.attendance || 0), 0) / e.grandRounds.length)}%` : '—' },
      { label: 'Departments', value: new Set(e.grandRounds.map(r => r.department)).size },
    ],
    fields: [
      { key: 'patientPresented', label: 'Patient / Case Presented' }, { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'presenter', label: 'Presenter' }, { key: 'discussant', label: 'Discussant' },
      { key: 'attendance', type: 'number', label: 'Attendance' }, { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Add Grand Round',
    rows: (e) => e.grandRounds.map(r => ({
      key: r.id,
      cells: [
        { text: r.patientPresented, strong: true }, { text: r.department }, { text: `Presented: ${r.presenter}` },
        { text: `Discussant: ${r.discussant}` }, { text: `Att: ${r.attendance}`, muted: true }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'departmentTeaching', title: 'Department Teaching', subtitle: 'Morning reports, teaching rounds, case presentations, topic reviews, procedures, bedside teaching.',
    domain: 'departmentTeaching',
    kpis: (e) => [
      { label: 'Sessions', value: e.departmentTeaching.length },
      { label: 'Avg Attendance', value: e.departmentTeaching.length ? `${Math.round(e.departmentTeaching.reduce((a, r) => a + (r.attendance || 0), 0) / e.departmentTeaching.length)}%` : '—' },
      { label: 'Departments', value: new Set(e.departmentTeaching.map(r => r.department)).size },
    ],
    fields: [
      { key: 'kind', type: 'select', label: 'Type', options: ['Morning Report', 'Teaching Ward Round', 'Case Presentation', 'Topic Review', 'Procedure Demonstration', 'Bedside Teaching'] },
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'title', label: 'Title' }, { key: 'attendance', type: 'number', label: 'Attendance' },
      { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Log Session',
    rows: (e) => e.departmentTeaching.map(r => ({
      key: r.id,
      cells: [
        { text: r.kind, strong: true }, { text: r.department }, { text: r.title },
        { text: `Att: ${r.attendance}`, muted: true }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'morbidity', title: 'Morbidity Meetings', subtitle: 'Cases reviewed, lessons learned, action plans — fully searchable, no spreadsheets.',
    domain: 'morbidityMeetings',
    kpis: (e) => [
      { label: 'Meetings', value: e.morbidityMeetings.length },
      { label: 'Cases Reviewed', value: e.morbidityMeetings.reduce((a, r) => a + (r.casesReviewed || 0), 0) },
      { label: 'Avg Attendance', value: e.morbidityMeetings.length ? `${Math.round(e.morbidityMeetings.reduce((a, r) => a + (r.attendance || 0), 0) / e.morbidityMeetings.length)}%` : '—' },
    ],
    fields: [
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'casesReviewed', type: 'number', label: 'Cases Reviewed' },
      { key: 'lessonsLearned', label: 'Lessons Learned' }, { key: 'actionPlans', label: 'Action Plan' },
      { key: 'attendance', type: 'number', label: 'Attendance' }, { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Log Morbidity Meeting',
    rows: (e) => e.morbidityMeetings.map(r => ({
      key: r.id,
      cells: [
        { text: r.department, strong: true }, { text: `${r.casesReviewed} cases` },
        { text: r.lessonsLearned }, { text: r.actionPlans }, { text: `Att: ${r.attendance}`, muted: true }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'mortality', title: 'Mortality Meetings', subtitle: 'Deaths reviewed, avoidability, contributing factors, committee decision, action items, protocol changes.',
    domain: 'mortalityMeetings',
    kpis: (e) => [
      { label: 'Meetings', value: e.mortalityMeetings.length },
      { label: 'Deaths Reviewed', value: e.mortalityMeetings.reduce((a, r) => a + (r.deathsReviewed || 0), 0) },
      { label: 'Protocol Changes', value: e.mortalityMeetings.filter(r => r.protocolChanges && r.protocolChanges !== '—').length },
    ],
    fields: [
      { key: 'deathsReviewed', type: 'number', label: 'Deaths Reviewed' },
      { key: 'avoidability', label: 'Avoidability' }, { key: 'contributingFactors', label: 'Contributing Factors' },
      { key: 'committeeDecision', label: 'Committee Decision' }, { key: 'actionItems', label: 'Action Items' },
      { key: 'protocolChanges', label: 'Protocol Changes' }, { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Log Mortality Review',
    rows: (e) => e.mortalityMeetings.map(r => ({
      key: r.id,
      cells: [
        { text: `${r.deathsReviewed} deaths`, strong: true }, { text: `Avoidability: ${r.avoidability}` },
        { text: r.contributingFactors }, { text: `Decision: ${r.committeeDecision}` },
        { text: `Actions: ${r.actionItems}` }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'journalClub', title: 'Journal Club', subtitle: 'Article, presenter, critical appraisal, discussion, recommendations.',
    domain: 'journalClubs',
    kpis: (e) => [
      { label: 'Sessions', value: e.journalClubs.length },
      { label: 'Avg Attendance', value: e.journalClubs.length ? `${Math.round(e.journalClubs.reduce((a, r) => a + (r.attendance || 0), 0) / e.journalClubs.length)}%` : '—' },
      { label: 'Departments', value: new Set(e.journalClubs.map(r => r.department)).size },
    ],
    fields: [
      { key: 'article', label: 'Article' }, { key: 'presenter', label: 'Presenter' },
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'criticalAppraisal', label: 'Critical Appraisal' }, { key: 'recommendations', label: 'Recommendations' },
      { key: 'attendance', type: 'number', label: 'Attendance' }, { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Log Journal Club',
    rows: (e) => e.journalClubs.map(r => ({
      key: r.id,
      cells: [
        { text: r.article, strong: true }, { text: r.presenter }, { text: r.department },
        { text: r.criticalAppraisal }, { text: r.recommendations }, { text: `Att: ${r.attendance}`, muted: true }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'audits', title: 'Clinical Audit', subtitle: 'Completed & current audits, recommendations, compliance, re-audit, department performance.',
    domain: 'clinicalAudits',
    kpis: (e) => [
      { label: 'Completed', value: e.clinicalAudits.filter(r => r.status === 'completed').length, accent: 'green' },
      { label: 'In Progress', value: e.clinicalAudits.filter(r => r.status === 'in_progress').length, accent: 'amber' },
      { label: 'Planned', value: e.clinicalAudits.filter(r => r.status === 'planned').length },
      { label: 'Avg Compliance', value: e.clinicalAudits.filter(r => r.compliancePercent).length ? `${Math.round(e.clinicalAudits.reduce((a, r) => a + (r.compliancePercent || 0), 0) / e.clinicalAudits.filter(r => r.compliancePercent).length)}%` : '—' },
    ],
    fields: [
      { key: 'title', label: 'Audit Title' }, { key: 'type', type: 'select', label: 'Type', options: ['Compliance Audit', 'Documentation Audit', 'Clinical Audit', 'Re-audit'] },
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'status', type: 'select', label: 'Status', options: ['planned', 'in_progress', 'completed'] },
      { key: 'compliancePercent', type: 'number', label: 'Compliance %' }, { key: 'date', type: 'date', label: 'Start Date' },
    ],
    submitLabel: 'Register Audit',
    rows: (e) => e.clinicalAudits.map(r => ({
      key: r.id,
      cells: [
        { text: r.title, strong: true }, { text: r.type }, { text: r.department },
        { text: r.compliancePercent ? `Compliance ${r.compliancePercent}%` : '—' }, { text: `Re-audit ${fmtDate(r.reauditDue)}`, muted: true }, { text: fmtDate(r.date), muted: true },
      ],
      statusText: r.status.replace('_', ' '),
      statusTone: r.status === 'completed' ? 'green' : r.status === 'in_progress' ? 'amber' : 'slate',
    })),
    action: {
      label: 'Mark Completed', tone: 'green',
      match: (r) => r.status !== 'completed',
      next: () => ({ status: 'completed' }),
    },
  },
  {
    id: 'simulation', title: 'Simulation Centre', subtitle: 'Code Blue, mass casualty, fire, neonatal resuscitation, trauma, difficult airway, disaster preparedness.',
    domain: 'simulationSessions',
    kpis: (e) => [
      { label: 'Sessions', value: e.simulationSessions.length },
      { label: 'Participants', value: e.simulationSessions.reduce((a, r) => a + (r.participants || 0), 0) },
      { label: 'Simulation Hours', value: e.simulationHours },
    ],
    fields: [
      { key: 'scenario', label: 'Scenario' }, { key: 'type', type: 'select', label: 'Type', options: ['Code Blue', 'Mass Casualty', 'Fire', 'Neonatal Resuscitation', 'Trauma', 'Difficult Airway', 'Disaster Preparedness'] },
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'participants', type: 'number', label: 'Participants' }, { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Schedule Simulation',
    rows: (e) => e.simulationSessions.map(r => ({
      key: r.id,
      cells: [
        { text: r.scenario, strong: true }, { text: r.type }, { text: r.department },
        { text: `${r.participants} participants` }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
  {
    id: 'competency', title: 'Competency Centre', subtitle: 'Doctors, nurses, laboratory, radiology, pharmacy, ICT, finance — ATLS, ACLS, BLS, resuscitation, ultrasound, procedures, research, leadership.',
    domain: 'competencies',
    kpis: (e) => [
      { label: 'Tracked', value: e.competencies.length },
      { label: 'Pending', value: e.competencies.filter(r => r.status === 'pending').length, accent: 'amber' },
      { label: 'Expiring 30d', value: e.competencies.filter(r => r.status === 'expiring').length, accent: 'red' },
      { label: 'Completed', value: e.competencies.filter(r => r.status === 'completed').length, accent: 'green' },
    ],
    fields: [
      { key: 'staffCategory', type: 'select', label: 'Staff Group', options: ['Doctors', 'Nurses', 'Laboratory', 'Radiology', 'Pharmacy', 'ICT', 'Finance'] },
      { key: 'competency', label: 'Competency' }, { key: 'staffCount', type: 'number', label: 'Staff Count' },
      { key: 'dueDate', type: 'date', label: 'Due Date' },
      { key: 'status', type: 'select', label: 'Status', options: ['pending', 'completed', 'expiring'] },
    ],
    submitLabel: 'Add Competency',
    rows: (e) => e.competencies.map(r => ({
      key: r.id,
      cells: [
        { text: r.competency, strong: true }, { text: r.staffCategory }, { text: `${r.staffCount} staff` },
        { text: `Due ${fmtDate(r.dueDate)}`, muted: true },
      ],
      statusText: r.status,
      statusTone: r.status === 'completed' ? 'green' : r.status === 'expiring' ? 'red' : 'amber',
    })),
    action: {
      label: 'Complete', tone: 'green',
      match: (r) => r.status !== 'completed',
      next: () => ({ status: 'completed' }),
    },
  },
  {
    id: 'rotations', title: 'Student Rotations', subtitle: 'Universities, students, departments, rotations, logbooks, attendance, assessments.',
    domain: 'rotations',
    kpis: (e) => [
      { label: 'Active Rotations', value: e.rotations.filter(r => r.status === 'active').length, accent: 'green' },
      { label: 'Universities', value: new Set(e.rotations.map(r => r.university)).size },
      { label: 'Students Placed', value: e.rotations.length },
    ],
    fields: [
      { key: 'university', label: 'University' }, { key: 'student', label: 'Student / Cohort' },
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'rotation', label: 'Rotation' }, { key: 'status', type: 'select', label: 'Status', options: ['upcoming', 'active', 'completed'] },
      { key: 'date', type: 'date', label: 'Start Date' },
    ],
    submitLabel: 'Place Rotation',
    rows: (e) => e.rotations.map(r => ({
      key: r.id,
      cells: [
        { text: r.student, strong: true }, { text: r.university }, { text: r.department },
        { text: r.rotation }, { text: fmtDate(r.date), muted: true },
      ],
      statusText: r.status,
      statusTone: r.status === 'active' ? 'green' : r.status === 'completed' ? 'slate' : 'amber',
    })),
  },
  {
    id: 'residency', title: 'Residency Programme', subtitle: 'Residents, supervisors, procedures, rotations, assessments, research, examinations.',
    domain: 'residency',
    kpis: (e) => [
      { label: 'Residents', value: e.residency.length },
      { label: 'On Track', value: e.residency.filter(r => r.status === 'on_track').length, accent: 'green' },
      { label: 'At Risk', value: e.residency.filter(r => r.status === 'at_risk').length, accent: 'red' },
    ],
    fields: [
      { key: 'trainee', label: 'Resident' }, { key: 'supervisor', label: 'Supervisor' },
      { key: 'rotation', label: 'Rotation' }, { key: 'procedures', type: 'number', label: 'Procedures' },
      { key: 'assessmentScore', type: 'number', label: 'Assessment %' },
      { key: 'status', type: 'select', label: 'Status', options: ['on_track', 'at_risk'] },
      { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Add Resident Record',
    rows: (e) => e.residency.map(r => ({
      key: r.id,
      cells: [
        { text: r.trainee, strong: true }, { text: r.supervisor }, { text: r.rotation },
        { text: `${r.procedures} procedures` }, { text: `Assessed ${r.assessmentScore}%` }, { text: fmtDate(r.date), muted: true },
      ],
      statusText: r.status.replace('_', ' '),
      statusTone: r.status === 'on_track' ? 'green' : 'red',
    })),
  },
  {
    id: 'internship', title: 'Intern Programme', subtitle: 'Intern rotations, skills, supervision, logbooks, assessments, sign-offs.',
    domain: 'internship',
    kpis: (e) => [
      { label: 'Interns', value: e.internship.length },
      { label: 'On Track', value: e.internship.filter(r => r.status === 'on_track').length, accent: 'green' },
      { label: 'Behind', value: e.internship.filter(r => r.status === 'behind_schedule').length, accent: 'red' },
    ],
    fields: [
      { key: 'trainee', label: 'Intern' }, { key: 'rotation', label: 'Rotation' },
      { key: 'skillsSigned', type: 'number', label: 'Skills Signed' }, { key: 'logbookEntries', type: 'number', label: 'Logbook Entries' },
      { key: 'supervision', label: 'Supervisor' }, { key: 'status', type: 'select', label: 'Status', options: ['on_track', 'behind_schedule'] },
      { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Add Intern Record',
    rows: (e) => e.internship.map(r => ({
      key: r.id,
      cells: [
        { text: r.trainee, strong: true }, { text: r.rotation }, { text: `${r.skillsSigned} skills` },
        { text: `${r.logbookEntries} logbook` }, { text: r.supervision }, { text: fmtDate(r.date), muted: true },
      ],
      statusText: r.status.replace('_', ' '),
      statusTone: r.status === 'on_track' ? 'green' : 'red',
    })),
  },
  {
    id: 'cpd', title: 'CPD Centre', subtitle: 'Doctors, nurses, pharmacists, laboratory, radiographers — credits required, completed, outstanding.',
    domain: 'cpdRecords',
    kpis: (e) => {
      const active = e.cpdRecords.length ? e.cpdRecords : [];
      const compliance = active.length ? Math.round(active.reduce((a, r) => a + ((r.creditsObtained || 0) / Math.max(r.creditsRequired || 1, 1)), 0) / active.length * 100) : e.cpdCompliancePercent;
      return [
        { label: 'CPD Compliance', value: `${compliance}%`, accent: compliance >= 90 ? 'green' : compliance >= 70 ? 'amber' : 'red' },
        { label: 'Due / Overdue', value: active.filter(r => r.status !== 'current').length, accent: active.some(r => r.status === 'overdue') ? 'red' : 'amber' },
        { label: 'Credits Earned', value: active.reduce((a, r) => a + (r.creditsObtained || 0), 0) || e.cpdCreditsEarned },
      ];
    },
    fields: [
      { key: 'professionalCategory', type: 'select', label: 'Professional Group', options: ['Doctors', 'Nurses', 'Pharmacists', 'Laboratory', 'Radiographers'] },
      { key: 'creditsRequired', type: 'number', label: 'Credits Required' },
      { key: 'creditsObtained', type: 'number', label: 'Credits Obtained' },
      { key: 'renewalDate', type: 'date', label: 'Renewal Date' },
      { key: 'status', type: 'select', label: 'Status', options: ['current', 'due', 'overdue'] },
    ],
    submitLabel: 'Add CPD Record',
    rows: (e) => e.cpdRecords.map(r => ({
      key: r.id,
      cells: [
        { text: r.professionalCategory, strong: true }, { text: `${r.creditsObtained}/${r.creditsRequired} credits` },
        { text: `Renewal ${fmtDate(r.renewalDate)}`, muted: true },
      ],
      statusText: r.status,
      statusTone: r.status === 'current' ? 'green' : r.status === 'overdue' ? 'red' : 'amber',
    })),
    action: {
      label: 'Mark Current', tone: 'green',
      match: (r) => r.status !== 'current',
      next: () => ({ status: 'current' }),
    },
  },
  {
    id: 'research', title: 'Research Presentations', subtitle: 'Research meetings, protocol presentations, grant presentations, thesis defences, publications.',
    domain: 'researchPresentations',
    kpis: (e) => [
      { label: 'Presentations', value: e.researchPresentations.length },
      { label: 'Kinds', value: new Set(e.researchPresentations.map(r => r.kind)).size },
      { label: 'Research Output', value: e.researchPresentations.length },
    ],
    fields: [
      { key: 'kind', type: 'select', label: 'Kind', options: ['Research Meeting', 'Protocol Presentation', 'Grant Presentation', 'Thesis Defence', 'Publication'] },
      { key: 'title', label: 'Title' }, { key: 'presenter', label: 'Presenter' },
      { key: 'department', type: 'select', label: 'Department', options: DEPARTMENTS },
      { key: 'date', type: 'date', label: 'Date' },
    ],
    submitLabel: 'Add Presentation',
    rows: (e) => e.researchPresentations.map(r => ({
      key: r.id,
      cells: [
        { text: r.title, strong: true }, { text: r.kind }, { text: r.presenter },
        { text: r.department }, { text: fmtDate(r.date), muted: true },
      ],
    })),
  },
];

// ── Shared event / recommendation helpers ─────────────────────────────────────

function allEvents(e: EducationMetrics) {
  const ev: { kind: string; title: string; date: number }[] = [];
  const push = (kind: string, arr: any[], fn: (r: any) => string) => (arr ?? []).forEach(r => ev.push({ kind, title: fn(r), date: r.date }));
  push('CME', e.cmeSessions, r => r.title);
  push('Grand Round', e.grandRounds, r => r.patientPresented);
  push('Department Teaching', e.departmentTeaching, r => `${r.kind} — ${r.title}`);
  push('Morbidity Meeting', e.morbidityMeetings, r => `${r.department} M&M`);
  push('Mortality Meeting', e.mortalityMeetings, r => `Mortality review — ${r.deathsReviewed} death(s)`);
  push('Journal Club', e.journalClubs, r => r.article);
  push('Clinical Audit', e.clinicalAudits, r => r.title);
  push('Simulation', e.simulationSessions, r => r.scenario);
  push('Research Presentation', e.researchPresentations, r => r.title);
  (e.calendar ?? []).forEach(r => ev.push({ kind: r.kind, title: r.title, date: r.date }));
  return ev.sort((a, b) => a.date - b.date);
}

function buildRecommendations(e: EducationMetrics) {
  const recs: { text: string; tone: 'green' | 'red' | 'amber' | 'slate' }[] = [];
  const now = Date.now();
  const monthAgo = now - 30 * DAY;
  if (!e.simulationSessions.some(s => s.date >= monthAgo)) {
    recs.push({ text: 'No simulation in the last month — schedule a neonatal resuscitation / disaster drill.', tone: 'amber' });
  }
  const lowCpd = e.cpdRecords.filter(r => (r.creditsObtained || 0) < (r.creditsRequired || 1) * 0.8);
  if (lowCpd.length) {
    recs.push({ text: `${lowCpd.map(r => r.professionalCategory).join(', ')} CPD compliance has fallen below target — alert before licence renewal.`, tone: 'red' });
  }
  if (!e.mortalityMeetings.some(r => r.date >= monthAgo)) {
    recs.push({ text: 'Three departments have overdue mortality reviews.', tone: 'red' });
  }
  const acls = e.competencies.filter(c => /acls|als/i.test(c.competency) && c.status !== 'completed');
  if (acls.length) {
    const pct = Math.round((e.competencies.filter(c => /acls|als/i.test(c.competency)).length - acls.length) / Math.max(e.competencies.filter(c => /acls|als/i.test(c.competency)).length, 1) * 100);
    recs.push({ text: `ACLS completion among trainees stands at ${pct}% — ${acls.length} record(s) still pending.`, tone: pct < 70 ? 'red' : 'amber' });
  }
  const grAvg = e.grandRounds.length ? e.grandRounds.reduce((a, r) => a + (r.attendance || 0), 0) / e.grandRounds.length : 0;
  if (e.grandRounds.length && grAvg < 70) {
    recs.push({ text: `Low Grand Round attendance (avg ${Math.round(grAvg)}) — consider protected teaching time.`, tone: 'amber' });
  }
  const expiring = e.competencies.filter(c => c.status === 'expiring');
  if (expiring.length) {
    recs.push({ text: `${expiring.length} competency renewal(s) due within 30 days (${expiring.map(c => c.competency).slice(0, 2).join(', ')}) — schedule renewal sessions.`, tone: 'amber' });
  }
  if (!recs.length) {
    recs.push({ text: 'Academic ecosystem healthy — no teaching gaps detected.', tone: 'green' });
  }
  return recs;
}

// ── Main centre ───────────────────────────────────────────────────────────────

export function EducationCenter({ model, onSave }: {
  model: FacilityAdminModel;
  onSave: (fn: (m: FacilityAdminModel) => FacilityAdminModel) => void;
}) {
  const [tab, setTab] = useState<EduNavId>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const edu = useMemo(() => normalizeEducation(model.education), [model.education]);

  const onAdd = (domain: EducationRecordDomain, rec: any) =>
    onSave(m => FacilityAdministrationEngine.addEducationRecord(m, m.administratorId, domain, rec));
  const onUpdate = (domain: EducationRecordDomain, id: string, patch: any) =>
    onSave(m => FacilityAdministrationEngine.updateEducationRecord(m, m.administratorId, domain, id, patch));
  const onPatch = (patch: Partial<EducationMetrics>) =>
    onSave(m => FacilityAdministrationEngine.updateEducation(m, m.administratorId, patch));

  const activeCfg = MODULES.find(c => c.id === tab);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minWidth: 0 }}>
      <style>{`.edu-subnav{display:flex;flex-direction:column;gap:2px}.edu-subnav--open{display:block!important}@media(max-width:900px){.edu-subnav{display:none;position:fixed;z-index:25;left:0;right:0;top:60px;bottom:0;overflow-y:auto;background:#fff;padding:14px}.edu-subnav--open{display:block!important}}`}</style>
      <aside className={`edu-subnav${mobileOpen ? ' edu-subnav--open' : ''}`} style={{ width: 218, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 10px', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.navy, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 12px 8px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
          Clinical Education
        </div>
        {NAV_GROUPS.map(g => (
          <div key={g.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', padding: '4px 12px' }}>{g.label}</div>
            {g.items.map(it => {
              const Icon = it.icon;
              const active = tab === it.id;
              return (
                <button key={it.id} onClick={() => { setTab(it.id); setMobileOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12,
                  fontWeight: active ? 700 : 500, color: active ? C.sky : C.slate, background: active ? C.skyLight : 'transparent',
                }}>
                  <Icon size={14} /> {it.label}
                </button>
              );
            })}
          </div>
        ))}
        <button onClick={() => { setMobileOpen(false); setTab('overview'); }} style={{ marginTop: 8, padding: '7px 12px', borderRadius: 8, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 11, color: C.muted, background: 'transparent', fontFamily: 'inherit' }}>
          ← Back to Command Center
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'overview' && <OverviewView edu={edu} onPatch={onPatch} />}
        {tab === 'analytics' && <AnalyticsView edu={edu} />}
        {tab === 'calendar' && <CalendarView edu={edu} onAdd={onAdd} />}
        {activeCfg && tab !== 'overview' && tab !== 'analytics' && tab !== 'calendar' && (
          <ModuleView cfg={activeCfg} edu={edu} onAdd={onAdd} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

// ── Overview dashboard ────────────────────────────────────────────────────────

function OverviewView({ edu, onPatch }: {
  edu: EducationMetrics;
  onPatch: (patch: Partial<EducationMetrics>) => void;
}) {
  const [now] = useState(() => Date.now());
  const events = allEvents(edu);
  const upcoming = events.filter(e => e.date >= now - DAY);
  const todayItems = upcoming.length ? upcoming.slice(0, 5) : events.slice(0, 5);
  const recs = buildRecommendations(edu);
  const trainees = edu.students + edu.residents + edu.interns;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: '16px 18px', borderRadius: 14, background: 'linear-gradient(120deg,#0b2c4d 0%,#0ea5e9 130%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 17 }}>
          <GraduationCap size={20} /> Clinical Education & Professional Development Engine
        </div>
        <div style={{ fontSize: 12, opacity: .85, marginTop: 4, maxWidth: 720 }}>
          Continuous learning, competency, accreditation and clinical excellence across the hospital — consultants, nurses, pharmacists, laboratory scientists, ICT, finance, residents, interns and students. One constitutional engine for the entire academic ecosystem.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="Upcoming CMEs" value={edu.cmeSessions.length} />
        <Kpi label="Grand Rounds" value={edu.grandRounds.length} />
        <Kpi label="Morbidity Meetings" value={edu.morbidityMeetings.length} />
        <Kpi label="Mortality Meetings" value={edu.mortalityMeetings.length} />
        <Kpi label="Journal Clubs" value={edu.journalClubs.length} />
        <Kpi label="Clinical Audits" value={edu.clinicalAudits.length} />
        <Kpi label="Simulation Sessions" value={edu.simulationSessions.length} />
        <Kpi label="Mandatory Trainings" value={edu.competencies.filter(c => c.status === 'pending').length || edu.mandatoryTrainings} accent="amber" />
        <Kpi label="CPD Compliance" value={`${edu.cpdCompliancePercent}%`} accent={edu.cpdCompliancePercent >= 90 ? 'green' : edu.cpdCompliancePercent >= 70 ? 'amber' : 'red'} />
        <Kpi label="Research Presentations" value={edu.researchPresentations.length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <Card title="Today's Academic Activities" subtitle="Unified across every teaching module — synchronised automatically.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayItems.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? C.green : C.sky }} />
                <span style={{ fontWeight: 700, flex: 1 }}>{e.title}</span>
                <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{e.kind}</span>
              </div>
            ))}
            {todayItems.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Nothing scheduled. Add teaching from any module.</div>}
          </div>
        </Card>

        <Card title="AI Recommendations" subtitle="Generated from teaching, competency, audit and CPD data." action={<Sparkles size={15} color={C.purple} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recs.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: `${toneOf(r.tone)}10`, fontSize: 12, color: C.navy }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: toneOf(r.tone), marginTop: 4, flexShrink: 0 }} />
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Training Programme Overview" subtitle="Trainees across the hospital — not just students.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          <TraineeStat label="Students" value={edu.students} total={trainees} />
          <TraineeStat label="Residents" value={edu.residents} total={trainees} />
          <TraineeStat label="Interns" value={edu.interns} total={trainees} />
          <TraineeStat label="Active Rotations" value={edu.activeRotations} total={Math.max(edu.activeRotations, 1)} />
          <TraineeStat label="Competencies Assessed" value={edu.competenciesAssessed} total={Math.max(edu.competenciesAssessed, 1)} />
          <TraineeStat label="Logbook Entries" value={edu.logbookEntries} total={Math.max(edu.logbookEntries, 1)} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => onPatch({ osceSessions: edu.osceSessions + 1 })} style={btn}>+ OSCE Session</button>
          <button onClick={() => onPatch({ teachingSessions: edu.teachingSessions + 1 })} style={btn}>+ Teaching Session</button>
          <button onClick={() => onPatch({ cpdCompliancePercent: Math.min(100, edu.cpdCompliancePercent + 1) })} style={btn}>+ CPD Compliance</button>
        </div>
      </Card>
    </div>
  );
}

function TraineeStat({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ height: 4, borderRadius: 4, background: '#e5ecf5', marginTop: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: C.sky, borderRadius: 4 }} />
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.navy, fontSize: 11, fontWeight: 700, cursor: 'pointer' };

// ── Education Analytics ───────────────────────────────────────────────────────

function AnalyticsView({ edu }: { edu: EducationMetrics }) {
  const teachingTotal = edu.cmeSessions.length + edu.grandRounds.length + edu.departmentTeaching.length + edu.morbidityMeetings.length + edu.mortalityMeetings.length + edu.journalClubs.length + edu.simulationSessions.length + edu.researchPresentations.length;
  const deptCounts = new Map<string, number>();
  ([
    ...edu.cmeSessions, ...edu.grandRounds, ...edu.departmentTeaching, ...edu.morbidityMeetings,
    ...edu.journalClubs, ...edu.clinicalAudits, ...edu.simulationSessions, ...edu.researchPresentations,
  ]).forEach(r => { const d = (r as any).department; if (d) deptCounts.set(d, (deptCounts.get(d) ?? 0) + 1); });
  const depts = [...deptCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const cpdTotal = edu.cpdRecords.reduce((a, r) => a + (r.creditsObtained || 0), 0);
  const cpdReq = edu.cpdRecords.reduce((a, r) => a + (r.creditsRequired || 0), 0);
  const compliance = cpdReq ? Math.round((cpdTotal / cpdReq) * 100) : edu.cpdCompliancePercent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="Teaching Sessions" value={teachingTotal} />
        <Kpi label="Attendance Rate" value={`${edu.attendanceRatePercent}%`} />
        <Kpi label="Competencies Completed" value={edu.competencies.filter(c => c.status === 'completed').length} accent="green" />
        <Kpi label="CPD Compliance" value={`${compliance}%`} accent={compliance >= 90 ? 'green' : compliance >= 70 ? 'amber' : 'red'} />
        <Kpi label="Training Hours" value={edu.trainingHours} />
        <Kpi label="Simulation Hours" value={edu.simulationHours} />
        <Kpi label="Residents Progress" value={`${edu.residency.length ? Math.round(edu.residency.filter(r => r.status === 'on_track').length / edu.residency.length * 100) : 0}%`} accent="green" />
        <Kpi label="Intern Progress" value={`${edu.internship.length ? Math.round(edu.internship.filter(r => r.status === 'on_track').length / edu.internship.length * 100) : 0}%`} accent="green" />
        <Kpi label="Student Distribution" value={edu.students + edu.residents + edu.interns} />
        <Kpi label="Research Output" value={edu.researchPresentations.length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <Card title="Department Participation" subtitle="Teaching & audit activity by department across all modules.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {depts.map(([d, n]) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 140, fontWeight: 600, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 6, background: '#e5ecf5', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(n / Math.max(...depts.map(x => x[1]), 1)) * 100}%`, background: C.sky, borderRadius: 6 }} />
                </div>
                <span style={{ fontWeight: 700, color: C.navy, width: 24, textAlign: 'right' }}>{n}</span>
              </div>
            ))}
            {depts.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No department teaching data yet.</div>}
          </div>
        </Card>

        <Card title="CPD Compliance by Professional Group" subtitle="Credits obtained vs required, grouped by licence category.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {edu.cpdRecords.map(r => {
              const pct = r.creditsRequired ? Math.round((r.creditsObtained / r.creditsRequired) * 100) : 0;
              const tone = pct >= 90 ? C.green : pct >= 70 ? C.amber : C.red;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ width: 130, fontWeight: 600, color: C.navy }}>{r.professionalCategory}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 6, background: '#e5ecf5', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: tone, borderRadius: 6 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: tone, width: 58, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
            {edu.cpdRecords.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No CPD records yet.</div>}
          </div>
        </Card>
      </div>

      <Card title="Teaching Session Mix" subtitle="Distribution across the hospital's academic activities.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          <MixStat label="CME" value={edu.cmeSessions.length} />
          <MixStat label="Grand Rounds" value={edu.grandRounds.length} />
          <MixStat label="Dept Teaching" value={edu.departmentTeaching.length} />
          <MixStat label="Morbidity" value={edu.morbidityMeetings.length} />
          <MixStat label="Mortality" value={edu.mortalityMeetings.length} />
          <MixStat label="Journal Club" value={edu.journalClubs.length} />
          <MixStat label="Audits" value={edu.clinicalAudits.length} />
          <MixStat label="Simulation" value={edu.simulationSessions.length} />
          <MixStat label="Research" value={edu.researchPresentations.length} />
        </div>
      </Card>
    </div>
  );
}

function MixStat({ label, value }: { label: string; value: number }) {
  return <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{value}</div><div style={{ fontSize: 10, color: C.muted }}>{label}</div></div>;
}

// ── Teaching Calendar (unified, everything synchronised) ──────────────────────

function CalendarView({ edu, onAdd }: {
  edu: EducationMetrics;
  onAdd: (domain: EducationRecordDomain, rec: any) => void;
}) {
  const [now] = useState(() => Date.now());
  const events = allEvents(edu);
  const upcoming = events.filter(e => e.date >= now - DAY);
  const past = events.filter(e => e.date < now - DAY).slice(-12).reverse();
  const [vals, setVals] = useState<Record<string, string>>({});
  const submit = () => {
    onAdd('calendar', {
      id: `cal-${Date.now().toString(36)}`, kind: vals.kind || 'Teaching', title: vals.title || 'Untitled session',
      audience: vals.audience || 'all clinical', date: vals.date ? new Date(vals.date).getTime() : Date.now(),
    });
    setVals({});
  };
  const fieldStyle: React.CSSProperties = { height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="Upcoming" value={upcoming.length} />
        <Kpi label="Total Scheduled" value={events.length} />
        <Kpi label="Types" value={new Set(events.map(e => e.kind)).size} />
      </div>

      <Card title="Add Teaching Event" subtitle="One calendar for grand rounds, CMEs, journal clubs, mortality meetings, department teaching, simulation, research, OSCE and external conferences.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
          <select value={vals.kind ?? ''} onChange={e => setVals({ ...vals, kind: e.target.value })} style={fieldStyle}>
            <option value="">Kind</option>
            {['Grand Round', 'CME', 'Journal Club', 'Morbidity Meeting', 'Mortality Meeting', 'Department Teaching', 'Simulation', 'Research', 'OSCE', 'External Conference'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={vals.title ?? ''} onChange={e => setVals({ ...vals, title: e.target.value })} placeholder="Title" style={fieldStyle} />
          <input value={vals.audience ?? ''} onChange={e => setVals({ ...vals, audience: e.target.value })} placeholder="Audience" style={fieldStyle} />
          <input type="date" value={vals.date ?? ''} onChange={e => setVals({ ...vals, date: e.target.value })} style={fieldStyle} />
          <button onClick={submit} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Event</button>
        </div>
      </Card>

      <Card title="Upcoming Schedule" subtitle="Merged from every module — nothing scheduled twice, everything visible in one place.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {upcoming.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No upcoming teaching scheduled.</div>}
          {upcoming.slice(0, 16).map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? C.green : C.sky, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, flex: 1 }}>{e.title}</span>
              <span style={{ fontSize: 10, color: C.muted }}>{e.kind}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.navy, whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</span>
            </div>
          ))}
        </div>
      </Card>

      {past.length > 0 && (
        <Card title="Recently Completed" subtitle="Past teaching activity, retained for the audit trail.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {past.slice(0, 8).map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.muted, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{e.title}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{e.kind}</span>
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
