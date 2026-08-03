"use client";
import { useState, useCallback } from "react";
import { UserCircle, Stethoscope, Heart, Building, FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3, Brain, Target, Activity, Clock, BookOpen, Calendar, Share2, Search, AlertTriangle, Eye, ArrowRight } from 'lucide-react'

const CONSTITUTION_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-300:#7dd3fc;
  --sky-400:#38bdf8; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --sky-800:#075985; --sky-900:#0c4a6e;
  --white:#ffffff; --frost-50:#fafafa; --frost-100:#f5f5f5; --frost-200:#e5e5e5;
  --frost-300:#d4d4d4; --frost-400:#a3a3a3; --frost-500:#737373;
  --green:#10b981; --amber:#f59e0b; --red:#ef4444; --purple:#8b5cf6;
  --font:'Inter','IBM Plex Sans',sans-serif;
  --radius:12px; --radius-sm:8px; --radius-lg:20px;
  --shadow:0 1px 3px rgba(0,0,0,.06); --shadow-md:0 4px 16px rgba(0,0,0,.08);
  --shadow-lg:0 12px 40px rgba(0,0,0,.1);
}
body{font-family:var(--font);background:var(--white);color:#0f172a;-webkit-font-smoothing:antialiased;overflow-x:hidden}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}

/* Header */
.cos-header{
  background:var(--white);border-bottom:1px solid var(--frost-200);
  padding:12px 32px;display:flex;justify-content:space-between;align-items:center;
  position:sticky;top:0;z-index:100;
}
.cos-logo{font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--sky-700);display:flex;align-items:center;gap:8px}
.cos-logo span{background:var(--sky-100);color:var(--sky-600);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700}
.cos-nav{display:flex;align-items:center;gap:20px}
.cos-nav-item{font-size:13px;font-weight:600;color:var(--frost-500);cursor:pointer;transition:color .15s;text-decoration:none}
.cos-nav-item:hover{color:var(--sky-600)}
.cos-nav-item.active{color:var(--sky-700)}

/* Hero */
.cos-hero{
  padding:60px 32px;max-width:1200px;margin:0 auto;text-align:center;
}
.cos-eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--sky-50);border:1px solid var(--sky-200);
  padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;color:var(--sky-700);margin-bottom:20px;
}
.cos-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--sky-500);animation:pulse-dot 1.5s infinite}
.cos-h1{font-size:48px;font-weight:800;letter-spacing:-1.5px;color:var(--sky-900);line-height:1.1;margin-bottom:16px}
.cos-h1 em{color:var(--sky-500);font-style:normal}
.cos-p{font-size:18px;color:var(--frost-500);max-width:640px;margin:0 auto 32px;line-height:1.7}
.cos-hero-tagline{font-size:14px;color:var(--sky-600);font-weight:600;background:var(--sky-50);padding:10px 24px;border-radius:12px;display:inline-block;border:1px solid var(--sky-200)}

/* Constitutional Flow */
.cos-flow{
  max-width:1100px;margin:0 auto;padding:40px 32px 80px;
}
.cos-flow-title{font-size:28px;font-weight:800;color:var(--sky-900);text-align:center;margin-bottom:8px}
.cos-flow-sub{font-size:14px;color:var(--frost-500);text-align:center;margin-bottom:48px}
.constitution-chain{
  display:flex;flex-direction:column;align-items:center;gap:0;
  position:relative;
}
.constitution-step{
  display:flex;align-items:center;justify-content:center;
  width:280px;padding:14px 24px;
  background:var(--white);border:2px solid var(--sky-200);
  border-radius:14px;font-size:16px;font-weight:700;color:var(--sky-700);
  position:relative;z-index:2;
  transition:all .2s;cursor:default;
}
.constitution-step:hover{border-color:var(--sky-400);background:var(--sky-50);transform:scale(1.03);box-shadow:var(--shadow-md)}
.constitution-step .step-icon{margin-right:10px;font-size:18px}
.constitution-arrow{color:var(--sky-300);font-size:14px;padding:4px 0;position:relative;z-index:2}
.constitution-divider{
  width:100%;height:2px;background:var(--sky-100);
  margin:24px 0;position:relative;
}
.constitution-divider-label{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  background:var(--white);padding:4px 16px;border-radius:100px;
  font-size:12px;font-weight:700;color:var(--sky-600);
  border:1px solid var(--sky-200);white-space:nowrap;
}

