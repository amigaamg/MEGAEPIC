'use client';

import React, { useState } from 'react';

interface Appointment {
  id: string; patientId: string; patientName?: string;
  specialty?: string; status: string; date: any;
  amount?: number; paymentStatus?: string;
  doctorId: string;
}

interface Props { appointments: Appointment[]; }

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' });
};

export default function EarningsWorkspace({ appointments }: Props) {
  const [period, setPeriod] = useState<'week'|'month'|'year'>('month');
  const paid = appointments.filter(a => a.paymentStatus === 'paid');
  const total = paid.reduce((s,a) => s + (a.amount||0), 0);
  const pending = appointments.filter(a => a.paymentStatus !== 'paid' && a.status !== 'cancelled').reduce((s,a) => s + (a.amount||0), 0);
  const now = new Date();
  const thisMonth = paid.filter(a => {
    const d = a.date?.toDate ? a.date.toDate() : new Date(a.date||0);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce((s,a) => s + (a.amount||0), 0);
  const avgSession = paid.length ? Math.round(total / paid.length) : 0;

  const byMonth: Record<string,number> = {};
  paid.forEach(a => {
    const d = a.date?.toDate ? a.date.toDate() : new Date(a.date||0);
    const key = d.toLocaleDateString('en-KE',{month:'short',year:'numeric'});
    byMonth[key] = (byMonth[key]||0) + (a.amount||0);
  });
  const months = Object.entries(byMonth).slice(-6);
  const maxVal = Math.max(...months.map(([,v])=>v), 1);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'slideUp .25s ease'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
        {[
          { icon:'💰',label:'Total Earned',val:`KES ${total.toLocaleString()}`,color:'var(--green)'},
          { icon:'📅',label:'This Month',val:`KES ${thisMonth.toLocaleString()}`,color:'var(--accent)'},
          { icon:'⏳',label:'Pending',val:`KES ${pending.toLocaleString()}`,color:'var(--amber)'},
          { icon:'📊',label:'Avg / Session',val:`KES ${avgSession.toLocaleString()}`,color:'var(--indigo)'},
        ].map(s => (
          <div key={s.label} className="stat-card"><span className="stat-icon">{s.icon}</span><div><div className="stat-val" style={{color:s.color,fontSize:18}}>{s.val}</div><div className="stat-lbl">{s.label}</div></div></div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-hd"><div className="panel-title">📊 Revenue by Month</div></div>
        {months.length===0 ? <div className="empty-sm">No revenue data yet.</div> : (
          <div style={{display:'flex',gap:10,alignItems:'flex-end',height:140,padding:'0 4px'}}>
            {months.map(([m,v])=>(
              <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%'}}>
                <div style={{fontSize:9,color:'var(--muted)',fontFamily:'var(--mono)',whiteSpace:'nowrap'}}>{v>=1000?`${(v/1000).toFixed(0)}k`:v}</div>
                <div style={{width:'100%',flex:1,display:'flex',alignItems:'flex-end'}}>
                  <div style={{width:'100%',background:'linear-gradient(180deg,var(--accent),rgba(16,185,129,0.3))',borderRadius:'6px 6px 0 0',height:`${(v/maxVal)*90}%`,minHeight:4,transition:'height .6s ease'}} />
                </div>
                <div style={{fontSize:9,color:'var(--muted)',whiteSpace:'nowrap'}}>{m}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-hd"><div className="panel-title">🧾 Recent Transactions</div></div>
        {paid.length===0 ? <div className="empty-sm">No transactions yet.</div> : (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {paid.slice(0,12).map(a => (
              <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
                <div><div style={{fontSize:13,fontWeight:700}}>{a.patientName||'Patient'}</div><div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--mono)'}}>{a.specialty}·{fmtDate(a.date)}</div></div>
                <span style={{fontWeight:800,fontSize:14,color:'var(--green)',fontFamily:'var(--mono)'}}>+KES {(a.amount||0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
