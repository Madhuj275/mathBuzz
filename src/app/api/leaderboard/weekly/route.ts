import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import moment from "moment";
import { submitGameResult } from "@/lib/game-submission";

export async function GET() {
  try {
    // Get the start of the current week (Monday)
    const weekStart = moment().utc().startOf("isoWeek").toDate();
    const weekEnd = moment().utc().endOf("isoWeek").toDate();

    const totals = await prisma.xPLog.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _sum: { amount: true },
    });

    const userIds = totals.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const usernames = new Map(users.map((user) => [user.id, user.username]));

    if (users.length !== userIds.length) {
      throw new Error("Weekly XP logs reference missing users");
    }

    const leaderboard = totals
      .map((entry) => {
        const name = usernames.get(entry.userId);
        if (name === undefined) {
          throw new Error(`Missing username for weekly leaderboard user ${entry.userId}`);
        }
        return {
          name,
          totalXP: entry._sum.amount ?? 0,
        };
      })
      .sort(
        (a, b) => b.totalXP - a.totalXP || a.name.localeCompare(b.name),
      )
      .slice(0, 50) // Top 50
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        totalXP: entry.totalXP,
      }));

    return NextResponse.json({ leaderboard, weekStart, weekEnd });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await submitGameResult(
      session.user.username,
      await req.json(),
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Weekly result submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
