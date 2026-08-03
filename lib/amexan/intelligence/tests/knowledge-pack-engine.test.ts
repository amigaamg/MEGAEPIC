import KnowledgePackEngine from '../knowledge-pack-engine'
import { type KnowledgePack } from '../types'

describe('KnowledgePackEngine', () => {
  beforeEach(() => {
    KnowledgePackEngine.clearKnowledgePacks()
  })

  test('should register and retrieve a knowledge pack', () => {
    const pack: KnowledgePack = {
      id: 'pack-1',
      name: 'Test Pack',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    KnowledgePackEngine.registerKnowledgePack(pack)
    const retrieved = KnowledgePackEngine.getKnowledgePack('pack-1')

    expect(retrieved).toBeDefined()
    expect(retrieved!.name).toBe('Test Pack')
  })

  test('should get active knowledge packs', () => {
    const pack: KnowledgePack = {
      id: 'pack-1',
      name: 'Active Pack',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [],
      status: 'published',
      effectiveDate: Date.now() - 86400000,
    }

    KnowledgePackEngine.registerKnowledgePack(pack)
    const active = KnowledgePackEngine.getActiveKnowledgePacks()

    expect(active.length).toBe(1)
  })

  test('should validate a knowledge pack', () => {
    const pack: KnowledgePack = {
      id: 'pack-1',
      name: 'Valid Pack',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [
        {
          id: 'rule-1',
          type: 'recommendation',
          condition: 'chest pain',
          action: 'Order ECG',
          evidence: 'test',
          priority: 5,
          effectiveDate: Date.now(),
        },
      ],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    const result = KnowledgePackEngine.validateKnowledgePack(pack)
    expect(result.valid).toBe(true)
  })

  test('should remove a knowledge pack', () => {
    const pack: KnowledgePack = {
      id: 'pack-1',
      name: 'Remove Pack',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    KnowledgePackEngine.registerKnowledgePack(pack)
    KnowledgePackEngine.removeKnowledgePack('pack-1')
    const retrieved = KnowledgePackEngine.getKnowledgePack('pack-1')

    expect(retrieved).toBeUndefined()
  })

  test('should get all knowledge packs', () => {
    const pack1: KnowledgePack = {
      id: 'pack-1',
      name: 'Pack 1',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    const pack2: KnowledgePack = {
      id: 'pack-2',
      name: 'Pack 2',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    KnowledgePackEngine.registerKnowledgePack(pack1)
    KnowledgePackEngine.registerKnowledgePack(pack2)
    const all = KnowledgePackEngine.getAllKnowledgePacks()

    expect(all.length).toBe(2)
  })
})
