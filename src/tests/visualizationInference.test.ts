import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CodeAnalyzer } from "../engine/analysis/CodeAnalyzer.ts";
import { SandboxRuntime } from "../engine/runtime/SandboxRuntime.ts";
import { VisualizationInferenceEngine } from "../engine/visualization/VisualizationInferenceEngine.ts";

describe("Visualization Inference Engine Unit Tests", () => {
  it("should infer 'recursion' visualization type for factorial code with 100% confidence", () => {
    const code = `function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); }`;
    const analysis = CodeAnalyzer.analyze(code);
    const res = SandboxRuntime.execute(code, { n: 4 });

    const inference = VisualizationInferenceEngine.infer(analysis, res.events, code);
    assert.equal(inference.type, "recursion");
    assert.equal(inference.confidence, 1.0);
  });

  it("should infer 'array' visualization type for swap pattern code with 100% confidence", () => {
    const code = `function bubbleSort(arr) { let temp = arr[0]; arr[0] = arr[1]; arr[1] = temp; return arr; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const res = SandboxRuntime.execute(code, { arr: [5, 2] });

    const inference = VisualizationInferenceEngine.infer(analysis, res.events, code);
    assert.equal(inference.type, "array");
    assert.equal(inference.confidence, 1.0);
  });

  it("should infer 'stack' visualization for push/pop code", () => {
    const code = `function testStack() { let stack = []; stack.push(10); stack.pop(); }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.equal(inference.type, "stack");
    assert.equal(inference.confidence, 0.9);
  });

  it("should infer 'queue' visualization for push/shift code", () => {
    const code = `function testQueue() { let queue = []; queue.push(10); queue.shift(); }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.equal(inference.type, "queue");
    assert.equal(inference.confidence, 0.9);
  });

  it("should infer 'linked-list' visualization for .next node traversal", () => {
    const code = `function testList(head) { let curr = head; curr = curr.next; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.equal(inference.type, "linked-list");
    assert.equal(inference.confidence, 0.85);
  });

  it("should infer 'tree' visualization for .left and .right binary tree node traversal", () => {
    const code = `function testTree(node) { let l = node.left; let r = node.right; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const inference = VisualizationInferenceEngine.infer(analysis, [], code);

    assert.equal(inference.type, "tree");
    assert.equal(inference.confidence, 0.85);
  });

  it("should infer 'none' visualization for ambiguous code without inventing state", () => {
    const code = `function add(a, b) { return a + b; }`;
    const analysis = CodeAnalyzer.analyze(code);
    const res = SandboxRuntime.execute(code, { a: 5, b: 7 });

    const inference = VisualizationInferenceEngine.infer(analysis, res.events, code);
    assert.equal(inference.type, "none");
    assert.equal(inference.confidence, 0.0);
    assert.equal(inference.explanation.includes("No specialized visualization was confidently detected"), true);
  });
});
