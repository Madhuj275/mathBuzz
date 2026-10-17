"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { GameContent } from "@/components/game-content";
import { GameOver } from "@/components/game-over";
import { Start } from "@/components/start";
import { RetroGrid } from "@/components/ui/retro-grid";
import { useGame } from "@/hooks/use-game";

export default function Mathbuzz() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { gameStarted, gameOver } = useGame();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen justify-center items-center align-center dark:bg-background/80">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const screen = gameStarted ? (gameOver ? "game-over" : "game") : "start";

  return (
    <div className="flex min-h-screen justify-center items-center align-center z-0 dark:bg-background/80">
      {!gameOver && <RetroGrid />}
      <AnimatePresence mode="wait">
        {/* Fade only — translating this wrapper would re-anchor fixed children (GameOver backdrop) */}
        <motion.div
          key={screen}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex w-full justify-center"
        >
          {screen === "game-over" ? (
            <GameOver />
          ) : screen === "game" ? (
            <GameContent />
          ) : (
            <Start />
          )}
        </motion.div>
      </AnimatePresence>
      <GoogleAnalytics gaId="G-R20575MFZH" />
    </div>
  );
}
