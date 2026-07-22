"use client";
import { useState, useEffect, useMemo } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TreatmentSheet } from "@/components/TreatmentSheet";
import { calculateTherapyDay, calculateDoseCompliance, getTherapyDayColor, getDoseComplianceColor, calculateExpectedDosesGiven } from "@/lib/clinical/tracking/dayTracker";
import { DRUG_DATABASE, searchDrugsBasic, getDosingSummary, generateDosingSuggestion } from "@/src/data/formulary/drugDatabase";

interface Props {
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientWeight?: number;
  patientGender?: string;
  doctorId?: string;
  doctorName?: string;
  encounterId?: string;
}

interface SimpleSchedule {
  id: string;
  prescriptionId: string;
  status: string;
  scheduledTime?: any;
  actualTime?: any;
  doseNumber: number;
}

interface SimplePrescription {
  id: string;
  medication?: string;
  medicationName?: string;
  dosage?: string;
  dose?: any;
  route?: string;
  frequency?: string;
  duration?: string;
  indication?: string;
  startDate?: any;
  status?: string;
  active?: boolean;
  doctorName?: string;
  [key: string]: any;
}

const toDate = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === "function") return v.toDate();
  return null;
};

const getMedName = (rx: SimplePrescription): string => rx.medicationName || rx.medication || "";
const getDose = (rx: SimplePrescription): string => String(rx.dosage || rx.dose || "");

