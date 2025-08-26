-- Add indexes for better query performance

-- Agents table indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_industry ON agents(industry);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_accuracy_rate ON agents(accuracy_rate DESC);
CREATE INDEX IF NOT EXISTS idx_agents_tasks_completed ON agents(tasks_completed DESC);

-- Tasks table indexes (already exist but adding more specific ones)
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent_status ON tasks(assigned_agent_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at_desc ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);

-- Agent skills indexes
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_category ON agent_skills(agent_id, skill_category);
CREATE INDEX IF NOT EXISTS idx_agent_skills_proficiency ON agent_skills(proficiency_level DESC);
CREATE INDEX IF NOT EXISTS idx_agent_skills_updated_at ON agent_skills(updated_at DESC);

-- Training sessions indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_agent_status ON agent_training_sessions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_started_at ON agent_training_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_score ON agent_training_sessions(score DESC);

-- Training modules indexes
CREATE INDEX IF NOT EXISTS idx_training_modules_category_difficulty ON training_modules(skill_category, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_training_modules_target_skill ON training_modules(target_skill);
CREATE INDEX IF NOT EXISTS idx_training_modules_status ON training_modules(status);

-- Skill recommendations indexes
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_agent_status ON skill_recommendations(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_priority ON skill_recommendations(priority DESC);
CREATE INDEX IF NOT EXISTS idx_skill_recommendations_created_at ON skill_recommendations(created_at DESC);

-- Performance gaps indexes
CREATE INDEX IF NOT EXISTS idx_performance_gaps_agent_impact ON performance_gaps(agent_id, impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_performance_gaps_identified_at ON performance_gaps(identified_at DESC);

-- Workflow executions indexes
CREATE INDEX IF NOT EXISTS idx_workflow_executions_agent_status ON workflow_executions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at DESC);

-- Agent performance indexes
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_recorded ON agent_performance(agent_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metric ON agent_performance(metric_name, metric_value DESC);

-- Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON agent_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_collaborations_created_at ON agent_collaborations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_collab_timestamp ON collaboration_messages(collaboration_id, timestamp DESC);

-- Task handoffs indexes
CREATE INDEX IF NOT EXISTS idx_task_handoffs_to_agent_status ON task_handoffs(to_agent_id, status);
CREATE INDEX IF NOT EXISTS idx_task_handoffs_from_agent ON task_handoffs(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_task_handoffs_created_at ON task_handoffs(created_at DESC);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_industry_status ON workflows(industry, status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_integrations_type_status ON integrations(type, status);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agents_industry_status_accuracy ON agents(industry, status, accuracy_rate DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_status_priority ON tasks(assigned_agent_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_proficiency ON agent_skills(agent_id, proficiency_level DESC);
