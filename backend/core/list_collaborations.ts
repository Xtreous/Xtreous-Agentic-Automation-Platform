import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentCollaboration } from "./types";

export interface ListCollaborationsRequest {
  status?: Query<string>;
  agent_id?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListCollaborationsResponse {
  collaborations: AgentCollaboration[];
  total: number;
}

// Retrieves a list of agent collaborations with optional filtering.
export const listCollaborations = api<ListCollaborationsRequest, ListCollaborationsResponse>(
  { expose: true, method: "GET", path: "/collaborations" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    if (req.agent_id) {
      whereConditions.push(`$${paramIndex} = ANY(participating_agents)`);
      params.push(req.agent_id);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM agent_collaborations ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get collaborations
    const collaborationsQuery = `
      SELECT * FROM agent_collaborations 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const collaborations = await coreDB.rawQueryAll<AgentCollaboration>(collaborationsQuery, ...params);

    // Parse shared_context JSON and get communication logs for each collaboration
    const parsedCollaborations = await Promise.all(
      collaborations.map(async (collaboration) => {
        const messages = await coreDB.queryAll`
          SELECT * FROM collaboration_messages 
          WHERE collaboration_id = ${collaboration.id}
          ORDER BY timestamp ASC
        `;

        return {
          ...collaboration,
          shared_context: typeof collaboration.shared_context === 'string' 
            ? JSON.parse(collaboration.shared_context) 
            : collaboration.shared_context,
          communication_log: messages.map(msg => ({
            ...msg,
            metadata: typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata
          }))
        };
      })
    );

    return {
      collaborations: parsedCollaborations,
      total
    };
  }
);
