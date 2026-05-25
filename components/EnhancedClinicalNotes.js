
// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN — ENHANCED CLINICAL NOTES ENGINE  v3.0
// ═══════════════════════════════════════════════════════════════════════════
// Covers:
//   • Note Type Router (initial_clerking, progress, ward_round, discharge,
//     procedure, consultation, transfer/ISBAR, referral, clinic_followup,
//     nursing_note, pre_op, post_op, icu_review)
//   • Ward Round Mode   — Day N fast entry, quick-phrases, auto-pull
//   • Progress Engine   — SOAP/SOAPIER/Narrative + inline lab/vitals attach
//   • Discharge Engine  — auto-compile from admission timeline
//   • ISBAR Engine      — structured transfer/referral notes
//   • Clinic Engine     — outpatient continuity + chronic care tracking
//   • PDF Renderer      — jsPDF-based, continuous-sheet style
//   • Firestore schema  — inpatient_episodes / outpatient_episodes /
//                         patient_timeline / pdf_archives / clinical_notes
// ═══════════════════════════════════════════════════════════════════════════
"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, limit, getDocs,
} from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM (mirrors ClinicalWorkspace DS exactly)
// ─────────────────────────────────────────────────────────────────────────────
const DS = {
  navy:       "#05101f",
  navyMid:    "#0d1f38",
  navyCard:   "#111d30",
  navyBorder: "#1e3352",
  teal:       "#06b6d4",
  tealDim:    "rgba(6,182,212,.12)",
  tealGlow:   "rgba(6,182,212,.25)",
  amber:      "#f59e0b",
  amberDim:   "rgba(245,158,11,.12)",
  red:        "#ef4444",
  redDim:     "rgba(239,68,68,.12)",
  green:      "#10b981",
  greenDim:   "rgba(16,185,129,.12)",
  indigo:     "#818cf8",
  indigoDim:  "rgba(129,140,248,.12)",
  purple:     "#a78bfa",
  purpleDim:  "rgba(167,139,250,.12)",
  white:      "#f0f6ff",
  muted:      "#8498b6",
  fontHead:   "'Syne','Outfit',sans-serif",
  fontBody:   "'Plus Jakarta Sans','DM Sans',sans-serif",
  fontMono:   "'IBM Plex Mono','JetBrains Mono',monospace",
  shadowSm:   "0 2px 8px rgba(0,0,0,.25)",
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTE TYPE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const NOTE_REGISTRY = [
  // ── INPATIENT ──────────────────────────────────────────────────────────────
  { id:"initial_clerking",   label:"Initial Clerking",       icon:"📋", group:"Inpatient", color:DS.teal,
    engine:"HISTORY",   description:"Full structured admission history & examination" },
  { id:"progress_note",      label:"Progress Note",          icon:"✍",  group:"Inpatient", color:DS.indigo,
    engine:"SOAP",      description:"SOAP / SOAPIER / Narrative progress documentation" },
  { id:"ward_round",         label:"Ward Round",             icon:"🏃", group:"Inpatient", color:DS.amber,
    engine:"WARD",      description:"Fast ward round entry — Day N flowsheet" },
  { id:"discharge_summary",  label:"Discharge Summary",      icon:"🚪", group:"Inpatient", color:DS.green,
    engine:"DISCHARGE", description:"Auto-compiled from admission timeline" },
  { id:"procedure_note",     label:"Procedure Note",         icon:"🔧", group:"Inpatient", color:DS.purple,
    engine:"PROCEDURE", description:"Structured procedural checklist with consent" },
  { id:"pre_op_note",        label:"Pre-Op Note",            icon:"✅", group:"Inpatient", color:DS.amber,
    engine:"SOAP",      description:"Pre-operative assessment and consent" },
  { id:"post_op_note",       label:"Post-Op Note",           icon:"🩹", group:"Inpatient", color:DS.amber,
    engine:"SOAP",      description:"Post-operative review and orders" },
  { id:"consultation_note",  label:"Consultation Note",      icon:"🤝", group:"Inpatient", color:DS.indigo,
    engine:"SOAP",      description:"Specialist consultation response" },
  { id:"transfer_note",      label:"Transfer / ISBAR",       icon:"🚑", group:"Inpatient", color:DS.red,
    engine:"ISBAR",     description:"Structured ISBAR handover and transfer documentation" },
  { id:"referral_note",      label:"Referral Note",          icon:"📨", group:"Inpatient", color:DS.teal,
    engine:"REFERRAL",  description:"Referral letter with summary and specific request" },
  { id:"icu_review",         label:"ICU Review",             icon:"🫀", group:"Inpatient", color:DS.red,
    engine:"ICU",       description:"Intensive care unit daily review" },
  { id:"nursing_note",       label:"Nursing Note",           icon:"👩‍⚕️", group:"Inpatient", color:DS.green,
    engine:"NURSING",   description:"Nursing assessment and care note" },
  { id:"mdt_review",         label:"MDT Review",             icon:"👥", group:"Inpatient", color:DS.purple,
    engine:"MDT",       description:"Multidisciplinary team review summary" },
  // ── OUTPATIENT ─────────────────────────────────────────────────────────────
  { id:"new_clinic_visit",   label:"New Clinic Visit",       icon:"🆕", group:"Outpatient", color:DS.teal,
    engine:"CLINIC",    description:"New outpatient presentation — full history" },
  { id:"clinic_followup",    label:"Clinic Follow-up",       icon:"🔄", group:"Outpatient", color:DS.indigo,
    engine:"CLINIC_FU", description:"Continuity follow-up with last-visit recall" },
  { id:"chronic_care_review",label:"Chronic Care Review",    icon:"📈", group:"Outpatient", color:DS.green,
    engine:"CHRONIC",   description:"DM / HTN / Asthma / HIV / TB / Epilepsy management" },
  { id:"telemedicine_note",  label:"Telemedicine Note",      icon:"💻", group:"Outpatient", color:DS.purple,
    engine:"CLINIC",    description:"Remote consultation documentation" },
  // ── SPECIALTY ──────────────────────────────────────────────────────────────
  { id:"antenatal_review",   label:"Antenatal Review",       icon:"🤰", group:"Specialty",  color:"#f472b6",
    engine:"SOAP",      description:"Antenatal visit with EGA and risk assessment" },
  { id:"death_summary",      label:"Death Summary",          icon:"📜", group:"Specialty",  color:DS.muted,
    engine:"SOAP",      description:"Formal death documentation and cause of death" },
  { id:"morbidity_review",   label:"Morbidity / M&M",        icon:"📊", group:"Specialty",  color:DS.amber,
    engine:"SOAP",      description:"Morbidity and mortality review note" },
];

const SOAP_FIELDS = {
  S: { label:"S – Subjective",    hint:"Patient's complaints, symptoms, history as reported", rows:4 },
  O: { label:"O – Objective",     hint:"Examination findings, vitals, investigations, results", rows:4 },
  A: { label:"A – Assessment",    hint:"Impression, diagnosis, differentials, severity grading", rows:3 },
  P: { label:"P – Plan",          hint:"Investigations, treatment, referrals, counselling, follow-up", rows:4 },
  I: { label:"I – Implementation",hint:"Actions carried out during this encounter", rows:3 },
  E: { label:"E – Evaluation",    hint:"Response to treatment and changes observed", rows:3 },
  R: { label:"R – Revision",      hint:"Revised plan based on evaluation", rows:3 },
};

const QUICK_PHRASES = [
  "No acute events overnight.",
  "Patient hemodynamically stable.",
  "Afebrile — temperature settling.",
  "Tolerating oral feeds/fluids well.",
  "Passing stool — bowel sounds present.",
  "Improved respiratory distress.",
  "Plan to step down oxygen supplementation.",
  "For discharge if clinically stable tomorrow.",
  "Wound healing well — no signs of infection.",
  "Pain adequately controlled on current regimen.",
  "Family counselled regarding diagnosis and plan.",
  "Awaiting laboratory results before escalating.",
  "Reviewed with consultant — plan unchanged.",
  "Chest clear on auscultation today.",
  "Urine output adequate — diuresis maintained.",
];

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS (self-contained — no external imports needed)
// ─────────────────────────────────────────────────────────────────────────────
const inputBase = {
  background:"#0a1825", border:`1px solid ${DS.navyBorder}`,
  borderRadius:8, color:DS.white, fontFamily:DS.fontBody, fontSize:12,
  padding:"8px 11px", width:"100%", outline:"none", boxSizing:"border-box",
  transition:"border .15s",
};

function NCInput({ value, onChange, placeholder="", type="text", style={}, onFocus, onBlur, onKeyDown }) {
  return (
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputBase, ...style }}
      onFocus={e=>{ e.target.style.borderColor=DS.teal; e.target.style.boxShadow=`0 0 0 2px ${DS.tealGlow}`; onFocus?.(); }}
      onBlur={e=>{ e.target.style.borderColor=DS.navyBorder; e.target.style.boxShadow="none"; onBlur?.(); }}
      onKeyDown={onKeyDown}
    />
  );
}

function NCTextarea({ value, onChange, rows=4, placeholder="", style={} }) {
  return (
    <textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={rows}
      placeholder={placeholder}
      style={{ ...inputBase, resize:"vertical", lineHeight:1.7, minHeight:80, ...style }}
      onFocus={e=>{ e.target.style.borderColor=DS.teal; }}
      onBlur={e=>{ e.target.style.borderColor=DS.navyBorder; }}
    />
  );
}

function NCSelect({ value, onChange, options=[], style={} }) {
  return (
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{ ...inputBase, appearance:"none", ...style }}>
      {options.map(o => typeof o==="string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NCBtn({ children, onClick, variant="primary", size="md", disabled=false, style={} }) {
  const colors = {
    primary: { bg:DS.teal,   color:"#05101f" },
    ghost:   { bg:"transparent", color:DS.muted, border:`1px solid ${DS.navyBorder}` },
    danger:  { bg:DS.red,    color:"#fff" },
    success: { bg:DS.green,  color:"#05101f" },
    amber:   { bg:DS.amber,  color:"#05101f" },
    indigo:  { bg:DS.indigo, color:"#05101f" },
  };
  const sz = size==="sm" ? {padding:"4px 10px",fontSize:11}
           : size==="lg" ? {padding:"10px 22px",fontSize:14}
           :               {padding:"7px 16px", fontSize:12};
  const c = colors[variant]||colors.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:c.bg, color:c.color, border:c.border||"none",
      borderRadius:8, fontFamily:DS.fontBody, fontWeight:700,
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?.6:1,
      transition:"all .15s", display:"inline-flex", alignItems:"center", gap:5,
      ...sz, ...style,
    }}>{children}</button>
  );
}

function NCCard({ children, glow=false, warn=false, danger=false, style={} }) {
  return (
    <div style={{
      background:danger?"rgba(239,68,68,.05)":warn?"rgba(245,158,11,.04)":DS.navyCard,
      border:`1px solid ${glow?DS.teal:danger?"rgba(239,68,68,.35)":warn?DS.amberDim:DS.navyBorder}`,
      borderRadius:12, padding:14,
      boxShadow:glow?`0 0 0 1px ${DS.tealGlow},${DS.shadowSm}`:DS.shadowSm,
      ...style,
    }}>{children}</div>
  );
}

function NCLabel({ children, required, hint }) {
  return (
    <label style={{
      display:"block", fontSize:10, fontWeight:700, color:DS.muted,
      textTransform:"uppercase", letterSpacing:.6, marginBottom:5, fontFamily:DS.fontBody,
    }}>
      {children}
      {required && <span style={{color:DS.red,marginLeft:3}}>*</span>}
      {hint && <span style={{color:DS.muted,fontSize:9,fontWeight:400,marginLeft:6,textTransform:"none"}}>{hint}</span>}
    </label>
  );
}

function NCChip({ label, color=DS.teal, onRemove, size="md" }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:`${color}18`, color, border:`1px solid ${color}40`,
      borderRadius:99, padding:size==="sm"?"2px 7px":"3px 11px",
      fontSize:size==="sm"?10:11, fontWeight:700, fontFamily:DS.fontBody, whiteSpace:"nowrap",
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",
          color,fontSize:13,lineHeight:1,padding:0,marginLeft:1}}>×</button>
      )}
    </span>
  );
}

