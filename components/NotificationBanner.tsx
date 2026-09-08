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

  // If push is not supported or already granted & subscribed or user dismissed, hide banner
  if (!isSupported || isSubscribed || permission === "denied" || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full max-w-md mx-auto px-4 mb-2"
      >
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950 leading-tight">
                Turn on Lock-Screen Alerts
              </p>
              <p className="text-[11px] text-amber-800/80 font-medium leading-tight mt-0.5">
                Know when roommates feed {petName}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onSubscribe}
              disabled={isSubscribing}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-50"
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
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-amber-700/60 hover:text-amber-900 hover:bg-amber-100/60 transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
