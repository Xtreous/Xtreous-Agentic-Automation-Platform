import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { Agent } from "./types";

interface GetAgentParams {
  id: number;
}

// Retrieves a specific AI agent by ID.
export const getAgent = api<GetAgentParams, Agent>(
  { expose: true, method: "GET", path: "/agents/:id" },
  async (params) => {
    const agent = await coreDB.queryRow<Agent>`
      SELECT * FROM agents WHERE id = ${params.id}
    `;
    
    if (!agent) {
      throw APIError.notFound("Agent not found");
    }
    
    return agent;
  }
);
