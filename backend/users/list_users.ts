import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import { checkPermission } from "./permissions";

export interface ListUsersRequest {
  role?: Query<string>;
  status?: Query<string>;
  organizationId?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  subscriptionTier: string;
  organizationId?: string;
  organizationName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Lists users with optional filtering (admin only).
export const listUsers = api<ListUsersRequest, ListUsersResponse>(
  { expose: true, method: "GET", path: "/users", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user has permission to list users
    await checkPermission(auth.userID, 'manage_users');

    const limit = Math.min(req.limit || 50, 100);
    const offset = req.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    // Build WHERE conditions
    let whereConditions: string[] = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    if (req.role) {
      whereConditions.push(`u.role = $${paramIndex}`);
      params.push(req.role);
      paramIndex++;
    }

    if (req.status) {
      whereConditions.push(`u.status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }

    if (req.organizationId) {
      whereConditions.push(`u.organization_id = $${paramIndex}`);
      params.push(req.organizationId);
      paramIndex++;
    }

    // If user is not super admin, only show users from their organization
    if (auth.role !== 'super_admin' && auth.organizationId) {
      whereConditions.push(`u.organization_id = $${paramIndex}`);
      params.push(parseInt(auth.organizationId));
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM users u 
      ${whereClause}
    `;
    const countResult = await coreDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get users
    const usersQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.status,
        u.subscription_tier, u.organization_id, o.name as organization_name,
        u.created_at, u.last_login_at
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const users = await coreDB.rawQueryAll<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      status: string;
      subscription_tier: string;
      organization_id?: number;
      organization_name?: string;
      created_at: Date;
      last_login_at?: Date;
    }>(usersQuery, ...params);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        subscriptionTier: user.subscription_tier,
        organizationId: user.organization_id?.toString(),
        organizationName: user.organization_name,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      })),
      total,
      page,
      per_page: limit,
      total_pages: totalPages
    };
  }
);
