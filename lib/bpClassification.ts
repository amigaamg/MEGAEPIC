// lib/bpClassification.ts
// AMEXAN BP Intelligence Engine

export type BPCategory =
  | "normal"
  | "elevated"
  | "stage1"
  | "stage2"
  | "crisis";

export interface BPClassification {
  category: BPCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  action: string;
}

export function classifyBP(sys: number, dia: number): BPClassification {
  if (sys >= 180 || dia >= 120) {
    return {
      category: "crisis",
      label: "Hypertensive Crisis",
      color: "#ff1744",
      bgColor: "rgba(255,23,68,0.15)",
      borderColor: "#ff1744",
      textColor: "#ff6b8a",
      description: "Immediate medical attention required",
      action: "EMERGENCY",
    };
  }
  if (sys >= 140 || dia >= 90) {
    return {
      category: "stage2",
      label: "Stage 2 HTN",
      color: "#ff5722",
      bgColor: "rgba(255,87,34,0.12)",
      borderColor: "#ff5722",
      textColor: "#ff8a65",
      description: "High BP — Medication adjustment needed",
      action: "URGENT",
    };
  }
  if (sys >= 130 || dia >= 80) {
    return {
      category: "stage1",
      label: "Stage 1 HTN",
      color: "#ff9800",
      bgColor: "rgba(255,152,0,0.12)",
      borderColor: "#ff9800",
      textColor: "#ffb74d",
      description: "Elevated — Lifestyle changes + possible medication",
      action: "MONITOR",
    };
  }
  if (sys >= 120) {
    return {
      category: "elevated",
      label: "Elevated",
      color: "#ffc107",
      bgColor: "rgba(255,193,7,0.10)",
      borderColor: "#ffc107",
      textColor: "#ffd54f",
      description: "Above normal — Lifestyle modification advised",
      action: "WATCH",
    };
  }
  return {
    category: "normal",
    label: "Normal",
    color: "#00e676",
    bgColor: "rgba(0,230,118,0.10)",
    borderColor: "#00e676",
    textColor: "#69f0ae",
    description: "BP well controlled",
    action: "GOOD",
  };
}

export function getBPDotColor(sys: number, dia: number): string {
  return classifyBP(sys, dia).color;
}

export function calculateAdherence(
  readings: { recordedAt: Date | { toDate: () => Date } }[],
  daysBack: number = 30,
  expectedPerDay: number = 2
): {
  percentage: number;
  totalExpected: number;
  totalLogged: number;
  dailyMap: Record<string, number>;
} {
  const totalExpected = daysBack * expectedPerDay;
  const totalLogged = readings.length;
  const percentage = Math.min(
    100,
    Math.round((totalLogged / totalExpected) * 100)
  );

  // Build daily map
  const dailyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = 0;
  }
  readings.forEach((r) => {
    const dt = "toDate" in r.recordedAt ? r.recordedAt.toDate() : r.recordedAt;
    const key = new Date(dt).toISOString().split("T")[0];
    if (key in dailyMap) {
      dailyMap[key]++;
    }
  });

  return { percentage, totalExpected, totalLogged, dailyMap };
}

export function detectPatterns(
  readings: { systolic: number; diastolic: number; recordedAt: Date | { toDate: () => Date }; source?: string }[]
): string[] {
  const flags: string[] = [];
  if (readings.length < 5) return flags;

  // Check last 5 readings
  const recent = readings.slice(-5);
  const avgSys =
    recent.reduce((a, r) => a + r.systolic, 0) / recent.length;
  const avgDia =
    recent.reduce((a, r) => a + r.diastolic, 0) / recent.length;

  if (avgSys >= 140 || avgDia >= 90) {
    flags.push("Persistent hypertension despite monitoring");
  }

  // Resistant HTN: BP >= Stage 2 with readings over time
  const stage2Count = readings.filter(
    (r) => r.systolic >= 140 || r.diastolic >= 90
  ).length;
  if (stage2Count / readings.length > 0.7) {
    flags.push("Possible resistant hypertension — consider specialist referral");
  }

  // Morning surge: compare morning vs evening readings (simplified)
  const toDate = (dt: Date | { toDate: () => Date }) => "toDate" in dt ? dt.toDate() : dt;
  const morningReadings = readings.filter((r) => {
    const h = toDate(r.recordedAt).getHours();
    return h >= 6 && h <= 10;
  });
  const eveningReadings = readings.filter((r) => {
    const h = toDate(r.recordedAt).getHours();
    return h >= 18 && h <= 22;
  });
  if (morningReadings.length >= 3 && eveningReadings.length >= 3) {
    const mAvg =
      morningReadings.reduce((a, r) => a + r.systolic, 0) /
      morningReadings.length;
    const eAvg =
      eveningReadings.reduce((a, r) => a + r.systolic, 0) /
      eveningReadings.length;
    if (mAvg - eAvg > 20) {
      flags.push("Morning BP surge detected — check nocturnal dipping");
    }
  }

  return flags;
}