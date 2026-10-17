import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { levelProgress } from "@/lib/xp";
import { type BadgeType } from "@/lib/badges";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
      include: { badges: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          totalXP: 0,
          level: 0,
          streak: 0,
          badges: [],
          progress: 0,
        },
        { status: 200 }
      );
    }

    const progress = levelProgress(user.totalXP);
    const badges = user.badges.map((b) => b.type as BadgeType);

    return NextResponse.json({
      totalXP: user.totalXP,
      level: user.level,
      streak: user.streak,
      badges,
      progress,
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
