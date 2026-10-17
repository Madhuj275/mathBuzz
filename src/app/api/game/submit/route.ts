import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitGameResult } from "@/lib/game-submission";

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
    console.error("Game submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
