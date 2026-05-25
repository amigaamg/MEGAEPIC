import { redirect } from "next/navigation";
import { amexanApi } from "@/lib/amexanApi";

interface Props {
  params: Promise<{ patientId: string }>;
}

/**
 * Patient workspace root.
 * Loads the patient's active tools and redirects to the first one.
 * If multiple tools are active, the ToolTabs component handles switching.
 *
 * Route: /dashboard/doctor/patient/[patientId]
 * Redirects to: /dashboard/doctor/patient/[patientId]/tools/hypertension
 */
export default async function PatientWorkspacePage({ params }: Props) {
  const { patientId } = await params;

  try {
    const tools = await amexanApi.getToolByPatient(patientId);
    const activeTools = tools.filter(t => t.status === "active");

    if (!activeTools.length) {
      // No active tools — show the empty state with option to assign a tool
      return redirect(`/dashboard/doctor/patient/${patientId}/tools/none`);
    }

    // Redirect to first active tool
    const firstTool = activeTools[0];
    redirect(`/dashboard/doctor/patient/${patientId}/tools/${firstTool.toolType}`);
  } catch {
    redirect(`/dashboard/doctor/patient/${patientId}/tools/hypertension`);
  }
}