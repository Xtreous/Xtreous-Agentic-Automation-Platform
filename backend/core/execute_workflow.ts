import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { WorkflowExecution } from "./types";

interface ExecuteWorkflowRequest {
  workflow_id: number;
  agent_id: number;
  input_data?: any;
}

// Executes a workflow using a specified AI agent.
export const executeWorkflow = api<ExecuteWorkflowRequest, WorkflowExecution>(
  { expose: true, method: "POST", path: "/workflows/execute" },
  async (req) => {
    // Verify workflow exists
    const workflow = await coreDB.queryRow`
      SELECT * FROM workflows WHERE id = ${req.workflow_id} AND status = 'active'
    `;
    
    if (!workflow) {
      throw APIError.notFound("Active workflow not found");
    }
    
    // Verify agent exists
    const agent = await coreDB.queryRow`
      SELECT * FROM agents WHERE id = ${req.agent_id} AND status = 'active'
    `;
    
    if (!agent) {
      throw APIError.notFound("Active agent not found");
    }
    
    const execution = await coreDB.queryRow<WorkflowExecution>`
      INSERT INTO workflow_executions (workflow_id, agent_id, input_data, status)
      VALUES (${req.workflow_id}, ${req.agent_id}, ${JSON.stringify(req.input_data || {})}, 'running')
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
      
      // Update agent performance
      await coreDB.exec`
        UPDATE agents 
        SET tasks_completed = tasks_completed + 1, accuracy_rate = LEAST(accuracy_rate + 0.01, 0.98)
        WHERE id = ${req.agent_id}
      `;
    }, 1000);
    
    return execution!;
  }
);
