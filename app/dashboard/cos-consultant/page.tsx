"use client";
import { useState } from "react";
import WorkspaceGuard from "@/components/workspace/WorkspaceGuard";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --s50:#f0f9ff;--s100:#e0f2fe;--s200:#bae6fd;--s300:#7dd3fc;
  --s400:#38bdf8;--s500:#0ea5e9;--s600:#0284c7;--s700:#0369a1;
  --s800:#075985;--s900:#0c4a6e;
  --w:#fff;--f50:#fafafa;--f100:#f5f5f5;--f200:#e5e5e5;
  --f300:#d4d4d4;--f400:#a3a3a3;--f500:#737373;
  --green:#10b981;--green-bg:#d1fae5;--green-t:#065f46;
  --amber:#f59e0b;--amber-bg:#fef3c7;--amber-t:#92400e;
  --red:#ef4444;--red-bg:#fee2e2;--red-t:#991b1b;
  --blue:#3b82f6;--blue-bg:#dbeafe;--blue-t:#1e40af;
  --purple:#8b5cf6;--purple-bg:#ede9fe;--purple-t:#5b21b6;
  --font:'Inter',sans-serif;
  --r:12px;--r-sm:8px;--r-lg:20px;
  --sh:0 1px 3px rgba(0,0,0,.04);--sh-md:0 4px 16px rgba(0,0,0,.06);--sh-lg:0 12px 40px rgba(0,0,0,.08);
}
body{font-family:'Inter','Noto Sans',sans-serif;background:var(--f50);color:#0f172a}
.cos-layout{display:flex;min-height:100vh}
.cos-sidebar{width:220px;background:var(--w);border-right:1px solid var(--f200);padding:20px 12px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0}
.cos-brand{font-size:20px;font-weight:800;color:var(--s700);padding:0 8px 16px;border-bottom:1px solid var(--f200);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.cos-brand span{background:var(--s100);color:var(--s600);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700}
.sidebar-group{font-size:10px;font-weight:700;color:var(--f400);text-transform:uppercase;letter-spacing:.8px;padding:12px 8px 4px}
.cos-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-sm);font-size:13px;font-weight:600;color:var(--f500);cursor:pointer;border:none;background:none;text-align:left;width:100%;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
.cos-nav-item:hover{background:var(--s50);color:var(--s700)}
.cos-nav-item.active{background:var(--s100);color:var(--s700);font-weight:700}
.cos-nav-item .icon{font-size:16px;width:20px;text-align:center}
.cos-nav-item .badge{margin-left:auto;background:var(--red-bg);color:var(--red-t);font-size:10px;font-weight:700;padding:1px 6px;border-radius:99px;min-width:18px;text-align:center}
.cos-nav-item .badge.amber{background:var(--amber-bg);color:var(--amber-t)}
.cos-nav-item .badge.green{background:var(--green-bg);color:var(--green-t)}
.cos-nav-item .badge.purple{background:var(--purple-bg);color:var(--purple-t)}
.cos-profile{padding:12px 8px;border-top:1px solid var(--f200);display:flex;align-items:center;gap:10px;margin-top:auto}
.cos-avatar{width:36px;height:36px;border-radius:10px;background:var(--s500);color:var(--w);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
.cos-name{font-size:12px;font-weight:700}
.cos-role{font-size:10px;color:var(--f500)}
.cos-main{flex:1;display:flex;flex-direction:column;min-width:0}
.cos-topbar{height:56px;background:var(--w);border-bottom:1px solid var(--f200);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:50}
.cos-greeting{font-size:14px;color:var(--f500)}
.cos-greeting strong{color:#0f172a}
.cos-topbar-right{display:flex;align-items:center;gap:10px}
.cos-topbar-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--f200);background:var(--w);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .15s}
.cos-topbar-btn:hover{border-color:var(--s300);background:var(--s50)}
.cos-body{padding:20px 24px 40px;flex:1;max-width:1440px;width:100%;margin:0 auto}
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px}
.stat-card{background:var(--w);border:1px solid var(--f200);border-radius:var(--r);padding:14px;display:flex;align-items:center;gap:12px}
.stat-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px}
.stat-icon.green{background:var(--green-bg)}.stat-icon.amber{background:var(--amber-bg)}
.stat-icon.red{background:var(--red-bg)}.stat-icon.blue{background:var(--blue-bg)}
.stat-icon.purple{background:var(--purple-bg)}
.stat-val{font-size:22px;font-weight:800;line-height:1}
.stat-lbl{font-size:10px;color:var(--f500);margin-top:2px}
.section-title{font-size:16px;font-weight:700;color:var(--s800);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.section-title .count{font-size:11px;background:var(--f200);padding:1px 8px;border-radius:99px;color:var(--f500);font-weight:600}
.team-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
.team-tab{font-size:12px;font-weight:600;padding:8px 16px;border-radius:8px;border:1.5px solid var(--f200);background:var(--w);cursor:pointer;transition:all .1s;font-family:'Inter','Noto Sans',sans-serif}
.team-tab:hover{border-color:var(--s300);background:var(--s50)}
.team-tab.active{background:var(--s500);color:var(--w);border-color:var(--s500)}
.team-tab .team-badge{font-size:9px;font-weight:700;margin-left:6px;padding:1px 5px;border-radius:99px;background:rgba(255,255,255,.2)}
.team-tab.active .team-badge{background:rgba(255,255,255,.2);color:var(--w)}
.team-tab:not(.active) .team-badge{background:var(--f100);color:var(--f500)}
.patient-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.patient-card{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1.5px solid var(--f200);border-radius:var(--r);background:var(--w);transition:all .15s;cursor:pointer}
.patient-card:hover{border-color:var(--s300);box-shadow:var(--sh)}
.patient-card.critical{border-left:4px solid var(--red);background:var(--red-bg)}
.patient-card.deteriorated{border-left:4px solid var(--amber);background:var(--amber-bg)}
.patient-card.ready-dc{border-left:4px solid var(--green)}
.patient-card.icu{border-left:4px solid var(--purple)}
.patient-icon{font-size:24px;width:36px;text-align:center}
.patient-info{flex:1;min-width:0}
.patient-name{font-size:13px;font-weight:700}
.patient-meta{font-size:11px;color:var(--f500);margin-top:1px;display:flex;gap:8px;flex-wrap:wrap}
.patient-detail{font-size:10px;color:var(--f400);margin-top:2px}
.patient-tags{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}
.patient-tag{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px}
.patient-tag.red{background:var(--red-bg);color:var(--red-t)}
.patient-tag.amber{background:var(--amber-bg);color:var(--amber-t)}
.patient-tag.green{background:var(--green-bg);color:var(--green-t)}
.patient-tag.blue{background:var(--blue-bg);color:var(--blue-t)}
.patient-tag.purple{background:var(--purple-bg);color:var(--purple-t)}
.patient-actions{display:flex;gap:4px}
.patient-btn{font-size:10px;font-weight:700;padding:5px 10px;border-radius:6px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
.patient-btn.primary{background:var(--s500);color:var(--w)}
.patient-btn.primary:hover{background:var(--s600)}
.patient-btn.outline{background:var(--w);border:1.5px solid var(--f200);color:var(--f500)}
.patient-btn.outline:hover{border-color:var(--s300);color:var(--s600)}
.patient-btn.danger{background:var(--red);color:var(--w)}
.oversight-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
@media(max-width:900px){.oversight-grid{grid-template-columns:1fr}}
.oversight-card{background:var(--w);border:1.5px solid var(--f200);border-radius:var(--r-lg);overflow:hidden}
.oversight-header{padding:14px 18px;border-bottom:1px solid var(--f200);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;background:var(--f50);justify-content:space-between}
.oversight-body{padding:12px}
.oversight-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--f200);border-radius:var(--r-sm);margin-bottom:6px;cursor:pointer;transition:all .1s}
.oversight-item:hover{border-color:var(--s300);background:var(--s50)}
.oversight-item:last-child{margin-bottom:0}
.oversight-priority{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.oversight-priority.high{background:var(--red)}
.oversight-priority.med{background:var(--amber)}
.oversight-priority.low{background:var(--green)}
.approval-panel{background:var(--w);border:1.5px solid var(--s200);border-radius:var(--r);padding:16px;margin-bottom:24px}
.approval-header{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--s800);margin-bottom:12px}
.approval-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-sm);background:var(--s50);margin-bottom:6px;font-size:12px;border:1px solid var(--s200)}
.approval-item .action-btn{font-size:10px;font-weight:700;padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif;margin-left:auto}
.approval-item .action-btn.approve{background:var(--green);color:var(--w)}
.approval-item .action-btn.reject{background:var(--f200);color:var(--f500)}
`;

function _CosConsultantDashboard() {
  const [tab, setTab] = useState("teams");
  const [team, setTeam] = useState("teamA");

  const teams = [
    { id: "teamA", label: "Medical Team A", badge: 18, color: "blue" },
    { id: "teamB", label: "Medical Team B", badge: 15, color: "green" },
    { id: "surgical", label: "Surgical Team", badge: 12, color: "purple" },
    { id: "paeds", label: "Paediatric Team", badge: 8, color: "amber" },
  ];

  const patientsByTeam: Record<string, any[]> = {
    teamA: [
      { name: "John K.", bed: 2, age: 55, gender: "M", dx: "DKA", days: 3, priority: "icu", tags: ["\u26A0\uFE0F ICU Candidate", "\uD83D\uDC8A Insulin"], detail: "pH 7.18, HCO3 12, BM 18.4. Insulin infusion running. K+ result pending." },
      { name: "David N.", bed: 6, age: 72, gender: "M", dx: "Acute Stroke", days: 1, priority: "critical", tags: ["\uD83D\uDEA8 Critical", "\uD83E\uDDE0 GCS 14"], detail: "CT Brain done - no haemorrhage. L sided weakness. GCS 14/15. Aspirin started." },
      { name: "Grace M.", bed: 3, age: 28, gender: "F", dx: "Severe Malaria + Anemia", days: 3, priority: "deteriorated", tags: ["\uD83D\uDD14 Overnight Change", "\uD83E\uDE78 Transfusing"], detail: "Hb dropped 6.8\u21928.2 post-transfusion. Fever improved. Monitor parasitemia." },
      { name: "Mary A.", bed: 1, age: 45, gender: "F", dx: "Severe Malaria", days: 3, priority: "ready-dc", tags: ["\uD83D\uDEAA DC Tomorrow", "\u2705 Afebrile 48h"], detail: "Improving. Afebrile, eating well. Repeat Hb stable. Discharge planning started." },
      { name: "Peter O.", bed: 4, age: 4, gender: "M", dx: "Gastroenteritis", days: 2, priority: "ready-dc", tags: ["\uD83D\uDEAA DC Today", "\u2705 Oral feeds"], detail: "Diarrhoea resolved. Tolerating ORS. Discharge pending parent education." },
      { name: "Samuel K.", bed: 8, age: 68, gender: "M", dx: "Heart Failure", days: 4, priority: "normal", tags: ["\uD83D\uDCEC Awaiting ECHO"], detail: "LVEF 35-40%. Diastolic dysfunction. Furosemide adjusted. ECHO report pending." },
      { name: "Faith J.", bed: 7, age: 38, gender: "F", dx: "Pyelonephritis", days: 2, priority: "normal", tags: ["\uD83D\uDC8A IV Antibiotics"], detail: "Temp improving 39.5\u219237.2. IV Ceftriaxone. Urine culture pending." },
      { name: "Sarah W.", bed: 5, age: 45, gender: "F", dx: "Pre-op Cholecystectomy", days: 1, priority: "normal", tags: ["\uD83D\uDC89 OT Scheduled"], detail: "Elective cholecystectomy today 14:00. NBM. Consent signed. Pre-op checklist done." },
    ],
    teamB: [
      { name: "Esther M.", bed: 1, age: 32, gender: "F", dx: "Sepsis (UTI)", days: 2, priority: "critical", tags: ["\uD83D\uDEA8 Critical", "\uD83E\uDDEA Blood Culture"], detail: "Temp 39.8, HR 115, BP 85/55. IV fluids + Ceftriaxone. Vasopressors considered." },
      { name: "James O.", bed: 3, age: 60, gender: "M", dx: "COPD Exacerbation", days: 4, priority: "ready-dc", tags: ["\uD83D\uDEAA DC Today", "\u2705 Stable"], detail: "O2 sat 95% on room air. Nebulisation completed. Discharge with inhalers." },
      { name: "Ruth K.", bed: 5, age: 25, gender: "F", dx: "Sickle Cell Crisis", days: 2, priority: "deteriorated", tags: ["\uD83D\uDD14 Pain Crisis", "\uD83D\uDC8A Analgesics"], detail: "Pain score 7/10. Morphine PCA. Hb 7.2. Reticulocytes elevated. Hydration ongoing." },
      { name: "Daniel N.", bed: 7, age: 50, gender: "M", dx: "Cirrhosis + Ascites", days: 5, priority: "icu", tags: ["\u26A0\uFE0F ICU Candidate", "\uD83D\uDCEC Child-Pugh B"], detail: "Ascites tense. Paracentesis done. Child-Pugh score 8. Hyponatremia Na 128." },
    ],
    surgical: [
      { name: "Joseph M.", bed: 2, age: 35, gender: "M", dx: "Appendicitis", days: 1, priority: "normal", tags: ["\uD83D\uDE91 Post-op Day 1"], detail: "Laparoscopic appendectomy yesterday. Tolerating fluids. Pain controlled." },
      { name: "Hannah W.", bed: 4, age: 42, gender: "F", dx: "Bowel Obstruction", days: 3, priority: "critical", tags: ["\uD83D\uDEA8 Critical", "\uD83D\uDE91 Post-op"], detail: "Laparotomy + adhesiolysis. NG drainage 800mL. Electrolytes stable. Wound clean." },
      { name: "Paul O.", bed: 6, age: 28, gender: "M", dx: "Trauma - Femur Fracture", days: 2, priority: "normal", tags: ["\uD83D\uDE91 Pre-op"], detail: "ORIF scheduled tomorrow. Consent done. Blood crossmatched. DVT prophylaxis started." },
    ],
    paeds: [
      { name: "Baby M.", bed: 1, age: 1.5, gender: "M", dx: "Bronchiolitis", days: 2, priority: "critical", tags: ["\uD83D\uDEA8 Critical", "\uD83D\uDD0A O2 Therapy"], detail: "Resp rate 55, O2 sat 89% on RA. Nasal cannula 1L/min. Suction q2h." },
      { name: "Lisa A.", bed: 3, age: 6, gender: "F", dx: "Nephrotic Syndrome", days: 5, priority: "deteriorated", tags: ["\uD83D\uDD14 Relapse", "\uD83D\uDC8A Steroids"], detail: "Proteinuria 3+. Oedema increasing. Albumin 18. Prednisolone started. Monitor I/O." },
      { name: "Tom K.", bed: 5, age: 10, gender: "M", dx: "Malaria - Uncomplicated", days: 2, priority: "ready-dc", tags: ["\uD83D\uDEAA DC Today", "\u2705 Parasite clearance"], detail: "Artesunate completed. Oral Artemether-Lumefantrine started. Smear negative today." },
    ],
  };

  const currentPatients = patientsByTeam[team] || [];

  const priorityOrder = ["critical", "icu", "deteriorated", "ready-dc", "normal"];
  const sortedPatients = [...currentPatients].sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));

  const nav = [
    { group: "OVERSIGHT", items: [
      { id: "teams", icon: "\uD83D\uDC65", label: "My Teams", badge: teams.reduce((s,t) => s + t.badge, 0) },
      { id: "review", icon: "\uD83D\uDD0D", label: "Patient Review" },
    ]},
    { group: "DECISIONS", items: [
      { id: "approvals", icon: "\u2705", label: "Pending Approvals", badge: 5, badgeType: "amber" },
      { id: "referrals", icon: "\uD83D\uDD04", label: "Referrals", badge: 3 },
    ]},
    { group: "INTELLIGENCE", items: [
      { id: "quality", icon: "\uD83D\uDCCA", label: "Quality Metrics" },
      { id: "teaching", icon: "\uD83C\uDF93", label: "Teaching Cases", badge: 2, badgeType: "purple" },
      { id: "insights", icon: "\uD83E\uDDE0", label: "Clinical Insights" },
    ]},
  ];

  const pendingApprovals = [
    { patient: "Grace M.", bed: 3, request: "Blood transfusion 1 unit PRBC", from: "Dr. Kamau", time: "09:30", type: "urgent" },
    { patient: "John K.", bed: 2, request: "Insulin infusion rate change 5\u21924 U/hr", from: "Dr. Kamau", time: "09:15", type: "urgent" },
    { patient: "David N.", bed: 6, request: "Start Aspirin 75mg PO", from: "Dr. Njoroge", time: "08:45", type: "routine" },
    { patient: "Samuel K.", bed: 8, request: "Furosemide 40\u219280mg PO", from: "Dr. Njoroge", time: "08:00", type: "routine" },
    { patient: "Faith J.", bed: 7, request: "IV Ceftriaxone 1g BD \u00D7 7 days", from: "Dr. Wanjiku", time: "07:45", type: "routine" },
  ];

  const referrals = [
    { patient: "David N.", bed: 6, type: "Physiotherapy", reason: "Stroke rehabilitation, mobilisation assessment", status: "pending", to: "Rehab Team" },
    { patient: "Samuel K.", bed: 8, type: "Cardiology Review", reason: "Diastolic dysfunction, LVEF 35%, echo abnormalities", status: "pending", to: "Cardiology" },
    { patient: "Grace M.", bed: 3, type: "Infectious Disease", reason: "If no improvement 48h post-Artesunate", status: "scheduled", to: "ID Team" },
  ];

  const getCount = (id: string) => {
    if (id === "approvals") return pendingApprovals.length;
    if (id === "referrals") return referrals.length;
    if (id === "teaching") return 2;
    return 0;
  };

  return (
    <>
      <style>{S}</style>
      <div className="cos-layout">
        <aside className="cos-sidebar">
          <div className="cos-brand">AMEXAN <span>CONSULT</span></div>
          <nav style={{flex:1}}>
            {nav.map((group, gi) => (
              <div key={gi}>
                <div className="sidebar-group">{group.group}</div>
                {group.items.map(item => (
                  <button key={item.id} className={`cos-nav-item ${tab===item.id?'active':''}`} onClick={()=>setTab(item.id)}>
                    <span className="icon">{item.icon}</span> {item.label}
                    {(item.badge || getCount(item.id) > 0) && (
                      <span className={`badge ${item.badgeType || ''}`}>{item.badge || getCount(item.id)}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="cos-profile">
            <div className="cos-avatar">PN</div>
            <div><div className="cos-name">Prof. P. Njoroge</div><div className="cos-role">Consultant Physician</div></div>
          </div>
        </aside>

        <main className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting"><strong>Consultant Oversight</strong> \u00B7 Multi-Team Clinical Governance</div>
            <div className="cos-topbar-right">
              <button className="cos-topbar-btn">{'\uD83D\uDD14'}</button>
              <button className="cos-topbar-btn">{'\u2699\uFE0F'}</button>
              <a href="/cos-landing" className="cos-topbar-btn">{'\uD83C\uDFE0'}</a>
            </div>
          </header>

          <div className="cos-body">
            <div className="stats-row">
              <div className="stat-card"><div className="stat-icon blue">{'\uD83D\uDC65'}</div><div><div className="stat-val">53</div><div className="stat-lbl">Total Patients</div></div></div>
              <div className="stat-card"><div className="stat-icon red">{'\uD83D\uDEA8'}</div><div><div className="stat-val">5</div><div className="stat-lbl">Critical</div></div></div>
              <div className="stat-card"><div className="stat-icon amber">{'\uD83D\uDD14'}</div><div><div className="stat-val">3</div><div className="stat-lbl">Deteriorated</div></div></div>
              <div className="stat-card"><div className="stat-icon purple">{'\u26A0\uFE0F'}</div><div><div className="stat-val">2</div><div className="stat-lbl">ICU Candidates</div></div></div>
              <div className="stat-card"><div className="stat-icon green">{'\uD83D\uDEAA'}</div><div><div className="stat-val">6</div><div className="stat-lbl">Ready for DC</div></div></div>
            </div>

            {tab === "teams" && (
              <>
                <div className="section-title">{'\uD83D\uDC65'} Team Oversight — Today's Roster</div>
                <div className="team-tabs">
                  {teams.map(t => (
                    <button key={t.id} className={`team-tab ${team===t.id?'active':''}`} onClick={()=>setTeam(t.id)}>
                      {t.label} <span className="team-badge">{t.badge}</span>
                    </button>
                  ))}
                </div>

                <div className="section-title" style={{marginTop:0}}>
                  {teams.find(t=>t.id===team)?.label} — {currentPatients.length} patients
                  <span className="count">Priority sorted</span>
                </div>

                <div className="patient-grid">
                  {sortedPatients.map((p,i)=>(
                    <div key={i} className={`patient-card ${p.priority}`}>
                      <div className="patient-icon">
                        {p.priority==='critical'?'\uD83D\uDEA8':p.priority==='icu'?'\u26A0\uFE0F':p.priority==='deteriorated'?'\uD83D\uDD14':p.priority==='ready-dc'?'\uD83D\uDEAA':'\uD83D\uDC65'}
                      </div>
                      <div className="patient-info">
                        <div className="patient-name">{p.name} \u00B7 Bed {p.bed}</div>
                        <div className="patient-meta">
                          <span>{p.age}{p.gender} · {p.dx} · Day {p.days}</span>
                        </div>
                        <div className="patient-detail">{p.detail}</div>
                        <div className="patient-tags">
                          {p.tags.map((tag,ti)=>(
                            <span key={ti} className={`patient-tag ${p.priority==='critical'?'red':p.priority==='icu'?'purple':p.priority==='deteriorated'?'amber':p.priority==='ready-dc'?'green':'blue'}`}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="patient-actions">
                        <button className="patient-btn primary">Open</button>
                        <button className="patient-btn outline">Plan</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "review" && (
              <>
                <div className="section-title">{'\uD83D\uDD0D'} All Patients — Cross-Team Review</div>
                <div className="patient-grid">
                  {Object.entries(patientsByTeam).flatMap(([tid, pts]) =>
                    pts.map((p,i)=>(
                      <div key={`${tid}-${i}`} className={`patient-card ${p.priority}`}>
                        <div className="patient-icon">{p.priority==='critical'?'\uD83D\uDEA8':p.priority==='icu'?'\u26A0\uFE0F':p.priority==='deteriorated'?'\uD83D\uDD14':p.priority==='ready-dc'?'\uD83D\uDEAA':'\uD83D\uDC65'}</div>
                        <div className="patient-info">
                          <div className="patient-name">{p.name} \u00B7 Bed {p.bed}</div>
                          <div className="patient-meta">
                            <span>{p.age}{p.gender} \u00B7 {p.dx} \u00B7 {teams.find(t=>t.id===tid)?.label}</span>
                          </div>
                          <div className="patient-detail">{p.detail}</div>
                          <div className="patient-tags">
                            {p.tags.slice(0,2).map((tag,ti)=>(
                              <span key={ti} className={`patient-tag ${p.priority==='critical'?'red':p.priority==='icu'?'purple':p.priority==='deteriorated'?'amber':p.priority==='ready-dc'?'green':'blue'}`}>{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="patient-actions">
                          <button className="patient-btn primary">Review</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {tab === "approvals" && (
              <>
                <div className="approval-panel" style={{marginTop:0}}>
                  <div className="approval-header">{'\u2705'} Pending Approvals — {pendingApprovals.length} awaiting your decision</div>
                  {pendingApprovals.map((a,i)=>(
                    <div key={i} className="approval-item" style={{flexWrap:'wrap'}}>
                      <span style={{fontSize:16}}>{a.type==='urgent'?'\u26A0\uFE0F':'\uD83D\uDCDD'}</span>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{fontWeight:700,fontSize:12}}>{a.request}</div>
                        <div style={{fontSize:10,color:'var(--f500)'}}>{a.patient} — by {a.from} at {a.time}</div>
                      </div>
                      <div style={{display:'flex',gap:4}}>
                        <button className="action-btn approve">{'\u2713'} Approve</button>
                        <button className="action-btn reject">Amend</button>
                        <button className="action-btn reject" style={{background:'var(--red-bg)',color:'var(--red-t)'}}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "referrals" && (
              <>
                <div className="section-title">{'\uD83D\uDD04'} Active Referrals <span className="count">{referrals.length}</span></div>
                <div className="patient-grid">
                  {referrals.map((r,i)=>(
                    <div key={i} className="patient-card" style={{flexDirection:'column',alignItems:'flex-start',gap:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,width:'100%'}}>
                        <span style={{fontSize:20}}>{'\uD83D\uDD04'}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13}}>{r.patient} \u2192 {r.to}</div>
                          <div style={{fontSize:11,color:'var(--f500)'}}>{r.type}: {r.reason}</div>
                        </div>
                        <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:4,background:r.status==='pending'?'var(--amber-bg)':'var(--blue-bg)',color:r.status==='pending'?'var(--amber-t)':'var(--blue-t)'}}>{r.status}</span>
                      </div>
                      <div className="patient-actions" style={{width:'100%'}}>
                        <button className="patient-btn primary">Approve Referral</button>
                        <button className="patient-btn outline">View Patient</button>
                        <button className="patient-btn outline">Add Note</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "quality" && (
              <>
                <div className="section-title">{'\uD83D\uDCCA'} Quality Metrics — This Week</div>
                <div className="oversight-grid">
                  <div className="oversight-card">
                    <div className="oversight-header">Bed Occupancy by Team</div>
                    <div className="oversight-body">
                      {teams.map(t => {
                        const pts = patientsByTeam[t.id]?.length || 0;
                        const max = t.badge;
                        const pct = Math.round((pts / max) * 100);
                        return (
                          <div key={t.id} style={{marginBottom:8}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:2}}>
                              <span>{t.label}</span><span style={{fontWeight:700}}>{pts}/{max} ({pct}%)</span>
                            </div>
                            <div style={{height:6,borderRadius:99,background:'var(--f100)',overflow:'hidden'}}>
                              <div style={{width:`${pct}%`,height:'100%',borderRadius:99,background:pct>90?'var(--red)':pct>75?'var(--amber)':'var(--green)'}} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="oversight-card">
                    <div className="oversight-header">Length of Stay Distribution</div>
                    <div className="oversight-body">
                      {[
                        {label:"< 3 days",count:24,pct:45},
                        {label:"3-7 days",count:18,pct:34},
                        {label:"7-14 days",count:8,pct:15},
                        {label:"> 14 days",count:3,pct:6},
                      ].map((s,i)=>(
                        <div key={i} style={{marginBottom:6}}>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:2}}>
                            <span>{s.label}</span><span style={{fontWeight:700}}>{s.count} patients</span>
                          </div>
                          <div style={{height:6,borderRadius:99,background:'var(--f100)',overflow:'hidden'}}>
                            <div style={{width:`${s.pct}%`,height:'100%',borderRadius:99,background:['var(--green)','var(--blue)','var(--amber)','var(--red)'][i]}} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="oversight-card">
                    <div className="oversight-header">Mortality & Adverse Events</div>
                    <div className="oversight-body">
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        {[
                          {num:"0",label:"Deaths This Month",color:"green"},
                          {num:"2",label:"Adverse Events",color:"amber"},
                          {num:"1",label:"Readmissions <30d",color:"amber"},
                          {num:"4.2d",label:"Avg LOS",color:"blue"},
                        ].map((m,i)=>(
                          <div key={i} style={{padding:'10px',border:'1px solid var(--f200)',borderRadius:8,textAlign:'center'}}>
                            <div style={{fontSize:20,fontWeight:800,color:`var(--${m.color})`}}>{m.num}</div>
                            <div style={{fontSize:9,color:'var(--f500)',marginTop:2}}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="oversight-card">
                    <div className="oversight-header">Team Performance</div>
                    <div className="oversight-body">
                      {teams.map(t => {
                        const pts = patientsByTeam[t.id]?.length || 0;
                        const dc = pts > 0 ? patientsByTeam[t.id].filter((p:any) => p.priority === 'ready-dc').length : 0;
                        return (
                          <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid var(--f100)',fontSize:11}}>
                            <span style={{fontWeight:700,flex:1}}>{t.label}</span>
                            <span>{pts} patients</span>
                            <span style={{color:'var(--green)'}}>{dc} DC ready</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "teaching" && (
              <>
                <div className="section-title">{'\uD83C\uDF93'} Teaching Cases — Interesting Presentations</div>
                <div className="oversight-grid">
                  {[
                    {title:"Severe Malaria with Multi-Organ Dysfunction", patient:"Grace M.", key:"Hb 6.8 + mRDT+ + Thrombocytopenia + Hypotension — WHO criteria met", teaching:"Recognising severe malaria vs uncomplicated. Timing of transfusion. Artesunate dosing protocols.", tags:["\uD83D\uDCD6 WHO Guidelines", "\uD83D\uDE8C Pathophysiology"]},
                    {title:"DKA Management in Resource-Limited Setting", patient:"John K.", key:"pH 7.18, HCO3 12, BM 18.4 — Severe DKA", teaching:"Insulin infusion protocol. Fluid resuscitation. K+ monitoring. Transition to subcutaneous insulin.", tags:["\uD83D\uDCD6 ADA Guidelines", "\uD83D\uDC8A Insulin Therapy"]},
                  ].map((c,i)=>(
                    <div key={i} className="oversight-card">
                      <div className="oversight-header" style={{background:'var(--purple-bg)'}}>
                        <span>{'\uD83C\uDF93'} {c.title}</span>
                      </div>
                      <div className="oversight-body">
                        <div style={{marginBottom:6}}>
                          <div className="patient-name">{c.patient}</div>
                          <div className="patient-detail" style={{marginTop:4}}><strong>Key Features:</strong> {c.key}</div>
                          <div className="patient-detail" style={{marginTop:4}}><strong>Teaching Points:</strong> {c.teaching}</div>
                        </div>
                        <div className="patient-tags">
                          {c.tags.map((t,ti)=>(
                            <span key={ti} className="patient-tag purple">{t}</span>
                          ))}
                        </div>
                        <div className="patient-actions" style={{marginTop:8}}>
                          <button className="patient-btn primary">Prepare Teaching Round</button>
                          <button className="patient-btn outline">Add Notes</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "insights" && (
              <>
                <div className="section-title">{'\uD83E\uDDE0'} Clinical Insights — Cross-Patient Pattern Recognition</div>
                <div className="oversight-grid">
                  <div className="oversight-card">
                    <div className="oversight-header">{'\uD83D\uDCC8'} Population Trends</div>
                    <div className="oversight-body">
                      {[
                        {pattern:"Malaria Admissions ↑ 40% this week", detail:"8 cases vs 5 last week. All P. falciparum, 2 severe.", severity:"amber"},
                        {pattern:"Antibiotic Resistance Pattern", detail:"3 E. coli isolates resistant to Ceftriaxone. Review antibiotic protocol.", severity:"red"},
                        {pattern:"DKA Admissions stable", detail:"2 cases this week. Both with poor glycemic control. Consider outpatient diabetes education.", severity:"green"},
                      ].map((ins,i)=>(
                        <div key={i} className="oversight-item" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,width:'100%'}}>
                            <div className={`oversight-priority ${ins.severity}`} />
                            <span style={{fontWeight:700,fontSize:12}}>{ins.pattern}</span>
                          </div>
                          <div style={{fontSize:11,color:'var(--f500)',marginLeft:14}}>{ins.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="oversight-card">
                    <div className="oversight-header">{'\uD83D\uDCD6'} Guideline Compliance</div>
                    <div className="oversight-body">
                      {[
                        {metric:"Malaria — Artesunate first dose <1h", current:"92%", target:">95%", status:"amber"},
                        {metric:"Sepsis — Antibiotics <1h", current:"88%", target:">95%", status:"red"},
                        {metric:"DKA — Insulin <2h", current:"100%", target:">95%", status:"green"},
                        {metric:"Stroke — CT Brain <4h", current:"85%", target:">90%", status:"amber"},
                        {metric:"VTE Prophylaxis", current:"94%", target:">95%", status:"green"},
                      ].map((g,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--f100)',fontSize:11}}>
                          <div style={{flex:1}}>{g.metric}</div>
                          <span style={{fontWeight:700}}>{g.current}</span>
                          <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:3,background:g.status==='green'?'var(--green-bg)':g.status==='red'?'var(--red-bg)':'var(--amber-bg)',color:g.status==='green'?'var(--green-t)':g.status==='red'?'var(--red-t)':'var(--amber-t)'}}>target {g.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const SUPPORTED_ROLES = ['clinical'] as const;

export default function CosConsultantDashboard() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <_CosConsultantDashboard />
    </WorkspaceGuard>
  );
}
