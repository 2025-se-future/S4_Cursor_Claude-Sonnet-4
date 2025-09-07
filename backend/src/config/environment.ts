import dotenv from "dotenv";

dotenv.config();

export const environment = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Google Authentication
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",

  // Database Configuration
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/movieswipe",

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP to 100 requests per windowMs
} as const;

// Validation for required environment variables
export const validateEnvironment = (): void => {
  const requiredEnvVars = ["GOOGLE_CLIENT_ID", "JWT_SECRET", "MONGODB_URI"];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missingEnvVars.join(", ")}`
    );
    console.warn(
      "Some features may not work correctly. Please set these variables in your .env file."
    );
  }
};
