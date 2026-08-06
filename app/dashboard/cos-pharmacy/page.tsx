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
.order-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.order-card{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1.5px solid var(--frost-200);border-radius:var(--radius);background:var(--white);transition:all .15s;cursor:pointer}
.order-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.order-card.checking{border-left:4px solid var(--amber)}
.order-card.dispensing{border-left:4px solid var(--blue)}
.order-card.done{border-left:4px solid var(--green);opacity:.8}
.order-icon{font-size:24px;width:36px;text-align:center}
.order-info{flex:1;min-width:0}
.order-drug{font-size:13px;font-weight:700}
.order-patient{font-size:11px;color:var(--frost-500);margin-top:1px}
.order-detail{font-size:10px;color:var(--frost-400);margin-top:2px}
.order-status{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px}
.order-status.pending{background:var(--amber-bg);color:var(--amber-text)}
.order-status.dispensing{background:var(--blue-bg);color:var(--blue-text)}
.order-status.ready{background:var(--green-bg);color:var(--green-text)}
.order-status.flagged{background:var(--red-bg);color:var(--red-text)}
.order-actions{display:flex;gap:4px}
.order-btn{font-size:10px;font-weight:700;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif}
.order-btn.primary{background:var(--sky-500);color:var(--white)}
.order-btn.primary:hover{background:var(--sky-600)}
.order-btn.outline{background:var(--white);border:1.5px solid var(--frost-200);color:var(--frost-500)}
.order-btn.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.order-btn.danger{background:var(--red);color:var(--white)}
.order-btn.danger:hover{opacity:.9}
.flags-panel{background:var(--red-bg);border:1px solid var(--red);border-radius:var(--radius);padding:16px;margin-bottom:24px}
.flags-header{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--red-text);margin-bottom:10px}
.flag-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:var(--radius-sm);background:var(--white);margin-bottom:4px;font-size:12px;border-left:4px solid var(--red)}
.flag-item .interaction{font-weight:800;color:var(--red)}
.flag-item .action{margin-left:auto;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;background:var(--red);color:var(--white);border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif}
.inventory-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px}
.inv-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);padding:16px;transition:all .15s}
.inv-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow)}
.inv-name{font-size:13px;font-weight:700;margin-bottom:2px}
.inv-stock{font-size:18px;font-weight:800;color:var(--sky-700)}
.inv-stock.low{color:var(--red)}
.inv-meta{font-size:10px;color:var(--frost-400);margin-top:2px}
.intervention-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.intervention-card{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border:1.5px solid var(--frost-200);border-radius:var(--radius);background:var(--white)}
.intervention-type{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px}
.intervention-type.dose{background:var(--amber-bg);color:var(--amber-text)}
.intervention-type.interaction{background:var(--red-bg);color:var(--red-text)}
.intervention-type.optimize{background:var(--green-bg);color:var(--green-text)}
.intervention-body{flex:1;font-size:12px}
.intervention-body .int-title{font-weight:700}
.intervention-body .int-detail{color:var(--frost-500);margin-top:2px}
`;

const nav = [
  { group: "PRESCRIPTION", items: [
    { id: "verify", icon: "\uD83D\uDD0D", label: "Verify Orders", badge: 7 },
    { id: "flags", icon: "\u26A0\uFE0F", label: "Safety Flags", badge: 2, badgeType: "red" },
  ]},
  { group: "DISPENSING", items: [
    { id: "dispensing", icon: "\uD83D\uDC8A", label: "Dispensing", badge: 4, badgeType: "amber" },
    { id: "ivprep", icon: "\u2697\uFE0F", label: "IV Admixture", badge: 2 },
    { id: "ready", icon: "\u2705", label: "Ready for Issue" },
  ]},
  { group: "CLINICAL", items: [
    { id: "interventions", icon: "\uD83D\uDCDD", label: "Interventions", badge: 3 },
    { id: "inventory", icon: "\uD83D\uDCE6", label: "Ward Stock" },
    { id: "reconciliation", icon: "\uD83D\uDD04", label: "Med Reconciliation" },
  ]},
];

const ordersData: Record<string, any[]> = {
  verify: [
    { drug:"Artesunate 60mg IV", patient:"Grace M. \u00B7 Bed 3", dr:"Dr. Wanjiku", dose:"2.4mg/kg", freq:"Stat", checks:"Allergy \u2713 \u00B7 Interaction \u2713 \u00B7 Dose \u2713", stat:"safe" },
    { drug:"Ceftriaxone 1g IV", patient:"Mary A. \u00B7 Bed 1", dr:"Dr. Kamal", dose:"1g q12h", freq:"q12h", checks:"Allergy \u2713 \u00B7 Dose \u2713", stat:"safe" },
    { drug:"IVIG 0.4g/kg", patient:"David N. \u00B7 Bed 6", dr:"Dr. Njoroge", dose:"0.4g/kg/day", freq:"Daily", checks:"Interaction \u26A0\uFE0F", stat:"flag" },
    { drug:"Morphine 5mg IV", patient:"Sarah W. \u00B7 Bed 5", dr:"Dr. Kamal", dose:"5mg q4h PRN", freq:"PRN", checks:"Dose \u2713 \u00B7 Interaction \u2713", stat:"safe" },
    { drug:"Heparin 5000U SC", patient:"Samuel K. \u00B7 Bed 8", dr:"Dr. Kamal", dose:"5000U q8h", freq:"q8h", checks:"Allergy \u26A0\uFE0F", stat:"flag" },
    { drug:"Metronidazole 500mg IV", patient:"Faith J. \u00B7 Bed 7", dr:"Dr. Wanjiku", dose:"500mg q8h", freq:"q8h", checks:"Allergy \u2713 \u00B7 Interaction \u2713", stat:"safe" },
    { drug:"PRBC 1 unit", patient:"Grace M. \u00B7 Bed 3", dr:"Dr. Wanjiku", dose:"1 unit over 2h", freq:"Stat", checks:"Crossmatch \u2713 \u00B7 Consent \u2713", stat:"safe" },
  ],
  dispensing: [
    { drug:"Ceftriaxone 1g", patient:"Mary A. \u00B7 Bed 1", dr:"Dr. Kamal", dose:"1g q12h", due:"09:00", next:"21:00" },
    { drug:"IV Fluids NS 1L", patient:"Peter O. \u00B7 Bed 4", dr:"Dr. Kamal", dose:"1L q8h", due:"08:30", next:"16:30" },
    { drug:"Artesunate 60mg", patient:"Grace M. \u00B7 Bed 3", dr:"Dr. Wanjiku", dose:"Stat", due:"08:00", next:"\u2014" },
    { drug:"Furosemide 40mg", patient:"Samuel K. \u00B7 Bed 8", dr:"Dr. Kamal", dose:"40mg q12h", due:"08:00", next:"20:00" },
  ],
  ready: [
    { drug:"Amoxicillin 500mg", patient:"Mary A. \u00B7 Bed 1", dose:"500mg q8h", dr:"Dr. Kamal", status:"Delivered" },
  ],
  inventory: [
    { name:"Artesunate 60mg", stock:12, unit:"vials", min:5, max:50 },
    { name:"Ceftriaxone 1g", stock:34, unit:"vials", min:10, max:100 },
    { name:"IV Normal Saline 1L", stock:8, unit:"bags", min:20, max:200, low:true },
    { name:"Morphine 10mg/mL", stock:6, unit:"ampules", min:5, max:30 },
    { name:"Heparin 5000U/mL", stock:3, unit:"vials", min:10, max:50, low:true },
    { name:"Insulin Regular 100U/mL", stock:12, unit:"vials", min:5, max:30 },
    { name:"Furosemide 40mg", stock:45, unit:"tabs", min:20, max:200 },
    { name:"Metronidazole 500mg", stock:28, unit:"vials", min:10, max:100 },
    { name:"Potassium Chloride 20mmol", stock:15, unit:"ampules", min:10, max:50 },
  ],
};

function _CosPharmacyDashboard() {
  const [tab, setTab] = useState("verify");

  const getCount = (id: string) => {
    if (id === "verify") return 7;
    if (id === "flags") return 2;
    if (id === "dispensing") return 4;
    if (id === "ivprep") return 2;
    if (id === "interventions") return 3;
    return 0;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cos-layout">
        <aside className="cos-sidebar">
          <div className="cos-sidebar-brand">AMEXAN <span>Rx</span></div>
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
            <div className="cos-sidebar-avatar">PK</div>
            <div><div className="cos-sidebar-name">Paul K.</div><div className="cos-sidebar-role">Chief Pharmacist</div></div>
          </div>
        </aside>

        <main className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting"><strong>Pharmacy</strong> \u00B7 Safety-First Verification</div>
            <div className="cos-topbar-right">
              <button className="cos-topbar-btn">{'\uD83D\uDD14'}</button>
              <button className="cos-topbar-btn">{'\u2699\uFE0F'}</button>
              <a href="/cos-landing" className="cos-topbar-btn">{'\uD83C\uDFE0'}</a>
            </div>
          </header>

          <div className="cos-content">
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon blue">{'\uD83D\uDD0D'}</div><div><div className="stat-val">7</div><div className="stat-lbl">To Verify</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\uD83D\uDC8A'}</div><div><div className="stat-val">4</div><div className="stat-lbl">Dispensing</div></div></div>
              <div className="stat-card"><div className="stat-icon red">{'\u26A0\uFE0F'}</div><div><div className="stat-val">2</div><div className="stat-lbl">Safety Flags</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\u2705'}</div><div><div className="stat-val">18</div><div className="stat-lbl">Dispensed Today</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\uD83D\uDCE6'}</div><div><div className="stat-val">2</div><div className="stat-lbl">Low Stock</div></div></div>
            </div>

            {tab === "verify" && (
              <>
                <div className="section-title">{'\uD83D\uDD0D'} Orders Awaiting Verification <span className="count">{ordersData.verify.length}</span></div>
                <div className="order-grid">
                  {ordersData.verify.map((o,i)=>(
                    <div key={i} className={`order-card ${o.stat==='flag'?'checking':''}`}>
                      <div className="order-icon">{o.stat==='flag'?'\u26A0\uFE0F':'\uD83D\uDC8A'}</div>
                      <div className="order-info">
                        <div className="order-drug">{o.drug}</div>
                        <div className="order-patient">{o.patient} \u00B7 Dr. {o.dr}</div>
                        <div className="order-detail">{o.dose} \u00B7 {o.freq} \u00B7 {o.checks}</div>
                      </div>
                      <div className={`order-status ${o.stat==='safe'?'ready':o.stat==='flag'?'flagged':'pending'}`}>
                        {o.stat==='safe'?'Safe':o.stat==='flag'?'Review Req.':'Pending'}
                      </div>
                      <div className="order-actions">
                        <button className={`order-btn ${o.stat==='flag'?'danger':'primary'}`}>
                          {o.stat==='flag'?'Flag':'\u2713 Approve'}
                        </button>
                        <button className="order-btn outline">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "flags" && (
              <>
                <div className="flags-panel" style={{marginTop:0}}>
                  <div className="flags-header">{'\u26A0\uFE0F'} Clinical Safety Flags \u2014 Pharmacist Review Required</div>
                  <div className="flag-item">
                    <span>💊</span>
                    <div style={{flex:1}}>
                      <strong>IVIG 0.4g/kg</strong> \u2014 David N. \u00B7 Bed 6
                      <div className="interaction">Drug Interaction: IVIG + Heparin \u2014 increased bleeding risk</div>
                    </div>
                    <button className="action">Review</button>
                  </div>
                  <div className="flag-item">
                    <span>💊</span>
                    <div style={{flex:1}}>
                      <strong>Heparin 5000U SC</strong> \u2014 Samuel K. \u00B7 Bed 8
                      <div className="interaction">Allergy: Patient has history of heparin-induced thrombocytopenia (HIT)</div>
                    </div>
                    <button className="action">Review</button>
                  </div>
                </div>
                <div className="section-title">{'\u26A0\uFE0F'} Drug Interaction Checker</div>
                <div className="order-grid">
                  {[
                    {drug1:"IVIG", drug2:"Heparin", risk:"Major", effect:"Increased bleeding risk", action:"Monitor aPTT, consider alternative"},
                    {drug1:"Ceftriaxone", drug2:"Calcium", risk:"Moderate", effect:"Precipitation risk (IV)", action:"Avoid Y-site administration"},
                  ].map((di,i)=>(
                    <div key={i} className="order-card checking">
                      <div className="order-icon">{'\u26A0\uFE0F'}</div>
                      <div className="order-info">
                        <div className="order-drug">{di.drug1} + {di.drug2}</div>
                        <div className="order-detail">Risk: <strong style={{color:'var(--red)'}}>{di.risk}</strong> \u00B7 {di.effect}</div>
                        <div className="order-detail">Action: {di.action}</div>
                      </div>
                      <div className="order-status flagged">{di.risk}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "dispensing" && (
              <>
                <div className="section-title">{'\uD83D\uDC8A'} Currently Dispensing <span className="count">{ordersData.dispensing.length}</span></div>
                <div className="order-grid">
                  {ordersData.dispensing.map((o,i)=>(
                    <div key={i} className="order-card dispensing">
                      <div className="order-icon">{'\uD83D\uDC8A'}</div>
                      <div className="order-info">
                        <div className="order-drug">{o.drug}</div>
                        <div className="order-patient">{o.patient} \u00B7 Dr. {o.dr}</div>
                        <div className="order-detail">{o.dose} \u00B7 Due: {o.due} \u00B7 Next: {o.next}</div>
                      </div>
                      <div className="order-status dispensing">Dispensing</div>
                      <div className="order-actions">
                        <button className="order-btn primary">{'\u2713'} Dispensed</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "ivprep" && (
              <>
                <div className="section-title">{'\u2697\uFE0F'} IV Admixture <span className="count">2 pending</span></div>
                <div className="order-grid">
                  {[
                    {drug:"IV Ceftriaxone 1g in 100mL NS", patient:"Mary A. \u00B7 Bed 1", due:"10:45", by:"Pharm Tech", stat:"preparing"},
                    {drug:"IV Artesunate 60mg in 5mL D5W", patient:"Grace M. \u00B7 Bed 3", due:"10:30", by:"Pharm Tech", stat:"preparing"},
                  ].map((iv,i)=>(
                    <div key={i} className="order-card dispensing">
                      <div className="order-icon">{'\u2697\uFE0F'}</div>
                      <div className="order-info">
                        <div className="order-drug">{iv.drug}</div>
                        <div className="order-patient">{iv.patient}</div>
                        <div className="order-detail">Sterile prep by {iv.by} \u00B7 Due: {iv.due}</div>
                      </div>
                      <div className="order-status dispensing">Preparing</div>
                      <div className="order-actions">
                        <button className="order-btn primary">Complete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "ready" && (
              <>
                <div className="section-title">{'\u2705'} Ready for Issue to Ward</div>
                <div className="order-grid">
                  {ordersData.ready.map((o,i)=>(
                    <div key={i} className="order-card done">
                      <div className="order-icon">{'\u2705'}</div>
                      <div className="order-info">
                        <div className="order-drug">{o.drug}</div>
                        <div className="order-patient">{o.patient}</div>
                        <div className="order-detail">{o.dose} \u00B7 {o.status}</div>
                      </div>
                      <div className="order-status ready">Issued</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "interventions" && (
              <>
                <div className="section-title">{'\uD83D\uDCDD'} Clinical Pharmacy Interventions</div>
                <div className="intervention-grid">
                  {[
                    {type:"dose", title:"Dose Adjustment Recommended", detail:"Samuel K. \u00B7 Furosemide 40mg \u2192 80mg. CrCl 35 mL/min, consider renal adjustment.", by:"Paul K.", time:"08:15", status:"Pending"},
                    {type:"interaction", title:"Drug Interaction Alert", detail:"David N. \u00B7 IVIG + Heparin interaction. Recommend alternative anticoagulant.", by:"Paul K.", time:"08:00", status:"Pending"},
                    {type:"optimize", title:"IV to Oral Switch", detail:"Mary A. \u00B7 IV Ceftriaxone Day 3, tolerating oral. Suggest switch to oral amoxicillin.", by:"Paul K.", time:"07:45", status:"Accepted"},
                  ].map((iv,i)=>(
                    <div key={i} className="intervention-card">
                      <div className={`intervention-type ${iv.type}`}>{iv.type.toUpperCase()}</div>
                      <div className="intervention-body">
                        <div className="int-title">{iv.title}</div>
                        <div className="int-detail">{iv.detail}</div>
                        <div style={{display:'flex',gap:12,marginTop:4,fontSize:10,color:'var(--frost-400)'}}>
                          <span>By: {iv.by}</span>
                          <span>{iv.time}</span>
                          <span style={{fontWeight:700,color:iv.status==='Accepted'?'var(--green)':'var(--amber)'}}>{iv.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "inventory" && (
              <>
                <div className="section-title">{'\uD83D\uDCE6'} Ward Stock Inventory</div>
                <div className="inventory-grid">
                  {ordersData.inventory.map((i, idx)=>(
                    <div key={idx} className="inv-card">
                      <div className="inv-name">{i.name}</div>
                      <div className={`inv-stock ${i.low?'low':''}`}>{i.stock} <span style={{fontSize:12,fontWeight:400,color:'var(--frost-400)'}}>{i.unit}</span></div>
                      <div className="inv-meta">Min: {i.min} \u00B7 Max: {i.max}{i.low ? ' \u26A0\uFE0F LOW' : ''}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "reconciliation" && (
              <>
                <div className="section-title">{'\uD83D\uDD04'} Medication Reconciliation</div>
                <div className="order-grid">
                  {[
                    {patient:"Grace M. \u00B7 Bed 3", admission:"None", current:"IV Artesunate, PRBC", dc:"Artemether-Lumefantrine (oral) \u00D7 3d, Ferrous sulfate", status:"Pending"},
                    {patient:"Mary A. \u00B7 Bed 1", admission:"No regular meds", current:"IV Ceftriaxone", dc:"Amoxicillin 500mg PO q8h \u00D7 5d", status:"Complete"},
                    {patient:"Peter O. \u00B7 Bed 4", admission:"None", current:"IV Fluids", dc:"ORS, Zinc 20mg \u00D7 10d", status:"Pending"},
                  ].map((r,i)=>(
                    <div key={i} className="order-card" style={{flexDirection:'column',alignItems:'flex-start',gap:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,width:'100%'}}>
                        <div className="order-icon">{'\uD83D\uDD04'}</div>
                        <div className="order-drug">{r.patient}</div>
                        <span style={{marginLeft:'auto',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:4,background:r.status==='Complete'?'var(--green-bg)':'var(--amber-bg)',color:r.status==='Complete'?'var(--green-text)':'var(--amber-text)'}}>{r.status}</span>
                      </div>
                      <div className="order-detail" style={{marginLeft:44}}>
                        <div>Admission: {r.admission}</div>
                        <div>Current: {r.current}</div>
                        <div>DC Plan: {r.dc}</div>
                      </div>
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

const SUPPORTED_ROLES = ['pharmacy'] as const;

export default function CosPharmacyDashboard() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <_CosPharmacyDashboard />
    </WorkspaceGuard>
  );
}
