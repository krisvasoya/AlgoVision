import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { towerOfHanoiDefinition, generateHanoiTrace } from "../algorithms/recursion/towerOfHanoi.ts";

describe("Phase 14.9 Hanoi Layout & Declarative Input Refactor Tests", () => {
  it("should define declarative inputSchema for Tower of Hanoi", () => {
    assert.equal(towerOfHanoiDefinition.inputSchema !== undefined, true);
    assert.equal(towerOfHanoiDefinition.inputSchema?.showRandomize, false);
    assert.equal(towerOfHanoiDefinition.inputSchema?.hasTarget, false);
    
    const field = towerOfHanoiDefinition.inputSchema?.fields[0];
    assert.equal(field?.id, "diskCount");
    assert.equal(field?.type, "number");
    assert.equal(field?.defaultValue, 3);
    assert.equal(field?.validation?.min, 1);
    assert.equal(field?.validation?.max, 5);
  });

  it("should generate 7 moves for default n=3 disks", () => {
    const trace = generateHanoiTrace(3);
    assert.equal(trace.initialInput, 3);
    const movedSteps = trace.steps.filter((s) => s.state.type === "hanoi" && s.state.movedDisk);
    assert.equal(movedSteps.length, 7);
  });
});
