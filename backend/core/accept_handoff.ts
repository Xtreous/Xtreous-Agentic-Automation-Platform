import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { TaskHandoff } from "./types";

export interface AcceptHandoffRequest {
  handoff_id: number;
  agent_id: number;
}

// Accepts a task handoff.
export const acceptHandoff = api<AcceptHandoffRequest, TaskHandoff>(
  { expose: true, method: "POST", path: "/handoffs/:handoff_id/accept" },
  async (req) => {
    // Get handoff details
    const handoff = await coreDB.queryRow<TaskHandoff>`
      SELECT * FROM task_handoffs WHERE id = ${req.handoff_id}
    `;

    if (!handoff) {
      throw APIError.notFound("handoff not found");
    }

    if (handoff.to_agent_id !== req.agent_id) {
      throw APIError.invalidArgument("handoff is not assigned to this agent");
    }

    if (handoff.status !== 'pending') {
      throw APIError.invalidArgument("handoff is not in pending status");
    }

    // Update handoff status
    const updatedHandoff = await coreDB.queryRow<TaskHandoff>`
      UPDATE task_handoffs SET
        status = 'accepted',
        completed_at = NOW()
      WHERE id = ${req.handoff_id}
      RETURNING *
    `;

    if (!updatedHandoff) {
      throw APIError.internal("failed to update handoff");
    }

    // Update task status to in_progress
    await coreDB.exec`
      UPDATE tasks SET
        status = 'in_progress',
        updated_at = NOW()
      WHERE id = ${handoff.task_id}
    `;

    // Add history entry
    await coreDB.exec`
      INSERT INTO task_history (task_id, agent_id, action, details, metadata)
      VALUES (
        ${handoff.task_id}, ${req.agent_id}, 'started', 
        'Task handoff accepted and work started',
        ${JSON.stringify({ handoff_id: req.handoff_id })}
      )
    `;

    // Parse the context_transfer JSON
    updatedHandoff.context_transfer = typeof updatedHandoff.context_transfer === 'string' 
      ? JSON.parse(updatedHandoff.context_transfer) 
      : updatedHandoff.context_transfer;

    return updatedHandoff;
  }
);
