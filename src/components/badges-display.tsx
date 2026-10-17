"use client";

import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { BADGE_DEFINITIONS, type BadgeType } from "@/lib/badges";

export const BadgesDisplay = () => {
  const [open, setOpen] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          setEarnedBadges(data.badges || []);
        }
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Badges">
          <Award className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-foreground border-2">
        <DialogHeader>
          <DialogTitle className="text-foreground font-heading text-xl">
            Your Badges
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {Object.values(BADGE_DEFINITIONS).map((badge) => {
            const earned = earnedBadges.includes(badge.type);
            return (
              <div
                key={badge.type}
                className={`p-3 rounded border-2 transition-all ${
                  earned
                    ? "bg-foreground/10 border-neon-cyan"
                    : "bg-foreground/5 border-foreground/20 opacity-50"
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="font-heading text-sm text-foreground">
                  {badge.name}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  {badge.description}
                </div>
                {earned && (
                  <div className="text-xs text-neon-cyan mt-2 font-bold">
                    ✓ Earned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
