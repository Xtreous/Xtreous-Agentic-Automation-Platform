import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "./db";
import type { Task, TaskStatus, TaskPriority } from "./types";

export interface ListTasksRequest {
  status?: Query<TaskStatus>;
  priority?: Query<TaskPriority>;
  assigned_agent_id?: Query<number>;
  workflow_id?: Query<string>;
  parent_task_id?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListTasksResponse {
  tasks: Task[];
  total: number;
}

// Retrieves a list of tasks with optional filtering.
export const listTasks = api<ListTasksRequest, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let whereConditions: string[] = [];
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

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM tasks ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get tasks
    const tasksQuery = `
      SELECT * FROM tasks 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const tasks = await coreDB.rawQueryAll<Task>(tasksQuery, ...params);

    // Parse context JSON for each task
    const parsedTasks = tasks.map(task => ({
      ...task,
      context: typeof task.context === 'string' ? JSON.parse(task.context) : task.context
    }));

    return {
      tasks: parsedTasks,
      total
    };
  }
);