function NCBadge({ children, color=DS.teal }) {
  return (
    <span style={{
      background:`${color}22`, color, border:`1px solid ${color}40`,
      borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:700, fontFamily:DS.fontMono,
    }}>{children}</span>
  );
}

function SectionHdr({ icon, title, sub }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
        <span style={{fontSize:18}}>{icon}</span>
        <h2 style={{margin:0,fontSize:15,fontWeight:800,fontFamily:DS.fontHead,
          color:DS.white,letterSpacing:-.3}}>{title}</h2>
      </div>
      {sub && <p style={{margin:0,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>{sub}</p>}
    </div>
  );
}

function AlertBox({ type="teal", icon, children }) {
  const map = {
    teal:  [DS.tealDim,   DS.teal,   "rgba(6,182,212,.3)"],
    amber: [DS.amberDim,  DS.amber,  "rgba(245,158,11,.3)"],
    red:   [DS.redDim,    DS.red,    "rgba(239,68,68,.3)"],
    green: [DS.greenDim,  DS.green,  "rgba(16,185,129,.3)"],
    indigo:[DS.indigoDim, DS.indigo, "rgba(129,140,248,.3)"],
  };
  const [bg,fg,br] = map[type]||map.teal;
  return (
    <div style={{borderRadius:8,padding:"9px 13px",fontSize:12,fontWeight:600,marginBottom:10,
      display:"flex",alignItems:"flex-start",gap:8,background:bg,border:`1px solid ${br}`,color:fg}}>
      <span style={{fontSize:14,marginTop:1,flexShrink:0}}>{icon}</span>
      <div>{children}</div>
    </div>
  );
}

const fmtDt = ts => ts?.toDate
  ? ts.toDate().toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})
  : ts ? new Date(ts).toLocaleString("en-GB") : "—";
const fmtDate = ts => ts?.toDate
  ? ts.toDate().toLocaleDateString("en-GB",{dateStyle:"medium"})
  : ts ? new Date(ts).toLocaleDateString("en-GB") : "—";

// ─────────────────────────────────────────────────────────────────────────────
// PDF ENGINE — jsPDF-based continuous-sheet renderer
// ─────────────────────────────────────────────────────────────────────────────
async function generatePDF(noteData, patient, pdfType="single") {
  // Dynamically load jsPDF to avoid SSR issues
  let jsPDF;
  try {
    const mod = await import("jspdf");
    jsPDF = mod.default || mod.jsPDF;
  } catch {
    alert("PDF library not available. Install jspdf: npm install jspdf");
    return null;
  }

  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, ML = 15, MR = 195, LH = 6;
  let y = 15;

  const safeY = (needed=10) => {
    if (y + needed > 275) { doc.addPage(); y = 15; drawPageHeader(); }
  };

  const drawPageHeader = () => {
    doc.setFillColor(5,16,31);
    doc.rect(0,0,210,22,"F");
    doc.setTextColor(240,246,255);
    doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text("AMEXAN CLINICAL RECORD", ML, 10);
    doc.setFontSize(8); doc.setFont("helvetica","normal");
    doc.setTextColor(132,152,182);
    const hdr = [patient.name||"Unknown", patient.age?`${patient.age}y`:"", patient.gender||"",
                  patient.hospitalNumber?`#${patient.hospitalNumber}`:""].filter(Boolean).join(" · ");
    doc.text(hdr, ML, 16);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, MR, 10, {align:"right"});
    doc.setTextColor(6,182,212);
    doc.text(`AMEXAN EMR`, MR, 16, {align:"right"});
    y = 28;
    doc.setTextColor(30,51,82);
    doc.line(ML, y, MR, y); y += 4;
    doc.setTextColor(240,246,255);
  };

  const writeSection = (label, content, labelColor=[132,152,182]) => {
    if (!content) return;
    safeY(12);
    doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.setTextColor(...labelColor);
    doc.text(label.toUpperCase(), ML, y); y += 4;
    doc.setFont("helvetica","normal"); doc.setTextColor(240,246,255);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content, MR - ML - 5);
    lines.forEach(line => {
      safeY(LH);
      doc.text(line, ML + 3, y); y += LH;
    });
    y += 2;
  };

  const drawNoteBanner = (noteLabel, doctorName, timestamp, color=[6,182,212]) => {
    safeY(16);
    doc.setFillColor(...color, 0.15);
    doc.setDrawColor(...color);
    doc.setLineWidth(.3);
    doc.roundedRect(ML, y, MR - ML, 12, 2, 2, "FD");
    doc.setTextColor(...color);
    doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text(noteLabel, ML + 3, y + 5);
    doc.setFont("helvetica","normal"); doc.setFontSize(8);
    doc.setTextColor(132,152,182);
    doc.text(`${doctorName||""}  ·  ${timestamp||""}`, MR - 3, y + 5, {align:"right"});
    y += 16;
    doc.setTextColor(240,246,255);
  };

  const drawDivider = (color=[30,51,82]) => {
    safeY(6);
    doc.setDrawColor(...color);
    doc.setLineWidth(.3);
    doc.line(ML, y, MR, y); y += 4;
  };

  const drawSignatureBlock = (note) => {
    safeY(20);
    y += 4;
    drawDivider([6,182,212]);
    doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.setTextColor(6,182,212);
    doc.text("SIGNED BY", ML, y); y += 4;
    doc.setFont("helvetica","normal"); doc.setTextColor(240,246,255);
    doc.text(`${note.doctorName||""}  ·  ${note.designation||""}`, ML, y); y += 4;
    doc.setTextColor(132,152,182);
    doc.text(`Date/Time: ${fmtDt(note.createdAt)}`, ML, y);
    doc.text(`Note ID: ${note.id||""}`, MR, y, {align:"right"}); y += 8;
  };

  // ── Build the actual PDF ──
  drawPageHeader();

  // Patient header card
  doc.setFillColor(13,31,56);
  doc.roundedRect(ML, y, MR - ML, 22, 2, 2, "F");
  doc.setTextColor(240,246,255);
  doc.setFontSize(13); doc.setFont("helvetica","bold");
  doc.text(patient.name||"Unknown Patient", ML + 4, y + 7);
  doc.setFontSize(9); doc.setFont("helvetica","normal");
  doc.setTextColor(132,152,182);
  const patientLine = [
    patient.age?`Age: ${patient.age}y`:"",
    patient.gender||"",
    patient.bloodGroup?`Grp: ${patient.bloodGroup}`:"",
    patient.hospitalNumber?`IP No: ${patient.hospitalNumber}`:"",
    patient.ward?`Ward: ${patient.ward}`:"",
    patient.bed?`Bed: ${patient.bed}`:"",
  ].filter(Boolean).join("   ");
  doc.text(patientLine, ML + 4, y + 13);
  doc.setTextColor(245,158,11);
  if (patient.allergies?.length) {
    doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text(`⚠ ALLERGIES: ${patient.allergies.join(", ")}`, ML + 4, y + 19);
  }
  y += 28;

  // Notes content
  const notes = Array.isArray(noteData) ? noteData : [noteData];
  for (const note of notes) {
    const reg = NOTE_REGISTRY.find(r=>r.id===note.noteType)||{label:note.noteType||"Note"};
    const colorArr = hexToRgb(reg.color||"#06b6d4");

    drawNoteBanner(reg.label, note.doctorName, fmtDt(note.createdAt), colorArr);

    // Impressions
    if (note.impressions?.length) {
      safeY(8);
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(6,182,212);
      doc.text("IMPRESSION / DIAGNOSIS", ML, y); y += 4;
      doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(240,246,255);
      note.impressions.forEach((imp,i) => {
        safeY(6); doc.text(`${i+1}. ${imp}`, ML + 3, y); y += 5;
      });
      y += 2;
    }

    // Engine-specific content rendering
    const c = note.content||{};
    if (note.engine==="WARD" || note.noteType==="ward_round") {
      writeSection("Day Number",        c.dayNumber?`Day ${c.dayNumber}`:"");
      writeSection("Overnight Events",  c.overnight_events);
      writeSection("Symptoms Today",    c.symptoms_today);
      writeSection("Vitals",            c.vitals_summary);
      writeSection("Fluid Balance",     c.io_balance);
      writeSection("Examination Changes", c.exam_changes);
      writeSection("Labs Today",        c.labs_today);
      writeSection("Assessment",        c.assessment);
      writeSection("Plan",              c.plan);
    } else if (note.engine==="ISBAR" || note.noteType==="transfer_note") {
      writeSection("I – Identification",    c.identification,  [6,182,212]);
      writeSection("S – Situation",         c.situation,       [245,158,11]);
      writeSection("B – Background",        c.background,      [129,140,248]);
      writeSection("A – Assessment",        c.assessment,      [16,185,129]);
      writeSection("R – Recommendation",    c.recommendation,  [239,68,68]);
    } else if (note.engine==="DISCHARGE" || note.noteType==="discharge_summary") {
      writeSection("Admission Diagnosis",   c.admission_dx);
      writeSection("Final Diagnosis",       c.final_dx,        [6,182,212]);
      writeSection("Hospital Course",       c.hospital_course);
      writeSection("Investigations",        c.investigations_summary);
      writeSection("Procedures Done",       c.procedures);
      writeSection("Condition at Discharge",c.condition_at_discharge);
      writeSection("Discharge Medications", c.discharge_meds,  [16,185,129]);
      writeSection("Follow-up Plan",        c.followup_plan,   [245,158,11]);
      writeSection("Red Flag Symptoms",     c.red_flags,       [239,68,68]);
    } else if (note.engine==="PROCEDURE" || note.noteType==="procedure_note") {
      writeSection("Procedure",             c.procedure_name);
      writeSection("Indication",            c.indication);
      writeSection("Consent",               c.consent);
      writeSection("Technique",             c.technique);
      writeSection("Complications",         c.complications||"None");
      writeSection("Findings",              c.findings);
      writeSection("Post-Procedure Plan",   c.post_plan);
    } else if (note.engine==="CLINIC_FU" || note.engine==="CLINIC") {
      writeSection("Reason for Review",     c.reason_review);
      writeSection("Interval History",      c.interval_history);
      writeSection("Medication Adherence",  c.med_adherence);
      writeSection("Examination",           c.examination);
      writeSection("Investigations Since Last Visit", c.investigations);
      writeSection("Assessment",            c.assessment);
      writeSection("Plan",                  c.plan);
      writeSection("Next Review",           c.next_review);
    } else {
      // Default: SOAP/SOAPIER/Narrative
      if (note.format==="Narrative") {
        writeSection("Clinical Note", c);
      } else {
        const keys = note.format==="SOAPIER"
          ? ["S","O","A","P","I","E","R"]
          : ["S","O","A","P"];
        for (const k of keys) {
          if (c[k]) writeSection(SOAP_FIELDS[k]?.label||k, c[k]);
        }
      }
    }

    drawSignatureBlock(note);
    drawDivider([30,51,82]);
  }

  // Footer on last page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i=1; i<=totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(5,16,31);
    doc.rect(0,282,210,15,"F");
    doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.setTextColor(132,152,182);
    doc.text("AMEXAN EMR — Confidential Clinical Record — Unauthorized disclosure prohibited",
      105, 290, {align:"center"});
    doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, ML, 290);
    doc.text(`${i}/${totalPages}`, MR, 290, {align:"right"});
  }

  // Save
  const fname = `AMEXAN_${patient.name?.replace(/\s/g,"_")||"Patient"}_${Date.now()}.pdf`;
  doc.save(fname);
  return fname;
}

function hexToRgb(hex) {
  const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)] : [6,182,212];
}

