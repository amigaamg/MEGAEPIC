import { Timestamp } from "firebase/firestore";
import type {
  DiseaseJourneyType,
  MedicationEffectivenessScore,
  InventoryPrediction,
  HomeMedicationInventory,
  AdherenceReason,
  SideEffectTracking,
  MedicationComplicationAlert,
  MedicationSwitch,
  DoctorMedicationReview,
} from "../../../types/medication";
import { DRUG_DB, type DrugProfile, type PatientContext } from "../../../lib/clinicalProtocols";

export function determineJourneyType(diagnosis: string, isChronic: boolean): DiseaseJourneyType {
  const acuteConditions = [
    "pneumonia", "malaria", "uti", "gastroenteritis", "meningitis",
    "cellulitis", "appendicitis", "tonsillitis", "bronchitis", "sinusitis",
  ];
  const chronicConditions = [
    "hypertension", "diabetes", "asthma", "ckd", "heart_failure",
    "epilepsy", "hypothyroidism", "hiv", "arthritis", "copd",
  ];

  const dx = diagnosis.toLowerCase();
  if (acuteConditions.some((c) => dx.includes(c))) return "acute";
  if (chronicConditions.some((c) => dx.includes(c)) || isChronic) return "chronic";
  return "acute";
}

export function calculateEffectivenessScore(
  symptomControl: number,
  biomarkerResponse: number,
  adherenceScore: number,
  toleranceScore: number,
  qualityOfLifeImpact: number
): MedicationEffectivenessScore {
  const overall = Math.round(
    symptomControl * 0.25 + biomarkerResponse * 0.25 + adherenceScore * 0.2 + toleranceScore * 0.15 + qualityOfLifeImpact * 0.15
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    symptomControl,
    biomarkerResponse,
    adherenceScore,
    toleranceScore,
    qualityOfLifeImpact,
    calculatedAt: Timestamp.now(),
    trend: "stable",
  };
}

export interface PatientMedicationProfile {
  age: number;
  weight: number;
  renalFunction: { egfr: number };
  liverFunction: { alt: number; ast: number };
  allergies: string[];
  pregnancy: boolean;
  breastfeeding: boolean;
  diagnoses: string[];
  currentDrugs: string[];
  vitals: Record<string, number>;
  labs: Record<string, number>;
}

export function predictInventoryRunout(
  inventory: HomeMedicationInventory,
  dailyDoseCount: number
): InventoryPrediction {
  const dailyUsage = dailyDoseCount;
  const remainingDays = dailyUsage > 0 ? Math.floor(inventory.remainingQuantity / dailyUsage) : 0;
  const estimatedRunOut = new Date();
  estimatedRunOut.setDate(estimatedRunOut.getDate() + remainingDays);

  return {
    medicationId: inventory.id,
    medicationName: inventory.medicationName,
    dailyUsage,
    remainingDays: Math.max(0, remainingDays),
    estimatedRunOutDate: Timestamp.fromDate(estimatedRunOut),
    daysUntilEmpty: Math.max(0, remainingDays),
    refillNeeded: remainingDays <= inventory.lowStockThreshold,
  };
}

