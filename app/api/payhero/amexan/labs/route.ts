import { NextRequest, NextResponse } from "next/server";

const LABS: any[] = [
  {
    id: "lab3", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    orderedBy: "doctor_sarah_kimani",
    tests: ["Creatinine", "eGFR", "Potassium", "Urine ACR"],
    priority: "routine",
    indication: "4-week review — check renal function after Losartan dose increase to 100mg",
    orderedAt: "2026-05-01T09:00:00Z",
    status: "pending",
    results: null,
  },
  {
    id: "lab2", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    orderedBy: "doctor_sarah_kimani",
    tests: ["Creatinine", "eGFR", "Potassium", "Urine ACR", "Lipid Profile", "HbA1c"],
    priority: "routine",
    indication: "Extended metabolic screen — 6 weeks on Losartan",
    orderedAt: "2026-03-15T09:00:00Z",
    status: "reviewed",
    reviewNotes: "Renal function stable. LDL 3.2 — mildly elevated, dietary advice given. HbA1c 5.8% — pre-diabetic range, monitor closely. Consider statin at next visit.",
    reviewedBy: "doctor_sarah_kimani",
    reviewedAt: "2026-04-02T09:00:00Z",
    results: [
      { test: "Creatinine", value: "1.1",  unit: "mg/dL",         referenceRange: "0.6–1.2",  flag: "normal" },
      { test: "eGFR",       value: "82",   unit: "mL/min/1.73m²", referenceRange: ">60",       flag: "normal" },
      { test: "Potassium",  value: "4.6",  unit: "mmol/L",        referenceRange: "3.5–5.0",  flag: "normal" },
      { test: "Urine ACR",  value: "28",   unit: "mg/g",          referenceRange: "<30",       flag: "normal" },
      { test: "LDL",        value: "3.2",  unit: "mmol/L",        referenceRange: "<3.0",      flag: "high"   },
      { test: "HDL",        value: "1.2",  unit: "mmol/L",        referenceRange: ">1.0",      flag: "normal" },
      { test: "HbA1c",      value: "5.8",  unit: "%",             referenceRange: "<5.7",      flag: "high"   },
    ],
    resultsDate: "2026-03-17T09:00:00Z",
  },
  {
    id: "lab1", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    orderedBy: "doctor_sarah_kimani",
    tests: ["Creatinine", "eGFR", "Potassium", "Sodium", "Urea", "Full Blood Count"],
    priority: "routine",
    indication: "Baseline renal function before starting ARB/CCB combination therapy",
    orderedAt: "2026-01-10T09:00:00Z",
    status: "reviewed",
    reviewNotes: "All within normal limits. Safe to proceed with combination therapy.",
    reviewedBy: "doctor_sarah_kimani",
    reviewedAt: "2026-01-14T09:00:00Z",
    results: [
      { test: "Creatinine",      value: "1.0",    unit: "mg/dL",         referenceRange: "0.6–1.2",  flag: "normal" },
      { test: "eGFR",            value: "88",     unit: "mL/min/1.73m²", referenceRange: ">60",       flag: "normal" },
      { test: "Potassium",       value: "4.2",    unit: "mmol/L",        referenceRange: "3.5–5.0",  flag: "normal" },
      { test: "Sodium",          value: "138",    unit: "mmol/L",        referenceRange: "135–145",  flag: "normal" },
      { test: "Urea",            value: "5.2",    unit: "mmol/L",        referenceRange: "2.5–7.8",  flag: "normal" },
      { test: "Full Blood Count",value: "Normal", unit: "—",             referenceRange: "—",         flag: "normal" },
    ],
    resultsDate: "2026-01-12T09:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const toolId    = req.nextUrl.searchParams.get("toolId");
  const patientId = req.nextUrl.searchParams.get("patientId");

  let result = [...LABS];
  if (toolId)    result = result.filter(l => l.toolId    === toolId);
  if (patientId) result = result.filter(l => l.patientId === patientId);

  result.sort((a, b) =>
    new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const lab = {
    id:        `lab_${Date.now()}`,
    ...body,
    orderedAt: new Date().toISOString(),
    status:    "pending",
    results:   null,
  };
  LABS.unshift(lab);
  return NextResponse.json(lab, { status: 201 });
}