import { MarketplaceEngine } from '../marketplace-engine'
import { MarketplaceItemType, MarketplaceCategory, MarketplaceItemStatus, LicenseType } from '../types'

describe('MarketplaceEngine', () => {
  beforeEach(() => {
    MarketplaceEngine.clearCarts()
  })

  test('should create a publisher', () => {
    const publisher = MarketplaceEngine.createPublisher({
      name: 'Test Publisher',
      organizationId: 'org-1',
      verified: true,
    })

    expect(publisher.id).toBeDefined()
    expect(publisher.name).toBe('Test Publisher')
  })

  test('should create an item', () => {
    const item = MarketplaceEngine.createItem({
      name: 'Test Item',
      description: 'A test item',
      itemType: MarketplaceItemType.ClinicalTool,
      category: MarketplaceCategory.ClinicalAI,
      status: MarketplaceItemStatus.Draft,
      publisherId: 'pub-1',
      publisherName: 'Test Publisher',
      version: '1.0.0',
      license: LicenseType.Free,
      price: 0,
      tags: [],
      lastUpdated: Date.now(),
    })

    expect(item.id).toBeDefined()
    expect(item.name).toBe('Test Item')
  })

  test('should get items by publisher', () => {
    const item = MarketplaceEngine.createItem({
      name: 'Test Item',
      description: 'A test item',
      itemType: MarketplaceItemType.ClinicalTool,
      category: MarketplaceCategory.ClinicalAI,
      status: MarketplaceItemStatus.Draft,
      publisherId: 'pub-1',
      publisherName: 'Test Publisher',
      version: '1.0.0',
      license: LicenseType.Free,
      price: 0,
      tags: [],
      lastUpdated: Date.now(),
    })

    const items = MarketplaceEngine.getItemsByPublisher('pub-1')
    expect(items.length).toBeGreaterThan(0)
  })

  test('should create a review', () => {
    const review = MarketplaceEngine.createReview({
      itemId: 'item-1',
      publisherId: 'pub-1',
      userId: 'user-1',
      rating: 5,
      title: 'Great Product',
      comment: 'This product is excellent!',
      status: 'active',
      verifiedPurchase: true,
    })

    expect(review.id).toBeDefined()
    expect(review.rating).toBe(5)
  })

  test('should get marketplace analytics', () => {
    const analytics = MarketplaceEngine.getMarketplaceAnalytics()
    expect(analytics).toBeDefined()
    expect(analytics.itemViews).toBeGreaterThanOrEqual(0)
  })
})