export function getAdherenceReasoning(
  adherenceRate: number,
  missedDoses: number,
  recentReasons: AdherenceReason[]
): { primaryIssue: string; suggestions: string[]; riskLevel: "low" | "moderate" | "high" } {
  const reasonCounts: Record<string, number> = {};
  recentReasons.forEach((r) => {
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });
  const mostCommon = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as AdherenceReason | undefined;

  const suggestionMap: Record<AdherenceReason, string[]> = {
    forgot: ["Set phone alarm at consistent times", "Use pillbox organizer", "Link medication to daily routine (e.g., brushing teeth)"],
    side_effects: ["Report side effects to doctor — may improve with time or dose adjustment", "Do not stop without consulting your doctor"],
    cost: ["Ask about generic alternatives", "Check insurance coverage for medications", "Ask about patient assistance programs"],
    felt_better: ["Continue medication even when feeling better — it's working!", "Stopping early can cause relapse"],
    felt_worse: ["Report worsening symptoms — may need dose adjustment, not discontinuation", "Some medications cause temporary worsening before improvement"],
    hopelessness: ["Talk to your doctor or counselor about how you're feeling", "You're not alone — many people struggle with long-term medications"],
    religious: ["Discuss religious concerns with your doctor who may find alternatives", "Some religious accommodations exist for medication timing"],
    stigma: ["Medication is treatment, not a moral issue", "Healthcare is confidential — your information is protected"],
    confused: ["Ask your doctor or pharmacist for clearer instructions", "Use the AMEXAN app for step-by-step medication guidance"],
    no_transport: ["Ask about home delivery options", "Telepharmacy consultations available", "Family member or friend can pick up for you"],
    no_refill: ["Set auto-refill in the app", "We can send refill reminders", "Check nearby pharmacy stock through AMEXAN"],
    difficulty_swallowing: ["Ask about liquid formulations", "Some tablets can be crushed — check with pharmacist", "Ask about smaller tablets or different forms"],
    inconvenient_timing: ["Discuss alternative dosing schedules with your doctor", "Once-daily options may be available"],
    other: ["Contact your healthcare provider for personalized support"],
  };

  const suggestions = mostCommon ? suggestionMap[mostCommon] || suggestionMap.other : suggestionMap.other;

  let riskLevel: "low" | "moderate" | "high" = "low";
  if (adherenceRate < 50 || missedDoses > 10) riskLevel = "high";
  else if (adherenceRate < 75 || missedDoses > 5) riskLevel = "moderate";

  return {
    primaryIssue: mostCommon
      ? `Primary adherence barrier: ${mostCommon.replace(/_/g, " ")}`
      : "Adherence needs improvement",
    suggestions,
    riskLevel,
  };
}

export function detectMedicationComplications(
  drug: string,
  durationDays: number,
  dose: string,
  patient: PatientMedicationProfile,
  sideEffects: SideEffectTracking[]
): MedicationComplicationAlert[] {
  const alerts: MedicationComplicationAlert[] = [];
  const drugInfo = DRUG_DB[drug];
  if (!drugInfo) return [];

  if (drugInfo.monitoring.some((m) => m.toLowerCase().includes("renal") || m.toLowerCase().includes("egfr"))) {
    if (patient.renalFunction.egfr < 30) {
      alerts.push({
        id: `renal-${drug}-${Date.now()}`,
        patientId: "",
        prescriptionId: "",
        complication: "Renal impairment risk",
        risk: "high",
        detectedAt: Timestamp.now(),
        triggerValue: `eGFR ${patient.renalFunction.egfr}`,
        recommendation: `eGFR <30 — ${drug} may require dose adjustment or alternative. ${drugInfo.doses[0]?.renal || "Consult nephrology"}`,
        acknowledged: false,
      });
    }
  }

  if (drugInfo.class.toLowerCase().includes("nsaid") || drugInfo.class.toLowerCase().includes("anticoagulant")) {
    const hasGiBleedRisk = patient.currentDrugs.some((m) => m.includes("warfarin") || m.includes("aspirin") || m.includes("clopidogrel"));
    if (hasGiBleedRisk) {
      alerts.push({
        id: `gi-${drug}-${Date.now()}`,
        patientId: "",
        prescriptionId: "",
        complication: "GI bleed risk",
        risk: "high",
        detectedAt: Timestamp.now(),
        recommendation: "Concurrent anticoagulant + NSAID use — consider PPI prophylaxis, monitor for melena",
        acknowledged: false,
      });
    }
  }

  if (durationDays > 180 && drugInfo.class.toLowerCase().includes("corticosteroid")) {
    alerts.push({
      id: `steroid-${drug}-${Date.now()}`,
      patientId: "",
      prescriptionId: "",
      complication: "Long-term steroid complications",
      risk: "moderate",
      detectedAt: Timestamp.now(),
      triggerValue: `${durationDays} days of use`,
      recommendation: "Consider bone protection (calcium + vitamin D, bisphosphonate). Monitor for hyperglycemia, osteoporosis",
      acknowledged: false,
    });
  }

  const recentSevereSideEffects = sideEffects.filter((se) => se.severity === "severe");
  if (recentSevereSideEffects.length > 0) {
    alerts.push({
      id: `se-${drug}-${Date.now()}`,
      patientId: "",
      prescriptionId: "",
      complication: "Severe side effects reported",
      risk: "high",
      detectedAt: Timestamp.now(),
      recommendation: `${recentSevereSideEffects.length} severe side effect(s) reported. Consider medication review or switch.`,
      acknowledged: false,
    });
  }

  return alerts;
}

