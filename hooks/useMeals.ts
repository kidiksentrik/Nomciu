"use client";

import { useState, useEffect, useCallback } from "react";
import { DailyMealLog, MealType } from "@/types";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getTodayDateString, formatTime, getDefaultDailyMealLog } from "@/lib/utils";

export function useMeals(householdId: string | null, feederName: string) {
  const [todayDateString, setTodayDateString] = useState<string>(getTodayDateString());
  const [dailyLog, setDailyLog] = useState<DailyMealLog>(getDefaultDailyMealLog(getTodayDateString()));
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Check midnight date rollover every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getTodayDateString();
      if (current !== todayDateString) {
        setTodayDateString(current);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayDateString]);

  // Real-time Firestore or Local synchronization
  useEffect(() => {
    if (!householdId) {
      setDailyLog(getDefaultDailyMealLog(todayDateString));
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);

    if (isFirebaseConfigured && db) {
      const logRef = doc(db, "households", householdId, "logs", todayDateString);
      const unsubscribe = onSnapshot(
        logRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setDailyLog(docSnap.data() as DailyMealLog);
          } else {
            // New day or first time today: initialize default clean log
            const defaultLog = getDefaultDailyMealLog(todayDateString);
            setDailyLog(defaultLog);
            // Optionally persist empty log or let first feeding create it
          }
          setIsSyncing(false);
        },
        (error) => {
          console.error("Error subscribing to daily meal logs:", error);
          setIsSyncing(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Local demo mode
      const storageKey = `nomciu_log_${householdId}_${todayDateString}`;

      const loadFromStorage = () => {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            setDailyLog(JSON.parse(raw));
          } else {
            const defaultLog = getDefaultDailyMealLog(todayDateString);
            setDailyLog(defaultLog);
          }
        } catch (e) {
          console.error(e);
        }
        setIsSyncing(false);
      };

      loadFromStorage();

      let channel: BroadcastChannel | null = null;
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("nomciu_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "MEAL_UPDATE" && event.data?.householdId === householdId) {
            loadFromStorage();
          }
        };
      }

      return () => {
        channel?.close();
      };
    }
  }, [householdId, todayDateString]);

  // Persist updated meal log
  const saveMealLog = useCallback(
    async (updatedLog: DailyMealLog) => {
      if (!householdId) return;

      setDailyLog(updatedLog);

      if (isFirebaseConfigured && db) {
        try {
          const logRef = doc(db, "households", householdId, "logs", todayDateString);
          await setDoc(logRef, { ...updatedLog, updatedAt: Date.now() }, { merge: true });
        } catch (err) {
          console.error("Failed to save meal log to Firestore:", err);
        }
      } else {
        const storageKey = `nomciu_log_${householdId}_${todayDateString}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedLog));

        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("nomciu_sync");
          channel.postMessage({ type: "MEAL_UPDATE", householdId });
          channel.close();
        }
      }
    },
    [householdId, todayDateString]
  );

  // Feed a specific meal
  const feedMeal = useCallback(
    async (mealType: MealType, customFeeder?: string, petName?: string) => {
      const who = (customFeeder || feederName || "Roommate").trim();
      const timeStr = formatTime();

      const updated: DailyMealLog = {
        ...dailyLog,
        [mealType]: {
          completed: true,
          fedBy: who,
          fedAt: timeStr,
        },
      };

      await saveMealLog(updated);

      // Trigger background push notifications to all other roommates
      if (householdId) {
        const mealLabels: Record<MealType, string> = {
          breakfast: "Breakfast",
          lunch: "Lunch",
          dinner: "Dinner",
        };
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            householdId,
            petName: petName || "your pet",
            mealLabel: mealLabels[mealType],
            fedBy: who,
            time: timeStr,
          }),
        }).catch((err) => console.warn("Failed to dispatch push notification:", err));
      }

      return updated;
    },
    [dailyLog, feederName, householdId, saveMealLog]
  );

  // Undo / toggle feeding state
  const toggleMeal = useCallback(
    async (mealType: MealType) => {
      const current = dailyLog[mealType];
      if (current.completed) {
        // Undo
        const updated: DailyMealLog = {
          ...dailyLog,
          [mealType]: {
            completed: false,
            fedBy: null,
            fedAt: null,
          },
        };
        await saveMealLog(updated);
      } else {
        // Feed
        await feedMeal(mealType);
      }
    },
    [dailyLog, feedMeal, saveMealLog]
  );

  // Reset entire day (useful for testing or mistake resets)
  const resetToday = useCallback(async () => {
    const emptyLog = getDefaultDailyMealLog(todayDateString);
    await saveMealLog(emptyLog);
  }, [saveMealLog, todayDateString]);

  return {
    todayDateString,
    dailyLog,
    isSyncing,
    feedMeal,
    toggleMeal,
    resetToday,
  };
}
