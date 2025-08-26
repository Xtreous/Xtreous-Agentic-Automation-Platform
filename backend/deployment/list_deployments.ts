import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentDeployment, DeploymentStatus, DeploymentEnvironment } from "./types";

export interface ListDeploymentsRequest {
  agent_id?: Query<number>;
  environment?: Query<DeploymentEnvironment>;
  status?: Query<DeploymentStatus>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListDeploymentsResponse {
  deployments: AgentDeployment[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Lists agent deployments with optional filtering.
export const listDeployments = api<ListDeploymentsRequest, ListDeploymentsResponse>(
  { expose: true, method: "GET", path: "/deployments" },
  async (req) => {
    const limit = Math.min(req.limit || 50, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    // Build WHERE conditions
    let whereConditions: string[] = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.agent_id) {
      whereConditions.push(`ad.agent_id = $${paramIndex}`);
      params.push(req.agent_id);
      paramIndex++;
    }

    if (req.environment) {
      whereConditions.push(`ad.environment = $${paramIndex}`);
      params.push(req.environment);
      paramIndex++;
    }

    if (req.status) {
      whereConditions.push(`ad.status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM agent_deployments ad ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get deployments with agent details
    const deploymentsQuery = `
      SELECT 
        ad.id, ad.agent_id, ad.environment, ad.status, ad.configuration,
        ad.endpoint_url, ad.health_check_url, ad.resource_allocation,
        ad.auto_scaling, ad.created_at, ad.updated_at, ad.deployed_at,
        ad.last_health_check, a.name as agent_name, a.type as agent_type
      FROM agent_deployments ad
      INNER JOIN agents a ON ad.agent_id = a.id
      ${whereClause}
      ORDER BY ad.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const deployments = await coreDB.rawQueryAll<{
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
      agent_name: string;
      agent_type: string;
    }>(deploymentsQuery, ...params);

    // Get logs and metrics for each deployment
    const enrichedDeployments = await Promise.all(
      deployments.map(async (deployment) => {
        // Get recent logs
        const logs = await coreDB.queryAll`
          SELECT id, deployment_id, level, message, timestamp, metadata
          FROM deployment_logs 
          WHERE deployment_id = ${deployment.id}
          ORDER BY timestamp DESC
          LIMIT 10
        `;

        // Get latest metrics
        const metrics = await coreDB.queryRow`
          SELECT * FROM deployment_metrics 
          WHERE deployment_id = ${deployment.id}
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
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      deployments: enrichedDeployments,
      total,
      page,
      per_page: limit,
      total_pages: totalPages
    };
  }
);
