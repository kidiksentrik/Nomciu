"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Clock, RotateCcw, User } from "lucide-react";
import { MealItem, MealType } from "@/types";

interface MealCardProps {
  type: MealType;
  meal: MealItem;
  onToggle: () => void;
}

const MEAL_META: Record<
  MealType,
  { label: string; icon: string; timeWindow: string; color: string }
> = {
  breakfast: {
    label: "Breakfast",
    icon: "🥣",
    timeWindow: "Morning",
    color: "from-amber-400 to-orange-400",
  },
  lunch: {
    label: "Lunch",
    icon: "🐟",
    timeWindow: "Midday",
    color: "from-blue-400 to-cyan-400",
  },
  dinner: {
    label: "Dinner",
    icon: "🍖",
    timeWindow: "Evening",
    color: "from-indigo-400 to-purple-400",
  },
};

export const MealCard: React.FC<MealCardProps> = ({ type, meal, onToggle }) => {
  const meta = MEAL_META[type];

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl p-4 transition-all border ${
        meal.completed
          ? "bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border-emerald-200/80 shadow-sm"
          : "bg-white/90 hover:bg-white border-nomciu-border/80 shadow-card"
      }`}
    >
      {/* Completed indicator ribbon / glow */}
      {meal.completed && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          <div className="absolute transform rotate-45 bg-emerald-500 text-white text-[9px] font-bold py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
            FED
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        {/* Left: Icon & Meal Label */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-xs ${
              meal.completed
                ? "bg-emerald-100/80 border border-emerald-200"
                : "bg-nomciu-cream/70 border border-nomciu-border/60"
            }`}
          >
            {meta.icon}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-nomciu-charcoal text-base">
                {meta.label}
              </h3>
              <span className="text-[11px] text-nomciu-muted font-medium">
                ({meta.timeWindow})
              </span>
            </div>

            {/* Status & Feeder Details */}
            {meal.completed ? (
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{meal.fedAt || "Just now"}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700/80 font-medium">
                  <User className="w-3 h-3" />
                  <span>Fed by <strong className="font-bold text-emerald-900">{meal.fedBy || "Roommate"}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-nomciu-muted font-medium mt-1">
                Not fed yet
              </p>
            )}
          </div>
        </div>

        {/* Right Action: Checkmark Toggle or Undo Button */}
        <div className="flex items-center gap-1">
          {meal.completed ? (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onToggle}
              title="Undo feeding"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-100/60 hover:bg-rose-100 text-emerald-700 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 transition border border-emerald-200/50 hover:border-rose-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onToggle}
              title={`Mark ${meta.label} as fed`}
              className="w-10 h-10 rounded-xl bg-nomciu-cream/60 hover:bg-nomciu-peach hover:text-white text-nomciu-muted border border-nomciu-border/80 flex items-center justify-center transition shadow-xs group"
            >
              <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
