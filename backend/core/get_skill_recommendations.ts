import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";
import type { SkillRecommendation } from "./types";

export interface GetSkillRecommendationsRequest {
  agent_id: number;
  status?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface GetSkillRecommendationsResponse {
  recommendations: SkillRecommendation[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Retrieves skill recommendations for a specific agent with pagination and caching.
export const getSkillRecommendations = api<GetSkillRecommendationsRequest, GetSkillRecommendationsResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/recommendations" },
  async (req) => {
    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const cacheKey = CACHE_KEYS.SKILL_RECOMMENDATIONS(req.agent_id, req.status);
    
    // Try to get from cache first
    const cached = await getCached<GetSkillRecommendationsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Build WHERE conditions
    let whereConditions = [`agent_id = ${req.agent_id}`];
    let params: any[] = [];
    let paramIndex = 1;
    
    if (req.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM skill_recommendations ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get recommendations with pagination
    const recommendationsQuery = `
      SELECT 
        id, agent_id, recommended_skill, skill_category, reason, priority,
        based_on_task_id, based_on_performance_gap, suggested_training_modules,
        status, created_at, reviewed_at
      FROM skill_recommendations 
      ${whereClause}
      ORDER BY priority DESC, created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const recommendations = await coreDB.rawQueryAll<SkillRecommendation>(recommendationsQuery, ...params);

    // Parse suggested_training_modules JSON for each recommendation
    const parsedRecommendations = recommendations.map(rec => ({
      ...rec,
      suggested_training_modules: typeof rec.suggested_training_modules === 'string'
        ? JSON.parse(rec.suggested_training_modules)
        : rec.suggested_training_modules
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: GetSkillRecommendationsResponse = {
      recommendations: parsedRecommendations,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev
    };

    // Cache the response
    await setCached(cacheKey, response, CACHE_TTL.SKILL_RECOMMENDATIONS);

    return response;
  }
);
