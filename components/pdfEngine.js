// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN PDF ENGINE  pdfEngine.js
// jsPDF-based continuous-sheet renderer — typed clinical document style
// ═══════════════════════════════════════════════════════════════════════════
import { NOTE_REGISTRY, SOAP_FIELDS } from "./noteRegistry";

const fmtDt = ts => ts?.toDate
  ? ts.toDate().toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})
  : ts ? new Date(ts).toLocaleString("en-GB") : "—";

const fmtDate = ts => ts?.toDate
  ? ts.toDate().toLocaleDateString("en-GB",{dateStyle:"medium"})
  : ts ? new Date(ts).toLocaleDateString("en-GB") : "—";

const hexToRgb = hex => {
  const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)] : [6,182,212];
};

// Colour palette (RGB arrays for jsPDF)
const C = {
  navy:    [5,16,31],
  navyMid: [13,31,56],
  navyCard:[17,29,48],
  border:  [30,51,82],
  teal:    [6,182,212],
  amber:   [245,158,11],
  red:     [239,68,68],
  green:   [16,185,129],
  indigo:  [129,140,248],
  white:   [240,246,255],
  muted:   [132,152,182],
  black:   [0,0,0],
};

// ─────────────────────────────────────────────────────────────────────────────
export async function generatePDF(noteData, patient, pdfType="single") {
  let jsPDF;
  try {
    const mod = await import("jspdf");
    jsPDF = mod.default || mod.jsPDF;
  } catch {
    alert("PDF library not available. Run: npm install jspdf");
    return null;
  }

  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W=210, ML=15, MR=195, LH=5.5;
  let y = 15;

  // ── Page management ────────────────────────────────────────────────────────
  const safeY = (needed=10) => {
    if (y + needed > 278) { doc.addPage(); y = 15; drawPageHeader(); }
  };

  // ── Page header (dark banner) ──────────────────────────────────────────────
  const drawPageHeader = () => {
    // Navy background stripe
    doc.setFillColor(...C.navy);
    doc.rect(0,0,210,20,"F");
    // Teal accent bar left edge
    doc.setFillColor(...C.teal);
    doc.rect(0,0,3,20,"F");

    // Institution / system name
    doc.setTextColor(...C.teal);
    doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("AMEXAN", ML+2, 8);
    doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.setTextColor(...C.muted);
    doc.text("CLINICAL INFORMATION SYSTEM", ML+2, 13);

    // Patient quick reference right
    doc.setTextColor(...C.white);
    doc.setFontSize(9); doc.setFont("helvetica","bold");
    const nameStr = (patient.name||"Unknown Patient").toUpperCase();
    doc.text(nameStr, MR, 8, {align:"right"});
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    const patRef = [
      patient.age ? `${patient.age}y` : "",
      patient.gender||"",
      patient.hospitalNumber ? `IP# ${patient.hospitalNumber}` : "",
      patient.ward ? `Ward: ${patient.ward}` : "",
    ].filter(Boolean).join("  ·  ");
    doc.text(patRef, MR, 14, {align:"right"});

    // Page number bottom-right of header
    doc.setTextColor(...C.teal);
    doc.setFontSize(7);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, MR, 18, {align:"right"});

    y = 25;
    // Thin divider
    doc.setDrawColor(...C.border); doc.setLineWidth(0.3);
    doc.line(ML, y, MR, y); y += 4;
  };

  // ── Patient identity card ──────────────────────────────────────────────────
  const drawPatientCard = () => {
    safeY(40);
    // Background box
    doc.setFillColor(...C.navyCard);
    doc.setDrawColor(...C.teal);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, MR-ML, 36, 2, 2, "FD");

    // Left accent
    doc.setFillColor(...C.teal);
    doc.roundedRect(ML, y, 3, 36, 1, 1, "F");

    // Patient name
    doc.setTextColor(...C.white);
    doc.setFontSize(14); doc.setFont("helvetica","bold");
    doc.text(patient.name||"Unknown Patient", ML+7, y+8);

    // Demographics row
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.setTextColor(...C.muted);
    const demo = [
      patient.age ? `Age: ${patient.age} years` : "",
      patient.gender || "",
      patient.dob ? `DOB: ${patient.dob}` : "",
      patient.bloodGroup ? `Blood Group: ${patient.bloodGroup}` : "",
    ].filter(Boolean).join("     ");
    doc.text(demo, ML+7, y+14);

    // Second row — admission details
    doc.setTextColor(...C.white);
    doc.setFontSize(8.5);
    const admit = [
      patient.hospitalNumber ? `Hospital No: ${patient.hospitalNumber}` : "",
      patient.ward ? `Ward: ${patient.ward}` : "",
      patient.bed ? `Bed: ${patient.bed}` : "",
      patient.consultant ? `Consultant: ${patient.consultant}` : "",
    ].filter(Boolean).join("     ");
    doc.text(admit, ML+7, y+21);

    // Allergies warning
    if (patient.allergies?.length) {
      doc.setFillColor(239,68,68,0.15);
      doc.roundedRect(ML+7, y+25, MR-ML-10, 7, 1, 1, "F");
      doc.setTextColor(...C.red);
      doc.setFontSize(8); doc.setFont("helvetica","bold");
      doc.text(`⚠ ALLERGIES: ${patient.allergies.join(", ")}`, ML+9, y+30);
    } else {
      doc.setTextColor(...C.green);
      doc.setFontSize(8); doc.setFont("helvetica","normal");
      doc.text("✓ No known allergies", ML+7, y+30);
    }

    y += 42;
  };

  // ── Section label ──────────────────────────────────────────────────────────
  const writeSectionLabel = (label, color=C.teal) => {
    safeY(10);
    doc.setFillColor(...color, 0.08);
    doc.rect(ML, y-1, MR-ML, 7, "F");
    doc.setDrawColor(...color, 0.3);
    doc.setLineWidth(0.2);
    doc.line(ML, y-1, ML, y+6);
    doc.setTextColor(...color);
    doc.setFontSize(7.5); doc.setFont("helvetica","bold");
    doc.text(label.toUpperCase(), ML+3, y+4);
    y += 9;
  };

  // ── Content block ──────────────────────────────────────────────────────────
  const writeContent = (content, indent=3) => {
    if (!content) return;
    doc.setFont("helvetica","normal");
    doc.setTextColor(...C.white);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(content), MR - ML - indent - 2);
    lines.forEach(line => {
      safeY(LH);
      doc.text(line, ML + indent, y);
      y += LH;
    });
    y += 2;
  };

  // ── Field with label ──────────────────────────────────────────────────────
  const writeField = (label, content, labelColor=C.muted) => {
    if (!content) return;
    safeY(14);
    // Label
    doc.setFontSize(7.5); doc.setFont("helvetica","bold");
    doc.setTextColor(...labelColor);
    doc.text(label.toUpperCase(), ML+2, y); y += 4;
    // Content
    doc.setFont("helvetica","normal"); doc.setTextColor(...C.white); doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(content), MR - ML - 7);
    lines.forEach(line => {
      safeY(LH);
      doc.text(line, ML+5, y); y += LH;
    });
    y += 3;
  };

  // ── Note banner ───────────────────────────────────────────────────────────
  const drawNoteBanner = (noteLabel, icon="📋", doctorName, timestamp, colorArr=C.teal) => {
    safeY(20);
    doc.setFillColor(...colorArr, 0.12);
    doc.setDrawColor(...colorArr);
    doc.setLineWidth(0.5);
    doc.roundedRect(ML, y, MR-ML, 14, 2, 2, "FD");
    // Icon placeholder text + label
    doc.setTextColor(...colorArr);
    doc.setFontSize(11); doc.setFont("helvetica","bold");
    doc.text(noteLabel, ML+4, y+9);
    // Doctor / time right
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    const meta = [doctorName, timestamp].filter(Boolean).join("  ·  ");
    doc.text(meta, MR-2, y+9, {align:"right"});
    y += 18;
  };

  // ── Horizontal rule ───────────────────────────────────────────────────────
  const drawRule = (color=C.border, weight=0.3) => {
    safeY(6);
    doc.setDrawColor(...color);
    doc.setLineWidth(weight);
    doc.line(ML, y, MR, y); y += 4;
  };

  // ── Signature block ────────────────────────────────────────────────────────
  const drawSignature = (note) => {
    safeY(28);
    y += 4;
    drawRule(C.teal, 0.5);
    doc.setFillColor(6,182,212,0.06);
    doc.rect(ML, y, MR-ML, 22, "F");

    doc.setFontSize(7); doc.setFont("helvetica","bold");
    doc.setTextColor(...C.teal);
    doc.text("DIGITALLY SIGNED", ML+3, y+5);
    doc.text("DATE / TIME", ML+80, y+5);
    doc.text("NOTE ID", ML+140, y+5);

    doc.setFont("helvetica","normal"); doc.setTextColor(...C.white); doc.setFontSize(9.5);
    doc.text(note.doctorName||"", ML+3, y+12);
    if (note.designation) {
      doc.setFontSize(8); doc.setTextColor(...C.muted);
      doc.text(note.designation, ML+3, y+17);
    }
    doc.setTextColor(...C.white); doc.setFontSize(9);
    doc.text(fmtDt(note.createdAt), ML+80, y+12);
    doc.setTextColor(...C.muted); doc.setFontSize(7.5);
    doc.text(note.id||"—", ML+140, y+12);
    y += 26;
  };

  // ── Impressions / Diagnoses block ─────────────────────────────────────────
  const drawImpressions = (impressions, color=C.teal) => {
    if (!impressions?.length) return;
    safeY(12);
    doc.setFillColor(...color, 0.08);
    doc.roundedRect(ML, y, MR-ML, 6 + impressions.length * 6, 2, 2, "F");
    doc.setTextColor(...color);
    doc.setFontSize(7.5); doc.setFont("helvetica","bold");
    doc.text("IMPRESSION / DIAGNOSIS", ML+3, y+5); y += 8;
    doc.setFont("helvetica","normal"); doc.setTextColor(...C.white); doc.setFontSize(10);
    impressions.forEach((imp,i) => {
      safeY(LH);
      doc.text(`${i+1}.  ${imp}`, ML+5, y); y += LH+1;
    });
    y += 3;
  };

  // ── SOAP structured content (handles nested object from StructuredSOAPEngine) ─
  const writeStructuredSOAP = (c, format) => {
    // Subjective
    if (c.subjective) {
      writeSectionLabel("S — Subjective", C.teal);
      const s = c.subjective;
      writeField("Current Symptoms", s.symptoms, C.muted);
      writeField("Change Since Last Review", s.changes, C.muted);
      writeField("Patient / Family Concerns", s.concerns, C.muted);
      writeField("Functional Status", s.functional, C.muted);
      writeField("Medication Adherence", s.adherence, C.muted);
    } else if (c.S) {
      writeSectionLabel("S — Subjective", C.teal);
      writeContent(c.S);
    }

    // Objective
    if (c.objective) {
      writeSectionLabel("O — Objective", C.indigo);
      const o = c.objective;
      writeField("Vital Signs & Trends", o.vitalsTrend, C.muted);
      writeField("General Examination", o.generalExam, C.muted);
      writeField("Systemic Examination", o.systemExam, C.muted);
      writeField("Investigations", o.investigations, C.muted);
      writeField("Imaging", o.imaging, C.muted);
      writeField("Microbiology", o.microbiology, C.muted);
      writeField("Medication Administration", o.medAdmin, C.muted);
      writeField("Fluid Balance", o.fluidBalance, C.muted);
      writeField("Monitoring", o.monitoring, C.muted);
    } else if (c.O) {
      writeSectionLabel("O — Objective", C.indigo);
      writeContent(c.O);
    }

    // Assessment
    if (c.assessment && typeof c.assessment === "object") {
      writeSectionLabel("A — Assessment", C.amber);
      const a = c.assessment;
      if (a.problemList?.length) {
        safeY(8);
        doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...C.amber);
        doc.text("ACTIVE PROBLEM LIST", ML+2, y); y += 5;
        doc.setFont("helvetica","normal"); doc.setTextColor(...C.white); doc.setFontSize(10);
        a.problemList.forEach((p,i) => {
          safeY(LH); doc.text(`${i+1}.  ${p}`, ML+5, y); y += LH;
        }); y += 3;
      }
      writeField("Primary Impression", a.primary, C.muted);
      writeField("Differential Diagnoses", a.differentials, C.muted);
      writeField("Clinical Reasoning", a.reasoning, C.muted);
      writeField("Response to Treatment", a.response, C.muted);
      writeField("Severity Stratification", a.severity, C.muted);
    } else if (c.A) {
      writeSectionLabel("A — Assessment", C.amber);
      writeContent(c.A);
    }

    // Plan
    if (c.plan && typeof c.plan === "object") {
      writeSectionLabel("P — Plan", C.green);
      const p = c.plan;
      writeField("Investigations", p.investigations, C.muted);
      writeField("Treatment / Medications", p.treatment, C.muted);
      writeField("Monitoring", p.monitoring, C.muted);
      writeField("Consults", p.consults, C.muted);
      writeField("Procedures", p.procedures, C.muted);
      writeField("Counselling / Education", p.counselling, C.muted);
      writeField("Disposition", p.disposition, C.muted);
    } else if (c.P) {
      writeSectionLabel("P — Plan", C.green);
      writeContent(c.P);
    }

    // SOAPIER extensions
    if (format === "SOAPIER" || c.implementation) {
      if (c.implementation) {
        writeSectionLabel("I — Implementation", C.purple);
        writeContent(c.implementation);
      }
      if (c.evaluation) {
        writeSectionLabel("E — Evaluation", C.green);
        writeContent(c.evaluation);
      }
      if (c.revision) {
        writeSectionLabel("R — Revision", C.amber);
        writeContent(c.revision);
      }
    }
  };

  // ── Build PDF ─────────────────────────────────────────────────────────────
  drawPageHeader();
  drawPatientCard();

  const notes = Array.isArray(noteData) ? noteData : [noteData];

  for (let ni=0; ni<notes.length; ni++) {
    const note = notes[ni];
    const reg = NOTE_REGISTRY.find(r=>r.id===note.noteType) || {label:note.noteType||"Note", color:"#06b6d4"};
    const colorArr = hexToRgb(reg.color||"#06b6d4");

    if (ni > 0) { drawRule(C.border, 0.5); y += 4; }

    drawNoteBanner(reg.label, reg.icon, note.doctorName, fmtDt(note.createdAt), colorArr);
    drawImpressions(note.impressions, colorArr);

    const c = note.content || {};

    // ── Engine-specific rendering ──────────────────────────────────────────
    if (note.engine==="WARD" || note.noteType==="ward_round") {
      writeSectionLabel(`DAY ${c.dayNumber||"?"} — WARD ROUND`, C.amber);
      writeField("Overnight Events",     c.overnight_events);
      writeField("Symptoms Today",       c.symptoms_today);
      writeField("Vital Signs",          c.vitals_summary, C.teal);
      writeField("Fluid Balance (I&O)",  c.io_balance, C.indigo);
      writeField("Examination Changes",  c.exam_changes);
      writeField("Laboratory Results",   c.labs_today, C.teal);
      writeSectionLabel("A — Assessment", C.amber);
      writeContent(c.assessment);
      writeSectionLabel("P — Plan", C.green);
      writeContent(c.plan);

    } else if (note.engine==="ISBAR" || note.noteType==="transfer_note" || note.engine==="REFERRAL") {
      writeField("I — Identification",   c.identification,  C.teal);
      writeField("S — Situation",        c.situation,       C.amber);
      writeField("B — Background",       c.background,      C.indigo);
      writeField("A — Assessment",       c.assessment,      C.green);
      writeField("R — Recommendation",   c.recommendation,  C.red);

    } else if (note.engine==="DISCHARGE" || note.noteType==="discharge_summary") {
      writeSectionLabel("DISCHARGE SUMMARY", C.green);
      writeField("Admission Diagnosis",           c.admission_dx, C.muted);
      writeField("Final / Discharge Diagnosis",   c.final_dx, C.teal);
      writeSectionLabel("HOSPITAL COURSE", C.white);
      writeContent(c.hospital_course);
      writeField("Key Investigations",            c.investigations_summary, C.muted);
      writeField("Procedures Performed",          c.procedures, C.muted);
      writeField("Condition at Discharge",        c.condition_at_discharge, C.amber);
      writeSectionLabel("DISCHARGE MEDICATIONS", C.green);
      writeContent(c.discharge_meds);
      writeSectionLabel("FOLLOW-UP PLAN", C.amber);
      writeContent(c.followup_plan);
      writeField("⚠ Red Flag Symptoms",           c.red_flags, C.red);
      writeField("Dietary / Lifestyle Advice",    c.dietary_advice, C.muted);
      writeField("Pending Results",               c.pending_results, C.amber);
      writeField("Referrals Made",                c.referrals, C.muted);

    } else if (note.engine==="PROCEDURE" || note.noteType==="procedure_note") {
      writeSectionLabel("PROCEDURE NOTE", C.purple);
      writeField("Procedure",                     c.procedure_name, C.teal);
      writeField("Indication",                    c.indication);
      writeField("Consent",                       c.consent, C.green);
      writeField("Patient Position",              c.patient_position, C.muted);
      writeField("Asepsis / Preparation",         c.asepsis, C.muted);
      writeField("Anaesthesia",                   c.anaesthesia, C.muted);
      writeSectionLabel("TECHNIQUE", C.white);
      writeContent(c.technique);
      writeField("Intraoperative Findings",       c.findings, C.amber);
      writeField("Specimen / Sample",             c.specimen, C.muted);
      writeField("Complications",                 c.complications||"None documented", C.red);
      writeField("Post-Procedure Plan",           c.post_plan, C.green);
      writeField("Operator",                      c.operator, C.muted);

    } else if (["CLINIC","CLINIC_FU","CHRONIC"].includes(note.engine)) {
      writeField("Reason for Review",                    c.reason_review, C.teal);
      writeField("Interval History",                     c.interval_history);
      writeField("Medication Adherence",                 c.med_adherence, C.amber);
      writeField("Examination",                          c.examination);
      writeField("Investigations Since Last Visit",      c.investigations, C.teal);
      writeSectionLabel("A — Assessment", C.amber);
      writeContent(c.assessment);
      writeSectionLabel("P — Plan", C.green);
      writeContent(c.plan);
      writeField("Next Review",                          c.next_review, C.teal);

    } else if (note.engine==="ICU") {
      writeSectionLabel("ICU DAILY REVIEW", C.red);
      writeField("Events in Last 24h",    c.events_24h);
      writeField("Neurological",          c.neuro, C.indigo);
      writeField("Respiratory",           c.respiratory, C.teal);
      writeField("Cardiovascular",        c.cardiovascular, C.red);
      writeField("Renal / Fluid Balance", c.renal, C.amber);
      writeField("GIT / Nutrition",       c.gi, C.green);
      writeField("Infective",             c.infective, C.red);
      writeField("Haematology",           c.haematology, C.purple);
      writeField("Lines / Drains / Tubes",c.lines, C.muted);
      writeSectionLabel("A — Assessment", C.amber);
      writeContent(c.assessment);
      writeSectionLabel("P — Plan", C.green);
      writeContent(c.plan);

    } else if (note.engine==="NURSING") {
      writeSectionLabel("NURSING NOTE", C.green);
      writeField("Shift", c.shift, C.muted);
      writeField("Nursing Assessment", c.assessment);
      writeField("Vitals Recorded", c.vitals_q, C.teal);
      writeField("Medications Given", c.medications_given, C.amber);
      writeField("Care Provided", c.care_provided);
      writeField("Input / Output", c.intake_output, C.indigo);
      writeField("Concerns / Escalations", c.concerns, C.red);
      writeField("Handover Points", c.handover, C.amber);

    } else if (note.format==="Narrative" || typeof c === "string") {
      writeSectionLabel("CLINICAL NOTE", C.teal);
      writeContent(typeof c === "string" ? c : c.narrative||"");

    } else {
      // SOAP / SOAPIER (structured or legacy)
      writeStructuredSOAP(c, note.format);
    }

    drawSignature(note);
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i=1; i<=totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...C.navy);
    doc.rect(0,283,210,14,"F");
    doc.setDrawColor(...C.teal); doc.setLineWidth(0.3);
    doc.line(0,283,210,283);
    doc.setFontSize(6.5); doc.setFont("helvetica","normal");
    doc.setTextColor(...C.muted);
    doc.text(
      "AMEXAN EMR — CONFIDENTIAL CLINICAL RECORD — Unauthorized disclosure is a criminal offence",
      105, 290, {align:"center"}
    );
    doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, ML, 290);
    doc.setTextColor(...C.teal);
    doc.text(`${i} / ${totalPages}`, MR, 290, {align:"right"});
  }

  const fname = `AMEXAN_${(patient.name||"Patient").replace(/\s+/g,"_")}_${Date.now()}.pdf`;
  doc.save(fname);
  return fname;
}