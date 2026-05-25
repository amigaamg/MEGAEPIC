import { useState, useRef, useCallback } from "react";

const DEMO = {
  name: "Amina Odhiambo", dob: "1989-03-14", age: "36", ageUnit: "years",
  gender: "Female", hospitalNum: "KNH-2025-008841", phone: "+254 722 334 567",
  occupation: "Secondary school teacher", address: "Langata, Nairobi",
  informant: "Self", reliability: "Reliable", bloodGroup: "B+",
  dept: "Internal Medicine",
  cc_list: [
    { symptom: "Productive cough", duration: "3 weeks" },
    { symptom: "Low-grade fever", duration: "2 weeks" },
    { symptom: "Night sweats", duration: "2 weeks" },
    { symptom: "Weight loss", duration: "6 weeks" },
  ],
  hpi_text: "Mrs. Odhiambo is a 36-year-old HIV-positive female secondary school teacher presenting with a three-week history of productive cough with mucopurulent sputum, two weeks of low-grade documented fever and drenching night sweats, and a 6 kg unintentional weight loss over six weeks. She reports two episodes of small-volume haemoptysis. She works in a crowded classroom environment. A course of amoxicillin prescribed two weeks prior produced no improvement.",
  hpi_prev_tx: "Amoxicillin 500 mg TDS × 7 days — no improvement. Paracetamol PRN.",
  pmh_hiv_yn: "yes", pmh_hiv_detail: "Diagnosed 2019, on TDF/3TC/DTG",
  pmh_other: "No prior TB or TB treatment.",
  pmh_transfusion: "No",
  pmh_hosp: "2019 — KNH, HIV diagnosis and ART initiation",
  psh_list: [{ procedure: "LSCS", date: "2018", hospital: "Kenyatta National Hospital", complication: "None" }],
  med_list: [
    { drug: "Tenofovir / Lamivudine / Dolutegravir (TLD)", dose: "1 tab", freq: "OD", route: "PO", duration: "6 yr" },
    { drug: "Cotrimoxazole prophylaxis", dose: "960 mg", freq: "OD", route: "PO", duration: "6 yr" },
  ],
  allergy_list: [{ allergen: "Sulfonamides", reaction: "Maculopapular rash", severity: "Moderate" }],
  fhx_tuberculosis_yn: "yes", fhx_tuberculosis_detail: "Father — died of pulmonary TB, 2012",
  fhx_consang: "None",
  soc_smoke: "Never", soc_alc: "Occasional", soc_marital: "Married",
  soc_living: "Lives with husband and 2 children", soc_edu: "University",
  soc_travel: "No recent travel outside Nairobi",
  ros_general_positive: "yes", ros_general_symptoms: ["Fever","Night sweats","Weight loss","Fatigue","Anorexia"],
  ros_resp_positive: "yes", ros_resp_symptoms: ["Productive cough","Haemoptysis","Exertional dyspnoea"],
  ros_cvs_positive: "no", ros_gi_positive: "no", ros_neuro_positive: "no",
  sumhist: "36-year-old HIV-positive female teacher. Subacute constitutional B-symptoms with left upper zone pulmonary consolidation. Failed antibiotic course. Family history of TB. Strongly favour pulmonary tuberculosis.",
  vitals: {
    appearance: "Ill-looking, mild distress", consciousness: "Alert and orientated",
    pallor: "Mild", jaundice: "None", cyanosis: "None", oedema: "None",
    lymph: "Cervical", clubbing: "None",
    weight: "52", height: "162", bmi: "19.8",
    pulse: "104", bp: "110/70", rr: "22", spo2: "94", temp: "38.1",
    o2_req: "Room air", pain_score: "4",
  },
  sysex_resp_inspection: "Tachypnoea at rest. No deformity. Intercostal recession present.",
  sysex_resp_palpation: "Trachea deviated left. Reduced expansion left > right.",
  sysex_resp_percussion: "Dullness — left upper and mid zones.",
  sysex_resp_auscultation: "Bronchial breath sounds left upper zone. Coarse crepitations left mid zone.",
  sysex_cvs_auscultation: "S1 S2. No added sounds.",
  sysex_abdomen_palpation: "Soft, non-tender. No organomegaly.",
  sysex_abdomen_auscultation: "Bowel sounds present.",
  imp_list: [
    "Pulmonary tuberculosis — probable",
    "HIV-associated opportunistic infection",
    "Community-acquired pneumonia — less likely",
  ],
  ddx_list: ["Primary lung malignancy", "Pneumocystis jirovecii pneumonia", "Lung abscess"],
  assessment_summary: "A 36-year-old HIV-positive female presenting with subacute constitutional B-symptoms and classical left upper zone consolidation. The clinical constellation — immunosuppression, epidemiological risk, failed antibiotics, haemoptysis — strongly favours pulmonary tuberculosis as the primary diagnosis.",
  plan_invx_urgent: "Sputum AFB smear × 3\nGeneXpert MTB/RIF\nHIV viral load + CD4 count\nFBC, ESR, CRP, U&E, LFTs\nChest X-ray PA\nBlood cultures × 2",
  plan_invx_routine: "Sputum MGIT culture + sensitivity\nSputum cytology\nIGRA if smear-negative\nHRCT chest if CXR inconclusive\nLDH, uric acid (baseline)",
  plan_meds: "Anti-TB therapy 2RHZE/4RH — after bacteriological confirmation\nContinue TLD — do not interrupt ART\nReview cotrimoxazole (sulfonamide allergy) — consider dapsone\nParacetamol 1 g TDS PRN\nPyridoxine 25 mg OD with isoniazid\nNutritional supplementation",
  plan_ref_internal: "Infectious Disease / TB Clinic\nDietitian\nSocial Worker — DOTs counselling",
  plan_ref_external: "TB notification to County Health Office (statutory)",
  plan_edu: "Diagnosis and treatment plan explained\nDOTs importance and process discussed\nRespiratory isolation and cough hygiene\nFamily TB screening advised\nART adherence reinforced",
  plan_followup: "2 weeks", plan_followup_detail: "TB Clinic — culture results. Monthly thereafter.",
  plan_disposition: "Admit — general medical ward",
  sign_doctor: "Dr. Kevin Mwangi", sign_designation: "Medical Officer, Internal Medicine",
  sign_datetime: "2025-05-09T10:30",
};

