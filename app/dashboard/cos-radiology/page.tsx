"use client";
import { useState } from "react";
import WorkspaceGuard from "@/components/workspace/WorkspaceGuard";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@400;500;600;700&display=swap');
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
body{font-family:'Inter','Noto Sans',sans-serif;background:var(--frost-50);color:#0f172a}
.cos-layout{display:flex;min-height:100vh}
.cos-sidebar{width:220px;background:var(--white);border-right:1px solid var(--frost-200);padding:20px 12px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0}
.cos-sidebar-brand{font-size:20px;font-weight:800;color:var(--sky-700);padding:0 8px 16px;border-bottom:1px solid var(--frost-200);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.cos-sidebar-brand span{background:var(--sky-100);color:var(--sky-600);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700}
.sidebar-group{font-size:10px;font-weight:700;color:var(--frost-400);text-transform:uppercase;letter-spacing:.8px;padding:12px 8px 4px}
.cos-sidebar-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);font-size:13px;font-weight:600;color:var(--frost-500);cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
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
.request-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.request-card{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1.5px solid var(--frost-200);border-radius:var(--radius);background:var(--white);transition:all .15s;cursor:pointer}
.request-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.request-card.emergency{border-left:4px solid var(--red);background:var(--red-bg)}
.request-card.urgent{border-left:4px solid var(--amber)}
.request-card.routine{border-left:4px solid var(--sky-400)}
.request-icon{font-size:24px;width:36px;text-align:center}
.request-info{flex:1;min-width:0}
.request-study{font-size:13px;font-weight:700}
.request-patient{font-size:11px;color:var(--frost-500);margin-top:1px}
.request-question{font-size:11px;color:var(--sky-600);font-weight:600;margin-top:2px;font-style:italic}
.request-meta{font-size:10px;color:var(--frost-400);margin-top:2px}
.request-status{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px}
.request-status.pending{background:var(--amber-bg);color:var(--amber-text)}
.request-status.performed{background:var(--blue-bg);color:var(--blue-text)}
.request-status.reported{background:var(--green-bg);color:var(--green-text)}
.request-actions{display:flex;gap:4px}
.request-btn{font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif}
.request-btn.primary{background:var(--sky-500);color:var(--white)}
.request-btn.primary:hover{background:var(--sky-600)}
.request-btn.outline{background:var(--white);border:1.5px solid var(--frost-200);color:var(--frost-500)}
.request-btn.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.report-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;margin-bottom:24px}
.report-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);padding:16px;transition:all .15s}
.report-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.report-study{font-size:13px;font-weight:700;margin-bottom:2px}
.report-patient{font-size:11px;color:var(--frost-500);margin-bottom:4px}
.report-finding{font-size:12px;color:#0f172a;margin-bottom:6px;line-height:1.5}
.report-meta{font-size:10px;color:var(--frost-400)}
.report-actions{display:flex;gap:4px;margin-top:8px}
.report-btn{font-size:10px;font-weight:700;padding:4px 10px;border-radius:5px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif}
.report-btn.approve{background:var(--green-bg);color:var(--green-text)}
.report-btn.edit{background:var(--sky-50);color:var(--sky-600);border:1px solid var(--sky-200)}
.report-btn.verify{background:var(--purple-bg);color:var(--purple-text)}
`;

const nav = [
  { group: "WORKFLOW", items: [
    { id: "pending", icon: "\uD83E\uDEBB", label: "Pending Studies", badge: 5 },
    { id: "performed", icon: "\uD83D\uDCF8", label: "Performed", badge: 3 },
    { id: "reporting", icon: "\uD83D\uDCDD", label: "Reporting", badge: 4, badgeType: "amber" },
    { id: "completed", icon: "\u2705", label: "Completed" },
  ]},
  { group: "QUALITY", items: [
    { id: "qa", icon: "\uD83D\uDD2C", label: "QA Review", badge: 2 },
    { id: "critical", icon: "\uD83D\uDEA8", label: "Critical Findings", badge: 1, badgeType: "red" },
  ]},
  { group: "ANALYTICS", items: [
    { id: "stats", icon: "\uD83D\uDCCA", label: "Department Stats" },
    { id: "modality", icon: "\uD83D\uDD17", label: "Modality Worklist" },
  ]},
];

const pending = [
  { study:"Chest X-ray PA", patient:"Mary A. \u00B7 Bed 1", question:"Is there consolidation? Persistent cough 3d.", doctor:"Dr. Kamal", time:"08:10", priority:"urgent" },
  { study:"CT Brain without contrast", patient:"David N. \u00B7 Bed 6", question:"Acute stroke? L sided weakness 2h onset.", doctor:"Dr. Njoroge", time:"07:45", priority:"emergency" },
  { study:"Abdominal Ultrasound", patient:"Grace M. \u00B7 Bed 3", question:"RUQ pain, malaria workup in progress. Gallbladder?", doctor:"Dr. Wanjiku", time:"08:30", priority:"routine" },
  { study:"ECHO", patient:"Samuel K. \u00B7 Bed 8", question:"HF r/o diastolic dysfunction. LVEF? Previous 35%.", doctor:"Dr. Kamal", time:"08:00", priority:"urgent" },
  { study:"KUB X-ray", patient:"Peter O. \u00B7 Bed 4", question:"Dehydration, r/o obstruction.", doctor:"Dr. Kamal", time:"08:45", priority:"routine" },
];

const performed = [
  { study:"Chest X-ray PA", patient:"Sarah W. \u00B7 Bed 5", question:"Pre-op clearance.", doctor:"Dr. Kamal", time:"07:50", priority:"routine", status:"Awaiting Report" },
  { study:"CT Brain", patient:"David N. \u00B7 Bed 6", question:"Stroke protocol.", doctor:"Dr. Njoroge", time:"08:00", priority:"emergency", status:"Images Ready" },
  { study:"Abdominal US", patient:"Faith J. \u00B7 Bed 7", question:"Pyelonephritis? Renal abscess?", doctor:"Dr. Wanjiku", time:"08:20", priority:"urgent", status:"Awaiting Report" },
];

const reporting = [
  { study:"CT Brain", patient:"David N. \u00B7 Bed 6", question:"Stroke protocol", doctor:"Dr. Njoroge", time:"07:45", priority:"emergency", finding:"No acute intracranial hemorrhage. No mass effect. Old lacunar infarcts in basal ganglia. MCA territories patent.", reportedBy:"Dr. Jane R.", doneTime:"08:45" },
  { study:"Chest X-ray", patient:"Sarah W. \u00B7 Bed 5", question:"Pre-op clearance", doctor:"Dr. Kamal", time:"07:50", priority:"routine", finding:"Clear lung fields. No consolidation, effusion, or pneumothorax. Cardiomediastinal silhouette normal.", reportedBy:"Dr. Jane R.", doneTime:"08:30" },
  { study:"ECHO", patient:"Samuel K. \u00B7 Bed 8", question:"HF r/o diastolic dysfunction", doctor:"Dr. Kamal", time:"08:00", priority:"urgent", finding:"LVEF 35-40%. Global hypokinesis. Mild MR. Diastolic dysfunction Grade II. RA pressure 8mmHg.", reportedBy:"Dr. John O.", doneTime:"Pending Review" },
  { study:"KUB", patient:"Peter O. \u00B7 Bed 4", question:"Dehydration r/o obstruction", doctor:"Dr. Kamal", time:"08:45", priority:"routine", finding:"No evidence of obstruction. Bowel gas pattern normal. No abnormal calcifications.", reportedBy:"Dr. Jane R.", doneTime:"09:00" },
];

const completed = [
  { study:"Chest X-ray", patient:"Mary K. \u00B7 Discharged", question:"Follow-up", doctor:"Dr. Kamal", time:"Yesterday", priority:"routine", finding:"Normal study.", reportedBy:"Dr. Jane R.", doneTime:"15:30" },
];

const renderRequests = (items: any[], showFindings: boolean = false) => (
  <div className="request-grid">
    {items.map((r,i)=>(
      <div key={i} className={`request-card ${r.priority==='emergency'?'emergency':r.priority==='urgent'?'urgent':'routine'}`}>
        <div className="request-icon">{r.priority==='emergency'?'\uD83D\uDEA8':r.study.includes('CT')?'\uD83D\uDDA5\uFE0F':r.study.includes('US')||r.study.includes('ECHO')?'\uD83D\uDCE1':'\uD83E\uDEBB'}</div>
        <div className="request-info">
          <div className="request-study">{r.study}</div>
          <div className="request-patient">{r.patient} \u00B7 Dr. {r.doctor}</div>
          <div className="request-question">{'\u275D'} {r.question} {'\u275E'}</div>
          {showFindings && r.finding && <div style={{fontSize:12,marginTop:4,lineHeight:1.5}}>{r.finding}</div>}
          <div className="request-meta">{r.time} \u00B7 {r.priority}{r.reportedBy ? ` \u00B7 Reported: ${r.reportedBy}` : ''}{r.doneTime ? ` \u00B7 ${r.doneTime}` : ''}</div>
        </div>
        {!showFindings && <div className={`request-status ${r.status?.includes('Ready')?'performed':'pending'}`}>{r.status || r.priority}</div>}
        <div className="request-actions">
          {!showFindings ? <>
            <button className="request-btn primary">Perform</button>
            <button className="request-btn outline">Details</button>
          </> : <>
            <button className="report-btn approve">{'\u2713'} Approve</button>
            <button className="report-btn edit">Edit</button>
          </>}
        </div>
      </div>
    ))}
  </div>
);

function _CosRadiologyDashboard() {
  const [tab, setTab] = useState("pending");
  const [activePatient, setActivePatient] = useState<any>(null);

  const getCount = (id: string) => {
    if (id === "pending") return pending.length;
    if (id === "performed") return performed.length;
    if (id === "reporting") return reporting.length;
    if (id === "qa") return 2;
    if (id === "critical") return 1;
    return 0;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cos-layout">
        <aside className="cos-sidebar">
          <div className="cos-sidebar-brand">AMEXAN <span>RAD</span></div>
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
            <div className="cos-sidebar-avatar">JR</div>
            <div><div className="cos-sidebar-name">Dr. Jane R.</div><div className="cos-sidebar-role">Radiologist</div></div>
          </div>
        </aside>

        <main className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting"><strong>Radiology</strong> \u00B7 Clinical Question Centered</div>
            <div className="cos-topbar-right">
              <button className="cos-topbar-btn">{'\uD83D\uDD14'}</button>
              <button className="cos-topbar-btn">{'\u2699\uFE0F'}</button>
              <a href="/cos-landing" className="cos-topbar-btn">{'\uD83C\uDFE0'}</a>
            </div>
          </header>

          <div className="cos-content">
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon red">{'\uD83D\uDEA8'}</div><div><div className="stat-val">1</div><div className="stat-lbl">Emergency</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\u23F1\uFE0F'}</div><div><div className="stat-val">3</div><div className="stat-lbl">Urgent</div></div></div>
              <div className="stat-card"><div className="stat-icon blue">{'\uD83D\uDCCB'}</div><div><div className="stat-val">12</div><div className="stat-lbl">Today Total</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\u2705'}</div><div><div className="stat-val">48m</div><div className="stat-lbl">Avg Report Time</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\uD83D\uDD2C'}</div><div><div className="stat-val">2</div><div className="stat-lbl">QA Review</div></div></div>
            </div>

            {tab === "pending" && <><div className="section-title">{'\uD83E\uDEBB'} Pending Studies <span className="count">{pending.length}</span></div>{renderRequests(pending, false)}</>}

            {tab === "performed" && <><div className="section-title">{'\uD83D\uDCF8'} Performed \u2014 Awaiting Report <span className="count">{performed.length}</span></div>{renderRequests(performed, false)}</>}

            {tab === "reporting" && (
              <><div className="section-title">{'\uD83D\uDCDD'} Reporting <span className="count">{reporting.length}</span></div>
              <div className="report-grid">
                {reporting.map((r,i)=>(
                  <div key={i} className="report-card">
                    <div className="report-study">{r.study}</div>
                    <div className="report-patient">{r.patient} \u00B7 {r.doneTime}</div>
                    <div className="report-finding">{r.finding}</div>
                    <div className="report-meta">Reported by {r.reportedBy}</div>
                    <div className="report-actions">
                      <button className="report-btn approve">{'\u2713'} Approve & Sign</button>
                      <button className="report-btn edit">Edit</button>
                      <button className="report-btn verify">Addendum</button>
                    </div>
                  </div>
                ))}
              </div>
            </>)}

            {tab === "completed" && (
              <><div className="section-title">{'\u2705'} Completed Reports</div>
              <div className="request-grid">
                {completed.map((r,i)=>(
                  <div key={i} className="request-card done" style={{opacity:'.7'}}>
                    <div className="request-icon">{'\u2705'}</div>
                    <div className="request-info">
                      <div className="request-study">{r.study}</div>
                      <div className="request-patient">{r.patient}</div>
                      <div className="request-question" style={{fontWeight:400,fontStyle:'normal'}}>{r.finding}</div>
                      <div className="request-meta">{r.doneTime} \u00B7 {r.reportedBy}</div>
                    </div>
                    <div className="request-status reported">Signed</div>
                  </div>
                ))}
              </div>
            </>)}

            {tab === "qa" && (
              <>
                <div className="section-title">{'\uD83D\uDD2C'} QA Review <span className="count">2</span></div>
                <div className="report-grid">
                  {[
                    {study:"CT Chest", patient:"John K. \u00B7 Bed 2", issue:"Image quality: motion artifact noted in lower lobes", action:"Repeat sequences recommended", reviewer:"Dr. Jane R."},
                    {study:"Abdominal US", patient:"Grace M. \u00B7 Bed 3", issue:"Incomplete study: gallbladder not adequately visualized", action:"Schedule repeat US with fasting prep", reviewer:"Dr. John O."},
                  ].map((qa,i)=>(
                    <div key={i} className="report-card" style={{borderLeft:'4px solid var(--purple)'}}>
                      <div className="report-study">{qa.study}</div>
                      <div className="report-patient">{qa.patient}</div>
                      <div className="report-finding" style={{marginTop:4}}><strong>Issue:</strong> {qa.issue}</div>
                      <div className="report-finding"><strong>Action:</strong> {qa.action}</div>
                      <div className="report-meta">By: {qa.reviewer}</div>
                      <div className="report-actions">
                        <button className="report-btn approve">Resolved</button>
                        <button className="report-btn edit">Escalate</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "critical" && (
              <>
                <div className="stats-row" style={{marginTop:0}}>
                  <div className="stat-card" style={{background:'var(--red-bg)',borderColor:'var(--red)'}}>
                    <div className="stat-icon red">{'\uD83D\uDEA8'}</div>
                    <div><div className="stat-val" style={{color:'var(--red-text)'}}>1</div><div className="stat-lbl">Unreported Critical</div></div>
                  </div>
                </div>
                <div className="report-card" style={{borderLeft:'4px solid var(--red)',background:'var(--red-bg)'}}>
                  <div className="report-study">CT Brain \u2014 David N. \u00B7 Bed 6</div>
                  <div className="report-finding" style={{fontWeight:700,color:'var(--red-text)',fontSize:14}}>{'\u26A0\uFE0F'} CRITICAL FINDING: Old lacunar infarcts with new MCA territory changes</div>
                  <div className="report-meta">Study started: 07:45 \u00B7 Critical alert sent to Dr. Njoroge at 08:15</div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="request-btn primary" style={{background:'var(--red)',fontSize:11}}>Confirm Communication</button>
                    <button className="report-btn verify">Document in Report</button>
                  </div>
                </div>
              </>
            )}

            {tab === "stats" && (
              <>
                <div className="section-title">{'\uD83D\uDCCA'} Department Statistics</div>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-icon blue">{'\uD83E\uDEBB'}</div><div><div className="stat-val">12</div><div className="stat-lbl">Total Studies</div></div></div>
                  <div className="stat-card"><div className="stat-icon green">{'\u2705'}</div><div><div className="stat-val">8</div><div className="stat-lbl">Reported</div></div></div>
                  <div className="stat-card"><div className="stat-icon amber">{'\u23F1\uFE0F'}</div><div><div className="stat-val">62%</div><div className="stat-lbl">Report Rate</div></div></div>
                  <div className="stat-card"><div className="stat-icon red">{'\u26A0\uFE0F'}</div><div><div className="stat-val">2</div><div className="stat-lbl">Incidental Findings</div></div></div>
                </div>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-icon purple">{'\uD83D\uDDA5\uFE0F'}</div><div><div className="stat-val">3</div><div className="stat-lbl">CT Scans</div></div></div>
                  <div className="stat-card"><div className="stat-icon blue">{'\uD83E\uDEBB'}</div><div><div className="stat-val">5</div><div className="stat-lbl">X-Rays</div></div></div>
                  <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDCE1'}</div><div><div className="stat-val">2</div><div className="stat-lbl">Ultrasounds</div></div></div>
                  <div className="stat-card"><div className="stat-icon amber">{'\uD83D\uDD14'}</div><div><div className="stat-val">2</div><div className="stat-lbl">ECHOs</div></div></div>
                </div>
              </>
            )}

            {tab === "modality" && (
              <>
                <div className="section-title">{'\uD83D\uDD17'} Modality Worklist</div>
                <div className="specimen-grid" style={{marginTop:0}}>
                  {[
                    {modality:"CT Scanner 1", study:"CT Brain", patient:"David N. \u00B7 Bed 6", status:"Completed 08:00", next:"CT Chest (scheduled 09:30)"},
                    {modality:"X-Ray Room 1", study:"Chest X-ray", patient:"Mary A. \u00B7 Bed 1", status:"Pending", next:"Chest X-ray \u2014 Bed 5 (queue)"},
                    {modality:"Ultrasound 1", study:"Abdominal US", patient:"Grace M. \u00B7 Bed 3", status:"Pending", next:"Renal US \u2014 Bed 7 (queue)"},
                    {modality:"ECHO 1", study:"ECHO", patient:"Samuel K. \u00B7 Bed 8", status:"Pending", next:"\u2014"},
                  ].map((m,i)=>(
                    <div key={i} className="request-card">
                      <div className="request-icon">{'\uD83D\uDD17'}</div>
                      <div className="request-info">
                        <div className="request-study">{m.modality}</div>
                        <div className="request-patient">Current: {m.study} \u2014 {m.patient}</div>
                        <div className="request-meta">Status: {m.status} \u00B7 {m.next}</div>
                      </div>
                      <div className={`request-status ${m.status.includes('Completed')?'reported':'pending'}`}>{m.status.includes('Completed')?'Done':'Ready'}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const SUPPORTED_ROLES = ['radiology'] as const;

export default function CosRadiologyDashboard() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <_CosRadiologyDashboard />
    </WorkspaceGuard>
  );
}
