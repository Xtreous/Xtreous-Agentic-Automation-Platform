import { api, APIError, Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { Workflow, WebhookTriggerConfig } from "./types";

export interface WebhookTriggerParams {
  workflow_id: number;
  secret: Query<string>;
}

export interface WebhookTriggerBody {
  payload: any;
}

// Receives a webhook and triggers a workflow.
export const webhookTrigger = api<WebhookTriggerParams & WebhookTriggerBody, { success: boolean }>(
  {
    expose: true,
    method: "POST",
    path: "/workflows/:workflow_id/trigger/webhook",
  },
  async (params) => {
    const workflow = await coreDB.queryRow<Workflow>`
      SELECT * FROM workflows WHERE id = ${params.workflow_id} AND status = 'active'
    `;

    if (!workflow) {
      throw APIError.notFound("Active workflow not found or trigger not enabled");
    }

    if (workflow.trigger_type !== 'webhook') {
      throw APIError.invalidArgument("Workflow is not configured for webhook triggers");
    }

    const config = workflow.trigger_config as WebhookTriggerConfig;
    if (!config || config.secret !== params.secret) {
      throw APIError.unauthenticated("Invalid secret");
    }

    const execution = await coreDB.queryRow`
      INSERT INTO workflow_executions (workflow_id, agent_id, input_data, status)
      VALUES (${params.workflow_id}, NULL, ${JSON.stringify(params.payload || {})}, 'running')
      RETURNING *
    `;
    
    // In a real implementation, this would trigger the actual workflow execution
    // For now, we'll simulate completion
    setTimeout(async () => {
      await coreDB.exec`
        UPDATE workflow_executions 
        SET status = 'completed', completed_at = NOW(), output_data = '{"result": "success"}'
        WHERE id = ${execution!.id}
      `;
    }, 1000);

    return { success: true };
  }
);
