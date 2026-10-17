export const EQUATION_LENGTH = 6;
export const MAX_GUESSES = 6;
export const ACTIVE_KEY_TIMEOUT_MS = 100;
export const GAME_START_DATE = new Date(2022, 0, 0);
export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const VALID_KEYS = [
  "Enter",
  "Backspace",
  ...Array.from("0123456789+-*/"),
];
