-- Tasks table
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_agent_id BIGINT REFERENCES agents(id),
  workflow_id TEXT,
  parent_task_id BIGINT REFERENCES tasks(id),
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER
);

-- Task history table
CREATE TABLE task_history (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id BIGINT REFERENCES agents(id),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent collaborations table
CREATE TABLE agent_collaborations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  participating_agents BIGINT[] NOT NULL,
  coordinator_agent_id BIGINT REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'active',
  shared_context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collaboration messages table
CREATE TABLE collaboration_messages (
  id BIGSERIAL PRIMARY KEY,
  collaboration_id BIGINT NOT NULL REFERENCES agent_collaborations(id) ON DELETE CASCADE,
  from_agent_id BIGINT NOT NULL REFERENCES agents(id),
  to_agent_id BIGINT REFERENCES agents(id),
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task handoffs table
CREATE TABLE task_handoffs (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  from_agent_id BIGINT NOT NULL REFERENCES agents(id),
  to_agent_id BIGINT NOT NULL REFERENCES agents(id),
  reason TEXT NOT NULL,
  context_transfer JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add capabilities column to agents table
ALTER TABLE agents ADD COLUMN capabilities TEXT[] DEFAULT '{}';
ALTER TABLE agents ADD COLUMN max_concurrent_tasks INTEGER DEFAULT 5;

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_agent ON tasks(assigned_agent_id);
CREATE INDEX idx_tasks_workflow ON tasks(workflow_id);
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_collaboration_messages_collaboration ON collaboration_messages(collaboration_id);
CREATE INDEX idx_task_handoffs_task ON task_handoffs(task_id);
CREATE INDEX idx_task_handoffs_status ON task_handoffs(status);