export function generateSwitchRationale(
  fromDrug: string,
  toDrug: string,
  reason: MedicationSwitch["reason"],
  patient: PatientMedicationProfile
): string {
  const fromInfo = DRUG_DB[fromDrug];
  const toInfo = DRUG_DB[toDrug];

  const rationales: Record<MedicationSwitch["reason"], string> = {
    ineffective: `Patient has inadequate response to ${fromInfo?.name || fromDrug}. Switching to ${toInfo?.name || toDrug} which has superior efficacy profile.`,
    side_effects: `Patient experiencing unacceptable side effects from ${fromInfo?.name || fromDrug}. ${toInfo?.name || toDrug} has more favorable side effect profile.`,
    interaction: `${fromInfo?.name || fromDrug} has significant drug interactions with current medications. ${toInfo?.name || toDrug} is a safer alternative.`,
    cost: `${fromInfo?.name || fromDrug} is cost-prohibitive. ${toInfo?.name || toDrug} provides equivalent efficacy at lower cost.`,
    availability: `${fromInfo?.name || fromDrug} is currently unavailable. ${toInfo?.name || toDrug} is the nearest therapeutic equivalent available.`,
    adherence: `${fromInfo?.name || fromDrug} requires complex dosing. ${toInfo?.name || toDrug} offers once-daily dosing for improved adherence.`,
    pregnancy: `${fromInfo?.name || fromDrug} is contraindicated in pregnancy. ${toInfo?.name || toDrug} is the safer alternative.`,
    allergy: `Patient has allergy/hypersensitivity to ${fromInfo?.name || fromDrug}. ${toInfo?.name || toDrug} is a chemically distinct alternative.`,
    contraindication: `${fromInfo?.name || fromDrug} is contraindicated due to ${patient.diagnoses.join(", ")}. ${toInfo?.name || toDrug} is safe.`,
    formulary_change: `Formulary update: ${fromInfo?.name || fromDrug} replaced by ${toInfo?.name || toDrug} per facility protocol.`,
  };

  return rationales[reason] || `Clinical decision to switch from ${fromDrug} to ${toDrug}.`;
}