/* Engines Grid */
.engines-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:40px}
.engine-card{
  background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);
  padding:24px;transition:all .2s;cursor:default;
}
.engine-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md);transform:translateY(-2px)}
.engine-num{font-size:12px;font-weight:800;color:var(--sky-400);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.engine-title{font-size:18px;font-weight:700;color:var(--sky-800);margin-bottom:8px}
.engine-desc{font-size:13px;color:var(--frost-500);line-height:1.7}
.engine-items{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.engine-tag{background:var(--sky-50);color:var(--sky-700);font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;border:1px solid var(--sky-200)}

/* Role Sections */
.cos-roles{max-width:1100px;margin:0 auto;padding:40px 32px 80px}
.role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;margin-top:32px}
.role-card{
  background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);
  padding:28px;transition:all .2s;
}
.role-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md);transform:translateY(-2px)}
.role-icon{font-size:32px;margin-bottom:12px}
.role-name{font-size:20px;font-weight:700;color:var(--sky-800);margin-bottom:6px}
.role-answer{font-size:13px;color:var(--sky-600);font-weight:600;margin-bottom:12px}
.role-desc{font-size:13px;color:var(--frost-500);line-height:1.7}
.role-tasks{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.task-tag{background:var(--sky-50);color:var(--sky-600);font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;border:1px solid var(--sky-100)}

/* Principles */
.principles{padding:60px 32px;background:var(--sky-50);border-top:1px solid var(--sky-200)}
.principles-inner{max-width:1100px;margin:0 auto}
.principles-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-top:32px}
.principle-card{
  background:var(--white);border:1px solid var(--sky-200);border-radius:var(--radius-lg);
  padding:24px;transition:all .2s;
}
.principle-card:hover{box-shadow:var(--shadow-md)}
.principle-num{font-size:12px;font-weight:800;color:var(--sky-400);margin-bottom:6px}
.principle-title{font-size:15px;font-weight:700;color:var(--sky-800);margin-bottom:6px}
.principle-desc{font-size:13px;color:var(--frost-500);line-height:1.7}

/* Standards */
.standards{max-width:1100px;margin:0 auto;padding:60px 32px}
.standards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:32px}
.standard-card{
  background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);
  padding:20px;text-align:center;transition:all .2s;
}
.standard-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md)}
.standard-name{font-size:14px;font-weight:700;color:var(--sky-700);margin-bottom:4px}
.standard-desc{font-size:11px;color:var(--frost-500)}
.standard-tag{display:inline-block;background:var(--sky-50);color:var(--sky-600);font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;margin-top:6px}

/* Dashboard Preview at bottom */
.dash-preview{padding:60px 32px;background:var(--sky-900);color:var(--white);text-align:center}
.dash-preview h2{font-size:32px;font-weight:800;margin-bottom:12px}
.dash-preview p{color:var(--sky-200);margin-bottom:32px}
.dash-btn{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--white);color:var(--sky-900);padding:14px 32px;border-radius:12px;
  font-size:16px;font-weight:700;text-decoration:none;transition:all .2s;
}
.dash-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}

