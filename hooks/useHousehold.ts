"use client";

import { useState, useEffect, useCallback } from "react";
import { Household } from "@/types";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { generateJoinCode } from "@/lib/utils";

const STORAGE_KEYS = {
  CURRENT_HOUSEHOLD_ID: "nomciu_current_household_id",
  FEEDER_NAME: "nomciu_feeder_name",
  MOCK_HOUSEHOLDS: "nomciu_mock_households",
};

export function useHousehold() {
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [feederName, setFeederName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial load of localStorage keys on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedFeeder = localStorage.getItem(STORAGE_KEYS.FEEDER_NAME) || "";
    const storedHouseholdId = localStorage.getItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID);

    setFeederName(storedFeeder);
    setHouseholdId(storedHouseholdId);

    if (!storedHouseholdId) {
      setIsLoading(false);
    }
  }, []);

  // 2. Reactive listener on householdId
  useEffect(() => {
    if (!householdId) {
      setHousehold(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Safety timeout: Ensure app never hangs on loading state indefinitely
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    if (isFirebaseConfigured && db) {
      const householdRef = doc(db, "households", householdId);
      const unsubscribe = onSnapshot(
        householdRef,
        (docSnap) => {
          clearTimeout(safetyTimer);
          if (docSnap.exists()) {
            setHousehold(docSnap.data() as Household);
            setError(null);
          } else {
            setError("Household not found.");
            setHousehold(null);
          }
          setIsLoading(false);
        },
        (err) => {
          clearTimeout(safetyTimer);
          console.error("Firestore household subscription error:", err);
          setError("Failed to sync household data.");
          setIsLoading(false);
        }
      );

      return () => {
        clearTimeout(safetyTimer);
        unsubscribe();
      };
    } else {
      // Local demo mode
      const loadMock = () => {
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.MOCK_HOUSEHOLDS);
          const map: Record<string, Household> = raw ? JSON.parse(raw) : {};
          if (map[householdId]) {
            setHousehold(map[householdId]);
            setError(null);
          } else {
            setHousehold(null);
          }
        } catch (e) {
          console.error(e);
        }
        setIsLoading(false);
      };

      loadMock();

      let channel: BroadcastChannel | null = null;
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("nomciu_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "HOUSEHOLD_UPDATE") {
            loadMock();
          }
        };
      }

      return () => {
        channel?.close();
      };
    }
  }, [householdId]);

  // Save feeder name to localStorage
  const saveFeederName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEYS.FEEDER_NAME, trimmed);
    setFeederName(trimmed);
  }, []);

  // Create a new household
  const createHousehold = useCallback(
    async (petName: string, petPhotoUrl: string) => {
      setIsLoading(true);
      setError(null);

      const joinCode = generateJoinCode();
      const newHousehold: Household = {
        id: joinCode,
        joinCode: joinCode,
        petName: petName.trim() || "Luna",
        petPhotoUrl:
          petPhotoUrl ||
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80",
        createdAt: Date.now(),
      };

      try {
        if (isFirebaseConfigured && db) {
          await setDoc(doc(db, "households", joinCode), newHousehold);
        } else {
          // Local demo storage
          const raw = localStorage.getItem(STORAGE_KEYS.MOCK_HOUSEHOLDS);
          const map: Record<string, Household> = raw ? JSON.parse(raw) : {};
          map[joinCode] = newHousehold;
          localStorage.setItem(STORAGE_KEYS.MOCK_HOUSEHOLDS, JSON.stringify(map));

          if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel("nomciu_sync");
            channel.postMessage({ type: "HOUSEHOLD_UPDATE" });
            channel.close();
          }
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID, joinCode);
        setHouseholdId(joinCode);
        setHousehold(newHousehold);
        return newHousehold;
      } catch (err: any) {
        console.error("Error creating household:", err);
        setError(err?.message || "Failed to create household.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Join existing household via 6-digit code
  const joinHousehold = useCallback(async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) throw new Error("Please enter a valid code.");

    setIsLoading(true);
    setError(null);

    try {
      if (isFirebaseConfigured && db) {
        const docRef = doc(db, "households", cleanCode);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error("No household found with this code. Please check and try again.");
        }

        const data = docSnap.data() as Household;
        localStorage.setItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID, cleanCode);
        setHouseholdId(cleanCode);
        setHousehold(data);
        return data;
      } else {
        // Local demo mode
        const raw = localStorage.getItem(STORAGE_KEYS.MOCK_HOUSEHOLDS);
        const map: Record<string, Household> = raw ? JSON.parse(raw) : {};
        const found = map[cleanCode];

        if (!found) {
          throw new Error("No household found with this code in local storage. (Try creating one first!)");
        }

        localStorage.setItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID, cleanCode);
        setHouseholdId(cleanCode);
        setHousehold(found);
        return found;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to join household.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Switch or leave household
  const leaveHousehold = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_HOUSEHOLD_ID);
    setHouseholdId(null);
    setHousehold(null);
  }, []);

  // Update pet profile (photo and/or name)
  const updatePetProfile = useCallback(
    async (newName?: string, newPhotoUrl?: string) => {
      if (!householdId) return;

      try {
        const updates: Partial<Household> = {};
        if (newName !== undefined && newName.trim()) updates.petName = newName.trim();
        if (newPhotoUrl !== undefined && newPhotoUrl.trim()) updates.petPhotoUrl = newPhotoUrl.trim();

        if (Object.keys(updates).length === 0) return;

        if (isFirebaseConfigured && db) {
          const docRef = doc(db, "households", householdId);
          await updateDoc(docRef, updates);
        } else {
          // Local demo mode
          const raw = localStorage.getItem(STORAGE_KEYS.MOCK_HOUSEHOLDS);
          const map: Record<string, Household> = raw ? JSON.parse(raw) : {};
          if (map[householdId]) {
            map[householdId] = { ...map[householdId], ...updates };
            localStorage.setItem(STORAGE_KEYS.MOCK_HOUSEHOLDS, JSON.stringify(map));
            setHousehold(map[householdId]);

            if (typeof BroadcastChannel !== "undefined") {
              const channel = new BroadcastChannel("nomciu_sync");
              channel.postMessage({ type: "HOUSEHOLD_UPDATE" });
              channel.close();
            }
          }
        }
      } catch (err: any) {
        console.error("Error updating pet profile:", err);
        throw err;
      }
    },
    [householdId]
  );

  return {
    household,
    feederName,
    isLoading,
    error,
    saveFeederName,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    updatePetProfile,
    isDemoMode: !isFirebaseConfigured,
  };
}
