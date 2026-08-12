"use client";

import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

interface ExplanationPanelProps {
  description?: string;
  event?: string;
  complexityHint?: string;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  description,
  event = "idle",
  complexityHint,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" /> Explanation
        </h2>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
          {event}
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto text-sm text-slate-300 leading-relaxed flex flex-col justify-between">
        <div>
          {description ? (
            <p className="text-slate-200">{description}</p>
          ) : (
            <p className="text-slate-500 italic text-xs">
              Select or play an algorithm trace to view step explanations.
            </p>
          )}
        </div>

        {complexityHint && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-amber-400/90 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{complexityHint}</span>
          </div>
        )}
      </div>
    </div>
  );
};
