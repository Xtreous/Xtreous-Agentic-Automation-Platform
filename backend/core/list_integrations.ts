import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { Integration } from "./types";

interface ListIntegrationsResponse {
  integrations: Integration[];
}

// Retrieves all available integrations for connecting external services.
export const listIntegrations = api<void, ListIntegrationsResponse>(
  { expose: true, method: "GET", path: "/integrations" },
  async () => {
    const integrations = await coreDB.queryAll<Integration>`
      SELECT * FROM integrations ORDER BY name
    `;
    
    return { integrations };
  }
);
