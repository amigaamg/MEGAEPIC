// ============================================================
// AMEXAN CLINICAL WORKSPACE  v2.0
// ============================================================
// HOW TO USE — fix the "not reached" bug:
//
//   In your patient list / PatientDetailModal parent:
//
//   import ClinicalWorkspace from './ClinicalWorkspace';
//
//   {selectedPatient && (
//     <ClinicalWorkspace
//       patient={selectedPatient}
//       doctorId={currentDoctor.uid}
//       doctorName={currentDoctor.name}
//       appointments={appointments}
//       onClose={() => setSelectedPatient(null)}
//       mode="outpatient"
//     />
//   )}
//
//   Make sure selectedPatient is set in your onClick handler:
//     onClick={() => setSelectedPatient(patient)}
// ============================================================
"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, limit,
} from 'firebase/firestore';
import HistoryExaminationEngine from "@/components/HistoryExaminationEngine";
import EnhancedClinicalNotes from "@/components/EnhancedClinicalNotes";
// ── Rules engine imports ──────────────────────────────────────
// These come from YOUR ClinicalRulesEngine — adjust path if needed
import {
  getAgeGroup,
  getHistoryFlow,
  getInvestigationsForImpression,
  getExamTemplatesForImpression,
  STANDARD_HISTORY_SECTIONS,
  EXAMINATION_TEMPLATES,
  MONITORING_PROTOCOLS,
  CDS_ALERTS,
  COMPLETENESS_RULES,
  PREFILL_MAP,
  INVESTIGATION_RULES,
  HISTORY_FLOWS,
} from './ClinicalRulesEngine';

// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════
const DS = {
  // Palette — deep medical navy + electric teal
  navy:     '#05101f',
  navyMid:  '#0d1f38',
  navyCard: '#111d30',
  navyBorder:'#1e3352',
  teal:     '#06b6d4',
  tealDim:  'rgba(6,182,212,.12)',
  tealGlow: 'rgba(6,182,212,.25)',
  amber:    '#f59e0b',
  amberDim: 'rgba(245,158,11,.12)',
  red:      '#ef4444',
  redDim:   'rgba(239,68,68,.12)',
  green:    '#10b981',
  greenDim: 'rgba(16,185,129,.12)',
  indigo:   '#818cf8',
  indigoDim:'rgba(129,140,248,.12)',
  white:    '#f0f6ff',
  muted:    '#8498b6',
  // Typography
  fontHead: "'Syne', 'Outfit', sans-serif",
  fontBody: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
  fontMono: "'IBM Plex Mono', 'JetBrains Mono', monospace",
  // Elevation
  shadow:   '0 4px 24px rgba(0,0,0,.35)',
  shadowSm: '0 2px 8px rgba(0,0,0,.25)',
};

// ── Util helpers ──────────────────────────────────────────────
const fmtDt   = ts => ts?.toDate ? ts.toDate().toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}) : ts ? new Date(ts).toLocaleString('en-GB') : '—';
const fmtDate  = ts => ts?.toDate ? ts.toDate().toLocaleDateString('en-GB',{dateStyle:'medium'}) : ts ? new Date(ts).toLocaleDateString('en-GB') : '—';
const age2grp  = age => age == null ? 'adult' : age < 1 ? 'neonate' : age < 12 ? 'paediatric' : age < 18 ? 'adolescent' : age < 65 ? 'adult' : 'elderly';

// ── Shared micro-components ───────────────────────────────────
const Chip = ({ label, color = DS.teal, onRemove, size = 'md' }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:4,
    background:`${color}18`, color, border:`1px solid ${color}40`,
    borderRadius:99, padding: size==='sm'?'2px 7px':'3px 11px',
    fontSize: size==='sm'?10:11, fontWeight:700, fontFamily:DS.fontBody,
    whiteSpace:'nowrap',
  }}>
    {label}
    {onRemove && (
      <button onClick={onRemove} style={{
        background:'none',border:'none',cursor:'pointer',
        color,fontSize:13,lineHeight:1,padding:0,marginLeft:1,
      }}>×</button>
    )}
  </span>
);

const Badge = ({ children, color = DS.teal }) => (
  <span style={{
    background:`${color}22`,color,border:`1px solid ${color}40`,
    borderRadius:99,padding:'2px 8px',fontSize:10,fontWeight:700,fontFamily:DS.fontMono,
  }}>{children}</span>
);

const SectionHeader = ({ icon, title, sub }) => (
  <div style={{marginBottom:16}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
      <span style={{fontSize:18}}>{icon}</span>
      <h2 style={{margin:0,fontSize:15,fontWeight:800,fontFamily:DS.fontHead,color:DS.white,letterSpacing:-.3}}>{title}</h2>
    </div>
    {sub && <p style={{margin:0,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>{sub}</p>}
  </div>
);

const Card = ({ children, style={}, glow=false }) => (
  <div style={{
    background:DS.navyCard,border:`1px solid ${glow?DS.teal:DS.navyBorder}`,
    borderRadius:12,padding:14,
    boxShadow: glow?`0 0 0 1px ${DS.tealGlow},${DS.shadowSm}`:DS.shadowSm,
    ...style,
  }}>{children}</div>
);

const Btn = ({ children, onClick, variant='primary', size='md', disabled=false, style={} }) => {
  const colors = {
    primary: { bg:DS.teal, color:'#05101f' },
    ghost:   { bg:'transparent', color:DS.muted, border:`1px solid ${DS.navyBorder}` },
    danger:  { bg:DS.red, color:'#fff' },
    success: { bg:DS.green, color:'#05101f' },
    amber:   { bg:DS.amber, color:'#05101f' },
  };
  const sz = size==='sm'?{padding:'4px 10px',fontSize:11}:size==='lg'?{padding:'10px 22px',fontSize:14}:{padding:'7px 16px',fontSize:12};
  const c = colors[variant]||colors.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:c.bg, color:c.color,
      border: c.border||'none',
      borderRadius:8, fontFamily:DS.fontBody, fontWeight:700, cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?.6:1, transition:'all .15s',
      display:'inline-flex',alignItems:'center',gap:5,
      ...sz, ...style,
    }}>{children}</button>
  );
};

const Input = ({ value, onChange, placeholder='', type='text', style={} }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      background:'#0a1825', border:`1px solid ${DS.navyBorder}`,
      borderRadius:8, color:DS.white, fontFamily:DS.fontBody, fontSize:12,
      padding:'8px 11px', width:'100%', outline:'none', boxSizing:'border-box',
      transition:'border .15s',
      ...style,
    }}
    onFocus={e=>{e.target.style.borderColor=DS.teal;e.target.style.boxShadow=`0 0 0 2px ${DS.tealGlow}`;}}
    onBlur={e=>{e.target.style.borderColor=DS.navyBorder;e.target.style.boxShadow='none';}}
  />
);

const Select = ({ value, onChange, options=[], style={} }) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)} style={{
    background:'#0a1825', border:`1px solid ${DS.navyBorder}`,
    borderRadius:8, color:DS.white, fontFamily:DS.fontBody, fontSize:12,
    padding:'8px 11px', width:'100%', outline:'none', boxSizing:'border-box',
    ...style,
  }}>
    {options.map(o => typeof o === 'string'
      ? <option key={o} value={o}>{o}</option>
      : <option key={o.value} value={o.value}>{o.label}</option>
    )}
  </select>
);

const Textarea = ({ value, onChange, rows=4, placeholder='' }) => (
  <textarea value={value||''} onChange={e=>onChange(e.target.value)}
    rows={rows} placeholder={placeholder}
    style={{
      background:'#0a1825', border:`1px solid ${DS.navyBorder}`,
      borderRadius:8, color:DS.white, fontFamily:DS.fontBody, fontSize:12,
      padding:'8px 11px', width:'100%', outline:'none', boxSizing:'border-box',
      resize:'vertical', lineHeight:1.7,
    }}
    onFocus={e=>{e.target.style.borderColor=DS.teal;}}
    onBlur={e=>{e.target.style.borderColor=DS.navyBorder;}}
  />
);

const FieldLabel = ({ children, required, hint }) => (
  <label style={{display:'block',fontSize:10,fontWeight:700,color:DS.muted,
    textTransform:'uppercase',letterSpacing:.6,marginBottom:5,fontFamily:DS.fontBody}}>
    {children}
    {required && <span style={{color:DS.red,marginLeft:3}}>*</span>}
    {hint && <span style={{color:DS.muted,fontSize:9,fontWeight:400,marginLeft:6,textTransform:'none'}}>{hint}</span>}
  </label>
);

const ToggleGroup = ({ options, value, onChange, color=DS.teal }) => (
  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
    {options.map(o => {
      const v = typeof o==='string'?o:o.value;
      const l = typeof o==='string'?o:o.label;
      const sel = value===v;
      return (
        <button key={v} onClick={()=>onChange(v)} style={{
          padding:'4px 12px',borderRadius:99,fontSize:11,cursor:'pointer',fontWeight:700,fontFamily:DS.fontBody,
          background:sel?color:'transparent',
          color:sel?'#05101f':DS.muted,
          border:`1px solid ${sel?color:DS.navyBorder}`,
          transition:'all .12s',
        }}>{l}</button>
      );
    })}
  </div>
);

