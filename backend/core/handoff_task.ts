import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { TaskHandoff, Task } from "./types";

export interface HandoffTaskRequest {
  task_id: number;
  from_agent_id: number;
  to_agent_id: number;
  reason: string;
  context_transfer?: Record<string, any>;
}

// Creates a task handoff between agents.
export const handoffTask = api<HandoffTaskRequest, TaskHandoff>(
  { expose: true, method: "POST", path: "/tasks/handoff" },
  async (req) => {
    // Validate task exists and is assigned to the from_agent
    const task = await coreDB.queryRow<Task>`
      SELECT * FROM tasks WHERE id = ${req.task_id}
    `;

    if (!task) {
      throw APIError.notFound("task not found");
    }

    if (task.assigned_agent_id !== req.from_agent_id) {
      throw APIError.invalidArgument("task is not assigned to the specified from_agent");
    }

    if (task.status === 'completed') {
      throw APIError.invalidArgument("cannot handoff a completed task");
    }

    // Validate both agents exist
    const fromAgent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.from_agent_id}
    `;
    const toAgent = await coreDB.queryRow`
      SELECT id FROM agents WHERE id = ${req.to_agent_id}
    `;

    if (!fromAgent) {
      throw APIError.notFound("from_agent not found");
    }
    if (!toAgent) {
      throw APIError.notFound("to_agent not found");
    }

    // Check if to_agent has capacity (simple check based on max_concurrent_tasks)
    const currentTasks = await coreDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM tasks 
      WHERE assigned_agent_id = ${req.to_agent_id} 
      AND status IN ('pending', 'in_progress')
    `;

    const agentInfo = await coreDB.queryRow<{ max_concurrent_tasks: number }>`
      SELECT max_concurrent_tasks FROM agents WHERE id = ${req.to_agent_id}
    `;

    if (currentTasks && agentInfo && currentTasks.count >= agentInfo.max_concurrent_tasks) {
      throw APIError.resourceExhausted("target agent has reached maximum concurrent tasks");
    }

    // Create handoff record
    const handoff = await coreDB.queryRow<TaskHandoff>`
      INSERT INTO task_handoffs (
        task_id, from_agent_id, to_agent_id, reason, context_transfer
      )
      VALUES (
        ${req.task_id}, ${req.from_agent_id}, ${req.to_agent_id}, 
        ${req.reason}, ${JSON.stringify(req.context_transfer || {})}
      )
      RETURNING *
    `;

    if (!handoff) {
      throw APIError.internal("failed to create handoff");
    }

    // Update task status and assignment
    await coreDB.exec`
      UPDATE tasks SET
        status = 'handed_off',
        assigned_agent_id = ${req.to_agent_id},
        updated_at = NOW()
      WHERE id = ${req.task_id}
    `;

    // Add history entry
    await coreDB.exec`
      INSERT INTO task_history (task_id, agent_id, action, details, metadata)
      VALUES (
        ${req.task_id}, ${req.from_agent_id}, 'handed_off', 
        ${`Task handed off to agent ${req.to_agent_id}: ${req.reason}`},
        ${JSON.stringify({ 
          handoff_id: handoff.id,
          to_agent_id: req.to_agent_id,
          reason: req.reason
        })}
      )
    `;

    // Parse the context_transfer JSON
    handoff.context_transfer = typeof handoff.context_transfer === 'string' 
      ? JSON.parse(handoff.context_transfer) 
      : handoff.context_transfer;

    return handoff;
  }
);
