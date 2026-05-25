'use client';
import React from 'react';
import { PatientForm } from '@/src/types';

const btnBase: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd',
  background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500,
  transition: 'all .15s',
};
const activeBtn: React.CSSProperties = {
  ...btnBase, background: '#e8f0fe', borderColor: '#1a73e8', color: '#1a73e8',
  fontWeight: 700,
};
const warnBtn: React.CSSProperties = {
  ...btnBase, borderColor: '#ea4335', color: '#ea4335',
};
const warnBtnActive: React.CSSProperties = {
  ...warnBtn, background: '#fce8e6', fontWeight: 700,
};
const cardStyle: React.CSSProperties = {
  background: '#f8f9fa', borderRadius: 12, padding: 16,
  border: '1px solid #e8eaed', marginBottom: 16,
};
const cardHeader: React.CSSProperties = {
  fontWeight: 700, fontSize: 13, marginBottom: 12,
  display: 'flex', alignItems: 'center', gap: 8,
};
const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#5f6368',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, marginTop: 10,
};
const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
};
const rowStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4,
};
const negBoxStyle: React.CSSProperties = {
  marginTop: 10, padding: '8px 12px', background: '#fff',
  borderRadius: 8, border: '1px solid #e8eaed',
  fontSize: 11, color: '#5f6368',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  border: '1px solid #ddd', fontSize: 12, fontFamily: 'inherit',
  boxSizing: 'border-box',
};
const textAreaStyle: React.CSSProperties = {
  ...inputStyle, minHeight: 60, resize: 'vertical',
};

function BoolToggle({ label, value, onToggle, warn }: {
  label: string; value: boolean; onToggle: (v: boolean) => void; warn?: boolean;
}) {
  const st = value ? (warn ? warnBtnActive : activeBtn) : (warn ? warnBtn : btnBase);
  return (
    <button style={st} onClick={() => onToggle(!value)} title={label}>
      {value ? '\u2713 ' : ''}{label}
    </button>
  );
}

