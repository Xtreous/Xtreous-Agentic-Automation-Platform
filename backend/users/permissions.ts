import { APIError } from "encore.dev/api";
import { coreDB } from "../core/db";

export interface Permission {
  action: string;
  resource?: string;
  conditions?: Record<string, any>;
}

// Role-based permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'user': [
    'view_own_profile',
    'update_own_profile',
    'view_own_agents',
    'create_agents',
    'update_own_agents',
    'view_own_tasks',
    'create_tasks',
    'update_own_tasks'
  ],
  'admin': [
    'view_own_profile',
    'update_own_profile',
    'view_own_agents',
    'create_agents',
    'update_own_agents',
    'view_own_tasks',
    'create_tasks',
    'update_own_tasks',
    'manage_users',
    'view_organization_data',
    'manage_organization_agents',
    'manage_organization_tasks',
    'view_analytics'
  ],
  'super_admin': [
    'view_own_profile',
    'update_own_profile',
    'view_own_agents',
    'create_agents',
    'update_own_agents',
    'view_own_tasks',
    'create_tasks',
    'update_own_tasks',
    'manage_users',
    'view_organization_data',
    'manage_organization_agents',
    'manage_organization_tasks',
    'view_analytics',
    'manage_all_users',
    'manage_all_organizations',
    'view_system_data',
    'manage_system_settings'
  ]
};

export async function checkPermission(userId: string, action: string): Promise<void> {
  const user = await coreDB.queryRow<{ role: string; status: string }>`
    SELECT role, status FROM users WHERE id = ${parseInt(userId)}
  `;

  if (!user) {
    throw APIError.unauthenticated("user not found");
  }

  if (user.status !== 'active') {
    throw APIError.unauthenticated("user account is not active");
  }

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  
  if (!userPermissions.includes(action)) {
    throw APIError.permissionDenied(`insufficient permissions for action: ${action}`);
  }
}

export async function hasPermission(userId: string, action: string): Promise<boolean> {
  try {
    await checkPermission(userId, action);
    return true;
  } catch {
    return false;
  }
}

export function getUserPermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}
