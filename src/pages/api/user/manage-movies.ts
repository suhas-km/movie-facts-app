import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { action, movieTitle, newMovies } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let currentMovies = user.favoriteMovie ? user.favoriteMovie.split(',').map(m => m.trim()) : [];

    if (action === "remove") {
      // Remove specific movie
      currentMovies = currentMovies.filter(movie => movie !== movieTitle);
    } else if (action === "add") {
      // Add new movies
      const moviesToAdd = newMovies.split(',').map((m: string) => m.trim()).filter((m: string) => m);
      // Avoid duplicates
      moviesToAdd.forEach((movie: string) => {
        if (!currentMovies.includes(movie)) {
          currentMovies.push(movie);
        }
      });
    }

    // Update user's favorite movies
    const updatedMovieString = currentMovies.length > 0 ? currentMovies.join(', ') : null;
    
    await prisma.user.update({
      where: { email: session.user.email },
      data: { favoriteMovie: updatedMovieString },
    });

    return res.status(200).json({ 
      message: "Movies updated successfully",
      movies: updatedMovieString 
    });
  } catch (error) {
    console.error("Error managing movies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
