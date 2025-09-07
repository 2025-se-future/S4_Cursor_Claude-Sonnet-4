import { z } from "zod";

// Common response type for API responses
export type ApiResponse<T = unknown> = {
  readonly success: boolean;
  readonly message: string;
  readonly data?: T;
  readonly error?: string;
};

// Pagination types
export type PaginationParams = {
  readonly page: number;
  readonly limit: number;
};

export type PaginatedResponse<T> = {
  readonly data: T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
};

// JWT Payload type
export type JwtPayload = {
  readonly userId: string;
  readonly email: string;
  readonly iat?: number;
  readonly exp?: number;
};

// Google ID Token Payload
export type GoogleTokenPayload = {
  readonly sub: string; // Google User ID
  readonly email: string;
  readonly email_verified: boolean;
  readonly name: string;
  readonly picture?: string | undefined;
  readonly given_name?: string | undefined;
  readonly family_name?: string | undefined;
  readonly iat: number;
  readonly exp: number;
  readonly aud: string;
  readonly iss: string;
};

// Request with authenticated user
export type AuthenticatedRequest = {
  readonly user: JwtPayload;
};

// Validation schemas using Zod
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");
