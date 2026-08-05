// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Demo Workspaces (Book XV, WS-017 — Developer Testing Rule)
//
// Single source of truth for the seeded demo hospital. Shared by:
//   - scripts/seed-demo-hospital.ts   (creates the accounts in Firebase)
//   - app/auth/demo-login/page.tsx    (dev-only persona switcher)
//   - lib/amexan/workspace/__tests__  (guarantee tests: every account lands home)
//
// The role => family mapping MUST agree with WorkspaceGuard so each demo account
// renders its own workspace and can never render another's (WS-013/WS-014/WS-016).
// ═══════════════════════════════════════════════════════════════════════════════

import type { WorkspaceFamily } from '@/lib/amexan/workspace/WorkspaceGuard';

export const DEMO_ORG_ID = 'ORG-DEMO-001';
export const DEMO_ORG_NAME = 'AMEXAN University Hospital';
export const DEMO_FACILITY_ID = 'FAC-DEMO-001';
export const DEMO_PASSWORD = 'Demo@123456';

export interface DemoWorkspaceAccount {
  email: string;
  name: string;
  role: string;
  /** The constitutional family the account must resolve to (WS-013). */
  family: WorkspaceFamily;
  /** The dashboard route the account should land on. */
  dashboardRoute: string;
  department: string;
  assignment: string;
}

export const DEMO_WORKSPACE_ACCOUNTS: DemoWorkspaceAccount[] = [
  { email: 'facility.admin@demo.amexan', name: 'Alan Facility', role: 'facility_administrator', family: 'executive', dashboardRoute: '/facility-admin', department: 'Administration', assignment: 'administration' },
  { email: 'subadmin@demo.amexan', name: 'Sue Badmin', role: 'hospital_admin', family: 'executive', dashboardRoute: '/facility-admin', department: 'Administration', assignment: 'administration' },
  { email: 'surgery.head@demo.amexan', name: 'Sam Head', role: 'department_head', family: 'department', dashboardRoute: '/workspace', department: 'Surgery', assignment: 'administration' },
  { email: 'ward.a@demo.amexan', name: 'Wanda Charge', role: 'ward_in_charge', family: 'department', dashboardRoute: '/workspace', department: 'General Surgery', assignment: 'ward_round' },
  { email: 'consultant@demo.amexan', name: 'Cole Consultant', role: 'consultant', family: 'clinical', dashboardRoute: '/workspace', department: 'Surgery', assignment: 'consultation' },
  { email: 'resident@demo.amexan', name: 'Reena Resident', role: 'resident', family: 'clinical', dashboardRoute: '/workspace', department: 'Medicine', assignment: 'ward_round' },
  { email: 'mo@demo.amexan', name: 'Moe Officer', role: 'medical_officer', family: 'clinical', dashboardRoute: '/workspace', department: 'Emergency', assignment: 'emergency_call' },
  { email: 'nurse@demo.amexan', name: 'Nora Nurse', role: 'nurse', family: 'nursing', dashboardRoute: '/workspace', department: 'Obstetrics & Gynaecology', assignment: 'ward_round' },
  { email: 'pharmacy@demo.amexan', name: 'Phil Pharmacy', role: 'pharmacist', family: 'pharmacy', dashboardRoute: '/workspace', department: 'Pharmacy', assignment: 'clinic' },
  { email: 'lab@demo.amexan', name: 'Lana Lab', role: 'lab_technologist', family: 'laboratory', dashboardRoute: '/workspace', department: 'Laboratory', assignment: 'clinic' },
  { email: 'radiology@demo.amexan', name: 'Ray Radiology', role: 'radiographer', family: 'radiology', dashboardRoute: '/workspace', department: 'Radiology', assignment: 'clinic' },
  { email: 'finance@demo.amexan', name: 'Fay Finance', role: 'finance_officer', family: 'finance', dashboardRoute: '/dashboard', department: 'Finance', assignment: 'administration' },
  { email: 'hr@demo.amexan', name: 'Harry R', role: 'hr_officer', family: 'hr', dashboardRoute: '/dashboard', department: 'Human Resources', assignment: 'administration' },
  { email: 'ict@demo.amexan', name: 'Ian Technician', role: 'ict_officer', family: 'ict', dashboardRoute: '/dashboard', department: 'ICT', assignment: 'administration' },
  { email: 'researcher@demo.amexan', name: 'Riva Researcher', role: 'researcher', family: 'research', dashboardRoute: '/dashboard', department: 'Medicine', assignment: 'research' },
  { email: 'telemed@demo.amexan', name: 'Terry Telemed', role: 'telemedicine_officer', family: 'telemedicine', dashboardRoute: '/dashboard', department: 'Telemedicine', assignment: 'teleconsultation' },
  { email: 'student@demo.amexan', name: 'Stella Student', role: 'medical_student', family: 'teaching', dashboardRoute: '/dashboard', department: 'Medicine', assignment: 'supervision' },
  { email: 'patient@demo.amexan', name: 'Pat P. Ient', role: 'patient', family: 'patient', dashboardRoute: '/dashboard/patient', department: 'Registration', assignment: 'other' },
];

export function getDemoAccount(email: string): DemoWorkspaceAccount | undefined {
  return DEMO_WORKSPACE_ACCOUNTS.find(a => a.email === email);
}

export function isDemoAccountEmail(email: string): boolean {
  return getDemoAccount(email) !== undefined;
}