// ── helpers ──────────────────────────────────────────────────────
const fmtDate = s => { try { return new Date(s).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}); } catch { return s||""; } };
const fmtDT = s => { try { return new Date(s).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); } catch { return s||""; } };
const calcBMI = (w,h) => w&&h ? (parseFloat(w)/((parseFloat(h)/100)**2)).toFixed(1) : null;
const bmiTag = b => { const n=parseFloat(b); return n<18.5?"Underweight":n<25?"Normal":n<30?"Overweight":"Obese"; };
const sal = d => { if(!d.name) return "The patient"; const p=d.name.trim().split(" "); return d.gender==="Female"?`Mrs. ${p[p.length-1]}`:d.gender==="Male"?`Mr. ${p[p.length-1]}`:d.name; };

// ── narrative engine ──────────────────────────────────────────────
function narrate(data) {
  const S = sal(data);
  const v = data.vitals||{};
  const bmi = v.bmi||calcBMI(v.weight,v.height);

  const pmhMap = {hiv:"HIV/AIDS",dm:"diabetes mellitus",htn:"hypertension",asthma:"bronchial asthma",tb:"tuberculosis",cardiac:"cardiac disease",renal:"chronic kidney disease",hepatic:"chronic liver disease",epilepsy:"epilepsy",malignancy:"malignancy"};
  const pmhPos = Object.entries(pmhMap).filter(([k])=>data[`pmh_${k}_yn`]==="yes").map(([k,l])=>{ const d=data[`pmh_${k}_detail`]; return d?`${l} (${d})`:l; });
  const fhxPos = Object.keys(data).filter(k=>k.startsWith("fhx_")&&k.endsWith("_yn")&&data[k]==="yes").map(k=>{ const n=k.replace("fhx_","").replace("_yn","").replace(/_/g," "); const d=data[k.replace("_yn","_detail")]||""; return d?`${n} (${d})`:n; });
  const sysNames = {general:"General/Constitutional",resp:"Respiratory",cvs:"Cardiovascular",gi:"Gastrointestinal",neuro:"Neurological"};
  const rosPos=[], rosNeg=[];
  Object.entries(sysNames).forEach(([k,l])=>{ const yn=data[`ros_${k}_positive`]; const sy=data[`ros_${k}_symptoms`]||[]; if(yn==="yes") rosPos.push(`${l}: ${sy.join(", ")}`); else if(yn==="no") rosNeg.push(l); });

  const hpi = data.hpi_text || `${S} presents with the chief complaints documented above. History obtained in full.`;

  let pmh = pmhPos.length ? `${S} has a past medical history of ${pmhPos.join(", ")}. ` : `${S} has no significant past medical history. `;
  if(data.pmh_other) pmh += data.pmh_other+" ";
  if(data.pmh_hosp) pmh += `Previous hospitalisations: ${data.pmh_hosp}. `;
  pmh += data.pmh_transfusion==="No" ? "No transfusion history." : data.pmh_transfusion ? `Transfusion: ${data.pmh_transfusion}.` : "";
  const surgs=(data.psh_list||[]).filter(s=>s.procedure);
  if(surgs.length) pmh += ` Surgical history: ${surgs.map(s=>`${s.procedure} (${s.date}, ${s.hospital||"—"}, ${s.complication&&s.complication!=="None"?`complicated by ${s.complication}`:"no complications"})`).join("; ")}.`;
  else pmh += " No prior surgery.";

  const meds=(data.med_list||[]).filter(m=>m.drug);
  const allgs=(data.allergy_list||[]).filter(a=>a.allergen);
  let drugs = meds.length ? `${S} is currently prescribed: ${meds.map(m=>`${m.drug} ${m.dose} ${m.freq} ${m.route||""}`.trim()).join("; ")}. ` : `${S} takes no regular medications. `;
  drugs += !data.med_herbal ? "No herbal medicines reported. " : `Herbal use: ${data.med_herbal}. `;
  drugs += allgs.length ? `Documented allergies: ${allgs.map(a=>`${a.allergen} → ${a.reaction} (${a.severity})`).join("; ")}.` : "No known drug allergies.";

  let family = fhxPos.length ? `Family history significant for: ${fhxPos.join("; ")}. ` : "No significant family history. ";
  if(!data.fhx_consang||data.fhx_consang==="None") family += "No consanguinity."; else family += `Consanguinity: ${data.fhx_consang}.`;

  let social = "";
  if(data.soc_marital) social += `${S} is ${data.soc_marital.toLowerCase()}`;
  if(data.soc_living) social += `, ${data.soc_living.toLowerCase()}`;
  social += ". ";
  if(data.occupation) social += `Works as a ${data.occupation.toLowerCase()}. `;
  social += [data.soc_smoke&&`Smoking: ${data.soc_smoke}`, data.soc_alc&&`Alcohol: ${data.soc_alc}`, data.soc_edu&&`Education: ${data.soc_edu}`, data.soc_travel&&`Travel: ${data.soc_travel}`].filter(Boolean).join(". ")+"."

  let ros = rosPos.length ? `Positive systems: ${rosPos.join("; ")}. ` : "";
  ros += rosNeg.length ? `Unremarkable systems: ${rosNeg.join(", ")}.` : "";
  ros = ros||"Full systems review completed.";

  let exam = `On general examination ${S} appeared ${v.appearance||"as documented"}, ${v.consciousness||"conscious"}. `;
  const stigmata=[v.pallor&&v.pallor!=="None"&&`${v.pallor.toLowerCase()} pallor`, v.jaundice&&v.jaundice!=="None"&&"jaundice", v.cyanosis&&v.cyanosis!=="None"&&`${v.cyanosis.toLowerCase()} cyanosis`, v.oedema&&v.oedema!=="None"&&`${v.oedema.toLowerCase()} oedema`, v.lymph&&v.lymph!=="None"&&`${v.lymph.toLowerCase()} lymphadenopathy`].filter(Boolean);
  exam += stigmata.length ? `Peripheral signs: ${stigmata.join(", ")}. ` : "No pallor, jaundice, cyanosis, oedema, or lymphadenopathy. ";
  const vabn=[parseFloat(v.pulse)>100&&`tachycardia (${v.pulse} bpm)`, parseFloat(v.rr)>20&&`tachypnoea (RR ${v.rr}/min)`, parseFloat(v.temp)>38&&`fever (${v.temp} °C)`, parseFloat(v.spo2)<94&&`hypoxaemia (SpO₂ ${v.spo2}%)`].filter(Boolean);
  exam += vabn.length ? `Vital signs notable for ${vabn.join(", ")}. ` : "Vital signs stable. ";
  if(v.bp) exam += `BP ${v.bp} mmHg. `;
  if(bmi) exam += `BMI ${bmi} kg/m² (${bmiTag(bmi)}).`;

  const assessment = data.assessment_summary||`Clinical assessment of ${S} documented below.`;
  let plan = `The management plan for ${S} is detailed below.`;
  if(data.plan_disposition) plan += ` Disposition: ${data.plan_disposition}.`;

  return { hpi, pmh, drugs, family, social, ros, exam, assessment, plan };
}

