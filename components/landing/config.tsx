'use client'
import { C } from '@/lib/colors'
import { Hospital, Stethoscope, FlaskConical, Scan, Pill, ClipboardList, Microscope, Activity, FileText, Database, BarChart3, Shield, Lock, Globe, MapPin, BookOpen, ChevronRight, Menu, X, Check, ArrowRight, Star, Users, Bed, HeartPulse, Thermometer, Droplets, Search, UserCircle, Settings, LogOut, Bell, MessageSquare, AlertTriangle, Building, GraduationCap, Radio, ShieldCheck, ActivitySquare, Smartphone, Monitor, Layers, Network, Server, UserCheck, FileCheck, Clock, Calendar, Code, Cpu, Brain, Lightbulb, BookMarked, Award, Target, Eye, GitMerge, Zap, Link, Share2, Cloud, Download, Upload, RefreshCw, Play, Pause, DollarSign, CreditCard, Home, TrendingUp, TrendingDown, UsersRound, LifeBuoy, Headphones, Mail, Phone, ExternalLink, Grid, Package, AppWindow, Bot, Sparkles, Heart, Syringe, Bandage, Bone, Ear, EyeIcon, Tooth, Dna, Dribbble as Baby, Wind, Video, List, type LucideIcon } from 'lucide-react'

export type IconType = LucideIcon

export interface NavItem {
  label: string
  children?: { label: string; href: string; badge?: string; desc?: string }[]
  href?: string
}

export interface ProductItem {
  icon: LucideIcon
  title: string
  desc: string
  gradient: string
}

export interface UserType {
  icon: LucideIcon
  title: string
  desc: string
  dashPreview: string[]
}

export interface EngineItem {
  icon: LucideIcon
  name: string
  desc: string
}

export interface StandardItem {
  name: string
  desc: string
  category: string
}

export interface TestimonialItem {
  name: string
  role: string
  quote: string
  type: string
}

export interface StatItem {
  label: string
  suffix: string
}

