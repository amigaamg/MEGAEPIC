import { MarketplaceCategory } from './types'

const categories: MarketplaceCategory[] = Object.values(MarketplaceCategory)

export function getCategories(): MarketplaceCategory[] {
  return [...categories]
}

export function getCategoryByName(name: string): MarketplaceCategory | undefined {
  return categories.find(c => c === name)
}

export function getCategoryStats(category: MarketplaceCategory): {
  itemCount: number
  publisherCount: number
  totalRevenue: number
} {
  return {
    itemCount: 0,
    publisherCount: 0,
    totalRevenue: 0,
  }
}

export function getAllCategoryStats(): {
  category: MarketplaceCategory
  itemCount: number
  publisherCount: number
  totalRevenue: number
}[] {
  return categories.map(category => ({
    category,
    itemCount: 0,
    publisherCount: 0,
    totalRevenue: 0,
  }))
}

export default {
  getCategories,
  getCategoryByName,
  getCategoryStats,
  getAllCategoryStats,
}

export const CategoriesEngine = {
  getCategories,
  getCategoryByName,
  getCategoryStats,
  getAllCategoryStats,
}