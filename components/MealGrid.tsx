"use client";

import React, { useState } from "react";
import { DailyMealLog, MealType } from "@/types";
import { MealCard } from "./MealCard";
import { Calendar, RotateCcw, ChevronDown, ChevronUp, History } from "lucide-react";

interface MealGridProps {
  dailyLog: DailyMealLog;
  onToggleMeal: (type: MealType) => void;
  onResetToday: () => void;
}

export const MealGrid: React.FC<MealGridProps> = ({
  dailyLog,
  onToggleMeal,
  onResetToday,
}) => {
  const [showAllCards, setShowAllCards] = useState(false);

  // Format readable today string
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const allMealTypes: MealType[] = ["breakfast", "lunch", "dinner"];
  const completedMealTypes = allMealTypes.filter((t) => dailyLog[t].completed);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-nomciu-charcoal/70 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-nomciu-peach" />
          <span>{todayLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle all meals schedule */}
          <button
            onClick={() => setShowAllCards((prev) => !prev)}
            className="text-[11px] text-nomciu-muted hover:text-nomciu-charcoal font-semibold flex items-center gap-0.5 transition"
          >
            <span>{showAllCards ? "Hide Schedule" : "All Meals"}</span>
            {showAllCards ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={onResetToday}
            title="Reset today's feeding records"
            className="text-[11px] text-nomciu-muted hover:text-rose-500 font-medium flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Case A: User clicked "All Meals" -> Show all 3 cards */}
      {showAllCards ? (
        <div className="space-y-2.5">
          {allMealTypes.map((type) => (
            <MealCard
              key={type}
              type={type}
              meal={dailyLog[type]}
              onToggle={() => onToggleMeal(type)}
            />
          ))}
        </div>
      ) : (
        /* Case B: Default Clean Mode */
        <div>
          {completedMealTypes.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 px-1 mb-1 text-[11px] font-bold text-nomciu-muted uppercase tracking-wider">
                <History className="w-3 h-3 text-nomciu-sage-dark" />
                <span>Today&apos;s Feedings ({completedMealTypes.length}/3)</span>
              </div>
              {completedMealTypes.map((type) => (
                <MealCard
                  key={type}
                  type={type}
                  meal={dailyLog[type]}
                  onToggle={() => onToggleMeal(type)}
                />
              ))}
            </div>
          ) : (
            /* Nothing fed yet today -> Ultra-clean peaceful state! */
            <div className="py-3 px-4 rounded-2xl bg-white/60 border border-nomciu-border/60 text-center">
              <p className="text-xs text-nomciu-muted font-medium">
                No meals recorded yet today.
              </p>
              <p className="text-[11px] text-nomciu-muted/80 mt-0.5">
                Tap the button above as soon as you feed! 🥣
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
