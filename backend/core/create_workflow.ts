import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { Workflow, WorkflowStep, TriggerType } from "./types";

interface CreateWorkflowRequest {
  name: string;
  description?: string;
  industry: string;
  steps: WorkflowStep[];
  created_by?: string;
  trigger_type: TriggerType;
  trigger_config?: any;
}

// Creates a new workflow with defined automation steps.
export const createWorkflow = api<CreateWorkflowRequest, Workflow>(
  { expose: true, method: "POST", path: "/workflows" },
  async (req) => {
    const workflow = await coreDB.queryRow<Workflow>`
      INSERT INTO workflows (name, description, industry, steps, created_by, trigger_type, trigger_config)
      VALUES (
        ${req.name}, 
        ${req.description || null}, 
        ${req.industry}, 
        ${JSON.stringify(req.steps)}, 
        ${req.created_by || null},
        ${req.trigger_type},
        ${req.trigger_config ? JSON.stringify(req.trigger_config) : null}
      )
      RETURNING *
    `;
    
    return workflow!;
  }
);
