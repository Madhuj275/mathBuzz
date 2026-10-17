"use client";

import { Trophy, Flame, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { levelProgress } from "@/lib/xp";
import { BADGE_DEFINITIONS, type BadgeType } from "@/lib/badges";

interface UserStats {
  totalXP: number;
  level: number;
  streak: number;
  badges: BadgeType[];
  progress: number;
}

export const UserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 text-xs text-foreground/60">
        <span>Loading stats...</span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex gap-4 text-xs text-foreground/80 items-center">
      <div className="flex items-center gap-1">
        <Star className="size-3 text-neon-cyan" />
        <span>Lvl {stats.level}</span>
      </div>
      <div className="flex items-center gap-1">
        <Trophy className="size-3 text-neon-magenta" />
        <span>{stats.totalXP} XP</span>
      </div>
      <div className="flex items-center gap-1">
        <Flame className="size-3 text-orange-500" />
        <span>{stats.streak} day streak</span>
      </div>
      {stats.badges.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-neon-cyan">{stats.badges.length} badges</span>
        </div>
      )}
    </div>
  );
};
