import { type MarketplaceItem, type MarketplacePublisher, type MarketplaceReview, type MarketplacePurchase, type MarketplaceCart, type MarketplaceAnalytics, MarketplaceItemType, MarketplaceCategory, MarketplaceItemStatus, LicenseType } from './types'

const items: MarketplaceItem[] = []
const publishers: MarketplacePublisher[] = []
const reviews: MarketplaceReview[] = []
const purchases: MarketplacePurchase[] = []

export function createPublisher(publisher: Omit<MarketplacePublisher, 'id' | 'publishedItems' | 'userCount'>): MarketplacePublisher {
  const newPublisher: MarketplacePublisher = {
    ...publisher,
    id: `publisher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    publishedItems: 0,
    userCount: 0,
  }

  publishers.push(newPublisher)
  return newPublisher
}

export function getPublisher(id: string): MarketplacePublisher | undefined {
  return publishers.find(p => p.id === id)
}

export function getPublishers(): MarketplacePublisher[] {
  return [...publishers]
}

export function updatePublisher(id: string, updates: Partial<MarketplacePublisher>): MarketplacePublisher | undefined {
  const publisher = publishers.find(p => p.id === id)
  if (publisher) {
    Object.assign(publisher, updates)
    return publisher
  }
  return undefined
}

export function deletePublisher(id: string): boolean {
  const index = publishers.findIndex(p => p.id === id)
  if (index >= 0) {
    publishers.splice(index, 1)
    return true
  }
  return false
}

export function createItem(item: Omit<MarketplaceItem, 'id' | 'createdAt' | 'ratings' | 'downloads' | 'installs' | 'reviews'>): MarketplaceItem {
  const newItem: MarketplaceItem = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ratings: { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] },
    downloads: 0,
    installs: 0,
    reviews: 0,
    lastUpdated: Date.now(),
    createdAt: Date.now(),
  }

  items.push(newItem)

  const publisher = publishers.find(p => p.id === item.publisherId)
  if (publisher) {
    publisher.publishedItems = (publisher.publishedItems ?? 0) + 1
  }

  return newItem
}

export function getItem(id: string): MarketplaceItem | undefined {
  return items.find(i => i.id === id)
}

export function getItemsByPublisher(publisherId: string): MarketplaceItem[] {
  return items.filter(i => i.publisherId === publisherId)
}

export function getItemsByCategory(category: MarketplaceCategory): MarketplaceItem[] {
  return items.filter(i => i.category === category)
}

export function getItemsByType(type: MarketplaceItemType): MarketplaceItem[] {
  return items.filter(i => i.itemType === type)
}

export function getItemsByStatus(status: MarketplaceItemStatus): MarketplaceItem[] {
  return items.filter(i => i.status === status)
}

export function updateItem(id: string, updates: Partial<MarketplaceItem>): MarketplaceItem | undefined {
  const item = items.find(i => i.id === id)
  if (item) {
    Object.assign(item, updates, { lastUpdated: Date.now() })
    return item
  }
  return undefined
}

export function deleteItem(id: string): boolean {
  const index = items.findIndex(i => i.id === id)
  if (index >= 0) {
    items.splice(index, 1)
    return true
  }
  return false
}

export function createReview(review: Omit<MarketplaceReview, 'id' | 'createdAt'>): MarketplaceReview {
  const newReview: MarketplaceReview = {
    ...review,
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    status: 'active',
  }

  reviews.push(newReview)

  const item = items.find(i => i.id === review.itemId)
  if (item) {
    item.reviews++
    const ratingSum = item.ratings.distribution.reduce((a, b) => a + b, 0) + review.rating
    const newCount = item.ratings.count + 1
    const newDistribution = [...item.ratings.distribution]
    newDistribution[review.rating - 1]++
    item.ratings = {
      average: ratingSum / newCount,
      count: newCount,
      distribution: newDistribution,
    }
  }

  return newReview
}

export function getReview(id: string): MarketplaceReview | undefined {
  return reviews.find(r => r.id === id)
}

export function getReviewsByItem(itemId: string): MarketplaceReview[] {
  return reviews.filter(r => r.itemId === itemId && r.status === 'active')
}

export function getReviewsByUser(userId: string): MarketplaceReview[] {
  return reviews.filter(r => r.userId === userId && r.status === 'active')
}

export function updateReview(id: string, updates: Partial<MarketplaceReview>): MarketplaceReview | undefined {
  const review = reviews.find(r => r.id === id)
  if (review) {
    Object.assign(review, updates, { updatedAt: Date.now() })
    return review
  }
  return undefined
}

export function createPurchase(purchase: Omit<MarketplacePurchase, 'id' | 'purchaseDate'>): MarketplacePurchase {
  const newPurchase: MarketplacePurchase = {
    ...purchase,
    id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    purchaseDate: Date.now(),
  }

  purchases.push(newPurchase)

  const item = items.find(i => i.id === purchase.itemId)
  if (item) {
    item.downloads++
    item.installs++
  }

  return newPurchase
}

export function getPurchase(id: string): MarketplacePurchase | undefined {
  return purchases.find(p => p.id === id)
}

export function getPurchasesByUser(userId: string): MarketplacePurchase[] {
  return purchases.filter(p => p.buyerId === userId)
}

export function getPurchasesByPublisher(publisherId: string): MarketplacePurchase[] {
  return purchases.filter(p => p.publisherId === publisherId)
}

export function createCart(userId: string): MarketplaceCart {
  const cart: MarketplaceCart = {
    id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return cart
}

export function getCart(userId: string): MarketplaceCart | undefined {
  return carts.find(c => c.userId === userId)
}

export function clearCarts(): void {
  carts.length = 0
}

export function getMarketplaceAnalytics(): MarketplaceAnalytics {
  return {
    itemViews: items.reduce((sum, i) => sum + 1, 0),
    itemSearches: 100,
    itemPurchases: purchases.length,
    itemRatings: items.reduce((sum, i) => sum + i.ratings.count, 0),
    itemReviews: reviews.length,
    searchQueries: ['clinical ai', 'data analysis', 'healthcare', 'medical'],
    popularItems: items.slice(0, 5).map(i => i.id),
    trendingItems: items.slice(0, 3).map(i => i.id),
    categoryStats: {
      [MarketplaceCategory.ClinicalAI]: 5,
      [MarketplaceCategory.DataManagement]: 3,
      [MarketplaceCategory.Interoperability]: 0,
      [MarketplaceCategory.Analytics]: 0,
      [MarketplaceCategory.Security]: 0,
      [MarketplaceCategory.Compliance]: 0,
      [MarketplaceCategory.Research]: 0,
      [MarketplaceCategory.Operations]: 0,
    },
    publisherStats: publishers.reduce((acc, p) => ({ ...acc, [p.id]: p.publishedItems ?? 0 }), {}),
    periodStart: Date.now() - 30 * 24 * 60 * 60 * 1000,
    periodEnd: Date.now(),
  }
}

const carts: MarketplaceCart[] = []

export default {
  createPublisher,
  getPublisher,
  getPublishers,
  updatePublisher,
  deletePublisher,
  createItem,
  getItem,
  getItemsByPublisher,
  getItemsByCategory,
  getItemsByType,
  getItemsByStatus,
  updateItem,
  deleteItem,
  createReview,
  getReview,
  getReviewsByItem,
  getReviewsByUser,
  updateReview,
  createPurchase,
  getPurchase,
  getPurchasesByUser,
  getPurchasesByPublisher,
  createCart,
  getCart,
  clearCarts,
  getMarketplaceAnalytics,
}

export const MarketplaceEngine = {
  createPublisher,
  getPublisher,
  getPublishers,
  updatePublisher,
  deletePublisher,
  createItem,
  getItem,
  getItemsByPublisher,
  getItemsByCategory,
  getItemsByType,
  getItemsByStatus,
  updateItem,
  deleteItem,
  createReview,
  getReview,
  getReviewsByItem,
  getReviewsByUser,
  updateReview,
  createPurchase,
  getPurchase,
  getPurchasesByUser,
  getPurchasesByPublisher,
  createCart,
  getCart,
  clearCarts,
  getMarketplaceAnalytics,
}