export function generateDoctorReview(
  patient: PatientMedicationProfile,
  sideEffects: SideEffectTracking[],
  adherenceRate: number,
  missedDoses: number,
  recentReasons: AdherenceReason[],
  activeDrugs: string[]
): DoctorMedicationReview {
  const adherenceSummary: DoctorMedicationReview["adherenceSummary"] = {
    overallPercentage: adherenceRate,
    trend: adherenceRate >= 80 ? "improving" : adherenceRate >= 60 ? "stable" : "worsening",
    missedDoses30d: missedDoses,
    commonReasons: recentReasons.map((r) => r.replace(/_/g, " ")),
  };

  const severeSideEffects = sideEffects.filter((se) => se.severity === "severe");
  const sideEffectBurden = {
    totalActive: sideEffects.filter((se) => !se.resolvedAt).length,
    severe: severeSideEffects.length,
    requiresAction: severeSideEffects.length > 0,
  };

  const recommendations: string[] = [];
  const medicationChanges: DoctorMedicationReview["medicationChanges"] = [];

  if (adherenceRate < 70) {
    recommendations.push("Address adherence barriers — consider once-daily alternatives, pillbox, or caregiver support");
    recommendations.push(`Common reasons: ${adherenceSummary.commonReasons.join(", ")}`);
  }
  if (sideEffectBurden.requiresAction) {
    recommendations.push(`Urgent medication review needed — ${sideEffectBurden.severe} severe side effect(s) active`);
  }
  if (adherenceSummary.trend === "worsening") {
    recommendations.push("Escalating non-adherence — consider simpler regimen, more frequent follow-up, or home visit");
  }

  activeDrugs.forEach((drug) => {
    const drugSideEffects = sideEffects.filter((se) => se.prescriptionId === drug || se.sideEffect.includes(drug));
    if (drugSideEffects.filter((se) => se.severity === "severe").length > 0) {
      medicationChanges.push({
        drugId: drug,
        action: "switch",
        reason: "Severe side effects",
      });
    }
  });

  return {
    id: `review-${Date.now()}`,
    patientId: "",
    doctorId: "",
    reviewedAt: Timestamp.now(),
    reviewType: "routine",
    adherenceSummary,
    effectivenessSummary: {
      score: Math.round(adherenceRate * 0.4 + (100 - sideEffectBurden.totalActive * 10) * 0.3 + 70 * 0.3),
      controlled: adherenceRate >= 80 && sideEffectBurden.severe === 0,
      notes: "",
    },
    sideEffectBurden,
    recommendations,
    medicationChanges,
  };
}

export function scheduleGenerator(
  frequency: string,
  startDate: Date,
  endDate: Date
): { scheduledTime: Date; doseNumber: number }[] {
  const freqMap: Record<string, number> = {
    od: 24, daily: 24, "once daily": 24,
    bd: 12, "twice daily": 12, bid: 12,
    tds: 8, "three times daily": 8, tid: 8,
    qds: 6, qid: 6, "four times daily": 6,
    q4h: 4, q6h: 6, q8h: 8, q12h: 12,
    nocte: 24, "at night": 24,
    weekly: 168, "once weekly": 168,
  };

  const intervalHours = freqMap[frequency.toLowerCase().trim()] || 24;
  const schedule: { scheduledTime: Date; doseNumber: number }[] = [];
  let current = new Date(startDate);
  let doseNum = 1;

  while (current <= endDate && doseNum <= 500) {
    schedule.push({ scheduledTime: new Date(current), doseNumber: doseNum });
    current = new Date(current.getTime() + intervalHours * 3600000);
    doseNum++;
  }

  return schedule;
}

export const EDUCATION_CONTENT: Record<string, { title: string; content: string; whyItMatters: string }[]> = {
  antibiotics: [
    {
      title: "Why Finish Your Antibiotics",
      content: "Even if you feel better, some bacteria may still be alive. Stopping early can cause the infection to return and become resistant to treatment.",
      whyItMatters: "Antibiotic resistance is one of the biggest global health threats. By finishing your course, you protect yourself and your community.",
    },
    {
      title: "Taking Antibiotics Correctly",
      content: "Take at evenly spaced intervals. Set alarms. Do not skip doses. Complete the full course even if you feel better.",
      whyItMatters: "Proper timing keeps a steady level of medicine in your blood to kill bacteria effectively.",
    },
  ],
  insulin: [
    {
      title: "Why Insulin Timing Matters",
      content: "Taking insulin at the right time prevents dangerous blood sugar swings. Rapid-acting insulin works in 15 minutes — eat immediately after injecting.",
      whyItMatters: "Correct timing prevents both high blood sugar (hyperglycemia) and dangerous low blood sugar (hypoglycemia).",
    },
    {
      title: "Storing Insulin Properly",
      content: "Store unopened insulin in the refrigerator (2-8°C). Never freeze. Once opened, keep at room temperature for up to 28 days. Avoid direct heat and sunlight.",
      whyItMatters: "Improper storage destroys insulin's effectiveness, leading to poor blood sugar control.",
    },
  ],
  inhalers: [
    {
      title: "Correct Inhaler Technique",
      content: "Shake the inhaler. Exhale fully. Place mouthpiece between teeth and seal lips. Press down once while breathing in SLOWLY and DEEPLY. Hold breath for 10 seconds. Wait 30 seconds between puffs.",
      whyItMatters: "90% of people use inhalers incorrectly. Good technique means more medicine reaches your lungs, not your mouth and throat.",
    },
  ],
};

