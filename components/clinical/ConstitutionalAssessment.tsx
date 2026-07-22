'use client';
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { usePatientStore } from '@/src/state/patientStore';
import { useUIStore } from '@/src/state/uiStore';
import { useTheme } from '@/src/ui/themes/ThemeProvider';
import { useConstitutionalStore } from '@/lib/clinical/constitutional/constitutionalStore';
import { ConstitutionalSidebar } from './ConstitutionalSidebar';
import { SectionType } from '@/lib/clinical/constitutional/types';

function useT() {
  const theme = useTheme();
  return { ...theme.colors, font: theme.typography.font, mono: theme.typography.mono, id: theme.id };
}

export interface SectionComponentProps {
  sectionId: string;
  onComplete: () => void;
}

function Inp({ value, onChange, placeholder = '', type = 'text', ...rest }: any) {
  const t = useT();
  const s: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
    border: `1px solid ${t.border}`, background: t.surface, color: t.text,
    fontSize: 13, outline: 'none', fontFamily: t.font, transition: 'border-color 0.15s',
  };
  return <input style={s} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} min={rest.min} max={rest.max} />;
}

function Sel({ value, onChange, options, placeholder = '' }: any) {
  const t = useT();
  return (
    <select style={{
      width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.border}`,
      background: t.surface, color: t.text, fontSize: 13, outline: 'none', fontFamily: t.font,
    }} value={value} onChange={e => onChange(e.target.value)}>
      <option value=''>{placeholder || 'Select...'}</option>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Card({ children, style = {} }: any) {
  const t = useT();
  return <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, ...style }}>{children}</div>;
}

function Section({ title, sub = '', children }: any) {
  const t = useT();
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: sub ? 3 : 12, paddingBottom: 8, borderBottom: `1px solid ${t.border}` }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10 }}>{sub}</div>}
      {children}
    </div>
  );
}

function Field({ label, children, full = false }: any) {
  const t = useT();
  return <div style={full ? { marginBottom: 12, gridColumn: '1/-1' } : { marginBottom: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: t.textSub, marginBottom: 5 }}>{label}</div>
    {children}
  </div>;
}

function Grid({ cols = 2, children }: any) {
  const t = useT();
  const isMobile = useUIStore(s => s.isMobile);
  return <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols},1fr)`, gap: 12, marginBottom: 4 }}>{children}</div>;
}

function Pills({ options, value, onSelect }: any) {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o: any) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const sel = value === v;
        return (
          <button key={v} onClick={() => onSelect(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            border: `1px solid ${sel ? t.accent : t.border}`,
            background: sel ? t.accent : 'transparent',
            color: sel ? 'white' : t.textSub,
            fontWeight: sel ? 600 : 400,
            transition: 'all 0.12s', fontFamily: t.font,
          }}>{l}</button>
        );
      })}
    </div>
  );
}

