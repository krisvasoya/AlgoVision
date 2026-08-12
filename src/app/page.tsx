"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlgorithmHeader, LearningMode } from "@/components/layout/AlgorithmHeader";
import { EducationalInfo } from "@/components/explanation/EducationalInfo";
import { PracticeModePanel } from "@/components/practice/PracticeModePanel";
import { Visualizer } from "@/components/visualizers/Visualizer";
import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { VariableInspector } from "@/components/variables/VariableInspector";
import { ExplanationPanel } from "@/components/explanation/ExplanationPanel";
import { Timeline } from "@/components/timeline/Timeline";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { useExecutionStore } from "@/stores/execution-store";
import { ALGORITHM_REGISTRY } from "@/algorithms";
import { isArraySorted } from "@/algorithms/searching/binarySearch";
import { Dices, BarChart2, Search, AlertTriangle, ArrowUpDown, Bot, X } from "lucide-react";
import type { SearchInput } from "@/algorithms/searching/linearSearch";

export default function HomePage() {
  const { currentStep, currentStepIndex, trace, loadTrace, next, previous, first, isPlaying, play, pause } = useExecutionStore();

  const allAlgorithms = ALGORITHM_REGISTRY.getAll();
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>("bubble-sort");
  const [inputArray, setInputArray] = useState<number[]>([7, 2, 9, 1, 5]);
  const [customInputText, setCustomInputText] = useState<string>("7, 2, 9, 1, 5");
  const [numberInputVal, setNumberInputVal] = useState<number>(3);
  const [targetValue, setTargetValue] = useState<number>(70);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>("learn");
  const [showTutorPanel, setShowTutorPanel] = useState<boolean>(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeAlgorithm = ALGORITHM_REGISTRY.get(selectedAlgoId) || allAlgorithms[0];
  const inputSchema = activeAlgorithm?.inputSchema;
  const isNumberAlgo = inputSchema?.fields[0]?.type === "number" || activeAlgorithm?.category === "recursion";
  const showRandomize = inputSchema?.showRandomize !== false && !isNumberAlgo && activeAlgorithm?.id !== "graph-demo";
  const isSearchAlgo = inputSchema?.hasTarget ?? activeAlgorithm?.category === "searching";

  // Re-generate execution trace when algorithm or input changes
  const runAlgorithmTrace = (algoId: string, arr: number[], target: number, numVal: number = 3) => {
    const algo = ALGORITHM_REGISTRY.get(algoId);
    if (!algo) return;

    if (algo.id === "binary-search") {
      if (!isArraySorted(arr)) {
        setValidationError("Binary Search requires a sorted array.");
        return;
      }
    }

    setValidationError(null);

    try {
      if (algo.id === "graph-demo") {
        const graphTrace = algo.generateTrace(null);
        loadTrace(graphTrace);
      } else if (algo.category === "recursion") {
        if (algo.id === "recursive-binary-search") {
          const trace = algo.generateTrace({ array: arr, target } as unknown as SearchInput);
          loadTrace(trace);
        } else if (algo.id === "tower-of-hanoi") {
          const disks = Math.min(Math.max(numVal, 1), 5);
          const trace = algo.generateTrace(disks as unknown as SearchInput);
          loadTrace(trace);
        } else if (algo.id === "factorial") {
          const num = Math.min(Math.max(numVal, 1), 7);
          const trace = algo.generateTrace(num as unknown as SearchInput);
          loadTrace(trace);
        } else if (algo.id === "fibonacci") {
          const num = Math.min(Math.max(numVal, 0), 7);
          const trace = algo.generateTrace(num as unknown as SearchInput);
          loadTrace(trace);
        } else {
          const trace = algo.generateTrace(4 as unknown as SearchInput);
          loadTrace(trace);
        }
      } else if (algo.category === "searching") {
        const searchTrace = algo.generateTrace({ array: arr, target } as unknown as SearchInput);
        loadTrace(searchTrace);
      } else {
        const trace = algo.generateTrace(arr as unknown as SearchInput);
        loadTrace(trace);
      }
    } catch (err: any) {
      setValidationError(err.message || "Failed to generate trace for algorithm.");
    }
  };

  // Initial load
  useEffect(() => {
    runAlgorithmTrace(selectedAlgoId, inputArray, targetValue, numberInputVal);
  }, [selectedAlgoId]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        previous();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        first();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, play, pause, next, previous, first]);

  const handleAlgoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedAlgoId(newId);

    const newAlgo = ALGORITHM_REGISTRY.get(newId);
    const defaultNum = newAlgo?.inputSchema?.fields[0]?.defaultValue ?? 3;
    setNumberInputVal(defaultNum);

    if (newAlgo?.id === "binary-search") {
      if (!isArraySorted(inputArray)) {
        setValidationError("Binary Search requires a sorted array.");
      } else {
        runAlgorithmTrace(newId, inputArray, targetValue, defaultNum);
      }
    } else {
      runAlgorithmTrace(newId, inputArray, targetValue, defaultNum);
    }
  };

  const handleExplicitSortInput = () => {
    const sorted = [...inputArray].sort((a, b) => a - b);
    setInputArray(sorted);
    setCustomInputText(sorted.join(", "));
    setValidationError(null);
    runAlgorithmTrace(selectedAlgoId, sorted, targetValue, numberInputVal);
  };

  const handleRandomize = () => {
    const len = Math.floor(Math.random() * 3) + 5;
    const randomArr = Array.from({ length: len }, () => Math.floor(Math.random() * 19) + 1);

    setInputArray(randomArr);
    setCustomInputText(randomArr.join(", "));

    const newTarget = isSearchAlgo
      ? randomArr[Math.floor(Math.random() * randomArr.length)]
      : targetValue;
    if (isSearchAlgo) setTargetValue(newTarget);

    if (selectedAlgoId === "binary-search" && !isArraySorted(randomArr)) {
      setValidationError("Binary Search requires a sorted array.");
    } else {
      runAlgorithmTrace(selectedAlgoId, randomArr, newTarget, numberInputVal);
    }
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNumberAlgo) {
      runAlgorithmTrace(selectedAlgoId, inputArray, targetValue, numberInputVal);
      return;
    }

    const parsed = customInputText
      .split(",")
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));

    if (parsed.length >= 2 && parsed.length <= 12) {
      setInputArray(parsed);
      if (selectedAlgoId === "binary-search" && !isArraySorted(parsed)) {
        setValidationError("Binary Search requires a sorted array.");
      } else {
        runAlgorithmTrace(selectedAlgoId, parsed, targetValue, numberInputVal);
      }
    }
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const num = isNaN(val) ? 0 : val;
    setTargetValue(num);
    if (!validationError) {
      runAlgorithmTrace(selectedAlgoId, inputArray, num, numberInputVal);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Header />

      {/* Algorithm Header */}
      <AlgorithmHeader
        algorithm={activeAlgorithm}
        activeMode={learningMode}
        onModeChange={(mode) => setLearningMode(mode)}
      />

      {/* Declarative Control Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-2 bg-slate-900/60 border-b border-slate-800 gap-3 text-xs shrink-0">
        <div className="flex items-center gap-4">
          {/* Algorithm Selector Dropdown */}
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedAlgoId}
              onChange={handleAlgoSelectChange}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1 font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {allAlgorithms.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.title} ({algo.category})
                </option>
              ))}
            </select>
          </div>

          {/* Declarative Input Form */}
          <form onSubmit={handleCustomInputSubmit} className="flex items-center gap-2">
            {isNumberAlgo ? (
              <>
                <span className="text-slate-400 font-medium">
                  {inputSchema?.fields[0]?.label || "Number of Disks"}:
                </span>
                <input
                  type="number"
                  min={inputSchema?.fields[0]?.validation?.min ?? 1}
                  max={inputSchema?.fields[0]?.validation?.max ?? 5}
                  value={numberInputVal}
                  onChange={(e) => setNumberInputVal(parseInt(e.target.value, 10) || 1)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 font-mono text-slate-200 w-16 focus:outline-none focus:border-indigo-500"
                />
              </>
            ) : (
              <>
                <span className="text-slate-400 font-medium">Input Array:</span>
                <input
                  type="text"
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 font-mono text-slate-200 w-36 focus:outline-none focus:border-indigo-500"
                  placeholder="7, 2, 9, 1, 5"
                />
              </>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Apply
            </button>
          </form>

          {/* Search Target Input */}
          {isSearchAlgo && (
            <div className="flex items-center gap-2 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-500/30">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300 font-medium">Target:</span>
              <input
                type="number"
                value={targetValue}
                onChange={handleTargetChange}
                className="bg-slate-950 border border-indigo-500/40 rounded px-2 py-0.5 font-mono text-indigo-200 w-16 focus:outline-none"
              />
            </div>
          )}

          {/* Randomize Button (Only shown when declarative schema permits) */}
          {showRandomize && (
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-medium border border-indigo-500/30 transition-colors"
            >
              <Dices className="w-3.5 h-3.5" /> Randomize
            </button>
          )}
        </div>

        {/* AI Tutor Toggle Button */}
        <div className="flex items-center gap-3">
          {validationError && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-1 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">{validationError}</span>
              <button
                onClick={handleExplicitSortInput}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold border border-amber-500/40 transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" /> Sort Input
              </button>
            </div>
          )}

          <button
            onClick={() => setShowTutorPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-bold transition-all border ${
              showTutorPanel
                ? "bg-emerald-600 text-white border-emerald-500 shadow"
                : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow"
            }`}
          >
            {showTutorPanel ? <X className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            {showTutorPanel ? "Close AI Tutor" : "Grounded AI Tutor"}
          </button>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden min-h-0">
        {/* Left Column: Visualizer & Code Editor / Practice Mode */}
        <div className={`flex flex-col gap-3 min-h-0 min-w-0 ${showTutorPanel ? "lg:col-span-8" : "lg:col-span-12"}`}>
          {learningMode === "practice" ? (
            <div className="flex-1 min-h-0">
              <PracticeModePanel currentStepIndex={currentStepIndex} trace={trace} onNextStep={next} />
            </div>
          ) : (
            <>
              {/* Primary Visualization Canvas */}
              <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                <Visualizer />
              </div>

              {/* Sub-Panel Grid: Code Editor, Variables, Explanation */}
              <div className="h-[260px] grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0">
                <div className="md:col-span-5 h-full overflow-hidden">
                  <CodeEditor code={trace?.sourceCode || activeAlgorithm.sourceCode} currentLine={currentStep?.line} />
                </div>
                <div className="md:col-span-4 h-full overflow-hidden">
                  <VariableInspector variables={currentStep?.variables} />
                </div>
                <div className="md:col-span-3 h-full overflow-hidden">
                  <ExplanationPanel
                    description={currentStep?.metadata?.description}
                    event={currentStep?.event}
                    complexityHint={`Time: ${activeAlgorithm.complexity.average} | Space: ${activeAlgorithm.complexity.space}`}
                  />
                </div>
              </div>

              {/* Educational Algorithm Info */}
              <div className="shrink-0">
                <EducationalInfo algorithm={activeAlgorithm} />
              </div>
            </>
          )}

          {/* Execution Step & Timeline Controls */}
          <div className="shrink-0">
            <Timeline />
          </div>
        </div>

        {/* Right Collapsible Column: Grounded AI Tutor */}
        {showTutorPanel && (
          <aside className="lg:col-span-4 h-full min-h-0 min-w-0 overflow-hidden bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col">
            <TutorPanel onClose={() => setShowTutorPanel(false)} />
          </aside>
        )}
      </main>

      <Footer />
    </div>
  );
}
