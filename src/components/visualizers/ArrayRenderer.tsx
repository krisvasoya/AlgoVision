"use client";

import React from "react";
import type { ArrayVisualState, ArrayElement, ElementHighlightState } from "@/types/visualization";
import { cn } from "@/lib/utils";

interface ArrayRendererProps {
  state?: ArrayVisualState;
}

const highlightStyles: Record<ElementHighlightState, { card: string; bar: string; badge: string }> = {
  default: {
    card: "bg-slate-800 border-slate-700 text-slate-200",
    bar: "fill-slate-700/80 stroke-slate-600",
    badge: "bg-slate-800 text-slate-400 border-slate-700",
  },
  active: {
    card: "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105",
    bar: "fill-indigo-500/90 stroke-indigo-300",
    badge: "bg-indigo-950 text-indigo-300 border-indigo-500/50",
  },
  compared: {
    card: "bg-amber-600/90 border-amber-400 text-white shadow-lg shadow-amber-500/30 scale-105",
    bar: "fill-amber-500/90 stroke-amber-300",
    badge: "bg-amber-950 text-amber-300 border-amber-500/50",
  },
  swapped: {
    card: "bg-rose-600/90 border-rose-400 text-white shadow-lg shadow-rose-500/30 scale-105",
    bar: "fill-rose-500/90 stroke-rose-300",
    badge: "bg-rose-950 text-rose-300 border-rose-500/50",
  },
  sorted: {
    card: "bg-emerald-600/90 border-emerald-400 text-white shadow-md shadow-emerald-500/20",
    bar: "fill-emerald-500/80 stroke-emerald-300",
    badge: "bg-emerald-950 text-emerald-300 border-emerald-500/50",
  },
  modified: {
    card: "bg-cyan-600/90 border-cyan-400 text-white shadow-md shadow-cyan-500/20",
    bar: "fill-cyan-500/80 stroke-cyan-300",
    badge: "bg-cyan-950 text-cyan-300 border-cyan-500/50",
  },
  visited: {
    card: "bg-purple-600/90 border-purple-400 text-white",
    bar: "fill-purple-500/80 stroke-purple-300",
    badge: "bg-purple-950 text-purple-300 border-purple-500/50",
  },
};

export const ArrayRenderer: React.FC<ArrayRendererProps> = ({ state }) => {
  if (!state || !state.data || !state.data.elements || state.data.elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
        Array visualizer ready. Load algorithm trace to render elements.
      </div>
    );
  }

  const { elements } = state.data;
  const numericValues = elements
    .map((e: ArrayElement) => (typeof e.value === "number" ? e.value : parseFloat(String(e.value)) || 1))
    .filter((v: number) => !isNaN(v));
  const maxValue = Math.max(...numericValues, 1);

  // SVG parameters (Flexible Height Scaling)
  const svgHeight = 150;
  const barWidth = 44;
  const gap = 16;
  const totalWidth = elements.length * (barWidth + gap) + gap;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 overflow-x-auto select-none min-w-0">
      {/* SVG Bar Chart Overlay */}
      <div className="w-full flex justify-center mb-3">
        <svg
          viewBox={`0 0 ${totalWidth} ${svgHeight}`}
          width={totalWidth}
          height={svgHeight}
          className="overflow-visible drop-shadow"
        >
          {elements.map((item: ArrayElement, idx: number) => {
            const numVal = typeof item.value === "number" ? item.value : parseFloat(String(item.value)) || 1;
            const barHeight = Math.max(20, (numVal / maxValue) * (svgHeight - 24));
            const x = gap + idx * (barWidth + gap);
            const y = svgHeight - barHeight;
            const style = highlightStyles[item.highlightState] || highlightStyles.default;

            return (
              <g key={`bar-${item.id}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  ry={6}
                  className={cn("transition-all duration-300 stroke-2", style.bar)}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-slate-300 font-mono text-xs font-bold"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* React Array Element Cards */}
      <div className="flex items-end gap-4 max-w-full overflow-x-auto pb-1">
        {elements.map((item: ArrayElement) => {
          const style = highlightStyles[item.highlightState] || highlightStyles.default;

          return (
            <div key={item.id} className="flex flex-col items-center gap-1.5 group">
              {/* Pointer Badges */}
              <div className="h-5 flex items-center gap-1">
                {item.pointers && item.pointers.length > 0 ? (
                  item.pointers.map((ptr: string, pIdx: number) => (
                    <span
                      key={pIdx}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border shadow-sm transition-all duration-200",
                        style.badge
                      )}
                    >
                      {ptr}
                    </span>
                  ))
                ) : (
                  <span className="h-4" />
                )}
              </div>

              {/* Card Box */}
              <div
                className={cn(
                  "w-12 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-base font-bold transition-all duration-300 select-none shadow-md",
                  style.card
                )}
              >
                {item.value}
              </div>

              {/* Index Label */}
              <span className="text-[11px] font-mono text-slate-400 font-semibold group-hover:text-slate-200 transition-colors">
                [{item.index}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
