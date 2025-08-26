-- Marketplace agents table
CREATE TABLE marketplace_agents (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  industry TEXT[] NOT NULL DEFAULT '{}',
  workflow_types TEXT[] NOT NULL DEFAULT '{}',
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('free', 'subscription', 'usage_based', 'one_time')),
  pricing_details JSONB NOT NULL DEFAULT '{}',
  rating DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  publisher_info JSONB NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  demo_url TEXT,
  documentation_url TEXT,
  support_url TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
  compatibility TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}'
);

-- Agent reviews table
CREATE TABLE agent_reviews (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

-- Review helpfulness votes table
CREATE TABLE review_votes (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES agent_reviews(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Agent installations/downloads table
CREATE TABLE agent_installations (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uninstalled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE(agent_id, user_id)
);

-- Marketplace categories table
CREATE TABLE marketplace_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id TEXT REFERENCES marketplace_categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent collections/wishlists table
CREATE TABLE agent_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection items table
CREATE TABLE collection_items (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT NOT NULL REFERENCES agent_collections(id) ON DELETE CASCADE,
  agent_id BIGINT NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_agents_category ON marketplace_agents(category);
CREATE INDEX idx_marketplace_agents_industry ON marketplace_agents USING GIN(industry);
CREATE INDEX idx_marketplace_agents_workflow_types ON marketplace_agents USING GIN(workflow_types);
CREATE INDEX idx_marketplace_agents_pricing_model ON marketplace_agents(pricing_model);
CREATE INDEX idx_marketplace_agents_rating ON marketplace_agents(rating DESC);
CREATE INDEX idx_marketplace_agents_downloads ON marketplace_agents(downloads DESC);
CREATE INDEX idx_marketplace_agents_created_at ON marketplace_agents(created_at DESC);
CREATE INDEX idx_marketplace_agents_featured ON marketplace_agents(is_featured, rating DESC);
CREATE INDEX idx_marketplace_agents_status ON marketplace_agents(status);
CREATE INDEX idx_marketplace_agents_tags ON marketplace_agents USING GIN(tags);
CREATE INDEX idx_marketplace_agents_features ON marketplace_agents USING GIN(features);

CREATE INDEX idx_agent_reviews_agent_id ON agent_reviews(agent_id);
CREATE INDEX idx_agent_reviews_rating ON agent_reviews(rating);
CREATE INDEX idx_agent_reviews_created_at ON agent_reviews(created_at DESC);
CREATE INDEX idx_agent_reviews_helpful_count ON agent_reviews(helpful_count DESC);

CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);

CREATE INDEX idx_agent_installations_agent_id ON agent_installations(agent_id);
CREATE INDEX idx_agent_installations_user_id ON agent_installations(user_id);
CREATE INDEX idx_agent_installations_status ON agent_installations(status);

CREATE INDEX idx_marketplace_categories_parent_id ON marketplace_categories(parent_id);
CREATE INDEX idx_marketplace_categories_sort_order ON marketplace_categories(sort_order);

CREATE INDEX idx_agent_collections_user_id ON agent_collections(user_id);
CREATE INDEX idx_agent_collections_public ON agent_collections(is_public);

CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_agent_id ON collection_items(agent_id);

-- Insert sample marketplace categories
INSERT INTO marketplace_categories (id, name, description, icon, sort_order) VALUES
('automation', 'Automation', 'Process automation and workflow agents', 'zap', 1),
('analytics', 'Analytics', 'Data analysis and reporting agents', 'bar-chart', 2),
('communication', 'Communication', 'Customer service and communication agents', 'message-circle', 3),
('content', 'Content', 'Content creation and management agents', 'file-text', 4),
('finance', 'Finance', 'Financial analysis and accounting agents', 'dollar-sign', 5),
('sales', 'Sales', 'Sales and marketing automation agents', 'trending-up', 6),
('support', 'Support', 'Customer support and helpdesk agents', 'headphones', 7),
('productivity', 'Productivity', 'Productivity and task management agents', 'check-circle', 8);

-- Insert sample marketplace agents
INSERT INTO marketplace_agents (
  name, description, category, industry, workflow_types, pricing_model, pricing_details,
  rating, review_count, downloads, publisher_info, features, tags, screenshots,
  demo_url, documentation_url, support_url, version, is_featured
) VALUES
(
  'Construction Takeoff Pro',
  'Advanced AI agent for automated construction takeoffs and material quantification from blueprints and drawings.',
  'automation',
  '["construction", "engineering"]',
  '["document_analysis", "data_extraction", "cost_estimation"]',
  'subscription',
  '{"monthly_price": 99, "free_tier": true, "currency": "USD"}',
  4.8,
  127,
  2543,
  '{"id": 1, "name": "BuildTech Solutions", "verified": true, "avatar_url": "https://example.com/avatar1.jpg"}',
  '["Blueprint Analysis", "Material Quantification", "Cost Estimation", "3D Visualization", "Export to Excel"]',
  '["construction", "takeoff", "blueprints", "estimation", "materials"]',
  '["https://example.com/screenshot1.jpg", "https://example.com/screenshot2.jpg"]',
  'https://demo.buildtech.com/takeoff',
  'https://docs.buildtech.com/takeoff',
  'https://support.buildtech.com',
  '2.1.0',
  true
),
(
  'Customer Service AI',
  'Intelligent customer service agent that handles inquiries across email, chat, and social media platforms.',
  'communication',
  '["retail", "ecommerce", "saas"]',
  '["customer_support", "ticket_routing", "sentiment_analysis"]',
  'usage_based',
  '{"usage_price": 0.05, "free_tier": true, "currency": "USD"}',
  4.6,
  89,
  1876,
  '{"id": 2, "name": "ServiceBot Inc", "verified": true, "avatar_url": "https://example.com/avatar2.jpg"}',
  '["Multi-channel Support", "Sentiment Analysis", "Auto-routing", "Knowledge Base", "Analytics Dashboard"]',
  '["customer-service", "support", "chat", "email", "automation"]',
  '["https://example.com/screenshot3.jpg", "https://example.com/screenshot4.jpg"]',
  'https://demo.servicebot.com',
  'https://docs.servicebot.com',
  'https://help.servicebot.com',
  '1.5.2',
  true
),
(
  'Financial Data Analyzer',
  'Comprehensive financial analysis agent for automated reporting, compliance checking, and risk assessment.',
  'finance',
  '["finance", "banking", "insurance"]',
  '["data_analysis", "compliance_monitoring", "risk_assessment"]',
  'subscription',
  '{"monthly_price": 199, "currency": "USD"}',
  4.7,
  156,
  3421,
  '{"id": 3, "name": "FinanceAI Corp", "verified": true, "avatar_url": "https://example.com/avatar3.jpg"}',
  '["Financial Reporting", "Compliance Monitoring", "Risk Analysis", "Fraud Detection", "Regulatory Updates"]',
  '["finance", "analysis", "compliance", "risk", "reporting"]',
  '["https://example.com/screenshot5.jpg", "https://example.com/screenshot6.jpg"]',
  'https://demo.financeai.com',
  'https://docs.financeai.com',
  'https://support.financeai.com',
  '3.0.1',
  false
),
(
  'Sales Lead Qualifier',
  'AI-powered sales agent that qualifies leads, schedules meetings, and manages follow-up communications.',
  'sales',
  '["sales", "marketing", "real-estate"]',
  '["lead_qualification", "appointment_scheduling", "follow_up"]',
  'subscription',
  '{"monthly_price": 79, "free_tier": true, "currency": "USD"}',
  4.4,
  203,
  4567,
  '{"id": 4, "name": "SalesForce AI", "verified": false, "avatar_url": "https://example.com/avatar4.jpg"}',
  '["Lead Scoring", "Email Automation", "Calendar Integration", "CRM Sync", "Performance Analytics"]',
  '["sales", "leads", "qualification", "automation", "crm"]',
  '["https://example.com/screenshot7.jpg", "https://example.com/screenshot8.jpg"]',
  'https://demo.salesforceai.com',
  'https://docs.salesforceai.com',
  'https://help.salesforceai.com',
  '1.8.0',
  false
),
(
  'Content Creator Assistant',
  'Creative AI agent for generating blog posts, social media content, and marketing materials.',
  'content',
  '["marketing", "media", "publishing"]',
  '["content_generation", "social_media", "copywriting"]',
  'usage_based',
  '{"usage_price": 0.02, "free_tier": true, "currency": "USD"}',
  4.3,
  78,
  1234,
  '{"id": 5, "name": "ContentGen Studios", "verified": true, "avatar_url": "https://example.com/avatar5.jpg"}',
  '["Blog Writing", "Social Media Posts", "SEO Optimization", "Image Generation", "Content Calendar"]',
  '["content", "writing", "social-media", "seo", "marketing"]',
  '["https://example.com/screenshot9.jpg", "https://example.com/screenshot10.jpg"]',
  'https://demo.contentgen.com',
  'https://docs.contentgen.com',
  'https://support.contentgen.com',
  '1.2.3',
  false
);

-- Insert sample reviews
INSERT INTO agent_reviews (
  agent_id, user_id, user_name, user_avatar, rating, title, content, helpful_count, verified_purchase
) VALUES
(1, 101, 'John Smith', 'https://example.com/user1.jpg', 5, 'Game changer for our construction business', 'This agent has revolutionized how we handle takeoffs. What used to take hours now takes minutes. The accuracy is incredible and it integrates perfectly with our existing workflow.', 23, true),
(1, 102, 'Sarah Johnson', 'https://example.com/user2.jpg', 4, 'Great tool with minor issues', 'Overall very satisfied with the performance. The blueprint analysis is spot-on most of the time. Had some issues with complex drawings but support was helpful.', 15, true),
(1, 103, 'Mike Davis', 'https://example.com/user3.jpg', 5, 'Worth every penny', 'ROI was immediate. We can now bid on 3x more projects with the same team. The material quantification feature is particularly impressive.', 31, true),
(2, 104, 'Lisa Chen', 'https://example.com/user4.jpg', 4, 'Solid customer service solution', 'Handles most of our routine inquiries well. The sentiment analysis helps prioritize urgent issues. Setup was straightforward.', 12, true),
(2, 105, 'Robert Wilson', 'https://example.com/user5.jpg', 5, 'Excellent automation capabilities', 'Our response times have improved dramatically. Customers are happier and our team can focus on complex issues. Highly recommended.', 28, true);
