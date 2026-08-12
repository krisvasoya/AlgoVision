"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { Timeline } from "@/components/timeline/Timeline";
import { VariableInspector } from "@/components/variables/VariableInspector";
import { CallStackRenderer } from "@/components/visualizers/CallStackRenderer";
import { Visualizer } from "@/components/visualizers/Visualizer";
import { useExecutionStore } from "@/stores/execution-store";
import { SandboxRuntime } from "@/engine/runtime/SandboxRuntime";
import { CodeAnalyzer } from "@/engine/analysis/CodeAnalyzer";
import { VisualizationInferenceEngine } from "@/engine/visualization/VisualizationInferenceEngine";
import { VisualStateBuilder } from "@/engine/visualization/VisualStateBuilder";
import type { InferredVisualization } from "@/engine/visualization/types";
import { Play, Square, RotateCcw, Terminal, AlertTriangle, ShieldCheck, Eye, Sparkles } from "lucide-react";

const PRESETS = [
  {
    id: "add",
    name: "1. Arithmetic Add",
    code: `function add(a, b) {\n  return a + b;\n}`,
    input: `{\n  "a": 5,\n  "b": 7\n}`,
  },
  {
    id: "max",
    name: "2. Condition Max",
    code: `function max(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}`,
    input: `{\n  "a": 12,\n  "b": 8\n}`,
  },
  {
    id: "sum",
    name: "3. Loop Sum",
    code: `function sum(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total = total + i;\n  }\n  return total;\n}`,
    input: `{\n  "n": 5\n}`,
  },
  {
    id: "factorial",
    name: "4. Recursion Factorial",
    code: `function factorial(n) {\n  if (n <= 1) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}`,
    input: `{\n  "n": 4\n}`,
  },
  {
    id: "linearSearch",
    name: "5. Array Linear Search",
    code: `function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}`,
    input: `{\n  "arr": [10, 20, 30, 40, 50],\n  "target": 30\n}`,
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

      // 2. Safe Execution
      const result = SandboxRuntime.execute(code, parsedArgs, { maxSteps: 1000, maxTimeMs: 1000 });

      if (result.status === "completed") {
        // 3. Visualization Inference
        let inferred = VisualizationInferenceEngine.infer(analysis, result.events, code);

        if (manualOverride !== "automatic" && manualOverride !== "none") {
          inferred = {
            type: manualOverride as any,
            confidence: 1.0,
            explanation: `Manual override selected: ${manualOverride.toUpperCase()}`,
            observedBehaviors: ["User-selected visualization mode"],
          };
        }

        setInference(inferred);

        // 4. VisualState Trace Adapter
        const trace = VisualStateBuilder.buildTrace(code, parsedArgs, result.events, inferred);
        loadTrace(trace);

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
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
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
                  Confidence: Math.round({inference.confidence * 100})%
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans">{inference.explanation}</p>

              {inference.observedBehaviors.length > 0 && (
                <div className="mt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Observed Behaviors:</span>
                  <ul className="text-xs font-mono text-slate-400 list-disc list-inside space-y-0.5">
                    {inference.observedBehaviors.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Execution Status Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 shadow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Status</span>
              <span
                className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded border uppercase ${
                  status === "completed"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                    : status === "error"
                    ? "bg-rose-950 text-rose-300 border-rose-500/40"
                    : status === "running"
                    ? "bg-indigo-950 text-indigo-300 border-indigo-500/40 animate-pulse"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {status}
              </span>
            </div>

            {status === "completed" && (
              <div className="text-xs font-mono space-y-1 text-slate-300 mt-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Return Value:</span>
                  <span>{JSON.stringify(executionOutput.returnValue)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Total Steps: {executionOutput.stepCount}</span>
                  <span>Execution Time: {executionOutput.durationMs}ms</span>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg flex items-start gap-2 mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-bold block">Execution Error:</span>
                  <span>{executionOutput.error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Universal Visualizer Preview */}
          <div className="h-[220px]">
            <Visualizer state={currentStep?.state} />
          </div>

          {/* Timeline */}
          <Timeline />

          {/* Active Call Stack */}
          <div className="h-[180px]">
            <CallStackRenderer runtimeState={currentStep?.runtimeState} />
          </div>

          {/* Variables Inspector */}
          <VariableInspector variables={currentStep?.variables} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
