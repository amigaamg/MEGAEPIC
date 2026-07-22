"use client"

import { useClinicalWorkspace } from "../workflow-state"

export function PmhPhase() {
  const { nextPhase, prevPhase } = useClinicalWorkspace()
  const conditions = ["Hypertension", "Type 2 Diabetes Mellitus", "Asthma", "Heart Failure", "COPD", "Chronic Kidney Disease", "Tuberculosis", "HIV", "Cancer", "Stroke", "DVT/PE", "Thyroid Disease"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Past Medical History</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Select known conditions, record medications and allergies.</p>

      <div className="grid grid-cols-2 gap-1.5">
        {conditions.map((c) => (
          <button key={c} className="text-left px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ background: "var(--midnight-800)", color: "var(--slate-300)", border: "1px solid var(--midnight-700)" }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
          <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--slate-300)" }}>Medications</h3>
          <textarea className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" rows={3}
            style={{ background: "var(--midnight-700)", color: "var(--slate-200)", border: "1px solid var(--midnight-600)" }}
            placeholder="List current medications..." />
        </div>
        <div className="rounded-xl p-3 border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
          <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--slate-300)" }}>Allergies</h3>
          <textarea className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" rows={3}
            style={{ background: "var(--midnight-700)", color: "var(--slate-200)", border: "1px solid var(--midnight-600)" }}
            placeholder="Record allergies..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>← Back</button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>Continue to Examination →</button>
      </div>
    </div>
  )
}

export function ExaminationPhase() {
  const { nextPhase, prevPhase } = useClinicalWorkspace()
  const sections = ["General Appearance", "Vital Signs", "Head & Neck", "Cardiovascular", "Respiratory", "Abdominal", "Neurological", "Musculoskeletal", "Skin", "Lymphatics"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Physical Examination</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Record examination findings, system by system.</p>

      <div className="grid grid-cols-2 gap-1.5">
        {sections.map((s) => (
          <button key={s} className="text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--midnight-800)", color: "var(--slate-300)", border: "1px solid var(--midnight-700)" }}>
            {s} →
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>← Back</button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>Continue to Investigations →</button>
      </div>
    </div>
  )
}

export function InvestigationsPhase() {
  const { nextPhase, prevPhase } = useClinicalWorkspace()
  const investigations = ["Full Blood Count", "Urea & Electrolytes", "CRP", "Troponin", "D-Dimer", "Blood Cultures", "Chest X-Ray", "ECG", "CT Scan", "Ultrasound", "Urinalysis", "Blood Gas"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Investigations</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Order and review investigations.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {investigations.map((inv) => (
          <div key={inv} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
            style={{ background: "var(--midnight-800)", color: "var(--slate-300)", border: "1px solid var(--midnight-700)" }}>
            <span>{inv}</span>
            <button className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--accent)", color: "#fff" }}>Order</button>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>← Back</button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>Continue to Diagnosis →</button>
      </div>
    </div>
  )
}

export function DiagnosisPhase() {
  const { nextPhase, prevPhase, differentials, updateDifferential } = useClinicalWorkspace()

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Differential Diagnosis</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Bayesian-ranked differentials based on collected data.</p>

      {differentials.length === 0 ? (
        <div className="rounded-xl p-6 text-center border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-xs" style={{ color: "var(--slate-500)" }}>
            No differentials yet. Complete history and examination to generate.
          </div>
        </div>
      ) : (
        differentials.map((dd) => (
          <div key={dd.diseaseId} className="rounded-xl p-3 border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold" style={{ color: "var(--slate-100)" }}>#{dd.rank} {dd.diseaseName}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{
                background: dd.probability > 70 ? "#dc262620" : dd.probability > 40 ? "#eab30820" : "#22c55e20",
                color: dd.probability > 70 ? "#ef4444" : dd.probability > 40 ? "#eab308" : "#22c55e",
              }}>{dd.probability.toFixed(0)}%</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              <button onClick={() => updateDifferential(dd.diseaseId, { isConfirmed: true })} className="px-2 py-0.5 rounded text-[10px]" style={{ background: "#22c55e20", color: "#4ade80" }}>Confirm</button>
              <button onClick={() => updateDifferential(dd.diseaseId, { isExcluded: true })} className="px-2 py-0.5 rounded text-[10px]" style={{ background: "#ef444420", color: "#f87171" }}>Exclude</button>
            </div>
          </div>
        ))
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>← Back</button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>Continue to Management →</button>
      </div>
    </div>
  )
}

export function ManagementPhase() {
  const { nextPhase, prevPhase } = useClinicalWorkspace()
  const categories = ["Medications", "IV Fluids", "Oxygen Therapy", "Surgical Referral", "Specialist Consult", "Physiotherapy", "Dietary", "Patient Education"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Management Plan</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Treatment orders, referrals, and follow-up plan.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {categories.map((c) => (
          <button key={c} className="text-left px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: "var(--midnight-800)", color: "var(--slate-300)", border: "1px solid var(--midnight-700)" }}>
            {c} →
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>← Back</button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>Continue to Documentation →</button>
      </div>
    </div>
  )
}

export function DocumentationPhase() {
  const { nextPhase, prevPhase, encounter } = useClinicalWorkspace()
  const docTypes = ["HPI Narrative", "SOAP Note", "Discharge Summary", "Referral Letter", "Progress Note", "Operative Note"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Documentation</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Generate and review clinical documents.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {docTypes.map((d) => (
          <button key={d} className="text-left px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: "var(--midnight-800)", color: "var(--slate-300)", border: "1px solid var(--midnight-700)" }}>
            Generate {d} →
          </button>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={prevPhase} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--midnight-700)", color: "var(--slate-300)" }}>← Back</button>
        <button onClick={nextPhase} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>Continue to Disposition →</button>
      </div>
    </div>
  )
}

export function DispositionPhase() {
  const { closeEncounter } = useClinicalWorkspace()
  const options = ["Discharge Home", "Admit to Ward", "Admit to ICU", "Transfer to Another Facility", "Refer to Specialist Clinic", "Observe in ED", "Left Against Medical Advice"]

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Disposition</h2>
      <p className="text-xs" style={{ color: "var(--slate-500)" }}>Finalize the encounter with a disposition decision.</p>
      <div className="space-y-1.5">
        {options.map((o) => (
          <button key={o} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--midnight-800)", color: "var(--slate-300)", border: "1px solid var(--midnight-700)" }}>
            {o}
          </button>
        ))}
      </div>
      <button onClick={closeEncounter} className="w-full py-2.5 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>
        Complete Encounter
      </button>
    </div>
  )
}

export function RegistrationPhase() {
  const { nextPhase, selectedPatient } = useClinicalWorkspace()

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--slate-100)" }}>Patient Registration</h2>
      {selectedPatient ? (
        <div className="rounded-xl p-4 border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: "var(--accent)", color: "#fff" }}>
              {selectedPatient.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--slate-100)" }}>{selectedPatient.name}</div>
              <div className="text-xs" style={{ color: "var(--slate-500)" }}>{selectedPatient.hospitalNumber} · {selectedPatient.age}y {selectedPatient.sex}</div>
            </div>
          </div>
          <button onClick={nextPhase} className="w-full py-2.5 rounded-lg text-xs font-semibold" style={{ background: "var(--accent)", color: "#fff" }}>
            Confirm & Start Encounter →
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-6 text-center border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
          <div className="text-2xl mb-2">👤</div>
          <div className="text-xs" style={{ color: "var(--slate-500)" }}>Select a patient from the queue to begin.</div>
        </div>
      )}
    </div>
  )
}
