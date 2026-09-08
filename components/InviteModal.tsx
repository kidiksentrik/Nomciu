"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Users, Heart } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdName: string;
  joinCode: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  householdName,
  joinCode,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.origin + `?join=${joinCode}` : "";
    const shareData = {
      title: `Join ${householdName}'s Feeding Tracker on Nomciu`,
      text: `Let's keep track of ${householdName}'s meals together on Nomciu! Join code: ${joinCode}`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm bg-[#161822] rounded-3xl p-6 shadow-2xl border border-[#282C3D] text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-nomciu-muted hover:text-white hover:bg-[#202330] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center text-xl shadow-xs mb-2 select-none">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">
            Invite Roommates
          </h3>
          <p className="text-xs text-nomciu-muted mt-0.5">
            Sync feeding status for <strong className="text-white">{householdName}</strong> in real-time.
          </p>
        </div>

        {/* Big 6-Digit Join Code Box */}
        <div className="bg-[#10121A] border-2 border-dashed border-nomciu-peach/40 rounded-2xl p-4 text-center mb-4">
          <span className="text-[11px] font-bold text-nomciu-muted uppercase tracking-wider block mb-1">
            Household Join Code
          </span>
          <div className="text-3xl font-black font-mono tracking-widest text-nomciu-peach select-all">
            {joinCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F2230] hover:bg-[#262A3B] text-xs font-bold text-white shadow-xs border border-[#2E3347] transition active:scale-95"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400">Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-nomciu-peach" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Share Link Button */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl bg-[#1C1F2B] hover:bg-[#242836] text-white font-black text-xs flex items-center justify-center gap-2 border border-[#2D3244] transition active:scale-98 mb-4 shadow-sm"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span className="text-emerald-400">Link Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-nomciu-peach" />
              <span>Share Invite Link</span>
            </>
          )}
        </button>

        {/* How it works for roommates */}
        <div className="bg-[#10121A] border border-[#202330] rounded-xl p-3 text-[11px] text-nomciu-muted space-y-1">
          <p className="font-bold text-white text-xs">How roommates join:</p>
          <p>1. Open this app on their phone or browser.</p>
          <p>2. Select &apos;Join Household&apos; and paste code <strong className="text-white">{joinCode}</strong>.</p>
          <p>3. Enter their nickname (no password needed!).</p>
        </div>
      </motion.div>
    </div>
  );
};
