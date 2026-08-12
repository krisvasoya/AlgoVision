import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ExecutionStep, ExecutionEventType } from "../types/execution.ts";
import type { ArrayVisualState } from "../types/visualization.ts";

describe("Core Type System Verification", () => {
  it("should validate ExecutionEventType union values", () => {
    const validEvents: ExecutionEventType[] = [
      "compare",
      "swap",
      "assign",
      "access",
      "insert",
      "delete",
      "visit",
      "push",
      "pop",
      "enqueue",
      "dequeue",
      "call",
      "return",
      "update",
      "loop",
      "complete",
    ];
    assert.equal(validEvents.length, 16);
  });

  it("should validate strongly-typed ArrayVisualState", () => {
    const visualState: ArrayVisualState = {
      type: "array",
      data: {
        length: 3,
        elements: [
          { id: "0", value: 10, index: 0, highlightState: "active", pointers: ["i"] },
          { id: "1", value: 20, index: 1, highlightState: "compared", pointers: ["j"] },
          { id: "2", value: 30, index: 2, highlightState: "sorted" },
        ],
      },
      active: [0],
      compared: [1],
      sorted: [2],
    };

    assert.equal(visualState.type, "array");
    assert.equal(visualState.data.elements.length, 3);
    assert.deepEqual(visualState.data.elements[0].pointers, ["i"]);
  });

  it("should construct valid ExecutionStep model", () => {
    const step: ExecutionStep = {
      step: 0,
      line: 3,
      event: "compare",
      variables: { i: 0, j: 1, "arr[i]": 10, "arr[j]": 5 },
      state: {
        type: "array",
        data: {
          elements: [
            { id: "0", value: 10, index: 0, highlightState: "compared" },
            { id: "1", value: 5, index: 1, highlightState: "compared" },
          ],
          length: 2,
        },
      },
      metadata: {
        description: "Comparing elements at index 0 and 1",
        complexityHint: "Comparison count + 1",
      },
    };

    assert.equal(step.step, 0);
    assert.equal(step.line, 3);
    assert.equal(step.event, "compare");
    assert.equal(step.variables["i"], 0);
  });
});
