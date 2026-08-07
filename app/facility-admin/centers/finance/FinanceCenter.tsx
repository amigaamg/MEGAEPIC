'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// FIROC — Financial Intelligence & Revenue Operations Center (Engine XVI)
//
// Not bookkeeping — the hospital's financial nervous system. One universal,
// realtime, accountable surface for every source of money (patients, insurance,
// corporates, government, donors, research, telemedicine, outreach) and every
// cost (drugs, payroll, assets, procurement, disease burden). The executive
// ledger persists into the real FinancialMetrics via onPatch; the rest is
// seeded intelligence for planning.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, Receipt, ShieldCheck, ClipboardList, Banknote, Wallet,
  Landmark, Boxes, Pill, Building2, Activity, Stethoscope, FlaskConical, Server, FileText,
  ScrollText, BadgeCheck, Percent, HandCoins, Sparkles, Search, ChevronRight, Truck, IdCard,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Treemap, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import * as D from './FinanceData';
import { C } from '../../ui';

const MONEY = (n: number) => `KES ${n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : String(n)}`;
const FULL = (n: number) => 'KES ' + Math.round(n).toLocaleString('en-KE');
const PCT = (n: number) => `${n}%`;

type ModuleKey = string;

const NAV: { label: string; items: { id: string; label: string; Icon: any }[] }[] = [
  { label: 'Command', items: [
    { id: 'exec', label: 'Executive Finance', Icon: LayoutDashboard },
    { id: 'ai', label: 'Financial Assistant', Icon: Sparkles },
    { id: 'forecast', label: 'Forecasting', Icon: TrendingUp },
    { id: 'reports', label: 'Financial Reports', Icon: FileText },
  ] },
  { label: 'Revenue Operations', items: [
    { id: 'revenue', label: 'Revenue Intelligence', Icon: TrendingUp },
    { id: 'billing', label: 'Billing', Icon: Receipt },
    { id: 'cashier', label: 'Cashier', Icon: Banknote },
    { id: 'insurance', label: 'Insurance', Icon: ShieldCheck },
    { id: 'claims', label: 'Claims', Icon: ClipboardList },
    { id: 'ar', label: 'Accounts Receivable', Icon: Wallet },
  ] },
  { label: 'Payables & Supply', items: [
    { id: 'ap', label: 'Accounts Payable', Icon: Landmark },
    { id: 'payroll', label: 'Payroll', Icon: IdCard },
    { id: 'procurement', label: 'Procurement', Icon: Truck },
    { id: 'inventory', label: 'Inventory Costs', Icon: Boxes },
    { id: 'drug', label: 'Drug Economics', Icon: Pill },
  ] },
  { label: 'Cost & Economics', items: [
    { id: 'dept', label: 'Dept Economics', Icon: Building2 },
    { id: 'ward', label: 'Ward Economics', Icon: Activity },
    { id: 'theatre', label: 'Theatre Economics', Icon: Stethoscope },
    { id: 'lab', label: 'Laboratory Economic', Icon: FlaskConical },
    { id: 'service', label: 'Service Costing', Icon: Wallet },
    { id: 'assets', label: 'Capital Assets', Icon: Server },
  ] },
  { label: 'Governance', items: [
    { id: 'budgets', label: 'Budgets', Icon: Wallet },
    { id: 'audit', label: 'Audit Center', Icon: ScrollText },
    { id: 'compliance', label: 'Compliance', Icon: BadgeCheck },
    { id: 'tax', label: 'Taxes', Icon: Percent },
    { id: 'donors', label: 'Donor Funds', Icon: HandCoins },
  ] },
];