export const S = {
  page: { minHeight: '100vh', background: C.white, fontFamily: "'Inter', system-ui, sans-serif", color: C.text, WebkitFontSmoothing: 'antialiased' as const },
  nav: { position: 'fixed' as const, top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 32, zIndex: 100, transition: 'all 0.2s', borderBottom: '1px solid transparent' as const },
  navScroll: { background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 15, fontWeight: 700 },
  logoText: { fontSize: 20, fontWeight: 700, color: C.navy, letterSpacing: '-0.02em' },
  btnOutline: { padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.navy, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6 },
  section: { padding: '80px 40px', maxWidth: 1200, margin: '0 auto' },
  sectionWide: { padding: '80px 40px' },
  sectionCenter: { textAlign: 'center' as const, maxWidth: 640, margin: '0 auto 48px' },
  secTag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: C.skyLight, color: C.sky, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' },
  secTagDark: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: C.skySoft, fontSize: 11, fontWeight: 600, marginBottom: 16, letterSpacing: '0.04em' },
  secH2: { fontSize: 36, fontWeight: 700, color: C.navy, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 },
  secH2Light: { fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 12 },
  secP: { fontSize: 15, color: C.text, lineHeight: 1.7 },
  secPLight: { fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 },
  card: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, cursor: 'default', transition: 'all 0.2s' },
  cardDark: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 },
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Products',
    children: [
      { label: 'Clinical OS', href: '#', desc: 'Doctor workspace with clinical reasoning', badge: 'Core' },
      { label: 'Hospital HMIS', href: '#', desc: 'Complete hospital management system', badge: 'Enterprise' },
      { label: 'Telemedicine', href: '#', desc: 'Virtual care and remote monitoring', badge: 'New' },
      { label: 'Patient App', href: '#', desc: 'Personal health record and portal' },
      { label: 'Research Cloud', href: '#', desc: 'Clinical research and analytics' },
      { label: 'Education', href: '#', desc: 'Medical school and CPD platform' },
      { label: 'Marketplace', href: '#', desc: 'Healthcare app ecosystem' },
      { label: 'Developer Platform', href: '#', desc: 'APIs, SDKs, and plugins' },
      { label: 'Analytics', href: '#', desc: 'Population health and operational BI' },
    ],
  },
  {
    label: 'Solutions',
    children: [
      { label: 'Hospitals', href: '#', desc: 'Multi-ward, multi-department' },
      { label: 'Clinics', href: '#', desc: 'Outpatient and primary care' },
      { label: 'Medical Schools', href: '#', desc: 'Education and training' },
      { label: 'Governments', href: '#', desc: 'National health systems' },
      { label: 'NGOs', href: '#', desc: 'Community health programs' },
      { label: 'Insurance', href: '#', desc: 'Claims and population management' },
      { label: 'Laboratories', href: '#', desc: 'End-to-end lab management' },
      { label: 'Radiology Centers', href: '#', desc: 'Imaging and reporting' },
      { label: 'Pharmacies', href: '#', desc: 'Dispensing and inventory' },
      { label: 'Private Practice', href: '#', desc: 'Independent practitioner' },
    ],
  },
  {
    label: 'Developers',
    children: [
      { label: 'Documentation', href: '#', desc: 'Full API and SDK reference' },
      { label: 'API Reference', href: '#', desc: 'REST and GraphQL APIs' },
      { label: 'FHIR', href: '#', desc: 'FHIR R4 implementation guide' },
      { label: 'SDK & Libraries', href: '#', desc: 'Client libraries and tools' },
      { label: 'Marketplace', href: '#', desc: 'Publish your own plugin' },
      { label: 'Open Standards', href: '#', desc: 'Our commitment to openness' },
      { label: 'Plugin Development', href: '#', desc: 'Build on AMEXAN' },
    ],
  },
  { label: 'Partners', href: '#' },
  {
    label: 'Resources',
    children: [
      { label: 'Knowledge Center', href: '#', desc: 'Guides, tutorials, and best practices' },
      { label: 'Clinical Library', href: '#', desc: 'Evidence-based clinical content' },
      { label: 'Case Studies', href: '#', desc: 'Real-world implementations' },
      { label: 'Videos', href: '#', desc: 'Product tours and webinars' },
      { label: 'Academy', href: '#', desc: 'Certification and training' },
      { label: 'Help Center', href: '#', desc: 'Support and FAQs' },
      { label: 'Community', href: '#', desc: 'Forums and discussions' },
    ],
  },
  {
    label: 'Company',
    children: [
      { label: 'About', href: '#', desc: 'Our mission and story' },
      { label: 'Mission', href: '#', desc: 'Global clinical intelligence' },
      { label: 'Careers', href: '#', desc: 'Join our team' },
      { label: 'Leadership', href: '#', desc: 'Meet the team' },
      { label: 'Security', href: '#', desc: 'Security and compliance' },
      { label: 'Trust Center', href: '#', desc: 'Privacy, uptime, and governance' },
      { label: 'Contact', href: '#', desc: 'Get in touch' },
    ],
  },
  { label: 'Pricing', href: '#' },
  { label: 'Support', href: '#' },
]

export const PILLARS = [
  { icon: <Activity size={20} />, title: 'Clinical Care', desc: 'End-to-end clinical workflow from triage to discharge' },
  { icon: <GraduationCap size={20} />, title: 'Education', desc: 'Medical training and continuous professional development' },
  { icon: <Microscope size={20} />, title: 'Research', desc: 'Clinical research, registries, and population analytics' },
  { icon: <Settings size={20} />, title: 'Operations', desc: 'Hospital administration, logistics, and resource management' },
  { icon: <Brain size={20} />, title: 'Intelligence', desc: 'Clinical reasoning, decision support, and knowledge graph' },
  { icon: <MessageSquare size={20} />, title: 'Communication', desc: 'Team collaboration, referrals, and patient communication' },
]