export function getEducationForDrug(drugId: string): { title: string; content: string; whyItMatters: string }[] {
  const drugInfo = DRUG_DB[drugId];
  if (!drugInfo) return [];

  const content: { title: string; content: string; whyItMatters: string }[] = [];

  content.push({
    title: `About ${drugInfo.name}`,
    content: `${drugInfo.name} is a ${drugInfo.class}. ${drugInfo.instructions}`,
    whyItMatters: "Understanding your medication helps you take it correctly and safely.",
  });

  if (drugInfo.sideEffects.length > 0) {
    content.push({
      title: `Side Effects of ${drugInfo.name}`,
      content: `Common side effects: ${drugInfo.sideEffects.slice(0, 5).join(", ")}. Most resolve over time. Contact your doctor if severe.`,
      whyItMatters: "Knowing what to expect helps you distinguish normal side effects from dangerous reactions.",
    });
  }

  content.push({
    title: `Taking ${drugInfo.name} Correctly`,
    content: drugInfo.instructions,
    whyItMatters: "Correct administration ensures maximum benefit and minimum side effects.",
  });

  if (drugInfo.counselling) {
    content.push({
      title: `Important Advice About ${drugInfo.name}`,
      content: drugInfo.counselling,
      whyItMatters: "Key safety information every patient should know.",
    });
  }

  return content;
}

export function generateChallengesForPatient(
  patientId: string,
  diagnoses: string[],
  adherenceRate: number
): { title: string; description: string; type: string; goal: string; durationDays: number }[] {
  const challenges: { title: string; description: string; type: string; goal: string; durationDays: number }[] = [];

  if (adherenceRate < 80) {
    challenges.push({
      title: "7-Day Perfect Adherence Streak",
      description: "Take all your medications on time for 7 consecutive days. You can do this!",
      type: "adherence_streak",
      goal: "7 days of 100% adherence",
      durationDays: 7,
    });
  }

  if (diagnoses.some((d) => d.toLowerCase().includes("hypertension"))) {
    challenges.push({
      title: "30-Day Blood Pressure Challenge",
      description: "Keep your BP below target for 30 days. Check regularly and take medications consistently.",
      type: "bp_target",
      goal: "Systolic BP <130 mmHg for 30 days",
      durationDays: 30,
    });
  }

  if (diagnoses.some((d) => d.toLowerCase().includes("diabetes"))) {
    challenges.push({
      title: "90-Day Glucose Control Goal",
      description: "Achieve fasting glucose below target for 90 days through medication adherence and lifestyle.",
      type: "glucose_target",
      goal: "Fasting glucose 4-7 mmol/L for 90 days",
      durationDays: 90,
    });
  }

  if (challenges.length === 0) {
    challenges.push({
      title: "Medication Consistency Goal",
      description: "Build a strong medication habit. Take every dose on time for 30 days.",
      type: "medication_consistency",
      goal: "30 days of consistent medication taking",
      durationDays: 30,
    });
  }

  return challenges;
}
