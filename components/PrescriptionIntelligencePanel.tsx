'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/amexan/PrescriptionIntelligencePanel.tsx
// Prescription Intelligence: drug selection, allergy checking, interaction
// matrix, dose calculator, pre-filled instructions, Firestore write
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DRUG_DB,
  checkPrescriptionIntelligence,
  PatientContext,
} from '@/lib/clinicalProtocols';

interface PrescriptionIntelligencePanelProps {
  patient: PatientContext & {
    uid: string;
    name: string;
  };
  doctor: { uid: string; name: string };
  onClose: () => void;
}

const LEVEL_COLOR: Record<string, string> = {
  emergency: '#ef4444',
  urgent:    '#f59e0b',
  watch:     '#06b6d4',
  normal:    '#10d47a',
};

const FREQUENCIES = [
  'OD (once daily)', 'BD (twice daily)', 'TDS (three times daily)',
  'QDS (four times daily)', 'PRN (as needed)', 'Nocte (at night)',
  'Mane (in the morning)', 'Weekly', 'Fortnightly', 'Monthly',
];

const ROUTES = ['Oral', 'Sublingual', 'Topical', 'Inhaled', 'IV', 'IM', 'SC', 'Transdermal', 'Rectal', 'Nasal'];

export default function PrescriptionIntelligencePanel({
  patient,
  doctor,
  onClose,
}: PrescriptionIntelligencePanelProps) {
  return null;
  const [search,       setSearch]       = useState('');
  const [selectedDrug, setSelectedDrug] = useState('');
  const [dose,         setDose]         = useState('');
  const [freq,         setFreq]         = useState('OD (once daily)');
  const [route,        setRoute]        = useState('Oral');
  const [duration,     setDuration]     = useState('');
  const [indication,   setIndication]   = useState('');
  const [instructions, setInstructions] = useState('');
  const [warnings_txt, setWarnings]     = useState('');
  const [refills,      setRefills]      = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [done,         setDone]         = useState(false);

  const filteredDrugs = Object.entries(DRUG_DB).filter(
    ([, d]) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.class.toLowerCase().includes(search.toLowerCase())
  );

  const intel = selectedDrug
    ? checkPrescriptionIntelligence(selectedDrug, patient)
    : null;

  const drug = DRUG_DB[selectedDrug];
  const hasEmergency = intel?.warnings?.some((w) => w.level === 'emergency') ?? false;

  // Auto-fill when drug selected
  useEffect(() => {
    if (!drug) return;
    setDose(drug.doses[0]?.start || '');
    setInstructions(drug.instructions);
    setWarnings(drug.sideEffects.slice(0, 3).join('; '));
    const freqHint = drug.doses[0]?.start || '';
    if (freqHint.includes('BD'))  setFreq('BD (twice daily)');
    else if (freqHint.includes('TDS')) setFreq('TDS (three times daily)');
    else setFreq('OD (once daily)');
  }, [selectedDrug]); // eslint-disable-line react-hooks/exhaustive-deps

  const issue = async () => {
    if (!drug || !dose || hasEmergency) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'prescriptions'), {
        patientId:    patient.uid,
        doctorId:     doctor.uid,
        doctorName:   doctor.name,
        medication:   drug.name,
        drugClass:    drug.class,
        dosage:       dose,
        frequency:    freq,
        route,
        duration:     duration || 'As directed',
        indication,
        instructions: instructions || drug.instructions,
        warnings:     warnings_txt,
        counselling:  drug.counselling,
        monitoring:   drug.monitoring,
        refills,
        active:       true,
        createdAt:    serverTimestamp(),
        startDate:    serverTimestamp(),
      });
      await addDoc(collection(db, 'alerts'), {
        patientId:  patient.uid,
        doctorId:   doctor.uid,
        type:       'prescription',
        title:      `💊 New Prescription: ${drug.name} ${dose}`,
        message:    `Dr. ${doctor.name} prescribed ${drug.name} ${dose} — ${freq}${duration ? ' for ' + duration : ''}. ${instructions}`,
        read:       false,
        createdAt:  serverTimestamp(),
        urgency:    'routine',
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.88)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 580,
          maxWidth: '96vw',
          background: '#0d1520',
          border: '1px solid #2a3d57',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,.6)',
          marginTop: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: '#141f2e',
            padding: '14px 18px',
            borderBottom: '1px solid #1e2d42',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e8edf5', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚕</span> Prescription Intelligence
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
              {patient.name} · {patient.age}y · {patient.weight}kg · eGFR: {patient.labs.egfr || '—'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2a3d57',
              color: '#94a3b8',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '88vh', overflowY: 'auto' }}>

          {done ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10d47a', marginBottom: 6 }}>
                Prescription issued successfully
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
                {patient.name} has been notified. Instructions and monitoring requirements saved to record.
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px',
                  background: 'rgba(16,212,122,.15)',
                  border: '1px solid #10d47a40',
                  borderRadius: 6,
                  color: '#10d47a',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Allergy context bar */}
              {patient.allergies.length > 0 && (
                <div
                  style={{
                    background: 'rgba(239,68,68,.06)',
                    border: '1px solid #ef444422',
                    borderRadius: 6,
                    padding: '7px 10px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#ef4444',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      marginBottom: 4,
                    }}
                  >
                    Documented Allergies — checked before prescribing
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {patient.allergies.map((a) => (
                      <span
                        key={a}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#fca5a5',
                          background: 'rgba(239,68,68,.14)',
                          padding: '2px 7px',
                          borderRadius: 3,
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Drug search */}
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#3a4a5e',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    marginBottom: 6,
                  }}
                >
                  Select Medication
                </div>
                <input
                  autoFocus
                  placeholder="Search drug name or class..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 12,
                    borderRadius: 5,
                    background: '#060b14',
                    border: '1px solid #2a3d57',
                    color: '#e8edf5',
                    marginBottom: 8,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {filteredDrugs.slice(0, 20).map(([id, d]) => (
                    <button
                      key={id}
                      onClick={() => { setSelectedDrug(id); setSearch(''); }}
                      style={{
                        padding: '9px 10px',
                        textAlign: 'left',
                        background: selectedDrug === id ? 'rgba(6,182,212,.12)' : '#141f2e',
                        border: `1px solid ${selectedDrug === id ? '#06b6d4' : '#1e2d42'}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all .14s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: selectedDrug === id ? '#06b6d4' : '#e8edf5' }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: 9, color: '#3a4a5e', marginTop: 1 }}>
                        {d.class.split('(')[0].trim()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intelligence output — renders when drug selected */}
              {selectedDrug && drug && intel && (
                <>
                  {/* Alerts — allergy + contraindications + interactions */}
                  {intel!.warnings.length > 0 && (
                    <div
                      style={{
                        background: hasEmergency ? 'rgba(239,68,68,.07)' : 'rgba(245,158,11,.06)',
                        border: `1px solid ${hasEmergency ? '#ef444430' : '#f59e0b22'}`,
                        borderLeft: `3px solid ${hasEmergency ? '#ef4444' : '#f59e0b'}`,
                        borderRadius: 6,
                        padding: '10px 12px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: hasEmergency ? '#ef4444' : '#f59e0b',
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                          marginBottom: 6,
                        }}
                      >
                        {hasEmergency
                          ? '🚨 Contraindication / Allergy Alert'
                          : '⚠️ Warnings & Interactions'}
                      </div>
                      {intel!.warnings.map((w, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            gap: 8,
                            marginBottom: 4,
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ fontSize: 11, flexShrink: 0 }}>
                            {w.level === 'emergency' ? '🚨' : '⚠️'}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: LEVEL_COLOR[w.level] === '#ef4444' ? '#fca5a5' : '#fcd34d',
                              lineHeight: 1.5,
                            }}
                          >
                            {w.msg}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dose guide */}
                  <div
                    style={{
                      background: '#141f2e',
                      border: '1px solid #1e2d42',
                      borderRadius: 6,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#06b6d4',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        marginBottom: 8,
                      }}
                    >
                      Dose Calculator & Guide
                    </div>
                    {drug.doses.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: 8,
                          paddingBottom: 8,
                          borderBottom: '1px solid #1e2d42',
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
                          {d.indication}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div>
                            <div style={{ fontSize: 9, color: '#3a4a5e' }}>Starting dose</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#10d47a', fontFamily: 'IBM Plex Mono, monospace' }}>
                              {d.start}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, color: '#3a4a5e' }}>Maximum dose</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace' }}>
                              {d.max}
                            </div>
                          </div>
                          {d.renal && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: 9, color: '#3a4a5e' }}>
                                Renal adjustment (eGFR: {patient.labs.egfr || '?'})
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: (patient.labs.egfr || 60) < 30 ? '#ef4444' : '#f59e0b',
                                  marginTop: 1,
                                }}
                              >
                                {d.renal}
                              </div>
                            </div>
                          )}
                          {d.hepatic && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: 9, color: '#3a4a5e' }}>Hepatic adjustment</div>
                              <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 1 }}>{d.hepatic}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {intel!.suggestions.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, fontSize: 10, color: '#06b6d4', marginTop: 3 }}>
                        <span>→</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Prescription form — pre-filled from intelligence */}
                  <div
                    style={{
                      background: '#141f2e',
                      border: '1px solid #1e2d42',
                      borderRadius: 6,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#10d47a',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        marginBottom: 10,
                      }}
                    >
                      Prescription Form — Pre-filled by Intelligence Engine
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                      {[
                        { label: 'Dose *', val: dose, set: setDose, placeholder: 'e.g. 5mg' },
                        { label: 'Indication', val: indication, set: setIndication, placeholder: 'e.g. Hypertension' },
                        { label: 'Duration', val: duration, set: setDuration, placeholder: 'e.g. 30 days, 3 months' },
                        { label: 'Refills', val: String(refills), set: (v: string) => setRefills(Number(v)), placeholder: '0' },
                      ].map(({ label, val, set, placeholder }) => (
                        <div key={label}>
                          <div style={{ fontSize: 9, color: '#3a4a5e', marginBottom: 3 }}>{label}</div>
                          <input
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            placeholder={placeholder}
                            style={{
                              width: '100%',
                              padding: '7px 9px',
                              fontSize: 12,
                              background: '#0d1520',
                              border: '1px solid #2a3d57',
                              borderRadius: 5,
                              color: '#e8edf5',
                              outline: 'none',
                              fontFamily: 'inherit',
                            }}
                          />
                        </div>
                      ))}
                      <div>
                        <div style={{ fontSize: 9, color: '#3a4a5e', marginBottom: 3 }}>Frequency</div>
                        <select
                          value={freq}
                          onChange={(e) => setFreq(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 9px',
                            fontSize: 12,
                            background: '#0d1520',
                            border: '1px solid #2a3d57',
                            borderRadius: 5,
                            color: '#e8edf5',
                            outline: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#3a4a5e', marginBottom: 3 }}>Route</div>
                        <select
                          value={route}
                          onChange={(e) => setRoute(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 9px',
                            fontSize: 12,
                            background: '#0d1520',
                            border: '1px solid #2a3d57',
                            borderRadius: 5,
                            color: '#e8edf5',
                            outline: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          {ROUTES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: 9 }}>
                      <div style={{ fontSize: 9, color: '#3a4a5e', marginBottom: 3 }}>
                        Patient Instructions (pre-filled — edit as needed)
                      </div>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '7px 9px',
                          fontSize: 11,
                          background: '#0d1520',
                          border: '1px solid #2a3d57',
                          borderRadius: 5,
                          color: '#94a3b8',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          lineHeight: 1.6,
                        }}
                      />
                    </div>
                  </div>

                  {/* Monitoring requirements */}
                  <div
                    style={{
                      background: 'rgba(16,212,122,.04)',
                      border: '1px solid #10d47a18',
                      borderRadius: 6,
                      padding: '9px 11px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#10d47a',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        marginBottom: 6,
                      }}
                    >
                      Required Monitoring — will be auto-assigned
                    </div>
                    {drug.monitoring.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                        <span style={{ color: '#10d47a', flexShrink: 0 }}>→</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Side effects + Pregnancy */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div
                      style={{
                        background: '#141f2e',
                        border: '1px solid #1e2d42',
                        borderRadius: 6,
                        padding: '8px 10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#f59e0b',
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          marginBottom: 5,
                        }}
                      >
                        Side Effects
                      </div>
                      {drug.sideEffects.slice(0, 4).map((s, i) => (
                        <div key={i} style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                          · {s}
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        background: '#141f2e',
                        border: `1px solid ${drug.pregnancy.includes('CONTRAINDICATED') ? '#ef444422' : '#1e2d42'}`,
                        borderRadius: 6,
                        padding: '8px 10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: drug.pregnancy.includes('CONTRAINDICATED') ? '#ef4444' : '#a78bfa',
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                          marginBottom: 5,
                        }}
                      >
                        Pregnancy
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: drug.pregnancy.includes('CONTRAINDICATED') ? '#fca5a5' : '#94a3b8',
                          lineHeight: 1.5,
                        }}
                      >
                        {drug.pregnancy}
                      </div>
                    </div>
                  </div>

                  {/* Issue button */}
                  <button
                    onClick={issue}
                    disabled={hasEmergency || !dose || saving}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: hasEmergency
                        ? 'rgba(239,68,68,.08)'
                        : dose
                        ? 'rgba(16,212,122,.12)'
                        : 'transparent',
                      border: `1px solid ${hasEmergency ? '#ef444440' : dose ? '#10d47a40' : '#1e2d42'}`,
                      borderRadius: 6,
                      color: hasEmergency ? '#ef4444' : dose ? '#10d47a' : '#3a4a5e',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: hasEmergency || !dose ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      fontFamily: 'inherit',
                    }}
                  >
                    {saving
                      ? 'Issuing prescription…'
                      : hasEmergency
                      ? '⛔ Cannot Prescribe — Contraindication Active'
                      : dose
                      ? `💊 Issue: ${drug.name} ${dose} ${freq.split(' ')[0]}${duration ? ' · ' + duration : ''}`
                      : 'Enter dose to prescribe'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}