export const USER_TYPES: UserType[] = [
  { icon: <Stethoscope size={22} />, title: 'Doctor', desc: 'Diagnose, document, and manage patient care with AI-assisted clinical reasoning.', dashPreview: ['Active Patients: 12', 'Pending Reviews: 4', 'Today\'s Rounds: Ward 3A'] },
  { icon: <HeartPulse size={22} />, title: 'Nurse', desc: 'Triage, vitals, medication administration, and task management.', dashPreview: ['Assigned Patients: 8', 'Medications Due: 3', 'Vitals Pending: 2'] },
  { icon: <UserCircle size={22} />, title: 'Patient', desc: 'Access your health records, labs, medications, and communicate with your care team.', dashPreview: ['Next Appointment: Mar 15', 'Labs Pending: 2', 'Messages: 1'] },
  { icon: <Building size={22} />, title: 'Hospital', desc: 'Manage beds, staff, departments, and operations across your facility.', dashPreview: ['Bed Occupancy: 78%', 'Inpatients: 142', 'Staff on Duty: 38'] },
  { icon: <MapPin size={22} />, title: 'Clinic', desc: 'Streamline outpatient care, scheduling, and patient flow.', dashPreview: ['Today\'s Appts: 24', 'Walk-ins: 5', 'Avg Wait: 12min'] },
  { icon: <GraduationCap size={22} />, title: 'Medical Student', desc: 'Learn clinical reasoning on real de-identified cases with structured feedback.', dashPreview: ['Cases Completed: 34', 'Assessments: 2', 'CPD Hours: 12'] },
  { icon: <GraduationCap size={22} />, title: 'University', desc: 'Train the next generation on a real clinical system.', dashPreview: ['Students: 240', 'Active Courses: 6', 'Sim Cases: 18'] },
  { icon: <FlaskConical size={22} />, title: 'Laboratory', desc: 'Order entry, specimen tracking, result validation, and auto-reporting.', dashPreview: ['Orders Today: 87', 'Pending: 12', 'Critical: 1'] },
  { icon: <Scan size={22} />, title: 'Radiology', desc: 'DICOM image management, structured reporting, and clinical correlation.', dashPreview: ['Studies Today: 34', 'Reports Pending: 8', 'Urgent: 2'] },
  { icon: <Pill size={22} />, title: 'Pharmacy', desc: 'Prescription verification, dispensing, interaction checks, and inventory.', dashPreview: ['Rx Today: 56', 'Pending Verify: 4', 'Stock Alerts: 3'] },
  { icon: <Microscope size={22} />, title: 'Research Institute', desc: 'De-identified data access, cohort queries, and longitudinal studies.', dashPreview: ['Active Studies: 5', 'Enrolled: 1,240', 'Data Points: 2.4M'] },
  { icon: <DollarSign size={22} />, title: 'Insurance', desc: 'Claims processing, utilization review, and population analytics.', dashPreview: ['Claims Today: 142', 'Pending: 23', 'Approval Rate: 94%'] },
  { icon: <Globe size={22} />, title: 'Government', desc: 'Population health monitoring, policy planning, and national registries.', dashPreview: ['Facilities: 342', 'Coverage: 2.1M', 'Reports Due: 1'] },
  { icon: <Heart size={22} />, title: 'NGO', desc: 'Community health programs, mobile clinics, and field data collection.', dashPreview: ['Programs: 4', 'Beneficiaries: 12K', 'Field Workers: 28'] },
]

export const JOURNEY_STEPS = [
  { label: 'Patient', icon: <UserCircle size={16} />, desc: 'Patient books appointment or arrives' },
  { label: 'Registration', icon: <ClipboardList size={16} />, desc: 'Identity verified, record created' },
  { label: 'Triage', icon: <Activity size={16} />, desc: 'Vitals, acuity, and initial assessment' },
  { label: 'History', icon: <FileText size={16} />, desc: 'Structured SOCRATES history taking' },
  { label: 'Examination', icon: <Stethoscope size={16} />, desc: 'Physical exam with guided templates' },
  { label: 'Investigations', icon: <FlaskConical size={16} />, desc: 'Lab and imaging orders placed' },
  { label: 'Diagnosis', icon: <Brain size={16} />, desc: 'Differential diagnosis with AI support' },
  { label: 'Treatment', icon: <Pill size={16} />, desc: 'Medications, procedures, and therapy' },
  { label: 'Admission', icon: <Bed size={16} />, desc: 'Ward assignment and care planning' },
  { label: 'Ward Round', icon: <Users size={16} />, desc: 'Multi-disciplinary team review' },
  { label: 'Discharge', icon: <Check size={16} />, desc: 'Summary, prescriptions, follow-up plan' },
  { label: 'Telemedicine', icon: <Smartphone size={16} />, desc: 'Virtual follow-up and monitoring' },
  { label: 'Follow-up', icon: <RefreshCw size={16} />, desc: 'Scheduled review and outcome tracking' },
  { label: 'Education', icon: <BookOpen size={16} />, desc: 'Patient and family health education' },
  { label: 'Monitoring', icon: <Activity size={16} />, desc: 'Longitudinal health monitoring' },
  { label: 'Research', icon: <Microscope size={16} />, desc: 'De-identified data contributes to research' },
  { label: 'Analytics', icon: <BarChart3 size={16} />, desc: 'Population health and operational insights' },
]

