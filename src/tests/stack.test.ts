import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateStackTrace } from "../algorithms/data-structures/stackOps.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import type { StackVisualState } from "../types/visualization.ts";

describe("Stack Data Structure Unit Tests", () => {
  it("should generate a valid trace for push, peek, and pop operations", () => {
    const trace = generateStackTrace([10, 20, 30]);
    assert.equal(trace.algorithmId, "stack-demo");
    assert.equal(trace.steps[0].event, "call");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");

    // Stack should have [10, 20] after popping 30
    const elements = (finalStep.state.data as { elements: Array<{ value: number }> }).elements;
    assert.equal(elements.length, 2);
    assert.equal(elements[0].value, 10);
    assert.equal(elements[1].value, 20);
  });

  it("should handle empty stack initialization", () => {
    const trace = generateStackTrace([]);
    const step0 = trace.steps[0];
    const data = step0.state.data as { elements: any[]; topIndex: number };
    assert.equal(data.elements.length, 0);
    assert.equal(data.topIndex, -1);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateStackTrace([5, 15, 25]);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(2);
    const step2Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(2);
    const step2Revisited = JSON.stringify(engine.currentStep);

    assert.equal(step2Original, step2Revisited);
  });
});