// ── red flags ────────────────────────────────────────────────────
function flags(data) {
  const v=data.vitals||{}; const out=[];
  if(parseFloat(v.spo2)<90) out.push({lvl:"crit",txt:`SpO₂ critically low at ${v.spo2}% — immediate O₂ required`});
  else if(parseFloat(v.spo2)<94) out.push({lvl:"warn",txt:`SpO₂ ${v.spo2}% — hypoxaemia, monitor closely`});
  if(parseFloat(v.rr)>=30) out.push({lvl:"crit",txt:`Severe tachypnoea RR ${v.rr}/min — assess for respiratory failure`});
  if(parseFloat(v.temp)>=39.5) out.push({lvl:"crit",txt:`High-grade fever ${v.temp} °C — sepsis workup indicated`});
  const sbp=v.bp?.split("/")?.[0]; if(sbp&&parseFloat(sbp)<90) out.push({lvl:"crit",txt:`Hypotension BP ${v.bp} mmHg`});
  return out;
}

// ── PDF builder ──────────────────────────────────────────────────
function buildPDF(data, N, F) {
  const v=data.vitals||{};
  const bmi=v.bmi||calcBMI(v.weight,v.height);
  const now=new Date().toLocaleString("en-GB",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"});
  const today=fmtDate(new Date().toISOString());
  const cc=(data.cc_list||[]).filter(c=>c.symptom);
  const meds=(data.med_list||[]).filter(m=>m.drug);
  const allgs=(data.allergy_list||[]).filter(a=>a.allergen);
  const surgs=(data.psh_list||[]).filter(s=>s.procedure);
  const imp=(data.imp_list||[]).filter(Boolean);
  const ddx=(data.ddx_list||[]).filter(Boolean);

  const vitalBox=(label,val,unit,warn)=>val?`
    <div class="vbox${warn?" warn":""}">
      <div class="vlabel">${label}</div>
      <div class="vval">${val}<span class="vunit"> ${unit}</span></div>
    </div>`:"";

  const sysCard=(title,rows)=>{
    const content=rows.filter(r=>r[1]).map(r=>`<div class="srow"><span class="skey">${r[0]}</span><span class="sval">${r[1]}</span></div>`).join("");
    return content?`<div class="syscard"><div class="systitle">${title}</div>${content}</div>`:"";
  };

  const planBox=(cls,label,body)=>body?`
    <div class="pbox ${cls}">
      <div class="phead">${label}</div>
      <div class="pbody">${body}</div>
    </div>`:"";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>H&P — ${data.name||"Patient"}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
:root{
  --ink:#0f1923;
  --ink2:#3a4a58;
  --muted:#6b7f8e;
  --rule:#dde3ea;
  --bg:#f8fafb;
  --accent:#006d5b;
  --accent-pale:#eaf5f2;
  --danger:#b91c1c;
  --danger-pale:#fef2f2;
  --warn-pale:#fffbeb;
  --warn:#92400e;
}
body{font-family:'Geist',system-ui,sans-serif;font-size:10pt;color:var(--ink);background:#eef1f4;-webkit-print-color-adjust:exact;print-color-adjust:exact;line-height:1.5}
.page{max-width:820px;margin:0 auto;background:#fff}

/* ─ header ─────────────────────────────────────────── */
.hdr{padding:32px 40px 28px;border-bottom:1px solid var(--rule)}
.hdr-top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
.hdr-eyebrow{font-size:8pt;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.hdr-title{font-family:'Instrument Serif',Georgia,serif;font-size:26pt;color:var(--ink);line-height:1;margin-bottom:6px}
.hdr-sub{font-size:8.5pt;color:var(--muted)}
.hdr-meta{text-align:right;font-size:8.5pt;color:var(--muted);line-height:2}
.hdr-meta strong{color:var(--ink2);font-weight:500}
.file-num{display:inline-block;border:1px solid var(--rule);border-radius:4px;padding:3px 10px;font-size:8pt;letter-spacing:1px;color:var(--ink2);margin-top:4px}

/* ─ patient strip ───────────────────────────────────── */
.strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:3px solid var(--accent);border-bottom:1px solid var(--rule)}
.scell{padding:12px 18px;border-right:1px solid var(--rule)}
.scell:last-child{border-right:none}
.slabel{display:block;font-size:7pt;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:3px}
.sval{font-size:10.5pt;font-weight:500;color:var(--ink)}

/* ─ flags ───────────────────────────────────────────── */
.flags{padding:0 40px}
.flag{display:flex;align-items:center;gap:10px;padding:8px 14px;margin-top:10px;border-radius:4px;font-size:8.5pt;font-weight:500}
.flag.crit{background:var(--danger-pale);color:var(--danger);border-left:3px solid var(--danger)}
.flag.warn{background:var(--warn-pale);color:var(--warn);border-left:3px solid #d97706}

/* ─ section band ────────────────────────────────────── */
.band{padding:7px 40px;background:var(--bg);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);font-size:7.5pt;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-top:24px}

/* ─ content ─────────────────────────────────────────── */
.body{padding:0 40px 32px}
.sec{margin-top:24px;page-break-inside:avoid}
.sec-title{font-size:8.5pt;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:var(--accent);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--accent-pale)}

/* ─ prose ───────────────────────────────────────────── */
p.prose{font-family:'Instrument Serif',Georgia,serif;font-size:11pt;line-height:1.85;color:var(--ink);text-align:justify}

/* ─ chief complaints ────────────────────────────────── */
.cc-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px}
.cc-chip{display:flex;align-items:center;gap:8px;border:1px solid var(--rule);border-radius:100px;padding:5px 14px;font-size:9.5pt}
.cc-name{font-weight:500;color:var(--ink)}
.cc-dur{font-size:8.5pt;color:var(--muted)}

/* ─ prior tx ────────────────────────────────────────── */
.prior{margin-top:12px;padding:10px 16px;border-left:2px solid var(--accent);background:var(--accent-pale);font-size:9.5pt}
.prior strong{display:block;font-size:8pt;text-transform:uppercase;letter-spacing:.8px;color:var(--accent);margin-bottom:3px}

/* ─ allergy ─────────────────────────────────────────── */
.allergy-hdr{font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--danger);margin:12px 0 6px}
.allergy-row{display:flex;gap:12px;padding:5px 0;border-bottom:.5px solid var(--rule);font-size:9.5pt}
.allergy-drug{font-weight:600;color:var(--danger);min-width:150px}
.allergy-detail{color:var(--ink2)}

/* ─ tables ──────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:10px}
th{text-align:left;padding:6px 10px;font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);border-bottom:1px solid var(--rule)}
td{padding:6px 10px;border-bottom:.5px solid var(--rule);color:var(--ink2);vertical-align:top}
tr:last-child td{border-bottom:none}

/* ─ vitals ──────────────────────────────────────────── */
.vgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin:10px 0}
.vbox{background:#fff;padding:10px 12px}
.vbox.warn{background:var(--warn-pale)}
.vbox.crit{background:var(--danger-pale)}
.vlabel{font-size:7pt;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:4px}
.vval{font-size:15pt;font-weight:500;color:var(--ink);line-height:1}
.vunit{font-size:8pt;font-weight:400;color:var(--muted)}

/* ─ findings ────────────────────────────────────────── */
.fgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin:10px 0}
.fitem{background:#fff;padding:9px 12px}
.fitem.positive{background:#fffdf0}
.flabel{display:block;font-size:7pt;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:3px}
.fval{font-size:10pt;font-weight:500;color:var(--ink)}

/* ─ systemic exam ───────────────────────────────────── */
.syscard{margin-bottom:10px;page-break-inside:avoid}
.systitle{font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:7px}
.srow{display:grid;grid-template-columns:80px 1fr;gap:8px;padding:4px 0;border-bottom:.5px solid var(--rule);font-size:9.5pt}
.srow:last-child{border-bottom:none}
.skey{font-weight:600;color:var(--ink2)}
.sval{font-family:'Instrument Serif',Georgia,serif;color:var(--ink);line-height:1.5}

/* ─ assessment ──────────────────────────────────────── */
.asmt{background:var(--bg);border:1px solid var(--rule);padding:14px 18px;margin:10px 0}
.asmt p{font-family:'Instrument Serif',Georgia,serif;font-size:11pt;line-height:1.8;color:var(--ink)}
.diag-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}
.diag-label{font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:8px}
.imp-item{display:flex;gap:10px;padding:6px 0;border-bottom:.5px solid var(--rule);align-items:flex-start}
.imp-item:last-child{border-bottom:none}
.imp-n{width:18px;height:18px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:600;flex-shrink:0;margin-top:2px}
.imp-t{font-family:'Instrument Serif',Georgia,serif;font-size:10.5pt;font-weight:400;line-height:1.5}
.ddx-item{display:flex;gap:10px;padding:6px 0;border-bottom:.5px solid var(--rule);align-items:flex-start}
.ddx-item:last-child{border-bottom:none}
.ddx-n{width:18px;height:18px;border-radius:50%;border:1px solid var(--rule);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:8pt;flex-shrink:0;margin-top:2px}
.ddx-t{font-family:'Instrument Serif',Georgia,serif;font-size:10pt;color:var(--ink2);line-height:1.5}

/* ─ plan ────────────────────────────────────────────── */
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.pbox{border:1px solid var(--rule);margin:10px 0}
.phead{padding:7px 14px;font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--rule)}
.pbody{padding:12px 14px;font-family:'Instrument Serif',Georgia,serif;font-size:10pt;line-height:1.8;white-space:pre-line;color:var(--ink2)}
.urgent .phead{color:var(--danger);background:var(--danger-pale)}
.routine .phead{color:#1e40af;background:#eff6ff}
.meds .phead{color:#166534;background:#f0fdf4}
.refs .phead{color:#6b21a8;background:#faf5ff}
.edu .phead{color:var(--accent);background:var(--accent-pale)}

/* ─ outcome row ─────────────────────────────────────── */
.outcome{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.otag{padding:6px 14px;border:1px solid var(--rule);font-size:9.5pt}
.otag strong{color:var(--muted);font-weight:500;margin-right:6px}

/* ─ signature ───────────────────────────────────────── */
.sig{margin-top:32px;padding-top:16px;border-top:1px solid var(--rule);display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px}
.sig-field label{display:block;font-size:8pt;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:4px}
.sig-field span{display:block;font-size:11pt;font-weight:500;color:var(--ink);border-bottom:1px solid var(--ink);padding-bottom:4px;min-height:28px}
.sig-sub{font-size:8.5pt;color:var(--muted);margin-top:4px}

/* ─ footer ──────────────────────────────────────────── */
.ftr{padding:12px 40px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;font-size:8pt;color:var(--muted)}
.ftr strong{font-weight:600;color:var(--ink2)}

/* ─ summary bar ─────────────────────────────────────── */
.snap{padding:10px 40px;background:var(--bg);border-bottom:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.snap-name{font-size:10.5pt;font-weight:500;color:var(--ink)}
.snap-tags{display:flex;gap:6px;flex-wrap:wrap}
.snap-tag{padding:3px 10px;border:1px solid var(--rule);border-radius:100px;font-size:8pt;color:var(--ink2)}

@media print{
  body{background:#fff;font-size:9.5pt}
  .page{box-shadow:none}
  .sec,.syscard,.pbox{page-break-inside:avoid}
  @page{size:A4;margin:14mm 12mm 16mm}
}
</style>
</head>
<body>
<div class="page">

<div class="hdr">
  <div class="hdr-top">
    <div>
      <div class="hdr-eyebrow">AMEXAN · Clinical Documentation</div>
      <div class="hdr-title">History &amp; Physical</div>
      <div class="hdr-sub">Generated ${now}</div>
    </div>
    <div class="hdr-meta">
      <div><strong>${data.hospitalNum||"—"}</strong></div>
      <div>${data.dept||"Internal Medicine"}</div>
      <div>${today}</div>
      <div class="file-num">${data.hospitalNum||"AMEXAN"}</div>
    </div>
  </div>
</div>

<div class="snap">
  <div class="snap-name">${data.name||"—"} &nbsp;·&nbsp; ${data.age||"?"} ${data.ageUnit||""} ${data.gender||""} &nbsp;·&nbsp; ${data.occupation||""}</div>
  <div class="snap-tags">
    ${imp.slice(0,2).map(i=>`<span class="snap-tag">${i.replace(/—.*/,"").trim()}</span>`).join("")}
    ${data.plan_disposition?`<span class="snap-tag">${data.plan_disposition}</span>`:""}
  </div>
</div>

<div class="strip">
  <div class="scell"><span class="slabel">Patient</span><span class="sval">${data.name||"—"}</span></div>
  <div class="scell"><span class="slabel">Age / Sex</span><span class="sval">${data.age||"—"} ${data.ageUnit||""} / ${data.gender||"—"}</span></div>
  <div class="scell"><span class="slabel">Date of birth</span><span class="sval">${fmtDate(data.dob)||"—"}</span></div>
  <div class="scell"><span class="slabel">Blood group</span><span class="sval">${data.bloodGroup||"—"}</span></div>
  <div class="scell"><span class="slabel">Occupation</span><span class="sval">${data.occupation||"—"}</span></div>
  <div class="scell"><span class="slabel">Contact</span><span class="sval">${data.phone||"—"}</span></div>
  <div class="scell"><span class="slabel">Address</span><span class="sval">${data.address||"—"}</span></div>
  <div class="scell"><span class="slabel">Informant</span><span class="sval">${data.informant||"—"}${data.reliability?` (${data.reliability})`:""}</span></div>
</div>

${F.length?`<div class="flags">${F.map(f=>`<div class="flag ${f.lvl}">${f.lvl==="crit"?"⚠":"–"} ${f.txt}</div>`).join("")}</div>`:""}

<div class="band">Section I — Clinical History</div>
<div class="body">

  <div class="sec">
    <div class="sec-title">Chief Complaint</div>
    <div class="cc-row">${cc.map(c=>`<div class="cc-chip"><span class="cc-name">${c.symptom}</span><span class="cc-dur">${c.duration}</span></div>`).join("")}</div>
  </div>

  <div class="sec">
    <div class="sec-title">History of Presenting Illness</div>
    <p class="prose">${N.hpi}</p>
    ${data.hpi_prev_tx?`<div class="prior"><strong>Prior treatment</strong>${data.hpi_prev_tx}</div>`:""}
  </div>

  <div class="sec">
    <div class="sec-title">Past Medical &amp; Surgical History</div>
    <p class="prose">${N.pmh}</p>
    ${surgs.length?`<table><thead><tr><th>Procedure</th><th>Date</th><th>Hospital</th><th>Complications</th></tr></thead><tbody>${surgs.map(s=>`<tr><td>${s.procedure}</td><td>${s.date||"—"}</td><td>${s.hospital||"—"}</td><td>${s.complication||"None"}</td></tr>`).join("")}</tbody></table>`:""}
  </div>

  <div class="sec">
    <div class="sec-title">Drug History &amp; Allergies</div>
    <p class="prose">${N.drugs}</p>
    ${meds.length?`<table><thead><tr><th>Drug</th><th>Dose</th><th>Frequency</th><th>Route</th><th>Duration</th></tr></thead><tbody>${meds.map(m=>`<tr><td>${m.drug}</td><td>${m.dose||"—"}</td><td>${m.freq||"—"}</td><td>${m.route||"—"}</td><td>${m.duration||"—"}</td></tr>`).join("")}</tbody></table>`:""}
    ${allgs.length?`<div class="allergy-hdr">⚠ Documented allergies — flag in all records</div>${allgs.map(a=>`<div class="allergy-row"><span class="allergy-drug">${a.allergen}</span><span class="allergy-detail">${a.reaction} · Severity: ${a.severity}</span></div>`).join("")}`:""}
  </div>

  <div class="sec">
    <div class="sec-title">Family History</div>
    <p class="prose">${N.family}</p>
  </div>

  <div class="sec">
    <div class="sec-title">Social History</div>
    <p class="prose">${N.social}</p>
  </div>

  <div class="sec">
    <div class="sec-title">Review of Systems</div>
    <p class="prose">${N.ros}</p>
    ${data.sumhist?`<div class="prior" style="margin-top:12px"><strong>Summary</strong>${data.sumhist}</div>`:""}
  </div>

</div>

<div class="band">Section II — Examination</div>
<div class="body">

  <div class="sec">
    <div class="sec-title">General Examination &amp; Vital Signs</div>
    <div class="fgrid">
      <div class="fitem"><span class="flabel">Appearance</span><span class="fval">${v.appearance||"—"}</span></div>
      <div class="fitem"><span class="flabel">Consciousness</span><span class="fval">${v.consciousness||"—"}</span></div>
      <div class="fitem${v.pallor&&v.pallor!=="None"?" positive":""}"><span class="flabel">Pallor</span><span class="fval">${v.pallor||"None"}</span></div>
      <div class="fitem${v.jaundice&&v.jaundice!=="None"?" positive":""}"><span class="flabel">Jaundice</span><span class="fval">${v.jaundice||"Absent"}</span></div>
      <div class="fitem${v.cyanosis&&v.cyanosis!=="None"?" positive":""}"><span class="flabel">Cyanosis</span><span class="fval">${v.cyanosis||"Absent"}</span></div>
      <div class="fitem${v.oedema&&v.oedema!=="None"?" positive":""}"><span class="flabel">Oedema</span><span class="fval">${v.oedema||"None"}</span></div>
      <div class="fitem${v.lymph&&v.lymph!=="None"?" positive":""}"><span class="flabel">Lymphadenopathy</span><span class="fval">${v.lymph||"Absent"}</span></div>
      <div class="fitem${v.clubbing&&v.clubbing!=="None"?" positive":""}"><span class="flabel">Clubbing</span><span class="fval">${v.clubbing||"Absent"}</span></div>
    </div>
    <div class="vgrid">
      ${vitalBox("Heart Rate",v.pulse,"bpm",parseFloat(v.pulse)>100||parseFloat(v.pulse)<60)}
      ${vitalBox("Blood Pressure",v.bp,"mmHg",false)}
      ${vitalBox("Resp. Rate",v.rr,"/min",parseFloat(v.rr)>20)}
      ${vitalBox("SpO₂",v.spo2,"%",parseFloat(v.spo2)<94)}
      ${vitalBox("Temperature",v.temp,"°C",parseFloat(v.temp)>38)}
      ${vitalBox("Weight",v.weight,"kg",false)}
      ${vitalBox("Height",v.height,"cm",false)}
      ${bmi?vitalBox("BMI",bmi,bmiTag(bmi),parseFloat(bmi)<18.5||parseFloat(bmi)>=30):""}
      ${vitalBox("Pain",v.pain_score,"/10",parseFloat(v.pain_score)>6)}
      ${v.o2_req?vitalBox("O₂",v.o2_req,"",false):""}
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">Systemic Examination</div>
    <p class="prose">${N.exam}</p>
    ${sysCard("Respiratory",[["Inspection",data.sysex_resp_inspection],["Palpation",data.sysex_resp_palpation],["Percussion",data.sysex_resp_percussion],["Auscultation",data.sysex_resp_auscultation]])}
    ${sysCard("Cardiovascular",[["Inspection",data.sysex_cvs_inspection],["Auscultation",data.sysex_cvs_auscultation]])}
    ${sysCard("Abdomen",[["Inspection",data.sysex_abdomen_inspection],["Palpation",data.sysex_abdomen_palpation],["Auscultation",data.sysex_abdomen_auscultation]])}
    ${data.sysex_other?sysCard("Other",[[" ",data.sysex_other]]):""}
  </div>

</div>

<div class="band">Section III — Assessment &amp; Management</div>
<div class="body">

  <div class="sec">
    <div class="sec-title">Clinical Assessment</div>
    <div class="asmt"><p>${N.assessment}</p></div>
    <div class="diag-cols">
      <div>
        <div class="diag-label">Working diagnosis</div>
        ${imp.map((t,i)=>`<div class="imp-item"><span class="imp-n">${i+1}</span><span class="imp-t">${t}</span></div>`).join("")}
      </div>
      <div>
        <div class="diag-label">Differentials</div>
        ${ddx.map((t,i)=>`<div class="ddx-item"><span class="ddx-n">${i+1}</span><span class="ddx-t">${t}</span></div>`).join("")}
      </div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">Management Plan</div>
    <div class="pgrid">
      ${planBox("urgent","Urgent investigations",data.plan_invx_urgent)}
      ${planBox("routine","Routine investigations",data.plan_invx_routine)}
    </div>
    ${planBox("meds","Medications &amp; prescriptions",data.plan_meds)}
    ${planBox("refs","Referrals &amp; notifications",[data.plan_ref_internal,data.plan_ref_external].filter(Boolean).join("\n"))}
    ${planBox("edu","Patient education &amp; counselling",data.plan_edu)}
    <div class="outcome">
      ${data.plan_followup?`<div class="otag"><strong>Follow-up</strong>${data.plan_followup}${data.plan_followup_detail?" — "+data.plan_followup_detail:""}</div>`:""}
      ${data.plan_disposition?`<div class="otag"><strong>Disposition</strong>${data.plan_disposition}</div>`:""}
    </div>
  </div>

  <div class="sig">
    <div class="sig-field"><label>Clinician</label><span>${data.sign_doctor||""}</span><div class="sig-sub">${data.sign_designation||""}</div></div>
    <div class="sig-field"><label>Signature &amp; stamp</label><span style="height:44px"></span></div>
    <div class="sig-field"><label>Date &amp; time</label><span>${fmtDT(data.sign_datetime)||""}</span></div>
  </div>

</div>

<div class="ftr">
  <div>AMEXAN Clinical Documentation System &nbsp;·&nbsp; Confidential Medical Record &nbsp;·&nbsp; Verify all entries before clinical action</div>
  <div>${data.hospitalNum||"—"} &nbsp;·&nbsp; ${today}</div>
</div>

</div>
</body>
</html>`;
}

// ── component ─────────────────────────────────────────────────────
export default function AMEXAN({ patientData }) {
  const data = patientData || DEMO;
  const [status, setStatus] = useState("idle");
  const [html, setHtml] = useState("");
  const iRef = useRef(null);

  const bmi = data.vitals?.bmi || calcBMI(data.vitals?.weight, data.vitals?.height);
  const cc = (data.cc_list||[]).filter(c=>c.symptom);
  const F = flags(data);

  const generate = useCallback(() => {
    setStatus("building");
    setTimeout(() => {
      try {
        const N = narrate(data);
        setHtml(buildPDF(data, N, F));
        setStatus("preview");
      } catch(e) { console.error(e); setStatus("error"); }
    }, 60);
  }, [data]);

  const print = () => iRef.current?.contentWindow.print();
  const download = () => {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([html],{type:"text/html"})), download: `HP-${(data.name||"patient").replace(/\s+/g,"-").toLowerCase()}.html` });
    a.click();
  };

  // shared button style
  const Btn = ({label, onClick, primary}) => (
    <button onClick={onClick} style={{
      padding: "8px 16px", border: primary ? "none" : "1px solid #dde3ea",
      borderRadius: 6, background: primary ? "#0f1923" : "#fff",
      color: primary ? "#fff" : "#0f1923", fontFamily: "inherit",
      fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: ".2px",
    }}>{label}</button>
  );

  const metaBox = (label, value) => (
    <div key={label} style={{ padding: "9px 13px", background: "#f8fafb", border: "1px solid #eaecef", borderRadius: 6 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#8a9aaa", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0f1923" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Geist','Inter',system-ui,sans-serif", maxWidth: 940, margin: "0 auto", padding: "1rem 0", color: "#0f1923" }}>

      {/* toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#fff", border: "1px solid #dde3ea", borderRadius: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: ".2px" }}>AMEXAN — Clinical Documentation Engine</div>
          <div style={{ fontSize: 11, color: "#8a9aaa", marginTop: 2 }}>Local · Narrative synthesis · Print-ready PDF</div>
        </div>
        {status === "preview" && <><Btn label="Print / Save PDF" onClick={print} primary /><Btn label="Download HTML" onClick={download} /><Btn label="Reset" onClick={() => { setStatus("idle"); setHtml(""); }} /></>}
        {(status === "idle" || status === "error") && <Btn label="Generate Document" onClick={generate} primary />}
        {status === "building" && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#006d5b", fontWeight: 500 }}>
          <span style={{ width: 14, height: 14, border: "2px solid #eaf5f2", borderTopColor: "#006d5b", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
          Building…
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>}
      </div>

      {/* patient summary — only when not in preview */}
      {status !== "preview" && (
        <div style={{ background: "#fff", border: "1px solid #dde3ea", borderRadius: 8, padding: "16px", marginBottom: 10 }}>

          {/* red flags */}
          {F.map((f,i) => (
            <div key={i} style={{
              display: "flex", gap: 10, padding: "7px 12px", marginBottom: 8,
              borderLeft: `3px solid ${f.lvl === "crit" ? "#b91c1c" : "#d97706"}`,
              background: f.lvl === "crit" ? "#fef2f2" : "#fffbeb",
              color: f.lvl === "crit" ? "#b91c1c" : "#92400e",
              fontSize: 12, fontWeight: 500,
            }}>⚠ {f.txt}</div>
          ))}

          {/* demographics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 14 }}>
            {metaBox("Patient", data.name)}
            {metaBox("Age / Sex", `${data.age} ${data.ageUnit} / ${data.gender}`)}
            {metaBox("Hospital No.", data.hospitalNum)}
            {metaBox("Department", data.dept)}
            {metaBox("Blood Group", data.bloodGroup)}
            {metaBox("BMI", bmi ? `${bmi} (${bmiTag(bmi)})` : null)}
            {metaBox("Clinician", data.sign_doctor)}
            {metaBox("Disposition", data.plan_disposition)}
          </div>

          {/* chief complaints */}
          <div style={{ borderTop: "1px solid #eaecef", paddingTop: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#8a9aaa", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>Chief Complaints</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cc.map((c, i) => (
                <span key={i} style={{ border: "1px solid #dde3ea", borderRadius: 100, padding: "4px 14px", fontSize: 12, fontWeight: 500 }}>
                  {c.symptom} <span style={{ color: "#8a9aaa" }}>· {c.duration}</span>
                </span>
              ))}
            </div>
          </div>

          {/* vitals */}
          <div style={{ borderTop: "1px solid #eaecef", paddingTop: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#8a9aaa", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>Vital Signs</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { l: "HR", v: data.vitals?.pulse, u: "bpm", w: parseFloat(data.vitals?.pulse)>100||parseFloat(data.vitals?.pulse)<60 },
                { l: "BP", v: data.vitals?.bp, u: "mmHg" },
                { l: "RR", v: data.vitals?.rr, u: "/min", w: parseFloat(data.vitals?.rr)>20 },
                { l: "SpO₂", v: data.vitals?.spo2, u: "%", w: parseFloat(data.vitals?.spo2)<94 },
                { l: "Temp", v: data.vitals?.temp, u: "°C", w: parseFloat(data.vitals?.temp)>38 },
                { l: "Pain", v: data.vitals?.pain_score, u: "/10", w: parseFloat(data.vitals?.pain_score)>6 },
              ].filter(x=>x.v).map(x => (
                <div key={x.l} style={{ border: `1px solid ${x.w?"#fecaca":"#dde3ea"}`, borderRadius: 6, padding: "6px 12px", background: x.w ? "#fef2f2" : "#f8fafb", textAlign: "center", minWidth: 66 }}>
                  <div style={{ fontSize: 9, color: x.w ? "#b91c1c" : "#8a9aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>{x.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: x.w ? "#b91c1c" : "#0f1923", lineHeight: 1.2 }}>
                    {x.v}<span style={{ fontSize: 9, fontWeight: 400 }}> {x.u}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* impression */}
          <div style={{ borderTop: "1px solid #eaecef", paddingTop: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#8a9aaa", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>Clinical Impression</div>
            {(data.imp_list||[]).filter(Boolean).map((t,i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 13, alignItems: "flex-start" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#0f1923", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i+1}</span>
                <span style={{ fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* error */}
      {status === "error" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 10, fontSize: 13, color: "#b91c1c" }}>
          Document generation failed. Check console for details.
        </div>
      )}

      {/* preview */}
      {status === "preview" && html && (
        <div style={{ background: "#fff", border: "1px solid #dde3ea", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "9px 14px", background: "#f8fafb", borderBottom: "1px solid #dde3ea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Preview <span style={{ fontSize: 11, color: "#006d5b", marginLeft: 8, background: "#eaf5f2", padding: "2px 8px", borderRadius: 100 }}>Ready to print</span></span>
            <div style={{ display: "flex", gap: 7 }}><Btn label="Print / PDF" onClick={print} primary /><Btn label="Download" onClick={download} /></div>
          </div>
          <iframe ref={iRef} srcDoc={html} style={{ width: "100%", height: 900, border: "none", display: "block" }} title="Clinical Document" />
        </div>
      )}

      {/* idle hint */}
      {status === "idle" && (
        <div style={{ padding: "12px 16px", background: "#f8fafb", border: "1px solid #eaecef", borderRadius: 8, fontSize: 12, color: "#8a9aaa" }}>
          Pass your form state as <code style={{ fontFamily: "monospace", background: "#eaecef", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>patientData</code> prop, or click Generate to render the demo patient.
        </div>
      )}

    </div>
  );
}