export interface MarketplaceIntegration {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  icon: string
  color: string
  developer: {
    name: string
    verified: boolean
  }
  pricing: {
    type: "free" | "paid" | "freemium"
    price?: string
  }
  stats: {
    installs: number
    rating: number
    reviews: number
  }
  features: string[]
  screenshots?: string[]
  tags: string[]
  isInstalled: boolean
  isFeatured?: boolean
  isNew?: boolean
}

export interface Review {
  id: string
  integrationId: string
  user: string
  rating: number
  comment: string
  date: Date
  helpful: number
}
