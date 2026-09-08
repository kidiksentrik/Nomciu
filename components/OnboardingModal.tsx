"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PlusCircle, ArrowRight, Check, KeyRound, Camera } from "lucide-react";
import { PRESET_PET_AVATARS } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  initialStep?: "household" | "feeder";
  feederName: string;
  onSaveFeederName: (name: string) => void;
  onCreateHousehold: (petName: string, photoUrl: string) => Promise<any>;
  onJoinHousehold: (code: string) => Promise<any>;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialStep = "household",
  feederName,
  onSaveFeederName,
  onCreateHousehold,
  onJoinHousehold,
  onClose,
}) => {
  const [step, setStep] = useState<"household" | "feeder">(initialStep);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  // Create fields
  const [petName, setPetName] = useState("Luna");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_PET_AVATARS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");

  // Join fields
  const [joinCodeInput, setJoinCodeInput] = useState("");

  // Feeder name field
  const [nickname, setNickname] = useState(feederName || "");

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Keep step synchronized with initialStep whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setErrorMsg("");
    }
  }, [isOpen, initialStep]);

  React.useEffect(() => {
    if (feederName) {
      setNickname(feederName);
    }
  }, [feederName]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 for zero-setup storage in Firestore
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      setErrorMsg("Please enter your pet's name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const finalPhoto = customPhotoUrl.trim() || selectedAvatar;
      await onCreateHousehold(petName.trim(), finalPhoto);

      // If feeder name already exists, we're done; otherwise go to feeder setup
      if (feederName) {
        onClose?.();
      } else {
        setStep("feeder");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create household.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await onJoinHousehold(joinCodeInput.trim());
      if (feederName) {
        onClose?.();
      } else {
        setStep("feeder");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid join code.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeederSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg("Please enter your nickname.");
      return;
    }

    onSaveFeederName(nickname.trim());
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nomciu-charcoal/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 10 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-nomciu-border my-6"
      >
        <AnimatePresence mode="wait">
          {step === "household" ? (
            <motion.div
              key="step-household"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-nomciu-peach to-nomciu-amber mx-auto flex items-center justify-center text-2xl shadow-sm mb-2 select-none">
                  🐾
                </div>
                <h2 className="text-xl font-black text-nomciu-charcoal">
                  Welcome to Nomciu
                </h2>
                <p className="text-xs text-nomciu-muted mt-1">
                  Keep your pet&apos;s meals tracked &amp; synced across roommates.
                </p>
              </div>

              {/* Tabs: Create vs Join */}
              <div className="flex bg-nomciu-cream/60 p-1 rounded-2xl mb-5 border border-nomciu-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("create");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === "create"
                      ? "bg-white text-nomciu-charcoal shadow-xs"
                      : "text-nomciu-muted hover:text-nomciu-charcoal"
                  }`}
                >
                  Create Household
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("join");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === "join"
                      ? "bg-white text-nomciu-charcoal shadow-xs"
                      : "text-nomciu-muted hover:text-nomciu-charcoal"
                  }`}
                >
                  Join with Code
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                  {errorMsg}
                </div>
              )}

              {/* Tab 1: Create Household */}
              {activeTab === "create" && (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-nomciu-charcoal mb-1">
                      Pet&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Luna, Mochi, Oliver"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-nomciu-cream/40 border border-nomciu-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-sm font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-nomciu-charcoal mb-2">
                      Select or Upload Pet Photo
                    </label>

                    {/* Preset Avatars Grid */}
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {PRESET_PET_AVATARS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.url;
                        return (
                          <button
                            type="button"
                            key={avatar.id}
                            onClick={() => {
                              setSelectedAvatar(avatar.url);
                              setCustomPhotoUrl("");
                            }}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                              isSelected
                                ? "border-nomciu-peach scale-105 shadow-sm"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatar.url}
                              alt={avatar.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-nomciu-peach/20 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom upload or custom URL input */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-nomciu-cream/50 hover:bg-nomciu-cream border border-nomciu-border text-xs font-bold text-nomciu-charcoal cursor-pointer transition">
                        <Camera className="w-3.5 h-3.5 text-nomciu-peach" />
                        <span>Upload Custom Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-nomciu-peach to-orange-500 hover:brightness-105 text-white font-extrabold text-sm shadow-tactile transition active:scale-98 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Household"}
                  </button>
                </form>
              )}

              {/* Tab 2: Join Household */}
              {activeTab === "join" && (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-nomciu-charcoal mb-1">
                      Enter 6-Digit Join Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-nomciu-muted" />
                      <input
                        type="text"
                        maxLength={8}
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. 749201"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-nomciu-cream/40 border border-nomciu-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-center tracking-widest font-mono text-lg font-black uppercase"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-nomciu-muted mt-1.5 text-center">
                      Ask your roommate for the code from their screen.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-extrabold text-sm shadow-sm transition active:scale-98 disabled:opacity-50"
                  >
                    {loading ? "Joining..." : "Join Household"}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            /* Screen B: Simple Feeder Setup */
            <motion.div
              key="step-feeder"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-nomciu-peach-light text-nomciu-peach mx-auto flex items-center justify-center text-2xl shadow-sm mb-2 select-none">
                  👤
                </div>
                <h2 className="text-xl font-black text-nomciu-charcoal">
                  What&apos;s your nickname?
                </h2>
                <p className="text-xs text-nomciu-muted mt-1">
                  Your roommates will see this when you feed the pet.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFeederSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Alex, Sam, Chloe"
                    maxLength={20}
                    className="w-full px-4 py-3 rounded-xl bg-nomciu-cream/40 border border-nomciu-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-center text-base font-bold"
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-nomciu-muted mt-1.5 text-center">
                    Saved directly to your browser session (zero passwords).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-nomciu-peach to-orange-500 hover:brightness-105 text-white font-extrabold text-sm shadow-tactile transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Start Tracking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
