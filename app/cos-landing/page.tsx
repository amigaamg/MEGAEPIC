"use client";
import { useState } from "react";
import { ArrowRight, Brain, Stethoscope, Heart, Building, Users, Globe, GraduationCap, Shield, Activity, Microscope, BookOpen, FlaskConical, Scan, Pill, ClipboardList, FileText, Database, BarChart3, Lock, MapPin, Smartphone, UserCircle, Target, Rocket, Settings, Clock, RefreshCw, Headphones, Cloud, ChevronRight, Eye, WifiOff, Server, Cpu, Zap, Award, Share2, Star, Thermometer, Search, Bed, Droplets, ActivitySquare, AlertTriangle, Check, Video } from 'lucide-react'

const COS_LANDING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sky-50:#f0f7ff; --sky-100:#e0efff; --sky-200:#bfdcff; --sky-300:#93c5fd;
  --sky-400:#60a5fa; --sky-500:#2F80ED; --sky-600:#1c68d1; --sky-700:#1e4fa8;
  --sky-800:#1e3a8a; --sky-900:#172554;
  --white:#ffffff; --frost-50:#fafafa; --frost-100:#f5f5f5; --frost-200:#e5e5e5;
  --frost-300:#d4d4d4; --frost-400:#a3a3a3; --frost-500:#737373;
  --green:#10b981; --amber:#f59e0b; --red:#ef4444;
  --font:'Inter',sans-serif;
  --radius:12px; --radius-sm:8px; --radius-lg:24px;
  --shadow:0 1px 3px rgba(0,0,0,.04); --shadow-md:0 4px 16px rgba(0,0,0,.06);
  --shadow-lg:0 12px 48px rgba(0,0,0,.08);
}
body{font-family:var(--font);background:var(--white);color:#0f172a;-webkit-font-smoothing:antialiased;overflow-x:hidden}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}

.cos-top{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--frost-200)}
.cos-top-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.cos-logo{font-size:22px;font-weight:800;color:var(--sky-700);display:flex;align-items:center;gap:8px}
.cos-logo span{background:var(--sky-100);color:var(--sky-600);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700}
.cos-nav{display:flex;align-items:center;gap:16px}
.cos-nav a{font-size:13px;font-weight:600;color:var(--frost-500);text-decoration:none;transition:color .15s}
.cos-nav a:hover{color:var(--sky-600)}
.cos-nav-btn{font-size:13px;font-weight:700;padding:8px 18px;border-radius:8px;background:var(--sky-500);color:var(--white);text-decoration:none;transition:all .15s;display:flex;align-items:center;gap:6px}
.cos-nav-btn:hover{background:var(--sky-600)}

.cos-hero{max-width:1200px;margin:80px auto 0;padding:80px 24px 60px;text-align:center}
.cos-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--sky-50);border:1px solid var(--sky-200);padding:6px 16px;border-radius:100px;font-size:12px;font-weight:600;color:var(--sky-700);margin-bottom:24px}
.cos-dot{width:6px;height:6px;border-radius:50%;background:var(--sky-500);animation:pulse-dot 1.5s infinite}
.cos-h1{font-size:52px;font-weight:800;letter-spacing:-1.5px;color:var(--sky-900);line-height:1.08;margin-bottom:16px}
.cos-h1 em{color:var(--sky-500);font-style:normal}
.cos-p{font-size:18px;color:var(--frost-500);max-width:600px;margin:0 auto 32px;line-height:1.7}
.cos-hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cos-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:10px;background:var(--sky-500);color:var(--white);font-size:15px;font-weight:700;text-decoration:none;transition:all .15s;border:none;cursor:pointer;font-family:var(--font)}
.cos-btn-primary:hover{background:var(--sky-600);box-shadow:var(--shadow-md)}
.cos-btn-outline{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:10px;border:2px solid var(--frost-200);background:var(--white);color:#0f172a;font-size:15px;font-weight:600;text-decoration:none;transition:all .15s;cursor:pointer;font-family:var(--font)}
.cos-btn-outline:hover{border-color:var(--sky-300)}

.cos-roles{max-width:1200px;margin:0 auto;padding:40px 24px}
.cos-section-title{font-size:28px;font-weight:800;color:var(--sky-800);text-align:center;margin-bottom:4px}
.cos-section-sub{font-size:14px;color:var(--frost-400);text-align:center;margin-bottom:36px}
.role-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.role-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);padding:24px;transition:all .2s;cursor:default;text-decoration:none;color:inherit;display:block}
.role-card:hover{border-color:var(--sky-300);box-shadow:var(--shadow-md)}
.role-card-icon{color:var(--sky-500);margin-bottom:12px}
.role-card-name{font-size:18px;font-weight:700;color:var(--sky-800);margin-bottom:4px}
.role-card-answer{font-size:12px;color:var(--sky-500);font-weight:600;font-style:italic;margin-bottom:8px}
.role-card-desc{font-size:13px;color:var(--frost-500);line-height:1.7}
.role-card-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}
.role-card-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;background:var(--sky-50);color:var(--sky-600);border:1px solid var(--sky-200)}

