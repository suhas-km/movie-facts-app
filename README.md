# Movie Facts App

A Next.js app that generates AI-powered interesting facts about your favorite movies.

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

1. **Clone and install**
   ```bash
   git clone https://github.com/suhas-km/movie-facts-app.git
   cd movie-facts-app
   npm install
   ```
2. GCP - Google OAuth:

    ``` Create a project in the Google Cloud Console and enable the Google+ API.
    - Go to the Google Cloud Console (https://console.cloud.google.com/)
    - Create a new project or select an existing project
    - Enable the Google+ API for your project
    - Create credentials (OAuth client ID)
    - Set the authorized redirect URI to http://localhost:3000/api/auth/callback/google
    - Copy the client ID and client secret
    - Add the client ID and client secret to the .env.local file
    ```

3. PostgreSQL Database:
    ``` Create a PostgreSQL database and add the connection string to the .env.local file.
    Docker command to create a PostgreSQL database:
    docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres

    DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
    ```

4. OpenAI API Key:
    ``` Get an API key from OpenAI and add it to the .env.local file.
    OPENAI_API_KEY=your_openai_api_key
    ```

5. Prisma:
    ``` Create a Prisma schema and add the connection string to the .env.local file.
    DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
    ```

6. NextAuth:
    ``` Create a NextAuth configuration file and add the connection string to the .env.local file.
    NEXTAUTH_URL="http://localhost:3000"
    ```

7. Run the app
    ```bash
    npm run dev
    ```

8. Access the app
    ```
   Open your browser and navigate to http://localhost:3000
    ```



## App Workflow

### 1. Login Screen
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
