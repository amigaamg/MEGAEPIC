"use client";
import { useState, useEffect, useCallback } from "react";

import { FileText, Stethoscope, ChevronDown, ArrowDown, Building2, Thermometer, BookOpen, Search, FlaskConical, Droplets, Bug, Target, Pill, CheckCircle, Apple, Footprints, DoorOpen, Scan, Building, RefreshCw, Zap, Heart, Dna, BarChart3, ClipboardList, Scale, User, Activity } from 'lucide-react';

const COS_COMPREHENSIVE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sky-50:#f0f9ff; --sky-100:#e0f2fe; --sky-200:#bae6fd; --sky-300:#7dd3fc;
  --sky-400:#38bdf8; --sky-500:#0ea5e9; --sky-600:#0284c7; --sky-700:#0369a1;
  --sky-800:#075985; --sky-900:#0c4a6e;
  --white:#fff; --frost-50:#fafafa; --frost-100:#f5f5f5; --frost-200:#e5e5e5;
  --frost-300:#d4d4d4; --frost-400:#a3a3a3; --frost-500:#737373;
  --green:#10b981; --green-bg:#d1fae5; --green-text:#065f46;
  --amber:#f59e0b; --amber-bg:#fef3c7; --amber-text:#92400e;
  --red:#ef4444; --red-bg:#fee2e2; --red-text:#991b1b;
  --blue:#3b82f6; --blue-bg:#dbeafe; --blue-text:#1e40af;
  --purple:#8b5cf6; --purple-bg:#ede9fe; --purple-text:#5b21b6;
  --font:'Inter','IBM Plex Sans',sans-serif;
  --radius:12px; --radius-sm:8px; --radius-lg:20px;
  --shadow:0 1px 3px rgba(0,0,0,.04); --shadow-md:0 4px 16px rgba(0,0,0,.06);
  --shadow-lg:0 12px 40px rgba(0,0,0,.08);
}
body{font-family:var(--font);background:var(--white);color:#0f172a}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes flowDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

.cos-topbar{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--frost-200)}
.cos-topbar-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.cos-logo{font-size:20px;font-weight:800;color:var(--sky-700);display:flex;align-items:center;gap:8px}
.cos-logo span{font-size:10px;background:var(--sky-100);color:var(--sky-600);padding:2px 6px;border-radius:4px;font-weight:700}
.cos-nav{display:flex;gap:16px;align-items:center}
.cos-nav-item{font-size:13px;font-weight:600;color:var(--frost-500);cursor:pointer;text-decoration:none;transition:color .15s}
.cos-nav-item:hover{color:var(--sky-600)}
.cos-nav-item.active{color:var(--sky-700)}

.cos-hero{max-width:1200px;margin:80px auto 0;padding:60px 24px 40px;text-align:center}
.cos-h1{font-size:44px;font-weight:800;letter-spacing:-1.2px;color:var(--sky-900);line-height:1.1;margin-bottom:12px}
.cos-h1 em{color:var(--sky-500);font-style:normal}
.cos-p{font-size:16px;color:var(--frost-500);max-width:600px;margin:0 auto 24px;line-height:1.7}
.cos-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cos-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;cursor:pointer;border:none;font-family:var(--font);transition:all .15s}
.cos-btn.primary{background:var(--sky-500);color:var(--white)}
.cos-btn.primary:hover{background:var(--sky-600);transform:translateY(-2px)}
.cos-btn.outline{background:var(--white);border:2px solid var(--frost-200);color:#0f172a}
.cos-btn.outline:hover{border-color:var(--sky-300);transform:translateY(-2px)}
.cos-btn.purple{background:var(--purple);color:var(--white)}
.cos-btn.purple:hover{opacity:.9;transform:translateY(-2px)}

.section{max-width:1200px;margin:0 auto;padding:60px 24px}
.section-header{text-align:center;margin-bottom:36px}
.section-tag{display:inline-flex;align-items:center;gap:6px;background:var(--sky-50);border:1px solid var(--sky-200);padding:4px 14px;border-radius:100px;font-size:11px;font-weight:700;color:var(--sky-600);margin-bottom:12px}
.section-h2{font-size:28px;font-weight:800;color:var(--sky-800);margin-bottom:4px}
.section-sub{font-size:14px;color:var(--frost-400)}

/* Constitutional Chain */
.constitution-wrapper{display:flex;flex-direction:column;align-items:center;padding:20px 0}
.const-node{display:flex;align-items:center;gap:12px;padding:12px 24px;width:300px;border:2px solid var(--sky-200);border-radius:12px;font-size:14px;font-weight:700;color:var(--sky-700);background:var(--white);transition:all .2s;cursor:default;position:relative;z-index:2}
.const-node:hover{border-color:var(--sky-400);background:var(--sky-50);transform:scale(1.03)}
.const-node .icon{font-size:18px}
.const-arrow{color:var(--sky-300);font-size:12px;padding:3px 0;position:relative;z-index:2}
.const-divider{width:100%;max-width:360px;height:2px;background:var(--sky-100);margin:20px 0;position:relative}
.const-divider-label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--white);padding:4px 16px;border-radius:100px;font-size:11px;font-weight:700;color:var(--sky-600);border:1px solid var(--sky-200);white-space:nowrap}

