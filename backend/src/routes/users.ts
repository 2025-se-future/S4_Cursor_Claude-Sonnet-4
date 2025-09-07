import { Router } from "express";
import { UserController } from "../controllers/users";
import { authenticateToken } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validation";
import { GoogleAuthRequestSchema, UpdateUserSchema } from "../types/users";
import { z } from "zod";

const router = Router();

// Email validation schema for query parameter
const EmailQuerySchema = z.object({
  email: z.string().email("Invalid email format"),
});

/**
 * Authentication Routes
 */

// POST /api/users/auth/google - Authenticate with Google ID token
router.post(
  "/auth/google",
  validateBody(GoogleAuthRequestSchema),
  UserController.authenticateWithGoogle
);

// POST /api/users/auth/signout - Sign out user
router.post("/auth/signout", authenticateToken, UserController.signOut);

/**
 * User Profile Routes (Require Authentication)
 */

// GET /api/users/profile - Get current user profile
router.get("/profile", authenticateToken, UserController.getCurrentUser);

// PUT /api/users/profile - Update current user profile
router.put(
  "/profile",
  authenticateToken,
  validateBody(UpdateUserSchema),
  UserController.updateCurrentUser
);

// DELETE /api/users/profile - Deactivate current user account
router.delete(
  "/profile",
  authenticateToken,
  UserController.deactivateCurrentUser
);

/**
 * Public Routes (No Authentication Required)
 */

// GET /api/users/exists?email=user@example.com - Check if user exists by email
router.get(
  "/exists",
  validateQuery(EmailQuerySchema),
  UserController.checkUserExists
);

export default router;
