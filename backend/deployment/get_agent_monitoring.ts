import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentMonitoring, DeploymentStatus } from "./types";

export interface GetAgentMonitoringRequest {
  deployment_id: number;
}

// Retrieves comprehensive monitoring data for a deployed agent.
export const getAgentMonitoring = api<GetAgentMonitoringRequest, AgentMonitoring>(
  { expose: true, method: "GET", path: "/deployments/:deployment_id/monitoring" },
  async (req) => {
    // Get deployment details
    const deployment = await coreDB.queryRow<{
      id: number;
      agent_id: number;
      status: string;
    }>`
      SELECT id, agent_id, status FROM agent_deployments WHERE id = ${req.deployment_id}
    `;

    if (!deployment) {
      throw APIError.notFound("deployment not found");
    }

    // Get latest metrics
    const metrics = await coreDB.queryRow<{
      cpu_usage: number;
      memory_usage: number;
      request_count: number;
      response_time_avg: number;
      error_rate: number;
      uptime_percentage: number;
      recorded_at: Date;
    }>`
      SELECT * FROM deployment_metrics 
      WHERE deployment_id = ${req.deployment_id}
      ORDER BY recorded_at DESC
      LIMIT 1
    `;

    // Get performance data from tasks
    const taskMetrics = await coreDB.queryRow<{
      tasks_processed: number;
      success_rate: number;
      avg_response_time: number;
      error_count: number;
      last_activity: Date;
    }>`
      SELECT 
        COUNT(*) as tasks_processed,
        (COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0)) * 100 as success_rate,
        AVG(actual_duration) as avg_response_time,
        COUNT(*) FILTER (WHERE status = 'failed') as error_count,
        MAX(updated_at) as last_activity
      FROM tasks 
      WHERE assigned_agent_id = ${deployment.agent_id}
      AND created_at >= NOW() - INTERVAL '24 hours'
    `;

    // Get active alerts
    const alerts = await coreDB.queryAll`
      SELECT id, deployment_id, type, severity, message, triggered_at, resolved_at, metadata
      FROM deployment_alerts 
      WHERE deployment_id = ${req.deployment_id}
      AND resolved_at IS NULL
      ORDER BY triggered_at DESC
    `;

    // Calculate health score based on various factors
    const healthScore = calculateHealthScore({
      uptime: metrics?.uptime_percentage || 100,
      errorRate: metrics?.error_rate || 0,
      responseTime: metrics?.response_time_avg || 0,
      cpuUsage: metrics?.cpu_usage || 0,
      memoryUsage: metrics?.memory_usage || 0,
      alertCount: alerts.length
    });

    return {
      deployment_id: req.deployment_id,
      agent_id: deployment.agent_id,
      status: deployment.status as DeploymentStatus,
      health_score: healthScore,
      performance_metrics: {
        tasks_processed: taskMetrics?.tasks_processed || 0,
        success_rate: taskMetrics?.success_rate || 100,
        avg_response_time: taskMetrics?.avg_response_time || 0,
        error_count: taskMetrics?.error_count || 0,
        last_activity: taskMetrics?.last_activity || new Date()
      },
      resource_usage: {
        cpu_percentage: metrics?.cpu_usage || 0,
        memory_percentage: metrics?.memory_usage || 0,
        storage_percentage: 0 // Would be calculated from actual storage metrics
      },
      alerts: alerts.map(alert => ({
        ...alert,
        metadata: typeof alert.metadata === 'string' ? JSON.parse(alert.metadata) : alert.metadata
      }))
    };
  }
);

function calculateHealthScore(factors: {
  uptime: number;
  errorRate: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  alertCount: number;
}): number {
  let score = 100;

  // Uptime impact (0-30 points)
  score -= (100 - factors.uptime) * 0.3;

  // Error rate impact (0-25 points)
  score -= factors.errorRate * 0.25;

  // Response time impact (0-20 points)
  if (factors.responseTime > 5000) score -= 20;
  else if (factors.responseTime > 2000) score -= 10;
  else if (factors.responseTime > 1000) score -= 5;

  // Resource usage impact (0-15 points)
  if (factors.cpuUsage > 90 || factors.memoryUsage > 90) score -= 15;
  else if (factors.cpuUsage > 70 || factors.memoryUsage > 70) score -= 10;
  else if (factors.cpuUsage > 50 || factors.memoryUsage > 50) score -= 5;

  // Alert impact (0-10 points)
  score -= Math.min(factors.alertCount * 2, 10);

  return Math.max(0, Math.round(score));
}
