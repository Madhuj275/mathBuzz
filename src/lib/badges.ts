// Badge definitions and utilities

export type BadgeType =
  | "first_challenge"
  | "seven_day_streak"
  | "thirty_challenges"
  | "hundred_challenges"
  | "level_5"
  | "level_10"
  | "level_25"
  | "perfect_week";

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  first_challenge: {
    type: "first_challenge",
    name: "First Steps",
    description: "Complete your first daily challenge",
    icon: "🎯",
  },
  seven_day_streak: {
    type: "seven_day_streak",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
  },
  thirty_challenges: {
    type: "thirty_challenges",
    name: "Dedicated Solver",
    description: "Complete 30 challenges",
    icon: "🏆",
  },
  hundred_challenges: {
    type: "hundred_challenges",
    name: "Century Club",
    description: "Complete 100 challenges",
    icon: "💎",
  },
  level_5: {
    type: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "⭐",
  },
  level_10: {
    type: "level_10",
    name: "Math Master",
    description: "Reach level 10",
    icon: "🌟",
  },
  level_25: {
    type: "level_25",
    name: "Grandmaster",
    description: "Reach level 25",
    icon: "👑",
  },
  perfect_week: {
    type: "perfect_week",
    name: "Perfect Week",
    description: "Win every challenge in a week",
    icon: "✨",
  },
};

// Check which badges should be awarded based on user stats
export function checkBadges(
  totalChallenges: number,
  currentStreak: number,
  level: number,
  earnedBadges: BadgeType[]
): BadgeType[] {
  const newBadges: BadgeType[] = [];
  
  if (totalChallenges >= 1 && !earnedBadges.includes("first_challenge")) {
    newBadges.push("first_challenge");
  }
  
  if (currentStreak >= 7 && !earnedBadges.includes("seven_day_streak")) {
    newBadges.push("seven_day_streak");
  }
  
  if (totalChallenges >= 30 && !earnedBadges.includes("thirty_challenges")) {
    newBadges.push("thirty_challenges");
  }
  
  if (totalChallenges >= 100 && !earnedBadges.includes("hundred_challenges")) {
    newBadges.push("hundred_challenges");
  }
  
  if (level >= 5 && !earnedBadges.includes("level_5")) {
    newBadges.push("level_5");
  }
  
  if (level >= 10 && !earnedBadges.includes("level_10")) {
    newBadges.push("level_10");
  }
  
  if (level >= 25 && !earnedBadges.includes("level_25")) {
    newBadges.push("level_25");
  }
  
  return newBadges;
}
