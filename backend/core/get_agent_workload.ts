import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
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

// Retrieves the current workload and performance metrics for an agent.
export const getAgentWorkload = api<GetAgentWorkloadRequest, AgentWorkload>(
  { expose: true, method: "GET", path: "/agents/:agent_id/workload" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow<{ max_concurrent_tasks: number }>`
      SELECT max_concurrent_tasks FROM agents WHERE id = ${req.agent_id}
    `;

    if (!agent) {
      throw APIError.notFound("agent not found");
    }

    // Get current active tasks
    const currentTasks = await coreDB.queryAll<Task>`
      SELECT * FROM tasks 
      WHERE assigned_agent_id = ${req.agent_id} 
      AND status IN ('pending', 'in_progress', 'handed_off')
      ORDER BY priority DESC, created_at ASC
    `;

    // Parse context for each task
    const parsedTasks = currentTasks.map(task => ({
      ...task,
      context: typeof task.context === 'string' ? JSON.parse(task.context) : task.context
    }));

    // Get pending handoffs to this agent
    const pendingHandoffs = await coreDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM task_handoffs 
      WHERE to_agent_id = ${req.agent_id} AND status = 'pending'
    `;

    // Calculate capacity utilization
    const capacityUtilization = currentTasks.length / agent.max_concurrent_tasks;

    // Get average task duration from completed tasks
    const avgDuration = await coreDB.queryRow<{ avg_duration: number }>`
      SELECT AVG(actual_duration) as avg_duration FROM tasks 
      WHERE assigned_agent_id = ${req.agent_id} 
      AND status = 'completed' 
      AND actual_duration IS NOT NULL
    `;

    // Get recent completions (last 7 days)
    const recentCompletions = await coreDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM tasks 
      WHERE assigned_agent_id = ${req.agent_id} 
      AND status = 'completed'
      AND completed_at >= NOW() - INTERVAL '7 days'
    `;

    return {
      agent_id: req.agent_id,
      current_tasks: parsedTasks,
      pending_handoffs: pendingHandoffs?.count || 0,
      capacity_utilization: Math.min(capacityUtilization, 1.0),
      average_task_duration: avgDuration?.avg_duration || 0,
      recent_completions: recentCompletions?.count || 0
    };
  }
);
