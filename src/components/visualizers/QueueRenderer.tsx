import React from "react";
import type { QueueVisualState } from "@/types/visualization";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QueueRendererProps {
  state: QueueVisualState;
}

export function QueueRenderer({ state }: QueueRendererProps) {
  const { elements, frontIndex, rearIndex } = state.data;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden select-none">
      <div className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
        Queue Container (FIFO - First In, First Out)
      </div>

      <div className="flex items-center gap-3 max-w-full overflow-x-auto p-4 border-y-2 border-slate-700 bg-slate-950/70 min-h-24">
        {elements.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-4 px-8">Empty Queue</div>
        ) : (
          elements.map((el, idx) => {
            const isFront = idx === frontIndex;
            const isRear = idx === rearIndex;
            const isInserted = state.inserted?.includes(idx);
            const isRemoved = state.removed?.includes(idx);
            const isActive = state.active?.includes(idx);

            let bgStyle = "bg-slate-800 border-slate-700 text-slate-200";
            if (isFront && isRear) bgStyle = "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold";
            else if (isFront) bgStyle = "bg-emerald-500/30 border-emerald-500 text-emerald-200 font-bold";
            else if (isRear) bgStyle = "bg-amber-500/30 border-amber-500 text-amber-200 font-bold";

            if (isInserted) bgStyle = "bg-emerald-500/40 border-emerald-400 text-emerald-100 font-bold";
            if (isRemoved) bgStyle = "bg-rose-500/40 border-rose-400 text-rose-100 font-bold";
            if (isActive) bgStyle = "bg-amber-500/40 border-amber-400 text-amber-100 font-bold";

            return (
              <div key={el.id} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="text-[10px] font-mono text-slate-400 h-4">
                  {isFront && <span className="text-emerald-400 font-bold">FRONT</span>}
                </div>

                <div
                  className={`w-14 h-14 rounded-lg border flex items-center justify-center font-mono font-bold text-base shadow transition-all duration-200 ${bgStyle}`}
                >
                  {el.value}
                </div>

                <div className="text-[10px] font-mono text-slate-400 h-4">
                  {isRear && <span className="text-amber-400 font-bold">REAR</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
