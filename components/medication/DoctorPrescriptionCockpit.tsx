"use client";
import { useState, useMemo } from "react";
import { Timestamp, serverTimestamp, addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DRUG_DB, checkPrescriptionIntelligence, DISEASE_PROTOCOLS, type PatientContext } from "@/lib/clinicalProtocols";
import type { DiseaseJourneyType } from "@/types/medication";
import { determineJourneyType, getEducationForDrug } from "@/src/engine/medication/journeyEngine";

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  weight: number;
  allergies: string[];
  diagnoses: string[];
  currentMeds: string[];
  labs: Record<string, number>;
  vitals: Record<string, number>;
}

interface Props {
  patient: PatientInfo;
  doctorId: string;
  doctorName: string;
  onPrescribed: (prescription: any) => void;
  encounterId?: string;
  origin?: "outpatient" | "inpatient" | "emergency";
}

export default function DoctorPrescriptionCockpit({
  patient,
  doctorId,
  doctorName,
  onPrescribed,
  encounterId,
  origin = "outpatient",
}: Props) {
  return null;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("OD");
  const [route, setRoute] = useState("PO");
  const [duration, setDuration] = useState("7");
  const [instructions, setInstructions] = useState("");
  const [indication, setIndication] = useState("");
  const [journeyType, setJourneyType] = useState<DiseaseJourneyType>("acute");
  const [refills, setRefills] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [intelligence, setIntelligence] = useState<any>(null);

  const patientCtx: PatientContext = useMemo(
    () => ({
      age: patient.age,
      sex: patient.sex,
      weight: patient.weight,
      allergies: patient.allergies,
      labs: patient.labs,
      currentMeds: patient.currentMeds,
      diagnoses: patient.diagnoses,
    }),
    [patient]
  );

  const filteredDrugs = useMemo(() => {
    if (!searchQuery) {
      if (selectedDiagnosis) {
        const protocol = DISEASE_PROTOCOLS[selectedDiagnosis];
        if (protocol) return protocol.firstLine.map((id) => DRUG_DB[id]).filter(Boolean);
      }
      return Object.values(DRUG_DB).slice(0, 20);
    }
    const q = searchQuery.toLowerCase();
    return Object.values(DRUG_DB).filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.class.toLowerCase().includes(q) ||
        d.doses.some((dd) => dd.indication.toLowerCase().includes(q))
    );
  }, [searchQuery, selectedDiagnosis]);

  const protocols = useMemo(() => Object.entries(DISEASE_PROTOCOLS), []);

  const handleSelectDrug = (drugId: string) => {
    setSelectedDrug(drugId);
    const drug = DRUG_DB[drugId];
    if (drug) {
      setDose(drug.doses[0]?.start || "");
      setRoute(drug.route);
      setIndication(drug.doses[0]?.indication || "");
      setInstructions(drug.instructions || "");
      setJourneyType(determineJourneyType(selectedDiagnosis, false));
      setShowEducation(true);
      const ctx = checkPrescriptionIntelligence(drugId, patientCtx);
      setIntelligence(ctx);
    }
  };

  const handlePrescribe = async () => {
    if (!selectedDrug || !dose || !frequency) return;
    setSaving(true);
    try {
      const drugInfo = DRUG_DB[selectedDrug];
      const payload = {
        patientId: patient.id,
        patientName: patient.name,
        doctorId,
        doctorName,
        encounterId: encounterId || `enc-${Date.now()}`,
        medication: drugInfo?.name || selectedDrug,
        medicationName: drugInfo?.name || selectedDrug,
        drugClass: drugInfo?.class || "",
        dose,
        dosage: dose,
        route,
        frequency,
        frequencyCode: frequency,
        duration,
        indication: indication || selectedDiagnosis,
        journeyType,
        origin,
        instructions: instructions || `Give ${dose} ${route} ${frequency} for ${duration} days`,
        refills,
        status: "active",
        active: true,
        prescribedAt: serverTimestamp(),
        startDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        changeHistory: [
          {
            changeType: "prescribed",
            changedBy: doctorName,
            date: new Date().toISOString(),
            reason: indication || selectedDiagnosis,
          },
        ],
        doseChanges: [],
        sideEffectsToWatch: drugInfo?.sideEffects?.slice(0, 5) || [],
        clinicalAlerts: intelligence?.warnings || [],
        educationContent: getEducationForDrug(selectedDrug),
      };

      const docRef = await addDoc(collection(db, "prescriptions"), payload);
      onPrescribed({ id: docRef.id, ...payload });
      setSelectedDrug(null);
      setSearchQuery("");
      setDose("");
      setInstructions("");
    } catch (err: any) {
      console.error("Failed to prescribe:", err);
    } finally {
      setSaving(false);
    }
  };

  const css = `
    .rx-cockpit { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
    .rx-cockpit input::placeholder { color: #9ca3af; }
  `;

  return (
    <div className="rx-cockpit">
      <style>{css}</style>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, minHeight: "70vh" }}>
        {/* Left Panel - Drug Browser */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Medication Browser
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drugs, classes, indications..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                fontSize: 13,
                outline: "none",
                background: "#f9fafb",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#14b8a6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {selectedDiagnosis && (
            <div style={{ padding: "8px 16px", background: "#f0fdf9", borderBottom: "1px solid #d1fae5" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                Protocol: {DISEASE_PROTOCOLS[selectedDiagnosis]?.name || selectedDiagnosis}
              </div>
              <div style={{ fontSize: 11, color: "#065f46", marginTop: 2 }}>
                First-line: {DISEASE_PROTOCOLS[selectedDiagnosis]?.firstLine.join(", ") || "—"}
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {filteredDrugs.map((drug) => {
              if (!drug) return null;
              const drugId = Object.entries(DRUG_DB).find(([, d]) => d.name === drug.name)?.[0];
              return (
                <div
                  key={drugId}
                  onClick={() => drugId && handleSelectDrug(drugId)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: selectedDrug === drugId ? "#f0fdf9" : "transparent",
                    border: selectedDrug === drugId ? "1.5px solid #14b8a6" : "1px solid transparent",
                    marginBottom: 4,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (selectedDrug !== drugId) e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (selectedDrug !== drugId) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{drug.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{drug.class}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{drug.doses[0]?.start} · {drug.route}</div>
                </div>
              );
            })}
          </div>

          {/* Diagnosis selector */}
          <div style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
            <select
              value={selectedDiagnosis}
              onChange={(e) => setSelectedDiagnosis(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                fontSize: 12,
                background: "#fff",
              }}
            >
              <option value="">Select diagnosis protocol...</option>
              {protocols.map(([id, proto]) => (
                <option key={id} value={id}>{proto.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Panel - Prescription Builder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!selectedDrug ? (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
              borderRadius: 16,
              border: "2px dashed #e5e7eb",
              color: "#9ca3af",
              fontSize: 14,
              textAlign: "center",
              padding: 40,
            }}>
              <div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💊</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Start Prescribing</div>
                <div>Search or browse for a medication,<br />or select a diagnosis protocol</div>
              </div>
            </div>
          ) : (
            <>
              {/* Drug Details + Intelligence */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{
                  background: "linear-gradient(135deg,#0f766e,#14b8a6)",
                  padding: "16px 20px",
                  color: "#fff",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    AMEXAN · Prescribing Intelligence
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                    {selectedDrug ? (DRUG_DB[selectedDrug!]?.name || selectedDrug) : ''}
                  </div>
                   <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{selectedDrug ? DRUG_DB[selectedDrug!]?.class : ''}</div>
                </div>

                <div style={{ padding: 16 }}>
                  {/* Intelligence Warnings */}
                  {intelligence && (intelligence.warnings.length > 0 || intelligence.suggestions.length > 0) && (
                    <div style={{ marginBottom: 16 }}>
                      {intelligence.warnings.map((w: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            marginBottom: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: w.level === "emergency" ? "#fef2f2" : w.level === "urgent" ? "#fff7ed" : "#f0f9ff",
                            border: `1px solid ${w.level === "emergency" ? "#fecaca" : w.level === "urgent" ? "#fed7aa" : "#bae6fd"}`,
                            color: w.level === "emergency" ? "#991b1b" : w.level === "urgent" ? "#78350f" : "#075985",
                          }}
                        >
                          <span style={{ fontWeight: 800, textTransform: "uppercase" }}>{w.level}: </span>
                          {w.msg}
                        </div>
                      ))}
                      {intelligence.suggestions.map((s: string, i: number) => (
                        <div
                          key={`sug-${i}`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            marginTop: 4,
                            fontSize: 11,
                            background: "#f0fdf9",
                            border: "1px solid #d1fae5",
                            color: "#065f46",
                          }}
                        >
                          💡 {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dosing Form */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Dose
                      </label>
                      <input
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 13,
                          marginTop: 4,
                          outline: "none",
                          fontFamily: "monospace",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Frequency
                      </label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 13,
                          marginTop: 4,
                          background: "#fff",
                        }}
                      >
                        {["OD", "BD", "TDS", "QDS", "Q4H", "Q6H", "Q8H", "Q12H", "Nocte", "PRN", "Stat", "Weekly"].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Route
                      </label>
                      <select
                        value={route}
                        onChange={(e) => setRoute(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 13,
                          marginTop: 4,
                          background: "#fff",
                        }}
                      >
                        {["PO", "IV", "IM", "SC", "SL", "PR", "Inhaler", "Topical", "Nebulised", "NG", "IO"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 13,
                          marginTop: 4,
                          outline: "none",
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Indication
                      </label>
                      <input
                        value={indication}
                        onChange={(e) => setIndication(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 13,
                          marginTop: 4,
                          outline: "none",
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Patient Instructions
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 12,
                          marginTop: 4,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>

                  {/* Journey Type */}
                  <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Journey:</span>
                    {(["acute", "chronic", "lifelong"] as const).map((jt) => (
                      <button
                        key={jt}
                        onClick={() => setJourneyType(jt)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: `1.5px solid ${journeyType === jt ? "#14b8a6" : "#e5e7eb"}`,
                          background: journeyType === jt ? "#f0fdf9" : "#fff",
                          color: journeyType === jt ? "#0f766e" : "#6b7280",
                          textTransform: "capitalize",
                        }}
                      >
                        {jt}
                      </button>
                    ))}
                    <span style={{ marginLeft: "auto" }}>
                      <select
                        value={refills}
                        onChange={(e) => setRefills(parseInt(e.target.value))}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1.5px solid #e5e7eb",
                          fontSize: 11,
                          background: "#fff",
                        }}
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n} refills</option>
                        ))}
                      </select>
                    </span>
                  </div>

                  {/* AI Dosing Suggestions */}
                  {selectedDrug != null && DRUG_DB[selectedDrug!] && (
                    <div style={{ marginTop: 12, padding: 12, background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", marginBottom: 6 }}>
                        Dosing Intelligence
                      </div>
                      {DRUG_DB[selectedDrug!].doses.map((dd, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#075985", marginBottom: 2 }}>
                          • {dd.indication}: {dd.start} → max {dd.max}
                        </div>
                      ))}
                      {patientCtx.labs.egfr !== undefined && (
                        <div style={{ fontSize: 11, color: "#075985", marginTop: 4 }}>
                          🩺 eGFR {patientCtx.labs.egfr}: {DRUG_DB[selectedDrug!].doses[0]?.renal || "Standard dosing"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action */}
                  <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setSelectedDrug(null)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: "1.5px solid #e5e7eb",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6b7280",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePrescribe}
                      disabled={saving || !dose}
                      style={{
                        padding: "8px 24px",
                        borderRadius: 8,
                        border: "none",
                        background: "linear-gradient(135deg,#0f766e,#14b8a6)",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? "Prescribing..." : "💊 Issue Prescription"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Education Preview */}
              {showEducation && selectedDrug && (
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Patient Education Preview
                  </div>
                  {selectedDrug != null && getEducationForDrug(selectedDrug!).slice(0, 2).map((edu, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: 10, background: "#f0fdf9", borderRadius: 8, border: "1px solid #d1fae5" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>{edu.title}</div>
                      <div style={{ fontSize: 11, color: "#047857", marginTop: 2 }}>{edu.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
