import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { TrainingModule } from "./types";

export interface ListTrainingModulesRequest {
  skill_category?: Query<string>;
  difficulty_level?: Query<number>;
  status?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListTrainingModulesResponse {
  modules: TrainingModule[];
  total: number;
}

// Retrieves a list of training modules with optional filtering.
export const listTrainingModules = api<ListTrainingModulesRequest, ListTrainingModulesResponse>(
  { expose: true, method: "GET", path: "/training/modules" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.skill_category) {
      whereConditions.push(`skill_category = $${paramIndex}`);
      params.push(req.skill_category);
      paramIndex++;
    }

    if (req.difficulty_level) {
      whereConditions.push(`difficulty_level = $${paramIndex}`);
      params.push(req.difficulty_level);
      paramIndex++;
    }

    if (req.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM training_modules ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get modules
    const modulesQuery = `
      SELECT * FROM training_modules 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const modules = await coreDB.rawQueryAll<TrainingModule>(modulesQuery, ...params);

    // Parse JSON fields for each module
    const parsedModules = modules.map(module => ({
      ...module,
      prerequisites: typeof module.prerequisites === 'string' 
        ? JSON.parse(module.prerequisites) 
        : module.prerequisites,
      content: typeof module.content === 'string' 
        ? JSON.parse(module.content) 
        : module.content,
      success_criteria: typeof module.success_criteria === 'string' 
        ? JSON.parse(module.success_criteria) 
        : module.success_criteria
    }));

    return {
      modules: parsedModules,
      total
    };
  }
);
