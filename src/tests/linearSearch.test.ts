import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateLinearSearchTrace } from "../algorithms/searching/linearSearch.ts";

describe("Linear Search Unit Tests", () => {
  const sampleArr = [10, 50, 30, 70, 80, 20];

  it("should find target at the beginning of array", () => {
    const trace = generateLinearSearchTrace({ array: sampleArr, target: 10 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], 0);
    assert.equal(finalStep.variables["found"], true);
  });

  it("should find target in the middle of array", () => {
    const trace = generateLinearSearchTrace({ array: sampleArr, target: 70 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], 3);
    assert.equal(finalStep.variables["found"], true);
  });

  it("should find target at the end of array", () => {
    const trace = generateLinearSearchTrace({ array: sampleArr, target: 20 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], 5);
    assert.equal(finalStep.variables["found"], true);
  });

  it("should return -1 when target is absent", () => {
    const trace = generateLinearSearchTrace({ array: sampleArr, target: 999 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");
    assert.equal(finalStep.variables["result"], -1);
    assert.equal(finalStep.variables["found"], false);
  });

  it("should return first match for duplicate targets", () => {
    const trace = generateLinearSearchTrace({ array: [5, 10, 5, 20], target: 5 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["result"], 0);
  });

  it("should handle empty array search", () => {
    const trace = generateLinearSearchTrace({ array: [], target: 10 });
    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["result"], -1);
    assert.equal(finalStep.variables["found"], false);
  });
});