export default function DoctorMedicationTracker({
  patientId,
  patientName,
  patientAge,
  patientWeight,
  patientGender,
  doctorId,
  doctorName,
  encounterId,
}: Props) {
  const [prescriptions, setPrescriptions] = useState<SimplePrescription[]>([]);
  const [schedules, setSchedules] = useState<SimpleSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "treatment" | "add">("overview");

  const [addForm, setAddForm] = useState({
    drugName: "",
    dose: "",
    route: "IV",
    frequency: "BD",
    duration: "7",
    indication: "",
    isCustom: false,
  });
  const [addSearch, setAddSearch] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [expandedRx, setExpandedRx] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, "prescriptions"),
      where("patientId", "==", patientId),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SimplePrescription)));
      setLoading(false);
    });
    return unsub;
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, "medicationSchedules"),
      where("patientId", "==", patientId),
      orderBy("scheduledTime", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSchedules(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SimpleSchedule)));
    });
    return unsub;
  }, [patientId]);

  const drugSearchResults = useMemo(() => {
    if (addSearch.length < 2) return [];
    return searchDrugsBasic(addSearch);
  }, [addSearch]);

  const activeRx = prescriptions.filter((p) => p.active !== false && p.status !== "stopped");

  const handleAddPrescription = async () => {
    if (!addForm.drugName.trim() || !addForm.dose.trim()) return;
    setAddSaving(true);
    try {
      const selectedDrug = !addForm.isCustom
        ? DRUG_DATABASE[addForm.drugName.toLowerCase().replace(/\s+/g, "_")]
          || searchDrugsBasic(addForm.drugName)[0]
        : null;

      const payload = {
        patientId,
        doctorId: doctorId || "unknown",
        doctorName: doctorName || "Doctor",
        encounterId: encounterId || `enc-${Date.now()}`,
        medication: addForm.drugName.trim(),
        medicationName: addForm.drugName.trim(),
        dosage: addForm.dose.trim(),
        dose: addForm.dose.trim(),
        route: addForm.route,
        frequency: addForm.frequency,
        duration: addForm.duration,
        indication: addForm.indication || "As directed",
        drugClass: selectedDrug?.drugClass || "",
        status: "active",
        active: true,
        prescribedAt: serverTimestamp(),
        startDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instructions: `Give ${addForm.dose} ${addForm.route} ${addForm.frequency} for ${addForm.duration} days`,
        changeHistory: [
          {
            changeType: "prescribed",
            changedBy: doctorName || "Doctor",
            date: new Date().toISOString(),
            reason: addForm.indication || "Clinical need",
          },
        ],
        origin: "inpatient",
        isCustomDrug: addForm.isCustom || !selectedDrug,
        sideEffectsToWatch: selectedDrug?.sideEffects?.slice(0, 5) || [],
        clinicalAlerts: [],
      };

      await addDoc(collection(db, "prescriptions"), payload);

      setAddForm({ drugName: "", dose: "", route: "IV", frequency: "BD", duration: "7", indication: "", isCustom: false });
      setAddSearch("");
      setActiveTab("overview");
    } catch (err) {
      console.error("Failed to add prescription:", err);
    } finally {
      setAddSaving(false);
    }
  };

  const handleStop = async (id: string) => {
    try {
      await updateDoc(doc(db, "prescriptions", id), {
        active: false,
        status: "stopped",
        endDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stoppedBy: doctorId || "unknown",
      });
    } catch (err) {
      console.error("Failed to stop:", err);
    }
  };

  if (!patientId) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 }}>
        Select a patient to view medication tracking
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 }}>
        Loading medication data...
      </div>
    );
  }

  const styles = {
    tab: (active: boolean): React.CSSProperties => ({
      padding: "8px 18px",
      borderRadius: 8,
      border: "none",
      fontSize: 12,
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      background: active ? "#0f766e" : "#f3f4f6",
      color: active ? "#fff" : "#6b7280",
      fontFamily: "inherit",
      transition: "all 0.15s",
    }),
    card: {
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "hidden" as const,
    },
    badge: (color: string, bg: string): React.CSSProperties => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 700,
      background: bg,
      color: color,
    }),
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#0f766e,#14b8a6)",
        padding: "16px 20px",
        color: "#fff",
        borderRadius: "12px 12px 0 0",
        marginBottom: 0,
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Doctor Medication Tracker
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
          {patientName || "Patient"} · {activeRx.length} Active {activeRx.length === 1 ? "Rx" : "Rx"}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <button style={styles.tab(activeTab === "overview")} onClick={() => setActiveTab("overview")}>
          📊 Overview
        </button>
        <button style={styles.tab(activeTab === "treatment")} onClick={() => setActiveTab("treatment")}>
          📋 Treatment Sheet
        </button>
        <button style={styles.tab(activeTab === "add")} onClick={() => setActiveTab("add")}>
          ➕ Add Medication
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: 16 }}>

        {/* ─── ADD MEDICATION TAB ─── */}
        {activeTab === "add" && (
          <div style={styles.card}>
            <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Add New Medication
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                Search the drug database or enter a custom drug name
              </div>
            </div>

            <div style={{ padding: 16 }}>
              {/* Drug Search */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                  Drug Name
                </label>
                <input
                  value={addSearch}
                  onChange={(e) => {
                    setAddSearch(e.target.value);
                    setAddForm((prev) => ({ ...prev, drugName: e.target.value, isCustom: false }));
                  }}
                  placeholder="Search drug database or type custom name..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #d1fae5",
                    fontSize: 13,
                    outline: "none",
                    background: "#f0fdf9",
                    fontFamily: "inherit",
                  }}
                />
                {drugSearchResults.length > 0 && (
                  <div style={{
                    marginTop: 4, border: "1px solid #d1fae5", borderRadius: 8, maxHeight: 160, overflow: "auto",
                    background: "#fff",
                  }}>
                    {drugSearchResults.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setAddSearch(d.name);
                          setAddForm((prev) => ({
                            ...prev,
                            drugName: d.name,
                            dose: d.dosing.adult[0]?.dose || "",
                            route: d.routes[0]?.toUpperCase() || "PO",
                            frequency: d.dosing.adult[0]?.frequency.includes("Once") ? "OD" : d.dosing.adult[0]?.frequency.includes("Twice") ? "BD" : "OD",
                            isCustom: false,
                          }));
                        }}
                        style={{
                          padding: "8px 12px", borderBottom: "1px solid #f3f4f6", cursor: "pointer",
                          fontSize: 12, display: "flex", justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf9")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: "#111827" }}>{d.name}</span>
                          <span style={{ color: "#9ca3af", marginLeft: 6, fontSize: 11 }}>{d.drugClass}</span>
                        </div>
                        <span style={{ color: "#065f46", fontSize: 10, background: "#d1fae5", padding: "1px 6px", borderRadius: 4 }}>
                          {d.therapeuticCategory}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {addSearch && drugSearchResults.length === 0 && (
                  <div style={{
                    marginTop: 4, padding: "8px 12px", background: "#fef3c7", borderRadius: 8,
                    border: "1px solid #fde68a", fontSize: 11, color: "#92400e",
                  }}>
                    "{addSearch}" not in database. It will be added as a custom drug.
                    <button
                      onClick={() => setAddForm((prev) => ({ ...prev, isCustom: true }))}
                      style={{
                        marginLeft: 8, padding: "2px 8px", borderRadius: 4, border: "1px solid #92400e",
                        background: "#fff", color: "#92400e", fontSize: 10, cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      Add as custom
                    </button>
                  </div>
                )}
              </div>

              {/* Dose, Route, Frequency, Duration */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                    Dose
                  </label>
                  <input
                    value={addForm.dose}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, dose: e.target.value }))}
                    placeholder="e.g. 1g"
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6, border: "1.5px solid #e5e7eb",
                      fontSize: 12, outline: "none", fontFamily: "monospace",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                    Route
                  </label>
                  <select
                    value={addForm.route}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, route: e.target.value }))}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6, border: "1.5px solid #e5e7eb",
                      fontSize: 12, outline: "none", background: "#fff",
                    }}
                  >
                    {["IV", "IM", "SC", "PO", "SL", "PR", "Inhaler", "Topical", "Nebulised", "NG", "IO"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                    Frequency
                  </label>
                  <select
                    value={addForm.frequency}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, frequency: e.target.value }))}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6, border: "1.5px solid #e5e7eb",
                      fontSize: 12, outline: "none", background: "#fff",
                    }}
                  >
                    {["OD", "BD", "TDS", "QDS", "Q4H", "Q6H", "Q8H", "Q12H", "Nocte", "PRN", "Stat", "Weekly"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={addForm.duration}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, duration: e.target.value }))}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 6, border: "1.5px solid #e5e7eb",
                      fontSize: 12, outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Indication */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                  Indication
                </label>
                <input
                  value={addForm.indication}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, indication: e.target.value }))}
                  placeholder="e.g. Community-acquired pneumonia"
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb",
                    fontSize: 12, outline: "none",
                  }}
                />
              </div>

              {/* Dosing Reference from Database */}
              {!addForm.isCustom && drugSearchResults.length > 0 && (
                <div style={{
                  marginBottom: 12, padding: "10px 14px", background: "#f0f9ff", borderRadius: 8,
                  border: "1px solid #bae6fd", fontSize: 11, color: "#075985",
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, textTransform: "uppercase", fontSize: 9, letterSpacing: "0.05em" }}>
                    📋 Dosing Reference
                  </div>
                  {getDosingSummary(drugSearchResults[0].id, addForm.route.toLowerCase())}
                  {patientAge && patientAge < 18 && drugSearchResults[0].dosing.pediatric && (
                    <div style={{ marginTop: 4, color: "#0369a1" }}>
                      Pediatric: {drugSearchResults[0].dosing.pediatric[0]?.dose} {drugSearchResults[0].dosing.pediatric[0]?.frequency}
                    </div>
                  )}
                  {patientAge && patientAge >= 65 && drugSearchResults[0].dosing.elderlyAdjustment && (
                    <div style={{ marginTop: 2, color: "#d97706" }}>
                      ⚠ Elderly: {drugSearchResults[0].dosing.elderlyAdjustment}
                    </div>
                  )}
                  {drugSearchResults[0].dosing.renalAdjustment && drugSearchResults[0].dosing.renalAdjustment !== "No adjustment needed" && (
                    <div style={{ marginTop: 2, color: "#dc2626" }}>
                      ⚠ Renal: {drugSearchResults[0].dosing.renalAdjustment}
                    </div>
                  )}
                  <div style={{ marginTop: 2, color: "#6b7280" }}>
                    Monitor: {drugSearchResults[0].monitoring.slice(0, 3).join(", ")}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setActiveTab("overview"); setAddForm({ drugName: "", dose: "", route: "IV", frequency: "BD", duration: "7", indication: "", isCustom: false }); setAddSearch(""); }}
                  style={{
                    padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                    background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#6b7280",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPrescription}
                  disabled={addSaving || !addForm.drugName || !addForm.dose}
                  style={{
                    padding: "8px 24px", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg,#0f766e,#14b8a6)",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    opacity: addSaving || !addForm.drugName || !addForm.dose ? 0.6 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {addSaving ? "Adding..." : addForm.isCustom ? "💊 Add Custom Drug" : "💊 Issue Prescription"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeRx.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px", background: "#f9fafb",
                borderRadius: 12, border: "2px dashed #e5e7eb", color: "#9ca3af",
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>No Active Prescriptions</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Go to <strong>"Add Medication"</strong> tab to prescribe
                </div>
                <button
                  onClick={() => setActiveTab("add")}
                  style={{
                    marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "none",
                    background: "#0f766e", color: "#fff", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  + Add Medication
                </button>
              </div>
            ) : (
              activeRx.map((rx) => {
                const rxSchedules = schedules.filter((s) => s.prescriptionId === rx.id);
                const therapyDay = calculateTherapyDay(rx.startDate, rx.duration);
                const compliance = calculateDoseCompliance(rxSchedules);
                const expected = calculateExpectedDosesGiven(rx.startDate, rx.frequency || "OD", compliance.totalGiven);
                const medName = getMedName(rx);
                const drugInfo = DRUG_DATABASE[medName.toLowerCase().replace(/\s+/g, "_")]
                  || searchDrugsBasic(medName)[0];

                const todaySchedules = rxSchedules.filter((s) => {
                  const d = toDate(s.scheduledTime);
                  return d && d.toDateString() === new Date().toDateString();
                });

                return (
                  <div key={rx.id} style={styles.card}>
                    <div
                      onClick={() => setExpandedRx(expandedRx === rx.id ? null : rx.id)}
                      style={{
                        padding: "14px 16px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14,
                      }}
                    >
                      {/* Day Badge */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        minWidth: 50, padding: "6px 10px", borderRadius: 10,
                        background: getTherapyDayColor(therapyDay.status) + "15",
                        border: `1.5px solid ${getTherapyDayColor(therapyDay.status)}`,
                      }}>
                        <span style={{
                          fontSize: 18, fontWeight: 800,
                          color: getTherapyDayColor(therapyDay.status),
                        }}>
                          {therapyDay.label || "On"}
                        </span>
                        <span style={{ fontSize: 8, color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>
                          Days
                        </span>
                      </div>

                      {/* Medication Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{medName}</span>
                          {rx.isCustomDrug && (
                            <span style={styles.badge("#92400e", "#fef3c7")}>Custom</span>
                          )}
                          {compliance.status === "critical" && (
                            <span style={styles.badge("#dc2626", "#fee2e2")}>⚠ Critical</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
                          <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{getDose(rx)}</span>
                          {" · "}{rx.route}{" · "}{rx.frequency}
                          {rx.indication && <span> · <span style={{ color: "#3b82f6" }}>{rx.indication}</span></span>}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                          {/* Compliance bar */}
                          <div style={{
                            flex: 1, height: 4, background: "#e5e7eb", borderRadius: 2,
                            maxWidth: 120, overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%", borderRadius: 2,
                              width: `${compliance.compliancePercentage}%`,
                              background: getDoseComplianceColor(compliance.status),
                              transition: "width 0.5s",
                            }} />
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: getDoseComplianceColor(compliance.status),
                          }}>
                            {compliance.compliancePercentage}%
                          </span>
                          {therapyDay.status === "in_progress" && (
                            <span style={{ fontSize: 10, color: "#6b7280" }}>
                              {therapyDay.daysRemaining > 0
                                ? `${therapyDay.daysRemaining}d remaining`
                                : "Last day"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>{expected.given}</div>
                          <div style={{ fontSize: 8, color: "#9ca3af" }}>Given</div>
                        </div>
                        <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#6b7280" }}>{expected.expected}</div>
                          <div style={{ fontSize: 8, color: "#9ca3af" }}>Expected</div>
                        </div>
                        <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStop(rx.id); }}
                          style={{
                            padding: "4px 10px", borderRadius: 6, border: "none",
                            background: "#fee2e2", color: "#dc2626", fontSize: 10,
                            fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Stop
                        </button>
                      </div>
                    </div>

                    {/* Expanded: Admin timeline */}
                    {expandedRx === rx.id && (
                      <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                        {/* Today's doses */}
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                            Today's Administration
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {todaySchedules.length > 0 ? todaySchedules.map((s) => {
                              const st = toDate(s.scheduledTime);
                              const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
                                taken: { bg: "#d1fae5", text: "#065f46", icon: "✓" },
                                delayed: { bg: "#fef3c7", text: "#92400e", icon: "⏰" },
                                missed: { bg: "#fee2e2", text: "#dc2626", icon: "✗" },
                                pending: { bg: "#f3f4f6", text: "#9ca3af", icon: "○" },
                              };
                              const cs = statusColors[s.status] || statusColors.pending;
                              return (
                                <div key={s.id} style={{
                                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                                  background: cs.bg, color: cs.text, display: "flex", alignItems: "center", gap: 4,
                                }}>
                                  <span>{st?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) || "—"}</span>
                                  <span>·</span>
                                  <span>{cs.icon}</span>
                                </div>
                              );
                            }) : (
                              <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>No doses scheduled today</span>
                            )}
                          </div>
                        </div>

                        {/* Summary Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
                          <SummaryBlock label="Given" value={String(compliance.totalGiven)} color="#10b981" />
                          <SummaryBlock label="Missed" value={String(compliance.totalMissed)} color="#ef4444" />
                          <SummaryBlock label="Pending" value={String(compliance.totalPending)} color="#f59e0b" />
                          <SummaryBlock label="Total" value={String(compliance.totalScheduled)} color="#6b7280" />
                        </div>

                        {/* Drug Info */}
                        {drugInfo && (
                          <div style={{
                            padding: "8px 12px", background: "#f0f9ff", borderRadius: 8,
                            border: "1px solid #bae6fd", fontSize: 10, color: "#075985",
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: 2, textTransform: "uppercase", fontSize: 9, letterSpacing: "0.05em" }}>
                              📋 {drugInfo.name}
                            </div>
                            <div>{drugInfo.drugClass}</div>
                            <div>Standard: {getDosingSummary(drugInfo.id, rx.route?.toLowerCase())}</div>
                            {drugInfo.monitoring.length > 0 && (
                              <div style={{ color: "#6b7280" }}>Watch: {drugInfo.monitoring.slice(0, 3).join(", ")}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TREATMENT SHEET TAB ─── */}
        {activeTab === "treatment" && (
          <TreatmentSheet
            patientId={patientId}
            doctorId={doctorId}
            patientAge={patientAge}
            patientWeight={patientWeight}
            patientGender={patientGender}
          />
        )}
      </div>
    </div>
  );
}

function SummaryBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      textAlign: "center", background: "#fff", borderRadius: 8, padding: "8px 4px",
      border: `1px solid ${color}25`, boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</div>
    </div>
  );
}
