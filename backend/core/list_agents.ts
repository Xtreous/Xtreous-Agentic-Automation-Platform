import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { Agent } from "./types";

interface ListAgentsParams {
  industry?: string;
  status?: string;
  limit?: number;
}

interface ListAgentsResponse {
  agents: Agent[];
  total: number;
}

// Retrieves all AI agents with optional filtering by industry and status.
export const listAgents = api<ListAgentsParams, ListAgentsResponse>(
  { expose: true, method: "GET", path: "/agents" },
  async (params) => {
    let query = `SELECT * FROM agents WHERE 1=1`;
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

    const agents = await coreDB.rawQueryAll<Agent>(query, ...queryParams);
    
    const countQuery = `SELECT COUNT(*) as total FROM agents WHERE 1=1` +
      (params.industry ? ` AND industry = '${params.industry}'` : '') +
      (params.status ? ` AND status = '${params.status}'` : '');
    
    const countResult = await coreDB.rawQueryRow<{ total: number }>(countQuery);
    
    return {
      agents,
      total: countResult?.total || 0
    };
  }
);
