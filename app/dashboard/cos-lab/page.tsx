"use client";
import { useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-300:#7dd3fc;
  --sky-400:#38bdf8; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --sky-800:#075985; --sky-900:#0c4a6e;
  --white:#ffffff; --frost-50:#fafafa; --frost-100:#f5f5f5; --frost-200:#e5e5e5;
  --frost-300:#d4d4d4; --frost-400:#a3a3a3; --frost-500:#737373;
  --green:#10b981; --green-bg:#d1fae5; --green-text:#065f46;
  --amber:#f59e0b; --amber-bg:#fef3c7; --amber-text:#92400e;
  --red:#ef4444; --red-bg:#fee2e2; --red-text:#991b1b;
  --blue:#3b82f6; --blue-bg:#dbeafe; --blue-text:#1e40af;
  --purple:#8b5cf6; --purple-bg:#ede9fe; --purple-text:#5b21b6;
  --font:'Inter',sans-serif;
  --radius:12px; --radius-sm:8px; --radius-lg:20px;
  --shadow:0 1px 3px rgba(0,0,0,.04); --shadow-md:0 4px 16px rgba(0,0,0,.06);
  --shadow-lg:0 12px 40px rgba(0,0,0,.08);
}
body{font-family:var(--font);background:var(--frost-50);color:#0f172a}
.cos-layout{display:flex;min-height:100vh}
.cos-sidebar{width:220px;background:var(--white);border-right:1px solid var(--frost-200);padding:20px 12px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0}
.cos-sidebar-brand{font-size:20px;font-weight:800;color:var(--sky-700);padding:0 8px 16px;border-bottom:1px solid var(--frost-200);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.cos-sidebar-brand span{background:var(--sky-100);color:var(--sky-600);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700}
.sidebar-group{font-size:10px;font-weight:700;color:var(--frost-400);text-transform:uppercase;letter-spacing:.8px;padding:12px 8px 4px}
.cos-sidebar-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);font-size:13px;font-weight:600;color:var(--frost-500);cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:var(--font);transition:all .1s}
.cos-sidebar-item:hover{background:var(--sky-50);color:var(--sky-700)}
.cos-sidebar-item.active{background:var(--sky-100);color:var(--sky-700);font-weight:700}
.cos-sidebar-item .icon{font-size:16px;width:20px;text-align:center}
.cos-sidebar-item .badge{margin-left:auto;background:var(--red-bg);color:var(--red-text);font-size:10px;font-weight:700;padding:1px 6px;border-radius:99px;min-width:18px;text-align:center}
.cos-sidebar-item .badge.amber{background:var(--amber-bg);color:var(--amber-text)}
.cos-sidebar-item .badge.green{background:var(--green-bg);color:var(--green-text)}
.cos-sidebar-profile{padding:12px 8px;border-top:1px solid var(--frost-200);display:flex;align-items:center;gap:10px;margin-top:auto}
.cos-sidebar-avatar{width:36px;height:36px;border-radius:10px;background:var(--sky-500);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
.cos-sidebar-name{font-size:12px;font-weight:700}
.cos-sidebar-role{font-size:10px;color:var(--frost-500)}
.cos-main{flex:1;display:flex;flex-direction:column;min-width:0}
.cos-topbar{height:56px;background:var(--white);border-bottom:1px solid var(--frost-200);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:50}
.cos-greeting{font-size:14px;color:var(--frost-500)}
.cos-greeting strong{color:#0f172a}
.cos-topbar-right{display:flex;align-items:center;gap:12px}
.cos-topbar-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid var(--frost-200);background:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all .15s}
.cos-topbar-btn:hover{border-color:var(--sky-300);background:var(--sky-50)}
.cos-content{padding:20px 24px 40px;flex:1;max-width:1400px;width:100%;margin:0 auto}
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
.stat-card{background:var(--white);border:1px solid var(--frost-200);border-radius:var(--radius);padding:14px;display:flex;align-items:center;gap:12px}
.stat-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px}
.stat-icon.green{background:var(--green-bg)}.stat-icon.amber{background:var(--amber-bg)}
.stat-icon.red{background:var(--red-bg)}.stat-icon.blue{background:var(--blue-bg)}
.stat-icon.purple{background:var(--purple-bg)}
.stat-val{font-size:22px;font-weight:800;line-height:1}
.stat-lbl{font-size:10px;color:var(--frost-500);margin-top:2px}
.section-title{font-size:16px;font-weight:700;color:var(--sky-800);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.section-title .count{font-size:11px;background:var(--frost-200);padding:1px 8px;border-radius:99px;color:var(--frost-500);font-weight:600}
.specimen-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.specimen-card{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1.5px solid var(--frost-200);border-radius:var(--radius);background:var(--white);transition:all .15s;cursor:pointer}
.specimen-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.specimen-card.critical{border-left:4px solid var(--red);background:var(--red-bg)}
.specimen-card.urgent{border-left:4px solid var(--amber)}
.specimen-card.routine{border-left:4px solid var(--sky-400)}
.specimen-icon{font-size:24px;width:36px;text-align:center}
.specimen-info{flex:1;min-width:0}
.specimen-test{font-size:13px;font-weight:700}
.specimen-patient{font-size:11px;color:var(--frost-500);margin-top:1px}
.specimen-meta{font-size:10px;color:var(--frost-400);margin-top:2px}
.specimen-status{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px}
.specimen-status.pending{background:var(--amber-bg);color:var(--amber-text)}
.specimen-status.processing{background:var(--blue-bg);color:var(--blue-text)}
.specimen-status.verified{background:var(--green-bg);color:var(--green-text)}
.specimen-btn{font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-family:var(--font);transition:all .1s}
.specimen-btn.primary{background:var(--sky-500);color:var(--white)}
.specimen-btn.primary:hover{background:var(--sky-600)}
.specimen-btn.outline{background:var(--white);border:1.5px solid var(--frost-200);color:var(--frost-500)}
.specimen-btn.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.qc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:24px}
.qc-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);padding:16px;transition:all .15s}
.qc-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.qc-test{font-size:13px;font-weight:700;margin-bottom:2px}
.qc-patient{font-size:11px;color:var(--frost-500);margin-bottom:6px}
.qc-result{font-size:28px;font-weight:800;color:var(--sky-700);margin-bottom:2px}
.qc-result.abnormal{color:var(--red)}
.qc-ref{font-size:10px;color:var(--frost-400)}
.qc-actions{display:flex;gap:4px;margin-top:8px}
.qc-btn{font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-family:var(--font);transition:all .1s}
.qc-btn.approve{background:var(--green-bg);color:var(--green-text)}
.qc-btn.reject{background:var(--red-bg);color:var(--red-text)}
.qc-btn.review{background:var(--amber-bg);color:var(--amber-text)}
.critical-section{background:var(--red-bg);border:1px solid var(--red);border-radius:var(--radius);padding:16px;margin-bottom:24px}
.critical-header{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--red-text);margin-bottom:10px}
.critical-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:var(--radius-sm);background:var(--white);margin-bottom:4px;font-size:12px;border-left:4px solid var(--red)}
.critical-item .value{font-weight:800;color:var(--red)}
.critical-item .action{font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;background:var(--red);color:var(--white);border:none;cursor:pointer;margin-left:auto;font-family:var(--font)}
.report-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;margin-bottom:24px}
.report-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);padding:16px}
.report-title{font-size:13px;font-weight:700;margin-bottom:2px}
.report-patient{font-size:11px;color:var(--frost-500);margin-bottom:4px}
.report-results{font-size:12px;color:#0f172a;line-height:1.6;margin-bottom:6px}
.report-verifier{font-size:10px;color:var(--frost-400)}
.report-time{font-size:10px;color:var(--frost-400);font-family:monospace}
`;

const nav = [
  { group: "SPECIMEN", items: [
    { id: "pending", icon: "\uD83E\uDDEA", label: "Pending Collection", badge: 8 },
    { id: "processing", icon: "\u2697\uFE0F", label: "In Progress", badge: 5 },
    { id: "qc", icon: "\uD83D\uDD2C", label: "QC Review", badge: 3, badgeType: "amber" },
  ]},
  { group: "REPORTING", items: [
    { id: "verified", icon: "\u2705", label: "Verified Results" },
    { id: "reports", icon: "\uD83D\uDCD1", label: "Generated Reports" },
  ]},
  { group: "ANALYTICS", items: [
    { id: "analytics", icon: "\uD83D\uDCCA", label: "Lab Analytics" },
    { id: "critical", icon: "\uD83D\uDEA8", label: "Critical Alerts", badge: 3, badgeType: "red" },
  ]},
];

const pending = [
  { test:"CBC", patient:"Mary A. \u00B7 Bed 1", doctor:"Dr. Kamau", time:"08:15", priority:"urgent", coll:"08:20" },
  { test:"mRDT", patient:"Grace M. \u00B7 Bed 3", doctor:"Dr. Wanjiku", time:"08:22", priority:"critical" },
  { test:"Blood Culture", patient:"Grace M. \u00B7 Bed 3", doctor:"Dr. Wanjiku", time:"08:22", priority:"critical" },
  { test:"U/A", patient:"Peter O. \u00B7 Bed 4", doctor:"Dr. Kamal", time:"08:30", priority:"routine" },
  { test:"HbA1c", patient:"John K. \u00B7 Bed 2", doctor:"Dr. Njoroge", time:"08:10", priority:"urgent" },
  { test:"LFTs", patient:"Samuel K. \u00B7 Bed 8", doctor:"Dr. Kamal", time:"07:55", priority:"routine" },
  { test:"CRP", patient:"Faith J. \u00B7 Bed 7", doctor:"Dr. Wanjiku", time:"08:05", priority:"urgent" },
  { test:"Blood Gas", patient:"John K. \u00B7 Bed 2", doctor:"Dr. Njoroge", time:"08:12", priority:"critical" },
];

const processing = [
  { test:"CBC", patient:"Sarah W. \u00B7 Bed 5", doctor:"Dr. Kamal", time:"07:50", priority:"urgent", started:"08:00" },
  { test:"U/E/Cr", patient:"David N. \u00B7 Bed 6", doctor:"Dr. Nwoge", time:"07:55", priority:"routine", started:"08:05" },
  { test:"PT/APTT", patient:"Samuel K. \u00B7 Bed 8", doctor:"Dr. Kamal", time:"07:45", priority:"urgent", started:"08:00" },
  { test:"CSF Analysis", patient:"David N. \u00B7 Bed 6", doctor:"Dr. Njoroge", time:"08:15", priority:"urgent", started:"08:20" },
  { test:"Blood Group", patient:"Sarah W. \u00B7 Bed 5", doctor:"Dr. Kamal", time:"07:50", priority:"urgent", started:"08:02" },
];

const qcData = [
  { test:"CBC", patient:"Mary A. \u00B7 Bed 1", result:"Hb 8.2", ref:"12-16 g/dL", flag:"abnormal", comment:"Confirm? Repeat recommended" },
  { test:"mRDT", patient:"Grace M. \u00B7 Bed 3", result:"Positive", ref:"Negative", flag:"abnormal", comment:"P. falciparum confirmed" },
  { test:"HbA1c", patient:"John K. \u00B7 Bed 2", result:"11.4%", ref:"<6.5%", flag:"abnormal", comment:"Severe hyperglycemia, flag clinician" },
];

const verified = [
  { test:"CBC", patient:"Peter O. \u00B7 Bed 4", result:"WBC 12.5 x10^9/L", ref:"4-11", verified:"08:45", verifier:"Jane M." },
  { test:"CRP", patient:"Faith J. \u00B7 Bed 7", result:"48 mg/L", ref:"<10", verified:"08:40", verifier:"Jane M." },
  { test:"LFTs", patient:"Samuel K. \u00B7 Bed 8", result:"ALT 65, AST 72 U/L", ref:"<40", verified:"08:35", verifier:"Jane M." },
  { test:"U/E/Cr", patient:"David N. \u00B7 Bed 6", result:"Na 138, K 4.2, Cr 1.1", ref:"135-145/3.5-5.0/0.6-1.2", verified:"08:30", verifier:"John O." },
];

const analytics = [
  { label:"Total Tests Today", value:47, icon:"\uD83E\uDDEA", color:"blue" },
  { label:"Critical Alerts", value:3, icon:"\uD83D\uDEA8", color:"red" },
  { label:"Avg Turnaround", value:"42 min", icon:"\u23F1\uFE0F", color:"amber" },
  { label:"QC Pass Rate", value:"97.3%", icon:"\u2705", color:"green" },
  { label:"Equipment Uptime", value:"99.2%", icon:"\u2699\uFE0F", color:"purple" },
];

const reports = [
  { title:"Daily Lab Summary", date:"09 Jul 2026", type:"Operations", desc:"Total tests, turnaround times, QC metrics, critical alerts summary." },
  { title:"Blood Culture Sensitivity Report", date:"08 Jul 2026", type:"Microbiology", desc:"Organism prevalence and antibiotic sensitivity patterns this month." },
  { title:"QC Monthly Report", date:"01 Jul 2026", type:"Quality", desc:"Internal and external QC performance, corrective actions, improvement plans." },
  { title:"Lab Utilization by Ward", date:"07 Jul 2026", type:"Analytics", desc:"Test ordering patterns by ward and clinician, outlier detection." },
];

export default function CosLabDashboard() {
  const [tab, setTab] = useState("pending");

  const getCount = (id: string) => {
    if (id === "pending") return pending.length;
    if (id === "processing") return processing.length;
    if (id === "qc") return qcData.length;
    if (id === "critical") return 3;
    return 0;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cos-layout">
        <aside className="cos-sidebar">
          <div className="cos-sidebar-brand">AMEXAN <span>LAB</span></div>
          <nav style={{flex:1}}>
            {nav.map((group, gi) => (
              <div key={gi}>
                <div className="sidebar-group">{group.group}</div>
                {group.items.map(item => (
                  <button key={item.id} className={`cos-sidebar-item ${tab===item.id?'active':''}`} onClick={()=>setTab(item.id)}>
                    <span className="icon">{item.icon}</span> {item.label}
                    {(item.badge || getCount(item.id) > 0) && (
                      <span className={`badge ${item.badgeType || ''}`}>{item.badge || getCount(item.id)}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="cos-sidebar-profile">
            <div className="cos-sidebar-avatar">JM</div>
            <div><div className="cos-sidebar-name">Dr. Jane M.</div><div className="cos-sidebar-role">Lab Director</div></div>
          </div>
        </aside>

        <main className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting"><strong>Laboratory</strong> \u00B7 Specimen-Centered Workflow</div>
            <div className="cos-topbar-right">
              <button className="cos-topbar-btn" title="Notifications">{'\uD83D\uDD14'}</button>
              <button className="cos-topbar-btn" title="Settings">{'\u2699\uFE0F'}</button>
              <a href="/cos-landing" className="cos-topbar-btn" title="COS Home">{'\uD83C\uDFE0'}</a>
            </div>
          </header>

          <div className="cos-content">
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon blue">{'\uD83E\uDDEA'}</div><div><div className="stat-val">{pending.length + processing.length}</div><div className="stat-lbl">Active Samples</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\u2705'}</div><div><div className="stat-val">47</div><div className="stat-lbl">Today Total</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\u23F1\uFE0F'}</div><div><div className="stat-val">42m</div><div className="stat-lbl">Avg TAT</div></div></div>
              <div className="stat-card"><div className="stat-icon red">{'\uD83D\uDEA8'}</div><div><div className="stat-val">3</div><div className="stat-lbl">Critical</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\u2699\uFE0F'}</div><div><div className="stat-val">6</div><div className="stat-lbl">Analyzers Active</div></div></div>
            </div>

            {tab === "pending" && (
              <>
                <div className="critical-section">
                  <div className="critical-header">{'\uD83D\uDEA8'} Critical Samples \u2014 Immediate Action Required</div>
                  {pending.filter(s=>s.priority==='critical').map((s,i)=>(
                    <div key={i} className="critical-item">
                      <span>⚠️</span> <strong>{s.test}</strong> \u2014 {s.patient}
                      <span style={{color:'var(--frost-500)'}}>Dr: {s.doctor}</span>
                      <span className="value">CRITICAL</span>
                      <button className="action">Collect Now \u2192</button>
                    </div>
                  ))}
                </div>
                <div className="section-title">{'\uD83E\uDDEA'} Pending Collection <span className="count">{pending.length}</span></div>
                <div className="specimen-grid">
                  {pending.map((s,i)=>(
                    <div key={i} className={`specimen-card ${s.priority}`}>
                      <div className="specimen-icon">{'\uD83E\uDDEA'}</div>
                      <div className="specimen-info">
                        <div className="specimen-test">{s.test}</div>
                        <div className="specimen-patient">{s.patient}</div>
                        <div className="specimen-meta">Order: {s.time} \u00B7 Dr. {s.doctor}{s.coll ? ` \u00B7 Collected: ${s.coll}` : ''}</div>
                      </div>
                      <div className={`specimen-status ${s.coll?'processing':'pending'}`}>
                        {s.coll ? 'Processing' : 'Awaiting Collection'}
                      </div>
                      <div className="specimen-actions" style={{display:'flex',gap:4}}>
                        {!s.coll && <button className="specimen-btn primary">Collect</button>}
                        <button className="specimen-btn outline">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "processing" && (
              <>
                <div className="section-title">{'\u2697\uFE0F'} In Progress <span className="count">{processing.length}</span></div>
                <div className="specimen-grid">
                  {processing.map((s,i)=>(
                    <div key={i} className={`specimen-card ${s.priority}`}>
                      <div className="specimen-icon">{'\u2697\uFE0F'}</div>
                      <div className="specimen-info">
                        <div className="specimen-test">{s.test}</div>
                        <div className="specimen-patient">{s.patient}</div>
                        <div className="specimen-meta">Started: {s.started} \u00B7 Dr. {s.doctor}</div>
                      </div>
                      <div className="specimen-status processing">Running</div>
                      <div className="specimen-actions" style={{display:'flex',gap:4}}>
                        <button className="specimen-btn primary">Verify \u2192</button>
                        <button className="specimen-btn outline">QC</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "qc" && (
              <>
                <div className="section-title">{'\uD83D\uDD2C'} QC Review Required <span className="count">{qcData.length}</span></div>
                <div className="qc-grid">
                  {qcData.map((s,i)=>(
                    <div key={i} className="qc-card">
                      <div className="qc-test">{s.test}</div>
                      <div className="qc-patient">{s.patient}</div>
                      <div className={`qc-result ${s.flag}`}>{s.result}</div>
                      <div className="qc-ref">Ref: {s.ref}</div>
                      <div className="qc-ref" style={{color:'var(--amber-text)',marginTop:2}}>{s.comment}</div>
                      <div className="qc-actions">
                        <button className="qc-btn approve">\u2713 Approve</button>
                        <button className="qc-btn reject">\u2715 Reject</button>
                        <button className="qc-btn review">Re-run</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "verified" && (
              <>
                <div className="section-title">{'\u2705'} Recently Verified</div>
                <div className="specimen-grid">
                  {verified.map((s,i)=>(
                    <div key={i} className="specimen-card" style={{opacity:.8}}>
                      <div className="specimen-icon">{'\u2705'}</div>
                      <div className="specimen-info">
                        <div className="specimen-test">{s.test}</div>
                        <div className="specimen-patient">{s.patient}</div>
                        <div className="specimen-meta">{s.result} \u00B7 Verified: {s.verified} by {s.verifier}</div>
                      </div>
                      <div className="specimen-status verified">Verified</div>
                      <div className="specimen-actions" style={{display:'flex',gap:4}}>
                        <button className="specimen-btn outline">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "reports" && (
              <>
                <div className="section-title">{'\uD83D\uDCD1'} Generated Reports</div>
                <div className="report-grid">
                  {reports.map((r,i)=>(
                    <div key={i} className="report-card">
                      <div className="report-title">{r.title}</div>
                      <div className="report-patient">{r.date} \u00B7 {r.type}</div>
                      <div className="report-results">{r.desc}</div>
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button className="specimen-btn primary">View</button>
                        <button className="specimen-btn outline">Download</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "analytics" && (
              <>
                <div className="section-title">{'\uD83D\uDCCA'} Lab Analytics \u2014 Today</div>
                <div className="stats-row">
                  {analytics.map((s,i)=>(
                    <div key={i} className="stat-card">
                      <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                      <div><div className="stat-val">{s.value}</div><div className="stat-lbl">{s.label}</div></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "critical" && (
              <>
                <div className="critical-section" style={{marginTop:0}}>
                  <div className="critical-header">{'\uD83D\uDEA8'} All Critical Alerts \u2014 Action Log</div>
                  <div className="critical-item"><span>🩸</span> <strong>Grace M. \u00B7 Bed 3</strong> \u2014 Hb 6.2 <span className="value">CRITICAL LOW</span> <button className="action">Doctor Notified</button></div>
                  <div className="critical-item"><span>🧪</span> <strong>John K. \u00B7 Bed 2</strong> \u2014 Blood Gas: pH 7.18, HCO3 12 <span className="value">METABOLIC ACIDOSIS</span> <button className="action">Doctor Notified</button></div>
                  <div className="critical-item"><span>🔬</span> <strong>Grace M. \u00B7 Bed 3</strong> \u2014 mRDT Positive (P. falciparum) <span className="value">MALARIA</span> <button className="action">Treatment Verified</button></div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
