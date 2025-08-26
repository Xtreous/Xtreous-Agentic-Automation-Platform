import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { coreDB } from "../core/db";
import type { AgentReview } from "./types";

export interface ListAgentReviewsRequest {
  agent_id: number;
  rating_filter?: Query<number>;
  sort_by?: Query<'created_at' | 'rating' | 'helpful_count'>;
  sort_order?: Query<'asc' | 'desc'>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface ListAgentReviewsResponse {
  reviews: AgentReview[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  rating_breakdown: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  average_rating: number;
}

// Lists reviews for a specific marketplace agent.
export const listAgentReviews = api<ListAgentReviewsRequest, ListAgentReviewsResponse>(
  { expose: true, method: "GET", path: "/marketplace/agents/:agent_id/reviews" },
  async (req) => {
    // Validate agent exists
    const agent = await coreDB.queryRow`
      SELECT id FROM marketplace_agents WHERE id = ${req.agent_id} AND status = 'active'
    `;
    if (!agent) {
      throw APIError.notFound("marketplace agent not found");
    }

    const limit = Math.min(req.limit || 20, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const sortBy = req.sort_by || 'created_at';
    const sortOrder = req.sort_order || 'desc';

    // Build WHERE conditions
    let whereConditions = [`agent_id = ${req.agent_id}`];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.rating_filter) {
      whereConditions.push(`rating = $${paramIndex}`);
      params.push(req.rating_filter);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Validate sort column
    const validSortColumns = ['created_at', 'rating', 'helpful_count'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM agent_reviews ${whereClause}`;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get reviews
    const reviewsQuery = `
      SELECT 
        id, agent_id, user_id, user_name, user_avatar, rating, title, content,
        helpful_count, verified_purchase, created_at, updated_at
      FROM agent_reviews 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const reviews = await coreDB.rawQueryAll<AgentReview>(reviewsQuery, ...params);

    // Get rating breakdown
    const ratingBreakdown = await coreDB.rawQueryAll<{ rating: number; count: number }>(`
      SELECT rating, COUNT(*) as count 
      FROM agent_reviews 
      WHERE agent_id = ${req.agent_id}
      GROUP BY rating 
      ORDER BY rating DESC
    `);

    const totalReviews = ratingBreakdown.reduce((sum, r) => sum + r.count, 0);
    const averageRating = totalReviews > 0 
      ? ratingBreakdown.reduce((sum, r) => sum + (r.rating * r.count), 0) / totalReviews 
      : 0;

    const formattedRatingBreakdown = [5, 4, 3, 2, 1].map(rating => {
      const breakdown = ratingBreakdown.find(r => r.rating === rating);
      const count = breakdown?.count || 0;
      return {
        rating,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      total,
      page,
      per_page: limit,
      total_pages: totalPages,
      rating_breakdown: formattedRatingBreakdown,
      average_rating: Math.round(averageRating * 10) / 10
    };
  }
);