const MultiToggle = ({ options, value=[], onChange, color=DS.teal }) => (
  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
    {options.map(o => {
      const v = typeof o==='string'?o:o.value;
      const l = typeof o==='string'?o:o.label;
      const sel = value.includes(v);
      return (
        <button key={v} onClick={()=>onChange(sel?value.filter(x=>x!==v):[...value,v])} style={{
          padding:'4px 12px',borderRadius:99,fontSize:11,cursor:'pointer',fontWeight:700,fontFamily:DS.fontBody,
          background:sel?color:`${color}12`,
          color:sel?'#05101f':color,
          border:`1px solid ${sel?color:`${color}40`}`,
          transition:'all .12s',
        }}>{l}</button>
      );
    })}
  </div>
);

const SaveBar = ({ onSave, saving, saved, label='Save' }) => (
  <div style={{
    position:'sticky',bottom:0,left:0,right:0,
    background:DS.navyMid,borderTop:`1px solid ${DS.navyBorder}`,
    padding:'10px 16px',display:'flex',justifyContent:'flex-end',gap:8,
    backdropFilter:'blur(8px)',zIndex:10,
  }}>
    <Btn onClick={onSave} disabled={saving} variant={saved?'success':'primary'}>
      {saving ? '⏳ Saving…' : saved ? '✓ Saved' : `💾 ${label}`}
    </Btn>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SECTION 1 ▸ PATIENT BANNER
// ═══════════════════════════════════════════════════════════════
function PatientBanner({ patient, mode, alerts, onModeToggle, onClose }) {
  const criticals = alerts.filter(a=>a.level==='critical');
  const warnings  = alerts.filter(a=>a.level==='warning');

  return (
    <div style={{
      background:`linear-gradient(135deg,${DS.navy} 0%,${DS.navyMid} 100%)`,
      borderBottom:`1px solid ${DS.navyBorder}`,
      padding:'10px 20px',display:'flex',alignItems:'center',gap:14,
      flexWrap:'wrap',flexShrink:0,position:'sticky',top:0,zIndex:200,
      boxShadow:'0 4px 32px rgba(0,0,0,.4)',
    }}>
      {/* Back */}
      {onClose && (
        <button onClick={onClose} style={{
          background:'transparent',border:`1px solid ${DS.navyBorder}`,color:DS.muted,
          borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700,
          fontFamily:DS.fontBody,flexShrink:0,
        }}>← Back</button>
      )}

      {/* Avatar */}
      <div style={{
        width:42,height:42,borderRadius:12,flexShrink:0,
        background:`linear-gradient(135deg,${DS.teal},${DS.indigo})`,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontWeight:900,fontSize:17,color:'#05101f',fontFamily:DS.fontHead,
      }}>{(patient.name||'?')[0]}</div>

      {/* Identity */}
      <div style={{flex:'0 0 auto'}}>
        <div style={{fontWeight:900,fontSize:15,color:DS.white,fontFamily:DS.fontHead,letterSpacing:-.2}}>
          {patient.name}
        </div>
        <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono,marginTop:1,display:'flex',gap:8,flexWrap:'wrap'}}>
          {patient.age && <span>{patient.age}y</span>}
          {patient.gender && <span>{patient.gender}</span>}
          {patient.bloodGroup && <span style={{color:DS.red}}>{patient.bloodGroup}</span>}
          {(patient.hospitalNumber||patient.uhid) && <span style={{color:DS.teal}}>#{patient.hospitalNumber||patient.uhid}</span>}
          {patient.primaryDiagnosis && <span style={{color:DS.amber}}>Dx: {patient.primaryDiagnosis}</span>}
        </div>
      </div>

      {/* Allergy pill */}
      {patient.allergies?.length > 0 && (
        <div style={{
          background:'rgba(239,68,68,.18)',border:'1px solid rgba(239,68,68,.4)',
          borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700,color:'#fca5a5',
          display:'flex',alignItems:'center',gap:6,flexShrink:0,
        }}>
          ⚠️ <span>ALLERGY:</span> {patient.allergies.slice(0,3).join(' · ')}
          {patient.allergies.length>3 && ` +${patient.allergies.length-3}`}
        </div>
      )}

      {/* Live CDS alerts */}
      <div style={{display:'flex',gap:5,flex:1,flexWrap:'wrap',alignItems:'center',overflow:'hidden'}}>
        {criticals.map((a,i)=>(
          <div key={i} style={{
            background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.4)',
            color:'#fca5a5',borderRadius:7,padding:'4px 9px',fontSize:11,fontWeight:700,
            display:'flex',alignItems:'center',gap:4,animation:'pulse 2s infinite',
          }}>🔴 {a.message}</div>
        ))}
        {warnings.slice(0,3).map((a,i)=>(
          <div key={i} style={{
            background:'rgba(245,158,11,.12)',border:'1px solid rgba(245,158,11,.3)',
            color:'#fcd34d',borderRadius:7,padding:'4px 9px',fontSize:11,fontWeight:700,
          }}>🟡 {a.message}</div>
        ))}
      </div>

      {/* Mode toggle */}
      <button onClick={onModeToggle} style={{
        background: mode==='inpatient'?'rgba(16,185,129,.15)':'rgba(6,182,212,.12)',
        border:`1px solid ${mode==='inpatient'?'rgba(16,185,129,.4)':'rgba(6,182,212,.3)'}`,
        color: mode==='inpatient'?'#6ee7b7':DS.teal,
        borderRadius:99,padding:'5px 14px',fontSize:11,fontWeight:800,cursor:'pointer',
        fontFamily:DS.fontBody,flexShrink:0,letterSpacing:.5,
      }}>
        {mode==='inpatient'?'🏥 INPATIENT':'🏃 OUTPATIENT'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 ▸ QUICK ACTION RIBBON
// ═══════════════════════════════════════════════════════════════
const BASE_ACTIONS = [
  { id:'overview',      icon:'⬡',  label:'Overview',  color:DS.teal   },
  { id:'history',       icon:'📋', label:'History',   color:DS.indigo },
  { id:'examination',   icon:'🔬', label:'Exam',      color:DS.green  },
  { id:'notes',         icon:'✍',  label:'Notes',     color:DS.teal   },
  { id:'orders',        icon:'🧪', label:'Orders',    color:DS.amber  },
  { id:'prescriptions', icon:'💊', label:'Rx',        color:'#f472b6' },
  { id:'monitoring',    icon:'📈', label:'Monitor',   color:DS.green  },
  { id:'timeline',      icon:'⏱', label:'Timeline',  color:DS.indigo },
];
const INPATIENT_ACTIONS = [
  { id:'admission',     icon:'🛏', label:'Admission', color:DS.amber  },
  { id:'discharge',     icon:'🚪', label:'Discharge', color:DS.red    },
  { id:'fluids',        icon:'💧', label:'MAR/Fluids',color:DS.teal   },
];

function QuickActionRibbon({ active, onAction, mode }) {
  const actions = mode==='inpatient'?[...BASE_ACTIONS,...INPATIENT_ACTIONS]:BASE_ACTIONS;
  return (
    <div style={{
      display:'flex',gap:2,padding:'6px 14px',
      background:DS.navyMid,borderBottom:`1px solid ${DS.navyBorder}`,
      overflowX:'auto',flexShrink:0,
    }}>
      {actions.map(a=>{
        const isActive = active===a.id;
        return (
          <button key={a.id} onClick={()=>onAction(a.id)} style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:2,
            padding:'6px 11px',borderRadius:9,cursor:'pointer',
            border:`1px solid ${isActive?a.color:'transparent'}`,
            background: isActive?`${a.color}18`:'transparent',
            color: isActive?a.color:DS.muted,
            fontFamily:DS.fontBody,fontSize:10,fontWeight:800,
            transition:'all .12s',whiteSpace:'nowrap',minWidth:48,flexShrink:0,
          }}>
            <span style={{fontSize:16,lineHeight:1}}>{a.icon}</span>
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 3 ▸ LEFT SIDEBAR
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:'overview',      icon:'⬡',  label:'Overview'       },
  { id:'encounters',    icon:'🗓', label:'Encounters'     },
  { id:'medications',   icon:'💊', label:'Medications'    },
  { id:'labs',          icon:'🧪', label:'Lab Results'    },
  { id:'allergies',     icon:'⚠️', label:'Allergies'      },
  { id:'vaccinations',  icon:'💉', label:'Vaccinations'   },
  { id:'documents',     icon:'📁', label:'Documents'      },
  { id:'family_hx',     icon:'👨‍👩‍👧',label:'Family Hx'     },
  { id:'social_hx',     icon:'🏠', label:'Social Hx'     },
];

function LeftSidebar({ patient, appointments, onNav, active }) {
  const appts = useMemo(()=>appointments.filter(a=>a.patientId===patient.uid),[appointments,patient.uid]);
  return (
    <div style={{
      width:190,flexShrink:0,background:DS.navyMid,
      borderRight:`1px solid ${DS.navyBorder}`,
      overflowY:'auto',paddingTop:8,display:'flex',flexDirection:'column',
    }}>
      <div style={{padding:'0 12px 8px',fontSize:9,fontWeight:800,color:DS.muted,
        textTransform:'uppercase',letterSpacing:1,fontFamily:DS.fontBody}}>Navigation</div>
      {NAV_ITEMS.map(n=>{
        const isA = active===n.id;
        return (
          <button key={n.id} onClick={()=>onNav(n.id)} style={{
            width:'100%',textAlign:'left',padding:'8px 12px',
            background:isA?DS.tealDim:'transparent',
            border:'none',cursor:'pointer',fontFamily:DS.fontBody,
            fontSize:12,fontWeight:isA?700:500,
            color:isA?DS.teal:DS.muted,
            borderLeft:`3px solid ${isA?DS.teal:'transparent'}`,
            display:'flex',alignItems:'center',gap:8,transition:'all .1s',
          }}>
            <span style={{fontSize:14}}>{n.icon}</span>{n.label}
          </button>
        );
      })}

      {/* Recent encounters mini-tree */}
      {appts.length>0 && (
        <>
          <div style={{padding:'10px 12px 4px',fontSize:9,fontWeight:800,color:DS.muted,
            textTransform:'uppercase',marginTop:8,letterSpacing:1,fontFamily:DS.fontBody}}>
            Recent Encounters
          </div>
          {appts.slice(0,6).map(a=>(
            <div key={a.id} style={{padding:'5px 12px 5px 22px',fontSize:11,
              borderLeft:'2px solid transparent'}}>
              <div style={{fontWeight:600,color:DS.white,fontFamily:DS.fontBody}}>
                {a.specialty||'Consultation'}
              </div>
              <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono}}>
                {fmtDate(a.date)} · <span style={{color:a.status==='completed'?DS.green:DS.amber}}>{a.status}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4 ▸ RIGHT INTELLIGENCE PANEL
// ═══════════════════════════════════════════════════════════════
function RightIntelligence({ impressions, section, patient, alerts }) {
  const inv = useMemo(()=>getInvestigationsForImpression(impressions),[impressions]);
  const hasInv = inv.urgent?.length>0||inv.routine?.length>0;

  return (
    <div style={{
      width:230,flexShrink:0,background:DS.navyMid,
      borderLeft:`1px solid ${DS.navyBorder}`,
      overflowY:'auto',padding:12,
    }}>
      <div style={{fontSize:11,fontWeight:800,color:DS.teal,textTransform:'uppercase',
        letterSpacing:1,marginBottom:12,fontFamily:DS.fontHead,display:'flex',
        alignItems:'center',gap:6}}>
        🧠 Intelligence
      </div>

      {/* CDS Alerts */}
      {alerts.length>0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:800,color:DS.red,textTransform:'uppercase',
            letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>⚡ Active Alerts</div>
          {alerts.map((a,i)=>(
            <div key={i} style={{
              background:a.level==='critical'?DS.redDim:DS.amberDim,
              border:`1px solid ${a.level==='critical'?'rgba(239,68,68,.3)':'rgba(245,158,11,.3)'}`,
              borderRadius:8,padding:'7px 9px',fontSize:11,marginBottom:5,
              color:a.level==='critical'?'#fca5a5':'#fcd34d',fontFamily:DS.fontBody,
            }}>
              {a.message}
              {a.pathway && <div style={{fontWeight:700,marginTop:2,fontSize:10}}>→ {a.pathway}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Investigation suggestions */}
      {hasInv && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:800,color:DS.white,textTransform:'uppercase',
            letterSpacing:.5,marginBottom:8,fontFamily:DS.fontBody}}>🧪 Suggested Inv.</div>
          {impressions.map(imp=>INVESTIGATION_RULES?.[imp] && (
            <div key={imp} style={{marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:DS.teal,marginBottom:4,fontFamily:DS.fontBody}}>
                {imp}
              </div>
              {INVESTIGATION_RULES[imp].urgent?.slice(0,4).map((t,i)=>(
                <div key={i} style={{fontSize:10,padding:'3px 7px',background:DS.redDim,
                  borderRadius:5,marginBottom:2,color:'#fca5a5',fontWeight:600,fontFamily:DS.fontBody}}>
                  🔴 {t}
                </div>
              ))}
              {INVESTIGATION_RULES[imp].routine?.slice(0,3).map((t,i)=>(
                <div key={i} style={{fontSize:10,padding:'3px 7px',background:DS.greenDim,
                  borderRadius:5,marginBottom:2,color:'#6ee7b7',fontWeight:600,fontFamily:DS.fontBody}}>
                  🟢 {t}
                </div>
              ))}
              {INVESTIGATION_RULES[imp].pathway && (
                <div style={{fontSize:10,background:DS.indigoDim,borderRadius:5,
                  padding:'3px 7px',color:DS.indigo,fontWeight:700,marginTop:2,fontFamily:DS.fontBody}}>
                  📋 {INVESTIGATION_RULES[imp].pathway}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No impressions yet */}
      {impressions.length===0 && (
        <div style={{fontSize:11,color:DS.muted,fontStyle:'italic',fontFamily:DS.fontBody,
          textAlign:'center',padding:'20px 8px',lineHeight:1.6}}>
          Add impressions in Notes to activate rule-based suggestions.
        </div>
      )}

      {/* Monitoring protocols */}
      {impressions.map(imp=>MONITORING_PROTOCOLS?.[imp] && (
        <div key={imp} style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:800,color:DS.green,textTransform:'uppercase',
            letterSpacing:.5,marginBottom:5,fontFamily:DS.fontBody}}>
            📈 {MONITORING_PROTOCOLS[imp].label}
          </div>
          {MONITORING_PROTOCOLS[imp].parameters?.slice(0,3).map((p,i)=>(
            <div key={i} style={{fontSize:10,color:DS.muted,padding:'2px 0',fontFamily:DS.fontBody}}>
              {p.icon} {p.label}:&nbsp;
              <span style={{fontWeight:700,color:DS.white}}>{p.target}</span>
              &nbsp;({p.frequency})
            </div>
          ))}
        </div>
      ))}

      {/* Documentation checklist */}
      {section==='notes' && COMPLETENESS_RULES?.length>0 && (
        <div style={{marginTop:10}}>
          <div style={{fontSize:10,fontWeight:800,color:DS.white,textTransform:'uppercase',
            letterSpacing:.5,marginBottom:6,fontFamily:DS.fontBody}}>✅ Doc Check</div>
          {COMPLETENESS_RULES.map(r=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:6,
              marginBottom:4,fontSize:11,fontFamily:DS.fontBody}}>
              <span style={{color:r.required?DS.red:DS.muted,fontSize:13}}>◻</span>
              <span style={{color:DS.muted}}>{r.label}</span>
              {r.required&&<Badge color={DS.red}>REQ</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 5 ▸ HISTORY ENGINE
// ═══════════════════════════════════════════════════════════════




function PatientChart({ patient, user }) {
  const [activeImpression, setActiveImpression] = useState(null);

  return (
    <div className="chart-layout">
      {/* other sections (vitals, meds, etc.) */}
      <EnhancedClinicalNotes
        patient={{
          uid: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          hospitalNumber: patient.mrn,
          ward: patient.currentWard,
          bed: patient.bed,
          allergies: patient.allergies || [],
        }}
        doctorId={user.uid}
        doctorName={user.displayName}
        mode={patient.admissionActive ? "inpatient" : "outpatient"}
        onImpressions={setActiveImpression}
      />
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// SECTION 8 ▸ ORDERS PANEL
// ═══════════════════════════════════════════════════════════════
function OrdersPanel({ patient, impressions, doctorId, doctorName }) {
  const [freeText, setFreeText] = useState('');
  const [urgency, setUrgency]   = useState('routine');
  const [placed, setPlaced]     = useState([]);
  const [saving, setSaving]     = useState(false);
  const [submitted, setSubmitted]= useState([]);

  const suggested = useMemo(()=>getInvestigationsForImpression(impressions),[impressions]);

  const addOrder=(test,urg=urgency)=>{
    if(!placed.find(o=>o.test===test)){
      setPlaced(p=>[...p,{test,urgency:urg,id:Date.now()}]);
    }
  };

  const handleSubmit=async()=>{
    if(!placed.length)return;
    setSaving(true);
    try{
      const ref=await addDoc(collection(db,'orders'),{
        patientId:patient.uid,doctorId,doctorName,
        orders:placed,impressions,
        createdAt:serverTimestamp(),status:'pending',
      });
      setSubmitted(p=>[...p,...placed]);
      setPlaced([]);
    }catch(e){console.error(e);}
    setSaving(false);
  };

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16}}>
      <SectionHeader icon="🧪" title="Orders" sub="Rule-based investigation suggestions + manual orders" />

      {/* Suggestion panel */}
      {impressions.length>0 ? (
        <Card glow style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:DS.teal,marginBottom:10,fontFamily:DS.fontHead}}>
            🧠 Rule-Based Suggestions for: {impressions.join(' · ')}
          </div>
          {suggested.pathways?.map((p,i)=>(
            <div key={i} style={{
              background:DS.indigoDim,border:`1px solid ${DS.indigo}40`,
              borderRadius:7,padding:'6px 10px',marginBottom:6,fontSize:12,
              fontWeight:700,color:DS.indigo,fontFamily:DS.fontBody,
            }}>📋 Pathway: {p}</div>
          ))}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
            {suggested.urgent?.length>0&&(
              <div>
                <div style={{fontSize:10,fontWeight:800,color:DS.red,marginBottom:6,
                  textTransform:'uppercase',letterSpacing:.5,fontFamily:DS.fontBody}}>🔴 Urgent</div>
                {suggested.urgent.map((t,i)=>{
                  const inCart=placed.find(o=>o.test===t);
                  return (
                    <button key={i} onClick={()=>addOrder(t,'urgent')} style={{
                      display:'block',width:'100%',textAlign:'left',margin:'3px 0',
                      padding:'7px 10px',
                      background:inCart?DS.greenDim:DS.redDim,
                      border:`1px solid ${inCart?DS.green:'rgba(239,68,68,.3)'}`,
                      borderRadius:7,fontSize:11,cursor:'pointer',
                      color:inCart?DS.green:'#fca5a5',fontFamily:DS.fontBody,fontWeight:600,
                    }}>{inCart?'✓ ':'+ '}{t}</button>
                  );
                })}
              </div>
            )}
            {suggested.routine?.length>0&&(
              <div>
                <div style={{fontSize:10,fontWeight:800,color:DS.green,marginBottom:6,
                  textTransform:'uppercase',letterSpacing:.5,fontFamily:DS.fontBody}}>🟢 Routine</div>
                {suggested.routine.map((t,i)=>{
                  const inCart=placed.find(o=>o.test===t);
                  return (
                    <button key={i} onClick={()=>addOrder(t,'routine')} style={{
                      display:'block',width:'100%',textAlign:'left',margin:'3px 0',
                      padding:'7px 10px',
                      background:inCart?DS.greenDim:`${DS.green}10`,
                      border:`1px solid ${inCart?DS.green:DS.green+'40'}`,
                      borderRadius:7,fontSize:11,cursor:'pointer',
                      color:inCart?DS.green:'#6ee7b7',fontFamily:DS.fontBody,fontWeight:600,
                    }}>{inCart?'✓ ':'+ '}{t}</button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:12,color:DS.muted,fontStyle:'italic',fontFamily:DS.fontBody,textAlign:'center',padding:'8px 0'}}>
            Add impressions in the Notes section to activate rule-based investigation suggestions.
          </div>
        </Card>
      )}

      {/* Manual entry */}
      <Card style={{marginBottom:14}}>
        <FieldLabel>Manual Order Entry</FieldLabel>
        <div style={{display:'flex',gap:6}}>
          <Input value={freeText} onChange={setFreeText}
            placeholder="Type investigation, press Enter…"
            style={{flex:1}}
          />
          <Select value={urgency} onChange={setUrgency}
            options={['routine','urgent','stat']} style={{width:90}} />
          <Btn onClick={()=>{if(freeText.trim()){addOrder(freeText.trim());setFreeText('');}}} size="sm">
            + Add
          </Btn>
        </div>
      </Card>

      {/* Order cart */}
      {placed.length>0 && (
        <Card glow style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,color:DS.green,marginBottom:8,fontFamily:DS.fontHead}}>
            🛒 Cart — {placed.length} order{placed.length>1?'s':''}
          </div>
          {placed.map(o=>(
            <div key={o.id} style={{
              display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'7px 10px',background:DS.navyMid,borderRadius:7,marginBottom:4,
            }}>
              <div style={{fontWeight:700,color:DS.white,fontFamily:DS.fontBody,fontSize:12}}>{o.test}</div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <Badge color={o.urgency==='urgent'||o.urgency==='stat'?DS.red:DS.green}>
                  {o.urgency.toUpperCase()}
                </Badge>
                <button onClick={()=>setPlaced(p=>p.filter(x=>x.id!==o.id))} style={{
                  background:'none',border:'none',cursor:'pointer',color:DS.red,fontSize:16,
                }}>×</button>
              </div>
            </div>
          ))}
          <Btn onClick={handleSubmit} disabled={saving} variant="success" style={{width:'100%',marginTop:8,justifyContent:'center'}}>
            {saving?'Submitting…':`✓ Submit ${placed.length} Order${placed.length>1?'s':''}`}
          </Btn>
        </Card>
      )}

      {/* Submitted history */}
      {submitted.length>0 && (
        <div>
          <FieldLabel>Submitted This Session</FieldLabel>
          {submitted.map((o,i)=>(
            <div key={i} style={{
              display:'flex',justifyContent:'space-between',padding:'6px 10px',
              background:DS.greenDim,border:`1px solid ${DS.green}40`,
              borderRadius:7,marginBottom:4,fontSize:11,fontFamily:DS.fontBody,
            }}>
              <span style={{color:DS.green,fontWeight:700}}>✓ {o.test}</span>
              <Badge color={o.urgency==='urgent'?DS.red:DS.green}>{o.urgency}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 9 ▸ PRESCRIPTIONS + ADHERENCE
// ═══════════════════════════════════════════════════════════════
function PrescriptionsPanel({ patient, appointments, doctorId, doctorName }) {
  const allRx = useMemo(()=>
    appointments.filter(a=>a.patientId===patient.uid).flatMap(a=>a.prescriptions||[])
  ,[appointments,patient.uid]);

  const [rx, setRx] = useState({medication:'',dosage:'',route:'Oral',frequency:'OD',duration:'',instructions:''});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const setF=(k,v)=>setRx(p=>({...p,[k]:v}));

  const handleSave=async()=>{
    if(!rx.medication)return;
    setSaving(true);
    try{
      await addDoc(collection(db,'prescriptions'),{
        patientId:patient.uid,doctorId,doctorName,
        ...rx,addedAt:serverTimestamp(),active:true,
      });
      setSaved(true); setTimeout(()=>setSaved(false),3000);
      setRx({medication:'',dosage:'',route:'Oral',frequency:'OD',duration:'',instructions:''});
    }catch(e){console.error(e);}
    setSaving(false);
  };

  const adherence = patient.adherence||{};
  const adPct     = adherence.percent??null;
  const adColor   = adPct==null?DS.muted:adPct>=90?DS.green:adPct>=70?DS.amber:DS.red;

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16}}>
      <SectionHeader icon="💊" title="Prescriptions" sub="Issue new prescriptions · view adherence · check allergies" />

      {/* Allergy banner */}
      {patient.allergies?.length>0 && (
        <div style={{
          background:DS.redDim,border:'1px solid rgba(239,68,68,.4)',
          borderRadius:9,padding:'8px 12px',marginBottom:14,
          fontSize:12,fontWeight:700,color:'#fca5a5',fontFamily:DS.fontBody,
          display:'flex',alignItems:'center',gap:8,
        }}>
          ⚠️ ALLERGY ALERT: {patient.allergies.join(' · ')} — Verify before prescribing
        </div>
      )}

      {/* Adherence card */}
      {allRx.length>0 && (
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:DS.white,marginBottom:12,fontFamily:DS.fontHead}}>
            📊 Adherence Overview
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
            {[
              {label:'Overall Adherence', val:adPct!=null?`${adPct}%`:'—',color:adColor},
              {label:'Doses Missed (7d)', val:adherence.missedLast7d??'—',color:DS.amber},
              {label:'Active Medications', val:allRx.length, color:DS.teal},
            ].map(s=>(
              <div key={s.label} style={{textAlign:'center',background:DS.navyMid,
                borderRadius:9,padding:10,border:`1px solid ${DS.navyBorder}`}}>
                <div style={{fontFamily:DS.fontMono,fontSize:24,fontWeight:900,color:s.color}}>{s.val}</div>
                <div style={{fontSize:10,color:DS.muted,fontWeight:600,fontFamily:DS.fontBody}}>{s.label}</div>
              </div>
            ))}
          </div>
          {adPct!=null && (
            <>
              <div style={{height:8,background:DS.navyMid,borderRadius:99,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${adPct}%`,background:adColor,
                  borderRadius:99,transition:'width .6s'}} />
              </div>
              <div style={{fontSize:10,color:adColor,marginTop:5,fontWeight:700,fontFamily:DS.fontBody}}>
                {adPct>=90?'✅ Good adherence':adPct>=70?'⚠️ Moderate — counsel patient':'🔴 Poor — urgent counselling required'}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Existing prescriptions */}
      {allRx.length>0 && (
        <div style={{marginBottom:18}}>
          <FieldLabel>Current / Past Prescriptions</FieldLabel>
          {allRx.map((r,i)=>(
            <div key={i} style={{
              display:'flex',justifyContent:'space-between',alignItems:'flex-start',
              padding:'10px 12px',background:DS.navyCard,borderRadius:9,marginBottom:5,
              border:`1px solid ${DS.navyBorder}`,
            }}>
              <div>
                <div style={{fontWeight:700,color:DS.white,fontSize:12,fontFamily:DS.fontBody}}>💊 {r.medication}</div>
                <div style={{color:DS.muted,fontSize:11,fontFamily:DS.fontMono,marginTop:2}}>
                  {[r.dosage,r.route,r.frequency,r.duration].filter(Boolean).join(' · ')}
                </div>
                {r.instructions&&<div style={{color:DS.muted,fontSize:10,fontStyle:'italic',marginTop:2,fontFamily:DS.fontBody}}>📌 {r.instructions}</div>}
              </div>
              <div style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono,flexShrink:0}}>
                {r.addedAt?new Date(r.addedAt).toLocaleDateString('en-GB'):'—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Rx form */}
      <Card glow>
        <div style={{fontSize:13,fontWeight:800,color:DS.white,marginBottom:14,fontFamily:DS.fontHead}}>✍ New Prescription</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:10}}>
          {[
            {key:'medication',   label:'Drug Name',   type:'text', placeholder:'e.g. Amoxicillin'},
            {key:'dosage',       label:'Dose',        type:'text', placeholder:'e.g. 500mg'},
            {key:'route',        label:'Route',       type:'select',options:['Oral','IV','IM','SC','Topical','Inhaled','PR','SL','NGT','TD']},
            {key:'frequency',    label:'Frequency',   type:'select',options:['OD','BD','TDS','QDS','PRN','Stat','Nocte','Mane','Q4h','Q6h','Q8h','Q12h']},
            {key:'duration',     label:'Duration',    type:'text', placeholder:'e.g. 7 days'},
            {key:'instructions', label:'Instructions',type:'text', placeholder:'e.g. Take with food'},
          ].map(f=>(
            <div key={f.key}>
              <FieldLabel>{f.label}</FieldLabel>
              {f.type==='select'
                ? <Select value={rx[f.key]} onChange={v=>setF(f.key,v)} options={f.options} />
                : <Input value={rx[f.key]} onChange={v=>setF(f.key,v)} placeholder={f.placeholder} />
              }
            </div>
          ))}
        </div>
        <Btn onClick={handleSave} disabled={saving} variant={saved?'success':'primary'}
          style={{marginTop:14,width:'100%',justifyContent:'center'}}>
          {saving?'Saving…':saved?'✓ Prescribed':'💊 Issue Prescription'}
        </Btn>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 10 ▸ MONITORING PANEL
// ═══════════════════════════════════════════════════════════════
const VITALS_CONFIG=[
  {key:'temp',   label:'Temp',    unit:'°C',     ref:'36.5–37.5', alertMin:36,    alertMax:38.3},
  {key:'pulse',  label:'Pulse',   unit:'bpm',    ref:'60–100',    alertMin:60,    alertMax:100},
  {key:'sbp',    label:'SBP',     unit:'mmHg',   ref:'<130'},
  {key:'dbp',    label:'DBP',     unit:'mmHg',   ref:'<80'},
  {key:'rr',     label:'RR',      unit:'rpm',    ref:'12–20',     alertMin:12,    alertMax:20},
  {key:'spo2',   label:'SpO₂',    unit:'%',      ref:'>94',       alertMin:94},
  {key:'glucose',label:'Glucose', unit:'mmol/L', ref:'4–7.8',     alertMin:4,     alertMax:10},
  {key:'weight', label:'Weight',  unit:'kg',     ref:'—'},
];

function MonitoringPanel({ patient, appointments }) {
  const diagnoses = useMemo(()=>[
    patient.primaryDiagnosis,
    ...(patient.chronicIllnesses||[]),
    ...appointments.filter(a=>a.patientId===patient.uid).flatMap(a=>a.diagnoses||[]),
  ].filter(Boolean),[patient,appointments]);

  const matchedProtocols = useMemo(()=>
    Object.entries(MONITORING_PROTOCOLS||{}).filter(([key])=>
      diagnoses.some(d=>d?.toLowerCase().includes(key.toLowerCase()))
    )
  ,[diagnoses]);

  const [newVitals, setNewVitals]= useState({});
  const [vitals, setVitals]      = useState([]);
  const [saving, setSaving]      = useState(false);

  useEffect(()=>{
    const unsub=onSnapshot(
      query(collection(db,'vitals'),where('patientId','==',patient.uid),orderBy('recordedAt','desc'),limit(40)),
      snap=>setVitals(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
    return()=>unsub();
  },[patient.uid]);

  const handleSave=async()=>{
    setSaving(true);
    const entries=Object.entries(newVitals).filter(([,v])=>v!=='');
    for(const [type,value] of entries){
      await addDoc(collection(db,'vitals'),{
        patientId:patient.uid,type,
        value:isNaN(value)?value:Number(value),
        unit:VITALS_CONFIG.find(v=>v.key===type)?.unit||'',
        recordedAt:serverTimestamp(),
      });
    }
    setNewVitals({});
    setSaving(false);
  };

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16}}>
      <SectionHeader icon="📈" title="Monitoring" sub="Vitals entry · condition-specific protocols · trends" />

      {/* Vitals entry grid */}
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:800,color:DS.white,marginBottom:12,fontFamily:DS.fontHead}}>
          📊 Record Vitals
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
          {VITALS_CONFIG.map(v=>{
            const val=newVitals[v.key]||'';
            const numVal=Number(val);
            const isAbnormal=val&&!isNaN(numVal)&&(
              (v.alertMin&&numVal<v.alertMin)||(v.alertMax&&numVal>v.alertMax)
            );
            return (
              <div key={v.key} style={{
                background:DS.navyMid,borderRadius:9,padding:'9px 10px',
                border:`1px solid ${isAbnormal?DS.red:DS.navyBorder}`,
                transition:'border .15s',
              }}>
                <FieldLabel>{v.label} ({v.unit})</FieldLabel>
                <input type="number" value={val}
                  onChange={e=>setNewVitals(p=>({...p,[v.key]:e.target.value}))}
                  style={{
                    background:'#0a1825',border:`1px solid ${isAbnormal?DS.red:DS.navyBorder}`,
                    borderRadius:7,color:isAbnormal?DS.red:DS.white,fontFamily:DS.fontMono,
                    fontSize:14,fontWeight:isAbnormal?900:500,padding:'6px 9px',
                    width:'100%',outline:'none',boxSizing:'border-box',
                  }}
                />
                <div style={{fontSize:9,color:DS.muted,marginTop:3,fontFamily:DS.fontBody}}>
                  Ref: {v.ref}
                </div>
                {isAbnormal&&<div style={{fontSize:9,color:DS.red,fontWeight:800,marginTop:2,fontFamily:DS.fontBody}}>
                  ⚠ ABNORMAL
                </div>}
              </div>
            );
          })}
        </div>
        <Btn onClick={handleSave} disabled={saving} style={{marginTop:12}}>
          {saving?'Saving…':'📊 Save Vitals'}
        </Btn>
      </Card>

      {/* Condition-specific protocols */}
      {matchedProtocols.map(([key,protocol])=>{
        const latestFor=type=>vitals.find(v=>v.type===type);
        return (
          <Card key={key} style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:DS.white,marginBottom:10,fontFamily:DS.fontHead}}>
              📋 {protocol.label}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8,marginBottom:10}}>
              {protocol.parameters?.map(p=>{
                const latest=latestFor(p.id);
                return (
                  <div key={p.id} style={{background:DS.navyMid,borderRadius:9,padding:10,
                    textAlign:'center',border:`1px solid ${DS.navyBorder}`}}>
                    <div style={{fontSize:20}}>{p.icon}</div>
                    <div style={{fontFamily:DS.fontMono,fontSize:22,fontWeight:900,color:DS.white}}>
                      {latest?.value??'—'}
                      {latest?.value&&<span style={{fontSize:11,color:DS.muted}}> {p.unit}</span>}
                    </div>
                    <div style={{fontSize:10,color:DS.muted,fontWeight:700,fontFamily:DS.fontBody}}>{p.label}</div>
                    <div style={{fontSize:9,color:DS.green,marginTop:2,fontFamily:DS.fontBody}}>Target: {p.target}</div>
                    <div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontBody}}>{p.frequency}</div>
                  </div>
                );
              })}
            </div>
            {protocol.labs?.length>0&&(
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {protocol.labs.map((l,i)=><Chip key={i} label={l} color={DS.indigo} />)}
              </div>
            )}
          </Card>
        );
      })}

      {/* Vitals log */}
      {vitals.length>0 && (
        <div>
          <FieldLabel>Vitals Log (most recent)</FieldLabel>
          {vitals.slice(0,20).map(v=>(
            <div key={v.id} style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'8px 12px',background:DS.navyCard,borderRadius:8,
              marginBottom:4,border:`1px solid ${DS.navyBorder}`,
            }}>
              <span style={{fontSize:11,fontWeight:700,color:DS.muted,textTransform:'uppercase',
                letterSpacing:.5,fontFamily:DS.fontBody,width:70}}>{v.type}</span>
              <span style={{fontFamily:DS.fontMono,fontWeight:900,fontSize:16,color:DS.white}}>
                {v.value}
                <span style={{fontSize:10,fontWeight:400,color:DS.muted,marginLeft:4}}>{v.unit}</span>
              </span>
              <span style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono}}>{fmtDt(v.recordedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 11 ▸ TIMELINE
// ═══════════════════════════════════════════════════════════════
function ProgressTimeline({ patient, appointments }) {
  const [notes,  setNotes]  = useState([]);
  const [vitals, setVitals] = useState([]);

  useEffect(()=>{
    const n=onSnapshot(query(collection(db,'clinical_notes'),where('patientId','==',patient.uid),orderBy('createdAt','desc'),limit(30)),
      s=>setNotes(s.docs.map(d=>({...d.data(),id:d.id,_type:'note'}))));
    const v=onSnapshot(query(collection(db,'vitals'),where('patientId','==',patient.uid),orderBy('recordedAt','desc'),limit(30)),
      s=>setVitals(s.docs.map(d=>({...d.data(),id:d.id,_type:'vital'}))));
    return()=>{n();v();};
  },[patient.uid]);

  const timeline=useMemo(()=>[
    ...notes.map(n=>({...n,time:n.createdAt?.toDate?.()??new Date(n.createdAt??0)})),
    ...vitals.map(v=>({...v,time:v.recordedAt?.toDate?.()??new Date(v.recordedAt??0)})),
    ...appointments.filter(a=>a.patientId===patient.uid)
      .map(a=>({...a,_type:'appointment',time:a.date?.toDate?.()??new Date(a.date??0)})),
  ].sort((a,b)=>b.time-a.time),[notes,vitals,appointments,patient.uid]);

  const dotColor={note:DS.indigo,vital:DS.green,appointment:DS.teal};
  const dotIcon= {note:'📝',vital:'📊',appointment:'🗓'};

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16}}>
      <SectionHeader icon="⏱" title="Clinical Timeline" sub="Chronological record of all clinical events" />
      {timeline.length===0&&<div style={{color:DS.muted,fontSize:12,fontFamily:DS.fontBody}}>No timeline events yet.</div>}
      {timeline.map((item,i)=>(
        <div key={item.id||i} style={{display:'flex',gap:12,marginBottom:2}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
            <div style={{
              width:34,height:34,borderRadius:10,flexShrink:0,
              background:`${dotColor[item._type]||DS.teal}20`,
              border:`1px solid ${dotColor[item._type]||DS.teal}50`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,
            }}>{dotIcon[item._type]||'📋'}</div>
            {i<timeline.length-1&&<div style={{width:1,flex:1,background:DS.navyBorder,marginTop:4,marginBottom:4,minHeight:12}}/>}
          </div>
          <div style={{flex:1,paddingBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>
                {item._type==='note'
                  ?`${NOTE_TYPES.find(t=>t.id===item.noteType)?.label||item.noteType||'Note'} · ${item.format||'SOAP'}`
                  :item._type==='vital'
                  ?`Vital: ${item.type?.toUpperCase()||''}`
                  :item.specialty||'Appointment'}
              </span>
              <span style={{fontSize:10,color:DS.muted,fontFamily:DS.fontMono,flexShrink:0,marginLeft:8}}>
                {item.time?.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})||'—'}
              </span>
            </div>
            <div style={{background:DS.navyCard,borderRadius:8,padding:'8px 10px',
              border:`1px solid ${DS.navyBorder}`,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
              {item._type==='note'&&(
                <>
                  {item.impressions?.length>0&&<span style={{color:DS.teal,fontWeight:700}}>Dx: {item.impressions.join(', ')} — </span>}
                  <span>{item.format==='Narrative'
                    ?((item.content||'').slice(0,120)+'…')
                    :(item.content?.P||item.content?.A||item.content?.S||'—')}</span>
                  {item.doctorName&&<span style={{display:'block',color:DS.muted,fontSize:10,marginTop:3}}>Dr. {item.doctorName}</span>}
                </>
              )}
              {item._type==='vital'&&(
                <span style={{fontFamily:DS.fontMono,fontWeight:800,color:DS.white,fontSize:16}}>
                  {item.value} {item.unit}
                </span>
              )}
              {item._type==='appointment'&&(
                <span>{item.status}{item.notes?` — ${(item.notes||'').slice(0,80)}…`:''}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 12 ▸ OVERVIEW PANEL
// ═══════════════════════════════════════════════════════════════
function OverviewPanel({ patient, appointments, vitals }) {
  const appts  = useMemo(()=>appointments.filter(a=>a.patientId===patient.uid),[appointments,patient.uid]);
  const allRx  = useMemo(()=>appts.flatMap(a=>a.prescriptions||[]),[appts]);
  const latestV= useMemo(()=>{
    const m={};
    vitals.forEach(v=>{if(!m[v.type])m[v.type]=v;});
    return m;
  },[vitals]);

  const vitalCards=[
    {type:'sbp',   icon:'🩺',label:'Blood Pressure', val:`${latestV.sbp?.value||'—'}/${latestV.dbp?.value||'—'}`,unit:'mmHg'},
    {type:'pulse', icon:'💓',label:'Pulse',           val:latestV.pulse?.value||'—',unit:'bpm'},
    {type:'spo2',  icon:'🫁',label:'SpO₂',            val:latestV.spo2?.value||'—', unit:'%'},
    {type:'temp',  icon:'🌡',label:'Temperature',     val:latestV.temp?.value||'—', unit:'°C'},
    {type:'rr',    icon:'💨',label:'Resp Rate',       val:latestV.rr?.value||'—',   unit:'rpm'},
    {type:'glucose',icon:'🩸',label:'Glucose',        val:latestV.glucose?.value||'—',unit:'mmol/L'},
    {type:'weight',icon:'⚖', label:'Weight',          val:latestV.weight?.value||'—',unit:'kg'},
    {type:'rx',    icon:'💊',label:'Medications',     val:allRx.length, unit:'active'},
  ];

  return (
    <div style={{overflowY:'auto',padding:16,height:'100%'}}>
      <SectionHeader icon="⬡" title="Patient Overview" sub={`${patient.name} · ${patient.age||'—'}y · ${patient.gender||'—'}`} />

      {/* Allergy */}
      {patient.allergies?.length>0&&(
        <div style={{background:DS.redDim,border:'1px solid rgba(239,68,68,.35)',
          borderRadius:9,padding:'8px 12px',marginBottom:14,fontSize:12,fontWeight:700,
          color:'#fca5a5',fontFamily:DS.fontBody}}>
          ⚠️ ALLERGIES: {patient.allergies.join(' · ')}
        </div>
      )}

      {/* Vital cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:16}}>
        {vitalCards.map((v,i)=>(
          <div key={i} style={{background:DS.navyCard,borderRadius:11,padding:12,
            textAlign:'center',border:`1px solid ${DS.navyBorder}`}}>
            <div style={{fontSize:22}}>{v.icon}</div>
            <div style={{fontFamily:DS.fontMono,fontWeight:900,fontSize:18,color:DS.white,marginTop:2}}>
              {v.val}
            </div>
            <div style={{fontSize:9,color:DS.muted,fontWeight:600,fontFamily:DS.fontBody}}>{v.label}</div>
            {v.unit&&<div style={{fontSize:9,color:DS.muted,fontFamily:DS.fontMono}}>{v.unit}</div>}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
        {[
          {label:'Total Visits',    val:appts.length,                                       color:DS.teal},
          {label:'Completed',       val:appts.filter(a=>a.status==='completed').length,     color:DS.green},
          {label:'Prescriptions',   val:allRx.length,                                       color:DS.indigo},
        ].map(s=>(
          <div key={s.label} style={{background:DS.navyCard,borderRadius:11,padding:14,
            textAlign:'center',border:`1px solid ${DS.navyBorder}`}}>
            <div style={{fontFamily:DS.fontMono,fontSize:30,fontWeight:900,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:DS.muted,fontWeight:600,fontFamily:DS.fontBody}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent encounters */}
      {appts.length>0&&(
        <>
          <FieldLabel>Recent Encounters</FieldLabel>
          {appts.slice(0,5).map(a=>(
            <div key={a.id} style={{padding:'10px 12px',background:DS.navyCard,borderRadius:9,
              marginBottom:5,border:`1px solid ${DS.navyBorder}`,fontSize:11}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontWeight:700,color:DS.white,fontFamily:DS.fontBody}}>
                    {a.specialty||'Consultation'}
                  </span>
                  <span style={{color:DS.muted,marginLeft:8,fontFamily:DS.fontMono}}>{fmtDate(a.date)}</span>
                </div>
                <Badge color={a.status==='completed'?DS.green:DS.amber}>{a.status}</Badge>
              </div>
              {a.notes&&<div style={{color:DS.muted,fontStyle:'italic',marginTop:4,fontSize:10,fontFamily:DS.fontBody}}>
                "{(a.notes||'').slice(0,90)}{a.notes?.length>90?'…':''}"
              </div>}
            </div>
          ))}
        </>
      )}

      {/* Chronic illnesses */}
      {patient.chronicIllnesses?.length>0&&(
        <div style={{marginTop:14}}>
          <FieldLabel>Chronic Illnesses</FieldLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {patient.chronicIllnesses.map((c,i)=><Chip key={i} label={c} color={DS.amber}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 13 ▸ INPATIENT — ADMISSION CLERKING
// ═══════════════════════════════════════════════════════════════
function AdmissionPanel({ patient, doctorId, doctorName }) {
  const [form, setForm] = useState({
    admissionDate:'', ward:'', bedNumber:'', referringDoctor:'',
    presentingComplaint:'', admissionDiagnosis:'',
    initialManagement:'', parentalConsent:'', modeOfArrival:'Walk-in',
    triageCategory:'', resuscitation:'No',
  });
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSave=async()=>{
    setSaving(true);
    try{
      await addDoc(collection(db,'admissions'),{
        patientId:patient.uid,doctorId,doctorName,
        ...form,admittedAt:serverTimestamp(),status:'active',
      });
      setSaved(true); setTimeout(()=>setSaved(false),3000);
    }catch(e){console.error(e);}
    setSaving(false);
  };

  const fields=[
    {k:'admissionDate',  label:'Admission Date',      type:'date'},
    {k:'ward',           label:'Ward / Unit',          type:'text', placeholder:'e.g. Medical Ward A'},
    {k:'bedNumber',      label:'Bed Number',           type:'text', placeholder:'e.g. B4'},
    {k:'modeOfArrival',  label:'Mode of Arrival',      type:'select', options:['Walk-in','Ambulance','Referred','Emergency']},
    {k:'triageCategory', label:'Triage Category',      type:'select', options:['Immediate','Urgent','Semi-urgent','Non-urgent']},
    {k:'referringDoctor',label:'Referring Doctor',     type:'text'},
    {k:'presentingComplaint',label:'Presenting Complaint',type:'textarea'},
    {k:'admissionDiagnosis', label:'Admission Diagnosis',type:'textarea'},
    {k:'initialManagement',  label:'Initial Management Plan',type:'textarea'},
    {k:'resuscitation',  label:'Resuscitation Status', type:'select', options:['Full resus','DNR','DNAR','For CPR']},
    {k:'parentalConsent',label:'Consent Obtained',     type:'select', options:['Yes','No','Awaiting']},
  ];

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16,paddingBottom:70}}>
      <SectionHeader icon="🛏" title="Admission Clerking" sub="Inpatient admission form — all fields saved to /admissions" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
        {fields.map(f=>(
          <div key={f.k} style={{gridColumn:f.type==='textarea'?'1/-1':'auto'}}>
            <FieldLabel>{f.label}</FieldLabel>
            {f.type==='textarea'
              ? <Textarea value={form[f.k]} onChange={v=>setF(f.k,v)} rows={3} placeholder={f.placeholder} />
              : f.type==='select'
              ? <Select value={form[f.k]} onChange={v=>setF(f.k,v)} options={[{value:'',label:'— Select —'},...(f.options||[])]} />
              : <Input value={form[f.k]} onChange={v=>setF(f.k,v)} type={f.type} placeholder={f.placeholder} />
            }
          </div>
        ))}
      </div>
      <SaveBar onSave={handleSave} saving={saving} saved={saved} label="Save Admission" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 14 ▸ INPATIENT — DISCHARGE SUMMARY
// ═══════════════════════════════════════════════════════════════
function DischargePanel({ patient, doctorId, doctorName }) {
  const [form, setForm]=useState({
    dischargeDate:'',dischargeDiagnosis:'',treatmentSummary:'',
    conditionAtDischarge:'Stable',dischargeDestination:'Home',
    followUpDate:'',followUpLocation:'',dischargeMedications:'',
    redflagSymptoms:'',dietaryAdvice:'',activityAdvice:'',
    pendingResults:'',referrals:'',
  });
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSave=async()=>{
    setSaving(true);
    try{
      await addDoc(collection(db,'discharges'),{
        patientId:patient.uid,doctorId,doctorName,
        ...form,dischargedAt:serverTimestamp(),
      });
      setSaved(true); setTimeout(()=>setSaved(false),3000);
    }catch(e){console.error(e);}
    setSaving(false);
  };

  const fields=[
    {k:'dischargeDate',          label:'Discharge Date',            type:'date'},
    {k:'conditionAtDischarge',   label:'Condition at Discharge',    type:'select', options:['Stable','Improved','Unchanged','Deteriorated','Deceased']},
    {k:'dischargeDestination',   label:'Discharge Destination',     type:'select', options:['Home','Step-down facility','Rehabilitation','Another hospital','Hospice']},
    {k:'dischargeDiagnosis',     label:'Discharge Diagnosis',       type:'textarea'},
    {k:'treatmentSummary',       label:'Treatment Summary',         type:'textarea'},
    {k:'dischargeMedications',   label:'Discharge Medications',     type:'textarea'},
    {k:'followUpDate',           label:'Follow-Up Date',            type:'date'},
    {k:'followUpLocation',       label:'Follow-Up Location',        type:'text', placeholder:'e.g. OPD Cardiology'},
    {k:'redflagSymptoms',        label:'🚩 Red Flag Symptoms (patient education)',type:'textarea'},
    {k:'dietaryAdvice',          label:'Dietary Advice',            type:'textarea'},
    {k:'activityAdvice',         label:'Activity Advice',           type:'textarea'},
    {k:'pendingResults',         label:'Pending Results',           type:'textarea'},
    {k:'referrals',              label:'Referrals Made',            type:'textarea'},
  ];

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16,paddingBottom:70}}>
      <SectionHeader icon="🚪" title="Discharge Summary" sub="Complete and sign before patient leaves" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
        {fields.map(f=>(
          <div key={f.k} style={{gridColumn:f.type==='textarea'?'1/-1':'auto'}}>
            <FieldLabel>{f.label}</FieldLabel>
            {f.type==='textarea'
              ? <Textarea value={form[f.k]} onChange={v=>setF(f.k,v)} rows={3} placeholder={f.placeholder} />
              : f.type==='select'
              ? <Select value={form[f.k]} onChange={v=>setF(f.k,v)} options={[{value:'',label:'— Select —'},...(f.options||[])]} />
              : <Input value={form[f.k]} onChange={v=>setF(f.k,v)} type={f.type} placeholder={f.placeholder} />
            }
          </div>
        ))}
      </div>
      <SaveBar onSave={handleSave} saving={saving} saved={saved} label="Save Discharge Summary" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 15 ▸ INPATIENT — FLUID BALANCE / MAR
// ═══════════════════════════════════════════════════════════════
function FluidsMAR({ patient, doctorId }) {
  const [fluid, setFluid]=useState({type:'IV Fluid',fluid:'Normal Saline 0.9%',rate:'',duration:'',volume:'',additive:''});
  const [mar, setMar]    =useState({drug:'',dose:'',route:'IV',time:'',givenBy:'',notes:''});
  const [fluids, setFluids]=useState([]);
  const [marLog, setMarLog]=useState([]);
  const [savingF,setSavingF]=useState(false);
  const [savingM,setSavingM]=useState(false);

  const setFF=(k,v)=>setFluid(p=>({...p,[k]:v}));
  const setMF=(k,v)=>setMar(p=>({...p,[k]:v}));

  const saveFluid=async()=>{
    setSavingF(true);
    try{
      const ref=await addDoc(collection(db,'fluid_balance'),{
        patientId:patient.uid,doctorId,...fluid,recordedAt:serverTimestamp()
      });
      setFluids(p=>[{id:ref.id,...fluid,recordedAt:new Date()},...p]);
      setFluid({type:'IV Fluid',fluid:'Normal Saline 0.9%',rate:'',duration:'',volume:'',additive:''});
    }catch(e){console.error(e);}
    setSavingF(false);
  };

  const saveMAR=async()=>{
    setSavingM(true);
    try{
      const ref=await addDoc(collection(db,'mar'),{
        patientId:patient.uid,doctorId,...mar,administeredAt:serverTimestamp()
      });
      setMarLog(p=>[{id:ref.id,...mar,administeredAt:new Date()},...p]);
      setMar({drug:'',dose:'',route:'IV',time:'',givenBy:'',notes:''});
    }catch(e){console.error(e);}
    setSavingM(false);
  };

  return (
    <div style={{height:'100%',overflowY:'auto',padding:16}}>
      <SectionHeader icon="💧" title="Fluid Balance / MAR" sub="Inpatient fluid orders and medication administration record" />

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Fluid orders */}
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:DS.white,marginBottom:12,fontFamily:DS.fontHead}}>💧 Fluid Order</div>
          {[
            {k:'type',    label:'Type',   type:'select', options:['IV Fluid','Blood Product','TPN','Oral']},
            {k:'fluid',   label:'Fluid',  type:'select', options:['Normal Saline 0.9%','Dextrose 5%','Dextrose/Saline','Hartmann\'s','Ringer\'s Lactate','Whole Blood','Packed RBC','FFP','Albumin 5%']},
            {k:'volume',  label:'Volume (mL)', type:'number'},
            {k:'rate',    label:'Rate (mL/hr)', type:'number'},
            {k:'duration',label:'Duration', type:'text', placeholder:'e.g. 8h'},
            {k:'additive',label:'Additives', type:'text', placeholder:'e.g. KCl 20 mEq'},
          ].map(f=>(
            <div key={f.k} style={{marginBottom:8}}>
              <FieldLabel>{f.label}</FieldLabel>
              {f.type==='select'
                ? <Select value={fluid[f.k]} onChange={v=>setFF(f.k,v)} options={[{value:'',label:'— Select —'},...(f.options||[])]} />
                : <Input value={fluid[f.k]} onChange={v=>setFF(f.k,v)} type={f.type} placeholder={f.placeholder} />
              }
            </div>
          ))}
          <Btn onClick={saveFluid} disabled={savingF} style={{width:'100%',justifyContent:'center',marginTop:4}}>
            {savingF?'Saving…':'+ Add Fluid Order'}
          </Btn>
          {fluids.slice(0,5).map((f,i)=>(
            <div key={f.id||i} style={{marginTop:5,padding:'6px 8px',background:DS.navyMid,
              borderRadius:7,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
              <span style={{color:DS.teal,fontWeight:700}}>{f.fluid}</span> · {f.volume}mL @ {f.rate}mL/hr · {f.duration}
            </div>
          ))}
        </Card>

        {/* MAR */}
        <Card>
          <div style={{fontSize:13,fontWeight:800,color:DS.white,marginBottom:12,fontFamily:DS.fontHead}}>💉 MAR Entry</div>
          {[
            {k:'drug',    label:'Drug',   type:'text'},
            {k:'dose',    label:'Dose',   type:'text', placeholder:'e.g. 500mg'},
            {k:'route',   label:'Route',  type:'select', options:['IV','IM','SC','Oral','PR','SL','Topical']},
            {k:'time',    label:'Time',   type:'text', placeholder:'e.g. 08:00'},
            {k:'givenBy', label:'Given By', type:'text'},
            {k:'notes',   label:'Notes',  type:'text', placeholder:'Adverse reaction, hold, etc.'},
          ].map(f=>(
            <div key={f.k} style={{marginBottom:8}}>
              <FieldLabel>{f.label}</FieldLabel>
              {f.type==='select'
                ? <Select value={mar[f.k]} onChange={v=>setMF(f.k,v)} options={[{value:'',label:'— Select —'},...(f.options||[])]} />
                : <Input value={mar[f.k]} onChange={v=>setMF(f.k,v)} type={f.type} placeholder={f.placeholder} />
              }
            </div>
          ))}
          <Btn onClick={saveMAR} disabled={savingM} variant="success" style={{width:'100%',justifyContent:'center',marginTop:4}}>
            {savingM?'Saving…':'✓ Record Administration'}
          </Btn>
          {marLog.slice(0,5).map((m,i)=>(
            <div key={m.id||i} style={{marginTop:5,padding:'6px 8px',background:DS.navyMid,
              borderRadius:7,fontSize:11,color:DS.muted,fontFamily:DS.fontBody}}>
              <span style={{color:DS.green,fontWeight:700}}>{m.drug}</span> {m.dose} · {m.route} · {m.time} · {m.givenBy}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 16 ▸ SIMPLE SECTION PLACEHOLDERS
// ═══════════════════════════════════════════════════════════════
function SimpleSection({ icon, title, items=[], emptyMsg='No data recorded.' }) {
  return (
    <div style={{height:'100%',overflowY:'auto',padding:16}}>
      <SectionHeader icon={icon} title={title} />
      {items.length===0
        ? <div style={{color:DS.muted,fontSize:12,fontFamily:DS.fontBody,fontStyle:'italic'}}>{emptyMsg}</div>
        : items.map((item,i)=>(
          <Card key={i} style={{marginBottom:8}}>
            <div style={{color:DS.white,fontSize:12,fontFamily:DS.fontBody}}>{item}</div>
          </Card>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT ▸ ClinicalWorkspace
// ═══════════════════════════════════════════════════════════════
export default function ClinicalWorkspace({
  patient,
  doctorId,
  doctorName,
  appointments,
  onClose,
  mode: initialMode = 'outpatient',
}) {
  // Guard: if no patient, render nothing (prevents "not reached" errors)
  if (!patient) return null;

  const [section, setSection]     = useState('overview');
  const [mode, setMode]           = useState(initialMode);
  const [impressions, setImpressions] = useState([]);
  const [vitals, setVitals]       = useState([]);

  // Load patient vitals globally (used by Overview + CDS)
  useEffect(()=>{
    if(!patient?.uid) return;
    const unsub=onSnapshot(
      query(collection(db,'vitals'),where('patientId','==',patient.uid),orderBy('recordedAt','desc'),limit(50)),
      snap=>setVitals(snap.docs.map(d=>({id:d.id,...d.data()})))
    );
    return()=>unsub();
  },[patient.uid]);

  // Run CDS alerts from live vitals
  const alerts = useMemo(()=>{
    if(!CDS_ALERTS?.runAll) return [];
    const vmap=vitals.reduce((acc,v)=>{acc[v.type]=v.value;return acc;},{});
    return CDS_ALERTS.runAll(vmap)||[];
  },[vitals]);

  // Sidebar nav also routes to same sections as ribbon
  const handleNav = useCallback(id=>setSection(id),[]);

  // Inpatient sections not available in outpatient
  const isInpatient = mode==='inpatient';

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1e3352;border-radius:99px;}
        ::-webkit-scrollbar-thumb:hover{background:#2d4a70;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.65;}}
        select option{background:#0d1f38;color:#f0f6ff;}
      `}</style>

      <div style={{
        // ── CRITICAL: position fixed so the portal covers the whole screen ──
        position:'fixed', top:0, left:0, right:0, bottom:0,
        zIndex:9999,
        display:'flex',flexDirection:'column',
        height:'100vh',width:'100vw',
        background:DS.navy,fontFamily:DS.fontBody,
        overflow:'hidden',
        fontSize:'clamp(11px,1.2vw,14px)',
      }}>
        {/* ── Patient Banner ───────────────────────────────── */}
        <PatientBanner
          patient={patient} mode={mode} alerts={alerts}
          onModeToggle={()=>setMode(m=>m==='inpatient'?'outpatient':'inpatient')}
          onClose={onClose}
        />

        {/* ── Quick Action Ribbon ──────────────────────────── */}
        <QuickActionRibbon active={section} onAction={setSection} mode={mode} />

        {/* ── 3-Panel Body ────────────────────────────────── */}
        <div style={{flex:1,display:'flex',overflow:'hidden'}}>

          {/* Left Sidebar */}
          <LeftSidebar
            patient={patient} appointments={appointments}
            onNav={handleNav} active={section}
          />

          {/* Main workspace */}
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',position:'relative'}}>
            <div style={{flex:1,overflow:'hidden'}}>
              {section==='overview'      && <OverviewPanel patient={patient} appointments={appointments} vitals={vitals} />}
{section==='history' && (
  <HistoryExaminationEngine
    patient={patient}
    doctorId={doctorId}
    doctorName={doctorName}
    onSave={()=>{}}
  />
)}              {section==='examination'   && <ExaminationEngine patient={patient} impressions={impressions} onSave={()=>{}} />}
              {section==='notes' && (
  <EnhancedClinicalNotes
    patient={patient}
    doctorId={doctorId}
    doctorName={doctorName}
    mode={mode}                       // 'inpatient' or 'outpatient' – works automatically
    onImpressions={setImpressions}
  />
)}
              {section==='orders'        && <OrdersPanel patient={patient} impressions={impressions} doctorId={doctorId} doctorName={doctorName} />}
              {section==='prescriptions' && <PrescriptionsPanel patient={patient} appointments={appointments} doctorId={doctorId} doctorName={doctorName} />}
              {section==='monitoring'    && <MonitoringPanel patient={patient} appointments={appointments} />}
              {section==='timeline'      && <ProgressTimeline patient={patient} appointments={appointments} />}
              {/* Sidebar nav aliases */}
              {section==='encounters'    && <ProgressTimeline patient={patient} appointments={appointments} />}
              {section==='medications'   && <PrescriptionsPanel patient={patient} appointments={appointments} doctorId={doctorId} doctorName={doctorName} />}
              {section==='labs'          && <OrdersPanel patient={patient} impressions={impressions} doctorId={doctorId} doctorName={doctorName} />}
              {section==='allergies'     && <SimpleSection icon="⚠️" title="Allergies" items={patient.allergies||[]} emptyMsg="No allergies recorded." />}
              {section==='vaccinations'  && <SimpleSection icon="💉" title="Vaccinations" items={patient.vaccinations||[]} emptyMsg="No vaccination records." />}
              {section==='documents'     && <SimpleSection icon="📁" title="Documents" emptyMsg="No documents uploaded." />}
              {section==='family_hx'     && <SimpleSection icon="👨‍👩‍👧" title="Family History" items={patient.familyHistory||[]} emptyMsg="No family history recorded." />}
              {section==='social_hx'     && <SimpleSection icon="🏠" title="Social History" items={patient.socialHistory||[]} emptyMsg="No social history recorded." />}
              {/* Inpatient modules */}
              {section==='admission'  && isInpatient && <AdmissionPanel patient={patient} doctorId={doctorId} doctorName={doctorName} />}
              {section==='discharge'  && isInpatient && <DischargePanel patient={patient} doctorId={doctorId} doctorName={doctorName} />}
              {section==='fluids'     && isInpatient && <FluidsMAR patient={patient} doctorId={doctorId} />}
              {/* Inpatient sections in outpatient mode — show toggle prompt */}
              {['admission','discharge','fluids'].includes(section) && !isInpatient && (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  height:'100%',gap:12,color:DS.muted,fontFamily:DS.fontBody}}>
                  <span style={{fontSize:36}}>🏥</span>
                  <p style={{fontSize:13}}>This section is only available in <strong style={{color:DS.teal}}>Inpatient</strong> mode.</p>
                  <Btn onClick={()=>setMode('inpatient')}>Switch to Inpatient</Btn>
                </div>
              )}
            </div>
          </div>

          {/* Right Intelligence Panel */}
          <RightIntelligence
            impressions={impressions} section={section}
            patient={patient} alerts={alerts}
          />
        </div>
      </div>
    </>
  );
}