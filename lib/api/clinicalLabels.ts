export const STEP_LABELS: Record<string, { title: string; desc: string; badge: string }> = {
  registration: {
    title: "Patient Registration",
    desc: "Enter patient biodata. Rules automatically determine clinical context: age category, sex-specific pathways, and applicable screening modules.",
    badge: "PAT-0001 to PAT-0011",
  },
  chief_complaint: {
    title: "Chief Complaint",
    desc: "Rule CC-0001: Each complaint is an independent object.\nRule CC-0007: Display is chronological by onset, not entry order.\nRule CC-0009: Chief complaint cannot contain a diagnosis — use symptoms.",
    badge: "CC-0001 to CC-0010",
  },
  hpi: {
    title: "History of Present Illness",
    desc: "Rule HPI-0001: Each complaint has its own HPI. Rule HPI-0007: Dynamic questions — only relevant ones shown. Rule HPI-0010: Completion based on information completeness, not question count.",
    badge: "HPI-0001 to HPI-0010",
  },
  pmh: {
    title: "Past Medical & Surgical History",
    desc: "Document known medical conditions, surgeries, and admissions. Significant conditions (diabetes, hypertension, asthma, etc.) will be highlighted in the HPI summary.",
    badge: "PHX-0001",
  },
  drug_history: {
    title: "Medications & Allergies",
    desc: "Record current medications, doses, and known allergies.",
    badge: "DHX-0001 · AHX-0001",
  },
  social_history: {
    title: "Social & Family History",
    desc: "Document smoking, alcohol, occupation, travel, and family medical history.",
    badge: "SHX-0001 · FHX-0001",
  },
  ros: {
    title: "Review of Systems",
    desc: "Systematic review of all body systems for associated symptoms.",
    badge: "ROS-0001",
  },
  examination: {
    title: "Physical Examination",
    desc: "Document vital signs and system-by-system examination findings.",
    badge: "EXM-0001 to EXM-0005",
  },
  investigations: {
    title: "Investigations",
    desc: "Order and document laboratory, imaging, and bedside investigations.",
    badge: "INV-0001 to INV-0003",
  },
  diagnosis: {
    title: "Diagnosis & Differential",
    desc: "Working diagnosis, differentials, and Bayesian probability updates from clinical data.",
    badge: "DX-0001 to DX-0004 · BNR-0001",
  },
  management: {
    title: "Management Plan",
    desc: "Immediate stabilization, definitive treatment, monitoring, and disposition.",
    badge: "MGT-0001 to MGT-0003",
  },
  documentation: {
    title: "Clinical Documentation",
    desc: "DOC-0001: Rendered from observations only — no placeholders. Documents never store data — they render observations.",
    badge: "DOC-0001 to DOC-0003",
  },
}

export const SECTION_LABELS: Record<string, string> = {
  identity: "IDENTITY",
  informant: "INFORMANT",
  medicalConditions: "MEDICAL CONDITIONS",
  surgicalHistory: "SURGICAL HISTORY",
  obgynHistory: "OBSTETRIC & GYNECOLOGICAL HISTORY",
  neonatalHistory: "NEONATAL HISTORY",
  currentMedications: "CURRENT MEDICATIONS",
  allergies: "ALLERGIES",
  vitals: "VITAL SIGNS",
  systemExam: "SYSTEM EXAMINATION",
  workingDiagnosis: "WORKING DIAGNOSIS",
  differentials: "DIFFERENTIAL DIAGNOSES",
  dangerDiagnoses: "CANNOT MISS / DANGEROUS DIAGNOSES",
  immediateManagement: "IMMEDIATE MANAGEMENT",
  definitiveTreatment: "DEFINITIVE TREATMENT",
  disposition: "DISPOSITION",
  hpiNarrative: "HPI Narrative",
  soapNote: "SOAP Note",
  admissionNote: "Admission Note",
  dischargeSummary: "Discharge Summary",
}

export const BUTTON_LABELS: Record<string, string> = {
  continue: "Continue",
  back: "Back",
  addComplaint: "+ Add",
  addCondition: "+ Add Condition",
  addSurgery: "+ Add Surgery",
  addMedication: "+ Add Medication",
  addAllergy: "+ Add Allergy",
  addExamFinding: "+ Add Finding",
  addInvestigation: "+ Add Investigation",
  addDiagnosis: "+ Add Diagnosis",
  addManagement: "+ Add Action",
  generateDocs: "Generate All Documents",
  startNewEncounter: "New Clinical Entry",
  complete: "Complete Encounter",
}
