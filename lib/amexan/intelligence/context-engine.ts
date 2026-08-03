import { type ClinicalContext } from './types'

export function validateContext(context: ClinicalContext): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!context.currentPatient && !context.currentUser) {
    errors.push('At least one of currentPatient or currentUser must be provided')
  }
  if (context.currentDepartment && !context.organizationId) {
    errors.push('Department requires organization context')
  }
  if (context.currentWorkflow && !context.currentPatient) {
    errors.push('Workflow requires a patient context')
  }
  if (context.currentStage && !context.encounterId) {
    errors.push('Stage requires an encounter context')
  }
  return { valid: errors.length === 0, errors }
}

export function buildClinicalContext(partial: Partial<ClinicalContext>): ClinicalContext {
  return {
    currentUser: partial.currentUser,
    currentDepartment: partial.currentDepartment,
    currentWorkflow: partial.currentWorkflow,
    currentPatient: partial.currentPatient,
    currentStage: partial.currentStage,
    currentDisease: partial.currentDisease,
    currentGuidelines: partial.currentGuidelines,
    currentCountry: partial.currentCountry,
    organizationId: partial.organizationId,
    encounterId: partial.encounterId,
  }
}

export function mergeContext(base: ClinicalContext, override: Partial<ClinicalContext>): ClinicalContext {
  return {
    ...base,
    ...override,
    currentGuidelines: override.currentGuidelines || base.currentGuidelines,
  }
}

export function getContextKey(context: ClinicalContext): string {
  const parts = [
    context.currentPatient || 'unknown',
    context.currentDepartment || 'general',
    context.currentStage || 'initial',
    context.currentCountry || 'default',
  ]
  return parts.join('|')
}

export function isContextChanged(prev: ClinicalContext, next: ClinicalContext): boolean {
  return (
    prev.currentPatient !== next.currentPatient ||
    prev.currentDepartment !== next.currentDepartment ||
    prev.currentStage !== next.currentStage ||
    prev.currentDisease !== next.currentDisease ||
    prev.currentCountry !== next.currentCountry ||
    prev.currentWorkflow !== next.currentWorkflow
  )
}

export function extractPatientContext(patientId: string, context: ClinicalContext): ClinicalContext {
  return { ...context, currentPatient: patientId }
}

export function extractDepartmentContext(departmentId: string, context: ClinicalContext): ClinicalContext {
  return { ...context, currentDepartment: departmentId }
}

export function extractWorkflowContext(workflowId: string, context: ClinicalContext): ClinicalContext {
  return { ...context, currentWorkflow: workflowId }
}

export function extractStageContext(stage: string, context: ClinicalContext): ClinicalContext {
  return { ...context, currentStage: stage }
}

export function extractDiseaseContext(disease: string, context: ClinicalContext): ClinicalContext {
  return { ...context, currentDisease: disease }
}

export function extractCountryContext(country: string, context: ClinicalContext): ClinicalContext {
  return { ...context, currentCountry: country }
}

export function extractEncounterContext(encounterId: string, context: ClinicalContext): ClinicalContext {
  return { ...context, encounterId }
}

export function extractOrganizationContext(orgId: string, context: ClinicalContext): ClinicalContext {
  return { ...context, organizationId: orgId }
}

export default {
  validateContext,
  buildClinicalContext,
  mergeContext,
  getContextKey,
  isContextChanged,
  extractPatientContext,
  extractDepartmentContext,
  extractWorkflowContext,
  extractStageContext,
  extractDiseaseContext,
  extractCountryContext,
  extractEncounterContext,
  extractOrganizationContext,
}