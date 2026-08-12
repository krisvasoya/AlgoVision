import React from "react";
import type { AlgorithmDefinition } from "@/types/algorithm";
import Link from "next/link";
import { GraduationCap, HelpCircle, Award } from "lucide-react";

export type LearningMode = "learn" | "practice" | "exam";

interface AlgorithmHeaderProps {
  algorithm?: AlgorithmDefinition;
  activeMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
}

export function AlgorithmHeader({ algorithm, activeMode, onModeChange }: AlgorithmHeaderProps) {
  if (!algorithm) return null;

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Algorithm Meta */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">{algorithm.title}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs font-semibold border border-indigo-500/20 capitalize">
              {algorithm.category}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{algorithm.description}</p>
        </div>

        {/* Right Side: Mode Switcher & Complexity Pills */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onModeChange("learn")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeMode === "learn"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Learn
            </button>

            <button
              onClick={() => onModeChange("practice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeMode === "practice"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Practice
            </button>

            <Link
              href="/exam"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" /> Exam Mode
            </Link>
          </div>

          {/* Complexity Badges */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Best: <strong className="text-emerald-400">{algorithm.complexity.best}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Avg: <strong className="text-amber-400">{algorithm.complexity.average}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Worst: <strong className="text-rose-400">{algorithm.complexity.worst}</strong></span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Space: <strong className="text-indigo-400">{algorithm.complexity.space}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
