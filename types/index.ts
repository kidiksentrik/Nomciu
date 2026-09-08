export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealItem {
  completed: boolean;
  fedBy: string | null;
  fedAt: string | null; // e.g. "08:30 AM"
}

export interface DailyMealLog {
  date: string; // YYYY-MM-DD
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  updatedAt?: number;
}

export interface Household {
  id: string; // Document ID (usually same as joinCode e.g. "728491")
  joinCode: string;
  petName: string;
  petPhotoUrl: string;
  createdAt: number;
}

export interface RecentHousehold {
  id: string;
  petName: string;
  petPhotoUrl: string;
  lastSeen: number;
}

export interface FeederProfile {
  name: string;
  avatarSeed?: string;
}

export interface MealConfig {
  type: MealType;
  label: string;
  timeRange: string; // e.g. "07:00 - 10:00"
  icon: string;
}
