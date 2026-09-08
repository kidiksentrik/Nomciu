"use client";

import React from "react";
import { DailyMealLog, MealType } from "@/types";
import { MealCard } from "./MealCard";
import { Calendar, RotateCcw } from "lucide-react";

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
  // Format readable today string
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const meals: MealType[] = ["breakfast", "lunch", "dinner"];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-nomciu-charcoal/70 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-nomciu-peach" />
          <span>{todayLabel}</span>
        </div>

        <button
          onClick={onResetToday}
          title="Reset today's feeding records"
          className="text-[11px] text-nomciu-muted hover:text-rose-500 font-medium flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Day</span>
        </button>
      </div>

      {/* 3 Meal Cards */}
      <div className="space-y-3">
        {meals.map((type) => (
          <MealCard
            key={type}
            type={type}
            meal={dailyLog[type]}
            onToggle={() => onToggleMeal(type)}
          />
        ))}
      </div>
    </div>
  );
};
