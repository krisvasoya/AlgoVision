import React from "react";
import type { RuntimeState } from "@/types/execution";
import { Layers, ArrowDown } from "lucide-react";

interface CallStackRendererProps {
  runtimeState?: RuntimeState;
}

export function CallStackRenderer({ runtimeState }: CallStackRendererProps) {
  const stack = runtimeState?.callStack || [];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner select-none overflow-hidden">
      <div className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" /> Active Call Stack Frames
        </span>
        <span className="text-[11px] font-mono text-slate-400">Depth: {stack.length}</span>
      </div>

      <div className="flex-1 flex flex-col-reverse gap-2 overflow-y-auto pr-1">
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
                className={`p-3 rounded-lg border font-mono text-xs transition-all duration-200 shadow ${
                  isActive
                    ? "bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/40"
                    : "bg-slate-900/80 border-slate-800 text-slate-300 opacity-90"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 border-b border-slate-800/80 pb-1">
                  <span className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ACTIVE
                      </span>
                    )}
                    {frame.functionName}(
                    {paramEntries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ")})
                  </span>
                  {frame.currentLine && (
                    <span className="text-[10px] text-slate-500">L{frame.currentLine}</span>
                  )}
                </div>

                {/* Parameters & Local Variables */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mt-1">
                  {paramEntries.length > 0 && (
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Params:</span>
                      {paramEntries.map(([k, v]) => (
                        <div key={k} className="text-slate-300">
                          <span className="text-indigo-400">{k}</span>: {JSON.stringify(v)}
                        </div>
                      ))}
                    </div>
                  )}

                  {localEntries.length > 0 && (
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block mb-0.5">Locals:</span>
                      {localEntries.map(([k, v]) => (
                        <div key={k} className="text-slate-300">
                          <span className="text-amber-400">{k}</span>: {JSON.stringify(v)}
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
