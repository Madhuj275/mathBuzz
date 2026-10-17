"use client";

import { Trophy, Medal } from "lucide-react";
import { useEffect, useState } from "react";
import {
  XP_PER_CORRECT_GUESS,
  XP_PER_WIN,
  STREAK_BONUS_MULTIPLIER,
} from "@/lib/xp";
import { MAX_GUESSES } from "@/utils/constants";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalXP: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  weekStart: string;
  weekEnd: string;
}

export const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard/weekly");
        if (res.ok) {
          const leaderboardData = await res.json();
          setData(leaderboardData);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [open]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="size-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-5 text-gray-400" />;
    if (rank === 3) return <Medal className="size-5 text-amber-700" />;
    return <span className="text-foreground/60 text-sm w-5">{rank}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Leaderboard">
          <Trophy className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-foreground border-2">
        <DialogHeader>
          <DialogTitle className="text-foreground font-heading text-xl">
            Weekly Leaderboard
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground/70">
          Ranked by XP earned this UTC week (Monday–Sunday). Solve for{" "}
          {XP_PER_WIN} XP, plus {XP_PER_CORRECT_GUESS} XP per unused guess
          (maximum {MAX_GUESSES} guesses); unsuccessful games earn{" "}
          {XP_PER_CORRECT_GUESS} XP per valid guess. A streak of 7+ days
          multiplies game XP by {STREAK_BONUS_MULTIPLIER}. Ties are ordered
          alphabetically.
        </p>
        {loading ? (
          <div className="text-center py-8 text-foreground/60">Loading...</div>
        ) : data ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.leaderboard.length === 0 ? (
              <div className="text-center py-8 text-foreground/60">
                No entries yet this week. Be the first!
              </div>
            ) : (
              data.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-3 p-2 rounded bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1 font-mono text-sm">{entry.name}</div>
                  <div className="font-mono text-sm text-neon-cyan">{entry.totalXP} XP</div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-foreground/60">
            Failed to load leaderboard
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
