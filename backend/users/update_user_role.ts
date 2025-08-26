import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import { checkPermission } from "./permissions";

export interface UpdateUserRoleRequest {
  userId: number;
  role: string;
}

export interface UpdateUserRoleResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Updates a user's role (admin only).
export const updateUserRole = api<UpdateUserRoleRequest, UpdateUserRoleResponse>(
  { expose: true, method: "PUT", path: "/users/:userId/role", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user has permission to manage users
    await checkPermission(auth.userID, 'manage_users');

    // Validate role
    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(req.role)) {
      throw APIError.invalidArgument("invalid role");
    }

    // Prevent users from changing their own role
    if (auth.userID === req.userId.toString()) {
      throw APIError.invalidArgument("cannot change your own role");
    }

    // Get target user
    const targetUser = await coreDB.queryRow<{
      id: number;
      email: string;
      role: string;
      organization_id?: number;
    }>`
      SELECT id, email, role, organization_id 
      FROM users 
      WHERE id = ${req.userId}
    `;

    if (!targetUser) {
      throw APIError.notFound("user not found");
    }

    // If current user is not super admin, they can only manage users in their organization
    if (auth.role !== 'super_admin') {
      if (!auth.organizationId || targetUser.organization_id?.toString() !== auth.organizationId) {
        throw APIError.permissionDenied("can only manage users in your organization");
      }
      
      // Non-super admins cannot create super admins
      if (req.role === 'super_admin') {
        throw APIError.permissionDenied("insufficient permissions to assign super admin role");
      }
    }

    // Update user role
    const updatedUser = await coreDB.queryRow<{
      id: number;
      email: string;
      role: string;
    }>`
      UPDATE users SET 
        role = ${req.role},
        updated_at = NOW()
      WHERE id = ${req.userId}
      RETURNING id, email, role
    `;

    if (!updatedUser) {
      throw APIError.internal("failed to update user role");
    }

    return {
      message: "User role updated successfully",
      user: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        role: updatedUser.role
      }
    };
  }
);
