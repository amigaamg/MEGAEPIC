import { type NotificationTemplate, NotificationCategory, NotificationChannel } from './types'

const templates: NotificationTemplate[] = []

export function createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): NotificationTemplate {
  const newTemplate: NotificationTemplate = {
    ...template,
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  templates.push(newTemplate)
  return newTemplate
}

export function getTemplate(id: string): NotificationTemplate | undefined {
  return templates.find(t => t.id === id)
}

export function getTemplatesByOrganization(orgId: string): NotificationTemplate[] {
  return templates.filter(t => t.organizationId === orgId)
}

export function getTemplatesByCategory(category: NotificationCategory): NotificationTemplate[] {
  return templates.filter(t => t.category === category)
}

export function getTemplatesByChannel(channel: NotificationChannel): NotificationTemplate[] {
  return templates.filter(t => t.channel === channel)
}

export function updateTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate | undefined {
  const template = templates.find(t => t.id === id)
  if (template) {
    Object.assign(template, updates, { updatedAt: Date.now() })
    return template
  }
  return undefined
}

export function deleteTemplate(id: string): boolean {
  const index = templates.findIndex(t => t.id === id)
  if (index >= 0) {
    templates.splice(index, 1)
    return true
  }
  return false
}

export function activateTemplate(id: string): NotificationTemplate | undefined {
  const template = templates.find(t => t.id === id)
  if (template) {
    template.status = 'active'
    template.updatedAt = Date.now()
    return template
  }
  return undefined
}

export function archiveTemplate(id: string): NotificationTemplate | undefined {
  const template = templates.find(t => t.id === id)
  if (template) {
    template.status = 'archived'
    template.updatedAt = Date.now()
    return template
  }
  return undefined
}

export function renderTemplate(template: NotificationTemplate, variables: Record<string, string>): string {
  let rendered = template.body
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return rendered
}

export function renderTemplateSubject(template: NotificationTemplate, variables: Record<string, string>): string {
  let rendered = template.subject
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return rendered
}

export function getAllTemplates(): NotificationTemplate[] {
  return [...templates]
}

export function clearTemplates(): void {
  templates.length = 0
}

export default {
  createTemplate,
  getTemplate,
  getTemplatesByOrganization,
  getTemplatesByCategory,
  getTemplatesByChannel,
  updateTemplate,
  deleteTemplate,
  activateTemplate,
  archiveTemplate,
  renderTemplate,
  renderTemplateSubject,
  getAllTemplates,
  clearTemplates,
}