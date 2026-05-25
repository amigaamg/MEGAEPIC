"use client";
// ─────────────────────────────────────────────────────────────────────────────
// AMEXAN · DoctorDashboardEditor.jsx
// Place at: components/DoctorDashboardEditor.jsx
//
// PURPOSE: Doctor-side management system that populates AmexanDoctorPortfolio.
// Reads / writes: users/{doctorId}, services/{id}, posts/{id}, reviews/{id}
//
// USAGE:
//   import DoctorDashboardEditor from "@/components/DoctorDashboardEditor";
//   <DoctorDashboardEditor doctorId={session.user.uid} />
//
// DEPENDENCIES (all already in a standard Next.js + Firebase project):
//   npm install @uploadcare/react-widget   ← Uploadcare React widget
//   or use the raw JS Widget (CDN) — see UPLOADCARE section below.
//
// Uploadcare Public Key: 205b104100680fa4f052
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useRef, useCallback,
} from "react";
import dynamic from "next/dynamic";
import {
  doc, collection, query, where,
  onSnapshot, setDoc, addDoc, updateDoc,
  deleteDoc, serverTimestamp, orderBy,
  getDocs, increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Lazy-load the public portfolio — uses browser APIs (Uploadcare etc.)
const AmexanDoctorPortfolio = dynamic(
  () => import("@/components/AmexanDoctorPortfolio"),
  { ssr: false, loading: () => <PreviewLoader /> }
);

// ─── Uploadcare helpers ───────────────────────────────────────────────────────
const UC_PUB_KEY  = "205b104100680fa4f052";
const UC_CDN      = (uuid, w = 400, h = 400) =>
  uuid
    ? `https://ucarecdn.com/${uuid}/-/scale_crop/${w}x${h}/center/-/format/webp/-/quality/smart/`
    : null;

// Open the Uploadcare dialog imperatively (no widget dependency needed)
function openUploadcare({ onSuccess, multiple = false, imagesOnly = true }) {
  if (typeof window === "undefined") return;
  const script = document.createElement("script");
  script.src = "https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js";
  script.setAttribute("data-integration", "AMEXAN");
  script.onload = () => {
    const widget = window.uploadcare;
    if (!widget) return;
    widget.openDialog(null, {
      publicKey: UC_PUB_KEY,
      multiple,
      imagesOnly,
      previewStep: true,
    }).done((file) => {
      if (multiple) {
        file.promise().done((info) => {
          onSuccess(info.files().map((f) => f.uuid));
        });
      } else {
        file.promise().done((info) => onSuccess(info.uuid));
      }
    });
  };
  if (!document.querySelector(`script[src="${script.src}"]`)) {
    document.head.appendChild(script);
  } else if (window.uploadcare) {
    const widget = window.uploadcare;
    widget.openDialog(null, {
      publicKey: UC_PUB_KEY, multiple, imagesOnly, previewStep: true,
    }).done((file) => {
      if (multiple) {
        file.promise().done((info) => onSuccess(info.files().map((f) => f.uuid)));
      } else {
        file.promise().done((info) => onSuccess(info.uuid));
      }
    });
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt   = (n) => new Intl.NumberFormat("en-KE").format(n ?? 0);
const uuid  = () => Math.random().toString(36).slice(2, 10);
const clamp = (s, n) => (s && s.length > n ? s.slice(0, n) + "…" : s);

// ─── Toaster ──────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = uuid();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorDashboardEditor({ doctorId }) {
  const [activeTab,   setActiveTab]   = useState("profile");
  const [doctor,      setDoctor]      = useState(null);
  const [services,    setServices]    = useState([]);
  const [posts,       setPosts]       = useState([]);
  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const { toasts, push } = useToast();
  // ── Load doctor profile ───────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    const unsub = onSnapshot(doc(db, "users", doctorId), (snap) => {
      setDoctor(snap.exists() ? { id: snap.id, ...snap.data() } : {});
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [doctorId]);

  // ── Load services ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    return onSnapshot(
      query(collection(db, "services"), where("doctorId", "==", doctorId)),
      (snap) => setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [doctorId]);

  // ── Load posts ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    return onSnapshot(
      query(collection(db, "posts"), where("doctorId", "==", doctorId), orderBy("createdAt", "desc")),
      (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [doctorId]);

  // ── Load reviews ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    return onSnapshot(
      query(collection(db, "reviews"), where("doctorId", "==", doctorId), orderBy("createdAt", "desc")),
      (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [doctorId]);

  if (loading) return <Loader />;
  if (!doctorId) return <div style={S.center}>No doctor ID provided.</div>;

  // ── Stats for header ──────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "—";
  const pendingReviews = reviews.filter((r) => !r.verified).length;

  const TABS = [
    { id: "profile",      label: "Profile",        icon: "👤" },
    { id: "clinics",      label: "Clinics",         icon: "🏥" },
    { id: "feed",         label: "Health Feed",     icon: "📝" },
    { id: "groups",       label: "Patient Groups",  icon: "👥" },
    { id: "credentials",  label: "Credentials",     icon: "🎓" },
    { id: "reviews",      label: "Reviews",         icon: "⭐", badge: pendingReviews || null },
    { id: "availability", label: "Availability",    icon: "📅" },
    { id: "analytics",    label: "Analytics",       icon: "📊" },
    { id: "preview",      label: "Preview Portfolio",icon: "🌐", highlight: true },
  ];

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── Toasts ── */}
      <div style={S.toastWrap}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* ── Top Header ── */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-logo">AMEX<span>AN</span> <span className="dash-logo-sub">Doctor Dashboard</span></div>
          <div className="dash-header-right">
            {/* ── View Public Portfolio → opens Preview tab inline ── */}
            <button
              className="dash-preview-btn"
              onClick={() => setActiveTab("preview")}
            >
              🌐 View My Portfolio
            </button>
            <div className="dash-doctor-chip">
              <DoctorAvatar doctor={doctor} size={36} />
              <div>
                <div className="ddc-name">Dr. {doctor?.firstName} {doctor?.lastName}</div>
                <div className="ddc-spec">{doctor?.specialty || "Set your specialty →"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="dash-stats-strip">
          <StatPill label="Clinics"        value={services.length}          icon="🏥" />
          <StatPill label="Posts"          value={posts.length}             icon="📝" />
          <StatPill label="Avg Rating"     value={avgRating}                icon="⭐" />
          <StatPill label="Reviews"        value={reviews.length}           icon="💬" />
          <StatPill label="Pending Review" value={pendingReviews}           icon="🕐" color={pendingReviews > 0 ? "#f59e0b" : undefined} />
          <StatPill label="Status"         value={doctor?.verified ? "Verified ✓" : "Unverified"} icon="🛡️" color={doctor?.verified ? "#10b981" : "#ef4444"} />
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="dash-layout">

        {/* Sidebar */}
        <nav className="dash-sidebar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`dash-nav-btn${activeTab === t.id ? " active" : ""}${t.highlight ? " highlight" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="dnb-icon">{t.icon}</span>
              <span className="dnb-label">{t.label}</span>
              {t.badge     ? <span className="dnb-badge">{t.badge}</span>       : null}
              {t.highlight ? <span className="dnb-live">LIVE</span>             : null}
            </button>
          ))}
        </nav>

        {/* Main Panel */}
        <main className="dash-main">

          {activeTab === "profile"      && <ProfileEditor      doctor={doctor}   doctorId={doctorId} push={push} />}
          {activeTab === "clinics"      && <ClinicsEditor       services={services} doctorId={doctorId} push={push} doctor={doctor} />}
          {activeTab === "feed"         && <FeedEditor          posts={posts}       doctorId={doctorId} push={push} doctor={doctor} services={services} />}
          {activeTab === "groups"       && <PatientGroupsEditor services={services} doctorId={doctorId} push={push} />}
          {activeTab === "credentials"  && <CredentialsEditor   doctor={doctor}     doctorId={doctorId} push={push} />}
          {activeTab === "reviews"      && <ReviewsManager      reviews={reviews}   doctorId={doctorId} push={push} />}
          {activeTab === "availability" && <AvailabilityEditor  doctor={doctor}     doctorId={doctorId} push={push} />}
          {activeTab === "analytics"    && <AnalyticsPanel      doctor={doctor}     services={services} posts={posts} reviews={reviews} />}
          {activeTab === "preview"      && <PortfolioPreviewPanel doctorId={doctorId} onEdit={(tab) => setActiveTab(tab)} />}

        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 · PROFILE EDITOR
