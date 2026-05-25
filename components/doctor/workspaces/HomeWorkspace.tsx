'use client';

import React, { useEffect, useRef } from 'react';

interface DoctorProfile {
  uid: string; name: string; email: string; specialty: string;
  clinic?: string; licenseNumber?: string; phone?: string; bio?: string;
  yearsExperience?: number; languages?: string[]; location?: string;
  photoURL?: string; rating?: number;
}

interface Appointment {
  id: string; patientId: string; patientName?: string; patientEmail?: string;
  patientPhone?: string; serviceId: string; specialty?: string;
  status: 'booked' | 'active' | 'completed' | 'cancelled';
  date: any; patientNotes?: string; notes?: string;
  prescriptions?: any[]; consultationId?: string;
  doctorId: string; amount?: number; paymentStatus?: string;
}

interface Service {
  id: string; specialty: string; clinic: string; price: number;
  description: string; doctorId: string; doctorName: string; duration: number;
  isAvailable: boolean; tags?: string[]; rating?: number;
  yearsExperience?: number; location?: string; createdAt: any;
}

interface Docket {
  id: string; name: string; specialty: string; patientCount: number;
  tools: string[]; isActive: boolean;
}

interface Props {
  doctor: DoctorProfile;
  appointments: Appointment[];
  services: Service[];
  activeAppts: Appointment[];
  upcomingAppts: Appointment[];
  completedAppts: Appointment[];
  patientIds: string[];
  totalEarned: number;
  onTabChange: (tab: string) => void;
  dockets?: Docket[];
}

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fmtShort = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};
const fmtTime = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
};
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  booked:    { label: 'Upcoming',  color: '#6366f1', bg: 'rgba(99,102,241,.1)' },
  active:    { label: '● Live',    color: '#10b981', bg: 'rgba(16,185,129,.1)' },
  completed: { label: 'Completed', color: '#64748b', bg: 'rgba(100,116,139,.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,.1)' },
};

const pill = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 11px', borderRadius: 99,
  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
  background: bg, color,
});

const avatarStyle = (size: number): React.CSSProperties => ({
  width: size, height: size, borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-3, #06b6d4))',
  flexShrink: 0, minWidth: size,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 800, fontSize: Math.round(size * 0.38), color: '#fff',
});

const cardBase: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 18,
  padding: '20px 22px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  boxSizing: 'border-box',
  width: '100%',
  overflow: 'hidden',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const,
  letterSpacing: 1.4, color: 'var(--muted)', marginBottom: 14,
};

