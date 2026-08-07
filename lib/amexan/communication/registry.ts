// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Communication Engine — Engine IV — Catalog Registry
// The registry is the SINGLE source of truth for every purpose, emergency type,
// default template, and committee the hospital can use. The engine + UI query
// the registry — they never hardcode a purpose or emergency code. Adding a new
// purpose / template / committee is a one-line registration here.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  CommunicationPurpose,
  CommunicationTemplate,
  TargetAudience,
  BroadcastSeverity,
} from './constitutional-types';

export interface PurposeDefinition {
  id: CommunicationPurpose;
  label: string;
  icon: string;
  color: string;
  /** Whether this kind becomes a permanent, versioned institutional document. */
  permanent: boolean;
  alwaysAudience: boolean;   // must target the correct audience
  canSchedule: boolean;
  defaultSeverity: BroadcastSeverity;
  description: string;
}

export const PURPOSE_DEFINITIONS: PurposeDefinition[] = [
  { id: 'announcement', label: 'Announcement', icon: '📣', color: '#0ea5e9', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'General information — anniversary, new consultant, holidays, staff welfare.' },
  { id: 'circular', label: 'Circular', icon: '📜', color: '#6366f1', permanent: true, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Formal administrative directive — leave procedure, procurement policy, HR/Finance/Clinical circular.' },
  { id: 'policy', label: 'Policy', icon: '📘', color: '#8b5cf6', permanent: true, alwaysAudience: true, canSchedule: false, defaultSeverity: 'info', description: 'Living policy library — admission, discharge, consent, privacy, fire, infection prevention.' },
  { id: 'meeting', label: 'Meeting', icon: '🗓️', color: '#f59e0b', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Board, mortality, morbidity, department, MDT, CPD, teaching.' },
  { id: 'emergency', label: 'Emergency', icon: '🚨', color: '#ef4444', permanent: false, alwaysAudience: true, canSchedule: false, defaultSeverity: 'life_threatening', description: 'Code Blue, Code Red, Mass Casualty, Fire, Power/Oxygen failure, outbreak.' },
  { id: 'alert', label: 'Alert', icon: '⚠️', color: '#f97316', permanent: false, alwaysAudience: true, canSchedule: false, defaultSeverity: 'warning', description: 'Operational alert — system, infrastructure, clinical.' },
  { id: 'task', label: 'Task', icon: '✅', color: '#10b981', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Assigned task with acknowledgement and completion.' },
  { id: 'reminder', label: 'Reminder', icon: '⏰', color: '#14b8a6', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Time-boxed reminder.' },
  { id: 'training', label: 'Training', icon: '🎓', color: '#3b82f6', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Training, CPD, induction notice.' },
  { id: 'research', label: 'Research', icon: '🔬', color: '#7c3aed', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Research invitation / recruitment.' },
  { id: 'maintenance', label: 'Maintenance', icon: '🛠️', color: '#64748b', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'warning', description: 'Scheduled maintenance or outage.' },
  { id: 'public_notice', label: 'Public Notice', icon: '🏛️', color: '#0d9488', permanent: false, alwaysAudience: true, canSchedule: true, defaultSeverity: 'info', description: 'Public / community-facing notice.' },
];

export const PURPOSE_IDS: CommunicationPurpose[] = PURPOSE_DEFINITIONS.map((d) => d.id);

export function getPurpose(id: string): PurposeDefinition | undefined {
  return PURPOSE_DEFINITIONS.find((d) => d.id === id);
}

// ── Emergency types ───────────────────────────────────────────────────────────

export interface EmergencyTypeDefinition {
  id: string;
  label: string;
  icon: string;
  severity: BroadcastSeverity;
  /** Departments critically affected — the trigger for the AI audience suggestion. */
  suggestedDepartments: string[];
  suggestedRoles: string[];
  autoAcknowledge: boolean;
  pushToScreens: boolean;
}

export const EMERGENCY_TYPES: EmergencyTypeDefinition[] = [
  { id: 'code_blue', label: 'Code Blue (Cardiac Arrest)', icon: '🫀', severity: 'life_threatening', suggestedDepartments: ['Emergency', 'ICU', 'Wards', 'Theatre'], suggestedRoles: ['doctor', 'nurse'], autoAcknowledge: true, pushToScreens: true },
  { id: 'code_red', label: 'Code Red (Fire)', icon: '🔥', severity: 'life_threatening', suggestedDepartments: ['All'], suggestedRoles: ['all'], autoAcknowledge: true, pushToScreens: true },
  { id: 'mass_casualty', label: 'Mass Casualty Incident', icon: '🚑', severity: 'life_threatening', suggestedDepartments: ['Emergency', 'Theatre', 'ICU', 'Laboratory', 'Radiology', 'Blood Bank', 'Pharmacy', 'Ambulance'], suggestedRoles: ['doctor', 'nurse', 'pharmacist', 'clinical_officer'], autoAcknowledge: true, pushToScreens: true },
  { id: 'fire', label: 'Fire', icon: '🔥', severity: 'life_threatening', suggestedDepartments: ['All'], suggestedRoles: ['all'], autoAcknowledge: true, pushToScreens: true },
  { id: 'network_failure', label: 'Network Failure', icon: '🌐', severity: 'critical', suggestedDepartments: ['ICT', 'ICU', 'Theatre', 'Laboratory', 'Radiology', 'Pharmacy', 'Emergency', 'Blood Bank'], suggestedRoles: ['ict_officer', 'doctor', 'nurse'], autoAcknowledge: false, pushToScreens: false },
  { id: 'power_failure', label: 'Power Failure', icon: '⚡', severity: 'critical', suggestedDepartments: ['ICT', 'ICU', 'Theatre', 'Laboratory', 'Radiology', 'Pharmacy', 'Emergency', 'Blood Bank', 'Ambulance'], suggestedRoles: ['ict_officer', 'doctor', 'nurse'], autoAcknowledge: false, pushToScreens: false },
  { id: 'oxygen_failure', label: 'Oxygen Failure', icon: '💨', severity: 'life_threatening', suggestedDepartments: ['ICU', 'HDU', 'NICU', 'Emergency', 'Theatre', 'Ward'], suggestedRoles: ['doctor', 'nurse'], autoAcknowledge: true, pushToScreens: true },
  { id: 'security_incident', label: 'Security Incident', icon: '🛡️', severity: 'critical', suggestedDepartments: ['Security', 'Emergency', 'ICT'], suggestedRoles: ['security', 'doctor', 'nurse'], autoAcknowledge: false, pushToScreens: true },
  { id: 'flood', label: 'Flood', icon: '🌊', severity: 'warning', suggestedDepartments: ['All'], suggestedRoles: ['all'], autoAcknowledge: false, pushToScreens: false },
  { id: 'earthquake', label: 'Earthquake', icon: '🏚️', severity: 'life_threatening', suggestedDepartments: ['All'], suggestedRoles: ['all'], autoAcknowledge: true, pushToScreens: true },
  { id: 'disease_outbreak', label: 'Disease Outbreak', icon: '🦠', severity: 'critical', suggestedDepartments: ['Emergency', 'Medical Wards', 'Infection Control', 'Laboratory', 'Public Health'], suggestedRoles: ['doctor', 'nurse', 'clinical_officer'], autoAcknowledge: false, pushToScreens: true },
  { id: 'pandemic', label: 'Pandemic', icon: '🧫', severity: 'critical', suggestedDepartments: ['All'], suggestedRoles: ['all'], autoAcknowledge: false, pushToScreens: true },
  { id: 'other', label: 'Other Emergency', icon: '🚨', severity: 'critical', suggestedDepartments: [], suggestedRoles: [], autoAcknowledge: false, pushToScreens: false },
];

export function getEmergencyType(id: string): EmergencyTypeDefinition | undefined {
  return EMERGENCY_TYPES.find((e) => e.id === id);
}

// ── Delivery channels ─────────────────────────────────────────────────────────

export const CHANNEL_OPTIONS: { id: string; label: string }[] = [
  { id: 'in_app', label: 'In-App' },
  { id: 'dashboard', label: 'Dashboard Banner' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'hospital_screen', label: 'Hospital Screens' },
  { id: 'public_address', label: 'Public Address' },
  { id: 'pager', label: 'Pager' },
  { id: 'mobile', label: 'Mobile App' },
];

export const CHANNEL_LABELS: Record<string, string> = Object.fromEntries(
  CHANNEL_OPTIONS.map((c) => [c.id, c.label]),
);

// ── Default committees ────────────────────────────────────────────────────────

export const DEFAULT_COMMITTEES: { name: string; purpose: string }[] = [
  { name: 'Ethics Committee', purpose: 'Oversee research and clinical ethics approvals.' },
  { name: 'Infection Prevention Committee', purpose: 'Surveillance and control of hospital-acquired infections.' },
  { name: 'Mortality & Morbidity Committee', purpose: 'Review mortality and morbidity for quality improvement.' },
  { name: 'Research Committee', purpose: 'Facilitate and approve institutional research.' },
  { name: 'Quality Committee', purpose: 'Drive clinical quality and safety improvements.' },
  { name: 'Procurement Committee', purpose: 'Oversee procurement and supply decisions.' },
  { name: 'Pharmacy & Therapeutics Committee', purpose: 'Manage the drug formulary and therapeutic policies.' },
];

// ── Meeting kinds ─────────────────────────────────────────────────────────────

export const MEETING_KINDS: { id: string; label: string }[] = [
  { id: 'board', label: 'Board' },
  { id: 'mortality', label: 'Mortality' },
  { id: 'morbidity', label: 'Morbidity' },
  { id: 'department', label: 'Department' },
  { id: 'mdt', label: 'MDT' },
  { id: 'research', label: 'Research' },
  { id: 'cpd', label: 'CPD' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'committee', label: 'Committee' },
  { id: 'emergency_briefing', label: 'Emergency Briefing' },
];

// ── Default templates ─────────────────────────────────────────────────────────

export const DEFAULT_TEMPLATES: CommunicationTemplate[] = ([
  {
    name: 'Holiday Notice',
    purpose: 'announcement',
    subject: 'Holiday Arrangements',
    body: 'Please note the upcoming public holiday arrangements. Departments should plan staffing accordingly.',
    audience: { everyone: true },
    channels: ['in_app', 'email'],
    requiresAcknowledgement: false,
  },
  {
    name: 'Emergency Alert',
    purpose: 'emergency',
    subject: 'EMERGENCY',
    body: 'Emergency broadcast. All relevant staff to respond immediately.',
    audience: { everyone: true },
    channels: ['in_app', 'sms', 'hospital_screen', 'public_address', 'pager', 'mobile'],
    requiresAcknowledgement: true,
  },
  {
    name: 'Meeting Invite',
    purpose: 'meeting',
    subject: 'Meeting Invitation',
    body: 'You are invited to a meeting. Please review the agenda and confirm attendance.',
    audience: { everyone: false, roles: ['department_head'] },
    channels: ['in_app', 'email'],
    requiresAcknowledgement: false,
  },
  {
    name: 'Maintenance Notice',
    purpose: 'maintenance',
    subject: 'Scheduled Maintenance',
    body: 'Scheduled maintenance will occur during the stated window. Please plan accordingly.',
    audience: { everyone: true },
    channels: ['in_app', 'hospital_screen'],
    requiresAcknowledgement: false,
  },
  {
    name: 'Policy Update',
    purpose: 'policy',
    subject: 'Policy Update',
    body: 'A policy has been updated and requires review and acknowledgement.',
    audience: { everyone: true },
    channels: ['in_app', 'email'],
    requiresAcknowledgement: true,
  },
  {
    name: 'Research Invitation',
    purpose: 'research',
    subject: 'Research Participation',
    body: 'You are invited to participate in an approved research study.',
    audience: { everyone: true, roles: ['doctor', 'nurse'] },
    channels: ['in_app', 'email'],
    requiresAcknowledgement: false,
  },
  {
    name: 'CPD Announcement',
    purpose: 'training',
    subject: 'CPD Session',
    body: 'A continuing professional development session has been scheduled.',
    audience: { everyone: true, roles: ['doctor', 'nurse'] },
    channels: ['in_app', 'email'],
    requiresAcknowledgement: false,
  },
] as Omit<CommunicationTemplate, 'id'>[]
).map((t, i) => ({ id: `tpl-default-${i + 1}`, ...t }));

