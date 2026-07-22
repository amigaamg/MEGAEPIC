"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Brain, ChevronRight, Check, AlertTriangle, X, Code,
  BookOpen, Sliders, Activity, Shield, FileText, Layers
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface CRLRule {
  code: string;
  name: string;
  description: string;
  category: string;
  priority: number;
  status: "active" | "inactive" | "deprecated" | "test_mode";
  version: string;
  conditions: CRLCondition[];
  actions: CRLAction[];
}

interface CRLCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "not_in" | "exists" | "contains" | "matches";
  value: any;
  join?: "and" | "or";
  negate?: boolean;
}

interface CRLAction {
  type: string;
  target: string;
  parameters?: Record<string, any>;
}

interface RuleResult {
  rule: CRLRule;
  triggered: boolean;
  actions: { type: string; target: string; executed: boolean }[];
}

interface PatientContext {
  age: number;
  ageCategory: string;
  sex: string;
  isPregnant: boolean;
  hasUterus: boolean;
  visitType: string;
  complaint: string;
  pmh?: string[];
}

// ============================================================================
// CRL EVALUATOR (in-browser)
// ============================================================================

function evaluateCondition(cond: CRLCondition, state: Record<string, any>): boolean {
  const actual = state[cond.field];

  switch (cond.operator) {
    case "eq": return String(actual) === String(cond.value);
    case "neq": return String(actual) !== String(cond.value);
    case "gt": return Number(actual) > Number(cond.value);
    case "lt": return Number(actual) < Number(cond.value);
    case "gte": return Number(actual) >= Number(cond.value);
    case "lte": return Number(actual) <= Number(cond.value);
    case "in": {
      const list = String(cond.value).split(",").map(s => s.trim());
      return list.includes(String(actual));
    }
    case "not_in": {
      const list2 = String(cond.value).split(",").map(s => s.trim());
      return !list2.includes(String(actual));
    }
    case "exists": return actual !== undefined && actual !== null;
    case "contains": return String(actual).toLowerCase().includes(String(cond.value).toLowerCase());
    case "matches": {
      try {
        return new RegExp(String(cond.value), "i").test(String(actual));
      } catch {
        return false;
      }
    }
    default: return false;
  }
}

function evaluateRule(rule: CRLRule, state: Record<string, any>): RuleResult {
  const result: RuleResult = {
    rule,
    triggered: false,
    actions: [],
  };

  for (const cond of rule.conditions) {
    const matched = evaluateCondition(cond, state);
    if (cond.negate ? matched : !matched) {
      return result;
    }
  }

  result.triggered = true;
  result.actions = rule.actions.map(a => ({
    type: a.type,
    target: a.target,
    executed: true,
  }));

  return result;
}

// ============================================================================
// DEFAULT RULES
// ============================================================================

