import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { Workflow, WorkflowStep } from "./types";

interface CreateWorkflowRequest {
  name: string;
  description?: string;
  industry: string;
  steps: WorkflowStep[];
  created_by?: string;
}

// Creates a new workflow with defined automation steps.
export const createWorkflow = api<CreateWorkflowRequest, Workflow>(
  { expose: true, method: "POST", path: "/workflows" },
  async (req) => {
    const workflow = await coreDB.queryRow<Workflow>`
      INSERT INTO workflows (name, description, industry, steps, created_by)
      VALUES (${req.name}, ${req.description || null}, ${req.industry}, ${JSON.stringify(req.steps)}, ${req.created_by || null})
      RETURNING *
    `;
    
    return workflow!;
  }
);
