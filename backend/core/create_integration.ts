import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { Integration } from "./types";

interface CreateIntegrationRequest {
  name: string;
  type: 'gmail' | 'sheets' | 'jira' | 'crm' | 'zendesk' | 'hubspot';
  configuration: any;
}

// Creates a new integration with external services.
export const createIntegration = api<CreateIntegrationRequest, Integration>(
  { expose: true, method: "POST", path: "/integrations" },
  async (req) => {
    const integration = await coreDB.queryRow<Integration>`
      INSERT INTO integrations (name, type, configuration)
      VALUES (${req.name}, ${req.type}, ${JSON.stringify(req.configuration)})
      RETURNING *
    `;
    
    return integration!;
  }
);
