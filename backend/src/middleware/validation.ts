import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ApiResponse } from "../types/common";

/**
 * Middleware to validate request body using Zod schema
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errorMessages = result.error.issues.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`
        );

        res.status(400).json({
          success: false,
          message: "Validation failed",
          error: errorMessages.join(", "),
        });
        return;
      }

      // Replace request body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error during validation",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  };
};

/**
 * Middleware to validate request query parameters using Zod schema
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): void => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errorMessages = result.error.issues.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`
        );

        res.status(400).json({
          success: false,
          message: "Query validation failed",
          error: errorMessages.join(", "),
        });
        return;
      }

      // Replace request query with validated data
      req.query = result.data as any;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error during query validation",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  };
};

/**
 * Middleware to validate request parameters using Zod schema
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): void => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errorMessages = result.error.issues.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`
        );

        res.status(400).json({
          success: false,
          message: "Parameter validation failed",
          error: errorMessages.join(", "),
        });
        return;
      }

      // Replace request params with validated data
      req.params = result.data as any;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error during parameter validation",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  };
};
