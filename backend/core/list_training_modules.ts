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
  sort_by?: Query<'name' | 'created_at' | 'difficulty_level' | 'estimated_duration'>;
  sort_order?: Query<'asc' | 'desc'>;
  search?: Query<string>;
}

export interface ListTrainingModulesResponse {
  modules: TrainingModule[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Retrieves a list of training modules with optional filtering, pagination, and sorting.
export const listTrainingModules = api<ListTrainingModulesRequest, ListTrainingModulesResponse>(
  { expose: true, method: "GET", path: "/training/modules" },
  async (req) => {
    const limit = Math.min(req.limit || 50, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const sortBy = req.sort_by || 'created_at';
    const sortOrder = req.sort_order || 'desc';

    // Build WHERE conditions
    let whereConditions: string[] = ['1=1'];
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

    if (req.search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR target_skill ILIKE $${paramIndex})`);
      params.push(`%${req.search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Validate sort column
    const validSortColumns = ['name', 'created_at', 'difficulty_level', 'estimated_duration'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM training_modules ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get modules with optimized query
    const modulesQuery = `
      SELECT 
        id, name, description, skill_category, target_skill, difficulty_level,
        prerequisites, content, estimated_duration, success_criteria,
        created_by, status, created_at, updated_at
      FROM training_modules 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
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

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      modules: parsedModules,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev
    };
  }
);
