import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import { verifyPassword, hashPassword } from "./utils";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// Changes the current user's password.
export const changePassword = api<ChangePasswordRequest, ChangePasswordResponse>(
  { expose: true, method: "POST", path: "/auth/change-password", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Validate new password strength
    if (req.newPassword.length < 8) {
      throw APIError.invalidArgument("new password must be at least 8 characters long");
    }

    // Get current password hash
    const user = await coreDB.queryRow<{ password_hash: string }>`
      SELECT password_hash FROM users WHERE id = ${parseInt(auth.userID)}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    // Verify current password
    const isValidPassword = await verifyPassword(req.currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw APIError.invalidArgument("current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await hashPassword(req.newPassword);

    // Update password
    await coreDB.exec`
      UPDATE users SET 
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${parseInt(auth.userID)}
    `;

    return {
      message: "Password changed successfully"
    };
  }
);
