import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import { getAuthData } from "~encore/auth";

export interface UpdateCollaborationContextRequest {
  id: number;
  shared_context: Record<string, any>;
}

export interface UpdateCollaborationContextResponse {
  success: boolean;
}

// Updates the shared context of a collaboration.
export const updateCollaborationContext = api<UpdateCollaborationContextRequest, UpdateCollaborationContextResponse>(
  { expose: true, method: "PUT", path: "/collaborations/:id/context", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const { id, shared_context } = req;

    const collaboration = await coreDB.queryRow<{ id: number, user_id: number, organization_id: number, participating_agents: number[] }>`
      SELECT id, user_id, organization_id, participating_agents FROM agent_collaborations WHERE id = ${id}
    `;

    if (!collaboration) {
      throw APIError.notFound("collaboration not found");
    }

    // Security check: user must be part of the collaboration's organization or be the creator
    if (auth.organizationId && collaboration.organization_id?.toString() !== auth.organizationId) {
      if (auth.role !== 'super_admin' && collaboration.user_id?.toString() !== auth.userID) {
        throw APIError.permissionDenied("you do not have access to this collaboration");
      }
    } else if (!auth.organizationId && collaboration.user_id?.toString() !== auth.userID) {
      throw APIError.permissionDenied("you do not have access to this collaboration");
    }

    await coreDB.exec`
      UPDATE agent_collaborations SET
        shared_context = ${JSON.stringify(shared_context)},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return { success: true };
  }
);
