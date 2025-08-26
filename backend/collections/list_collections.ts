import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import type { AgentCollection } from "./create_collection";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "../core/cache";

export interface ListCollectionsRequest {
  userId?: Query<string>;
  isPublic?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListCollectionsResponse {
  collections: AgentCollection[];
  total: number;
}

// Lists agent collections for the current user or public collections.
export const listCollections = api<ListCollectionsRequest, ListCollectionsResponse>(
  { expose: true, method: "GET", path: "/collections", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const cacheKey = CACHE_KEYS.COLLECTIONS_LIST(JSON.stringify({ ...req, authId: auth.userID }));
    const cached = await getCached<ListCollectionsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // If userId is specified, show that user's collections (if public or own)
    if (req.userId) {
      if (req.userId === auth.userID) {
        // Show all own collections
        whereConditions.push(`ac.user_id = $${paramIndex}`);
        params.push(parseInt(req.userId));
        paramIndex++;
      } else {
        // Show only public collections of other users
        whereConditions.push(`ac.user_id = $${paramIndex} AND ac.is_public = true`);
        params.push(parseInt(req.userId));
        paramIndex++;
      }
    } else {
      // Show own collections and public collections
      whereConditions.push(`(ac.user_id = $${paramIndex} OR ac.is_public = true)`);
      params.push(parseInt(auth.userID));
      paramIndex++;
    }

    if (req.isPublic !== undefined) {
      whereConditions.push(`ac.is_public = $${paramIndex}`);
      params.push(req.isPublic);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM agent_collections ac 
      ${whereClause}
    `;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get collections with agent count
    const collectionsQuery = `
      SELECT 
        ac.id, ac.name, ac.description, ac.user_id, ac.is_public,
        ac.created_at, ac.updated_at,
        COUNT(ca.agent_id) as agent_count
      FROM agent_collections ac
      LEFT JOIN collection_agents ca ON ac.id = ca.collection_id
      ${whereClause}
      GROUP BY ac.id, ac.name, ac.description, ac.user_id, ac.is_public, ac.created_at, ac.updated_at
      ORDER BY ac.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const collections = await coreDB.rawQueryAll<{
      id: number;
      name: string;
      description?: string;
      user_id: number;
      is_public: boolean;
      created_at: Date;
      updated_at: Date;
      agent_count: number;
    }>(collectionsQuery, ...params);

    const response = {
      collections: collections.map(collection => ({
        id: collection.id.toString(),
        name: collection.name,
        description: collection.description,
        userId: collection.user_id.toString(),
        isPublic: collection.is_public,
        agentCount: collection.agent_count,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at
      })),
      total
    };

    await setCached(cacheKey, response, CACHE_TTL.COLLECTIONS_LIST);

    return response;
  }
);
