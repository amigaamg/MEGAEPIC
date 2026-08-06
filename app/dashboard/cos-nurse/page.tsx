"use client";
import { useState } from "react";
import WorkspaceGuard from "@/components/workspace/WorkspaceGuard";

const S = `
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
.nurse-layout{display:flex;min-height:100vh}
.nurse-sidebar{width:220px;background:var(--white);border-right:1px solid var(--frost-200);padding:20px 12px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0}
.nurse-brand{font-size:20px;font-weight:800;color:var(--sky-700);padding:0 8px 16px;border-bottom:1px solid var(--frost-200);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.nurse-brand span{background:var(--sky-100);color:var(--sky-600);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700}
.sidebar-group{font-size:10px;font-weight:700;color:var(--frost-400);text-transform:uppercase;letter-spacing:.8px;padding:12px 8px 4px}
.nurse-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);font-size:13px;font-weight:600;color:var(--frost-500);cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
.nurse-nav-item:hover{background:var(--sky-50);color:var(--sky-700)}
.nurse-nav-item.active{background:var(--sky-100);color:var(--sky-700);font-weight:700}
.nurse-nav-item .icon{font-size:16px;width:20px;text-align:center}
.nurse-nav-item .badge{margin-left:auto;background:var(--red-bg);color:var(--red-text);font-size:10px;font-weight:700;padding:1px 6px;border-radius:99px;min-width:18px;text-align:center}
.nurse-nav-item .badge.amber{background:var(--amber-bg);color:var(--amber-text)}
.nurse-nav-item .badge.green{background:var(--green-bg);color:var(--green-text)}
.nurse-profile{padding:12px 8px;border-top:1px solid var(--frost-200);display:flex;align-items:center;gap:10px;margin-top:auto}
.nurse-avatar{width:36px;height:36px;border-radius:10px;background:var(--sky-500);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
.nurse-name{font-size:12px;font-weight:700}
.nurse-role{font-size:10px;color:var(--frost-500)}
.nurse-main{flex:1;display:flex;flex-direction:column;min-width:0}
.nurse-topbar{height:56px;background:var(--white);border-bottom:1px solid var(--frost-200);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:50}
.nurse-greeting{font-size:14px;color:var(--frost-500)}
.nurse-greeting strong{color:#0f172a}
.nurse-topbar-right{display:flex;align-items:center;gap:12px}
.nurse-topbar-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid var(--frost-200);background:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all .15s}
.nurse-topbar-btn:hover{border-color:var(--sky-300);background:var(--sky-50)}
.nurse-body{padding:20px 24px 40px;flex:1;max-width:1400px;width:100%;margin:0 auto}
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
.shift-banner{background:var(--white);border:1px solid var(--sky-200);border-radius:var(--radius);padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}
.shift-info{display:flex;align-items:center;gap:16px}
.shift-label{font-size:11px;color:var(--frost-500)}
.shift-value{font-size:14px;font-weight:700}
.shift-value .bed{color:var(--frost-400);font-weight:400}
.shift-actions{display:flex;gap:8px}
.shift-btn{font-size:11px;font-weight:700;padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
.shift-btn.primary{background:var(--sky-500);color:var(--white)}
.shift-btn.primary:hover{background:var(--sky-600)}
.shift-btn.outline{background:var(--white);border:1.5px solid var(--frost-200);color:var(--frost-500)}
.shift-btn.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.task-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
@media(max-width:900px){.task-grid{grid-template-columns:1fr}}
.task-section{background:var(--white);border:1px solid var(--frost-200);border-radius:var(--radius-lg);overflow:hidden}
.task-section-header{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--frost-200);background:var(--frost-50)}
.task-section-title{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.task-section-count{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px}
.task-section-count.red{background:var(--red-bg);color:var(--red-text)}
.task-section-count.amber{background:var(--amber-bg);color:var(--amber-text)}
.task-section-count.green{background:var(--green-bg);color:var(--green-text)}
.task-section-count.blue{background:var(--blue-bg);color:var(--blue-text)}
.task-list{padding:8px}
.task-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--frost-200);border-radius:var(--radius-sm);margin-bottom:6px;cursor:pointer;transition:all .1s}
.task-item:hover{border-color:var(--sky-300);background:var(--sky-50)}
.task-item.done{opacity:.5}
.task-item.urgent{background:var(--red-bg);border-color:var(--red)}
.task-bed{width:26px;height:26px;border-radius:6px;background:var(--sky-100);color:var(--sky-700);font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.task-body{flex:1;font-size:12px}
.task-body .task-name{font-weight:600}
.task-body .task-detail{font-size:10px;color:var(--frost-500);margin-top:1px}
.task-time{font-size:10px;color:var(--frost-400);font-family:monospace;font-weight:600}
.task-check{width:20px;height:20px;border-radius:4px;border:2px solid var(--frost-200);background:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .1s;font-size:11px;flex-shrink:0}
.task-check:hover{border-color:var(--sky-400);background:var(--sky-50)}
.task-check.done{background:var(--green);border-color:var(--green);color:var(--white)}
.vitals-board{background:var(--white);border:1px solid var(--frost-200);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:24px}
.vitals-board-header{padding:14px 16px;border-bottom:1px solid var(--frost-200);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;background:var(--frost-50);justify-content:space-between}
.vitals-board-body{padding:12px}
.vitals-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
.vitals-bed-card{border:1px solid var(--frost-200);border-radius:var(--radius-sm);padding:10px;display:flex;align-items:center;gap:10px;transition:all .1s}
.vitals-bed-card:hover{border-color:var(--sky-300)}
.vitals-bed-info{flex:1}
.vitals-bed-num{font-size:11px;font-weight:800;color:var(--sky-600)}
.vitals-bed-name{font-size:12px;font-weight:600}
.vitals-bed-status{font-size:10px;color:var(--frost-400);margin-top:1px}
.vitals-bed-status.flag{color:var(--red);font-weight:600}
.vitals-record-btn{font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;border:1.5px solid var(--sky-200);background:var(--sky-50);color:var(--sky-600);cursor:pointer;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
.vitals-record-btn:hover{background:var(--sky-100);border-color:var(--sky-400)}
.alert-panel{background:var(--red-bg);border:1px solid var(--red);border-radius:var(--radius);padding:16px;margin-bottom:24px}
.alert-header{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--red-text);margin-bottom:10px}
.alert-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:var(--radius-sm);background:var(--white);margin-bottom:4px;font-size:12px;border-left:4px solid var(--red)}
.alert-item .val{font-weight:800;color:var(--red)}
.alert-item .act{font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;background:var(--red);color:var(--white);border:none;cursor:pointer;margin-left:auto;font-family:'Inter','Noto Sans',sans-serif}
.io-chart{background:var(--white);border:1px solid var(--frost-200);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:24px}
.io-header{padding:14px 16px;border-bottom:1px solid var(--frost-200);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;background:var(--frost-50)}
.io-body{padding:12px;display:flex;flex-direction:column;gap:6px}
.io-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--frost-200);border-radius:var(--radius-sm)}
.io-bed{width:26px;height:26px;border-radius:6px;background:var(--sky-100);color:var(--sky-700);font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.io-info{flex:1;font-size:12px}
.io-info .io-name{font-weight:600}
.io-info .io-detail{font-size:10px;color:var(--frost-500)}
.io-bal{font-size:11px;font-weight:700;font-family:monospace}
.io-bal.pos{color:var(--green)}
.io-bal.neg{color:var(--red)}
.handover-panel{background:var(--white);border:1px solid var(--frost-200);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:24px}
.handover-header{padding:14px 16px;border-bottom:1px solid var(--frost-200);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;background:var(--frost-50);justify-content:space-between}
.handover-body{padding:12px;display:flex;flex-direction:column;gap:6px}
.handover-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid var(--frost-200);border-radius:var(--radius-sm)}
.handover-bed{width:28px;height:28px;border-radius:6px;background:var(--sky-100);color:var(--sky-700);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.handover-info{flex:1;font-size:12px}
.handover-info .handover-name{font-weight:700}
.handover-info .handover-detail{color:var(--frost-500);margin-top:2px;line-height:1.5}
.handover-info .handover-detail .label{color:var(--frost-400);font-weight:600}
.handover-priority{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px}
.handover-priority.high{background:var(--red-bg);color:var(--red-text)}
.handover-priority.med{background:var(--amber-bg);color:var(--amber-text)}
.handover-priority.low{background:var(--green-bg);color:var(--green-text)}
.double-column{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
@media(max-width:900px){.double-column{grid-template-columns:1fr}}
`;

