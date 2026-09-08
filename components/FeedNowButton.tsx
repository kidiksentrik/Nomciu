"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, CheckCircle2, ChevronDown, Sparkles, X } from "lucide-react";
import { DailyMealLog, MealType } from "@/types";
import { getNextPendingMeal } from "@/lib/utils";
import { triggerFeedConfetti } from "./Confetti";

interface FeedNowButtonProps {
  dailyLog: DailyMealLog;
  feederName: string;
  onFeed: (mealType: MealType) => Promise<any>;
}

export const FeedNowButton: React.FC<FeedNowButtonProps> = ({
  dailyLog,
  feederName,
  onFeed,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextMeal = getNextPendingMeal(dailyLog);
  const isAllFed = nextMeal === null;

  const handlePrimaryClick = async () => {
    if (isAllFed) {
      // All fed, open selector so user can manage or toggle
      setIsModalOpen(true);
      return;
    }

    // Auto-feed next pending meal
    setIsSubmitting(true);
    try {
      await onFeed(nextMeal);
      triggerFeedConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMeal = async (type: MealType) => {
    setIsSubmitting(true);
    try {
      await onFeed(type);
      triggerFeedConfetti();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealLabels: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 my-3">
      <div className="flex items-center gap-2">
        {/* Giant Main FEED NOW Button */}
        <motion.button
          onClick={handlePrimaryClick}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 px-6 font-black text-lg tracking-wide uppercase shadow-tactile transition-all select-none ${
            isAllFed
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20"
              : "bg-gradient-to-r from-nomciu-peach to-orange-500 text-white hover:brightness-105 active:shadow-tactile-active"
          }`}
        >
          {isAllFed ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-white animate-bounce" />
              <span>All Fed Today!</span>
            </>
          ) : (
            <>
              <Utensils className="w-6 h-6 stroke-[2.5]" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-sm font-extrabold tracking-wider">
                  FEED NOW
                </span>
                <span className="text-[11px] font-medium tracking-normal text-white/90 normal-case">
                  Log {mealLabels[nextMeal]}
                </span>
              </div>
            </>
          )}
        </motion.button>

        {/* Meal Choice Drawer Button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          title="Choose specific meal"
          className="h-16 w-14 rounded-2xl bg-white border-2 border-nomciu-border/70 hover:border-nomciu-peach/40 flex items-center justify-center text-nomciu-charcoal shadow-card active:shadow-sm transition"
        >
          <ChevronDown className="w-5 h-5 text-nomciu-charcoal/80" />
        </motion.button>
      </div>

      {/* Quick Meal Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Sheet */}
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
                      onClick={() => handleSelectMeal(type)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between border text-left transition active:scale-98 ${
                        meal.completed
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : "bg-nomciu-cream/40 hover:bg-nomciu-cream/80 border-nomciu-border/70 text-nomciu-charcoal"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {type === "breakfast" ? "🥣" : type === "lunch" ? "🐟" : "🍖"}
                        </span>
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
                Logging as <span className="font-semibold text-nomciu-charcoal">{feederName || "Roommate"}</span>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
