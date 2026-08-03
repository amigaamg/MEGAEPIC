export enum MarketplaceItemType {
  ClinicalTool = 'clinicalTool',
  DataService = 'dataService',
  AIModel = 'aiModel',
  Integration = 'integration',
  Workflow = 'workflow',
  Template = 'template',
  Library = 'library',
  Plugin = 'plugin',
}

export enum MarketplaceCategory {
  ClinicalAI = 'clinicalAI',
  DataManagement = 'dataManagement',
  Interoperability = 'interoperability',
  Analytics = 'analytics',
  Security = 'security',
  Compliance = 'compliance',
  Research = 'research',
  Operations = 'operations',
}

export enum MarketplaceItemStatus {
  Draft = 'draft',
  PendingReview = 'pendingReview',
  Approved = 'approved',
  Active = 'active',
  Discontinued = 'discontinued',
  Deprecated = 'deprecated',
  Rejected = 'rejected',
}

export enum LicenseType {
  Free = 'free',
  Trial = 'trial',
  Commercial = 'commercial',
  Enterprise = 'enterprise',
  OpenSource = 'openSource',
  Custom = 'custom',
}

export interface MarketplaceItem {
  id: string
  name: string
  description: string
  itemType: MarketplaceItemType
  category: MarketplaceCategory
  status: MarketplaceItemStatus
  publisherId: string
  publisherName: string
  version: string
  versionName?: string
  descriptionLong?: string
  logoUrl?: string
  screenshots?: string[]
  documentationUrl?: string
  homepageUrl?: string
  license: LicenseType
  price?: number
  currency?: string
  pricingModel?: string
  tags: string[]
  requirements?: Record<string, unknown>
  features?: string[]
  useCases?: string[]
  targetAudience?: string
  supportLevel?: 'community' | 'professional' | 'enterprise'
  ratings: {
    average: number
    count: number
    distribution: number[]
  }
  downloads: number
  installs: number
  reviews: number
  lastUpdated: number
  createdAt: number
  metadata?: Record<string, unknown>
}

export interface MarketplacePublisher {
  id: string
  name: string
  description?: string
  logoUrl?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  verified: boolean
  organizationId: string
  certifications?: string[]
  establishedAt?: number
  userCount?: number
  publishedItems?: number
  averageRating?: number
  metadata?: Record<string, unknown>
}

export interface MarketplaceReview {
  id: string
  itemId: string
  publisherId: string
  userId: string
  rating: number
  title: string
  comment?: string
  pros?: string[]
  cons?: string[]
  verifiedPurchase: boolean
  createdAt: number
  updatedAt?: number
  status: 'active' | 'flagged' | 'removed'
}

export interface MarketplaceTransaction {
  id: string
  itemId: string
  publisherId: string
  buyerId: string
  quantity: number
  unitPrice: number
  currency: string
  totalAmount: number
  license: LicenseType
  transactionType: 'purchase' | 'rental' | 'subscription' | 'upgrade'
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'canceled'
  paymentProvider?: string
  paymentId?: string
  createdAt: number
  completedAt?: number
  expiresAt?: number
  metadata?: Record<string, unknown>
}

export interface MarketplacePurchase {
  id: string
  itemId: string
  publisherId: string
  buyerId: string
  license: LicenseType
  quantity: number
  unitPrice: number
  currency: string
  totalAmount: number
  transactionId?: string
  purchaseDate: number
  expiryDate?: number
  usage?: number
  metadata?: Record<string, unknown>
}

export interface MarketplaceCart {
  id: string
  userId: string
  items: {
    itemId: string
    publisherId: string
    quantity: number
    unitPrice: number
    license: LicenseType
    totalPrice: number
  }[]
  subtotal: number
  tax: number
  total: number
  createdAt: number
  updatedAt: number
}

export interface MarketplaceRecommendation {
  id: string
  itemId: string
  reason: string
  score: number
  type: 'similar' | 'trending' | 'featured' | 'popular'
  createdAt: number
  metadata?: Record<string, unknown>
}

export interface MarketplaceAnalytics {
  itemViews: number
  itemSearches: number
  itemPurchases: number
  itemRatings: number
  itemReviews: number
  searchQueries: string[]
  popularItems: string[]
  trendingItems: string[]
  categoryStats: Record<MarketplaceCategory, number>
  publisherStats: Record<string, number>
  periodStart: number
  periodEnd: number
}

export interface MarketplaceConfig {
  enableMarketplace: boolean
  enablePurchasing: boolean
  enableReviews: boolean
  enableRatings: boolean
  enableSearch: boolean
  enableRecommendations: boolean
  enableAnalytics: boolean
  commissionRate: number
  refundPolicy: 'strict' | 'moderate' | 'flexible'
  minReviewLength: number
  maxReviewLength: number
  allowFreeTrials: boolean
  defaultTrialDays: number
  enableCart: boolean
  enableBulkPurchase: boolean
  currency: string
  supportedPaymentProviders: string[]
}