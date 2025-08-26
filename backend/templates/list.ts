import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentTemplate } from "./types";

export interface ListTemplatesRequest {
  industry?: Query<string>;
  type?: Query<string>;
  search?: Query<string>;
}

export interface ListTemplatesResponse {
  templates: AgentTemplate[];
}

// Lists available agent templates.
export const list = api<ListTemplatesRequest, ListTemplatesResponse>(
  { expose: true, method: "GET", path: "/templates" },
  async (req) => {
    let whereConditions: string[] = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.industry) {
      whereConditions.push(`industry = $${paramIndex}`);
      params.push(req.industry);
      paramIndex++;
    }

    if (req.type) {
      whereConditions.push(`type = $${paramIndex}`);
      params.push(req.type);
      paramIndex++;
    }

    if (req.search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${req.search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const templates = await coreDB.rawQueryAll<AgentTemplate>(`
      SELECT * FROM agent_templates
      ${whereClause}
      ORDER BY name
    `, ...params);

    const parsedTemplates = templates.map(template => ({
      ...template,
      base_configuration: typeof template.base_configuration === 'string' 
        ? JSON.parse(template.base_configuration) 
        : template.base_configuration,
    }));

    return { templates: parsedTemplates };
  }
);
