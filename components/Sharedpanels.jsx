// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN SHARED PANELS  sharedPanels.jsx
// NoteTypeSelector · ImpressionsPanel · PastNotesPane · NoteViewer
// PDFBundlePanel · ExaminationEngine
// ═══════════════════════════════════════════════════════════════════════════
"use client";
import React, { useState, useMemo } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DS, inputBase, NCBtn, NCCard, NCLabel, NCChip, NCBadge, NCTextarea, NCInput,
  SectionHdr, fmtDt, fmtDate,
} from "./ds";
import { NOTE_REGISTRY } from "./noteRegistry";
import { generatePDF } from "./pdfEngine";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE TYPE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
export function NoteTypeSelector({ selected, onSelect }) {
  const [open,  setOpen]  = useState(false);
  const [group, setGroup] = useState("All");
  const groups = ["All","Inpatient","Outpatient","Specialty"];

  const filtered = useMemo(() =>
    NOTE_REGISTRY.filter(n => group==="All" || n.group===group),
  [group]);

  const current = NOTE_REGISTRY.find(r=>r.id===selected);

  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:"flex",alignItems:"center",gap:8,padding:"9px 14px",
        background:DS.navyMid,border:`1px solid ${current?.color||DS.navyBorder}`,
        borderRadius:8,cursor:"pointer",fontFamily:DS.fontBody,width:"100%",
        transition:"border .15s",
      }}>
        <span style={{fontSize:16}}>{current?.icon||"📋"}</span>
        <span style={{fontSize:12,fontWeight:700,color:DS.white,flex:1,textAlign:"left"}}>
          {current?.label||"Select Note Type"}
        </span>
        <NCBadge color={current?.color||DS.teal}>{current?.group||"Type"}</NCBadge>
        <span style={{color:DS.muted,fontSize:12}}>{open?"▲":"▼"}</span>
      </button>

      {open && (
        <div style={{
          position:"absolute",top:"105%",left:0,right:0,zIndex:200,
          background:DS.navyCard,border:`1px solid ${DS.navyBorder}`,
          borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.55)",
          maxHeight:420,overflowY:"auto",marginTop:4,
        }}>
          {/* Group filter */}
          <div style={{
            display:"flex",gap:3,padding:"8px 8px 5px",flexWrap:"wrap",
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
                cursor:"pointer",borderBottom:`1px solid ${DS.navyBorder}30`,
                background:selected===reg.id?DS.tealDim:"transparent",transition:"background .1s",
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
                <div style={{color:DS.muted,fontFamily:DS.fontBody,fontSize:10}}>{reg.description}</div>
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
// IMPRESSIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────
export function ImpressionsPanel({ impressions, setImpressions }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !impressions.includes(val)) {
      setImpressions(p=>[...p, val]);
      setInput("");
    }
  };
  return (
    <NCCard style={{marginBottom:14,borderColor:`${DS.teal}40`}}>
      <div style={{fontSize:10,fontWeight:800,color:DS.teal,textTransform:"uppercase",
        letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>🎯 Impressions / Diagnoses</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <NCInput
          value={input} onChange={setInput}
          placeholder="Type impression or diagnosis, press Enter to add…"
          style={{flex:1}}
          onFocus={()=>{}} onBlur={()=>{}}
          onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } }}
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
            Impressions unlock context-specific clinical intelligence and investigation guidance →
          </span>
        )}
      </div>
    </NCCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAST NOTES PANE
