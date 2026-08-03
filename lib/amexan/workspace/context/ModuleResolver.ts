// ═══════════════════════════════════════════════════════════════════════
// AMEXAN Layer 3 — Module Resolver
// Determines which AMEXAN modules a workspace actor may access based on
// workspace type, professional category, and subscription tier.
// ═══════════════════════════════════════════════════════════════════════

import type { ResolvedWorkspace } from '../types';
import type { ModuleId } from '../types';

export const ALL_MODULES: Record<ModuleId, { label: string; description: string; icon: string; route: string; requiredRole: string }> = {
  emr: { label: 'EMR', description: 'Electronic Medical Records', icon: 'FileText', route: '/emr', requiredRole: 'clinical' },
  hmis: { label: 'HMIS', description: 'Hospital Management Information System', icon: 'Activity', route: '/hmis', requiredRole: 'clinical' },
  billing: { label: 'Billing', description: 'Billing and invoicing', icon: 'DollarSign', route: '/billing', requiredRole: 'administrative' },
  pharmacy: { label: 'Pharmacy', description: 'Pharmacy management', icon: 'Pill', route: '/pharmacy', requiredRole: 'pharmacy' },
  laboratory: { label: 'Laboratory', description: 'Laboratory orders and results', icon: 'FlaskConical', route: '/laboratory', requiredRole: 'clinical' },
  radiology: { label: 'Radiology', description: 'Imaging orders and reports', icon: 'Scan', route: '/radiology', requiredRole: 'clinical' },
  blood_bank: { label: 'Blood Bank', description: 'Blood bank and transfusion', icon: 'Droplets', route: '/blood-bank', requiredRole: 'clinical' },
  icu: { label: 'ICU', description: 'Intensive Care Unit dashboard', icon: 'HeartPulse', route: '/icu', requiredRole: 'clinical' },
  nicu: { label: 'NICU', description: 'Neonatal Intensive Care', icon: 'Baby', route: '/nicu', requiredRole: 'clinical' },
  theatre: { label: 'Theatre', description: 'Operating theatre management', icon: 'Scalpel', route: '/theatre', requiredRole: 'clinical' },
  research: { label: 'Research', description: 'Clinical research and trials', icon: 'Microscope', route: '/research', requiredRole: 'research' },
  education: { label: 'Education', description: 'Medical education and training', icon: 'GraduationCap', route: '/education', requiredRole: 'education' },
  ai_assistant: { label: 'AI Assistant', description: 'AI-powered clinical assistance', icon: 'Sparkles', route: '/ai', requiredRole: 'clinical' },
  inventory: { label: 'Inventory', description: 'Medical inventory and supplies', icon: 'Package', route: '/inventory', requiredRole: 'administrative' },
  finance: { label: 'Finance', description: 'Financial management', icon: 'TrendingUp', route: '/finance', requiredRole: 'administrative' },
  insurance: { label: 'Insurance', description: 'Insurance claims and verification', icon: 'ShieldCheck', route: '/insurance', requiredRole: 'administrative' },
  quality: { label: 'Quality', description: 'Quality assurance and compliance', icon: 'Award', route: '/quality', requiredRole: 'administrative' },
  public_health: { label: 'Public Health', description: 'Public health reporting', icon: 'Globe', route: '/public-health', requiredRole: 'administrative' },
  telemedicine: { label: 'Telemedicine', description: 'Remote consultation platform', icon: 'Video', route: '/telemedicine', requiredRole: 'clinical' },
  registry: { label: 'Registry', description: 'Patient and disease registries', icon: 'Database', route: '/registry', requiredRole: 'clinical' },
  bed_management: { label: 'Bed Management', description: 'Bed occupancy and allocation', icon: 'Bed', route: '/beds', requiredRole: 'administrative' },
  scheduling: { label: 'Scheduling', description: 'Appointment and theatre scheduling', icon: 'Calendar', route: '/scheduling', requiredRole: 'clinical' },
  hr: { label: 'HR', description: 'Human resources management', icon: 'Users', route: '/hr', requiredRole: 'administrative' },
  payroll: { label: 'Payroll', description: 'Staff payroll management', icon: 'CreditCard', route: '/payroll', requiredRole: 'administrative' },
};

const CLINICAL_MODULES: ModuleId[] = ['emr', 'hmis', 'laboratory', 'radiology', 'ai_assistant', 'telemedicine', 'registry', 'scheduling', 'bed_management'];
const PHARMACY_MODULES: ModuleId[] = ['pharmacy', 'inventory'];
const ADMIN_MODULES: ModuleId[] = ['billing', 'finance', 'insurance', 'quality', 'public_health', 'hr', 'payroll', 'inventory', 'bed_management'];
const RESEARCH_MODULES: ModuleId[] = ['research', 'education', 'registry'];
const EDUCATION_MODULES: ModuleId[] = ['education'];
const INDIVIDUAL_MODULES: ModuleId[] = ['emr', 'telemedicine', 'registry', 'ai_assistant', 'billing'];

export function resolveModules(workspace: ResolvedWorkspace): ModuleId[] {
  const category = workspace.professional?.primaryCategory || '';
  const workspaceType = workspace.extendedContext?.workspaceType?.type;
  const tier = workspace.extendedContext?.subscription?.tier || 'free';

  let allowed: ModuleId[] = [];

  if (workspaceType === 'individual') {
    allowed = [...INDIVIDUAL_MODULES];
  } else if (workspaceType === 'student' || workspaceType === 'training') {
    allowed = [...EDUCATION_MODULES, 'emr', 'laboratory', 'ai_assistant'];
  } else if (workspaceType === 'research_lab') {
    allowed = [...RESEARCH_MODULES, 'emr', 'laboratory'];
  } else if (workspaceType === 'government' || workspaceType === 'ngo') {
    allowed = [...ADMIN_MODULES, 'emr', 'hmis', 'public_health', 'registry'];
  } else if (workspaceType === 'insurance') {
    allowed = [...ADMIN_MODULES, 'insurance', 'finance', 'registry'];
  } else if (workspaceType === 'telemedicine') {
    allowed = [...CLINICAL_MODULES, 'telemedicine', 'ai_assistant', 'billing'];
  } else {
    // facility / clinic / university / medical_school
    allowed = [...CLINICAL_MODULES, ...ADMIN_MODULES, 'pharmacy', 'radiology', 'blood_bank', 'theatre', 'icu', 'nicu', 'bed_management', 'scheduling'];
    if (workspaceType === 'university' || workspaceType === 'medical_school') {
      allowed.push('education', 'research');
    }
  }

  // Role-based restrictions
  if (category === 'pharmacist') {
    allowed = allowed.filter(m => ['pharmacy', 'inventory', 'laboratory', 'registry'].includes(m));
  } else if (category === 'lab_technologist') {
    allowed = allowed.filter(m => ['laboratory', 'radiology', 'hmis', 'registry'].includes(m));
  } else if (category === 'facility_admin' || category === 'administrator') {
    allowed = allowed.filter(m => ADMIN_MODULES.includes(m) || ['emr', 'hmis', 'scheduling', 'bed_management', 'registry'].includes(m));
  } else if (category === 'receptionist') {
    allowed = allowed.filter(m => ['scheduling', 'billing', 'registry', 'hmis'].includes(m));
  }

  // Tier-based limits (free tier gets fewer modules)
  if (tier === 'free') {
    const freeSet = new Set(['emr', 'hmis', 'laboratory', 'ai_assistant', 'registry', 'scheduling']);
    allowed = allowed.filter(m => freeSet.has(m));
  }

  // Deduplicate and preserve order
  return [...new Set(allowed)];
}