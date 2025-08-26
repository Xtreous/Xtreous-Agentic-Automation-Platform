import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import { invalidateCollectionListCache } from "../core/cache";

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  agentIds?: number[];
}

export interface AgentCollection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  agentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new agent collection for the current user.
export const createCollection = api<CreateCollectionRequest, AgentCollection>(
  { expose: true, method: "POST", path: "/collections", auth: true },
  async (req) => {
    const auth = getAuthData()!;

    // Validate agent IDs if provided
    if (req.agentIds && req.agentIds.length > 0) {
      for (const agentId of req.agentIds) {
        const agent = await coreDB.queryRow`
          SELECT id FROM agents WHERE id = ${agentId}
        `;
        if (!agent) {
          throw APIError.notFound(`agent ${agentId} not found`);
        }
      }
    }

    // Create collection
    const collection = await coreDB.queryRow<{
      id: number;
      name: string;
      description?: string;
      user_id: number;
      is_public: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO agent_collections (name, description, user_id, is_public)
      VALUES (${req.name}, ${req.description}, ${parseInt(auth.userID)}, ${req.isPublic || false})
      RETURNING id, name, description, user_id, is_public, created_at, updated_at
    `;

    if (!collection) {
      throw APIError.internal("failed to create collection");
    }

    // Add agents to collection if provided
    if (req.agentIds && req.agentIds.length > 0) {
      for (const agentId of req.agentIds) {
        await coreDB.exec`
          INSERT INTO collection_agents (collection_id, agent_id)
          VALUES (${collection.id}, ${agentId})
        `;
      }
    }

    // Invalidate cache
    await invalidateCollectionListCache();

    return {
      id: collection.id.toString(),
      name: collection.name,
      description: collection.description,
      userId: collection.user_id.toString(),
      isPublic: collection.is_public,
      agentCount: req.agentIds?.length || 0,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at
    };
  }
);
