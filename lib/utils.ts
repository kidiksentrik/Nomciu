import { DailyMealLog, MealType } from "@/types";

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
 * Finds next pending meal according to time of day and completed state
 */
export function getNextPendingMeal(dailyLog: DailyMealLog): MealType | null {
  if (!dailyLog.breakfast.completed) return "breakfast";
  if (!dailyLog.lunch.completed) return "lunch";
  if (!dailyLog.dinner.completed) return "dinner";
  return null;
}

/**
 * Calculates current progress summary and emotional headline
 */
export function getPetStatusHeadline(petName: string, dailyLog: DailyMealLog): {
  headline: string;
  emoji: string;
  isAllCompleted: boolean;
  nextMeal: MealType | null;
} {
  const completedCount = [
    dailyLog.breakfast.completed,
    dailyLog.lunch.completed,
    dailyLog.dinner.completed,
  ].filter(Boolean).length;

  if (completedCount === 3) {
    return {
      headline: `${petName}'s belly is full today!`,
      emoji: "😸",
      isAllCompleted: true,
      nextMeal: null,
    };
  }

  const nextMeal = getNextPendingMeal(dailyLog);

  if (nextMeal === "breakfast") {
    return {
      headline: `${petName} is waiting for breakfast!`,
      emoji: "🥣",
      isAllCompleted: false,
      nextMeal: "breakfast",
    };
  } else if (nextMeal === "lunch") {
    return {
      headline: `${petName} is waiting for lunch!`,
      emoji: "😿",
      isAllCompleted: false,
      nextMeal: "lunch",
    };
  } else {
    return {
      headline: `${petName} is waiting for dinner!`,
      emoji: "🐟",
      isAllCompleted: false,
      nextMeal: "dinner",
    };
  }
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