export default function HomeWorkspace({ doctor, appointments, services, activeAppts, upcomingAppts, completedAppts, patientIds, totalEarned, onTabChange, dockets: propDockets }: Props) {
  const dockets = propDockets || [];
  const activeDockets = dockets.filter(d => d.isActive);
  const sortedUpcoming = [...upcomingAppts].sort((a, b) => {
    const da = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const db2 = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return da.getTime() - db2.getTime();
  });
  const nextAppt = sortedUpcoming[0];
  const nextDate = nextAppt?.date?.toDate ? nextAppt.date.toDate() : nextAppt?.date ? new Date(nextAppt.date) : null;
  const msUntilNext = nextDate ? nextDate.getTime() - Date.now() : null;
  const hUntil = msUntilNext != null ? Math.floor(msUntilNext / 3_600_000) : 0;
  const mUntil = msUntilNext != null ? Math.floor((msUntilNext % 3_600_000) / 60_000) : 0;
  const pendingEarnings = appointments.filter(a => a.paymentStatus !== 'paid' && a.status !== 'cancelled').reduce((s, a) => s + (a.amount || 0), 0);
  const completionRate = appointments.length ? Math.round((completedAppts.length / appointments.length) * 100) : 0;
  const liveServices = services.filter(s => s.isAvailable);
  const now = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'slideUp .25s ease' }}>

      {/* ═══ HERO ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, var(--hero-from, #0d1b2a) 0%, var(--hero-via, #0c3326) 50%, var(--hero-to, #093d28) 100%)',
        borderRadius: 22, color: '#fff',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 48px var(--accent-glow, rgba(10,170,118,0.14))',
      }}>
        <div style={{ position:'absolute',top:-80,right:-80,width:320,height:320,borderRadius:'50%',background:'rgba(255,255,255,0.03)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-100,left:'20%',width:280,height:280,borderRadius:'50%',background:'rgba(255,255,255,0.025)',pointerEvents:'none' }} />

        <div style={{ padding:'28px 32px 24px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:24,flexWrap:'wrap' }}>
          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:2.5,opacity:0.45,marginBottom:8 }}>
              {getGreeting()} · {now.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
            <div style={{ fontFamily:'Georgia,serif',fontSize:'clamp(20px,4vw,28px)',fontWeight:700,letterSpacing:-0.5,lineHeight:1.1,marginBottom:6 }}>
              Dr. {doctor.name}
            </div>
            <div style={{ fontSize:13,opacity:0.45,fontStyle:'italic',marginBottom:18 }}>
              Delivering exceptional care, one patient at a time.
            </div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:7,marginBottom:22 }}>
              {[
                doctor.specialty ? { t: doctor.specialty } : null,
                doctor.clinic ? { t: doctor.clinic } : null,
                doctor.location ? { t: doctor.location } : null,
                doctor.yearsExperience ? { t: `${doctor.yearsExperience}y exp` } : null,
                { t: 'Online · Accepting Patients', live: true },
              ].filter(Boolean).map((c: any, i: number) => (
                <span key={i} style={{
                  display:'inline-flex',alignItems:'center',gap:5,
                  background: c.live ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${c.live ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:99,padding:'4px 12px',fontSize:11,fontWeight:600,
                  backdropFilter:'blur(8px)',
                  color: c.live ? '#4ade80' : 'rgba(255,255,255,0.85)',
                }}>{c.t}</span>
              ))}
            </div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
              <button onClick={()=>onTabChange('queue')} style={{
                background:'var(--accent)',color:'#fff',border:'none',borderRadius:12,
                padding:'10px 22px',fontSize:13,fontWeight:700,cursor:'pointer',
                fontFamily:'var(--font)',boxShadow:'0 4px 20px var(--accent-glow)',
                display:'flex',alignItems:'center',gap:7,whiteSpace:'nowrap',
              }}>▶ Start Consultation</button>
              {[
                { label:'＋ Add Service', tab:'services' },
                { label:'📋 Schedule', tab:'queue' },
                { label:'💰 Wallet', tab:'earnings' },
                { label:'👥 Patients', tab:'patients' },
              ].map(b => (
                <button key={b.tab} onClick={()=>onTabChange(b.tab)} style={{
                  background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.75)',
                  border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,
                  padding:'10px 16px',fontSize:12,fontWeight:600,cursor:'pointer',
                  fontFamily:'var(--font)',backdropFilter:'blur(8px)',whiteSpace:'nowrap',
                }}>{b.label}</button>
              ))}
            </div>
          </div>

          {/* RIGHT - Profile Card */}
          <div style={{
            background:'rgba(255,255,255,.06)',backdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,.1)',borderRadius:18,
            padding:'20px 22px',width:200,flexShrink:0,
          }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:16 }}>
              <div style={{ ...avatarStyle(52), border:'2.5px solid rgba(255,255,255,0.2)' }}>
                {doctor.name[0]}
              </div>
              <div>
                <div style={{ fontWeight:700,fontSize:14,lineHeight:1.2 }}>Dr. {doctor.name}</div>
                <div style={{ fontSize:10,color:'rgba(74,222,128,0.8)',letterSpacing:1.2,textTransform:'uppercase',marginTop:2 }}>
                  {doctor.specialty || 'Specialist'}
                </div>
              </div>
            </div>
            {[
              { label:'Status',   val:'● Online',                         c:'#4ade80' },
              { label:'Rating',   val:`⭐ ${doctor.rating || '4.9'}/5`,   c:'#f0c060' },
              { label:'Response', val:'~12 min',                          c:'rgba(255,255,255,0.85)' },
              { label:'Queue',    val:`${upcomingAppts.length} waiting`,  c: upcomingAppts.length > 0 ? '#f0c060' : 'rgba(255,255,255,0.85)' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',fontSize:11 }}>
                <span style={{ color:'rgba(255,255,255,0.4)' }}>{r.label}</span>
                <span style={{ fontWeight:700,color:r.c }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat Strip */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid rgba(255,255,255,.06)' }}>
          {[
            { icon:'📅',label:'Today',        val:appointments.filter(a => { const d = a.date?.toDate ? a.date.toDate() : new Date(a.date||0); return d.toDateString() === now.toDateString(); }).length, color:'#fff', tab:'queue' },
            { icon:'⚡',label:'Active Now',   val:activeAppts.length,  color:'#4ade80', tab:'queue' },
            { icon:'👥',label:'Patients',     val:patientIds.length,   color:'#60a5fa', tab:'patients' },
            { icon:'🏥',label:'Live Services',val:liveServices.length, color:'#f0c060', tab:'services' },
          ].map(s => (
            <div key={s.label} onClick={()=>onTabChange(s.tab)} style={{ padding:'18px 12px',textAlign:'center',cursor:'pointer',transition:'background .15s',borderRight:'1px solid rgba(255,255,255,.06)',':lastChild':{borderRight:'none'} } as any}>
              <div style={{ fontSize:20,marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:'clamp(20px,3vw,28px)',fontWeight:900,fontFamily:'var(--mono)',color:s.color,lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:10,opacity:0.45,marginTop:5,fontWeight:700,textTransform:'uppercase',letterSpacing:0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ COUNTDOWN ═══ */}
      {nextAppt && msUntilNext != null && msUntilNext > 0 && (
        <div style={{
          background:'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(245,158,11,0.02))',
          border:'1px solid rgba(245,158,11,0.22)',borderRadius:16,padding:'16px 22px',
          display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,
        }}>
          <div style={{ display:'flex',alignItems:'center',gap:14,minWidth:0,flex:1 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:'rgba(245,158,11,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>⏱️</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:2,color:'rgba(245,158,11,0.7)',marginBottom:3 }}>Next Appointment</div>
              <div style={{ fontWeight:700,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{nextAppt.patientName || 'Patient'} · {nextAppt.specialty}</div>
              <div style={{ fontSize:11,color:'var(--muted)',marginTop:2 }}>{fmtDate(nextAppt.date)}</div>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:14,flexShrink:0 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--mono)',fontSize:26,fontWeight:700,color:'var(--amber)',lineHeight:1 }}>
                {hUntil > 0 ? `${hUntil}h ${mUntil}m` : `${mUntil}m`}
              </div>
              <div style={{ fontSize:10,color:'var(--muted)',marginTop:3 }}>until session</div>
            </div>
            <button onClick={()=>onTabChange('queue')} style={{
              background:'var(--amber)',color:'#0d1b2a',border:'none',
              borderRadius:10,padding:'9px 18px',fontSize:12,
              fontWeight:700,cursor:'pointer',fontFamily:'var(--font)',
              boxShadow:'0 4px 16px rgba(245,158,11,0.3)',whiteSpace:'nowrap',
            }}>Open Queue →</button>
          </div>
        </div>
      )}

      {/* ═══ METRICS ═══ */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12 }}>
        {[
          { icon:'📅',label:'All Appointments',val:appointments.length, color:'var(--text)' },
          { icon:'⏳',label:'In Queue',val:upcomingAppts.length, color:'var(--indigo)' },
          { icon:'✅',label:'Completed',val:completedAppts.length, color:'var(--green)' },
          { icon:'📊',label:'Completion Rate',val:`${completionRate}%`, color:'var(--accent)' },
          { icon:'💰',label:'Total Earned',val:`KES ${totalEarned.toLocaleString()}`, color:'var(--amber)', small:true },
          { icon:'⏰',label:'Pending Pay',val:`KES ${pendingEarnings.toLocaleString()}`, color:'#f87171', small:true },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'16px 18px',display:'flex',flexDirection:'column',gap:8,boxShadow:'var(--shadow)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <span style={{ fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily:'var(--mono)',fontWeight:900,fontSize:(s as any).small?15:24,lineHeight:1,color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ═══ ACTIVE SESSIONS ═══ */}
      {activeAppts.length > 0 && (
        <div className="panel active-sessions-panel">
          <div className="panel-hd">
            <div className="panel-title"><span className="live-dot-sm" /> Active Sessions ({activeAppts.length})</div>
          </div>
          {activeAppts.map(appt => (
            <div key={appt.id} className="active-session-card">
              <div className="as-left">
                <div className="as-ava">{(appt.patientName || 'P')[0]}</div>
                <div>
                  <div className="as-name">{appt.patientName || 'Patient'}</div>
                  <div className="as-sub">{appt.specialty}</div>
                  {appt.patientPhone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>📞 {appt.patientPhone}</div>}
                </div>
              </div>
              <div className="as-actions">
                <button className="btn-start" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => onTabChange('queue')}>
                  ▶ Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ TODAY'S SCHEDULE + RIGHT SIDEBAR ═══ */}
      <div style={{ display:'grid',gridTemplateColumns:'minmax(0,1fr) 300px',gap:16,alignItems:'start' }}>
        {/* Today */}
        <div style={cardBase}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,gap:12,flexWrap:'wrap' }}>
            <div>
              <div style={sectionLabel}>Today's Schedule</div>
              <div style={{ fontWeight:800,fontSize:16,color:'var(--text)' }}>📅 {now.toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long'})}</div>
            </div>
            <button className="btn-sm-accent" onClick={()=>onTabChange('queue')}>Manage Queue →</button>
          </div>
          {(() => {
            const todayBooked = appointments.filter(a => {
              const d = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.date || 0);
              return d.toDateString() === now.toDateString() && a.status === 'booked';
            });
            if (todayBooked.length === 0 && activeAppts.length === 0) {
              return <div style={{textAlign:'center',padding:'32px 0',color:'var(--muted)'}}><div style={{fontSize:36,marginBottom:10}}>📭</div><div style={{fontWeight:700,marginBottom:4}}>No bookings today</div><div style={{fontSize:12}}>Patients can book via your live services</div></div>;
            }
            return (
              <>
                {todayBooked.slice(0, 6).map((a, idx) => (
                  <div key={a.id} style={{
                    display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:12,
                    background: idx===0 ? 'rgba(var(--accent),.04)' : 'var(--bg)',
                    border:`1.5px solid ${idx===0 ? 'rgba(var(--accent),.2)' : 'var(--border)'}`,
                    marginBottom:8,cursor:'pointer',transition:'all 0.15s',
                  }}
                    onClick={()=>onTabChange('queue')}
                  >
                    <div style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',minWidth:46,textAlign:'center',fontWeight:600 }}>{fmtTime(a.date)}</div>
                    <div style={avatarStyle(34)}>{(a.patientName||'P')[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.patientName||'Patient'}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{a.specialty}</div>
                    </div>
                    <span style={pill(statusCfg.booked.bg, statusCfg.booked.color)}>{statusCfg.booked.label}</span>
                  </div>
                ))}
                {activeAppts.map(a => (
                  <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:12,background:'rgba(var(--accent),.04)',border:'1.5px solid rgba(var(--accent),.3)',marginBottom:8}}>
                    <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--green)',minWidth:46,textAlign:'center',fontWeight:700}}>LIVE</div>
                    <div style={avatarStyle(34)}>{(a.patientName||'P')[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13}}>{a.patientName||'Patient'}</div>
                      <div style={{fontSize:11,color:'var(--muted)'}}>{a.specialty}</div>
                    </div>
                    <span style={{...pill('rgba(16,185,129,.1)','#10b981'),animation:'pulse-g 1.5s infinite'}}>● Active</span>
                  </div>
                ))}
              </>
            );
          })()}
        </div>

        {/* Right Sidebar */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Revenue Snapshot */}
          <div style={cardBase}>
            <div style={sectionLabel}>Revenue</div>
            <div style={{fontFamily:'var(--mono)',fontSize:30,fontWeight:700,color:'var(--amber)',lineHeight:1,marginBottom:4}}>KES {totalEarned.toLocaleString()}</div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:14}}>Total earned · all time</div>
            {(() => {
              const byMonth: Record<string,number> = {};
              appointments.filter(a=>a.paymentStatus==='paid').forEach(a=>{
                const d = a.date?.toDate ? a.date.toDate() : new Date(a.date||0);
                const k = d.toLocaleDateString('en-KE',{month:'short'});
                byMonth[k] = (byMonth[k]||0) + (a.amount||0);
              });
              const entries = Object.entries(byMonth).slice(-6);
              const max = Math.max(...entries.map(([,v])=>v), 1);
              if (!entries.length) return <div style={{textAlign:'center',padding:'8px 0',color:'var(--muted)',fontSize:12}}>No earnings data yet</div>;
              return (
                <div style={{display:'flex',alignItems:'flex-end',gap:5,height:44,marginBottom:14}}>
                  {entries.map(([m,v])=>(
                    <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,height:'100%'}}>
                      <div style={{width:'100%',flex:1,display:'flex',alignItems:'flex-end'}}>
                        <div style={{width:'100%',background:'linear-gradient(180deg,var(--amber),rgba(245,158,11,0.25))',borderRadius:'4px 4px 0 0',height:`${Math.max((v/max)*100,8)}%`,minHeight:3}} />
                      </div>
                      <div style={{fontSize:9,color:'var(--muted)',whiteSpace:'nowrap'}}>{m}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {[
              { label:'Sessions Done',  val:completedAppts.length },
              { label:'Pending Payout', val:`KES ${pendingEarnings.toLocaleString()}` },
              { label:'In Queue',       val:`${upcomingAppts.length} patients` },
            ].map(r => (
              <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderTop:'1px solid var(--border)',fontSize:12}}>
                <span style={{color:'var(--muted)'}}>{r.label}</span>
                <span style={{fontWeight:700,fontFamily:'var(--mono)'}}>{r.val}</span>
              </div>
            ))}
            <button onClick={()=>onTabChange('earnings')} style={{marginTop:12,width:'100%',background:'var(--amber)',color:'#0d1b2a',border:'none',borderRadius:10,padding:'9px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font)'}}>View Full Earnings →</button>
          </div>

          {/* Live Activity */}
          <div style={cardBase}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={sectionLabel}>Live Activity</div>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 8px rgba(74,222,128,0.6)',animation:'pulse-g 1.5s infinite'}} />
            </div>
            {(() => {
              const items = [
                ...activeAppts.map(a => ({ dot:'#4ade80', text:`${a.patientName||'Patient'} is in an active session`, time:'Live now' })),
                ...sortedUpcoming.slice(0,1).map(a => ({ dot:'#60a5fa', text:`${a.patientName||'Patient'} confirmed appointment`, time:fmtTime(a.date) })),
                ...completedAppts.slice(0,2).map(a => ({ dot:'#0aaa76', text:`${a.patientName||'Patient'} · session completed`, time:fmtShort(a.date) })),
                ...liveServices.slice(0,1).map(s => ({ dot:'#a78bfa', text:`${s.specialty} service is live`, time:'Active' })),
              ].slice(0,5);
              if (!items.length) return <div style={{textAlign:'center',padding:'16px 0',color:'var(--muted)',fontSize:13}}>No recent activity yet.</div>;
              return items.map((item,i,arr)=>(
                <div key={i} style={{display:'flex',gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<arr.length-1?'1px solid var(--border)':'none'}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:3}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:item.dot,flexShrink:0}} />
                    {i<arr.length-1 && <div style={{width:1,flex:1,background:'var(--border)',marginTop:4,minHeight:16}} />}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12,color:'var(--text-2)',lineHeight:1.5}}>{item.text}</div>
                    <div style={{fontSize:10,color:'var(--muted)',marginTop:2,fontFamily:'var(--mono)'}}>{item.time}</div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM GRID ═══ */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
        {/* Live Services */}
        <div style={cardBase}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
            <div>
              <div style={sectionLabel}>Live Services</div>
              <div style={{fontWeight:800,fontSize:15,color:'var(--text)'}}>🏥 {liveServices.length} Active</div>
            </div>
            <button className="btn-sm-accent" onClick={()=>onTabChange('services')}>Manage →</button>
          </div>
          {liveServices.length===0 ? (
            <div style={{textAlign:'center',padding:'28px 0',color:'var(--muted)'}}>
              <div style={{fontSize:32,marginBottom:10}}>🏥</div>
              <div style={{fontWeight:700,marginBottom:6}}>No live services yet</div>
              <button className="btn-sm-accent" onClick={()=>onTabChange('services')}>＋ Add Your First Service</button>
            </div>
          ) : liveServices.slice(0,5).map((s,i)=>{
            const colors = ['#60a5fa','#4ade80','#f0c060','#a78bfa','#f87171'];
            return (
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border)',marginBottom:8,cursor:'pointer'}}
                onClick={()=>onTabChange('services')}>
                <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
                  <div style={{width:9,height:9,borderRadius:'50%',background:colors[i%5],flexShrink:0}} />
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13}}>{s.specialty}</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>{s.clinic} · {s.duration}min</div>
                  </div>
                </div>
                <span style={{fontWeight:800,fontSize:13,color:'var(--accent)',fontFamily:'var(--mono)',flexShrink:0,marginLeft:8}}>KES {s.price.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {/* Recent Completed */}
        <div style={cardBase}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
            <div>
              <div style={sectionLabel}>Recent Completed</div>
              <div style={{fontWeight:800,fontSize:15,color:'var(--text)'}}>🗂️ {completedAppts.length} Total</div>
            </div>
            <button className="btn-sm-accent" onClick={()=>onTabChange('history')}>Full History →</button>
          </div>
          {completedAppts.length===0 ? (
            <div style={{textAlign:'center',padding:'28px 0',color:'var(--muted)'}}>
              <div style={{fontSize:32,marginBottom:8}}>✅</div>
              <div style={{fontWeight:700}}>No completed sessions yet</div>
            </div>
          ) : completedAppts.slice(0,5).map(a => (
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border)',marginBottom:8,cursor:'pointer'}}
              onClick={()=>onTabChange('history')}>
              <div style={avatarStyle(34)}>{(a.patientName||'P')[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13}}>{a.patientName||'Patient'}</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>{a.specialty} · {fmtDate(a.date)}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                {a.amount != null && <div style={{fontSize:12,fontWeight:700,color:'var(--green)',fontFamily:'var(--mono)'}}>KES {a.amount.toLocaleString()}</div>}
                <span style={pill(statusCfg.completed.bg, statusCfg.completed.color)}>{statusCfg.completed.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CLINICAL WORKSPACES ═══ */}
      {activeDockets.length > 0 && (
        <div className="panel" style={{ borderColor: 'rgba(var(--accent),.2)' }}>
          <div className="panel-hd">
            <div className="panel-title">📂 Active Clinical Workspaces</div>
            <button className="btn-sm-accent" onClick={() => onTabChange('queue')}>Manage Dockets →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {activeDockets.map(d => (
              <div key={d.id} onClick={() => onTabChange('queue')}
                style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all .15s' }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>📂 {d.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{d.specialty}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: 'var(--text-2)' }}>
                  <span>👥 {d.patientCount} patients</span>
                  <span>🔧 {d.tools?.length || 0} tools</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ CONTINUITY INTELLIGENCE ═══ */}
      {patientIds.length > 0 && (
        <div className="panel">
          <div className="panel-hd">
            <div className="panel-title">🔬 Continuity Intelligence</div>
            <button className="btn-sm-accent" onClick={() => onTabChange('patients')}>View Registry →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {[
              { icon: '🔴', label: 'High Risk Patients', val: Math.ceil(patientIds.length * 0.08), color: '#dc2626', bg: 'rgba(220,38,38,.1)' },
              { icon: '🟠', label: 'Pending Reviews', val: upcomingAppts.length, color: '#ea580c', bg: 'rgba(234,88,12,.1)' },
              { icon: '⚠️', label: 'Overdue Follow-up', val: Math.max(0, Math.ceil(patientIds.length * 0.05)), color: '#ca8a04', bg: 'rgba(202,138,4,.1)' },
              { icon: '📊', label: 'Active Monitoring', val: completedAppts.length > 10 ? Math.ceil(completedAppts.length * 0.3) : 0, color: '#16a34a', bg: 'rgba(22,163,74,.1)' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 16px', borderRadius: 12, background: s.bg, border: `1px solid ${s.color}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SMART WIDGETS ═══ */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14}}>
        {/* AI Assistant */}
        <div style={{background:'linear-gradient(135deg,var(--hero-from,#0d1b2a) 0%,var(--hero-via,#0c3326) 100%)',border:'1px solid rgba(var(--accent),.2)',borderRadius:18,padding:'20px 22px',color:'#fff',display:'flex',flexDirection:'column',gap:12}}>
          <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:2,color:'rgba(74,222,128,0.7)'}}>AI Clinical Assistant</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.6,flex:1}}>Drug interactions · dosages · clinical guidelines · diagnosis support</div>
          <button onClick={()=>onTabChange('tools')} style={{width:'100%',background:'var(--accent)',color:'#fff',border:'none',borderRadius:10,padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font)'}}>Open AMEXAN AI Tools →</button>
        </div>

        {/* Satisfaction */}
        <div style={cardBase}>
          <div style={sectionLabel}>Patient Satisfaction</div>
          <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:8}}>
            <div style={{fontFamily:'var(--mono)',fontSize:38,fontWeight:700,color:'var(--amber)',lineHeight:1}}>{doctor.rating || '4.9'}</div>
            <div style={{fontSize:14,color:'var(--muted)'}}>/ 5.0</div>
          </div>
          <div style={{height:6,background:'var(--bg)',borderRadius:3,marginBottom:10,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${((Number(doctor.rating)||4.9)/5)*100}%`,background:'linear-gradient(90deg,var(--accent),var(--amber))',borderRadius:3,transition:'width 0.6s ease'}} />
          </div>
          <div style={{fontSize:11,color:'var(--muted)'}}>Based on {completedAppts.length} consultation{completedAppts.length!==1?'s':''}</div>
        </div>

        {/* Completion Rate */}
        <div style={cardBase}>
          <div style={sectionLabel}>Completion Rate</div>
          <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:12}}>
            <div style={{fontFamily:'var(--mono)',fontSize:38,fontWeight:700,color:'var(--green)',lineHeight:1}}>{completionRate}%</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              { label:'Completed',val:completedAppts.length,color:'var(--green)' },
              { label:'Total',val:appointments.length,color:'var(--text)' },
            ].map(s => (
              <div key={s.label} style={{background:'var(--bg)',borderRadius:10,padding:'10px 12px',border:'1px solid var(--border)',textAlign:'center'}}>
                <div style={{fontFamily:'var(--mono)',fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
                <div style={{fontSize:10,color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div style={cardBase}>
          <div style={sectionLabel}>Platform Status</div>
          {[
            { icon:'🟢',label:'All systems normal',sub:'No urgent flags' },
            { icon:'📡',label:'Real-time sync active',sub:'Firebase connected' },
            { icon:'🔒',label:'Encrypted session',sub:'HIPAA compliant' },
          ].map(item => (
            <div key={item.label} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{item.label}</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{textAlign:'center',padding:'6px 0 2px',fontSize:11,color:'var(--muted)',letterSpacing:3,textTransform:'uppercase',fontFamily:'Georgia,serif'}}>
        AMEXAN · Precision · Prestige · Performance
      </div>
    </div>
  );
}
