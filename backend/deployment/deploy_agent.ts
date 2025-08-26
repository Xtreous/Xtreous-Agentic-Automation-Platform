import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentDeployment, DeploymentEnvironment } from "./types";

export interface DeployAgentRequest {
  agent_id: number;
  environment: DeploymentEnvironment;
  configuration?: Record<string, any>;
  resource_allocation?: {
    cpu: number;
    memory: number;
    storage: number;
  };
  auto_scaling?: {
    enabled: boolean;
    min_instances: number;
    max_instances: number;
    target_cpu_utilization: number;
  };
}

// Deploys an agent to a specified environment.
export const deployAgent = api<DeployAgentRequest, AgentDeployment>(
  { expose: true, method: "POST", path: "/deployments" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id, name, type, status FROM agents WHERE id = ${req.agent_id}
    `;

    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    if (agent.status !== 'active') {
      throw APIError.invalidArgument("can only deploy active agents");
    }

    // Check if agent is already deployed in this environment
    const existingDeployment = await coreDB.queryRow`
      SELECT id FROM agent_deployments 
      WHERE agent_id = ${req.agent_id} 
      AND environment = ${req.environment}
      AND status IN ('deployed', 'deploying')
    `;

    if (existingDeployment) {
      throw APIError.alreadyExists("agent is already deployed in this environment");
    }

    // Set default resource allocation
    const defaultResources = {
      cpu: 1,
      memory: 2048,
      storage: 10240
    };

    const defaultAutoScaling = {
      enabled: false,
      min_instances: 1,
      max_instances: 3,
      target_cpu_utilization: 70
    };

    const resourceAllocation = { ...defaultResources, ...req.resource_allocation };
    const autoScaling = { ...defaultAutoScaling, ...req.auto_scaling };

    // Create deployment record
    const deployment = await coreDB.queryRow<{
      id: number;
      agent_id: number;
      environment: string;
      status: string;
      configuration: string;
      resource_allocation: string;
      auto_scaling: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO agent_deployments (
        agent_id, environment, status, configuration, 
        resource_allocation, auto_scaling
      )
      VALUES (
        ${req.agent_id}, ${req.environment}, 'pending',
        ${JSON.stringify(req.configuration || {})},
        ${JSON.stringify(resourceAllocation)},
        ${JSON.stringify(autoScaling)}
      )
      RETURNING id, agent_id, environment, status, configuration, 
                resource_allocation, auto_scaling, created_at, updated_at
    `;

    if (!deployment) {
      throw APIError.internal("failed to create deployment");
    }

    // Add initial deployment log
    await coreDB.exec`
      INSERT INTO deployment_logs (deployment_id, level, message, metadata)
      VALUES (
        ${deployment.id}, 'info', 'Deployment initiated',
        ${JSON.stringify({ agent_id: req.agent_id, environment: req.environment })}
      )
    `;

    // Simulate deployment process (in real implementation, this would trigger actual deployment)
    setTimeout(async () => {
      try {
        // Update status to deploying
        await coreDB.exec`
          UPDATE agent_deployments SET 
            status = 'deploying',
            updated_at = NOW()
          WHERE id = ${deployment.id}
        `;

        await coreDB.exec`
          INSERT INTO deployment_logs (deployment_id, level, message)
          VALUES (${deployment.id}, 'info', 'Starting deployment process')
        `;

        // Simulate deployment steps
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate endpoint URLs
        const endpointUrl = `https://agent-${deployment.id}.${req.environment}.xtreous.ai`;
        const healthCheckUrl = `${endpointUrl}/health`;

        // Update to deployed status
        await coreDB.exec`
          UPDATE agent_deployments SET 
            status = 'deployed',
            endpoint_url = ${endpointUrl},
            health_check_url = ${healthCheckUrl},
            deployed_at = NOW(),
            last_health_check = NOW(),
            updated_at = NOW()
          WHERE id = ${deployment.id}
        `;

        await coreDB.exec`
          INSERT INTO deployment_logs (deployment_id, level, message, metadata)
          VALUES (
            ${deployment.id}, 'info', 'Deployment completed successfully',
            ${JSON.stringify({ endpoint_url: endpointUrl })}
          )
        `;

        // Initialize metrics
        await coreDB.exec`
          INSERT INTO deployment_metrics (
            deployment_id, cpu_usage, memory_usage, request_count,
            response_time_avg, error_rate, uptime_percentage
          )
          VALUES (${deployment.id}, 0, 0, 0, 0, 0, 100)
        `;

      } catch (error) {
        // Handle deployment failure
        await coreDB.exec`
          UPDATE agent_deployments SET 
            status = 'failed',
            updated_at = NOW()
          WHERE id = ${deployment.id}
        `;

        await coreDB.exec`
          INSERT INTO deployment_logs (deployment_id, level, message, metadata)
          VALUES (
            ${deployment.id}, 'error', 'Deployment failed',
            ${JSON.stringify({ error: error.message })}
          )
        `;
      }
    }, 1000);

    return {
      id: deployment.id,
      agent_id: deployment.agent_id,
      environment: deployment.environment as DeploymentEnvironment,
      status: deployment.status as any,
      configuration: JSON.parse(deployment.configuration),
      resource_allocation: JSON.parse(deployment.resource_allocation),
      auto_scaling: JSON.parse(deployment.auto_scaling),
      deployment_logs: [],
      metrics: {} as any,
      created_at: deployment.created_at,
      updated_at: deployment.updated_at
    };
  }
);
