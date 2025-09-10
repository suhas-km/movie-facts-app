# Movie Facts App

🚀 **[Live Demo](https://movie-facts-app.vercel.app/)** | 📖 **[Technical Deep Dive](https://medium.com/@suhaskm/how-i-integrated-google-oauth-2-0-with-next-js-supabase-and-openai-881450cc9c6c)**

A Next.js app showcasing a robust OAuth flow with consent management, user info retrieval, and AI-powered content generation. 

It handles user authentication via Google, fetches user profile information, and leverages OpenAI's completions API to generate fresh movie trivia on every page refresh.

## Features

- 🔐 **Google OAuth** - Sign in with your Google account
- 🎬 **Movie Storage** - Save your favorite movie to the database
- 🤖 **AI Facts** - Get fresh movie trivia powered by OpenAI
- 🔄 **Dynamic Content** - New facts generated on every page refresh

## Tech Stack

- **Next.js 15** - React framework with Turbopack for faster development
- **NextAuth.js** - Authentication with Google OAuth integration
- **Prisma** - Type-safe database ORM with migrations
- **PostgreSQL** - Production database (Supabase)
- **OpenAI GPT-3.5-turbo** - AI-powered movie fact generation
- **TypeScript** - Type safety across the entire application
- **Tailwind CSS** - Utility-first CSS framework
- **DOMPurify** - XSS protection and input sanitization

## 🚀 Fascinating Technical Implementations

### 1. **Smart Caching System**
- **Problem**: OpenAI API calls are expensive and have rate limits
- **Solution**: Intelligent fact caching with `MovieFact` model using composite unique keys (`userId_movieTitle`)
- **Result**: Facts are generated once per user per movie, then served instantly from cache

### 2. **Advanced Rate Limiting**
- **Database-backed rate limiting**: Custom `RateLimit` model tracks daily API usage per user
- **Graceful degradation**: Users get 10 AI calls per day, with clear remaining count display
- **Smart fallback**: Cached facts don't count against rate limits

### 3. **Security-First Architecture**
- **Input sanitization**: `isomorphic-dompurify` prevents XSS attacks
- **Validation layers**: Custom `validateMovieTitle()` function blocks malicious patterns
- **Request size limits**: Middleware enforces 1MB request limit
- **Secure cookies**: Production-ready cookie configuration with `httpOnly` and `sameSite`

### 4. **Robust OAuth Implementation**
- **Session enhancement**: Custom callbacks enrich sessions with user data from database
- **Error handling**: Graceful fallbacks for database connection issues
- **Environment-aware**: Different cookie security settings for development vs production

### 5. **Modern UI/UX Patterns**
- **Progressive enhancement**: Loading states, optimistic updates, and smooth transitions
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Semantic HTML, proper ARIA labels, and keyboard navigation
- **Visual feedback**: Real-time status indicators for cached vs fresh content

### 6. **Database Design Excellence**
- **Normalized schema**: Proper foreign key relationships with cascade deletes
- **Composite indexes**: Optimized queries for user-movie fact lookups
- **Audit trails**: `createdAt` and `updatedAt` timestamps on all models
- **Data integrity**: Unique constraints prevent duplicate facts and rate limit entries

## Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/suhas-km/movie-facts-app.git
cd movie-facts-app

# Install base dependencies
npm install

# Install additional required packages
npm install next-auth @next-auth/prisma-adapter
npm install prisma @prisma/client
npm install openai
```

### 2. Set Up PostgreSQL Database

```bash
# Start PostgreSQL using Docker
docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres

# You should see a container ID if successful
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Database Connection
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set Up Google OAuth with GCP

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI in the OAuth consent screen
7. Copy the generated Client ID and Client Secret to your `.env.local` file

### 5. Initialize Prisma

Prisma is a database ORM that provides a type-safe way to interact with the database. It also provides a migration system that allows you to define your database schema in a type-safe way.

```bash
# Initialize Prisma in your project
npx prisma init

# Generate Prisma client
npx prisma generate

# Create and apply initial database migration
npx prisma migrate dev --name init_nextauth_models
```

You should see output similar to:
```bash
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "localhost:5432"

Applying migration `20250801195507_init_nextauth_models`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20250801195507_init_nextauth_models/
    └─ migration.sql

Your database is now in sync with your schema.
```

### 6. Run the Application

```bash
npm run dev
```

### 7. Access the App

Open your browser and navigate to http://localhost:3000

## 🔧 Technical Challenges Solved

### OAuth Development Issues
**Problem**: Production OAuth worked perfectly, but local development failed with redirect URI mismatches.

**Root Causes Identified**:
1. Missing `http://localhost:3000/api/auth/callback/google` in Google Cloud Console
2. `NEXTAUTH_URL` environment variable mismatch between local and production
3. Database connection string differences between environments
4. Port conflicts on local development server

**Solutions Implemented**:
- Added localhost redirect URI to Google OAuth configuration
- Environment-specific `NEXTAUTH_URL` configuration
- Unified database connection (Supabase for both local and production)
- Process cleanup scripts for port conflicts

### Rate Limiting Architecture
**Challenge**: Prevent API abuse while maintaining good user experience.

**Implementation**:
```typescript
// Daily rate limit tracking with composite unique key
model RateLimit {
  userId String
  date   String // YYYY-MM-DD format
  count  Int    @default(0)
  @@unique([userId, date])
}
```

**Benefits**:
- Automatic daily reset without cron jobs
- Atomic increment operations prevent race conditions
- User-specific limits with clear remaining count display

### Input Sanitization Pipeline
**Security Challenge**: Prevent XSS attacks while allowing legitimate movie titles.

**Multi-layer Protection**:
1. **DOMPurify sanitization**: Removes HTML tags and malicious content
2. **Pattern validation**: Blocks suspicious JavaScript patterns
3. **Length limits**: Prevents buffer overflow attacks
4. **Character filtering**: Removes dangerous angle brackets

```typescript
export function sanitizeInput(input: string): string {
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  return sanitized.trim().replace(/[<>]/g, '').substring(0, 200);
}
```

### Middleware Implementation
**Performance & Security**: Custom Next.js middleware for request processing.

**Features**:
- Request size validation (1MB limit)
- Rate limiting headers
- Path-based routing optimization
- Static asset exclusion for performance

## 🏗️ Architecture Highlights

### Database Schema Design
- **NextAuth integration**: Full compatibility with NextAuth.js adapter
- **Relational integrity**: Proper foreign keys with cascade deletes
- **Performance optimization**: Strategic indexes on frequently queried fields
- **Extensibility**: Schema designed for future feature additions

### API Route Organization
```
/api/
├── auth/[...nextauth].ts     # OAuth configuration
├── movie/fact.ts             # AI fact generation with caching
├── user/
│   ├── update-movie.ts       # Movie preference updates
│   ├── manage-movies.ts      # Add/remove multiple movies
│   └── rate-limit-status.ts  # Real-time usage tracking
```

### Frontend State Management
- **Session-based state**: NextAuth session integration
- **Optimistic updates**: Immediate UI feedback before API confirmation
- **Error boundaries**: Graceful error handling with user-friendly messages
- **Loading states**: Progressive enhancement with skeleton screens

## 🐛 Troubleshooting Guide

### Common Development Issues

**OAuth "Invalid Redirect URI" Error**:
```bash
# Add to Google Cloud Console OAuth settings:
http://localhost:3000/api/auth/callback/google
```

**Database Connection Issues**:
```bash
# Verify environment variables
echo $DATABASE_URL
# Should match your Supabase connection string
```

**Port Already in Use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Then restart dev server
npm run dev
```

**Prisma Client Issues**:
```bash
# Regenerate Prisma client after schema changes
npx prisma generate
# Reset database if needed
npx prisma migrate reset --force
```

**Rate Limit Testing**:
```bash
# Check current rate limit status
curl -X GET http://localhost:3000/api/user/rate-limit-status \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## App Screenshots

### 1. Login Screens
![Login Screen](images/image1.png)

### 2. Movie Selection
![Movie Selection](images/image2.png)

### 3. Dashboard with Movie Facts
![Dashboard](images/image3.png)

### 4. Fact Generation
![Fact Generation](images/image4.png)

## Testing

To reset the database and test the full workflow:
```bash
npx prisma migrate reset --force
```

## 📚 Learn More

- **[Technical Article](https://medium.com/@suhaskm/how-i-integrated-google-oauth-2-0-with-next-js-supabase-and-openai-881450cc9c6c)** - Deep dive into the OAuth integration challenges and solutions
- **[Live Application](https://movie-facts-app.vercel.app/)** - Try the app yourself

## License
Apache License 2.0

## Author
Suhas K M
