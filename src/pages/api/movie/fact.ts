// src/pages/api/movie/fact.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { movieTitle, forceNew } = req.body;
  if (!movieTitle) {
    return res.status(400).json({ message: "Movie title is required" });
  }

  try {
    // Get the user's session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if we need to generate a new fact or can use cached one
    if (!forceNew) {
      const cachedFact = await prisma.movieFact.findUnique({
        where: {
          userId_movieTitle: {
            userId: user.id,
            movieTitle: movieTitle.trim(),
          },
        },
      });

      if (cachedFact) {
        return res.status(200).json({ 
          fact: cachedFact.fact,
          cached: true,
          remainingCalls: await getRemainingCalls(user.id)
        });
      }
    }

    // Check rate limit (10 calls per day)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (rateLimit && rateLimit.count >= 10) {
      return res.status(429).json({ 
        message: "Daily limit of 10 movie facts reached. Try again tomorrow!",
        remainingCalls: 0
      });
    }

    // Generate new fact using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a movie expert. Generate interesting, lesser-known facts about specific movies. Keep responses to 2-3 sentences and make them engaging and factual.",
        },
        {
          role: "user",
          content: `Tell me an interesting and lesser-known fact about the movie "${movieTitle}".`,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const fact = completion.choices[0]?.message?.content || "No fact generated.";

    // Update rate limit
    await prisma.rateLimit.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        userId: user.id,
        date: today,
        count: 1,
      },
    });

    // Cache the fact
    await prisma.movieFact.upsert({
      where: {
        userId_movieTitle: {
          userId: user.id,
          movieTitle: movieTitle.trim(),
        },
      },
      update: {
        fact: fact,
      },
      create: {
        userId: user.id,
        movieTitle: movieTitle.trim(),
        fact: fact,
      },
    });

    const remainingCalls = await getRemainingCalls(user.id);

    res.status(200).json({ 
      fact,
      cached: false,
      remainingCalls
    });
  } catch (error) {
    console.error("Movie fact API error:", error);
    res.status(500).json({ message: "Failed to generate movie fact" });
  } finally {
    await prisma.$disconnect();
  }
}

async function getRemainingCalls(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const rateLimit = await prisma.rateLimit.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: today,
      },
    },
  });
  
  return 10 - (rateLimit?.count || 0);
}
