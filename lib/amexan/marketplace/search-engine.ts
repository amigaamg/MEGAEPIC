import { type MarketplaceItem, MarketplaceItemType, MarketplaceCategory } from './types'

const items: MarketplaceItem[] = []

export function indexItem(item: MarketplaceItem): void {
  items.push(item)
}

export function searchItems(query: string): MarketplaceItem[] {
  const lowerQuery = query.toLowerCase()
  return items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(lowerQuery)
    const descriptionMatch = item.description.toLowerCase().includes(lowerQuery)
    const categoryMatch = item.category === lowerQuery
    const typeMatch = item.itemType === lowerQuery
    const tagMatches = item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    
    return nameMatch || descriptionMatch || categoryMatch || typeMatch || tagMatches
  })
}

export function filterItemsByCategory(category: MarketplaceCategory): MarketplaceItem[] {
  return items.filter(item => item.category === category)
}

export function filterItemsByType(type: MarketplaceItemType): MarketplaceItem[] {
  return items.filter(item => item.itemType === type)
}

export function filterItemsByPrice(minPrice?: number, maxPrice?: number): MarketplaceItem[] {
  return items.filter(item => {
    if (minPrice && item.price && item.price < minPrice) return false
    if (maxPrice && item.price && item.price > maxPrice) return false
    return true
  })
}

export function filterItemsByLicense(license: string): MarketplaceItem[] {
  return items.filter(item => item.license.toString() === license)
}

export function getPopularItems(limit: number = 10): MarketplaceItem[] {
  return items
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit)
}

export function getNewItems(limit: number = 10): MarketplaceItem[] {
  return items
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export function getTopRatedItems(limit: number = 10): MarketplaceItem[] {
  return items
    .filter(item => item.ratings.count > 0)
    .sort((a, b) => b.ratings.average - a.ratings.average)
    .slice(0, limit)
}

export function clearIndex(): void {
  items.length = 0
}

export default {
  indexItem,
  searchItems,
  filterItemsByCategory,
  filterItemsByType,
  filterItemsByPrice,
  filterItemsByLicense,
  getPopularItems,
  getNewItems,
  getTopRatedItems,
  clearIndex,
}

export const SearchEngine = {
  indexItem,
  searchItems,
  filterItemsByCategory,
  filterItemsByType,
  filterItemsByPrice,
  filterItemsByLicense,
  getPopularItems,
  getNewItems,
  getTopRatedItems,
  clearIndex,
}