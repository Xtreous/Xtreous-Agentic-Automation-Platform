import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { AgentPerformance } from "./types";
import { getCached, setCached, CACHE_KEYS, CACHE_TTL } from "./cache";

interface GetAgentPerformanceParams {
  agent_id: number;
  days?: number;
}

interface GetAgentPerformanceResponse {
  performance: AgentPerformance[];
  summary: {
    avg_accuracy: number;
    total_tasks: number;
    success_rate: number;
  };
}

// Retrieves performance metrics for a specific AI agent.
export const getAgentPerformance = api<GetAgentPerformanceParams, GetAgentPerformanceResponse>(
  { expose: true, method: "GET", path: "/agents/:agent_id/performance" },
  async (params) => {
    const days = params.days || 30;
    const cacheKey = CACHE_KEYS.AGENT_PERFORMANCE(params.agent_id, days);

    const cached = await getCached<GetAgentPerformanceResponse>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const performance = await coreDB.queryAll<AgentPerformance>`
      SELECT * FROM agent_performance 
      WHERE agent_id = ${params.agent_id} 
      AND recorded_at >= NOW() - INTERVAL '${days} days'
      ORDER BY recorded_at DESC
    `;
    
    const agent = await coreDB.queryRow<{ accuracy_rate: number; tasks_completed: number }>`
      SELECT accuracy_rate, tasks_completed FROM agents WHERE id = ${params.agent_id}
    `;
    
    const executions = await coreDB.queryAll<{ status: string }>`
      SELECT status FROM workflow_executions 
      WHERE agent_id = ${params.agent_id}
      AND started_at >= NOW() - INTERVAL '${days} days'
    `;
    
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const successRate = executions.length > 0 ? successfulExecutions / executions.length : 0;
    
    const response = {
      performance,
      summary: {
        avg_accuracy: agent?.accuracy_rate || 0,
        total_tasks: agent?.tasks_completed || 0,
        success_rate: successRate
      }
    };

    await setCached(cacheKey, response, CACHE_TTL.AGENT_PERFORMANCE);
    
    return response;
  }
);
