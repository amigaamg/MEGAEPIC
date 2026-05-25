"use client";
// ─────────────────────────────────────────────────────────────────────────────
// AMEXAN · components/DiscoverTab.jsx  — Commercial compact card design
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ucImg    = (uuid, w = 160, h = 160) =>
  uuid ? `https://ucarecdn.com/${uuid}/-/scale_crop/${w}x${h}/center/-/format/webp/-/quality/smart/` : null;
const ucBanner = (uuid) =>
  uuid ? `https://ucarecdn.com/${uuid}/-/resize/600x/-/format/webp/-/quality/smart/` : null;
const fmt = (n) => new Intl.NumberFormat("en-KE").format(n);

const TRIAGE = [
  { q: "What's your main concern?", options: ["Heart & chest","Bones & joints","Skin & hair","Stomach & gut","Mental health","Women's health","Eyes","Children's health"], map: {"Heart & chest":"Cardiology","Bones & joints":"Orthopaedics","Skin & hair":"Dermatology","Stomach & gut":"Gastroenterology","Mental health":"Psychiatry","Women's health":"Gynaecology","Eyes":"Ophthalmology","Children's health":"Paediatrics"} },
  { q: "How urgent is this?",        options: ["Emergency — today","This week","Within a month","Just a check-up"] },
  { q: "Consultation preference?",   options: ["In-person clinic","Video / teleconsult","Either works"] },
  { q: "Do you have insurance?",     options: ["Yes, I have insurance","No, paying directly","Not sure"] },
];
const SORTS = ["Best Match","Price: Low–High","Price: High–Low"];