// Writes to: users/{doctorId}
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileEditor({ doctor, doctorId, push }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", title: "", specialty: "",
    tagline: "", bio: "", location: "", city: "", country: "Kenya",
    phone: "", email: "", website: "", languages: [],
    teleconsult: false, photoUuid: null, bannerUuid: null,
    totalPatients: "", yearsExperience: "",
    nextAvailable: "This week",
    aiSummary: "", tags: [],
    socialTwitter: "", socialLinkedIn: "",
  });
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [langInput, setLangInput] = useState("");

  // Sync from Firestore
  useEffect(() => {
    if (!doctor) return;
    setForm((f) => ({
      ...f,
      firstName:      doctor.firstName      || "",
      lastName:       doctor.lastName       || "",
      title:          doctor.title          || "",
      specialty:      doctor.specialty      || "",
      tagline:        doctor.tagline        || "",
      bio:            doctor.bio            || "",
      location:       doctor.location       || "",
      city:           doctor.city           || "",
      country:        doctor.country        || "Kenya",
      phone:          doctor.phone          || "",
      email:          doctor.email          || "",
      website:        doctor.website        || "",
      languages:      doctor.languages      || [],
      teleconsult:    doctor.teleconsult    || false,
      photoUuid:      doctor.photoUuid      || null,
      bannerUuid:     doctor.bannerUuid     || null,
      totalPatients:  doctor.totalPatients  || "",
      yearsExperience:doctor.yearsExperience|| "",
      nextAvailable:  doctor.nextAvailable  || "This week",
      aiSummary:      doctor.aiSummary      || "",
      tags:           doctor.tags           || [],
      socialTwitter:  doctor.socialTwitter  || "",
      socialLinkedIn: doctor.socialLinkedIn || "",
    }));
  }, [doctor]);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", doctorId), {
        ...form,
        totalPatients:   form.totalPatients   ? Number(form.totalPatients)   : null,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      push("Profile saved successfully ✓");
    } catch (e) {
      console.error(e);
      push("Failed to save profile", "error");
    }
    setSaving(false);
  };

  const photoSrc = UC_CDN(form.photoUuid, 240, 240);

  return (
    <div className="editor-wrap">
      <SectionHeader icon="👤" title="Your Public Profile" sub="This is exactly what patients see when they land on your portfolio." />

      {/* ── Photo & Banner ── */}
      <Card title="Photos" icon="📷">
        <div className="photo-row">
          <div className="photo-slot">
            <div className="photo-preview" style={{ backgroundImage: photoSrc ? `url(${photoSrc})` : "none" }}>
              {!form.photoUuid && <span className="photo-empty-icon">👤</span>}
            </div>
            <div>
              <div className="photo-label">Profile Photo</div>
              <div className="photo-hint">Shown in hero, listings, and search. Square works best.</div>
              <button className="btn-upload" onClick={() => openUploadcare({ onSuccess: (uuid) => upd("photoUuid", uuid) })}>
                📤 Upload Photo
              </button>
              {form.photoUuid && (
                <button className="btn-remove" onClick={() => upd("photoUuid", null)}>Remove</button>
              )}
            </div>
          </div>

          <div className="photo-slot">
            <div className="banner-preview" style={{ backgroundImage: form.bannerUuid ? `url(${UC_CDN(form.bannerUuid, 600, 200)})` : "none" }}>
              {!form.bannerUuid && <span style={{ color: "#94a3b8", fontSize: 13 }}>No banner set</span>}
            </div>
            <div>
              <div className="photo-label">Banner / Cover Image</div>
              <div className="photo-hint">1200×400px recommended. Shown behind your hero section.</div>
              <button className="btn-upload" onClick={() => openUploadcare({ onSuccess: (uuid) => upd("bannerUuid", uuid) })}>
                📤 Upload Banner
              </button>
              {form.bannerUuid && (
                <button className="btn-remove" onClick={() => upd("bannerUuid", null)}>Remove</button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Basic Info ── */}
      <Card title="Basic Information" icon="📋">
        <div className="grid-2">
          <Field label="First Name *">
            <input className="inp" value={form.firstName} onChange={(e) => upd("firstName", e.target.value)} placeholder="Amara" />
          </Field>
          <Field label="Last Name *">
            <input className="inp" value={form.lastName} onChange={(e) => upd("lastName", e.target.value)} placeholder="Osei" />
          </Field>
          <Field label="Professional Title">
            <input className="inp" value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="MBChB · MRCP (UK) · FESC · PhD" />
          </Field>
          <Field label="Specialty *">
            <input className="inp" value={form.specialty} onChange={(e) => upd("specialty", e.target.value)} placeholder="Interventional Cardiology" />
          </Field>
          <Field label="Years of Experience">
            <input className="inp" type="number" value={form.yearsExperience} onChange={(e) => upd("yearsExperience", e.target.value)} placeholder="18" />
          </Field>
          <Field label="Total Patients Treated">
            <input className="inp" type="number" value={form.totalPatients} onChange={(e) => upd("totalPatients", e.target.value)} placeholder="3200" />
          </Field>
          <Field label="Location (shown on profile)">
            <input className="inp" value={form.location} onChange={(e) => upd("location", e.target.value)} placeholder="Nairobi, Kenya" />
          </Field>
          <Field label="Next Available (shown on hero)">
            <select className="inp" value={form.nextAvailable} onChange={(e) => upd("nextAvailable", e.target.value)}>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This week</option>
              <option>Next week</option>
              <option>This month</option>
            </select>
          </Field>
        </div>

        <Field label="Profile Tagline (shown in quotes below your name)">
          <input className="inp" value={form.tagline} onChange={(e) => upd("tagline", e.target.value)} placeholder="Your heart is in good hands." maxLength={120} />
          <CharCount val={form.tagline} max={120} />
        </Field>

        <Field label="About / Bio *">
          <textarea className="inp" rows={5} value={form.bio} onChange={(e) => upd("bio", e.target.value)} placeholder="Write a detailed professional biography. Describe your expertise, training highlights, and what makes you unique as a clinician. Patients read this carefully." />
          <CharCount val={form.bio} max={1200} />
        </Field>

        <Field label="AI Summary (optional — shown in the AI card on your profile)">
          <textarea className="inp" rows={3} value={form.aiSummary} onChange={(e) => upd("aiSummary", e.target.value)} placeholder="e.g. Dr. Osei is highly rated for thorough cardiac evaluations and patient communication. Patients appreciate his diagnostic precision and clear explanations." />
        </Field>
      </Card>

      {/* ── Contact ── */}
      <Card title="Contact & Links" icon="📞">
        <div className="grid-2">
          <Field label="Phone (not shown publicly)">
            <input className="inp" value={form.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+254 700 000 000" />
          </Field>
          <Field label="Email (not shown publicly)">
            <input className="inp" type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} placeholder="doctor@email.com" />
          </Field>
          <Field label="Website">
            <input className="inp" value={form.website} onChange={(e) => upd("website", e.target.value)} placeholder="https://yourwebsite.com" />
          </Field>
          <Field label="Twitter / X handle">
            <input className="inp" value={form.socialTwitter} onChange={(e) => upd("socialTwitter", e.target.value)} placeholder="@drAmara" />
          </Field>
          <Field label="LinkedIn URL">
            <input className="inp" value={form.socialLinkedIn} onChange={(e) => upd("socialLinkedIn", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </Field>
        </div>
      </Card>

      {/* ── Languages & Tags ── */}
      <Card title="Languages & Specialization Tags" icon="🌐">
        <Field label="Languages Spoken">
          <TagInput
            tags={form.languages}
            inputVal={langInput}
            setInputVal={setLangInput}
            onAdd={(v) => { if (v && !form.languages.includes(v)) upd("languages", [...form.languages, v]); }}
            onRemove={(v) => upd("languages", form.languages.filter((x) => x !== v))}
            placeholder="Type a language and press Enter…"
            colorClass="chip-teal"
          />
        </Field>
        <Field label="Specialization Tags (shown as chips on profile)">
          <TagInput
            tags={form.tags}
            inputVal={tagInput}
            setInputVal={setTagInput}
            onAdd={(v) => { if (v && !form.tags.includes(v)) upd("tags", [...form.tags, v]); }}
            onRemove={(v) => upd("tags", form.tags.filter((x) => x !== v))}
            placeholder="e.g. Heart Failure, PCI, Echocardiography…"
            colorClass="chip-blue"
          />
        </Field>
        <Field label="Teleconsult Available">
          <Toggle
            value={form.teleconsult}
            onChange={(v) => upd("teleconsult", v)}
            label="Yes — show Teleconsult button on my profile"
          />
        </Field>
      </Card>

      <SaveBar saving={saving} onSave={save} label="Save Profile" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 · CLINICS EDITOR
// Writes to: services/{id}   (doctorId field set on create)
// ═══════════════════════════════════════════════════════════════════════════════
function ClinicsEditor({ services, doctorId, push, doctor }) {
  const [editing,  setEditing]  = useState(null); // service id or "new"
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const blank = () => ({
    clinic: "", specialty: doctor?.specialty || "", description: "",
    location: "", address: "", phone: "", price: "",
    duration: 30, teleconsult: false, acceptsInsurance: false,
    isAvailable: true, type: "private",
    schedule: [{ days: "Mon – Fri", hours: "8:00 AM – 5:00 PM" }],
    tags: [], tagInput: "",
  });

  const startNew  = () => { setForm(blank()); setEditing("new"); };
  const startEdit = (svc) => {
    setForm({
      ...blank(), ...svc,
      price:    svc.price    || "",
      duration: svc.duration || 30,
      schedule: svc.schedule || [{ days: "Mon – Fri", hours: "8:00 AM – 5:00 PM" }],
      tags:     svc.tags     || [],
      tagInput: "",
    });
    setEditing(svc.id);
  };
  const cancel = () => { setEditing(null); setForm(null); };
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.clinic || !form.price) return push("Clinic name & price are required", "error");
    setSaving(true);
    try {
      const payload = {
        doctorId,
        clinic:          form.clinic,
        specialty:       form.specialty,
        description:     form.description,
        location:        form.location,
        address:         form.address,
        phone:           form.phone,
        price:           Number(form.price),
        duration:        Number(form.duration),
        teleconsult:     form.teleconsult,
        acceptsInsurance:form.acceptsInsurance,
        isAvailable:     form.isAvailable,
        type:            form.type,
        schedule:        form.schedule,
        tags:            form.tags,
        updatedAt:       serverTimestamp(),
      };
      if (editing === "new") {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "services"), payload);
        push("Clinic created ✓");
      } else {
        await setDoc(doc(db, "services", editing), payload, { merge: true });
        push("Clinic updated ✓");
      }
      cancel();
    } catch (e) { console.error(e); push("Save failed", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm("Delete this clinic? This cannot be undone.")) return;
    setDeleting(id);
    try { await deleteDoc(doc(db, "services", id)); push("Clinic removed"); }
    catch (e) { push("Delete failed", "error"); }
    setDeleting(null);
  };

  // Schedule row helpers
  const addSched  = () => upd("schedule", [...(form.schedule || []), { days: "", hours: "" }]);
  const remSched  = (i) => upd("schedule", form.schedule.filter((_, j) => j !== i));
  const updSched  = (i, k, v) => upd("schedule", form.schedule.map((r, j) => j === i ? { ...r, [k]: v } : r));

  if (editing !== null && form !== null) {
    return (
      <div className="editor-wrap">
        <SectionHeader
          icon="🏥"
          title={editing === "new" ? "Add New Clinic" : "Edit Clinic"}
          sub="Each clinic has its own schedule, pricing, services and patient groups."
          action={<button className="btn-ghost" onClick={cancel}>← Cancel</button>}
        />

        <Card title="Clinic Identity" icon="🏥">
          <div className="grid-2">
            <Field label="Clinic / Hospital Name *">
              <input className="inp" value={form.clinic} onChange={(e) => upd("clinic", e.target.value)} placeholder="Aga Khan Cardiology Clinic" />
            </Field>
            <Field label="Specialty at this Clinic">
              <input className="inp" value={form.specialty} onChange={(e) => upd("specialty", e.target.value)} placeholder="Interventional Cardiology" />
            </Field>
            <Field label="Type">
              <select className="inp" value={form.type} onChange={(e) => upd("type", e.target.value)}>
                <option value="private">Private</option>
                <option value="public">Public / Government</option>
                <option value="online">Online Only</option>
                <option value="ngo">NGO / Mission</option>
              </select>
            </Field>
            <Field label="Consultation Fee (KES) *">
              <input className="inp" type="number" value={form.price} onChange={(e) => upd("price", e.target.value)} placeholder="5500" />
            </Field>
            <Field label="Session Duration (minutes)">
              <input className="inp" type="number" value={form.duration} onChange={(e) => upd("duration", e.target.value)} placeholder="30" />
            </Field>
            <Field label="Phone (for this clinic)">
              <input className="inp" value={form.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+254 700 000 000" />
            </Field>
          </div>
          <Field label="Address (shown on map link)">
            <input className="inp" value={form.address} onChange={(e) => upd("address", e.target.value)} placeholder="3rd Parklands Avenue, Westlands, Nairobi" />
          </Field>
          <Field label="Location Label (shown on card)">
            <input className="inp" value={form.location} onChange={(e) => upd("location", e.target.value)} placeholder="Westlands, Nairobi" />
          </Field>
          <Field label="Clinic Description">
            <textarea className="inp" rows={3} value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Brief description of what's offered at this specific clinic…" />
          </Field>
        </Card>

        <Card title="Schedule" icon="📅">
          {form.schedule.map((row, i) => (
            <div key={i} className="sched-row">
              <input className="inp" style={{ flex: 1 }} value={row.days} onChange={(e) => updSched(i, "days", e.target.value)} placeholder="Mon – Fri" />
              <input className="inp" style={{ flex: 1 }} value={row.hours} onChange={(e) => updSched(i, "hours", e.target.value)} placeholder="8:00 AM – 5:00 PM" />
              <button className="btn-icon-del" onClick={() => remSched(i)}>✕</button>
            </div>
          ))}
          <button className="btn-ghost" style={{ marginTop: 8 }} onClick={addSched}>+ Add Schedule Row</button>
        </Card>

        <Card title="Options" icon="⚙️">
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <Toggle value={form.isAvailable}     onChange={(v) => upd("isAvailable", v)}     label="Currently Available for Booking" />
            <Toggle value={form.teleconsult}     onChange={(v) => upd("teleconsult", v)}     label="Teleconsult Option Available" />
            <Toggle value={form.acceptsInsurance} onChange={(v) => upd("acceptsInsurance", v)} label="Accepts Insurance" />
          </div>
        </Card>

        <Card title="Service Tags" icon="🏷️">
          <TagInput
            tags={form.tags}
            inputVal={form.tagInput || ""}
            setInputVal={(v) => upd("tagInput", v)}
            onAdd={(v) => { if (v && !form.tags.includes(v)) upd("tags", [...form.tags, v]); }}
            onRemove={(v) => upd("tags", form.tags.filter((x) => x !== v))}
            placeholder="e.g. Echocardiography, ECG, Stress Test…"
            colorClass="chip-blue"
          />
        </Card>

        <SaveBar saving={saving} onSave={save} label={editing === "new" ? "Create Clinic" : "Update Clinic"} />
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="editor-wrap">
      <SectionHeader
        icon="🏥"
        title="Your Clinics & Practice Locations"
        sub={`You have ${services.length} clinic${services.length !== 1 ? "s" : ""}. Each clinic can have its own patients, schedule, and education feed.`}
        action={<button className="btn-primary" onClick={startNew}>+ Add Clinic</button>}
      />

      {services.length === 0 && (
        <EmptyState icon="🏥" title="No clinics yet" sub="Add your first clinic to appear in search results and enable patient bookings.">
          <button className="btn-primary" onClick={startNew}>+ Add Your First Clinic</button>
        </EmptyState>
      )}

      <div className="clinic-cards-grid">
        {services.map((svc) => (
          <div key={svc.id} className="clinic-mgmt-card">
            <div className="cmc-top">
              <div>
                <div className="cmc-name">{svc.clinic || svc.specialty}</div>
                <div className="cmc-sub">{svc.specialty}{svc.location ? ` · ${svc.location}` : ""}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span className={`cmc-status ${svc.isAvailable ? "active" : "inactive"}`}>
                  {svc.isAvailable ? "🟢 Active" : "⛔ Inactive"}
                </span>
                <span className="cmc-type-badge">{svc.type || "private"}</span>
              </div>
            </div>

            <div className="cmc-meta">
              {svc.price   && <span className="cmc-meta-item">💰 KES {fmt(svc.price)}</span>}
              {svc.duration && <span className="cmc-meta-item">⏱ {svc.duration} min</span>}
              {svc.schedule?.[0] && <span className="cmc-meta-item">📅 {svc.schedule[0].days}</span>}
            </div>

            {svc.address && <div className="cmc-addr">📍 {svc.address}</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => startEdit(svc)}>✏️ Edit</button>
              <button
                className="btn-danger-sm"
                onClick={() => del(svc.id)}
                disabled={deleting === svc.id}
              >
                {deleting === svc.id ? "…" : "🗑"}
              </button>
              <button
                className="btn-ghost"
                onClick={() => updateDoc(doc(db, "services", svc.id), { isAvailable: !svc.isAvailable }).then(() => push(`Clinic ${svc.isAvailable ? "deactivated" : "activated"}`))}
              >
                {svc.isAvailable ? "Pause" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 · HEALTH FEED EDITOR
// Writes to: posts/{id}
// ═══════════════════════════════════════════════════════════════════════════════
function FeedEditor({ posts, doctorId, push, doctor, services }) {
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [filter,   setFilter]   = useState("all");

  const blank = () => ({
    title: "", content: "", tag: "", visibility: "public",
    targetServiceId: "", imageUuid: null, pinned: false,
    tagInput: "", postTags: [],
  });

  const startNew  = () => { setForm(blank()); setEditing("new"); };
  const startEdit = (p) => {
    setForm({ ...blank(), ...p, tagInput: "", postTags: p.postTags || [] });
    setEditing(p.id);
  };
  const cancel = () => { setEditing(null); setForm(null); };
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.content?.trim()) return push("Post content is required", "error");
    setSaving(true);
    try {
      const payload = {
        doctorId,
        title:           form.title,
        content:         form.content,
        tag:             form.tag,
        visibility:      form.visibility,
        targetServiceId: form.visibility === "clinic" ? form.targetServiceId : null,
        imageUuid:       form.imageUuid || null,
        pinned:          form.pinned,
        postTags:        form.postTags,
        likes:           editing === "new" ? 0 : undefined,
        updatedAt:       serverTimestamp(),
      };
      if (editing === "new") {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "posts"), payload);
        push("Post published ✓");
      } else {
        await setDoc(doc(db, "posts", editing), payload, { merge: true });
        push("Post updated ✓");
      }
      cancel();
    } catch (e) { console.error(e); push("Save failed", "error"); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try { await deleteDoc(doc(db, "posts", id)); push("Post deleted"); }
    catch (e) { push("Delete failed", "error"); }
  };

  const filteredPosts = posts.filter(
    (p) => filter === "all" || p.visibility === filter
  );

  if (editing !== null && form !== null) {
    return (
      <div className="editor-wrap">
        <SectionHeader
          icon="📝"
          title={editing === "new" ? "New Post" : "Edit Post"}
          sub="Posts appear in your public feed and/or as targeted updates to specific patient groups."
          action={<button className="btn-ghost" onClick={cancel}>← Cancel</button>}
        />

        <Card title="Post Content" icon="✍️">
          <Field label="Post Title (optional)">
            <input className="inp" value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="e.g. 5 Warning Signs of a Heart Attack" />
          </Field>
          <Field label="Content *">
            <textarea className="inp" rows={10} value={form.content} onChange={(e) => upd("content", e.target.value)} placeholder={`Write your health tip, announcement, or patient education post here…\n\nYou can write long-form content — it will be collapsible on the portfolio.`} />
            <CharCount val={form.content} max={3000} />
          </Field>
          <Field label="Category Tag (shown as pill)">
            <input className="inp" value={form.tag} onChange={(e) => upd("tag", e.target.value)} placeholder="e.g. Cardiology Update / Patient Announcement / Health Tip" />
          </Field>
          <Field label="Search Tags (hashtags for patients to find by topic)">
            <TagInput
              tags={form.postTags}
              inputVal={form.tagInput}
              setInputVal={(v) => upd("tagInput", v)}
              onAdd={(v) => { if (v && !form.postTags.includes(v)) upd("postTags", [...form.postTags, v]); }}
              onRemove={(v) => upd("postTags", form.postTags.filter((x) => x !== v))}
              placeholder="#HeartHealth, #DiabetesClinic…"
              colorClass="chip-purple"
            />
          </Field>
        </Card>

        <Card title="Post Image (optional)" icon="🖼️">
          {form.imageUuid
            ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={UC_CDN(form.imageUuid, 600, 300)} alt="" style={{ maxWidth: "100%", borderRadius: 10 }} />
                <button className="btn-remove" style={{ position: "absolute", top: 8, right: 8 }} onClick={() => upd("imageUuid", null)}>✕ Remove</button>
              </div>
            )
            : (
              <button
                className="btn-upload"
                onClick={() => openUploadcare({ onSuccess: (uuid) => upd("imageUuid", uuid) })}
              >
                📤 Upload Post Image
              </button>
            )
          }
        </Card>

        <Card title="Audience & Visibility" icon="👁️">
          <div className="vis-options">
            {[
              { val: "public",  label: "🌍 Public",        desc: "Visible to everyone who visits your portfolio." },
              { val: "all",     label: "👥 All Patients",   desc: "Visible to all patients who have booked with you." },
              { val: "clinic",  label: "🩺 Specific Clinic",desc: "Only patients in one of your clinic groups see this." },
            ].map((opt) => (
              <div
                key={opt.val}
                className={`vis-option${form.visibility === opt.val ? " sel" : ""}`}
                onClick={() => upd("visibility", opt.val)}
              >
                <div className="vo-label">{opt.label}</div>
                <div className="vo-desc">{opt.desc}</div>
              </div>
            ))}
          </div>
          {form.visibility === "clinic" && (
            <Field label="Target Clinic" style={{ marginTop: 14 }}>
              <select className="inp" value={form.targetServiceId} onChange={(e) => upd("targetServiceId", e.target.value)}>
                <option value="">— Select a clinic —</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.clinic || s.specialty}</option>)}
              </select>
            </Field>
          )}
          <Field label="Pin this post to top of feed" style={{ marginTop: 14 }}>
            <Toggle value={form.pinned} onChange={(v) => upd("pinned", v)} label="Pin to top" />
          </Field>
        </Card>

        <SaveBar saving={saving} onSave={save} label={editing === "new" ? "Publish Post" : "Update Post"} />
      </div>
    );
  }

  // ── Feed list ──────────────────────────────────────────────────────────────
  return (
    <div className="editor-wrap">
      <SectionHeader
        icon="📝"
        title="Health Feed & Patient Education"
        sub="Posts appear on your public portfolio. Target specific clinic patients with private announcements."
        action={<button className="btn-primary" onClick={startNew}>+ New Post</button>}
      />

      <div className="filter-bar">
        {["all","public","clinic"].map((f) => (
          <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All Posts" : f === "public" ? "🌍 Public" : "🩺 Clinic"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>{filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}</span>
      </div>

      {filteredPosts.length === 0 && (
        <EmptyState icon="📝" title="No posts yet" sub="Start building your authority by sharing health tips and patient announcements.">
          <button className="btn-primary" onClick={startNew}>+ Write Your First Post</button>
        </EmptyState>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredPosts.map((p) => (
          <div key={p.id} className="post-mgmt-card">
            <div className="pmc-top">
              {p.imageUuid && (
                <img src={UC_CDN(p.imageUuid, 120, 80)} alt="" className="pmc-thumb" />
              )}
              <div style={{ flex: 1 }}>
                {p.tag && <span className="pmc-tag">{p.tag}</span>}
                {p.title && <div className="pmc-title">{p.title}</div>}
                <div className="pmc-preview">{clamp(p.content, 120)}</div>
                <div className="pmc-meta">
                  <span className={`pmc-vis ${p.visibility === "public" ? "vis-pub" : "vis-priv"}`}>
                    {p.visibility === "public" ? "🌍 Public" : p.visibility === "clinic" ? "🩺 Clinic" : "👥 All patients"}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>♥ {p.likes || 0} likes</span>
                  {p.pinned && <span style={{ color: "#f59e0b", fontSize: 12 }}>📌 Pinned</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
              <button className="btn-secondary" onClick={() => startEdit(p)}>✏️ Edit</button>
              <button className="btn-danger-sm" onClick={() => del(p.id)}>🗑 Delete</button>
              <button
                className="btn-ghost"
                onClick={() => updateDoc(doc(db, "posts", p.id), { pinned: !p.pinned }).then(() => push(p.pinned ? "Unpinned" : "Post pinned ✓"))}
              >
                {p.pinned ? "📌 Unpin" : "📌 Pin"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 · PATIENT GROUPS EDITOR
// Writes to: services/{id}.groups  (array field within each service)
// ═══════════════════════════════════════════════════════════════════════════════
function PatientGroupsEditor({ services, doctorId, push }) {
  const [selSvc,   setSelSvc]   = useState(services[0]?.id || null);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);

  const svc = services.find((s) => s.id === selSvc);
  const groups = svc?.groups || [];

  const blank = () => ({ name: "", icon: "👥", description: "", count: "", color: "teal" });

  const startNew  = () => { setForm(blank()); setEditing("new"); };
  const startEdit = (g, i) => { setForm({ ...blank(), ...g, _idx: i }); setEditing(i); };
  const cancel    = () => { setEditing(null); setForm(null); };
  const upd       = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) return push("Group name is required", "error");
    setSaving(true);
    try {
      let updated;
      if (editing === "new") {
        const { _idx, ...clean } = form;
        updated = [...groups, clean];
      } else {
        const { _idx, ...clean } = form;
        updated = groups.map((g, i) => i === editing ? clean : g);
      }
      await updateDoc(doc(db, "services", selSvc), { groups: updated });
      push(editing === "new" ? "Group created ✓" : "Group updated ✓");
      cancel();
    } catch (e) { console.error(e); push("Save failed", "error"); }
    setSaving(false);
  };

  const del = async (i) => {
    if (!window.confirm("Remove this patient group?")) return;
    try {
      await updateDoc(doc(db, "services", selSvc), { groups: groups.filter((_, j) => j !== i) });
      push("Group removed");
    } catch (e) { push("Delete failed", "error"); }
  };

  const COLORS = ["teal","blue","purple","orange","green","red"];
  const ICONS  = ["👥","❤️","🫁","🩺","💊","🤰","🧒","🧠","🦴","👁️","🦷","🩸"];

  return (
    <div className="editor-wrap">
      <SectionHeader
        icon="👥"
        title="Patient Clinic Groups"
        sub="Organize your patients into condition-specific groups. Each group can receive targeted education posts and announcements."
        action={selSvc && <button className="btn-primary" onClick={startNew}>+ Add Group</button>}
      />

      {/* Clinic selector */}
      {services.length > 0 && (
        <div className="clinic-selector">
          <span className="cs-label">Managing groups for:</span>
          <div className="cs-tabs">
            {services.map((s) => (
              <button
                key={s.id}
                className={`cs-tab${selSvc === s.id ? " active" : ""}`}
                onClick={() => { setSelSvc(s.id); cancel(); }}
              >
                🏥 {s.clinic || s.specialty}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selSvc && (
        <EmptyState icon="🏥" title="No clinics found" sub="Create a clinic first to manage patient groups." />
      )}

      {selSvc && editing !== null && form !== null && (
        <Card title={editing === "new" ? "New Patient Group" : "Edit Group"} icon="👥">
          <div className="grid-2">
            <Field label="Group Name *">
              <input className="inp" value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="Diabetes Management Clinic" />
            </Field>
            <Field label="Patient Count (display only)">
              <input className="inp" type="number" value={form.count} onChange={(e) => upd("count", e.target.value)} placeholder="48" />
            </Field>
          </div>
          <Field label="Description">
            <input className="inp" value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Patients enrolled in our structured diabetes management program." />
          </Field>
          <Field label="Icon">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  className={`icon-picker-btn${form.icon === ic ? " sel" : ""}`}
                  onClick={() => upd("icon", ic)}
                >{ic}</button>
              ))}
            </div>
          </Field>
          <Field label="Color Theme">
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-picker-btn color-${c}${form.color === c ? " sel" : ""}`}
                  onClick={() => upd("color", c)}
                />
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : editing === "new" ? "Create Group" : "Update Group"}</button>
            <button className="btn-ghost" onClick={cancel}>Cancel</button>
          </div>
        </Card>
      )}

      {selSvc && groups.length === 0 && editing === null && (
        <EmptyState icon="👥" title="No groups for this clinic" sub="Create patient groups to segment your patient education and announcements.">
          <button className="btn-primary" onClick={startNew}>+ Create First Group</button>
        </EmptyState>
      )}

      <div className="groups-grid">
        {groups.map((g, i) => (
          <div key={i} className={`group-mgmt-card color-bg-${g.color || "teal"}`}>
            <div className="gmc-icon">{g.icon || "👥"}</div>
            <div className="gmc-name">{g.name}</div>
            {g.description && <div className="gmc-desc">{g.description}</div>}
            {g.count && <div className="gmc-count">{g.count} patients enrolled</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => startEdit(g, i)}>✏️ Edit</button>
              <button className="btn-danger-sm" onClick={() => del(i)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 · CREDENTIALS EDITOR
// Writes to: users/{doctorId}.education, .certifications, .licenses,
//                              .affiliations, .awards, .publications
// ═══════════════════════════════════════════════════════════════════════════════
function CredentialsEditor({ doctor, doctorId, push }) {
  const [form, setForm] = useState({
    education:      [], certifications: [], licenses: [],
    affiliations:   [], awards:         [], publications: [],
    specializations:[],
  });
  const [saving, setSaving] = useState(false);
  const [secEditing, setSecEditing] = useState(null); // which list is being edited

  useEffect(() => {
    if (!doctor) return;
    setForm({
      education:       doctor.education       || [],
      certifications:  doctor.certifications  || [],
      licenses:        doctor.licenses        || [],
      affiliations:    doctor.affiliations    || [],
      awards:          doctor.awards          || [],
      publications:    doctor.publications    || [],
      specializations: doctor.specializations || [],
    });
  }, [doctor]);

  const saveAll = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", doctorId), {
        education:       form.education,
        certifications:  form.certifications,
        licenses:        form.licenses,
        affiliations:    form.affiliations,
        awards:          form.awards,
        publications:    form.publications,
        specializations: form.specializations,
        updatedAt:       serverTimestamp(),
      }, { merge: true });
      push("Credentials saved ✓");
    } catch (e) { console.error(e); push("Save failed", "error"); }
    setSaving(false);
  };

  // Generic list manager
  const ListEditor = ({ listKey, title, icon, fields, addLabel }) => {
    const list = form[listKey] || [];
    const add  = (item)    => setForm((f) => ({ ...f, [listKey]: [...list, item] }));
    const upd  = (i, item) => setForm((f) => ({ ...f, [listKey]: list.map((x, j) => j === i ? item : x) }));
    const del  = (i)       => setForm((f) => ({ ...f, [listKey]: list.filter((_, j) => j !== i) }));

    const [draft, setDraft] = useState(null);
    const [editIdx, setEditIdx] = useState(null);

    const blankDraft = () => Object.fromEntries(fields.map((f) => [f.key, f.default || ""]));
    const startAdd   = () => { setDraft(blankDraft()); setEditIdx("new"); };
    const startEdit  = (item, i) => { setDraft({ ...blankDraft(), ...item }); setEditIdx(i); };
    const saveDraft  = () => {
      if (editIdx === "new") add(draft);
      else upd(editIdx, draft);
      setDraft(null); setEditIdx(null);
    };

    return (
      <Card title={title} icon={icon} action={<button className="btn-ghost-sm" onClick={startAdd}>+ {addLabel}</button>}>
        {editIdx !== null && draft !== null && (
          <div className="draft-form">
            <div className="grid-2">
              {fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  {f.type === "checkbox"
                    ? <Toggle value={draft[f.key]} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} label={f.toggleLabel || ""} />
                    : <input className="inp" type={f.type || "text"} value={draft[f.key] || ""} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder || ""} />
                  }
                </Field>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-primary" onClick={saveDraft}>Save</button>
              <button className="btn-ghost" onClick={() => { setDraft(null); setEditIdx(null); }}>Cancel</button>
            </div>
          </div>
        )}

        {list.length === 0 && editIdx === null && (
          <div style={{ color: "#94a3b8", fontSize: 13, padding: "12px 0" }}>No entries yet. Click +{addLabel} to add.</div>
        )}

        {list.map((item, i) => (
          <div key={i} className="cred-row">
            <div style={{ flex: 1 }}>
              {fields.filter((f) => f.primary).map((f) => (
                <div key={f.key} className="cred-primary">{item[f.key]}</div>
              ))}
              <div className="cred-secondary">
                {fields.filter((f) => !f.primary && f.type !== "checkbox" && item[f.key]).map((f, j) => (
                  <span key={j}>{item[f.key]}{j < fields.filter((f) => !f.primary && f.type !== "checkbox" && item[f.key]).length - 1 ? " · " : ""}</span>
                ))}
              </div>
            </div>
            {listKey === "licenses" && (
              <span className={`lic-status ${item.valid ? "valid" : ""}`}>{item.valid ? "✓ Active" : "Inactive"}</span>
            )}
            <button className="btn-ghost-sm" onClick={() => startEdit(item, i)}>Edit</button>
            <button className="btn-icon-del" onClick={() => del(i)}>✕</button>
          </div>
        ))}
      </Card>
    );
  };

  // Affiliations (simple strings)
  const AffiliationsEditor = () => {
    const [val, setVal] = useState("");
    const add  = () => { if (val.trim()) { setForm((f) => ({ ...f, affiliations: [...f.affiliations, val.trim()] })); setVal(""); } };
    const del  = (i) => setForm((f) => ({ ...f, affiliations: f.affiliations.filter((_, j) => j !== i) }));
    return (
      <Card title="Hospital Affiliations" icon="🏥">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input className="inp" style={{ flex: 1 }} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="e.g. Aga Khan University Hospital" />
          <button className="btn-primary" onClick={add}>Add</button>
        </div>
        {form.affiliations.map((a, i) => (
          <div key={i} className="cred-row">
            <span style={{ flex: 1 }}>🏥 {a}</span>
            <button className="btn-icon-del" onClick={() => del(i)}>✕</button>
          </div>
        ))}
      </Card>
    );
  };

  // Specializations (chips)
  const [specInput, setSpecInput] = useState("");

  return (
    <div className="editor-wrap">
      <SectionHeader icon="🎓" title="Credentials & Academic Profile" sub="These build patient trust and are verified by AMEXAN. All entries are public." />

      <ListEditor
        listKey="education"
        title="Education"
        icon="🎓"
        addLabel="Education"
        fields={[
          { key: "degree",      label: "Degree / Qualification", placeholder: "MBChB, PhD, Fellowship…", primary: true },
          { key: "institution", label: "Institution",            placeholder: "University of Ghana Medical School" },
          { key: "year",        label: "Year / Period",          placeholder: "1996 – 2002" },
          { key: "country",     label: "Country",                placeholder: "Ghana" },
        ]}
      />

      <ListEditor
        listKey="certifications"
        title="Certifications"
        icon="🏆"
        addLabel="Certification"
        fields={[
          { key: "name",  label: "Certification Name",  placeholder: "MRCP (UK)", primary: true },
          { key: "body",  label: "Issuing Body",         placeholder: "Royal College of Physicians" },
          { key: "year",  label: "Year Obtained",        placeholder: "2007" },
          { key: "expiry",label: "Expiry (if applicable)",placeholder: "2027" },
        ]}
      />

      <ListEditor
        listKey="licenses"
        title="Medical Licenses"
        icon="🛡️"
        addLabel="License"
        fields={[
          { key: "name",      label: "License Name",   placeholder: "KMPDB Medical License", primary: true },
          { key: "authority", label: "Authority",      placeholder: "Kenya Medical Practitioners & Dentists Board" },
          { key: "number",    label: "License Number", placeholder: "KE-2004-00821" },
          { key: "expiry",    label: "Expiry Date",    placeholder: "2027" },
          { key: "valid",     label: "Status",         type: "checkbox", toggleLabel: "Currently Active / Valid", default: true },
        ]}
      />

      <AffiliationsEditor />

      <ListEditor
        listKey="awards"
        title="Awards & Recognition"
        icon="🏅"
        addLabel="Award"
        fields={[
          { key: "title", label: "Award Title",         placeholder: "Best Cardiologist East Africa 2023", primary: true },
          { key: "org",   label: "Organisation",        placeholder: "African Heart Foundation" },
          { key: "year",  label: "Year",                placeholder: "2023" },
        ]}
      />

      <ListEditor
        listKey="publications"
        title="Publications & Research"
        icon="📖"
        addLabel="Publication"
        fields={[
          { key: "title",   label: "Paper Title",    placeholder: "Coronary artery disease in Sub-Saharan Africa…", primary: true },
          { key: "journal", label: "Journal",        placeholder: "European Heart Journal" },
          { key: "year",    label: "Year",           placeholder: "2020" },
          { key: "doi",     label: "DOI / URL",      placeholder: "https://doi.org/..." },
        ]}
      />

      <Card title="Specializations (displayed as chips on profile)" icon="🔬">
        <TagInput
          tags={form.specializations}
          inputVal={specInput}
          setInputVal={setSpecInput}
          onAdd={(v) => { if (v && !form.specializations.includes(v)) setForm((f) => ({ ...f, specializations: [...f.specializations, v] })); }}
          onRemove={(v) => setForm((f) => ({ ...f, specializations: f.specializations.filter((x) => x !== v) }))}
          placeholder="Interventional Cardiology, PCI, Heart Failure…"
          colorClass="chip-blue"
        />
      </Card>

      <SaveBar saving={saving} onSave={saveAll} label="Save All Credentials" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 · REVIEWS MANAGER
// Writes to: reviews/{id}
// ═══════════════════════════════════════════════════════════════════════════════
function ReviewsManager({ reviews, doctorId, push }) {
  const [filter, setFilter] = useState("all");

  const approve = async (id) => {
    try { await updateDoc(doc(db, "reviews", id), { verified: true }); push("Review approved ✓"); }
    catch (e) { push("Failed", "error"); }
  };
  const del = async (id) => {
    if (!window.confirm("Remove this review permanently?")) return;
    try { await deleteDoc(doc(db, "reviews", id)); push("Review removed"); }
    catch (e) { push("Failed", "error"); }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.verified;
    if (filter === "approved") return r.verified;
    return true;
  });

  const avg = (key) => reviews.length
    ? (reviews.reduce((a, r) => a + (r[key] || 5), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="editor-wrap">
      <SectionHeader icon="⭐" title="Patient Reviews" sub="Approve, manage and respond to reviews. Only approved reviews appear publicly on your portfolio." />

      {/* Overview cards */}
      <div className="review-overview-grid">
        <OverviewCard label="Total Reviews"    value={reviews.length}                    icon="💬" />
        <OverviewCard label="Pending Approval" value={reviews.filter((r) => !r.verified).length} icon="🕐" color="#f59e0b" />
        <OverviewCard label="Overall Rating"   value={avg("rating")}                     icon="⭐" />
        <OverviewCard label="Communication"    value={avg("communication")}               icon="🗣️" />
        <OverviewCard label="Wait Time"        value={avg("waitTime")}                    icon="⏱" />
        <OverviewCard label="Clarity"          value={avg("clarity")}                     icon="💡" />
      </div>

      <div className="filter-bar">
        {[
          { id: "all",      label: `All (${reviews.length})` },
          { id: "pending",  label: `Pending (${reviews.filter((r) => !r.verified).length})` },
          { id: "approved", label: `Approved (${reviews.filter((r) => r.verified).length})` },
        ].map((f) => (
          <button key={f.id} className={`filter-btn${filter === f.id ? " active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon="⭐" title="No reviews yet" sub="Reviews will appear here once patients start submitting them through your portfolio." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((r) => (
          <div key={r.id} className="review-mgmt-card">
            <div className="rmc-top">
              <div className="rmc-avatar">{r.patientName?.[0] || "P"}</div>
              <div style={{ flex: 1 }}>
                <div className="rmc-name">{r.patientName}</div>
                <div className="rmc-stars">{"★".repeat(r.rating || 5)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span className={`rmc-status ${r.verified ? "approved" : "pending"}`}>
                  {r.verified ? "✓ Approved" : "⏳ Pending"}
                </span>
              </div>
            </div>

            <p className="rmc-text">{r.text}</p>

            {(r.communication || r.waitTime || r.clarity) && (
              <div className="rmc-cats">
                {r.communication && <span>Comms: {"★".repeat(r.communication)}</span>}
                {r.waitTime      && <span>Wait: {"★".repeat(r.waitTime)}</span>}
                {r.clarity       && <span>Clarity: {"★".repeat(r.clarity)}</span>}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {!r.verified && (
                <button className="btn-primary" onClick={() => approve(r.id)}>✓ Approve</button>
              )}
              {r.verified && (
                <button className="btn-ghost" onClick={() => updateDoc(doc(db, "reviews", r.id), { verified: false }).then(() => push("Review un-approved"))}>Revoke Approval</button>
              )}
              <button className="btn-danger-sm" onClick={() => del(r.id)}>🗑 Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 · AVAILABILITY EDITOR
// Writes to: users/{doctorId}.availability
// ═══════════════════════════════════════════════════════════════════════════════
function AvailabilityEditor({ doctor, doctorId, push }) {
  const DEFAULT_AVAIL = [
    { day: "Mon", slots: 8, open: true, start: "08:00", end: "17:00" },
    { day: "Tue", slots: 8, open: true, start: "08:00", end: "17:00" },
    { day: "Wed", slots: 4, open: true, start: "08:00", end: "12:00" },
    { day: "Thu", slots: 8, open: true, start: "08:00", end: "17:00" },
    { day: "Fri", slots: 8, open: true, start: "08:00", end: "17:00" },
    { day: "Sat", slots: 4, open: true, start: "09:00", end: "13:00" },
    { day: "Sun", slots: 0, open: false, start: "", end: "" },
  ];

  const [avail,  setAvail]  = useState(DEFAULT_AVAIL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor?.availability) setAvail(doctor.availability);
  }, [doctor]);

  const upd = (i, k, v) => setAvail((a) => a.map((d, j) => j === i ? { ...d, [k]: v } : d));

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", doctorId), { availability: avail, updatedAt: serverTimestamp() }, { merge: true });
      push("Availability saved ✓");
    } catch (e) { push("Save failed", "error"); }
    setSaving(false);
  };

  return (
    <div className="editor-wrap">
      <SectionHeader
        icon="📅"
        title="Weekly Availability"
        sub="Set your standard working hours. This drives the availability widget on your portfolio."
      />

      <Card title="Weekly Schedule" icon="📅">
        <div className="avail-table">
          <div className="avail-th">
            <span>Day</span><span>Open</span><span>Start</span><span>End</span><span>Max Slots</span>
          </div>
          {avail.map((d, i) => (
            <div key={d.day} className={`avail-row ${!d.open ? "avail-closed" : ""}`}>
              <span className="avail-day">{d.day}</span>
              <Toggle value={d.open} onChange={(v) => upd(i, "open", v)} />
              <input className="inp inp-sm" type="time" value={d.start} onChange={(e) => upd(i, "start", e.target.value)} disabled={!d.open} />
              <input className="inp inp-sm" type="time" value={d.end}   onChange={(e) => upd(i, "end",   e.target.value)} disabled={!d.open} />
              <input className="inp inp-sm" type="number" min={0} max={40} value={d.slots} onChange={(e) => upd(i, "slots", Number(e.target.value))} disabled={!d.open} style={{ width: 72 }} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Preview (as patients see it)" icon="👁️">
        <div className="avail-preview-grid">
          {avail.map((d) => (
            <div key={d.day} className={`avp-day ${d.open && d.slots > 0 ? "avp-open" : "avp-closed"}`}>
              <div className="avp-name">{d.day}</div>
              <div className="avp-slots">{d.open && d.slots > 0 ? `${d.slots} slots` : "Closed"}</div>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar saving={saving} onSave={save} label="Save Availability" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8 · ANALYTICS PANEL
// Read-only overview of performance metrics
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsPanel({ doctor, services, posts, reviews }) {
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "—";
  const totalLikes = posts.reduce((a, p) => a + (p.likes || 0), 0);
  const verified   = doctor?.verified;
  const activeClinicCount = services.filter((s) => s.isAvailable).length;

  const tips = [
    !doctor?.photoUuid     && "Upload a professional photo to increase bookings by up to 3×.",
    !doctor?.bio            && "Write a detailed bio — patients read this before booking.",
    services.length === 0   && "Add at least one clinic to appear in search results.",
    posts.length < 3        && "Post at least 3 health tips to build authority and trust.",
    reviews.length === 0    && "Ask your first patients to leave a review.",
    !doctor?.aiSummary      && "Add an AI summary for patients who skim profiles.",
    !verified               && "Complete your profile to request AMEXAN Verification.",
  ].filter(Boolean);

  return (
    <div className="editor-wrap">
      <SectionHeader icon="📊" title="Portfolio Analytics" sub="Overview of your portfolio performance and optimisation opportunities." />

      {/* ── Metric Grid ── */}
      <div className="analytics-grid">
        <OverviewCard label="Active Clinics"     value={activeClinicCount}      icon="🏥" color="#0284c7" />
        <OverviewCard label="Total Posts"        value={posts.length}           icon="📝" color="#6d28d9" />
        <OverviewCard label="Total Reviews"      value={reviews.length}         icon="💬" color="#0f766e" />
        <OverviewCard label="Avg Rating"         value={avgRating}              icon="⭐" color="#b45309" />
        <OverviewCard label="Post Likes"         value={totalLikes}             icon="❤️" color="#dc2626" />
        <OverviewCard label="Pending Reviews"    value={reviews.filter((r)=>!r.verified).length} icon="🕐" color="#d97706" />
      </div>

      {/* ── Completion Score ── */}
      <Card title="Profile Completion Score" icon="🎯">
        {(() => {
          const checks = [
            { label: "Profile photo uploaded",       done: !!doctor?.photoUuid },
            { label: "Bio written",                   done: (doctor?.bio?.length || 0) > 50 },
            { label: "At least 1 clinic active",      done: services.some((s) => s.isAvailable) },
            { label: "At least 3 posts published",    done: posts.length >= 3 },
            { label: "Has at least 1 review",         done: reviews.length >= 1 },
            { label: "Tagline set",                   done: !!doctor?.tagline },
            { label: "AI Summary written",            done: !!doctor?.aiSummary },
            { label: "Education entries added",       done: (doctor?.education?.length || 0) > 0 },
            { label: "Availability configured",       done: (doctor?.availability?.length || 0) > 0 },
            { label: "AMEXAN Verified",               done: !!doctor?.verified },
          ];
          const score = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
          return (
            <>
              <div className="score-bar-wrap">
                <div className="score-num">{score}%</div>
                <div className="score-track"><div className="score-fill" style={{ width: `${score}%` }} /></div>
              </div>
              <div className="completion-list">
                {checks.map((c, i) => (
                  <div key={i} className={`comp-item ${c.done ? "done" : "todo"}`}>
                    <span className="comp-icon">{c.done ? "✓" : "○"}</span>
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </Card>

      {/* ── Action Tips ── */}
      {tips.length > 0 && (
        <Card title="Optimisation Tips" icon="💡">
          {tips.map((tip, i) => (
            <div key={i} className="tip-row">
              <span className="tip-icon">💡</span>
              <span className="tip-text">{tip}</span>
            </div>
          ))}
        </Card>
      )}

      {/* ── Review Distribution ── */}
      {reviews.length > 0 && (
        <Card title="Review Breakdown" icon="⭐">
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: "#0f172a", lineHeight: 1, fontFamily: "'Syne',sans-serif" }}>{avgRating}</div>
              <div style={{ color: "#f59e0b", fontSize: 20 }}>{"★".repeat(Math.round(parseFloat(avgRating)))}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{reviews.length} reviews</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {[5, 4, 3, 2, 1].map((n) => {
                const count = reviews.filter((r) => Math.round(r.rating) === n).length;
                const pct   = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#374151", width: 8 }}>{n}</span>
                    <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 4, transition: "width .8s" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#94a3b8", width: 28, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader({ icon, title, sub, action }) {
  return (
    <div className="section-header">
      <div style={{ flex: 1 }}>
        <h2 className="sh-title">{icon} {title}</h2>
        {sub && <p className="sh-sub">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function Card({ title, icon, children, action }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{icon} {title}</div>
        {action && <div>{action}</div>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div className="field" style={style}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function CharCount({ val, max }) {
  const len = (val || "").length;
  return (
    <div style={{ fontSize: 11, color: len > max * 0.9 ? "#ef4444" : "#94a3b8", textAlign: "right", marginTop: 4 }}>
      {len} / {max}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="toggle-input" />
      <span className="toggle-track"><span className="toggle-thumb" /></span>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}

function TagInput({ tags, inputVal, setInputVal, onAdd, onRemove, placeholder, colorClass }) {
  const handleKey = (e) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      onAdd(inputVal.trim().replace(/^[#,\s]+|[#,\s]+$/g, ""));
      setInputVal("");
    }
  };
  return (
    <div className="tag-input-wrap">
      <div className="tag-input-chips">
        {tags.map((t) => (
          <span key={t} className={`chip ${colorClass}`}>
            {t}
            <button className="chip-remove" onClick={() => onRemove(t)}>✕</button>
          </span>
        ))}
        <input
          className="tag-input-field"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
    </div>
  );
}

function SaveBar({ saving, onSave, label }) {
  return (
    <div className="save-bar">
      <button className="btn-primary" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : `💾 ${label}`}
      </button>
      <span className="save-hint">Changes save directly to your live portfolio.</span>
    </div>
  );
}

function StatPill({ label, value, icon, color }) {
  return (
    <div className="stat-pill">
      <span className="sp-icon">{icon}</span>
      <span className="sp-val" style={color ? { color } : {}}>{value}</span>
      <span className="sp-label">{label}</span>
    </div>
  );
}

function OverviewCard({ label, value, icon, color }) {
  return (
    <div className="overview-card">
      <div className="oc-icon">{icon}</div>
      <div className="oc-val" style={color ? { color } : {}}>{value}</div>
      <div className="oc-label">{label}</div>
    </div>
  );
}

function DoctorAvatar({ doctor, size = 40 }) {
  const photo = UC_CDN(doctor?.photoUuid, size * 2, size * 2);
  const initials = `${doctor?.firstName?.[0] || ""}${doctor?.lastName?.[0] || ""}`.toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      background: "linear-gradient(135deg,#0284c7,#0ea5e9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {photo
        ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.38 }}>{initials || "D"}</span>
      }
    </div>
  );
}

function EmptyState({ icon, title, sub, children }) {
  return (
    <div className="empty-state">
      <div className="es-icon">{icon}</div>
      <div className="es-title">{title}</div>
      <div className="es-sub">{sub}</div>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spin" />
        <div style={{ marginTop: 16, fontSize: 14, color: "#94a3b8" }}>Loading dashboard…</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO PREVIEW PANEL
// Renders the exact public portfolio inside the dashboard so the doctor
// can see precisely what patients see — with a floating edit toolbar on top.
// ═══════════════════════════════════════════════════════════════════════════════
function PortfolioPreviewPanel({ doctorId, onEdit }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ margin: "-28px -32px", position: "relative" }}>

      {/* ── Floating preview toolbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 99,
        background: "linear-gradient(135deg,#0B1628,#0c4a6e)",
        padding: "12px 24px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        borderBottom: "2px solid rgba(0,201,200,0.3)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            background: "rgba(0,201,200,0.15)", border: "1px solid rgba(0,201,200,0.3)",
            color: "#00C9C8", fontSize: 10, fontWeight: 800,
            padding: "3px 10px", borderRadius: 9999,
            textTransform: "uppercase", letterSpacing: 1,
          }}>🔴 Live Preview</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            This is exactly what your patients see
          </span>
        </div>

        {/* Quick-edit buttons */}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          {[
            { label: "✏️ Edit Profile",      tab: "profile"      },
            { label: "🏥 Edit Clinics",      tab: "clinics"      },
            { label: "📝 Edit Feed",         tab: "feed"         },
            { label: "🎓 Credentials",       tab: "credentials"  },
            { label: "⭐ Reviews",           tab: "reviews"      },
          ].map((b) => (
            <button
              key={b.tab}
              onClick={() => onEdit(b.tab)}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                borderRadius: 8, padding: "7px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(0,201,200,0.2)";
                e.target.style.borderColor = "rgba(0,201,200,0.4)";
                e.target.style.color = "#00C9C8";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.07)";
                e.target.style.borderColor = "rgba(255,255,255,0.15)";
                e.target.style.color = "rgba(255,255,255,0.85)";
              }}
            >
              {b.label}
            </button>
          ))}

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            style={{
              background: "rgba(0,201,200,0.15)",
              border: "1px solid rgba(0,201,200,0.3)",
              color: "#00C9C8", borderRadius: 8,
              padding: "7px 14px", fontSize: 12,
              fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🔄 Refresh
          </button>

          {/* Open in new tab */}
          <a
            href={`/doctors/${doctorId}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#00C9C8", color: "#0B1628",
              border: "none", borderRadius: 8,
              padding: "7px 16px", fontSize: 12,
              fontWeight: 800, cursor: "pointer",
              textDecoration: "none", display: "flex",
              alignItems: "center", gap: 5,
            }}
          >
            ↗ Open Full Page
          </a>
        </div>
      </div>

      {/* ── The actual portfolio rendered inline ── */}
      <div key={refreshKey} style={{ background: "#f7f8fa", minHeight: "100vh" }}>
        <AmexanDoctorPortfolio doctorId={doctorId} />
      </div>
    </div>
  );
}

// ── Skeleton shown while portfolio chunk loads ────────────────────────────────
function PreviewLoader() {
  return (
    <div style={{ background: "#f7f8fa", minHeight: "60vh", padding: 40 }}>
      <style>{`
        @keyframes psh { 0%{background-position:-600px 0}100%{background-position:600px 0} }
        .psk{background:linear-gradient(90deg,#e2e8f0 25%,#cbd5e1 50%,#e2e8f0 75%);
             background-size:600px 100%;animation:psh 1.3s infinite linear;border-radius:8px}
      `}</style>
      <div className="psk" style={{ height: 260, borderRadius: 0, marginBottom: 0 }} />
      <div style={{ padding: "60px 32px 32px" }}>
        <div className="psk" style={{ height: 32, width: 260, marginBottom: 12 }} />
        <div className="psk" style={{ height: 18, width: 180, marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          {[150, 130, 120].map((w, i) => (
            <div key={i} className="psk" style={{ height: 44, width: w, borderRadius: 12 }} />
          ))}
        </div>
        <div className="psk" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CSS — All styles scoped to .dash-* and editor classes
// ═══════════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Page ── */
.dash-page{font-family:'Outfit',sans-serif;background:#f7f8fa;min-height:100vh;color:#0f172a}

/* ── Header ── */
.dash-header{background:linear-gradient(135deg,#0B1628 0%,#132035 60%,#0c4a6e 100%);padding:0 0 0}
.dash-header-inner{display:flex;justify-content:space-between;align-items:center;padding:14px 32px;flex-wrap:wrap;gap:12px}
.dash-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:#fff;letter-spacing:-0.5px}
.dash-logo span:first-child{color:#00C9C8}
.dash-logo-sub{font-size:13px;font-weight:400;color:rgba(255,255,255,.45);margin-left:12px;font-family:'Outfit',sans-serif}
.dash-header-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.dash-preview-btn{background:rgba(0,201,200,.12);border:1px solid rgba(0,201,200,.25);color:#00C9C8;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;font-family:'Outfit',sans-serif;transition:all .2s}
.dash-preview-btn:hover{background:rgba(0,201,200,.22)}
.dash-doctor-chip{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 14px}
.ddc-name{font-weight:700;font-size:14px;color:#fff}
.ddc-spec{font-size:12px;color:rgba(255,255,255,.45)}

/* ── Stats Strip ── */
.dash-stats-strip{display:flex;gap:0;border-top:1px solid rgba(255,255,255,.07);overflow-x:auto;scrollbar-width:none}
.dash-stats-strip::-webkit-scrollbar{display:none}
.stat-pill{display:flex;flex-direction:column;align-items:center;padding:14px 24px;min-width:100px;border-right:1px solid rgba(255,255,255,.06);flex:1}
.sp-icon{font-size:16px;margin-bottom:4px}
.sp-val{font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#fff}
.sp-label{font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-top:2px}

/* ── Layout ── */
.dash-layout{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 140px)}

/* ── Sidebar ── */
.dash-sidebar{background:#fff;border-right:1px solid #e5e7eb;padding:20px 12px;display:flex;flex-direction:column;gap:4px;position:sticky;top:0;height:calc(100vh - 140px);overflow-y:auto}
.dash-nav-btn{display:flex;align-items:center;gap:10px;padding:11px 14px;border:none;background:none;border-radius:10px;cursor:pointer;font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;color:#374151;width:100%;text-align:left;transition:all .15s;position:relative}
.dash-nav-btn:hover{background:#f8fafc;color:#0f172a}
.dash-nav-btn.active{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);color:#0284c7;font-weight:700}
.dnb-icon{font-size:17px;width:22px;text-align:center;flex-shrink:0}
.dnb-label{flex:1}
.dnb-badge{background:#ef4444;color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:9999px;flex-shrink:0}
.dnb-live{background:rgba(0,201,200,.15);color:#00C9C8;border:1px solid rgba(0,201,200,.3);font-size:9px;font-weight:800;padding:2px 7px;border-radius:9999px;flex-shrink:0;letter-spacing:.5px}
.dash-nav-btn.highlight{border:1px solid rgba(0,201,200,.2);margin-top:8px}
.dash-nav-btn.highlight:hover{background:rgba(0,201,200,.08);color:#0284c7}
.dash-nav-btn.highlight.active{background:linear-gradient(135deg,rgba(0,201,200,.12),rgba(0,201,200,.06));color:#00A8A7;border-color:rgba(0,201,200,.35)}

/* ── Main ── */
.dash-main{padding:28px 32px;overflow-y:auto}
.editor-wrap{max-width:860px}

/* ── Section Header ── */
.section-header{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px;flex-wrap:wrap}
.sh-title{font-family:'Syne',sans-serif;font-weight:700;font-size:22px;color:#0f172a;margin-bottom:5px}
.sh-sub{font-size:14px;color:#64748b;line-height:1.6;max-width:600px}

/* ── Card ── */
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;margin-bottom:20px;overflow:hidden}
.card-header{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid #f1f5f9}
.card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#0f172a}
.card-body{padding:20px 22px}

/* ── Fields ── */
.field{margin-bottom:16px}
.field-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:7px}
.inp{width:100%;padding:10px 13px;border:1.5px solid #d1d5db;border-radius:9px;font-size:14px;color:#0f172a;background:#fff;outline:none;font-family:'Outfit',sans-serif;transition:border-color .15s}
.inp:focus{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.1)}
.inp:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed}
.inp-sm{padding:7px 10px;font-size:13px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}

/* ── Buttons ── */
.btn-primary{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:10px;padding:11px 22px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s;box-shadow:0 2px 8px rgba(14,165,233,.25)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(14,165,233,.35)}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none}
.btn-secondary{background:#fff;color:#374151;border:1.5px solid #d1d5db;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s}
.btn-secondary:hover{border-color:#0ea5e9;color:#0284c7}
.btn-ghost{background:transparent;color:#374151;border:1.5px solid #d1d5db;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s}
.btn-ghost:hover{background:#f8fafc}
.btn-ghost-sm{background:transparent;color:#374151;border:1px solid #e5e7eb;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s}
.btn-ghost-sm:hover{border-color:#0ea5e9;color:#0284c7}
.btn-danger-sm{background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s}
.btn-danger-sm:hover{background:#dc2626;color:#fff}
.btn-upload{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);color:#0284c7;border:1.5px solid #bae6fd;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s}
.btn-upload:hover{background:linear-gradient(135deg,#e0f2fe,#bae6fd)}
.btn-remove{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:7px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif}
.btn-icon-del{background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .15s}
.btn-icon-del:hover{background:#fef2f2;color:#dc2626}

/* ── Toggle ── */
.toggle{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
.toggle-input{display:none}
.toggle-track{width:44px;height:24px;background:#d1d5db;border-radius:9999px;position:relative;transition:background .2s;flex-shrink:0}
.toggle-input:checked+.toggle-track{background:#0ea5e9}
.toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:transform .2s}
.toggle-input:checked+.toggle-track .toggle-thumb{transform:translateX(20px)}
.toggle-label{font-size:13px;color:#374151;font-weight:500}

/* ── Tag Input ── */
.tag-input-wrap{}
.tag-input-chips{display:flex;flex-wrap:wrap;gap:7px;padding:8px 10px;border:1.5px solid #d1d5db;border-radius:9px;background:#fff;min-height:44px;cursor:text;transition:border-color .15s}
.tag-input-chips:focus-within{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.1)}
.tag-input-field{border:none;outline:none;font-size:13px;font-family:'Outfit',sans-serif;color:#0f172a;min-width:120px;flex:1;padding:1px 2px;background:transparent}
.chip{display:inline-flex;align-items:center;gap:5px;border-radius:9999px;padding:4px 12px;font-size:12px;font-weight:600}
.chip-remove{background:none;border:none;cursor:pointer;font-size:11px;color:inherit;opacity:.7;padding:0;line-height:1}
.chip-remove:hover{opacity:1}
.chip-blue{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}
.chip-teal{background:#f0fdfa;color:#0f766e;border:1px solid #99f6e4}
.chip-purple{background:#f5f3ff;color:#6d28d9;border:1px solid #ddd6fe}
.chip-green{background:#f0fdf4;color:#15803d;border:1px solid #86efac}

/* ── Photo Upload ── */
.photo-row{display:flex;gap:28px;flex-wrap:wrap}
.photo-slot{display:flex;gap:18px;align-items:flex-start;flex:1;min-width:260px}
.photo-preview{width:90px;height:90px;border-radius:50%;background:#f1f5f9;border:2px solid #e5e7eb;flex-shrink:0;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center}
.photo-empty-icon{font-size:32px}
.banner-preview{width:180px;height:90px;border-radius:10px;background:#f1f5f9;border:2px solid #e5e7eb;flex-shrink:0;background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center}
.photo-label{font-weight:700;font-size:14px;color:#0f172a;margin-bottom:3px}
.photo-hint{font-size:12px;color:#94a3b8;margin-bottom:10px;max-width:260px;line-height:1.5}

/* ── Clinic cards ── */
.clinic-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.clinic-mgmt-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;padding:20px;transition:all .2s}
.clinic-mgmt-card:hover{border-color:#93c5fd;box-shadow:0 4px 20px rgba(14,165,233,.09)}
.cmc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.cmc-name{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#0f172a}
.cmc-sub{font-size:12px;color:#94a3b8;margin-top:2px}
.cmc-status{font-size:12px;font-weight:700;padding:3px 10px;border-radius:9999px}
.cmc-status.active{background:#f0fdf4;color:#15803d}
.cmc-status.inactive{background:#fef2f2;color:#dc2626}
.cmc-type-badge{font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;background:#f5f3ff;color:#6d28d9}
.cmc-meta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:8px}
.cmc-meta-item{font-size:12px;color:#374151}
.cmc-addr{font-size:12px;color:#94a3b8}
.sched-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}

/* ── Post management ── */
.post-mgmt-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:18px;transition:all .2s}
.post-mgmt-card:hover{border-color:#93c5fd}
.pmc-top{display:flex;gap:14px;align-items:flex-start}
.pmc-thumb{width:80px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0}
.pmc-tag{font-size:11px;font-weight:700;background:#f5f3ff;color:#6d28d9;border-radius:9999px;padding:2px 10px;display:inline-block;margin-bottom:6px}
.pmc-title{font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px}
.pmc-preview{font-size:13px;color:#64748b;line-height:1.5;margin-bottom:8px}
.pmc-meta{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.pmc-vis{font-size:11px;font-weight:700;padding:2px 10px;border-radius:9999px}
.vis-pub{background:#eff6ff;color:#1d4ed8}
.vis-priv{background:#f0fdf4;color:#15803d}
.filter-bar{display:flex;gap:8px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
.filter-btn{background:#fff;border:1.5px solid #e5e7eb;border-radius:9999px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s;color:#374151}
.filter-btn.active{background:#0ea5e9;color:#fff;border-color:#0ea5e9}

/* ── Visibility options ── */
.vis-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.vis-option{padding:14px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all .15s}
.vis-option:hover{border-color:#93c5fd}
.vis-option.sel{border-color:#0ea5e9;background:#f0f9ff}
.vo-label{font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px}
.vo-desc{font-size:12px;color:#64748b;line-height:1.5}

/* ── Patient groups ── */
.groups-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-top:16px}
.group-mgmt-card{border-radius:16px;padding:18px;border:1px solid transparent;position:relative}
.color-bg-teal{background:linear-gradient(135deg,#e6fffb,#ccfbf1);border-color:rgba(0,201,200,.2)}
.color-bg-blue{background:linear-gradient(135deg,#eff6ff,#dbeafe);border-color:rgba(59,130,246,.2)}
.color-bg-purple{background:linear-gradient(135deg,#faf5ff,#ede9fe);border-color:rgba(139,92,246,.2)}
.color-bg-orange{background:linear-gradient(135deg,#fff7ed,#fed7aa);border-color:rgba(249,115,22,.2)}
.color-bg-green{background:linear-gradient(135deg,#f0fdf4,#bbf7d0);border-color:rgba(16,185,129,.2)}
.color-bg-red{background:linear-gradient(135deg,#fef2f2,#fecaca);border-color:rgba(239,68,68,.2)}
.gmc-icon{font-size:28px;margin-bottom:8px;display:block}
.gmc-name{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px}
.gmc-desc{font-size:12px;color:#64748b;margin-bottom:4px;line-height:1.4}
.gmc-count{font-size:11px;font-weight:600;color:#0284c7}

/* ── Icon / color pickers ── */
.icon-picker-btn{background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:8px;width:36px;height:36px;font-size:18px;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
.icon-picker-btn:hover{border-color:#93c5fd}
.icon-picker-btn.sel{border-color:#0ea5e9;background:#f0f9ff}
.color-picker-btn{width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all .15s}
.color-picker-btn.sel{border-color:#0f172a!important;transform:scale(1.15)}
.color-teal{background:#0f766e}.color-blue{background:#1d4ed8}.color-purple{background:#6d28d9}
.color-orange{background:#c2410c}.color-green{background:#15803d}.color-red{background:#dc2626}

/* ── Credentials ── */
.cred-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9}
.cred-row:last-child{border-bottom:none}
.cred-primary{font-weight:700;font-size:14px;color:#0f172a}
.cred-secondary{font-size:12px;color:#94a3b8;margin-top:2px}
.lic-status{font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px;background:#fef2f2;color:#dc2626;flex-shrink:0}
.lic-status.valid{background:#f0fdf4;color:#15803d}
.draft-form{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px}

/* ── Reviews ── */
.review-overview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-bottom:24px}
.review-mgmt-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:18px}
.rmc-top{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.rmc-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0}
.rmc-name{font-weight:700;font-size:14px;color:#0f172a}
.rmc-stars{color:#f59e0b;font-size:13px;margin-top:2px}
.rmc-status{font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px}
.rmc-status.approved{background:#f0fdf4;color:#15803d}
.rmc-status.pending{background:#fffbeb;color:#92400e}
.rmc-text{font-size:14px;color:#374151;line-height:1.7;margin-bottom:10px}
.rmc-cats{display:flex;gap:14px;font-size:12px;color:#94a3b8;flex-wrap:wrap}

/* ── Availability ── */
.avail-table{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
.avail-th{display:grid;grid-template-columns:70px auto 110px 110px 80px;gap:12px;padding:12px 16px;background:#f8fafc;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;align-items:center}
.avail-row{display:grid;grid-template-columns:70px auto 110px 110px 80px;gap:12px;padding:12px 16px;border-top:1px solid #f1f5f9;align-items:center}
.avail-row.avail-closed{background:#fafafa;opacity:.6}
.avail-day{font-weight:700;font-size:14px;color:#0f172a}
.avail-preview-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
.avp-day{border-radius:10px;padding:12px 6px;text-align:center}
.avp-open{background:#f0fdf4;border:1px solid #bbf7d0}
.avp-closed{background:#f8fafc;border:1px solid #e5e7eb}
.avp-name{font-size:12px;font-weight:700;color:#374151;margin-bottom:4px}
.avp-slots{font-size:11px;color:#64748b}

/* ── Clinic selector ── */
.clinic-selector{margin-bottom:20px}
.cs-label{font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;display:block}
.cs-tabs{display:flex;gap:8px;flex-wrap:wrap}
.cs-tab{background:#fff;border:1.5px solid #e5e7eb;border-radius:9999px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .15s;color:#374151}
.cs-tab.active{background:#0ea5e9;color:#fff;border-color:#0ea5e9}

/* ── Analytics ── */
.analytics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-bottom:24px}
.overview-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center}
.oc-icon{font-size:22px;margin-bottom:6px}
.oc-val{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#0f172a;line-height:1}
.oc-label{font-size:11px;color:#94a3b8;margin-top:5px;font-weight:500}
.score-bar-wrap{display:flex;align-items:center;gap:16px;margin-bottom:18px}
.score-num{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#0284c7;min-width:60px}
.score-track{flex:1;height:12px;background:#f1f5f9;border-radius:9999px;overflow:hidden}
.score-fill{height:100%;background:linear-gradient(90deg,#0284c7,#0ea5e9);border-radius:9999px;transition:width .8s ease}
.completion-list{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.comp-item{display:flex;align-items:center;gap:8px;font-size:13px}
.comp-item.done{color:#15803d}.comp-item.todo{color:#94a3b8}
.comp-icon{font-size:14px;width:18px;text-align:center}
.tip-row{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
.tip-row:last-child{border-bottom:none}
.tip-icon{font-size:16px;flex-shrink:0}
.tip-text{font-size:13px;color:#374151;line-height:1.6}

/* ── Save Bar ── */
.save-bar{display:flex;align-items:center;gap:16px;padding:20px 0;border-top:1px solid #e5e7eb;margin-top:8px;flex-wrap:wrap}
.save-hint{font-size:12px;color:#94a3b8}

/* ── Empty State ── */
.empty-state{text-align:center;padding:48px 24px;background:#fff;border:1.5px dashed #d1d5db;border-radius:16px;margin-bottom:20px}
.es-icon{font-size:40px;margin-bottom:12px}
.es-title{font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#0f172a;margin-bottom:6px}
.es-sub{font-size:14px;color:#94a3b8;line-height:1.6}

/* ── Toasts ── */
.pf-toast-wrap,.pf-toasts,*[class*="toast-wrap"]{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
div[style*="toast"]{pointer-events:none}
.toast{background:#0f172a;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;font-family:'Outfit',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.2);animation:slideInRight .3s ease,fadeOut .3s 3.2s ease forwards;pointer-events:none}
.toast-error{background:#dc2626}
.toast-success{background:#15803d}
@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes fadeOut{from{opacity:1}to{opacity:0}}

/* ── Spinner ── */
.spin{width:44px;height:44px;border:4px solid #e5e7eb;border-top-color:#0ea5e9;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── Responsive ── */
@media(max-width:900px){
  .dash-layout{grid-template-columns:1fr}
  .dash-sidebar{flex-direction:row;flex-wrap:wrap;height:auto;position:sticky;top:0;z-index:40;padding:10px;border-right:none;border-bottom:1px solid #e5e7eb;overflow-x:auto}
  .dash-nav-btn{flex:0 0 auto;padding:8px 14px}
  .dnb-label{display:none}
  .dash-main{padding:20px 16px}
  .grid-2{grid-template-columns:1fr}
  .completion-list{grid-template-columns:1fr}
  .avail-th,.avail-row{grid-template-columns:60px auto 90px 90px 70px;font-size:12px}
}
@media(max-width:600px){
  .dash-header-inner{padding:12px 16px}
  .review-overview-grid,.analytics-grid{grid-template-columns:repeat(3,1fr)}
}
`;

// ─── Style object for non-CSS usages ──────────────────────────────────────────
const S = {
  page:   { fontFamily: "'Outfit', sans-serif" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 15, color: "#94a3b8" },
  toastWrap: {
    position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
  },
};