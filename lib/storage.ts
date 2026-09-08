import { RecentHousehold } from "@/types";

const COOKIE_KEYS = {
  CURRENT_HOUSEHOLD_ID: "nomciu_current_household_id",
  FEEDER_NAME: "nomciu_feeder_name",
  LAST_HOUSEHOLD: "nomciu_last_household",
};

const STORAGE_KEYS = {
  CURRENT_HOUSEHOLD_ID: "nomciu_current_household_id",
  FEEDER_NAME: "nomciu_feeder_name",
  RECENT_HOUSEHOLDS: "nomciu_recent_households",
  MOCK_HOUSEHOLDS: "nomciu_mock_households",
};

// Cookie Helpers (Works across PWA icon re-installs on iOS/Android)
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
}

export function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
}

// Multi-store Household ID retrieval
export function getStoredHouseholdId(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Try localStorage
  const fromLocal = localStorage.getItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID);
  if (fromLocal) return fromLocal;

  // 2. Fallback to cookie (e.g. if PWA home screen icon was re-added)
  const fromCookie = getCookie(COOKIE_KEYS.CURRENT_HOUSEHOLD_ID);
  if (fromCookie) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID, fromCookie);
    } catch (_) {}
    return fromCookie;
  }

  // 3. Fallback to last known household cookie
  try {
    const lastRaw = getCookie(COOKIE_KEYS.LAST_HOUSEHOLD);
    if (lastRaw) {
      const parsed = JSON.parse(lastRaw);
      if (parsed && parsed.id) {
        return parsed.id;
      }
    }
  } catch (_) {}

  return null;
}

export function saveStoredHouseholdId(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID, id);
  } catch (_) {}
  setCookie(COOKIE_KEYS.CURRENT_HOUSEHOLD_ID, id, 365);
}

export function clearStoredHouseholdId() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID);
  } catch (_) {}
  removeCookie(COOKIE_KEYS.CURRENT_HOUSEHOLD_ID);
}

// Feeder Nickname storage
export function getStoredFeederName(): string {
  if (typeof window === "undefined") return "";
  const fromLocal = localStorage.getItem(STORAGE_KEYS.FEEDER_NAME);
  if (fromLocal) return fromLocal;

  const fromCookie = getCookie(COOKIE_KEYS.FEEDER_NAME);
  if (fromCookie) {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDER_NAME, fromCookie);
    } catch (_) {}
    return fromCookie;
  }
  return "";
}

export function saveStoredFeederName(name: string) {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(STORAGE_KEYS.FEEDER_NAME, trimmed);
  } catch (_) {}
  setCookie(COOKIE_KEYS.FEEDER_NAME, trimmed, 365);
}

// Recent Households History
export function getRecentHouseholds(): RecentHousehold[] {
  if (typeof window === "undefined") return [];

  let recents: RecentHousehold[] = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_HOUSEHOLDS);
    if (raw) {
      recents = JSON.parse(raw);
    }
  } catch (_) {}

  // Check backup cookie if localStorage was wiped
  try {
    const cookieRaw = getCookie(COOKIE_KEYS.LAST_HOUSEHOLD);
    if (cookieRaw) {
      const parsed = JSON.parse(cookieRaw) as RecentHousehold;
      if (parsed && parsed.id) {
        const exists = recents.some((r) => r.id === parsed.id);
        if (!exists) {
          recents.unshift(parsed);
        }
      }
    }
  } catch (_) {}

  return recents;
}

export function recordRecentHousehold(household: {
  id: string;
  petName: string;
  petPhotoUrl: string;
}) {
  if (typeof window === "undefined" || !household.id) return;

  const entry: RecentHousehold = {
    id: household.id,
    petName: household.petName,
    petPhotoUrl: household.petPhotoUrl,
    lastSeen: Date.now(),
  };

  // 1. Save to Cookie backup
  setCookie(COOKIE_KEYS.LAST_HOUSEHOLD, JSON.stringify(entry), 365);

  // 2. Update list in localStorage
  try {
    const existing = getRecentHouseholds().filter((r) => r.id !== household.id);
    const updated = [entry, ...existing].slice(0, 4);
    localStorage.setItem(STORAGE_KEYS.RECENT_HOUSEHOLDS, JSON.stringify(updated));
  } catch (_) {}
}
