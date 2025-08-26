import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentTemplate } from "./types";

export interface GetTemplateRequest {
  id: number;
}

// Retrieves a specific agent template.
export const get = api<GetTemplateRequest, AgentTemplate>(
  { expose: true, method: "GET", path: "/templates/:id" },
  async (req) => {
    const template = await coreDB.queryRow<AgentTemplate>`
      SELECT * FROM agent_templates WHERE id = ${req.id}
    `;

    if (!template) {
      throw APIError.notFound("template not found");
    }

    template.base_configuration = typeof template.base_configuration === 'string' 
      ? JSON.parse(template.base_configuration) 
      : template.base_configuration;

    return template;
  }
);
