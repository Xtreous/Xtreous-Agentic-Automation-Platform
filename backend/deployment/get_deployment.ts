import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentDeployment, DeploymentStatus, DeploymentEnvironment } from "./types";

export interface GetDeploymentRequest {
  id: number;
}

// Retrieves a specific deployment with full details.
export const getDeployment = api<GetDeploymentRequest, AgentDeployment>(
  { expose: true, method: "GET", path: "/deployments/:id" },
  async (req) => {
    const deployment = await coreDB.queryRow<{
      id: number;
      agent_id: number;
      environment: string;
      status: string;
      configuration: string;
      endpoint_url?: string;
      health_check_url?: string;
      resource_allocation: string;
      auto_scaling: string;
      created_at: Date;
      updated_at: Date;
      deployed_at?: Date;
      last_health_check?: Date;
    }>`
      SELECT * FROM agent_deployments WHERE id = ${req.id}
    `;

    if (!deployment) {
      throw APIError.notFound("deployment not found");
    }

    // Get deployment logs
    const logs = await coreDB.queryAll`
      SELECT id, deployment_id, level, message, timestamp, metadata
      FROM deployment_logs 
      WHERE deployment_id = ${req.id}
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    // Get latest metrics
    const metrics = await coreDB.queryRow`
      SELECT * FROM deployment_metrics 
      WHERE deployment_id = ${req.id}
      ORDER BY recorded_at DESC
      LIMIT 1
    `;

    return {
      id: deployment.id,
      agent_id: deployment.agent_id,
      environment: deployment.environment as DeploymentEnvironment,
      status: deployment.status as DeploymentStatus,
      configuration: JSON.parse(deployment.configuration),
      endpoint_url: deployment.endpoint_url,
      health_check_url: deployment.health_check_url,
      resource_allocation: JSON.parse(deployment.resource_allocation),
      auto_scaling: JSON.parse(deployment.auto_scaling),
      deployment_logs: logs.map(log => ({
        ...log,
        metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata
      })),
      metrics: metrics || {
        cpu_usage: 0,
        memory_usage: 0,
        request_count: 0,
        response_time_avg: 0,
        error_rate: 0,
        uptime_percentage: 100,
        recorded_at: new Date()
      },
      created_at: deployment.created_at,
      updated_at: deployment.updated_at,
      deployed_at: deployment.deployed_at,
      last_health_check: deployment.last_health_check
    };
  }
);
