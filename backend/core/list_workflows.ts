import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { Workflow } from "./types";

interface ListWorkflowsParams {
  industry?: string;
  status?: string;
  limit?: number;
}

interface ListWorkflowsResponse {
  workflows: Workflow[];
  total: number;
}

// Retrieves all workflows with optional filtering by industry and status.
export const listWorkflows = api<ListWorkflowsParams, ListWorkflowsResponse>(
  { expose: true, method: "GET", path: "/workflows" },
  async (params) => {
    let query = `SELECT * FROM workflows WHERE 1=1`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.industry) {
      query += ` AND industry = $${paramIndex}`;
      queryParams.push(params.industry);
      paramIndex++;
    }

    if (params.status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    if (params.limit) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(params.limit);
    }

    const workflows = await coreDB.rawQueryAll<Workflow>(query, ...queryParams);
    
    const countQuery = `SELECT COUNT(*) as total FROM workflows WHERE 1=1` +
      (params.industry ? ` AND industry = '${params.industry}'` : '') +
      (params.status ? ` AND status = '${params.status}'` : '');
    
    const countResult = await coreDB.rawQueryRow<{ total: number }>(countQuery);
    
    return {
      workflows,
      total: countResult?.total || 0
    };
  }
);
