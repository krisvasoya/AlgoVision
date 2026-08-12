"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useExecutionStore } from "@/stores/execution-store";

export const Timeline: React.FC = () => {
  const {
    currentStepIndex,
    totalSteps,
    isPlaying,
    speed,
    next,
    previous,
    first,
    last,
    jumpTo,
    reset,
    play,
    pause,
    setSpeed,
  } = useExecutionStore();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    jumpTo(Number(e.target.value));
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-900/90 p-4 flex flex-col gap-3">
      {/* Timeline Scrubbing Bar */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-slate-400 w-20 text-right">
          Step {totalSteps > 0 ? currentStepIndex + 1 : 0} / {totalSteps}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={handleSliderChange}
          disabled={totalSteps === 0}
          className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={reset}
            disabled={totalSteps === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={first}
            disabled={totalSteps === 0 || currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="First Step"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={previous}
            disabled={totalSteps === 0 || currentStepIndex === 0}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={isPlaying ? pause : play}
            disabled={totalSteps === 0}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-40 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={next}
            disabled={totalSteps === 0 || currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={last}
            disabled={totalSteps === 0 || currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Last Step"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Speed:</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={3100 - speed}
            onChange={(e) => setSpeed(3100 - Number(e.target.value))}
            className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-xs font-mono text-slate-400 w-12 text-right">{speed}ms</span>
        </div>
      </div>
    </footer>
  );
};