function BoolPill({ label, value, onToggle, warn = false }: any) {
  const t = useT();
  return (
    <button onClick={() => onToggle(!value)} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8,
      border: `1px solid ${value ? (warn ? t.danger : t.accent) : (warn ? `${t.danger}50` : t.border)}`,
      background: value ? (warn ? t.dangerBg : t.accentBg) : 'transparent',
      color: value ? (warn ? t.danger : t.accentText) : (warn ? t.danger : t.textSub),
      fontSize: 13, cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap', fontFamily: t.font,
    }}>
      <span style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${value ? (warn ? t.danger : t.accent) : (warn ? `${t.danger}70` : t.borderStrong)}`,
        background: value ? (warn ? t.danger : t.accent) : 'transparent',
        fontSize: 9, color: 'white', fontWeight: 700,
      }}>{value ? '✓' : ''}</span>
      {label}
    </button>
  );
}

function BiodataSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Patient Biodata</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Demographics, informant, and clinical context.</p>
      </div>
      <Card>
        <Section title='Patient Identification'>
          <Grid>
            <Field label='Full Name'><Inp value={form.biodata.patientName} onChange={v => set('biodata.patientName', v)} placeholder='Patient full name' /></Field>
            <Field label='Date of Birth'><Inp type='date' value={form.biodata.dob} onChange={v => set('biodata.dob', v)} /></Field>
            <Field label='Age in Months'><Inp type='number' value={form.biodata.ageMonths} onChange={v => set('biodata.ageMonths', v)} placeholder='e.g. 24' /></Field>
            <Field label='Sex'><Pills options={['Male', 'Female']} value={form.biodata.sex} onSelect={v => set('biodata.sex', v)} /></Field>
            <Field label='Residence'><Inp value={form.biodata.residence} onChange={v => set('biodata.residence', v)} placeholder='e.g. Kampala' /></Field>
            <Field label='Admission Date'><Inp type='date' value={form.biodata.dateOfAdmission} onChange={v => set('biodata.dateOfAdmission', v)} /></Field>
          </Grid>
        </Section>
        <Section title='Informant & History Quality'>
          <Grid>
            <Field label='Informant'><Inp value={form.biodata.informant} onChange={v => set('biodata.informant', v)} placeholder='Name' /></Field>
            <Field label='Relationship'><Inp value={form.biodata.informantRelation} onChange={v => set('biodata.informantRelation', v)} placeholder='e.g. Mother' /></Field>
          </Grid>
          <Field label='Reliability' full>
            <Pills options={['Reliable', 'Partially Reliable', 'Unreliable', 'Unknown']} value={form.biodata.histReliability} onSelect={v => set('biodata.histReliability', v)} />
          </Field>
        </Section>
      </Card>
    </div>
  );
}

function ChiefComplaintSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set, toggleArrayItem: toggle } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Chief Complaint</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Presenting complaints in chronological order. Symptom exploration belongs in HPI.</p>
      </div>
      <Card>
        <Section title='Presenting Complaints'>
          <Field label='Primary Complaint' full>
            <Inp value={form.hpi.associated?.split('\n')[0] || ''} onChange={v => set('hpi.associated', v)} placeholder={'e.g. "My child has had a cough and fever for 3 days" — Use patient\'s own words'} />
          </Field>
        </Section>
      </Card>
    </div>
  );
}

function HpiSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>History of Presenting Illness</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Structured symptom exploration with chronology.</p>
      </div>
      <Card>
        <Section title='Onset & Progression'>
          <Grid>
            <Field label='Overall Onset'><Pills options={[{ value: 'sudden', label: 'Sudden' }, { value: 'gradual', label: 'Gradual' }, { value: 'insidious', label: 'Insidious' }]} value={form.hpi.onsetType} onSelect={v => set('hpi.onsetType', v)} /></Field>
            <Field label='Progression'><Pills options={['Worsening', 'Improving', 'Fluctuating', 'Static'].map(v => ({ value: v.toLowerCase(), label: v }))} value={form.hpi.progression} onSelect={v => set('hpi.progression', v)} /></Field>
          </Grid>
        </Section>
        <Section title='Detailed Narrative'>
          <Field label='Full Chronological History' full>
            <textarea style={{
              width: '100%', padding: '12px 16px', borderRadius: 8, border: `1px solid ${t.border}`,
              background: t.surface, color: t.text, fontSize: 13, minHeight: 120, resize: 'vertical',
              fontFamily: t.font, outline: 'none',
            }} value={form.hpi.associated} onChange={e => set('hpi.associated', e.target.value)}
              placeholder='Describe the illness from onset to present in chronological order. Include symptom sequence, treatments tried, and response.' />
          </Field>
        </Section>
        <Section title='Prior Treatment'>
          <Grid>
            <Field label='Treatment Already Received'><Inp value={form.hpi.prevTx} onChange={v => set('hpi.prevTx', v)} placeholder='e.g. Paracetamol, Amoxicillin' /></Field>
            <Field label='Response'><Inp value={form.hpi.txResponse} onChange={v => set('hpi.txResponse', v)} placeholder='e.g. Partial, No response' /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function PmhSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  const conditions: any[] = (form.pmh as any).conditions || [];
  const addCondition = () => set('pmh.conditions', [...conditions, { id: Date.now().toString(), name: '', diagnosedYear: '', severity: 'unknown', currentStatus: 'active', medications: [], complications: [] }]);
  const updateCondition = (id: string, updates: any) => set('pmh.conditions', conditions.map((c: any) => c.id === id ? { ...c, ...updates } : c));
  const removeCondition = (id: string) => set('pmh.conditions', conditions.filter((c: any) => c.id !== id));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Past Medical History</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Chronic conditions, surgical history, admissions.</p>
      </div>
      <Card>
        <Section title='Chronic Conditions'>
          {conditions.map((cond: any) => (
            <div key={cond.id} style={{ background: t.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 8, border: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: t.text }}>{cond.name || 'New Condition'}</span>
                <button onClick={() => removeCondition(cond.id)} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
              <Grid>
                <Field label='Name'><Inp value={cond.name} onChange={v => updateCondition(cond.id, { name: v })} placeholder='Condition name' /></Field>
                <Field label='Year Diagnosed'><Inp value={cond.diagnosedYear} onChange={v => updateCondition(cond.id, { diagnosedYear: v })} placeholder='e.g. 2023' /></Field>
              </Grid>
              <Grid>
                <Field label='Severity'><Pills options={['Mild', 'Moderate', 'Severe'].map(v => ({ value: v.toLowerCase(), label: v }))} value={cond.severity} onSelect={v => updateCondition(cond.id, { severity: v })} /></Field>
                <Field label='Status'><Pills options={['Active', 'Resolved', 'In Remission', 'Chronic'].map(v => ({ value: v.toLowerCase().replace(/\s+/g, '_'), label: v }))} value={cond.currentStatus} onSelect={v => updateCondition(cond.id, { currentStatus: v })} /></Field>
              </Grid>
            </div>
          ))}
          <button onClick={addCondition} style={{ padding: '8px 16px', borderRadius: 8, border: `1px dashed ${t.accent}`, background: 'transparent', color: t.accent, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Condition</button>
        </Section>
        <Section title='Surgical History'>
          <Field label='Previous Surgeries' full><Inp value={form.pmh.surgeryDetail || ''} onChange={v => set('pmh.surgeryDetail', v)} placeholder='List any prior surgeries with year' /></Field>
        </Section>
      </Card>
    </div>
  );
}

function ExaminationSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  const now = new Date().toLocaleTimeString();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Examination</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Vital signs and physical examination.</p>
      </div>
      <Card>
        <Section title='Vital Signs' sub={`Recorded at ${now}`}>
          <Grid cols={3}>
            <Field label='HR (bpm)'><Inp type='number' value={form.vitals.hr} onChange={v => set('vitals.hr', v)} placeholder='e.g. 80' /></Field>
            <Field label='RR (/min)'><Inp type='number' value={form.vitals.rr} onChange={v => set('vitals.rr', v)} placeholder='e.g. 24' /></Field>
            <Field label='SpO2 (%)'><Inp type='number' value={form.vitals.spo2} onChange={v => set('vitals.spo2', v)} placeholder='e.g. 98' /></Field>
            <Field label='Temp (°C)'><Inp type='number' value={form.vitals.temp} onChange={v => set('vitals.temp', v)} placeholder='e.g. 37.0' /></Field>
            <Field label='Weight (kg)'><Inp type='number' value={form.vitals.weight} onChange={v => set('vitals.weight', v)} placeholder='e.g. 20' /></Field>
            <Field label='Height (cm)'><Inp type='number' value={form.vitals.height} onChange={v => set('vitals.height', v)} placeholder='e.g. 110' /></Field>
          </Grid>
        </Section>
        <Section title='General Examination'>
          <Grid>
            <Field label='General Condition'><Pills options={['Well', 'Mildly ill', 'Moderately ill', 'Very sick', 'Toxic']} value={form.vitals.generalCondition} onSelect={v => set('vitals.generalCondition', v)} /></Field>
            <Field label='Pallor'><BoolPill label='Present' value={!!form.vitals.pallorExam} onToggle={v => set('vitals.pallorExam', v)} /></Field>
            <Field label='Chest Indrawing'><BoolPill label='Present' value={!!form.vitals.examIndrawing} onToggle={v => set('vitals.examIndrawing', v)} warn /></Field>
            <Field label='Oedema'><BoolPill label='Present' value={!!form.vitals.edemaExam} onToggle={v => set('vitals.edemaExam', v)} warn /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function DrugHistorySection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Drug History</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Current and past medications.</p>
      </div>
      <Card>
        <Section title='Current Medications'>
          <Field label='Medications' full>
            <Inp value={form.pmh.medications || ''} onChange={v => set('pmh.medications', v)} placeholder='e.g. Paracetamol 500mg PO TID, Salbutamol inhaler PRN' />
          </Field>
        </Section>
      </Card>
    </div>
  );
}

function AllergySection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Allergy History</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Allergies, intolerances, and adverse drug reactions.</p>
      </div>
      <Card>
        <Section title='Allergies'>
          <Field label='Known Allergies' full>
            <Inp value={form.pmh.allergies || ''} onChange={v => set('pmh.allergies', v)} placeholder='e.g. Penicillin - rash (true allergy), Codeine - nausea (intolerance)' />
          </Field>
        </Section>
      </Card>
    </div>
  );
}

function FamilyHistorySection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Family History</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Genetic and environmental risks.</p>
      </div>
      <Card>
        <Section title='Family Health'>
          <Grid>
            <Field label='TB Household Contact'><BoolPill label='Yes' value={form.family.tbHousehold} onToggle={v => set('family.tbHousehold', v)} warn /></Field>
            <Field label='Asthma / Atopy'><BoolPill label='Family history' value={form.family.asthmaFamily || form.family.atopyFamily} onToggle={v => { set('family.asthmaFamily', v); set('family.atopyFamily', v); }} /></Field>
            <Field label='Sickle Cell in Family'><BoolPill label='Yes' value={form.family.sickleCellFamily} onToggle={v => set('family.sickleCellFamily', v)} /></Field>
          </Grid>
          <Field label='Other Genetic / Chronic Diseases' full>
            <Inp value={form.family.geneticDiseases || ''} onChange={v => set('family.geneticDiseases', v)} placeholder='e.g. Mother - hypertension, Father - diabetes' />
          </Field>
        </Section>
        <Section title='Home Environment'>
          <Grid>
            <Field label='Housing'><Inp value={form.family.housingConditions || ''} onChange={v => set('family.housingConditions', v)} placeholder='e.g. Brick house, 2 rooms' /></Field>
            <Field label='Water Source'><Inp value={form.family.waterSource || ''} onChange={v => set('family.waterSource', v)} placeholder='e.g. Tap, Borehole' /></Field>
            <Field label='Sanitation'><Inp value={form.family.sanitation || ''} onChange={v => set('family.sanitation', v)} placeholder='e.g. Flush toilet' /></Field>
            <Field label='School Attendance'><Inp value={form.family.schoolAttendance || ''} onChange={v => set('family.schoolAttendance', v)} placeholder='e.g. Primary 3' /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function SocialHistorySection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Social History</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Lifestyle, exposures, and social context.</p>
      </div>
      <Card>
        <Section title='Social Context'>
          <Grid>
            <Field label='Smoking Exposure'><BoolPill label='Household smoker' value={form.family.smokingExposure} onToggle={v => set('family.smokingExposure', v)} warn /></Field>
            <Field label='Smoking Details'><Inp value={form.family.smokeDetail || ''} onChange={v => set('family.smokeDetail', v)} placeholder='e.g. Father smokes 10/day' /></Field>
            <Field label='Parent Occupation'><Inp value={form.family.parentOccupation || ''} onChange={v => set('family.parentOccupation', v)} placeholder='e.g. Teacher, Farmer' /></Field>
            <Field label='Similar Illness in Siblings'><BoolPill label='Yes' value={form.family.similarIllnessSiblings} onToggle={v => set('family.similarIllnessSiblings', v)} /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function ROSSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  const systems = [
    { key: 'general', label: 'General / Constitutional' },
    { key: 'ent', label: 'ENT' },
    { key: 'respiratory', label: 'Respiratory' },
    { key: 'cardiovascular', label: 'Cardiovascular' },
    { key: 'gastrointestinal', label: 'Gastrointestinal' },
    { key: 'neurological', label: 'Neurological' },
    { key: 'musculoskeletal', label: 'Musculoskeletal' },
    { key: 'genitourinary', label: 'Genitourinary' },
    { key: 'dermatological', label: 'Dermatological' },
    { key: 'hematological', label: 'Hematological' },
    { key: 'endocrine', label: 'Endocrine' },
    { key: 'psychiatric', label: 'Psychiatric' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Review of Systems</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>12-system review. Only capture NEW symptoms not already documented.</p>
      </div>
      <Card>
        <Section title='Systems'>
          <Grid cols={2}>
            {systems.map(sys => (
              <Field key={sys.key} label={sys.label}>
                <Inp value={form.ros?.[sys.key] || ''} onChange={v => set(`ros.${sys.key}`, v)} placeholder='Symptoms or "clear"' />
              </Field>
            ))}
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function HistorySummarySection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const documentation = useConstitutionalStore(s => s.documentation);
  const formatResult = useConstitutionalStore(s => s.formatResult);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>History Summary</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Auto-generated synthesis from all history sections.</p>
      </div>
      <Card>
        <Section title='Generated Summary'>
          <div style={{
            background: t.surfaceAlt || '#0F172A', borderRadius: 10, padding: 16,
            border: `1px solid ${t.border}`, fontSize: 13, lineHeight: 1.7, color: t.text, whiteSpace: 'pre-wrap',
            fontFamily: t.font,
          }}>
            {documentation[sectionId]?.narrative || 'Summary will be auto-generated once all history sections are completed.'}
          </div>
        </Section>
      </Card>
    </div>
  );
}

function BirthHistorySection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Birth History</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Antenatal, delivery, and neonatal details.</p>
      </div>
      <Card>
        <Section title='Delivery Details'>
          <Grid>
            <Field label='Place of Delivery'><Inp value={form.birth.birthPlace || ''} onChange={v => set('birth.birthPlace', v)} placeholder='e.g. Hospital, Home' /></Field>
            <Field label='Mode of Delivery'><Pills options={['SVD', 'C-section', 'Vacuum', 'Forceps', 'Breech']} value={form.birth.deliveryMode || ''} onSelect={v => set('birth.deliveryMode', v)} /></Field>
            <Field label='Gestation at Birth (wks)'><Inp type='number' value={form.birth.gestAgeWeeks || ''} onChange={v => set('birth.gestAgeWeeks', v)} placeholder='e.g. 40' /></Field>
            <Field label='Birth Weight (kg)'><Inp type='number' value={form.birth.birthWeight || ''} onChange={v => set('birth.birthWeight', v)} placeholder='e.g. 3.2' /></Field>
          </Grid>
        </Section>
        <Section title='Neonatal Period'>
          <Grid>
            <Field label='APGAR Score'><Inp value={form.birth.apgar || ''} onChange={v => set('birth.apgar', v)} placeholder='e.g. 9/10' /></Field>
            <Field label='NICU Admission'><BoolPill label='Yes' value={form.birth.nicuAdmission} onToggle={v => set('birth.nicuAdmission', v)} warn /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function DevelopmentSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Growth & Development</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Developmental milestones and growth tracking.</p>
      </div>
      <Card>
        <Section title='Developmental Milestones'>
          <Grid>
            <Field label='Gross Motor'><Inp value={form.development.grossMotor || ''} onChange={v => set('development.grossMotor', v)} placeholder='e.g. Walking at 12mo' /></Field>
            <Field label='Fine Motor / Vision'><Inp value={form.development.fineMotor || ''} onChange={v => set('development.fineMotor', v)} placeholder='e.g. Pincer grip at 10mo' /></Field>
            <Field label='Language / Hearing'><Inp value={form.development.speech || ''} onChange={v => set('development.speech', v)} placeholder='e.g. First words at 12mo' /></Field>
            <Field label='Social / Adaptive'><Inp value={form.development.social || ''} onChange={v => set('development.social', v)} placeholder='e.g. Smiled at 6wk' /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

function ImmunizationSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Immunization</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Vaccination status per schedule.</p>
      </div>
      <Card>
        <Section title='Vaccination Status'>
          <Field label='Immunization Status' full>
            <Pills options={['Up to date', 'Partially immunized', 'Not immunized', 'Unknown']} value={form.immunization.status || ''} onSelect={v => set('immunization.status', v)} />
          </Field>
          <Field label='Details' full>
            <Inp value={form.immunization.adverseDetail || ''} onChange={v => set('immunization.adverseDetail', v)} placeholder='e.g. BCG given at birth, OPV doses complete' />
          </Field>
        </Section>
      </Card>
    </div>
  );
}

function NutritionSection({ sectionId, onComplete }: SectionComponentProps) {
  const t = useT();
  const { form, setField: set } = usePatientStore();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>Nutrition</h2>
        <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>Feeding practices, dietary intake, and nutritional status.</p>
      </div>
      <Card>
        <Section title='Feeding'>
          <Grid>
            <Field label='Breastfeeding'><Pills options={['Exclusive', 'Mixed', 'None', 'Stopped']} value={form.nutrition.breastfed || ''} onSelect={v => set('nutrition.breastfed', v)} /></Field>
            <Field label='BF Duration'><Inp value={form.nutrition.bfDuration || ''} onChange={v => set('nutrition.bfDuration', v)} placeholder='e.g. 6 months' /></Field>
            <Field label='Complementary Feeds'><Inp value={form.nutrition.complementaryAge || ''} onChange={v => set('nutrition.complementaryAge', v)} placeholder='e.g. Started at 6mo' /></Field>
            <Field label='Dietary Diversity'><Inp value={form.nutrition.dietaryDiversity || ''} onChange={v => set('nutrition.dietaryDiversity', v)} placeholder='e.g. Grains, vegetables, protein' /></Field>
          </Grid>
        </Section>
      </Card>
    </div>
  );
}

export function ConstitutionalAssessment({ ageMonths, sex, department }: { ageMonths: number; sex: string; department: string }) {
  const t = useT();
  const initialize = useConstitutionalStore(s => s.initializeFromPatient);
  const sections = useConstitutionalStore(s => s.sections);
  const activeSectionId = useConstitutionalStore(s => s.activeSectionId);
  const gateStates = useConstitutionalStore(s => s.gateStates);
  const completeSection = useConstitutionalStore(s => s.completeSection);
  const formatResult = useConstitutionalStore(s => s.formatResult);

  useEffect(() => {
    initialize(ageMonths, sex, department);
  }, [ageMonths, sex, department, initialize]);

  const activeSection = sections.find(s => s.id === activeSectionId);

  const handleComplete = () => {
    if (activeSectionId) {
      completeSection(activeSectionId);
    }
  };

  const formatLabel = formatResult?.contextModifiers?.join(' + ') || 'Adult Medical';

  const renderSection = () => {
    if (!activeSection) {
      return (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
          All gates completed. The clinical assessment is complete.
        </div>
      );
    }

    switch (activeSection.type) {
      case 'biodata':
        return <BiodataSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'chief_complaint':
        return <ChiefComplaintSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'hpi':
        return <HpiSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'pmh':
        return <PmhSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'drug_history':
        return <DrugHistorySection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'allergy_history':
        return <AllergySection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'family_history':
        return <FamilyHistorySection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'social_history':
        return <SocialHistorySection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'review_of_systems':
        return <ROSSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'history_summary':
        return <HistorySummarySection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'birth_history':
        return <BirthHistorySection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'development':
        return <DevelopmentSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'immunization':
        return <ImmunizationSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'nutrition':
        return <NutritionSection sectionId={activeSection.id} onComplete={handleComplete} />;
      case 'examination':
        return <ExaminationSection sectionId={activeSection.id} onComplete={handleComplete} />;
      default:
        return (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: t.text, fontFamily: t.font }}>{activeSection.label}</h2>
              <p style={{ fontSize: 13, color: t.textSub, margin: '6px 0 0', fontFamily: t.font }}>{activeSection.description}</p>
            </div>
            <Card>
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: 13 }}>
                Section data collection not yet implemented.
                <br />
                <span style={{ fontSize: 11, color: '#475569', marginTop: 8, display: 'block' }}>
                  Section type: {activeSection.type} — Position: {activeSection.position}
                </span>
              </div>
            </Card>
          </div>
        );
    }
  };

  const activeGate = gateStates.find(g => g.gate.id === activeSectionId);
  const isCompleted = activeGate?.status === 'completed';

  return (
    <div style={{ display: 'flex', gap: 24, maxWidth: 1400, margin: '0 auto', padding: '24px 5%', position: 'relative' }}>
      <ConstitutionalSidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          {formatLabel} Assessment Format — Constitutional
        </div>
        {renderSection()}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, marginBottom: 60 }}>
          <button onClick={handleComplete}
            disabled={isCompleted}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: isCompleted ? '#475569' : '#22d3ee',
              color: isCompleted ? '#94A3B8' : '#070B14',
              cursor: isCompleted ? 'not-allowed' : 'pointer',
              fontSize: '.875rem', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
              opacity: isCompleted ? 0.5 : 1,
            }}>
            {isCompleted ? '✓ Completed' : 'Complete & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
