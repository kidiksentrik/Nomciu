"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PetHero } from "@/components/PetHero";
import { FeedNowButton } from "@/components/FeedNowButton";
import { MealGrid } from "@/components/MealGrid";
import { OnboardingModal } from "@/components/OnboardingModal";
import { InviteModal } from "@/components/InviteModal";
import { useHousehold } from "@/hooks/useHousehold";
import { useMeals } from "@/hooks/useMeals";
import { Loader2 } from "lucide-react";

export default function Home() {
  const {
    household,
    feederName,
    isLoading: isHouseholdLoading,
    isDemoMode,
    saveFeederName,
    createHousehold,
    joinHousehold,
    leaveHousehold,
  } = useHousehold();

  const {
    dailyLog,
    isSyncing,
    feedMeal,
    toggleMeal,
    resetToday,
  } = useMeals(household?.id || null, feederName);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"household" | "feeder">("household");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Check URL query param for automatic join link e.g. /?join=749201
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");

    if (joinCode && (!household || household.joinCode !== joinCode)) {
      joinHousehold(joinCode).catch(() => {
        // If auto join fails, prompt user
        setIsOnboardingOpen(true);
      });
    }
  }, [household, joinHousehold]);

  // If not loading, verify whether household or feeder nickname is missing
  useEffect(() => {
    if (!isHouseholdLoading) {
      if (!household) {
        setOnboardingStep("household");
        setIsOnboardingOpen(true);
      } else if (!feederName) {
        setOnboardingStep("feeder");
        setIsOnboardingOpen(true);
      } else {
        setIsOnboardingOpen(false);
      }
    }
  }, [household, feederName, isHouseholdLoading]);

  // Loading state
  if (isHouseholdLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-nomciu-bg">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-nomciu-peach to-nomciu-amber flex items-center justify-center text-3xl shadow-tactile animate-pulse mb-4 select-none">
          🐾
        </div>
        <div className="flex items-center gap-2 text-nomciu-charcoal font-bold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-nomciu-peach" />
          <span>Waking up Nomciu...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-between safe-top safe-bottom">
      {/* Mobile-contained wrapper (Looks like native app on mobile & elegant mobile card on desktop) */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between pb-6">
        <div>
          {/* Top Bar */}
          <Navbar
            joinCode={household?.joinCode || ""}
            feederName={feederName}
            isDemoMode={isDemoMode}
            onOpenInvite={() => setIsInviteOpen(true)}
            onSwitchHousehold={leaveHousehold}
            onChangeNickname={() => {
              setOnboardingStep("feeder");
              setIsOnboardingOpen(true);
            }}
          />

          {/* Hero Zone: Pet Avatar & Live Emotion Headline */}
          {household && (
            <PetHero
              petName={household.petName}
              petPhotoUrl={household.petPhotoUrl}
              dailyLog={dailyLog}
            />
          )}

          {/* Hero Action: Tactile FEED NOW Button */}
          {household && (
            <FeedNowButton
              dailyLog={dailyLog}
              feederName={feederName}
              onFeed={feedMeal}
            />
          )}

          {/* Daily 3-Meal Tracker Grid */}
          {household && (
            <MealGrid
              dailyLog={dailyLog}
              onToggleMeal={toggleMeal}
              onResetToday={resetToday}
            />
          )}
        </div>

        {/* Footer info & Roommate prompt */}
        <footer className="w-full text-center px-4 mt-6">
          <p className="text-[11px] text-nomciu-muted font-medium">
            Roommates sync automatically in real-time.
          </p>
          <p className="text-[10px] text-nomciu-muted/70 mt-0.5">
            Nomciu • Mobile Pet Feeding Tracker
          </p>
        </footer>
      </div>

      {/* Onboarding / Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialStep={onboardingStep}
        feederName={feederName}
        onSaveFeederName={(name) => {
          saveFeederName(name);
          setIsOnboardingOpen(false);
        }}
        onCreateHousehold={createHousehold}
        onJoinHousehold={joinHousehold}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Invite Roommates Modal */}
      {household && (
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          householdName={household.petName}
          joinCode={household.joinCode}
        />
      )}
    </main>
  );
}
