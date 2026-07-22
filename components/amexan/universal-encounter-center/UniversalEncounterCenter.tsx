"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search, Plus, Activity, Users, Bed, Clock, AlertTriangle,
  FileText, Stethoscope, Pill, Microscope, Heart, ChevronRight,
  X, UserPlus, Ambulance, Calendar, Video, Zap, Check, Filter,
  ArrowRight, Maximize2, Minimize2, History, BookOpen
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type QueueType = "emergency" | "outpatient" | "ward" | "clinic" | "icu" | "theatre" | "telemedicine";

interface QueueItem {
  id: string;
  patientName: string;
  hospitalNumber: string;
  age: number;
  sex: string;
  complaint: string;
  priority: "immediate" | "emergency" | "urgent" | "semi_urgent" | "routine";
  status: "waiting" | "in_progress" | "completed";
  waitTime: number;
  provider?: string;
}

interface EncounterStat {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "encounter" | "result" | "order" | "review" | "alert";
  patientName: string;
  description: string;
  time: string;
  urgent: boolean;
}

// ============================================================================
// MOCK DATA - Will be replaced with real API calls
// ============================================================================

const MOCK_QUEUE: Record<QueueType, QueueItem[]> = {
  emergency: [
    { id: "e1", patientName: "John Kamau", hospitalNumber: "HN-2024-8941", age: 45, sex: "M", complaint: "Chest pain radiating to left arm", priority: "emergency", status: "waiting", waitTime: 5 },
    { id: "e2", patientName: "Mary Wanjiku", hospitalNumber: "HN-2024-8912", age: 32, sex: "F", complaint: "Severe abdominal pain, vomiting", priority: "urgent", status: "in_progress", waitTime: 12, provider: "Dr. Otieno" },
    { id: "e3", patientName: "Baby Maina", hospitalNumber: "HN-2024-8956", age: 0, sex: "M", complaint: "Fever, not feeding", priority: "emergency", status: "waiting", waitTime: 3 },
  ],
  outpatient: [
    { id: "o1", patientName: "Peter Kimani", hospitalNumber: "HN-2024-8876", age: 58, sex: "M", complaint: "Diabetes follow-up, foot ulcer review", priority: "routine", status: "waiting", waitTime: 20 },
    { id: "o2", patientName: "Sarah Akinyi", hospitalNumber: "HN-2024-8900", age: 28, sex: "F", complaint: "Antenatal visit - 32 weeks", priority: "routine", status: "in_progress", waitTime: 15, provider: "Dr. Mwangi" },
    { id: "o3", patientName: "James Ochieng", hospitalNumber: "HN-2024-8933", age: 67, sex: "M", complaint: "Hypertension review", priority: "semi_urgent", status: "waiting", waitTime: 25 },
  ],
  ward: [],
  clinic: [],
  icu: [],
  theatre: [],
  telemedicine: [],
};

const MOCK_STATS: EncounterStat[] = [
  { label: "Waiting", count: 8, icon: <Clock size={18} />, color: "#f59e0b" },
  { label: "In Progress", count: 12, icon: <Activity size={18} />, color: "#3b82f6" },
  { label: "Admitted", count: 24, icon: <Bed size={18} />, color: "#8b5cf6" },
  { label: "ICU", count: 4, icon: <Heart size={18} />, color: "#ef4444" },
];

const MOCK_RECENT: RecentActivity[] = [
  { id: "r1", type: "alert", patientName: "Grace Nyambura", description: "Critical lab result: Hb 4.2", time: "2 min ago", urgent: true },
  { id: "r2", type: "encounter", patientName: "Dr. Kamau", description: "Completed encounter: Chest pain workup", time: "5 min ago", urgent: false },
  { id: "r3", type: "result", patientName: "Tom Odhiambo", description: "CT scan results available", time: "8 min ago", urgent: false },
  { id: "r4", type: "order", patientName: "Nurse Jane", description: "New orders for DKA protocol", time: "12 min ago", urgent: true },
];