export const PRODUCTS: ProductItem[] = [
  { icon: <Stethoscope size={28} />, title: 'Clinical OS', desc: 'The doctor workspace with structured history, differential diagnosis, ward rounds, and clinical reasoning engine.', gradient: 'linear-gradient(135deg, #2F80ED, #1A6DD9)' },
  { icon: <Building size={28} />, title: 'Hospital HMIS', desc: 'Complete hospital management — beds, scheduling, billing, inventory, HR, and operational intelligence.', gradient: 'linear-gradient(135deg, #1A6DD9, #1557B3)' },
  { icon: <Smartphone size={28} />, title: 'Patient App', desc: 'Personal health record, appointments, lab results, medications, telehealth, and secure messaging.', gradient: 'linear-gradient(135deg, #2ECC71, #27AE60)' },
  { icon: <Video size={28} />, title: 'Telemedicine', desc: 'Virtual consultations, remote monitoring, e-prescriptions, and integrated follow-up care.', gradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)' },
  { icon: <GraduationCap size={28} />, title: 'Education', desc: 'Medical school curriculum, simulation, assessments, OSCE, and continuous professional development.', gradient: 'linear-gradient(135deg, #E67E22, #D35400)' },
  { icon: <Microscope size={28} />, title: 'Research Cloud', desc: 'De-identified data, cohort builder, registry support, trial management, and AI dataset creation.', gradient: 'linear-gradient(135deg, #1ABC9C, #16A085)' },
  { icon: <Grid size={28} />, title: 'Marketplace', desc: 'Plugins, FHIR apps, regional modules, AI models, themes, and integration adapters.', gradient: 'linear-gradient(135deg, #E74C3C, #C0392B)' },
  { icon: <Code size={28} />, title: 'Developer Platform', desc: 'Open APIs, FHIR R4, SDKs, webhooks, and plugin framework for building on AMEXAN.', gradient: 'linear-gradient(135deg, #34495E, #2C3E50)' },
  { icon: <BarChart3 size={28} />, title: 'Analytics', desc: 'Population health dashboards, operational BI, clinical audit, and predictive analytics.', gradient: 'linear-gradient(135deg, #F39C12, #E67E22)' },
]

export const ENGINES: EngineItem[] = [
  { icon: <Brain size={20} />, name: 'Clinical Reasoning Engine', desc: 'Structured SOCRATES workup with real-time DDx generation, evidence scoring, and management planning.' },
  { icon: <FileText size={20} />, name: 'Universal Documentation Engine', desc: 'Auto-generated HPI, structured exams, procedure notes, discharge summaries with AI narrative.' },
  { icon: <GitMerge size={20} />, name: 'Knowledge Graph', desc: 'Connected clinical concepts, relationships, and evidence — powering decision support and research.' },
  { icon: <Clock size={20} />, name: 'Clinical Timeline', desc: 'Longitudinal patient view — every encounter, result, medication, and event in chronological order.' },
  { icon: <Zap size={20} />, name: 'Decision Support', desc: 'Evidence-based alerts, red flag detection, drug interactions, and guideline-aligned recommendations.' },
  { icon: <List size={20} />, name: 'Differential Engine', desc: 'Structured differential diagnosis generation with Bayesian scoring and anatomical filtering.' },
  { icon: <FlaskConical size={20} />, name: 'Investigation Engine', desc: 'Order sets, reflex testing, result auto-import, critical alerts, and longitudinal trending.' },
  { icon: <Pill size={20} />, name: 'Treatment Engine', desc: 'CHOP/BNF dosing, allergy checks, interaction warnings, closed-loop administration verification.' },
  { icon: <Activity size={20} />, name: 'Monitoring Engine', desc: 'Vital sign graphs, NEWS2/PEWS early warning scores, configurable thresholds, and alerts.' },
  { icon: <BarChart3 size={20} />, name: 'Analytics Engine', desc: 'Departmental dashboards, clinical audits, infection surveillance, and operational metrics.' },
  { icon: <BookOpen size={20} />, name: 'Education Engine', desc: 'Case-based learning, assessments, OSCE tools, and simulated patient encounters.' },
  { icon: <FileText size={20} />, name: 'Protocol Engine', desc: 'Configurable clinical protocols, order sets, and pathway-based care coordination.' },
  { icon: <GitMerge size={20} />, name: 'Research Engine', desc: 'Cohort queries, registry support, de-identified data exports, and trial management.' },
  { icon: <Settings size={20} />, name: 'Workflow Engine', desc: 'Configurable care workflows, task assignment, escalations, and completion tracking.' },
  { icon: <Shield size={20} />, name: 'Safety Engine', desc: 'Patient safety checks, medication reconciliation, fall risk, and adverse event monitoring.' },
  { icon: <Link size={20} />, name: 'Integration Engine', desc: 'FHIR R4, HL7 v2, DICOM, and custom adapter framework for seamless interoperability.' },
]

