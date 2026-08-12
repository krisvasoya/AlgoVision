import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateFactorialTrace } from "../algorithms/recursion/factorial.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Factorial Recursion Unit Tests", () => {
  it("should compute correct result for factorial(4)", () => {
    const trace = generateFactorialTrace(4);
    assert.equal(trace.algorithmId, "factorial");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["result"], 24);
  });

  it("should handle base case for factorial(0) and factorial(1)", () => {
    const trace0 = generateFactorialTrace(0);
    const finalStep0 = trace0.steps[trace0.steps.length - 1];
    assert.equal(finalStep0.variables["result"], 1);

    const trace1 = generateFactorialTrace(1);
    const finalStep1 = trace1.steps[trace1.steps.length - 1];
    assert.equal(finalStep1.variables["result"], 1);
  });

  it("should reject negative inputs with explicit error", () => {
    assert.throws(() => generateFactorialTrace(-3), {
      name: "Error",
      message: "Factorial is undefined for negative numbers.",
    });
  });

  it("should build up and pop call stack depth accurately", () => {
    const trace = generateFactorialTrace(4);
    const maxDepth = Math.max(...trace.steps.map((s) => s.runtimeState?.callStack.length || 0));
    assert.equal(maxDepth, 4);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateFactorialTrace(4);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(5);
    const step5Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(5);
    assert.equal(JSON.stringify(engine.currentStep), step5Original);
  });

  it("should guarantee snapshot isolation upon external mutation", () => {
    const trace = generateFactorialTrace(4);
    const step2Original = JSON.stringify(trace.steps[2]);

    (trace.steps[trace.steps.length - 1].runtimeState as any).callStack.push({ id: "HACKED" });
    assert.equal(JSON.stringify(trace.steps[2]), step2Original);
  });
});
