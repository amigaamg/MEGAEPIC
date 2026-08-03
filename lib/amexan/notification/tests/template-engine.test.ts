import TemplateEngine from '../template-engine'
import { NotificationCategory, NotificationChannel } from '../types'

describe('TemplateEngine', () => {
  test('should create a template', () => {
    const template = TemplateEngine.createTemplate({
      name: 'Test Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Test Subject',
      body: 'Test Body',
      variables: ['name', 'date'],
      organizationId: 'org-1',
      version: '1.0.0',
      status: 'draft',
    })

    expect(template.id).toBeDefined()
    expect(template.name).toBe('Test Template')
  })

  test('should get a template by ID', () => {
    const template = TemplateEngine.createTemplate({
      name: 'Get Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Subject',
      body: 'Body',
      variables: [],
      organizationId: 'org-1',
      version: '1.0.0',
      status: 'draft',
    })

    const result = TemplateEngine.getTemplate(template.id)
    expect(result).toBeDefined()
    expect(result!.name).toBe('Get Template')
  })

  test('should get templates by organization', () => {
    TemplateEngine.createTemplate({
      name: 'Org Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Subject',
      body: 'Body',
      variables: [],
      organizationId: 'org-1',
      version: '1.0.0',
      status: 'draft',
    })

    const results = TemplateEngine.getTemplatesByOrganization('org-1')
    expect(results.length).toBeGreaterThan(0)
  })

  test('should render a template', () => {
    const template = TemplateEngine.createTemplate({
      name: 'Render Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Hello {{name}}',
      body: 'Dear {{name}}, your appointment is on {{date}}.',
      variables: ['name', 'date'],
      organizationId: 'org-1',
      version: '1.0.0',
      status: 'draft',
    })

    const rendered = TemplateEngine.renderTemplate(template, { name: 'John', date: '2026-01-01' })
    expect(rendered).toContain('John')
    expect(rendered).toContain('2026-01-01')
  })

  test('should update a template', () => {
    const template = TemplateEngine.createTemplate({
      name: 'Update Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Subject',
      body: 'Body',
      variables: [],
      organizationId: 'org-1',
      version: '1.0.0',
      status: 'draft',
    })

    const updated = TemplateEngine.updateTemplate(template.id, { name: 'Updated Name' })
    expect(updated).toBeDefined()
    expect(updated!.name).toBe('Updated Name')
  })

  test('should delete a template', () => {
    const template = TemplateEngine.createTemplate({
      name: 'Delete Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Subject',
      body: 'Body',
      variables: [],
      organizationId: 'org-1',
      version: '1.0.0',
      status: 'draft',
    })

    const deleted = TemplateEngine.deleteTemplate(template.id)
    expect(deleted).toBe(true)
  })
})
