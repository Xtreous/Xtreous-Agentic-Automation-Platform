export interface MarketplaceAgent {
  id: number;
  name: string;
  description: string;
  category: string;
  industry: string[];
  workflow_types: string[];
  pricing_model: 'free' | 'subscription' | 'usage_based' | 'one_time';
  pricing_details: {
    free_tier?: boolean;
    monthly_price?: number;
    usage_price?: number;
    one_time_price?: number;
    currency: string;
  };
  rating: number;
  review_count: number;
  downloads: number;
  publisher: {
    id: number;
    name: string;
    verified: boolean;
    avatar_url?: string;
  };
  features: string[];
  tags: string[];
  screenshots: string[];
  demo_url?: string;
  documentation_url?: string;
  support_url?: string;
  version: string;
  last_updated: Date;
  created_at: Date;
  is_featured: boolean;
  compatibility: string[];
  requirements: string[];
}

export interface AgentReview {
  id: number;
  agent_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  agent_count: number;
  subcategories?: MarketplaceCategory[];
}

export interface AgentComparison {
  agents: MarketplaceAgent[];
  comparison_matrix: {
    feature: string;
    values: (string | boolean | number)[];
  }[];
}
