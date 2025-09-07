import type { Response } from "express";
import { UserService } from "../services/users";
import type { AuthenticatedExpressRequest } from "../middleware/auth";
import type { ApiResponse } from "../types/common";
import type {
  GoogleAuthRequest,
  AuthResponse,
  UserDto,
  UpdateUserData,
} from "../types/users";
import { transformUserToDto } from "../types/users";

/**
 * Controller class for user-related HTTP endpoints
 */
export class UserController {
  /**
   * Authenticate user with Google ID token
   * POST /api/users/auth/google
   */
  static async authenticateWithGoogle(
    req: AuthenticatedExpressRequest,
    res: Response<ApiResponse<AuthResponse>>
  ): Promise<void> {
    try {
      const { idToken }: GoogleAuthRequest = req.body;

      const authResponse = await UserService.authenticateWithGoogle(idToken);

      res.status(200).json({
        success: true,
        message: "Authentication successful",
        data: authResponse,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  static async getCurrentUser(
    req: AuthenticatedExpressRequest,
    res: Response<ApiResponse<UserDto>>
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "UNAUTHORIZED",
        });
        return;
      }

      const user = await UserService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  static async updateCurrentUser(
    req: AuthenticatedExpressRequest,
    res: Response<ApiResponse<UserDto>>
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "UNAUTHORIZED",
        });
        return;
      }

      const updateData: UpdateUserData = req.body;

      const updatedUser = await UserService.updateUser(
        req.user.userId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: transformUserToDto(updatedUser),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Sign out user (client-side token invalidation)
   * POST /api/users/auth/signout
   */
  static async signOut(
    req: AuthenticatedExpressRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      // Note: JWT tokens are stateless, so we can't invalidate them server-side
      // without maintaining a blacklist. For this implementation, we rely on
      // client-side token removal. In production, consider implementing a token
      // blacklist with Redis for enhanced security.

      res.status(200).json({
        success: true,
        message:
          "Sign out successful. Please remove the token from client storage.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to sign out",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Deactivate current user account (soft delete)
   * DELETE /api/users/profile
   */
  static async deactivateCurrentUser(
    req: AuthenticatedExpressRequest,
    res: Response<ApiResponse>
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "UNAUTHORIZED",
        });
        return;
      }

      await UserService.deactivateUser(req.user.userId);

      res.status(200).json({
        success: true,
        message: "User account deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to deactivate user account",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Check if user exists by email (public endpoint)
   * GET /api/users/exists?email=user@example.com
   */
  static async checkUserExists(
    req: AuthenticatedExpressRequest,
    res: Response<ApiResponse<{ exists: boolean }>>
  ): Promise<void> {
    try {
      const { email } = req.query as { email: string };

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email parameter is required",
          error: "MISSING_EMAIL",
        });
        return;
      }

      const exists = await UserService.existsByEmail(email);

      res.status(200).json({
        success: true,
        message: "User existence check completed",
        data: { exists },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to check user existence",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
