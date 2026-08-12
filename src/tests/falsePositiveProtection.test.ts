import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";
import { VisualizationInferenceEngine } from "../engine/visualization/VisualizationInferenceEngine.ts";

describe("False-Positive Protection Unit Tests", () => {
  it("should NOT force Bubble Sort algorithm detection for normal array access", () => {
    const code = `function getFirst(arr) { return arr[0]; }`;
    const analysis = CodeAnalyzer.analyze(code);
    assert.notEqual(analysis.patternMetadata?.detectedPattern, "Bubble Sort");
  });

  it("should NOT infer Linked List for ordinary objects without .next pointer", () => {
    const code = `function processData(obj) { return obj.value + obj.id; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.notEqual(inference.type, "linked-list");
  });

  it("should NOT infer Tree for nested objects without .left and .right pointers", () => {
    const code = `function processNested(obj) { return obj.child.name; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.notEqual(inference.type, "tree");
  });

  it("should NOT infer Graph for arbitrary object collections without adjacency", () => {
    const code = `function processItems(items) { return items.length; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.notEqual(inference.type, "graph");
  });

  it("should guarantee 100% deterministic inference output for identical inputs across 10 runs", () => {
    const code = `function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); }`;
    const analysis = CodeAnalyzer.analyze(code);

    const ref = VisualizationInferenceEngine.infer(analysis, [], code);

    for (let r = 0; r < 10; r++) {
      const run = VisualizationInferenceEngine.infer(analysis, [], code);
      assert.equal(run.type, ref.type);
      assert.equal(run.confidence, ref.confidence);
      assert.equal(run.explanation, ref.explanation);
    }
  });
});
