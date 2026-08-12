import React from "react";
import type { HanoiVisualState } from "@/types/visualization";
import { CallStackRenderer } from "./CallStackRenderer";
import { Layers, ArrowRight, Activity } from "lucide-react";

interface HanoiRendererProps {
  state: HanoiVisualState;
}

export function HanoiRenderer({ state }: HanoiRendererProps) {
  const { rods } = state.data;
  const movedDisk = state.movedDisk;

  const rodKeys: Array<"A" | "B" | "C"> = ["A", "B", "C"];

  return (
    <div className="w-full h-full min-w-0 min-h-0 overflow-hidden select-none grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* Left Column: Visual Canvas + Semantic Operation Panel (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full min-w-0 min-h-0">
        {/* Hanoi Visualization Canvas */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden min-w-0 min-h-0 shadow">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between w-full shrink-0">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Tower of Hanoi Visualization
            </span>
          </div>

          <div className="flex-1 w-full flex items-end justify-around pb-4 px-2 pt-6 min-w-0 min-h-0">
            {rodKeys.map((rodKey) => {
              const diskStack = rods[rodKey] || [];

              return (
                <div key={rodKey} className="flex flex-col items-center relative w-1/3 max-w-[160px] min-w-0">
                  {/* Rod Vertical Pole */}
                  <div className="w-3 bg-slate-700 h-44 rounded-t-md relative z-0 flex flex-col-reverse items-center pb-1">
                    {/* Disks stacked vertically on rod */}
                    {diskStack.map((disk) => {
                      const widthPx = Math.min(28 + disk.size * 20, 140);

                      return (
                        <div
                          key={disk.id}
                          style={{
                            width: `${widthPx}px`,
                            backgroundColor: disk.color || "#6366f1",
                          }}
                          className="h-6 rounded-md my-0.5 border border-slate-950 flex items-center justify-center font-mono font-bold text-xs text-white shadow z-10 transition-all duration-300"
                        >
                          {disk.size}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rod Base Wooden Block */}
                  <div className="w-full h-5 bg-slate-800 border-t-2 border-slate-700 rounded-md mt-1 flex items-center justify-center font-mono font-bold text-xs text-slate-300 shadow">
                    ROD {rodKey}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Semantic Current Operation Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shrink-0 shadow font-mono text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" /> Current Operation:
          </span>
          {movedDisk ? (
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 px-3 py-1 rounded-lg font-bold">
              <span>Moved Disk {movedDisk.size}</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rod {movedDisk.from} → Rod {movedDisk.to}</span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Waiting for execution step...</span>
          )}
        </div>
      </div>

      {/* Right Column: Call Stack (4 Cols) */}
      <div className="lg:col-span-4 h-full min-w-0 min-h-0 overflow-hidden">
        <CallStackRenderer runtimeState={state.runtimeState} />
      </div>
    </div>
  );
}
