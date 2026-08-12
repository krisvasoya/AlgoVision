"use client";

import React, { useState, useEffect } from "react";
import { UsabilityTracker } from "@/engine/testing/UsabilityTracker";
import { RotateCcw, Wrench } from "lucide-react";

export const DevResetPanel: React.FC = () => {
  const [isDev, setIsDev] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    // Security check: Only allow developer testing panel outside production
    if (process.env.NODE_ENV === "production") {
      setIsDev(false);
      return;
    }

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("dev") === "true") {
        setIsDev(true);
      }
    }
  }, []);

  if (!isDev) return null;

  const handleReset = () => {
    UsabilityTracker.resetFirstTimeUserState();
    setResetMessage("First-time user state restored! Reloading...");
    setTimeout(() => {
      window.location.href = window.location.pathname;
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-amber-500/40 rounded-xl p-3 shadow-2xl text-xs font-mono max-w-xs">
      <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
        <Wrench className="w-4 h-4" /> Developer User Testing Mode
      </div>
      <p className="text-slate-400 text-[11px] mb-3">
        Clear progress, practice history, exam scores, and mistake queue to restore first-time student state.
      </p>

      {resetMessage ? (
        <div className="text-emerald-400 text-[11px] font-bold py-1">{resetMessage}</div>
      ) : (
        <button
          onClick={handleReset}
          className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition flex items-center justify-center gap-1.5 font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restore First-Time User State
        </button>
      )}
    </div>
  );
};
