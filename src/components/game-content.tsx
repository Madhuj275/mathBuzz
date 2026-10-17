"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useMediaQuery } from "usehooks-ts";
import { BadgesDisplay } from "@/components/badges-display";
import { GameBoard } from "@/components/game-board";
import { Keyboard } from "@/components/keyboard";
import { Leaderboard } from "@/components/leaderboard";
import { Settings } from "@/components/settings";
import { Tutorial } from "@/components/tutorial";
import { UserStats } from "@/components/user-stats";
import { useGame } from "@/hooks/use-game";
import { Button } from "./ui/button";

export const GameContent = () => {
  const { theme, setTheme } = useTheme();
  const { gameWon, targetResult, targetEquation, revealEquation, xpGained } =
    useGame();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const ThemeToggleIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="z-10 flex w-full flex-col items-center gap-4 p-3 sm:gap-6 sm:p-4">
      <div className="w-full space-y-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <Tutorial />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            <ThemeToggleIcon />
          </Button>
          <h1
            className="px-1 text-foreground font-heading neon-glow text-2xl leading-none md:px-2 md:text-3xl lg:text-4xl xl:text-5xl"
            data-cy="title"
          >
            Mathbuzz
          </h1>
          <Settings />
          <Leaderboard />
          <BadgesDisplay />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/auth" })}
            aria-label="Logout"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
        <UserStats />
        <h2
          className="text-foreground text-sm lg:text-lg leading-none"
          data-cy="subtitle"
        >
          {revealEquation ? (
            <>
              The answer is{" "}
              <span
                className="bg-foreground text-background p-1"
                data-cy="revealed-equation"
              >
                {targetEquation} = {targetResult}
              </span>
            </>
          ) : isDesktop ? (
            <>
              Solve the hidden equation{" "}
              <span className="bg-foreground text-background p-1">
                that results in {targetResult}
              </span>
            </>
          ) : (
            <>
              Find the hidden calculation{" "}
              <span className="bg-foreground text-background p-1">
                that equals {targetResult}
              </span>
            </>
          )}
        </h2>
      </div>
      <GameBoard />
      <Keyboard />
      {gameWon && (
        <div
          className="mt-2 px-4 py-3 border-4 border-success bg-success/10 text-success font-bold text-center text-sm md:text-base animate-pop"
          data-cy="success-message"
        >
          You&apos;ve solved today&apos;s equation! <br />
          {xpGained > 0 && (
            <span className="text-neon-cyan">+{xpGained} XP earned! </span>
          )}
          <br />
          Come back tomorrow for a new challenge!
        </div>
      )}
    </div>
  );
};
