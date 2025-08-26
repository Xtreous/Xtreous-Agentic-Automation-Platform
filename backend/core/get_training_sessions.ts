import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";
import type { AgentTrainingSession } from "./types";

export interface GetTrainingSessionsRequest {
  agent_id: number;
  status?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface GetTrainingSessionsResponse {
  sessions: AgentTrainingSession[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  stats: {
    completed: number;
    in_progress: number;
    failed: number;
    average_score: number;
  };
}

// Retrieves training sessions for a specific agent with pagination and caching.
export const getTrainingSessions = api<GetTrainingSessionsRequest, GetTrainingSessionsResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/training-sessions" },
  async (req) => {
    const limit = Math.min(req.limit || 50, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const cacheKey = CACHE_KEYS.TRAINING_SESSIONS(req.agent_id, req.status);
    
    // Try to get from cache first
    const cached = await getCached<GetTrainingSessionsResponse>(cacheKey);
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
    let whereConditions = [`ats.agent_id = ${req.agent_id}`];
    let params: any[] = [];
    let paramIndex = 1;
    
    if (req.status) {
      whereConditions.push(`ats.status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM agent_training_sessions ats ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get sessions with training module details using optimized query
    const sessionsQuery = `
      SELECT 
        ats.id, ats.agent_id, ats.training_module_id, ats.status,
        ats.progress_percentage, ats.score, ats.feedback,
        ats.started_at, ats.completed_at, ats.duration_minutes,
        tm.name as module_name, tm.target_skill, tm.skill_category
      FROM agent_training_sessions ats
      INNER JOIN training_modules tm ON ats.training_module_id = tm.id
      ${whereClause}
      ORDER BY ats.started_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const sessions = await coreDB.rawQueryAll<AgentTrainingSession & {
      module_name: string;
      target_skill: string;
      skill_category: string;
    }>(sessionsQuery, ...params);

    // Get stats with optimized query
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(CASE WHEN score IS NOT NULL THEN score END) as avg_score
      FROM agent_training_sessions 
      WHERE agent_id = ${req.agent_id}
      GROUP BY status
    `;
    const statsResults = await coreDB.rawQueryAll<{
      status: string;
      count: number;
      avg_score: number;
    }>(statsQuery);

    const stats = {
      completed: 0,
      in_progress: 0,
      failed: 0,
      average_score: 0
    };

    let totalScores = 0;
    let scoredSessions = 0;

    statsResults.forEach(stat => {
      if (stat.status in stats) {
        stats[stat.status as keyof typeof stats] = stat.count;
      }
      if (stat.avg_score && stat.status === 'completed') {
        totalScores += stat.avg_score * stat.count;
        scoredSessions += stat.count;
      }
    });

    stats.average_score = scoredSessions > 0 ? Math.round(totalScores / scoredSessions) : 0;

    // Parse feedback JSON for each session
    const parsedSessions = sessions.map(session => ({
      ...session,
      feedback: typeof session.feedback === 'string' 
        ? JSON.parse(session.feedback) 
        : session.feedback
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: GetTrainingSessionsResponse = {
      sessions: parsedSessions,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev,
      stats
    };

    // Cache the response
    await setCached(cacheKey, response, CACHE_TTL.TRAINING_SESSIONS);

    return response;
  }
);
