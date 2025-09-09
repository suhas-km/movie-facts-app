import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    const usedCalls = rateLimit?.count || 0;
    const remainingCalls = Math.max(0, 10 - usedCalls);

    return res.status(200).json({ 
      remainingCalls,
      usedCalls,
      totalCalls: 10
    });
  } catch (error) {
    console.error("Error fetching rate limit status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
