"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyMealLog } from "@/types";
import { getPetStatusHeadline } from "@/lib/utils";
import { Heart, Camera } from "lucide-react";

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
  const [imgError, setImgError] = useState(false);
  const status = getPetStatusHeadline(petName, dailyLog);

  useEffect(() => {
    setImgError(false);
  }, [petPhotoUrl]);

  // Count meals completed
  const completedMeals = [
    dailyLog.breakfast.completed,
    dailyLog.lunch.completed,
    dailyLog.dinner.completed,
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-2 flex flex-col items-center text-center">
      {/* Pet Avatar Container with Warm Radial Aura */}
      <div className="relative mb-3 group">
        {/* Decorative soft glow */}
        <div className="absolute -inset-2.5 bg-gradient-to-r from-red-500/20 via-nomciu-peach/25 to-amber-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

        {/* Avatar Ring */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-300 shadow-card"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-white relative border-2 border-white shadow-inner flex items-center justify-center">
            {petPhotoUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={petPhotoUrl}
                alt={petName}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-nomciu-charcoal select-none">
                <span className="text-5xl drop-shadow-xs">🐱</span>
                <span className="text-[10px] font-bold text-nomciu-muted mt-1 uppercase tracking-wider">
                  {petName}
                </span>
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
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-xs" />
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
            className={`text-base sm:text-lg font-extrabold tracking-tight ${
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
      <div className="flex items-center gap-2 mt-2">
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
