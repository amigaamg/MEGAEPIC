'use client';
import React from 'react';
import { useUIStore } from '../../state/uiStore';
import { useTheme } from '../themes/ThemeProvider';
import { THEMES } from '../themes/themes.config';

const PHASES = [
  { id:"biodata", label:"Biodata", icon:"👤" },
  { id:"complaints", label:"Chief Complaints", icon:"📋" },
  { id:"hpi", label:"Presenting Illness", icon:"📝" },
  { id:"pmh", label:"Past Medical History", icon:"🏥" },
  { id:"birth", label:"Birth History", icon:"👶" },
  { id:"development", label:"Growth & Development", icon:"🌱" },
  { id:"immunization", label:"Immunization", icon:"💉" },
  { id:"nutrition", label:"Nutrition", icon:"🍎" },
  { id:"family", label:"Family & Social", icon:"👨‍👩‍👧" },
  { id:"ros", label:"Review of Systems", icon:"🔍" },
  { id:"exam_general", label:"General Examination", icon:"👁" },
  { id:"exam_systemic", label:"Systemic Examination", icon:"🫀" },
  { id:"history_summary", label:"History Summary", icon:"📄" },
  { id:"impression", label:"Impression & DDx", icon:"🧠" },
  { id:"management", label:"Investigations & Mgmt", icon:"📊" },
  { id:"note", label:"Clinical Note", icon:"📋" },
];

export { PHASES };

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const sidebarOpen = useUIStore(s => s.sidebarOpen);
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen);
  const phaseIdx = useUIStore(s => s.phaseIdx);
  const setPhaseIdx = useUIStore(s => s.setPhaseIdx);
  const donePhases = useUIStore(s => s.donePhases);
  const themeId = useUIStore(s => s.themeId);
  const setThemeId = useUIStore(s => s.setThemeId);
  const isMobile = useUIStore(s => s.isMobile);

  return (
    <>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:998}} />
      )}
      <div style={{
        width:216, flexShrink:0, background:theme.colors.sidebar,
        borderRight:`1px solid ${theme.colors.sidebarBorder}`,
        display:"flex", flexDirection:"column", overflow:"hidden",
        ...(isMobile ? {
          position:"fixed" as const, top:0, left:0, bottom:0, zIndex:999,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition:"transform 0.25s ease",
          boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.15)" : "none",
        } : {}),
      }}>
        <div style={{padding:"18px 16px", borderBottom:`1px solid ${theme.colors.sidebarBorder}`}}>
          <div style={{fontSize:13, fontWeight:800, color:theme.colors.accent, letterSpacing:"-0.02em"}}>AMEXAN</div>
          <div style={{fontSize:10, color:theme.colors.textMuted, marginTop:1, textTransform:"uppercase", letterSpacing:"0.08em"}}>Clinical History</div>
        </div>
        <div style={{flex:1, overflow:"auto", padding:"8px 0"}}>
          {PHASES.map((ph, i) => {
            const active = i === phaseIdx;
            const complete = donePhases.includes(ph.id);
            return (
              <div key={ph.id} onClick={() => { if (i <= phaseIdx || complete) { setPhaseIdx(i); if (isMobile) setSidebarOpen(false); } }} style={{
                padding:"9px 14px 9px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:9,
                background:active ? theme.colors.accentBg : "transparent",
                borderLeft:`3px solid ${active ? theme.colors.accent : complete ? theme.colors.accent+"60" : "transparent"}`,
                transition:"all 0.1s", opacity: i > phaseIdx && !complete ? 0.5 : 1,
              }}>
                <span style={{
                  width:18, height:18, borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700,
                  background:complete ? theme.colors.accent : "transparent",
                  border:`1.5px solid ${active ? theme.colors.accent : complete ? theme.colors.accent : theme.colors.border}`,
                  color:complete ? "white" : "transparent",
                }}>{complete ? "✓" : ""}</span>
                <span style={{fontSize:11, fontWeight:active ? 700 : 400, color:active ? theme.colors.accentText : complete ? theme.colors.text : theme.colors.textMuted, lineHeight:1.3}}>{ph.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 14px", borderTop:`1px solid ${theme.colors.sidebarBorder}`}}>
          <div style={{fontSize:10, fontWeight:600, color:theme.colors.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8}}>Theme</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
            {Object.values(THEMES).slice(0,6).map(th => (
              <button key={th.id} onClick={() => setThemeId(th.id)} style={{
                padding:"5px 0", borderRadius:6, fontSize:11, cursor:"pointer", fontWeight:600,
                border:`1.5px solid ${themeId === th.id ? theme.colors.accent : theme.colors.border}`,
                background:themeId === th.id ? theme.colors.accentBg : "transparent",
                color:themeId === th.id ? theme.colors.accentText : theme.colors.textSub,
                fontFamily:theme.typography.font,
              }}>{th.name}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