.cos-previews{max-width:1200px;margin:0 auto;padding:60px 24px}
.preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:800px){.preview-grid{grid-template-columns:1fr}}
.preview-card{background:var(--white);border:1.5px solid var(--frost-200);border-radius:var(--radius-lg);overflow:hidden;transition:all .2s}
.preview-card:hover{box-shadow:var(--shadow-lg)}
.preview-header{background:var(--sky-700);color:var(--white);padding:14px 18px;display:flex;justify-content:space-between;align-items:center}
.preview-header h3{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}
.preview-body{padding:18px}
.preview-stat{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid var(--frost-100)}
.preview-stat span:last-child{font-weight:700;color:var(--sky-700)}
.preview-beds{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.preview-bed{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--frost-200);border-radius:6px;font-size:11px}
.preview-bed-num{width:22px;height:22px;border-radius:4px;background:var(--sky-100);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:9px;color:var(--sky-700);flex-shrink:0}
.preview-bed-info{flex:1;font-weight:500}
.preview-bed-status{font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px}
.preview-bed-status.amber{background:var(--amber);color:var(--white)}
.preview-bed-status.green{background:var(--green);color:var(--white)}
.preview-bed-status.red{background:var(--red);color:var(--white)}

.timeline-section{max-width:1200px;margin:0 auto;padding:60px 24px;background:var(--sky-50);border-top:1px solid var(--sky-200)}
.timeline-flow{display:flex;gap:0;margin-top:32px;overflow-x:auto;padding:12px 0}
.timeline-item{flex-shrink:0;width:130px;text-align:center;position:relative;padding:0 8px}
.timeline-item:not(:last-child)::after{content:'\u2192';position:absolute;right:-8px;top:28px;color:var(--sky-300);font-size:18px;font-weight:700}
.timeline-item-icon{width:48px;height:48px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center}
.timeline-item-icon.data{background:var(--sky-100);color:var(--sky-600)}
.timeline-item-icon.intel{background:var(--sky-500);color:var(--white)}
.timeline-item-icon.outcome{background:var(--green);color:var(--white)}
.timeline-item-label{font-size:11px;font-weight:600;color:var(--frost-500)}
.timeline-item-time{font-size:10px;color:var(--frost-400);margin-top:2px}