// ─────────────────────────────────────────────────────────────────────────────
// PAST NOTES PANEL
// ─────────────────────────────────────────────────────────────────────────────
function PastNotesPane({ notes, viewing, onView, mode }) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");

  const groups = ["All","Inpatient","Outpatient","Specialty"];

  const filtered = useMemo(() => notes.filter(n => {
    const reg = NOTE_REGISTRY.find(r=>r.id===n.noteType);
    const matchGroup = filterGroup==="All" || reg?.group===filterGroup;
    const matchSearch = !search || n.noteType?.includes(search.toLowerCase())
      || n.doctorName?.toLowerCase().includes(search.toLowerCase())
      || n.impressions?.some(i=>i.toLowerCase().includes(search.toLowerCase()));
    return matchGroup && matchSearch;
  }), [notes, search, filterGroup]);

  return (
    <div style={{width:220,flexShrink:0,borderRight:`1px solid ${DS.navyBorder}`,
      overflowY:"auto",background:DS.navyMid,display:"flex",flexDirection:"column"}}>

      {/* Header */}
      <div style={{padding:"10px 10px 6px",borderBottom:`1px solid ${DS.navyBorder}`,flexShrink:0}}>
        <div style={{fontSize:9,fontWeight:800,color:DS.muted,textTransform:"uppercase",
          letterSpacing:1,fontFamily:DS.fontBody,marginBottom:6}}>Past Notes</div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search notes…"
          style={{...inputBase,fontSize:11,padding:"6px 9px",marginBottom:6}} />
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {groups.map(g => (
            <button key={g} onClick={()=>setFilterGroup(g)} style={{
              padding:"2px 7px",borderRadius:99,fontSize:9,fontWeight:700,cursor:"pointer",
              fontFamily:DS.fontBody,
              background:filterGroup===g?DS.teal:"transparent",
              color:filterGroup===g?"#05101f":DS.muted,
              border:`1px solid ${filterGroup===g?DS.teal:DS.navyBorder}`,
            }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div style={{flex:1,overflowY:"auto"}}>
        {filtered.length===0 && (
          <div style={{padding:14,fontSize:11,color:DS.muted,fontFamily:DS.fontBody,
            textAlign:"center",fontStyle:"italic"}}>No notes found.</div>
        )}
        {filtered.map(n => {
          const reg = NOTE_REGISTRY.find(r=>r.id===n.noteType)||{label:n.noteType,icon:"📋",color:DS.teal};
          const isV = viewing?.id===n.id;
          return (
            <div key={n.id} onClick={()=>onView(isV?null:n)}
              style={{
                padding:"10px 10px",borderBottom:`1px solid ${DS.navyBorder}`,
                cursor:"pointer",transition:"background .1s",
                background:isV?DS.tealDim:"transparent",
                borderLeft:`3px solid ${isV?reg.color:"transparent"}`,
              }}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <span style={{fontSize:13}}>{reg.icon}</span>
                <span style={{fontWeight:700,color:DS.white,fontFamily:DS.fontBody,
                  fontSize:11,flex:1}}>{reg.label}</span>
                <NCBadge color={reg.color}>{n.format||"SOAP"}</NCBadge>
              </div>
              <div style={{color:DS.muted,fontSize:10,fontFamily:DS.fontMono,marginBottom:3}}>
                {fmtDate(n.createdAt)}
              </div>
              <div style={{color:DS.muted,fontSize:10,fontFamily:DS.fontBody}}>
                {n.doctorName}
              </div>
              {n.impressions?.length>0 && (
                <div style={{marginTop:4,display:"flex",flexWrap:"wrap",gap:2}}>
                  {n.impressions.slice(0,2).map((imp,i)=>(
                    <NCChip key={i} label={imp} color={reg.color} size="sm" />
                  ))}
                  {n.impressions.length>2 &&
                    <NCChip label={`+${n.impressions.length-2}`} color={DS.muted} size="sm" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE VIEWER
// ─────────────────────────────────────────────────────────────────────────────
function NoteViewer({ note, onClose, onPDF }) {
  const reg = NOTE_REGISTRY.find(r=>r.id===note.noteType)||{label:note.noteType,icon:"📋",color:DS.teal};
  const c = note.content||{};

  const renderContent = () => {
    if (note.engine==="WARD" || note.noteType==="ward_round") {
      return [
        {k:"dayNumber",       label:"Day Number"},
        {k:"overnight_events",label:"Overnight Events"},
        {k:"symptoms_today",  label:"Symptoms Today"},
        {k:"vitals_summary",  label:"Vitals Summary"},
        {k:"io_balance",      label:"Fluid Balance / I&O"},
        {k:"exam_changes",    label:"Examination Changes"},
        {k:"labs_today",      label:"Labs Today"},
        {k:"assessment",      label:"Assessment"},
        {k:"plan",            label:"Plan"},
      ].filter(f=>c[f.k]).map(f => renderField(f.label, c[f.k]));
    }
    if (note.engine==="ISBAR" || note.noteType==="transfer_note") {
      return [
        {k:"identification",label:"I – Identification", color:DS.teal},
        {k:"situation",     label:"S – Situation",      color:DS.amber},
        {k:"background",    label:"B – Background",     color:DS.indigo},
        {k:"assessment",    label:"A – Assessment",     color:DS.green},
        {k:"recommendation",label:"R – Recommendation", color:DS.red},
      ].filter(f=>c[f.k]).map(f => renderField(f.label, c[f.k], f.color));
    }
    if (note.engine==="DISCHARGE" || note.noteType==="discharge_summary") {
      return [
        {k:"admission_dx",           label:"Admission Diagnosis"},
        {k:"final_dx",               label:"Final Diagnosis",          color:DS.teal},
        {k:"hospital_course",        label:"Hospital Course"},
        {k:"investigations_summary", label:"Investigations"},
        {k:"procedures",             label:"Procedures"},
        {k:"condition_at_discharge", label:"Condition at Discharge"},
        {k:"discharge_meds",         label:"Discharge Medications",    color:DS.green},
        {k:"followup_plan",          label:"Follow-up Plan",           color:DS.amber},
        {k:"red_flags",              label:"Red Flag Symptoms",        color:DS.red},
      ].filter(f=>c[f.k]).map(f => renderField(f.label, c[f.k], f.color));
    }
    if (note.format==="Narrative") {
      return [renderField("Clinical Note", c)];
    }
    const keys = note.format==="SOAPIER"
      ? ["S","O","A","P","I","E","R"] : ["S","O","A","P"];
    return keys.filter(k=>c[k]).map(k => renderField(SOAP_FIELDS[k]?.label||k, c[k]));
  };

  const renderField = (label, content, color=DS.muted) => (
    <div key={label} style={{marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",
        letterSpacing:.5,marginBottom:5,fontFamily:DS.fontBody}}>{label}</div>
      <NCCard>
        <p style={{margin:0,color:DS.white,fontSize:12,lineHeight:1.8,
          fontFamily:DS.fontBody,whiteSpace:"pre-wrap"}}>{content}</p>
      </NCCard>
    </div>
  );

  return (
    <div style={{height:"100%",overflowY:"auto",padding:16}}>
      {/* Viewer header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:20}}>{reg.icon}</span>
            <h2 style={{margin:0,fontSize:15,fontWeight:800,fontFamily:DS.fontHead,
              color:DS.white}}>{reg.label}</h2>
            <NCBadge color={reg.color}>{note.format||"SOAP"}</NCBadge>
          </div>
          <p style={{margin:0,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
            {fmtDt(note.createdAt)} · {note.doctorName} · {note.designation||""}
          </p>
        </div>
        <div style={{display:"flex",gap:6}}>
          <NCBtn size="sm" variant="ghost" onClick={()=>onPDF([note])}
            style={{borderColor:DS.teal,color:DS.teal}}>
            🖨 PDF
          </NCBtn>
          <NCBtn size="sm" variant="ghost" onClick={onClose}>✕ Close</NCBtn>
        </div>
      </div>

      {/* Impressions */}
      {note.impressions?.length>0 && (
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {note.impressions.map((imp,i)=>(
            <NCChip key={i} label={imp} color={reg.color} />
          ))}
        </div>
      )}

      {/* Content sections */}
      {renderContent()}

      {/* Signature block */}
      <div style={{
        background:DS.tealDim,border:`1px solid ${DS.teal}40`,
        borderRadius:8,padding:"10px 12px",marginTop:10,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        flexWrap:"wrap",gap:8,
      }}>
        <div>
          <div style={{fontSize:10,fontWeight:800,color:DS.teal,
            textTransform:"uppercase",letterSpacing:.5,marginBottom:2,fontFamily:DS.fontBody}}>
            Signed by
          </div>
          <div style={{fontSize:12,fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>
            {note.doctorName}
            {note.designation&&<span style={{color:DS.muted,fontWeight:400,marginLeft:6}}>
              {note.designation}
            </span>}
          </div>
        </div>
        <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono}}>
          {fmtDt(note.createdAt)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE TYPE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
function NoteTypeSelector({ selected, onSelect, mode }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState("All");
  const groups = ["All","Inpatient","Outpatient","Specialty"];

  const filtered = useMemo(() => NOTE_REGISTRY.filter(n =>
    group==="All" || n.group===group
  ), [group]);

  const current = NOTE_REGISTRY.find(r=>r.id===selected);

  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:"flex",alignItems:"center",gap:8,padding:"8px 14px",
        background:DS.navyMid,border:`1px solid ${current?.color||DS.navyBorder}`,
        borderRadius:8,cursor:"pointer",fontFamily:DS.fontBody,width:"100%",
      }}>
        <span style={{fontSize:16}}>{current?.icon||"📋"}</span>
        <span style={{fontSize:12,fontWeight:700,color:DS.white,flex:1,textAlign:"left"}}>
          {current?.label||"Select Note Type"}
        </span>
        <span style={{color:DS.muted,fontSize:12}}>{open?"▲":"▼"}</span>
      </button>

      {open && (
        <div style={{
          position:"absolute",top:"100%",left:0,right:0,zIndex:100,
          background:DS.navyCard,border:`1px solid ${DS.navyBorder}`,
          borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.5)",
          maxHeight:400,overflowY:"auto",marginTop:4,
        }}>
          <div style={{
            display:"flex",gap:3,padding:"8px 8px 4px",flexWrap:"wrap",
            borderBottom:`1px solid ${DS.navyBorder}`,position:"sticky",top:0,
            background:DS.navyCard,zIndex:1,
          }}>
            {groups.map(g => (
              <button key={g} onClick={()=>setGroup(g)} style={{
                padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,cursor:"pointer",
                fontFamily:DS.fontBody,
                background:group===g?DS.teal:"transparent",
                color:group===g?"#05101f":DS.muted,
                border:`1px solid ${group===g?DS.teal:DS.navyBorder}`,
              }}>{g}</button>
            ))}
          </div>
          {filtered.map(reg => (
            <div key={reg.id}
              onClick={()=>{ onSelect(reg.id); setOpen(false); }}
              style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                cursor:"pointer",borderBottom:`1px solid ${DS.navyBorder}40`,
                background:selected===reg.id?DS.tealDim:"transparent",
                transition:"background .1s",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=DS.tealDim}
              onMouseLeave={e=>e.currentTarget.style.background=selected===reg.id?DS.tealDim:"transparent"}
            >
              <span style={{
                width:32,height:32,borderRadius:8,flexShrink:0,
                background:`${reg.color}20`,border:`1px solid ${reg.color}40`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
              }}>{reg.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:DS.white,fontFamily:DS.fontBody,fontSize:12}}>
                  {reg.label}
                </div>
                <div style={{color:DS.muted,fontFamily:DS.fontBody,fontSize:10}}>
                  {reg.description}
                </div>
              </div>
              <NCBadge color={reg.color}>{reg.group}</NCBadge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOAP ENGINE
// ─────────────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED SOAP ENGINE – v5.0 (Timeline‑aware, auditable, beautiful)
// ═══════════════════════════════════════════════════════════════════════════
function StructuredSOAPEngine({
  note,
  setNote,
  format,
  setFormat,
  quickPhrases = [],
  patient,
  admissionData,
  previousNote,
  latestVitals,
  latestLabs,
  activeMeds,
  doctorName,
  doctorId,
  savedNoteId,    // if editing an existing note
}) {
  // We will manage own state for the structured fields.
  // The outer `note` (from parent) will be a structured object like:
  // {
  //   subjective: { symptoms: '', changes: '', concerns: '', functional: '', adherence: '' },
  //   objective: { vitalsTrend: '', generalExam: '', systemExam: '', investigations: '', imaging: '', microbiology: '', medAdmin: '', fluidBalance: '', monitoring: '' },
  //   assessment: { primary: '', differentials: '', reasoning: '', response: '', severity: '', problemList: [] },
  //   plan: { investigations: '', treatment: '', monitoring: '', consults: '', procedures: '', counselling: '', disposition: '' },
  //   implementation: '',
  //   evaluation: '',
  //   revision: '',
  //   _history: []   // array of { fieldPath, oldValue, newValue, user, timestamp }
  // }
  // We'll provide UI to edit each subsection.

  const [localNote, setLocalNote] = useState(() => {
    if (note && Object.keys(note).length) return note;
    return {
      subjective: { symptoms: '', changes: '', concerns: '', functional: '', adherence: '' },
      objective: { vitalsTrend: '', generalExam: '', systemExam: '', investigations: '', imaging: '', microbiology: '', medAdmin: '', fluidBalance: '', monitoring: '' },
      assessment: { primary: '', differentials: '', reasoning: '', response: '', severity: '', problemList: [] },
      plan: { investigations: '', treatment: '', monitoring: '', consults: '', procedures: '', counselling: '', disposition: '' },
      implementation: '',
      evaluation: '',
      revision: '',
      _history: [],
    };
  });

  const [showHistory, setShowHistory] = useState(false);

  // Helper to update a nested field and record history
  const updateField = useCallback((path, newValue) => {
    setLocalNote(prev => {
      const oldValue = path.split('.').reduce((o, k) => o?.[k], prev);
      if (oldValue === newValue) return prev;

      // Clone and update
      const updated = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let last = updated;
      for (let i = 0; i < parts.length - 1; i++) last = last[parts[i]];
      last[parts[parts.length-1]] = newValue;

      // Append history entry
      const historyEntry = {
        fieldPath: path,
        oldValue: String(oldValue ?? '').slice(0, 200),
        newValue: String(newValue).slice(0, 200),
        user: doctorName || doctorId,
        timestamp: new Date().toISOString(),
      };
      updated._history = [historyEntry, ...(updated._history || [])].slice(0, 50);

      // Also sync to parent if needed (so saving works)
      setNote(updated);
      return updated;
    });
  }, [doctorName, doctorId, setNote]);

  // Helper to add to a list (problemList)
  const addToList = (listPath, item) => {
    setLocalNote(prev => {
      const parts = listPath.split('.');
      let arr = parts.reduce((o, k) => o?.[k], prev);
      if (!Array.isArray(arr)) arr = [];
      const newArr = [...arr, item];
      const updated = JSON.parse(JSON.stringify(prev));
      let last = updated;
      for (let i = 0; i < parts.length - 1; i++) last = last[parts[i]];
      last[parts[parts.length-1]] = newArr;
      // record history as adding item
      const historyEntry = {
        fieldPath: `${listPath}.add`,
        oldValue: `added "${item}"`,
        newValue: item,
        user: doctorName || doctorId,
        timestamp: new Date().toISOString(),
      };
      updated._history = [historyEntry, ...(updated._history || [])];
      setNote(updated);
      return updated;
    });
  };

  const removeFromList = (listPath, index) => {
    setLocalNote(prev => {
      const parts = listPath.split('.');
      let arr = parts.reduce((o, k) => o?.[k], prev);
      if (!Array.isArray(arr)) return prev;
      const removed = arr[index];
      const newArr = arr.filter((_, i) => i !== index);
      const updated = JSON.parse(JSON.stringify(prev));
      let last = updated;
      for (let i = 0; i < parts.length - 1; i++) last = last[parts[i]];
      last[parts[parts.length-1]] = newArr;
      const historyEntry = {
        fieldPath: `${listPath}.remove`,
        oldValue: removed,
        newValue: '',
        user: doctorName || doctorId,
        timestamp: new Date().toISOString(),
      };
      updated._history = [historyEntry, ...(updated._history || [])];
      setNote(updated);
      return updated;
    });
  };

  // Render a collapsible card section
  const SectionCard = ({ title, icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <NCCard style={{ marginBottom: 16 }}>
        <div
          onClick={() => setOpen(!open)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: DS.white, fontFamily: DS.fontHead }}>{title}</h3>
          </div>
          <span style={{ color: DS.muted }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && <div style={{ marginTop: 14 }}>{children}</div>}
      </NCCard>
    );
  };

  // Small inline edit component for textareas
  const InlineEdit = ({ value, onChange, rows = 2, placeholder }) => (
    <NCTextarea value={value || ''} onChange={onChange} rows={rows} placeholder={placeholder} />
  );

  // Render the edit history modal
  const HistoryModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: DS.navyCard, border: `1px solid ${DS.navyBorder}`, borderRadius: 16,
        padding: 24, width: 700, maxWidth: '95vw', maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: DS.white, fontFamily: DS.fontHead }}>📝 Edit History</h3>
          <NCBtn variant="ghost" onClick={() => setShowHistory(false)}>✕ Close</NCBtn>
        </div>
        {localNote._history?.length === 0 && <p style={{ color: DS.muted }}>No changes recorded yet.</p>}
        {localNote._history?.map((entry, idx) => (
          <div key={idx} style={{
            borderBottom: `1px solid ${DS.navyBorder}`, padding: '10px 0', fontSize: 12,
          }}>
            <div style={{ color: DS.teal, fontWeight: 700 }}>{entry.user} · {new Date(entry.timestamp).toLocaleString()}</div>
            <div style={{ color: DS.white }}>Field: <span style={{ fontFamily: DS.fontMono }}>{entry.fieldPath}</span></div>
            <div style={{ color: DS.muted }}>From: {entry.oldValue || '—'}</div>
            <div style={{ color: DS.green }}>To: {entry.newValue || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Actual UI
  return (
    <div>
      {/* Top bar – format toggle + history button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {["SOAP","SOAPIER","Narrative"].map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              padding:"5px 14px", borderRadius:99, fontSize:11, fontWeight:700, cursor:"pointer",
              background: format === f ? DS.teal : "transparent",
              color: format === f ? "#05101f" : DS.muted,
              border: `1px solid ${format === f ? DS.teal : DS.navyBorder}`,
            }}>{f}</button>
          ))}
        </div>
        <NCBtn variant="ghost" onClick={() => setShowHistory(true)} size="sm" style={{ borderColor: DS.teal, color: DS.teal }}>
          📜 View Edit History ({localNote._history?.length || 0})
        </NCBtn>
      </div>

      {format === "Narrative" ? (
        <div>
          <NCLabel>Narrative Note (free text)</NCLabel>
          <NCTextarea value={typeof note === 'string' ? note : localNote.narrative || ''}
            onChange={v => setNote(typeof note === 'object' ? { ...localNote, narrative: v } : v)}
            rows={16} placeholder="Free-text clinical note…" />
        </div>
      ) : (
        <>
          {/* ── ENCOUNTER HEADER (auto-generated, non-editable but displayed) ── */}
          <NCCard glow style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
              <div><span style={{ color: DS.muted, fontSize: 10 }}>Date/Time</span><br /><strong>{new Date().toLocaleString()}</strong></div>
              <div><span style={{ color: DS.muted, fontSize: 10 }}>Encounter</span><br /><strong>{admissionData ? 'Inpatient' : 'Outpatient'}</strong></div>
              <div><span style={{ color: DS.muted, fontSize: 10 }}>Ward/Clinic</span><br /><strong>{admissionData?.ward || patient.ward || '—'}</strong></div>
              <div><span style={{ color: DS.muted, fontSize: 10 }}>Doctor</span><br /><strong>{doctorName}</strong></div>
              <div><span style={{ color: DS.muted, fontSize: 10 }}>Consultant</span><br /><strong>{patient.consultant || '—'}</strong></div>
              <div><span style={{ color: DS.muted, fontSize: 10 }}>Day of Admission</span><br /><strong>{admissionData ? Math.floor((new Date() - admissionData.admittedAt?.toDate()) / 86400000) + 1 : '—'}</strong></div>
            </div>
          </NCCard>

          {/* ── BIODATA SNAPSHOT & ACTIVE PROBLEMS ── */}
          <NCCard style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div><strong>{patient.name}</strong> · {patient.age}y · {patient.gender}</div>
                <div style={{ fontSize: 12, color: DS.muted }}>IP: {patient.hospitalNumber} | Allergies: {patient.allergies?.join(', ') || 'None'}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: DS.teal }}>Active Problems</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {localNote.assessment.problemList.map((p, i) => <NCChip key={i} label={p} color={DS.amber} size="sm" onRemove={() => removeFromList('assessment.problemList', i)} />)}
                  <NCBtn onClick={() => { const val = prompt('Add problem'); if (val) addToList('assessment.problemList', val); }} size="sm" variant="ghost">+ Add</NCBtn>
                </div>
              </div>
            </div>
          </NCCard>

          {/* ── TIMELINE CONTEXT (auto-pulled from previous note and vitals) ── */}
          <NCCard style={{ marginBottom: 16 }}>
            <SectionCard title="📅 Timeline Context" icon="⏱️" defaultOpen={false}>
              {previousNote && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: DS.indigo }}>Previous Note ({fmtDate(previousNote.createdAt)})</div>
                  <div style={{ fontSize: 12, color: DS.muted }}>A: {previousNote.content?.assessment?.primary || previousNote.impressions?.[0] || '—'}</div>
                  <div style={{ fontSize: 12, color: DS.muted }}>P: {previousNote.content?.plan?.treatment || (typeof previousNote.content === 'string' ? previousNote.content.slice(0, 100) : '—')}</div>
                </div>
              )}
              <div><strong>Latest Vitals</strong> {latestVitals && Object.entries(latestVitals).map(([k,v]) => `${k}: ${v}`).join(' · ')}</div>
              <div><strong>Latest Labs</strong> {latestLabs && Object.entries(latestLabs).slice(0,3).map(([k,v]) => `${k}: ${v}`).join(' · ')}</div>
            </SectionCard>
          </NCCard>

          {/* ── SUBJECTIVE (S) ── */}
          <SectionCard title="S – Subjective" icon="🗣️">
            <InlineEdit
              value={localNote.subjective.symptoms}
              onChange={v => updateField('subjective.symptoms', v)}
              rows={3} placeholder="Current symptoms (fever, pain, cough, vomiting, weakness, breathlessness…)" />
            <div style={{ marginTop: 8 }}><InlineEdit
              value={localNote.subjective.changes}
              onChange={v => updateField('subjective.changes', v)}
              rows={2} placeholder="Change since last review (Improved / Worsening / Unchanged / New symptoms)" /></div>
            <div style={{ marginTop: 8 }}><InlineEdit
              value={localNote.subjective.concerns}
              onChange={v => updateField('subjective.concerns', v)}
              rows={2} placeholder="Patient/family concerns" /></div>
            <div style={{ marginTop: 8 }}><InlineEdit
              value={localNote.subjective.functional}
              onChange={v => updateField('subjective.functional', v)}
              rows={2} placeholder="Functional status (walking, feeding, sleeping, stool, urine)" /></div>
            <div style={{ marginTop: 8 }}><InlineEdit
              value={localNote.subjective.adherence}
              onChange={v => updateField('subjective.adherence', v)}
              rows={2} placeholder="Medication adherence / missed doses / side effects" /></div>
          </SectionCard>

          {/* ── OBJECTIVE (O) – Vitals + Exam + Investigations + etc. ── */}
          <SectionCard title="O – Objective" icon="🩺">
            <div><strong>Vitals & Trends</strong><InlineEdit
              value={localNote.objective.vitalsTrend}
              onChange={v => updateField('objective.vitalsTrend', v)}
              rows={2} placeholder="Temp, HR, RR, BP, SpO₂ with trends (e.g. 39.1→37.8)" /></div>
            <div style={{ marginTop: 8 }}><strong>General Exam</strong><InlineEdit
              value={localNote.objective.generalExam}
              onChange={v => updateField('objective.generalExam', v)}
              rows={2} placeholder="Ill-looking, hydration, pallor, jaundice, edema, cyanosis, distress, GCS" /></div>
            <div style={{ marginTop: 8 }}><strong>Systemic Exam</strong><InlineEdit
              value={localNote.objective.systemExam}
              onChange={v => updateField('objective.systemExam', v)}
              rows={3} placeholder="Chest / CVS / Abdomen / CNS – detailed IPPA findings" /></div>
            <div style={{ marginTop: 8 }}><strong>Investigations (timeline)</strong><InlineEdit
              value={localNote.objective.investigations}
              onChange={v => updateField('objective.investigations', v)}
              rows={3} placeholder="Date · Test · Result · Trend (↑/↓/→) · Interpretation" /></div>
            <div style={{ marginTop: 8 }}><strong>Imaging</strong><InlineEdit
              value={localNote.objective.imaging}
              onChange={v => updateField('objective.imaging', v)}
              rows={2} placeholder="CXR, CT, ultrasound findings" /></div>
            <div style={{ marginTop: 8 }}><strong>Microbiology</strong><InlineEdit
              value={localNote.objective.microbiology}
              onChange={v => updateField('objective.microbiology', v)}
              rows={2} placeholder="Cultures, PCR, sensitivities, pending" /></div>
            <div style={{ marginTop: 8 }}><strong>Medication Administration</strong><InlineEdit
              value={localNote.objective.medAdmin}
              onChange={v => updateField('objective.medAdmin', v)}
              rows={2} placeholder="Received / missed / refused doses, IV access issues" /></div>
            <div style={{ marginTop: 8 }}><strong>Fluid Balance</strong><InlineEdit
              value={localNote.objective.fluidBalance}
              onChange={v => updateField('objective.fluidBalance', v)}
              rows={2} placeholder="Input / Output / Balance (e.g. +500ml for 24h)" /></div>
            <div style={{ marginTop: 8 }}><strong>Monitoring</strong><InlineEdit
              value={localNote.objective.monitoring}
              onChange={v => updateField('objective.monitoring', v)}
              rows={2} placeholder="Neurological checks, blood sugars, seizure chart, drain output" /></div>
          </SectionCard>

          {/* ── ASSESSMENT (A) ── */}
          <SectionCard title="A – Assessment" icon="🧠">
            <div><strong>Primary Impression</strong><InlineEdit
              value={localNote.assessment.primary}
              onChange={v => updateField('assessment.primary', v)}
              rows={1} placeholder="Working diagnosis" /></div>
            <div style={{ marginTop: 8 }}><strong>Differentials</strong><InlineEdit
              value={localNote.assessment.differentials}
              onChange={v => updateField('assessment.differentials', v)}
              rows={2} placeholder="List alternative diagnoses" /></div>
            <div style={{ marginTop: 8 }}><strong>Clinical Reasoning</strong><InlineEdit
              value={localNote.assessment.reasoning}
              onChange={v => updateField('assessment.reasoning', v)}
              rows={2} placeholder="Why you think this – key evidence" /></div>
            <div style={{ marginTop: 8 }}><strong>Response to Treatment</strong><InlineEdit
              value={localNote.assessment.response}
              onChange={v => updateField('assessment.response', v)}
              rows={2} placeholder="Improving / worsening / unchanged" /></div>
            <div style={{ marginTop: 8 }}><strong>Severity Stratification</strong><InlineEdit
              value={localNote.assessment.severity}
              onChange={v => updateField('assessment.severity', v)}
              rows={1} placeholder="e.g. Severe, moderate, mild, septic shock" /></div>
          </SectionCard>

          {/* ── PLAN (P) – categorized ── */}
          <SectionCard title="P – Plan" icon="⚙️">
            <div><strong>Investigations</strong><InlineEdit
              value={localNote.plan.investigations}
              onChange={v => updateField('plan.investigations', v)}
              rows={2} placeholder="What tests to order / follow-up" /></div>
            <div style={{ marginTop: 8 }}><strong>Treatment / Medications</strong><InlineEdit
              value={localNote.plan.treatment}
              onChange={v => updateField('plan.treatment', v)}
              rows={3} placeholder="Drug, dose, route, frequency, changes" /></div>
            <div style={{ marginTop: 8 }}><strong>Monitoring</strong><InlineEdit
              value={localNote.plan.monitoring}
              onChange={v => updateField('plan.monitoring', v)}
              rows={2} placeholder="vital frequency, fluid balance, weight, seizure chart" /></div>
            <div style={{ marginTop: 8 }}><strong>Consults</strong><InlineEdit
              value={localNote.plan.consults}
              onChange={v => updateField('plan.consults', v)}
              rows={1} placeholder="Nutrition, physio, surgery, etc." /></div>
            <div style={{ marginTop: 8 }}><strong>Procedures</strong><InlineEdit
              value={localNote.plan.procedures}
              onChange={v => updateField('plan.procedures', v)}
              rows={1} placeholder="e.g. LP, chest drain, central line" /></div>
            <div style={{ marginTop: 8 }}><strong>Counselling / Education</strong><InlineEdit
              value={localNote.plan.counselling}
              onChange={v => updateField('plan.counselling', v)}
              rows={2} placeholder="Discuss danger signs, adherence, follow‑up" /></div>
            <div style={{ marginTop: 8 }}><strong>Disposition</strong><InlineEdit
              value={localNote.plan.disposition}
              onChange={v => updateField('plan.disposition', v)}
              rows={1} placeholder="Continue admission, transfer, discharge plan" /></div>
          </SectionCard>

          {/* ── I, E, R (SOAPIER) – only if format === SOAPIER ── */}
          {format === 'SOAPIER' && (
            <>
              <SectionCard title="I – Implementation" icon="✓">
                <InlineEdit value={localNote.implementation} onChange={v => updateField('implementation', v)} rows={3}
                  placeholder="What was actually done – blood drawn, IV started, oxygen given" />
              </SectionCard>
              <SectionCard title="E – Evaluation" icon="📊">
                <InlineEdit value={localNote.evaluation} onChange={v => updateField('evaluation', v)} rows={3}
                  placeholder="Response to intervention – fever reduced, SpO₂ improved" />
              </SectionCard>
              <SectionCard title="R – Revision" icon="🔄">
                <InlineEdit value={localNote.revision} onChange={v => updateField('revision', v)} rows={3}
                  placeholder="Changes made to plan based on evaluation" />
              </SectionCard>
            </>
          )}
        </>
      )}

      {/* History Modal */}
      {showHistory && <HistoryModal />}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// WARD ROUND ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function WardRoundEngine({ note, setNote, patient, admissionDate, latestVitals, latestLabs }) {
  const dayNum = useMemo(() => {
    if (!admissionDate) return "?";
    const ad = admissionDate?.toDate ? admissionDate.toDate() : new Date(admissionDate);
    const diff = Math.floor((new Date() - ad) / 86400000);
    return diff + 1;
  }, [admissionDate]);

  const setF = (k,v) => setNote(n=>({...n,[k]:v}));

  const quickPhrases = QUICK_PHRASES;

  return (
    <div>
      {/* Day banner */}
      <div style={{
        background:`linear-gradient(135deg,${DS.tealDim},${DS.amberDim})`,
        border:`1px solid ${DS.amber}40`,borderRadius:10,
        padding:"10px 14px",marginBottom:14,
        display:"flex",alignItems:"center",justifyContent:"space-between",
      }}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:DS.amber,fontFamily:DS.fontBody,textTransform:"uppercase",letterSpacing:.5}}>
            Ward Round
          </div>
          <div style={{fontSize:22,fontWeight:900,color:DS.white,fontFamily:DS.fontMono}}>
            Day {dayNum}
          </div>
          <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontBody}}>
            {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
          </div>
        </div>
        {/* Auto-pulled vitals */}
        {latestVitals && Object.keys(latestVitals).length>0 && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(latestVitals).slice(0,4).map(([k,v])=>(
              <div key={k} style={{
                textAlign:"center",background:"rgba(0,0,0,.3)",
                borderRadius:8,padding:"6px 10px",border:`1px solid ${DS.navyBorder}`,
              }}>
                <div style={{fontSize:16,fontWeight:900,color:DS.teal,fontFamily:DS.fontMono}}>{v}</div>
                <div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontBody,textTransform:"uppercase"}}>{k}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick phrases */}
      <NCCard style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:800,color:DS.teal,textTransform:"uppercase",
          letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>⚡ Quick Phrases</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {quickPhrases.map((qp,i) => (
            <button key={i}
              onClick={()=>setF("overnight_events",(note.overnight_events?note.overnight_events+"\n":"")+qp)}
              style={{
                padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:600,cursor:"pointer",
                fontFamily:DS.fontBody,background:DS.tealDim,color:DS.teal,
                border:`1px solid ${DS.teal}30`,marginBottom:4,
              }}>+ {qp}</button>
          ))}
        </div>
      </NCCard>

      {/* Ward round fields */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[
          {k:"overnight_events", label:"Overnight Events",       rows:3, placeholder:"Events since last review — new symptoms, clinical changes, alerts…"},
          {k:"symptoms_today",   label:"Symptoms Today",         rows:2, placeholder:"How is the patient feeling today? Pain, fever, appetite…"},
          {k:"vitals_summary",   label:"Vitals / Trends",        rows:2, placeholder:"T:__ HR:__ BP:__ RR:__ SpO₂:__ — trending up/down/stable"},
          {k:"io_balance",       label:"Input / Output Balance",  rows:2, placeholder:"Intake:__mL  Urine output:__mL  Balance:__mL"},
          {k:"exam_changes",     label:"Examination Changes",    rows:2, placeholder:"Any changes from yesterday's examination…"},
          {k:"labs_today",       label:"Labs / Results Today",   rows:3, placeholder:"Hb:__ WBC:__ CRP:__ Na:__ K:__ Cr:__ — comment on trends"},
          {k:"assessment",       label:"Assessment",             rows:2, placeholder:"Clinical impression — improving / stable / worsening — reason"},
          {k:"plan",             label:"Plan",                   rows:4, placeholder:"1. Continue / change medications\n2. Further investigations\n3. Referrals\n4. Discharge planning"},
        ].map(f=>(
          <div key={f.k}>
            <NCLabel>{f.label}</NCLabel>
            <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISBAR / TRANSFER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function ISBAREngine({ note, setNote }) {
  const setF = (k,v) => setNote(n=>({...n,[k]:v}));
  const fields = [
    {
      k:"identification", label:"I – Identification", color:DS.teal, icon:"🪪",
      placeholder:"Patient name, age, sex, hospital number, ward/bed, consultant, admitting diagnosis, date of admission…",
      rows:3,
    },
    {
      k:"situation", label:"S – Situation", color:DS.amber, icon:"⚡",
      placeholder:"Current clinical situation requiring transfer/handover. What is happening NOW and why is this communication happening?",
      rows:3,
    },
    {
      k:"background", label:"B – Background", color:DS.indigo, icon:"📋",
      placeholder:"Relevant background: presenting complaint, key history, investigations done, treatments given, response to treatment, current medications, allergies…",
      rows:4,
    },
    {
      k:"assessment", label:"A – Assessment", color:DS.green, icon:"🎯",
      placeholder:"Your clinical assessment of the situation: working diagnosis, severity, risk, concerns, differential diagnoses…",
      rows:3,
    },
    {
      k:"recommendation", label:"R – Recommendation", color:DS.red, icon:"📝",
      placeholder:"What action do you need from the receiving team? Specific requests, handover instructions, medications to continue, monitoring required, follow-up needed…",
      rows:3,
    },
  ];

  return (
    <div>
      <AlertBox type="amber" icon="🚑">
        ISBAR is the standard structured communication tool for handovers, transfers, and referrals.
        Complete all five sections for a safe clinical handover.
      </AlertBox>
      {fields.map(f=>(
        <NCCard key={f.k} style={{marginBottom:10,borderColor:`${f.color}40`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:18}}>{f.icon}</span>
            <div style={{fontSize:12,fontWeight:800,color:f.color,fontFamily:DS.fontHead}}>
              {f.label}
            </div>
          </div>
          <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </NCCard>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCHARGE ENGINE — auto-compile from admission notes
// ─────────────────────────────────────────────────────────────────────────────
function DischargeEngine({ note, setNote, patient, admissionNotes, admissionDate }) {
  const [compiling, setCompiling] = useState(false);
  const [compiled, setCompiled] = useState(false);
  const setF = (k,v) => setNote(n=>({...n,[k]:v}));

  const autoCompile = useCallback(async () => {
    setCompiling(true);
    try {
      const sorted = [...admissionNotes].sort((a,b)=>
        (a.createdAt?.toDate?.()??new Date(a.createdAt||0)) -
        (b.createdAt?.toDate?.()??new Date(b.createdAt||0))
      );

      // Admission diagnosis from first note
      const firstNote = sorted[0];
      const admDx = firstNote?.impressions?.[0] || "";

      // Final diagnosis from most recent note
      const lastNote = sorted[sorted.length-1];
      const finalDx = lastNote?.impressions?.[0] || admDx;

      // Hospital course — compile from all progress notes & ward rounds
      const progressNotes = sorted.filter(n=>
        ["progress_note","ward_round","consultation_note","procedure_note"].includes(n.noteType)
      );

      const courseLines = progressNotes.map((n,i) => {
        const dateStr = fmtDate(n.createdAt);
        const reg = NOTE_REGISTRY.find(r=>r.id===n.noteType)||{label:"Note"};
        const c = n.content||{};
        const summary = c.assessment || c.A || c.plan?.slice(0,120) || c.P?.slice(0,120) || "";
        return `${dateStr} (${reg.label}): ${summary}`;
      }).join("\n");

      const dayNum = admissionDate ? Math.floor(
        (new Date() - (admissionDate?.toDate?.()??new Date(admissionDate))) / 86400000
      ) + 1 : "?";

      setNote(n=>({
        ...n,
        admission_dx:     admDx,
        final_dx:         finalDx,
        hospital_course:  courseLines ||
          `Patient admitted with ${admDx}. Hospital course of ${dayNum} days. [Please complete from progress notes.]`,
        condition_at_discharge: "",
        discharge_meds:   "",
        followup_plan:    "",
        red_flags:        "",
      }));

      setCompiled(true);
    } catch(e) { console.error("Compile error", e); }
    setCompiling(false);
  }, [admissionNotes, admissionDate]);

  const fields = [
    {k:"admission_dx",           label:"Admission Diagnosis",          color:DS.teal,  rows:2},
    {k:"final_dx",               label:"Final / Discharge Diagnosis",   color:DS.green, rows:2},
    {k:"hospital_course",        label:"Hospital Course",               color:DS.white, rows:8,
     placeholder:"Chronological account: admission findings → treatment given → response → discharge status"},
    {k:"investigations_summary", label:"Key Investigations",            color:DS.white, rows:3,
     placeholder:"Hb ___ WBC ___ CRP ___ Na ___ K ___ Creatinine ___ — Imaging: ___"},
    {k:"procedures",             label:"Procedures Done",               color:DS.white, rows:2,
     placeholder:"List any procedures, biopsies, operations performed during this admission"},
    {k:"condition_at_discharge", label:"Condition at Discharge",        color:DS.amber, rows:2,
     placeholder:"Stable / improved / unchanged / deteriorated — brief clinical status"},
    {k:"discharge_meds",         label:"Discharge Medications",         color:DS.green, rows:5,
     placeholder:"Drug | Dose | Route | Frequency | Duration\ne.g. Amoxicillin 500mg Oral TDS × 5 days"},
    {k:"followup_plan",          label:"Follow-up Plan",                color:DS.amber, rows:3,
     placeholder:"Clinic review: When? Where? With whom? What to review?"},
    {k:"red_flags",              label:"🚩 Red Flag Symptoms (patient education)", color:DS.red, rows:3,
     placeholder:"Return immediately if: fever >38°C, wound redness/discharge, worsening pain, shortness of breath…"},
    {k:"dietary_advice",         label:"Dietary / Lifestyle Advice",    color:DS.white, rows:2},
    {k:"pending_results",        label:"Pending Results",               color:DS.amber, rows:2,
     placeholder:"Results awaited — instruct follow-up clinic to review"},
    {k:"referrals",              label:"Referrals Made",                color:DS.white, rows:2},
  ];

  return (
    <div>
      {/* Auto-compile banner */}
      <NCCard glow style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:DS.teal,fontFamily:DS.fontHead,marginBottom:2}}>
              🤖 Auto-Compile from Timeline
            </div>
            <div style={{fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
              {admissionNotes.length} admission notes found · Compiles hospital course automatically
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {compiled && <span style={{fontSize:12,color:DS.green,fontWeight:700,fontFamily:DS.fontBody}}>✓ Compiled</span>}
            <NCBtn onClick={autoCompile} disabled={compiling} variant={compiled?"success":"primary"}>
              {compiling?"⏳ Compiling…":"⚡ Auto-Compile"}
            </NCBtn>
          </div>
        </div>
      </NCCard>

      {fields.map(f=>(
        <div key={f.k} style={{marginBottom:12}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE NOTE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function ProcedureEngine({ note, setNote }) {
  const setF = (k,v) => setNote(n=>({...n,[k]:v}));
  const fields = [
    {k:"procedure_name", label:"Procedure",          rows:1, placeholder:"e.g. Lumbar puncture, IV cannulation, chest drain insertion"},
    {k:"indication",     label:"Indication",          rows:2, placeholder:"Clinical reason for the procedure"},
    {k:"consent",        label:"Consent",             rows:2, placeholder:"Written/verbal consent obtained from patient/guardian on [date]. Risks, benefits, and alternatives explained."},
    {k:"patient_position",label:"Patient Position",   rows:1, placeholder:"e.g. Left lateral decubitus, supine, sitting"},
    {k:"asepsis",        label:"Asepsis / Preparation",rows:2, placeholder:"Sterile technique, skin prep agent, sterile field established, gloves, drape…"},
    {k:"anaesthesia",    label:"Anaesthesia",         rows:1, placeholder:"e.g. Local anaesthetic: Lignocaine 1% 5mL SC, or GA, or no anaesthesia"},
    {k:"technique",      label:"Technique",           rows:5, placeholder:"Step-by-step description of the procedure as performed…"},
    {k:"findings",       label:"Intraoperative / Procedural Findings", rows:3, placeholder:"Describe what was found during the procedure"},
    {k:"specimen",       label:"Specimen / Sample",   rows:2, placeholder:"Sample sent: type, volume, bottles used, lab destination"},
    {k:"complications",  label:"Complications",       rows:2, placeholder:"None / specify: bleeding, failed attempt, pain, vasovagal…"},
    {k:"post_plan",      label:"Post-Procedure Plan", rows:3, placeholder:"Monitoring required, analgesia, results to review, next steps"},
    {k:"operator",       label:"Operator",            rows:1, placeholder:"Doctor performing the procedure + supervision details"},
  ];

  return (
    <div>
      <AlertBox type="indigo" icon="🔧">
        Document all procedural details accurately — this note has medico-legal significance.
        Include consent, technique, and any complications.
      </AlertBox>
      {fields.map(f=>(
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLINIC FOLLOW-UP ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function ClinicEngine({ note, setNote, patient, lastVisit, noteType }) {
  const setF = (k,v) => setNote(n=>({...n,[k]:v}));
  const isFollowup = noteType==="clinic_followup" || noteType==="chronic_care_review";

  return (
    <div>
      {/* Last visit recall */}
      {isFollowup && lastVisit && (
        <NCCard style={{marginBottom:14,borderColor:DS.indigo+"40"}}>
          <div style={{fontSize:11,fontWeight:800,color:DS.indigo,textTransform:"uppercase",
            letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>📌 Last Visit Recall</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            <div>
              <div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontBody,fontWeight:700,
                textTransform:"uppercase",marginBottom:3}}>Date</div>
              <div style={{fontSize:12,color:DS.white,fontFamily:DS.fontBody}}>{fmtDate(lastVisit.createdAt)}</div>
            </div>
            <div>
              <div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontBody,fontWeight:700,
                textTransform:"uppercase",marginBottom:3}}>Diagnosis</div>
              <div style={{fontSize:12,color:DS.teal,fontFamily:DS.fontBody,fontWeight:700}}>
                {lastVisit.impressions?.join(", ")||"—"}
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontBody,fontWeight:700,
                textTransform:"uppercase",marginBottom:3}}>Plan Given</div>
              <div style={{fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
                {(lastVisit.content?.plan||lastVisit.content?.P||"—").slice(0,100)}…
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontBody,fontWeight:700,
                textTransform:"uppercase",marginBottom:3}}>Doctor</div>
              <div style={{fontSize:12,color:DS.white,fontFamily:DS.fontBody}}>{lastVisit.doctorName||"—"}</div>
            </div>
          </div>
        </NCCard>
      )}

      {/* Clinic fields */}
      {[
        {k:"reason_review",    label:"Reason for Review",         rows:2,
         placeholder:"Why is the patient here today? Scheduled review / new complaint / test results"},
        {k:"interval_history", label:"Interval History (since last visit)", rows:4,
         placeholder:"How has the patient been since last seen? Symptom progression, adherence, side effects, hospitalizations, new problems…"},
        {k:"med_adherence",    label:"Medication Adherence",      rows:2,
         placeholder:"Taking medications regularly? Missed doses? Side effects? Understanding of treatment?"},
        {k:"examination",      label:"Examination Today",         rows:4,
         placeholder:"Relevant physical findings today — focus on condition-specific exam"},
        {k:"investigations",   label:"Investigations Since Last Visit", rows:3,
         placeholder:"Results of tests ordered last visit. New tests ordered today."},
        {k:"assessment",       label:"Assessment",                rows:3,
         placeholder:"Progress of primary condition. Response to treatment. New problems identified."},
        {k:"plan",             label:"Plan",                      rows:4,
         placeholder:"1. Medication adjustments\n2. New investigations\n3. Referrals\n4. Education\n5. Next review"},
        {k:"next_review",      label:"Next Review Date",          rows:1,
         placeholder:"e.g. 4 weeks — OPD Cardiology — Dr. XYZ — bring results of X and Y"},
      ].map(f=>(
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICU REVIEW ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function ICUEngine({ note, setNote }) {
  const setF = (k,v) => setNote(n=>({...n,[k]:v}));
  return (
    <div>
      <AlertBox type="red" icon="🫀">ICU / HDU daily review — document all systems comprehensively.</AlertBox>
      {[
        {k:"events_24h",    label:"Events in Last 24h",             rows:3},
        {k:"neuro",         label:"Neurological",                   rows:2, placeholder:"GCS, pupils, sedation level (RASS), delirium screen (CAM-ICU)"},
        {k:"respiratory",   label:"Respiratory",                    rows:3, placeholder:"Vent mode / settings | FiO₂ | PEEP | TV | Rate | Plateau P | SpO₂ | ABG summary"},
        {k:"cardiovascular",label:"Cardiovascular",                 rows:3, placeholder:"HR, rhythm, BP (MAP), vasopressors (name/dose/rate), CVP, SvO₂"},
        {k:"renal",         label:"Renal / Fluid Balance",          rows:2, placeholder:"UO (24h), creatinine, urea, fluid balance, RRT if applicable"},
        {k:"gi",            label:"GIT / Nutrition",                rows:2, placeholder:"Feeds (enteral/parenteral), rate, tolerance, bowels, NGT drainage"},
        {k:"infective",     label:"Infective",                      rows:2, placeholder:"Temp, WBC, CRP/PCT, active cultures, antibiotics (drug/dose/day)"},
        {k:"haematology",   label:"Haematology",                    rows:2, placeholder:"Hb, platelets, coag, anticoag status, transfusions"},
        {k:"lines",         label:"Lines / Drains / Tubes",         rows:2, placeholder:"CVL, arterial line, ETT, CXR, urinary catheter — dates, sites, condition"},
        {k:"assessment",    label:"Assessment",                     rows:2, placeholder:"Overall status — improving / plateau / deteriorating. Primary concerns."},
        {k:"plan",          label:"Plan",                          rows:4},
      ].map(f=>(
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NURSING NOTE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function NursingEngine({ note, setNote }) {
  const setF = (k,v) => setNote(n=>({...n,[k]:v}));
  return (
    <div>
      {[
        {k:"shift",        label:"Shift",   rows:1, placeholder:"e.g. Day / Night / 0700-1900"},
        {k:"assessment",   label:"Nursing Assessment", rows:4, placeholder:"General condition, LOC, pain score, wound status, IV site, catheter, NG tube…"},
        {k:"vitals_q",     label:"Vitals Recorded",    rows:2, placeholder:"Time · T · HR · BP · RR · SpO₂ · Pain"},
        {k:"medications_given", label:"Medications Given", rows:3, placeholder:"List medications administered this shift with times and any reactions"},
        {k:"care_provided",label:"Care Provided",       rows:3, placeholder:"Repositioning, wound care, catheter care, suctioning, physio, education…"},
        {k:"intake_output",label:"Input / Output",      rows:2, placeholder:"IV fluids in · Oral in · Urine out · Other output"},
        {k:"concerns",     label:"Concerns / Escalations", rows:2, placeholder:"Any concerns escalated to the medical team and their response"},
        {k:"handover",     label:"Handover Points",     rows:3, placeholder:"Key points for incoming shift"},
      ].map(f=>(
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>setF(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPRESSIONS PANEL (shared, rendered above all note editors)
// ─────────────────────────────────────────────────────────────────────────────
function ImpressionsPanel({ impressions, setImpressions }) {
  const [input, setInput] = useState("");
  const add = () => {
    if (input.trim() && !impressions.includes(input.trim())) {
      setImpressions(p=>[...p,input.trim()]);
      setInput("");
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };
  return (
    <NCCard style={{marginBottom:14,borderColor:DS.teal+"40"}}>
      <div style={{fontSize:10,fontWeight:800,color:DS.teal,textTransform:"uppercase",
        letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>🎯 Impressions / Diagnoses</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <NCInput 
          value={input} 
          onChange={setInput}
          onKeyDown={handleKeyDown}
          placeholder="Type impression or diagnosis, press Enter…"
          style={{flex:1}}
        />
        <NCBtn onClick={add}>+ Add</NCBtn>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {impressions.map((imp,i)=>(
          <NCChip key={i} label={imp} color={DS.teal}
            onRemove={()=>setImpressions(p=>p.filter((_,j)=>j!==i))} />
        ))}
        {impressions.length===0 && (
          <span style={{fontSize:11,color:DS.muted,fontStyle:"italic",fontFamily:DS.fontBody}}>
            Impressions activate clinical decision support in the right panel →
          </span>
        )}
      </div>
    </NCCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF BUNDLE PANEL
// ─────────────────────────────────────────────────────────────────────────────
function PDFBundlePanel({ allNotes, patient, onClose }) {
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [pdfType, setPdfType] = useState("single");

  const PDF_TYPES = [
    {id:"single",        label:"Single Note",       icon:"📄", desc:"Selected notes only"},
    {id:"admission",     label:"Admission Bundle",  icon:"📦", desc:"All notes from this admission"},
    {id:"ward_rounds",   label:"Ward Round Bundle", icon:"📅", desc:"All ward round notes — Day 1→N"},
    {id:"full_chart",    label:"Full Chart",        icon:"📚", desc:"Everything chronological — medico-legal"},
    {id:"presentation",  label:"Presentation Mode", icon:"🎯", desc:"Problem list + course + today's plan (1-2 pages)"},
    {id:"clinic",        label:"Clinic Continuity", icon:"🔄", desc:"All outpatient visits in this episode"},
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    let notesToPrint = [];
    if (pdfType==="single") notesToPrint = allNotes.filter(n=>selected.includes(n.id));
    else if (pdfType==="ward_rounds") notesToPrint = allNotes.filter(n=>n.noteType==="ward_round");
    else if (pdfType==="clinic") notesToPrint = allNotes.filter(n=>["clinic_followup","new_clinic_visit","chronic_care_review"].includes(n.noteType));
    else notesToPrint = allNotes;

    if (!notesToPrint.length) { alert("No notes match this bundle type."); setGenerating(false); return; }
    await generatePDF(notesToPrint, patient, pdfType);
    setGenerating(false);
    onClose();
  };

  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1000,
      background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",
    }}>
      <div style={{
        background:DS.navyCard,border:`1px solid ${DS.navyBorder}`,
        borderRadius:16,padding:24,width:520,maxWidth:"95vw",
        maxHeight:"80vh",overflowY:"auto",boxShadow:"0 16px 64px rgba(0,0,0,.6)",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:800,color:DS.white,fontFamily:DS.fontHead}}>
            🖨 Generate PDF
          </h3>
          <NCBtn size="sm" variant="ghost" onClick={onClose}>✕</NCBtn>
        </div>

        {/* PDF type selector */}
        <div style={{marginBottom:16}}>
          <NCLabel>PDF Type</NCLabel>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {PDF_TYPES.map(pt=>(
              <div key={pt.id} onClick={()=>setPdfType(pt.id)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                background:pdfType===pt.id?DS.tealDim:DS.navyMid,
                border:`1px solid ${pdfType===pt.id?DS.teal:DS.navyBorder}`,
                borderRadius:8,cursor:"pointer",transition:"all .1s",
              }}>
                <span style={{fontSize:18}}>{pt.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>{pt.label}</div>
                  <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontBody}}>{pt.desc}</div>
                </div>
                {pdfType===pt.id && <NCBadge color={DS.teal}>Selected</NCBadge>}
              </div>
            ))}
          </div>
        </div>

        {/* Note selection (for single type) */}
        {pdfType==="single" && (
          <div style={{marginBottom:16}}>
            <NCLabel>Select Notes</NCLabel>
            <div style={{maxHeight:200,overflowY:"auto",border:`1px solid ${DS.navyBorder}`,borderRadius:8}}>
              {allNotes.map(n=>{
                const reg = NOTE_REGISTRY.find(r=>r.id===n.noteType)||{label:n.noteType,color:DS.teal};
                const sel = selected.includes(n.id);
                return (
                  <div key={n.id} onClick={()=>setSelected(p=>sel?p.filter(x=>x!==n.id):[...p,n.id])}
                    style={{
                      display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
                      background:sel?DS.tealDim:"transparent",cursor:"pointer",
                      borderBottom:`1px solid ${DS.navyBorder}`,
                    }}>
                    <div style={{
                      width:16,height:16,borderRadius:4,flexShrink:0,
                      background:sel?DS.teal:"transparent",border:`2px solid ${sel?DS.teal:DS.navyBorder}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      {sel && <span style={{color:"#05101f",fontSize:10,fontWeight:900}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>
                        {reg.label}
                      </div>
                      <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono}}>
                        {fmtDate(n.createdAt)} · {n.doctorName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <NCBtn onClick={handleGenerate} disabled={generating}
          variant="primary" style={{width:"100%",justifyContent:"center"}}>
          {generating?"⏳ Generating PDF…":`🖨 Generate ${PDF_TYPES.find(p=>p.id===pdfType)?.label||"PDF"}`}
        </NCBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: EnhancedClinicalNotes
// ─────────────────────────────────────────────────────────────────────────────
export default function EnhancedClinicalNotes({
  patient,
  doctorId,
  doctorName,
  appointments = [],
  onImpressions,
  mode = "outpatient",
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [noteType,    setNoteType]    = useState("progress_note");
  const [noteContent, setNoteContent] = useState({});
  const [format,      setFormat]      = useState("SOAP");
  const [impressions, setImpressions] = useState([]);
  const [designation, setDesignation] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [pastNotes,   setPastNotes]   = useState([]);
  const [viewing,     setViewing]     = useState(null);
  const [showPDF,     setShowPDF]     = useState(false);
  const [admissionNotes, setAdmissionNotes] = useState([]);
  const [latestVitals,   setLatestVitals]   = useState({});
  const [admissionData,  setAdmissionData]  = useState(null);
  const [lastClinicVisit,setLastClinicVisit]= useState(null);

  // ── Firestore: live notes ─────────────────────────────────────────────────
  useEffect(()=>{
    if (!patient?.uid) return;
    const unsub = onSnapshot(
      query(
        collection(db, "clinical_notes"),
        where("patientId","==",patient.uid),
        orderBy("createdAt","desc"),
        limit(50)
      ),
      snap => {
        const notes = snap.docs.map(d=>({id:d.id,...d.data()}));
        setPastNotes(notes);

        // Last clinic visit for follow-up recall
        const clinicNotes = notes.filter(n=>
          ["clinic_followup","new_clinic_visit","chronic_care_review"].includes(n.noteType)
        );
        if (clinicNotes.length) setLastClinicVisit(clinicNotes[0]);

        // Admission notes for discharge compile
        setAdmissionNotes(notes.filter(n=>n.admissionId || n.encounterType==="INPATIENT"));
      }
    );
    return ()=>unsub();
  },[patient?.uid]);

  // ── Firestore: latest vitals ───────────────────────────────────────────────
  useEffect(()=>{
    if (!patient?.uid) return;
    const unsub = onSnapshot(
      query(collection(db,"vitals"),where("patientId","==",patient.uid),orderBy("recordedAt","desc"),limit(20)),
      snap => {
        const vm = {};
        snap.docs.forEach(d=>{
          const v = d.data();
          if (!vm[v.type]) vm[v.type] = v.value;
        });
        setLatestVitals(vm);
      }
    );
    return ()=>unsub();
  },[patient?.uid]);

  // ── Firestore: admission data ──────────────────────────────────────────────
  useEffect(()=>{
    if (!patient?.uid) return;
    getDocs(query(
      collection(db,"admissions"),
      where("patientId","==",patient.uid),
      where("status","==","active"),
      orderBy("admittedAt","desc"),
      limit(1)
    )).then(snap=>{
      if (!snap.empty) setAdmissionData({id:snap.docs[0].id,...snap.docs[0].data()});
    }).catch(()=>{});
  },[patient?.uid]);

  // ── Propagate impressions up ───────────────────────────────────────────────
  useEffect(()=>{ onImpressions?.(impressions); },[impressions]);

  // Compute previous note of same type for continuity
const previousNote = useMemo(() => {
  if (!pastNotes.length) return null;
  // Find notes of the same type, excluding the currently viewed/edited note if any
  const sameType = pastNotes.filter(n => n.noteType === noteType && n.id !== viewing?.id);
  // Return the most recent one (first because pastNotes are desc sorted)
  return sameType[0] || null;
}, [pastNotes, noteType, viewing]);

  // ── Reset content when note type changes ──────────────────────────────────
  const handleNoteTypeChange = useCallback(nt => {
    setNoteType(nt);
    setNoteContent({});
    setImpressions([]);
  }, []);

  // ── Determine engine for current note type ────────────────────────────────
  const reg = useMemo(()=> NOTE_REGISTRY.find(r=>r.id===noteType)||NOTE_REGISTRY[0], [noteType]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        patientId:     patient.uid,
        doctorId,
        doctorName,
        designation,
        noteType,
        engine:        reg.engine,
        format:        reg.engine==="SOAP" ? format : reg.engine,
        content:       noteContent,
        impressions,
        encounterType: mode==="inpatient" ? "INPATIENT" : "OUTPATIENT",
        admissionId:   admissionData?.id||null,
        ward:          admissionData?.ward||patient.ward||null,
        bed:           admissionData?.bedNumber||patient.bed||null,
        createdAt:     serverTimestamp(),
        signedAt:      serverTimestamp(),
      };

      const ref = await addDoc(collection(db,"clinical_notes"), payload);

      // Also write to timeline
      await addDoc(collection(db,"patient_timeline"), {
        patientId: patient.uid,
        eventType: "clinical_note",
        noteId:    ref.id,
        noteType,
        summary:   impressions[0] || (typeof noteContent==="string" ? noteContent.slice(0,80) : (noteContent.A||noteContent.assessment||"")),
        doctorName,
        encounterType: payload.encounterType,
        admissionId:   payload.admissionId,
        createdAt:     serverTimestamp(),
      });

      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
      setNoteContent({});
      setImpressions([]);
    } catch(e) { console.error("Save error:", e); alert("Failed to save note. Check console."); }
    setSaving(false);
  }, [patient, doctorId, doctorName, designation, noteType, reg, format, noteContent, impressions, mode, admissionData]);

  // ── PDF ───────────────────────────────────────────────────────────────────
  const handleDirectPDF = useCallback(async (notes) => {
    await generatePDF(notes, patient);
  }, [patient]);

  // ── Render engine ─────────────────────────────────────────────────────────
 const renderEngine = () => {
  switch(reg.engine) {
    case "WARD":
      return <WardRoundEngine
        note={noteContent}
        setNote={setNoteContent}
        patient={patient}
        admissionDate={admissionData?.admittedAt}
        latestVitals={latestVitals}
        latestLabs={{}}
      />;
    case "ISBAR":
    case "REFERRAL":
      return <ISBAREngine note={noteContent} setNote={setNoteContent} />;
    case "DISCHARGE":
      return <DischargeEngine
        note={noteContent}
        setNote={setNoteContent}
        patient={patient}
        admissionNotes={admissionNotes}
        admissionDate={admissionData?.admittedAt}
      />;
    case "PROCEDURE":
      return <ProcedureEngine note={noteContent} setNote={setNoteContent} />;
    case "CLINIC":
    case "CLINIC_FU":
    case "CHRONIC":
      return <ClinicEngine
        note={noteContent}
        setNote={setNoteContent}
        patient={patient}
        lastVisit={lastClinicVisit}
        noteType={noteType}
      />;
    case "ICU":
      return <ICUEngine note={noteContent} setNote={setNoteContent} />;
    case "NURSING":
      return <NursingEngine note={noteContent} setNote={setNoteContent} />;
    case "MDT":
      // Use StructuredSOAPEngine in Narrative mode for MDT
      return <StructuredSOAPEngine
        note={noteContent}
        setNote={setNoteContent}
        format="Narrative"
        setFormat={() => {}}
        quickPhrases={[]}
        patient={patient}
        admissionData={admissionData}
        previousNote={previousNote}
        latestVitals={latestVitals}
        latestLabs={{}}
        doctorName={doctorName}
        doctorId={doctorId}
      />;
    default:
      // For all SOAP‑based notes (progress, pre‑op, post‑op, consultation, etc.)
      return <StructuredSOAPEngine
        note={noteContent}
        setNote={setNoteContent}
        format={format}
        setFormat={setFormat}
        quickPhrases={QUICK_PHRASES}
        patient={patient}
        admissionData={admissionData}
        previousNote={previousNote}
        latestVitals={latestVitals}
        latestLabs={{}}
        doctorName={doctorName}
        doctorId={doctorId}
      />;
  }
};
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden",fontFamily:DS.fontBody}}>

      {/* ── Past Notes Pane ── */}
      <PastNotesPane
        notes={pastNotes}
        viewing={viewing}
        onView={setViewing}
        mode={mode}
      />

      {/* ── Main Panel ── */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",position:"relative"}}>

        {/* ── Note Viewer ── */}
        {viewing ? (
          <div style={{flex:1,overflow:"auto"}}>
            <NoteViewer
              note={viewing}
              onClose={()=>setViewing(null)}
              onPDF={handleDirectPDF}
            />
          </div>
        ) : (
          /* ── Note Editor ── */
          <div style={{flex:1,padding:16,paddingBottom:80,overflowY:"auto"}}>

            {/* Editor header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:9,fontWeight:800,color:DS.muted,textTransform:"uppercase",
                  letterSpacing:1,fontFamily:DS.fontBody,marginBottom:4}}>New Clinical Note</div>
                <div style={{fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
                  {mode==="inpatient"?"🏥 Inpatient":"🏃 Outpatient"} ·{" "}
                  {admissionData ? `Admission: ${admissionData.ward||""}` : "No active admission"}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <NCBtn size="sm" variant="ghost" onClick={()=>setShowPDF(true)}
                  style={{borderColor:DS.teal,color:DS.teal}}>
                  🖨 Generate PDF
                </NCBtn>
              </div>
            </div>

            {/* Note type selector */}
            <div style={{marginBottom:14}}>
              <NCLabel>Note Type</NCLabel>
              <NoteTypeSelector selected={noteType} onSelect={handleNoteTypeChange} mode={mode} />
            </div>

            {/* Note type banner */}
            <div style={{
              background:`${reg.color}12`, border:`1px solid ${reg.color}30`,
              borderRadius:10, padding:"10px 14px", marginBottom:14,
              display:"flex",alignItems:"center",gap:10,
            }}>
              <span style={{fontSize:22}}>{reg.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:reg.color,fontFamily:DS.fontHead}}>
                  {reg.label}
                </div>
                <div style={{fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
                  {reg.description}
                </div>
              </div>
              <NCBadge color={reg.color}>{reg.group}</NCBadge>
            </div>

            {/* Designation field */}
            <div style={{marginBottom:14}}>
              <NCLabel>Clinician Designation</NCLabel>
              <NCInput value={designation} onChange={setDesignation}
                placeholder="e.g. House Officer, Registrar, Consultant, Senior Nurse"
                onFocus={()=>{}} onBlur={()=>{}} />
            </div>

            {/* Impressions (for relevant note types) */}
            {!["discharge_summary","transfer_note","nursing_note"].includes(noteType) && (
              <ImpressionsPanel impressions={impressions} setImpressions={setImpressions} />
            )}

            {/* Engine-specific note form */}
            {renderEngine()}

          </div>
        )}

        {/* ── Save Bar ── */}
        {!viewing && (
          <div style={{
            position:"sticky",bottom:0,left:0,right:0,
            background:DS.navyMid,borderTop:`1px solid ${DS.navyBorder}`,
            padding:"10px 16px",display:"flex",justifyContent:"space-between",
            alignItems:"center",gap:8,backdropFilter:"blur(8px)",zIndex:10,flexWrap:"wrap",
          }}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <NCBadge color={reg.color}>{reg.label}</NCBadge>
              {impressions.length>0 &&
                <NCBadge color={DS.teal}>{impressions.length} impression{impressions.length>1?"s":""}</NCBadge>}
              {saved && <span style={{fontSize:12,color:DS.green,fontWeight:700,fontFamily:DS.fontBody}}>✓ Saved to Firestore</span>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <NCBtn onClick={()=>setShowPDF(true)} variant="ghost" size="sm"
                style={{borderColor:DS.teal,color:DS.teal}}>🖨 PDF</NCBtn>
              <NCBtn
                onClick={handleSave}
                disabled={saving}
                variant={saved?"success":"primary"}
                size="lg"
              >
                {saving?"⏳ Saving…":saved?"✓ Saved":"💾 Save & Sign Note"}
              </NCBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── PDF Bundle Modal ── */}
      {showPDF && (
        <PDFBundlePanel
          allNotes={pastNotes}
          patient={patient}
          onClose={()=>setShowPDF(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMINATION ENGINE (replaces the missing ExaminationEngine in ClinicalWorkspace)
// ─────────────────────────────────────────────────────────────────────────────
export function ExaminationEngine({ patient, impressions, onSave }) {
  const [exam, setExam] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const sf = (k,v) => setExam(p=>({...p,[k]:v}));

  const SYSTEMS = [
    {id:"general",  label:"General Appearance",    icon:"👁",
     fields:[
       {k:"appearance", label:"Appearance", placeholder:"Well/ill-looking, distress, cachexia…"},
       {k:"consciousness",label:"Consciousness",placeholder:"GCS E__ V__ M__ — Alert/Confused/Drowsy…"},
       {k:"pallor",     label:"Pallor",     placeholder:"None / Mild / Moderate / Severe"},
       {k:"jaundice",   label:"Jaundice",   placeholder:"None / Mild scleral / Deep jaundice"},
       {k:"cyanosis",   label:"Cyanosis",   placeholder:"None / Peripheral / Central"},
       {k:"oedema",     label:"Oedema",     placeholder:"None / + pedal / ++ bilateral / +++ pitting"},
       {k:"lymph",      label:"Lymphadenopathy",placeholder:"None / Regional / Generalised"},
       {k:"clubbing",   label:"Clubbing",   placeholder:"None / Grade I-IV"},
    ]},
    {id:"cvs",   label:"Cardiovascular",  icon:"❤️",
     fields:[
       {k:"cvs_inspection", label:"Inspection",  placeholder:"Precordial bulge, scars, pacemaker…"},
       {k:"cvs_palpation",  label:"Palpation",   placeholder:"Apex beat position/character, heaves, thrills, JVP height…"},
       {k:"cvs_percussion", label:"Percussion",  placeholder:"Cardiac dullness borders…"},
       {k:"cvs_auscultation",label:"Auscultation",placeholder:"S1 S2 normal/absent/loud; murmurs (timing/grade/site/radiation); added sounds…"},
       {k:"cvs_pulses",     label:"Peripheral Pulses",placeholder:"Radial, femoral, pedal — volume, character, synchrony…"},
    ]},
    {id:"resp",  label:"Respiratory",     icon:"🫁",
     fields:[
       {k:"resp_inspection",label:"Inspection",  placeholder:"Chest shape, respiratory rate, accessory muscle use, trachea position…"},
       {k:"resp_palpation", label:"Palpation",   placeholder:"Chest expansion, tactile fremitus…"},
       {k:"resp_percussion",label:"Percussion",  placeholder:"Resonant/dull/stony dull/hyperresonant — which zones…"},
       {k:"resp_auscultation",label:"Auscultation",placeholder:"Breath sounds (vesicular/bronchial); added sounds (crackles/wheeze/rhonchi/pleural rub)…"},
    ]},
    {id:"abdomen",label:"Abdomen / GIT",  icon:"🫃",
     fields:[
       {k:"abd_inspection", label:"Inspection",  placeholder:"Contour, scars, distension, visible peristalsis, dilated veins…"},
       {k:"abd_auscultation",label:"Auscultation",placeholder:"Bowel sounds (present/absent/tinkling/borborigmi); bruits…"},
       {k:"abd_palpation",  label:"Palpation",   placeholder:"Tenderness (site/rebound/guarding), organomegaly, masses…"},
       {k:"abd_percussion", label:"Percussion",  placeholder:"Tympanic/dull, liver span, shifting dullness, fluid thrill…"},
       {k:"abd_pr",         label:"PR / DRE",    placeholder:"Not done / findings…"},
    ]},
    {id:"cns",   label:"Neurological",    icon:"🧠",
     fields:[
       {k:"cns_gcs",     label:"GCS",            placeholder:"E__ V__ M__ = __/15"},
       {k:"cns_cranial", label:"Cranial Nerves",  placeholder:"CN I-XII summary…"},
       {k:"cns_motor",   label:"Motor System",    placeholder:"Tone/Power (MRC 0-5) / Reflexes (0-4+) UL/LL…"},
       {k:"cns_sensory", label:"Sensory",         placeholder:"Pin-prick / vibration / proprioception…"},
       {k:"cns_cerebel", label:"Cerebellar",      placeholder:"Finger-nose, heel-shin, gait, Romberg…"},
       {k:"cns_mening",  label:"Meningism",       placeholder:"Neck stiffness / Kernig / Brudzinski…"},
    ]},
    {id:"msk",   label:"Musculoskeletal", icon:"🦴",
     fields:[
       {k:"msk_look",   label:"Look",  placeholder:"Deformity, swelling, bruising, muscle wasting, scars…"},
       {k:"msk_feel",   label:"Feel",  placeholder:"Warmth, tenderness, crepitus, effusion…"},
       {k:"msk_move",   label:"Move",  placeholder:"Active/passive ROM (degrees), pain on movement…"},
       {k:"msk_special",label:"Special Tests",placeholder:"McMurray, Lachman, SLRT, FABER…"},
    ]},
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await addDoc(collection(db,"examinations"),{
        patientId: patient.uid,
        examination: exam,
        impressions,
        createdAt: serverTimestamp(),
      });
      setSaved(true); setTimeout(()=>setSaved(false),3000);
      onSave?.();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div style={{height:"100%",overflowY:"auto",padding:16,paddingBottom:80,fontFamily:DS.fontBody}}>
      <SectionHdr icon="🔬" title="Physical Examination" sub="Systematic examination documentation — IPPA for each system" />

      {SYSTEMS.map(sys=>(
        <div key={sys.id} style={{marginBottom:20}}>
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"8px 12px",background:DS.navyMid,borderRadius:"8px 8px 0 0",
            border:`1px solid ${DS.navyBorder}`,borderBottom:"none",
          }}>
            <span style={{fontSize:16}}>{sys.icon}</span>
            <span style={{fontSize:13,fontWeight:800,color:DS.teal,fontFamily:DS.fontHead}}>
              {sys.label}
            </span>
          </div>
          <div style={{
            padding:14,background:DS.navyCard,
            border:`1px solid ${DS.navyBorder}`,borderRadius:"0 0 8px 8px",
          }}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
              {sys.fields.map(f=>(
                <div key={f.k}>
                  <NCLabel>{f.label}</NCLabel>
                  <NCTextarea value={exam[f.k]||""} onChange={v=>sf(f.k,v)} rows={2} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div style={{marginBottom:14}}>
        <NCLabel>Examination Summary</NCLabel>
        <NCTextarea value={exam.summary||""} onChange={v=>sf("summary",v)} rows={4}
          placeholder="Summarise key positive and negative findings leading to your impression…" />
      </div>

      {/* Save bar */}
      <div style={{
        position:"sticky",bottom:0,background:DS.navyMid,borderTop:`1px solid ${DS.navyBorder}`,
        padding:"10px 16px",display:"flex",justifyContent:"flex-end",
      }}>
        <NCBtn onClick={handleSave} disabled={saving} variant={saved?"success":"primary"}>
          {saving?"Saving…":saved?"✓ Saved":"💾 Save Examination"}
        </NCBtn>
      </div>
    </div>
  );
}