import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";
import type { Agent } from "./types";

interface ListAgentsParams {
  industry?: Query<string>;
  status?: Query<string>;
  type?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
  sort_by?: Query<'name' | 'created_at' | 'accuracy_rate' | 'tasks_completed'>;
  sort_order?: Query<'asc' | 'desc'>;
  search?: Query<string>;
}

interface ListAgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Retrieves all AI agents with optional filtering, pagination, and sorting.
export const listAgents = api<ListAgentsParams, ListAgentsResponse>(
  { expose: true, method: "GET", path: "/agents" },
  async (params) => {
    const limit = Math.min(params.limit || 20, 100); // Max 100 items per page
    const offset = params.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';

    // Create cache key based on all parameters
    const cacheKey = CACHE_KEYS.AGENT_LIST(
      JSON.stringify({
        industry: params.industry,
        status: params.status,
        type: params.type,
        limit,
        offset,
        sortBy,
        sortOrder,
        search: params.search
      })
    );

    // Try to get from cache first
    const cached = await getCached<ListAgentsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build WHERE conditions
    let whereConditions: string[] = ['1=1'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (params.industry) {
      whereConditions.push(`industry = $${paramIndex}`);
      queryParams.push(params.industry);
      paramIndex++;
    }

    if (params.status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(params.status);
      paramIndex++;
    }

    if (params.type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(params.type);
      paramIndex++;
    }

    if (params.search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['name', 'created_at', 'accuracy_rate', 'tasks_completed'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count with optimized query
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agents 
      ${whereClause}
    `;
    const countResult = await coreDB.rawQueryRow<{ total: number }>(countQuery, ...queryParams);
    const total = countResult?.total || 0;

    // Get agents with pagination and sorting
    const agentsQuery = `
      SELECT 
        id, name, description, type, industry, status, 
        accuracy_rate, tasks_completed, created_at, updated_at,
        capabilities, max_concurrent_tasks, learning_rate,
        total_training_hours, skill_points
      FROM agents 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const agents = await coreDB.rawQueryAll<Agent>(agentsQuery, ...queryParams);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: ListAgentsResponse = {
      agents,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev
    };

    // Cache the response
    await setCached(cacheKey, response, CACHE_TTL.AGENT_LIST);

    return response;
  }
);
