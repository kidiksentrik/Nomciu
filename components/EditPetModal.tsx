"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Check, Loader2, Sparkles } from "lucide-react";
import { PRESET_PET_AVATARS } from "@/lib/utils";

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPetName: string;
  currentPetPhotoUrl: string;
  onSave: (newName: string, newPhotoUrl: string) => Promise<void>;
}

export const EditPetModal: React.FC<EditPetModalProps> = ({
  isOpen,
  onClose,
  currentPetName,
  currentPetPhotoUrl,
  onSave,
}) => {
  const [petName, setPetName] = useState(currentPetName);
  const [photoUrl, setPhotoUrl] = useState(currentPetPhotoUrl);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPetName(currentPetName);
      setPhotoUrl(currentPetPhotoUrl);
      setErrorMsg("");
    }
  }, [isOpen, currentPetName, currentPetPhotoUrl]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress client-side to max 400x400 (<30KB)
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
          setPhotoUrl(compressed);
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      setErrorMsg("Please enter a pet name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await onSave(petName.trim(), photoUrl.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update pet profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        className="relative w-full max-w-sm bg-[#161822] rounded-3xl p-6 shadow-2xl border border-[#282C3D] text-white my-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-nomciu-muted hover:text-white hover:bg-[#202330] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-nomciu-peach" />
            <h3 className="text-lg font-black text-white">
              Edit Pet Profile
            </h3>
          </div>
          <p className="text-xs text-nomciu-muted">
            Update photo or name across all roommates.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Preview Avatar with Camera Action */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-400 shadow-xl mb-3 group">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#181A24] border-2 border-[#282C3D] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={petName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload trigger on avatar */}
              <label
                title="Upload new photo"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition duration-200"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-0.5">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Custom Photo Upload Button */}
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1F2B] hover:bg-[#242836] border border-[#2D3244] text-xs font-bold text-stone-200 cursor-pointer transition shadow-xs">
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

          {/* Preset Avatars Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-2 text-center">
              Or pick a cute preset:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_PET_AVATARS.map((avatar) => {
                const isSelected = photoUrl === avatar.url;
                return (
                  <button
                    type="button"
                    key={avatar.id}
                    onClick={() => setPhotoUrl(avatar.url)}
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
          </div>

          {/* Pet Name input */}
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Pet&apos;s Name
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Kami"
              maxLength={25}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10121A] border border-[#282C3D] focus:bg-[#181A24] focus:outline-none focus:ring-2 focus:ring-nomciu-peach text-sm font-semibold text-white"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#1C1F2B] hover:bg-[#242836] border border-[#2D3244] text-xs font-bold text-stone-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-nomciu-peach to-orange-500 hover:brightness-105 text-white font-black text-xs shadow-tactile transition active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
