import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { Task, TaskContext, TaskPriority } from "./types";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigned_agent_id?: number;
  workflow_id?: string;
  parent_task_id?: number;
  context?: Partial<TaskContext>;
  estimated_duration?: number;
}

// Creates a new task in the system.
export const createTask = api<CreateTaskRequest, Task>(
  { expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    // Validate assigned agent exists if provided
    if (req.assigned_agent_id) {
      const agent = await coreDB.queryRow`
        SELECT id FROM agents WHERE id = ${req.assigned_agent_id}
      `;
      if (!agent) {
        throw APIError.notFound("assigned agent not found");
      }
    }

    // Validate parent task exists if provided
    if (req.parent_task_id) {
      const parentTask = await coreDB.queryRow`
        SELECT id FROM tasks WHERE id = ${req.parent_task_id}
      `;
      if (!parentTask) {
        throw APIError.notFound("parent task not found");
      }
    }

    const defaultContext: TaskContext = {
      data: {},
      history: [],
      requirements: [],
      constraints: [],
      dependencies: []
    };

    const context = {
      ...defaultContext,
      ...req.context
    };

    const task = await coreDB.queryRow<Task>`
      INSERT INTO tasks (
        title, description, priority, assigned_agent_id, 
        workflow_id, parent_task_id, context, estimated_duration
      )
      VALUES (
        ${req.title}, ${req.description}, ${req.priority}, ${req.assigned_agent_id},
        ${req.workflow_id}, ${req.parent_task_id}, ${JSON.stringify(context)}, ${req.estimated_duration}
      )
      RETURNING *
    `;

    if (!task) {
      throw APIError.internal("failed to create task");
    }

    // Add creation entry to task history
    await coreDB.exec`
      INSERT INTO task_history (task_id, action, details, metadata)
      VALUES (
        ${task.id}, 'created', 'Task created', 
        ${JSON.stringify({ priority: req.priority, assigned_agent_id: req.assigned_agent_id })}
      )
    `;

    // Parse the context JSON
    task.context = typeof task.context === 'string' ? JSON.parse(task.context) : task.context;

    return task;
  }
);
