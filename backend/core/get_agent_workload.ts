import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";
import type { Task } from "./types";

export interface GetAgentWorkloadRequest {
  agent_id: number;
}

export interface AgentWorkload {
  agent_id: number;
  current_tasks: Task[];
  pending_handoffs: number;
  capacity_utilization: number;
  average_task_duration: number;
  recent_completions: number;
}

// Retrieves the current workload and performance metrics for an agent with caching.
export const getAgentWorkload = api<GetAgentWorkloadRequest, AgentWorkload>(
  { expose: true, method: "GET", path: "/agents/:agent_id/workload" },
  async (req) => {
    const cacheKey = CACHE_KEYS.AGENT_WORKLOAD(req.agent_id);
    
    // Try to get from cache first
    const cached = await getCached<AgentWorkload>(cacheKey);
    if (cached) {
      return cached;
    }

    // Validate agent exists and get max_concurrent_tasks in one query
    const agent = await coreDB.queryRow<{ max_concurrent_tasks: number }>`
      SELECT max_concurrent_tasks FROM agents WHERE id = ${req.agent_id}
    `;

    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Get current active tasks with optimized query
    const currentTasks = await coreDB.queryAll<Task>`
      SELECT 
        id, title, description, status, priority, assigned_agent_id,
        workflow_id, parent_task_id, context, created_at, updated_at,
        completed_at, estimated_duration, actual_duration
      FROM tasks 
      WHERE assigned_agent_id = ${req.agent_id} 
        AND status IN ('pending', 'in_progress', 'handed_off')
      ORDER BY priority DESC, created_at ASC
    `;

    // Parse context for each task
    const parsedTasks = currentTasks.map(task => ({
      ...task,
      context: typeof task.context === 'string' ? JSON.parse(task.context) : task.context
    }));

    // Get metrics with optimized queries using indexes
    const [pendingHandoffs, avgDuration, recentCompletions] = await Promise.all([
      coreDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM task_handoffs 
        WHERE to_agent_id = ${req.agent_id} AND status = 'pending'
      `,
      coreDB.queryRow<{ avg_duration: number }>`
        SELECT AVG(actual_duration) as avg_duration 
        FROM tasks 
        WHERE assigned_agent_id = ${req.agent_id} 
          AND status = 'completed' 
          AND actual_duration IS NOT NULL
      `,
      coreDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE assigned_agent_id = ${req.agent_id} 
          AND status = 'completed'
          AND completed_at >= NOW() - INTERVAL '7 days'
      `
    ]);

    // Calculate capacity utilization
    const capacityUtilization = currentTasks.length / agent.max_concurrent_tasks;

    const response: AgentWorkload = {
      agent_id: req.agent_id,
      current_tasks: parsedTasks,
      pending_handoffs: pendingHandoffs?.count || 0,
      capacity_utilization: Math.min(capacityUtilization, 1.0),
      average_task_duration: avgDuration?.avg_duration || 0,
      recent_completions: recentCompletions?.count || 0
    };

    // Cache with shorter TTL since workload changes frequently
    await setCached(cacheKey, response, CACHE_TTL.AGENT_WORKLOAD);

    return response;
  }
);
