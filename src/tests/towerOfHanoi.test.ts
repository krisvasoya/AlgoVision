import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateHanoiTrace } from "../algorithms/recursion/towerOfHanoi.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Tower of Hanoi Recursion Unit Tests", () => {
  it("should generate correct moves for n=1 disk (1 move)", () => {
    const trace = generateHanoiTrace(1);
    assert.equal(trace.algorithmId, "tower-of-hanoi");

    const moveSteps = trace.steps.filter((s) => s.state.type === "hanoi" && s.state.movedDisk);
    assert.equal(moveSteps.length, 1);

    const finalStep = trace.steps[trace.steps.length - 1];
    const rods = (finalStep.state.data as any).rods;
    assert.equal(rods.A.length, 0);
    assert.equal(rods.C.length, 1);
    assert.equal(rods.C[0].size, 1);
  });

  it("should generate correct moves for n=2 disks (3 moves)", () => {
    const trace = generateHanoiTrace(2);
    const moveSteps = trace.steps.filter((s) => s.state.type === "hanoi" && s.state.movedDisk);
    assert.equal(moveSteps.length, 3);

    const finalStep = trace.steps[trace.steps.length - 1];
    const rods = (finalStep.state.data as any).rods;
    assert.equal(rods.A.length, 0);
    assert.equal(rods.C.length, 2);
  });

  it("should generate correct moves for n=3 disks (7 moves)", () => {
    const trace = generateHanoiTrace(3);
    const moveSteps = trace.steps.filter((s) => s.state.type === "hanoi" && s.state.movedDisk);
    assert.equal(moveSteps.length, 7);

    const finalStep = trace.steps[trace.steps.length - 1];
    const rods = (finalStep.state.data as any).rods;
    assert.equal(rods.A.length, 0);
    assert.equal(rods.B.length, 0);
    assert.equal(rods.C.length, 3);
    assert.equal(rods.C[0].size, 3); // Bottom disk size 3
    assert.equal(rods.C[2].size, 1); // Top disk size 1
  });

  it("should reject invalid disk counts", () => {
    assert.throws(() => generateHanoiTrace(0), {
      name: "Error",
      message: "Tower of Hanoi supports between 1 and 5 disks.",
    });
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateHanoiTrace(3);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(5);
    const step5Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(5);
    assert.equal(JSON.stringify(engine.currentStep), step5Original);
  });
});
