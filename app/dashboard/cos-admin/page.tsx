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
.census-tabs{display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap}
.census-tab{font-size:12px;font-weight:600;padding:8px 16px;border-radius:8px;border:1.5px solid var(--frost-200);background:var(--white);cursor:pointer;transition:all .1s;font-family:'Inter','Noto Sans',sans-serif}
.census-tab:hover{border-color:var(--sky-300);background:var(--sky-50)}
.census-tab.active{background:var(--sky-500);color:var(--white);border-color:var(--sky-500)}
.ward-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:24px}
.ward-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);padding:18px;transition:all .15s}
.ward-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.ward-name{font-size:15px;font-weight:700;color:var(--sky-800);margin-bottom:6px}
.ward-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin-bottom:8px}
.ward-stat{font-size:11px;color:var(--frost-500)}
.ward-stat span{font-weight:700;color:#0f172a}
.ward-bar{height:6px;border-radius:99px;background:var(--frost-200);overflow:hidden;margin-top:4px}
.ward-bar-fill{height:100%;border-radius:99px;transition:width .5s}
.ward-bar-fill.green{background:var(--green)}
.ward-bar-fill.amber{background:var(--amber)}
.ward-bar-fill.red{background:var(--red)}
.throughput-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:24px}
.throughput-list{display:flex;flex-direction:column;gap:6px}
.tp-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--frost-200);border-radius:var(--radius-sm);font-size:12px}
.tp-item .label{flex:1;font-weight:600}
.tp-item .time{font-weight:700;color:var(--sky-600);font-family:monospace}
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:24px}
.metric-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);padding:20px;transition:all .15s}
.metric-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.metric-title{font-size:12px;font-weight:700;color:var(--frost-500);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
.metric-big{font-size:36px;font-weight:800;color:var(--sky-700)}
.metric-big .unit{font-size:16px;font-weight:500;color:var(--frost-400)}
.metric-change{font-size:11px;margin-top:4px}
.metric-change.up{color:var(--green)}
.metric-change.down{color:var(--red)}
.utilization-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px}
.util-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);padding:16px;transition:all .15s}
.util-card:hover{border-color:var(--sky-300)}
.util-name{font-size:12px;font-weight:700;color:var(--frost-500);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.util-bar{height:8px;border-radius:99px;background:var(--frost-200);overflow:hidden;margin-bottom:4px}
.util-fill{height:100%;border-radius:99px;transition:width .5s}
.util-fill.green{background:var(--green)}.util-fill.amber{background:var(--amber)}
.util-fill.red{background:var(--red)}.util-fill.blue{background:var(--blue)}
.util-value{font-size:14px;font-weight:800;text-align:right}
.util-label{font-size:10px;color:var(--frost-400);text-align:right}
`;

const nav = [
  { group: "CENSUS", items: [
    { id: "census", icon: "\uD83C\uDFE5", label: "Hospital Census" },
    { id: "wards", icon: "\uD83D\uDECF\uFE0F", label: "Ward Overview" },
    { id: "throughput", icon: "\uD83D\uDD04", label: "Patient Flow" },
  ]},
  { group: "OPERATIONS", items: [
    { id: "admissions", icon: "\uD83D\uDE91", label: "Admissions", badge: 5, badgeType: "amber" },
    { id: "discharges", icon: "\uD83D\uDEAA", label: "Discharges", badge: 8, badgeType: "green" },
    { id: "transfers", icon: "\uD83D\uDD04", label: "Transfers", badge: 3 },
  ]},
  { group: "ANALYTICS", items: [
    { id: "metrics", icon: "\uD83D\uDCCA", label: "KPIs" },
    { id: "resources", icon: "\u2699\uFE0F", label: "Resource Utilization" },
    { id: "reports", icon: "\uD83D\uDCD1", label: "Reports" },
  ]},
];

const wards = [
  { name:"Male Medical Ward", total:24, occupied:22, capacity:92, critical:2, pending:3 },
  { name:"Female Medical Ward", total:20, occupied:18, capacity:90, critical:1, pending:2 },
  { name:"Pediatric Ward", total:16, occupied:12, capacity:75, critical:0, pending:1 },
  { name:"Maternity Ward", total:12, occupied:8, capacity:67, critical:0, pending:0 },
  { name:"Surgical Ward", total:18, occupied:15, capacity:83, critical:1, pending:2 },
  { name:"ICU/HDU", total:8, occupied:7, capacity:88, critical:3, pending:0 },
];

function _CosAdminDashboard() {
  const [tab, setTab] = useState("census");

  const getCount = (id: string) => {
    if (id === "admissions") return 5;
    if (id === "discharges") return 8;
    if (id === "transfers") return 3;
    return 0;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cos-layout">
        <aside className="cos-sidebar">
          <div className="cos-sidebar-brand">AMEXAN <span>ADMIN</span></div>
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
            <div className="cos-sidebar-avatar">SO</div>
            <div><div className="cos-sidebar-name">Sarah O.</div><div className="cos-sidebar-role">Hospital Admin</div></div>
          </div>
        </aside>

        <main className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting"><strong>Administration</strong> \u00B7 Real-Time Hospital Operations</div>
            <div className="cos-topbar-right">
              <button className="cos-topbar-btn">{'\uD83D\uDD14'}</button>
              <button className="cos-topbar-btn">{'\u2699\uFE0F'}</button>
              <a href="/cos-landing" className="cos-topbar-btn">{'\uD83C\uDFE0'}</a>
            </div>
          </header>

          <div className="cos-content">
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon blue">{'\uD83C\uDFE5'}</div><div><div className="stat-val">98</div><div className="stat-lbl">Total Beds</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDC65'}</div><div><div className="stat-val">82</div><div className="stat-lbl">Occupied</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\uD83D\uDCCA'}</div><div><div className="stat-val">83.7%</div><div className="stat-lbl">Occupancy Rate</div></div></div>
              <div className="stat-card"><div className="stat-icon red">{'\u26A0\uFE0F'}</div><div><div className="stat-val">7</div><div className="stat-lbl">Critical Patients</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\uD83D\uDE91'}</div><div><div className="stat-val">12</div><div className="stat-lbl">Admissions Today</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDEAA'}</div><div><div className="stat-val">8</div><div className="stat-lbl">Discharges Today</div></div></div>
            </div>

            {tab === "census" && (
              <>
                <div className="section-title">{'\uD83C\uDFE5'} Hospital Census \u2014 Live</div>
                <div className="census-tabs">
                  <span className="census-tab" style={{cursor:'default'}}>{'\uD83C\uDFE6'} All Wards</span>
                </div>
                <div className="ward-grid">
                  {wards.map((w,i)=>(
                    <div key={i} className="ward-card">
                      <div className="ward-name">{w.name}</div>
                      <div className="ward-stats">
                        <div className="ward-stat">Occupied: <span>{w.occupied}</span> / {w.total}</div>
                        <div className="ward-stat">Capacity: <span>{w.capacity}%</span></div>
                        <div className="ward-stat">{'\u26A0\uFE0F'} Critical: <span style={{color:'var(--red)'}}>{w.critical}</span></div>
                        <div className="ward-stat">{'\uD83E\uDDEA'} Pending: <span style={{color:'var(--amber)'}}>{w.pending}</span></div>
                      </div>
                      <div className="ward-bar">
                        <div className={`ward-bar-fill ${w.capacity>90?'red':w.capacity>75?'amber':'green'}`} style={{width:`${w.capacity}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "wards" && (
              <>
                <div className="section-title">{'\uD83D\uDECF\uFE0F'} Detailed Ward View</div>
                <div className="ward-grid">
                  {wards.map((w,i)=>(
                    <div key={i} className="ward-card" style={{cursor:'pointer'}}>
                      <div className="ward-name">{w.name}</div>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <span style={{fontSize:12}}>Bed Status</span>
                        <span style={{fontSize:12,fontWeight:700}}>{w.occupied}/{w.total}</span>
                      </div>
                      {[
                        {bed:1,patient:"Mary A.",status:"Admitted 08 Jul",dx:"Severe Malaria",flag:false},
                        {bed:2,patient:"John K.",status:"Admitted 07 Jul",dx:"DKA",flag:true},
                        {bed:3,patient:"Grace M.",status:"Admitted 08 Jul",dx:"Severe Anaemia",flag:false},
                        {bed:4,patient:"Peter O.",status:"Admitted 09 Jul",dx:"Gastroenteritis",flag:false},
                        {bed:5,patient:"Sarah W.",status:"Admitted 07 Jul",dx:"Pre-op Cholecystectomy",flag:false},
                        {bed:6,patient:"David N.",status:"Admitted 09 Jul",dx:"Acute Stroke",flag:true},
                        {bed:7,patient:"Faith J.",status:"Admitted 08 Jul",dx:"Pyelonephritis",flag:false},
                        {bed:8,patient:"Samuel K.",status:"Admitted 06 Jul",dx:"Heart Failure",flag:false},
                      ].slice(0,6).map((b,bi)=>(
                        <div key={bi} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--frost-100)',fontSize:12}}>
                          <span style={{width:20,height:20,borderRadius:4,background:'var(--sky-100)',color:'var(--sky-600)',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{b.bed}</span>
                          <span style={{fontWeight:600}}>{b.patient}</span>
                          <span style={{color:'var(--frost-500)',fontSize:10,marginLeft:'auto'}}>{b.dx}</span>
                          {b.flag && <span style={{fontSize:10}}>{'\u26A0\uFE0F'}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "throughput" && (
              <>
                <div className="section-title">{'\uD83D\uDD04'} Patient Throughput \u2014 Today</div>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-icon blue">{'\uD83D\uDE91'}</div><div><div className="stat-val">12</div><div className="stat-lbl">Admissions</div></div></div>
                  <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDEAA'}</div><div><div className="stat-val">8</div><div className="stat-lbl">Discharges</div></div></div>
                  <div className="stat-card"><div className="stat-icon amber">{'\uD83D\uDD04'}</div><div><div className="stat-val">3</div><div className="stat-lbl">Transfers</div></div></div>
                  <div className="stat-card"><div className="stat-icon red">{'\u23F1\uFE0F'}</div><div><div className="stat-val">4.2h</div><div className="stat-lbl">Avg ED Wait</div></div></div>
                </div>
                <div className="throughput-grid">
                  <div>
                    <div className="section-title">{'\u2B06\uFE0F'} Recent Admissions</div>
                    <div className="throughput-list">
                      {[{name:"Sarah W.",ward:"Surgical",time:"07:50"},{name:"John K.",ward:"Male Medical",time:"07:30"},{name:"Peter O.",ward:"Paeds",time:"08:15"},{name:"David N.",ward:"Male Medical",time:"08:00"},{name:"Faith J.",ward:"Female Medical",time:"06:45"}].map((a,i)=>(
                        <div key={i} className="tp-item">
                          <span>{'\uD83C\uDD95'}</span><span className="label">{a.name}</span><span className="time">{a.ward}</span><span className="time">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="section-title">{'\u2B07\uFE0F'} Recent Discharges</div>
                    <div className="throughput-list">
                      {[{name:"Mary K.",ward:"Female Medical",time:"10:30"},{name:"James O.",ward:"Surgical",time:"09:45"},{name:"Esther W.",ward:"Paeds",time:"09:00"}].map((d,i)=>(
                        <div key={i} className="tp-item"><span>{'\u2705'}</span><span className="label">{d.name}</span><span className="time">{d.ward}</span><span className="time">{d.time}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="stats-row">
                  <div className="stat-card" style={{gridColumn:'1/-1',background:'var(--sky-50)',borderColor:'var(--sky-200)'}}>
                    <div className="stat-icon blue">{'\uD83D\uDCC8'}</div>
                    <div><div className="stat-val">4.2 days</div><div className="stat-lbl">Avg Length of Stay {'\u2193'} 0.3 from last week</div></div>
                  </div>
                </div>
              </>
            )}

            {tab === "admissions" && (
              <>
                <div className="section-title">{'\uD83D\uDE91'} Admissions Today <span className="count">5 new</span></div>
                <div className="throughput-list">
                  {[
                    {name:"Peter O.",age:4,ward:"Paediatric",dx:"Gastroenteritis, moderate dehydration",time:"08:15",by:"Dr. Kamal"},
                    {name:"David N.",age:72,ward:"Male Medical",dx:"Acute ischaemic stroke, L sided weakness",time:"08:00",by:"Dr. Njoroge"},
                    {name:"Sarah W.",age:45,ward:"Surgical",dx:"Cholecystectomy (elective)",time:"07:50",by:"Dr. Kamal"},
                    {name:"Faith J.",age:38,ward:"Female Medical",dx:"Acute pyelonephritis",time:"06:45",by:"Dr. Wanjiku"},
                    {name:"John K.",age:55,ward:"Male Medical",dx:"Diabetic ketoacidosis",time:"07:30",by:"Dr. Njoroge"},
                  ].map((a,i)=>(
                    <div key={i} className="tp-item" style={{flexWrap:'wrap'}}>
                      <span>{'\uD83C\uDD95'}</span>
                      <span className="label" style={{minWidth:120}}>{a.name}, {a.age}y</span>
                      <span style={{fontSize:11,color:'var(--frost-500)'}}>{a.ward}</span>
                      <span style={{fontSize:11,color:'var(--frost-500)',flex:1}}>{a.dx}</span>
                      <span className="time">{a.time}</span>
                      <span style={{fontSize:10,color:'var(--frost-400)'}}>{a.by}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "discharges" && (
              <>
                <div className="section-title">{'\uD83D\uDEAA'} Discharge Planning <span className="count">8 today</span></div>
                <div className="stats-row">
                  <div className="stat-card"><div className="stat-icon green">{'\u2705'}</div><div><div className="stat-val">8</div><div className="stat-lbl">Planned Today</div></div></div>
                  <div className="stat-card"><div className="stat-icon blue">{'\u2705'}</div><div><div className="stat-val">3</div><div className="stat-lbl">Completed</div></div></div>
                  <div className="stat-card"><div className="stat-icon amber">{'\u23F3'}</div><div><div className="stat-val">5</div><div className="stat-lbl">Pending</div></div></div>
                  <div className="stat-card"><div className="stat-icon red">{'\u26A0\uFE0F'}</div><div><div className="stat-val">1</div><div className="stat-lbl">Delayed</div></div></div>
                </div>
                <div className="throughput-list">
                  {[
                    {name:"Mary A.",ward:"Male Medical",criteria:"Hb stable, tolerating oral",time:"14:00",status:"Pending DC Summary"},
                    {name:"Peter O.",ward:"Paeds",criteria:"Diarrhoea resolved, tolerating ORS",time:"12:00",status:"Ready"},
                    {name:"Samuel K.",ward:"Male Medical",criteria:"Compensated, echo done",time:"16:00",status:"Awaiting Med Rec"},
                    {name:"James O.",ward:"Surgical",criteria:"Wound healing, afebrile",time:"10:30",status:"Completed \u2713"},
                    {name:"Mary K.",ward:"Female Medical",criteria:"Malaria Day 3, parasite clearance",time:"09:00",status:"Completed \u2713"},
                  ].map((d,i)=>(
                    <div key={i} className="tp-item" style={{flexWrap:'wrap'}}>
                      <span>{'\uD83D\uDEAA'}</span>
                      <span className="label">{d.name}</span>
                      <span style={{fontSize:11,color:'var(--frost-500)'}}>{d.ward}</span>
                      <span style={{fontSize:11,color:'var(--frost-500)',flex:1}}>{d.criteria}</span>
                      <span className="time">{d.time}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:4,background:d.status.includes('Completed')?'var(--green-bg)':d.status.includes('Delayed')?'var(--red-bg)':'var(--amber-bg)',color:d.status.includes('Completed')?'var(--green-text)':d.status.includes('Delayed')?'var(--red-text)':'var(--amber-text)'}}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "transfers" && (
              <>
                <div className="section-title">{'\uD83D\uDD04'} Active Transfers <span className="count">3</span></div>
                <div className="throughput-list">
                  {[
                    {name:"David N.",from:"Male Medical",to:"ICU/HDU",reason:"Acute stroke monitoring",time:"10:00",status:"Pending"},
                    {name:"Faith J.",from:"Female Medical",to:"Surgical",reason:"Renal abscess drainage",time:"11:00",status:"Pending"},
                    {name:"Samuel K.",from:"Male Medical",to:"Cardiology",reason:"ECHO abnormal, specialist review",time:"14:00",status:"Scheduled"},
                  ].map((t,i)=>(
                    <div key={i} className="tp-item" style={{flexWrap:'wrap'}}>
                      <span>{'\uD83D\uDD04'}</span>
                      <span className="label">{t.name}</span>
                      <span style={{fontSize:11,color:'var(--frost-500)'}}>{t.from} \u2192 {t.to}</span>
                      <span style={{fontSize:11,color:'var(--frost-500)',flex:1}}>{t.reason}</span>
                      <span className="time">{t.time}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'var(--amber-bg)',color:'var(--amber-text)'}}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "metrics" && (
              <>
                <div className="section-title">{'\uD83D\uDCCA'} Key Performance Indicators</div>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-title">Average Length of Stay</div>
                    <div className="metric-big">4.2 <span className="unit">days</span></div>
                    <div className="metric-change down">{'\u25BC'} 0.3 from last week</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Bed Turnaround Time</div>
                    <div className="metric-big">3.1 <span className="unit">hours</span></div>
                    <div className="metric-change down">{'\u25BC'} 0.5 from last week</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Readmission Rate (30d)</div>
                    <div className="metric-big">6.8<span className="unit">%</span></div>
                    <div className="metric-change up">{'\u25B2'} 1.2% from last month</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Mortality Rate</div>
                    <div className="metric-big">1.2<span className="unit">%</span></div>
                    <div className="metric-change down">{'\u25BC'} 0.3% from last quarter</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Lab TAT (avg)</div>
                    <div className="metric-big">42 <span className="unit">min</span></div>
                    <div className="metric-change down">{'\u25BC'} 8 min from last week</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Pharmacy TAT (avg)</div>
                    <div className="metric-big">18 <span className="unit">min</span></div>
                    <div className="metric-change down">{'\u25BC'} 3 min from last week</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">Bed Occupancy Rate</div>
                    <div className="metric-big">83.7<span className="unit">%</span></div>
                    <div className="metric-change up">{'\u25B2'} 2.1% from yesterday</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-title">ED Wait Time (avg)</div>
                    <div className="metric-big">4.2 <span className="unit">hours</span></div>
                    <div className="metric-change up">{'\u25B2'} 0.7h from yesterday <span style={{color:'var(--red)'}}>(target {'<'} 3h)</span></div>
                  </div>
                </div>
              </>
            )}

            {tab === "resources" && (
              <>
                <div className="section-title">{'\u2699\uFE0F'} Resource Utilization</div>
                <div className="utilization-grid">
                  {[
                    {name:"Bed Occupancy",value:83.7,color:"amber"},
                    {name:"ICU Capacity",value:87.5,color:"red"},
                    {name:"OT Utilization",value:72,color:"green"},
                    {name:"Lab Capacity",value:65,color:"blue"},
                    {name:"Pharmacy Staff",value:80,color:"green"},
                    {name:"Nursing Staff",value:92,color:"amber"},
                  ].map((u,i)=>(
                    <div key={i} className="util-card">
                      <div className="util-name">{u.name}</div>
                      <div className="util-bar">
                        <div className={`util-fill ${u.color}`} style={{width:`${u.value}%`}} />
                      </div>
                      <div className="util-value" style={{color:`var(--${u.color})`}}>{u.value}%</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "reports" && (
              <div style={{textAlign:'center',padding:'40px'}}>
                <div style={{fontSize:48,marginBottom:16}}>{'\uD83D\uDCD1'}</div>
                <div style={{fontSize:16,fontWeight:600,color:'#0f172a'}}>Reports & Analytics</div>
                <div style={{fontSize:13,marginTop:8,color:'var(--frost-500)',maxWidth:500,margin:'8px auto 24px'}}>
                  Daily, weekly, and monthly operational reports: discharge summaries, compliance documentation, occupancy trends, adverse event reporting, and departmental performance reviews.
                </div>
                <div className="utilization-grid" style={{textAlign:'left'}}>
                  {[
                    {name:"Daily Census Report",date:"09 Jul 2026",desc:"Bed occupancy, admissions, discharges, transfers"},
                    {name:"Weekly Mortality Review",date:"06 Jul 2026",desc:"Case reviews, contributory factors, action items"},
                    {name:"Monthly Quality Report",date:"01 Jul 2026",desc:"Infection rates, adverse events, compliance scores"},
                    {name:"Quarterly Financial Summary",date:"30 Jun 2026",desc:"Revenue, expenses, cost per patient day, budget variance"},
                  ].map((r,i)=>(
                    <div key={i} className="util-card" style={{cursor:'pointer'}}>
                      <div className="util-name">{r.name}</div>
                      <div style={{fontSize:12,marginBottom:4}}>{r.desc}</div>
                      <div style={{fontSize:10,color:'var(--frost-400)'}}>{r.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const SUPPORTED_ROLES = [
  'executive', 'department', 'finance', 'hr', 'ict', 'research',
  'clinical_leadership',
] as const;

export default function CosAdminDashboard() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <_CosAdminDashboard />
    </WorkspaceGuard>
  );
}
