import React from "react";
import type { ExecutionStep } from "@/types/execution";
import { ShieldCheck } from "lucide-react";

interface ContextIndicatorProps {
  currentStep?: ExecutionStep;
  algorithmTitle?: string;
}

export const ContextIndicator: React.FC<ContextIndicatorProps> = ({ currentStep, algorithmTitle }) => {
  if (!currentStep) return null;

  return (
    <div className="flex items-center gap-2 bg-slate-950 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-300">
      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-semibold text-slate-300">Grounded in:</span>
        <span className="bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
          Step {currentStep.step + 1}
        </span>
        <span className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
          Line {currentStep.line}
        </span>
        <span className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold uppercase">
          {currentStep.event}
        </span>
        {algorithmTitle && (
          <span className="text-slate-400 text-[11px] font-sans truncate max-w-[150px]">
            ({algorithmTitle})
          </span>
        )}
      </div>
    </div>
  );
};
