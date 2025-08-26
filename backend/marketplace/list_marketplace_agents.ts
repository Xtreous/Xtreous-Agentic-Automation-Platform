import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { MarketplaceAgent } from "./types";

export interface ListMarketplaceAgentsRequest {
  search?: Query<string>;
  category?: Query<string>;
  industry?: Query<string>;
  workflow_type?: Query<string>;
  pricing_model?: Query<string>;
  min_rating?: Query<number>;
  sort_by?: Query<'rating' | 'downloads' | 'created_at' | 'name' | 'price'>;
  sort_order?: Query<'asc' | 'desc'>;
  featured_only?: Query<boolean>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListMarketplaceAgentsResponse {
  agents: MarketplaceAgent[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  filters: {
    categories: { id: string; name: string; count: number }[];
    industries: { id: string; name: string; count: number }[];
    workflow_types: { id: string; name: string; count: number }[];
    pricing_models: { id: string; name: string; count: number }[];
  };
}

// Lists marketplace agents with advanced filtering and search.
export const listMarketplaceAgents = api<ListMarketplaceAgentsRequest, ListMarketplaceAgentsResponse>(
  { expose: true, method: "GET", path: "/marketplace/agents" },
  async (req) => {
    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const sortBy = req.sort_by || 'rating';
    const sortOrder = req.sort_order || 'desc';

    // Build WHERE conditions
    let whereConditions: string[] = ['ma.status = \'active\''];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.search) {
      whereConditions.push(`(ma.name ILIKE $${paramIndex} OR ma.description ILIKE $${paramIndex} OR array_to_string(ma.tags, ' ') ILIKE $${paramIndex})`);
      params.push(`%${req.search}%`);
      paramIndex++;
    }

    if (req.category) {
      whereConditions.push(`ma.category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }

    if (req.industry) {
      whereConditions.push(`$${paramIndex} = ANY(ma.industry)`);
      params.push(req.industry);
      paramIndex++;
    }

    if (req.workflow_type) {
      whereConditions.push(`$${paramIndex} = ANY(ma.workflow_types)`);
      params.push(req.workflow_type);
      paramIndex++;
    }

    if (req.pricing_model) {
      whereConditions.push(`ma.pricing_model = $${paramIndex}`);
      params.push(req.pricing_model);
      paramIndex++;
    }

    if (req.min_rating) {
      whereConditions.push(`ma.rating >= $${paramIndex}`);
      params.push(req.min_rating);
      paramIndex++;
    }

    if (req.featured_only) {
      whereConditions.push('ma.is_featured = true');
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Validate sort column
    const validSortColumns = ['rating', 'downloads', 'created_at', 'name'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'rating';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM marketplace_agents ma 
      ${whereClause}
    `;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get agents
    const agentsQuery = `
      SELECT 
        ma.id, ma.name, ma.description, ma.category, ma.industry, ma.workflow_types,
        ma.pricing_model, ma.pricing_details, ma.rating, ma.review_count, ma.downloads,
        ma.publisher_info, ma.features, ma.tags, ma.screenshots, ma.demo_url,
        ma.documentation_url, ma.support_url, ma.version, ma.last_updated,
        ma.created_at, ma.is_featured, ma.compatibility, ma.requirements
      FROM marketplace_agents ma
      ${whereClause}
      ORDER BY ma.${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

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
    }>(agentsQuery, ...params);

    // Parse JSON fields and format response
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

    // Get filter options
    const [categories, industries, workflowTypes, pricingModels] = await Promise.all([
      coreDB.rawQueryAll<{ category: string; count: number }>(`
        SELECT category, COUNT(*) as count 
        FROM marketplace_agents 
        WHERE status = 'active' 
        GROUP BY category 
        ORDER BY count DESC
      `),
      coreDB.rawQueryAll<{ industry: string; count: number }>(`
        SELECT UNNEST(industry) as industry, COUNT(*) as count 
        FROM marketplace_agents 
        WHERE status = 'active' 
        GROUP BY industry 
        ORDER BY count DESC
      `),
      coreDB.rawQueryAll<{ workflow_type: string; count: number }>(`
        SELECT UNNEST(workflow_types) as workflow_type, COUNT(*) as count 
        FROM marketplace_agents 
        WHERE status = 'active' 
        GROUP BY workflow_type 
        ORDER BY count DESC
      `),
      coreDB.rawQueryAll<{ pricing_model: string; count: number }>(`
        SELECT pricing_model, COUNT(*) as count 
        FROM marketplace_agents 
        WHERE status = 'active' 
        GROUP BY pricing_model 
        ORDER BY count DESC
      `)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      agents: formattedAgents,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
      filters: {
        categories: categories.map(c => ({ id: c.category, name: c.category, count: c.count })),
        industries: industries.map(i => ({ id: i.industry, name: i.industry, count: i.count })),
        workflow_types: workflowTypes.map(w => ({ id: w.workflow_type, name: w.workflow_type, count: w.count })),
        pricing_models: pricingModels.map(p => ({ id: p.pricing_model, name: p.pricing_model, count: p.count }))
      }
    };
  }
);
