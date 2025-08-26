import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentCollaboration } from "./types";
import { getAuthData } from "~encore/auth";

export interface CreateCollaborationRequest {
  name: string;
  description?: string;
  participating_agents: number[];
  coordinator_agent_id?: number;
  shared_context?: Record<string, any>;
}

// Creates a new agent collaboration.
export const createCollaboration = api<CreateCollaborationRequest, AgentCollaboration>(
  { expose: true, method: "POST", path: "/collaborations", auth: true },
  async (req) => {
    const auth = getAuthData()!;

    if (req.participating_agents.length < 2) {
      throw APIError.invalidArgument("collaboration must have at least 2 participating agents");
    }

    // Validate all participating agents exist
    for (const agentId of req.participating_agents) {
      const agent = await coreDB.queryRow`
        SELECT id FROM agents WHERE id = ${agentId}
      `;
      if (!agent) {
        throw APIError.notFound(`agent ${agentId} not found`);
      }
    }

    // Validate coordinator agent if provided
    if (req.coordinator_agent_id) {
      if (!req.participating_agents.includes(req.coordinator_agent_id)) {
        throw APIError.invalidArgument("coordinator agent must be one of the participating agents");
      }
    }

    const collaboration = await coreDB.queryRow<AgentCollaboration>`
      INSERT INTO agent_collaborations (
        name, description, participating_agents, coordinator_agent_id, shared_context,
        user_id, organization_id
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.participating_agents}, 
        ${req.coordinator_agent_id}, ${JSON.stringify(req.shared_context || {})},
        ${parseInt(auth.userID)}, ${auth.organizationId ? parseInt(auth.organizationId) : null}
      )
      RETURNING *
    `;

    if (!collaboration) {
      throw APIError.internal("failed to create collaboration");
    }

    // Parse the shared_context JSON
    collaboration.shared_context = typeof collaboration.shared_context === 'string' 
      ? JSON.parse(collaboration.shared_context) 
      : collaboration.shared_context;

    // Initialize empty communication log
    collaboration.communication_log = [];

    return collaboration;
  }
);
