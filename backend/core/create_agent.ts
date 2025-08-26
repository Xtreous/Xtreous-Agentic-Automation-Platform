import { api } from "encore.dev/api";
import { coreDB } from "./db";
import { invalidateAgentListCache } from "./cache";
import type { Agent } from "./types";

interface CreateAgentRequest {
  name: string;
  description?: string;
  type: string;
  industry: string;
  configuration?: any;
}

// Creates a new AI agent with specified configuration.
export const createAgent = api<CreateAgentRequest, Agent>(
  { expose: true, method: "POST", path: "/agents" },
  async (req) => {
    const agent = await coreDB.queryRow<Agent>`
      INSERT INTO agents (name, description, type, industry, configuration)
      VALUES (${req.name}, ${req.description || null}, ${req.type}, ${req.industry}, ${JSON.stringify(req.configuration || {})})
      RETURNING *
    `;
    
    // Invalidate agent list cache
    await invalidateAgentListCache();
    
    return agent!;
  }
);
