"use client";
// ─────────────────────────────────────────────────────────────────────────────
// AMEXAN · DoctorServicesPage.jsx  →  components/DoctorServicesPage.jsx
// Full inline service creation + management. NO MODALS.
// Uses YOUR `services` Firestore collection exactly as structured.
// Doctor's photoUuid and bannerUuid stored via Uploadcare.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const UC_KEY = "205b104100680fa4f052";
const UC = (uuid, w=200, h=200) =>
  uuid ? `https://ucarecdn.com/${uuid}/-/scale_crop/${w}x${h}/center/-/format/webp/` : null;
const fmt = (n) => new Intl.NumberFormat("en-KE").format(n ?? 0);

const SPECIALTIES = ["General Practice","Paediatrics","Gynaecology","Obstetrics","Dermatology","Cardiology","Psychiatry","Orthopaedics","ENT","Ophthalmology","Neurology","Urology","Oncology","Endocrinology","Nephrology","Gastroenterology","Pulmonology","Rheumatology","Nutrition & Dietetics","Physiotherapy","Dental","Radiology","Pathology","Emergency Medicine","Internal Medicine","Surgery"];
const DURATIONS = [15,20,30,45,60,90,120];
const SUGGESTED_TAGS = ["Video call","Follow-up","First visit","Prescription refill","Lab review","Emergency","Chronic disease","Maternal health","Mental wellness","Vaccination"];

const BLANK_FORM = {
  specialty:"", clinic:"", price:"", duration:30,
  location:"", yearsExperience:"", description:"",
  tagInput:"", tags:[], isAvailable:true,
  teleconsult:false, acceptsInsurance:false,
  photoUuid:"", bannerUuid:"",
  phone:"", address:"", email:"",
};

