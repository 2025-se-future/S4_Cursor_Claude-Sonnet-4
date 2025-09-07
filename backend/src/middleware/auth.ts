import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { environment } from "../config/environment";
import type {
  JwtPayload,
  GoogleTokenPayload,
  AuthenticatedRequest,
} from "../types/common";
import { User } from "../models/users";

// Extend Express Request interface to include user
export interface AuthenticatedExpressRequest extends Request {
  user?: JwtPayload;
}

// Google OAuth2 client
const googleClient = new OAuth2Client(environment.googleClientId);

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (
  req: AuthenticatedExpressRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
        error: "UNAUTHORIZED",
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, environment.jwtSecret) as JwtPayload;

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: "UNAUTHORIZED",
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: "UNAUTHORIZED",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthentication = async (
  req: AuthenticatedExpressRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (token) {
      const decoded = jwt.verify(token, environment.jwtSecret) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we continue without authentication on error
    next();
  }
};

/**
 * Verify Google ID Token
 */
export const verifyGoogleToken = async (
  idToken: string
): Promise<GoogleTokenPayload> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: environment.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google ID token - no payload");
    }

    return {
      sub: payload.sub,
      email: payload.email || "",
      email_verified: payload.email_verified || false,
      name: payload.name || "",
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      iat: payload.iat || 0,
      exp: payload.exp || 0,
      aud: payload.aud as string,
      iss: payload.iss,
    };
  } catch (error) {
    throw new Error(
      `Failed to verify Google token: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Generate JWT token for user
 */
export const generateJwtToken = (userId: string, email: string): string => {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    userId,
    email,
  };

  return jwt.sign(payload, environment.jwtSecret, {
    expiresIn: environment.jwtExpiresIn,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token (utility function)
 */
export const verifyJwtToken = (token: string): JwtPayload => {
  return jwt.verify(token, environment.jwtSecret) as JwtPayload;
};