/* Knowledge Graph visualization */
.kg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:24px}
.kg-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);padding:20px;transition:all .2s}
.kg-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md);transform:translateY(-2px)}
.kg-card-icon{font-size:28px;margin-bottom:8px}
.kg-card-title{font-size:16px;font-weight:700;color:var(--sky-800);margin-bottom:4px}
.kg-card-desc{font-size:12px;color:var(--frost-500);line-height:1.6}
.kg-card-items{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.kg-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;background:var(--sky-50);color:var(--sky-600);border:1px solid var(--sky-200)}

/* Engine cards */
.engine-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:16px}
.engine-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);padding:24px;transition:all .2s}
.engine-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md);transform:translateY(-2px)}
.engine-num{font-size:11px;font-weight:800;color:var(--sky-400);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.engine-title{font-size:18px;font-weight:700;color:var(--sky-800);margin-bottom:4px}
.engine-desc{font-size:12px;color:var(--frost-500);line-height:1.7;margin-bottom:10px}
.engine-inherits{padding:8px 12px;background:var(--sky-50);border:1px solid var(--sky-200);border-radius:8px;font-size:11px;font-weight:600;color:var(--sky-700);margin-bottom:8px;font-family:monospace}
.engine-children{display:flex;flex-wrap:wrap;gap:4px}
.engine-child{font-size:10px;padding:3px 8px;border-radius:4px;background:var(--frost-50);color:var(--frost-500);border:1px solid var(--frost-200)}

/* Role workspaces */
.role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
.role-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);padding:24px;transition:all .2s;text-decoration:none;color:inherit;display:block}
.role-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md);transform:translateY(-3px)}
.role-icon{font-size:32px;margin-bottom:8px}
.role-name{font-size:18px;font-weight:700;color:var(--sky-800)}
.role-question{font-size:12px;color:var(--sky-500);font-weight:600;font-style:italic;margin:4px 0 8px}
.role-desc{font-size:12px;color:var(--frost-500);line-height:1.7}
.role-flow{display:flex;align-items:center;gap:4px;margin-top:10px;flex-wrap:wrap;padding:8px 10px;background:var(--frost-50);border-radius:8px;font-size:10px;color:var(--frost-400)}
.role-flow span{font-weight:600;color:var(--sky-600)}

/* Data Flow Diagram */
.flow-diagram{padding:32px;background:var(--sky-50);border:1px solid var(--sky-200);border-radius:var(--radius-lg);margin-top:24px}
.flow-title{font-size:14px;font-weight:700;color:var(--sky-800);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.flow-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.flow-box{padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid}
.flow-box.data{background:var(--sky-50);border-color:var(--sky-300);color:var(--sky-700)}
.flow-box.relationship{background:var(--purple-bg);border-color:var(--purple);color:var(--purple-text)}
.flow-box.real{background:var(--green-bg);border-color:var(--green);color:var(--green-text)}
.flow-arrow{font-size:16px;color:var(--frost-400)}
.flow-label{font-size:10px;color:var(--frost-400);font-weight:600;text-transform:uppercase;letter-spacing:.5px}

/* Production Readiness */
.prod-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.prod-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius);padding:16px;text-align:center;transition:all .2s}
.prod-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md)}
.prod-card .pct{font-size:28px;font-weight:800;color:var(--sky-600);font-family:monospace}
.prod-card .lbl{font-size:11px;color:var(--frost-500);margin-top:4px}
.prod-card .bar{height:4px;border-radius:99px;background:var(--frost-100);margin-top:8px;overflow:hidden}
.prod-card .bar-fill{height:100%;border-radius:99px;background:var(--sky-500);transition:width .5s}

