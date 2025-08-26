export type DeploymentStatus = "pending" | "deploying" | "deployed" | "failed" | "stopped";
export type DeploymentEnvironment = "development" | "staging" | "production";

export interface AgentDeployment {
  id: number;
  agent_id: number;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  configuration: Record<string, any>;
  endpoint_url?: string;
  health_check_url?: string;
  resource_allocation: {
    cpu: number;
    memory: number;
    storage: number;
  };
  auto_scaling: {
    enabled: boolean;
    min_instances: number;
    max_instances: number;
    target_cpu_utilization: number;
  };
  deployment_logs: DeploymentLog[];
  metrics: DeploymentMetrics;
  created_at: Date;
  updated_at: Date;
  deployed_at?: Date;
  last_health_check?: Date;
}

export interface DeploymentLog {
  id: number;
  deployment_id: number;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DeploymentMetrics {
  id: number;
  deployment_id: number;
  cpu_usage: number;
  memory_usage: number;
  request_count: number;
  response_time_avg: number;
  error_rate: number;
  uptime_percentage: number;
  recorded_at: Date;
}

export interface WorkflowConfiguration {
  id: number;
  deployment_id: number;
  workflow_id: number;
  configuration: Record<string, any>;
  enabled: boolean;
  trigger_conditions: Record<string, any>;
  retry_policy: {
    max_retries: number;
    backoff_strategy: "linear" | "exponential";
    retry_delay_ms: number;
  };
  timeout_ms: number;
  created_at: Date;
  updated_at: Date;
}

export interface AgentMonitoring {
  deployment_id: number;
  agent_id: number;
  status: DeploymentStatus;
  health_score: number;
  performance_metrics: {
    tasks_processed: number;
    success_rate: number;
    avg_response_time: number;
    error_count: number;
    last_activity: Date;
  };
  resource_usage: {
    cpu_percentage: number;
    memory_percentage: number;
    storage_percentage: number;
  };
  alerts: Alert[];
}

export interface Alert {
  id: number;
  deployment_id: number;
  type: "performance" | "error" | "resource" | "health";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggered_at: Date;
  resolved_at?: Date;
  metadata?: Record<string, any>;
}
