import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import { invalidateAgentListCache } from "./cache";
import type { Agent } from "./types";

interface CreateAgentRequest {
  name: string;
  description?: string;
  type?: string;
  industry?: string;
  configuration?: any;
  template_id?: number;
}

// Creates a new AI agent with specified configuration.
export const createAgent = api<CreateAgentRequest, Agent>(
  { expose: true, method: "POST", path: "/agents" },
  async (req) => {
    let agentData = {
      name: req.name,
      description: req.description,
      type: req.type,
      industry: req.industry,
      configuration: req.configuration || {},
      capabilities: [] as string[]
    };

    if (req.template_id) {
      const template = await coreDB.queryRow<{
        description: string;
        type: string;
        industry: string;
        base_configuration: string | Record<string, any>;
        capabilities: string[];
      }>`
        SELECT description, type, industry, base_configuration, capabilities 
        FROM agent_templates WHERE id = ${req.template_id}
      `;
      if (!template) {
        throw APIError.notFound("template not found");
      }
      
      const baseConfig = typeof template.base_configuration === 'string' 
        ? JSON.parse(template.base_configuration) 
        : template.base_configuration;

      agentData.description = req.description || template.description;
      agentData.type = template.type;
      agentData.industry = template.industry;
      agentData.configuration = { ...baseConfig, ...req.configuration };
      agentData.capabilities = template.capabilities;
    } else {
      if (!req.type || !req.industry) {
        throw APIError.invalidArgument("type and industry are required when not using a template");
      }
      agentData.type = req.type;
      agentData.industry = req.industry;
    }

    const agent = await coreDB.queryRow<Agent>`
      INSERT INTO agents (name, description, type, industry, configuration, capabilities)
      VALUES (
        ${agentData.name}, 
        ${agentData.description || null}, 
        ${agentData.type}, 
        ${agentData.industry}, 
        ${JSON.stringify(agentData.configuration)},
        ${agentData.capabilities}
      )
      RETURNING *
    `;
    
    // Invalidate agent list cache
    await invalidateAgentListCache();
    
    return agent!;
  }
);
