import { api, Cookie } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface LogoutResponse {
  message: string;
  session?: Cookie<"session">;
}

// Logs out the current user and clears session.
export const logout = api<void, LogoutResponse>(
  { expose: true, method: "POST", path: "/auth/logout", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    // In a real implementation, you might want to blacklist the token
    // or store logout events for security auditing
    
    return {
      message: "Successfully logged out",
      session: {
        value: "",
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        secure: true,
        sameSite: "Lax"
      }
    };
  }
);
