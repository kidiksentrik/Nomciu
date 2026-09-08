"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, CheckCircle2, ChevronDown, Sparkles, X, RotateCcw, Clock, User, Flame } from "lucide-react";
import { DailyMealLog, MealType } from "@/types";
import { getCurrentTimeWindow, getNextPendingMeal } from "@/lib/utils";
import { triggerFeedConfetti } from "./Confetti";

interface FeedNowButtonProps {
  dailyLog: DailyMealLog;
  feederName: string;
  onFeed: (mealType: MealType) => Promise<any>;
  onUndoMeal?: (mealType: MealType) => Promise<any>;
}

export const FeedNowButton: React.FC<FeedNowButtonProps> = ({
  dailyLog,
  feederName,
  onFeed,
  onUndoMeal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const windowInfo = getCurrentTimeWindow();
  const currentMealItem = dailyLog[windowInfo.currentMeal];
  const isCurrentMealFed = currentMealItem.completed;

  const nextPendingMeal = getNextPendingMeal(dailyLog);
  const isAllFed = [
    dailyLog.breakfast.completed,
    dailyLog.lunch.completed,
    dailyLog.dinner.completed,
  ].every(Boolean);

  const mealLabels: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  };

  const mealEmojis: Record<MealType, string> = {
    breakfast: "🥣",
    lunch: "🐟",
    dinner: "🍖",
  };

  const handleFeed = async (type: MealType) => {
    // 1. Mobile Physical Haptic Feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch (e) {
        // Haptics not supported or permitted
      }
    }

    setIsSubmitting(true);
    try {
      await onFeed(type);
      triggerFeedConfetti();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to feed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async (type: MealType) => {
    if (!onUndoMeal) return;
    setIsSubmitting(true);
    try {
      await onUndoMeal(type);
    } catch (err) {
      console.error("Failed to undo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 my-4">
      {/* 1. If Current Time-Window Meal is NOT fed yet: Show Irresistible 3D BIG RED BUTTON */}
      {!isCurrentMealFed ? (
        <div className="relative">
          {/* Pulsing Tactical Halo Aura */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600/40 via-rose-500/30 to-orange-500/40 rounded-3xl blur-xl opacity-80 animate-pulse pointer-events-none" />

          {/* Mechanical Button Outer Chassis */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-stone-200 to-stone-400 dark:from-stone-700 dark:to-stone-900 shadow-inner flex items-center gap-2">
            
            {/* The BIG RED BUTTON Cap */}
            <motion.button
              onClick={() => handleFeed(windowInfo.currentMeal)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ y: 5, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="relative flex-1 h-20 rounded-2xl bg-gradient-to-b from-red-500 via-rose-600 to-red-700 text-white font-black tracking-wide uppercase border-t border-red-300/40 border-b-[6px] border-red-900 active:border-b-[2px] shadow-[0_12px_24px_-4px_rgba(220,38,38,0.55),0_6px_12px_-2px_rgba(185,28,28,0.4)] active:shadow-[0_4px_12px_rgba(220,38,38,0.4)] transition-all flex items-center justify-between px-5 select-none overflow-hidden group"
            >
              {/* Glossy Candy Highlight Arc on top */}
              <div className="absolute top-1.5 left-4 right-4 h-3.5 bg-gradient-to-b from-white/40 via-white/15 to-transparent rounded-full pointer-events-none" />

              {/* Left Content: Badge + Giant Label */}
              <div className="flex flex-col items-start leading-tight text-left z-10 py-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest text-red-100 bg-red-900/40 px-2 py-0.5 rounded-full mb-1 border border-red-400/20">
                  <Flame className="w-3 h-3 fill-amber-300 text-amber-300 animate-bounce" />
                  PRESS TO FEED
                </span>
                <span className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  FEED {windowInfo.label.toUpperCase()} NOW
                </span>
                <span className="text-[11px] font-semibold text-red-100/90 normal-case tracking-normal">
                  {windowInfo.windowDescription}
                </span>
              </div>

              {/* Right Big Emoji / Icon Badge */}
              <div className="relative z-10 w-12 h-12 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                {windowInfo.emoji}
              </div>
            </motion.button>

            {/* Quick Meal Drawer Button */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ y: 4, scale: 0.95 }}
              title="Choose another meal"
              className="h-20 w-12 rounded-2xl bg-white/90 dark:bg-stone-800 border-b-[5px] border-stone-400 dark:border-stone-950 active:border-b-[2px] flex items-center justify-center text-nomciu-charcoal shadow-sm transition active:shadow-none"
            >
              <ChevronDown className="w-5 h-5 text-nomciu-charcoal/80" />
            </motion.button>
          </div>
        </div>
      ) : (
        /* 2. If Current Time-Window Meal IS ALREADY FED: Show Celebratory Status Card */
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-white border-2 border-emerald-300 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 border-2 border-emerald-200 flex items-center justify-center text-3xl shadow-xs">
                  {mealEmojis[windowInfo.currentMeal]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-emerald-950 text-lg">
                      {windowInfo.label} Complete!
                    </h3>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-emerald-800 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {currentMealItem.fedAt || "Just now"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      Fed by <strong>{currentMealItem.fedBy || "Roommate"}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Undo button */}
              {onUndoMeal && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleUndo(windowInfo.currentMeal)}
                  title="Undo feeding"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-emerald-800 hover:text-rose-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 hover:border-rose-200 shadow-xs transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Secondary Action: Next meal or All fed celebration */}
          {!isAllFed && nextPendingMeal ? (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-nomciu-muted font-medium">
                Next up: <strong>{mealLabels[nextPendingMeal]} {mealEmojis[nextPendingMeal]}</strong>
              </span>
              <button
                onClick={() => handleFeed(nextPendingMeal)}
                className="text-xs font-bold text-rose-600 hover:text-red-700 underline underline-offset-4 transition"
              >
                Feed {mealLabels[nextPendingMeal]} Early →
              </button>
            </div>
          ) : (
            <div className="text-center py-1">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs shadow-xs">
                ✨ All 3 meals completed today!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Meal Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 border border-nomciu-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-nomciu-border/50 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <h3 className="font-extrabold text-lg text-nomciu-charcoal">
                    Which meal to log?
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-nomciu-muted hover:text-nomciu-charcoal hover:bg-nomciu-cream/50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => {
                  const meal = dailyLog[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleFeed(type)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between border text-left transition active:scale-98 ${
                        meal.completed
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : "bg-nomciu-cream/40 hover:bg-nomciu-cream/80 border-nomciu-border/70 text-nomciu-charcoal"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{mealEmojis[type]}</span>
                        <div>
                          <div className="font-bold capitalize text-sm">
                            {type}
                          </div>
                          <div className="text-xs text-nomciu-muted">
                            {meal.completed
                              ? `Fed at ${meal.fedAt} by ${meal.fedBy}`
                              : "Not fed yet"}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          meal.completed
                            ? "bg-emerald-600 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {meal.completed ? "Re-log" : "Feed"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-[11px] text-nomciu-muted mt-4">
                Logging as <strong className="text-nomciu-charcoal">{feederName || "Roommate"}</strong>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
