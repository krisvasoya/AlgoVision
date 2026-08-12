import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateBubbleSortTrace } from "../algorithms/sorting/bubbleSort.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Bubble Sort Trace Generator & Replay Unit Tests", () => {
  it("should generate a valid trace for input [7, 2, 9, 1, 5]", () => {
    const input = [7, 2, 9, 1, 5];
    const trace = generateBubbleSortTrace(input);

    assert.equal(trace.algorithmId, "bubble-sort");
    assert.equal(trace.totalSteps > 10, true);
    assert.equal(trace.steps[0].event, "call");

    // The final step must have event 'complete' and the sorted array [1, 2, 5, 7, 9]
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 5, 7, 9]);
  });

  it("should correctly map source code line numbers for compare and swap events", () => {
    const trace = generateBubbleSortTrace([4, 3, 2, 1]);

    const compareSteps = trace.steps.filter((s) => s.event === "compare");
    const swapSteps = trace.steps.filter((s) => s.event === "swap");

    assert.equal(compareSteps.length > 0, true);
    assert.equal(swapSteps.length > 0, true);

    // Line 5 is the if (arr[j] > arr[j+1]) condition
    compareSteps.forEach((step) => {
      assert.equal(step.line, 5);
      assert.equal(typeof step.variables["arr[j]"], "number");
      assert.equal(typeof step.variables["arr[j+1]"], "number");
    });

    // Line 6 is the swap execution
    swapSteps.forEach((step) => {
      assert.equal(step.line, 6);
      assert.equal(step.variables["swapped"], true);
    });
  });

  it("should maintain precise variable state during iterations", () => {
    const trace = generateBubbleSortTrace([3, 1, 2]);
    const compareStep = trace.steps.find((s) => s.event === "compare");

    assert.notEqual(compareStep, undefined);
    assert.equal("i" in compareStep!.variables, true);
    assert.equal("j" in compareStep!.variables, true);
  });

  it("should guarantee deterministic timeline scrubbing and reversibility", () => {
    const trace = generateBubbleSortTrace([7, 2, 9, 1, 5]);
    const engine = new ExecutionEngine(trace);

    // Jump to middle step
    const midIndex = Math.floor(trace.totalSteps / 2);
    engine.jumpTo(midIndex);
    const midStep1 = JSON.stringify(engine.currentStep);

    // Scrub back and forth
    engine.first();
    engine.next();
    engine.last();
    engine.jumpTo(midIndex);
    const midStep2 = JSON.stringify(engine.currentStep);

    // Reversibility check: deterministic historical replay must match 100%
    assert.equal(midStep1, midStep2);
  });

  it("should sort reverse array [5, 4, 3, 2, 1] into [1, 2, 3, 4, 5]", () => {
    const trace = generateBubbleSortTrace([5, 4, 3, 2, 1]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 3, 4, 5]);
  });
});
