"use client";

import React from "react";
import { Variable, ArrowUpRight } from "lucide-react";
import { useExecutionStore } from "@/stores/execution-store";

interface VariableInspectorProps {
  variables?: Record<string, unknown>;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({ variables }) => {
  const { currentStepIndex, trace } = useExecutionStore();

  const currentVars = variables || {};
  const entries = Object.entries(currentVars);

  // Retrieve previous step variables for delta comparison
  const previousStep = trace && currentStepIndex > 0 ? trace.steps[currentStepIndex - 1] : null;
  const previousVars = previousStep?.variables || {};

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Variable className="w-4 h-4 text-emerald-400" /> Runtime Variables
        </h2>
        <span className="text-xs font-mono text-slate-500">{entries.length} active</span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
        {entries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entries.map(([key, val]) => {
              const prevVal = previousVars[key];
              const isChanged =
                previousStep !== null &&
                key in previousVars &&
                JSON.stringify(val) !== JSON.stringify(prevVal);

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300 ${
                    isChanged
                      ? "bg-amber-950/40 border-amber-500/60 shadow-sm shadow-amber-500/20 scale-[1.02]"
                      : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-semibold">{key}</span>
                    {isChanged && (
                      <span className="text-[10px] text-amber-400 font-sans font-medium px-1 rounded bg-amber-500/10 border border-amber-500/30 flex items-center gap-0.5">
                        <ArrowUpRight className="w-2.5 h-2.5" /> updated
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded border transition-colors ${
                      isChanged
                        ? "text-amber-300 bg-amber-950/60 border-amber-500/40"
                        : "text-emerald-400 bg-emerald-950/40 border-emerald-800/30"
                    }`}
                  >
                    {JSON.stringify(val)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
            No variables in current scope
          </div>
        )}
      </div>
    </div>
  );
};
