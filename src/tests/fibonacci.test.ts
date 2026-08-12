import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateFibonacciTrace } from "../algorithms/recursion/fibonacci.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Fibonacci Recursion Unit Tests", () => {
  it("should compute correct result for fib(5)", () => {
    const trace = generateFibonacciTrace(5);
    assert.equal(trace.algorithmId, "fibonacci");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["result"], 5);
  });

  it("should handle base case for fib(0) and fib(1)", () => {
    const trace0 = generateFibonacciTrace(0);
    assert.equal(trace0.steps[trace0.steps.length - 1].variables["result"], 0);

    const trace1 = generateFibonacciTrace(1);
    assert.equal(trace1.steps[trace1.steps.length - 1].variables["result"], 1);
  });

  it("should generate branching call tree structure", () => {
    const trace = generateFibonacciTrace(3);
    const finalStep = trace.steps[trace.steps.length - 1];
    const tree = finalStep.runtimeState?.callTree;

    assert.notEqual(tree, undefined);
    assert.equal(tree?.name, "fib");
    assert.equal(tree?.children.length, 2); // fib(3) branches into fib(2) and fib(1)
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateFibonacciTrace(4);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(4);
    const step4Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(4);
    assert.equal(JSON.stringify(engine.currentStep), step4Original);
  });
});
