import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentTrainingSession } from "./types";

export interface GetTrainingSessionsRequest {
  agent_id: number;
  status?: Query<string>;
  limit?: Query<number>;
}

export interface GetTrainingSessionsResponse {
  sessions: AgentTrainingSession[];
  total: number;
  stats: {
    completed: number;
    in_progress: number;
    failed: number;
    average_score: number;
  };
}

// Retrieves training sessions for a specific agent.
export const getTrainingSessions = api<GetTrainingSessionsRequest, GetTrainingSessionsResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/training-sessions" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.agent_id}
    `;
    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    const limit = req.limit || 50;
    let whereConditions = [`agent_id = ${req.agent_id}`];
    
    if (req.status) {
      whereConditions.push(`status = '${req.status}'`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM agent_training_sessions ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery);
    const total = countResult?.count || 0;

    // Get sessions with training module details
    const sessionsQuery = `
      SELECT ats.*, tm.name as module_name, tm.target_skill, tm.skill_category
      FROM agent_training_sessions ats
      JOIN training_modules tm ON ats.training_module_id = tm.id
      ${whereClause}
      ORDER BY ats.started_at DESC 
      LIMIT ${limit}
    `;

    const sessions = await coreDB.rawQueryAll<AgentTrainingSession & {
      module_name: string;
      target_skill: string;
      skill_category: string;
    }>(sessionsQuery);

    // Get stats
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(score) as avg_score
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
      stats[stat.status as keyof typeof stats] = stat.count;
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

    return {
      sessions: parsedSessions,
      total,
      stats
    };
  }
);