export const STANDARDS: StandardItem[] = [
  { name: 'HL7 FHIR R4', desc: 'Modern interoperability for healthcare data exchange. APIs, resources, and profiles.', category: 'Standards' },
  { name: 'SNOMED CT', desc: 'Comprehensive clinical terminology for accurate documentation and decision support.', category: 'Terminology' },
  { name: 'LOINC', desc: 'Standard for lab observations and measurements with consistent naming and coding.', category: 'Terminology' },
  { name: 'DICOM', desc: 'International standard for medical imaging storage, transmission, and display.', category: 'Imaging' },
  { name: 'ICD-11', desc: 'Latest International Classification of Diseases for modern disease coding.', category: 'Classification' },
  { name: 'WHO', desc: 'World Health Organization guidelines, classifications, and global health standards.', category: 'Global Health' },
  { name: 'HIPAA', desc: 'US healthcare privacy and security rules for protected health information.', category: 'Compliance' },
  { name: 'GDPR', desc: 'EU data protection regulation ensuring patient data privacy and consent management.', category: 'Compliance' },
  { name: 'SOC 2', desc: 'Service organization control for security, availability, and confidentiality.', category: 'Compliance' },
  { name: 'OWASP', desc: 'Open Web Application Security Project guidelines for secure application development.', category: 'Security' },
  { name: 'OAuth 2.0', desc: 'Industry-standard protocol for secure authorization and delegated access.', category: 'Security' },
  { name: 'OpenID', desc: 'Federated identity layer on top of OAuth 2.0 for single sign-on.', category: 'Security' },
  { name: 'RBAC', desc: 'Role-based access control ensuring clinicians access only what they need.', category: 'Security' },
  { name: 'AES-256', desc: 'Military-grade encryption at rest. All patient data encrypted by default.', category: 'Encryption' },
  { name: 'TLS 1.3', desc: 'Latest transport layer security for all data in transit.', category: 'Encryption' },
  { name: 'Kubernetes', desc: 'Container orchestration for scalable, resilient healthcare infrastructure.', category: 'Infrastructure' },
  { name: 'Docker', desc: 'Containerized deployment for consistent environments across all settings.', category: 'Infrastructure' },
  { name: 'PostgreSQL', desc: 'Enterprise relational database with ACID compliance and advanced querying.', category: 'Infrastructure' },
  { name: 'Neo4j', desc: 'Graph database powering the clinical knowledge graph and relationship queries.', category: 'Infrastructure' },
  { name: 'Firebase', desc: 'Real-time sync, authentication, and cloud functions for responsive applications.', category: 'Infrastructure' },
]

export const COMPARISON_ROWS = [
  { feature: 'Clinical Reasoning Engine', trad: false, amexan: true },
  { feature: 'Unified Patient Timeline', trad: false, amexan: true },
  { feature: 'AI-Ready Intelligence Layer', trad: false, amexan: true },
  { feature: 'Longitudinal Care', trad: false, amexan: true },
  { feature: 'Medical Education Platform', trad: false, amexan: true },
  { feature: 'Telemedicine (Built-in)', trad: false, amexan: true },
  { feature: 'Healthcare Marketplace', trad: false, amexan: true },
  { feature: 'Clinical Research Platform', trad: false, amexan: true },
  { feature: 'Knowledge Graph', trad: false, amexan: true },
  { feature: 'Patient Portal & App', trad: false, amexan: true },
  { feature: 'Population Analytics', trad: false, amexan: true },
  { feature: 'Interoperability (FHIR/DICOM)', trad: false, amexan: true },
  { feature: 'E-Prescribing', trad: true, amexan: true },
  { feature: 'Lab Integration', trad: true, amexan: true },
  { feature: 'Billing & Coding', trad: true, amexan: true },
  { feature: 'Scheduling', trad: true, amexan: true },
]

