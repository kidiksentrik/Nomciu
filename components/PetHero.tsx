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
  onEditPet?: () => void;
}

export const PetHero: React.FC<PetHeroProps> = ({
  petName,
  petPhotoUrl,
  dailyLog,
  onEditPet,
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
    <div className="w-full max-w-md mx-auto px-4 pt-2 pb-2 flex flex-col items-center text-center">
      {/* Pet Avatar Container with Radiant Ambient Aura */}
      <div className="relative mb-3 group">
        {/* Neon soft ambient glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-rose-500/30 via-orange-500/25 to-amber-500/30 rounded-full blur-2xl opacity-85 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        {/* Avatar Ring */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-400 shadow-2xl"
        >
          <div
            onClick={onEditPet}
            className={`w-full h-full rounded-full overflow-hidden bg-[#161822] relative border-2 border-[#252836] shadow-inner flex items-center justify-center ${
              onEditPet ? "cursor-pointer" : ""
            }`}
            title={onEditPet ? "Click to change photo" : undefined}
          >
            {petPhotoUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={petPhotoUrl}
                alt={petName}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#181A24] text-stone-200 select-none">
                <span className="text-5xl drop-shadow-md">🐱</span>
                <span className="text-[10px] font-black text-nomciu-muted mt-1 uppercase tracking-wider">
                  {petName}
                </span>
              </div>
            )}
          </div>

          {/* Camera Edit Button Badge */}
          {onEditPet && (
            <button
              onClick={onEditPet}
              title="Change Pet Photo"
              className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-[#181A24] border border-[#2D3142] hover:border-nomciu-peach text-stone-200 hover:text-white flex items-center justify-center shadow-xl transition active:scale-95 group/cam z-10"
            >
              <Camera className="w-4 h-4 text-nomciu-peach group-hover/cam:scale-110 transition-transform" />
            </button>
          )}

          {/* Floating emotional badge */}
          <motion.div
            key={status.emoji}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-[#181A24] shadow-xl border border-[#2D3142] flex items-center justify-center text-2xl select-none z-10"
          >
            {status.emoji}
          </motion.div>
        </motion.div>
      </div>

      {/* Pet Name with Optional Edit Trigger */}
      <div
        onClick={onEditPet}
        className={`flex items-center gap-1.5 mb-1 ${
          onEditPet ? "cursor-pointer hover:opacity-90 transition" : ""
        }`}
        title={onEditPet ? "Click to edit" : undefined}
      >
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
          {petName}
        </h2>
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-xs" />
      </div>

      {/* Dynamic Status Headline with High Contrast */}
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
            className={`text-base sm:text-lg font-black tracking-tight ${
              status.isAllCompleted
                ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                : "text-stone-100"
            }`}
          >
            {status.headline}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Daily Progress Indicator (3 Dark Pills with Neon Glow) */}
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
                  ? "w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                  : "w-4 bg-[#252836]"
              }`}
            />
          </div>
        ))}
        <span className="text-xs font-bold text-stone-300 ml-1">
          {completedMeals}/3 Fed
        </span>
      </div>
    </div>
  );
};
