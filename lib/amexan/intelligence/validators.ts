import { type ClinicalContext, type KnowledgePack, type KnowledgeRule } from './types'

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

export function validateKnowledgePack(pack: KnowledgePack): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!pack.id) errors.push('Pack ID is required')
  if (!pack.name) errors.push('Pack name is required')
  if (!pack.version) errors.push('Pack version is required')
  if (!pack.source) errors.push('Pack source is required')
  if (pack.rules.length === 0) errors.push('Pack must contain at least one rule')
  if (pack.effectiveDate > Date.now()) errors.push('Effective date cannot be in the future')
  if (pack.expiryDate && pack.expiryDate < pack.effectiveDate) errors.push('Expiry date must be after effective date')
  for (const rule of pack.rules) {
    const ruleValidation = validateKnowledgeRule(rule)
    if (!ruleValidation.valid) {
      errors.push(...ruleValidation.errors.map(e => `Rule ${rule.id}: ${e}`))
    }
  }
  return { valid: errors.length === 0, errors }
}

export function validateKnowledgeRule(rule: KnowledgeRule): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!rule.id) errors.push('Rule ID is required')
  if (!rule.type) errors.push('Rule type is required')
  if (!rule.condition) errors.push('Rule condition is required')
  if (!rule.action) errors.push('Rule action is required')
  if (rule.priority < 1 || rule.priority > 10) errors.push('Rule priority must be between 1 and 10')
  return { valid: errors.length === 0, errors }
}

export function validateObservation(observation: { type: string; value: unknown; patientId: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!observation.type) errors.push('Observation type is required')
  if (observation.value === undefined || observation.value === null) errors.push('Observation value is required')
  if (!observation.patientId) errors.push('Patient ID is required')
  return { valid: errors.length === 0, errors }
}

export function validateRecommendation(recommendation: { title: string; evidence: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!recommendation.title) errors.push('Recommendation title is required')
  if (!recommendation.evidence) errors.push('Recommendation evidence is required')
  return { valid: errors.length === 0, errors }
}

export function validateConfidence(confidence: number): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (confidence < 0 || confidence > 1) errors.push('Confidence must be between 0 and 1')
  return { valid: errors.length === 0, errors }
}

export default {
  validateContext,
  validateKnowledgePack,
  validateKnowledgeRule,
  validateObservation,
  validateRecommendation,
  validateConfidence,
}