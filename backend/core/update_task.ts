import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { Task, TaskStatus, TaskPriority, TaskContext } from "./types";

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_agent_id?: number;
  context?: Partial<TaskContext>;
  actual_duration?: number;
}

// Updates an existing task.
export const updateTask = api<UpdateTaskRequest, Task>(
  { expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    // Get current task
    const currentTask = await coreDB.queryRow<Task>`
      SELECT * FROM tasks WHERE id = ${req.id}
    `;

    if (!currentTask) {
      throw APIError.notFound("task not found");
    }

    // Validate assigned agent exists if provided
    if (req.assigned_agent_id) {
      const agent = await coreDB.queryRow`
        SELECT id FROM agents WHERE id = ${req.assigned_agent_id}
      `;
      if (!agent) {
        throw APIError.notFound("assigned agent not found");
      }
    }

    // Parse current context
    const currentContext = typeof currentTask.context === 'string' 
      ? JSON.parse(currentTask.context) 
      : currentTask.context;

    // Merge context if provided
    const updatedContext = req.context 
      ? { ...currentContext, ...req.context }
      : currentContext;

    // Determine completed_at timestamp
    const completedAt = req.status === 'completed' && currentTask.status !== 'completed' 
      ? new Date() 
      : currentTask.completed_at;

    const updatedTask = await coreDB.queryRow<Task>`
      UPDATE tasks SET
        title = COALESCE(${req.title}, title),
        description = COALESCE(${req.description}, description),
        status = COALESCE(${req.status}, status),
        priority = COALESCE(${req.priority}, priority),
        assigned_agent_id = COALESCE(${req.assigned_agent_id}, assigned_agent_id),
        context = ${JSON.stringify(updatedContext)},
        actual_duration = COALESCE(${req.actual_duration}, actual_duration),
        completed_at = ${completedAt},
        updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!updatedTask) {
      throw APIError.internal("failed to update task");
    }

    // Add history entry for significant changes
    const changes: string[] = [];
    if (req.status && req.status !== currentTask.status) {
      changes.push(`status changed from ${currentTask.status} to ${req.status}`);
    }
    if (req.assigned_agent_id && req.assigned_agent_id !== currentTask.assigned_agent_id) {
      changes.push(`assigned agent changed`);
    }
    if (req.priority && req.priority !== currentTask.priority) {
      changes.push(`priority changed from ${currentTask.priority} to ${req.priority}`);
    }

    if (changes.length > 0) {
      await coreDB.exec`
        INSERT INTO task_history (task_id, action, details, metadata)
        VALUES (
          ${req.id}, 'updated', ${changes.join(', ')},
          ${JSON.stringify({ 
            previous_status: currentTask.status,
            new_status: req.status,
            previous_agent: currentTask.assigned_agent_id,
            new_agent: req.assigned_agent_id
          })}
        )
      `;
    }

    // Parse the context JSON
    updatedTask.context = typeof updatedTask.context === 'string' 
      ? JSON.parse(updatedTask.context) 
      : updatedTask.context;

    return updatedTask;
  }
);
