"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { Visualizer } from "@/components/visualizers/Visualizer";
import { Timeline } from "@/components/timeline/Timeline";
import { VariableInspector } from "@/components/variables/VariableInspector";
import { ExecutionEngine } from "@/engine/execution/ExecutionEngine";
import { CodeAnalyzer } from "@/engine/static-analysis/CodeAnalyzer";
import { VisualizationInferenceEngine } from "@/engine/visualization/VisualizationInferenceEngine";
import { useExecutionStore } from "@/stores/execution-store";
import type { InferredVisualization } from "@/types/visualization";
import { Play, Square, RotateCcw, Sparkles, Eye, Terminal, ShieldCheck } from "lucide-react";

interface PresetCode {
  id: string;
  name: string;
  code: string;
  input: string;
}

const PRESETS: PresetCode[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    code: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
    input: `{\n  "arr": [64, 34, 25, 12, 22, 11]\n}`,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    input: `{\n  "arr": [10, 20, 30, 40, 50],\n  "target": 30\n}`,
  },
  {
    id: "linked-list",
    name: "Linked List Traversal",
    code: `function traverse(head) {
  let current = head;
  let sum = 0;
  while (current !== null) {
    sum += current.val;
    current = current.next;
  }
  return sum;
}`,
    input: `{\n  "head": {\n    "val": 10,\n    "next": {\n      "val": 20,\n      "next": {\n        "val": 30,\n        "next": null\n      }\n    }\n  }\n}`,
  },
  {
    id: "factorial",
    name: "Recursion (Factorial)",
    code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
    input: `{\n  "n": 5\n}`,
  },
];

export default function PlaygroundPage() {
  const [selectedPreset, setSelectedPreset] = useState("factorial");
  const [code, setCode] = useState(PRESETS[3].code);
  const [inputJson, setInputJson] = useState(PRESETS[3].input);

  const [manualOverride, setManualOverride] = useState<string>("automatic");
  const [inference, setInference] = useState<InferredVisualization | null>(null);

  const [status, setStatus] = useState<"ready" | "running" | "completed" | "stopped" | "error">("ready");
  const [executionOutput, setExecutionOutput] = useState<{
    returnValue?: unknown;
    stepCount?: number;
    durationMs?: number;
    error?: string;
  }>({});

  const { loadTrace, currentStep, reset } = useExecutionStore();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setCode(preset.code);
      setInputJson(preset.input);
      setStatus("ready");
      setInference(null);
      setExecutionOutput({});
      reset();
    }
  };

  const handleRun = () => {
    setStatus("running");
    setExecutionOutput({});

    try {
      const parsedArgs = JSON.parse(inputJson);

      // 1. Static Analysis
      const analysis = CodeAnalyzer.analyze(code);
      if (!analysis.isValid) {
        setStatus("error");
        setExecutionOutput({
          error: `STATIC_ANALYSIS_ERROR: ${analysis.errors.join(", ")}`,
        });
        return;
      }

      // 2. Execution via Bounded Sandboxed Interpreter
      const argsArray = Object.values(parsedArgs);
      const result = ExecutionEngine.execute(code, argsArray);

      if (result.success && result.trace) {
        // 3. Automatic Visualization Inference
        let inferred = VisualizationInferenceEngine.inferVisualization(result.trace);

        // Apply Manual Override if specified
        if (manualOverride !== "automatic") {
          inferred = {
            type: manualOverride as any,
            confidence: 1.0,
            rationale: ["User manual visualization override enforced."],
            derivedState: inferred.derivedState,
          };
        }

        setInference(inferred);
        loadTrace(result.trace);
        setStatus("completed");
        setExecutionOutput({
          returnValue: result.returnValue,
          stepCount: result.stepCount,
          durationMs: result.durationMs,
        });
      } else {
        setStatus("error");
        setExecutionOutput({
          error: result.error,
          stepCount: result.stepCount,
          durationMs: result.durationMs,
        });
      }
    } catch (err: any) {
      setStatus("error");
      setExecutionOutput({
        error: `INVALID_INPUT: JSON parsing error - ${err.message}`,
      });
    }
  };

  const handleStop = () => {
    setStatus("stopped");
    reset();
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor, Presets & Manual Override (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-sm text-slate-200">Sandboxed JS Runtime & Inference Playground</h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Level 2 Bounded Sandbox
            </span>
          </div>

          {/* Preset Selector & Manual Override */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900/60 p-2.5 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Presets:
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap border ${
                    selectedPreset === preset.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Manual Override Selector */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={manualOverride}
                onChange={(e) => setManualOverride(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="automatic">Automatic Inference</option>
                <option value="array">Array</option>
                <option value="stack">Stack</option>
                <option value="queue">Queue</option>
                <option value="linked-list">Linked List</option>
                <option value="tree">Tree</option>
                <option value="graph">Graph</option>
                <option value="recursion">Recursion</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div className="h-[340px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <CodeEditor code={code} currentLine={currentStep?.line} readOnly={false} onChange={(val) => setCode(val)} />
          </div>

          {/* Argument Input Config & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Function Arguments (JSON)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRun}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Play className="w-4 h-4 fill-white" /> Run Sandbox
                </button>
                <button
                  onClick={handleStop}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Square className="w-3.5 h-3.5 fill-slate-300" /> Stop
                </button>
                <button
                  onClick={() => reset()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Column: Inferred Visualization Preview & Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Automatic Detection Panel */}
          {inference && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 shadow">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Detected Visualization: {inference.type.toUpperCase()}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    inference.confidence >= 0.8
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  }`}
                >
                  Confidence: {Math.round(inference.confidence * 100)}%
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 mt-1 font-mono">
                {inference.rationale.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-indigo-400">•</span> {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Visualization Frame */}
          <div className="h-[300px] bg-slate-900 border border-slate-800 rounded-xl p-2 shadow overflow-hidden">
            <Visualizer />
          </div>

          {/* Execution Step & Timeline Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <Timeline />
          </div>

          {/* Scope Inspector & Execution Output Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[220px]">
              <VariableInspector variables={currentStep?.variables} />
            </div>

            <div className="h-[220px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                Execution Output & Telemetry
              </div>
              <div className="flex-1 font-mono text-xs overflow-auto py-2 text-slate-300 space-y-1">
                <div>Status: <span className="text-indigo-400 font-bold uppercase">{status}</span></div>
                {executionOutput.durationMs !== undefined && (
                  <div>Execution Time: <span className="text-emerald-400">{executionOutput.durationMs.toFixed(2)} ms</span></div>
                )}
                {executionOutput.stepCount !== undefined && (
                  <div>Recorded Trace Steps: <span className="text-amber-400">{executionOutput.stepCount}</span></div>
                )}
                {executionOutput.returnValue !== undefined && (
                  <div className="text-emerald-300 font-bold">Return Value: {JSON.stringify(executionOutput.returnValue)}</div>
                )}
                {executionOutput.error && (
                  <div className="text-rose-400 font-bold break-all">Error: {executionOutput.error}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
