"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PetHero } from "@/components/PetHero";
import { FeedNowButton } from "@/components/FeedNowButton";
import { MealGrid } from "@/components/MealGrid";
import { OnboardingModal } from "@/components/OnboardingModal";
import { InviteModal } from "@/components/InviteModal";
import { EditPetModal } from "@/components/EditPetModal";
import { NotificationBanner } from "@/components/NotificationBanner";
import { useHousehold } from "@/hooks/useHousehold";
import { useMeals } from "@/hooks/useMeals";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Loader2 } from "lucide-react";

export default function Home() {
  const {
    household,
    feederName,
    recentHouseholds,
    isLoading: isHouseholdLoading,
    isDemoMode,
    saveFeederName,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    updatePetProfile,
  } = useHousehold();

  const {
    dailyLog,
    isSyncing,
    feedMeal,
    toggleMeal,
    resetToday,
  } = useMeals(household?.id || null, feederName);

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isSubscribed: isPushSubscribed,
    isSubscribing: isPushSubscribing,
    subscribe: subscribeToPush,
  } = usePushNotifications(household?.id || null, feederName);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"household" | "feeder">("household");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditPetOpen, setIsEditPetOpen] = useState(false);

  // Check URL query param for automatic join link e.g. /?join=749201
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");

    if (joinCode && (!household || household.joinCode !== joinCode)) {
      joinHousehold(joinCode).catch(() => {
        setIsOnboardingOpen(true);
      });
    }
  }, [household, joinHousehold]);

  // Synchronize modal open state with missing household or feeder nickname
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

  const handleSwitchHousehold = () => {
    leaveHousehold();
    setOnboardingStep("household");
    setIsOnboardingOpen(true);
  };

  // Loading state
  if (isHouseholdLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0D0E13]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-nomciu-peach to-amber-500 flex items-center justify-center text-3xl shadow-tactile animate-pulse mb-4 select-none">
          🐾
        </div>
        <div className="flex items-center gap-2 text-stone-200 font-black text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-nomciu-peach" />
          <span>Waking up Nomciu...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-between safe-top safe-bottom bg-[#0D0E13] text-stone-100 overflow-x-hidden">
      {/* Mobile-contained wrapper (Looks like native app on mobile & elegant mobile card on desktop) */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between pb-6 overflow-x-hidden">
        <div>
          {/* Top Bar */}
          <Navbar
            joinCode={household?.joinCode || ""}
            feederName={feederName}
            isDemoMode={isDemoMode}
            isPushSubscribed={isPushSubscribed}
            onTogglePush={isPushSubscribed ? undefined : subscribeToPush}
            onOpenInvite={() => setIsInviteOpen(true)}
            onSwitchHousehold={handleSwitchHousehold}
            onChangeNickname={() => {
              setOnboardingStep("feeder");
              setIsOnboardingOpen(true);
            }}
          />

          {/* Background Push Alerts Banner */}
          {household && (
            <NotificationBanner
              petName={household.petName}
              isSupported={isPushSupported}
              permission={pushPermission}
              isSubscribed={isPushSubscribed}
              isSubscribing={isPushSubscribing}
              onSubscribe={subscribeToPush}
            />
          )}

          {/* Hero Zone: Pet Avatar & Live Emotion Headline */}
          {household && (
            <PetHero
              petName={household.petName}
              petPhotoUrl={household.petPhotoUrl}
              dailyLog={dailyLog}
              onEditPet={() => setIsEditPetOpen(true)}
            />
          )}

          {/* Hero Action: Tactile FEED NOW Button or Completed Status */}
          {household && (
            <FeedNowButton
              dailyLog={dailyLog}
              feederName={feederName}
              onFeed={(type) => feedMeal(type, undefined, household.petName)}
              onUndoMeal={toggleMeal}
            />
          )}

          {/* Daily Meal Tracker: shows today's completed feedings & collapsible full view */}
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
          <p className="text-[11px] text-stone-400 font-semibold">
            Roommates sync automatically in real-time.
          </p>
          <p className="text-[10px] text-stone-500 font-medium mt-0.5">
            Nomciu • Mobile Pet Feeding Tracker
          </p>
        </footer>
      </div>

      {/* Onboarding / Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialStep={onboardingStep}
        feederName={feederName}
        recentHouseholds={recentHouseholds}
        onSaveFeederName={(name) => {
          saveFeederName(name);
          setIsOnboardingOpen(false);
        }}
        onCreateHousehold={createHousehold}
        onJoinHousehold={joinHousehold}
        onClose={() => {
          if (household) {
            setIsOnboardingOpen(false);
          }
        }}
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

      {/* Edit Pet Profile Modal */}
      {household && (
        <EditPetModal
          isOpen={isEditPetOpen}
          onClose={() => setIsEditPetOpen(false)}
          currentPetName={household.petName}
          currentPetPhotoUrl={household.petPhotoUrl}
          onSave={async (newName, newPhotoUrl) => {
            await updatePetProfile(newName, newPhotoUrl);
          }}
        />
      )}
    </main>
  );
}
