-- Organizations table (must be created first due to foreign key dependencies)
CREATE TABLE organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (references organizations)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  organization_id BIGINT REFERENCES organizations(id),
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Subscriptions table (references organizations)
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  features JSONB NOT NULL DEFAULT '[]',
  max_agents INTEGER NOT NULL DEFAULT 3,
  max_tasks INTEGER NOT NULL DEFAULT 100,
  max_users INTEGER NOT NULL DEFAULT 1,
  storage_gb INTEGER NOT NULL DEFAULT 1,
  billing_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  billing_currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent collections table (references users)
CREATE TABLE agent_collections (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection agents junction table (references agent_collections and agents)
CREATE TABLE collection_agents (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT NOT NULL REFERENCES agent_collections(id) ON DELETE CASCADE,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, agent_id)
);

-- User sessions table for tracking active sessions (references users)
CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_agent_collections_user ON agent_collections(user_id);
CREATE INDEX idx_agent_collections_public ON agent_collections(is_public);
CREATE INDEX idx_collection_agents_collection ON collection_agents(collection_id);
CREATE INDEX idx_collection_agents_agent ON collection_agents(agent_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Add user_id to agents table to track ownership
ALTER TABLE agents ADD COLUMN user_id BIGINT REFERENCES users(id);
ALTER TABLE agents ADD COLUMN organization_id BIGINT REFERENCES organizations(id);

-- Add user_id to tasks table to track ownership
ALTER TABLE tasks ADD COLUMN user_id BIGINT REFERENCES users(id);

-- Add user_id to workflows table to track ownership
ALTER TABLE workflows ADD COLUMN user_id BIGINT REFERENCES users(id);

-- Add user_id and organization_id to collaborations table
ALTER TABLE agent_collaborations ADD COLUMN user_id BIGINT REFERENCES users(id);
ALTER TABLE agent_collaborations ADD COLUMN organization_id BIGINT REFERENCES organizations(id);

-- Create indexes for new foreign keys
CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_organization ON agents(organization_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_workflows_user ON workflows(user_id);
CREATE INDEX idx_collaborations_user ON agent_collaborations(user_id);
CREATE INDEX idx_collaborations_organization ON agent_collaborations(organization_id);
