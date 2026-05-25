'use client';

import React, { useState } from 'react';
import { useAvailability, generateSlots, DEFAULT_AVAILABILITY } from '@/lib/availability';
import DoctorServicesPage from '@/components/DoctorServicesPage';
import type { DoctorProfile } from '../DoctorShell';

interface Service {
  id: string; specialty: string; clinic: string; price: number;
  description: string; doctorId: string; doctorName: string;
  duration: number; isAvailable: boolean;
  tags?: string[]; location?: string; yearsExperience?: number;
}

interface Props { doctor: DoctorProfile; services: Service[]; }

function DoctorAvailabilityManager({ doctorId }: { doctorId: string }) {
  const { availability, loading, save } = useAvailability(doctorId);
  const [form, setForm] = useState(DEFAULT_AVAILABILITY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    if (availability) setForm(availability);
  }, [availability]);

  if (loading) return <div style={{color:'var(--muted)',fontSize:14,padding:20}}>Loading availability...</div>;

  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const TIMEZONES = ['Africa/Nairobi','Africa/Lagos','Africa/Johannesburg','Africa/Cairo','Africa/Accra','Europe/London','America/New_York','Asia/Dubai'];

  const toggleDay = (day: string) => setForm(f => ({...f, availableDays: f.availableDays.includes(day) ? f.availableDays.filter(d=>d!==day) : [...f.availableDays, day]}));
  const generatedSlots = generateSlots(form.availableFrom, form.availableTo, form.slotDuration, form.bufferMinutes);

  const handleSave = async () => {
    setSaving(true);
    await save({ ...form, slots: generatedSlots });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const lbl: React.CSSProperties = {display:'block',fontSize:12,fontWeight:600,color:'var(--muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'};
  const sel: React.CSSProperties = {width:'100%',padding:'9px 12px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13};

  return (
    <div style={{background:'var(--surface)',borderRadius:16,padding:24,border:'1px solid var(--border)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>🗓️ My Availability</h3>
        <button className="btn-sm-accent" onClick={()=>setShow(!show)}>{show?'▲ Hide':'▼ Configure'}</button>
      </div>
      {show && (
        <>
          <div style={{marginBottom:18}}>
            <label style={lbl}>Timezone</label>
            <select value={form.timezone} onChange={e=>setForm(f=>({...f,timezone:e.target.value}))} style={sel}>
              {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz.replace('_',' ')}</option>)}
            </select>
          </div>
          <div style={{marginBottom:18}}>
            <label style={lbl}>Available Days</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {DAYS.map(day=>(
                <button key={day} onClick={()=>toggleDay(day)} style={{padding:'8px 14px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:600,fontSize:13,background:form.availableDays.includes(day)?'var(--accent)':'var(--bg)',color:form.availableDays.includes(day)?'#fff':'var(--muted)'}}>{day}</button>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
            <div><label style={lbl}>From</label><input type="time" value={form.availableFrom} onChange={e=>setForm(f=>({...f,availableFrom:e.target.value}))} style={sel} /></div>
            <div><label style={lbl}>To</label><input type="time" value={form.availableTo} onChange={e=>setForm(f=>({...f,availableTo:e.target.value}))} style={sel} /></div>
            <div><label style={lbl}>Slot Duration</label><select value={form.slotDuration} onChange={e=>setForm(f=>({...f,slotDuration:Number(e.target.value)}))} style={sel}>{[15,20,30,45,60].map(m=><option key={m} value={m}>{m}min</option>)}</select></div>
            <div><label style={lbl}>Buffer</label><select value={form.bufferMinutes} onChange={e=>setForm(f=>({...f,bufferMinutes:Number(e.target.value)}))} style={sel}>{[0,5,10,15,20].map(m=><option key={m} value={m}>{m}min</option>)}</select></div>
            <div><label style={lbl}>Max/Day</label><select value={form.maxAppointmentsPerDay} onChange={e=>setForm(f=>({...f,maxAppointmentsPerDay:Number(e.target.value)}))} style={sel}>{[4,6,8,10,12,15,20].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={lbl}>Preview — {generatedSlots.length} slots</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,padding:12,background:'var(--bg)',borderRadius:10,maxHeight:120,overflowY:'auto'}}>
              {generatedSlots.length===0?<span style={{color:'var(--muted)',fontSize:13}}>No slots — adjust your hours</span>:generatedSlots.map(s=><span key={s} style={{padding:'4px 10px',background:'var(--accent-dim)',color:'var(--accent)',borderRadius:6,fontSize:12,fontWeight:600}}>{s}</span>)}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{padding:'12px 28px',background:saving?'var(--muted)':'var(--accent)',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:saving?'default':'pointer',width:'100%'}}>
            {saving?'Saving...':saved?'✓ Saved!':'💾 Save Availability'}
          </button>
        </>
      )}
    </div>
  );
}

export default function ServicesWorkspace({ doctor, services }: Props) {
  const [showAvailability, setShowAvailability] = useState(false);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'slideUp .25s ease'}}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">🗓️ Availability & Slots</div>
          <button className="btn-sm-accent" onClick={()=>setShowAvailability(v=>!v)}>{showAvailability?'▲ Hide':'▼ Set My Slots'}</button>
        </div>
        <p style={{fontSize:12,color:'var(--muted)',marginBottom:showAvailability?14:0}}>Configure your working days, time slots and timezone.</p>
        {showAvailability && <DoctorAvailabilityManager doctorId={doctor.uid} />}
      </div>
      <DoctorServicesPage doctorId={doctor.uid} doctorName={doctor.name} />
    </div>
  );
}
