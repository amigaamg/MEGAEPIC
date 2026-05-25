"use client";
// ─────────────────────────────────────────────────────────────────────────────
// AMEXAN · AmexanDoctorPortfolio.jsx  →  components/AmexanDoctorPortfolio.jsx
// Reads: services (by doctorId), users (profile), posts, reviews, appointments
// doctorId = the Firestore UID from your services.doctorId field
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, where, getDocs,
  orderBy, onSnapshot, addDoc, serverTimestamp,
  updateDoc, increment, doc, limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const UC = (uuid, w = 400, h = 400) =>
  uuid ? `https://ucarecdn.com/${uuid}/-/scale_crop/${w}x${h}/center/-/format/webp/-/quality/smart/` : null;
const fmt = (n) => new Intl.NumberFormat("en-KE").format(n ?? 0);
const relTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return d.toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});
};

const WEEK_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat"];

export default function AmexanDoctorPortfolio({ doctorId }) {
  const router = useRouter();
  // ── State ──────────────────────────────────────────────────────────────────
  const [doctor,       setDoctor]       = useState(null);
  const [services,     setServices]     = useState([]);   // all service docs
  const [posts,        setPosts]        = useState([]);
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("about");
  const [selSvc,       setSelSvc]       = useState(null);    // selected service for booking
  const [bookStep,     setBookStep]     = useState(1);       // 1=service 2=slot 3=details
  const [bookSlot,     setBookSlot]     = useState(null);
  const [bookDay,      setBookDay]      = useState(DAYS[0]);
  const [bookData,     setBookData]     = useState({name:"",phone:"",email:"",reason:"",notes:""});
  const [bookLoading,  setBookLoading]  = useState(false);
  const [bookDone,     setBookDone]     = useState(false);
  const [reviewForm,   setReviewForm]   = useState({name:"",rating:5,comm:5,wait:5,clarity:5,text:""});
  const [reviewDone,   setReviewDone]   = useState(false);
  const [reviewLoading,setReviewLoading]= useState(false);
  const [showReviewForm,setShowReviewForm]=useState(false);
  const [followed,     setFollowed]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [photoZoom,    setPhotoZoom]    = useState(false);
  const [postExpanded, setPostExpanded] = useState({});
  const [likedPosts,   setLikedPosts]   = useState({});
  const bookRef = useRef(null);

  // ── Scroll sticky ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Auto-open booking from URL ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("book") === "true") {
      setTab("book");
      setTimeout(() => bookRef.current?.scrollIntoView({behavior:"smooth"}), 300);
    }
  }, []);

  // ── Load doctor: try users/ first, build from services/ if not found ───────
  useEffect(() => {
    if (!doctorId) return;
    const unsub = onSnapshot(doc(db, "users", doctorId), async (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setDoctor({
          id:            doctorId,
          firstName:     d.firstName || d.name?.split(" ")[0] || "Doctor",
          lastName:      d.lastName  || d.name?.split(" ").slice(1).join(" ") || "",
          title:         d.title     || "",
          specialty:     d.specialty || "",
          location:      d.location  || d.city || "",
          bio:           d.bio       || d.about || "",
          tagline:       d.tagline   || "",
          photoUuid:     d.photoUuid || d.photo || null,
          bannerUuid:    d.bannerUuid|| null,
          verified:      d.verified  || false,
          teleconsult:   d.teleconsult || false,
          yearsExp:      d.yearsExperience || d.yearsExp || null,
          totalPatients: d.totalPatients || null,
          affiliations:  d.affiliations  || [],
          specializations: d.specializations || [],
          languages:     d.languages || ["English"],
          education:     d.education || [],
          certifications:d.certifications || [],
          licenses:      d.licenses  || [],
          awards:        d.awards    || [],
          publications:  d.publications || [],
          tags:          d.tags      || [],
          nextAvailable: d.nextAvailable || "This week",
          aiSummary:     d.aiSummary || null,
          availability:  d.availability || null,
        });
      } else {
        // Build from first service doc
        const q = query(collection(db,"services"), where("doctorId","==",doctorId), limit(1));
        const s2 = await getDocs(q);
        if (!s2.empty) {
          const d = s2.docs[0].data();
          const parts = (d.doctorName||"").split(" ");
          setDoctor({
            id:          doctorId,
            firstName:   parts[0] || "Doctor",
            lastName:    parts.slice(1).join(" ") || "",
            title:       d.title || "",
            specialty:   d.specialty || "",
            location:    d.location  || "",
            bio:         d.description || "",
            tagline:     d.tagline || "",
            photoUuid:   d.photoUuid   || null,
            bannerUuid:  d.bannerUuid  || null,
            verified:    d.verified    || false,
            teleconsult: d.teleconsult || false,
            yearsExp:    d.yearsExperience || null,
            totalPatients: null,
            affiliations:[],
            specializations:[],
            languages:   ["English","Swahili"],
            education:   [],
            certifications:[],
            licenses:    [],
            awards:      [],
            publications:[],
            tags:        d.tags || [],
            nextAvailable: "This week",
            aiSummary:   null,
            availability: null,
          });
        } else setDoctor(null);
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [doctorId]);

  // ── Load services (= clinics on portfolio) ─────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    const q = query(collection(db,"services"), where("doctorId","==",doctorId));
    return onSnapshot(q, (snap) => {
      setServices(snap.docs.map(d=>({id:d.id,...d.data()})));
      if (!selSvc && !snap.empty) setSelSvc(snap.docs[0].id);
    });
  }, [doctorId]);

  // ── Load posts ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    const q = query(collection(db,"posts"), where("doctorId","==",doctorId), where("visibility","in",["public","all"]), orderBy("createdAt","desc"));
    return onSnapshot(q, (snap) => setPosts(snap.docs.map(d=>({id:d.id,...d.data()}))));
  }, [doctorId]);

  // ── Load reviews ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;
    const q = query(collection(db,"reviews"), where("doctorId","==",doctorId), where("verified","==",true), orderBy("createdAt","desc"));
    return onSnapshot(q, (snap) => setReviews(snap.docs.map(d=>({id:d.id,...d.data()}))));
  }, [doctorId]);

  // ── Submit booking ─────────────────────────────────────────────────────────
  const submitBooking = async () => {
    if (!bookData.name || !bookData.phone) return;
    setBookLoading(true);
    try {
      const svc = services.find(s=>s.id===selSvc);
      await addDoc(collection(db,"appointments"), {
        doctorId, serviceId:selSvc,
        clinicName: svc?.clinic || "",
        slotDay: bookDay, slotTime: bookSlot,
        patientName: bookData.name, patientPhone: bookData.phone,
        patientEmail: bookData.email, reason: bookData.reason, notes: bookData.notes,
        status: "pending", createdAt: serverTimestamp(),
      });
      setBookDone(true);
    } catch(e) { console.error(e); }
    setBookLoading(false);
  };

  // ── Submit review ──────────────────────────────────────────────────────────
  const submitReview = async () => {
    if (!reviewForm.name || !reviewForm.text) return;
    setReviewLoading(true);
    try {
      await addDoc(collection(db,"reviews"), {
        doctorId, patientName: reviewForm.name,
        rating: reviewForm.rating, communication: reviewForm.comm,
        waitTime: reviewForm.wait, clarity: reviewForm.clarity,
        text: reviewForm.text, verified: false, createdAt: serverTimestamp(),
      });
      setReviewDone(true);
    } catch(e) { console.error(e); }
    setReviewLoading(false);
  };

  // ── Like post ──────────────────────────────────────────────────────────────
  const likePost = async (pid) => {
    if (likedPosts[pid]) return;
    setLikedPosts(p=>({...p,[pid]:true}));
    await updateDoc(doc(db,"posts",pid), {likes: increment(1)});
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen/>;
  if (!doctor) return <NotFound onBack={()=>router.back()}/>;

  const avgRating = reviews.length
    ? (reviews.reduce((a,r)=>a+(r.rating||5),0)/reviews.length).toFixed(1)
    : null;
  const heroPhoto  = UC(doctor.photoUuid, 500, 600);
  const heroBanner = UC(doctor.bannerUuid, 1200, 400);
  const initials   = `${doctor.firstName?.[0]||""}${doctor.lastName?.[0]||""}`.toUpperCase();
  const fullName   = `Dr. ${doctor.firstName} ${doctor.lastName}`.trim();
  const selectedService = services.find(s=>s.id===selSvc);

  const TABS = [
    {id:"about",     label:"About"},
    {id:"services",  label:`Services (${services.length})`},
    {id:"feed",      label:"Health Feed"},
    {id:"reviews",   label:`Reviews${reviews.length>0?` (${reviews.length})`:""}`},
    {id:"credentials",label:"Credentials"},
    {id:"book",      label:"📅 Book Now"},
  ];

  return (
    <div className="pf-page">
      <style>{CSS}</style>

      {/* ── STICKY NAV ──────────────────────────────────────────────────────── */}
      <nav className={`pf-nav${scrolled?" visible":""}`}>
        <div className="pf-nav-inner">
          <div className="pf-nav-left">
            <button className="pf-back-btn" onClick={()=>router.back()}>← Back</button>
            <div className="pf-nav-photo">
              {heroPhoto
                ? <img src={heroPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                : <span className="pf-nav-init">{initials}</span>}
            </div>
            <div>
              <div className="pf-nav-name">{fullName}</div>
              <div className="pf-nav-spec">{doctor.specialty}</div>
            </div>
          </div>
          <div className="pf-nav-right">
            <button className={`pf-follow-btn${followed?" on":""}`} onClick={()=>setFollowed(f=>!f)}>
              {followed?"✓ Following":"+ Follow"}
            </button>
            <button className="pf-nav-book" onClick={()=>setTab("book")}>Book Now</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <header className="pf-hero">
        <div className="pf-hero-banner" style={heroBanner?{backgroundImage:`url(${heroBanner})`}:{}}>
          <div className="pf-hero-overlay"/>
        </div>

        <div className="pf-hero-body">
          {/* Photo */}
          <div className="pf-hero-photo-wrap" onClick={()=>setPhotoZoom(true)}>
            {heroPhoto
              ? <img src={heroPhoto} alt={fullName} className="pf-hero-photo"/>
              : <div className="pf-hero-photo-init">{initials}</div>}
            <div className="pf-hero-photo-glow"/>
            {doctor.verified && <div className="pf-verified-ring">✓</div>}
          </div>

          {/* Info */}
          <div className="pf-hero-info">
            {doctor.specialty && <div className="pf-hero-spec">{doctor.specialty}</div>}
            <h1 className="pf-hero-name">{fullName}</h1>
            {doctor.title && <div className="pf-hero-title">{doctor.title}</div>}

            <div className="pf-hero-meta">
              {doctor.location && <span className="pf-meta-item">📍 {doctor.location}</span>}
              {doctor.yearsExp  && <span className="pf-meta-item">🏆 {doctor.yearsExp} yrs exp</span>}
              {avgRating         && <span className="pf-meta-item">⭐ {avgRating} ({reviews.length})</span>}
              {doctor.nextAvailable && <span className="pf-meta-item pf-meta-green">🟢 {doctor.nextAvailable}</span>}
            </div>

            {doctor.tagline && <blockquote className="pf-tagline">"{doctor.tagline}"</blockquote>}

            <div className="pf-hero-ctas">
              <button className="pf-cta-book" onClick={()=>setTab("book")}>📅 Book Appointment</button>
              {doctor.teleconsult && <button className="pf-cta-tele">📹 Teleconsult</button>}
              <button className={`pf-cta-follow${followed?" on":""}`} onClick={()=>setFollowed(f=>!f)}>
                {followed?"✓ Following":"+ Follow"}
              </button>
            </div>

            {/* Stats bar */}
            <div className="pf-stats">
              {doctor.totalPatients && <><div className="pf-stat"><div className="pf-sv">{fmt(doctor.totalPatients)}+</div><div className="pf-sl">Patients</div></div><div className="pf-sdiv"/></>}
              <div className="pf-stat"><div className="pf-sv">{services.length || "—"}</div><div className="pf-sl">Clinics</div></div>
              {avgRating && <><div className="pf-sdiv"/><div className="pf-stat"><div className="pf-sv">{avgRating}</div><div className="pf-sl">Rating</div></div></>}
              <div className="pf-sdiv"/>
              <div className="pf-stat"><div className="pf-sv">{reviews.length}</div><div className="pf-sl">Reviews</div></div>
            </div>
          </div>
        </div>

        {/* Affiliations ribbon */}
        {doctor.affiliations?.length > 0 && (
          <div className="pf-ribbon">
            <span className="pf-ribbon-label">Affiliated with</span>
            {doctor.affiliations.map((a,i)=><span key={i} className="pf-ribbon-chip">{a}</span>)}
          </div>
        )}
      </header>

      {/* ── TABS ────────────────────────────────────────────────────────────── */}
      <div className="pf-tabs-wrap">
        <div className="pf-tabs">
          {TABS.map(t=>(
            <button key={t.id} className={`pf-tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="pf-content">

        {/* ── ABOUT ── */}
        {tab==="about" && (
          <div className="pf-two-col">
            <div className="pf-main-col">
              {doctor.bio && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">About</h2>
                  <p className="pf-prose">{doctor.bio}</p>
                </section>
              )}
              {doctor.specializations?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Specializations</h2>
                  <div className="pf-chip-group">
                    {doctor.specializations.map((s,i)=><span key={i} className="pf-chip-blue">{s}</span>)}
                  </div>
                </section>
              )}
              {/* Services preview */}
              {services.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Practice Locations</h2>
                  <div className="pf-svc-preview-grid">
                    {services.filter(s=>s.isAvailable).slice(0,3).map(svc=>(
                      <div key={svc.id} className="pf-svc-preview" onClick={()=>{setTab("services");setSelSvc(svc.id);}}>
                        <div className="pf-svcp-name">{svc.clinic}</div>
                        <div className="pf-svcp-loc">{svc.specialty}{svc.location?` · ${svc.location}`:""}</div>
                        <div className="pf-svcp-price">KES {fmt(svc.price)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {doctor.awards?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Awards & Recognition</h2>
                  {doctor.awards.map((a,i)=>(
                    <div key={i} className="pf-award-row">
                      <span className="pf-award-icon">🏅</span>
                      <div><div className="pf-award-t">{a.title}</div><div className="pf-award-s">{a.org} · {a.year}</div></div>
                    </div>
                  ))}
                </section>
              )}
              {doctor.languages?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Languages</h2>
                  <div className="pf-chip-group">
                    {doctor.languages.map((l,i)=><span key={i} className="pf-chip-teal">{l}</span>)}
                  </div>
                </section>
              )}
            </div>
            <div className="pf-side-col">
              {/* AI Summary */}
              <div className="pf-ai-card">
                <div className="pf-ai-header"><span className="pf-ai-icon">✦</span><span className="pf-ai-label">AMEXAN AI Summary</span></div>
                <p className="pf-ai-text">{doctor.aiSummary || `${fullName} is a verified ${doctor.specialty||"specialist"}. ${avgRating?`Rated ${avgRating}/5 by ${reviews.length} patients.`:""} ${doctor.yearsExp?`${doctor.yearsExp} years of clinical experience.`:""}`}</p>
              </div>

              {/* Quick Book */}
              <div className="pf-quick-book">
                <div className="pf-qb-title">Quick Book</div>
                {services.filter(s=>s.isAvailable).slice(0,4).map(svc=>(
                  <button key={svc.id} className="pf-qb-row" onClick={()=>{setSelSvc(svc.id);setTab("book");}}>
                    <div><div className="pf-qb-name">{svc.clinic||svc.specialty}</div><div className="pf-qb-sub">{svc.specialty}{svc.location?` · ${svc.location}`:""}</div></div>
                    <span className="pf-qb-price">KES {fmt(svc.price)}</span>
                  </button>
                ))}
                <button className="pf-cta-book" style={{width:"100%",marginTop:12}} onClick={()=>setTab("book")}>Book Appointment →</button>
              </div>

              {/* Availability */}
              {doctor.availability && (
                <div className="pf-avail-card">
                  <div className="pf-avail-title">🕐 Availability This Week</div>
                  <div className="pf-avail-grid">
                    {doctor.availability.map((d,i)=>(
                      <div key={i} className={`pf-avail-day${d.slots>0?"":" full"}`}>
                        <div className="pf-avd-name">{d.day}</div>
                        <div className="pf-avd-slots">{d.slots>0?`${d.slots}`:"Full"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SERVICES / CLINICS ── */}
        {tab==="services" && (
          <div>
            <div className="pf-services-grid">
              {services.map(svc=>(
                <div key={svc.id} className={`pf-svc-card${selSvc===svc.id?" sel":""}`} onClick={()=>setSelSvc(svc.id)}>
                  <div className="pf-svc-card-top">
                    <div>
                      <div className="pf-svc-name">{svc.clinic||svc.specialty}</div>
                      <div className="pf-svc-type">{svc.specialty}{svc.teleconsult?" · Teleconsult":""}</div>
                    </div>
                    <div className="pf-svc-price-badge">KES {fmt(svc.price)}</div>
                  </div>
                  {svc.location && <div className="pf-svc-loc">📍 {svc.location}</div>}
                  {svc.duration && <div className="pf-svc-loc">⏱ {svc.duration} min consultation</div>}
                  <div className="pf-svc-card-chips">
                    {svc.acceptsInsurance && <span className="pf-chip-green">🏥 Insurance</span>}
                    {svc.teleconsult      && <span className="pf-chip-blue">📹 Online</span>}
                    {svc.isAvailable      && <span className="pf-chip-green">🟢 Available</span>}
                  </div>
                  {svc.tags?.length>0 && (
                    <div className="pf-chip-group" style={{marginTop:8}}>
                      {svc.tags.map((t,i)=><span key={i} className="pf-chip-purple">{t}</span>)}
                    </div>
                  )}
                  <button className="pf-cta-book" style={{width:"100%",marginTop:14}} onClick={e=>{e.stopPropagation();setSelSvc(svc.id);setTab("book");}}>Book at this Clinic</button>
                </div>
              ))}
            </div>

            {/* Selected service detail */}
            {selectedService && (
              <div className="pf-svc-detail">
                <h3 className="pf-svc-det-title">{selectedService.clinic}</h3>
                <div className="pf-svc-det-grid">
                  <div>
                    <div className="pf-det-label">About this service</div>
                    <p className="pf-prose">{selectedService.description || "Consultation with " + fullName}</p>
                  </div>
                  <div>
                    <div className="pf-det-label">Consultation Fee</div>
                    <div className="pf-det-price">KES {fmt(selectedService.price)}</div>
                    {selectedService.acceptsInsurance && <div className="pf-chip-green" style={{marginTop:8,display:"inline-block"}}>🏥 Insurance Accepted</div>}
                  </div>
                  {selectedService.schedule?.length > 0 && (
                    <div>
                      <div className="pf-det-label">Schedule</div>
                      {selectedService.schedule.map((s,i)=>(
                        <div key={i} className="pf-sched-row"><span className="pf-sched-days">{s.days}</span><span className="pf-sched-hrs">{s.hours}</span></div>
                      ))}
                    </div>
                  )}
                  {(selectedService.phone||selectedService.address) && (
                    <div>
                      <div className="pf-det-label">Contact</div>
                      {selectedService.phone   && <div className="pf-contact-row">📞 {selectedService.phone}</div>}
                      {selectedService.address && <div className="pf-contact-row">📍 {selectedService.address}</div>}
                    </div>
                  )}
                </div>
                {selectedService.groups?.length > 0 && (
                  <div style={{marginTop:20}}>
                    <div className="pf-det-label">Patient Groups at this Clinic</div>
                    <div className="pf-groups-grid">
                      {selectedService.groups.map((g,i)=>(
                        <div key={i} className="pf-group-card">
                          <span className="pf-group-icon">{g.icon||"👥"}</span>
                          <div className="pf-group-name">{g.name}</div>
                          {g.count && <div className="pf-group-count">{g.count} patients</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── HEALTH FEED ── */}
        {tab==="feed" && (
          <div className="pf-two-col">
            <div className="pf-main-col">
              {posts.length === 0
                ? <div className="pf-empty"><div style={{fontSize:44}}>📝</div><div className="pf-empty-t">No posts yet</div><div className="pf-empty-s">Dr. {doctor.lastName} hasn't published any health tips yet.</div></div>
                : posts.map(p=>(
                  <article key={p.id} className="pf-post-card">
                    {p.imageUuid && <img src={UC(p.imageUuid,800,420)} alt="" className="pf-post-img"/>}
                    <div className="pf-post-body">
                      {p.tag && <span className="pf-post-tag">{p.tag}</span>}
                      {p.title && <h3 className="pf-post-title">{p.title}</h3>}
                      <div className="pf-post-content" style={{whiteSpace:"pre-line"}}>
                        {postExpanded[p.id] || p.content?.length <= 320
                          ? p.content
                          : p.content?.slice(0,320)+"…"}
                      </div>
                      {p.content?.length > 320 && (
                        <button className="pf-post-more" onClick={()=>setPostExpanded(e=>({...e,[p.id]:!e[p.id]}))}>
                          {postExpanded[p.id]?"Show less":"Read more"}
                        </button>
                      )}
                      <div className="pf-post-meta">
                        <span className="pf-post-time">{relTime(p.createdAt)}</span>
                        <button className={`pf-post-like${likedPosts[p.id]?" liked":""}`} onClick={()=>likePost(p.id)}>
                          {likedPosts[p.id]?"♥":"♡"} {(p.likes||0)+(likedPosts[p.id]?1:0)}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              }
            </div>
            <div className="pf-side-col">
              <div className="pf-follow-card">
                <div style={{fontSize:32,marginBottom:10}}>🔔</div>
                <div className="pf-fc-title">Follow {doctor.firstName}</div>
                <div className="pf-fc-sub">Get health tips, clinic news and updates directly.</div>
                <button className={followed?"pf-cta-follow on":"pf-cta-book"} style={{width:"100%"}} onClick={()=>setFollowed(f=>!f)}>
                  {followed?"✓ Following":"+ Follow Doctor"}
                </button>
              </div>
              {doctor.tags?.length > 0 && (
                <div className="pf-tag-cloud">
                  <div className="pf-det-label" style={{marginBottom:12}}>Topics</div>
                  <div className="pf-chip-group">
                    {doctor.tags.map((t,i)=><span key={i} className="pf-chip-purple">{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab==="reviews" && (
          <div>
            {reviews.length > 0 && (
              <div className="pf-review-summary">
                <div className="pf-rs-score">
                  <div className="pf-rs-big">{avgRating}</div>
                  <div className="pf-rs-stars">{"★".repeat(Math.round(parseFloat(avgRating||5)))}</div>
                  <div className="pf-rs-ct">{reviews.length} verified reviews</div>
                </div>
                <div className="pf-rs-bars">
                  {[{label:"Overall",key:"rating"},{label:"Communication",key:"communication"},{label:"Wait Time",key:"waitTime"},{label:"Clarity",key:"clarity"}].map(c=>{
                    const avg = reviews.reduce((a,r)=>a+(r[c.key]||5),0)/reviews.length;
                    return (
                      <div key={c.key} className="pf-rs-row">
                        <span className="pf-rs-label">{c.label}</span>
                        <div className="pf-rs-bar"><div className="pf-rs-fill" style={{width:`${(avg/5)*100}%`}}/></div>
                        <span className="pf-rs-val">{avg.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI sentiment */}
            <div className="pf-ai-card" style={{marginBottom:24}}>
              <div className="pf-ai-header"><span className="pf-ai-icon">✦</span><span className="pf-ai-label">AI Sentiment Analysis</span></div>
              <p className="pf-ai-text">{doctor.aiSummary || (reviews.length > 0 ? `Based on ${reviews.length} reviews, patients consistently praise ${fullName}'s thoroughness and communication.` : "No reviews yet. Be the first to leave feedback!")}</p>
            </div>

            <div className="pf-review-list">
              {reviews.map(r=>(
                <div key={r.id} className="pf-review-card">
                  <div className="pf-review-top">
                    <div className="pf-review-ava">{r.patientName?.[0]||"P"}</div>
                    <div style={{flex:1}}>
                      <div className="pf-review-name">{r.patientName}</div>
                      <div className="pf-review-stars">{"★".repeat(r.rating||5)}</div>
                    </div>
                    <div className="pf-review-date">{relTime(r.createdAt)}</div>
                  </div>
                  <p className="pf-review-text">{r.text}</p>
                  <div className="pf-review-mini">
                    {[{l:"Comms",v:r.communication},{l:"Wait",v:r.waitTime},{l:"Clarity",v:r.clarity}].filter(x=>x.v).map((x,i)=>(
                      <div key={i} className="pf-review-mini-item"><span className="pf-rmi-l">{x.l}</span><span className="pf-rmi-v">{"★".repeat(x.v)}</span></div>
                    ))}
                  </div>
                  {r.verified && <div className="pf-verified-tag">✓ Verified Patient</div>}
                </div>
              ))}
            </div>

            {/* Leave review */}
            {!showReviewForm && !reviewDone && (
              <button className="pf-cta-ghost" style={{marginTop:24}} onClick={()=>setShowReviewForm(true)}>✍️ Write a Review</button>
            )}
            {showReviewForm && !reviewDone && (
              <div className="pf-review-form-card">
                <h3 className="pf-rf-title">Share Your Experience</h3>
                <div className="pf-field"><label className="pf-flabel">Your Name</label><input className="pf-input" value={reviewForm.name} onChange={e=>setReviewForm(f=>({...f,name:e.target.value}))} placeholder="John Doe"/></div>
                {[{label:"Overall Rating",key:"rating"},{label:"Communication",key:"comm"},{label:"Wait Time",key:"wait"},{label:"Clarity of Explanation",key:"clarity"}].map(c=>(
                  <div key={c.key} className="pf-field">
                    <label className="pf-flabel">{c.label}</label>
                    <div style={{display:"flex",gap:8}}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} className="pf-star-btn" style={{color:n<=reviewForm[c.key]?"#f59e0b":"#d1d5db"}} onClick={()=>setReviewForm(f=>({...f,[c.key]:n}))}>★</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pf-field"><label className="pf-flabel">Your Review</label><textarea className="pf-input" style={{minHeight:100,resize:"vertical"}} value={reviewForm.text} onChange={e=>setReviewForm(f=>({...f,text:e.target.value}))} placeholder="Tell others about your experience…"/></div>
                <div style={{display:"flex",gap:10}}>
                  <button className="pf-cta-book" onClick={submitReview} disabled={reviewLoading}>{reviewLoading?"Submitting…":"Submit Review"}</button>
                  <button className="pf-cta-ghost" onClick={()=>setShowReviewForm(false)}>Cancel</button>
                </div>
              </div>
            )}
            {reviewDone && <div className="pf-success-banner">✓ Thank you! Your review has been submitted for verification.</div>}
          </div>
        )}

        {/* ── CREDENTIALS ── */}
        {tab==="credentials" && (
          <div className="pf-two-col">
            <div className="pf-main-col">
              {(doctor.education?.length > 0) && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Education</h2>
                  <div className="pf-timeline">
                    {doctor.education.map((e,i)=>(
                      <div key={i} className="pf-tl-item">
                        <div className="pf-tl-dot"/>
                        <div><div className="pf-tl-year">{e.year}</div><div className="pf-tl-deg">{e.degree}</div><div className="pf-tl-inst">{e.institution}</div></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {doctor.certifications?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Certifications</h2>
                  {doctor.certifications.map((c,i)=>(
                    <div key={i} className="pf-cert-row">
                      <div className="pf-cert-badge">✓</div>
                      <div><div className="pf-cert-title">{c.name}</div><div className="pf-cert-sub">{c.body} · {c.year}</div></div>
                    </div>
                  ))}
                </section>
              )}
            </div>
            <div className="pf-side-col">
              {doctor.licenses?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Licensing</h2>
                  {doctor.licenses.map((l,i)=>(
                    <div key={i} className="pf-license-card">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div className="pf-lic-name">{l.name}</div><div className="pf-lic-auth">{l.authority}</div></div>
                        <div className={`pf-lic-status${l.valid?" valid":""}`}>{l.valid?"✓ Active":"Expired"}</div>
                      </div>
                      {l.number && <div className="pf-lic-num">License # {l.number}</div>}
                    </div>
                  ))}
                </section>
              )}
              {doctor.affiliations?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Hospital Affiliations</h2>
                  {doctor.affiliations.map((a,i)=>(
                    <div key={i} className="pf-aff-row"><span>🏥</span><span className="pf-aff-name">{a}</span></div>
                  ))}
                </section>
              )}
              {doctor.publications?.length > 0 && (
                <section className="pf-section">
                  <h2 className="pf-sec-title">Publications</h2>
                  {doctor.publications.map((p,i)=>(
                    <div key={i} className="pf-pub-row"><div className="pf-pub-title">{p.title}</div><div className="pf-pub-meta">{p.journal} · {p.year}</div></div>
                  ))}
                </section>
              )}
            </div>
          </div>
        )}

        {/* ── BOOKING TAB (inline, no modal) ── */}
        {tab==="book" && (
          <div className="pf-book-page" ref={bookRef}>
            {!bookDone ? (
              <>
                {/* Step indicator */}
                <div className="pf-book-steps">
                  {["Choose Service","Pick a Slot","Your Details"].map((s,i)=>(
                    <div key={i} className={`pf-bstep${bookStep===i+1?" cur":bookStep>i+1?" done":""}`}>
                      <div className="pf-bstep-num">{bookStep>i+1?"✓":i+1}</div>
                      <div className="pf-bstep-label">{s}</div>
                    </div>
                  ))}
                </div>

                {/* Step 1: choose service */}
                {bookStep===1 && (
                  <div className="pf-book-step">
                    <h2 className="pf-book-sec-title">Select a Service</h2>
                    <div className="pf-book-svcs">
                      {services.filter(s=>s.isAvailable!==false).map(svc=>(
                        <div key={svc.id} className={`pf-book-svc${selSvc===svc.id?" sel":""}`} onClick={()=>setSelSvc(svc.id)}>
                          <div className="pf-bs-sel-dot"/>
                          <div style={{flex:1}}>
                            <div className="pf-bs-name">{svc.clinic||svc.specialty}</div>
                            <div className="pf-bs-sub">{svc.specialty}{svc.location?` · ${svc.location}`:""}{svc.teleconsult?" · Teleconsult":""}</div>
                            {svc.description && <div className="pf-bs-desc">{svc.description.slice(0,80)}…</div>}
                          </div>
                          <div className="pf-bs-price">KES {fmt(svc.price)}</div>
                        </div>
                      ))}
                    </div>
                    <button className="pf-cta-book" style={{marginTop:20}} onClick={()=>selSvc&&setBookStep(2)} disabled={!selSvc}>
                      Continue →
                    </button>
                  </div>
                )}

                {/* Step 2: pick slot */}
                {bookStep===2 && (
                  <div className="pf-book-step">
                    <div className="pf-selected-svc">
                      <span>🏥 {selectedService?.clinic||selectedService?.specialty}</span>
                      <span>KES {fmt(selectedService?.price)}</span>
                    </div>
                    <h2 className="pf-book-sec-title">Choose Day & Time</h2>
                    <div className="pf-day-tabs">
                      {DAYS.map(d=><button key={d} className={`pf-day-tab${bookDay===d?" on":""}`} onClick={()=>{setBookDay(d);setBookSlot(null);}}>{d}</button>)}
                    </div>
                    <div className="pf-slot-grid">
                      {WEEK_SLOTS.map((sl,i)=>{
                        const isFull = i%4===2;
                        return (
                          <button key={sl} disabled={isFull} className={`pf-slot${bookSlot===sl?" sel":""}${isFull?" full":""}`} onClick={()=>!isFull&&setBookSlot(sl)}>
                            <span className="pf-slot-time">{sl}</span>
                            <span className="pf-slot-avail">{isFull?"Full":"Open"}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:20}}>
                      <button className="pf-cta-ghost" onClick={()=>setBookStep(1)}>← Back</button>
                      <button className="pf-cta-book" style={{flex:1}} onClick={()=>bookSlot&&setBookStep(3)} disabled={!bookSlot}>Continue →</button>
                    </div>
                  </div>
                )}

                {/* Step 3: details */}
                {bookStep===3 && (
                  <div className="pf-book-step">
                    <div className="pf-selected-svc">
                      <span>📅 {bookDay} · {bookSlot}</span>
                      <span>🏥 {selectedService?.clinic}</span>
                    </div>
                    <h2 className="pf-book-sec-title">Your Details</h2>
                    {[{key:"name",label:"Full Name *",ph:"John Doe"},{key:"phone",label:"Phone *",ph:"+254 7XX XXX XXX"},{key:"email",label:"Email",ph:"john@example.com"},{key:"reason",label:"Reason for Visit",ph:"e.g. chest pain, follow-up, check-up"}].map(f=>(
                      <div key={f.key} className="pf-field"><label className="pf-flabel">{f.label}</label><input className="pf-input" value={bookData[f.key]} onChange={e=>setBookData(d=>({...d,[f.key]:e.target.value}))} placeholder={f.ph}/></div>
                    ))}
                    <div className="pf-field"><label className="pf-flabel">Additional Notes</label><textarea className="pf-input" style={{minHeight:90,resize:"vertical"}} value={bookData.notes} onChange={e=>setBookData(d=>({...d,notes:e.target.value}))} placeholder="Any other information for the doctor…"/></div>
                    <div style={{display:"flex",gap:10}}>
                      <button className="pf-cta-ghost" onClick={()=>setBookStep(2)}>← Back</button>
                      <button className="pf-cta-book" style={{flex:1}} onClick={submitBooking} disabled={bookLoading||!bookData.name||!bookData.phone}>
                        {bookLoading?"Confirming…":"Confirm Booking"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="pf-book-success">
                <div className="pf-bs-icon">✓</div>
                <h2 className="pf-bs-title">Appointment Confirmed!</h2>
                <p className="pf-bs-sub">Confirmation will be sent to {bookData.phone}</p>
                <div className="pf-bs-details">
                  <div>📅 {bookDay} · {bookSlot}</div>
                  <div>🏥 {selectedService?.clinic}</div>
                  <div>👤 {fullName}</div>
                  <div>📞 {bookData.phone}</div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:24}}>
                  <button className="pf-cta-book" onClick={()=>{setBookDone(false);setBookStep(1);setBookData({name:"",phone:"",email:"",reason:"",notes:""});setBookSlot(null);}}>Book Another</button>
                  <button className="pf-cta-ghost" onClick={()=>setTab("about")}>Back to Profile</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PHOTO ZOOM ──────────────────────────────────────────────────────── */}
      {photoZoom && heroPhoto && (
        <div className="pf-photo-zoom" onClick={()=>setPhotoZoom(false)}>
          <img src={UC(doctor.photoUuid,800,900)} alt={fullName} className="pf-zoomed-photo"/>
        </div>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="pf-footer">
        <div className="pf-footer-brand">AMEXAN</div>
        <div className="pf-footer-sub">Verified healthcare professionals · Kenya & beyond</div>
      </footer>
    </div>
  );
}

// ── Sub components ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="pf-loading">
      <style>{`@keyframes pf-spin{to{transform:rotate(360deg)}}.pf-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px;font-family:'DM Sans',sans-serif}.pf-spinner{width:44px;height:44px;border:4px solid #e5e7eb;border-top-color:#0ea5e9;border-radius:50%;animation:pf-spin .8s linear infinite}.pf-load-txt{font-size:14px;color:#9ca3af}`}</style>
      <div className="pf-spinner"/>
      <div className="pf-load-txt">Loading profile…</div>
    </div>
  );
}

function NotFound({onBack}) {
  return (
    <div style={{textAlign:"center",padding:"80px 24px",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔍</div>
      <div style={{fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:8}}>Doctor not found</div>
      <div style={{fontSize:14,color:"#9ca3af",marginBottom:24}}>This profile doesn't exist or may have been removed.</div>
      <button onClick={onBack} style={{background:"#0ea5e9",color:"#fff",border:"none",borderRadius:12,padding:"12px 28px",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>← Go Back</button>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box}

.pf-page{font-family:'DM Sans',sans-serif;background:#f7f8fa;min-height:100vh;color:#0f172a}

/* Nav */
.pf-nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-bottom:1px solid #e5e7eb;padding:10px 24px;transform:translateY(-100%);transition:transform .3s ease;box-shadow:0 2px 16px rgba(0,0,0,.06)}
.pf-nav.visible{transform:translateY(0)}
.pf-nav-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
.pf-nav-left{display:flex;align-items:center;gap:12px}
.pf-back-btn{background:none;border:1.5px solid #e5e7eb;color:#374151;border-radius:9999px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
.pf-back-btn:hover{background:#f8fafc}
.pf-nav-photo{width:38px;height:38px;border-radius:50%;overflow:hidden;background:#0ea5e9;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pf-nav-init{color:#fff;font-size:14px;font-weight:800}
.pf-nav-name{font-weight:700;font-size:14px;color:#0f172a;font-family:'Sora',sans-serif}
.pf-nav-spec{font-size:12px;color:#94a3b8}
.pf-nav-right{display:flex;gap:8px}
.pf-follow-btn{background:transparent;color:#374151;border:1.5px solid #e2e8f0;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
.pf-follow-btn.on{border-color:#0ea5e9;color:#0284c7;background:#f0f9ff}
.pf-nav-book{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
.pf-nav-book:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(14,165,233,.35)}

/* Hero */
.pf-hero{background:#fff;position:relative}
.pf-hero-banner{height:260px;background:linear-gradient(135deg,#0f172a 0%,#0c4a6e 40%,#0284c7 70%,#38bdf8 100%);background-size:cover;background-position:center;position:relative}
.pf-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.1),rgba(0,0,0,.6))}
.pf-hero-body{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;gap:28px;align-items:flex-start;margin-top:-80px;position:relative;flex-wrap:wrap}
.pf-hero-photo-wrap{position:relative;cursor:pointer;flex-shrink:0}
.pf-hero-photo,.pf-hero-photo-init{width:160px;height:160px;border-radius:9999px;border:4px solid #fff;box-shadow:0 8px 36px rgba(0,0,0,.18);object-fit:cover}
.pf-hero-photo-init{background:linear-gradient(135deg,#0284c7,#38bdf8);display:flex;align-items:center;justify-content:center;color:#fff;font-size:48px;font-weight:800;font-family:'Sora',sans-serif}
.pf-hero-photo-glow{position:absolute;inset:0;border-radius:9999px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.pf-verified-ring{position:absolute;bottom:8px;right:0;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.pf-hero-info{flex:1;min-width:280px;padding-top:84px}
.pf-hero-spec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#0284c7;margin-bottom:6px}
.pf-hero-name{font-size:clamp(24px,4vw,34px);font-weight:800;color:#0f172a;margin:0 0 4px;line-height:1.1;font-family:'Sora',sans-serif}
.pf-hero-title{font-size:15px;color:#64748b;margin-bottom:14px}
.pf-hero-meta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px}
.pf-meta-item{display:flex;align-items:center;gap:5px;font-size:13px;color:#374151;font-weight:500}
.pf-meta-green{color:#15803d!important;font-weight:700!important}
.pf-tagline{font-size:15px;color:#64748b;font-style:italic;border-left:3px solid #0ea5e9;padding-left:14px;margin:0 0 18px;line-height:1.6}
.pf-hero-ctas{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}
.pf-stats{display:flex;align-items:center;gap:0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px 20px}
.pf-stat{flex:1;text-align:center}
.pf-sv{font-size:22px;font-weight:800;color:#0f172a;font-family:'Sora',sans-serif}
.pf-sl{font-size:11px;color:#94a3b8;margin-top:2px;font-weight:500}
.pf-sdiv{width:1px;height:32px;background:#e5e7eb;margin:0 8px}
.pf-ribbon{background:#f8fafc;border-top:1px solid #f0f0f0;padding:12px 24px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;max-width:100%}
.pf-ribbon-label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
.pf-ribbon-chip{font-size:12px;color:#374151;background:#fff;border:1px solid #e5e7eb;border-radius:9999px;padding:4px 14px;font-weight:500}

/* Tabs */
.pf-tabs-wrap{background:#fff;border-bottom:1px solid #e5e7eb;overflow-x:auto;scrollbar-width:none}
.pf-tabs-wrap::-webkit-scrollbar{display:none}
.pf-tabs{display:flex;max-width:1100px;margin:0 auto;padding:0 24px;min-width:max-content}
.pf-tab{padding:15px 20px;font-size:14px;font-weight:600;color:#64748b;background:none;border:none;border-bottom:2.5px solid transparent;cursor:pointer;white-space:nowrap;transition:all .15s;font-family:'DM Sans',sans-serif}
.pf-tab:hover{color:#0284c7}
.pf-tab.on{color:#0284c7;border-bottom-color:#0ea5e9;font-weight:700}

/* Content */
.pf-content{max-width:1100px;margin:0 auto;padding:32px 24px}
.pf-two-col{display:grid;grid-template-columns:1fr 340px;gap:28px}
.pf-main-col{}
.pf-side-col{}
.pf-section{margin-bottom:28px}
.pf-sec-title{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:14px;padding-bottom:10px;border-bottom:1.5px solid #f1f5f9;font-family:'Sora',sans-serif}
.pf-prose{font-size:15px;line-height:1.85;color:#374151}

/* Chips */
.pf-chip-group{display:flex;flex-wrap:wrap;gap:8px}
.pf-chip-blue{font-size:12px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9999px;padding:5px 14px;font-weight:600}
.pf-chip-teal{font-size:12px;background:#f0fdfa;color:#0f766e;border:1px solid #99f6e4;border-radius:9999px;padding:5px 14px;font-weight:600}
.pf-chip-green{font-size:12px;background:#f0fdf4;color:#15803d;border:1px solid #86efac;border-radius:9999px;padding:5px 14px;font-weight:600}
.pf-chip-purple{font-size:12px;background:#f5f3ff;color:#6d28d9;border:1px solid #ddd6fe;border-radius:9999px;padding:5px 14px;font-weight:600}

/* Services grid */
.pf-services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px}
.pf-svc-card{background:#fff;border:2px solid #f0f0f0;border-radius:16px;padding:20px;cursor:pointer;transition:all .2s}
.pf-svc-card:hover{border-color:#93c5fd;box-shadow:0 4px 20px rgba(14,165,233,.1)}
.pf-svc-card.sel{border-color:#0ea5e9;box-shadow:0 4px 24px rgba(14,165,233,.15)}
.pf-svc-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.pf-svc-name{font-weight:800;font-size:15px;color:#0f172a;font-family:'Sora',sans-serif}
.pf-svc-type{font-size:12px;color:#94a3b8;margin-top:2px}
.pf-svc-price-badge{background:#f0f9ff;color:#0284c7;font-size:13px;font-weight:700;border-radius:9999px;padding:4px 12px;flex-shrink:0}
.pf-svc-loc{font-size:12px;color:#94a3b8;margin-bottom:6px}
.pf-svc-card-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.pf-svc-preview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.pf-svc-preview{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px;cursor:pointer;transition:all .15s}
.pf-svc-preview:hover{border-color:#0ea5e9;background:#f0f9ff}
.pf-svcp-name{font-weight:700;font-size:14px;color:#0f172a;margin-bottom:3px}
.pf-svcp-loc{font-size:12px;color:#94a3b8;margin-bottom:8px}
.pf-svcp-price{font-size:15px;font-weight:800;color:#0284c7}

/* Service detail */
.pf-svc-detail{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:28px}
.pf-svc-det-title{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:20px;font-family:'Sora',sans-serif}
.pf-svc-det-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:22px;margin-bottom:20px}
.pf-det-label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.pf-det-price{font-size:26px;font-weight:800;color:#0ea5e9;font-family:'Sora',sans-serif}
.pf-sched-row{display:flex;gap:12px;margin-bottom:6px;font-size:13px}
.pf-sched-days{font-weight:700;color:#374151;min-width:90px}
.pf-sched-hrs{color:#64748b}
.pf-contact-row{font-size:13px;color:#374151;margin-bottom:5px}
.pf-groups-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:10px}
.pf-group-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px;text-align:center}
.pf-group-icon{font-size:22px;display:block;margin-bottom:6px}
.pf-group-name{font-weight:700;font-size:13px;color:#0f172a}
.pf-group-count{font-size:11px;color:#94a3b8;margin-top:2px}

/* AI card */
.pf-ai-card{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:16px;padding:20px;margin-bottom:18px}
.pf-ai-header{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.pf-ai-icon{color:#0284c7;font-size:18px;font-weight:800}
.pf-ai-label{font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:1px}
.pf-ai-text{font-size:14px;color:#374151;line-height:1.7;margin:0}

/* Quick book */
.pf-quick-book{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin-bottom:18px}
.pf-qb-title{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:16px;font-family:'Sora',sans-serif}
.pf-qb-row{display:flex;justify-content:space-between;align-items:center;width:100%;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;margin-bottom:8px;text-align:left}
.pf-qb-row:hover{background:#f0f9ff;border-color:#93c5fd}
.pf-qb-name{font-weight:700;font-size:14px;color:#0f172a}
.pf-qb-sub{font-size:12px;color:#94a3b8}
.pf-qb-price{font-weight:800;font-size:14px;color:#0284c7;flex-shrink:0}

/* Availability */
.pf-avail-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px}
.pf-avail-title{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:14px}
.pf-avail-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.pf-avail-day{border-radius:10px;padding:8px 4px;text-align:center;background:#f0fdf4;border:1px solid #bbf7d0}
.pf-avail-day.full{background:#fef2f2;border-color:#fecaca}
.pf-avd-name{font-size:11px;font-weight:700;color:#374151;margin-bottom:3px}
.pf-avd-slots{font-size:10px;color:#6b7280}

/* Posts */
.pf-post-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;margin-bottom:18px}
.pf-post-img{width:100%;height:220px;object-fit:cover}
.pf-post-body{padding:20px}
.pf-post-tag{font-size:11px;font-weight:700;color:#6d28d9;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:9999px;padding:3px 10px;display:inline-block;margin-bottom:10px}
.pf-post-title{font-size:17px;font-weight:800;color:#0f172a;margin:0 0 10px;line-height:1.35;font-family:'Sora',sans-serif}
.pf-post-content{font-size:14px;color:#374151;line-height:1.8}
.pf-post-more{background:none;border:none;color:#0284c7;cursor:pointer;font-size:14px;font-weight:700;padding:8px 0 0;display:block;font-family:'DM Sans',sans-serif}
.pf-post-meta{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid #f1f5f9}
.pf-post-time{font-size:12px;color:#94a3b8}
.pf-post-like{background:none;border:none;cursor:pointer;font-size:16px;font-weight:700;color:#94a3b8;transition:color .15s;font-family:'DM Sans',sans-serif}
.pf-post-like.liked{color:#ef4444}
.pf-follow-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:22px;text-align:center;margin-bottom:18px}
.pf-fc-title{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:6px;font-family:'Sora',sans-serif}
.pf-fc-sub{font-size:13px;color:#94a3b8;margin-bottom:16px}
.pf-tag-cloud{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px}

/* Reviews */
.pf-review-summary{display:flex;gap:28px;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:26px;margin-bottom:22px;flex-wrap:wrap}
.pf-rs-score{text-align:center;min-width:100px}
.pf-rs-big{font-size:56px;font-weight:800;color:#0f172a;line-height:1;font-family:'Sora',sans-serif}
.pf-rs-stars{color:#f59e0b;font-size:22px;margin:6px 0}
.pf-rs-ct{font-size:12px;color:#94a3b8}
.pf-rs-bars{flex:1;min-width:200px}
.pf-rs-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.pf-rs-label{font-size:13px;color:#374151;width:110px;flex-shrink:0}
.pf-rs-bar{flex:1;height:8px;background:#f1f5f9;border-radius:9999px;overflow:hidden}
.pf-rs-fill{height:100%;background:linear-gradient(90deg,#0284c7,#38bdf8);border-radius:9999px;transition:width .8s ease}
.pf-rs-val{font-size:13px;font-weight:800;color:#0f172a;width:30px;text-align:right}
.pf-review-list{display:flex;flex-direction:column;gap:16px}
.pf-review-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px}
.pf-review-top{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.pf-review-ava{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0}
.pf-review-name{font-weight:700;font-size:14px;color:#0f172a}
.pf-review-stars{color:#f59e0b;font-size:13px}
.pf-review-date{font-size:12px;color:#94a3b8;flex-shrink:0}
.pf-review-text{font-size:14px;color:#374151;line-height:1.7;margin:0 0 12px}
.pf-review-mini{display:flex;gap:16px;flex-wrap:wrap}
.pf-review-mini-item{display:flex;gap:5px;align-items:center}
.pf-rmi-l{font-size:11px;color:#94a3b8;font-weight:600}
.pf-rmi-v{color:#f59e0b;font-size:11px}
.pf-verified-tag{font-size:11px;color:#15803d;font-weight:700;margin-top:10px}
.pf-review-form-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:24px;margin-top:24px}
.pf-rf-title{font-size:18px;font-weight:800;color:#0f172a;margin-bottom:20px;font-family:'Sora',sans-serif}

/* Credentials */
.pf-timeline{position:relative;padding-left:22px;border-left:2px solid #e5e7eb}
.pf-tl-item{position:relative;padding-bottom:22px}
.pf-tl-dot{position:absolute;left:-28px;top:4px;width:12px;height:12px;border-radius:50%;background:#0ea5e9;border:2px solid #fff;box-shadow:0 0 0 2px #0ea5e9}
.pf-tl-year{font-size:11px;font-weight:700;color:#0284c7;margin-bottom:3px}
.pf-tl-deg{font-weight:700;font-size:15px;color:#0f172a}
.pf-tl-inst{font-size:13px;color:#64748b}
.pf-cert-row{display:flex;gap:12px;margin-bottom:14px;align-items:flex-start}
.pf-cert-badge{width:28px;height:28px;border-radius:50%;background:#f0fdf4;color:#15803d;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;border:1px solid #86efac}
.pf-cert-title{font-weight:700;font-size:14px;color:#0f172a}
.pf-cert-sub{font-size:12px;color:#94a3b8}
.pf-license-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px}
.pf-lic-name{font-weight:700;font-size:14px;color:#0f172a}
.pf-lic-auth{font-size:12px;color:#94a3b8}
.pf-lic-status{font-size:12px;font-weight:700;padding:3px 10px;border-radius:9999px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.pf-lic-status.valid{background:#f0fdf4;color:#15803d;border-color:#86efac}
.pf-lic-num{font-size:11px;color:#94a3b8;margin-top:8px;font-family:monospace}
.pf-aff-row{display:flex;gap:10px;align-items:center;margin-bottom:10px}
.pf-aff-name{font-size:14px;color:#374151;font-weight:500}
.pf-pub-row{margin-bottom:14px}
.pf-pub-title{font-weight:700;font-size:14px;color:#0f172a;line-height:1.4}
.pf-pub-meta{font-size:12px;color:#94a3b8;margin-top:3px}

/* Booking */
.pf-book-page{max-width:680px}
.pf-book-steps{display:flex;gap:0;margin-bottom:28px;background:#f8fafc;border-radius:14px;padding:16px 20px}
.pf-bstep{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;opacity:.4}
.pf-bstep.cur,.pf-bstep.done{opacity:1}
.pf-bstep-num{width:30px;height:30px;border-radius:50%;background:#e5e7eb;color:#64748b;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;transition:all .3s}
.pf-bstep.cur .pf-bstep-num{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff}
.pf-bstep.done .pf-bstep-num{background:#15803d;color:#fff}
.pf-bstep-label{font-size:11px;color:#94a3b8;font-weight:600;text-align:center}
.pf-bstep.cur .pf-bstep-label{color:#0284c7;font-weight:700}
.pf-book-step{}
.pf-book-sec-title{font-size:18px;font-weight:800;color:#0f172a;margin-bottom:16px;font-family:'Sora',sans-serif}
.pf-book-svcs{display:flex;flex-direction:column;gap:10px}
.pf-book-svc{display:flex;align-items:center;gap:14px;background:#fff;border:2px solid #e5e7eb;border-radius:14px;padding:16px;cursor:pointer;transition:all .15s;text-align:left;font-family:'DM Sans',sans-serif}
.pf-book-svc:hover{border-color:#93c5fd;background:#f0f9ff}
.pf-book-svc.sel{border-color:#0ea5e9;background:#f0f9ff}
.pf-bs-sel-dot{width:18px;height:18px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0;transition:all .15s}
.pf-book-svc.sel .pf-bs-sel-dot{background:#0ea5e9;border-color:#0ea5e9}
.pf-bs-name{font-weight:800;font-size:15px;color:#0f172a}
.pf-bs-sub{font-size:12px;color:#94a3b8;margin-top:2px}
.pf-bs-desc{font-size:12px;color:#64748b;margin-top:4px}
.pf-bs-price{font-weight:800;font-size:15px;color:#0284c7;flex-shrink:0}
.pf-selected-svc{background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:12px 16px;font-size:13px;color:#0369a1;font-weight:700;display:flex;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:6px}
.pf-day-tabs{display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none}
.pf-day-tabs::-webkit-scrollbar{display:none}
.pf-day-tab{padding:8px 18px;border:1.5px solid #e5e7eb;border-radius:9999px;font-size:13px;font-weight:700;color:#374151;background:#fff;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;white-space:nowrap;flex-shrink:0}
.pf-day-tab.on{background:#0ea5e9;color:#fff;border-color:#0ea5e9}
.pf-slot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.pf-slot{border:2px solid #e5e7eb;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer;background:#fff;transition:all .15s;font-family:'DM Sans',sans-serif}
.pf-slot:hover:not(:disabled){border-color:#0ea5e9;background:#f0f9ff}
.pf-slot.sel{border-color:#0ea5e9;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff}
.pf-slot.sel .pf-slot-time,.pf-slot.sel .pf-slot-avail{color:#fff!important}
.pf-slot.full{opacity:.4;cursor:not-allowed}
.pf-slot-time{display:block;font-weight:800;font-size:14px;color:#0f172a}
.pf-slot-avail{display:block;font-size:10px;color:#94a3b8;margin-top:3px}
.pf-book-success{text-align:center;padding:40px 0}
.pf-bs-icon{width:72px;height:72px;border-radius:50%;background:#f0fdf4;color:#15803d;font-size:32px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.pf-bs-title{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:8px;font-family:'Sora',sans-serif}
.pf-bs-sub{font-size:14px;color:#94a3b8;margin-bottom:24px}
.pf-bs-details{background:#f8fafc;border-radius:14px;padding:18px;text-align:left;font-size:14px;color:#374151;line-height:2.2}

/* Forms */
.pf-field{margin-bottom:16px}
.pf-flabel{font-size:13px;font-weight:700;color:#374151;display:block;margin-bottom:6px}
.pf-input{width:100%;padding:11px 14px;border:1.5px solid #d1d5db;border-radius:10px;font-size:14px;color:#0f172a;background:#fff;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s}
.pf-input:focus{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.1)}
.pf-star-btn{background:none;border:none;cursor:pointer;font-size:26px;transition:color .1s;padding:0}

/* CTAs */
.pf-cta-book{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;box-shadow:0 2px 12px rgba(14,165,233,.25)}
.pf-cta-book:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(14,165,233,.4)}
.pf-cta-book:disabled{opacity:.6;cursor:not-allowed;transform:none}
.pf-cta-tele{background:#0f766e;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.pf-cta-tele:hover{background:#0d9488;transform:translateY(-1px)}
.pf-cta-follow{background:transparent;color:#374151;border:1.5px solid #d1d5db;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.pf-cta-follow:hover,.pf-cta-follow.on{border-color:#0ea5e9;color:#0284c7;background:#f0f9ff}
.pf-cta-ghost{background:transparent;color:#374151;border:1.5px solid #d1d5db;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
.pf-cta-ghost:hover{background:#f8fafc;border-color:#94a3b8}
.pf-award-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.pf-award-icon{font-size:20px;flex-shrink:0}
.pf-award-t{font-weight:700;font-size:14px;color:#0f172a}
.pf-award-s{font-size:12px;color:#94a3b8}

/* Success / empty */
.pf-success-banner{background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;font-size:14px;color:#15803d;font-weight:700;margin-top:20px}
.pf-empty{text-align:center;padding:48px 0}
.pf-empty-t{font-size:18px;font-weight:800;color:#0f172a;margin-bottom:6px;font-family:'Sora',sans-serif}
.pf-empty-s{font-size:14px;color:#94a3b8}

/* Photo zoom */
.pf-photo-zoom{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:500;display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:trFade .2s ease}
.pf-zoomed-photo{max-width:88vw;max-height:88vh;border-radius:18px;object-fit:contain}

/* Footer */
.pf-footer{background:#0f172a;margin-top:64px;padding:28px 24px;text-align:center}
.pf-footer-brand{font-size:22px;font-weight:800;color:#fff;letter-spacing:3px;margin-bottom:4px;font-family:'Sora',sans-serif}
.pf-footer-sub{font-size:13px;color:#475569}

@media(max-width:768px){
  .pf-two-col{grid-template-columns:1fr}
  .pf-hero-body{margin-top:-60px}
  .pf-hero-photo,.pf-hero-photo-init{width:120px;height:120px}
  .pf-hero-info{padding-top:64px}
  .pf-slot-grid{grid-template-columns:repeat(3,1fr)}
  .pf-hero-name{font-size:22px}
}
`;