function TriStateToggle({ label, value, onChange, warn }: {
  label: string; value: boolean | undefined; onChange: (v: boolean | undefined) => void; warn?: boolean;
}) {
  const opts: { v: boolean | undefined; text: string }[] = [
    { v: undefined, text: '?' },
    { v: true, text: 'Yes' },
    { v: false, text: 'No' },
  ];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, margin: 0, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 11, marginRight: 2, lineHeight: '24px' }}>{label}</span>
      {opts.map(opt => {
        const active = value === opt.v;
        const st: React.CSSProperties = {
          padding: '2px 6px', borderRadius: 4, border: '1px solid',
          cursor: 'pointer', fontSize: 10, fontWeight: 600, lineHeight: '18px',
          transition: 'all .15s', background: '#fff',
        };
        if (active) {
          if (opt.v === true) {
            st.background = warn ? '#fce8e6' : '#e8f0fe';
            st.borderColor = warn ? '#ea4335' : '#1a73e8';
            st.color = warn ? '#ea4335' : '#1a73e8';
          } else if (opt.v === false) {
            st.background = '#f1f3f4';
            st.borderColor = '#dadce0';
            st.color = '#5f6368';
          } else {
            st.background = '#f8f9fa';
            st.borderColor = '#e8eaed';
            st.color = '#999';
            st.fontWeight = 400;
          }
        } else {
          st.borderColor = '#eee';
          st.color = '#ccc';
        }
        return (
          <button key={String(opt.v)} style={st} onClick={() => onChange(opt.v)}>
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

function PillSelect({ label, options, value, onSelect }: {
  label: string; options: { value: string; label: string }[];
  value: string; onSelect: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={sectionLabel}>{label}</div>
      <div style={rowStyle}>
        {options.map(opt => {
          const isActive = value === opt.value;
          return (
            <button key={opt.value}
              style={isActive ? activeBtn : btnBase}
              onClick={() => onSelect(opt.value)}>
              {isActive ? '\u2713 ' : ''}{opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextArea({ value, onChange, placeholder, label }: {
  value: string; onChange: (v: string) => void; placeholder?: string; label?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={sectionLabel}>{label}</div>}
      <textarea style={textAreaStyle}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} />
    </div>
  );
}

function TextInput({ value, onChange, placeholder, label }: {
  value: string; onChange: (v: string) => void; placeholder?: string; label?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={sectionLabel}>{label}</div>}
      <input style={inputStyle}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} />
    </div>
  );
}

// ── PROPS ──

interface Props {
  form: PatientForm;
  set: (path: string, value: any) => void;
  symptomOrder: string[];
}

// ── MAIN COMPONENT ──

export default function HPIWorkflow({ form, set, symptomOrder }: Props) {
  const symptoms = symptomOrder.filter(id =>
    CORE_SYMPTOMS.includes(id)
  );

  if (symptoms.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 24, fontSize: 12, color: '#5f6368' }}>
        No symptoms selected. Select symptoms in the Chief Complaints section above to begin the structured HPI workup.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#5f6368',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12
      }}>
        Structured Symptom Workup — complete each card in chronological order
      </div>

      {symptoms.map((id, idx) => (
        <SymptomCard key={id} symptomId={id} form={form} set={set} index={idx} />
      ))}

      {/* ── General Features Across All Symptoms ── */}
      <GeneralFeaturesCard form={form} set={set} />

      {/* ── Healthcare-Seeking Behaviour & Life Impact ── */}
      <HealthcareAndImpactCard form={form} set={set} />
    </div>
  );
}

// ── ALL HANDLED SYMPTOMS ──

const CORE_SYMPTOMS = [
  'fever', 'cough', 'wheeze', 'difficulty_breathing', 'stridor',
  'chest_pain', 'nasal_discharge', 'hemoptysis', 'noisy_breathing',
  'cyanosis', 'fast_breathing', 'lethargy', 'night_sweats', 'weight_loss',
  'sore_throat', 'chest_tightness', 'rash', 'ear_pain', 'abdominal_pain',
  'reduced_feeding',
];

const SYMPTOM_ICONS: Record<string, string> = {
  fever: '\uD83C\uDF21\uFE0F', cough: '\uD83E\uDE82', wheeze: '\uD83D\uDD0A',
  difficulty_breathing: '\uD83D\uDCA8', stridor: '\uD83D\uDD07',
  chest_pain: '\uD83D\uDC93', nasal_discharge: '\uD83E\uDD27',
  hemoptysis: '\uD83E\uDEC0', noisy_breathing: '\uD83D\uDD0D',
  cyanosis: '\uD83D\uDCA7', fast_breathing: '\uD83D\uDC3F\u200D\u2642\uFE0F',
  lethargy: '\uD83D\uDE34', night_sweats: '\uD83D\uDCA6',
  weight_loss: '\u2696\uFE0F', sore_throat: '\uD83D\uDE12',
  chest_tightness: '\uD83D\uDCAA', rash: '\uD83E\uDD1A',
  ear_pain: '\uD83D\uDC42', abdominal_pain: '\uD83E\uDE78',
  reduced_feeding: '\uD83C\uDF7D\uFE0F',
};

const SYMPTOM_LABELS: Record<string, string> = {
  fever: 'Fever', cough: 'Cough', wheeze: 'Wheeze',
  difficulty_breathing: 'Difficulty Breathing', stridor: 'Stridor',
  chest_pain: 'Chest Pain', nasal_discharge: 'Nasal Discharge',
  hemoptysis: 'Coughing Blood', noisy_breathing: 'Noisy Breathing',
  cyanosis: 'Cyanosis (Turning Blue)', fast_breathing: 'Fast Breathing',
  lethargy: 'Lethargy / Tiredness', night_sweats: 'Night Sweats',
  weight_loss: 'Weight Loss', sore_throat: 'Sore Throat',
  chest_tightness: 'Chest Tightness', rash: 'Rash',
  ear_pain: 'Ear Pain', abdominal_pain: 'Abdominal Pain',
  reduced_feeding: 'Reduced Feeding / Poor Appetite',
};

// ── PER-SYMPTOM CARD ──

function SymptomCard({ symptomId, form, set, index }: {
  symptomId: string; form: PatientForm; set: (p: string, v: any) => void; index: number;
}) {
  const icon = SYMPTOM_ICONS[symptomId] || '\u2753';
  const label = SYMPTOM_LABELS[symptomId] || symptomId;
  const orderLabel = `Symptom ${index + 1}`;

  return (
    <div style={cardStyle}>
      <div style={cardHeader}>
        <span>{icon}</span>
        <span>{orderLabel}: {label}</span>
      </div>

      {symptomId === 'fever' && <FeverFields form={form} set={set} />}
      {symptomId === 'cough' && <CoughFields form={form} set={set} />}
      {symptomId === 'wheeze' && <WheezeFields form={form} set={set} />}
      {symptomId === 'difficulty_breathing' && <DyspneaFields form={form} set={set} />}
      {symptomId === 'stridor' && <StridorFields form={form} set={set} />}
      {symptomId === 'chest_pain' && <ChestPainFields form={form} set={set} />}
      {symptomId === 'nasal_discharge' && <NasalDischargeFields form={form} set={set} />}
      {symptomId === 'hemoptysis' && <HemoptysisFields form={form} set={set} />}
      {symptomId === 'noisy_breathing' && <NoisyBreathingFields form={form} set={set} />}
      {symptomId === 'cyanosis' && <CyanosisFields form={form} set={set} />}
      {symptomId === 'fast_breathing' && <FastBreathingFields form={form} set={set} />}
      {symptomId === 'lethargy' && <LethargyFields form={form} set={set} />}
      {symptomId === 'night_sweats' && <NightSweatsFields form={form} set={set} />}
      {symptomId === 'weight_loss' && <WeightLossFields form={form} set={set} />}
      {symptomId === 'sore_throat' && <SoreThroatFields form={form} set={set} />}
      {symptomId === 'chest_tightness' && <ChestTightnessFields form={form} set={set} />}
      {symptomId === 'rash' && <RashFields form={form} set={set} />}
      {symptomId === 'ear_pain' && <EarPainFields form={form} set={set} />}
      {symptomId === 'abdominal_pain' && <AbdominalPainFields form={form} set={set} />}
      {symptomId === 'reduced_feeding' && <ReducedFeedingFields form={form} set={set} />}

      {/* Exacerbating & Relieving Factors (SOCRATES) */}
      <div style={{ borderTop: '1px solid #e8eaed', marginTop: 10, paddingTop: 10 }}>
        <div style={sectionLabel}>{'\uD83D\uDD0D'} What makes it worse / better?</div>
        <div style={gridStyle}>
          <TextArea label="Exacerbating Factors"
            placeholder="Activity, position, feeding, crying, cold air, allergens, time of day"
            value={form.hpi.exacerbating || ''}
            onChange={v => set('hpi.exacerbating', v)} />
          <TextArea label="Relieving Factors"
            placeholder="Rest, medications, position change, steam, cool air, specific treatments"
            value={form.hpi.relieving || ''}
            onChange={v => set('hpi.relieving', v)} />
        </div>
      </div>


    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEVER — full SOCRATES characterisation
// ═══════════════════════════════════════════════════════════════════════════

function FeverFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      {/* Site & Onset */}
      <div style={gridStyle}>
        <PillSelect label="Onset" options={[
          { value: 'sudden', label: 'Sudden / Abrupt' },
          { value: 'gradual', label: 'Gradual / Progressive' },
        ]} value={form.hpi.onsetType === 'sudden' ? 'sudden' : 'gradual'} onSelect={v => set('hpi.onsetType', v)} />
        <PillSelect label="Progression" options={[
          { value: 'worsening', label: 'Worsening' },
          { value: 'fluctuating', label: 'Fluctuating' },
          { value: 'improving', label: 'Improving' },
          { value: '', label: 'Static' },
        ]} value={form.hpi.feverProgression} onSelect={v => set('hpi.feverProgression', v)} />
      </div>

      {/* Character — Fever Pattern */}
      <PillSelect label="Temporal Pattern" options={[
        { value: 'continuous', label: 'Continuous / Sustained' },
        { value: 'intermittent', label: 'Intermittent / Spiking' },
        { value: 'remittent', label: 'Remittent (fluctuates, never normal)' },
        { value: 'periodic', label: 'Periodic / Relapsing' },
      ]} value={form.hpi.feverPattern} onSelect={v => set('hpi.feverPattern', v)} />

      {/* Severity */}
      <div style={sectionLabel}>Severity</div>
      <div style={gridStyle}>
        <div>
          <div style={sectionLabel}>Grade at Peak</div>
          <div style={rowStyle}>
            <BoolToggle label="Low-grade (<38.5\u00B0C)" value={!form.hpi.highFever} onToggle={() => form.hpi.highFever && set('hpi.highFever', false)} />
            <BoolToggle label="High-grade (\u226539\u00B0C)" value={!!form.hpi.highFever} onToggle={v => set('hpi.highFever', v)} warn />
          </div>
        </div>
        <div>
          <div style={sectionLabel}>Measured Temperature</div>
          <TextInput placeholder="e.g. 39.5\u00B0C axillary, 40.2\u00B0C rectal" value={form.hpi.feverMeasuredTemp} onChange={v => set('hpi.feverMeasuredTemp', v)} />
        </div>
      </div>

      {/* Associated Features */}
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Irritability / fussiness" value={!!form.hpi.irritability} onToggle={v => set('hpi.irritability', v)} />
        <BoolToggle label="Lethargy / reduced playfulness" value={!!form.ros.lethargyRos} onToggle={v => set('ros.lethargyRos', v)} />
        <BoolToggle label="Seizures / convulsions" value={!!form.hpi.seizureHPI} onToggle={v => set('hpi.seizureHPI', v)} warn />
        <BoolToggle label="Rigors / chills / shivering" value={!!form.hpi.sickContact} onToggle={v => set('hpi.sickContact', v)} />
        <BoolToggle label="Myalgia / body aches" value={!!form.hpi.suddenOnset} onToggle={() => {}} />
      </div>

      {/* Exacerbating / Relieving — Antipyretic Response */}
      <div style={sectionLabel}>Response to Antipyretics</div>
      <PillSelect label="Antipyretic Response" options={[
        { value: 'good_resp', label: 'Good response' },
        { value: 'partial_resp', label: 'Partial response' },
        { value: 'no_resp', label: 'No response' },
        { value: 'not_given', label: 'Not given' },
      ]} value={
        form.hpi.txResponse === 'good' ? 'good_resp' :
        (form.hpi.txResponse === 'partial' || form.hpi.txResponse === 'partially_improved') ? 'partial_resp' :
        (form.hpi.txResponse === 'none' || form.hpi.txResponse === 'no_change') ? 'no_resp' :
        'not_given'
      } onSelect={v => {
        const map: Record<string, string> = {
          'good_resp': 'good', 'partial_resp': 'partial',
          'no_resp': 'none', 'not_given': 'not_yet_given'
        };
        set('hpi.txResponse', map[v] || '');
      }} />

      {/* Pertinent Negatives */}
      <div style={negBoxStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pertinent Negatives</div>
        <div style={{ lineHeight: 1.8 }}>
          {!form.hpi.seizureHPI && <span>{'\u2713'} No convulsions </span>}
          {!form.hpi.nightSweats && <span>{'\u2713'} No night sweats </span>}
          {!form.hpi.irritability && <span>{'\u2713'} No irritability </span>}
          {form.hpi.feverPattern !== 'continuous' && <span>{'\u2713'} Not continuous </span>}
        </div>
      </div>

      {/* Chronic Fever / TB Evaluation */}
      <div style={{ borderTop: '1px solid #e8eaed', marginTop: 10, paddingTop: 10 }}>
        <div style={sectionLabel}>Chronic Fever / TB Evaluation</div>
        <div style={rowStyle}>
          <TriStateToggle label="Night sweats" value={form.hpi.nightSweats} onChange={v => set('hpi.nightSweats', v)} />
          <TriStateToggle label="TB household contact" value={form.hpi.tbContact} onChange={v => set('hpi.tbContact', v)} warn />
          <TriStateToggle label="Unintentional weight loss" value={form.hpi.weightLoss} onChange={v => set('hpi.weightLoss', v)} warn />
          <BoolToggle label="Prolonged fever (>7 days)" value={!!form.hpi.coughDuration && (form.hpi.coughDuration === 'chronic' || form.hpi.coughDuration === '>=14_days')} onToggle={() => {}} />
        </div>
      </div>


    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COUGH — full SOCRATES characterisation
// ═══════════════════════════════════════════════════════════════════════════

function CoughFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      {/* Onset */}
      <PillSelect label="Duration Category" options={[
        { value: 'acute', label: 'Acute (<2 weeks)' },
        { value: 'subacute', label: 'Subacute (2\u20134 weeks)' },
        { value: 'chronic', label: 'Chronic (>4 weeks)' },
      ]} value={form.hpi.coughDuration} onSelect={v => set('hpi.coughDuration', v)} />

      {/* Character */}
      <PillSelect label="Character" options={[
        { value: 'dry', label: 'Dry / Non-productive' },
        { value: 'productive', label: 'Productive / Wet' },
        { value: 'barking', label: 'Barking / Seal-like' },
        { value: 'whooping', label: 'Whooping / Paroxysmal' },
        { value: 'blood_stained', label: 'Blood-stained' },
      ]} value={form.hpi.coughChar} onSelect={v => set('hpi.coughChar', v)} />

      {/* Severity & Pattern */}
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild / occasional' },
          { value: 'moderate', label: 'Moderate / frequent' },
          { value: 'severe', label: 'Severe / constant / distressing' },
        ]} value={form.hpi.coughSeverity} onSelect={v => set('hpi.coughSeverity', v)} />
        <PillSelect label="Pattern" options={[
          { value: 'constant', label: 'Constant / persistent' },
          { value: 'intermittent', label: 'Intermittent / comes & goes' },
          { value: 'paroxysmal', label: 'Paroxysmal / bursts' },
        ]} value={form.hpi.symptomPattern} onSelect={v => set('hpi.symptomPattern', v)} />
      </div>

      {/* Timing & Triggers */}
      <div style={sectionLabel}>Timing & Triggers</div>
      <div style={rowStyle}>
        <TriStateToggle label="Nocturnal / worse at night" value={form.hpi.nocturnalCough} onChange={v => set('hpi.nocturnalCough', v)} />
        <TriStateToggle label="Exercise-triggered" value={form.hpi.exerciseTriggered} onChange={v => set('hpi.exerciseTriggered', v)} />
        <TriStateToggle label="Post-tussive vomiting" value={form.hpi.postTussiveVomiting} onChange={v => set('hpi.postTussiveVomiting', v)} />
        <BoolToggle label="Worse when lying flat" value={!!form.hpi.orthopnea} onToggle={v => set('hpi.orthopnea', v)} />
        <BoolToggle label="Cold air triggers" value={false} onToggle={() => {}} />
        <TriStateToggle label="Allergen-triggered" value={form.hpi.allergenTrigger} onChange={v => set('hpi.allergenTrigger', v)} />
      </div>

      {/* Productive cough → sputum description */}
      {form.hpi.coughChar === 'productive' && (
        <div style={{ marginTop: 6 }}>
          <TextArea label="Sputum Description"
            placeholder="Colour (white/yellow/green/rust), consistency (watery/thick/frothy), amount (scanty/moderate/copious), odour, time of day most produced"
            value={form.hpi.sputumDetail || ''}
            onChange={v => set('hpi.sputumDetail', v)} />
        </div>
      )}

      {/* Hemoptysis alert */}
      {form.hpi.coughChar === 'blood_stained' && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fce8e6', borderRadius: 8, fontSize: 11, color: '#c5221f', fontWeight: 600 }}>
          {'\u26A0'} HAEMOPTYSIS — urgent evaluation required. Consider TB, bronchiectasis, foreign body, pulmonary haemorrhage.
        </div>
      )}

      {/* Pertinent Negatives */}
      <div style={negBoxStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pertinent Negatives</div>
        <div style={{ lineHeight: 1.8, fontSize: 11 }}>
          {form.hpi.coughChar !== 'barking' && <span>{'\u2713'} No barking quality </span>}
          {!form.hpi.suddenOnset && <span>{'\u2713'} No choking / sudden onset </span>}
          {form.hpi.coughChar !== 'whooping' && !form.hpi.postTussiveVomiting && <span>{'\u2713'} No paroxysms / whoop </span>}
          {form.hpi.coughDuration !== 'chronic' && form.hpi.coughDuration !== 'subacute' && form.hpi.coughDuration !== '>=14_days' && (
            <span>{'\u2713'} Acute duration </span>
          )}
          {!form.hpi.nocturnalCough && <span>{'\u2713'} Not nocturnal </span>}
          {!form.hpi.allergenTrigger && !form.hpi.exerciseTriggered && <span>{'\u2713'} No allergic/exercise triggers </span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WHEEZE — full SOCRATES characterisation
// ═══════════════════════════════════════════════════════════════════════════

function WheezeFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      {/* Episode Pattern (Onset + Pattern) */}
      <PillSelect label="Episode Pattern" options={[
        { value: 'first', label: 'First-ever episode' },
        { value: 'recurrent', label: 'Recurrent episodes' },
        { value: 'persistent', label: 'Persistent / Continuous' },
      ]} value={form.hpi.wheezePattern} onSelect={v => set('hpi.wheezePattern', v)} />

      {/* Severity & Laterality */}
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild / end-expiratory only' },
          { value: 'moderate', label: 'Moderate / audible without stethoscope' },
          { value: 'severe', label: 'Severe / audible at distance / distress' },
        ]} value={form.hpi.wheezeSeverity} onSelect={v => set('hpi.wheezeSeverity', v)} />
        <PillSelect label="Laterality" options={[
          { value: 'bilateral', label: 'Bilateral / Diffuse' },
          { value: 'unilateral', label: 'Unilateral (one side)' },
        ]} value={form.hpi.unilateralWheeze ? 'unilateral' : 'bilateral'} onSelect={v => set('hpi.unilateralWheeze', v === 'unilateral')} />
      </div>

      {/* Diurnal Variation */}
      <PillSelect label="Diurnal Variation" options={[
        { value: 'constant', label: 'No variation / Constant' },
        { value: 'morning', label: 'Worse in early morning' },
        { value: 'night', label: 'Worse at night' },
      ]} value={form.hpi.wheezeDiurnal} onSelect={v => set('hpi.wheezeDiurnal', v)} />

      {/* Triggers */}
      <div style={sectionLabel}>Triggers</div>
      <div style={rowStyle}>
        <TriStateToggle label="Exercise" value={form.hpi.exerciseTriggered} onChange={v => set('hpi.exerciseTriggered', v)} />
        <TriStateToggle label="Allergens (dust, pollen, pets)" value={form.hpi.allergenTrigger} onChange={v => set('hpi.allergenTrigger', v)} />
        <BoolToggle label="Cold air" value={!!form.hpi.orthopnea} onToggle={v => set('hpi.orthopnea', v)} />
        <BoolToggle label="Viral URTI" value={!!form.hpi.recentURTI} onToggle={v => set('hpi.recentURTI', v)} />
        <BoolToggle label="Emotions / crying / laughing" value={false} onToggle={() => {}} />
      </div>

      {/* Atopic & Asthma Background */}
      <div style={sectionLabel}>Atopic & Asthma Background</div>
      <div style={rowStyle}>
        <BoolToggle label="Known eczema / dermatitis" value={false} onToggle={() => {}} />
        <BoolToggle label="Known asthma diagnosis" value={!!form.pmh.asthmaDx} onToggle={v => set('pmh.asthmaDx', v)} />
        <BoolToggle label="Previous similar episodes" value={form.hpi.wheezePattern === 'recurrent'} onToggle={() => set('hpi.wheezePattern', form.hpi.wheezePattern === 'recurrent' ? 'first' : 'recurrent')} />
        <BoolToggle label="Family hx asthma" value={!!form.family.asthmaFamily} onToggle={v => set('family.asthmaFamily', v)} />
        <BoolToggle label="Family hx atopy / allergies" value={!!form.family.atopyFamily} onToggle={v => set('family.atopyFamily', v)} />
      </div>

      {/* Pertinent Negatives */}
      <div style={negBoxStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pertinent Negatives</div>
        <div style={{ lineHeight: 1.8, fontSize: 11 }}>
          {!form.hpi.unilateralWheeze && <span>{'\u2713'} Bilateral / diffuse </span>}
          {form.hpi.wheezePattern !== 'recurrent' && !form.family.atopyFamily && !form.family.asthmaFamily && (
            <span>{'\u2713'} No recurrent / atopy / family asthma </span>
          )}
          {!form.hpi.exerciseTriggered && <span>{'\u2713'} No exercise trigger </span>}
          {!form.hpi.nocturnalCough && !form.hpi.wheezeDiurnal?.includes('night') && <span>{'\u2713'} Not nocturnal </span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DIFFICULTY BREATHING — full SOCRATES characterisation
// ═══════════════════════════════════════════════════════════════════════════

function DyspneaFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      {/* Site - implied by symptom name */}
      {/* Onset */}
      <PillSelect label="Onset" options={[
        { value: '', label: '— Not asked' },
        { value: 'sudden', label: 'Sudden / Acute' },
        { value: 'gradual', label: 'Gradual / Progressive' },
      ]} value={form.hpi.suddenOnset === undefined ? '' : form.hpi.suddenOnset ? 'sudden' : 'gradual'} onSelect={v => set('hpi.suddenOnset', v === '' ? undefined : v === 'sudden')} />

      {/* Pattern & Severity */}
      <div style={gridStyle}>
        <PillSelect label="Breathing Pattern" options={[
          { value: 'constant', label: 'Constant / persistent' },
          { value: 'episodic', label: 'Episodic / comes & goes' },
          { value: 'progressive', label: 'Progressive / worsening' },
        ]} value={form.hpi.dyspneaPattern} onSelect={v => set('hpi.dyspneaPattern', v)} />
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild / only on exertion' },
          { value: 'moderate', label: 'Moderate / at rest' },
          { value: 'severe', label: 'Severe / distress at rest' },
        ]} value={form.hpi.symptomSeverity} onSelect={v => set('hpi.symptomSeverity', v)} />
      </div>

      {/* Character — Signs of Respiratory Distress */}
      <div style={sectionLabel}>Character — Signs of Respiratory Distress</div>
      <div style={rowStyle}>
        <BoolToggle label="Chest indrawing" value={!!form.hpi.chestIndrawing} onToggle={v => set('hpi.chestIndrawing', v)} warn />
        <BoolToggle label="Nasal flaring" value={!!form.hpi.nasalFlaring} onToggle={v => set('hpi.nasalFlaring', v)} warn />
        <BoolToggle label="Expiratory grunting" value={!!form.hpi.grunting} onToggle={v => set('hpi.grunting', v)} warn />
        <BoolToggle label="Head bobbing" value={!!form.hpi.headBobbing} onToggle={v => set('hpi.headBobbing', v)} warn />
        <BoolToggle label="Audible wheeze" value={!!form.hpi.stridor} onToggle={v => set('hpi.stridor', v)} warn />
        <BoolToggle label="Tracheal tug" value={false} onToggle={() => {}} />
      </div>

      {/* Associated Features — Impact on Feeding */}
      <div style={sectionLabel}>Associated — Impact on Feeding</div>
      <div style={rowStyle}>
        <TriStateToggle label="Tires easily while feeding" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} warn />
        <BoolToggle label="Needs frequent breaks / pauses" value={!!form.hpi.feedingDiff} onToggle={() => {}} />
        <BoolToggle label="Cannot feed / stops due to breathlessness" value={!!form.hpi.feedingDiff} onToggle={() => {}} />
        <TriStateToggle label="Sweating during feeds" value={form.hpi.sweatingFeeds} onChange={v => set('hpi.sweatingFeeds', v)} warn />
      </div>

      {/* Associated — Other */}
      <div style={sectionLabel}>Associated — Other Features</div>
      <div style={rowStyle}>
        <TriStateToggle label="Cyanotic episodes" value={form.hpi.cyanoticEpisodes} onChange={v => set('hpi.cyanoticEpisodes', v)} warn />
        <BoolToggle label="Worse when lying flat (orthopnoea)" value={!!form.hpi.orthopnea} onToggle={v => set('hpi.orthopnea', v)} />
        <BoolToggle label="Paroxysmal nocturnal dyspnoea" value={!!form.hpi.pnd} onToggle={v => set('hpi.pnd', v)} />
        <BoolToggle label="Lethargy / reduced activity" value={!!form.ros.lethargyRos} onToggle={v => set('ros.lethargyRos', v)} />
      </div>

      {/* Airway Red Flags */}
      <div style={{ borderTop: '1px solid #e8eaed', marginTop: 10, paddingTop: 10 }}>
        <div style={sectionLabel}>{'\u26A0\uFE0F'} Upper Airway Obstruction Red Flags</div>
        <div style={rowStyle}>
          <TriStateToggle label="Drooling / unable to swallow" value={form.hpi.drooling} onChange={v => set('hpi.drooling', v)} warn />
          <TriStateToggle label="Tripod / sniffing position" value={form.hpi.tripodPosition} onChange={v => set('hpi.tripodPosition', v)} warn />
          <BoolToggle label="Muffled voice / hoarseness" value={!!form.hpi.hoarseness} onToggle={v => set('hpi.hoarseness', v)} warn />
          <BoolToggle label="Stridor at rest" value={!!form.hpi.stridor} onToggle={v => set('hpi.stridor', v)} warn />
        </div>
      </div>

      {/* Pertinent Negatives */}
      <div style={negBoxStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pertinent Negatives by Differential</div>
        <div style={{ lineHeight: 1.8, fontSize: 11 }}>
          {!form.complaints.includes('wheeze') && <span>{'\u2713'} No wheeze </span>}
          {!form.complaints.includes('stridor') && form.hpi.coughChar !== 'barking' && <span>{'\u2713'} No stridor / barking </span>}
          {!form.hpi.drooling && !form.hpi.tripodPosition && <span>{'\u2713'} No drooling / tripod </span>}
          {!form.hpi.suddenOnset && <span>{'\u2713'} Gradual onset </span>}
          {!form.hpi.sweatingFeeds && !form.hpi.orthopnea && <span>{'\u2713'} No sweating feeds / orthopnoea </span>}
          {!form.hpi.cyanoticEpisodes && <span>{'\u2713'} No cyanosis </span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STRIDOR — full SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function StridorFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      {/* Character — Phase */}
      <PillSelect label="Phase (Character)" options={[
        { value: 'inspiratory', label: 'Inspiratory' },
        { value: 'biphasic', label: 'Biphasic (inspiratory + expiratory)' },
        { value: 'expiratory', label: 'Expiratory' },
      ]} value={form.hpi.stridorType} onSelect={v => set('hpi.stridorType', v)} />

      <div style={gridStyle}>
        <PillSelect label="Onset" options={[
          { value: '', label: '— Not asked' },
          { value: 'sudden', label: 'Sudden' },
          { value: 'gradual', label: 'Gradual' },
        ]} value={form.hpi.suddenOnset === undefined ? '' : form.hpi.suddenOnset ? 'sudden' : 'gradual'} onSelect={v => set('hpi.suddenOnset', v === '' ? undefined : v === 'sudden')} />
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild / only with agitation' },
          { value: 'moderate', label: 'Moderate / audible at rest' },
          { value: 'severe', label: 'Severe / with distress' },
        ]} value={form.hpi.stridorSeverity} onSelect={v => set('hpi.stridorSeverity', v)} />
      </div>

      {/* Associated Features */}
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Barking cough" value={form.hpi.coughChar === 'barking'} onToggle={v => set('hpi.coughChar', v ? 'barking' : '')} />
        <BoolToggle label="Hoarseness / muffled voice" value={!!form.hpi.hoarseness} onToggle={v => set('hpi.hoarseness', v)} />
        <TriStateToggle label="Drooling / unable to swallow" value={form.hpi.drooling} onChange={v => set('hpi.drooling', v)} warn />
        <TriStateToggle label="Tripod / sniffing position" value={form.hpi.tripodPosition} onChange={v => set('hpi.tripodPosition', v)} warn />
        <BoolToggle label="Chest indrawing" value={!!form.hpi.chestIndrawing} onToggle={v => set('hpi.chestIndrawing', v)} warn />
        <BoolToggle label="Fever" value={form.complaints.includes('fever') || !!form.hpi.highFever} onToggle={() => {}} />
      </div>

      {/* Worsening Factors */}
      <TextArea label="What makes it worse?"
        placeholder="Crying, agitation, feeding, lying flat, time of day"
        value={form.hpi.exacerbating || ''}
        onChange={v => set('hpi.exacerbating', v)} />

      {/* Epiglottitis Alert */}
      {form.hpi.drooling && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fce8e6', borderRadius: 8, fontSize: 11, color: '#c5221f', fontWeight: 600 }}>
          {'\u26A0'} DROOLING PRESENT — suspect epiglottitis. Do NOT examine the throat. Prepare for airway assessment.
        </div>
      )}

      {/* Pertinent Negatives */}
      <div style={negBoxStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pertinent Negatives</div>
        <div style={{ lineHeight: 1.8, fontSize: 11 }}>
          {!form.hpi.drooling && <span>{'\u2713'} No drooling </span>}
          {!form.hpi.suddenOnset && <span>{'\u2713'} Gradual onset </span>}
          {form.hpi.coughChar !== 'barking' && <span>{'\u2713'} No barking cough </span>}
          {!form.hpi.tripodPosition && <span>{'\u2713'} No tripod posture </span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHEST PAIN — full SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function ChestPainFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      {/* Site */}
      <div style={sectionLabel}>Site (Location)</div>
      <div style={rowStyle}>
        <BoolToggle label="Central / retrosternal" value={false} onToggle={() => {}} />
        <BoolToggle label="Left chest" value={false} onToggle={() => {}} />
        <BoolToggle label="Right chest" value={false} onToggle={() => {}} />
        <BoolToggle label="Diffuse / whole chest" value={false} onToggle={() => {}} />
      </div>

      {/* Onset */}
      <PillSelect label="Onset" options={[
        { value: '', label: '— Not asked' },
        { value: 'sudden', label: 'Sudden / Acute' },
        { value: 'gradual', label: 'Gradual' },
      ]} value={form.hpi.suddenOnset === undefined ? '' : form.hpi.suddenOnset ? 'sudden' : 'gradual'} onSelect={v => set('hpi.suddenOnset', v === '' ? undefined : v === 'sudden')} />

      {/* Character */}
      <PillSelect label="Character" options={[
        { value: 'pleuritic', label: 'Pleuritic (worse with breathing)' },
        { value: 'sharp', label: 'Sharp / stabbing' },
        { value: 'dull', label: 'Dull / aching' },
        { value: 'pressing', label: 'Pressing / squeezing' },
        { value: 'burning', label: 'Burning' },
      ]} value={form.hpi.pleuriticPain ? 'pleuritic' : ''} onSelect={v => set('hpi.pleuriticPain', v === 'pleuritic')} />

      {/* Severity & Pattern */}
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'severe', label: 'Severe' },
        ]} value={form.hpi.chestPainSeverity} onSelect={v => set('hpi.chestPainSeverity', v)} />
        <PillSelect label="Pattern" options={[
          { value: 'constant', label: 'Constant' },
          { value: 'intermittent', label: 'Intermittent' },
        ]} value={form.hpi.symptomPattern} onSelect={v => set('hpi.symptomPattern', v)} />
      </div>

      {/* Radiation */}
      <div style={sectionLabel}>Radiation</div>
      <div style={rowStyle}>
        <BoolToggle label="To back" value={false} onToggle={() => {}} />
        <BoolToggle label="To shoulder / arm" value={false} onToggle={() => {}} />
        <BoolToggle label="To neck / jaw" value={false} onToggle={() => {}} />
        <BoolToggle label="No radiation" value={false} onToggle={() => {}} />
      </div>

      {/* Associated Features */}
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Cough" value={form.complaints.includes('cough')} onToggle={() => {}} />
        <BoolToggle label="Fever" value={form.complaints.includes('fever')} onToggle={() => {}} />
        <BoolToggle label="Difficulty breathing" value={form.complaints.includes('difficulty_breathing')} onToggle={() => {}} />
        <BoolToggle label="Palpitations" value={!!form.ros.palpitations} onToggle={v => set('ros.palpitations', v)} />
        <BoolToggle label="Dizziness / syncope" value={!!form.ros.dizziness} onToggle={v => set('ros.dizziness', v)} />
      </div>

      {/* Pertinent Negatives */}
      <div style={negBoxStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Pertinent Negatives</div>
        <div style={{ lineHeight: 1.8, fontSize: 11 }}>
          {!form.hpi.suddenOnset && <span>{'\u2713'} Gradual onset </span>}
          {!form.hpi.pleuriticPain && <span>{'\u2713'} Not pleuritic </span>}
          {!form.ros.palpitations && <span>{'\u2713'} No palpitations </span>}
          {!form.ros.dizziness && <span>{'\u2713'} No dizziness </span>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NASAL DISCHARGE — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function NasalDischargeFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Character — Colour" options={[
        { value: 'clear', label: 'Clear / Watery' },
        { value: 'purulent', label: 'Purulent / Green / Yellow' },
        { value: 'bloody', label: 'Blood-stained' },
      ]} value={form.hpi.nasalDischargeColor} onSelect={v => set('hpi.nasalDischargeColor', v)} />
      <div style={gridStyle}>
        <PillSelect label="Consistency" options={[
          { value: 'watery', label: 'Watery / Thin' },
          { value: 'thick', label: 'Thick / Mucus' },
          { value: 'sticky', label: 'Sticky / Adherent' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Amount" options={[
          { value: 'minimal', label: 'Minimal / Scant' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'copious', label: 'Copious / Profuse' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Sneezing" value={false} onToggle={() => {}} />
        <BoolToggle label="Nasal congestion / blockage" value={false} onToggle={() => {}} />
        <BoolToggle label="Recent URTI / coryza prodrome" value={!!form.hpi.recentURTI} onToggle={v => set('hpi.recentURTI', v)} />
        <BoolToggle label="Itchy nose / eyes" value={false} onToggle={() => {}} />
        <BoolToggle label="Fever" value={form.complaints.includes('fever')} onToggle={() => {}} />
      </div>
      <TextArea label="Additional description"
        placeholder="Duration, laterality (one or both nostrils), seasonal pattern"
        value={form.hpi.associated || ''}
        onChange={v => set('hpi.associated', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEMOPTYSIS
// ═══════════════════════════════════════════════════════════════════════════

function HemoptysisFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <TextArea label="Describe the bleeding"
        placeholder="Amount (streaks / teaspoon / cupful), colour (bright red / dark / rust-coloured), frequency"
        value={form.hpi.hemoptysisDetail || ''}
        onChange={v => set('hpi.hemoptysisDetail', v)} />
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <TriStateToggle label="Weight loss (unintentional)" value={form.hpi.weightLoss} onChange={v => set('hpi.weightLoss', v)} warn />
        <TriStateToggle label="Night sweats" value={form.hpi.nightSweats} onChange={v => set('hpi.nightSweats', v)} warn />
        <TriStateToggle label="TB contact" value={form.hpi.tbContact} onChange={v => set('hpi.tbContact', v)} warn />
      </div>
      <div style={{ marginTop: 8, padding: '8px 12px', background: '#fce8e6', borderRadius: 8, fontSize: 11, color: '#c5221f', fontWeight: 600 }}>
        \u26A0 HAEMOPTYSIS — consider TB, bronchiectasis, pulmonary haemorrhage, foreign body. Urgent evaluation needed.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOISY BREATHING — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function NoisyBreathingFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Character — What does it sound like?" options={[
        { value: 'snoring', label: 'Snoring / Rattling' },
        { value: 'musical', label: 'Musical / Whistling' },
        { value: 'gurgling', label: 'Gurgling / Bubbly' },
        { value: 'stridor', label: 'Stridor / Harsh' },
      ]} value={''} onSelect={() => {}} />
      <div style={gridStyle}>
        <PillSelect label="Phase" options={[
          { value: 'inspiratory', label: 'Mainly on breathing in' },
          { value: 'expiratory', label: 'Mainly on breathing out' },
          { value: 'both', label: 'Both phases' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Audibility" options={[
          { value: 'close', label: 'Audible close to chest' },
          { value: 'distance', label: 'Audible at distance' },
          { value: 'variable', label: 'Variable' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Positional Variation</div>
      <div style={rowStyle}>
        <BoolToggle label="Worse when lying flat" value={!!form.hpi.orthopnea} onToggle={v => set('hpi.orthopnea', v)} />
        <BoolToggle label="Better when sitting up" value={false} onToggle={() => {}} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CYANOSIS — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function CyanosisFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Location" options={[
        { value: 'perioral', label: 'Around lips / perioral' },
        { value: 'acral', label: 'Fingers / toes / acral' },
        { value: 'generalised', label: 'Generalised / whole body' },
      ]} value={form.hpi.cyanosisLocation} onSelect={v => set('hpi.cyanosisLocation', v)} />
      <PillSelect label="Context (when does it occur?)" options={[
        { value: 'crying', label: 'During crying' },
        { value: 'feeding', label: 'During feeding' },
        { value: 'coughing', label: 'During coughing fits' },
        { value: 'rest', label: 'At rest / persistent' },
      ]} value={form.hpi.cyanosisContext} onSelect={v => set('hpi.cyanosisContext', v)} />
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <TriStateToggle label="Feeding difficulty" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} />
        <TriStateToggle label="Sweating during feeds" value={form.hpi.sweatingFeeds} onChange={v => set('hpi.sweatingFeeds', v)} warn />
        <BoolToggle label="Tachypnoea / fast breathing" value={false} onToggle={() => {}} />
        <BoolToggle label="Clubbing" value={!!form.vitals.clubbingExam} onToggle={v => set('vitals.clubbingExam', v)} warn />
        <TriStateToggle label="Poor weight gain" value={form.hpi.weightLoss} onChange={v => set('hpi.weightLoss', v)} />
      </div>
      <div style={{ marginTop: 8, padding: '8px 12px', background: '#fce8e6', borderRadius: 8, fontSize: 11, color: '#c5221f', fontWeight: 600 }}>
        {'\u26A0'} CYANOSIS — red flag. Indicates significant hypoxia. Urgent assessment and oxygen therapy needed. Consider congenital heart disease.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FAST BREATHING — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function FastBreathingFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Pattern" options={[
        { value: 'constant', label: 'Persistent / Constant' },
        { value: 'intermittent', label: 'Intermittent / Comes & Goes' },
        { value: 'progressive', label: 'Progressive / Worsening' },
      ]} value={form.hpi.dyspneaPattern} onSelect={v => set('hpi.dyspneaPattern', v)} />
      <div style={sectionLabel}>Associated Signs of Distress</div>
      <div style={rowStyle}>
        <BoolToggle label="Chest indrawing" value={!!form.hpi.chestIndrawing} onToggle={v => set('hpi.chestIndrawing', v)} warn />
        <BoolToggle label="Nasal flaring" value={!!form.hpi.nasalFlaring} onToggle={v => set('hpi.nasalFlaring', v)} warn />
        <BoolToggle label="Grunting" value={!!form.hpi.grunting} onToggle={v => set('hpi.grunting', v)} warn />
        <BoolToggle label="Head bobbing" value={!!form.hpi.headBobbing} onToggle={v => set('hpi.headBobbing', v)} warn />
      </div>
      <TextArea label="Describe the breathing"
        placeholder="Caregiver's description: 'chest moving fast', 'panting like a dog', 'can't count the breaths'"
        value={form.hpi.exacerbating || ''}
        onChange={v => set('hpi.exacerbating', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LETHARGY — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function LethargyFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Degree (Severity)" options={[
        { value: 'mild', label: 'Mild / Sleepy but arousable' },
        { value: 'moderate', label: 'Moderate / Less playful / Sleeping more' },
        { value: 'severe', label: 'Severe / Difficult to wake / Unconscious' },
      ]} value={form.hpi.lethargyDegree} onSelect={v => set('hpi.lethargyDegree', v)} />

      <PillSelect label="Onset & Pattern" options={[
        { value: 'gradual', label: 'Gradual / Progressive over days' },
        { value: 'sudden', label: 'Sudden / Acute change' },
        { value: 'fluctuating', label: 'Fluctuating / Comes & Goes' },
      ]} value={''} onSelect={() => {}} />

      <TextArea label="Describe the change in activity level"
        placeholder={`e.g. "Sleeping more than usual - normally wakes every 2h but now sleeps 6h straight", "Not interested in toys", "Just wants to be held", "Doesn't recognise parents"`}
        value={form.hpi.lethargyDetail || ''}
        onChange={v => set('hpi.lethargyDetail', v)} />

      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <TriStateToggle label="Not feeding / poor feeding" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} warn />
        <BoolToggle label="Difficult to wake / unconscious" value={!!form.hpi.seizureHPI} onToggle={v => set('hpi.seizureHPI', v)} warn />
        <BoolToggle label="Irritability when awake" value={!!form.hpi.irritability} onToggle={v => set('hpi.irritability', v)} />
        <BoolToggle label="Seizures / convulsions" value={!!form.hpi.seizureHPI} onToggle={v => set('hpi.seizureHPI', v)} warn />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NIGHT SWEATS — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function NightSweatsFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <div style={gridStyle}>
        <PillSelect label="Frequency" options={[
          { value: 'occasional', label: 'Occasional (1-2/week)' },
          { value: 'frequent', label: 'Frequent (3+/week)' },
          { value: 'nightly', label: 'Every night' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild / slight dampness' },
          { value: 'moderate', label: 'Moderate / change clothes' },
          { value: 'severe', label: 'Severe / drenching / change bedding' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <TextArea label="Describe in detail"
        placeholder="When did they start? How often? Drenching? Need to change clothing or bedding? Worse at certain times?"
        value={form.hpi.sweatDetail || ''}
        onChange={v => set('hpi.sweatDetail', v)} />
      <div style={sectionLabel}>Associated TB Screening</div>
      <div style={rowStyle}>
        <TriStateToggle label="Drenching night sweats" value={form.hpi.nightSweats} onChange={v => set('hpi.nightSweats', v)} warn />
        <TriStateToggle label="TB contact in household" value={form.hpi.tbContact} onChange={v => set('hpi.tbContact', v)} warn />
        <BoolToggle label="Chronic cough (>2 weeks)" value={form.hpi.coughDuration === 'chronic' || form.hpi.coughDuration === '>=14_days'} onToggle={() => {}} />
        <TriStateToggle label="Unintentional weight loss" value={form.hpi.weightLoss} onChange={v => set('hpi.weightLoss', v)} warn />
        <BoolToggle label="Prolonged fever" value={!!form.hpi.highFever} onToggle={() => {}} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WEIGHT LOSS — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function WeightLossFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <div style={gridStyle}>
        <PillSelect label="Amount" options={[
          { value: 'mild', label: 'Mild (<5% body weight)' },
          { value: 'moderate', label: 'Moderate (5-10%)' },
          { value: 'severe', label: 'Severe (>10%)' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Duration" options={[
          { value: 'weeks', label: 'Over weeks' },
          { value: 'months', label: 'Over months' },
          { value: 'acute', label: 'Recent / this illness' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <TextArea label="Describe the weight change"
        placeholder="How much weight loss? Over what period? Confirmed by weighing? Clothes fitting differently? Caregiver concern?"
        value={form.hpi.weightLossDetail || ''}
        onChange={v => set('hpi.weightLossDetail', v)} />
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <TriStateToggle label="Poor appetite / not eating well" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} />
        <TriStateToggle label="Night sweats" value={form.hpi.nightSweats} onChange={v => set('hpi.nightSweats', v)} warn />
        <BoolToggle label="Chronic cough" value={form.hpi.coughDuration === 'chronic' || form.hpi.coughDuration === '>=14_days'} onToggle={() => {}} />
        <TriStateToggle label="TB contact in household" value={form.hpi.tbContact} onChange={v => set('hpi.tbContact', v)} warn />
        <BoolToggle label="Prolonged fever" value={!!form.hpi.highFever} onToggle={() => {}} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SORE THROAT — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function SoreThroatFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <div style={sectionLabel}>Character — Pain Description</div>
      <div style={rowStyle}>
        <BoolToggle label="Sharp / burning" value={false} onToggle={() => {}} />
        <BoolToggle label="Scratchy / raw" value={false} onToggle={() => {}} />
        <BoolToggle label="Constant ache" value={false} onToggle={() => {}} />
      </div>
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'severe', label: 'Severe' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Onset" options={[
          { value: 'gradual', label: 'Gradual' },
          { value: 'sudden', label: 'Sudden' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Difficulty / pain on swallowing" value={!!form.hpi.drooling} onToggle={v => set('hpi.drooling', v)} warn />
        <BoolToggle label="Hoarseness / voice change" value={!!form.hpi.hoarseness} onToggle={v => set('hpi.hoarseness', v)} />
        <BoolToggle label="Nasal discharge / congestion" value={form.complaints.includes('nasal_discharge') || !!form.hpi.recentURTI} onToggle={() => {}} />
        <BoolToggle label="Cough" value={form.complaints.includes('cough')} onToggle={() => {}} />
        <BoolToggle label="Fever" value={form.complaints.includes('fever')} onToggle={() => {}} />
      </div>
      <TextArea label="Additional description"
        placeholder="Worse with swallowing, better with cold drinks, associated ear pain?"
        value={form.hpi.exacerbating || ''}
        onChange={v => set('hpi.exacerbating', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHEST TIGHTNESS — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function ChestTightnessFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild / noticeable' },
          { value: 'moderate', label: 'Moderate / uncomfortable' },
          { value: 'severe', label: 'Severe / distressing' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Pattern" options={[
          { value: 'constant', label: 'Constant' },
          { value: 'intermittent', label: 'Intermittent / episodic' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Triggers</div>
      <div style={rowStyle}>
        <TriStateToggle label="Exercise-induced" value={form.hpi.exerciseTriggered} onChange={v => set('hpi.exerciseTriggered', v)} />
        <BoolToggle label="Associated with wheeze" value={form.complaints.includes('wheeze') || !!form.hpi.allergenTrigger} onToggle={() => {}} />
        <BoolToggle label="Cold air" value={false} onToggle={() => {}} />
        <TriStateToggle label="Allergens" value={form.hpi.allergenTrigger} onChange={v => set('hpi.allergenTrigger', v)} />
        <BoolToggle label="Worse when lying flat" value={!!form.hpi.orthopnea} onToggle={v => set('hpi.orthopnea', v)} />
      </div>
      <TextArea label="Additional description"
        placeholder="Location (central/diffuse), what brings it on, what relieves it"
        value={form.hpi.exacerbating || ''}
        onChange={v => set('hpi.exacerbating', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RASH — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function RashFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Character — Appearance" options={[
        { value: 'maculopapular', label: 'Maculopapular / Flat red spots' },
        { value: 'vesicular', label: 'Vesicular / Blistering' },
        { value: 'urticarial', label: 'Urticarial / Hives / Wheals' },
        { value: 'petechial', label: 'Petechial / Tiny red dots' },
        { value: 'purpuric', label: 'Purpuric / Bruise-like' },
        { value: 'scaly', label: 'Scaly / Dry patches' },
      ]} value={''} onSelect={() => {}} />
      <div style={gridStyle}>
        <PillSelect label="Distribution" options={[
          { value: 'localised', label: 'Localised (one area)' },
          { value: 'generalised', label: 'Generalised / whole body' },
          { value: 'central', label: 'Central (trunk first)' },
          { value: 'extremities', label: 'Extremities / limbs' },
        ]} value={''} onSelect={() => {}} />
        <PillSelect label="Onset" options={[
          { value: 'sudden', label: 'Sudden' },
          { value: 'gradual', label: 'Gradual / spread over days' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Itchy" value={!!form.hpi.urticaria} onToggle={v => set('hpi.urticaria', v)} />
        <BoolToggle label="Associated with fever" value={form.complaints.includes('fever') || !!form.hpi.highFever} onToggle={() => {}} />
        <BoolToggle label="Blistering / fluid-filled" value={false} onToggle={() => {}} />
        <BoolToggle label="Painful to touch" value={false} onToggle={() => {}} />
      </div>
      <TextArea label="Describe the rash in detail"
        placeholder="Where did it start? How did it spread? Colour? Any medication before rash?"
        value={form.hpi.rashDetail || ''}
        onChange={v => set('hpi.rashDetail', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EAR PAIN — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function EarPainFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Laterality" options={[
        { value: 'left', label: 'Left ear' },
        { value: 'right', label: 'Right ear' },
        { value: 'bilateral', label: 'Both ears' },
      ]} value={''} onSelect={() => {}} />
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'severe', label: 'Severe' },
        ]} value={form.hpi.earPainSeverity} onSelect={v => set('hpi.earPainSeverity', v)} />
        <PillSelect label="Character" options={[
          { value: 'sharp', label: 'Sharp / Stabbing' },
          { value: 'dull', label: 'Dull / Aching' },
          { value: 'pulling', label: 'Pulling / Tugging sensation' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Ear discharge / pus" value={!!form.ros.earDischarge} onToggle={v => set('ros.earDischarge', v)} />
        <BoolToggle label="Tugging at ear" value={false} onToggle={() => {}} />
        <BoolToggle label="Hearing change / reduced" value={false} onToggle={() => {}} />
        <BoolToggle label="Fever" value={form.complaints.includes('fever') || !!form.hpi.highFever} onToggle={() => {}} />
        <BoolToggle label="Nasal discharge / congestion" value={form.complaints.includes('nasal_discharge')} onToggle={() => {}} />
      </div>
      <TextArea label="Additional description"
        placeholder="Which ear? Pain pattern, onset, preceding URTI?"
        value={form.hpi.sickContactDetail || ''}
        onChange={v => set('hpi.sickContactDetail', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABDOMINAL PAIN — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function AbdominalPainFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Site (Location)" options={[
        { value: 'epigastric', label: 'Upper abdomen (epigastric)' },
        { value: 'periumbilical', label: 'Around belly button' },
        { value: 'hypogastric', label: 'Lower abdomen (suprapubic)' },
        { value: 'right_upper', label: 'Right upper quadrant' },
        { value: 'left_upper', label: 'Left upper quadrant' },
        { value: 'generalised', label: 'Generalised / whole abdomen' },
      ]} value={''} onSelect={() => {}} />
      <div style={gridStyle}>
        <PillSelect label="Severity" options={[
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'severe', label: 'Severe' },
        ]} value={form.hpi.abdominalPainSeverity} onSelect={v => set('hpi.abdominalPainSeverity', v)} />
        <PillSelect label="Character" options={[
          { value: 'colicky', label: 'Colicky / Cramping' },
          { value: 'constant', label: 'Constant / Steady' },
          { value: 'burning', label: 'Burning' },
          { value: 'sharp', label: 'Sharp / Stabbing' },
        ]} value={''} onSelect={() => {}} />
      </div>
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <BoolToggle label="Vomiting (associated)" value={!!form.hpi.vomitingHPI} onToggle={v => set('hpi.vomitingHPI', v)} />
        <BoolToggle label="Diarrhoea" value={!!form.hpi.diarrheaHPI} onToggle={v => set('hpi.diarrheaHPI', v)} />
        <BoolToggle label="Fever" value={form.complaints.includes('fever')} onToggle={() => {}} />
        <BoolToggle label="Distension / bloating" value={false} onToggle={() => {}} />
      </div>
      <TextArea label="Additional description"
        placeholder="Relation to meals, radiation, what brings it on, what relieves it"
        value={form.hpi.sickContactDetail || ''}
        onChange={v => set('hpi.sickContactDetail', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REDUCED FEEDING — SOCRATES
// ═══════════════════════════════════════════════════════════════════════════

function ReducedFeedingFields({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div>
      <PillSelect label="Severity of Reduction" options={[
        { value: 'mild', label: 'Mild / taking most feeds' },
        { value: 'moderate', label: 'Moderate / taking about half' },
        { value: 'severe', label: 'Severe / taking very little or nothing' },
      ]} value={''} onSelect={() => {}} />
      <div style={sectionLabel}>Feeding Pattern & Character</div>
      <div style={rowStyle}>
        <TriStateToggle label="Tires easily / stops frequently" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} warn />
        <BoolToggle label="Refuses / pushes bottle/breast away" value={!!form.hpi.feedingDiff} onToggle={() => {}} />
        <BoolToggle label="Vomits / regurgitates after feeding" value={!!form.hpi.vomitingHPI} onToggle={v => set('hpi.vomitingHPI', v)} />
        <TriStateToggle label="Sweating during feeds" value={form.hpi.sweatingFeeds} onChange={v => set('hpi.sweatingFeeds', v)} warn />
        <BoolToggle label="Chokes / coughs during feeds" value={!!form.hpi.feedingCough} onToggle={v => set('hpi.feedingCough', v)} warn />
      </div>
      <div style={sectionLabel}>Associated Features</div>
      <div style={rowStyle}>
        <TriStateToggle label="Weight loss / poor weight gain" value={form.hpi.weightLoss} onChange={v => set('hpi.weightLoss', v)} warn />
        <BoolToggle label="Lethargy / too tired to feed" value={!!form.ros.lethargyRos} onToggle={v => set('ros.lethargyRos', v)} warn />
        <TriStateToggle label="Cyanotic episodes during feeds" value={form.hpi.cyanoticEpisodes} onChange={v => set('hpi.cyanoticEpisodes', v)} warn />
        <BoolToggle label="Reduced urine output / fewer wet nappies" value={!!form.ros.reducedUrine} onToggle={v => set('ros.reducedUrine', v)} warn />
      </div>
      <TextArea label="Describe the feeding difficulty in detail"
        placeholder="What changed? How much less than usual? How long has this been going on? Any specific foods/formula avoided?"
        value={form.hpi.sickContactDetail || ''}
        onChange={v => set('hpi.sickContactDetail', v)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERAL FEATURES (across all symptoms)
// ═══════════════════════════════════════════════════════════════════════════

function GeneralFeaturesCard({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div style={cardStyle}>
      <div style={cardHeader}>{'\uD83D\uDCCB'} General Features &amp; Impact on Daily Life</div>

      <div style={sectionLabel}>Constitutional / General Symptoms</div>
      <div style={rowStyle}>
        <TriStateToggle label="Feeding difficulty / reduced intake" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} warn />
        <BoolToggle label="Lethargy / less playful" value={!!form.ros.lethargyRos} onToggle={v => set('ros.lethargyRos', v)} />
        <BoolToggle label="Irritability / fussiness" value={!!form.hpi.irritability} onToggle={v => set('hpi.irritability', v)} />
        <TriStateToggle label="Cyanotic episodes" value={form.hpi.cyanoticEpisodes} onChange={v => set('hpi.cyanoticEpisodes', v)} warn />
        <BoolToggle label="Seizures / convulsions" value={!!form.hpi.seizureHPI} onToggle={v => set('hpi.seizureHPI', v)} warn />
      </div>

      <div style={sectionLabel}>Gastrointestinal</div>
      <div style={rowStyle}>
        <BoolToggle label="Vomiting (persistent)" value={!!form.hpi.vomitingHPI} onToggle={v => set('hpi.vomitingHPI', v)} />
        <BoolToggle label="Diarrhoea" value={!!form.hpi.diarrheaHPI} onToggle={v => set('hpi.diarrheaHPI', v)} />
      </div>

      <div style={{ borderTop: '1px solid #e8eaed', marginTop: 12, paddingTop: 12 }}>
        <TextArea label="Progression & Evolution Over Time (Overall)"
          placeholder="How has the illness evolved overall? Worsening, improving, fluctuating? Stepwise progression? Describe the overall timeline."
          value={form.hpi.timeCourse || ''}
          onChange={v => set('hpi.timeCourse', v)} />
      </div>

      <div style={{ marginTop: 10 }}>
        <TextArea label="Other relevant symptoms not listed above"
          placeholder="Any other symptoms the caregiver mentioned?"
          value={form.hpi.associated || ''}
          onChange={v => set('hpi.associated', v)} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTHCARE-SEEKING & LIFE IMPACT
// ═══════════════════════════════════════════════════════════════════════════

function HealthcareAndImpactCard({ form, set }: { form: PatientForm; set: (p: string, v: any) => void }) {
  return (
    <div style={cardStyle}>
      <div style={cardHeader}>{'\uD83D\uDC8A'} Healthcare-Seeking Behaviour &amp; Personal Impact</div>

      <div style={gridStyle}>
        <div>
          <TextInput label="What treatment was given?"
            placeholder="e.g. Paracetamol, amoxicillin, salbutamol"
            value={form.hpi.prevTx}
            onChange={v => set('hpi.prevTx', v)} />
        </div>
        <div>
          <div style={sectionLabel}>Response to Treatment</div>
          <div style={rowStyle}>
            {['Improved fully', 'Partially improved', 'No change', 'Worsened', 'Not yet given'].map(opt => (
              <button key={opt}
                style={form.hpi.txResponse === opt.toLowerCase().replace(/\s+/g, '_') ? activeBtn : btnBase}
                onClick={() => set('hpi.txResponse', opt.toLowerCase().replace(/\s+/g, '_'))}>
                {form.hpi.txResponse === opt.toLowerCase().replace(/\s+/g, '_') ? '\u2713 ' : ''}{opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TextArea label="Healthcare-seeking journey (what happened, where, when)"
        placeholder={`e.g. "Day 1: bought Paracetamol from chemist - fever partially improved. Day 3: took to local clinic - given amoxicillin but no improvement. Day 4: referred here."`}
        value={form.hpi.sickContactDetail || ''}
        onChange={v => set('hpi.sickContactDetail', v)} />

      <div style={{ borderTop: '1px solid #e8eaed', marginTop: 12, paddingTop: 12 }}>
        <TextArea label="Impact on daily life — how has this illness affected the child?"
          placeholder={`e.g. "Not sleeping well - up every 2 hours coughing", "Not playing with toys - just wants to be held", "Missing school for 3 days", "Cries constantly"`}
          value={form.hpi.impactNote || ''}
          onChange={v => set('hpi.impactNote', v)} />

        <div style={sectionLabel}>Quick picks — impact areas</div>
        <div style={rowStyle}>
          <BoolToggle label="Poor sleep / night waking" value={false} onToggle={() => {}} />
          <BoolToggle label="Not playing / less active" value={!!form.ros.lethargyRos} onToggle={v => set('ros.lethargyRos', v)} />
          <BoolToggle label="Missed school / daycare" value={!!form.family.schoolAttendance?.toLowerCase().includes('miss')} onToggle={v => set('family.schoolAttendance', v ? 'Missed' : '')} />
          <TriStateToggle label="Reduced appetite" value={form.hpi.feedingDiff} onChange={v => set('hpi.feedingDiff', v)} />
        </div>
      </div>
    </div>
  );
}
