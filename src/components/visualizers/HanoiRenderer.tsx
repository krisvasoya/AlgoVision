import React from "react";
import type { HanoiVisualState } from "@/types/visualization";
import { CallStackRenderer } from "./CallStackRenderer";
import { Layers } from "lucide-react";

interface HanoiRendererProps {
  state: HanoiVisualState;
}

export function HanoiRenderer({ state }: HanoiRendererProps) {
  const { rods } = state.data;
  const movedDisk = state.movedDisk;

  const rodKeys: Array<"A" | "B" | "C"> = ["A", "B", "C"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full w-full select-none min-w-0">
      {/* Main Rods & Disks Display (Takes 2 Columns) */}
      <div className="md:col-span-2 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden min-w-0">
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between w-full">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Tower of Hanoi
          </span>
          {movedDisk && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              MOVED DISK {movedDisk.size}: {movedDisk.from} → {movedDisk.to}
            </span>
          )}
        </div>

        <div className="flex-1 w-full flex items-end justify-around pb-4 px-2 pt-8 min-w-0">
          {rodKeys.map((rodKey) => {
            const diskStack = rods[rodKey] || [];

            return (
              <div key={rodKey} className="flex flex-col items-center relative w-1/3 max-w-[160px] min-w-0">
                {/* Rod Vertical Pole */}
                <div className="w-3 bg-slate-700 h-40 rounded-t-md relative z-0 flex flex-col-reverse items-center pb-1">
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

      {/* Live Call Stack Panel (Takes 1 Column) */}
      <div className="md:col-span-1 h-full min-w-0">
        <CallStackRenderer runtimeState={state.runtimeState} />
      </div>
    </div>
  );
}