export default function DiscoverTab() {
  const router = useRouter();
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [spec,       setSpec]       = useState("All");
  const [sort,       setSort]       = useState("Best Match");
  const [insOnly,    setInsOnly]    = useState(false);
  const [availOnly,  setAvailOnly]  = useState(false);
  const [showFilt,   setShowFilt]   = useState(false);
  const [showTriage, setShowTriage] = useState(false);
  const [tStep,      setTStep]      = useState(0);
  const [tDone,      setTDone]      = useState(false);
  const [tSpec,      setTSpec]      = useState("All");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "services"), orderBy("createdAt", "desc")),
      (snap) => { setServices(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      ()    => setLoading(false)
    );
    return unsub;
  }, []);

  const specialties = ["All", ...Array.from(new Set(services.map(s => s.specialty).filter(Boolean)))];

  const answerTriage = (answer) => {
    if (tStep === 0) { const sp = TRIAGE[0].map[answer] || "All"; setTSpec(sp); setSpec(sp); }
    tStep < TRIAGE.length - 1 ? setTStep(s => s + 1) : (setTDone(true), setShowTriage(false));
  };
  const resetTriage = () => { setTDone(false); setTStep(0); setTSpec("All"); setSpec("All"); };

  const filtered = services
    .filter(s => {
      const mSpec  = spec === "All" || s.specialty === spec;
      const mSrch  = !search || [s.doctorName, s.specialty, s.clinic, s.location, ...(s.tags || [])].join(" ").toLowerCase().includes(search.toLowerCase());
      const mIns   = !insOnly   || s.acceptsInsurance;
      const mAvail = !availOnly || s.isAvailable === true;
      return mSpec && mSrch && mIns && mAvail;
    })
    .sort((a, b) => {
      if (sort === "Price: Low–High") return (a.price || 0) - (b.price || 0);
      if (sort === "Price: High–Low") return (b.price || 0) - (a.price || 0);
      return (b.rating || 0) - (a.rating || 0);
    });

  const activeFiltCount = [insOnly, availOnly].filter(Boolean).length;

  return (
    <>
      <style>{CSS}</style>

      {/* ── TRIAGE OVERLAY ── */}
      {showTriage && (
        <div className="dt-overlay">
          <div className="dt-tc">
            <button className="dt-x" onClick={() => setShowTriage(false)}>✕</button>
            <div className="dt-pips">{TRIAGE.map((_, i) => <div key={i} className={`dt-pip${i <= tStep ? " on" : ""}`} />)}</div>
            <div className="dt-tstep">Step {tStep + 1} of {TRIAGE.length}</div>
            <div className="dt-tq">{TRIAGE[tStep].q}</div>
            <div className="dt-topts">
              {TRIAGE[tStep].options.map(o => (
                <button key={o} className="dt-topt" onClick={() => answerTriage(o)}>{o}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TRIAGE / RESULT BANNER ── */}
      {!tDone ? (
        <div className="dt-banner">
          <span className="dt-bicon">🩺</span>
          <div>
            <div className="dt-btitle">Not sure which specialist to see?</div>
            <div className="dt-bsub">4 quick questions — matched instantly.</div>
          </div>
          <button className="dt-btn-p" style={{ marginLeft: "auto" }} onClick={() => { setShowTriage(true); setTStep(0); }}>
            Find My Doctor →
          </button>
        </div>
      ) : (
        <div className="dt-tres">
          <span className="dt-ticon">✦</span>
          <span className="dt-ttext">Showing <strong>{tSpec}</strong> specialists matched to your needs</span>
          <button className="dt-reset" onClick={resetTriage}>✕ Reset</button>
        </div>
      )}

      {/* ── SEARCH + CONTROLS ── */}
      <div className="dt-top-row">
        <div className="dt-sw">
          <span className="dt-sico">🔍</span>
          <input className="dt-si" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors, specialties, clinics…" />
          {search && <button className="dt-sc" onClick={() => setSearch("")}>✕</button>}
        </div>
        <select className="dt-sel" value={sort} onChange={e => setSort(e.target.value)}>
          {SORTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className={`dt-fb${showFilt || activeFiltCount > 0 ? " on" : ""}`} onClick={() => setShowFilt(f => !f)}>
          ⚙️ Filters {activeFiltCount > 0 && <span className="dt-fc">{activeFiltCount}</span>}
        </button>
      </div>

      {/* ── FILTER DRAWER ── */}
      {showFilt && (
        <div className="dt-fd">
          <label className="dt-tog"><input type="checkbox" checked={insOnly}   onChange={e => setInsOnly(e.target.checked)}   /> 🏥 Insurance accepted</label>
          <label className="dt-tog"><input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} /> 🟢 Available now</label>
          {activeFiltCount > 0 && <button className="dt-clf" onClick={() => { setInsOnly(false); setAvailOnly(false); }}>Clear all</button>}
        </div>
      )}

      {/* ── SPECIALTY PILLS ── */}
      <div className="dt-pr">
        {specialties.map(sp => (
          <button key={sp} className={`dt-pill${spec === sp ? " on" : ""}`} onClick={() => setSpec(sp)}>{sp}</button>
        ))}
      </div>

      {/* ── RESULTS BAR ── */}
      <div className="dt-rb">
        <span className="dt-rc"><strong>{loading ? "…" : filtered.length}</strong> doctor{filtered.length !== 1 ? "s" : ""} found</span>
        {(search || spec !== "All") && (
          <button className="dt-reset" onClick={() => { setSearch(""); setSpec("All"); }}>Clear search</button>
        )}
      </div>

      {/* ── SKELETONS ── */}
      {loading && (
        <div className="dt-grid">
          {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="dt-skel" />)}
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && filtered.length === 0 && (
        <div className="dt-empty">
          <div style={{ fontSize: 38, marginBottom: 10 }}>🔭</div>
          <div className="dt-et">No doctors match your search</div>
          <div className="dt-es">Try different filters or keywords</div>
          <button className="dt-btn-p" onClick={() => { setSearch(""); setSpec("All"); resetTriage(); }}>Reset all</button>
        </div>
      )}

      {/* ── CARD GRID ── */}
      {!loading && filtered.length > 0 && (
        <div className="dt-grid">
          {filtered.map(svc => {
            const photo  = ucImg(svc.photoUuid, 160, 160);
            const banner = ucBanner(svc.bannerUuid);

            return (
              <div key={svc.id} className="dt-card" onClick={() => router.push(`/dashboard/doctor/${svc.doctorId}`)}>

                {/* ── BANNER STRIP ── */}
                <div className="dt-banner-strip" style={banner ? { backgroundImage: `url(${banner})` } : {}}>
                  <div className="dt-banner-overlay" />
                  <div className="dt-spec-pill">{svc.specialty || "Specialist"}</div>
                  {svc.isAvailable && <div className="dt-avail-dot">🟢</div>}
                </div>

                {/* ── AVATAR + NAME ── */}
                <div className="dt-identity">
                  <div className="dt-avatar">
                    {photo
                      ? <img src={photo} alt={svc.doctorName} className="dt-avatar-img" loading="lazy" />
                      : <div className="dt-avatar-init">{(svc.doctorName || "D")[0]}</div>
                    }
                    {svc.verified && <div className="dt-verified-dot" title="Verified">✓</div>}
                  </div>
                  <div className="dt-name-block">
                    <div className="dt-name">Dr. {svc.doctorName}</div>
                    <div className="dt-clinic-name">{svc.clinic || "—"}</div>
                  </div>
                </div>

                {/* ── LOCATION + RATING ── */}
                <div className="dt-meta-row">
                  {svc.location && <span className="dt-loc">📍 {svc.location}</span>}
                  {svc.rating   && (
                    <span className="dt-rating-chip">
                      <span className="dt-star-ico">★</span>
                      {Number(svc.rating).toFixed(1)}
                      {svc.reviewCount ? <span className="dt-rv-ct"> ({svc.reviewCount})</span> : null}
                    </span>
                  )}
                </div>

                {/* ── TAGS ── */}
                {svc.tags?.length > 0 && (
                  <div className="dt-tags-row">
                    {svc.tags.slice(0, 3).map((t, i) => <span key={i} className="dt-tag">{t}</span>)}
                  </div>
                )}

                {/* ── FEATURE CHIPS ── */}
                <div className="dt-chips-row">
                  {svc.duration         && <span className="dt-chip">⏱ {svc.duration}m</span>}
                  {svc.yearsExperience  && <span className="dt-chip">🏆 {svc.yearsExperience}y</span>}
                  {svc.acceptsInsurance && <span className="dt-chip dt-chip-green">🏥 Insured</span>}
                  {svc.teleconsult      && <span className="dt-chip dt-chip-blue">📹 Video</span>}
                </div>

                {/* ── FOOTER: PRICE + ACTIONS ── */}
                <div className="dt-footer" onClick={e => e.stopPropagation()}>
                  <div className="dt-price-block">
                    <span className="dt-from">From</span>
                    <span className="dt-price">KES {fmt(svc.price || 0)}</span>
                  </div>
                  <div className="dt-actions">
                    <button className="dt-btn-ghost" onClick={e => { e.stopPropagation(); router.push(`/dashboard/doctor/${svc.doctorId}`); }}>
                      Profile
                    </button>
                    <button className="dt-btn-book" onClick={e => { e.stopPropagation(); router.push(`/dashboard/doctor/${svc.doctorId}?book=true`); }}>
                      Book
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box}

.dt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.52);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.dt-tc{background:#fff;border-radius:18px;padding:28px 24px;max-width:440px;width:100%;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.18);animation:dtUp .22s ease;font-family:'Inter',sans-serif}
@keyframes dtUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.dt-x{position:absolute;top:12px;right:12px;background:#f1f5f9;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:12px;color:#64748b;display:flex;align-items:center;justify-content:center}
.dt-pips{display:flex;gap:5px;margin-bottom:16px}
.dt-pip{flex:1;height:3px;border-radius:9999px;background:#e2e8f0;transition:background .25s}
.dt-pip.on{background:#0ea5e9}
.dt-tstep{font-size:10px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:7px}
.dt-tq{font-size:17px;font-weight:800;color:#0f172a;margin-bottom:16px;line-height:1.35}
.dt-topts{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.dt-topt{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;padding:10px 12px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;text-align:left}
.dt-topt:hover{border-color:#0ea5e9;background:#f0f9ff;color:#0369a1}

.dt-banner{display:flex;align-items:center;gap:12px;background:linear-gradient(120deg,#0c4a6e,#0284c7);border-radius:10px;padding:12px 16px;margin-bottom:14px;font-family:'Inter',sans-serif}
.dt-bicon{font-size:22px;flex-shrink:0}
.dt-btitle{font-size:13px;font-weight:700;color:#fff;margin-bottom:1px}
.dt-bsub{font-size:11px;color:rgba(255,255,255,.72)}
.dt-tres{display:flex;align-items:center;gap:7px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:9px;padding:9px 13px;margin-bottom:12px;font-family:'Inter',sans-serif;flex-wrap:wrap}
.dt-ticon{color:#0ea5e9;font-size:13px;font-weight:800}
.dt-ttext{font-size:12px;color:#0369a1;flex:1}
.dt-ttext strong{font-weight:700}

.dt-top-row{display:flex;gap:7px;margin-bottom:9px;flex-wrap:wrap}
.dt-sw{flex:1;min-width:180px;display:flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #e2e8f0;border-radius:9px;padding:0 11px;transition:border-color .15s}
.dt-sw:focus-within{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.09)}
.dt-sico{font-size:13px;color:#94a3b8;flex-shrink:0}
.dt-si{flex:1;border:none;outline:none;padding:9px 0;font-size:13px;color:#0f172a;background:transparent;font-family:'Inter',sans-serif}
.dt-si::placeholder{color:#94a3b8}
.dt-sc{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px;padding:2px}
.dt-sel{padding:8px 11px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;font-family:'Inter',sans-serif;outline:none}
.dt-fb{display:flex;align-items:center;gap:5px;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;white-space:nowrap}
.dt-fb.on{border-color:#0ea5e9;color:#0284c7;background:#f0f9ff}
.dt-fc{background:#ef4444;color:#fff;font-size:9px;font-weight:800;border-radius:9999px;padding:1px 5px;margin-left:1px}

.dt-fd{background:#fafafa;border:1px solid #e2e8f0;border-radius:9px;padding:10px 14px;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-family:'Inter',sans-serif}
.dt-tog{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;font-weight:500;color:#374151}
.dt-tog input{width:14px;height:14px;accent-color:#0ea5e9;cursor:pointer}
.dt-clf{margin-left:auto;background:none;border:none;font-size:12px;color:#ef4444;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif}

.dt-pr{display:flex;gap:5px;overflow-x:auto;padding-bottom:2px;margin-bottom:10px;scrollbar-width:none}
.dt-pr::-webkit-scrollbar{display:none}
.dt-pill{padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:600;border:1.5px solid #e2e8f0;background:#fff;color:#374151;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;white-space:nowrap;flex-shrink:0}
.dt-pill:hover{border-color:#0ea5e9;color:#0284c7}
.dt-pill.on{background:#0ea5e9;color:#fff;border-color:#0ea5e9}

.dt-rb{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-family:'Inter',sans-serif}
.dt-rc{font-size:12px;color:#64748b}
.dt-rc strong{color:#0f172a;font-weight:700}
.dt-reset{background:none;border:none;font-size:11px;font-weight:600;color:#94a3b8;cursor:pointer;font-family:'Inter',sans-serif}
.dt-reset:hover{color:#ef4444}

/* ── GRID: tight, commercial, 5-up on wide screens ── */
.dt-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(188px,1fr));
  gap:10px;
}

.dt-skel{
  height:268px;
  background:linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%);
  background-size:400% 100%;
  border-radius:12px;
  animation:dtSh 1.3s infinite linear;
}
@keyframes dtSh{to{background-position:-400% 0}}

.dt-empty{text-align:center;padding:48px 20px;font-family:'Inter',sans-serif}
.dt-et{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px}
.dt-es{font-size:12px;color:#94a3b8;margin-bottom:14px}

/* ══ CARD ══ */
.dt-card{
  background:#fff;
  border-radius:12px;
  border:1px solid #e8ecf0;
  overflow:hidden;
  cursor:pointer;
  display:flex;
  flex-direction:column;
  font-family:'Inter',sans-serif;
  transition:box-shadow .17s ease,transform .17s ease,border-color .17s ease;
}
.dt-card:hover{
  box-shadow:0 6px 24px rgba(2,132,199,.13);
  border-color:#93c5fd;
  transform:translateY(-2px);
}

/* Banner */
.dt-banner-strip{
  height:68px;flex-shrink:0;
  position:relative;overflow:hidden;
  background:linear-gradient(120deg,#0c4a6e 0%,#0284c7 55%,#06b6d4 100%);
  background-size:cover;background-position:center;
}
.dt-banner-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 30%,rgba(0,0,0,0.42) 100%)}
.dt-spec-pill{
  position:absolute;bottom:6px;left:8px;z-index:2;
  background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);
  backdrop-filter:blur(5px);color:#fff;
  font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;
  border-radius:3px;padding:2px 6px;
}
.dt-avail-dot{
  position:absolute;top:6px;right:7px;z-index:2;
  font-size:10px;background:rgba(240,253,244,.92);
  border-radius:9999px;padding:1px 5px;border:1px solid #bbf7d0;
}

/* Identity */
.dt-identity{display:flex;align-items:flex-start;gap:8px;padding:8px 9px 4px}
.dt-avatar{
  position:relative;flex-shrink:0;
  width:40px;height:40px;margin-top:-20px;
  border-radius:50%;border:2.5px solid #fff;
  box-shadow:0 2px 8px rgba(0,0,0,.14);
  background:#0ea5e9;overflow:hidden;
}
.dt-avatar-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:50%}
.dt-avatar-init{width:100%;height:100%;border-radius:50%;background:#0ea5e9;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:800}
.dt-verified-dot{
  position:absolute;bottom:-1px;right:-2px;
  width:14px;height:14px;border-radius:50%;
  background:#10b981;border:2px solid #fff;
  color:#fff;font-size:7px;font-weight:800;
  display:flex;align-items:center;justify-content:center;
}
.dt-name-block{flex:1;min-width:0;padding-top:6px}
.dt-name{font-size:12px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
.dt-clinic-name{font-size:10px;color:#64748b;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}

/* Meta */
.dt-meta-row{display:flex;align-items:center;justify-content:space-between;padding:0 9px 5px;gap:4px}
.dt-loc{font-size:10px;color:#94a3b8;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.dt-rating-chip{display:flex;align-items:center;gap:2px;background:#fffbeb;border:1px solid #fef08a;border-radius:4px;padding:1px 5px;flex-shrink:0;font-size:10px;font-weight:700;color:#92400e}
.dt-star-ico{color:#f59e0b;font-size:10px}
.dt-rv-ct{font-weight:400;color:#a16207;font-size:9px}

/* Tags */
.dt-tags-row{display:flex;gap:3px;flex-wrap:wrap;padding:0 9px 5px}
.dt-tag{font-size:9px;font-weight:600;color:#6d28d9;background:#faf5ff;border:1px solid #e9d5ff;border-radius:3px;padding:2px 5px}

/* Chips */
.dt-chips-row{display:flex;gap:3px;flex-wrap:wrap;padding:0 9px 7px}
.dt-chip{font-size:9px;font-weight:600;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;padding:2px 5px}
.dt-chip-green{color:#15803d;background:#f0fdf4;border-color:#bbf7d0}
.dt-chip-blue{color:#0369a1;background:#f0f9ff;border-color:#bae6fd}

/* Footer */
.dt-footer{margin-top:auto;display:flex;align-items:center;justify-content:space-between;padding:7px 9px 9px;border-top:1px solid #f1f5f9;gap:5px}
.dt-price-block{display:flex;flex-direction:column;flex-shrink:0}
.dt-from{font-size:8px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px;line-height:1}
.dt-price{font-size:13px;font-weight:800;color:#0f172a;line-height:1.2}
.dt-actions{display:flex;gap:4px;flex-shrink:0}

.dt-btn-ghost{padding:5px 8px;border:1.5px solid #e2e8f0;border-radius:6px;font-size:10px;font-weight:700;color:#374151;background:#fff;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap}
.dt-btn-ghost:hover{border-color:#0ea5e9;color:#0284c7}
.dt-btn-book{padding:5px 10px;background:#0ea5e9;border:none;border-radius:6px;font-size:10px;font-weight:700;color:#fff;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap}
.dt-btn-book:hover{background:#0284c7;box-shadow:0 2px 8px rgba(14,165,233,.35)}
.dt-btn-p{padding:7px 16px;background:#0ea5e9;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap}
.dt-btn-p:hover{background:#0284c7}

/* ── RESPONSIVE ── */
@media(max-width:1280px){.dt-grid{grid-template-columns:repeat(auto-fill,minmax(178px,1fr))}}
@media(max-width:960px) {.dt-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}}
@media(max-width:640px) {
  .dt-grid{grid-template-columns:repeat(2,1fr)!important;gap:8px}
  .dt-top-row{flex-wrap:wrap}
  .dt-sw{min-width:100%}
  .dt-topts{grid-template-columns:1fr}
  /* Slightly larger text on small cards so nothing is unreadable */
  .dt-name{font-size:11px}
  .dt-price{font-size:12px}
  .dt-btn-ghost{display:none} /* hide Profile, keep only Book on tiny cards */
  .dt-btn-book{padding:5px 12px;font-size:11px}
}
@media(max-width:360px){
  .dt-grid{grid-template-columns:repeat(2,1fr)!important;gap:6px}
}
`;