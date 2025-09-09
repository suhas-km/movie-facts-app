// src/pages/about/about.tsx
import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AboutPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-lg border border-gray-700 shadow-xl">
        <h1 className="text-4xl font-bold mb-6 text-gray-100">About Cinemate</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Technical Architecture</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Cinemate is a full-stack Next.js application that demonstrates modern web development practices
              including authentication, database integration, and AI-powered features.
            </p>
            
            <h3 className="text-xl font-medium text-gray-200 mt-6">Frontend</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Framework:</span> Next.js with TypeScript</li>
              <li><span className="font-semibold">Styling:</span> Tailwind CSS for responsive design</li>
              <li><span className="font-semibold">Rendering:</span> Hybrid rendering with static optimization</li>
              <li><span className="font-semibold">Image Optimization:</span> Next.js Image component with automatic WebP conversion</li>
              <li><span className="font-semibold">Authentication UI:</span> NextAuth.js session management</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-200 mt-6">Backend</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">API Routes:</span> Next.js serverless functions</li>
              <li><span className="font-semibold">Authentication:</span> NextAuth.js with Google OAuth provider</li>
              <li><span className="font-semibold">Database:</span> PostgreSQL with Prisma ORM</li>
              <li><span className="font-semibold">AI Integration:</span> OpenAI API for movie fact generation</li>
              <li><span className="font-semibold">Type Safety:</span> TypeScript with custom type declarations</li>
            </ul>
            
            <h3 className="text-xl font-medium text-gray-200 mt-6">Deployment</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Hosting:</span> Vercel for Next.js optimization</li>
              <li><span className="font-semibold">Database:</span> Supabase PostgreSQL with connection pooling</li>
              <li><span className="font-semibold">Environment:</span> Serverless architecture</li>
              <li><span className="font-semibold">CI/CD:</span> Automatic deployments from GitHub</li>
            </ul>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Key Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li><span className="font-semibold">Authentication:</span> Secure login with Google OAuth 2.0</li>
            <li><span className="font-semibold">User Profiles:</span> Store and display user's favorite movie</li>
            <li><span className="font-semibold">AI Movie Facts:</span> Generate interesting facts about movies using OpenAI</li>
            <li><span className="font-semibold">Responsive Design:</span> Optimized for all device sizes</li>
            <li><span className="font-semibold">Type Safety:</span> End-to-end TypeScript implementation</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Data Flow Architecture</h2>
          <p className="text-gray-300 mb-4">
            The application follows a modern data flow architecture:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-gray-300">
            <li>User authenticates via NextAuth.js and Google OAuth</li>
            <li>Session data is stored in encrypted JWT tokens or database</li>
            <li>User data is persisted in PostgreSQL via Prisma ORM</li>
            <li>API routes handle data operations with proper authentication checks</li>
            <li>React components consume and display data with TypeScript type safety</li>
            <li>OpenAI API generates dynamic content based on user preferences</li>
          </ol>
        </div>
        
        <div className="flex justify-center mt-8">
          <Link href="/" className="bg-gray-800 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-600">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}