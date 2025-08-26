import { cron } from "encore.dev/cron";
import { coreDB } from "./db";
import type { Workflow, ScheduleTriggerConfig } from "./types";
import { parseExpression } from "cron-parser";

// This cron job runs every minute to check for scheduled workflows.
export const scheduledWorkflowTrigger = cron.every('1m', async () => {
  const now = new Date();
  
  const scheduledWorkflows = await coreDB.queryAll<Workflow>`
    SELECT * FROM workflows 
    WHERE trigger_type = 'schedule' AND status = 'active'
  `;

  for (const workflow of scheduledWorkflows) {
    const config = workflow.trigger_config as ScheduleTriggerConfig;
    if (!config || !config.cron) continue;

    try {
      const interval = parseExpression(config.cron, { currentDate: new Date(now.getTime() - 60000) });
      const nextRun = interval.next().toDate();
      
      // Check if the workflow should have run in the last minute
      if (nextRun > new Date(now.getTime() - 60000) && nextRun <= now) {
        // Trigger workflow execution
        const execution = await coreDB.queryRow`
          INSERT INTO workflow_executions (workflow_id, agent_id, input_data, status)
          VALUES (${workflow.id}, NULL, ${JSON.stringify({ triggered_at: now })}, 'running')
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
      }
    } catch (err) {
      console.error(`Invalid cron expression for workflow ${workflow.id}: ${config.cron}`, err);
    }
  }
});
