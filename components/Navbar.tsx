"use client";

import React, { useState } from "react";
import { Copy, Check, Users, Sparkles, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  joinCode: string;
  feederName: string;
  isDemoMode: boolean;
  onOpenInvite: () => void;
  onSwitchHousehold: () => void;
  onChangeNickname: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  joinCode,
  feederName,
  isDemoMode,
  onOpenInvite,
  onSwitchHousehold,
  onChangeNickname,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <header className="w-full max-w-md mx-auto pt-4 pb-2 px-4 flex items-center justify-between">
      {/* Brand logo & demo badge */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-nomciu-peach to-nomciu-amber flex items-center justify-center shadow-sm text-white font-bold text-lg select-none">
          🐾
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-nomciu-charcoal flex items-center gap-1.5 leading-none">
            Nomciu
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            {isDemoMode ? (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Demo Sync
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right controls: Join Code Pill & Profile / Switch */}
      <div className="flex items-center gap-2">
        {/* 6-Digit Join Code pill */}
        {joinCode && (
          <button
            onClick={handleCopyCode}
            title="Click to copy Household Join Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-nomciu-cream/80 hover:bg-nomciu-cream text-nomciu-charcoal text-xs font-semibold border border-nomciu-border/60 transition active:scale-95 shadow-sm"
          >
            <span className="text-nomciu-muted font-normal">Code:</span>
            <span className="tracking-wider text-nomciu-peach-dark font-bold font-mono">
              {joinCode}
            </span>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-3.5 h-3.5 text-nomciu-muted" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Roommate invite button */}
        <button
          onClick={onOpenInvite}
          title="Invite Roommates"
          className="w-8 h-8 rounded-full bg-white hover:bg-nomciu-cream/50 border border-nomciu-border/70 flex items-center justify-center text-nomciu-charcoal shadow-sm transition active:scale-95"
        >
          <Users className="w-4 h-4 text-nomciu-charcoal" />
        </button>

        {/* Nickname Avatar & Settings */}
        {feederName && (
          <button
            onClick={onChangeNickname}
            title={`Logged in as ${feederName} (Click to change)`}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-nomciu-peach-light to-nomciu-peach text-nomciu-charcoal border border-nomciu-peach/30 font-bold text-xs flex items-center justify-center shadow-sm uppercase active:scale-95 transition"
          >
            {feederName.slice(0, 2)}
          </button>
        )}

        {/* Switch Household */}
        <button
          onClick={onSwitchHousehold}
          title="Switch Household"
          className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 border border-nomciu-border/70 flex items-center justify-center text-nomciu-muted hover:text-rose-600 shadow-sm transition active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
