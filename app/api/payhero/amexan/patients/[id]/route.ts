import { NextRequest, NextResponse } from "next/server";

const PATIENTS: Record<string, object> = {
  "patient_john_mwangi": {
    id:               "patient_john_mwangi",
    name:             "John Mwangi",
    dob:              "1965-03-14T00:00:00Z",
    gender:           "male",
    phone:            "+254 712 345 678",
    email:            "john.mwangi@email.com",
    nationalId:       "KE-2394871",
    address:          "14 Kileleshwa Road, Nairobi",
    nextOfKin:        { name: "Mary Mwangi", phone: "+254 712 345 679", relationship: "Wife" },
    assignedDoctorId: "doctor_sarah_kimani",
    riskLevel:        "high",
    activeToolTypes:  ["hypertension", "glaucoma"],
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patient = PATIENTS[id];
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
  return NextResponse.json(patient);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (PATIENTS[id]) {
    Object.assign(PATIENTS[id], body);
  }
  return NextResponse.json(PATIENTS[id] ?? body);
}