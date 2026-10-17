"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import type { Guess } from "@/components/game-board";
import {
  ACTIVE_KEY_TIMEOUT_MS,
  EQUATION_LENGTH,
  MAX_GUESSES,
  VALID_KEYS,
} from "@/utils/constants";
import { evaluate, isCumulativeSolution } from "@/utils/evaluate";
import {
  computeKeyboardFeedback,
  type FeedbackColor,
  getFeedback,
} from "@/utils/feedback";
import { formatDateParam, getNumberOfTheDay } from "@/utils/numbers";
import {
  isDuplicateGuess,
  validateGuessLength,
  validateHasOperator,
} from "@/utils/validation";
import { getReferenceDate } from "@/utils/numbers";

export type GameMode = "normal" | "hard";

interface GameContextProps {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  gameStarted: boolean;
  guesses: Guess[];
  currentGuess: string;
  gameOver: boolean;
  gameWon: boolean;
  keyboardFeedback: Record<string, FeedbackColor>;
  handleKeyPress: (key: string) => void;
  startGame: () => void;
  resetGame: () => void;
  targetResult: number;
  targetEquation: string;
  activeKey: string;
  revealEquation: boolean;
  xpGained: number;
}

export const GameContext = createContext<GameContextProps | undefined>(
  undefined,
);

type ValidationResult =
  | { valid: true }
  | {
      valid: false;
      kind: "error" | "warning";
      title: string;
      description: string;
    };

const validateGuess = (
  currentGuess: string,
  guesses: Guess[],
  target: number,
): ValidationResult => {
  if (!validateGuessLength(currentGuess))
    return {
      valid: false,
      kind: "error",
      title: "Error",
      description: `Fill in all ${EQUATION_LENGTH} spaces of the equation!`,
    };
  if (isDuplicateGuess(currentGuess, guesses))
    return {
      valid: false,
      kind: "warning",
      title: "Oh no!",
      description: "You've already tried this guess. Try a different one!",
    };
  if (!validateHasOperator(currentGuess))
    return {
      valid: false,
      kind: "error",
      title: "Error",
      description:
        "The equation must contain at least one operator (+, -, *, /)!",
    };
  const result = evaluate(currentGuess);
  if (result === null)
    return {
      valid: false,
      kind: "error",
      title: "Error",
      description: "Try a valid equation!",
    };
  if (result !== target)
    return {
      valid: false,
      kind: "warning",
      title: "Warning",
      description: `Every guess must result in ${target}. Try again!`,
    };
  return { valid: true };
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<GameMode>("normal");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [keyboardFeedback, setKeyboardFeedback] = useState<
    Record<string, FeedbackColor>
  >({});
  const [activeKey, setActiveKey] = useState<string>("");
  const [revealEquation, setRevealEquation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Computed once on mount — avoids module-level side effects that run at
  // import time and can cause SSR/client hydration mismatches.
  const targetEquation = useMemo(() => getNumberOfTheDay(), []);
  const targetResult = useMemo(
    () => evaluate(targetEquation) ?? 0,
    [targetEquation],
  );

  useEffect(() => {
    if (!activeKey) return;
    const timer = setTimeout(() => setActiveKey(""), ACTIVE_KEY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [activeKey]);

  const startGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const processValidGuessFeedback = useCallback(
    (guess: string, currentGuessCount: number, isWinningGuess = false) => {
      const rawFeedback = getFeedback(guess, targetEquation);

      const feedback: FeedbackColor[] = rawFeedback.map((color) =>
        color === "outline" ? "destructive" : color,
      );

      const newGuess: Guess = {
        tiles: guess.split("").map((char, index) => ({
          value: char,
          color: feedback[index],
          index,
        })),
      };

      setGuesses((prev) => [...prev, newGuess]);
      setKeyboardFeedback((prev) =>
        computeKeyboardFeedback(prev, guess, feedback),
      );
      setCurrentGuess("");

      if (currentGuessCount + 1 >= MAX_GUESSES && !isWinningGuess) {
        setGameOver(true);
      }
    },
    [targetEquation],
  );

  const handleSubmitGuess = useCallback(() => {
    if (guesses.length >= MAX_GUESSES || gameOver) return;

    const validation = validateGuess(currentGuess, guesses, targetResult);
    if (!validation.valid) {
      toast[validation.kind](validation.title, {
        description: validation.description,
        position: "top-center",
      });
      return;
    }

    if (
      isCumulativeSolution(currentGuess.split(""), targetEquation.split(""))
    ) {
      processValidGuessFeedback(currentGuess, guesses.length, true);
      setGameWon(true);
      return;
    }

    processValidGuessFeedback(currentGuess, guesses.length);
  }, [
    currentGuess,
    gameOver,
    guesses,
    processValidGuessFeedback,
    targetEquation,
    targetResult,
  ]);

  const submitGameResult = useCallback(async () => {
    if (submitted) return;

    try {
      const res = await fetch("/api/leaderboard/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guesses: guesses.map((g) => g.tiles.map((t) => t.value).join("")),
          date: formatDateParam(getReferenceDate()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setXpGained(data.xpGained);
        setSubmitted(true);
        
        if (data.newBadges && data.newBadges.length > 0) {
          toast.success("New badge earned!", {
            description: data.newBadges.length === 1
              ? "You earned a new badge!"
              : `You earned ${data.newBadges.length} new badges!`,
          });
        }
      } else if (res.status === 409) {
        // Already submitted for this date
        setSubmitted(true);
      } else {
        console.error("Failed to submit game result");
      }
    } catch (error) {
      console.error("Error submitting game result:", error);
    }
  }, [guesses, submitted]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setGameWon(false);
    setKeyboardFeedback({});
    setActiveKey("");
    setRevealEquation(false);
    setSubmitted(false);
    setXpGained(0);
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver || gameWon) return;

      if (!gameStarted) {
        if (key === "Enter") startGame();
        return;
      }

      if (key === "Enter") {
        handleSubmitGuess();
      } else if (key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < EQUATION_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [
      currentGuess,
      gameOver,
      gameStarted,
      gameWon,
      handleSubmitGuess,
      startGame,
    ],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (VALID_KEYS.includes(event.key)) {
        handleKeyPress(event.key);
        setActiveKey(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  useEffect(() => {
    const canReveal = gameStarted && !gameOver && !gameWon;

    const handleRevealDown = (event: KeyboardEvent) => {
      if (typeof event.key !== "string" || event.key.toLowerCase() !== "e" || !canReveal) return;
      event.preventDefault();
      setRevealEquation(false);
    };

    const handleRevealUp = (event: KeyboardEvent) => {
      if (typeof event.key !== "string" || event.key.toLowerCase() !== "e") return;
      setRevealEquation(false);
    };

    const handleBlur = () => setRevealEquation(false);

    window.addEventListener("keydown", handleRevealDown);
    window.addEventListener("keyup", handleRevealUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleRevealDown);
      window.removeEventListener("keyup", handleRevealUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [gameStarted, gameOver, gameWon]);

  // Submit game result when game ends
  useEffect(() => {
    if ((gameOver || gameWon) && !submitted) {
      void submitGameResult();
    }
  }, [gameOver, gameWon, submitted, submitGameResult]);

  return (
    <GameContext.Provider
      value={{
        mode,
        setMode,
        gameStarted,
        guesses,
        currentGuess,
        gameOver,
        gameWon,
        keyboardFeedback,
        handleKeyPress,
        startGame,
        resetGame,
        targetResult,
        targetEquation,
        activeKey,
        revealEquation,
        xpGained,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
