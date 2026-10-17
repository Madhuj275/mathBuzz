// Streak calculation utilities

import moment from "moment";

export function getTodayUTC(): Date {
  return moment().utc().startOf("day").toDate();
}

export function getYesterdayUTC(): Date {
  return moment().utc().subtract(1, "day").startOf("day").toDate();
}

// Check if a date is today (UTC)
export function isTodayUTC(date: Date): boolean {
  return moment(date).utc().startOf("day").isSame(moment().utc().startOf("day"), "day");
}

// Check if a date is yesterday (UTC)
export function isYesterdayUTC(date: Date): boolean {
  return moment(date).utc().startOf("day").isSame(moment().utc().subtract(1, "day").startOf("day"), "day");
}

// Calculate new streak based on last streak date and current completion
export function calculateNewStreak(
  currentStreak: number,
  lastStreakDate: Date | null
): number {
  const today = getTodayUTC();
  
  if (!lastStreakDate) {
    // First completion
    return 1;
  }
  
  if (isTodayUTC(lastStreakDate)) {
    // Already completed today, streak unchanged
    return currentStreak;
  }
  
  if (isYesterdayUTC(lastStreakDate)) {
    // Completed yesterday, increment streak
    return currentStreak + 1;
  }
  
  // Streak broken, start fresh
  return 1;
}
