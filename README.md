# Movie Facts App

A Next.js app showcasing a robust OAuth flow with consent management, user info retrieval, and AI-powered content generation. 

It handles user authentication via Google, fetches user profile information, and leverages OpenAI's completions API to generate fresh movie trivia on every page refresh.

## Features

- 🔐 **Google OAuth** - Sign in with your Google account
- 🎬 **Movie Storage** - Save your favorite movie to the database
- 🤖 **AI Facts** - Get fresh movie trivia powered by OpenAI
- 🔄 **Dynamic Content** - New facts generated on every page refresh

## Tech Stack

- **Next.js** - React framework
- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **OpenAI** - AI-powered facts

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

## License
Apache License 2.0

## Author
Suhas K M
