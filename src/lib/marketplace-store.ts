import type { MarketplaceIntegration } from "./marketplace-types"

class MarketplaceStore {
  private integrations: MarketplaceIntegration[] = [
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Connect to Salesforce CRM for customer data and analytics",
      longDescription:
        "Integrate your agents with Salesforce to access customer records, create leads, update opportunities, and sync data in real-time. This integration provides comprehensive access to all Salesforce objects and supports custom fields.",
      category: "crm",
      icon: "☁️",
      color: "#00A1E0",
      developer: { name: "Salesforce Inc.", verified: true },
      pricing: { type: "free" },
      stats: { installs: 12500, rating: 4.8, reviews: 234 },
      features: [
        "Real-time customer data sync",
        "Lead and opportunity management",
        "Custom object support",
        "Automated workflows",
      ],
      tags: ["crm", "sales", "enterprise"],
      isInstalled: false,
      isFeatured: true,
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Marketing automation and CRM integration",
      longDescription:
        "Connect HubSpot to automate marketing campaigns, manage contacts, and track customer interactions. Perfect for inbound marketing and sales alignment.",
      category: "marketing",
      icon: "🎯",
      color: "#FF7A59",
      developer: { name: "HubSpot", verified: true },
      pricing: { type: "free" },
      stats: { installs: 8900, rating: 4.7, reviews: 156 },
      features: ["Contact management", "Email campaigns", "Marketing automation", "Analytics dashboard"],
      tags: ["marketing", "crm", "automation"],
      isInstalled: false,
      isFeatured: true,
    },
    {
      id: "zendesk",
      name: "Zendesk",
      description: "Customer support and ticketing system",
      longDescription:
        "Integrate Zendesk to manage customer support tickets, automate responses, and provide better customer service through your AI agents.",
      category: "support",
      icon: "🎫",
      color: "#03363D",
      developer: { name: "Zendesk", verified: true },
      pricing: { type: "free" },
      stats: { installs: 6700, rating: 4.6, reviews: 89 },
      features: ["Ticket management", "Auto-responses", "Customer portal", "Knowledge base integration"],
      tags: ["support", "helpdesk", "tickets"],
      isInstalled: false,
    },
    {
      id: "airtable",
      name: "Airtable",
      description: "Flexible database and spreadsheet hybrid",
      longDescription:
        "Use Airtable as a flexible database for your agents. Create, read, update, and delete records with ease. Perfect for dynamic data management.",
      category: "productivity",
      icon: "📊",
      color: "#FCB400",
      developer: { name: "Airtable", verified: true },
      pricing: { type: "freemium", price: "$10/mo" },
      stats: { installs: 5400, rating: 4.9, reviews: 123 },
      features: ["Visual database", "Custom views", "API access", "Collaboration tools"],
      tags: ["database", "productivity", "collaboration"],
      isInstalled: false,
      isFeatured: true,
      isNew: true,
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "SMS and voice communication platform",
      longDescription:
        "Enable your agents to send SMS messages, make phone calls, and handle voice interactions through Twilio's communication APIs.",
      category: "communication",
      icon: "📱",
      color: "#F22F46",
      developer: { name: "Twilio", verified: true },
      pricing: { type: "paid", price: "Pay as you go" },
      stats: { installs: 4200, rating: 4.5, reviews: 67 },
      features: ["SMS messaging", "Voice calls", "WhatsApp integration", "Number verification"],
      tags: ["communication", "sms", "voice"],
      isInstalled: false,
    },
    {
      id: "shopify",
      name: "Shopify",
      description: "E-commerce platform integration",
      longDescription:
        "Connect to Shopify stores to manage products, orders, customers, and inventory. Perfect for e-commerce automation.",
      category: "ecommerce",
      icon: "🛒",
      color: "#96BF48",
      developer: { name: "Shopify", verified: true },
      pricing: { type: "free" },
      stats: { installs: 7800, rating: 4.8, reviews: 201 },
      features: ["Product management", "Order processing", "Inventory sync", "Customer data"],
      tags: ["ecommerce", "retail", "sales"],
      isInstalled: false,
      isFeatured: true,
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Automated scheduling and calendar management",
      longDescription:
        "Let your agents schedule meetings automatically with Calendly integration. No more back-and-forth.",
      category: "productivity",
      icon: "📅",
      color: "#006BFF",
      developer: { name: "Calendly", verified: true },
      pricing: { type: "freemium", price: "$8/mo" },
      stats: { installs: 3200, rating: 4.7, reviews: 45 },
      features: ["Meeting scheduling", "Calendar sync", "Timezone detection", "Reminder emails"],
      tags: ["productivity", "scheduling", "calendar"],
      isInstalled: false,
      isNew: true,
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Email delivery and marketing platform",
      longDescription:
        "Send transactional and marketing emails through your agents with SendGrid's reliable email infrastructure.",
      category: "communication",
      icon: "📧",
      color: "#1A82E2",
      developer: { name: "Twilio SendGrid", verified: true },
      pricing: { type: "freemium", price: "$15/mo" },
      stats: { installs: 5600, rating: 4.6, reviews: 98 },
      features: ["Email delivery", "Template management", "Analytics", "A/B testing"],
      tags: ["email", "marketing", "communication"],
      isInstalled: false,
    },
  ]

  getAllIntegrations(): MarketplaceIntegration[] {
    return this.integrations
  }

  getIntegrationById(id: string): MarketplaceIntegration | undefined {
    return this.integrations.find((i) => i.id === id)
  }

  getFeaturedIntegrations(): MarketplaceIntegration[] {
    return this.integrations.filter((i) => i.isFeatured)
  }

  getIntegrationsByCategory(category: string): MarketplaceIntegration[] {
    return this.integrations.filter((i) => i.category === category)
  }

  searchIntegrations(query: string): MarketplaceIntegration[] {
    const lowerQuery = query.toLowerCase()
    return this.integrations.filter(
      (i) =>
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery) ||
        i.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  installIntegration(id: string): boolean {
    const integration = this.integrations.find((i) => i.id === id)
    if (!integration) return false

    integration.isInstalled = true
    integration.stats.installs += 1
    return true
  }

  uninstallIntegration(id: string): boolean {
    const integration = this.integrations.find((i) => i.id === id)
    if (!integration) return false

    integration.isInstalled = false
    return true
  }
}

export const marketplaceStore = new MarketplaceStore()
