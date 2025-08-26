import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier: string;
  organizationId?: string;
  organizationName?: string;
  preferences: Record<string, any>;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Retrieves the current user's profile information.
export const getProfile = api<void, UserProfile>(
  { expose: true, method: "GET", path: "/auth/profile", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    const user = await coreDB.queryRow<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      subscription_tier: string;
      organization_id?: number;
      organization_name?: string;
      preferences: string;
      created_at: Date;
      last_login_at?: Date;
    }>`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, 
        u.subscription_tier, u.organization_id, o.name as organization_name,
        u.preferences, u.created_at, u.last_login_at
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ${parseInt(auth.userID)}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    return {
      id: user.id.toString(),
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      subscriptionTier: user.subscription_tier,
      organizationId: user.organization_id?.toString(),
      organizationName: user.organization_name,
      preferences: typeof user.preferences === 'string' 
        ? JSON.parse(user.preferences) 
        : user.preferences,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    };
  }
);