export const FEATURES_SECTION = [
  { icon: <FileText size={18} />, title: 'Unified Patient Record', desc: 'Every visit, result, note, and medication linked to one patient record — accessible across every care setting.' },
  { icon: <Activity size={18} />, title: 'Clinical Reasoning Engine', desc: 'Structured SOCRATES workup with real-time differential diagnosis generation, evidence scoring, and management planning.' },
  { icon: <AlertTriangle size={18} />, title: 'Decision Support', desc: 'Evidence-based alerts, red flag detection, drug interactions, and guideline-aligned recommendations.' },
  { icon: <ClipboardList size={18} />, title: 'Ward Round Mode', desc: 'Distraction-free sequential patient review with one-click navigation, plan capture, and task generation.' },
  { icon: <Pill size={18} />, title: 'Medication Safety', desc: 'CHOP/BNF dosing, allergy checks, interaction warnings, and closed-loop administration verification.' },
  { icon: <FlaskConical size={18} />, title: 'Laboratory Integration', desc: 'Order sets, barcode tracking, result auto-import, critical value alerts, and trending graphs.' },
  { icon: <Scan size={18} />, title: 'Imaging Integration', desc: 'DICOM-compliant ordering, structured reporting, and side-by-side image and report viewing.' },
  { icon: <ActivitySquare size={18} />, title: 'Real-time Monitoring', desc: 'Vital sign graphs, early warning scores (NEWS2/PEWS), fluid balance, and configurable alert thresholds.' },
  { icon: <FileText size={18} />, title: 'Clinical Documentation', desc: 'Auto-generated HPI, structured examinations, procedure notes, discharge summaries — with AI-enhanced narrative.' },
  { icon: <Globe size={18} />, title: 'Interoperability', desc: 'FHIR R4, SNOMED CT, LOINC, ICD-11, and DICOM compliant. Exchange data seamlessly across systems.' },
  { icon: <BarChart3 size={18} />, title: 'Analytics & Reports', desc: 'Departmental dashboards, clinical audits, infection surveillance, and operational performance metrics.' },
  { icon: <Shield size={18} />, title: 'Audit & Compliance', desc: 'Complete audit trail, RBAC, HIPAA/GDPR alignment, data integrity, and end-to-end encryption.' },
]

export const SECURITY_FEATURES = [
  { icon: <Lock size={20} />, title: 'End-to-End Encryption', desc: 'All patient data encrypted at rest and in transit using AES-256 and TLS 1.3.' },
  { icon: <FileCheck size={20} />, title: 'Audit Logging', desc: 'Every access, modification, and data export logged immutably with timestamp and user identity.' },
  { icon: <Users size={20} />, title: 'Role Permissions', desc: 'Granular role-based access with customizable permission sets for every clinical role.' },
  { icon: <Shield size={20} />, title: 'Patient Privacy', desc: 'Consent-based data sharing, limited data disclosure, and full patient control over their health information.' },
  { icon: <Database size={20} />, title: 'Data Integrity', desc: 'Checksum verification, versioned records, and cryptographic signing prevent unauthorized modification.' },
  { icon: <Server size={20} />, title: 'High Availability', desc: 'Redundant infrastructure with auto-failover, regular backups, and 99.95% uptime SLA.' },
]

export const TESTIMONIALS: TestimonialItem[] = [
  { name: 'Dr. Sarah Kamau', role: 'Chief of Medicine, Nairobi Hospital', quote: 'AMEXAN transformed our ward rounds. We see more patients with better documentation in less time.', type: 'clinician' },
  { name: 'Grace Ochieng', role: 'Head of Nursing, Mombasa County', quote: 'The nurse workspace is intuitive. Vitals, medications, and handovers — all in one place.', type: 'nurse' },
  { name: 'Dr. James Mwangi', role: 'Radiologist, Kenyatta Hospital', quote: 'DICOM integration with structured reporting has cut our report turnaround by 60%.', type: 'clinician' },
  { name: 'Prof. Lucy Wanjiku', role: 'Dean, School of Medicine', quote: 'Our students learn evidence-based practice on a system built around real clinical workflows.', type: 'education' },
  { name: 'Dr. Peter Otieno', role: 'Chief Medical Officer, Ministry of Health', quote: 'Population-level analytics give us real-time visibility into disease trends and resource needs.', type: 'government' },
  { name: 'Mary Wanjeri', role: 'Patient, Kisumu', quote: 'Finally I can see my lab results, talk to my doctor, and manage my health from my phone.', type: 'patient' },
  { name: 'Dr. Amina Hassan', role: 'Research Director, African Population Institute', quote: 'De-identified data access with cohort queries has accelerated our research timeline by years.', type: 'research' },
  { name: 'John Kiprop', role: 'CEO, AAR Insurance', quote: 'Real-time claims integration and population analytics transformed our underwriting.', type: 'insurance' },
]

