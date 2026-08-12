import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateRecursiveBinarySearchTrace } from "../algorithms/recursion/recursiveBinarySearch.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Recursive Binary Search Unit Tests", () => {
  it("should find target at index in sorted array", () => {
    const trace = generateRecursiveBinarySearchTrace({
      array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      target: 23,
    });
    assert.equal(trace.algorithmId, "recursive-binary-search");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["finalIndex"], 5);
  });

  it("should return -1 when target is missing", () => {
    const trace = generateRecursiveBinarySearchTrace({
      array: [2, 5, 8, 12, 16],
      target: 99,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["finalIndex"], -1);
  });

  it("should handle empty array input", () => {
    const trace = generateRecursiveBinarySearchTrace({
      array: [],
      target: 10,
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["finalIndex"], -1);
  });

  it("should handle single element array input", () => {
    const traceFound = generateRecursiveBinarySearchTrace({
      array: [42],
      target: 42,
    });
    assert.equal(traceFound.steps[traceFound.steps.length - 1].variables["finalIndex"], 0);

    const traceNotFound = generateRecursiveBinarySearchTrace({
      array: [42],
      target: 10,
    });
    assert.equal(traceNotFound.steps[traceNotFound.steps.length - 1].variables["finalIndex"], -1);
  });

  it("should reject unsorted input array and throw explicit error", () => {
    assert.throws(
      () =>
        generateRecursiveBinarySearchTrace({
          array: [10, 5, 20],
          target: 5,
        }),
      {
        name: "Error",
        message: "Binary Search requires a sorted array.",
      }
    );
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateRecursiveBinarySearchTrace();
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(3);
    const step3Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(3);
    assert.equal(JSON.stringify(engine.currentStep), step3Original);
  });
});
