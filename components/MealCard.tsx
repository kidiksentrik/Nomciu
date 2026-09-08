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
          ? "bg-gradient-to-br from-[#0F221B] via-[#132A21] to-[#0D1C16] border-emerald-500/40 shadow-lg"
          : "bg-[#161822] hover:bg-[#1B1D27] border-[#252836] shadow-md"
      }`}
    >
      {/* Completed indicator ribbon / glow */}
      {meal.completed && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
          <div className="absolute transform rotate-45 bg-emerald-500 text-white text-[9px] font-black py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
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
                ? "bg-emerald-500/20 border border-emerald-400/40"
                : "bg-[#1C1F2B] border border-[#2B2F40]"
            }`}
          >
            {meta.icon}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-white text-base">
                {meta.label}
              </h3>
              <span className="text-[11px] text-nomciu-muted font-medium">
                ({meta.timeWindow})
              </span>
            </div>

            {/* Status & Feeder Details */}
            {meal.completed ? (
              <div className="flex flex-col gap-0.5 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{meal.fedAt || "Just now"}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                  <User className="w-3 h-3" />
                  <span>Fed by <strong className="font-bold text-white">{meal.fedBy || "Roommate"}</strong></span>
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
              className="px-2.5 py-1.5 rounded-lg bg-[#163026] hover:bg-rose-950/60 text-emerald-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 transition border border-emerald-500/30 hover:border-rose-500/40"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onToggle}
              title={`Mark ${meta.label} as fed`}
              className="w-10 h-10 rounded-xl bg-[#1C1F2B] hover:bg-nomciu-peach hover:text-white text-stone-300 border border-[#2B2F40] flex items-center justify-center transition shadow-xs group"
            >
              <Check className="w-5 h-5 group-hover:scale-110 transition-transform text-stone-300 group-hover:text-white" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
