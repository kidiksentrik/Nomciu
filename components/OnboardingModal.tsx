"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PlusCircle, ArrowRight, Check, KeyRound, Camera, RotateCcw } from "lucide-react";
import { PRESET_PET_AVATARS } from "@/lib/utils";
import { RecentHousehold } from "@/types";

interface OnboardingModalProps {
  isOpen: boolean;
  initialStep?: "household" | "feeder";
  feederName: string;
  recentHouseholds?: RecentHousehold[];
  onSaveFeederName: (name: string) => void;
  onCreateHousehold: (petName: string, photoUrl: string) => Promise<any>;
  onJoinHousehold: (code: string) => Promise<any>;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialStep = "household",
  feederName,
  recentHouseholds = [],
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

    // Read and compress image client-side to max 400x400 (~30KB) for fast Firestore syncing
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setSelectedAvatar(compressed);
          setCustomPhotoUrl("");
        };
        img.src = reader.result;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 10 }}
        className="w-full max-w-md bg-[#161822] rounded-3xl p-6 shadow-2xl border border-[#282C3D] my-6 text-white"
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-nomciu-peach to-nomciu-amber mx-auto flex items-center justify-center text-2xl shadow-tactile mb-2 select-none">
                  🐾
                </div>
                <h2 className="text-xl font-black text-white">
                  Welcome to Feedy
                </h2>
                <p className="text-xs text-nomciu-muted mt-1">
                  Keep your pet&apos;s meals tracked &amp; synced across roommates.
                </p>
              </div>

              {/* Quick Reconnect Card if recent household found */}
              {recentHouseholds && recentHouseholds.length > 0 && (
                <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-[#1C1F2D] to-[#141620] border border-nomciu-peach/40 shadow-tactile">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-nomciu-peach flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-nomciu-peach animate-pulse" />
                      <span>Recently Connected</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">Instant 1-Tap</span>
                  </div>

                  <div className="space-y-2">
                    {recentHouseholds.map((rh) => (
                      <div
                        key={rh.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0E1017] border border-[#2B3045] hover:border-nomciu-peach/50 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={rh.petPhotoUrl || PRESET_PET_AVATARS[0].url}
                            alt={rh.petName}
                            className="w-10 h-10 rounded-xl object-cover border border-[#3A405A] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white truncate flex items-center gap-1.5 leading-none">
                              <span>{rh.petName}</span>
                              <span className="text-xs font-mono text-nomciu-peach font-bold bg-[#1C1F2B] px-1.5 py-0.5 rounded-md border border-[#2E3347]">
                                #{rh.id}
                              </span>
                            </h4>
                            <p className="text-[10px] text-stone-400 truncate mt-1">
                              Tap to resume tracking
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={async () => {
                            setLoading(true);
                            setErrorMsg("");
                            try {
                              await onJoinHousehold(rh.id);
                              if (feederName) {
                                onClose?.();
                              } else {
                                setStep("feeder");
                              }
                            } catch (err: any) {
                              setErrorMsg(err?.message || "Failed to reconnect.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-nomciu-peach to-orange-500 hover:brightness-110 text-white font-black text-xs shadow-tactile transition active:scale-95 shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{loading ? "..." : "Reconnect"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs: Create vs Join */}
              <div className="flex bg-[#10121A] p-1 rounded-2xl mb-5 border border-[#252838]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("create");
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === "create"
                      ? "bg-[#1E212E] text-white shadow-xs border border-[#2E3347]"
                      : "text-nomciu-muted hover:text-white"
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
                      ? "bg-[#1E212E] text-white shadow-xs border border-[#2E3347]"
                      : "text-nomciu-muted hover:text-white"
                  }`}
                >
                  Join with Code
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              {/* Tab 1: Create Household */}
              {activeTab === "create" && (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-200 mb-1">
                      Pet&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Luna, Mochi, Oliver"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#10121A] border border-[#282C3D] focus:bg-[#181A24] focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-sm font-semibold text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-200 mb-2">
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
                                ? "border-nomciu-peach scale-105 shadow-md"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatar.url}
                              alt={avatar.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-nomciu-peach/30 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom upload or custom URL input */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1F2B] hover:bg-[#242836] border border-[#2D3244] text-xs font-bold text-stone-200 cursor-pointer transition">
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
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-nomciu-peach to-orange-500 hover:brightness-105 text-white font-black text-sm shadow-tactile transition active:scale-98 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Household"}
                  </button>
                </form>
              )}

              {/* Tab 2: Join Household */}
              {activeTab === "join" && (
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-200 mb-1">
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
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#10121A] border border-[#282C3D] focus:bg-[#181A24] focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-center tracking-widest font-mono text-lg font-black uppercase text-white"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-nomciu-muted mt-1.5 text-center">
                      Ask your roommate for the code from their screen.
                    </p>
                    {recentHouseholds && recentHouseholds.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5 mt-2.5 flex-wrap">
                        <span className="text-[11px] text-stone-400 font-semibold">Recent:</span>
                        {recentHouseholds.map((rh) => (
                          <button
                            key={rh.id}
                            type="button"
                            onClick={() => setJoinCodeInput(rh.id)}
                            className="px-2 py-0.5 rounded-lg bg-[#181B26] hover:bg-[#232736] text-[11px] font-mono font-bold text-nomciu-peach border border-[#282C3D] transition active:scale-95"
                          >
                            #{rh.id} ({rh.petName})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-black text-sm shadow-sm transition active:scale-98 disabled:opacity-50"
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
                <div className="w-12 h-12 rounded-2xl bg-[#2D1822] text-nomciu-peach mx-auto flex items-center justify-center text-2xl shadow-sm mb-2 select-none border border-nomciu-peach/30">
                  👤
                </div>
                <h2 className="text-xl font-black text-white">
                  What&apos;s your nickname?
                </h2>
                <p className="text-xs text-nomciu-muted mt-1">
                  Your roommates will see this when you feed the pet.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold text-center">
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
                    className="w-full px-4 py-3 rounded-xl bg-[#10121A] border border-[#282C3D] focus:bg-[#181A24] focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-center text-base font-black text-white"
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-nomciu-muted mt-1.5 text-center">
                    Saved directly to your browser session (zero passwords).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-nomciu-peach to-orange-500 hover:brightness-105 text-white font-black text-sm shadow-tactile transition active:scale-98 flex items-center justify-center gap-2"
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
