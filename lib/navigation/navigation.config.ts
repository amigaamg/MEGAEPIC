// AMEXAN Universal Navigation Configuration
// Constitutional Principle: Navigation is never hardcoded in components.
// Every menu, item, and link lives here and is consumed by components.
// Each item: id, title, description, route, permission, visibility, order, icon, color

export type NavVisibility = 'public' | 'authenticated' | 'admin' | 'partner'
export type NavPermission = string | null

export interface NavLink {
  id: string
  title: string
  description?: string
  route: string
  icon?: string
  color?: string
  badge?: string
  permission?: NavPermission
  visibility?: NavVisibility
  order?: number
}

export interface NavGroup {
  title: string
  description?: string
  links: NavLink[]
}

export interface MegaMenu {
  columns: NavGroup[]
  footer?: {
    title: string
    description: string
    route: string
    cta: string
  }
}

export interface NavItem {
  id: string
  title: string
  description: string
  route?: string
  icon: string
  color: string
  permission?: NavPermission
  visibility: NavVisibility
  order: number
  megaMenu?: MegaMenu
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'platform',
    title: 'Platform',
    description: 'The Clinical Operating System and everything it powers',
    icon: 'Layers',
    color: 'sky',
    visibility: 'public',
    order: 1,
    megaMenu: {
      columns: [
        {
          title: 'Clinical',
          links: [
            { id: 'cos', title: 'Clinical OS', description: 'The doctor workspace with clinical reasoning', route: '/cos-comprehensive', icon: 'Stethoscope' },
            { id: 'emr', title: 'EMR', description: 'Electronic medical records, structured and complete', route: '/encounter-center', icon: 'FileText' },
            { id: 'intelligence', title: 'Clinical Intelligence', description: 'Reasoning, DDx, decision support', route: '/clinical-intelligence', icon: 'Brain' },
            { id: 'monitoring', title: 'Monitoring', description: 'Vitals, early warning scores, alerts', route: '/clinical-intelligence', icon: 'Activity' },
            { id: 'documentation', title: 'Documentation', description: 'Auto-generated clinical notes', route: '/documentation', icon: 'ClipboardList' },
          ],
        },
        {
          title: 'Operations',
          links: [
            { id: 'hmis', title: 'HMIS', description: 'Complete hospital management system', route: '/hmis', icon: 'Building2' },
            { id: 'communications', title: 'Communications', description: 'Care team, direct and announcements', route: '/communications', icon: 'MessageSquare' },
            { id: 'search', title: 'Global Search', description: 'Search every patient, order and record', route: '/search', icon: 'Search' },
            { id: 'scheduling', title: 'Scheduling', description: 'Appointments, rooms, resources', route: '/schedule', icon: 'CalendarDays' },
            { id: 'billing', title: 'Billing', description: 'Billing and revenue cycle management', route: '/billing', icon: 'CreditCard' },
            { id: 'inventory', title: 'Inventory', description: 'Pharmacy and supply inventory', route: '/inventory', icon: 'Boxes' },
            { id: 'analytics', title: 'Analytics', description: 'Operational BI and population health', route: '/analytics', icon: 'BarChart3' },
          ],
        },
        {
          title: 'Intelligence & Data',
          links: [
            { id: 'knowledge-graph', title: 'Knowledge Graph', description: 'Connected clinical knowledge', route: '/clinical-intelligence', icon: 'GitBranch' },
            { id: 'ai', title: 'AI Assistants', description: 'Clinical AI across every workflow', route: '/clinical-intelligence', icon: 'Bot' },
            { id: 'interoperability', title: 'Interoperability', description: 'FHIR, HL7, DICOM, SNOMED, LOINC', route: '/cos-comprehensive', icon: 'Network' },
            { id: 'offline', title: 'Offline First', description: 'Works without connectivity', route: '/cos-comprehensive', icon: 'WifiOff' },
            { id: 'cloud', title: 'Cloud & Mobile', description: 'Secure cloud, mobile everywhere', route: '/cos-comprehensive', icon: 'Cloud' },
          ],
        },
      ],
      footer: {
        title: 'One platform. Every workflow.',
        description: 'Explore the full Clinical Operating System',
        route: '/cos-comprehensive',
        cta: 'Explore Platform',
      },
    },
  },
  {
    id: 'solutions',
    title: 'Solutions',
    description: 'Purpose-built solutions for every healthcare stakeholder',
    icon: 'Component',
    color: 'sky',
    visibility: 'public',
    order: 2,
    megaMenu: {
      columns: [
        {
          title: 'Facilities',
          links: [
            { id: 'hospitals', title: 'Hospitals', description: 'Multi-ward, multi-department hospital management', route: '/hmis', icon: 'Building2' },
            { id: 'clinics', title: 'Clinics', description: 'Outpatient and primary care clinics', route: '/cos-landing', icon: 'Stethoscope' },
            { id: 'private-practice', title: 'Private Practice', description: 'Independent practice management', route: '/cos-landing', icon: 'UserCircle' },
            { id: 'emergency', title: 'Emergency Response', description: 'Emergency departments and rapid response', route: '/emergency', icon: 'Siren' },
            { id: 'telemedicine', title: 'Telemedicine', description: 'Virtual care and remote consultation', route: '/telemedicine', icon: 'Video' },
          ],
        },
        {
          title: 'Specialists',
          links: [
            { id: 'laboratory', title: 'Laboratory', description: 'End-to-end laboratory management', route: '/laboratory', icon: 'FlaskConical' },
            { id: 'radiology', title: 'Radiology', description: 'Imaging, DICOM and reporting', route: '/radiology', icon: 'Scan' },
            { id: 'pharmacy', title: 'Pharmacy', description: 'Dispensing and medication safety', route: '/pharmacy', icon: 'Pill' },
            { id: 'clinical-intelligence-sol', title: 'Clinical Intelligence', description: 'Reasoning and decision support', route: '/clinical-intelligence', icon: 'Brain' },
            { id: 'research', title: 'Research', description: 'Clinical research and population health', route: '/population-health', icon: 'Microscope' },
          ],
        },
        {
          title: 'Sectors',
          links: [
            { id: 'public-health', title: 'Public Health', description: 'Population health and disease surveillance', route: '/population-health', icon: 'Activity' },
            { id: 'governments', title: 'Governments', description: 'National and regional health systems', route: '/population-health', icon: 'Landmark' },
            { id: 'ngos', title: 'NGOs', description: 'Community health programs', route: '/community-health', icon: 'HeartHandshake' },
            { id: 'insurance', title: 'Insurance', description: 'Claims and population management', route: '/cos-comprehensive', icon: 'ShieldCheck' },
            { id: 'medical-schools', title: 'Medical Schools', description: 'Education and training institutions', route: '/pme', icon: 'GraduationCap' },
          ],
        },
      ],
      footer: {
        title: 'Who is AMEXAN built for?',
        description: 'See the ecosystem for every healthcare role',
        route: '/cos-landing',
        cta: 'See Solutions',
      },
    },
  },
  {
    id: 'users',
    title: 'Users',
    description: 'One platform, a workspace for every healthcare role',
    icon: 'Users',
    color: 'sky',
    visibility: 'public',
    order: 3,
    megaMenu: {
      columns: [
        {
          title: 'Clinical',
          links: [
            { id: 'doctors', title: 'Doctors', description: 'Diagnose, document, reason with AI support', route: '/doctor', icon: 'Stethoscope' },
            { id: 'nurses', title: 'Nurses', description: 'Triage, vitals, medication administration', route: '/nurse', icon: 'HeartPulse' },
            { id: 'clinical-officers', title: 'Clinical Officers', description: 'Patient care and treatment planning', route: '/doctor', icon: 'UserCircle' },
            { id: 'pharmacists', title: 'Pharmacists', description: 'Prescription verification and dispensing', route: '/pharmacy', icon: 'Pill' },
            { id: 'laboratory-staff', title: 'Laboratory', description: 'Order entry, specimen tracking, results', route: '/laboratory', icon: 'FlaskConical' },
          ],
        },
        {
          title: 'Support & Operations',
          links: [
            { id: 'radiology-staff', title: 'Radiology', description: 'Imaging, reporting and correlation', route: '/radiology', icon: 'Scan' },
            { id: 'administrators', title: 'Administrators', description: 'Facility, staff and operations management', route: '/dashboard', icon: 'Settings' },
            { id: 'ict', title: 'ICT', description: 'Deployment, integration and support', route: '/cos-comprehensive', icon: 'Cpu' },
            { id: 'partners', title: 'Partners', description: 'Build, extend and resell AMEXAN', route: '/cos-comprehensive', icon: 'HeartHandshake' },
            { id: 'government-users', title: 'Government', description: 'Health system oversight and reporting', route: '/population-health', icon: 'Landmark' },
          ],
        },
        {
          title: 'Learning & Research',
          links: [
            { id: 'students', title: 'Students', description: 'Learn clinical reasoning on real cases', route: '/pme', icon: 'GraduationCap' },
            { id: 'researchers', title: 'Researchers', description: 'Discover from real-world care data', route: '/population-health', icon: 'Microscope' },
            { id: 'educators', title: 'Educators', description: 'Teach where clinicians work', route: '/pme', icon: 'BookOpen' },
            { id: 'patients', title: 'Patients', description: 'Your health record in your pocket', route: '/cos-patient-portal', icon: 'UserCircle' },
            { id: 'families', title: 'Families', description: 'Caregiver support and visibility', route: '/cos-patient-portal', icon: 'HeartHandshake' },
          ],
        },
      ],
      footer: {
        title: 'A workspace for every role.',
        description: 'See how each role uses AMEXAN',
        route: '/cos-landing',
        cta: 'Explore Users',
      },
    },
  },
  {
    id: 'developers',
    title: 'Developers',
    description: 'Build on AMEXAN — APIs, FHIR, SDKs and the Marketplace',
    icon: 'Code2',
    color: 'sky',
    visibility: 'public',
    order: 4,
    megaMenu: {
      columns: [
        {
          title: 'Build',
          links: [
            { id: 'sdk', title: 'SDKs & Libraries', description: 'Client libraries in every language', route: '/cos-comprehensive', icon: 'Code2' },
            { id: 'api', title: 'API Reference', description: 'REST, GraphQL and real-time APIs', route: '/cos-comprehensive', icon: 'Braces' },
            { id: 'webhooks', title: 'Webhooks', description: 'Event-driven integrations', route: '/cos-comprehensive', icon: 'Webhook' },
            { id: 'plugins', title: 'Plugins', description: 'Extend AMEXAN with custom modules', route: '/cos-comprehensive', icon: 'Blocks' },
            { id: 'marketplace', title: 'Marketplace', description: 'Publish to the AMEXAN ecosystem', route: '/admin/marketplace', icon: 'Store' },
          ],
        },
        {
          title: 'Standards',
          links: [
            { id: 'fhir', title: 'FHIR', description: 'FHIR R4 implementation guide', route: '/cos-comprehensive', icon: 'GitBranch' },
            { id: 'hl7', title: 'HL7', description: 'HL7 v2 and v3 messaging', route: '/cos-comprehensive', icon: 'Network' },
            { id: 'dicom', title: 'DICOM', description: 'Medical imaging integration', route: '/radiology', icon: 'Scan' },
            { id: 'snomed', title: 'SNOMED CT', description: 'Clinical terminology support', route: '/cos-comprehensive', icon: 'FileCheck2' },
            { id: 'loinc', title: 'LOINC', description: 'Laboratory observation coding', route: '/cos-comprehensive', icon: 'FlaskConical' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { id: 'docs', title: 'Documentation', description: 'Guides, tutorials and reference', route: '/cos-comprehensive', icon: 'FileText' },
            { id: 'quickstart', title: 'Quickstart', description: 'Ship your first integration', route: '/cos-comprehensive', icon: 'Rocket' },
            { id: 'changelog', title: 'Changelog', description: 'Platform and API updates', route: '/cos-comprehensive', icon: 'Clock' },
            { id: 'status', title: 'Status', description: 'Platform availability and uptime', route: '/cos-comprehensive', icon: 'Activity' },
            { id: 'community', title: 'Community', description: 'Developer forum and support', route: '/cos-comprehensive', icon: 'Users' },
          ],
        },
      ],
      footer: {
        title: 'Build on the AMEXAN platform.',
        description: 'Open standards. No lock-in. Real integration.',
        route: '/cos-comprehensive',
        cta: 'Developer Platform',
      },
    },
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Plugins, AI, modules and integrations for every workflow',
    icon: 'Store',
    color: 'sky',
    visibility: 'public',
    order: 5,
    megaMenu: {
      columns: [
        {
          title: 'Solutions',
          links: [
            { id: 'clinical-modules', title: 'Clinical Modules', description: 'Specialty workflows and modules', route: '/admin/marketplace', icon: 'Stethoscope' },
            { id: 'ai-plugins', title: 'AI Plugins', description: 'Imaging AI, laboratory AI and more', route: '/admin/marketplace', icon: 'Bot' },
            { id: 'education-packs', title: 'Education Packs', description: 'Curricula, simulations and assessments', route: '/admin/marketplace', icon: 'GraduationCap' },
            { id: 'protocols', title: 'Protocols', description: 'Evidence-based clinical protocols', route: '/admin/marketplace', icon: 'FileCheck2' },
          ],
        },
        {
          title: 'Deploy',
          links: [
            { id: 'hospital-templates', title: 'Hospital Templates', description: 'Pre-configured hospital setups', route: '/admin/marketplace', icon: 'Building2' },
            { id: 'themes', title: 'Themes & Branding', description: 'White-label themes', route: '/admin/marketplace', icon: 'Palette' },
            { id: 'integrations', title: 'Integrations', description: 'Device, lab and system adapters', route: '/admin/marketplace', icon: 'Plug' },
            { id: 'sdks', title: 'SDKs', description: 'Developer tools and libraries', route: '/admin/marketplace', icon: 'Code2' },
          ],
        },
        {
          title: 'Future-Ready',
          links: [
            { id: 'medical-devices', title: 'Medical Devices', description: 'IoT and connected devices', route: '/admin/marketplace', icon: 'MonitorSmartphone' },
            { id: 'wearables', title: 'Wearables', description: 'Patient-worn monitoring', route: '/admin/marketplace', icon: 'Watch' },
            { id: 'national-registries', title: 'National Registries', description: 'Country and disease registries', route: '/admin/marketplace', icon: 'Landmark' },
            { id: 'payment-gateways', title: 'Payment Gateways', description: 'Billing and payments', route: '/admin/marketplace', icon: 'CreditCard' },
          ],
        },
      ],
      footer: {
        title: 'Never outgrow the platform.',
        description: 'Browse the AMEXAN Marketplace',
        route: '/admin/marketplace',
        cta: 'Open Marketplace',
      },
    },
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Knowledge, support and the AMEXAN community',
    icon: 'BookOpen',
    color: 'sky',
    visibility: 'public',
    order: 6,
    megaMenu: {
      columns: [
        {
          title: 'Learn',
          links: [
            { id: 'knowledge-center', title: 'Knowledge Center', description: 'Guides, tutorials and best practices', route: '/cos-comprehensive', icon: 'BookOpen' },
            { id: 'clinical-library', title: 'Clinical Library', description: 'Evidence-based clinical content', route: '/clinical-intelligence', icon: 'Library' },
            { id: 'case-studies', title: 'Case Studies', description: 'Real-world implementations', route: '/cos-comprehensive', icon: 'FileText' },
            { id: 'academy', title: 'Academy', description: 'Certification and training', route: '/pme', icon: 'GraduationCap' },
          ],
        },
        {
          title: 'Connect',
          links: [
            { id: 'help-center', title: 'Help Center', description: 'Support articles and FAQs', route: '/book-demo', icon: 'LifeBuoy' },
            { id: 'community-res', title: 'Community', description: 'Forums and discussions', route: '/cos-comprehensive', icon: 'Users' },
            { id: 'release-notes', title: 'Release Notes', description: 'What is new in AMEXAN', route: '/cos-comprehensive', icon: 'ScrollText' },
            { id: 'roadmap', title: 'Roadmap', description: 'Where AMEXAN is heading', route: '/cos-comprehensive', icon: 'MapPin' },
          ],
        },
      ],
      footer: {
        title: 'Get the help you need.',
        description: 'Contact the AMEXAN team',
        route: '/book-demo',
        cta: 'Contact Support',
      },
    },
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Simple pricing for every size of organization',
    icon: 'CreditCard',
    color: 'sky',
    visibility: 'public',
    order: 7,
    route: '/book-demo',
  },
  {
    id: 'company',
    title: 'Company',
    description: 'The mission, constitution and people behind AMEXAN',
    icon: 'Building2',
    color: 'sky',
    visibility: 'public',
    order: 8,
    megaMenu: {
      columns: [
        {
          title: 'Company',
          links: [
            { id: 'about', title: 'About', description: 'Our mission and story', route: '/cos-landing', icon: 'Info' },
            { id: 'mission', title: 'Mission', description: 'Global clinical intelligence', route: '/cos-landing', icon: 'Target' },
            { id: 'constitution', title: 'AMEXAN Constitution', description: 'The rules that govern the platform', route: '/amexan-constitution', icon: 'ScrollText' },
            { id: 'vision', title: 'Vision', description: 'One operating system for healthcare', route: '/cos-landing', icon: 'Eye' },
          ],
        },
        {
          title: 'Trust & Compliance',
          links: [
            { id: 'security', title: 'Security', description: 'Security, privacy and compliance', route: '/cos-comprehensive', icon: 'ShieldCheck' },
            { id: 'trust', title: 'Trust Center', description: 'Privacy, uptime and governance', route: '/cos-comprehensive', icon: 'Lock' },
            { id: 'standards', title: 'Standards', description: 'FHIR, HL7, DICOM, SNOMED, LOINC, ICD', route: '/cos-comprehensive', icon: 'Scale' },
            { id: 'contact', title: 'Contact', description: 'Get in touch with AMEXAN', route: '/book-demo', icon: 'LifeBuoy' },
          ],
        },
      ],
      footer: {
        title: 'AMEXAN is a constitution, not a product.',
        description: 'Read the AMEXAN Constitution',
        route: '/amexan-constitution',
        cta: 'Read the Constitution',
      },
    },
  },
  {
    id: 'support',
    title: 'Support',
    description: 'Get help, book a demo, or start your journey',
    icon: 'LifeBuoy',
    color: 'sky',
    visibility: 'public',
    order: 9,
    route: '/book-demo',
  },
]