export const STATS = [
  { label: 'Beds Managed', suffix: '' },
  { label: 'Patients', suffix: '+' },
  { label: 'Encounters', suffix: '+' },
  { label: 'Lab Tests', suffix: '+' },
  { label: 'Facilities', suffix: '' },
  { label: 'System Uptime', suffix: '%' },
]

export const MARKETPLACE_ITEMS = [
  { icon: <Package size={32} />, title: 'Certified Plugins', desc: 'Vetted plugins for clinical workflows, billing, and reporting.' },
  { icon: <AppWindow size={32} />, title: 'FHIR Apps', desc: 'Standards-based apps that integrate seamlessly with any FHIR-compatible system.' },
  { icon: <Building size={32} />, title: 'Hospital Modules', desc: 'Specialized modules for ICU, ER, maternity, pediatrics, and more.' },
  { icon: <Globe size={32} />, title: 'Government Modules', desc: 'National health system modules, registries, and reporting.' },
  { icon: <DollarSign size={32} />, title: 'Insurance Modules', desc: 'Claims processing, utilization review, and risk adjustment.' },
  { icon: <MapPin size={32} />, title: 'Regional Protocols', desc: 'Localized clinical protocols and order sets for any region.' },
  { icon: <Brain size={32} />, title: 'AI Models', desc: 'Trained clinical AI models for imaging, diagnosis, and prediction.' },
  { icon: <BookOpen size={32} />, title: 'Education Packages', desc: 'Curricula, simulations, and assessments for medical schools.' },
  { icon: <Monitor size={32} />, title: 'Themes & Branding', desc: 'White-label themes and custom branding for enterprises.' },
]

export const ECOSYSTEM_ITEMS = [
  { icon: <Building size={24} />, label: 'Hospitals' },
  { icon: <MapPin size={24} />, label: 'Clinics' },
  { icon: <UserCircle size={24} />, label: 'Patients' },
  { icon: <GraduationCap size={24} />, label: 'Medical Schools' },
  { icon: <FlaskConical size={24} />, label: 'Laboratories' },
  { icon: <Scan size={24} />, label: 'Radiology' },
  { icon: <DollarSign size={24} />, label: 'Insurance' },
  { icon: <Globe size={24} />, label: 'Governments' },
  { icon: <Microscope size={24} />, label: 'Research' },
  { icon: <Heart size={24} />, label: 'Community Health' },
  { icon: <Smartphone size={24} />, label: 'Telemedicine' },
  { icon: <Grid size={24} />, label: 'Marketplace' },
]

export const FOOTER_COLUMNS = [
  {
    title: 'Products',
    links: ['Clinical OS', 'Hospital HMIS', 'Telemedicine', 'Patient App', 'Research Cloud', 'Education', 'Marketplace', 'Developer Platform', 'Analytics'],
  },
  {
    title: 'Solutions',
    links: ['Hospitals', 'Clinics', 'Medical Schools', 'Governments', 'NGOs', 'Insurance', 'Laboratories', 'Radiology', 'Pharmacies', 'Private Practice'],
  },
  {
    title: 'Developers',
    links: ['Documentation', 'API Reference', 'FHIR Guide', 'SDKs', 'Plugin Development', 'Open Standards', 'Marketplace Publish'],
  },
  {
    title: 'Resources',
    links: ['Knowledge Center', 'Clinical Library', 'Case Studies', 'Videos', 'Academy', 'Help Center', 'Community'],
  },
  {
    title: 'Company',
    links: ['About', 'Mission', 'Careers', 'Leadership', 'Security', 'Trust Center', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Data Processing', 'HIPAA Compliance', 'GDPR'],
  },
]

export const TRUST_LOGOS = [
  'WHO', 'HL7', 'FHIR', 'ICD', 'LOINC', 'SNOMED',
  'DICOM', 'ISO', 'HIPAA', 'GDPR', 'SOC2', 'OWASP',
  'OAuth', 'OpenID', 'Kubernetes', 'Docker',
  'PostgreSQL', 'Neo4j', 'Firebase',
]
