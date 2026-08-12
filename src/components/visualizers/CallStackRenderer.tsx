import React from "react";
import type { RuntimeState } from "@/types/execution";
import { Layers, ArrowDown } from "lucide-react";

interface CallStackRendererProps {
  runtimeState?: RuntimeState;
}

export function CallStackRenderer({ runtimeState }: CallStackRendererProps) {
  const stack = runtimeState?.callStack || [];

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner select-none overflow-hidden min-w-0">
      <div className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" /> Active Call Stack Frames
        </span>
        <span className="text-[11px] font-mono text-slate-400">Depth: {stack.length}</span>
      </div>

      <div className="flex-1 flex flex-col-reverse gap-2 overflow-y-auto overflow-x-hidden max-h-[320px] pr-1 min-w-0">
        {stack.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-6 text-center">Empty Call Stack (Execution Idle)</div>
        ) : (
          stack.map((frame, idx) => {
            const isActive = idx === stack.length - 1;
            const paramEntries = Object.entries(frame.parameters);
            const localEntries = Object.entries(frame.locals);

            return (
              <div
                key={frame.id}
                className={`p-3 rounded-lg border font-mono text-xs transition-all duration-200 shadow min-w-0 break-words ${
                  isActive
                    ? "bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/40"
                    : "bg-slate-900/80 border-slate-800 text-slate-300 opacity-90"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5 border-b border-slate-800/80 pb-1 gap-2">
                  <div className="font-bold text-sm text-indigo-300 flex flex-wrap items-center gap-1.5 min-w-0">
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold shrink-0">
                        ACTIVE
                      </span>
                    )}
                    <span className="break-all">{frame.functionName}</span>
                  </div>
                  {frame.currentLine && (
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">L{frame.currentLine}</span>
                  )}
                </div>

                {/* Parameters & Local Variables (Wrapped) */}
                <div className="flex flex-col gap-1.5 text-[11px] mt-1">
                  {paramEntries.length > 0 && (
                    <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Parameters:</span>
                      {paramEntries.map(([k, v]) => (
                        <div key={k} className="text-slate-300 break-all font-mono">
                          <span className="text-indigo-400 font-semibold">{k}</span> = {JSON.stringify(v)}
                        </div>
                      ))}
                    </div>
                  )}

                  {localEntries.length > 0 && (
                    <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Locals:</span>
                      {localEntries.map(([k, v]) => (
                        <div key={k} className="text-slate-300 break-all font-mono">
                          <span className="text-amber-400 font-semibold">{k}</span> = {JSON.stringify(v)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return value if resolved */}
                {frame.returnValue !== undefined && (
                  <div className="mt-2 pt-1 border-t border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" /> Returns: {JSON.stringify(frame.returnValue)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
