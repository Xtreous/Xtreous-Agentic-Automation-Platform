import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import { invalidateCollectionListCache } from "../core/cache";

export interface AddAgentToCollectionRequest {
  collectionId: number;
  agentId: number;
}

export interface AddAgentToCollectionResponse {
  message: string;
}

// Adds an agent to a collection.
export const addAgentToCollection = api<AddAgentToCollectionRequest, AddAgentToCollectionResponse>(
  { expose: true, method: "POST", path: "/collections/:collectionId/agents", auth: true },
  async (req) => {
    const auth = getAuthData()!;

    // Verify collection exists and user owns it
    const collection = await coreDB.queryRow<{ user_id: number }>`
      SELECT user_id FROM agent_collections WHERE id = ${req.collectionId}
    `;

    if (!collection) {
      throw APIError.notFound("collection not found");
    }

    if (collection.user_id.toString() !== auth.userID) {
      throw APIError.permissionDenied("can only modify your own collections");
    }

    // Verify agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agentId}
    `;

    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Check if agent is already in collection
    const existing = await coreDB.queryRow`
      SELECT id FROM collection_agents 
      WHERE collection_id = ${req.collectionId} AND agent_id = ${req.agentId}
    `;

    if (existing) {
      throw APIError.alreadyExists("agent is already in this collection");
    }

    // Add agent to collection
    await coreDB.exec`
      INSERT INTO collection_agents (collection_id, agent_id)
      VALUES (${req.collectionId}, ${req.agentId})
    `;

    // Invalidate cache
    await invalidateCollectionListCache();

    return {
      message: "Agent added to collection successfully"
    };
  }
);
