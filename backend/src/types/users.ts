import { z } from "zod";
import type { Document } from "mongoose";

// User document interface for MongoDB
export interface IUser extends Document {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User data transfer object (without sensitive fields)
export type UserDto = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly picture?: string | undefined;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

// User creation data
export type CreateUserData = {
  readonly googleId: string;
  readonly email: string;
  readonly name: string;
  readonly picture?: string | undefined;
};

// User update data
export type UpdateUserData = {
  readonly name?: string;
  readonly picture?: string | undefined;
  readonly isActive?: boolean;
};

// Authentication request/response types
export type GoogleAuthRequest = {
  readonly idToken: string;
};

export type AuthResponse = {
  readonly user: UserDto;
  readonly token: string;
};

// Validation schemas using Zod
export const GoogleAuthRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const CreateUserSchema = z.object({
  googleId: z.string().min(1, "Google ID is required"),
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  picture: z.string().url("Invalid picture URL").optional(),
});

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .optional(),
  picture: z.string().url("Invalid picture URL").optional(),
  isActive: z.boolean().optional(),
});

// Type helpers
export type UserWithoutSensitiveFields = Omit<IUser, "googleId">;

export const transformUserToDto = (user: IUser): UserDto => ({
  id: user._id,
  email: user.email,
  name: user.name,
  picture: user.picture || undefined,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