function _CosNurseDashboard() {
  const [tab, setTab] = useState("handover");
  const [tasks, setTasks] = useState([
    { bed: 3, name: "Grace M.", task: "IV Artesunate 2.4mg/kg", detail: "12hrly dose due", time: "10:30", urgent: true, done: false },
    { bed: 1, name: "Mary A.", task: "IV Ceftriaxone 1g", detail: "BD \u00B7 Next dose", time: "10:45", urgent: false, done: false },
    { bed: 2, name: "John K.", task: "Insulin infusion check", detail: "Rate verification", time: "09:30", urgent: true, done: false },
    { bed: 3, name: "Grace M.", task: "Blood transfusion obs", detail: "1 unit PRBC \u00B7 2nd hour", time: "09:15", urgent: false, done: false },
    { bed: 7, name: "Faith J.", task: "IV antibiotics", detail: "Ceftriaxone due", time: "11:30", urgent: false, done: true },
    { bed: 4, name: "Peter O.", task: "IV fluids check", detail: "Rate, site inspection", time: "10:00", urgent: false, done: false },
    { bed: 5, name: "Sarah W.", task: "Pre-op checklist", detail: "NBM \u00B7 Consent verified", time: "11:00", urgent: true, done: true },
    { bed: 8, name: "Samuel K.", task: "Heparin SC 5000U", detail: "q8h dose due", time: "10:00", urgent: false, done: false },
  ]);

  const toggleTask = (i: number) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;
    setTasks(updated);
  };

  const sidebarGroups = [
    { label: "PATIENT", items: [
      { id: "handover", icon: "\uD83D\uDC65", label: "Handover", badge: 8 },
      { id: "vitals", icon: "\uD83C\uDF21\uFE0F", label: "Vitals", badge: 5 },
    ]},
    { label: "CARE", items: [
      { id: "tasks", icon: "\uD83D\uDCCB", label: "Task List", badge: 6 },
      { id: "meds", icon: "\uD83D\uDC8A", label: "Medications", badge: 4 },
      { id: "fluids", icon: "\uD83D\uDCA7", label: "I/O Chart", badge: 3 },
    ]},
    { label: "COMMUNICATION", items: [
      { id: "alerts", icon: "\uD83D\uDD14", label: "Alerts", badge: 2, badgeType: "red" },
      { id: "orders", icon: "\uD83D\uDCDD", label: "Doctor Orders", badge: 3, badgeType: "amber" },
    ]},
    { label: "REPORTING", items: [
      { id: "shift", icon: "\uD83D\uDD04", label: "Shift Summary" },
      { id: "discharges", icon: "\uD83D\uDEAA", label: "Discharges", badge: 4, badgeType: "green" },
    ]},
  ];

  const beds = [
    { num: 1, name: "Mary A.", dx: "Severe Malaria", flag: false },
    { num: 2, name: "John K.", dx: "DKA", flag: true },
    { num: 3, name: "Grace M.", dx: "Severe Anaemia", flag: false },
    { num: 4, name: "Peter O.", dx: "Gastroenteritis", flag: false },
    { num: 5, name: "Sarah W.", dx: "Pre-op", flag: false },
    { num: 6, name: "David N.", dx: "Stroke", flag: true },
    { num: 7, name: "Faith J.", dx: "Pyelonephritis", flag: false },
    { num: 8, name: "Samuel K.", dx: "Heart Failure", flag: false },
  ];

  const handoverData = [
    { bed: 3, name: "Grace M.", dx: "Severe Anaemia (Hb 6.2)", plan: "Transfuse 1 unit PRBC, repeat Hb post-transfusion. Monitor vitals 15 min during transfusion.", pending: ["Blood transfusion in progress", "Repeat CBC post-transfusion"], priority: "high" },
    { bed: 2, name: "John K.", dx: "DKA (BM 18.4)", plan: "IV Insulin infusion 5U/hr. Monitor BM hourly. Check K+ 4hrly.", pending: ["Insulin infusion running", "K+ result awaited"], priority: "high" },
    { bed: 6, name: "David N.", dx: "Acute Stroke (L sided weakness)", plan: "CT Brain done - no haemorrhage. Start aspirin. Monitor GCS 2hrly.", pending: ["CT read pending", "Aspirin due 14:00"], priority: "med" },
    { bed: 1, name: "Mary A.", dx: "Severe Malaria (P. falciparum)", plan: "IV Artesunate per protocol. Monitor parasite count.", pending: ["IV Artesunate dose due 10:30", "mRDT clearance Day 3"], priority: "med" },
    { bed: 7, name: "Faith J.", dx: "Pyelonephritis", plan: "IV Ceftriaxone 1g BD. Push oral fluids. Catheter care.", pending: ["Urine culture result", "Temp monitoring 4hrly"], priority: "low" },
    { bed: 5, name: "Sarah W.", dx: "Pre-op (Cholecystectomy)", plan: "NBM from midnight. Consent signed. Pre-op checklist complete.", pending: ["OT scheduled 14:00", "Pre-op vitals"], priority: "low" },
  ];

  const counts = (id: string) => {
    if (id === "tasks") return tasks.filter(t => !t.done).length;
    if (id === "meds") return 4;
    if (id === "vitals") return 5;
    if (id === "alerts") return 2;
    return 0;
  };

  const renderContent = () => {
    switch (tab) {
      case "handover":
        return (
          <>
            <div className="shift-banner">
              <div className="shift-info">
                <div><div className="shift-label">Shift</div><div className="shift-value">Morning (06:00\u201314:00)</div></div>
                <div><div className="shift-label">Ward</div><div className="shift-value">Male Medical <span className="bed">\u00B7 8 patients</span></div></div>
                <div><div className="shift-label">Staff</div><div className="shift-value">Mary N. (RN) + 2 students</div></div>
              </div>
              <div className="shift-actions">
                <button className="shift-btn outline">Request Handover</button>
                <button className="shift-btn primary">Start Round</button>
              </div>
            </div>
            <div className="handover-panel">
              <div className="handover-header">
                <span>\uD83D\uDC65 Bed-to-Bed Handover</span>
                <span className="task-section-count red">2 high priority</span>
              </div>
              <div className="handover-body">
                {handoverData.map((h, i) => (
                  <div key={i} className="handover-item">
                    <div className="handover-bed">{h.bed}</div>
                    <div className="handover-info">
                      <div className="handover-name">{h.name} \u2014 {h.dx}</div>
                      <div className="handover-detail"><span className="label">Plan:</span> {h.plan}</div>
                      <div className="handover-detail"><span className="label">Pending:</span> {h.pending.join(" \u00B7 ")}</div>
                    </div>
                    <div className={`handover-priority ${h.priority}`}>{h.priority.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "vitals":
        return (
          <>
            <div className="section-title">{'\uD83C\uDF21\uFE0F'} Vitals Round <span className="count">5 due now</span></div>
            <div className="vitals-board" style={{marginTop:0}}>
              <div className="vitals-board-header">
                <span>Record Vital Signs \u2014 All Beds</span>
                <span style={{fontSize:11,fontWeight:400,color:'var(--frost-500)'}}>BP / HR / Temp / RR / SpO2</span>
              </div>
              <div className="vitals-board-body">
                <div className="vitals-grid">
                  {beds.map((b, i) => (
                    <div key={i} className="vitals-bed-card">
                      <div className="vitals-bed-info">
                        <div className="vitals-bed-num">Bed {b.num}</div>
                        <div className="vitals-bed-name">{b.name}</div>
                        <div className={`vitals-bed-status ${b.flag ? 'flag' : ''}`}>{b.dx}{b.flag ? ' \u26A0\uFE0F' : ''}</div>
                      </div>
                      <button className="vitals-record-btn">Record \u2192</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\u26A0\uFE0F'} NEWS Scores</div>
                </div>
                <div className="task-list">
                  {[{bed:2,name:"John K.",score:7,level:"High"},{bed:6,name:"David N.",score:5,level:"Medium"},{bed:1,name:"Mary A.",score:3,level:"Low"}].map((n,i)=>(
                    <div key={i} className="task-item" style={n.level==='High'?{background:'var(--red-bg)',borderColor:'var(--red)'}:n.level==='Medium'?{background:'var(--amber-bg)',borderColor:'var(--amber)'}:{}}>
                      <div className="task-bed">{n.bed}</div>
                      <div className="task-body">
                        <div className="task-name" style={n.level==='High'?{color:'var(--red-text)'}:{}}>{n.name}</div>
                        <div className="task-detail">NEWS: <strong>{n.score}</strong> \u2014 {n.level} risk</div>
                      </div>
                      <div className="task-time">{n.level==='High'?'\uD83D\uDD14':'\uD83D\uDC44'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDC8A'} PRN Medications Due</div>
                  <span className="task-section-count amber">3 due</span>
                </div>
                <div className="task-list">
                  {[{bed:2,name:"John K.",med:"Paracetamol 1g",detail:"BM < 4.0 rescue"},{bed:7,name:"Faith J.",med:"Ondansetron 4mg",detail:"PRN nausea"},{bed:3,name:"Grace M.",med:"Chlorpheniramine 10mg",detail:"PRN itch (transfusion)"}].map((p,i)=>(
                    <div key={i} className="task-item">
                      <div className="task-bed">{p.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{p.med}</div>
                        <div className="task-detail">Bed {p.bed} \u00B7 {p.name} \u00B7 {p.detail}</div>
                      </div>
                      <div className={`task-check ${p.bed===7?'done':''}`}>{p.bed===7?'\u2713':''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "tasks":
        return (
          <>
            <div className="section-title">{'\uD83D\uDCCB'} Task List <span className="count">{counts("tasks")} pending</span></div>
            <div className="task-grid">
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDC8A'} Medication Round</div>
                  <span className="task-section-count red">{tasks.filter(t=>!t.done&&t.urgent&&t.task.includes("IV")).length} urgent</span>
                </div>
                <div className="task-list">
                  {tasks.filter(t => !t.done).slice(0, 4).map((t, i) => (
                    <div key={i} className={`task-item ${t.done ? 'done' : ''} ${t.urgent && !t.done ? 'urgent' : ''}`}>
                      <div className="task-bed">{t.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{t.task}</div>
                        <div className="task-detail">Bed {t.bed} \u00B7 {t.name} \u00B7 {t.detail}</div>
                      </div>
                      <div className="task-time">{t.time}</div>
                      <div className={`task-check ${t.done ? 'done' : ''}`} onClick={() => toggleTask(i)}>{t.done ? '\u2713' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDCA7'} IV Fluids & Monitoring</div>
                  <span className="task-section-count amber">3 active</span>
                </div>
                <div className="task-list">
                  {[
                    { bed: 4, name: "Peter O.", task: "IV fluids check", detail: "Rate 100ml/hr, site OK", time: "10:00" },
                    { bed: 2, name: "John K.", task: "Insulin infusion", detail: "Rate 5U/hr, BM 8.2", time: "09:30" },
                    { bed: 3, name: "Grace M.", task: "Blood transfusion obs", detail: "15 min vitals", time: "09:15" },
                  ].map((t, i) => (
                    <div key={i} className="task-item">
                      <div className="task-bed">{t.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{t.task}</div>
                        <div className="task-detail">Bed {t.bed} \u00B7 {t.name} \u00B7 {t.detail}</div>
                      </div>
                      <div className="task-time">{t.time}</div>
                      <div className="task-check" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\u26A0\uFE0F'} Escalations</div>
                  <span className="task-section-count red">2 active</span>
                </div>
                <div className="task-list">
                  {[
                    { bed: 3, name: "Grace M.", task: "Bleeding from IV site", detail: "Request doctor review", time: "09:45" },
                    { bed: 7, name: "Faith J.", task: "Temp spike 39.5\u00B0C", detail: "Post-antipyretic", time: "10:20" },
                  ].map((t, i) => (
                    <div key={i} className="task-item" style={{background:'var(--red-bg)',borderColor:'var(--red)'}}>
                      <div className="task-bed">{t.bed}</div>
                      <div className="task-body">
                        <div className="task-name" style={{color:'var(--red-text)'}}>{t.task}</div>
                        <div className="task-detail">Bed {t.bed} \u00B7 {t.name} \u00B7 {t.detail}</div>
                      </div>
                      <div className="task-time">{t.time}</div>
                      <div className="task-check" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDEAA'} Today\'s Discharges</div>
                  <span className="task-section-count green">4 planned</span>
                </div>
                <div className="task-list">
                  {[
                    { bed: 1, name: "Mary A.", task: "Discharge summary", detail: "Review medications", time: "14:00" },
                    { bed: 4, name: "Peter O.", task: "Discharge criteria met", detail: "Oral feeds tolerated", time: "12:00" },
                    { bed: 6, name: "David N.", task: "OT referral arranged", detail: "Physiotherapy", time: "15:00" },
                  ].map((t, i) => (
                    <div key={i} className="task-item">
                      <div className="task-bed">{t.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{t.task}</div>
                        <div className="task-detail">Bed {t.bed} \u00B7 {t.name} \u00B7 {t.detail}</div>
                      </div>
                      <div className="task-time">{t.time}</div>
                      <div className="task-check" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "meds":
        return (
          <>
            <div className="section-title">{'\uD83D\uDC8A'} Medications Overview</div>
            <div className="double-column">
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">Scheduled Medications</div>
                  <span className="task-section-count blue">6 active</span>
                </div>
                <div className="task-list">
                  {[
                    {bed:1,name:"Mary A.",med:"IV Ceftriaxone 1g",sch:"08:00 / 20:00",status:"Given 08:15"},
                    {bed:2,name:"John K.",med:"Insulin infusion 5U/hr",sch:"Continuous",status:"Running"},
                    {bed:3,name:"Grace M.",med:"IV Artesunate 60mg",sch:"Stat then 12hrly",status:"Due 10:30"},
                    {bed:7,name:"Faith J.",med:"IV Ceftriaxone 1g",sch:"08:00 / 20:00",status:"Given 08:10"},
                    {bed:8,name:"Samuel K.",med:"Heparin 5000U SC",sch:"06:00 / 14:00 / 22:00",status:"Due 14:00"},
                    {bed:8,name:"Samuel K.",med:"Furosemide 40mg PO",sch:"08:00 / 20:00",status:"Given 08:05"},
                  ].map((m,i)=>(
                    <div key={i} className="task-item" style={{flexWrap:'wrap'}}>
                      <div className="task-bed">{m.bed}</div>
                      <div className="task-body" style={{minWidth:200}}>
                        <div className="task-name">{m.med}</div>
                        <div className="task-detail">{m.name} \u00B7 {m.sch}</div>
                      </div>
                      <span style={{fontSize:11,fontWeight:600,color:m.status.includes('Due')?'var(--red)':'var(--green)'}}>{m.status}</span>
                      <div className={`task-check ${m.status.includes('Given')||m.status.includes('Running')?'done':''}`}>{m.status.includes('Given')||m.status.includes('Running')?'\u2713':''}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">PRN / One-Time Orders</div>
                  <span className="task-section-count amber">2 pending</span>
                </div>
                <div className="task-list">
                  {[
                    {bed:5,name:"Sarah W.",med:"Pre-op antibiotic",sch:"1g IV stat",detail:"Before 14:00 OT"},
                    {bed:2,name:"John K.",med:"Paracetamol 1g IV",sch:"PRN BM < 4.0",detail:"Rescue protocol"},
                  ].map((m,i)=>(
                    <div key={i} className="task-item">
                      <div className="task-bed">{m.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{m.med}</div>
                        <div className="task-detail">{m.name} \u00B7 {m.detail}</div>
                      </div>
                      <div className="task-check" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "fluids":
        return (
          <>
            <div className="section-title">{'\uD83D\uDCA7'} Fluid Balance Chart</div>
            <div className="io-chart" style={{marginTop:0}}>
              <div className="io-header">24h I/O Summary \u2014 Shift: 06:00\u201314:00</div>
              <div className="io-body">
                {[
                  {bed:2,name:"John K.",input:1850,output:800,unit:"ml"},
                  {bed:3,name:"Grace M.",input:500,output:200,unit:"ml",status:"Transfusing"},
                  {bed:4,name:"Peter O.",input:1200,output:900,unit:"ml"},
                  {bed:7,name:"Faith J.",input:900,output:650,unit:"ml"},
                  {bed:8,name:"Samuel K.",input:1100,output:400,unit:"ml",status:"\u26A0\uFE0F Low UO"},
                ].map((f,i)=>{
                  const bal = f.input - f.output;
                  return (
                    <div key={i} className="io-row">
                      <div className="io-bed">{f.bed}</div>
                      <div className="io-info">
                        <div className="io-name">{f.name}</div>
                        <div className="io-detail">In: {f.input}{f.unit} \u00B7 Out: {f.output}{f.unit}{f.status ? ` \u00B7 ${f.status}` : ''}</div>
                      </div>
                      <div className={`io-bal ${bal >= 0 ? 'pos' : 'neg'}`}>{bal >= 0 ? '+' : ''}{bal}{f.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );

      case "alerts":
        return (
          <>
            <div className="alert-panel" style={{marginTop:0}}>
              <div className="alert-header">{'\uD83D\uDEA8'} Active Clinical Alerts \u2014 2 requiring action</div>
              <div className="alert-item"><span>🩸</span> <strong>Bed 3 \u2014 Grace M.</strong> \u2014 Bleeding from IV site, Hb 6.2 <span className="val">URGENT</span> <button className="act">Notify Doctor</button></div>
              <div className="alert-item"><span>🌡️</span> <strong>Bed 7 \u2014 Faith J.</strong> \u2014 Temp 39.5\u00B0C, HR 112 <span className="val">SEPSIS SCREEN</span> <button className="act">Review</button></div>
            </div>
            <div className="double-column">
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDCDD'} Recent Doctor Orders</div>
                  <span className="task-section-count amber">3 new</span>
                </div>
                <div className="task-list">
                  {[
                    {bed:3,name:"Grace M.",order:"Repeat CBC & U/E/Cr",time:"09:30"},
                    {bed:2,name:"John K.",order:"Reduce insulin to 4U/hr",time:"09:15"},
                    {bed:6,name:"David N.",order:"Start Aspirin 75mg PO",time:"08:45"},
                  ].map((o,i)=>(
                    <div key={i} className="task-item">
                      <div className="task-bed">{o.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{o.order}</div>
                        <div className="task-detail">Bed {o.bed} \u00B7 {o.name} \u00B7 {o.time}</div>
                      </div>
                      <div className="task-check" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDCAC'} Communication Log</div>
                </div>
                <div className="task-list">
                  {[
                    {from:"Dr. Wanjiku",msg:"Reviewed Grace M. \u2014 continue transfusion, check Hb post.",time:"09:45"},
                    {from:"Dr. Njoroge",msg:"John K. \u2014 reduce insulin to 4U/hr, BM 8.2 trending down.",time:"09:20"},
                    {from:"Physio",msg:"David N. \u2014 Mobilisation assessment at 14:00.",time:"08:50"},
                  ].map((c,i)=>(
                    <div key={i} className="task-item" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,width:'100%'}}>
                        <span style={{fontSize:12,fontWeight:700}}>{c.from}</span>
                        <span style={{fontSize:10,color:'var(--frost-400)',marginLeft:'auto'}}>{c.time}</span>
                      </div>
                      <div style={{fontSize:12,color:'var(--frost-500)'}}>{c.msg}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "orders":
        return (
          <>
            <div className="section-title">{'\uD83D\uDCDD'} Pending Doctor Orders</div>
            <div className="vitals-board" style={{marginTop:0}}>
              <div className="vitals-board-body" style={{padding:0}}>
                <div className="task-list">
                  {[
                    {bed:3,name:"Grace M.",order:"Repeat CBC & U/E/Cr",stat:"urgent",time:"09:30",note:"Check Hb post-transfusion"},
                    {bed:2,name:"John K.",order:"Reduce insulin to 4U/hr",stat:"urgent",time:"09:15",note:"BM 8.2 trending down"},
                    {bed:6,name:"David N.",order:"Start Aspirin 75mg PO",stat:"routine",time:"08:45",note:"After CT brain confirmed no bleed"},
                    {bed:1,name:"Mary A.",order:"Switch IV Artesunate to oral",stat:"routine",time:"08:30",note:"Day 3, completing course"},
                    {bed:8,name:"Samuel K.",order:"Increase Furosemide to 80mg",stat:"routine",time:"08:00",note:"Review UO 4hrly"},
                  ].map((o,i)=>(
                    <div key={i} className="task-item" style={o.stat==='urgent'?{background:'var(--amber-bg)',borderColor:'var(--amber)'}:{}}>
                      <div className="task-bed">{o.bed}</div>
                      <div className="task-body">
                        <div className="task-name">{o.order}</div>
                        <div className="task-detail">Bed {o.bed} \u00B7 {o.name} \u00B7 {o.note}</div>
                      </div>
                      <div className="task-time">{o.time}</div>
                      <div style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:4,background:o.stat==='urgent'?'var(--red)':'var(--frost-200)',color:o.stat==='urgent'?'white':'var(--frost-500)'}}>{o.stat.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case "shift":
        return (
          <>
            <div className="section-title">{'\uD83D\uDD04'} Shift Summary</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div className="stat-card"><div className="stat-icon blue">{'\uD83D\uDC65'}</div><div><div className="stat-val">8</div><div className="stat-lbl">Total Patients</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\u2714\uFE0F'}</div><div><div className="stat-val">12</div><div className="stat-lbl">Meds Given</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\uD83D\uDCA7'}</div><div><div className="stat-val">6</div><div className="stat-lbl">I/O Charts Updated</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\uD83D\uDD14'}</div><div><div className="stat-val">2</div><div className="stat-lbl">Escalations</div></div></div>
              <div className="stat-card"><div className="stat-icon red">{'\uD83C\uDF21\uFE0F'}</div><div><div className="stat-val">32</div><div className="stat-lbl">Vitals Recorded</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDEAA'}</div><div><div className="stat-val">3</div><div className="stat-lbl">Discharges Planned</div></div></div>
            </div>
            <div className="task-section">
              <div className="task-section-header">
                <div className="task-section-title">{'\uD83D\uDCCB'} Handover Notes for Next Shift</div>
              </div>
              <div className="task-list">
                {[
                  {bed:3,name:"Grace M.",note:"Transfusion in progress. Repeat Hb post-transfusion. Monitor for reaction."},
                  {bed:2,name:"John K.",note:"Insulin infusion continued. Check BM 12:00 and 14:00. K+ result pending."},
                  {bed:6,name:"David N.",note:"CT Brain done - no haemorrhage. Start aspirin. GCS monitoring 2hrly."},
                  {bed:7,name:"Faith J.",note:"Temp spiked 39.5 treated. Sepsis screen sent. Review cultures."},
                ].map((n,i)=>(
                  <div key={i} className="task-item" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="task-bed">{n.bed}</div>
                      <span style={{fontWeight:700,fontSize:13}}>{n.name}</span>
                    </div>
                    <div style={{fontSize:12,color:'var(--frost-500)',marginLeft:34}}>{n.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "discharges":
        return (
          <>
            <div className="section-title">{'\uD83D\uDEAA'} Discharge Planning</div>
            <div className="task-grid" style={{marginTop:0}}>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\u2714\uFE0F'} Ready for Discharge</div>
                  <span className="task-section-count green">2</span>
                </div>
                <div className="task-list">
                  {[
                    {bed:4,name:"Peter O.",criteria:"Oral feeds tolerated, vitals stable, diarrhoea resolved",plan:"DC today 12:00 with review in 48h"},
                    {bed:5,name:"Sarah W.",criteria:"Pre-op assessment complete, NBM, consent signed",plan:"Transfer to OT at 14:00"},
                  ].map((d,i)=>(
                    <div key={i} className="task-item" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,width:'100%'}}>
                        <div className="task-bed">{d.bed}</div>
                        <span style={{fontWeight:700}}>{d.name}</span>
                        <span style={{fontSize:10,color:'var(--frost-400)',marginLeft:'auto'}}>{d.plan}</span>
                      </div>
                      <div style={{fontSize:11,color:'var(--frost-500)',marginLeft:34}}>{d.criteria}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="task-section">
                <div className="task-section-header">
                  <div className="task-section-title">{'\uD83D\uDCCB'} Discharge Checklist</div>
                </div>
                <div className="task-list">
                  {[
                    {item:"Discharge summary completed",bed:1,name:"Mary A.",done:false},
                    {item:"Medications reconciled",bed:1,name:"Mary A.",done:false},
                    {item:"Follow-up appointment booked",bed:4,name:"Peter O.",done:true},
                    {item:"Home care instructions given",bed:4,name:"Peter O.",done:true},
                    {item:"Transport arranged",bed:1,name:"Mary A.",done:false},
                  ].map((c,i)=>(
                    <div key={i} className="task-item" style={c.done?{opacity:.6}:{}}>
                      <div className="task-check done" style={c.done?{}:{background:'var(--white)',borderColor:'var(--frost-200)'}}>{c.done?'\u2713':''}</div>
                      <div className="task-body">
                        <div className="task-name">{c.item}</div>
                        <div className="task-detail">Bed {c.bed} \u00B7 {c.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{S}</style>
      <div className="nurse-layout">
        <aside className="nurse-sidebar">
          <div className="nurse-brand">AMEXAN <span>NURSE</span></div>
          <nav style={{flex:1}}>
            {sidebarGroups.map((group, gi) => (
              <div key={gi}>
                <div className="sidebar-group">{group.label}</div>
                {group.items.map(item => (
                  <button key={item.id} className={`nurse-nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    {(item.badge || counts(item.id) > 0) && (
                      <span className={`badge ${item.badgeType || ''}`}>{item.badge || counts(item.id)}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="nurse-profile">
            <div className="nurse-avatar">MN</div>
            <div><div className="nurse-name">Mary N.</div><div className="nurse-role">Registered Nurse</div></div>
          </div>
        </aside>

        <main className="nurse-main">
          <header className="nurse-topbar">
            <div className="nurse-greeting"><strong>Nursing</strong> \u00B7 Bed-to-Bed Clinical Care</div>
            <div className="nurse-topbar-right">
              <button className="nurse-topbar-btn" title="Notifications">{'\uD83D\uDD14'}</button>
              <button className="nurse-topbar-btn" title="Settings">{'\u2699\uFE0F'}</button>
              <a href="/cos-landing" className="nurse-topbar-btn" title="COS Home">{'\uD83C\uDFE0'}</a>
            </div>
          </header>

          <div className="nurse-body">
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon blue">{'\uD83D\uDC65'}</div><div><div className="stat-val">8</div><div className="stat-lbl">Patients</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDC8A'}</div><div><div className="stat-val">{counts("meds")}</div><div className="stat-lbl">Meds Due</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\uD83C\uDF21\uFE0F'}</div><div><div className="stat-val">{counts("vitals")}</div><div className="stat-lbl">Vitals Due</div></div></div>
              <div className="stat-card"><div className="stat-icon red">{'\u26A0\uFE0F'}</div><div><div className="stat-val">{counts("alerts")}</div><div className="stat-lbl">Alerts</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\uD83D\uDEAA'}</div><div><div className="stat-val">4</div><div className="stat-lbl">Discharges</div></div></div>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}

const SUPPORTED_ROLES = ['nursing'] as const;

export default function CosNurseDashboard() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <_CosNurseDashboard />
    </WorkspaceGuard>
  );
}
