import { create } from "zustand"
import {
  type WorkflowPhase,
  type PatientSummary,
  type EncounterState,
  type ComplaintNode,
  type Observation,
  type DifferentialEntry,
  type QuestionCard,
  type QueueTab,
  type EncounterType,
} from "./types"

const WORKFLOW_ORDER: WorkflowPhase[] = [
  "registration",
  "complaint",
  "hpi",
  "pmh",
  "examination",
  "investigations",
  "diagnosis",
  "management",
  "documentation",
  "disposition",
  "complete",
]

const QUEUE_TABS: QueueTab[] = [
  { id: "emergency", label: "Emergency", count: 4, icon: "🚨" },
  { id: "ward", label: "Ward", count: 12, icon: "🏥" },
  { id: "clinic", label: "Clinic", count: 8, icon: "🩺" },
  { id: "icu", label: "ICU", count: 3, icon: "💉" },
  { id: "theatre", label: "Theatre", count: 2, icon: "🔬" },
  { id: "telemedicine", label: "Telemedicine", count: 5, icon: "📹" },
  { id: "completed", label: "Completed", count: 24, icon: "✅" },
]

const MOCK_PATIENTS: Record<string, PatientSummary[]> = {
  emergency: [
    { id: "p1", hospitalNumber: "MH-2024-8912", name: "Sarah Wanjiku", age: 34, sex: "Female", location: "ED Bay 3", department: "Emergency", priority: "emergency", complaint: "Acute abdominal pain x 6 hours", waitingMinutes: 8, status: "In Triage", assignedDoctor: "Dr. Kamau", alerts: [], isIsolation: false, isCritical: false, isPregnant: true, isDNR: false, allergies: ["Penicillin"], newsScore: 4, bed: "ED-03" },
    { id: "p2", hospitalNumber: "MH-2024-7815", name: "John Omondi", age: 58, sex: "Male", location: "ED Resus", department: "Emergency", priority: "immediate", complaint: "Chest pain, radiating to left arm", waitingMinutes: 3, status: "Resuscitation", assignedDoctor: "Dr. Njoroge", alerts: ["ACS Protocol"], isIsolation: false, isCritical: true, isPregnant: false, isDNR: false, allergies: [], newsScore: 7, bed: "ED-01" },
    { id: "p3", hospitalNumber: "MH-2024-6723", name: "Grace Muthoni", age: 72, sex: "Female", location: "ED Bay 1", department: "Emergency", priority: "urgent", complaint: "Fall at home, hip pain", waitingMinutes: 15, status: "Awaiting X-Ray", assignedDoctor: "Dr. Kamau", alerts: ["Fall Protocol"], isIsolation: false, isCritical: false, isPregnant: false, isDNR: false, allergies: ["Morphine"], newsScore: 2, bed: "ED-01" },
    { id: "p4", hospitalNumber: "MH-2024-9012", name: "Peter Kiplagat", age: 45, sex: "Male", location: "ED Bay 2", department: "Emergency", priority: "semi-urgent", complaint: "Laceration to right forearm", waitingMinutes: 22, status: "Awaiting Sutures", assignedDoctor: "Dr. Njoroge", alerts: [], isIsolation: false, isCritical: false, isPregnant: false, isDNR: false, allergies: [], newsScore: 1, bed: "ED-02" },
  ],
  ward: [
    { id: "p5", hospitalNumber: "MH-2024-4512", name: "Mary Akinyi", age: 28, sex: "Female", location: "Ward 3B", department: "Obstetrics", priority: "routine", complaint: "Post-partum day 2, normal recovery", waitingMinutes: 0, status: "Inpatient", assignedDoctor: "Dr. Ochieng", alerts: [], isIsolation: false, isCritical: false, isPregnant: false, isDNR: false, allergies: [], newsScore: 0, bed: "W3B-12" },
    { id: "p6", hospitalNumber: "MH-2024-3321", name: "James Kariuki", age: 65, sex: "Male", location: "Ward 5A", department: "Cardiology", priority: "urgent", complaint: "Heart failure exacerbation", waitingMinutes: 0, status: "Inpatient", assignedDoctor: "Dr. Wambui", alerts: ["Heart Failure Pathway"], isIsolation: false, isCritical: false, isPregnant: false, isDNR: false, allergies: ["Aspirin"], newsScore: 5, bed: "W5A-08" },
  ],
  icu: [
    { id: "p7", hospitalNumber: "MH-2024-2113", name: "David Mwangi", age: 48, sex: "Male", location: "ICU Bay 1", department: "Critical Care", priority: "emergency", complaint: "Septic shock, on vasopressors", waitingMinutes: 0, status: "Critical", assignedDoctor: "Dr. Munyao", alerts: ["Sepsis Protocol"], isIsolation: true, isCritical: true, isPregnant: false, isDNR: false, allergies: ["Ceftriaxone"], newsScore: 9, bed: "ICU-01" },
  ],
  clinic: [
    { id: "p8", hospitalNumber: "MH-2024-5612", name: "Faith Njeri", age: 31, sex: "Female", location: "Clinic 2", department: "Endocrinology", priority: "routine", complaint: "Diabetes follow-up, HbA1c review", waitingMinutes: 18, status: "Waiting", assignedDoctor: "Dr. Mutua", alerts: [], isIsolation: false, isCritical: false, isPregnant: false, isDNR: false, allergies: [], newsScore: 1 },
    { id: "p9", hospitalNumber: "MH-2024-7721", name: "Samuel Ndung'u", age: 55, sex: "Male", location: "Clinic 1", department: "Cardiology", priority: "urgent", complaint: "Chest pain on exertion, 2 week history", waitingMinutes: 12, status: "Waiting", assignedDoctor: "Dr. Wambui", alerts: ["Cardiac Assessment"], isIsolation: false, isCritical: false, isPregnant: false, isDNR: false, allergies: [], newsScore: 3 },
  ],
  theatre: [],
  telemedicine: [],
  completed: [],
}

