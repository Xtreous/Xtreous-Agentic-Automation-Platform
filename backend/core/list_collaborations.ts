import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentCollaboration, CollaborationMessage } from "./types";
import { getAuthData } from "~encore/auth";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";

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
  { expose: true, method: "GET", path: "/collaborations", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const cacheKey = CACHE_KEYS.COLLABORATIONS_LIST(JSON.stringify({ ...req, authId: auth.userID }));
    const cached = await getCached<ListCollaborationsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (auth.organizationId) {
      whereConditions.push(`ac.organization_id = $${paramIndex}`);
      params.push(parseInt(auth.organizationId));
      paramIndex++;
    } else {
      whereConditions.push(`ac.user_id = $${paramIndex}`);
      params.push(parseInt(auth.userID));
      paramIndex++;
    }

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
    const countQuery = `SELECT COUNT(*) as count FROM agent_collaborations ac ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get collaborations
    const collaborationsQuery = `
      SELECT * FROM agent_collaborations ac
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const collaborations = await coreDB.rawQueryAll<AgentCollaboration>(collaborationsQuery, ...params);

    // Optimization: Fetch all messages for all collaborations in one query
    const collaborationIds = collaborations.map(c => c.id);
    let allMessages: CollaborationMessage[] = [];
    if (collaborationIds.length > 0) {
      allMessages = await coreDB.rawQueryAll<CollaborationMessage>`
        SELECT * FROM collaboration_messages 
        WHERE collaboration_id = ANY(${collaborationIds})
        ORDER BY timestamp ASC
      `;
    }

    const messagesByCollaborationId = allMessages.reduce((acc, msg) => {
      if (!acc[msg.collaboration_id]) {
        acc[msg.collaboration_id] = [];
      }
      acc[msg.collaboration_id].push(msg);
      return acc;
    }, {} as Record<number, CollaborationMessage[]>);

    // Parse shared_context JSON and attach communication logs
    const parsedCollaborations = collaborations.map(collaboration => {
      const messages = messagesByCollaborationId[collaboration.id] || [];
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
    });

    const response = {
      collaborations: parsedCollaborations,
      total
    };

    await setCached(cacheKey, response, CACHE_TTL.COLLABORATIONS_LIST);

    return response;
  }
);
