import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentCollaboration } from "./types";
import { getAuthData } from "~encore/auth";

export interface GetCollaborationRequest {
  id: number;
}

// Retrieves a specific agent collaboration.
export const getCollaboration = api<GetCollaborationRequest, AgentCollaboration>(
  { expose: true, method: "GET", path: "/collaborations/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;

    const collaboration = await coreDB.queryRow<AgentCollaboration>`
      SELECT * FROM agent_collaborations WHERE id = ${req.id}
    `;

    if (!collaboration) {
      throw APIError.notFound("collaboration not found");
    }

    // Security check: user must be part of the organization or the creator
    if (auth.organizationId && collaboration.organization_id?.toString() !== auth.organizationId) {
      if (auth.role !== 'super_admin' && collaboration.user_id?.toString() !== auth.userID) {
        throw APIError.permissionDenied("you do not have access to this collaboration");
      }
    } else if (!auth.organizationId && collaboration.user_id?.toString() !== auth.userID) {
      throw APIError.permissionDenied("you do not have access to this collaboration");
    }

    const messages = await coreDB.queryAll`
      SELECT * FROM collaboration_messages 
      WHERE collaboration_id = ${req.id}
      ORDER BY timestamp ASC
    `;

    collaboration.shared_context = typeof collaboration.shared_context === 'string' 
      ? JSON.parse(collaboration.shared_context) 
      : collaboration.shared_context;
      
    collaboration.communication_log = messages.map(msg => ({
      ...msg,
      metadata: typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata
    }));

    return collaboration;
  }
);
