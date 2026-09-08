"use client";

import React, { useState } from "react";
import { Bell, Check, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationBannerProps {
  petName: string;
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isSubscribing: boolean;
  onSubscribe: () => Promise<boolean>;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  petName,
  isSupported,
  permission,
  isSubscribed,
  isSubscribing,
  onSubscribe,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);

  // Initialize dismissed state from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDismissed = localStorage.getItem("nomciu_push_banner_dismissed");
      if (storedDismissed === "true") {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("nomciu_push_banner_dismissed", "true");
    }
  };

  const handleEnable = async () => {
    const success = await onSubscribe();
    if (success) {
      setJustEnabled(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("nomciu_push_banner_dismissed", "true");
        localStorage.setItem("nomciu_push_subscribed", "true");
      }
      setTimeout(() => {
        setDismissed(true);
      }, 2500);
    }
  };

  // If already granted/subscribed or dismissed or unsupported, hide completely
  if (
    !isSupported ||
    (permission === "granted" && !justEnabled) ||
    (isSubscribed && !justEnabled) ||
    permission === "denied" ||
    dismissed
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full max-w-md mx-auto px-4 mb-2.5"
      >
        {justEnabled ? (
          <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-3 shadow-md flex items-center justify-center gap-2 text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span className="text-xs font-black">
              Lock-Screen Alerts Active! 🔔
            </span>
          </div>
        ) : (
          <div className="bg-[#1D1812] border border-amber-500/35 rounded-2xl p-3 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-amber-100 leading-tight truncate">
                  Turn on Lock-Screen Alerts
                </p>
                <p className="text-[11px] text-amber-300/80 font-medium leading-tight mt-0.5 truncate">
                  Know when roommates feed {petName}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleEnable}
                disabled={isSubscribing}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-50"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <span>Enable</span>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-amber-400/60 hover:text-amber-200 hover:bg-amber-500/20 transition"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
