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

2. **Set up environment variables**
   Copy the .env.local.example file to .env.local and fill in the values.
   ```
   # .env.local
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   DATABASE_URL=your_postgresql_url
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```


5. **Access the app**
   Open your browser and navigate to http://localhost:3000


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
