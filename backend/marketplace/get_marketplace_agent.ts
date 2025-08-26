import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { MarketplaceAgent } from "./types";

export interface GetMarketplaceAgentRequest {
  id: number;
}

// Retrieves a specific marketplace agent with full details.
export const getMarketplaceAgent = api<GetMarketplaceAgentRequest, MarketplaceAgent>(
  { expose: true, method: "GET", path: "/marketplace/agents/:id" },
  async (req) => {
    const agent = await coreDB.queryRow<{
      id: number;
      name: string;
      description: string;
      category: string;
      industry: string;
      workflow_types: string;
      pricing_model: string;
      pricing_details: string;
      rating: number;
      review_count: number;
      downloads: number;
      publisher_info: string;
      features: string;
      tags: string;
      screenshots: string;
      demo_url?: string;
      documentation_url?: string;
      support_url?: string;
      version: string;
      last_updated: Date;
      created_at: Date;
      is_featured: boolean;
      compatibility: string;
      requirements: string;
    }>`
      SELECT 
        id, name, description, category, industry, workflow_types,
        pricing_model, pricing_details, rating, review_count, downloads,
        publisher_info, features, tags, screenshots, demo_url,
        documentation_url, support_url, version, last_updated,
        created_at, is_featured, compatibility, requirements
      FROM marketplace_agents 
      WHERE id = ${req.id} AND status = 'active'
    `;

    if (!agent) {
      throw APIError.notFound("marketplace agent not found");
    }

    // Increment view count
    await coreDB.exec`
      UPDATE marketplace_agents 
      SET view_count = view_count + 1 
      WHERE id = ${req.id}
    `;

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      industry: typeof agent.industry === 'string' ? JSON.parse(agent.industry) : agent.industry,
      workflow_types: typeof agent.workflow_types === 'string' ? JSON.parse(agent.workflow_types) : agent.workflow_types,
      pricing_model: agent.pricing_model as any,
      pricing_details: typeof agent.pricing_details === 'string' ? JSON.parse(agent.pricing_details) : agent.pricing_details,
      rating: agent.rating,
      review_count: agent.review_count,
      downloads: agent.downloads,
      publisher: typeof agent.publisher_info === 'string' ? JSON.parse(agent.publisher_info) : agent.publisher_info,
      features: typeof agent.features === 'string' ? JSON.parse(agent.features) : agent.features,
      tags: typeof agent.tags === 'string' ? JSON.parse(agent.tags) : agent.tags,
      screenshots: typeof agent.screenshots === 'string' ? JSON.parse(agent.screenshots) : agent.screenshots,
      demo_url: agent.demo_url,
      documentation_url: agent.documentation_url,
      support_url: agent.support_url,
      version: agent.version,
      last_updated: agent.last_updated,
      created_at: agent.created_at,
      is_featured: agent.is_featured,
      compatibility: typeof agent.compatibility === 'string' ? JSON.parse(agent.compatibility) : agent.compatibility,
      requirements: typeof agent.requirements === 'string' ? JSON.parse(agent.requirements) : agent.requirements
    };
  }
);
