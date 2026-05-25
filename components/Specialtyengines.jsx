// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN SPECIALTY ENGINES  specialtyEngines.jsx
// WardRound · ISBAR · Discharge · Procedure · Clinic · ICU · Nursing
// ═══════════════════════════════════════════════════════════════════════════
"use client";
import React, { useState, useCallback, useMemo } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DS, NCTextarea, NCBtn, NCCard, NCLabel, NCChip, NCBadge, AlertBox, SectionCard, fmtDate,
} from "./ds";
import { QUICK_PHRASES, NOTE_REGISTRY } from "./noteRegistry";

// ─────────────────────────────────────────────────────────────────────────────
// WARD ROUND ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function WardRoundEngine({ note, setNote, patient, admissionDate, latestVitals, latestLabs }) {
  const dayNum = useMemo(() => {
    if (!admissionDate) return "?";
    const ad = admissionDate?.toDate ? admissionDate.toDate() : new Date(admissionDate);
    return Math.floor((new Date() - ad) / 86400000) + 1;
  }, [admissionDate]);

  const sf = (k,v) => setNote(n=>({...n,[k]:v}));

  const appendQuickPhrase = (phrase) => {
    sf("overnight_events", (note.overnight_events ? note.overnight_events + "\n" : "") + phrase);
  };

  return (
    <div>
      {/* Day banner */}
      <div style={{
        background:`linear-gradient(135deg,${DS.tealDim},${DS.amberDim})`,
        border:`1px solid ${DS.amber}40`,borderRadius:10,
        padding:"12px 16px",marginBottom:14,
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,
      }}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:DS.amber,fontFamily:DS.fontBody,
            textTransform:"uppercase",letterSpacing:.5}}>Ward Round</div>
          <div style={{fontSize:28,fontWeight:900,color:DS.white,fontFamily:DS.fontMono,lineHeight:1}}>
            Day {dayNum}
          </div>
          <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontBody,marginTop:2}}>
            {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </div>
        </div>
        {latestVitals && Object.keys(latestVitals).length>0 && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(latestVitals).slice(0,5).map(([k,v])=>(
              <div key={k} style={{
                textAlign:"center",background:"rgba(0,0,0,.3)",
                borderRadius:8,padding:"6px 10px",border:`1px solid ${DS.navyBorder}`,
              }}>
                <div style={{fontSize:15,fontWeight:900,color:DS.teal,fontFamily:DS.fontMono}}>{v}</div>
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
          {QUICK_PHRASES.map((qp,i) => (
            <button key={i} onClick={()=>appendQuickPhrase(qp)} style={{
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
          {k:"overnight_events", label:"Overnight Events / Since Last Review",  rows:3,
           placeholder:"Events since last review — new symptoms, clinical changes, nursing alerts, events…"},
          {k:"symptoms_today",   label:"Symptoms Today (Subjective)",           rows:2,
           placeholder:"How is the patient feeling today? Pain score, fever, appetite, mood, breathing…"},
          {k:"vitals_summary",   label:"Vital Signs & Trends",                  rows:2,
           placeholder:"T:__ °C  HR:__ bpm  BP:__/__ mmHg  RR:__/min  SpO₂:__% — trending ↑↓→ compared to yesterday"},
          {k:"io_balance",       label:"Fluid Balance / Input & Output (24h)",  rows:2,
           placeholder:"Input: __ mL (IV + Oral)  |  Urine output: __ mL  |  Other losses: __ mL  |  Balance: ±__ mL"},
          {k:"exam_changes",     label:"Examination Changes (Objective)",       rows:2,
           placeholder:"Changes from yesterday — new findings, resolved signs, wound status, breath sounds…"},
          {k:"labs_today",       label:"Laboratory Results Today",              rows:4,
           placeholder:"CBC: Hb__ WBC__ Plt__ | CRP__ | Na__ K__ Cl__ Creat__ | LFTs | cultures — comment on trends ↑↓"},
          {k:"assessment",       label:"Assessment — Clinical Impression",      rows:2,
           placeholder:"Overall progress: Improving / Stable / Plateauing / Worsening — clinical reasoning"},
          {k:"plan",             label:"Plan",                                  rows:5,
           placeholder:"1. Continue/change medications\n2. Further investigations to order\n3. Referrals/consults\n4. Procedures today\n5. Discharge planning"},
        ].map(f=>(
          <div key={f.k}>
            <NCLabel>{f.label}</NCLabel>
            <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISBAR / TRANSFER / REFERRAL ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function ISBAREngine({ note, setNote, noteType="transfer_note" }) {
  const sf = (k,v) => setNote(n=>({...n,[k]:v}));
  const isReferral = noteType === "referral_note";

  const fields = [
    {
      k:"identification", label:"I — Identification", color:DS.teal, icon:"🪪",
      placeholder:"Patient: Full name · Age · Sex · Hospital No · Ward/Bed\nConsultant: Dr. ___ \nAdmitting diagnosis: ___\nDate admitted: ___\nDate of this communication: ___",
      rows:4,
    },
    {
      k:"situation", label:"S — Situation", color:DS.amber, icon:"⚡",
      placeholder:"Current clinical situation — what is happening RIGHT NOW and why is this communication happening?\n\nReason for transfer/referral: ___\nUrgency: Urgent / Semi-urgent / Routine",
      rows:3,
    },
    {
      k:"background", label:"B — Background", color:DS.indigo, icon:"📋",
      placeholder:"Relevant background:\n• Presenting complaint and history of illness\n• Key investigation results\n• Treatments given and response\n• Current medications (name / dose / route)\n• Known allergies\n• Relevant past medical history",
      rows:5,
    },
    {
      k:"assessment", label:"A — Assessment", color:DS.green, icon:"🎯",
      placeholder:"Your clinical assessment:\n• Working diagnosis\n• Severity and risk level\n• Main clinical concerns\n• Differential diagnoses still being considered",
      rows:3,
    },
    {
      k:"recommendation", label:"R — Recommendation", color:DS.red, icon:"📝",
      placeholder:isReferral
        ? "Specific request to receiving team:\n• What do you need them to do?\n• Specific investigations requested\n• Procedures requested\n• Medications to continue or start\n• Monitoring required\n• Expected outcome of referral"
        : "Handover instructions for receiving team:\n• Medications to continue\n• Monitoring required\n• Pending investigations to follow up\n• Next review date\n• Escalation criteria",
      rows:4,
    },
  ];

  return (
    <div>
      <AlertBox type="amber" icon="🚑">
        {isReferral
          ? "Referral Note — Complete all sections. Be specific about what you are requesting. Include relevant clinical data."
          : "ISBAR Handover / Transfer — This is a medico-legal document. Complete all five sections accurately for a safe clinical handover."
        }
      </AlertBox>
      {fields.map(f => (
        <NCCard key={f.k} style={{marginBottom:10,borderColor:`${f.color}40`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:18}}>{f.icon}</span>
            <div style={{fontSize:13,fontWeight:800,color:f.color,fontFamily:DS.fontHead}}>{f.label}</div>
          </div>
          <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </NCCard>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCHARGE ENGINE — auto-compile from admission notes
// ─────────────────────────────────────────────────────────────────────────────
export function DischargeEngine({ note, setNote, patient, admissionNotes, admissionDate }) {
  const [compiling, setCompiling] = useState(false);
  const [compiled,  setCompiled]  = useState(false);
  const sf = (k,v) => setNote(n=>({...n,[k]:v}));

  const autoCompile = useCallback(async () => {
    setCompiling(true);
    try {
      const sorted = [...admissionNotes].sort((a,b) =>
        (a.createdAt?.toDate?.()??new Date(a.createdAt||0)).getTime() -
        (b.createdAt?.toDate?.()??new Date(b.createdAt||0)).getTime()
      );

      const firstNote = sorted[0];
      const lastNote  = sorted[sorted.length-1];
      const admDx     = firstNote?.impressions?.[0] || "";
      const finalDx   = lastNote?.impressions?.[0] || admDx;

      const progressNotes = sorted.filter(n =>
        ["progress_note","ward_round","consultation_note","procedure_note","icu_review"].includes(n.noteType)
      );

      const courseLines = progressNotes.map(n => {
        const dateStr = fmtDate(n.createdAt);
        const reg     = NOTE_REGISTRY.find(r=>r.id===n.noteType)||{label:"Note"};
        const c       = n.content||{};
        const summary = c.assessment?.primary || c.assessment || c.A || c.plan?.treatment || c.plan || c.P || "";
        return `${dateStr} [${reg.label}]: ${typeof summary==="string" ? summary.slice(0,200) : ""}`;
      }).filter(l=>l.split(":")[1]?.trim()).join("\n");

      const dayNum = admissionDate
        ? Math.floor((new Date() - (admissionDate?.toDate?.()??new Date(admissionDate))) / 86400000) + 1
        : "?";

      setNote(n => ({
        ...n,
        admission_dx:     admDx,
        final_dx:         finalDx,
        hospital_course:  courseLines ||
          `Patient admitted with ${admDx||"above diagnosis"} on ${fmtDate(firstNote?.createdAt)}.\n` +
          `Hospital stay of ${dayNum} days.\n[Complete hospital course from progress notes.]`,
      }));
      setCompiled(true);
    } catch(e) { console.error("Compile error:", e); }
    setCompiling(false);
  }, [admissionNotes, admissionDate]);

  const fields = [
    {k:"admission_dx",           label:"Admission Diagnosis",                   color:DS.teal,  rows:2},
    {k:"final_dx",               label:"Final / Discharge Diagnosis",           color:DS.green, rows:2},
    {k:"hospital_course",        label:"Hospital Course",                       color:DS.white, rows:9,
     placeholder:"Chronological account:\n→ Admission findings\n→ Investigations done and results\n→ Treatment given\n→ Response to treatment\n→ Complications or events\n→ Condition at discharge"},
    {k:"investigations_summary", label:"Key Investigations Summary",            color:DS.white, rows:3,
     placeholder:"CBC: Hb __ WBC __ Plt __\nCXR: ___\nCultures: ___\nOther: ___"},
    {k:"procedures",             label:"Procedures Performed During Admission", color:DS.purple,rows:2,
     placeholder:"e.g. IV cannulation, lumbar puncture, chest drain, central line, surgery…"},
    {k:"condition_at_discharge", label:"Condition at Discharge",                color:DS.amber, rows:2,
     placeholder:"Stable / Improved / Unchanged — brief clinical status at time of discharge"},
    {k:"discharge_meds",         label:"Discharge Medications",                 color:DS.green, rows:6,
     placeholder:"Drug Name    |  Dose  |  Route  |  Frequency  |  Duration\nAmoxicillin   |  500mg  |  Oral   |  TDS        |  5 days"},
    {k:"followup_plan",          label:"Follow-up Plan",                        color:DS.amber, rows:3,
     placeholder:"• Clinic review: When? Where? With whom?\n• What to bring? (results, medications)\n• Who to call if problems arise"},
    {k:"red_flags",              label:"🚩 Red Flag Symptoms — Patient Education",color:DS.red, rows:3,
     placeholder:"Return to hospital IMMEDIATELY if:\n• Fever >38°C\n• Wound redness, swelling, discharge\n• Worsening pain\n• Shortness of breath\n• Inability to feed / drink"},
    {k:"dietary_advice",         label:"Dietary / Lifestyle Advice",            color:DS.white, rows:2,
     placeholder:"e.g. Low sodium diet, adequate fluid intake, rest, graduated return to activity"},
    {k:"pending_results",        label:"Pending Results (for follow-up review)", color:DS.amber, rows:2,
     placeholder:"Blood culture result (Day 5) — review at follow-up clinic"},
    {k:"referrals",              label:"Referrals Made",                        color:DS.indigo,rows:2,
     placeholder:"e.g. Referred to chest clinic / dietitian / physiotherapy / cardiology"},
  ];

  return (
    <div>
      <NCCard glow style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:DS.teal,fontFamily:DS.fontHead,marginBottom:2}}>
              🤖 Auto-Compile from Admission Timeline
            </div>
            <div style={{fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
              {admissionNotes.length} admission notes found · Auto-builds hospital course from progress notes
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {compiled && <span style={{fontSize:12,color:DS.green,fontWeight:700}}>✓ Compiled</span>}
            <NCBtn onClick={autoCompile} disabled={compiling} variant={compiled?"success":"primary"}>
              {compiling ? "⏳ Compiling…" : "⚡ Auto-Compile"}
            </NCBtn>
          </div>
        </div>
      </NCCard>

      {fields.map(f => (
        <div key={f.k} style={{marginBottom:12}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE NOTE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function ProcedureEngine({ note, setNote }) {
  const sf = (k,v) => setNote(n=>({...n,[k]:v}));
  const fields = [
    {k:"procedure_name",  label:"Procedure",              rows:1,
     placeholder:"e.g. Lumbar puncture / IV cannulation / Chest drain insertion / Bone marrow aspiration"},
    {k:"indication",      label:"Indication",             rows:2,
     placeholder:"Clinical reason for performing this procedure at this time"},
    {k:"consent",         label:"Consent",                rows:2,
     placeholder:"Written/verbal consent obtained from patient/guardian on [date and time]. Risks, benefits, and alternatives explained and understood."},
    {k:"patient_position",label:"Patient Position",       rows:1,
     placeholder:"e.g. Left lateral decubitus / Supine / Sitting forward / Prone"},
    {k:"asepsis",         label:"Asepsis & Preparation",  rows:2,
     placeholder:"Sterile technique maintained — skin cleaned with [agent], sterile drape applied, sterile gloves worn, sterile field established."},
    {k:"anaesthesia",     label:"Anaesthesia",            rows:1,
     placeholder:"Local: Lignocaine 1% __ mL subcutaneous / General / IV sedation / None"},
    {k:"technique",       label:"Technique (Step-by-Step)",rows:6,
     placeholder:"Describe the procedure as performed:\n1. Patient positioned…\n2. Site identified…\n3. Skin prepared…\n4. Procedure performed…\n5. Specimen obtained…\n6. Site secured…"},
    {k:"findings",        label:"Intraoperative / Procedural Findings", rows:3,
     placeholder:"Describe what was found — appearance of fluid, characteristics, any unexpected findings…"},
    {k:"specimen",        label:"Specimen / Sample Sent",  rows:2,
     placeholder:"Sample type: CSF / blood / pus / tissue\nVolume: __ mL\nBottles: __ \nDestination: microbiology / cytology / histology"},
    {k:"complications",   label:"Complications",           rows:2,
     placeholder:"None / Specify: bleeding (volume), failed attempt (how many), pain, vasovagal response, iatrogenic injury…"},
    {k:"post_plan",       label:"Post-Procedure Plan",     rows:3,
     placeholder:"• Monitoring: vitals q30min × 2h\n• Analgesia: ___\n• Results to review when available\n• Next steps based on findings"},
    {k:"operator",        label:"Operator & Supervision",  rows:1,
     placeholder:"Performed by: Dr. ___ [grade] — Supervised by: Dr. ___ [grade]"},
  ];

  return (
    <div>
      <AlertBox type="indigo" icon="🔧">
        Procedure Note — This note has medico-legal significance.
        Document all details accurately including consent, technique, complications, and operator.
      </AlertBox>
      {fields.map(f => (
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLINIC ENGINE (New Visit + Follow-up + Chronic Care)
// ─────────────────────────────────────────────────────────────────────────────
export function ClinicEngine({ note, setNote, patient, lastVisit, noteType }) {
  const sf = (k,v) => setNote(n=>({...n,[k]:v}));
  const isFollowup = ["clinic_followup","chronic_care_review"].includes(noteType);
  const isChronic  = noteType === "chronic_care_review";

  const chronicDiseases = {
    DM:     ["Fasting BG", "HbA1c", "Urine ACR", "eGFR", "Lipid profile", "Foot exam", "Eye review"],
    HTN:    ["BP both arms", "Creatinine", "eGFR", "Urine protein", "ECG", "Fundoscopy"],
    Asthma: ["Peak flow (% predicted)", "Spirometry", "Trigger review", "Steroid inhaler technique"],
    HIV:    ["CD4 count", "Viral load", "Opportunistic infection screen", "ART adherence", "Weight"],
    TB:     ["Sputum AFB", "Chest X-ray", "Weight", "LFTs (if on rifampicin)", "Drug adherence"],
    Epilepsy:["Seizure diary", "Drug levels", "Side effects", "SUDEP counselling"],
  };

  return (
    <div>
      {/* Last visit recall */}
      {isFollowup && lastVisit && (
        <NCCard style={{marginBottom:14,borderColor:`${DS.indigo}40`}}>
          <div style={{fontSize:11,fontWeight:800,color:DS.indigo,textTransform:"uppercase",
            letterSpacing:.5,marginBottom:10,fontFamily:DS.fontBody}}>📌 Last Visit Recall</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {[
              ["Date",      fmtDate(lastVisit.createdAt)],
              ["Diagnosis", lastVisit.impressions?.join(", ")||"—"],
              ["Doctor",    lastVisit.doctorName||"—"],
              ["Plan Given",(lastVisit.content?.plan||lastVisit.content?.P||"—").toString().slice(0,100)+"…"],
            ].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:9,color:DS.muted,fontWeight:700,textTransform:"uppercase",
                  marginBottom:3,fontFamily:DS.fontBody}}>{l}</div>
                <div style={{fontSize:12,color:DS.white,fontFamily:DS.fontBody}}>{v}</div>
              </div>
            ))}
          </div>
        </NCCard>
      )}

      {/* Chronic disease checklist */}
      {isChronic && (
        <NCCard style={{marginBottom:14,borderColor:`${DS.green}40`}}>
          <div style={{fontSize:11,fontWeight:800,color:DS.green,textTransform:"uppercase",
            letterSpacing:.5,marginBottom:10,fontFamily:DS.fontBody}}>📋 Chronic Disease Review Checklist</div>
          {Object.entries(chronicDiseases).map(([disease,items])=>(
            <div key={disease} style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:DS.teal,fontFamily:DS.fontBody,marginBottom:3}}>
                {disease}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {items.map(item=>(
                  <span key={item} style={{
                    background:DS.greenDim,border:`1px solid ${DS.green}30`,borderRadius:4,
                    padding:"2px 7px",fontSize:10,color:DS.green,fontFamily:DS.fontBody,
                  }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </NCCard>
      )}

      {/* Clinic fields */}
      {[
        {k:"reason_review",    label:"Reason for Review",                    rows:2,
         placeholder:"Why is the patient here today? Scheduled review / new complaint / test results follow-up"},
        {k:"interval_history", label:"Interval History (Since Last Visit)",  rows:4,
         placeholder:"How has the patient been since last seen?\n• Symptom progression\n• Adherence to treatment\n• Side effects\n• Any hospitalisations\n• New problems"},
        {k:"med_adherence",    label:"Medication Adherence",                 rows:2,
         placeholder:"Taking medications regularly? Any missed doses? Understanding of treatment? Any side effects?"},
        {k:"examination",      label:"Examination Today (Targeted)",         rows:4,
         placeholder:"Relevant physical findings — focus on condition-specific examination\nVitals: BP __ HR __ Weight __\nSystemic: ___"},
        {k:"investigations",   label:"Investigations Since Last Visit",      rows:3,
         placeholder:"Results of tests ordered last visit:\n• [Test] — [Result] — [Interpretation]\n\nNew tests ordered today:"},
        {k:"assessment",       label:"Assessment",                           rows:3,
         placeholder:"Progress of primary condition — responding to treatment / worsening / stable\nNew problems identified:"},
        {k:"plan",             label:"Plan",                                  rows:5,
         placeholder:"1. Medication adjustments (drug, dose, change)\n2. New investigations ordered\n3. Referrals made\n4. Education / counselling\n5. Lifestyle advice\n6. Next review"},
        {k:"next_review",      label:"Next Review",                          rows:1,
         placeholder:"e.g. 4 weeks — OPD General Medicine — Dr. XYZ — bring results of X and Y"},
      ].map(f => (
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICU REVIEW ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function ICUEngine({ note, setNote }) {
  const sf = (k,v) => setNote(n=>({...n,[k]:v}));
  return (
    <div>
      <AlertBox type="red" icon="🫀">
        ICU / HDU Daily Review — Document ALL organ systems comprehensively. This is a critical care record.
      </AlertBox>
      {[
        {k:"events_24h",     label:"Events in Last 24 Hours",           rows:3,
         placeholder:"Significant events, deteriorations, procedures, family meetings…"},
        {k:"neuro",          label:"Neurological",                       rows:2,
         placeholder:"GCS: E__ V__ M__ = __/15 · Pupils: __ mm bilat reactive\nSedation (RASS): __ · Delirium screen (CAM-ICU): +/−\nAnalgesia: __ (NRS pain score: __)"},
        {k:"respiratory",    label:"Respiratory",                        rows:4,
         placeholder:"Mode: SIMV/PSV/CPAP/Spontaneous\nFiO₂: __% · PEEP: __ cmH₂O · TV: __ mL · RR: __ /min\nPlateau P: __ · Compliance: __ mL/cmH₂O\nSpO₂: __% · ABG: pH__ pCO₂__ pO₂__ HCO₃__ BE__"},
        {k:"cardiovascular", label:"Cardiovascular",                     rows:3,
         placeholder:"HR: __ · Rhythm: __\nBP: __/__ mmHg (MAP: __) · CVP: __\nVasopressors: Noradrenaline __ mcg/kg/min · Adrenaline __ mcg/kg/min\nSvO₂/ScvO₂: __"},
        {k:"renal",          label:"Renal / Fluid Balance",              rows:2,
         placeholder:"UO (24h): __ mL (__  mL/kg/h) · Creatinine: __ · Urea: __\n24h balance: ±__ mL · Cumulative balance: ±__ mL\nRRT: None / CRRT / IHD"},
        {k:"gi",             label:"GIT / Nutrition",                    rows:2,
         placeholder:"Feeds: Enteral (NG/NJ) / Parenteral / Oral\nRate: __ mL/h · Volume achieved: __ mL/24h\nTolerance: good/poor (vomiting/high residuals)\nBowels: opened / not opened"},
        {k:"infective",      label:"Infective / Antimicrobials",         rows:3,
         placeholder:"T peak: __ °C · WBC: __ · CRP: __ · Procalcitonin: __\nActive cultures: blood / sputum / urine / wound — pending/results\nAntibiotics: Drug / Dose / Day __ of __"},
        {k:"haematology",    label:"Haematology",                        rows:2,
         placeholder:"Hb: __ · Platelets: __ · INR: __ · APTT: __\nAnticoagulation: LMWH / UFH / None\nTransfusions: pRBC __ units / FFP __ / Platelets __"},
        {k:"lines",          label:"Lines, Drains & Tubes",              rows:2,
         placeholder:"CVC: site, date inserted, condition\nArterial line: site, date\nETT: size __, cm at lips, cuff pressure __\nUrinary catheter · NGT · Drains: site/output"},
        {k:"assessment",     label:"Assessment — Overall Status",        rows:2,
         placeholder:"Overall: Improving / Plateau / Deteriorating\nPrimary organ failure(s) and trajectory\nMain concern today:"},
        {k:"plan",           label:"Plan",                               rows:5,
         placeholder:"Respiratory: ___\nCardiovascular: ___\nRenal: ___\nNutrition: ___\nInfection: ___\nSedation/Analgesia: ___\nRehabilitation/Weaning: ___\nFamily communication: ___"},
      ].map(f=>(
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NURSING NOTE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function NursingEngine({ note, setNote }) {
  const sf = (k,v) => setNote(n=>({...n,[k]:v}));
  return (
    <div>
      {[
        {k:"shift",             label:"Shift",                  rows:1,
         placeholder:"Day shift (07:00–19:00) / Night shift (19:00–07:00)"},
        {k:"assessment",        label:"Nursing Assessment",     rows:4,
         placeholder:"General condition · LOC / GCS · Pain score (NRS 0–10)\nIV site: __ — patent / phlebitis\nWound: site, size, appearance, drainage\nSkin: pressure areas intact / breakdown\nCatheter: insitu / output\nNG tube: position confirmed / residuals"},
        {k:"vitals_q",          label:"Vitals Recorded This Shift", rows:3,
         placeholder:"Time   · T(°C) · HR(/min) · BP(mmHg) · RR(/min) · SpO₂(%) · Pain\n07:00  · ___   · ___     · ___      · ___      · ___     · ___"},
        {k:"medications_given", label:"Medications Administered",rows:3,
         placeholder:"Time  · Drug       · Dose  · Route · Reaction\n08:00 · Amoxicillin · 500mg · IV    · None"},
        {k:"care_provided",     label:"Care Provided",           rows:3,
         placeholder:"Repositioning q2h · Wound dressing changed · Catheter care · Mouth care\nOxygen therapy: device / flow rate · Suctioning · Physiotherapy"),"},
        {k:"intake_output",     label:"Input / Output (This Shift)", rows:2,
         placeholder:"IV fluids in: __ mL · Oral in: __ mL · Total in: __ mL\nUrine out: __ mL · Other out: __ mL · Total out: __ mL"},
        {k:"concerns",          label:"Concerns / Escalations",  rows:2,
         placeholder:"Any concerns escalated to medical team — time, nature, response received"},
        {k:"handover",          label:"Handover Points for Incoming Shift", rows:3,
         placeholder:"Key points for incoming nurse:\n1. ___\n2. ___\n3. ___"},
      ].map(f=>(
        <div key={f.k} style={{marginBottom:10}}>
          <NCLabel>{f.label}</NCLabel>
          <NCTextarea value={note[f.k]||""} onChange={v=>sf(f.k,v)} rows={f.rows} placeholder={f.placeholder} />
        </div>
      ))}
    </div>
  );
}