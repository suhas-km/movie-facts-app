// src/pages/api/user/update-movie.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";

const prisma = new PrismaClient();

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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get the user's session
    const session = await getServerSession(req, res, authOptions) as CustomSession | null;
    
    if (!session || !session.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { favoriteMovie } = req.body;

    if (!favoriteMovie || typeof favoriteMovie !== "string") {
      return res.status(400).json({ message: "Favorite movie is required" });
    }

    // Update the user's favorite movie in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { favoriteMovie: favoriteMovie.trim() },
    });

    return res.status(200).json({ 
      message: "Favorite movie updated successfully",
      favoriteMovie: updatedUser.favoriteMovie 
    });

  } catch (error) {
    console.error("Error updating favorite movie:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
