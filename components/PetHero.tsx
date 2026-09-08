"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DailyMealLog } from "@/types";
import { getPetStatusHeadline } from "@/lib/utils";
import { Sparkles, Heart } from "lucide-react";

interface PetHeroProps {
  petName: string;
  petPhotoUrl: string;
  dailyLog: DailyMealLog;
}

export const PetHero: React.FC<PetHeroProps> = ({
  petName,
  petPhotoUrl,
  dailyLog,
}) => {
  const status = getPetStatusHeadline(petName, dailyLog);

  // Count meals completed
  const completedMeals = [
    dailyLog.breakfast.completed,
    dailyLog.lunch.completed,
    dailyLog.dinner.completed,
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-2 flex flex-col items-center text-center">
      {/* Pet Avatar Container with Warm Radial Aura */}
      <div className="relative mb-3.5 group">
        {/* Decorative soft glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-nomciu-peach/20 via-nomciu-amber/15 to-nomciu-sage/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

        {/* Avatar Ring */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-nomciu-peach via-amber-300 to-nomciu-sage shadow-card"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-nomciu-cream relative border-2 border-white shadow-inner">
            {petPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={petPhotoUrl}
                alt={petName}
                className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-nomciu-peach-light select-none">
                🐾
              </div>
            )}
          </div>

          {/* Floating emotional badge */}
          <motion.div
            key={status.emoji}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-white shadow-md border border-nomciu-border flex items-center justify-center text-2xl select-none"
          >
            {status.emoji}
          </motion.div>
        </motion.div>
      </div>

      {/* Pet Name */}
      <div className="flex items-center gap-1.5 mb-1">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-nomciu-charcoal">
          {petName}
        </h2>
        <Heart className="w-5 h-5 text-nomciu-peach fill-nomciu-peach" />
      </div>

      {/* Dynamic Status Headline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status.headline}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="px-3"
        >
          <p
            className={`text-base sm:text-lg font-bold tracking-tight ${
              status.isAllCompleted
                ? "text-emerald-700"
                : "text-nomciu-charcoal/90"
            }`}
          >
            {status.headline}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Daily Progress Indicator (3 Soft Pills) */}
      <div className="flex items-center gap-2 mt-2.5">
        {[
          { label: "B", completed: dailyLog.breakfast.completed },
          { label: "L", completed: dailyLog.lunch.completed },
          { label: "D", completed: dailyLog.dinner.completed },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                item.completed
                  ? "w-8 bg-emerald-500 shadow-sm"
                  : "w-4 bg-nomciu-border"
              }`}
            />
          </div>
        ))}
        <span className="text-xs font-semibold text-nomciu-muted ml-1">
          {completedMeals}/3 Fed
        </span>
      </div>
    </div>
  );
};