.cos-footer{background:var(--sky-900);color:var(--white);padding:48px 24px;text-align:center}
.cos-footer h3{font-size:22px;font-weight:700;margin-bottom:8px}
.cos-footer p{color:var(--sky-200);font-size:14px;max-width:480px;margin:0 auto 24px}
.cos-footer-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cos-footer-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;transition:all .15s}
.cos-footer-btn.white{background:var(--white);color:var(--sky-900)}
.cos-footer-btn.outline{border:1.5px solid rgba(255,255,255,.25);color:var(--white)}
.cos-footer-btn.outline:hover{background:rgba(255,255,255,.1)}
`;

export default function CosLanding() {
  const timeline = [
    { icon: <UserCircle size={20} />, label: "Patient Arrives", time: "08:01", type: "data" },
    { icon: <Thermometer size={20} />, label: "Vitals Taken", time: "08:05", type: "data" },
    { icon: <FileText size={20} />, label: "History Captured", time: "08:08", type: "data" },
    { icon: <Search size={20} />, label: "Examination", time: "08:25", type: "data" },
    { icon: <FlaskConical size={20} />, label: "Investigations", time: "08:40", type: "data" },
    { icon: <Share2 size={20} />, label: "Evidence Graph", time: "09:30", type: "intel" },
    { icon: <Brain size={20} />, label: "Clinical Reasoning", time: "09:45", type: "intel" },
    { icon: <Target size={20} />, label: "Diagnosis", time: "09:47", type: "intel" },
    { icon: <Pill size={20} />, label: "Treatment Ordered", time: "09:49", type: "outcome" },
    { icon: <Droplets size={20} />, label: "Transfusion", time: "10:15", type: "outcome" },
    { icon: <Activity size={20} />, label: "Recovery", time: "14:00", type: "outcome" },
    { icon: <Check size={20} />, label: "Discharge", time: "Day 4", type: "outcome" },
  ];

  const roles = [
    {
      icon: <Stethoscope size={32} />, name: "Doctor", answer: "What do I need to do now?",
      desc: "Ward round mode with bed-by-bed presentation. Review, decide, plan. One click updates notes, orders, and to-do lists.",
      tags: ["Ward Round", "One-Click Decisions", "Auto Documentation"]
    },
    {
      icon: <Heart size={32} />, name: "Nurse", answer: "What is due for this patient?",
      desc: "Task-oriented workflow. Patients appear in order of need — medication round, vitals, fluid balance, escalations.",
      tags: ["Medication Round", "Vitals", "Escalations"]
    },
    {
      icon: <FlaskConical size={32} />, name: "Laboratory", answer: "Which samples need attention?",
      desc: "Specimen-based workflow: Received, Processing, Verified, Released. Critical alerts auto-notify clinicians.",
      tags: ["Specimen Tracking", "QC", "Critical Alerts"]
    },
    {
      icon: <Pill size={32} />, name: "Pharmacy", answer: "Is this order safe?",
      desc: "Safety-first: interactions, allergies, stock, dispensing, administration tracking. Every order undergoes automated checks.",
      tags: ["Verify", "Interactions", "Dispense"]
    },
    {
      icon: <Scan size={32} />, name: "Radiology", answer: "What is the clinical question?",
      desc: "Requests include the clinical question, not just the study. Supports meaningful reporting and prioritization.",
      tags: ["Clinical Question", "Prioritize", "Report"]
    },
    {
      icon: <Building size={32} />, name: "Administration", answer: "How is the hospital running?",
      desc: "Real-time operational dashboard showing census, throughput, bed occupancy, waiting times. Every decision supported by live data.",
      tags: ["Census", "Throughput", "Reports"]
    },
  ];

  return (
    <>
      <style>{COS_LANDING_CSS}</style>

      <header className="cos-top">
        <div className="cos-top-inner">
          <div className="cos-logo">AMEXAN <span>COS</span></div>
          <nav className="cos-nav">
            <a href="#roles">Roles</a>
            <a href="#previews">Dashboards</a>
            <a href="#timeline">Timeline</a>
            <a href="/amexan-constitution" className="cos-nav-btn"><FileText size={14} /> Constitution</a>
          </nav>
        </div>
      </header>

      <section className="cos-hero">
        <div className="cos-eyebrow"><span className="cos-dot" /> Clinical Operating System v1.0</div>
        <h1 className="cos-h1">Not an EMR.<br/>An Operating System for <em>Clinical Medicine</em>.</h1>
        <p className="cos-p">
          One encounter-centered architecture. Role-specific workspaces. Ward round mode.
          Universal orders. Intelligent monitoring. International standards.
        </p>
        <div className="cos-hero-actions">
          <a href="/dashboard/cos-doctor" className="cos-btn-primary"><Stethoscope size={16} /> Doctor Dashboard</a>
          <a href="/dashboard/cos-nurse" className="cos-btn-outline"><Heart size={16} /> Nurse</a>
          <a href="/dashboard/cos-lab" className="cos-btn-outline"><FlaskConical size={16} /> Lab</a>
          <a href="/dashboard/cos-pharmacy" className="cos-btn-outline"><Pill size={16} /> Pharmacy</a>
          <a href="/dashboard/cos-radiology" className="cos-btn-outline"><Scan size={16} /> Radiology</a>
          <a href="/dashboard/cos-admin" className="cos-btn-outline"><Building size={16} /> Admin</a>
          <a href="/cos-patient-portal" className="cos-btn-outline"><UserCircle size={16} /> Portal</a>
          <a href="/amexan-constitution" className="cos-btn-outline"><FileText size={16} /> Constitution</a>
        </div>
      </section>

      <section className="cos-roles" id="roles">
        <h2 className="cos-section-title">Role-Based Workspaces</h2>
        <p className="cos-section-sub">One encounter. Different views. Each answering one question.</p>
        <div className="role-cards">
          {roles.map((r, i) => (
            <a key={i} href={r.name === "Doctor" ? "/dashboard/cos-doctor" : r.name === "Nurse" ? "/dashboard/cos-nurse" : r.name === "Laboratory" ? "/dashboard/cos-lab" : r.name === "Pharmacy" ? "/dashboard/cos-pharmacy" : r.name === "Radiology" ? "/dashboard/cos-radiology" : r.name === "Administration" ? "/dashboard/cos-admin" : "#"} className="role-card">
              <div className="role-card-icon">{r.icon}</div>
              <div className="role-card-name">{r.name}</div>
              <div className="role-card-answer">{r.answer}</div>
              <div className="role-card-desc">{r.desc}</div>
              <div className="role-card-tags">
                {r.tags.map((t, j) => (
                  <span key={j} className="role-card-tag">{t}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="cos-previews" id="previews">
        <h2 className="cos-section-title">Live Dashboards</h2>
        <p className="cos-section-sub">Experience the COS in action</p>
        <div className="preview-grid">
          <a href="/dashboard/cos-doctor" className="preview-card" style={{textDecoration:'none',color:'inherit'}}>
            <div className="preview-header">
              <h3><Stethoscope size={14} /> Doctor Ward Round Mode</h3>
              <span style={{fontSize:11,color:'rgba(255,255,255,.7)'}}>Active</span>
            </div>
            <div className="preview-body">
              <div className="preview-stat"><span>Patients</span><span>8</span></div>
              <div className="preview-stat"><span>New Admissions</span><span>3</span></div>
              <div className="preview-stat"><span>Critical</span><span>2</span></div>
              <div className="preview-stat"><span>Ready Discharge</span><span>4</span></div>
              <div className="preview-beds">
                {[
                  { num: 1, name: "Mary A.", status: "Reviewed", cls: "green" },
                  { num: 3, name: "Grace M.", status: "Critical", cls: "red" },
                  { num: 2, name: "John K.", status: "ICU Step-up", cls: "amber" },
                ].map((b, i) => (
                  <div key={i} className="preview-bed">
                    <div className="preview-bed-num">{b.num}</div>
                    <div className="preview-bed-info">{b.name}</div>
                    <div className={`preview-bed-status ${b.cls}`}>{b.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </a>

          <a href="/dashboard/cos-nurse" className="preview-card" style={{textDecoration:'none',color:'inherit'}}>
            <div className="preview-header">
              <h3><Heart size={14} /> Nurse Task Center</h3>
              <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>8:30 AM</span>
            </div>
            <div className="preview-body">
              <div className="preview-stat"><span>Medications Due</span><span>12</span></div>
              <div className="preview-stat"><span>IV Fluids</span><span>3</span></div>
              <div className="preview-stat"><span>Vitals Due</span><span>8</span></div>
              <div className="preview-stat"><span>Escalations</span><span>2</span></div>
              <div className="preview-beds">
                {[
                  { num: 3, name: "Grace M.", status: "Artesunate", cls: "red" },
                  { num: 1, name: "Mary A.", status: "Ceftriaxone", cls: "amber" },
                  { num: 4, name: "Peter O.", status: "IV Fluids", cls: "green" },
                ].map((b, i) => (
                  <div key={i} className="preview-bed">
                    <div className="preview-bed-num">{b.num}</div>
                    <div className="preview-bed-info">{b.name}</div>
                    <div className={`preview-bed-status ${b.cls}`}>{b.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </a>
        </div>
      </section>

      <section className="timeline-section" id="timeline">
        <h2 className="cos-section-title">The Clinical Timeline</h2>
        <p className="cos-section-sub">Every event. Chronological. Replayable. Auditable.</p>
        <div className="timeline-flow">
          {timeline.map((t, i) => (
            <div key={i} className="timeline-item">
              <div className={`timeline-item-icon ${t.type}`}>{t.icon}</div>
              <div className="timeline-item-label">{t.label}</div>
              <div className="timeline-item-time">{t.time}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="cos-footer">
        <h3>AMEXAN Clinical Operating System</h3>
        <p>Encounter-centered, role-specific, intelligence-driven. Built on international standards and constitutional architecture.</p>
        <div className="cos-footer-actions">
          <a href="/dashboard/cos-doctor" className="cos-footer-btn white"><Stethoscope size={14} /> Doctor</a>
          <a href="/dashboard/cos-nurse" className="cos-footer-btn white"><Heart size={14} /> Nurse</a>
          <a href="/dashboard/cos-lab" className="cos-footer-btn white"><FlaskConical size={14} /> Lab</a>
          <a href="/dashboard/cos-pharmacy" className="cos-footer-btn white"><Pill size={14} /> Pharmacy</a>
          <a href="/dashboard/cos-radiology" className="cos-footer-btn white"><Scan size={14} /> Radiology</a>
          <a href="/dashboard/cos-admin" className="cos-footer-btn white"><Building size={14} /> Admin</a>
          <a href="/cos-patient-portal" className="cos-footer-btn outline"><UserCircle size={14} /> Patient Portal</a>
          <a href="/amexan-constitution" className="cos-footer-btn outline"><FileText size={14} /> Constitution</a>
        </div>
      </footer>
    </>
  );
}
