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

-- Clear existing data to avoid issues with re-running migrations in dev.
TRUNCATE marketplace_categories, marketplace_agents, agent_reviews, review_votes, agent_installations, agent_collections, collection_items RESTART IDENTITY CASCADE;

-- Insert new marketplace categories (Teams)
INSERT INTO marketplace_categories (id, name, description, icon, sort_order) VALUES
('general', 'General', 'General business operations agents', 'briefcase', 1),
('finance_accounting', 'Finance & Accounting', 'Agents for financial tasks', 'dollar-sign', 2),
('operations', 'Operations', 'Agents for operational efficiency', 'settings', 3),
('human_resources', 'Human Resources', 'Agents for HR and recruitment', 'users', 4),
('legal', 'Legal', 'Agents for legal and compliance tasks', 'gavel', 5),
('innovation_rd', 'Innovation and R&D', 'Agents for research and development', 'lightbulb', 6),
('customer_support', 'Customer Support', 'Agents for customer service', 'headphones', 7),
('marketing', 'Marketing', 'Agents for marketing tasks', 'megaphone', 8),
('sales', 'Sales', 'Agents for sales automation', 'trending-up', 9),
('management', 'Management', 'Agents for management and reporting', 'bar-chart-2', 10);

-- Insert new marketplace agents
INSERT INTO marketplace_agents (
  name, description, category, industry, workflow_types, pricing_model, pricing_details,
  rating, review_count, downloads, publisher_info, features, tags,
  version, is_featured
) VALUES
(
  'Resume Screening AI Agent',
  'Automated resume screening to find the best candidates faster.',
  'human_resources',
  '{"HR & Recruitment"}',
  '{"recruitment", "screening"}',
  'subscription',
  '{"monthly_price": 49, "free_tier": true, "currency": "USD"}',
  4.7, 150, 3200,
  '{"id": 1, "name": "HireWise", "verified": true}',
  '{"Smart Skill Scoring", "Bias-Free Screening", "AI Sourcing"}',
  '{"resume", "recruitment", "hr"}',
  '1.2.0', true
),
(
  'Payroll Audit AI Agent',
  'Ensure payroll accuracy and compliance with automated audits.',
  'human_resources',
  '{"HR & Recruitment"}',
  '{"payroll", "audit"}',
  'subscription',
  '{"monthly_price": 79, "currency": "USD"}',
  4.8, 95, 1800,
  '{"id": 2, "name": "PayRight", "verified": true}',
  '{"Error Flagging", "Compliance Checks"}',
  '{"payroll", "audit", "finance"}',
  '2.0.1', false
),
(
  'Interview Scheduling AI Agent',
  'Automate the entire interview scheduling process.',
  'human_resources',
  '{"HR & Recruitment"}',
  '{"scheduling", "interviews"}',
  'subscription',
  '{"monthly_price": 39, "currency": "USD"}',
  4.6, 120, 2500,
  '{"id": 1, "name": "HireWise", "verified": true}',
  '{"Availability Matching", "Smart Suggestions", "Booking Confirmation"}',
  '{"scheduling", "hr", "recruitment"}',
  '1.5.0', true
),
(
  'Accounts Receivable AI Agent',
  'Automate invoice auditing and accounts receivable management.',
  'finance_accounting',
  '{"Financial Services"}',
  '{"invoicing", "accounting"}',
  'subscription',
  '{"monthly_price": 99, "currency": "USD"}',
  4.9, 210, 4500,
  '{"id": 3, "name": "FinFlow", "verified": true}',
  '{"Invoice Auditing", "Payment Reminders", "Reconciliation"}',
  '{"finance", "accounting", "receivables"}',
  '3.1.0', true
),
(
  'Budget Management AI Agent',
  'Generate and manage budgets with AI-powered insights.',
  'finance_accounting',
  '{"Financial Services"}',
  '{"budgeting", "finance"}',
  'subscription',
  '{"monthly_price": 69, "currency": "USD"}',
  4.5, 80, 1500,
  '{"id": 3, "name": "FinFlow", "verified": true}',
  '{"Budget Generation", "Expense Tracking", "Forecasting"}',
  '{"budget", "finance", "management"}',
  '1.8.0', false
),
(
  'IT Help Desk AI Agent',
  'Automate IT support and ticket resolution.',
  'customer_support',
  '{"General Problem Solvers"}',
  '{"support", "it"}',
  'subscription',
  '{"monthly_price": 149, "currency": "USD"}',
  4.7, 300, 6000,
  '{"id": 4, "name": "SupportSphere", "verified": true}',
  '{"Ticket Triaging", "Automated Responses", "Knowledge Base Integration"}',
  '{"it", "support", "helpdesk"}',
  '2.5.0', true
),
(
  'Document Review AI Agent',
  'Review legal documents for risks and key information.',
  'legal',
  '{"Legal & Compliance"}',
  '{"legal", "document_review"}',
  'usage_based',
  '{"usage_price": 5, "currency": "USD"}',
  4.9, 150, 2800,
  '{"id": 5, "name": "LegalEase", "verified": true}',
  '{"Risk Assessment", "Key Information Extraction", "Clause Analysis"}',
  '{"legal", "document", "compliance"}',
  '4.0.0', true
),
(
  'Contract Management AI Agent',
  'Automate the contract lifecycle from drafting to renewal.',
  'legal',
  '{"Legal & Compliance"}',
  '{"contract", "legal"}',
  'subscription',
  '{"monthly_price": 199, "currency": "USD"}',
  4.8, 180, 3500,
  '{"id": 5, "name": "LegalEase", "verified": true}',
  '{"Contract Drafting", "Obligation Tracking", "Renewal Alerts"}',
  '{"contract", "legal", "management"}',
  '3.2.0', false
),
(
  'Data Collection AI Agent',
  'Automate data collection from various sources.',
  'general',
  '{"General Problem Solvers"}',
  '{"data_collection", "automation"}',
  'free',
  '{}',
  4.4, 500, 12000,
  '{"id": 6, "name": "DataWeaver", "verified": false}',
  '{"Web Scraping", "API Integration", "Data Cleaning"}',
  '{"data", "automation", "scraping"}',
  '1.0.0', false
),
(
  'Debt Collection AI Agent',
  'Automate and optimize the debt collection process.',
  'finance_accounting',
  '{"Financial Services"}',
  '{"debt_collection", "finance"}',
  'usage_based',
  '{"usage_price": 2, "currency": "USD"}',
  4.6, 90, 1700,
  '{"id": 7, "name": "CollectAI", "verified": true}',
  '{"Automated Reminders", "Payment Negotiation", "Compliance Monitoring"}',
  '{"debt", "finance", "collection"}',
  '2.1.0', false
),
(
  'Lab Results Extraction AI Agent',
  'Extract and structure data from lab reports.',
  'general',
  '{"Healthcare"}',
  '{"data_extraction", "healthcare"}',
  'subscription',
  '{"monthly_price": 249, "currency": "USD"}',
  4.9, 120, 2200,
  '{"id": 8, "name": "HealthData", "verified": true}',
  '{"Data Extraction from Lab reports", "Information Surge Identification", "EMR Integration"}',
  '{"healthcare", "lab", "data"}',
  '1.5.0', true
),
(
  'Content Aggregation AI Agent',
  'Aggregate and categorize content from news and data sources.',
  'marketing',
  '{"General Problem Solvers"}',
  '{"content", "aggregation"}',
  'subscription',
  '{"monthly_price": 59, "currency": "USD"}',
  4.5, 110, 2100,
  '{"id": 9, "name": "ContentGrid", "verified": false}',
  '{"Information Extraction from News/Data", "Content Categorization", "Trend Analysis"}',
  '{"content", "marketing", "aggregation"}',
  '1.9.0', false
),
(
  'Property Management AI Agent',
  'Automate property management tasks.',
  'operations',
  '{"Property & Real Estate"}',
  '{"property_management", "real_estate"}',
  'subscription',
  '{"monthly_price": 129, "currency": "USD"}',
  4.7, 140, 2600,
  '{"id": 10, "name": "PropTech", "verified": true}',
  '{"Property Damage Simulation", "Property Underwriting Report", "Tenant Communication"}',
  '{"property", "real estate", "management"}',
  '2.8.0', true
),
(
  'Invoice Processing AI Agent',
  'Automate the entire invoice processing workflow.',
  'finance_accounting',
  '{"Financial Services"}',
  '{"invoice", "accounting"}',
  'usage_based',
  '{"usage_price": 0.5, "currency": "USD"}',
  4.8, 250, 5500,
  '{"id": 3, "name": "FinFlow", "verified": true}',
  '{"Invoice Data Extraction", "PO Matching", "Approval Routing"}',
  '{"invoice", "finance", "automation"}',
  '3.5.0', false
),
(
  'Patient Intake Scheduler AI Agent',
  'Automate patient intake and appointment scheduling.',
  'operations',
  '{"Healthcare"}',
  '{"scheduling", "healthcare"}',
  'subscription',
  '{"monthly_price": 89, "currency": "USD"}',
  4.7, 160, 3000,
  '{"id": 8, "name": "HealthData", "verified": true}',
  '{"Patient Onboarding", "Insurance Verification", "Appointment Scheduling"}',
  '{"patient", "healthcare", "scheduling"}',
  '2.2.0', false
),
(
  'Sales Operations AI Agent',
  'Streamline sales operations and improve team efficiency.',
  'sales',
  '{"Sales"}',
  '{"sales", "operations"}',
  'subscription',
  '{"monthly_price": 149, "currency": "USD"}',
  4.8, 220, 4800,
  '{"id": 11, "name": "SalesBoost", "verified": true}',
  '{"Lead Data Enrichment", "Smart Scheduling", "Deal Follow-up"}',
  '{"sales", "crm", "automation"}',
  '3.0.0', true
);