/* Ward Round Mode */
.ward-round-preview{
  max-width:900px;margin:32px auto 0;
  background:var(--white);border-radius:var(--radius-lg);overflow:hidden;
  box-shadow:var(--shadow-lg);
}
.ward-round-header{
  background:var(--sky-700);color:var(--white);padding:16px 24px;
  display:flex;justify-content:space-between;align-items:center;
}
.ward-round-header h3{font-size:16px;font-weight:700}
.ward-round-progress{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--sky-200)}
.ward-round-body{padding:24px}
.ward-bed-card{
  display:flex;align-items:center;gap:16px;
  padding:16px;border:1.5px solid var(--frost-200);border-radius:var(--radius);
  margin-bottom:12px;transition:all .15s;cursor:pointer;
}
.ward-bed-card:hover{border-color:var(--sky-300);background:var(--sky-50)}
.ward-bed-card.active{border-color:var(--sky-500);background:var(--sky-50);box-shadow:0 0 0 3px var(--sky-200)}
.ward-bed-num{width:40px;height:40px;border-radius:10px;background:var(--sky-100);color:var(--sky-700);font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ward-bed-info{flex:1}
.ward-bed-name{font-weight:700;color:#0f172a;font-size:14px}
.ward-bed-dx{font-size:11px;color:var(--frost-500);margin-top:2px}
.ward-bed-meta{display:flex;gap:8px;margin-top:4px}
.ward-bed-pill{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.ward-bed-pill.green{background:#d1fae5;color:#065f46}
.ward-bed-pill.amber{background:#fef3c7;color:#92400e}
.ward-bed-pill.red{background:#fee2e2;color:#991b1b}
.ward-bed-actions{display:flex;gap:6px}
.ward-bed-btn{font-size:11px;font-weight:700;padding:6px 14px;border-radius:8px;border:none;cursor:pointer;transition:all .1s}
.ward-bed-btn.primary{background:var(--sky-500);color:var(--white)}
.ward-bed-btn.primary:hover{background:var(--sky-600)}
.ward-bed-btn.outline{background:var(--white);border:1.5px solid var(--frost-200);color:var(--frost-500)}
.ward-bed-btn.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.ward-bed-btn.done{background:#d1fae5;color:#065f46}
.ward-bed-btn.done:hover{background:#a7f3d0}

/* Progress bar */
.ward-progress{height:4px;background:var(--sky-100);border-radius:99px;margin-bottom:20px;overflow:hidden}
.ward-progress-fill{height:100%;background:var(--sky-500);border-radius:99px;transition:width .5s}
`;

export default function AmexanConstitution() {
  const [activeSection, setActiveSection] = useState("constitution");
  const [completedBeds, setCompletedBeds] = useState<number[]>([]);

  const toggleBed = useCallback((bedNum: number) => {
    setCompletedBeds(prev =>
      prev.includes(bedNum) ? prev.filter(b => b !== bedNum) : [...prev, bedNum]
    );
  }, []);

  const constitution = [
    { icon: <UserCircle size={20} />, label: "PATIENT" },
    { icon: <Building size={20} />, label: "ENCOUNTER" },
    { icon: <FileText size={20} />, label: "HISTORY" },
    { icon: <Search size={20} />, label: "EXAMINATION" },
    { icon: <FlaskConical size={20} />, label: "INVESTIGATIONS" },
    { icon: <Share2 size={20} />, label: "EVIDENCE GRAPH" },
    { icon: <Brain size={20} />, label: "CLINICAL REASONING" },
    { icon: <ClipboardList size={20} />, label: "ASSESSMENT" },
    { icon: <Target size={20} />, label: "DIAGNOSIS" },
    { icon: <Pill size={20} />, label: "MANAGEMENT" },
    { icon: <ClipboardList size={20} />, label: "ORDERS" },
    { icon: <Activity size={20} />, label: "MONITORING" },
    { icon: <Clock size={20} />, label: "TIMELINE" },
    { icon: <FileText size={20} />, label: "DOCUMENTATION" },
    { icon: <ArrowRight size={20} />, label: "DISPOSITION" },
    { icon: <Calendar size={20} />, label: "FOLLOW-UP" },
    { icon: <BookOpen size={20} />, label: "LEARNING" },
    { icon: <BarChart3 size={20} />, label: "ANALYTICS" },
  ];

  const engines = [
    {
      num: "ENGINE 1", title: "Universal Orders Engine",
      desc: "One architecture for every clinical order — medications, procedures, imaging, consults, blood products, diet, nursing, and monitoring. Everything inherits from Order.",
      tags: ["Medication", "Procedure", "Imaging", "Consult", "Blood Products", "Diet", "Nursing"]
    },
    {
      num: "ENGINE 2", title: "Monitoring Engine",
      desc: "Every problem creates intelligent monitoring with targets, alerts, and escalation. Problems — not diseases — drive what is tracked.",
      tags: ["Targets", "Alerts", "Escalation", "Problem-Oriented", "Smart Thresholds"]
    },
    {
      num: "ENGINE 3", title: "Clinical Timeline Engine",
      desc: "Everything becomes time. Every event — from arrival to vitals to diagnosis to discharge — appears on a single chronological axis.",
      tags: ["Chronological", "Replay", "Audit Trail", "Event Visualization"]
    },
    {
      num: "ENGINE 4", title: "Documentation Engine",
      desc: "Every document is a view of the same encounter. Admission, progress, discharge, referral — choose the document, get the rendering.",
      tags: ["Auto-Generated", "Unified Source", "No Duplication"]
    },
    {
      num: "ENGINE 5", title: "Learning Engine",
      desc: "Every encounter becomes anonymous knowledge. The hospital learns, the AI learns, research becomes automatic.",
      tags: ["De-identified", "Pattern Recognition", "Quality Improvement"]
    },
  ];

  const roles = [
    {
      icon: <Stethoscope size={28} />, name: "Doctor", question: "What do I need to do now?",
      desc: "Ward round mode with bed-by-bed presentation, one-click decisions, auto-updating plans and notes. Never navigate modules — just review, decide, complete.",
      tasks: ["Ward Round", "Present", "Review", "Plan", "Sign Notes"]
    },
    {
      icon: <Heart size={28} />, name: "Nurse", question: "What is due for this patient?",
      desc: "Task-oriented workflow. Medication round, vitals, fluid balance, monitoring orders, escalations. Patients appear in order of need.",
      tasks: ["Medication Round", "Vitals", "Fluid Balance", "Escalations"]
    },
    {
      icon: <FlaskConical size={28} />, name: "Laboratory", question: "Which samples need attention?",
      desc: "Specimen-based workflow. Received, Processing, Verified, Released. Critical alerts auto-notify clinicians.",
      tasks: ["Sample Tracking", "Result Entry", "QC Verification", "Critical Alerts"]
    },
    {
      icon: <Pill size={28} />, name: "Pharmacy", question: "Is this order safe to dispense?",
      desc: "Medication safety first. Interaction checks, allergy verification, stock status, dispensing, and administration tracking.",
      tasks: ["Verify", "Interactions", "Allergies", "Dispense", "Track"]
    },
    {
      icon: <Scan size={28} />, name: "Radiology", question: "What is the clinical question?",
      desc: "Every imaging request includes the clinical question, not just the study type. Supports meaningful reporting.",
      tasks: ["Prioritize", "Acquire", "Report", "Critical Findings"]
    },
    {
      icon: <Building size={28} />, name: "Administration", question: "How is the hospital running?",
      desc: "Real-time operational dashboard. Bed occupancy, waiting times, discharge planning, resource allocation.",
      tasks: ["Census", "Throughput", "Resources", "Reports"]
    },
  ];

  const principles = [
    { num: "01", title: "One Source of Truth", desc: "Encounter facts are stored once and reused everywhere. No duplicate documentation. Every document is a view of the same structured data." },
    { num: "02", title: "Problem-Oriented Record", desc: "Care is organized around active clinical problems — fever, dehydration, anemia — not just diagnoses. Each problem owns its goals, orders, and monitoring." },
    { num: "03", title: "Encounter-Centered Architecture", desc: "The encounter is the core object. Everything — history, examination, orders, results, monitoring — attaches to the encounter. Nothing exists independently." },
    { num: "04", title: "Role-Based Workspace", desc: "The data are shared. The views differ. Every role sees the same encounter filtered through their permissions and workflow needs." },
    { num: "05", title: "Timeline as Narrative", desc: "Every clinically meaningful event is captured chronologically. The timeline becomes a complete, auditable clinical narrative." },
    { num: "06", title: "Collaborative by Design", desc: "Orders flow automatically to the right department. Results return to the encounter. Communication is embedded, auditable, and structured." },
  ];

  const standards = [
    { name: "HL7 FHIR", desc: "Primary data exchange standard", tag: "Interop" },
    { name: "SNOMED CT", desc: "Clinical terminology", tag: "Terminology" },
    { name: "ICD-10/11", desc: "Diagnosis coding", tag: "Coding" },
    { name: "LOINC", desc: "Lab test identification", tag: "Lab" },
    { name: "DICOM", desc: "Medical imaging standard", tag: "Imaging" },
    { name: "RxNorm", desc: "Medication coding", tag: "Pharmacy" },
  ];

  const wardBeds = [
    { num: 1, name: "Mary A.", age: 45, dx: "Community Acquired Pneumonia", status: "reviewed", pills: [{ label: "Better", cls: "green" }] },
    { num: 2, name: "John K.", age: 62, dx: "Diabetic Ketoacidosis", status: "pending", pills: [{ label: "ICU", cls: "red" }, { label: "Insulin", cls: "amber" }] },
    { num: 3, name: "Grace M.", age: 28, dx: "Severe Malaria", status: "pending", pills: [{ label: "Hb 6.8", cls: "red" }, { label: "Transfuse", cls: "amber" }] },
    { num: 4, name: "Peter O.", age: 5, dx: "Dehydration", status: "reviewed", pills: [{ label: "Rehydrating", cls: "green" }] },
    { num: 5, name: "Sarah W.", age: 34, dx: "Appendicitis", status: "pending", pills: [{ label: "OR Today", cls: "amber" }] },
    { num: 6, name: "David N.", age: 58, dx: "Stroke", status: "reviewed", pills: [{ label: "Stable", cls: "green" }] },
  ];

  return (
    <>
      <style>{CONSTITUTION_CSS}</style>

      {/* Header */}
      <header className="cos-header">
        <div className="cos-logo">AMEXAN <span>v1.0</span></div>
        <nav className="cos-nav">
          <span className={`cos-nav-item ${activeSection === 'constitution' ? 'active' : ''}`} onClick={() => setActiveSection('constitution')}>Constitution</span>
          <span className={`cos-nav-item ${activeSection === 'engines' ? 'active' : ''}`} onClick={() => setActiveSection('engines')}>Engines</span>
          <span className={`cos-nav-item ${activeSection === 'roles' ? 'active' : ''}`} onClick={() => setActiveSection('roles')}>Roles</span>
          <span className={`cos-nav-item ${activeSection === 'wardround' ? 'active' : ''}`} onClick={() => setActiveSection('wardround')}>Ward Round</span>
          <span className="cos-nav-item" onClick={() => window.location.href = '/'}>Exit</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="cos-hero">
        <div className="cos-eyebrow"><span className="cos-eyebrow-dot" /> AMEXAN Constitutional Architecture</div>
        <h1 className="cos-h1">An Operating System<br/>for <em>Clinical Medicine</em></h1>
        <p className="cos-p">
          Not an EMR. A Clinical Operating System. One constitution, role-specific workspaces,
          universal knowledge, and encounter-centered design that scales across every specialty,
          every department, and every hospital.
        </p>
        <div className="cos-hero-tagline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Brain size={14} /> 18 Constitutional Layers · 5 Engines · 6 Roles · 6 Principles · International Standards
        </div>
      </section>

      {/* Constitution Flow */}
      <section className="cos-flow" id="constitution">
        <h2 className="cos-flow-title">The AMEXAN Constitution</h2>
        <p className="cos-flow-sub">18 layers from data capture to intelligence — each building on the last</p>
        
        <div className="constitution-chain">
          {constitution.map((step, i) => (
            <>
              <div key={i} className="constitution-step">
                <span className="step-icon">{step.icon}</span>
                {step.label}
              </div>
                  {i === 5 && (
                <div className="constitution-divider">
                  <span className="constitution-divider-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ArrowRight size={12} /> DATA CAPTURE TO INTELLIGENCE
                  </span>
                </div>
              )}
              {i < constitution.length - 1 && <div className="constitution-arrow">↓</div>}
            </>
          ))}
        </div>
      </section>

      {/* Engines */}
      <section className="cos-flow" id="engines">
        <h2 className="cos-flow-title">The Five Remaining Engines</h2>
        <p className="cos-flow-sub">Everything after Evidence Graph is intelligence — not data capture</p>
        <div className="engines">
          {engines.map((engine, i) => (
            <div key={i} className="engine-card">
              <div className="engine-num">{engine.num}</div>
              <div className="engine-title">{engine.title}</div>
              <div className="engine-desc">{engine.desc}</div>
              <div className="engine-items">
                {engine.tags.map((tag, j) => (
                  <span key={j} className="engine-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="cos-roles" id="roles">
        <h2 className="cos-flow-title">Role-Based Workspaces</h2>
        <p className="cos-flow-sub">One encounter. Different views. Each answering one question.</p>
        <div className="role-grid">
          {roles.map((role, i) => (
            <div key={i} className="role-card">
              <div className="role-icon">{role.icon}</div>
              <div className="role-name">{role.name}</div>
              <div className="role-answer">❝ {role.question} ❞</div>
              <div className="role-desc">{role.desc}</div>
              <div className="role-tasks">
                {role.tasks.map((task, j) => (
                  <span key={j} className="task-tag">{task}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ward Round Demo */}
      <section className="cos-flow" id="wardround">
        <h2 className="cos-flow-title">Ward Round Mode</h2>
        <p className="cos-flow-sub">Present. Review. Plan. Complete. Automatically next bed.</p>

        <div className="ward-round-preview">
          <div className="ward-round-header">
            <h3><Building size={18} /> Male Medical Ward — Ward Round</h3>
            <div className="ward-round-status">
              <span>{completedBeds.length} / {wardBeds.length} complete</span>
            </div>
          </div>
          <div className="ward-round-body">
            <div className="ward-progress">
              <div className="ward-progress-fill" style={{ width: `${(completedBeds.length / wardBeds.length) * 100}%` }} />
            </div>
            {wardBeds.map(bed => {
              const isDone = completedBeds.includes(bed.num);
              return (
                <div key={bed.num} className={`ward-bed-card ${isDone ? 'active' : ''}`}>
                  <div className="ward-bed-num">{bed.num}</div>
                  <div className="ward-bed-info">
                    <div className="ward-bed-name">{bed.name} · {bed.age}y</div>
                    <div className="ward-bed-dx">{bed.dx}</div>
                    <div className="ward-bed-meta">
                      {bed.pills.map((pill, j) => (
                        <span key={j} className={`ward-bed-pill ${pill.cls}`}>{pill.label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="ward-bed-actions">
                    {isDone ? (
                      <button className="ward-bed-btn done" onClick={() => toggleBed(bed.num)}>✓ Reviewed</button>
                    ) : (
                      <>
                        <button className="ward-bed-btn primary" onClick={() => toggleBed(bed.num)}>Present</button>
                        <button className="ward-bed-btn outline">Skip</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="principles">
        <div className="principles-inner">
          <h2 className="cos-flow-title" style={{color:'var(--sky-900)'}}>Constitutional Principles</h2>
          <p className="cos-flow-sub">The design decisions that prevent AMEXAN from becoming another complex EMR</p>
          <div className="principles-grid">
            {principles.map((p, i) => (
              <div key={i} className="principle-card">
                <div className="principle-num">{p.num}</div>
                <div className="principle-title">{p.title}</div>
                <div className="principle-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="standards">
        <h2 className="cos-flow-title">International Standards</h2>
        <p className="cos-flow-sub">Built on global healthcare interoperability standards, not proprietary formats</p>
        <div className="standards-grid">
          {standards.map((s, i) => (
            <div key={i} className="standard-card">
              <div className="standard-name">{s.name}</div>
              <div className="standard-desc">{s.desc}</div>
              <span className="standard-tag">{s.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="dash-preview">
        <h2>Ready to Experience the COS?</h2>
        <p>The Doctor Dashboard and Ward Round Mode are active. Walk through the constitution in practice.</p>
        <a href="/dashboard/doctor" className="dash-btn">
          <Stethoscope size={18} /> Enter Doctor Dashboard <ArrowRight size={18} />
        </a>
      </section>
    </>
  );
}