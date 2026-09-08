"use client";

import React, { useState } from "react";
import { Copy, Check, Users, Sparkles, LogOut, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  joinCode: string;
  feederName: string;
  isDemoMode: boolean;
  isPushSubscribed?: boolean;
  onOpenInvite: () => void;
  onSwitchHousehold: () => void;
  onChangeNickname: () => void;
  onTogglePush?: () => void;
  onSendTestPush?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  joinCode,
  feederName,
  isDemoMode,
  isPushSubscribed,
  onOpenInvite,
  onSwitchHousehold,
  onChangeNickname,
  onTogglePush,
  onSendTestPush,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="w-full max-w-md mx-auto pt-3 pb-2 px-3.5 sm:px-4 flex items-center justify-between relative z-40">
      {/* Brand logo & live sync indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-nomciu-peach to-amber-500 flex items-center justify-center shadow-tactile text-white font-bold text-base select-none">
          🐾
        </div>
        <div>
          <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
            Feedy
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400/90 tracking-wide uppercase">
              {isDemoMode ? "Demo" : "Live"}
            </span>
          </div>
        </div>
      </div>

      {/* Right controls: Compact & perfectly responsive for mobile */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 6-Digit Join Code pill */}
        {joinCode && (
          <button
            onClick={handleCopyCode}
            title="Click to copy Household Code"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#181A24] hover:bg-[#202330] text-white text-xs font-bold border border-[#282C3D] transition active:scale-95 shadow-sm"
          >
            <span className="text-nomciu-muted font-mono text-[11px]">#</span>
            <span className="tracking-wider text-nomciu-peach font-mono text-xs">
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
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-3 h-3 text-nomciu-muted" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Roommate invite button */}
        <button
          onClick={onOpenInvite}
          title="Invite Roommates"
          className="w-8 h-8 rounded-full bg-[#181A24] hover:bg-[#202330] border border-[#282C3D] flex items-center justify-center text-stone-200 shadow-sm transition active:scale-95"
        >
          <Users className="w-3.5 h-3.5" />
        </button>

        {/* Push Notifications Bell */}
        {onTogglePush && (
          <button
            onClick={onTogglePush}
            title={isPushSubscribed ? "Lock-Screen Alerts Active" : "Turn on Lock-Screen Alerts"}
            className={`relative w-8 h-8 rounded-full border flex items-center justify-center shadow-sm transition active:scale-95 ${
              isPushSubscribed
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "bg-[#181A24] border-[#282C3D] text-nomciu-muted hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            {isPushSubscribed && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs" />
            )}
          </button>
        )}

        {/* User Profile Avatar with Popover */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            title="Profile & Settings"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-sm uppercase active:scale-95 transition border border-white/20"
          >
            {feederName ? feederName.slice(0, 2) : "🐾"}
          </button>

          {/* Profile Popover Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-30"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-48 bg-[#181A24] border border-[#282C3D] rounded-2xl shadow-2xl p-1.5 z-40 text-xs"
                >
                  <div className="px-3 py-2 border-b border-[#282C3D]/60 mb-1">
                    <p className="text-[10px] text-nomciu-muted font-semibold uppercase tracking-wider">
                      Logged in as
                    </p>
                    <p className="text-sm font-bold text-white truncate">
                      {feederName || "Roommate"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onChangeNickname();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-stone-200 hover:text-white hover:bg-[#222636] transition flex items-center gap-2"
                  >
                    <span>Change Nickname</span>
                  </button>

                  {onSendTestPush && isPushSubscribed && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSendTestPush();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left font-semibold text-amber-400 hover:text-amber-300 hover:bg-[#222636] transition flex items-center gap-2"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Send Test Alert</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onSwitchHousehold();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Household</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
