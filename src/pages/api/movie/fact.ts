// src/pages/api/movie/fact.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CustomSession extends Session {
  user: {
    id: string;
    favoriteMovie?: string | null;
  } & Session["user"];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get the user's session
    const session = await getServerSession(req, res, authOptions) as CustomSession | null;
    
    if (!session || !session.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the user's favorite movie from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { favoriteMovie: true },
    });

    if (!user?.favoriteMovie) {
      return res.status(400).json({ message: "No favorite movie set" });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }

    // Generate a movie fact using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a movie expert who provides interesting, fun, and lesser-known facts about movies. Keep your responses concise (2-3 sentences max) and engaging."
        },
        {
          role: "user",
          content: `Tell me an interesting and lesser-known fact about the movie "${user.favoriteMovie}". Make it engaging and fun!`
        }
      ],
      max_tokens: 150,
      temperature: 0.8, // Higher temperature for more creative/varied responses
    });

    const movieFact = completion.choices[0]?.message?.content?.trim();

    if (!movieFact) {
      return res.status(500).json({ message: "Failed to generate movie fact" });
    }

    return res.status(200).json({ 
      fact: movieFact,
      movie: user.favoriteMovie 
    });

  } catch (error) {
    console.error("Error generating movie fact:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error && error.message.includes('API key')) {
      return res.status(500).json({ message: "OpenAI API configuration error" });
    }
    
    return res.status(500).json({ message: "Failed to generate movie fact" });
  } finally {
    await prisma.$disconnect();
  }
}
