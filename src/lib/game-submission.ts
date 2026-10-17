import { prisma } from "@/lib/prisma";
import { checkBadges, type BadgeType } from "@/lib/badges";
import { calculateNewStreak, getTodayUTC } from "@/lib/streak";
import { calculateGameXP, calculateLevel } from "@/lib/xp";
import { evaluate, isCumulativeSolution } from "@/utils/evaluate";
import { getNumberOfTheDayForDate } from "@/utils/numbers";
import { EQUATION_LENGTH, MAX_GUESSES } from "@/utils/constants";

type SubmissionResponse = {
  status: number;
  body: Record<string, unknown>;
};

const errorResponse = (status: number, error: string): SubmissionResponse => ({
  status,
  body: { error },
});

const parseSubmissionDate = (value: unknown): Date | null => {
  if (value === undefined) return getTodayUTC();
  if (typeof value !== "string") return null;

  const match =
    value.match(/^(\d{4})(\d{2})(\d{2})$/) ??
    value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.+)?$/);
  if (!match) return null;
  if (value.includes("T") && !Number.isFinite(Date.parse(value))) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }
  return date;
};

export async function submitGameResult(
  username: string,
  input: unknown,
): Promise<SubmissionResponse> {
  if (!input || typeof input !== "object") {
    return errorResponse(400, "Invalid input");
  }

  const body = input as { guesses?: unknown; date?: unknown };
  if (
    !Array.isArray(body.guesses) ||
    body.guesses.length < 1 ||
    body.guesses.length > MAX_GUESSES ||
    !body.guesses.every((guess) => typeof guess === "string")
  ) {
    return errorResponse(400, "Invalid guesses");
  }

  const gameDateUTC = parseSubmissionDate(body.date);
  if (!gameDateUTC) return errorResponse(400, "Invalid date");

  const guesses = body.guesses as string[];
  if (
    guesses.some(
      (guess) =>
        guess.length !== EQUATION_LENGTH ||
        !/[+\-*/]/.test(guess) ||
        evaluate(guess) === null,
    ) ||
    new Set(guesses).size !== guesses.length
  ) {
    return errorResponse(400, "Invalid guesses");
  }

  const targetEquation = getNumberOfTheDayForDate(gameDateUTC);
  const targetResult = evaluate(targetEquation);
  if (
    targetResult === null ||
    guesses.some((guess) => evaluate(guess) !== targetResult)
  ) {
    return errorResponse(400, "Guesses must evaluate to the daily target");
  }

  const winningGuessIndex = guesses.findIndex((guess) =>
    isCumulativeSolution(guess.split(""), targetEquation.split("")),
  );
  const won = winningGuessIndex !== -1;
  if (
    (won && winningGuessIndex !== guesses.length - 1) ||
    (!won && guesses.length !== MAX_GUESSES)
  ) {
    return errorResponse(400, "Game result does not match the submitted guesses");
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { badges: true, answers: true },
  });

  if (!user) return errorResponse(404, "User not found");

  const existingAnswer = user.answers.find(
    (answer) => answer.date.getTime() === gameDateUTC.getTime(),
  );
  if (existingAnswer) {
    return errorResponse(409, "Already submitted for this date");
  }

  const newStreak = calculateNewStreak(user.streak, user.lastStreakDate);
  const streakBonus = newStreak >= 7;
  const xpGained = calculateGameXP(guesses.length, won, streakBonus);
  const newTotalXP = user.totalXP + xpGained;
  const newLevel = calculateLevel(newTotalXP);
  const totalChallenges = user.answers.length + 1;
  const earnedBadgeTypes = user.badges.map(
    (badge) => badge.type as BadgeType,
  );
  const newBadgeTypes = checkBadges(
    totalChallenges,
    newStreak,
    newLevel,
    earnedBadgeTypes,
  );

  const result = await prisma.$transaction(async (tx) => {
    await tx.answer.create({
      data: {
        userId: user.id,
        date: gameDateUTC,
        puzzleIndex: 0,
        correct: won,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        streak: newStreak,
        lastStreakDate: gameDateUTC,
      },
    });

    for (const badgeType of newBadgeTypes) {
      await tx.badge.create({
        data: { userId: user.id, type: badgeType },
      });
    }

    await tx.xPLog.create({
      data: {
        userId: user.id,
        amount: xpGained,
        reason: won ? "daily_correct" : "daily_attempt",
      },
    });

    return updatedUser;
  });

  return {
    status: 200,
    body: {
      success: true,
      won,
      xpGained,
      newTotalXP: result.totalXP,
      newLevel: result.level,
      newStreak: result.streak,
      newBadges: newBadgeTypes,
    },
  };
}
