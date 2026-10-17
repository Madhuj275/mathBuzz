// XP and Level calculation utilities

export const XP_PER_CORRECT_GUESS = 5;
export const XP_PER_WIN = 50;
export const XP_PER_STREAK_DAY = 5;
export const STREAK_BONUS_MULTIPLIER = 1.5;

// Level formula: Level = floor(sqrt(totalXP / 100))
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

// XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return nextLevel * nextLevel * 100;
}

// Progress to next level (0-100)
export function levelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = currentLevel * currentLevel * 100;
  const nextLevelXP = xpForNextLevel(currentLevel);
  const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(100, Math.max(0, progress));
}

// Calculate XP for a game completion
export function calculateGameXP(
  guessesUsed: number,
  won: boolean,
  streakBonus: boolean = false
): number {
  let xp = 0;
  
  if (won) {
    // Base XP for winning
    xp += XP_PER_WIN;
    
    // Bonus for fewer guesses (6 guesses max, fewer = more bonus)
    const guessBonus = (6 - guessesUsed) * XP_PER_CORRECT_GUESS;
    xp += guessBonus;
  } else {
    // XP for correct guesses even if lost
    xp += guessesUsed * XP_PER_CORRECT_GUESS;
  }
  
  // Apply streak bonus if applicable
  if (streakBonus) {
    xp = Math.floor(xp * STREAK_BONUS_MULTIPLIER);
  }
  
  return xp;
}
