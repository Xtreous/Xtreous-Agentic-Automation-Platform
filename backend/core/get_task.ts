import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { Task, TaskHistoryEntry } from "./types";

export interface GetTaskRequest {
  id: number;
}

export interface GetTaskResponse {
  task: Task;
  history: TaskHistoryEntry[];
}

// Retrieves a specific task with its history.
export const getTask = api<GetTaskRequest, GetTaskResponse>(
  { expose: true, method: "GET", path: "/tasks/:id" },
  async (req) => {
    const task = await coreDB.queryRow<Task>`
      SELECT * FROM tasks WHERE id = ${req.id}
    `;

    if (!task) {
      throw APIError.notFound("task not found");
    }

    const history = await coreDB.queryAll<TaskHistoryEntry>`
      SELECT * FROM task_history 
      WHERE task_id = ${req.id}
      ORDER BY timestamp ASC
    `;

    // Parse context JSON
    task.context = typeof task.context === 'string' ? JSON.parse(task.context) : task.context;

    // Parse metadata JSON for history entries
    const parsedHistory = history.map(entry => ({
      ...entry,
      metadata: typeof entry.metadata === 'string' ? JSON.parse(entry.metadata) : entry.metadata
    }));

    return {
      task,
      history: parsedHistory
    };
  }
);
