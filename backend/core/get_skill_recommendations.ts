import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { SkillRecommendation } from "./types";

export interface GetSkillRecommendationsRequest {
  agent_id: number;
  status?: Query<string>;
  limit?: Query<number>;
}

export interface GetSkillRecommendationsResponse {
  recommendations: SkillRecommendation[];
  total: number;
}

// Retrieves skill recommendations for a specific agent.
export const getSkillRecommendations = api<GetSkillRecommendationsRequest, GetSkillRecommendationsResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/recommendations" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    const limit = req.limit || 20;
    let whereConditions = [`agent_id = ${req.agent_id}`];
    
    if (req.status) {
      whereConditions.push(`status = '${req.status}'`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM skill_recommendations ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery);
    const total = countResult?.count || 0;

    // Get recommendations
    const recommendationsQuery = `
      SELECT * FROM skill_recommendations 
      ${whereClause}
      ORDER BY priority DESC, created_at DESC 
      LIMIT ${limit}
    `;

    const recommendations = await coreDB.rawQueryAll<SkillRecommendation>(recommendationsQuery);

    // Parse suggested_training_modules JSON for each recommendation
    const parsedRecommendations = recommendations.map(rec => ({
      ...rec,
      suggested_training_modules: typeof rec.suggested_training_modules === 'string'
        ? JSON.parse(rec.suggested_training_modules)
        : rec.suggested_training_modules
    }));

    return {
      recommendations: parsedRecommendations,
      total
    };
  }
);
