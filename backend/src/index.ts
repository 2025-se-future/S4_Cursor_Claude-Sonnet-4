import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectToDatabase } from "./config/database";
import { validateEnvironment } from "./config/environment";
import { environment } from "./config/environment";
import { requestLogger } from "./middleware/logging";
import { errorHandler, notFoundHandler } from "./middleware/error";
import userRoutes from "./routes/users";

// Initialize environment validation
validateEnvironment();

const app = express();
const PORT = environment.port;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Configure for production
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: environment.rateLimitWindowMs,
  max: environment.rateLimitMax,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    error: "RATE_LIMIT_EXCEEDED",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "MovieSwipe API Server is running",
    timestamp: new Date().toISOString(),
    environment: environment.nodeEnv,
  });
});

// API routes
app.use("/api/users", userRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectToDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(
        `🚀 MovieSwipe API Server running on http://localhost:${PORT}`
      );
      console.log(`📚 Environment: ${environment.nodeEnv}`);
      console.log(`💾 MongoDB: ${environment.mongodbUri}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
