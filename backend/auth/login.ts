import { api, APIError, Cookie } from "encore.dev/api";
import { coreDB } from "../core/db";
import { verifyPassword, generateJWT } from "./utils";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    subscriptionTier: string;
  };
  token: string;
  session?: Cookie<"session">;
}

// Authenticates a user and returns a JWT token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    // Get user from database
    const user = await coreDB.queryRow<{
      id: number;
      email: string;
      password_hash: string;
      first_name: string;
      last_name: string;
      role: string;
      subscription_tier: string;
      status: string;
    }>`
      SELECT id, email, password_hash, first_name, last_name, role, subscription_tier, status
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.unauthenticated("invalid email or password");
    }

    if (user.status !== 'active') {
      throw APIError.unauthenticated("account is not active");
    }

    // Verify password
    const isValidPassword = await verifyPassword(req.password, user.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("invalid email or password");
    }

    // Update last login
    await coreDB.exec`
      UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}
    `;

    // Generate JWT token
    const token = generateJWT({
      userId: user.id.toString(),
      email: user.email,
      role: user.role
    });

    const response: LoginResponse = {
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

    // Set session cookie if remember me is enabled
    if (req.rememberMe) {
      response.session = {
        value: token,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: true,
        sameSite: "Lax"
      };
    }

    return response;
  }
);
