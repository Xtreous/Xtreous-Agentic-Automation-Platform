import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import type { UserProfile } from "./get_profile";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  preferences?: Record<string, any>;
}

// Updates the current user's profile information.
export const updateProfile = api<UpdateProfileRequest, UserProfile>(
  { expose: true, method: "PUT", path: "/auth/profile", auth: true },
  async (req) => {
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
      UPDATE users SET
        first_name = COALESCE(${req.firstName}, first_name),
        last_name = COALESCE(${req.lastName}, last_name),
        preferences = COALESCE(${req.preferences ? JSON.stringify(req.preferences) : null}, preferences),
        updated_at = NOW()
      FROM organizations o
      WHERE users.id = ${parseInt(auth.userID)}
      AND users.organization_id = o.id
      RETURNING 
        users.id, users.email, users.first_name, users.last_name, users.role,
        users.subscription_tier, users.organization_id, o.name as organization_name,
        users.preferences, users.created_at, users.last_login_at
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
