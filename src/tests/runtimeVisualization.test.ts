import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";
import { VisualizationInferenceEngine } from "../engine/visualization/VisualizationInferenceEngine.ts";
import { VisualStateBuilder } from "../engine/visualization/VisualStateBuilder.ts";

describe("Runtime Visualization Adaptation Unit Tests", () => {
  it("should build execution trace with inferred ArrayVisualState", () => {
    const code = `function linearSearch(arr, target) { for (let i = 0; i < arr.length; i++) { if (arr[i] === target) return i; } return -1; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const res = SandboxRuntime.execute(code, { arr: [10, 20, 30], target: 20 });
    const inference = VisualizationInferenceEngine.infer(analysis, res.events, code);

    const trace = VisualStateBuilder.buildTrace(code, { arr: [10, 20, 30], target: 20 }, res.events, inference);
    assert.equal(trace.steps.length > 0, true);
    assert.equal(trace.steps[0].state.type, "array");
  });

  it("should build execution trace with inferred RecursionVisualState", () => {
    const code = `function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); }`;
    const analysis = CodeAnalyzer.analyze(code);
    const res = SandboxRuntime.execute(code, { n: 4 });
    const inference = VisualizationInferenceEngine.infer(analysis, res.events, code);

    const trace = VisualStateBuilder.buildTrace(code, { n: 4 }, res.events, inference);
    assert.equal(trace.steps.length > 0, true);
    assert.equal(trace.steps[0].state.type, "recursion");
  });
});