const DEFAULT_RULES: CRLRule[] = [
  {
    code: "PAT-0002",
    name: "Sex-Based Pathway",
    description: "Activates male-specific sections",
    category: "PAT",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [{ field: "sex", operator: "eq", value: "male" }],
    actions: [
      { type: "hide_section", target: "menstrual_history" },
      { type: "hide_section", target: "obstetric_history" },
      { type: "show_section", target: "urological_history" },
    ],
  },
  {
    code: "PAT-0003",
    name: "Female Reproductive Pathway",
    description: "Activates OBGYN for females 10-55",
    category: "PAT",
    priority: 80,
    status: "active",
    version: "1.0.0",
    conditions: [
      { field: "sex", operator: "eq", value: "female" },
      { field: "age", operator: "gte", value: 10 },
      { field: "age", operator: "lte", value: 55 },
    ],
    actions: [
      { type: "show_section", target: "menstrual_history" },
      { type: "show_section", target: "obstetric_history" },
      { type: "show_section", target: "pregnancy_screening" },
    ],
  },
  {
    code: "PAT-0006",
    name: "Neonate Activation",
    description: "Activates neonatal history for <28 days",
    category: "PAT",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [{ field: "ageCategory", operator: "eq", value: "neonate" }],
    actions: [
      { type: "show_section", target: "birth_history" },
      { type: "show_section", target: "maternal_history" },
      { type: "show_section", target: "feeding_history" },
      { type: "hide_section", target: "adult_history" },
    ],
  },
  {
    code: "PAT-0007",
    name: "Pediatric Activation",
    description: "Activates pediatric modules for children",
    category: "PAT",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [{ field: "ageCategory", operator: "in", value: "infant,child,adolescent" }],
    actions: [
      { type: "show_section", target: "developmental_history" },
      { type: "show_section", target: "immunization_history" },
      { type: "show_section", target: "growth_history" },
    ],
  },
  {
    code: "ENC-0001",
    name: "Emergency ABCDE",
    description: "In emergency, ABCDE before history",
    category: "ENC",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [{ field: "visitType", operator: "eq", value: "emergency" }],
    actions: [
      { type: "show_section", target: "abcde_assessment" },
      { type: "show_section", target: "triage_vitals" },
      { type: "require_field", target: "airway_patent" },
    ],
  },
  {
    code: "INV-0002",
    name: "Chest Pain Protocol",
    description: "ECG and troponin for chest pain",
    category: "INV",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [{ field: "complaint", operator: "contains", value: "chest pain" }],
    actions: [
      { type: "recommend_investigation", target: "ecg" },
      { type: "recommend_investigation", target: "troponin" },
      { type: "recommend_investigation", target: "cxr" },
    ],
  },
  {
    code: "INV-0003",
    name: "Diabetic Foot Protocol",
    description: "Vascular and neurological assessment",
    category: "INV",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [
      { field: "complaint", operator: "contains", value: "foot" },
      { field: "pmh", operator: "contains", value: "diabetes" },
    ],
    actions: [
      { type: "recommend_investigation", target: "hba1c" },
      { type: "recommend_investigation", target: "foot_doppler" },
      { type: "recommend_investigation", target: "wound_swab" },
      { type: "recommend_investigation", target: "xray_foot" },
    ],
  },
  {
    code: "DX-0001",
    name: "Red Flag Screening",
    description: "Always screen for red flags",
    category: "DX",
    priority: 100,
    status: "active",
    version: "1.0.0",
    conditions: [{ field: "complaint", operator: "exists", value: undefined }],
    actions: [
      { type: "show_section", target: "red_flag_screening" },
      { type: "require_field", target: "red_flags_screened" },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function ClinicalRulesEngine() {
  const [rules, setRules] = useState<CRLRule[]>(DEFAULT_RULES);
  const [selectedRule, setSelectedRule] = useState<CRLRule | null>(null);
  const [testResults, setTestResults] = useState<RuleResult[]>([]);
  const [patientContext, setPatientContext] = useState<PatientContext>({
    age: 30,
    ageCategory: "adult",
    sex: "male",
    isPregnant: false,
    hasUterus: false,
    visitType: "outpatient",
    complaint: "",
    pmh: [],
  });

  const [state, setState] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<string>("all");
  const [showDebug, setShowDebug] = useState(false);

  const updateContext = useCallback((updates: Partial<PatientContext>) => {
    setPatientContext(prev => {
      const updated = { ...prev, ...updates };

      // Auto-derive age category
      if (updates.age !== undefined) {
        const a = updates.age;
        if (a <= 0) updated.ageCategory = "neonate";
        else if (a <= 1) updated.ageCategory = "infant";
        else if (a <= 9) updated.ageCategory = "child";
        else if (a <= 19) updated.ageCategory = "adolescent";
        else if (a <= 64) updated.ageCategory = "adult";
        else updated.ageCategory = "older_adult";
      }

      return updated;
    });
  }, []);

  const handleEvaluate = useCallback(() => {
    const currentState: Record<string, any> = {
      ...state,
      age: patientContext.age,
      ageCategory: patientContext.ageCategory,
      sex: patientContext.sex,
      isPregnant: patientContext.isPregnant,
      hasUterus: patientContext.hasUterus,
      visitType: patientContext.visitType,
      complaint: patientContext.complaint,
      pmh: patientContext.pmh || [],
    };

    const results = rules
      .filter(r => r.status === "active")
      .map(rule => evaluateRule(rule, currentState))
      .filter(r => r.triggered);

    setTestResults(results);
  }, [rules, patientContext, state]);

  // Auto-evaluate when context changes
  useEffect(() => {
    handleEvaluate();
  }, [patientContext, handleEvaluate]);

  const filteredRules = rules.filter(r => {
    if (filter === "all") return true;
    return r.category === filter;
  });

  const categories = [...new Set(rules.map(r => r.category))];

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "transparent", color: "#e2e8f0" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(30,45,61,0.8)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
            <Brain size={18} style={{ color: "#fff" }} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Clinical Rules Engine</h2>
            <p className="text-xs" style={{ color: "#64748b" }}>CRL v1.0.0 &middot; {rules.length} rules loaded</p>
          </div>
        </div>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: showDebug ? "rgba(59,130,246,0.15)" : "rgba(30,45,61,0.6)", color: showDebug ? "#60a5fa" : "#64748b", border: "1px solid rgba(30,45,61,0.8)" }}
        >
          <Code size={14} />
          {showDebug ? "Hide Debug" : "Debug"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Patient Context Simulator */}
        <div className="flex-shrink-0 w-80 border-r overflow-y-auto p-4" style={{ borderColor: "rgba(30,45,61,0.8)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
            Patient Context Simulator
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Age</label>
              <input
                type="range"
                min={0}
                max={100}
                value={patientContext.age}
                onChange={(e) => updateContext({ age: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: "#3b82f6" }}
              />
              <div className="flex justify-between text-[10px]" style={{ color: "#475569" }}>
                <span>{patientContext.age} years</span>
                <span className="font-medium" style={{ color: "#60a5fa" }}>{patientContext.ageCategory}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Sex</label>
              <div className="flex gap-2">
                {["male", "female", "intersex"].map(s => (
                  <button
                    key={s}
                    onClick={() => updateContext({ sex: s as PatientContext["sex"] })}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      background: patientContext.sex === s ? "rgba(59,130,246,0.15)" : "rgba(30,45,61,0.4)",
                      color: patientContext.sex === s ? "#60a5fa" : "#64748b",
                      border: patientContext.sex === s ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Visit Type</label>
              <select
                value={patientContext.visitType}
                onChange={(e) => updateContext({ visitType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }}
              >
                {["outpatient", "emergency", "inpatient", "follow_up", "antenatal", "telemedicine"].map(v => (
                  <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Chief Complaint</label>
              <input
                type="text"
                value={patientContext.complaint}
                onChange={(e) => updateContext({ complaint: e.target.value })}
                placeholder="e.g., chest pain, foot ulcer..."
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "rgba(30,45,61,0.6)", border: "1px solid rgba(30,45,61,0.8)", color: "#e2e8f0" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Past Medical History</label>
              <div className="flex flex-wrap gap-1.5">
                {["diabetes", "hypertension", "asthma", "heart disease", "surgery"].map(cond => (
                  <button
                    key={cond}
                    onClick={() => {
                      const current = patientContext.pmh || [];
                      const updated = current.includes(cond)
                        ? current.filter(c => c !== cond)
                        : [...current, cond];
                      updateContext({ pmh: updated });
                    }}
                    className="px-2 py-1 rounded text-[10px] font-medium capitalize transition-all"
                    style={{
                      background: (patientContext.pmh || []).includes(cond) ? "rgba(34,197,94,0.15)" : "rgba(30,45,61,0.4)",
                      color: (patientContext.pmh || []).includes(cond) ? "#22c55e" : "#64748b",
                      border: (patientContext.pmh || []).includes(cond) ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
                    }}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Derived Context Display */}
          <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <h4 className="text-xs font-semibold mb-2" style={{ color: "#60a5fa" }}>Derived Context (PAT-0001)</h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]" style={{ color: "#94a3b8" }}>
              <div>Age Category: <span className="font-medium" style={{ color: "#e2e8f0" }}>{patientContext.ageCategory}</span></div>
              <div>Reproductive Age: <span className="font-medium" style={{ color: patientContext.sex === "female" && patientContext.age >= 10 && patientContext.age <= 55 ? "#22c55e" : "#64748b" }}>
                {patientContext.sex === "female" && patientContext.age >= 10 && patientContext.age <= 55 ? "Yes" : "N/A"}
              </span></div>
              <div>Peds Eligible: <span className="font-medium" style={{ color: ["infant", "child", "adolescent"].includes(patientContext.ageCategory) ? "#22c55e" : "#64748b" }}>
                {["infant", "child", "adolescent"].includes(patientContext.ageCategory) ? "Yes" : "N/A"}
              </span></div>
              <div>Geriatric: <span className="font-medium" style={{ color: patientContext.ageCategory === "older_adult" ? "#f59e0b" : "#64748b" }}>
                {patientContext.ageCategory === "older_adult" ? "Yes" : "N/A"}
              </span></div>
            </div>
          </div>
        </div>

        {/* Center: Triggered Rules */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              Triggered Rules ({testResults.length})
            </h3>
            <div className="flex gap-1">
              {["all", ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-2 py-1 rounded text-[10px] font-medium uppercase transition-all"
                  style={{
                    background: filter === cat ? "rgba(59,130,246,0.15)" : "rgba(30,45,61,0.4)",
                    color: filter === cat ? "#60a5fa" : "#64748b",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {testResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: "#475569" }}>
              <Brain size={48} strokeWidth={1} />
              <p className="mt-4 text-sm font-medium">No rules triggered</p>
              <p className="text-xs mt-1">Adjust patient context to trigger rules</p>
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: selectedRule?.code === result.rule.code ? "rgba(59,130,246,0.1)" : "rgba(15,25,35,0.6)",
                    border: selectedRule?.code === result.rule.code
                      ? "1px solid rgba(59,130,246,0.3)"
                      : "1px solid rgba(30,45,61,0.6)",
                  }}
                  onClick={() => setSelectedRule(result.rule)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                      <Check size={14} style={{ color: "#22c55e" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium" style={{ color: "#60a5fa" }}>{result.rule.code}</span>
                        <span className="text-sm font-semibold truncate">{result.rule.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                          {result.rule.category}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>{result.rule.description}</p>
                    </div>
                    <span className="text-xs" style={{ color: "#64748b" }}>{result.actions.length} actions</span>
                    <ChevronRight size={14} style={{ color: "#475569" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rule Detail */}
          {selectedRule && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(15,25,35,0.8)", border: "1px solid rgba(30,45,61,0.8)" }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{selectedRule.code}: {selectedRule.name}</h4>
                <button onClick={() => setSelectedRule(null)} className="p-1 rounded" style={{ background: "rgba(30,45,61,0.6)", color: "#64748b" }}>
                  <X size={12} />
                </button>
              </div>
              <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>{selectedRule.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-[10px] font-semibold uppercase mb-2" style={{ color: "#475569" }}>Conditions ({selectedRule.conditions.length})</h5>
                  <div className="space-y-1.5">
                    {selectedRule.conditions.map((cond, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "#64748b" }}>
                        <span style={{ color: "#f59e0b" }}>{cond.field}</span>
                        <span style={{ color: "#475569" }}>{cond.operator}</span>
                        <span style={{ color: "#22c55e" }}>{String(cond.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-semibold uppercase mb-2" style={{ color: "#475569" }}>Actions ({selectedRule.actions.length})</h5>
                  <div className="space-y-1.5">
                    {selectedRule.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: "#60a5fa" }}>
                        <Layers size={10} />
                        <span className="font-medium">{action.type}</span>
                        <span style={{ color: "#64748b" }}>&rarr;</span>
                        <span style={{ color: "#e2e8f0" }}>{action.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center gap-3 text-[10px]" style={{ borderColor: "rgba(30,45,61,0.8)", color: "#475569" }}>
                <span>Version: {selectedRule.version}</span>
                <span>Priority: {selectedRule.priority}</span>
                <span>Status: {selectedRule.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Debug Panel */}
        {showDebug && (
          <div className="flex-shrink-0 w-72 border-l overflow-y-auto p-4" style={{ borderColor: "rgba(30,45,61,0.8)", background: "rgba(10,15,26,0.5)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
              Debug State
            </h3>
            <pre className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
              {JSON.stringify({ patientContext, testResults: testResults.map(r => ({ code: r.rule.code, triggered: r.triggered, actions: r.actions.length })) }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