/* Ward Round Demo */
.ward-demo{background:var(--white);border:2px solid var(--sky-300);border-radius:var(--radius-lg);overflow:hidden;margin-top:24px}
.ward-demo-header{background:var(--sky-700);color:var(--white);padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
.ward-demo-header h3{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}
.ward-demo-header .live{font-size:11px;color:var(--sky-200);display:flex;align-items:center;gap:4px}
.ward-demo-live-dot{width:6px;height:6px;border-radius:50%;background:#34d399;animation:pulse-dot 1.5s infinite}
.ward-demo-progress{height:3px;background:var(--sky-600)}
.ward-demo-progress-fill{height:100%;background:#34d399;transition:width .5s}
.ward-demo-body{padding:16px}
.ward-demo-bed{display:flex;align-items:center;gap:12px;padding:8px 12px;border:1.5px solid var(--frost-200);border-radius:var(--radius-sm);margin-bottom:6px;cursor:pointer;transition:all .15s}
.ward-demo-bed:hover{border-color:var(--sky-300);background:var(--sky-50)}
.ward-demo-bed.done{opacity:.6}
.ward-demo-bed-num{width:28px;height:28px;border-radius:6px;background:var(--sky-100);color:var(--sky-700);font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ward-demo-bed.done .ward-demo-bed-num{background:var(--green-bg);color:var(--green-text)}
.ward-demo-bed-info{flex:1;font-size:12px}
.ward-demo-bed-info .name{font-weight:700}
.ward-demo-bed-info .meta{font-size:10px;color:var(--frost-500)}
.ward-demo-bed-action{font-size:10px;font-weight:700;padding:4px 12px;border-radius:5px;border:none;cursor:pointer;font-family:var(--font);transition:all .1s}
.ward-demo-bed-action.primary{background:var(--sky-500);color:var(--white)}
.ward-demo-bed-action.done{background:var(--green-bg);color:var(--green-text)}

/* Timeline */
.tl-section{padding:40px 24px;max-width:1200px;margin:0 auto}
.tl-flow{display:flex;gap:0;overflow-x:auto;padding:16px 0;margin-top:16px}
.tl-item{flex-shrink:0;width:120px;text-align:center;position:relative;padding:0 8px}
.tl-item:not(:last-child)::after{content:'→';position:absolute;right:-4px;top:24px;color:var(--sky-300);font-size:16px}
.tl-icon{width:40px;height:40px;border-radius:50%;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:16px}
.tl-icon.data{background:var(--sky-50);color:var(--sky-600);border:1px solid var(--sky-200)}
.tl-icon.intel{background:var(--sky-500);color:var(--white)}
.tl-icon.outcome{background:var(--green);color:var(--white)}
.tl-label{font-size:10px;font-weight:600;color:var(--frost-500)}
.tl-time{font-size:9px;color:var(--frost-400);margin-top:2px;font-family:monospace}

/*footer*/
.cos-footer{background:var(--sky-900);color:var(--white);padding:48px 24px;text-align:center}
.cos-footer h2{font-size:24px;font-weight:700;margin-bottom:8px}
.cos-footer p{color:var(--sky-200);font-size:14px;max-width:500px;margin:0 auto 24px}
.cos-footer-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
`;

export default function CosComprehensive() {
  const [activeSection, setActiveSection] = useState("constitution");
  const [completedBeds, setCompletedBeds] = useState<number[]>([1, 3, 5]);
  const wards = [
    { num: 1, name: "Mary A.", dx: "Community Acquired Pneumonia", pills: "Better · O₂", done: true },
    { num: 2, name: "John K.", dx: "Diabetic Ketoacidosis", pills: "ICU · Insulin", done: false },
    { num: 3, name: "Grace M.", dx: "Severe Malaria", pills: "Hb 6.8 · Transfuse", done: true },
    { num: 4, name: "Peter O.", dx: "Dehydration", pills: "Rehydrating", done: false },
    { num: 5, name: "David N.", dx: "Ischemic Stroke", pills: "Stable", done: true },
    { num: 6, name: "Sarah W.", dx: "Appendicitis", pills: "OR Today", done: false },
  ];

  const constitution = [
    "PATIENT", "ENCOUNTER", "HISTORY", "EXAMINATION", "INVESTIGATIONS",
    "EVIDENCE GRAPH",
    "CLINICAL REASONING", "ASSESSMENT", "DIAGNOSIS", "MANAGEMENT",
    "ORDERS", "MONITORING", "TIMELINE", "DOCUMENTATION",
    "DISPOSITION", "FOLLOW-UP", "LEARNING", "ANALYTICS"
  ];

  const timeline = [
    { icon: <User size={16} />, label: "Arrival", time: "08:01", type: "data" },
    { icon: <Thermometer size={16} />, label: "Vitals", time: "08:05", type: "data" },
    { icon: <BookOpen size={16} />, label: "History", time: "08:08", type: "data" },
    { icon: <Search size={16} />, label: "Examination", time: "08:25", type: "data" },
    { icon: <FlaskConical size={16} />, label: "Blood drawn", time: "08:40", type: "data" },
    { icon: <Droplets size={16} />, label: "Hb 6.8", time: "09:30", type: "intel" },
    { icon: <Bug size={16} />, label: "Malaria +", time: "09:45", type: "intel" },
    { icon: <Target size={16} />, label: "Diagnosis", time: "09:47", type: "intel" },
    { icon: <Pill size={16} />, label: "Artesunate", time: "09:49", type: "outcome" },
    { icon: <Droplets size={16} />, label: "Transfuse", time: "10:15", type: "outcome" },
    { icon: <CheckCircle size={16} />, label: "Fever ↓", time: "14:00", type: "outcome" },
    { icon: <Apple size={16} />, label: "Eating", time: "Day 2", type: "outcome" },
    { icon: <Footprints size={16} />, label: "Walking", time: "Day 3", type: "outcome" },
    { icon: <DoorOpen size={16} />, label: "Discharge", time: "Day 4", type: "outcome" },
  ];

  const roles = [
    {
      icon: <Stethoscope size={28} />, name: "Doctor",
      question: "What decisions must I make now?",
      desc: "Ward Round Mode presents patients bed-by-bed. Review, plan, complete — auto-updates notes, orders, and to-do. No navigation.",
      flow: "Ward Round → Present → Review → Plan → Complete → Next Bed",
      href: "/dashboard/cos-doctor"
    },
    {
      icon: <Stethoscope size={28} />, name: "Nurse",
      question: "What is due for this patient?",
      desc: "Task-oriented. Med round, vitals, fluids, escalations — patients appear in order of need. Never search.",
      flow: "Medication Round → Vitals → IV Fluids → Escalations → Documentation",
      href: "/dashboard/cos-nurse"
    },
    {
      icon: <FlaskConical size={28} />, name: "Laboratory",
      question: "Which samples need attention?",
      desc: "Specimen-based. Received → Processing → Verified → Released. Critical alerts auto-notify.",
      flow: "Receive → Process → Verify → Release → Alert Clinician",
      href: "#"
    },
    {
      icon: <Pill size={28} />, name: "Pharmacy",
      question: "Is this order safe?",
      desc: "Safety-first: interactions, allergies, stock, dispensing, admin tracking. Every order automatically checked.",
      flow: "Verify Order → Check Interactions → Allergies → Stock → Dispense → Administer",
      href: "#"
    },
    {
      icon: <Scan size={28} />, name: "Radiology",
      question: "What is the clinical question?",
      desc: "Requests include clinical question, not just study type. Supports meaningful reporting and prioritization.",
      flow: "Clinical Question → Prioritize → Acquire → Report → Critical Finding Alert",
      href: "#"
    },
    {
      icon: <Building size={28} />, name: "Administration",
      question: "How is the hospital running?",
      desc: "Real-time ops: census, throughput, bed occupancy, waiting times, resource allocation.",
      flow: "Live Census → Throughput → Bed Management → Discharge Planning → Reports",
      href: "#"
    },
  ];

  const engines = [
    {
      num: "ENGINE 1", title: "Universal Orders Engine (UOE)",
      desc: "Everything a clinician can order — one architecture for the entire hospital. Every order type inherits from a base Order node.",
      inherits: "Order → Type → Subtype → Detail",
      children: ["Medication", "Procedure", "Consultation", "Referral", "Diet", "Nursing", "Activity", "Monitoring", "Isolation", "Blood Products", "Imaging", "Therapy"]
    },
    {
      num: "ENGINE 2", title: "Monitoring Engine",
      desc: "Every problem creates intelligent monitoring. PROBLEM-driven, not disease-driven. Each monitoring has targets, alerts, and escalation rules.",
      inherits: "Problem → Monitoring Parameter → Target Range → Alert Threshold → Escalation",
      children: ["Urine Output", "GCS", "Hb", "CRT", "Pulse", "Weight", "I/O", "Pupils"]
    },
    {
      num: "ENGINE 3", title: "Clinical Timeline Engine",
      desc: "Everything becomes time. Every clinically meaningful event captured chronologically. Replayable, auditable.",
      inherits: "Event → Timestamp → Category → Description → Previous Event → Next Event",
      children: ["Arrival", "Vitals", "History", "Exam", "Lab", "Diagnosis", "Medication", "Discharge"]
    },
    {
      num: "ENGINE 4", title: "Documentation Engine",
      desc: "Every document is a VIEW of the same encounter. Choose the type, get the rendering. Never rewrite.",
      inherits: "Encounter Facts → Document Type → Template → Render",
      children: ["Admission", "Progress", "Discharge", "Transfer", "Referral", "Certificate", "Insurance"]
    },
    {
      num: "ENGINE 5", title: "Learning Engine",
      desc: "Every encounter becomes anonymous knowledge. The hospital learns, the AI learns, research automates.",
      inherits: "De-identified Encounter → Population Analysis → Pattern Recognition → Quality Improvement",
      children: ["Length of Stay", "Mortality", "Treatment Timing", "Complication Rates", "Best Practices"]
    },
  ];

  const knowledgeGraphNodes = [
    { icon: <Stethoscope size={24} />, title: "Diseases", desc: "Every disease is a node with ICD code, epidemiology, severity, and links to symptoms, drugs, guidelines.", tags: ["650+ Diseases", "ICD-10", "Acuity Tiered"] },
    { icon: <Thermometer size={24} />, title: "Symptoms & Signs", desc: "Linked to diseases via sensitivity and specificity. Every feature has a likelihood ratio.", tags: ["Sensitivity", "Specificity", "LR+/-"] },
    { icon: <Pill size={24} />, title: "Drug Knowledge", desc: "Not disease-bundled. Drug nodes contain mechanism, dose, interactions, alternatives, monitoring.", tags: ["Dose", "Interactions", "Renal/Liver"] },
    { icon: <ClipboardList size={24} />, title: "Guidelines", desc: "WHO, national, and local guidelines as objects. Eligibility → Criteria → Recommendations → Evidence.", tags: ["WHO", "Evidence-Based", "Versioned"] },
    { icon: <Scale size={24} />, title: "Clinical Scores", desc: "Reusable across diseases. GCS, CURB-65, Alvarado, APGAR — same structure.", tags: ["Inputs", "Calculation", "Interpretation"] },
    { icon: <BarChart3 size={24} />, title: "Reference Objects", desc: "Normal values by age, sex, pregnancy, altitude. Hb doesn't belong to malaria — it belongs to Reference.", tags: ["Age-Adjusted", "Pregnancy", "Evidence"] },
    { icon: <Dna size={24} />, title: "Anatomy", desc: "Body structures with parent-child relationships. Enables anatomical reasoning.", tags: ["System", "Function", "Pathologies"] },
    { icon: <Building2 size={24} />, title: "Procedures", desc: "Surgical and medical procedures with indications, steps, complications, recovery.", tags: ["Surgical", "Medical", "Recovery"] },
  ];

  const productionReadiness = [
    { pct: "100%", label: "Patient Engine" },
    { pct: "100%", label: "History Engine" },
    { pct: "100%", label: "Examination Engine" },
    { pct: "95%", label: "Documentation Engine" },
    { pct: "95%", label: "Evidence Engine" },
    { pct: "90%", label: "Reasoning Engine" },
    { pct: "90%", label: "Orders Engine" },
    { pct: "90%", label: "Monitoring Engine" },
    { pct: "90%", label: "Timeline Engine" },
    { pct: "40%", label: "Knowledge Graph" },
    { pct: "15%", label: "Drug Graph" },
    { pct: "20%", label: "Guidelines" },
    { pct: "15%", label: "Patterns" },
    { pct: "10%", label: "Learning Engine" },
    { pct: "5%", label: "Analytics" },
  ];

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <style>{COS_COMPREHENSIVE_CSS}</style>

      {/* Top Bar */}
      <header className="cos-topbar">
        <div className="cos-topbar-inner">
          <div className="cos-logo">AMEXAN <span>COS v1.0</span></div>
          <nav className="cos-nav">
            <span className="cos-nav-item" onClick={() => scrollTo("constitution")}>Constitution</span>
            <span className="cos-nav-item" onClick={() => scrollTo("knowledge")}>Knowledge Graph</span>
            <span className="cos-nav-item" onClick={() => scrollTo("engines")}>Engines</span>
            <span className="cos-nav-item" onClick={() => scrollTo("roles")}>Roles</span>
            <span className="cos-nav-item" onClick={() => scrollTo("demo")}>Ward Round</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="cos-hero" id="hero">
        <h1 className="cos-h1"><FileText size={36} style={{ display: 'inline', verticalAlign: 'middle', marginTop: -6 }} /> The AMEXAN Constitution</h1>
        <p className="cos-p">
          An Encounter-Centered Clinical Operating System. Not an EMR — an operating system for medicine.
          Universal, scalable, disease-agnostic. Every relationship in Neo4j. Every view role-specific.
          Every document generated, not written.
        </p>
        <div className="cos-actions">
          <a href="/dashboard/cos-doctor" className="cos-btn primary"><Stethoscope size={14} /> Enter COS Doctor →</a>
          <a href="/dashboard/cos-nurse" className="cos-btn outline"><Stethoscope size={14} /> Nurse Workspace →</a>
          <a href="/amexan-constitution" className="cos-btn outline"><FileText size={14} /> Full Constitution →</a>
        </div>
      </section>

      {/* Constitutional Architecture */}
      <section className="section" id="constitution">
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--sky-500)',display:'inline-block'}} /> Constitutional Architecture</div>
          <h2 className="section-h2">18 Layers — Data Capture → Intelligence</h2>
          <p className="section-sub">Everything before Evidence Graph is data. Everything after is intelligence. That separation is our most important architectural decision.</p>
        </div>

        <div className="constitution-wrapper">
          {constitution.map((layer, i) => (
            <>
              {i === 5 && (
                <div className="const-divider" style={{margin:'16px 0'}}>
                  <span className="const-divider-label"><ChevronDown size={12} /> DATA CAPTURE → INTELLIGENCE</span>
                </div>
              )}
              <div key={i} className="const-node" style={{width: i >= 5 && i <= 9 ? 320 : 280}}>
                <span style={{fontSize:14}}>{layer}</span>
              </div>
              {i < constitution.length - 1 && <div className="const-arrow"><ArrowDown size={12} /></div>}
            </>
          ))}
        </div>
      </section>

      {/* Knowledge Graph — THE UNIVERSAL KNOWLEDGE LAYER */}
      <section className="section" id="knowledge" style={{background:'var(--sky-50)',borderTop:'1px solid var(--sky-200)'}}>
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--purple)',display:'inline-block'}} /> Universal Knowledge Graph — Neo4j</div>
          <h2 className="section-h2">Everything is a Node. Relationship-Typed. Disease-Agnostic.</h2>
          <p className="section-sub">We replaced "disease JSON" with a Neo4j knowledge graph. Every symptom, sign, drug, guideline, score, anatomy, and reference is a first-class node with typed relationships.</p>
        </div>

        <div className="kg-grid">
          {knowledgeGraphNodes.map((node, i) => (
            <div key={i} className="kg-card">
              <div className="kg-card-icon">{node.icon}</div>
              <div className="kg-card-title">{node.title}</div>
              <div className="kg-card-desc">{node.desc}</div>
              <div className="kg-card-items">
                {node.tags.map((t, j) => (
                  <span key={j} className="kg-tag">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Data Flow Diagram */}
        <div className="flow-diagram" style={{marginTop:32}}>
          <div className="flow-title"><RefreshCw size={14} /> Data Flow: DiseaseNode → Neo4j → Evidence Graph → Clinical Reasoning</div>
          <div className="flow-row">
            <span className="flow-label">Knowledge</span>
            <span className="flow-box data">DiseaseNode (TS)</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box relationship">syncDiseaseNodeToGraph()</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box data">Neo4j (:Disease)—[:HAS_SYMPTOM]→(:Symptom)</span>
          </div>
          <div className="flow-row">
            <span className="flow-label">Encounter</span>
            <span className="flow-box data">addEvidence()</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box data">(:Encounter)—[:HAS_EVIDENCE]→(:Evidence)</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box relationship">getDifferentialFromEvidence()</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box real">Ranked Diagnoses</span>
          </div>
          <div className="flow-row">
            <span className="flow-label">Monitoring</span>
            <span className="flow-box data">addProblem()</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box data">createMonitoringFromProblem()</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box real">Auto-created monitoring params</span>
          </div>
          <div className="flow-row">
            <span className="flow-label">Orders</span>
            <span className="flow-box data">createOrder(type: 'imaging')</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box data">createImagingOrder()</span>
            <span className="flow-arrow">→</span>
            <span className="flow-box real">(:Imaging) with clinicalQuestion</span>
          </div>
        </div>

        <div style={{marginTop:20,display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
          <span style={{fontSize:11,color:'var(--frost-500)'}}><Zap size={11} /> Neo4j Constraints: </span>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Patient(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Encounter(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Disease(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Symptom(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Order(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Drug(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Guideline(id)</code>
          <code style={{fontSize:10,background:'var(--purple-bg)',color:'var(--purple-text)',padding:'3px 8px',borderRadius:4}}>Reference(id)</code>
        </div>
      </section>

      {/* Engines */}
      <section className="section" id="engines">
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}} /> The Five Remaining Engines</div>
          <h2 className="section-h2">Everything After Evidence Graph is Intelligence</h2>
          <p className="section-sub">These engines cannot be designed correctly until the preceding constitutional layers exist. They have a dependency order.</p>
        </div>
        <div className="engine-grid">
          {engines.map((engine, i) => (
            <div key={i} className="engine-card">
              <div className="engine-num">{engine.num}</div>
              <div className="engine-title">{engine.title}</div>
              <div className="engine-desc">{engine.desc}</div>
              <div className="engine-inherits">⫸ {engine.inherits}</div>
              <div className="engine-children">
                {engine.children.map((c, j) => (
                  <span key={j} className="engine-child">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="tl-flow" id="timeline">
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--sky-500)',display:'inline-block'}} /> Clinical Timeline Engine</div>
          <h2 className="section-h2">Every Event. Chronological. Replayable.</h2>
          <p className="section-sub">Imagine replaying the admission. Every event in order — from arrival to discharge. This is what the timeline engine enables.</p>
        </div>
        <div className="tl-flow">
          {timeline.map((item, i) => (
            <div key={i} className="tl-item">
              <div className={`tl-icon ${item.type}`}>{item.icon}</div>
              <div className="tl-label">{item.label}</div>
              <div className="tl-time">{item.time}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="section" id="roles" style={{background:'var(--sky-50)',borderTop:'1px solid var(--sky-200)'}}>
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--amber)',display:'inline-block'}} /> Role-Based Workspaces</div>
          <h2 className="section-h2">One Encounter. Different Views. One Question Each.</h2>
          <p className="section-sub">The data are shared. The workspaces differ. Every role sees the same encounter filtered through their workflow needs.</p>
        </div>
        <div className="role-grid">
          {roles.map((role, i) => (
            <a key={i} href={role.href} className="role-card">
              <div className="role-icon">{role.icon}</div>
              <div className="role-name">{role.name}</div>
              <div className="role-question">❝ {role.question} ❞</div>
              <div className="role-desc">{role.desc}</div>
              <div className="role-flow">
                {role.flow.split('→').map((step, j) => (
                  <span key={j}>{step}{j < role.flow.split('→').length - 1 ? ' →' : ''}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Ward Round Demo */}
      <section className="section" id="demo">
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}} /> Live Ward Round Demo</div>
          <h2 className="section-h2">Ward Round Mode in Action</h2>
          <p className="section-sub">Start Ward Round → Present → Review → Plan → Complete → Automatically Next Bed. No navigation. No duplicate documentation.</p>
        </div>

        <div className="ward-demo">
          <div className="ward-demo-header">
            <h3><Building2 size={14} /> Male Medical Ward — Ward Round</h3>
            <div className="live"><span className="ward-demo-live-dot" /> {completedBeds.length}/{wards.length} complete</div>
          </div>
          <div className="ward-demo-progress">
            <div className="ward-demo-progress-fill" style={{width:`${(completedBeds.length / wards.length) * 100}%`}} />
          </div>
          <div className="ward-demo-body">
            {wards.map(bed => (
              <div key={bed.num} className={`ward-demo-bed ${bed.done ? 'done' : ''}`} onClick={() => setCompletedBeds(prev => prev.includes(bed.num) ? prev.filter(b => b !== bed.num) : [...prev, bed.num])}>
                <div className="ward-demo-bed-num">{bed.num}</div>
                <div className="ward-demo-bed-info">
                  <div className="name">{bed.name}</div>
                  <div className="meta">{bed.pills} · {bed.done ? '✓ Reviewed' : 'Pending review'}</div>
                </div>
                <button className={`ward-demo-bed-action ${bed.done ? 'done' : 'primary'}`}>
                  {bed.done ? '✓ Done' : 'Review'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:16}}>
          <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/dashboard/cos-doctor" className="cos-btn primary"><Stethoscope size={14} /> Full Doctor Dashboard →</a>
            <a href="/dashboard/cos-nurse" className="cos-btn outline"><Stethoscope size={14} /> Nurse Dashboard →</a>
          </div>
        </div>
      </section>

      {/* Production Readiness */}
      <section className="section" style={{background:'var(--sky-50)',borderTop:'1px solid var(--sky-200)'}}>
        <div className="section-header">
          <div className="section-tag"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--purple)',display:'inline-block'}} /> MVP Readiness Estimate</div>
          <h2 className="section-h2">Production Status</h2>
          <p className="section-sub">The hardest problem is solved. The remaining work is knowledge population, not architecture.</p>
        </div>
        <div className="prod-grid">
          {productionReadiness.map((item, i) => (
            <div key={i} className="prod-card">
              <div className="pct">{item.pct}</div>
              <div className="lbl">{item.label}</div>
              <div className="bar">
                <div className="bar-fill" style={{width:item.pct}} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="cos-footer">
        <h2>AMEXAN — Clinical Operating System</h2>
        <p>
          Encounter-centered. Role-specific. Intelligence-driven.
          Neo4j-powered knowledge graph. International standards (HL7 FHIR, SNOMED CT, ICD, LOINC, DICOM).
          18 constitutional layers. 5 engines. Universal.
        </p>
        <div className="cos-footer-actions">
          <a href="/dashboard/cos-doctor" className="cos-btn primary"><Stethoscope size={14} /> Doctor →</a>
          <a href="/dashboard/cos-nurse" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><Stethoscope size={14} /> Nurse →</a>
          <a href="/dashboard/cos-lab" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><FlaskConical size={14} /> Lab →</a>
          <a href="/dashboard/cos-pharmacy" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><Pill size={14} /> Pharmacy →</a>
          <a href="/dashboard/cos-radiology" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><Scan size={14} /> Radiology →</a>
          <a href="/dashboard/cos-admin" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><Building size={14} /> Admin →</a>
          <a href="/cos-patient-portal" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><Heart size={14} /> Patient Portal →</a>
          <a href="/amexan-constitution" className="cos-btn outline" style={{background:'rgba(255,255,255,.15)',color:'#fff',borderColor:'rgba(255,255,255,.3)'}}><FileText size={14} /> Constitution →</a>
        </div>
      </footer>
    </>
  );
}