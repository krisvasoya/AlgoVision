import React from "react";
import type { StackVisualState } from "@/types/visualization";
import { ArrowLeft } from "lucide-react";

interface StackRendererProps {
  state: StackVisualState;
}

export function StackRenderer({ state }: StackRendererProps) {
  const { elements, topIndex } = state.data;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden select-none">
      <div className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
        Stack Container (LIFO - Last In, First Out)
      </div>

      <div className="flex flex-col-reverse items-center gap-2 w-48 max-h-72 overflow-y-auto p-3 border-2 border-slate-700 rounded-lg bg-slate-950/70 shadow-inner">
        {elements.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-6">Empty Stack</div>
        ) : (
          elements.map((el, idx) => {
            const isTop = idx === topIndex;
            const isInserted = state.inserted?.includes(idx);
            const isRemoved = state.removed?.includes(idx);
            const isActive = state.active?.includes(idx);

            let bgStyle = "bg-slate-800 border-slate-700 text-slate-200";
            if (isTop) bgStyle = "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold";
            if (isInserted) bgStyle = "bg-emerald-500/30 border-emerald-500 text-emerald-200 font-bold";
            if (isRemoved) bgStyle = "bg-rose-500/30 border-rose-500 text-rose-200 font-bold";
            if (isActive) bgStyle = "bg-amber-500/30 border-amber-500 text-amber-200 font-bold";

            return (
              <div
                key={el.id}
                className={`w-full py-2.5 px-4 rounded-md border text-center font-mono font-semibold text-sm transition-all duration-200 flex items-center justify-between shadow ${bgStyle}`}
              >
                <span>{el.value}</span>
                {isTop && (
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    <ArrowLeft className="w-3 h-3" /> TOP
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
