// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED SOAP ENGINE  v6.0 — StructuredSOAPEngine.jsx
// Bug-fixed: no setState-in-render; context-aware; rule-based intelligence
// ═══════════════════════════════════════════════════════════════════════════
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DS, NCTextarea, NCBtn, NCCard, NCLabel, NCChip, NCBadge, NCInput, SectionCard, AlertBox,
} from "./ds";
import { getContextualHints, QUICK_PHRASES } from "./noteRegistry";
import { fmtDate } from "./ds";

// ── Empty state factory ────────────────────────────────────────────────────
const emptyNote = () => ({
  subjective:  { symptoms:"", changes:"", concerns:"", functional:"", adherence:"" },
  objective:   { vitalsTrend:"", generalExam:"", systemExam:"", investigations:"",
                 imaging:"", microbiology:"", medAdmin:"", fluidBalance:"", monitoring:"" },
  assessment:  { primary:"", differentials:"", reasoning:"", response:"", severity:"", problemList:[] },
  plan:        { investigations:"", treatment:"", monitoring:"", consults:"",
                 procedures:"", counselling:"", disposition:"" },
  implementation:"", evaluation:"", revision:"",
  _history:[],
});

// ─────────────────────────────────────────────────────────────────────────────
export default function StructuredSOAPEngine({
  note,
  setNote,
  format,
  setFormat,
  patient,
  admissionData,
  previousNote,
  latestVitals,
  latestLabs,
  activeMeds,
  doctorName,
  doctorId,
  impressions = [],    // ← passed from parent so engine can give context hints
}) {
  // ── Local state — initialise from parent note or empty ────────────────────
  const [localNote, setLocalNote] = useState(() => {
    if (note && typeof note === "object" && Object.keys(note).length > 0 &&
        (note.subjective || note.assessment || note.plan)) {
      return note;
    }
    return emptyNote();
  });

  const [showHistory,   setShowHistory]   = useState(false);
  const [newProblem,    setNewProblem]    = useState("");
  const [investQuery,   setInvestQuery]   = useState("");
  const [showIntelPanel,setShowIntelPanel]= useState(true);

  // Sync parent → local when parent externally resets (note type change etc.)
  const prevNoteRef = useRef(note);
  useEffect(() => {
    if (note !== prevNoteRef.current) {
      prevNoteRef.current = note;
      // Only sync if parent note is a fresh empty (e.g. after save reset)
      if (!note || (typeof note === "object" && Object.keys(note).length === 0)) {
        setLocalNote(emptyNote());
      }
    }
  }, [note]);

  // ── Context-dependent clinical intelligence ───────────────────────────────
  const clinicalHints = getContextualHints(impressions, "progress_note", patient);

  // ── BUG FIX: updateField uses useEffect to call setNote outside render ────
  // The original bug was calling setNote(updated) INSIDE setLocalNote's updater
  // (which runs during render). We fix this with a deferred ref approach.

  const pendingParentSync = useRef(null);

  const updateField = useCallback((path, newValue) => {
    setLocalNote(prev => {
      const parts = path.split(".");
      const oldValue = parts.reduce((o, k) => o?.[k], prev);
      if (oldValue === newValue) return prev;

      const updated = JSON.parse(JSON.stringify(prev));
      let cursor = updated;
      for (let i = 0; i < parts.length - 1; i++) cursor = cursor[parts[i]];
      cursor[parts[parts.length - 1]] = newValue;

      const historyEntry = {
        fieldPath: path,
        oldValue:  String(oldValue ?? "").slice(0, 200),
        newValue:  String(newValue).slice(0, 200),
        user:      doctorName || doctorId || "Unknown",
        timestamp: new Date().toISOString(),
      };
      updated._history = [historyEntry, ...(updated._history || [])].slice(0, 50);

      // Schedule parent sync via ref — will be picked up by useEffect below
      pendingParentSync.current = updated;
      return updated;
    });
  }, [doctorName, doctorId]);

  // ── Deferred parent sync (avoids setState-in-render) ─────────────────────
  useEffect(() => {
    if (pendingParentSync.current !== null) {
      const toSync = pendingParentSync.current;
      pendingParentSync.current = null;
      setNote(toSync);
    }
  });

  // ── List operations ────────────────────────────────────────────────────────
  const addToList = useCallback((listPath, item) => {
    if (!item?.trim()) return;
    setLocalNote(prev => {
      const parts = listPath.split(".");
      const arr = parts.reduce((o, k) => o?.[k], prev) || [];
      if (arr.includes(item)) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      let cursor = updated;
      for (let i = 0; i < parts.length - 1; i++) cursor = cursor[parts[i]];
      cursor[parts[parts.length - 1]] = [...arr, item];
      updated._history = [{
        fieldPath: `${listPath}.add`, oldValue:"", newValue:item,
        user: doctorName||doctorId, timestamp: new Date().toISOString(),
      }, ...(updated._history||[])];
      pendingParentSync.current = updated;
      return updated;
    });
  }, [doctorName, doctorId]);

  const removeFromList = useCallback((listPath, index) => {
    setLocalNote(prev => {
      const parts = listPath.split(".");
      const arr = parts.reduce((o, k) => o?.[k], prev) || [];
      const removed = arr[index];
      const updated = JSON.parse(JSON.stringify(prev));
      let cursor = updated;
      for (let i = 0; i < parts.length - 1; i++) cursor = cursor[parts[i]];
      cursor[parts[parts.length-1]] = arr.filter((_,i)=>i!==index);
      updated._history = [{
        fieldPath:`${listPath}.remove`, oldValue:removed, newValue:"",
        user:doctorName||doctorId, timestamp:new Date().toISOString(),
      }, ...(updated._history||[])];
      pendingParentSync.current = updated;
      return updated;
    });
  }, [doctorName, doctorId]);

  // ── Inline field edit shorthand ────────────────────────────────────────────
  const IE = ({ path, rows=2, placeholder="" }) => (
    <NCTextarea
      value={path.split(".").reduce((o,k)=>o?.[k], localNote) || ""}
      onChange={v => updateField(path, v)}
      rows={rows}
      placeholder={placeholder}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // HISTORY MODAL
  // ─────────────────────────────────────────────────────────────────────────
  const HistoryModal = () => (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:3000,
      background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",
    }}>
      <div style={{
        background:DS.navyCard,border:`1px solid ${DS.navyBorder}`,
        borderRadius:16,padding:24,width:680,maxWidth:"95vw",maxHeight:"80vh",overflowY:"auto",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
          <h3 style={{margin:0,color:DS.white,fontFamily:DS.fontHead}}>📝 Audit Trail — Edit History</h3>
          <NCBtn variant="ghost" size="sm" onClick={()=>setShowHistory(false)}>✕ Close</NCBtn>
        </div>
        {(!localNote._history?.length) && (
          <p style={{color:DS.muted,fontFamily:DS.fontBody,fontSize:12}}>No changes recorded yet.</p>
        )}
        {localNote._history?.map((entry,idx) => (
          <div key={idx} style={{borderBottom:`1px solid ${DS.navyBorder}`,padding:"10px 0",fontSize:12}}>
            <div style={{color:DS.teal,fontWeight:700,fontFamily:DS.fontBody}}>
              {entry.user} · {new Date(entry.timestamp).toLocaleString()}
            </div>
            <div style={{color:DS.muted,fontFamily:DS.fontMono}}>Field: {entry.fieldPath}</div>
            <div style={{color:DS.muted}}>From: {entry.oldValue||"—"}</div>
            <div style={{color:DS.green}}>To: {entry.newValue||"—"}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // CLINICAL INTELLIGENCE PANEL (right sidebar within engine)
  // Context-dependent: shows required investigations, medication rules, hints
  // ─────────────────────────────────────────────────────────────────────────
  const IntelPanel = () => {
    const { hints, requiredLabs, medRules } = clinicalHints;
    const hasContent = hints.length || requiredLabs.length || medRules.length;

    if (!hasContent) {
      return (
        <NCCard style={{marginBottom:14,borderColor:DS.indigoDim}}>
          <div style={{fontSize:10,fontWeight:800,color:DS.indigo,textTransform:"uppercase",
            letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>🧠 Clinical Intelligence</div>
          <p style={{color:DS.muted,fontSize:11,fontFamily:DS.fontBody,margin:0,fontStyle:"italic"}}>
            Add impressions / diagnoses above to activate context-specific guidance, required
            investigations, and medication safety rules.
          </p>
        </NCCard>
      );
    }

    return (
      <div style={{marginBottom:14}}>
        {/* Required investigations */}
        {requiredLabs.length > 0 && (
          <NCCard style={{marginBottom:10,borderColor:`${DS.teal}40`}}>
            <div style={{fontSize:10,fontWeight:800,color:DS.teal,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>
              🔬 Context-Indicated Investigations
            </div>
            {requiredLabs.map((lab,i) => (
              <div key={i} style={{
                display:"flex",gap:8,alignItems:"flex-start",
                borderBottom:`1px solid ${DS.navyBorder}`,padding:"6px 0",
              }}>
                <div style={{
                  minWidth:140,fontSize:11,fontWeight:700,color:DS.white,
                  fontFamily:DS.fontBody,
                }}>{lab.name}</div>
                <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontBody,flex:1}}>
                  {lab.reason}
                </div>
                <button onClick={() => updateField(
                  "plan.investigations",
                  (localNote.plan.investigations ? localNote.plan.investigations + "\n" : "") + `• ${lab.name}: ${lab.reason}`
                )} style={{
                  background:DS.tealDim,color:DS.teal,border:`1px solid ${DS.teal}30`,
                  borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700,cursor:"pointer",
                  fontFamily:DS.fontBody,whiteSpace:"nowrap",flexShrink:0,
                }}>+ Add to Plan</button>
              </div>
            ))}
          </NCCard>
        )}

        {/* Medication safety rules */}
        {medRules.length > 0 && (
          <NCCard style={{marginBottom:10,borderColor:`${DS.amber}40`}}>
            <div style={{fontSize:10,fontWeight:800,color:DS.amber,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>
              ⚠️ Medication Rules for This Context
            </div>
            {medRules.map((rule,i) => (
              <div key={i} style={{
                fontSize:11,color:DS.white,fontFamily:DS.fontBody,
                borderLeft:`2px solid ${DS.amber}`,paddingLeft:8,marginBottom:5,
              }}>{rule}</div>
            ))}
          </NCCard>
        )}

        {/* Clinical hints */}
        {hints.length > 0 && (
          <NCCard style={{borderColor:`${DS.indigo}40`}}>
            <div style={{fontSize:10,fontWeight:800,color:DS.indigo,textTransform:"uppercase",
              letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>
              💡 Clinical Pearls for This Case
            </div>
            {hints.map((hint,i) => (
              <div key={i} style={{
                fontSize:11,color:DS.muted,fontFamily:DS.fontBody,
                borderLeft:`2px solid ${DS.indigo}`,paddingLeft:8,marginBottom:5,
              }}>{hint}</div>
            ))}
          </NCCard>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Format + History bar ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:5}}>
          {["SOAP","SOAPIER","Narrative"].map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              padding:"5px 14px",borderRadius:99,fontSize:11,fontWeight:700,cursor:"pointer",
              fontFamily:DS.fontBody,
              background:format===f ? DS.teal : "transparent",
              color:format===f ? "#05101f" : DS.muted,
              border:`1px solid ${format===f ? DS.teal : DS.navyBorder}`,
            }}>{f}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          <NCBtn variant="ghost" size="sm"
            onClick={() => setShowIntelPanel(p=>!p)}
            style={{borderColor:DS.indigo,color:DS.indigo}}>
            {showIntelPanel ? "Hide" : "Show"} 🧠 Intel
          </NCBtn>
          <NCBtn variant="ghost" size="sm"
            onClick={() => setShowHistory(true)}
            style={{borderColor:DS.teal,color:DS.teal}}>
            📜 Audit ({localNote._history?.length||0})
          </NCBtn>
        </div>
      </div>

      {/* ── Intelligence panel ── */}
      {showIntelPanel && <IntelPanel />}

      {/* ── Narrative mode ── */}
      {format === "Narrative" ? (
        <div>
          <NCLabel>Narrative Note (free text)</NCLabel>
          <NCTextarea
            value={localNote.narrative || ""}
            onChange={v => updateField("narrative", v)}
            rows={16}
            placeholder="Free-text clinical note…"
          />
        </div>
      ) : (
        <>
          {/* ── ENCOUNTER HEADER ── */}
          <NCCard glow style={{marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
              {[
                ["Date/Time",       new Date().toLocaleString()],
                ["Encounter",       admissionData ? "Inpatient" : "Outpatient"],
                ["Ward / Clinic",   admissionData?.ward || patient?.ward || "—"],
                ["Doctor",          doctorName || "—"],
                ["Consultant",      patient?.consultant || "—"],
                ["Day of Admission",admissionData
                  ? (Math.floor((new Date() - (admissionData.admittedAt?.toDate?.() || new Date(admissionData.admittedAt||0))) / 86400000) + 1) + ""
                  : "—"],
              ].map(([label,val]) => (
                <div key={label}>
                  <div style={{color:DS.muted,fontSize:9,fontFamily:DS.fontBody,
                    textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{label}</div>
                  <div style={{color:DS.white,fontSize:12,fontWeight:700,fontFamily:DS.fontBody}}>{val}</div>
                </div>
              ))}
            </div>
          </NCCard>

          {/* ── BIODATA + ACTIVE PROBLEMS ── */}
          <NCCard style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:700,color:DS.white,fontSize:14,fontFamily:DS.fontBody,marginBottom:4}}>
                  {patient?.name || "—"} · {patient?.age ? `${patient.age}y` : ""} · {patient?.gender||""}
                </div>
                <div style={{fontSize:11,color:DS.muted,fontFamily:DS.fontBody,marginBottom:2}}>
                  Hospital #: {patient?.hospitalNumber || "—"}
                </div>
                <div style={{fontSize:11,fontFamily:DS.fontBody}}>
                  <span style={{color:DS.red,fontWeight:700}}>⚠ Allergies: </span>
                  <span style={{color:DS.white}}>
                    {patient?.allergies?.length ? patient.allergies.join(", ") : "None known"}
                  </span>
                </div>
              </div>
              <div style={{minWidth:200}}>
                <div style={{fontWeight:700,color:DS.teal,fontSize:11,
                  fontFamily:DS.fontBody,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>
                  Active Problem List
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                  {(localNote.assessment?.problemList||[]).map((p,i) => (
                    <NCChip key={i} label={p} color={DS.amber} size="sm"
                      onRemove={() => removeFromList("assessment.problemList", i)} />
                  ))}
                </div>
                <div style={{display:"flex",gap:5}}>
                  <input
                    value={newProblem}
                    onChange={e=>setNewProblem(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"){addToList("assessment.problemList",newProblem);setNewProblem("");}}}
                    placeholder="Add problem…"
                    style={{
                      background:"#0a1825",border:`1px solid ${DS.navyBorder}`,borderRadius:6,
                      color:DS.white,fontSize:11,padding:"4px 8px",fontFamily:DS.fontBody,
                      outline:"none",flex:1,
                    }}
                  />
                  <NCBtn size="sm" onClick={() => {addToList("assessment.problemList",newProblem);setNewProblem("");}}>
                    +
                  </NCBtn>
                </div>
              </div>
            </div>
          </NCCard>

          {/* ── TIMELINE CONTEXT ── */}
          <SectionCard title="Timeline Context" icon="⏱️" defaultOpen={false}>
            {previousNote ? (
              <div style={{marginBottom:12}}>
                <div style={{fontWeight:700,color:DS.indigo,fontSize:12,fontFamily:DS.fontBody,marginBottom:4}}>
                  Previous Note ({fmtDate(previousNote.createdAt)}) · {previousNote.doctorName}
                </div>
                <div style={{fontSize:12,color:DS.muted,fontFamily:DS.fontBody,marginBottom:2}}>
                  A: {previousNote.content?.assessment?.primary || previousNote.content?.A ||
                      previousNote.impressions?.[0] || "—"}
                </div>
                <div style={{fontSize:12,color:DS.muted,fontFamily:DS.fontBody}}>
                  P: {previousNote.content?.plan?.treatment || previousNote.content?.P ||
                      (typeof previousNote.content==="string" ? previousNote.content.slice(0,120) : "—")}
                </div>
              </div>
            ) : (
              <p style={{fontSize:11,color:DS.muted,fontStyle:"italic",fontFamily:DS.fontBody}}>
                No previous note found for this encounter type.
              </p>
            )}
            {latestVitals && Object.keys(latestVitals).length > 0 && (
              <div style={{marginTop:8}}>
                <div style={{fontSize:10,fontWeight:700,color:DS.teal,fontFamily:DS.fontBody,
                  textTransform:"uppercase",marginBottom:4}}>Latest Vitals</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {Object.entries(latestVitals).map(([k,v]) => (
                    <div key={k} style={{
                      background:DS.tealDim,border:`1px solid ${DS.teal}30`,
                      borderRadius:6,padding:"3px 8px",fontSize:11,fontFamily:DS.fontMono,
                    }}>
                      <span style={{color:DS.muted}}>{k}: </span>
                      <span style={{color:DS.teal,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {latestLabs && Object.keys(latestLabs).length > 0 && (
              <div style={{marginTop:8}}>
                <div style={{fontSize:10,fontWeight:700,color:DS.amber,fontFamily:DS.fontBody,
                  textTransform:"uppercase",marginBottom:4}}>Latest Labs</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {Object.entries(latestLabs).slice(0,6).map(([k,v]) => (
                    <div key={k} style={{
                      background:DS.amberDim,border:`1px solid ${DS.amber}30`,
                      borderRadius:6,padding:"3px 8px",fontSize:11,fontFamily:DS.fontMono,
                    }}>
                      <span style={{color:DS.muted}}>{k}: </span>
                      <span style={{color:DS.amber,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── S – SUBJECTIVE ── */}
          <SectionCard title="S — Subjective" icon="🗣️">
            <NCLabel>Current Symptoms</NCLabel>
            <IE path="subjective.symptoms" rows={3}
              placeholder="Chief complaint and associated symptoms — fever, cough, pain (SOCRATES), vomiting, weakness, breathlessness, rash…" />
            <div style={{marginTop:10}}>
              <NCLabel>Change Since Last Review</NCLabel>
              <IE path="subjective.changes" rows={2}
                placeholder="Improved / Worsening / Unchanged / New symptoms since last seen" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Patient / Family Concerns</NCLabel>
              <IE path="subjective.concerns" rows={2}
                placeholder="Patient's own words about their main worries or questions" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Functional Status</NCLabel>
              <IE path="subjective.functional" rows={2}
                placeholder="Walking, feeding, sleeping, stool pattern, urine output, activity level" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Medication Adherence</NCLabel>
              <IE path="subjective.adherence" rows={2}
                placeholder="Taking medications as prescribed? Any missed doses? Side effects reported?" />
            </div>
          </SectionCard>

          {/* ── O – OBJECTIVE ── */}
          <SectionCard title="O — Objective" icon="🩺">
            <NCLabel>Vital Signs &amp; Trends</NCLabel>
            <IE path="objective.vitalsTrend" rows={2}
              placeholder="T: __ °C  HR: __ bpm  RR: __ /min  BP: __/__ mmHg  SpO₂: __%  Weight: __ kg — note trends (↑↓→)" />
            <div style={{marginTop:10}}>
              <NCLabel>General Examination</NCLabel>
              <IE path="objective.generalExam" rows={2}
                placeholder="Conscious level, appearance (ill/well-looking), pallor, jaundice, cyanosis, oedema, dehydration, lymphadenopathy, clubbing" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Systemic Examination (IPPA each system)</NCLabel>
              <IE path="objective.systemExam" rows={4}
                placeholder="CVS: S1 S2 heard, no murmurs — Resp: clear, no added sounds — Abdomen: soft non-tender, no organomegaly — CNS: GCS 15/15, no focal deficits" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Investigations (with dates &amp; trends)</NCLabel>
              <div style={{display:"flex",gap:5,marginBottom:5}}>
                <input
                  value={investQuery}
                  onChange={e=>setInvestQuery(e.target.value)}
                  placeholder="Type lab / imaging result to add…"
                  style={{
                    background:"#0a1825",border:`1px solid ${DS.teal}40`,borderRadius:6,
                    color:DS.white,fontSize:11,padding:"4px 8px",fontFamily:DS.fontBody,
                    outline:"none",flex:1,
                  }}
                />
                <NCBtn size="sm" variant="ghost"
                  style={{borderColor:DS.teal,color:DS.teal}}
                  onClick={()=>{
                    if (investQuery.trim()) {
                      const existing = localNote.objective.investigations;
                      updateField("objective.investigations",
                        (existing ? existing + "\n" : "") +
                        `${new Date().toLocaleDateString("en-GB")} · ${investQuery.trim()}`
                      );
                      setInvestQuery("");
                    }
                  }}>+ Add</NCBtn>
              </div>
              <IE path="objective.investigations" rows={3}
                placeholder="Date · Test · Result · Trend (↑/↓/→) · Interpretation&#10;e.g. 09/05/2026 · WBC 18.2 ×10⁹/L ↑ (neutrophilia — bacterial source likely)" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Imaging</NCLabel>
              <IE path="objective.imaging" rows={2}
                placeholder="CXR: right lower lobe consolidation — CT/Ultrasound: …" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Microbiology</NCLabel>
              <IE path="objective.microbiology" rows={2}
                placeholder="Blood culture: pending / +ve (organism, sensitivities) — Sputum MCS: — Malaria RDT: —" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Medication Administration Record</NCLabel>
              <IE path="objective.medAdmin" rows={2}
                placeholder="All scheduled doses received / missed / refused — IV access patent / issues" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Fluid Balance (24h)</NCLabel>
              <IE path="objective.fluidBalance" rows={2}
                placeholder="Input: __ mL (IV __mL + Oral __mL)  Output: __ mL (Urine __ + Other __)  Balance: ±__ mL" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Monitoring &amp; Observations</NCLabel>
              <IE path="objective.monitoring" rows={2}
                placeholder="Neurological obs, blood glucose chart, seizure chart, drain output, wound check" />
            </div>
          </SectionCard>

          {/* ── A – ASSESSMENT ── */}
          <SectionCard title="A — Assessment" icon="🧠">
            <NCLabel required>Primary Impression / Working Diagnosis</NCLabel>
            <IE path="assessment.primary" rows={1}
              placeholder="e.g. Severe community-acquired pneumonia with hypoxia" />
            <div style={{marginTop:10}}>
              <NCLabel>Differential Diagnoses</NCLabel>
              <IE path="assessment.differentials" rows={2}
                placeholder="1. Bronchiolitis&#10;2. Pulmonary TB&#10;3. Viral LRTI" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Clinical Reasoning</NCLabel>
              <IE path="assessment.reasoning" rows={3}
                placeholder="Why this diagnosis: key positive findings, relevant negatives, investigation correlation — e.g. WBC 18×10⁹/L (neutrophilia) + right lower lobe consolidation on CXR + hypoxia → CAP" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Response to Treatment</NCLabel>
              <IE path="assessment.response" rows={2}
                placeholder="Improving / Plateauing / Worsening — clinical indicators of progress" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Severity Stratification</NCLabel>
              <IE path="assessment.severity" rows={1}
                placeholder="e.g. Severe (WHO criteria) / Moderate / Mild — PSI, CURB-65, SOFA, PELOD, etc." />
            </div>
          </SectionCard>

          {/* ── P – PLAN ── */}
          <SectionCard title="P — Plan" icon="⚙️">
            <NCLabel>Investigations to Order / Follow-Up</NCLabel>
            <IE path="plan.investigations" rows={3}
              placeholder="• Repeat CBC in 48h if not improving&#10;• Blood culture before antibiotics&#10;• CXR in 1 week" />
            <div style={{marginTop:10}}>
              <NCLabel>Treatment / Medications</NCLabel>
              <IE path="plan.treatment" rows={4}
                placeholder="• Oxygen via nasal prongs at 2 L/min&#10;• IV Ampicillin 50 mg/kg Q6h&#10;• IV Gentamicin 7.5 mg/kg OD&#10;• Paracetamol 15 mg/kg PRN fever" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Monitoring</NCLabel>
              <IE path="plan.monitoring" rows={2}
                placeholder="SpO₂ 4-hourly · Temperature chart · Respiratory distress signs · Strict I&O" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Consults Required</NCLabel>
              <IE path="plan.consults" rows={1}
                placeholder="e.g. Nutrition / Physiotherapy / Cardiology / Paediatric surgery" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Procedures</NCLabel>
              <IE path="plan.procedures" rows={1}
                placeholder="e.g. Lumbar puncture / Chest drain / Central line / IV access" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Patient / Family Counselling &amp; Education</NCLabel>
              <IE path="plan.counselling" rows={3}
                placeholder="• Diagnosis and treatment plan explained to mother&#10;• Danger signs: worsening breathing, inability to feed, convulsions, lethargy → return immediately&#10;• Adherence counselling" />
            </div>
            <div style={{marginTop:10}}>
              <NCLabel>Disposition</NCLabel>
              <IE path="plan.disposition" rows={1}
                placeholder="Continue admission / Transfer to ICU / Step down to ward / Discharge plan" />
            </div>
          </SectionCard>

          {/* ── SOAPIER extension ── */}
          {format === "SOAPIER" && (
            <>
              <SectionCard title="I — Implementation" icon="✅">
                <NCLabel>Actions Carried Out This Encounter</NCLabel>
                <IE path="implementation" rows={3}
                  placeholder="IV cannula inserted, blood drawn for culture, oxygen commenced, first antibiotic dose given…" />
              </SectionCard>
              <SectionCard title="E — Evaluation" icon="📊">
                <NCLabel>Response to Interventions</NCLabel>
                <IE path="evaluation" rows={3}
                  placeholder="Following oxygen commencement SpO₂ improved to 96%. Fever responded to paracetamol: T 39.2→37.6°C over 1h." />
              </SectionCard>
              <SectionCard title="R — Revision" icon="🔄">
                <NCLabel>Plan Revisions Based on Evaluation</NCLabel>
                <IE path="revision" rows={3}
                  placeholder="Oxygen flow reduced from 4→2 L/min as tolerated. Gentamicin dose adjusted for weight." />
              </SectionCard>
            </>
          )}
        </>
      )}

      {/* ── History modal ── */}
      {showHistory && <HistoryModal />}
    </div>
  );
}