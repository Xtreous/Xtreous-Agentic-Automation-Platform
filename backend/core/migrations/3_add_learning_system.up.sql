-- Agent skills table
CREATE TABLE agent_skills (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  proficiency_level INTEGER NOT NULL DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 10),
  experience_points INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMPTZ,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training modules table
CREATE TABLE training_modules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  skill_category TEXT NOT NULL,
  target_skill TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  prerequisites JSONB NOT NULL DEFAULT '[]',
  content JSONB NOT NULL DEFAULT '{}',
  estimated_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  success_criteria JSONB NOT NULL DEFAULT '{}',
  created_by TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent training sessions table
CREATE TABLE agent_training_sessions (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  training_module_id BIGINT NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER
);

-- Skill recommendations table
CREATE TABLE skill_recommendations (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  recommended_skill TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  based_on_task_id BIGINT REFERENCES tasks(id),
  based_on_performance_gap BOOLEAN NOT NULL DEFAULT FALSE,
  suggested_training_modules BIGINT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Performance gaps table
CREATE TABLE performance_gaps (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES tasks(id),
  gap_type TEXT NOT NULL,
  required_skill TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 0,
  required_level INTEGER NOT NULL DEFAULT 1,
  impact_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  identified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX idx_agent_skills_skill_name ON agent_skills(skill_name);
CREATE INDEX idx_agent_skills_category ON agent_skills(skill_category);
CREATE INDEX idx_training_sessions_agent_id ON agent_training_sessions(agent_id);
CREATE INDEX idx_training_sessions_module_id ON agent_training_sessions(training_module_id);
CREATE INDEX idx_training_sessions_status ON agent_training_sessions(status);
CREATE INDEX idx_skill_recommendations_agent_id ON skill_recommendations(agent_id);
CREATE INDEX idx_skill_recommendations_status ON skill_recommendations(status);
CREATE INDEX idx_performance_gaps_agent_id ON performance_gaps(agent_id);
CREATE INDEX idx_performance_gaps_task_id ON performance_gaps(task_id);

-- Add learning-related columns to agents table
ALTER TABLE agents ADD COLUMN learning_rate DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE agents ADD COLUMN total_training_hours INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN skill_points INTEGER DEFAULT 0;
