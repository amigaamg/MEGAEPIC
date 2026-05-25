import { NextRequest, NextResponse } from "next/server";

// In-memory store — persists during the dev server session
const BP_ENTRIES: any[] = [
  { id:"bp1",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:168, diastolic:102, heartRate:78, loggedBy:"doctor",  loggedByUid:"doctor_sarah_kimani",   timestamp:"2026-01-10T08:00:00Z", notes:"Tool assigned, baseline reading", flagged:true,  status:"high"     },
  { id:"bp2",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:165, diastolic:100, heartRate:76, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-01-13T07:30:00Z", notes:"Morning reading",                flagged:true,  status:"high"     },
  { id:"bp3",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:163, diastolic:99,  heartRate:75, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-01-16T08:00:00Z", notes:"",                               flagged:true,  status:"high"     },
  { id:"bp4",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:165, diastolic:100, heartRate:77, loggedBy:"doctor",  loggedByUid:"doctor_sarah_kimani",   timestamp:"2026-01-20T09:00:00Z", notes:"Clinic visit",                   flagged:true,  status:"high"     },
  { id:"bp5",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:160, diastolic:98,  heartRate:74, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-01-27T07:45:00Z", notes:"After evening walk",             flagged:true,  status:"high"     },
  { id:"bp6",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:158, diastolic:97,  heartRate:73, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-02-03T08:00:00Z", notes:"Feeling slightly better",        flagged:false, status:"elevated" },
  { id:"bp7",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:150, diastolic:95,  heartRate:74, loggedBy:"doctor",  loggedByUid:"doctor_sarah_kimani",   timestamp:"2026-02-14T09:00:00Z", notes:"Clinic — Losartan started",      flagged:false, status:"elevated" },
  { id:"bp8",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:144, diastolic:90,  heartRate:72, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-02-20T08:00:00Z", notes:"",                               flagged:false, status:"elevated" },
  { id:"bp9",  toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:140, diastolic:89,  heartRate:71, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-02-28T07:30:00Z", notes:"",                               flagged:false, status:"elevated" },
  { id:"bp10", toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:138, diastolic:88,  heartRate:71, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-03-03T08:00:00Z", notes:"",                               flagged:false, status:"elevated" },
  { id:"bp11", toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:158, diastolic:90,  heartRate:76, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-03-15T08:00:00Z", notes:"Missed appointment, stressed",   flagged:false, status:"elevated" },
  { id:"bp12", toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:150, diastolic:90,  heartRate:75, loggedBy:"doctor",  loggedByUid:"doctor_sarah_kimani",   timestamp:"2026-04-02T09:00:00Z", notes:"Clinic — glaucoma dx",           flagged:false, status:"elevated" },
  { id:"bp13", toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:142, diastolic:86,  heartRate:70, loggedBy:"doctor",  loggedByUid:"doctor_sarah_kimani",   timestamp:"2026-04-10T09:00:00Z", notes:"Better control",                 flagged:false, status:"elevated" },
  { id:"bp14", toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:138, diastolic:84,  heartRate:70, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-04-25T08:00:00Z", notes:"",                               flagged:false, status:"elevated" },
  { id:"bp15", toolId:"tool_htn_john", patientId:"patient_john_mwangi", systolic:142, diastolic:85,  heartRate:72, loggedBy:"patient", loggedByUid:"patient_john_mwangi",   timestamp:"2026-05-10T08:00:00Z", notes:"Feeling well",                   flagged:false, status:"elevated" },
];

export async function GET(req: NextRequest) {
  const toolId    = req.nextUrl.searchParams.get("toolId");
  const patientId = req.nextUrl.searchParams.get("patientId");

  let result = [...BP_ENTRIES];
  if (toolId)    result = result.filter(e => e.toolId    === toolId);
  if (patientId) result = result.filter(e => e.patientId === patientId);

  // newest first
  result.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const entry = {
    id:          `bp_${Date.now()}`,
    toolId:      body.toolId,
    patientId:   body.patientId,
    systolic:    body.systolic,
    diastolic:   body.diastolic,
    heartRate:   body.heartRate ?? null,
    loggedBy:    body.loggedBy,
    loggedByUid: body.loggedByUid,
    timestamp:   new Date().toISOString(),
    notes:       body.notes ?? "",
    flagged:     body.flagged ?? false,
    status:      body.status ?? "elevated",
    arm:         body.arm ?? "left",
    position:    body.position ?? "sitting",
  };

  BP_ENTRIES.unshift(entry);
  return NextResponse.json(entry, { status: 201 });
}