// ============================================================================
// CLINICAL RULES LAYER (in-browser evaluation)
// ============================================================================

interface PatientContext {
  age: number;
  ageCategory: string;
  sex: string;
  isPregnant: boolean;
  hasUterus: boolean;
}

function derivePatientContext(age: number, sex: string): PatientContext {
  let ageCategory: string;
  if (age <= 0) ageCategory = "neonate";
  else if (age <= 1) ageCategory = "infant";
  else if (age <= 9) ageCategory = "child";
  else if (age <= 19) ageCategory = "adolescent";
  else if (age <= 64) ageCategory = "adult";
  else ageCategory = "older_adult";

  return {
    age,
    ageCategory,
    sex,
    isPregnant: false,
    hasUterus: sex === "female",
  };
}

function evaluateRules(context: PatientContext): string[] {
  const activeSections: string[] = [];

  // PAT-0002: Sex-based pathway
  if (context.sex === "male") {
    activeSections.push("urological_history", "prostate_screening");
  }

  // PAT-0003: Female reproductive age
  if (context.sex === "female" && context.age >= 10 && context.age <= 55) {
    activeSections.push(
      "menstrual_history", "obstetric_history",
      "contraception_history", "pregnancy_screening"
    );
  }

  // PAT-0006: Neonate
  if (context.ageCategory === "neonate") {
    activeSections.push(
      "birth_history", "maternal_history", "feeding_history",
      "neonatal_examination", "immunization_history"
    );
  }

  // PAT-0007: Pediatric
  if (["infant", "child", "adolescent"].includes(context.ageCategory)) {
    activeSections.push(
      "birth_history", "developmental_history", "nutritional_history",
      "immunization_history", "growth_history"
    );
  }

  // PAT-0008: Geriatric
  if (context.ageCategory === "older_adult") {
    activeSections.push(
      "functional_status", "falls_assessment",
      "cognitive_assessment", "polypharmacy_review"
    );
  }

  return activeSections;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function UniversalEncounterCenter() {
  const [activeQueue, setActiveQueue] = useState<QueueType>("emergency");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<QueueItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const queue = MOCK_QUEUE[activeQueue] || [];

  const filteredQueue = queue.filter(item =>
    item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hospitalNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEncounter = useCallback((item: QueueItem) => {
    setSelectedPatient(item);
    const context = derivePatientContext(item.age, item.sex);
    const sections = evaluateRules(context);
    console.log("[CRL] Active sections for", item.patientName, ":", sections);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate": case "emergency": return "#ef4444";
      case "urgent": return "#f59e0b";
      case "semi_urgent": return "#3b82f6";
      default: return "#64748b";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "immediate": return "Immediate";
      case "emergency": return "Emergency";
      case "urgent": return "Urgent";
      case "semi_urgent": return "Semi-Urgent";
      case "routine": return "Routine";
      default: return priority;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>Waiting</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>In Progress</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>Completed</span>;
      default:
        return null;
    }
  };

  const queueTabs: { key: QueueType; label: string; icon: React.ReactNode }[] = [
    { key: "emergency", label: "Emergency", icon: <Zap size={14} /> },
    { key: "outpatient", label: "Outpatient", icon: <Users size={14} /> },
    { key: "ward", label: "Ward", icon: <Bed size={14} /> },
    { key: "clinic", label: "Clinic", icon: <Stethoscope size={14} /> },
    { key: "icu", label: "ICU", icon: <Heart size={14} /> },
    { key: "theatre", label: "Theatre", icon: <Activity size={14} /> },
    { key: "telemedicine", label: "Telemedicine", icon: <Video size={14} /> },
  ];

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : "min-h-screen"}`}
      style={{
        background: "linear-gradient(180deg, #0a0f1a 0%, #0f1923 50%, #0a0f1a 100%)",
        color: "#e2e8f0",
      }}
    >
      {/* ===== HEADER ===== */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: "rgba(30,45,61,0.8)", background: "rgba(10,15,26,0.95)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff" }}
            >
              AX
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "#f1f5f9" }}>
              AMEXAN
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
              Clinical OS v2
            </span>
          </div>

          {/* Search */}
          <div className="relative ml-8" style={{ width: 320 }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input
              type="text"
              placeholder="Search patients by name or hospital number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "rgba(30,45,61,0.6)",
                border: "1px solid rgba(30,45,61,0.8)",
                color: "#e2e8f0",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.background = "rgba(30,45,61,0.9)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(30,45,61,0.8)";
                e.target.style.background = "rgba(30,45,61,0.6)";
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmergency(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#fff",
            }}
          >
            <Ambulance size={16} />
            Emergency
          </button>

          <button
            onClick={() => setShowRegistration(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
            }}
          >
            <Plus size={16} />
            New Patient
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg transition-all"
            style={{ background: "rgba(30,45,61,0.6)", color: "#64748b" }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ===== STATS BAR ===== */}
        <div
          className="flex-shrink-0 border-r"
          style={{ width: 64, borderColor: "rgba(30,45,61,0.8)", background: "rgba(15,25,35,0.8)" }}
        >
          <div className="flex flex-col items-center gap-4 py-4">
            {MOCK_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all"
                style={{ color: stat.color }}
                title={`${stat.label}: ${stat.count}`}
              >
                {stat.icon}
                <span className="text-xs font-bold">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Queue Tabs */}
          <div
            className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto shrink-0"
            style={{ borderColor: "rgba(30,45,61,0.8)", background: "rgba(15,25,35,0.5)" }}
          >
            {queueTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveQueue(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeQueue === tab.key ? "rgba(59,130,246,0.15)" : "transparent",
                  color: activeQueue === tab.key ? "#60a5fa" : "#64748b",
                  border: activeQueue === tab.key ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                }}
              >
                {tab.icon}
                {tab.label}
                {MOCK_QUEUE[tab.key]?.length > 0 && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: tab.key === "emergency" ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)", color: tab.key === "emergency" ? "#ef4444" : "#94a3b8" }}
                  >
                    {MOCK_QUEUE[tab.key]?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Queue Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#f1f5f9" }}>
                {queueTabs.find(t => t.key === activeQueue)?.label} Queue
              </h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                <Filter size={12} />
                <span>Sort by: Priority</span>
              </div>
            </div>

            {filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16" style={{ color: "#475569" }}>
                <Users size={48} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium">No patients in queue</p>
                <p className="text-xs mt-1">New patients will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredQueue.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                    style={{
                      background: selectedPatient?.id === item.id ? "rgba(59,130,246,0.1)" : "rgba(15,25,35,0.6)",
                      border: selectedPatient?.id === item.id
                        ? "1px solid rgba(59,130,246,0.3)"
                        : "1px solid rgba(30,45,61,0.6)",
                    }}
                    onClick={() => handleStartEncounter(item)}
                  >
                    {/* Priority indicator */}
                    <div
                      className="w-1.5 h-10 rounded-full shrink-0"
                      style={{ background: getPriorityColor(item.priority) }}
                    />

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${getPriorityColor(item.priority)}, rgba(0,0,0,0.3))`,
                        color: "#fff",
                      }}
                    >
                      {item.patientName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.patientName}</span>
                        <span className="text-xs" style={{ color: "#64748b" }}>{item.hospitalNumber}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs" style={{ color: "#64748b" }}>
                          {item.age}y {item.sex}
                        </span>
                        <span className="text-xs truncate" style={{ color: "#94a3b8" }}>
                          {item.complaint}
                        </span>
                      </div>
                    </div>

                    {/* Wait time & action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-medium" style={{ color: item.waitTime < 10 ? "#22c55e" : item.waitTime < 20 ? "#f59e0b" : "#ef4444" }}>
                          {item.waitTime} min
                        </div>
                        <div className="text-[10px]" style={{ color: "#475569" }}>waiting</div>
                      </div>
                      {item.provider && (
                        <div className="text-xs px-2 py-1 rounded" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa" }}>
                          {item.provider}
                        </div>
                      )}
                      <button
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div
          className="flex-shrink-0 border-l overflow-y-auto"
          style={{ width: 300, borderColor: "rgba(30,45,61,0.8)", background: "rgba(15,25,35,0.5)" }}
        >
          {/* Quick Actions */}
          <div className="p-4 border-b" style={{ borderColor: "rgba(30,45,61,0.8)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Clinical Entry", icon: <FileText size={14} />, color: "#3b82f6" },
                { label: "Lab Orders", icon: <Microscope size={14} />, color: "#8b5cf6" },
                { label: "Prescribe", icon: <Pill size={14} />, color: "#22c55e" },
                { label: "Referrals", icon: <ArrowRight size={14} />, color: "#f59e0b" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: "rgba(30,45,61,0.4)",
                    color: action.color,
                    border: "1px solid rgba(30,45,61,0.6)",
                  }}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {MOCK_RECENT.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg transition-all"
                  style={{
                    background: activity.urgent ? "rgba(239,68,68,0.08)" : "transparent",
                  }}
                >
                  {activity.urgent ? (
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                  ) : (
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(59,130,246,0.2)" }}
                    >
                      <Check size={10} style={{ color: "#3b82f6" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#e2e8f0" }}>
                      {activity.description}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                      {activity.patientName} &middot; {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Rules Engine Status */}
          <div className="p-4 border-t" style={{ borderColor: "rgba(30,45,61,0.8)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
              Clinical Rules Engine
            </h3>
            <div
              className="p-3 rounded-lg text-xs"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium" style={{ color: "#22c55e" }}>CRL Active</span>
              </div>
              <div style={{ color: "#64748b" }}>
                47 rules loaded &middot; 12 categories
              </div>
              <div style={{ color: "#64748b" }}>
                v1.0.0 &middot; All modules operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== NEW PATIENT MODAL ===== */}
      {showRegistration && (
        <NewPatientRegistration onClose={() => setShowRegistration(false)} />
      )}

      {/* ===== EMERGENCY OVERRIDE ===== */}
      {showEmergency && (
        <EmergencyOverride onClose={() => setShowEmergency(false)} />
      )}
    </div>
  );
}

// ============================================================================
// NEW PATIENT REGISTRATION MODAL
// ============================================================================

function NewPatientRegistration({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<PatientContext | null>(null);
  const [activeSections, setActiveSections] = useState<string[]>([]);

  const handleAgeSexChange = (age: number, sex: string) => {
    const ctx = derivePatientContext(age, sex);
    setContext(ctx);
    setActiveSections(evaluateRules(ctx));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="rounded-2xl w-full max-w-2xl overflow-hidden"
        style={{ background: "#0f1923", border: "1px solid rgba(30,45,61,0.8)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(30,45,61,0.8)" }}>
          <div className="flex items-center gap-3">
            <UserPlus size={18} style={{ color: "#3b82f6" }} />
            <h2 className="font-bold text-lg">New Patient Registration</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-all" style={{ background: "rgba(30,45,61,0.6)", color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: "rgba(30,45,61,0.8)", background: "rgba(10,15,26,0.5)" }}>
          {["Biodata", "Context", "History Templates", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= i + 1 ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(30,45,61,0.6)",
                  color: step >= i + 1 ? "#fff" : "#475569",
                }}
              >
                {step > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span className="text-xs" style={{ color: step >= i + 1 ? "#e2e8f0" : "#475569" }}>{s}</span>
              {i < 3 && <ChevronRight size={12} style={{ color: "#475569" }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Given Name</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Family Name</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Age</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }}
                    onChange={(e) => {
                      const age = parseInt(e.target.value) || 0;
                      const sex = (document.getElementById("reg-sex") as HTMLSelectElement)?.value || "male";
                      handleAgeSexChange(age, sex);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Age Unit</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }}>
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Sex</label>
                  <select
                    id="reg-sex"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }}
                    onChange={(e) => {
                      const age = parseInt((document.querySelector('input[type="number"]') as HTMLInputElement)?.value) || 0;
                      handleAgeSexChange(age, e.target.value);
                    }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="intersex">Intersex</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Residence</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Occupation</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }} />
              </div>
            </div>
          )}

          {step === 2 && context && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
              >
                <h3 className="font-semibold text-sm mb-2">Derived Clinical Context</h3>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "#94a3b8" }}>
                  <div>Age Category: <span className="font-medium" style={{ color: "#e2e8f0" }}>{context.ageCategory}</span></div>
                  <div>Sex: <span className="font-medium" style={{ color: "#e2e8f0" }}>{context.sex}</span></div>
                  <div>Reproductive Age: <span className="font-medium" style={{ color: context.sex === "female" && context.age >= 10 && context.age <= 55 ? "#22c55e" : "#64748b" }}>
                    {context.sex === "female" && context.age >= 10 && context.age <= 55 ? "Yes" : "N/A"}
                  </span></div>
                  <div>Has Uterus: <span className="font-medium" style={{ color: context.hasUterus ? "#e2e8f0" : "#64748b" }}>
                    {context.hasUterus ? "Yes" : "No"}
                  </span></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Activated History Modules</h3>
                <div className="space-y-2">
                  {activeSections.map((section) => (
                    <div
                      key={section}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}
                    >
                      <Check size={12} />
                      <span className="capitalize">{section.replace(/_/g, " ")}</span>
                      <span className="ml-auto text-[10px]" style={{ color: "#64748b" }}>Auto-activated</span>
                    </div>
                  ))}
                  {activeSections.length === 0 && (
                    <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(30,45,61,0.4)", color: "#64748b" }}>
                      Standard adult history template will be used
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: "#64748b" }}>The following history sections will be available based on patient context:</p>
              {["chief_complaint", "hpi", "past_medical_history", "drug_history", "allergy_history", "surgical_history", "family_history", "social_history", "review_of_systems"].map((section) => (
                <div key={section} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(30,45,61,0.4)" }}>
                  <BookOpen size={12} style={{ color: "#3b82f6" }} />
                  <span className="capitalize" style={{ color: "#e2e8f0" }}>{section.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <Check size={32} className="mx-auto mb-2" style={{ color: "#22c55e" }} />
                <p className="font-semibold" style={{ color: "#22c55e" }}>Registration Ready</p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>All required fields are complete. Encounter will be created with CRL-driven history templates.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(30,45,61,0.8)", background: "rgba(10,15,26,0.5)" }}>
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "rgba(30,45,61,0.6)", color: "#64748b" }}
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step < 4) setStep(step + 1);
              else onClose();
            }}
            className="px-6 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff" }}
          >
            {step === 4 ? "Start Encounter" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMERGENCY OVERRIDE MODAL
// ============================================================================

function EmergencyOverride({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="rounded-2xl w-full max-w-md overflow-hidden"
        style={{ background: "#0f1923", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-3">
            <Ambulance size={20} style={{ color: "#ef4444" }} />
            <h2 className="font-bold text-lg">Emergency Protocol</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: "rgba(30,45,61,0.6)", color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div
            className="p-4 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
          >
            <p className="font-semibold mb-1">ABCDE Assessment First</p>
            <p style={{ color: "#94a3b8" }}>Emergency protocol activated. Standard history workflow will be overridden. Airway, Breathing, Circulation assessment takes priority.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              <Zap size={14} />
              <span>Airway patency check required</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
              <Zap size={14} />
              <span>Breathing assessment (RR, SpO2, chest movement)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              <Zap size={14} />
              <span>Circulation (pulse, BP, capillary refill, IV access)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff" }}
              onClick={onClose}
            >
              <Ambulance size={16} />
              Start ABCDE
            </button>
            <button
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(30,45,61,0.6)", color: "#64748b" }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>

          <div className="text-[10px] pt-2 text-center" style={{ color: "#475569" }}>
            All overrides are audited: WRK-0002 • Emergency Override Protocol
          </div>
        </div>
      </div>
    </div>
  );
}