// ─────────────────────────────────────────────────────────────────────────────
export function PastNotesPane({ notes, viewing, onView }) {
  const [search,      setSearch]      = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const groups = ["All","Inpatient","Outpatient","Specialty"];

  const filtered = useMemo(() => notes.filter(n => {
    const reg = NOTE_REGISTRY.find(r=>r.id===n.noteType);
    const matchGroup  = filterGroup==="All" || reg?.group===filterGroup;
    const searchLower = search.toLowerCase();
    const matchSearch = !search
      || n.noteType?.toLowerCase().includes(searchLower)
      || n.doctorName?.toLowerCase().includes(searchLower)
      || n.impressions?.some(i=>i.toLowerCase().includes(searchLower));
    return matchGroup && matchSearch;
  }), [notes, search, filterGroup]);

  return (
    <div style={{
      width:224,flexShrink:0,borderRight:`1px solid ${DS.navyBorder}`,
      overflowY:"auto",background:DS.navyMid,display:"flex",flexDirection:"column",
    }}>
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
                <NCBadge color={reg.color}>{n.format||reg.engine||"Note"}</NCBadge>
              </div>
              <div style={{color:DS.muted,fontSize:10,fontFamily:DS.fontMono,marginBottom:2}}>
                {fmtDate(n.createdAt)}
              </div>
              <div style={{color:DS.muted,fontSize:10,fontFamily:DS.fontBody}}>{n.doctorName}</div>
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
export function NoteViewer({ note, onClose, onPDF }) {
  const reg = NOTE_REGISTRY.find(r=>r.id===note.noteType)||{label:note.noteType,icon:"📋",color:DS.teal};
  const c = note.content||{};

  const renderField = (label, content, color=DS.muted) => {
    if (!content) return null;
    return (
      <div key={label} style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",
          letterSpacing:.5,marginBottom:5,fontFamily:DS.fontBody}}>{label}</div>
        <NCCard>
          <p style={{margin:0,color:DS.white,fontSize:12,lineHeight:1.8,
            fontFamily:DS.fontBody,whiteSpace:"pre-wrap"}}>
            {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
          </p>
        </NCCard>
      </div>
    );
  };

  const renderStructuredSOAP = () => {
    const s = c.subjective;
    const o = c.objective;
    const a = c.assessment;
    const p = c.plan;

    if (!s && !o && !a && !p) {
      // Legacy flat SOAP
      const keys = note.format==="SOAPIER" ? ["S","O","A","P","I","E","R"] : ["S","O","A","P"];
      return keys.filter(k=>c[k]).map(k => renderField(k, c[k]));
    }

    return (
      <>
        {s && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:DS.teal,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>S — Subjective</div>
            <NCCard>
              {s.symptoms    && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Symptoms: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{s.symptoms}</span></div>}
              {s.changes     && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Changes: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{s.changes}</span></div>}
              {s.concerns    && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Concerns: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{s.concerns}</span></div>}
              {s.functional  && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Functional: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{s.functional}</span></div>}
              {s.adherence   && <div><span style={{color:DS.muted,fontSize:10}}>Adherence: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{s.adherence}</span></div>}
            </NCCard>
          </div>
        )}
        {o && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:DS.indigo,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>O — Objective</div>
            <NCCard>
              {o.vitalsTrend    && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Vitals: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.vitalsTrend}</span></div>}
              {o.generalExam    && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>General: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.generalExam}</span></div>}
              {o.systemExam     && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Systemic: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.systemExam}</span></div>}
              {o.investigations && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Investigations: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.investigations}</span></div>}
              {o.imaging        && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Imaging: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.imaging}</span></div>}
              {o.microbiology   && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Microbiology: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.microbiology}</span></div>}
              {o.fluidBalance   && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Fluid Balance: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.fluidBalance}</span></div>}
              {o.monitoring     && <div><span style={{color:DS.muted,fontSize:10}}>Monitoring: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{o.monitoring}</span></div>}
            </NCCard>
          </div>
        )}
        {a && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:DS.amber,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>A — Assessment</div>
            <NCCard>
              {a.primary       && <div style={{marginBottom:6}}><span style={{color:DS.amber,fontWeight:700,fontSize:13}}>{a.primary}</span></div>}
              {a.differentials && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Differentials: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{a.differentials}</span></div>}
              {a.reasoning     && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Reasoning: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{a.reasoning}</span></div>}
              {a.response      && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Response: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{a.response}</span></div>}
              {a.severity      && <div><span style={{color:DS.muted,fontSize:10}}>Severity: </span><span style={{color:DS.red,fontWeight:700,fontSize:12}}>{a.severity}</span></div>}
            </NCCard>
          </div>
        )}
        {p && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:DS.green,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>P — Plan</div>
            <NCCard>
              {p.investigations && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Investigations: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{p.investigations}</span></div>}
              {p.treatment      && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Treatment: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{p.treatment}</span></div>}
              {p.monitoring     && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Monitoring: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{p.monitoring}</span></div>}
              {p.consults       && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Consults: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{p.consults}</span></div>}
              {p.procedures     && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Procedures: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{p.procedures}</span></div>}
              {p.counselling    && <div style={{marginBottom:6}}><span style={{color:DS.muted,fontSize:10}}>Counselling: </span><span style={{color:DS.white,fontSize:12,whiteSpace:"pre-wrap"}}>{p.counselling}</span></div>}
              {p.disposition    && <div><span style={{color:DS.muted,fontSize:10}}>Disposition: </span><span style={{color:DS.teal,fontWeight:700,fontSize:12}}>{p.disposition}</span></div>}
            </NCCard>
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (note.engine==="WARD"||note.noteType==="ward_round") {
      return [
        {k:"dayNumber",       label:"Day Number"},
        {k:"overnight_events",label:"Overnight Events"},
        {k:"symptoms_today",  label:"Symptoms Today"},
        {k:"vitals_summary",  label:"Vital Signs"},
        {k:"io_balance",      label:"Fluid Balance"},
        {k:"exam_changes",    label:"Examination Changes"},
        {k:"labs_today",      label:"Laboratory Results"},
        {k:"assessment",      label:"Assessment"},
        {k:"plan",            label:"Plan"},
      ].map(f=>renderField(f.label, c[f.k]));
    }
    if (note.engine==="ISBAR"||note.noteType==="transfer_note"||note.engine==="REFERRAL") {
      return [
        {k:"identification",label:"I — Identification", color:DS.teal},
        {k:"situation",     label:"S — Situation",      color:DS.amber},
        {k:"background",    label:"B — Background",     color:DS.indigo},
        {k:"assessment",    label:"A — Assessment",     color:DS.green},
        {k:"recommendation",label:"R — Recommendation", color:DS.red},
      ].map(f=>renderField(f.label, c[f.k], f.color));
    }
    if (note.engine==="DISCHARGE"||note.noteType==="discharge_summary") {
      return [
        {k:"admission_dx",           label:"Admission Diagnosis",     color:DS.teal},
        {k:"final_dx",               label:"Final Diagnosis",         color:DS.green},
        {k:"hospital_course",        label:"Hospital Course"},
        {k:"investigations_summary", label:"Investigations"},
        {k:"procedures",             label:"Procedures"},
        {k:"condition_at_discharge", label:"Condition at Discharge",  color:DS.amber},
        {k:"discharge_meds",         label:"Discharge Medications",   color:DS.green},
        {k:"followup_plan",          label:"Follow-up Plan",          color:DS.amber},
        {k:"red_flags",              label:"Red Flag Symptoms",       color:DS.red},
      ].map(f=>renderField(f.label, c[f.k], f.color));
    }
    if (typeof c==="string" || note.format==="Narrative") {
      return renderField("Clinical Note", typeof c==="string" ? c : c.narrative||"");
    }
    return renderStructuredSOAP();
  };

  return (
    <div style={{height:"100%",overflowY:"auto",padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:20}}>{reg.icon}</span>
            <h2 style={{margin:0,fontSize:15,fontWeight:800,fontFamily:"'Syne',sans-serif",
              color:DS.white}}>{reg.label}</h2>
            <NCBadge color={reg.color}>{note.format||reg.engine||"Note"}</NCBadge>
          </div>
          <p style={{margin:0,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
            {fmtDt(note.createdAt)} · {note.doctorName} {note.designation?`· ${note.designation}`:""}
          </p>
        </div>
        <div style={{display:"flex",gap:6}}>
          <NCBtn size="sm" variant="ghost" onClick={()=>onPDF([note])}
            style={{borderColor:DS.teal,color:DS.teal}}>🖨 PDF</NCBtn>
          <NCBtn size="sm" variant="ghost" onClick={onClose}>✕ Close</NCBtn>
        </div>
      </div>

      {note.impressions?.length>0 && (
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
          {note.impressions.map((imp,i)=>(
            <NCChip key={i} label={imp} color={reg.color} />
          ))}
        </div>
      )}

      {renderContent()}

      {/* Signature */}
      <div style={{
        background:DS.tealDim,border:`1px solid ${DS.teal}40`,
        borderRadius:8,padding:"10px 12px",marginTop:10,
        display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,
      }}>
        <div>
          <div style={{fontSize:9,fontWeight:800,color:DS.teal,textTransform:"uppercase",
            letterSpacing:.5,marginBottom:2,fontFamily:DS.fontBody}}>Signed by</div>
          <div style={{fontSize:12,fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>
            {note.doctorName}
            {note.designation&&<span style={{color:DS.muted,fontWeight:400,marginLeft:6}}>{note.designation}</span>}
          </div>
        </div>
        <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono}}>{fmtDt(note.createdAt)}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF BUNDLE PANEL
// ─────────────────────────────────────────────────────────────────────────────
export function PDFBundlePanel({ allNotes, patient, onClose }) {
  const [selected,   setSelected]   = useState([]);
  const [generating, setGenerating] = useState(false);
  const [pdfType,    setPdfType]    = useState("single");

  const PDF_TYPES = [
    {id:"single",       label:"Single / Selected Notes",    icon:"📄", desc:"Choose specific notes to include"},
    {id:"admission",    label:"Full Admission Bundle",      icon:"📦", desc:"All notes from this admission chronologically"},
    {id:"ward_rounds",  label:"Ward Round Bundle",          icon:"📅", desc:"All ward rounds — Day 1 → Day N progression"},
    {id:"discharge_doc",label:"Discharge Documentation",   icon:"🚪", desc:"Discharge summary + final ward round"},
    {id:"full_chart",   label:"Complete Medical Record",   icon:"📚", desc:"Everything chronological — for medico-legal"},
    {id:"clinic",       label:"Clinic Continuity Record",  icon:"🔄", desc:"All outpatient visits in this episode"},
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    let notesToPrint = [];

    switch(pdfType) {
      case "single":       notesToPrint = allNotes.filter(n=>selected.includes(n.id)); break;
      case "ward_rounds":  notesToPrint = allNotes.filter(n=>n.noteType==="ward_round"); break;
      case "discharge_doc":notesToPrint = allNotes.filter(n=>
        ["discharge_summary","ward_round","progress_note"].includes(n.noteType)).slice(0,5); break;
      case "clinic":       notesToPrint = allNotes.filter(n=>
        ["clinic_followup","new_clinic_visit","chronic_care_review","telemedicine_note"].includes(n.noteType)); break;
      default:             notesToPrint = [...allNotes];
    }

    // Sort chronologically
    notesToPrint = notesToPrint.sort((a,b) =>
      (a.createdAt?.toDate?.()??new Date(a.createdAt||0)).getTime() -
      (b.createdAt?.toDate?.()??new Date(b.createdAt||0)).getTime()
    );

    if (!notesToPrint.length) {
      alert("No notes match this bundle type. Select notes or choose a different bundle.");
      setGenerating(false);
      return;
    }
    await generatePDF(notesToPrint, patient, pdfType);
    setGenerating(false);
    onClose();
  };

  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:1000,
      background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",
    }}>
      <div style={{
        background:DS.navyCard,border:`1px solid ${DS.navyBorder}`,
        borderRadius:16,padding:24,width:540,maxWidth:"95vw",
        maxHeight:"85vh",overflowY:"auto",boxShadow:"0 16px 64px rgba(0,0,0,.6)",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:800,color:DS.white,fontFamily:"'Syne',sans-serif"}}>
            🖨 Generate Clinical PDF
          </h3>
          <NCBtn size="sm" variant="ghost" onClick={onClose}>✕</NCBtn>
        </div>

        <NCLabel>PDF Bundle Type</NCLabel>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
          {PDF_TYPES.map(pt => (
            <div key={pt.id} onClick={()=>setPdfType(pt.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
              background:pdfType===pt.id?DS.tealDim:DS.navyMid,
              border:`1px solid ${pdfType===pt.id?DS.teal:DS.navyBorder}`,
              borderRadius:8,cursor:"pointer",transition:"all .1s",
            }}>
              <span style={{fontSize:18}}>{pt.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>{pt.label}</div>
                <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontBody}}>{pt.desc}</div>
              </div>
              {pdfType===pt.id && <NCBadge color={DS.teal}>Selected</NCBadge>}
            </div>
          ))}
        </div>

        {pdfType==="single" && (
          <div style={{marginBottom:16}}>
            <NCLabel>Select Notes to Include</NCLabel>
            <div style={{maxHeight:220,overflowY:"auto",border:`1px solid ${DS.navyBorder}`,borderRadius:8}}>
              {allNotes.length===0 && (
                <div style={{padding:14,color:DS.muted,fontSize:11,fontFamily:DS.fontBody,textAlign:"center"}}>
                  No notes available.
                </div>
              )}
              {allNotes.map(n => {
                const reg = NOTE_REGISTRY.find(r=>r.id===n.noteType)||{label:n.noteType,color:DS.teal};
                const sel = selected.includes(n.id);
                return (
                  <div key={n.id}
                    onClick={()=>setSelected(p=>sel?p.filter(x=>x!==n.id):[...p,n.id])}
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
          variant="primary" style={{width:"100%",justifyContent:"center",fontSize:13}}>
          {generating
            ? "⏳ Generating PDF…"
            : `🖨 Generate ${PDF_TYPES.find(p=>p.id===pdfType)?.label||"PDF"}`}
        </NCBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMINATION ENGINE (full systematic physical examination)
// ─────────────────────────────────────────────────────────────────────────────
export function ExaminationEngine({ patient, impressions=[], onSave }) {
  const [exam,   setExam]   = useState({});
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const sf = (k,v) => setExam(p=>({...p,[k]:v}));

  const SYSTEMS = [
    {id:"general", label:"General Appearance", icon:"👁️", fields:[
      {k:"appearance",   label:"Appearance",        placeholder:"Well/ill-looking, distress, cachexia, nutritional status…"},
      {k:"consciousness",label:"Consciousness",      placeholder:"GCS E__ V__ M__ = __/15 — Alert / Confused / Drowsy / Unresponsive"},
      {k:"pallor",       label:"Pallor",             placeholder:"None / Mild (conjunctival) / Moderate / Severe"},
      {k:"jaundice",     label:"Jaundice",           placeholder:"None / Mild scleral icterus / Frank jaundice (Kramer zone __)"},
      {k:"cyanosis",     label:"Cyanosis",           placeholder:"None / Peripheral / Central"},
      {k:"oedema",       label:"Oedema",             placeholder:"None / + pedal / ++ bilateral pitting / +++ generalised"},
      {k:"lymph",        label:"Lymphadenopathy",    placeholder:"None / Regional (site) / Generalised — firm/soft, tender/non-tender"},
      {k:"clubbing",     label:"Clubbing",           placeholder:"None / Grade I (fluctuation) / II / III / IV"},
      {k:"dehydration",  label:"Dehydration",        placeholder:"None / Mild (<5%) / Moderate (5-10%) / Severe (>10%)"},
    ]},
    {id:"cvs", label:"Cardiovascular", icon:"❤️", fields:[
      {k:"cvs_inspection", label:"Inspection",        placeholder:"Precordial bulge, scars (midline sternotomy, lateral thoracotomy), visible pulsations, pacemaker…"},
      {k:"cvs_palpation",  label:"Palpation",         placeholder:"Apex beat: position, character (heaving/thrusting/tapping) — JVP height (cmH₂O above sternal angle) — heaves, thrills…"},
      {k:"cvs_auscultation",label:"Auscultation",     placeholder:"S1: normal/loud/soft — S2: normal/loud/split (fixed/paradoxical/physiological)\nMurmurs: timing / grade (I-VI/VI) / site / radiation\nAdded sounds: S3 (gallop), S4, pericardial rub"},
      {k:"cvs_pulses",     label:"Peripheral Pulses", placeholder:"Rate, rhythm, volume, character — Radial: __ bpm, regular/irregular\nFemoral, pedal — radio-radial/radio-femoral delay"},
    ]},
    {id:"resp", label:"Respiratory", icon:"🫁", fields:[
      {k:"resp_inspection", label:"Inspection",        placeholder:"Chest shape (barrel/pigeon/asymmetric) — RR: __ /min — accessory muscle use — trachea midline/deviated — scars — recession"},
      {k:"resp_palpation",  label:"Palpation",         placeholder:"Trachea position — chest expansion (symmetrical/asymmetrical) — tactile fremitus (increased/decreased/absent)"},
      {k:"resp_percussion", label:"Percussion",        placeholder:"Resonant / Dull (consolidation) / Stony dull (effusion) / Hyperresonant (pneumothorax)\nZones affected: upper/mid/lower L/R"},
      {k:"resp_auscultation",label:"Auscultation",     placeholder:"Breath sounds: vesicular/bronchial/diminished/absent — which zones\nAdded sounds: fine crackles / coarse crackles / wheeze / rhonchi / pleural rub"},
    ]},
    {id:"abdomen", label:"Abdomen / GIT", icon:"🫃", fields:[
      {k:"abd_inspection",  label:"Inspection",        placeholder:"Contour (flat/distended/scaphoid) — movement with respiration — scars — visible peristalsis — dilated veins — umbilicus"},
      {k:"abd_auscultation",label:"Auscultation",      placeholder:"Bowel sounds: present (normal/hyperactive/tinkling) / absent\nBruits: aorta, renal, femoral"},
      {k:"abd_palpation",   label:"Palpation (Light then Deep)", placeholder:"Tenderness: site, rebound tenderness, guarding, rigidity\nOrganomegaly: liver (cm below RCM) / spleen (cm below LCM) / kidneys ballotable\nMasses: site, size, surface, consistency, pulsatile"},
      {k:"abd_percussion",  label:"Percussion",        placeholder:"Tympanic / Dull — liver span: __ cm — shifting dullness +/- — fluid thrill +/-"},
      {k:"abd_pr",          label:"PR / Digital Rectal", placeholder:"Not performed / Findings: anal tone, rectal mucosa, mass, blood on glove"},
    ]},
    {id:"cns", label:"Neurological", icon:"🧠", fields:[
      {k:"cns_gcs",     label:"GCS",                  placeholder:"Eyes: __ / Verbal: __ / Motor: __ = __/15"},
      {k:"cns_cranial", label:"Cranial Nerves",        placeholder:"CN II: visual acuity, fields, fundoscopy — CN III/IV/VI: EOM, pupils (__ mm, direct/consensual) — CN VII: facial symmetry — CN VIII: hearing — CN IX/X: palatal movement — CN XII: tongue"},
      {k:"cns_motor",   label:"Motor System",          placeholder:"Tone: normal/increased/decreased (UL/LL)\nPower (MRC 0-5): UL ___/5, LL ___/5\nReflexes: biceps/triceps/supinator/knee/ankle (0-4+), Plantar ↑/↓"},
      {k:"cns_sensory", label:"Sensory System",        placeholder:"Light touch / Pin-prick / Vibration / Proprioception — dermatomal pattern?"},
      {k:"cns_cerebel", label:"Cerebellar",            placeholder:"Finger-nose test / Heel-shin test / Dysdiadochokinesia / Gait (ataxic/broad-based) / Romberg (positive/negative)"},
      {k:"cns_mening",  label:"Meningism",             placeholder:"Neck stiffness: +/- — Kernig sign: +/- — Brudzinski sign: +/- — Jolt accentuation: +/-"},
    ]},
    {id:"msk", label:"Musculoskeletal", icon:"🦴", fields:[
      {k:"msk_look",    label:"Look (Inspection)",     placeholder:"Deformity, swelling, bruising, erythema, muscle wasting, scars, sinus, posture"},
      {k:"msk_feel",    label:"Feel (Palpation)",      placeholder:"Warmth, tenderness (site), crepitus, effusion (patellar tap / bulge sign), lymph nodes"},
      {k:"msk_move",    label:"Move (ROM)",            placeholder:"Active: __ degrees / Passive: __ degrees — pain on movement (arc? throughout?) — end feel"},
      {k:"msk_special", label:"Special Tests",         placeholder:"Knee: McMurray +/-, Lachman +/-, anterior drawer +/-, patellar apprehension\nShoulder: Hawkins, Neer, Speed, sulcus sign\nSpine: SLRT (L __), Schober's test"},
    ]},
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await addDoc(collection(db,"examinations"),{
        patientId:   patient.uid,
        examination: exam,
        impressions,
        createdAt:   serverTimestamp(),
      });
      setSaved(true);
      setTimeout(()=>setSaved(false),3000);
      onSave?.();
    } catch(e) { console.error("Examination save error:", e); }
    setSaving(false);
  };

  return (
    <div style={{height:"100%",overflowY:"auto",padding:16,paddingBottom:80,fontFamily:DS.fontBody}}>
      <SectionHdr icon="🔬" title="Physical Examination"
        sub="Systematic examination — IPPA for each system — document positive and negative findings" />

      {SYSTEMS.map(sys => (
        <div key={sys.id} style={{marginBottom:20}}>
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"8px 12px",background:DS.navyMid,borderRadius:"8px 8px 0 0",
            border:`1px solid ${DS.navyBorder}`,borderBottom:"none",
          }}>
            <span style={{fontSize:16}}>{sys.icon}</span>
            <span style={{fontSize:13,fontWeight:800,color:DS.teal,fontFamily:"'Syne',sans-serif"}}>
              {sys.label}
            </span>
          </div>
          <div style={{
            padding:14,background:DS.navyCard,
            border:`1px solid ${DS.navyBorder}`,borderRadius:"0 0 8px 8px",
          }}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
              {sys.fields.map(f => (
                <div key={f.k}>
                  <NCLabel>{f.label}</NCLabel>
                  <NCTextarea value={exam[f.k]||""} onChange={v=>sf(f.k,v)} rows={2} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div style={{marginBottom:14}}>
        <NCLabel>Examination Summary</NCLabel>
        <NCTextarea value={exam.summary||""} onChange={v=>sf("summary",v)} rows={4}
          placeholder="Summarise key positive findings and relevant negatives that support your clinical impression…" />
      </div>

      <div style={{
        position:"sticky",bottom:0,background:DS.navyMid,borderTop:`1px solid ${DS.navyBorder}`,
        padding:"10px 16px",display:"flex",justifyContent:"flex-end",
      }}>
        <NCBtn onClick={handleSave} disabled={saving} variant={saved?"success":"primary"}>
          {saving?"⏳ Saving…":saved?"✓ Saved":"💾 Save Examination"}
        </NCBtn>
      </div>
    </div>
  );
}