let encounterCounter = 100

function generateEncounterId(): string {
  return `ENC-${new Date().getFullYear()}-${String(++encounterCounter).padStart(4, "0")}`
}

function generateUUID(): string {
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

interface ClinicalWorkspaceStore {
  queue: PatientSummary[]
  activeTab: string
  selectedPatient: PatientSummary | null
  encounter: EncounterState | null
  phase: WorkflowPhase
  complaints: ComplaintNode[]
  observations: Observation[]
  differentials: DifferentialEntry[]
  questions: QuestionCard[]
  assistantCollapsed: boolean
  queueCollapsed: boolean
  encounterHistory: { phase: WorkflowPhase; completedAt: Date }[]

  setActiveTab: (tab: string) => void
  selectPatient: (patient: PatientSummary) => void
  startEncounter: (type: EncounterType, department: string) => void
  setPhase: (phase: WorkflowPhase) => void
  nextPhase: () => void
  prevPhase: () => void
  addComplaint: (complaint: ComplaintNode) => void
  addObservation: (obs: Observation) => void
  addDifferential: (dd: DifferentialEntry) => void
  updateDifferential: (diseaseId: string, updates: Partial<DifferentialEntry>) => void
  setQuestions: (questions: QuestionCard[]) => void
  answerQuestion: (id: string, answer: any) => void
  toggleAssistant: () => void
  toggleQueue: () => void
  closeEncounter: () => void
  getQueueByTab: (tabId: string) => PatientSummary[]
  getWorkflowProgress: () => number
}

export const useClinicalWorkspace = create<ClinicalWorkspaceStore>((set, get) => ({
  queue: Object.values(MOCK_PATIENTS).flat(),
  activeTab: "emergency",
  selectedPatient: null,
  encounter: null,
  phase: "registration",
  complaints: [],
  observations: [],
  differentials: [],
  questions: [],
  assistantCollapsed: false,
  queueCollapsed: false,
  encounterHistory: [],

  setActiveTab: (tab) => {
    const patients = MOCK_PATIENTS[tab] || []
    set({ activeTab: tab, queue: patients })
  },

  selectPatient: (patient) => {
    set({ selectedPatient: patient })
  },

  startEncounter: (type, department) => {
    const patient = get().selectedPatient
    if (!patient) return

    const encounter: EncounterState = {
      id: generateEncounterId(),
      patient,
      type,
      phase: "complaint",
      status: "active",
      startTime: new Date(),
      department,
      context: {
        ageGroup: patient.age >= 65 ? "older_adult" : patient.age >= 18 ? "adult" : "child",
        sex: patient.sex,
        pregnancyStatus: patient.isPregnant ? "pregnant" : "not_pregnant",
        knownConditions: [],
        activeAllergies: patient.allergies,
        activePathways: [],
        activeRules: 12,
        riskLevel: patient.newsScore >= 7 ? "critical" : patient.newsScore >= 4 ? "high" : patient.newsScore >= 2 ? "moderate" : "low",
        currentStep: "complaint",
      },
    }

    set({
      encounter,
      phase: "complaint",
      complaints: [],
      observations: [],
      differentials: [],
      questions: [],
      encounterHistory: [],
    })
  },

  setPhase: (phase) => {
    set({ phase })
  },

  nextPhase: () => {
    const { phase, encounterHistory } = get()
    const idx = WORKFLOW_ORDER.indexOf(phase)
    if (idx < WORKFLOW_ORDER.length - 1) {
      const next = WORKFLOW_ORDER[idx + 1]
      set({
        phase: next,
        encounterHistory: [...encounterHistory, { phase, completedAt: new Date() }],
      })
    }
  },

  prevPhase: () => {
    const { phase } = get()
    const idx = WORKFLOW_ORDER.indexOf(phase)
    if (idx > 0) {
      set({ phase: WORKFLOW_ORDER[idx - 1] })
    }
  },

  addComplaint: (complaint) => {
    set((state) => ({ complaints: [...state.complaints, complaint] }))
  },

  addObservation: (obs) => {
    set((state) => ({ observations: [...state.observations, obs] }))
  },

  addDifferential: (dd) => {
    set((state) => ({
      differentials: [...state.differentials.filter((d) => d.diseaseId !== dd.diseaseId), dd].sort(
        (a, b) => a.rank - b.rank
      ),
    }))
  },

  updateDifferential: (diseaseId, updates) => {
    set((state) => ({
      differentials: state.differentials.map((d) =>
        d.diseaseId === diseaseId ? { ...d, ...updates } : d
      ),
    }))
  },

  setQuestions: (questions) => {
    set({ questions })
  },

  answerQuestion: (id, answer) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, answered: true, answer } : q
      ),
    }))
  },

  toggleAssistant: () => {
    set((state) => ({ assistantCollapsed: !state.assistantCollapsed }))
  },

  toggleQueue: () => {
    set((state) => ({ queueCollapsed: !state.queueCollapsed }))
  },

  closeEncounter: () => {
    set({
      encounter: null,
      selectedPatient: null,
      phase: "registration",
      complaints: [],
      observations: [],
      differentials: [],
      questions: [],
      encounterHistory: [],
    })
  },

  getQueueByTab: (tabId) => {
    return MOCK_PATIENTS[tabId] || []
  },

  getWorkflowProgress: () => {
    const { phase } = get()
    const idx = WORKFLOW_ORDER.indexOf(phase)
    return Math.round((idx / (WORKFLOW_ORDER.length - 1)) * 100)
  },
}))
