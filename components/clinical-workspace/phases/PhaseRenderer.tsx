"use client"

import { useClinicalWorkspace } from "../workflow-state"
import ComplaintPhase from "./ComplaintPhase"
import HpiPhase from "./HpiPhase"
import {
  PmhPhase,
  ExaminationPhase,
  InvestigationsPhase,
  DiagnosisPhase,
  ManagementPhase,
  DocumentationPhase,
  DispositionPhase,
  RegistrationPhase,
} from "./AllPhases"

export default function PhaseRenderer() {
  const { phase } = useClinicalWorkspace()

  switch (phase) {
    case "registration":
      return <RegistrationPhase />
    case "complaint":
      return <ComplaintPhase />
    case "hpi":
      return <HpiPhase />
    case "pmh":
      return <PmhPhase />
    case "examination":
      return <ExaminationPhase />
    case "investigations":
      return <InvestigationsPhase />
    case "diagnosis":
      return <DiagnosisPhase />
    case "management":
      return <ManagementPhase />
    case "documentation":
      return <DocumentationPhase />
    case "disposition":
      return <DispositionPhase />
    case "complete":
      return <CompletePhase />
    default:
      return <RegistrationPhase />
  }
}

function CompletePhase() {
  const { closeEncounter } = useClinicalWorkspace()
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="rounded-xl p-8 text-center border" style={{ background: "var(--midnight-800)", borderColor: "var(--midnight-700)" }}>
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--slate-100)" }}>
          Encounter Complete
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--slate-500)" }}>
          All phases completed. Summary has been saved.
        </p>
        <button
          onClick={closeEncounter}
          className="px-6 py-2 rounded-lg text-xs font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Return to Queue
        </button>
      </div>
    </div>
  )
}
