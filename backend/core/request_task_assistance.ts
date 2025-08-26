import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { TaskHandoff, Task } from "./types";
import { getAuthData } from "~encore/auth";

export interface RequestTaskAssistanceRequest {
  task_id: number;
  reason: string;
  required_skills?: string[];
}

// Requests assistance on a task, potentially leading to an automatic handoff.
export const requestTaskAssistance = api<RequestTaskAssistanceRequest, TaskHandoff>(
  { expose: true, method: "POST", path: "/tasks/:task_id/request-assistance", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const { task_id, reason, required_skills } = req;

    const task = await coreDB.queryRow<Task>`
      SELECT * FROM tasks WHERE id = ${task_id}
    `;

    if (!task) {
      throw APIError.notFound("task not found");
    }

    if (!task.assigned_agent_id) {
      throw APIError.invalidArgument("task is not assigned to any agent");
    }

    // Find a suitable agent for handoff
    let queryParams: any[] = [task.assigned_agent_id];
    let paramIndex = 2;

    let potentialAgentsQuery = `
      SELECT a.id, a.max_concurrent_tasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_agent_id = a.id AND status IN ('pending', 'in_progress')) as active_tasks
      FROM agents a
      WHERE a.id != $1 AND a.status = 'active'
    `;

    if (required_skills && required_skills.length > 0) {
      potentialAgentsQuery += `
        AND EXISTS (
          SELECT 1 FROM agent_skills sk 
          WHERE sk.agent_id = a.id AND sk.skill_name = ANY($${paramIndex})
        )
      `;
      queryParams.push(required_skills);
      paramIndex++;
    }

    const potentialAgents = await coreDB.rawQueryAll<{ id: number, max_concurrent_tasks: number, active_tasks: number }>(
      potentialAgentsQuery, ...queryParams
    );

    const availableAgents = potentialAgents.filter(
      agent => agent.active_tasks < agent.max_concurrent_tasks
    );

    if (availableAgents.length === 0) {
      throw APIError.resourceExhausted("no available agents found for handoff");
    }

    // Simple selection logic: pick the first available agent.
    const toAgentId = availableAgents[0].id;

    // Create handoff record
    const handoff = await coreDB.queryRow<TaskHandoff>`
      INSERT INTO task_handoffs (
        task_id, from_agent_id, to_agent_id, reason, context_transfer
      )
      VALUES (
        ${task_id}, ${task.assigned_agent_id}, ${toAgentId}, 
        ${`Assistance requested: ${reason}`}, ${JSON.stringify({ original_context: task.context })}
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
        assigned_agent_id = ${toAgentId},
        updated_at = NOW()
      WHERE id = ${task_id}
    `;

    // Add history entry
    await coreDB.exec`
      INSERT INTO task_history (task_id, agent_id, action, details, metadata)
      VALUES (
        ${task_id}, ${task.assigned_agent_id}, 'handed_off', 
        ${`Task handed off to agent ${toAgentId} after assistance request: ${reason}`},
        ${JSON.stringify({ 
          handoff_id: handoff.id,
          to_agent_id: toAgentId,
          reason: `Assistance requested: ${reason}`
        })}
      )
    `;

    handoff.context_transfer = typeof handoff.context_transfer === 'string' 
      ? JSON.parse(handoff.context_transfer) 
      : handoff.context_transfer;

    return handoff;
  }
);