export const NAV_ACTIONS = {
  search: {
    id: 'search',
    title: 'Search',
    description: 'Search everything on AMEXAN',
    route: '/search',
    icon: 'Search',
    color: 'sky',
    visibility: 'public' as NavVisibility,
    order: 1,
  },
  language: {
    id: 'language',
    title: 'Language',
    description: 'Change language',
    route: '#',
    icon: 'Globe',
    color: 'sky',
    visibility: 'public' as NavVisibility,
    order: 2,
  },
  login: {
    id: 'login',
    title: 'Log In',
    description: 'Log in to AMEXAN',
    route: '/login',
    icon: 'LogIn',
    color: 'sky',
    visibility: 'public' as NavVisibility,
    order: 3,
  },
  register: {
    id: 'register',
    title: 'Get Started',
    description: 'Create a free AMEXAN account',
    route: '/register',
    icon: 'UserPlus',
    color: 'sky',
    visibility: 'public' as NavVisibility,
    order: 4,
  },
  bookDemo: {
    id: 'bookDemo',
    title: 'Book Demo',
    description: 'See AMEXAN in action',
    route: '/book-demo',
    icon: 'CalendarDays',
    color: 'sky',
    visibility: 'public' as NavVisibility,
    order: 5,
  },
} as const

export const getVisibleNavItems = (visibility: NavVisibility = 'public'): NavItem[] =>
  NAV_ITEMS.filter((item) => {
    if (item.visibility === 'public') return true
    return visibility === item.visibility || visibility === 'admin'
  })

export default NAV_ITEMS
