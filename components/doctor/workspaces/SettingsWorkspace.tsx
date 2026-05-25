'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import type { DoctorProfile } from '../DoctorShell';

interface Props {
  doctor: DoctorProfile;
  onUpdated: () => void;
}

export default function SettingsWorkspace({ doctor, onUpdated }: Props) {
  const [form, setForm] = useState({
    name: doctor.name||'', specialty: doctor.specialty||'', clinic: doctor.clinic||'',
    phone: doctor.phone||'', licenseNumber: doctor.licenseNumber||'', bio: doctor.bio||'',
    location: doctor.location||'', yearsExperience: doctor.yearsExperience?.toString()||'',
    languages: doctor.languages?.join(', ')||'',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(p=>({...p,[k]:e.target.value}));

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db,'users',doctor.uid), {
      ...form, yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
      languages: form.languages.split(',').map(l=>l.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
    onUpdated();
    setSaving(false);
  };

  return (
    <div style={{animation:'slideUp .25s ease'}}>
      <div className="panel" style={{maxWidth:700}}>
        <div className="panel-hd">
          <div className="panel-title">⚙️ Profile & Settings</div>
          {saved && <span style={{color:'var(--green)',fontSize:13,fontWeight:700}}>✓ Saved!</span>}
        </div>
        <div className="form-grid-2" style={{gap:14}}>
          {[
            {k:'name',label:'Full Name',ph:'Dr. Jane Mwangi'},
            {k:'specialty',label:'Specialty',ph:'e.g. Cardiology'},
            {k:'clinic',label:'Primary Clinic',ph:'e.g. Nairobi Heart Centre'},
            {k:'phone',label:'Phone',ph:'+254 7xx xxx xxx'},
            {k:'licenseNumber',label:'Medical License No.',ph:'e.g. ML-12345'},
            {k:'location',label:'Location',ph:'e.g. Nairobi, Kenya'},
            {k:'yearsExperience',label:'Years Experience',ph:'12'},
            {k:'languages',label:'Languages (comma-separated)',ph:'English, Swahili'},
          ].map(field => (
            <div key={field.k} className="field-col">
              <label className="field-lbl">{field.label}</label>
              <input className="field-inp" value={(form as any)[field.k]} onChange={f(field.k)} placeholder={field.ph} />
            </div>
          ))}
          <div className="field-col form-full">
            <label className="field-lbl">Bio / Professional Summary</label>
            <textarea className="field-ta" rows={4} value={form.bio} onChange={f('bio')} placeholder="Tell patients about your experience and approach…" />
          </div>
        </div>
        <button className="btn-cta" onClick={save} disabled={saving} style={{marginTop:16,maxWidth:220}}>
          {saving?'Saving…':'💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}
