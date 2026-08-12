import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateSelectionSortTrace } from "../algorithms/sorting/selectionSort.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Selection Sort Unit Tests", () => {
  it("should sort default unsorted array [64, 25, 12, 22, 11]", () => {
    const trace = generateSelectionSortTrace([64, 25, 12, 22, 11]);
    assert.equal(trace.algorithmId, "selection-sort");
    assert.equal(trace.steps[0].event, "call");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.deepEqual(finalStep.variables["arr"], [11, 12, 22, 25, 64]);
  });

  it("should handle already sorted array", () => {
    const trace = generateSelectionSortTrace([1, 2, 3, 4, 5]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 3, 4, 5]);
  });

  it("should handle reverse sorted array", () => {
    const trace = generateSelectionSortTrace([5, 4, 3, 2, 1]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 3, 4, 5]);
  });

  it("should handle duplicate values correctly", () => {
    const trace = generateSelectionSortTrace([4, 2, 4, 1, 2]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [1, 2, 2, 4, 4]);
  });

  it("should handle single element array", () => {
    const trace = generateSelectionSortTrace([42]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], [42]);
  });

  it("should handle empty array", () => {
    const trace = generateSelectionSortTrace([]);
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["arr"], []);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateSelectionSortTrace([64, 25, 12, 22, 11]);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(5);
    const step5State = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(5);
    const step5Revisited = JSON.stringify(engine.currentStep);

    assert.equal(step5State, step5Revisited);
  });
});
