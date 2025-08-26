import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentComparison, MarketplaceAgent } from "./types";

export interface CompareAgentsRequest {
  agent_ids: number[];
}

// Compares multiple marketplace agents side by side.
export const compareAgents = api<CompareAgentsRequest, AgentComparison>(
  { expose: true, method: "POST", path: "/marketplace/agents/compare" },
  async (req) => {
    if (req.agent_ids.length < 2 || req.agent_ids.length > 5) {
      throw APIError.invalidArgument("can compare between 2 and 5 agents");
    }

    // Get agents
    const agents = await coreDB.rawQueryAll<{
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
    }>(`
      SELECT 
        id, name, description, category, industry, workflow_types,
        pricing_model, pricing_details, rating, review_count, downloads,
        publisher_info, features, tags, screenshots, demo_url,
        documentation_url, support_url, version, last_updated,
        created_at, is_featured, compatibility, requirements
      FROM marketplace_agents 
      WHERE id = ANY($1) AND status = 'active'
      ORDER BY array_position($1, id)
    `, [req.agent_ids]);

    if (agents.length !== req.agent_ids.length) {
      throw APIError.notFound("one or more agents not found");
    }

    // Format agents
    const formattedAgents: MarketplaceAgent[] = agents.map(agent => ({
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
    }));

    // Build comparison matrix
    const comparisonMatrix = [
      {
        feature: 'Rating',
        values: formattedAgents.map(a => a.rating)
      },
      {
        feature: 'Reviews',
        values: formattedAgents.map(a => a.review_count)
      },
      {
        feature: 'Downloads',
        values: formattedAgents.map(a => a.downloads)
      },
      {
        feature: 'Category',
        values: formattedAgents.map(a => a.category)
      },
      {
        feature: 'Pricing Model',
        values: formattedAgents.map(a => a.pricing_model)
      },
      {
        feature: 'Monthly Price',
        values: formattedAgents.map(a => a.pricing_details.monthly_price || 'N/A')
      },
      {
        feature: 'Free Tier',
        values: formattedAgents.map(a => a.pricing_details.free_tier || false)
      },
      {
        feature: 'Publisher',
        values: formattedAgents.map(a => a.publisher.name)
      },
      {
        feature: 'Verified Publisher',
        values: formattedAgents.map(a => a.publisher.verified)
      },
      {
        feature: 'Version',
        values: formattedAgents.map(a => a.version)
      },
      {
        feature: 'Last Updated',
        values: formattedAgents.map(a => a.last_updated.toLocaleDateString())
      },
      {
        feature: 'Industries',
        values: formattedAgents.map(a => a.industry.join(', '))
      },
      {
        feature: 'Workflow Types',
        values: formattedAgents.map(a => a.workflow_types.join(', '))
      },
      {
        feature: 'Features Count',
        values: formattedAgents.map(a => a.features.length)
      }
    ];

    // Add feature comparison
    const allFeatures = new Set<string>();
    formattedAgents.forEach(agent => {
      agent.features.forEach(feature => allFeatures.add(feature));
    });

    Array.from(allFeatures).forEach(feature => {
      comparisonMatrix.push({
        feature: `Feature: ${feature}`,
        values: formattedAgents.map(agent => agent.features.includes(feature))
      });
    });

    return {
      agents: formattedAgents,
      comparison_matrix: comparisonMatrix
    };
  }
);
