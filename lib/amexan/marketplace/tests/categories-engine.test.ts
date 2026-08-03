import { CategoriesEngine } from '../categories-engine'
import { MarketplaceCategory } from '../types'

describe('CategoriesEngine', () => {
  test('should get all categories', () => {
    const categories = CategoriesEngine.getCategories()
    expect(categories.length).toBeGreaterThan(0)
    expect(categories).toContain(MarketplaceCategory.ClinicalAI)
  })

  test('should get category by name', () => {
    const category = CategoriesEngine.getCategoryByName('clinicalAI')
    expect(category).toBeDefined()
  })

  test('should get category stats', () => {
    const stats = CategoriesEngine.getCategoryStats(MarketplaceCategory.ClinicalAI)
    expect(stats).toBeDefined()
    expect(stats.itemCount).toBeGreaterThanOrEqual(0)
  })

  test('should get all category stats', () => {
    const stats = CategoriesEngine.getAllCategoryStats()
    expect(stats.length).toBeGreaterThan(0)
  })
})