import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { Agent } from "./types";

interface UpdateAgentParams {
  id: number;
}

interface UpdateAgentRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'training';
  configuration?: any;
}

// Updates an existing AI agent's configuration and status.
export const updateAgent = api<UpdateAgentParams & UpdateAgentRequest, Agent>(
  { expose: true, method: "PUT", path: "/agents/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const existingAgent = await coreDB.queryRow<Agent>`
      SELECT * FROM agents WHERE id = ${id}
    `;
    
    if (!existingAgent) {
      throw APIError.notFound("Agent not found");
    }
    
    const agent = await coreDB.queryRow<Agent>`
      UPDATE agents 
      SET 
        name = COALESCE(${updates.name}, name),
        description = COALESCE(${updates.description}, description),
        status = COALESCE(${updates.status}, status),
        configuration = COALESCE(${updates.configuration ? JSON.stringify(updates.configuration) : null}, configuration),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    return agent!;
  }
);
