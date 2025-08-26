import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import { hashPassword, generateJWT } from "./utils";

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  role?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    subscriptionTier: string;
  };
  token: string;
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      throw APIError.invalidArgument("invalid email format");
    }

    // Validate password strength
    if (req.password.length < 8) {
      throw APIError.invalidArgument("password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await coreDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("user with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(req.password);

    // Create organization if provided
    let organizationId: number | null = null;
    if (req.organizationName) {
      const organization = await coreDB.queryRow<{ id: number }>`
        INSERT INTO organizations (name, subscription_tier)
        VALUES (${req.organizationName}, 'free')
        RETURNING id
      `;
      organizationId = organization?.id || null;
    }

    // Create user
    const user = await coreDB.queryRow<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      subscription_tier: string;
    }>`
      INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        subscription_tier, organization_id
      )
      VALUES (
        ${req.email}, ${hashedPassword}, ${req.firstName}, ${req.lastName},
        ${req.role || 'user'}, 'free', ${organizationId}
      )
      RETURNING id, email, first_name, last_name, role, subscription_tier
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user.id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionTier: user.subscription_tier
      },
      token
    };
  }
);
