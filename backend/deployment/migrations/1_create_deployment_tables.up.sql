-- Agent deployments table
CREATE TABLE agent_deployments (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'deployed', 'failed', 'stopped')),
  configuration JSONB NOT NULL DEFAULT '{}',
  endpoint_url TEXT,
  health_check_url TEXT,
  resource_allocation JSONB NOT NULL DEFAULT '{}',
  auto_scaling JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  last_health_check TIMESTAMPTZ,
  UNIQUE(agent_id, environment)
);

-- Deployment logs table
CREATE TABLE deployment_logs (
  id BIGSERIAL PRIMARY KEY,
  deployment_id BIGINT NOT NULL REFERENCES agent_deployments(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'debug')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Deployment metrics table
CREATE TABLE deployment_metrics (
  id BIGSERIAL PRIMARY KEY,
  deployment_id BIGINT NOT NULL REFERENCES agent_deployments(id) ON DELETE CASCADE,
  cpu_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
  memory_usage DOUBLE PRECISION NOT NULL DEFAULT 0,
  request_count INTEGER NOT NULL DEFAULT 0,
  response_time_avg DOUBLE PRECISION NOT NULL DEFAULT 0,
  error_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  uptime_percentage DOUBLE PRECISION NOT NULL DEFAULT 100,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow configurations table
CREATE TABLE workflow_configurations (
  id BIGSERIAL PRIMARY KEY,
  deployment_id BIGINT NOT NULL REFERENCES agent_deployments(id) ON DELETE CASCADE,
  workflow_id BIGINT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  configuration JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  retry_policy JSONB NOT NULL DEFAULT '{}',
  timeout_ms INTEGER NOT NULL DEFAULT 30000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deployment_id, workflow_id)
);

-- Deployment alerts table
CREATE TABLE deployment_alerts (
  id BIGSERIAL PRIMARY KEY,
  deployment_id BIGINT NOT NULL REFERENCES agent_deployments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('performance', 'error', 'resource', 'health')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX idx_agent_deployments_agent_id ON agent_deployments(agent_id);
CREATE INDEX idx_agent_deployments_environment ON agent_deployments(environment);
CREATE INDEX idx_agent_deployments_status ON agent_deployments(status);
CREATE INDEX idx_agent_deployments_created_at ON agent_deployments(created_at DESC);

CREATE INDEX idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX idx_deployment_logs_timestamp ON deployment_logs(timestamp DESC);
CREATE INDEX idx_deployment_logs_level ON deployment_logs(level);

CREATE INDEX idx_deployment_metrics_deployment_id ON deployment_metrics(deployment_id);
CREATE INDEX idx_deployment_metrics_recorded_at ON deployment_metrics(recorded_at DESC);

CREATE INDEX idx_workflow_configurations_deployment_id ON workflow_configurations(deployment_id);
CREATE INDEX idx_workflow_configurations_workflow_id ON workflow_configurations(workflow_id);
CREATE INDEX idx_workflow_configurations_enabled ON workflow_configurations(enabled);

CREATE INDEX idx_deployment_alerts_deployment_id ON deployment_alerts(deployment_id);
CREATE INDEX idx_deployment_alerts_resolved_at ON deployment_alerts(resolved_at);
CREATE INDEX idx_deployment_alerts_severity ON deployment_alerts(severity);
CREATE INDEX idx_deployment_alerts_triggered_at ON deployment_alerts(triggered_at DESC);
