import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentCollaboration } from "./types";
import { getAuthData } from "~encore/auth";
import { invalidateCollaborationListCache } from "./cache";

export interface UpdateCollaborationRequest {
  id: number;
  name?: string;
  description?: string;
  participating_agents?: number[];
  coordinator_agent_id?: number;
  status?: 'active' | 'paused' | 'completed';
}

// Updates an agent collaboration.
export const updateCollaboration = api<UpdateCollaborationRequest, AgentCollaboration>(
  { expose: true, method: "PUT", path: "/collaborations/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const { id, ...updates } = req;

    const currentCollaboration = await coreDB.queryRow<AgentCollaboration>`
      SELECT * FROM agent_collaborations WHERE id = ${id}
    `;

    if (!currentCollaboration) {
      throw APIError.notFound("collaboration not found");
    }

    // Security check
    if (auth.organizationId && currentCollaboration.organization_id?.toString() !== auth.organizationId) {
      if (auth.role !== 'super_admin' && currentCollaboration.user_id?.toString() !== auth.userID) {
        throw APIError.permissionDenied("you do not have access to this collaboration");
      }
    } else if (!auth.organizationId && currentCollaboration.user_id?.toString() !== auth.userID) {
      throw APIError.permissionDenied("you do not have access to this collaboration");
    }

    if (updates.participating_agents) {
      if (updates.participating_agents.length < 2) {
        throw APIError.invalidArgument("collaboration must have at least 2 participating agents");
      }
      for (const agentId of updates.participating_agents) {
        const agent = await coreDB.queryRow`SELECT id FROM agents WHERE id = ${agentId}`;
        if (!agent) throw APIError.notFound(`agent ${agentId} not found`);
      }
    }

    if (updates.coordinator_agent_id) {
      const agents = updates.participating_agents || currentCollaboration.participating_agents;
      if (!agents.includes(updates.coordinator_agent_id)) {
        throw APIError.invalidArgument("coordinator agent must be one of the participating agents");
      }
    }

    const collaboration = await coreDB.queryRow<AgentCollaboration>`
      UPDATE agent_collaborations SET
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        participating_agents = COALESCE(${updates.participating_agents}, participating_agents),
        coordinator_agent_id = COALESCE(${updates.coordinator_agent_id}, coordinator_agent_id),
        status = COALESCE(${updates.status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!collaboration) {
      throw APIError.internal("failed to update collaboration");
    }

    // Invalidate cache
    await invalidateCollaborationListCache();

    collaboration.shared_context = typeof collaboration.shared_context === 'string' 
      ? JSON.parse(collaboration.shared_context) 
      : collaboration.shared_context;

    return collaboration;
  }
);
