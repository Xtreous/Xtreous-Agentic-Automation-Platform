import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { WorkflowConfiguration } from "./types";

export interface ConfigureWorkflowRequest {
  deployment_id: number;
  workflow_id: number;
  configuration: Record<string, any>;
  enabled?: boolean;
  trigger_conditions?: Record<string, any>;
  retry_policy?: {
    max_retries: number;
    backoff_strategy: "linear" | "exponential";
    retry_delay_ms: number;
  };
  timeout_ms?: number;
}

// Configures a workflow for a deployed agent.
export const configureWorkflow = api<ConfigureWorkflowRequest, WorkflowConfiguration>(
  { expose: true, method: "POST", path: "/deployments/:deployment_id/workflows" },
  async (req) => {
    // Validate deployment exists and is deployed
    const deployment = await coreDB.queryRow`
      SELECT id, status FROM agent_deployments WHERE id = ${req.deployment_id}
    `;

    if (!deployment) {
      throw APIError.notFound("deployment not found");
    }

    if (deployment.status !== 'deployed') {
      throw APIError.invalidArgument("can only configure workflows for deployed agents");
    }

    // Validate workflow exists
    const workflow = await coreDB.queryRow`
      SELECT id, name FROM workflows WHERE id = ${req.workflow_id}
    `;

    if (!workflow) {
      throw APIError.notFound("workflow not found");
    }

    // Check if workflow is already configured for this deployment
    const existingConfig = await coreDB.queryRow`
      SELECT id FROM workflow_configurations 
      WHERE deployment_id = ${req.deployment_id} AND workflow_id = ${req.workflow_id}
    `;

    if (existingConfig) {
      throw APIError.alreadyExists("workflow is already configured for this deployment");
    }

    // Set default retry policy
    const defaultRetryPolicy = {
      max_retries: 3,
      backoff_strategy: "exponential" as const,
      retry_delay_ms: 1000
    };

    const retryPolicy = { ...defaultRetryPolicy, ...req.retry_policy };

    const workflowConfig = await coreDB.queryRow<{
      id: number;
      deployment_id: number;
      workflow_id: number;
      configuration: string;
      enabled: boolean;
      trigger_conditions: string;
      retry_policy: string;
      timeout_ms: number;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO workflow_configurations (
        deployment_id, workflow_id, configuration, enabled,
        trigger_conditions, retry_policy, timeout_ms
      )
      VALUES (
        ${req.deployment_id}, ${req.workflow_id}, ${JSON.stringify(req.configuration)},
        ${req.enabled !== false}, ${JSON.stringify(req.trigger_conditions || {})},
        ${JSON.stringify(retryPolicy)}, ${req.timeout_ms || 30000}
      )
      RETURNING id, deployment_id, workflow_id, configuration, enabled,
                trigger_conditions, retry_policy, timeout_ms, created_at, updated_at
    `;

    if (!workflowConfig) {
      throw APIError.internal("failed to create workflow configuration");
    }

    // Add deployment log
    await coreDB.exec`
      INSERT INTO deployment_logs (deployment_id, level, message, metadata)
      VALUES (
        ${req.deployment_id}, 'info', 'Workflow configured',
        ${JSON.stringify({ workflow_id: req.workflow_id, workflow_name: workflow.name })}
      )
    `;

    return {
      id: workflowConfig.id,
      deployment_id: workflowConfig.deployment_id,
      workflow_id: workflowConfig.workflow_id,
      configuration: JSON.parse(workflowConfig.configuration),
      enabled: workflowConfig.enabled,
      trigger_conditions: JSON.parse(workflowConfig.trigger_conditions),
      retry_policy: JSON.parse(workflowConfig.retry_policy),
      timeout_ms: workflowConfig.timeout_ms,
      created_at: workflowConfig.created_at,
      updated_at: workflowConfig.updated_at
    };
  }
);
