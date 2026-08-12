import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateBinarySearchTrace, isArraySorted } from "../algorithms/searching/binarySearch.ts";

describe("Binary Search Unit Tests", () => {
  const sortedArr = [10, 20, 30, 40, 50, 60, 70, 80];

  it("should execute normally for sorted input array", () => {
    const trace = generateBinarySearchTrace({ array: sortedArr, target: 40 });
    assert.equal(trace.algorithmId, "binary-search");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], 3);
    assert.equal(finalStep.variables["found"], true);
  });

  it("should reject unsorted input array and throw explicit error", () => {
    const unsortedArr = [50, 10, 30, 20];
    assert.throws(
      () => generateBinarySearchTrace({ array: unsortedArr, target: 30 }),
      /Binary Search requires a sorted array/
    );
  });

  it("should guarantee original input array is not mutated when rejected or executed", () => {
    const unsortedArr = [50, 10, 30, 20];
    const originalCopy = [...unsortedArr];

    try {
      generateBinarySearchTrace({ array: unsortedArr, target: 30 });
    } catch {
      // Expected rejection
    }

    assert.deepEqual(unsortedArr, originalCopy, "Original input array was mutated on rejection.");

    const sortedInput = [10, 20, 30, 40];
    const sortedCopy = [...sortedInput];
    generateBinarySearchTrace({ array: sortedInput, target: 30 });
    assert.deepEqual(sortedInput, sortedCopy, "Original sorted array was mutated during execution.");
  });

  it("should execute Binary Search correctly after explicit Sort Input action", () => {
    const unsortedArr = [50, 10, 30, 20];
    assert.equal(isArraySorted(unsortedArr), false);

    // Simulate explicit "Sort Input" user action
    const explicitlySorted = [...unsortedArr].sort((a, b) => a - b);
    assert.equal(isArraySorted(explicitlySorted), true);

    const trace = generateBinarySearchTrace({ array: explicitlySorted, target: 30 });
    const finalStep = trace.steps[trace.steps.length - 1];

    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["found"], true);
    assert.equal(finalStep.variables["result"], 2); // 30 is at index 2 in sorted [10, 20, 30, 50]
  });

  it("should find target at the beginning of sorted array", () => {
    const trace = generateBinarySearchTrace({ array: sortedArr, target: 10 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], 0);
    assert.equal(finalStep.variables["found"], true);
  });

  it("should find target at the end of sorted array", () => {
    const trace = generateBinarySearchTrace({ array: sortedArr, target: 80 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], 7);
    assert.equal(finalStep.variables["found"], true);
  });

  it("should return -1 when target is absent", () => {
    const trace = generateBinarySearchTrace({ array: sortedArr, target: 45 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], -1);
    assert.equal(finalStep.variables["found"], false);
  });

  it("should handle single element sorted array", () => {
    const traceFound = generateBinarySearchTrace({ array: [15], target: 15 });
    assert.equal(traceFound.steps[traceFound.steps.length - 1].variables["result"], 0);

    const traceNotFound = generateBinarySearchTrace({ array: [15], target: 99 });
    assert.equal(traceNotFound.steps[traceNotFound.steps.length - 1].variables["result"], -1);
  });

  it("should handle empty array input", () => {
    const trace = generateBinarySearchTrace({ array: [], target: 50 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["result"], -1);
    assert.equal(finalStep.variables["found"], false);
  });
});
