import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";
import { VisualizationInferenceEngine } from "../engine/visualization/VisualizationInferenceEngine.ts";
import { VisualStateBuilder } from "../engine/visualization/VisualStateBuilder.ts";
import { assertEquivalentInference } from "./crossStyleEquivalence.test.ts";

describe("Visualization Inference Validation (Phase 10D) Unit Tests", () => {
  it("should demonstrate algorithm naming independence for mystery(values)", () => {
    const codeCanonical = `function bubbleSort(arr) { let temp = arr[0]; arr[0] = arr[1]; arr[1] = temp; return arr; }`;
    const codeMystery = `function mystery(values) { let temp = values[0]; values[0] = values[1]; values[1] = temp; return values; }`;

    assertEquivalentInference(codeCanonical, { arr: [5, 2] }, codeMystery, { values: [5, 2] });
  });

  it("should infer 'array' with high confidence across 3 Bubble Sort variants", () => {
    const variant1_temp = `function sort1(data) { let temp = data[0]; data[0] = data[1]; data[1] = temp; return data; }`;
    const variant2_destruct = `function sort2(data) { [data[0], data[1]] = [data[1], data[0]]; return data; }`;
    const variant3_whileFlag = `function sort3(data) { let swapped = true; while(swapped) { swapped = false; let temp = data[0]; data[0] = data[1]; data[1] = temp; } return data; }`;

    assertEquivalentInference(variant1_temp, { data: [5, 2] }, variant2_destruct, { data: [5, 2] });
    assertEquivalentInference(variant1_temp, { data: [5, 2] }, variant3_whileFlag, { data: [5, 2] });
  });

  it("should infer 'array' for Linear Search variants (for loop vs while loop)", () => {
    const searchFor = `function findFor(list, val) { for (let i = 0; i < list.length; i++) { if (list[i] === val) return i; } return -1; }`;
    const searchWhile = `function findWhile(list, val) { let i = 0; while(i < list.length) { if (list[i] === val) return i; i++; } return -1; }`;

    assertEquivalentInference(searchFor, { list: [1, 2, 3], val: 2 }, searchWhile, { list: [1, 2, 3], val: 2 });
  });

  it("should infer 'graph' visualization for graph adjacency list traversal", () => {
    const graphCode = `function traverse(graph, start) { let neighbors = graph[start]; for (let i = 0; i < neighbors.length; i++) { let next = neighbors[i]; } }`;
    const analysis = CodeAnalyzer.analyze(graphCode);
    const res = SandboxRuntime.execute(graphCode, { graph: { 0: [1, 2] }, start: 0 });

    const inference = VisualizationInferenceEngine.infer(analysis, res.events, graphCode);
    assert.equal(inference.type, "graph");
    assert.equal(inference.confidence >= 0.8, true);
  });

  it("should enforce Manual Override Safety when requested state cannot be derived", () => {
    const arithmeticCode = `function add(a, b) { return a + b; }`;
    const analysis = CodeAnalyzer.analyze(arithmeticCode);
    const res = SandboxRuntime.execute(arithmeticCode, { a: 5, b: 7 });

    // Manually force "tree" override on arithmetic
    const manualTreeInference = {
      type: "tree" as const,
      confidence: 1.0,
      explanation: "Manual override selected: TREE",
      observedBehaviors: ["User override"],
    };

    const trace = VisualStateBuilder.buildTrace(arithmeticCode, { a: 5, b: 7 }, res.events, manualTreeInference);
    assert.equal(
      trace.steps[0].metadata?.conversionError,
      "Tree visualization cannot be derived from the current runtime state."
    );
  });

  it("should execute inference in under 50ms for 1,000 runtime events (Performance Benchmark)", () => {
    const code = `function sum(n) { let total = 0; for (let i = 1; i <= n; i++) { total += i; } return total; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const res = SandboxRuntime.execute(code, { n: 100 }); // Generates events

    const startTime = Date.now();
    for (let run = 0; run < 10; run++) {
      VisualizationInferenceEngine.infer(analysis, res.events, code);
    }
    const durationMs = Date.now() - startTime;

    assert.equal(durationMs < 50, true, `Inference benchmark took ${durationMs}ms (expected < 50ms)`);
  });
});
