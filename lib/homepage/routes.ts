// AMEXAN Homepage Routes
// Constitutional: single source of truth for every link on the homepage.
// Only real, existing routes are used. No dead links.

export const ROUTES = {
  home: '/',
  register: '/register',
  login: '/login',
  bookDemo: '/book-demo',
  platform: '/cos-comprehensive',
  cosLanding: '/cos-landing',
  patientPortal: '/cos-patient-portal',
  clinicalIntelligence: '/clinical-intelligence',
  hmis: '/hmis',
  telemedicine: '/telemedicine',
  analytics: '/analytics',
  marketplace: '/admin/marketplace',
  education: '/pme',
  populationHealth: '/population-health',
  laboratory: '/laboratory',
  radiology: '/radiology',
  pharmacy: '/pharmacy',
  emergency: '/emergency',
  doctor: '/doctor',
  nurse: '/nurse',
  schedule: '/schedule',
  billing: '/billing',
  inventory: '/inventory',
  documentation: '/documentation',
  encounterCenter: '/encounter-center',
  communityHealth: '/community-health',
  constitution: '/amexan-constitution',
  dashboard: '/dashboard',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