// ── Uploadcare widget loader ──────────────────────────────────────────────────
function UCWidget({ label, value, onDone, ratio = "1:1" }) {
  const ref = useRef(null);
  const [status, setStatus] = useState(value ? "done" : "idle");
  const [preview, setPreview] = useState(value ? UC(value,200,200) : null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const script = document.getElementById("uc-script");
    const load = () => {
      if (!window.uploadcare || !ref.current) return;
      const widget = window.uploadcare.Widget(ref.current);
      widget.onChange(file => {
        if (!file) return;
        setStatus("uploading");
        file.done(info => {
          setStatus("done");
          setPreview(UC(info.uuid,200,200));
          onDone(info.uuid);
        });
      });
    };
    if (!script) {
      const s = document.createElement("script");
      s.id = "uc-script";
      s.src = "https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js";
      s.charset = "utf-8";
      s.onload = load;
      document.body.appendChild(s);
    } else if (window.uploadcare) load();
    else script.addEventListener("load", load);
  }, []);

  return (
    <div className="uc-wrap">
      {preview && (
        <div className="uc-preview" style={{backgroundImage:`url(${preview})`,aspectRatio:ratio==="16:9"?"16/9":"1/1"}}/>
      )}
      <div className="uc-label-row">
        <span className="uc-label">{label}</span>
        {status==="uploading"&&<span className="uc-status">Uploading…</span>}
        {status==="done"&&<span className="uc-status done">✓ Uploaded</span>}
      </div>
      <input
        ref={ref}
        type="hidden"
        data-public-key={UC_KEY}
        data-images-only="true"
        data-preview-step="true"
        data-crop={ratio}
        role="uploadcare-uploader"
      />
      <label className="uc-trigger" htmlFor="">
        <span>📷 {value ? "Change photo" : `Upload ${label}`}</span>
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DoctorServicesPage({ doctorId, doctorName = "" }) {
  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [view,        setView]        = useState("list");   // "list" | "create" | "edit"
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState({...BLANK_FORM, clinic: doctorName ? `Dr. ${doctorName}'s Clinic` : ""});
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [toggling,    setToggling]    = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [saved,       setSaved]       = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (!doctorId) return;
    const q = query(collection(db,"services"), where("doctorId","==",doctorId));
    return onSnapshot(q, (snap) => {
      setServices(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    });
  }, [doctorId]);

  const set = (k, v) => setForm(f=>({...f,[k]:v}));

  const startEdit = (svc) => {
    setForm({
      specialty:       svc.specialty       || "",
      clinic:          svc.clinic          || "",
      price:           svc.price           || "",
      duration:        svc.duration        || 30,
      location:        svc.location        || "",
      yearsExperience: svc.yearsExperience || "",
      description:     svc.description    || "",
      tagInput:        "",
      tags:            svc.tags            || [],
      isAvailable:     svc.isAvailable     ?? true,
      teleconsult:     svc.teleconsult     || false,
      acceptsInsurance:svc.acceptsInsurance|| false,
      photoUuid:       svc.photoUuid       || "",
      bannerUuid:      svc.bannerUuid      || "",
      phone:           svc.phone           || "",
      address:         svc.address         || "",
      email:           svc.email           || "",
    });
    setEditId(svc.id);
    setView("edit");
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 100);
  };

  const startCreate = () => {
    setForm({...BLANK_FORM});
    setEditId(null);
    setError("");
    setSaved(false);
    setView("create");
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 100);
  };

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags",[...form.tags,t]);
    set("tagInput","");
  };
  const removeTag = (t) => set("tags",form.tags.filter(x=>x!==t));

  const validate = () => {
    if (!form.specialty.trim()) return "Specialty is required.";
    if (!form.clinic.trim())    return "Clinic / practice name is required.";
    if (!form.price || Number(form.price)<=0) return "Enter a valid consultation fee.";
    return null;
  };

  const handleSave = async () => {
    const err = validate(); if (err) { setError(err); return; }
    setSaving(true); setError("");
    const payload = {
      specialty:       form.specialty.trim(),
      clinic:          form.clinic.trim(),
      price:           Number(form.price),
      duration:        Number(form.duration),
      description:     form.description.trim(),
      location:        form.location.trim(),
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
      tags:            form.tags,
      isAvailable:     form.isAvailable,
      teleconsult:     form.teleconsult,
      acceptsInsurance:form.acceptsInsurance,
      photoUuid:       form.photoUuid || null,
      bannerUuid:      form.bannerUuid|| null,
      phone:           form.phone.trim(),
      address:         form.address.trim(),
      email:           form.email.trim(),
      doctorId,
      doctorName,
    };
    try {
      if (editId) {
        await updateDoc(doc(db,"services",editId), {...payload, updatedAt: serverTimestamp()});
      } else {
        await addDoc(collection(db,"services"), {...payload, createdAt: serverTimestamp()});
      }
      setSaved(true);
      setTimeout(()=>{setSaved(false);setView("list");},1800);
    } catch(e) { setError(e.message || "Failed to save. Please try again."); }
    setSaving(false);
  };

  const toggleAvail = async (svc) => {
    setToggling(svc.id);
    await updateDoc(doc(db,"services",svc.id), {isAvailable: !svc.isAvailable});
    setToggling(null);
  };

  const handleDelete = async (id) => {
    if (deleteId !== id) { setDeleteId(id); return; }
    await deleteDoc(doc(db,"services",id));
    setDeleteId(null);
  };

  return (
    <div className="sp-page">
      <style>{CSS}</style>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="sp-header">
        <div>
          <h1 className="sp-title">My Services & Clinics</h1>
          <p className="sp-sub">{services.filter(s=>s.isAvailable).length} of {services.length} services visible to patients</p>
        </div>
        {view==="list" && (
          <button className="sp-btn-create" onClick={startCreate}>+ New Service</button>
        )}
        {(view==="create"||view==="edit") && (
          <button className="sp-btn-ghost" onClick={()=>{setView("list");setEditId(null);setError("");}}>← Cancel</button>
        )}
      </div>

      {/* ── CREATE / EDIT FORM (inline, no modal) ─────────────────────────── */}
      {(view==="create"||view==="edit") && (
        <div className="sp-form-card" ref={formRef}>
          <div className="sp-form-title">
            {view==="edit" ? `✏️ Editing: ${form.specialty||"Service"}` : "🏥 Create New Service"}
          </div>
          <div className="sp-form-sub">
            {view==="create" ? "This will be visible to patients once you set it live." : "Changes save immediately after confirming."}
          </div>

          {/* ── Photos row ── */}
          <div className="sp-photos-row">
            <div className="sp-photo-col">
              <div className="sp-flabel">Profile Photo</div>
              <div className="sp-photo-upload">
                {form.photoUuid
                  ? <img src={UC(form.photoUuid,200,200)} alt="" className="sp-photo-preview"/>
                  : <div className="sp-photo-placeholder">👤</div>
                }
                <label className="sp-upload-btn">
                  📷 {form.photoUuid?"Change":"Upload Photo"}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                    const file = e.target.files?.[0]; if(!file) return;
                    const fd = new FormData(); fd.append("UPLOADCARE_PUB_KEY", UC_KEY); fd.append("file", file);
                    try {
                      const r = await fetch("https://upload.uploadcare.com/base/", {method:"POST",body:fd});
                      const j = await r.json(); if(j.file) set("photoUuid", j.file);
                    } catch(err){console.error(err);}
                  }}/>
                </label>
              </div>
            </div>
            <div className="sp-photo-col sp-banner-col">
              <div className="sp-flabel">Clinic Banner</div>
              <div className="sp-banner-upload">
                {form.bannerUuid
                  ? <img src={UC(form.bannerUuid,800,200)} alt="" className="sp-banner-preview"/>
                  : <div className="sp-banner-placeholder">🖼️ Upload clinic banner (wide image)</div>
                }
                <label className="sp-upload-btn">
                  📷 {form.bannerUuid?"Change Banner":"Upload Banner"}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                    const file = e.target.files?.[0]; if(!file) return;
                    const fd = new FormData(); fd.append("UPLOADCARE_PUB_KEY", UC_KEY); fd.append("file", file);
                    try {
                      const r = await fetch("https://upload.uploadcare.com/base/", {method:"POST",body:fd});
                      const j = await r.json(); if(j.file) set("bannerUuid", j.file);
                    } catch(err){console.error(err);}
                  }}/>
                </label>
              </div>
            </div>
          </div>

          <div className="sp-divider"/>

          {/* ── Core fields ── */}
          <div className="sp-grid-2">
            <div className="sp-field">
              <label className="sp-flabel">Specialty / Service Name *</label>
              <input list="sp-specs" className="sp-input" value={form.specialty} onChange={e=>set("specialty",e.target.value)} placeholder="e.g. Cardiology"/>
              <datalist id="sp-specs">{SPECIALTIES.map(s=><option key={s} value={s}/>)}</datalist>
            </div>
            <div className="sp-field">
              <label className="sp-flabel">Clinic / Practice Name *</label>
              <input className="sp-input" value={form.clinic} onChange={e=>set("clinic",e.target.value)} placeholder="e.g. Nairobi Heart Centre"/>
            </div>
          </div>

          <div className="sp-grid-3">
            <div className="sp-field">
              <label className="sp-flabel">Consultation Fee (KES) *</label>
              <input className="sp-input" type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="e.g. 3500"/>
            </div>
            <div className="sp-field">
              <label className="sp-flabel">Duration (minutes)</label>
              <select className="sp-input" value={form.duration} onChange={e=>set("duration",Number(e.target.value))}>
                {DURATIONS.map(d=><option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="sp-field">
              <label className="sp-flabel">Years of Experience</label>
              <input className="sp-input" type="number" min="0" value={form.yearsExperience} onChange={e=>set("yearsExperience",e.target.value)} placeholder="e.g. 12"/>
            </div>
          </div>

          <div className="sp-grid-2">
            <div className="sp-field">
              <label className="sp-flabel">Location</label>
              <input className="sp-input" value={form.location} onChange={e=>set("location",e.target.value)} placeholder="e.g. Upper Hill, Nairobi"/>
            </div>
            <div className="sp-field">
              <label className="sp-flabel">Clinic Address</label>
              <input className="sp-input" value={form.address} onChange={e=>set("address",e.target.value)} placeholder="e.g. 5th Floor, Britam Towers"/>
            </div>
          </div>

          <div className="sp-grid-2">
            <div className="sp-field">
              <label className="sp-flabel">Clinic Phone</label>
              <input className="sp-input" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+254 7XX XXX XXX"/>
            </div>
            <div className="sp-field">
              <label className="sp-flabel">Clinic Email</label>
              <input className="sp-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="clinic@example.com"/>
            </div>
          </div>

          <div className="sp-field">
            <label className="sp-flabel">Description (what patients can expect)</label>
            <textarea className="sp-input sp-textarea" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe this service, what conditions you treat, what the consultation involves…"/>
          </div>

          {/* ── Tags ── */}
          <div className="sp-field">
            <label className="sp-flabel">Tags</label>
            <div className="sp-suggested-tags">
              {SUGGESTED_TAGS.filter(t=>!form.tags.includes(t)).map(t=>(
                <button key={t} type="button" className="sp-sug-tag" onClick={()=>set("tags",[...form.tags,t])}>+ {t}</button>
              ))}
            </div>
            {form.tags.length>0 && (
              <div className="sp-active-tags">
                {form.tags.map(t=>(
                  <span key={t} className="sp-active-tag">
                    {t}
                    <button onClick={()=>removeTag(t)} className="sp-tag-x">✕</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input className="sp-input" style={{flex:1}} value={form.tagInput} onChange={e=>set("tagInput",e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTag();}}} placeholder="Custom tag — press Enter"/>
              <button type="button" className="sp-btn-add-tag" onClick={addTag}>Add</button>
            </div>
          </div>

          <div className="sp-divider"/>

          {/* ── Toggles ── */}
          <div className="sp-toggles-row">
            {[
              {key:"isAvailable",  icon:"🟢", label:"Visible to Patients", sub:"Patients can see and book this service"},
              {key:"teleconsult",  icon:"📹", label:"Teleconsult Available",sub:"Offer video / online consultations"},
              {key:"acceptsInsurance",icon:"🏥",label:"Accepts Insurance",  sub:"NHIF, private insurers accepted"},
            ].map(t=>(
              <div key={t.key} className="sp-toggle-row">
                <span className="sp-toggle-icon">{t.icon}</span>
                <div style={{flex:1}}>
                  <div className="sp-toggle-label">{t.label}</div>
                  <div className="sp-toggle-sub">{t.sub}</div>
                </div>
                <button
                  type="button"
                  className={`sp-toggle${form[t.key]?" on":""}`}
                  onClick={()=>set(t.key,!form[t.key])}
                >
                  <span className="sp-toggle-knob"/>
                </button>
              </div>
            ))}
          </div>

          {error && <div className="sp-error">{error}</div>}
          {saved  && <div className="sp-success">✓ {view==="edit"?"Changes saved!":"Service created!"} Returning to list…</div>}

          <div className="sp-form-actions">
            <button className="sp-btn-ghost" onClick={()=>{setView("list");setEditId(null);setError("");}}>Cancel</button>
            <button className="sp-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : view==="edit" ? "💾 Save Changes" : "🚀 Create Service"}
            </button>
          </div>
        </div>
      )}

      {/* ── SERVICE LIST ──────────────────────────────────────────────────── */}
      {view==="list" && (
        <>
          {loading && (
            <div className="sp-svc-grid">
              {[1,2,3].map(i=><div key={i} className="sp-skel-card"/>)}
            </div>
          )}

          {!loading && services.length===0 && (
            <div className="sp-empty">
              <div style={{fontSize:52,marginBottom:14}}>🏥</div>
              <div className="sp-empty-title">No services yet</div>
              <div className="sp-empty-sub">Create your first service so patients can find and book you.</div>
              <button className="sp-btn-create" onClick={startCreate}>+ Create First Service</button>
            </div>
          )}

          {!loading && services.length>0 && (
            <div className="sp-svc-grid">
              {services.map(svc=>{
                const photo = UC(svc.photoUuid, 160, 160);
                return (
                  <div key={svc.id} className={`sp-svc-card${!svc.isAvailable?" paused":""}`}>
                    {/* Card top */}
                    <div className="sp-sc-banner" style={svc.bannerUuid?{backgroundImage:`url(${UC(svc.bannerUuid,800,200)})`}:{}}>
                      <div className="sp-sc-banner-ov"/>
                      <div className={`sp-sc-status${svc.isAvailable?" live":""}`}>
                        {svc.isAvailable?"● Live":"⏸ Paused"}
                      </div>
                    </div>

                    {/* Photo */}
                    <div className="sp-sc-photo-wrap">
                      <div className="sp-sc-photo">
                        {photo ? <img src={photo} alt="" className="sp-sc-photo-img"/> : <span className="sp-sc-init">{(svc.doctorName||"D")[0]}</span>}
                      </div>
                    </div>

                    <div className="sp-sc-body">
                      <div className="sp-sc-spec">{svc.specialty}</div>
                      <div className="sp-sc-name">{svc.clinic}</div>
                      <div className="sp-sc-price">KES {fmt(svc.price)}</div>
                      <div className="sp-sc-meta">
                        {svc.location && <span>📍 {svc.location}</span>}
                        {svc.duration && <span>⏱ {svc.duration}m</span>}
                        {svc.yearsExperience && <span>🏆 {svc.yearsExperience}y</span>}
                        {svc.acceptsInsurance && <span>🏥 Insurance</span>}
                        {svc.teleconsult && <span>📹 Teleconsult</span>}
                      </div>
                      {svc.tags?.length>0 && (
                        <div className="sp-sc-tags">
                          {svc.tags.slice(0,3).map(t=><span key={t} className="sp-sc-tag">{t}</span>)}
                          {svc.tags.length>3 && <span className="sp-sc-tag">+{svc.tags.length-3}</span>}
                        </div>
                      )}
                      {svc.description && <p className="sp-sc-desc">{svc.description.slice(0,90)}{svc.description.length>90?"…":""}</p>}
                    </div>

                    <div className="sp-sc-footer">
                      <button
                        className={`sp-toggle-avail${svc.isAvailable?" on":""}`}
                        onClick={()=>toggleAvail(svc)}
                        disabled={toggling===svc.id}
                      >
                        {toggling===svc.id?"…":svc.isAvailable?"Pause":"Go Live"}
                      </button>
                      <button className="sp-btn-edit" onClick={()=>startEdit(svc)}>✏️ Edit</button>
                      <button
                        className={`sp-btn-del${deleteId===svc.id?" confirm":""}`}
                        onClick={()=>handleDelete(svc.id)}
                      >
                        {deleteId===svc.id?"Confirm delete":"🗑️"}
                      </button>
                    </div>

                    {deleteId===svc.id && (
                      <div className="sp-del-confirm">
                        <span>Delete "{svc.specialty}"? This cannot be undone.</span>
                        <div style={{display:"flex",gap:8,marginTop:10}}>
                          <button className="sp-btn-del confirm" onClick={()=>handleDelete(svc.id)}>Yes, Delete</button>
                          <button className="sp-btn-edit" onClick={()=>setDeleteId(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box}

.sp-page{font-family:'DM Sans',sans-serif;max-width:1100px;padding:0 0 64px}

.sp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
.sp-title{font-size:24px;font-weight:800;color:#0f172a;margin:0 0 4px;font-family:'Sora',sans-serif}
.sp-sub{font-size:13px;color:#94a3b8;margin:0}

.sp-btn-create{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;box-shadow:0 2px 12px rgba(14,165,233,.25)}
.sp-btn-create:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(14,165,233,.4)}
.sp-btn-ghost{background:transparent;color:#374151;border:1.5px solid #d1d5db;border-radius:12px;padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
.sp-btn-ghost:hover{background:#f8fafc}
.sp-btn-save{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:12px;padding:13px 32px;font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;box-shadow:0 2px 12px rgba(14,165,233,.25);flex:1}
.sp-btn-save:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(14,165,233,.4)}
.sp-btn-save:disabled{opacity:.6;cursor:not-allowed;transform:none}
.sp-btn-add-tag{background:#0ea5e9;color:#fff;border:none;border-radius:10px;padding:11px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap}

/* Form card */
.sp-form-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:32px;margin-bottom:28px;animation:spIn .25s ease}
@keyframes spIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.sp-form-title{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;font-family:'Sora',sans-serif}
.sp-form-sub{font-size:13px;color:#94a3b8;margin-bottom:24px}
.sp-divider{height:1px;background:#f1f5f9;margin:24px 0}

/* Photos */
.sp-photos-row{display:grid;grid-template-columns:160px 1fr;gap:20px;margin-bottom:4px;align-items:start}
.sp-photo-col{}
.sp-banner-col{}
.sp-photo-upload{display:flex;flex-direction:column;align-items:center;gap:10px}
.sp-photo-preview{width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #e5e7eb}
.sp-photo-placeholder{width:120px;height:120px;border-radius:50%;background:#f1f5f9;border:2px dashed #d1d5db;display:flex;align-items:center;justify-content:center;font-size:36px}
.sp-banner-upload{display:flex;flex-direction:column;gap:10px}
.sp-banner-preview{width:100%;height:110px;border-radius:12px;object-fit:cover;border:1px solid #e5e7eb}
.sp-banner-placeholder{width:100%;height:110px;border-radius:12px;background:#f8fafc;border:2px dashed #d1d5db;display:flex;align-items:center;justify-content:center;font-size:14px;color:#94a3b8;gap:8px}
.sp-upload-btn{display:inline-flex;align-items:center;gap:6px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.sp-upload-btn:hover{border-color:#0ea5e9;color:#0284c7;background:#f0f9ff}

/* Form layout */
.sp-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:0}
.sp-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:0}
.sp-field{margin-bottom:16px}
.sp-flabel{font-size:13px;font-weight:700;color:#374151;display:block;margin-bottom:6px}
.sp-input{width:100%;padding:11px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#0f172a;background:#fff;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s}
.sp-input:focus{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.08)}
.sp-textarea{min-height:100px;resize:vertical}

/* Tags */
.sp-suggested-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.sp-sug-tag{padding:5px 12px;background:#f8fafc;border:1.5px dashed #d1d5db;border-radius:9999px;font-size:12px;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
.sp-sug-tag:hover{border-color:#0ea5e9;color:#0284c7;background:#f0f9ff}
.sp-active-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.sp-active-tag{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#6d28d9;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:9999px;padding:4px 10px}
.sp-tag-x{background:none;border:none;cursor:pointer;font-size:11px;color:inherit;padding:0;line-height:1}

/* Toggles */
.sp-toggles-row{display:flex;flex-direction:column;gap:12px;margin-bottom:24px}
.sp-toggle-row{display:flex;align-items:center;gap:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px}
.sp-toggle-icon{font-size:20px;flex-shrink:0}
.sp-toggle-label{font-size:14px;font-weight:700;color:#0f172a}
.sp-toggle-sub{font-size:12px;color:#94a3b8}
.sp-toggle{width:52px;height:28px;border-radius:14px;border:none;cursor:pointer;background:#d1d5db;position:relative;transition:background .2s;flex-shrink:0}
.sp-toggle.on{background:#0ea5e9}
.sp-toggle-knob{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.sp-toggle.on .sp-toggle-knob{left:27px}

.sp-error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:600;margin-bottom:16px}
.sp-success{background:#f0fdf4;border:1px solid #86efac;color:#15803d;border-radius:10px;padding:12px 16px;font-size:13px;font-weight:700;margin-bottom:16px}
.sp-form-actions{display:flex;gap:12px;flex-wrap:wrap}

/* Service card list */
.sp-svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px}
.sp-svc-card{background:#fff;border:1.5px solid #f0f0f0;border-radius:20px;overflow:hidden;transition:box-shadow .2s;position:relative}
.sp-svc-card:hover{box-shadow:0 8px 32px rgba(0,0,0,.08)}
.sp-svc-card.paused{opacity:.7}
.sp-sc-banner{height:90px;position:relative;background:linear-gradient(135deg,#0f172a,#0c4a6e 50%,#0ea5e9);background-size:cover;background-position:center}
.sp-sc-banner-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.4))}
.sp-sc-status{position:absolute;bottom:10px;left:12px;font-size:12px;font-weight:700;color:rgba(255,255,255,.75);z-index:1}
.sp-sc-status.live{color:#86efac}
.sp-sc-photo-wrap{display:flex;justify-content:center;margin-top:-30px;position:relative;z-index:1}
.sp-sc-photo{width:60px;height:60px;border-radius:50%;border:3px solid #fff;overflow:hidden;background:#0ea5e9;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.12)}
.sp-sc-photo-img{width:100%;height:100%;object-fit:cover}
.sp-sc-init{color:#fff;font-size:20px;font-weight:800}
.sp-sc-body{padding:10px 18px 6px}
.sp-sc-spec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0284c7;text-align:center;margin-bottom:3px}
.sp-sc-name{font-size:16px;font-weight:800;color:#0f172a;text-align:center;margin-bottom:4px;font-family:'Sora',sans-serif}
.sp-sc-price{font-size:18px;font-weight:800;color:#0ea5e9;text-align:center;margin-bottom:10px;font-family:'Sora',sans-serif}
.sp-sc-meta{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:12px;color:#64748b;margin-bottom:8px}
.sp-sc-tags{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-bottom:8px}
.sp-sc-tag{font-size:11px;font-weight:600;color:#6d28d9;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:9999px;padding:3px 9px}
.sp-sc-desc{font-size:12px;color:#64748b;line-height:1.6;text-align:center;margin:0 0 4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sp-sc-footer{display:flex;gap:8px;padding:12px 18px 16px;border-top:1px solid #f1f5f9}
.sp-toggle-avail{flex:1;padding:9px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-family:'DM Sans',sans-serif;transition:all .15s}
.sp-toggle-avail.on{background:#f0fdf4;border-color:#86efac;color:#15803d}
.sp-btn-edit{flex:1;padding:9px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid #e2e8f0;background:#fff;color:#374151;font-family:'DM Sans',sans-serif;transition:all .15s}
.sp-btn-edit:hover{border-color:#0ea5e9;color:#0284c7;background:#f0f9ff}
.sp-btn-del{padding:9px 13px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid #e2e8f0;background:#fff;color:#94a3b8;font-family:'DM Sans',sans-serif;transition:all .15s}
.sp-btn-del:hover{border-color:#fca5a5;color:#ef4444;background:#fef2f2}
.sp-btn-del.confirm{border-color:#ef4444;color:#fff;background:#ef4444}
.sp-del-confirm{background:#fef2f2;border-top:1px solid #fecaca;padding:14px 18px;font-size:13px;color:#dc2626;font-weight:600}
.sp-skel-card{height:320px;background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;border-radius:20px;animation:spSh 1.4s infinite}
@keyframes spSh{to{background-position:-200% 0}}
.sp-empty{text-align:center;padding:64px 24px}
.sp-empty-title{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:6px;font-family:'Sora',sans-serif}
.sp-empty-sub{font-size:14px;color:#94a3b8;margin-bottom:24px}
@media(max-width:640px){.sp-grid-2,.sp-grid-3{grid-template-columns:1fr}.sp-photos-row{grid-template-columns:1fr}}
`;