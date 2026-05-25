import { NextRequest, NextResponse } from "next/server";

/**
 * Dashboard aggregate endpoint.
 * Returns everything needed for the HTN tool in one call.
 * In production this would be a single SQL JOIN query.
 * For now it calls the other mock data inline.
 */
export async function GET(req: NextRequest) {
  const toolId = req.nextUrl.searchParams.get("toolId") ?? "tool_htn_john";
  const base   = req.nextUrl.origin;

  try {
    const [patientRes, toolRes, bpRes, rxRes, fuRes, noteRes, labRes, alertRes, compRes] =
      await Promise.all([
        fetch(`${base}/api/amexan/patients/patient_john_mwangi`),
        fetch(`${base}/api/amexan/tools/${toolId}`),
        fetch(`${base}/api/amexan/bp?toolId=${toolId}`),
        fetch(`${base}/api/amexan/prescriptions?toolId=${toolId}`),
        fetch(`${base}/api/amexan/followups?toolId=${toolId}`),
        fetch(`${base}/api/amexan/notes?toolId=${toolId}`),
        fetch(`${base}/api/amexan/labs?toolId=${toolId}`),
        fetch(`${base}/api/amexan/alerts?toolId=${toolId}`),
        fetch(`${base}/api/amexan/complications?toolId=${toolId}`),
      ]);

    const [patient, tool, bpEntries, prescriptions, followUps, notes, labs, alerts, complications] =
      await Promise.all([
        patientRes.json(), toolRes.json(), bpRes.json(),
        rxRes.json(), fuRes.json(), noteRes.json(),
        labRes.json(), alertRes.json(), compRes.json(),
      ]);

    const upcoming    = followUps.filter((f: any) => f.status === "scheduled");
    const activeAlerts = alerts.filter((a: any) => a.isActive);
    const pendingLabs  = labs.filter((l: any) => l.status === "pending");
    const activeComps  = complications.filter((c: any) => c.status === "active");
    const activeMeds   = prescriptions.filter((p: any) => p.status === "active");

    return NextResponse.json({
      patient,
      tool,
      recentBPEntries:     bpEntries.slice(0, 5),
      activePrescriptions: activeMeds,
      upcomingFollowUp:    upcoming[0] ?? null,
      activeAlerts,
      recentNote:          notes[0] ?? null,
      pendingLabOrders:    pendingLabs,
      activeComplications: activeComps,
    });
  } catch (err) {
    console.error("[dashboard route] error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}