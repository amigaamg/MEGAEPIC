import {
  type AmxpId,
  type CareService,
  type CareServiceType,
  type CareServiceStatus,
  type ServiceWorkflowStep,
  type ServiceRequirement,
  type ServiceBilling,
  type ServiceCommunication,
  type ServiceOutcome,
  type ServiceFeedback,
  type CareBundle,
  type JourneyType,
} from './types';

const SERVICE_LIFECYCLE: CareServiceStatus[] = [
  'requested',
  'eligibility_checked',
  'scheduled',
  'confirmed',
  'prepared',
  'in_progress',
  'delivered',
  'documented',
  'reviewed',
  'completed',
  'quality_assessed',
];

const STATUS_ORDER: Record<CareServiceStatus, number> = {
  requested: 0,
  eligibility_checked: 1,
  scheduled: 2,
  confirmed: 3,
  prepared: 4,
  in_progress: 5,
  delivered: 6,
  documented: 7,
  reviewed: 8,
  completed: 9,
  cancelled: -1,
  failed: -2,
  quality_assessed: 10,
};

export function createCareService(params: {
  type: CareServiceType;
  title: string;
  description?: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  patientAmxpId: AmxpId;
  journeyId?: string;
  providerId: string;
  providerName: string;
  providerType: CareService['providerType'];
  facilityId: string;
  facilityName: string;
  metadata?: Record<string, any>;
}): CareService {
  const now = Date.now();
  return {
    id: `svc-${now.toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    type: params.type,
    title: params.title,
    description: params.description,
    status: 'requested',
    priority: params.priority || 'routine',
    patientAmxpId: params.patientAmxpId,
    journeyId: params.journeyId,
    providerId: params.providerId,
    providerName: params.providerName,
    providerType: params.providerType,
    facilityId: params.facilityId,
    facilityName: params.facilityName,
    workflow: [
      { id: 'request', name: 'Service Requested', status: 'completed' },
      { id: 'eligibility', name: 'Eligibility Check', status: 'pending' },
      { id: 'schedule', name: 'Scheduling', status: 'pending' },
      { id: 'confirm', name: 'Confirmation', status: 'pending' },
      { id: 'prepare', name: 'Preparation', status: 'pending' },
      { id: 'deliver', name: 'Service Delivery', status: 'pending' },
      { id: 'document', name: 'Documentation', status: 'pending' },
      { id: 'review', name: 'Review', status: 'pending' },
      { id: 'complete', name: 'Completion', status: 'pending' },
      { id: 'quality', name: 'Quality Assessment', status: 'pending' },
    ],
    requirements: [],
    documents: [],
    communications: [],
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionService(
  service: CareService,
  toStatus: CareServiceStatus,
  by?: string,
  notes?: string
): CareService {
  const fromOrder = STATUS_ORDER[service.status] ?? 0;
  const toOrder = STATUS_ORDER[toStatus] ?? 0;

  if (toStatus === 'cancelled' || toStatus === 'failed') {
    service.status = toStatus;
    service.updatedAt = Date.now();
    if (notes) {
      const step = service.workflow.find(s => s.status === 'in_progress' || s.status === 'pending');
      if (step) {
        step.status = toStatus === 'cancelled' ? 'skipped' : 'failed';
        step.completedAt = Date.now();
        step.completedBy = by;
        step.notes = notes;
      }
    }
    return service;
  }

  if (toOrder <= fromOrder) return service;

  const stepMap: Record<string, string> = {
    eligibility_checked: 'eligibility',
    scheduled: 'schedule',
    confirmed: 'confirm',
    prepared: 'prepare',
    in_progress: 'deliver',
    delivered: 'deliver',
    documented: 'document',
    reviewed: 'review',
    completed: 'complete',
    quality_assessed: 'quality',
  };

  const stepId = stepMap[toStatus];
  if (stepId) {
    const step = service.workflow.find(s => s.id === stepId);
    if (step) {
      step.status = 'completed';
      step.completedAt = Date.now();
      step.completedBy = by;
      step.notes = notes;
    }
  }

  service.status = toStatus;
  service.updatedAt = Date.now();
  return service;
}

export function addServiceRequirement(
  service: CareService,
  requirement: ServiceRequirement
): CareService {
  service.requirements.push(requirement);
  service.updatedAt = Date.now();
  return service;
}

export function setServiceBilling(
  service: CareService,
  billing: ServiceBilling
): CareService {
  service.billing = billing;
  service.updatedAt = Date.now();
  return service;
}

export function addServiceCommunication(
  service: CareService,
  communication: Omit<ServiceCommunication, 'id' | 'sentAt' | 'delivered'>
): CareService {
  service.communications.push({
    ...communication,
    id: `comm-${Date.now().toString(36)}`,
    sentAt: Date.now(),
    delivered: false,
  });
  service.updatedAt = Date.now();
  return service;
}

export function markCommunicationDelivered(
  service: CareService,
  commId: string
): CareService {
  const comm = service.communications.find(c => c.id === commId);
  if (comm) comm.delivered = true;
  return service;
}

export function setServiceOutcome(
  service: CareService,
  outcome: ServiceOutcome
): CareService {
  service.outcome = outcome;
  service.updatedAt = Date.now();
  return service;
}

export function setServiceFeedback(
  service: CareService,
  feedback: ServiceFeedback
): CareService {
  service.feedback = feedback;
  service.updatedAt = Date.now();
  return service;
}

export function getServiceProgress(service: CareService): number {
  if (service.status === 'cancelled' || service.status === 'failed') return 0;
  if (service.status === 'completed' || service.status === 'quality_assessed') return 100;
  const completedSteps = service.workflow.filter(s => s.status === 'completed').length;
  const totalSteps = service.workflow.length;
  return Math.round((completedSteps / totalSteps) * 100);
}

export function getPatientFacingStatus(service: CareService): string {
  const messages: Record<CareServiceStatus, string> = {
    requested: 'Being processed',
    eligibility_checked: 'Eligibility confirmed',
    scheduled: 'Appointment scheduled',
    confirmed: 'Confirmed',
    prepared: 'Almost ready',
    in_progress: 'In progress',
    delivered: 'Completed',
    documented: 'Documentation in progress',
    reviewed: 'Under review',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed — please contact support',
    quality_assessed: 'Completed',
  };
  return messages[service.status] || 'Processing';
}

export const CARE_BUNDLES: CareBundle[] = [
  {
    id: 'pregnancy-bundle',
    name: 'Pregnancy Care Bundle',
    description: 'Complete antenatal, delivery, and postnatal care package',
    services: ['physical_consultation', 'diagnostic_lab', 'diagnostic_imaging', 'pharmacy', 'education_service', 'telemedicine', 'monitoring_service'],
    totalEstimatedCost: 0,
    currency: 'KES',
    insuranceCoverage: 0,
    patientEstimate: 0,
    journeyTypes: ['pregnancy', 'antenatal'],
  },
  {
    id: 'diabetes-bundle',
    name: 'Diabetes Management Bundle',
    description: 'Comprehensive diabetes care including consultations, labs, education, and monitoring',
    services: ['physical_consultation', 'diagnostic_lab', 'pharmacy', 'education_service', 'monitoring_service', 'rehabilitation'],
    totalEstimatedCost: 0,
    currency: 'KES',
    insuranceCoverage: 0,
    patientEstimate: 0,
    journeyTypes: ['diabetes'],
  },
  {
    id: 'hypertension-bundle',
    name: 'Hypertension Care Bundle',
    description: 'Blood pressure management with monitoring and lifestyle support',
    services: ['physical_consultation', 'diagnostic_lab', 'pharmacy', 'monitoring_service', 'wellness'],
    totalEstimatedCost: 0,
    currency: 'KES',
    insuranceCoverage: 0,
    patientEstimate: 0,
    journeyTypes: ['hypertension'],
  },
  {
    id: 'child-wellness-bundle',
    name: 'Child Wellness Bundle',
    description: 'Vaccinations, growth monitoring, and developmental screening',
    services: ['physical_consultation', 'vaccination', 'preventive_care', 'education_service'],
    totalEstimatedCost: 0,
    currency: 'KES',
    insuranceCoverage: 0,
    patientEstimate: 0,
    journeyTypes: ['newborn', 'infant', 'child'],
  },
];

export function getBundlesForJourney(journeyType: JourneyType): CareBundle[] {
  return CARE_BUNDLES.filter(b => b.journeyTypes.includes(journeyType));
}

export function estimateBundleCost(bundle: CareBundle, hospitalTier: string): number {
  const tierMultiplier: Record<string, number> = {
    level_1: 0.5,
    level_2: 0.7,
    level_3: 1.0,
    level_4: 1.5,
    level_5: 2.0,
    level_6: 3.0,
  };
  const multiplier = tierMultiplier[hospitalTier] || 1.0;
  return Math.round(bundle.totalEstimatedCost * multiplier);
}
