import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateInsertionSortTrace } from "../algorithms/sorting/insertionSort.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Insertion Sort Unit Tests", () => {
  it("should sort default unsorted array [12, 11, 13, 5, 6]", () => {
    const trace = generateInsertionSortTrace([12, 11, 13, 5, 6]);
    assert.equal(trace.algorithmId, "insertion-sort");
    assert.equal(trace.steps[0].event, "call");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.deepEqual(finalStep.variables["arr"], [5, 6, 11, 12, 13]);
  });

  it("should handle already sorted input", () => {
    const trace = generateInsertionSortTrace([1, 2, 3, 4, 5]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 3, 4, 5]);
  });

  it("should handle reverse sorted input", () => {
    const trace = generateInsertionSortTrace([5, 4, 3, 2, 1]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 3, 4, 5]);
  });

  it("should handle duplicate values correctly", () => {
    const trace = generateInsertionSortTrace([3, 1, 3, 2, 1]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 1, 2, 3, 3]);
  });

  it("should handle single element input", () => {
    const trace = generateInsertionSortTrace([99]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [99]);
  });

  it("should handle empty input", () => {
    const trace = generateInsertionSortTrace([]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], []);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateInsertionSortTrace([12, 11, 13, 5, 6]);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(4);
    const step4State = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(4);
    const step4Revisited = JSON.stringify(engine.currentStep);

    assert.equal(step4State, step4Revisited);
  });
});
