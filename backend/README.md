# MovieSwipe Backend - Authentication Implementation

This document describes the backend implementation for the "Manage Authentication" feature of the MovieSwipe application.

## Overview

The authentication system provides secure Google OAuth 2.0 authentication with JWT tokens for API access. Users can sign in with their Google account, and the system automatically creates new accounts for first-time users.

## Features Implemented

- ✅ Google OAuth 2.0 Authentication
- ✅ Automatic user registration
- ✅ JWT token generation and validation
- ✅ User profile management
- ✅ Account deactivation (soft delete)
- ✅ User existence checks
- ✅ Secure API endpoints with authentication middleware

## Architecture

### Layer Structure

```
src/
├── config/          # Configuration files
├── controllers/     # HTTP request handlers
├── middleware/      # Authentication, validation, logging
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Google OAuth 2.0 + JWT
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, Rate limiting

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                  | Description                       | Auth Required |
| ------ | ------------------------- | --------------------------------- | ------------- |
| POST   | `/api/users/auth/google`  | Authenticate with Google ID token | No            |
| POST   | `/api/users/auth/signout` | Sign out user                     | Yes           |

### User Profile Endpoints

| Method | Endpoint             | Description              | Auth Required |
| ------ | -------------------- | ------------------------ | ------------- |
| GET    | `/api/users/profile` | Get current user profile | Yes           |
| PUT    | `/api/users/profile` | Update user profile      | Yes           |
| DELETE | `/api/users/profile` | Deactivate user account  | Yes           |

### Public Endpoints

| Method | Endpoint                      | Description          | Auth Required |
| ------ | ----------------------------- | -------------------- | ------------- |
| GET    | `/api/users/exists?email=...` | Check if user exists | No            |
| GET    | `/health`                     | Health check         | No            |

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Google Cloud Console project with OAuth 2.0 configured

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/movieswipe

# Optional
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
FRONTEND_URL=http://localhost:3000
```

### Installation & Running

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Security Features

### Authentication & Authorization

- Google OAuth 2.0 token verification
- JWT tokens with configurable expiration
- Protected routes with authentication middleware
- User account validation on each request

### Input Validation

- Zod schema validation for all inputs
- Email format validation
- Required field validation
- String length limits

### Security Headers & Protection

- Helmet.js security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes by default)
- JSON body size limits (10MB)

### Data Protection

- Soft delete for user accounts
- No sensitive data in JWT tokens
- Password-less authentication via Google

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  googleId: string,        // Google User ID (indexed, unique)
  email: string,           // User email (indexed, unique, lowercase)
  name: string,            // Display name (max 100 chars)
  picture?: string,        // Profile picture URL
  isActive: boolean,       // Account status (indexed, default: true)
  createdAt: Date,         // Account creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

### Indexes

- `googleId` (unique)
- `email` (unique)
- `isActive`
- `{email: 1, isActive: 1}` (compound)
- `{googleId: 1, isActive: 1}` (compound)

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE or detailed error info"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication
- `VALIDATION_FAILED` - Input validation errors
- `USER_NOT_FOUND` - User account not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server-side errors

## API Documentation

Complete OpenAPI 3.0 specification available at:

- File: `docs/users.yml`
- Interactive docs: Import the YAML file into Swagger UI or Postman

## Example Usage

### 1. Authenticate with Google

```bash
curl -X POST http://localhost:3000/api/users/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-google-id-token"}'
```

Response:

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "60f5d4c2b8a1c72d8c8b4567",
      "email": "user@example.com",
      "name": "John Doe",
      "picture": "https://lh3.googleusercontent.com/a/default-user",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Access Protected Endpoint

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer your-jwt-token"
```

### 3. Update Profile

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}'
```

## Development Notes

### Code Quality

- TypeScript strict mode enabled
- ESLint and Prettier configured
- SOLID principles applied
- Clean architecture pattern
- Comprehensive error handling

### Testing

- Test files ready in `tests/` directory
- Use Jest for unit and integration tests
- API endpoint tests included

### Performance Considerations

- Database indexes for fast queries
- Connection pooling with Mongoose
- Rate limiting to prevent abuse
- Optimized JWT token size
- Efficient error handling

## Production Deployment

### Environment Setup

1. Set strong JWT secrets
2. Configure production MongoDB instance
3. Set up Google OAuth for production domain
4. Configure CORS for your frontend domain
5. Set appropriate rate limits
6. Enable MongoDB authentication
7. Use HTTPS in production

### Monitoring

- Health check endpoint available at `/health`
- Request logging enabled
- Error logging to console (configure log aggregation)
- MongoDB connection monitoring

## Next Steps

This authentication implementation provides the foundation for:

1. Group management features
2. Movie recommendation system
3. Voting functionality
4. Push notifications via Firebase

The modular architecture makes it easy to extend with additional features while maintaining security and performance standards.
