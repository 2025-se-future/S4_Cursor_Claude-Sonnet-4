import { User } from "../models/users";
import { verifyGoogleToken, generateJwtToken } from "../middleware/auth";
import type {
  IUser,
  CreateUserData,
  UpdateUserData,
  UserDto,
  AuthResponse,
} from "../types/users";
import { transformUserToDto } from "../types/users";
import type { GoogleTokenPayload } from "../types/common";

/**
 * Service class for user-related business logic
 */
export class UserService {
  /**
   * Authenticate user with Google ID token
   */
  static async authenticateWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      // Verify Google ID token
      const googlePayload: GoogleTokenPayload = await verifyGoogleToken(
        idToken
      );

      if (!googlePayload.email_verified) {
        throw new Error("Email not verified with Google");
      }

      // Check if user exists
      let user = await User.findByGoogleId(googlePayload.sub);

      if (!user) {
        // Create new user if doesn't exist
        const userData: CreateUserData = {
          googleId: googlePayload.sub,
          email: googlePayload.email,
          name: googlePayload.name,
          picture: googlePayload.picture,
        };

        user = await this.createUser(userData);
      } else {
        // Update existing user's profile information
        const updateData: UpdateUserData = {
          name: googlePayload.name,
          picture: googlePayload.picture,
        };

        user = await this.updateUser(user._id, updateData);
      }

      // Generate JWT token
      const token = generateJwtToken(user._id, user.email);

      return {
        user: transformUserToDto(user),
        token,
      };
    } catch (error) {
      throw new Error(
        `Authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserDto | null> {
    try {
      const user = await User.findById(userId);
      return user ? transformUserToDto(user) : null;
    } catch (error) {
      throw new Error(
        `Failed to get user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<UserDto | null> {
    try {
      const user = await User.findByEmail(email);
      return user ? transformUserToDto(user) : null;
    } catch (error) {
      throw new Error(
        `Failed to get user by email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    updateData: UpdateUserData
  ): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Update fields
      if (updateData.name !== undefined) {
        user.name = updateData.name;
      }
      if (updateData.picture !== undefined) {
        user.picture = updateData.picture;
      }
      if (updateData.isActive !== undefined) {
        user.isActive = updateData.isActive;
      }

      return await user.save();
    } catch (error) {
      throw new Error(
        `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.isActive = false;
      await user.save();
    } catch (error) {
      throw new Error(
        `Failed to deactivate user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check if user exists by email
   */
  static async existsByEmail(email: string): Promise<boolean> {
    try {
      return await User.existsByEmail(email);
    } catch (error) {
      throw new Error(
        `Failed to check user existence: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get active users count
   */
  static async getActiveUsersCount(): Promise<number> {
    try {
      return await User.countDocuments({ isActive: true });
    } catch (error) {
      throw new Error(
        `Failed to get active users count: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
