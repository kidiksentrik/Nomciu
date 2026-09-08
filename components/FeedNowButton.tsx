"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, CheckCircle2, ChevronDown, Sparkles, X, RotateCcw, Clock, User, Heart } from "lucide-react";
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
    <div className="w-full max-w-md mx-auto px-4 my-3">
      {/* 1. If Current Time-Window Meal is NOT fed yet: Show Giant Tactile FEED NOW Button */}
      {!isCurrentMealFed ? (
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => handleFeed(windowInfo.currentMeal)}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex-1 h-18 py-3.5 rounded-2xl flex items-center justify-center gap-3 px-6 bg-gradient-to-r from-nomciu-peach to-orange-500 text-white font-black text-lg tracking-wide uppercase shadow-tactile transition-all select-none hover:brightness-105 active:shadow-tactile-active"
          >
            <Utensils className="w-7 h-7 stroke-[2.5]" />
            <div className="flex flex-col items-start leading-tight text-left">
              <span className="text-base sm:text-lg font-black tracking-wider flex items-center gap-1.5">
                FEED {windowInfo.label.toUpperCase()} NOW {windowInfo.emoji}
              </span>
              <span className="text-[11px] font-medium tracking-normal text-white/90 normal-case">
                {windowInfo.windowDescription}
              </span>
            </div>
          </motion.button>

          {/* Quick drawer button to feed another meal if needed */}
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            title="Choose a different meal"
            className="h-18 py-3.5 w-14 rounded-2xl bg-white border-2 border-nomciu-border/70 hover:border-nomciu-peach/40 flex items-center justify-center text-nomciu-charcoal shadow-card active:shadow-sm transition"
          >
            <ChevronDown className="w-5 h-5 text-nomciu-charcoal/80" />
          </motion.button>
        </div>
      ) : (
        /* 2. If Current Time-Window Meal IS ALREADY FED: Show Completed Status Card */
        <div className="space-y-2.5">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden rounded-2xl p-4.5 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border-2 border-emerald-300/70 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
                  {mealEmojis[windowInfo.currentMeal]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-emerald-950 text-base">
                      {windowInfo.label} Complete!
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-emerald-800 font-semibold">
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
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-emerald-800 hover:text-rose-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 hover:border-rose-200 shadow-xs transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Secondary Action: Next meal or All fed celebration */}
          {!isAllFed && nextPendingMeal ? (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-nomciu-muted font-medium">
                Next up: {mealLabels[nextPendingMeal]} {mealEmojis[nextPendingMeal]}
              </span>
              <button
                onClick={() => handleFeed(nextPendingMeal)}
                className="text-xs font-bold text-nomciu-peach-dark hover:text-orange-600 underline underline-offset-2 transition"
              >
                Feed {mealLabels[nextPendingMeal]} Early →
              </button>
            </div>
          ) : (
            <div className="text-center py-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 font-bold text-xs">
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
                  <Sparkles className="w-5 h-5 text-nomciu-peach" />
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
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          meal.completed
                            ? "bg-emerald-600 text-white"
                            : "bg-nomciu-peach text-white"
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
