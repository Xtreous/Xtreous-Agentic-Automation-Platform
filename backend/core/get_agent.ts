import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";
import type { Agent } from "./types";

interface GetAgentParams {
  id: number;
}

// Retrieves a specific AI agent by ID with caching.
export const getAgent = api<GetAgentParams, Agent>(
  { expose: true, method: "GET", path: "/agents/:id" },
  async (params) => {
    const cacheKey = CACHE_KEYS.AGENT(params.id);
    
    // Try to get from cache first
    const cached = await getCached<Agent>(cacheKey);
    if (cached) {
      return cached;
    }

    // Use optimized query with specific columns
    const agent = await coreDB.queryRow<Agent>`
      SELECT 
        id, name, description, type, industry, status, 
        accuracy_rate, tasks_completed, created_at, updated_at,
        capabilities, max_concurrent_tasks, learning_rate,
        total_training_hours, skill_points, configuration
      FROM agents 
      WHERE id = ${params.id}
    `;
    
    if (!agent) {
      throw APIError.notFound("Agent not found");
    }

    // Cache the agent data
    await setCached(cacheKey, agent, CACHE_TTL.AGENT);
    
    return agent;
  }
);
