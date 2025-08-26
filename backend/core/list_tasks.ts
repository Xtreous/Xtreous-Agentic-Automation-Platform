import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { Task, TaskStatus, TaskPriority } from "./types";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";

export interface ListTasksRequest {
  status?: Query<TaskStatus>;
  priority?: Query<TaskPriority>;
  assigned_agent_id?: Query<number>;
  workflow_id?: Query<string>;
  parent_task_id?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
  sort_by?: Query<'title' | 'created_at' | 'priority' | 'status'>;
  sort_order?: Query<'asc' | 'desc'>;
  search?: Query<string>;
}

export interface ListTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Retrieves a list of tasks with optional filtering, pagination, and sorting.
export const listTasks = api<ListTasksRequest, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async (req) => {
    const limit = Math.min(req.limit || 50, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const sortBy = req.sort_by || 'created_at';
    const sortOrder = req.sort_order || 'desc';

    const cacheKey = CACHE_KEYS.TASKS_LIST(JSON.stringify(req));
    const cached = await getCached<ListTasksResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Build WHERE conditions
    let whereConditions: string[] = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    if (req.priority) {
      whereConditions.push(`priority = $${paramIndex}`);
      params.push(req.priority);
      paramIndex++;
    }

    if (req.assigned_agent_id) {
      whereConditions.push(`assigned_agent_id = $${paramIndex}`);
      params.push(req.assigned_agent_id);
      paramIndex++;
    }

    if (req.workflow_id) {
      whereConditions.push(`workflow_id = $${paramIndex}`);
      params.push(req.workflow_id);
      paramIndex++;
    }

    if (req.parent_task_id) {
      whereConditions.push(`parent_task_id = $${paramIndex}`);
      params.push(req.parent_task_id);
      paramIndex++;
    }

    if (req.search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${req.search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Validate sort column
    const validSortColumns = ['title', 'created_at', 'priority', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM tasks ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get tasks with optimized query
    const tasksQuery = `
      SELECT 
        id, title, description, status, priority, assigned_agent_id,
        workflow_id, parent_task_id, context, created_at, updated_at,
        completed_at, estimated_duration, actual_duration
      FROM tasks 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const tasks = await coreDB.rawQueryAll<Task>(tasksQuery, ...params);

    // Parse context JSON for each task
    const parsedTasks = tasks.map(task => ({
      ...task,
      context: typeof task.context === 'string' ? JSON.parse(task.context) : task.context
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response = {
      tasks: parsedTasks,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev
    };

    await setCached(cacheKey, response, CACHE_TTL.TASKS_LIST);

    return response;
  }
);