export function FinanceCenter({ model, onPatch }: { model: any; onPatch: (patch: any) => void }) {
  const [active, setActive] = useState('exec');
  const fin = model.finance ?? {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 112px)', minHeight: 520 }}>
      <Header setActive={setActive} />

      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        <aside style={{ width: 240, flexShrink: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: C.muted }}>Financial Command</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {NAV.map(g => (
              <div key={g.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', padding: '4px 8px' }}>{g.label}</div>
                {g.items.map(m => {
                  const I = m.Icon;
                  const on = active === m.id;
                  return (
                    <button key={m.id} onClick={() => setActive(m.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? `${C.sky}18` : 'transparent', color: on ? C.sky : C.slate, fontSize: 11.5, textAlign: 'left', fontWeight: on ? 800 : 500 }}>
                      <I size={14} color={on ? C.sky : C.muted} />
                      <span style={{ flex: 1 }}>{m.label}</span>
                      {on && <ChevronRight size={12} />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <section style={{ flex: 1, minWidth: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, overflowY: 'auto', padding: 18 }}>
          {active === 'exec' && <ExecView model={model} onPatch={onPatch} />}
          {active === 'ai' && <AiView />}
          {active === 'forecast' && <ForecastView />}
          {active === 'revenue' && <RevenueView />}
          {active === 'reports' && <ReportsView />}
          {active === 'billing' && <BillingView />}
          {active === 'cashier' && <CashierView />}
          {active === 'ar' && <ArView />}
          {active === 'insurance' && <InsuranceView />}
          {active === 'claims' && <ClaimsView />}
          {active === 'ap' && <ApView />}
          {active === 'payroll' && <PayrollView />}
          {active === 'procurement' && <ProcurementView />}
          {active === 'inventory' && <InventoryView />}
          {active === 'drug' && <DrugView />}
          {active === 'dept' && <DeptView />}
          {active === 'ward' && <WardView />}
          {active === 'theatre' && <TheatreView />}
          {active === 'lab' && <LabView />}
          {active === 'service' && <ServiceView />}
          {active === 'assets' && <AssetsView />}
          {active === 'budgets' && <BudgetsView />}
          {active === 'audit' && <AuditView />}
          {active === 'compliance' && <ComplianceView />}
          {active === 'tax' && <TaxView />}
          {active === 'donors' && <DonorsView />}
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════════════════════════════════════

function Header({ setActive }: { setActive: (id: string) => void }) {
  const [q, setQ] = useState('');
  const flat = NAV.flatMap(g => g.items);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#0b2c4d,#123a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7dd3fc' }}><Landmark size={20} /></div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>Financial Intelligence &amp; Revenue Operations Center</div>
        <div style={{ fontSize: 10, color: C.muted }}>The hospital&apos;s financial nervous system — realtime, accountable, end-to-end.</div>
      </div>
      <span style={{ position: 'relative' }}>
        <Search size={13} color={C.muted} style={{ position: 'absolute', left: 9, top: 9 }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Jump to engine…" style={{ height: 32, width: 210, borderRadius: 9, border: `1px solid ${C.border}`, padding: '0 10px 0 28px', fontSize: 12, outline: 'none' }} />
        {q && (
          <div style={{ position: 'absolute', top: 38, right: 0, left: 0, zIndex: 20, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 14px 34px rgba(11,44,77,.16)', padding: 6 }}>
            {flat.filter(m => m.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6).map(m => (
              <button key={m.id} onClick={() => { setActive(m.id); setQ(''); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
                <m.Icon size={13} color={C.slate} /><span style={{ color: C.navy }}>{m.label}</span>
              </button>
            ))}
          </div>
        )}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ padding: '5px 11px', borderRadius: 20, background: `${C.green}15`, color: C.green, fontSize: 10, fontWeight: 700 }}>● KES Live</span>
    </div>
  );
}

function KpiCard({ label, value, color = C.navy, sub, icon }: any) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 13, padding: '11px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>{label}</div>
        {icon}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 5, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.slate, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
function Sect({ title, sub, children, right }: any) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.navy }}>{title}</div>
          {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
function PanelH({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function ListPanel({ title, sub, children }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelH title={title} sub={sub} />
      {children}
    </div>
  );
}
function Mini({ k, v, c }: any) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 9, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: c || C.navy }}>{v}</div>
    </div>
  );
}
function Row({ k, v }: any) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '5px 0', borderBottom: `1px solid ${C.border}` }}><span style={{ color: C.slate }}>{k}</span><span style={{ color: C.navy, fontWeight: 700 }}>{v}</span></div>;
}
function Row2k({ k, v }: any) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderTop: `1px solid ${C.border}`, marginTop: 4 }}><span style={{ color: C.slate }}>{k}</span><span style={{ color: C.navy, fontWeight: 700 }}>{v}</span></div>;
}
function Data({ rows, cols }: any) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>{cols.map((c: any) => <th key={c.k} style={{ textAlign: 'left', color: C.muted, fontWeight: 700, textTransform: 'uppercase', fontSize: 9, letterSpacing: '.04em', padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>{c.as}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={i} style={{ background: i % 2 ? '#fafcff' : '#fff' }}>
              {cols.map((c: any) => (
                <td key={c.k} style={{ padding: '7px 8px', borderBottom: `1px solid ${C.border}`, color: c.fmtd === 'bold' ? C.navy : C.slate, fontWeight: c.fmtd === 'bold' ? 700 : 400 }}>
                  {c.fmt ? c.fmt(r[c.k]) : r[c.k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Executive
// ═══════════════════════════════════════════════════════════════════════════════

function ExecView({ model, onPatch }: any) {
  const fin = model.finance ?? {};
  const fields = [
    { k: 'revenueToday', label: 'Revenue Today' }, { k: 'claimsSubmitted', label: 'Claims Submitted' },
    { k: 'claimsApproved', label: 'Claims Approved' }, { k: 'insuranceOutstanding', label: 'Insurance Outstanding' },
    { k: 'outstandingBills', label: 'Outstanding Bills' }, { k: 'expenses', label: 'Expenses' },
    { k: 'payroll', label: 'Payroll' }, { k: 'drugCosts', label: 'Drug Costs' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelH title="Executive Financial Wall" sub="Realtime · auditable · every source of money in KES" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 10 }}>
        <KpiCard label="Revenue Today" value={MONEY(fin.revenueToday ?? D.exec.todayRevenue)} color={C.green} icon={<span style={{ fontSize: 9, color: C.green, fontWeight: 800 }}>↑12%</span>} sub={FULL(fin.revenueToday ?? D.exec.todayRevenue)} />
        <KpiCard label="Expenses Today" value={MONEY(fin.expenses ?? D.exec.expToday)} color={C.red} sub="incl. drug + payroll" />
        <KpiCard label="Net Position" value={MONEY(D.exec.netPos)} color={C.green} sub="cash: healthy" />
        <KpiCard label="Claims Submitted" value={MONEY(fin.claimsSubmitted ?? 0)} icon={<span style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>today</span>} />
        <KpiCard label="Claims Approved" value={MONEY(fin.claimsApproved ?? 0)} />
        <KpiCard label="Claims Rejected" value={MONEY(D.exec.claimsRejected)} color={C.red} />
        <KpiCard label="Drug Consumption" value={MONEY(D.exec.drugConsumption)} />
        <KpiCard label="Payroll Accrued" value={MONEY(fin.payroll ?? D.exec.payrollAccrued)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
        <Sect title="Revenue trend · 12-month forecast" sub="Projected revenue vs expenses (KES M)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={D.forecast.months.map((m, i) => ({ m, revenue: D.forecast.revenue[i], expenses: D.forecast.expenses[i] }))} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke={C.sky} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke={C.red} strokeWidth={2} dot={false} opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
        </Sect>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Sect title="Projected month" sub="Forward projection">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Mini k="Revenue" v={MONEY(D.projected.monthRevenue)} c={C.green} />
              <Mini k="Expenses" v={MONEY(D.projected.monthExpenses)} c={C.red} />
              <Mini k="Net margin" v={`${D.projected.marginPct}%`} c={C.sky} />
              <Mini k="Cash position" v={D.projected.cash} c={C.green} />
            </div>
          </Sect>
          <Sect title="Locked in receivables" sub="Constitutional AR">
            <Row k="Outstanding claims" v={MONEY(fin.insuranceOutstanding ?? D.projected.outstandingClaims)} />
            <Row k="Outstanding bills" v={MONEY(fin.outstandingBills ?? D.projected.outstandingBills)} />
          </Sect>
        </div>
      </div>

      <Sect title="Live constitutional ledger" sub="Persisted FinancialMetrics — editable, realtime, drives the rest of AMEXAN">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 8 }}>
          {fields.map(({ k, label }) => (
            <Editable key={k} label={label} value={fin[k] ?? 0} onSave={(v: number) => onPatch({ [k]: v })} />
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: C.muted }}>Saved automatically — every change is signed to the audit log.</div>
      </Sect>
    </div>
  );
}
function Editable({ label, value, onSave }: any) {
  const [v, setV] = useState(String(value));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 9, padding: '7px 9px' }}>
      <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>{label}</span>
      <input value={v} onChange={e => setV(e.target.value)} onBlur={() => { const n = Number(v); if (!Number.isNaN(n)) onSave(n); }} onKeyDown={e => { if (e.key === 'Enter') { const n = Number(v); if (!Number.isNaN(n)) onSave(n); (e.target as HTMLInputElement).blur(); } }} style={{ width: 96, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, padding: '0 6px', fontSize: 11, textAlign: 'right', outline: 'none', background: '#fff' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Assistant + Forecasting
// ═══════════════════════════════════════════════════════════════════════════════

function AiView() {
  const cards = [
    { icon: '📈', text: 'Revenue this month is projected to exceed budget by 8%.', tone: C.green },
    { icon: '💊', text: 'Ceftriaxone consumption is up 21% — increase procurement.', tone: C.amber },
    { icon: '🦴', text: 'Orthopedic implants are consuming 43% more than forecast.', tone: C.red },
    { icon: '🏦', text: 'SHA claims older than 60 days total KES 18.4M — escalate follow-up.', tone: C.sky },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelH title="Financial Assistant" sub="AI that translates the ledger into decisions" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 8 }}>
        <Sparkles size={15} color={C.purple} />
        <input placeholder='Ask anything — e.g. "Which ward loses the most money?"' style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, color: C.navy, background: 'transparent' }} />
        <button style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: C.purple, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Analyse</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid ${c.tone}44`, borderLeft: `3px solid ${c.tone}`, borderRadius: 11, padding: 12, fontSize: 12, color: C.slate, lineHeight: 1.5 }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>{c.text}
          </div>
        ))}
      </div>
      <div style={{ background: 'linear-gradient(135deg,#0b2c4d,#123a5e)', borderRadius: 14, padding: 16, color: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Good Morning, Finance Director.</div>
        <div style={{ fontSize: 11, color: '#cfe3f7', lineHeight: 1.6 }}>
          Revenue is projected to exceed budget by 8%. Ceftriaxone is +21% — <b style={{ color: '#fff' }}>increase procurement</b>. Orthopedic implants are +43% — <b style={{ color: '#fff' }}>review inventory</b>. SHA claims older than 60 days total <b style={{ color: '#fff' }}>KES 18.4M</b> — escalate payment follow-up.
        </div>
      </div>
    </div>
  );
}

function ForecastView() {
  const data = D.forecast.months.map((m, i) => ({ m, revenue: D.forecast.revenue[i], expenses: D.forecast.expenses[i], cash: D.forecast.revenue[i] - D.forecast.expenses[i] }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelH title="Forecasting" sub="AI predicts revenue, expenses and cash flow — 3, 6 and 12 months." />
      <div style={{ display: 'flex', gap: 10 }}>
        {[3, 6, 12].map(h => (
          <div key={h} style={{ flex: 1, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase' }}>{h}-month</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.sky }}>{MONEY(D.forecast.revenue[h - 1] * 1e6)}</div>
            <div style={{ fontSize: 10, color: C.slate }}>projected revenue</div>
          </div>
        ))}
      </div>
      <Sect title="Revenue vs expenses · 12-month forecast" sub="KES millions — dashed green is net cash flow">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `${v}M`} />
            <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
            <Line type="monotone" dataKey="revenue" stroke={C.sky} strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke={C.red} strokeWidth={2} />
            <Line type="monotone" dataKey="cash" stroke={C.green} strokeWidth={2} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </Sect>
    </div>
  );
}

function ReportsView() {
  const reports = ['Income Statement', 'Balance Sheet', 'Cash Flow', 'Department Reports', 'Ward Reports', 'Service Reports', 'Insurance Reports', 'Payroll Reports', 'Drug Cost Reports', 'Government Reports', 'Board Reports', 'Donor Reports', 'Custom Reports'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelH title="Financial Reports" sub="One click — every statutory, board and executive report." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
        {reports.map(r => (
          <div key={r} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 13 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>{r}</div>
            <div style={{ fontSize: 10, color: C.muted, margin: '6px 0 8px' }}>Full P&amp;L, variance &amp; comparatives</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['PDF', 'Excel', 'CSV', 'Power BI', 'FHIR'].map(f => <span key={f} style={{ padding: '2px 7px', borderRadius: 6, background: `${C.sky}12`, color: C.sky, fontSize: 9, fontWeight: 700 }}>{f}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Revenue
// ═══════════════════════════════════════════════════════════════════════════════

function RevenueView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PanelH title="Revenue Intelligence" sub="Where the money comes from — source, department, consultant, clinic." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1.4fr', gap: 12 }}>
        <Sect title="Revenue sources" sub="Today">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={D.revenueSources} dataKey="value" nameKey="name" innerRadius={34} outerRadius={60} paddingAngle={2}>
                {D.revenueSources.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [MONEY(v as number), n]} contentStyle={{ fontSize: 10, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, fontSize: 10 }}>
            {D.revenueSources.map(s => <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 3, background: s.color }} /><span style={{ color: C.slate }}>{s.name}</span><span style={{ marginLeft: 'auto', color: C.navy, fontWeight: 700 }}>{MONEY(s.value)}</span></div>)}
          </div>
        </Sect>
        <Sect title="By department" sub="KES · ranked">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={D.deptRevenue} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={C.sky} />
              <Tooltip formatter={(v: any) => MONEY(v as number)} />
            </BarChart>
          </ResponsiveContainer>
        </Sect>
        <Sect title="Profitability treemap" sub="department share of surplus">
          <ResponsiveContainer width="100%" height={160}>
            <Treemap data={D.deptRevenue.map(d => ({ name: d.name, size: d.value }))} dataKey="size" nameKey="name" aspectRatio={4 / 3} stroke="#fff" fill={C.sky} />
          </ResponsiveContainer>
        </Sect>
      </div>
      <Sect title="By consultant" sub="Revenue, collections and outstanding — for planning, not punishment.">
        <Data rows={D.consultants} cols={[
          { k: 'name', as: 'Consultant', fmtd: 'bold' }, { k: 'dept', as: 'Dept' }, { k: 'patients', as: 'Patients' },
          { k: 'revenue', as: 'Revenue', fmt: FULL }, { k: 'collections', as: 'Collections', fmt: FULL },
          { k: 'outstanding', as: 'Outstanding', fmt: FULL }, { k: 'avgBill', as: 'Avg bill', fmt: FULL }, { k: 'caseMix', as: 'Case mix' },
        ]} />
      </Sect>
      <Sect title="By clinic · ranked" sub="Revenue, patients and cancellation rate — the growth surface.">
        <Data rows={D.clinics} cols={[
          { k: 'name', as: 'Clinic', fmtd: 'bold' }, { k: 'revenue', as: 'Revenue', fmt: FULL }, { k: 'patients', as: 'Patients' }, { k: 'cancelRate', as: 'Cancellation %', fmt: PCT },
        ]} />
      </Sect>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Ops modules (tables)
// ═══════════════════════════════════════════════════════════════════════════════

function BillingView() {
  return (
    <ListPanel title="Billing" sub="Invoices across every encounter — one accountable registry.">
      <Data rows={[
        { no: 'INV-2041', dept: 'Surgery', item: 'Surgical admission', amt: 482000, s: 'Unpaid' },
        { no: 'INV-2040', dept: 'Radiology', item: 'CT Brain', amt: 88000, s: 'Paid' },
        { no: 'INV-2039', dept: 'Medicine', item: 'Ward · 4 days', amt: 172000, s: 'Partial' },
        { no: 'INV-2038', dept: 'Pharmacy', item: 'Ceftriaxone dispense', amt: 112000, s: 'Unpaid' },
      ]} cols={[
        { k: 'no', as: 'Invoice', fmtd: 'bold' }, { k: 'dept', as: 'Dept' }, { k: 'item', as: 'Item' }, { k: 'amt', as: 'Amount', fmt: FULL }, { k: 's', as: 'Status' },
      ]} />
    </ListPanel>
  );
}
function CashierView() {
  return (
    <ListPanel title="Cashier" sub="Live deposits today — cash, cards and mobile money.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {[
          { k: 'Cash at hand', v: 'KES 1,820,000' }, { k: 'Cards', v: 'KES 3,140,000' },
          { k: 'M-PESA', v: 'KES 2,210,000' }, { k: 'Bank mobile', v: 'KES 1,250,000' },
        ].map(x => <KpiCard key={x.k} label={x.k} value={x.v} />)}
      </div>
      <Sect title="Deposit log" sub="Every deposit traceable">
        <Data rows={[
          { t: '08:02', ref: 'REC-8821', src: 'M-PESA', amt: 42200, by: 'Reception' },
          { t: '07:58', ref: 'REC-8820', src: 'Cash', amt: 90000, by: 'Cashier A' },
          { t: '07:41', ref: 'REC-8819', src: 'Card', amt: 245000, by: 'Cashier B' },
        ]} cols={[{ k: 't', as: 'Time' }, { k: 'ref', as: 'Ref' }, { k: 'src', as: 'Source' }, { k: 'amt', as: 'KES', fmt: FULL }, { k: 'by', as: 'Collector' }]} />
      </Sect>
    </ListPanel>
  );
}
function InsuranceView() {
  const max = D.insurers.reduce((a, b) => (b.avgDays > a.avgDays ? b : a));
  return (
    <ListPanel title="Insurance Intelligence" sub="Every insurer — pending claims, payment speed, rejection rate.">
      <Data rows={D.insurers} cols={[
        { k: 'name', as: 'Insurer', fmtd: 'bold' }, { k: 'pending', as: 'Pending', fmt: FULL }, { k: 'avgDays', as: 'Avg payment (days)' }, { k: 'rejected', as: 'Rejected %', fmt: PCT },
      ]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
        <KpiCard label="Total pending" value={MONEY(D.insurers.reduce((s: number, x) => s + x.pending, 0))} sub="constitutional receivables" />
        <KpiCard label="Slowest payer" value={max.name} sub={`${max.avgDays} days average`} color={C.red} />
      </div>
    </ListPanel>
  );
}
function ClaimsView() {
  return (
    <ListPanel title="Claim Analytics" sub="Pipeline — where money gets stuck.">
      <Sect title="Claims pipeline" sub="Submitted → verified → approved → paid (KES)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {D.claimsPipeline.map((c, i) => (
            <div key={c.stage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ background: `${c.color}12`, color: c.color, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{c.count}</div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.02em' }}>{c.stage}</div>
              </div>
              {i < D.claimsPipeline.length - 1 && <span style={{ color: C.muted }}>→</span>}
            </div>
          ))}
        </div>
      </Sect>
      <Sect title="Amount per stage" sub="KES">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {D.claimsPipeline.map(c => (
            <div key={c.stage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 78, fontSize: 10, color: C.slate }}>{c.stage}</span>
              <div style={{ flex: 1, height: 9, borderRadius: 5, background: '#eef2f7' }}><div style={{ height: '100%', width: `${Math.max(4, (c.amount / D.claimsPipeline[0].amount) * 100)}%`, background: c.color, borderRadius: 5 }} /></div>
              <span style={{ width: 90, fontSize: 10, fontWeight: 700, color: C.navy, textAlign: 'right' }}>{FULL(c.amount)}</span>
            </div>
          ))}
        </div>
      </Sect>
    </ListPanel>
  );
}
function ArView() {
  return (
    <ListPanel title="Accounts Receivable · Outstanding Bills" sub="Every patient, department, ward, amount, days and collector.">
      <Data rows={D.outstanding} cols={[
        { k: 'patient', as: 'Patient', fmtd: 'bold' }, { k: 'dept', as: 'Dept' }, { k: 'ward', as: 'Ward' },
        { k: 'amount', as: 'Amount', fmt: FULL }, { k: 'days', as: 'Days' }, { k: 'status', as: 'Status' },
      ]} />
    </ListPanel>
  );
}
function ApView() {
  return (
    <ListPanel title="Accounts Payable" sub="Supplier ageing — what the hospital owes and when.">
      <Data rows={D.suppliers} cols={[
        { k: 'name', as: 'Supplier', fmtd: 'bold' }, { k: 'type', as: 'Type' }, { k: 'payable', as: 'Payable', fmt: FULL }, { k: 'dueDays', as: 'Due in (days)' },
      ]} />
    </ListPanel>
  );
}
function PayrollView() {
  const total = D.payrollCats.reduce((s: number, x) => s + x.value, 0);
  return (
    <ListPanel title="Payroll Intelligence" sub={`Total accrued ${FULL(total)}`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {D.payrollCats.map(c => <KpiCard key={c.name} label={c.name} value={MONEY(c.value)} />)}
      </div>
    </ListPanel>
  );
}
function ProcurementView() {
  return (
    <ListPanel title="Procurement Intelligence" sub="Requested → approved → delivered → installed → paid → outstanding.">
      <Data rows={D.procurement} cols={[
        { k: 'item', as: 'Item', fmtd: 'bold' }, { k: 'requester', as: 'Dept' }, { k: 'qty', as: 'Qty' }, { k: 'value', as: 'Value', fmt: FULL }, { k: 'status', as: 'Status' },
      ]} />
    </ListPanel>
  );
}
function InventoryView() {
  return (
    <ListPanel title="Inventory Costs" sub="Value on hand and turnover.">
      <Data rows={D.inventory} cols={[
        { k: 'name', as: 'Item', fmtd: 'bold' }, { k: 'value', as: 'Value', fmt: FULL }, { k: 'turn', as: 'Turnover ×' },
      ]} />
    </ListPanel>
  );
}
function DrugView() {
  return (
    <ListPanel title="Drug Economics" sub="AI predicts procurement — every drug is a P&L.">
      <Data rows={D.drugs} cols={[
        { k: 'name', as: 'Drug', fmtd: 'bold' }, { k: 'dispensed', as: 'Dispensed' }, { k: 'cost', as: 'Purchase', fmt: FULL },
        { k: 'revenue', as: 'Revenue', fmt: FULL }, { k: 'margin', as: 'Margin', fmt: PCT }, { k: 'stock', as: 'Stock' }, { k: 'projection', as: 'Projected', fmt: (v: number) => `+${v}%` },
      ]} />
    </ListPanel>
  );
}
function DeptView() {
  return (
    <ListPanel title="Department Economics" sub="Profitability leadership can actually steer.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {D.deptRevenue.map(d => <KpiCard key={d.name} label={d.name} value={MONEY(d.value)} color={d.value > 20000000 ? C.green : C.sky} />)}
      </div>
      <Sect title="Profitability treemap" sub="visual share of surplus">
        <ResponsiveContainer width="100%" height={200}><Treemap data={D.deptRevenue.map(d => ({ name: d.name, size: d.value }))} dataKey="size" nameKey="name" aspectRatio={4 / 3} stroke="#fff" fill={C.sky} /></ResponsiveContainer>
      </Sect>
    </ListPanel>
  );
}
function WardView() {
  return (
    <ListPanel title="Ward Financial Intelligence" sub="Every ward is financially accountable.">
      <Data rows={D.wardEconomics} cols={[
        { k: 'name', as: 'Ward', fmtd: 'bold' }, { k: 'admissions', as: 'Admits' }, { k: 'avgStay', as: 'Stay (d)' }, { k: 'avgCost', as: 'Avg cost', fmt: FULL },
        { k: 'drug', as: 'Drug', fmt: FULL }, { k: 'consumables', as: 'Consumables', fmt: FULL }, { k: 'labour', as: 'Labour', fmt: FULL },
        { k: 'revenue', as: 'Revenue', fmt: FULL }, { k: 'margin', as: 'Margin', fmt: PCT },
      ]} />
    </ListPanel>
  );
}
function TheatreView() {
  const t = D.theatreEconomics;
  return (
    <ListPanel title="Theatre Economics" sub="Scheduling, revenue and utilisation.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
        <KpiCard label="Scheduled" value={t.scheduled} />
        <KpiCard label="Completed" value={t.completed} color={C.green} />
        <KpiCard label="Cancelled" value={t.cancelled} color={C.red} />
        <KpiCard label="Revenue" value={MONEY(t.revenue)} />
        <KpiCard label="Avg time" value={`${t.avgTime} min`} />
        <KpiCard label="Avg cost" value={MONEY(t.avgCost)} />
        <KpiCard label="Profit" value={MONEY(t.profit)} color={C.green} />
      </div>
    </ListPanel>
  );
}
function LabView() {
  return (
    <ListPanel title="Laboratory Economics" sub="Every investigation — performed, revenue, cost, margin.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
        {D.labEconomics.map(l => <KpiCard key={l.name} label={l.name} value={`${l.margin}% margin`} sub={`${l.performed} performed · ${MONEY(l.revenue)}`} />)}
      </div>
      <Sect title="Test economics">
        <Data rows={D.labEconomics} cols={[
          { k: 'name', as: 'Test', fmtd: 'bold' }, { k: 'performed', as: 'Performed' }, { k: 'revenue', as: 'Revenue', fmt: FULL }, { k: 'cost', as: 'Cost', fmt: FULL }, { k: 'margin', as: 'Margin', fmt: PCT },
        ]} />
      </Sect>
    </ListPanel>
  );
}
function ServiceView() {
  return (
    <ListPanel title="Service Costing" sub="Profitability at the front door — revenue per service line.">
      <Data rows={[
        { s: 'Outpatient consult', rev: 2400000, cost: 900000 }, { s: 'Day surgery', rev: 6800000, cost: 4100000 },
        { s: 'Dialysis session', rev: 9400000, cost: 6200000 }, { s: 'Imaging', rev: 11200000, cost: 6300000 },
        { s: 'Theatre block', rev: 18000000, cost: 11000000 },
      ]} cols={[{ k: 's', as: 'Service', fmtd: 'bold' }, { k: 'rev', as: 'Revenue', fmt: FULL }, { k: 'cost', as: 'Cost', fmt: FULL }]} />
    </ListPanel>
  );
}
function AssetsView() {
  return (
    <ListPanel title="Capital Assets" sub="Purchase → maintenance → revenue → ROI.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 12 }}>
        {D.assets.map(a => (
          <div key={a.name} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 13, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ color: C.navy, fontSize: 13 }}>{a.name}</b>
              <span style={{ fontSize: 10, color: C.green, fontWeight: 800, background: `${C.green}12`, padding: '2px 8px', borderRadius: 10 }}>{a.roi}</span>
            </div>
            <Row2k k="Purchase" v={MONEY(a.purchase)} />
            <Row2k k="Maintenance" v={MONEY(a.maintenance)} />
            <Row2k k="Revenue" v={MONEY(a.revenue)} />
          </div>
        ))}
      </div>
    </ListPanel>
  );
}
function BudgetsView() {
  return (
    <ListPanel title="Budget Intelligence" sub="Budget vs actual vs variance — realtime.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {D.budgets.map(b => {
          const v = b.actual - b.budget;
          const pp = Math.round((b.actual / b.budget) * 100);
          const over = v > 0;
          return (
            <div key={b.dept} style={{ background: '#f8fafc', borderRadius: 10, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.navy }}>{b.dept}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: C.slate }}>Budget {MONEY(b.budget)}</span>
                <span style={{ fontSize: 10, color: C.slate }}>Actual {MONEY(b.actual)}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: over ? C.red : C.green }}>{FULL(Math.abs(v))} {over ? 'over' : 'under'}</span>
              </div>
              <div style={{ height: 7, borderRadius: 5, background: '#eef2f7', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pp, 100)}%`, background: pp > 100 ? C.red : pp > 85 ? C.amber : C.green }} />
              </div>
            </div>
          );
        })}
      </div>
    </ListPanel>
  );
}
function AuditView() {
  return (
    <ListPanel title="Audit Center" sub="Immutable — every transaction, signed and timestamped.">
      <Data rows={D.audit} cols={[
        { k: 'date', as: 'Time' }, { k: 'who', as: 'Actor', fmtd: 'bold' }, { k: 'action', as: 'Action' }, { k: 'subject', as: 'Subject' }, { k: 'signature', as: 'Signature' },
      ]} />
      <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: `${C.green}0c`, color: C.green, fontSize: 11, fontWeight: 700 }}>✓ Immutable ledger — every approval, change, payment, cancellation and refund is permanently traced.</div>
    </ListPanel>
  );
}
function ComplianceView() {
  return (
    <ListPanel title="Compliance & Governance" sub="Statutory, licensing and regulatory posture.">
      <Data rows={D.compliance} cols={[{ k: 'name', as: 'Requirement', fmtd: 'bold' }, { k: 'status', as: 'Status' }, { k: 'by', as: 'Authority' }]} />
    </ListPanel>
  );
}
function TaxView() {
  const t = D.taxes;
  return (
    <ListPanel title="Taxes" sub="VAT, withholding and corporate position.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        <KpiCard label="VAT net" value={MONEY(t.vat.net)} />
        <KpiCard label="Withholding" value={MONEY(t.withholding)} />
        <KpiCard label="Corporate" value={MONEY(t.corporate)} />
      </div>
      <Sect title="VAT position" sub={`Rate ${t.vat.rate}`}>
        <Row k="Output VAT" v={MONEY(t.vat.payable)} />
        <Row k="Input VAT" v={MONEY(t.vat.deductible)} />
        <Row k="Net VAT" v={MONEY(t.vat.net)} />
      </Sect>
    </ListPanel>
  );
}
function DonorsView() {
  return (
    <ListPanel title="Donor Funds" sub="Grants, budgets, utilization, KPIs and reporting due — every shilling accountable.">
      <Data rows={D.donors} cols={[
        { k: 'name', as: 'Funder', fmtd: 'bold' }, { k: 'budget', as: 'Budget', fmt: FULL }, { k: 'utilized', as: 'Utilized', fmt: FULL },
        { k: 'remaining', as: 'Remaining', fmt: FULL }, { k: 'outputs', as: 'Outputs %' }, { k: 'due', as: 'Report due' },
      ]} />
    </ListPanel>
  );
}
