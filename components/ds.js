// ═══════════════════════════════════════════════════════════════════════════
// AMEXAN DESIGN SYSTEM — ds.js
// Single source of truth for all visual tokens, micro-components, helpers
// ═══════════════════════════════════════════════════════════════════════════

export const DS = {
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

export const inputBase = {
  background:"#0a1825", border:`1px solid ${DS.navyBorder}`,
  borderRadius:8, color:DS.white, fontFamily:DS.fontBody, fontSize:12,
  padding:"8px 11px", width:"100%", outline:"none", boxSizing:"border-box",
  transition:"border .15s",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const fmtDt = ts => ts?.toDate
  ? ts.toDate().toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})
  : ts ? new Date(ts).toLocaleString("en-GB") : "—";

export const fmtDate = ts => ts?.toDate
  ? ts.toDate().toLocaleDateString("en-GB",{dateStyle:"medium"})
  : ts ? new Date(ts).toLocaleDateString("en-GB") : "—";

export const hexToRgb = hex => {
  const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)] : [6,182,212];
};

// ─── Micro Components ─────────────────────────────────────────────────────────
import React, { useState } from "react";

export function NCInput({ value, onChange, placeholder="", type="text", style={}, onFocus, onBlur, onKeyDown }) {
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

export function NCTextarea({ value, onChange, rows=4, placeholder="", style={} }) {
  return (
    <textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={rows}
      placeholder={placeholder}
      style={{ ...inputBase, resize:"vertical", lineHeight:1.7, minHeight:80, ...style }}
      onFocus={e=>{ e.target.style.borderColor=DS.teal; }}
      onBlur={e=>{ e.target.style.borderColor=DS.navyBorder; }}
    />
  );
}

export function NCSelect({ value, onChange, options=[], style={} }) {
  return (
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{ ...inputBase, appearance:"none", ...style }}>
      {options.map(o => typeof o==="string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function NCBtn({ children, onClick, variant="primary", size="md", disabled=false, style={} }) {
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

export function NCCard({ children, glow=false, warn=false, danger=false, style={} }) {
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

export function NCLabel({ children, required, hint }) {
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

export function NCChip({ label, color=DS.teal, onRemove, size="md" }) {
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

export function NCBadge({ children, color=DS.teal }) {
  return (
    <span style={{
      background:`${color}22`, color, border:`1px solid ${color}40`,
      borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:700, fontFamily:DS.fontMono,
    }}>{children}</span>
  );
}

export function SectionHdr({ icon, title, sub }) {
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

export function AlertBox({ type="teal", icon, children }) {
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

export function SectionCard({ title, icon, children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <NCCard style={{ marginBottom: 16 }}>
      <div onClick={() => setOpen(!open)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:DS.white, fontFamily:DS.fontHead }}>{title}</h3>
        </div>
        <span style={{ color:DS.muted }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={{ marginTop:14 }}>{children}</div>}
    </NCCard>
  );
}