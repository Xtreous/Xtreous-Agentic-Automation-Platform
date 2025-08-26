import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { Workflow } from "./types";

export interface UpdateWorkflowRequest {
  id: number;
  name?: string;
  description?: string;
  steps?: any[];
  status?: string;
}

// Updates an existing workflow.
export const updateWorkflow = api<UpdateWorkflowRequest, Workflow>(
  { expose: true, method: "PUT", path: "/workflows/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const existingWorkflow = await coreDB.queryRow<Workflow>`
      SELECT * FROM workflows WHERE id = ${id}
    `;
    
    if (!existingWorkflow) {
      throw APIError.notFound("Workflow not found");
    }
    
    const workflow = await coreDB.queryRow<Workflow>`
      UPDATE workflows 
      SET 
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        steps = COALESCE(${updates.steps ? JSON.stringify(updates.steps) : null}, steps),
        status = COALESCE(${updates.status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    return workflow!;
  }
);
