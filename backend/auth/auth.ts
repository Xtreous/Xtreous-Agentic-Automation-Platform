import { authHandler } from "encore.dev/auth";
import { Header, Cookie, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { coreDB } from "../core/db";

const jwtSecret = secret("JWTSecret");

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
  subscriptionTier: string;
  organizationId?: string;
}

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    // Resolve the authenticated user from the authorization header or session cookie
    const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      // In a real implementation, you would verify the JWT token here
      // For now, we'll simulate token verification
      const decoded = verifyJWT(token, jwtSecret());
      
      // Get user from database
      const user = await coreDB.queryRow`
        SELECT id, email, role, subscription_tier, organization_id
        FROM users 
        WHERE id = ${decoded.userId} AND status = 'active'
      `;

      if (!user) {
        throw APIError.unauthenticated("user not found or inactive");
      }

      return {
        userID: user.id.toString(),
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        organizationId: user.organization_id?.toString()
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);

// Simple JWT verification function (in production, use a proper JWT library)
function verifyJWT(token: string, secret: string): { userId: string; exp: number } {
  // This is a simplified implementation
  // In production, use a proper JWT library like jsonwebtoken
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default auth;
