import { DailyMealLog, MealType } from "@/types";

export interface TimeWindowInfo {
  currentMeal: MealType;
  label: string;
  windowDescription: string;
  emoji: string;
  nextMeal: MealType | null;
}

/**
 * Returns current date formatted as YYYY-MM-DD using local time
 */
export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats date into "08:30 AM" style
 */
export function formatTime(date: Date = new Date()): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const hoursStr = String(hours).padStart(2, "0");
  return `${hoursStr}:${minutes} ${ampm}`;
}

/**
 * Generates a clean 6-digit Join Code (e.g. "749201")
 */
export function generateJoinCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Returns default empty meal log for a given date
 */
export function getDefaultDailyMealLog(dateString: string): DailyMealLog {
  return {
    date: dateString,
    breakfast: { completed: false, fedBy: null, fedAt: null },
    lunch: { completed: false, fedBy: null, fedAt: null },
    dinner: { completed: false, fedBy: null, fedAt: null },
  };
}

/**
 * Returns time window info based on current hour:
 * - Breakfast: 05:00 - 11:00 (until 11:00 AM)
 * - Lunch: 11:00 - 16:00 (11:00 AM - 4:00 PM)
 * - Dinner: 16:00 - 24:00 (after 4:00 PM)
 */
export function getCurrentTimeWindow(date: Date = new Date()): TimeWindowInfo {
  const hour = date.getHours();

  if (hour < 11) {
    return {
      currentMeal: "breakfast",
      label: "Breakfast",
      windowDescription: "Morning window (until 11:00 AM)",
      emoji: "🥣",
      nextMeal: "lunch",
    };
  } else if (hour < 16) {
    return {
      currentMeal: "lunch",
      label: "Lunch",
      windowDescription: "Midday window (11:00 AM - 4:00 PM)",
      emoji: "🐟",
      nextMeal: "dinner",
    };
  } else {
    return {
      currentMeal: "dinner",
      label: "Dinner",
      windowDescription: "Evening window (after 4:00 PM)",
      emoji: "🍖",
      nextMeal: null,
    };
  }
}

/**
 * Finds next pending meal according to time of day and completed state
 */
export function getNextPendingMeal(dailyLog: DailyMealLog, date: Date = new Date()): MealType | null {
  const windowInfo = getCurrentTimeWindow(date);
  // Prioritize current time window meal if not yet fed
  if (!dailyLog[windowInfo.currentMeal].completed) {
    return windowInfo.currentMeal;
  }

  // Otherwise, find any next pending meal in chronological order
  if (!dailyLog.breakfast.completed) return "breakfast";
  if (!dailyLog.lunch.completed) return "lunch";
  if (!dailyLog.dinner.completed) return "dinner";
  return null;
}

/**
 * Calculates current progress summary and emotional headline
 */
export function getPetStatusHeadline(petName: string, dailyLog: DailyMealLog, date: Date = new Date()): {
  headline: string;
  emoji: string;
  isAllCompleted: boolean;
  isCurrentWindowFed: boolean;
  targetMeal: MealType;
  fedInfo?: { fedBy: string | null; fedAt: string | null };
} {
  const completedCount = [
    dailyLog.breakfast.completed,
    dailyLog.lunch.completed,
    dailyLog.dinner.completed,
  ].filter(Boolean).length;

  const windowInfo = getCurrentTimeWindow(date);
  const currentMealItem = dailyLog[windowInfo.currentMeal];

  if (completedCount === 3) {
    return {
      headline: `${petName}'s belly is full today!`,
      emoji: "😸",
      isAllCompleted: true,
      isCurrentWindowFed: true,
      targetMeal: windowInfo.currentMeal,
      fedInfo: { fedBy: currentMealItem.fedBy, fedAt: currentMealItem.fedAt },
    };
  }

  if (currentMealItem.completed) {
    // Current meal already fed!
    const nextPending = getNextPendingMeal(dailyLog, date);
    return {
      headline: `${petName} had ${windowInfo.label.toLowerCase()}!`,
      emoji: "😸",
      isAllCompleted: false,
      isCurrentWindowFed: true,
      targetMeal: nextPending || windowInfo.currentMeal,
      fedInfo: { fedBy: currentMealItem.fedBy, fedAt: currentMealItem.fedAt },
    };
  }

  // Not fed yet for the current time window!
  return {
    headline: `${petName} is waiting for ${windowInfo.label.toLowerCase()}!`,
    emoji: windowInfo.emoji,
    isAllCompleted: false,
    isCurrentWindowFed: false,
    targetMeal: windowInfo.currentMeal,
  };
}

/**
 * Curated preset avatars for quick zero-friction pet profile selection
 */
export const PRESET_PET_AVATARS = [
  {
    id: "cat-orange",
    name: "Ginger Cat",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "cat-calico",
    name: "Calico Cat",
    url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "dog-golden",
    name: "Golden Retriever",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "dog-corgi",
    name: "Corgi",
    url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "bunny",
    name: "Fluffy Bunny",
    url: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "hamster",
    name: "Cute Hamster",
    url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80",
  },
];
