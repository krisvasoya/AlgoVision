import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import { TraceStorage } from "../engine/execution/TraceStorage.ts";
import { mockTrace } from "../engine/execution/mockTrace.ts";

describe("Phase 2 ExecutionEngine & TraceStorage Unit Tests", () => {
  it("should initialize TraceStorage and validate step indexing", () => {
    const storage = new TraceStorage(mockTrace);
    assert.equal(storage.getTotalSteps(), 5);
    assert.equal(storage.isValidIndex(0), true);
    assert.equal(storage.isValidIndex(4), true);
    assert.equal(storage.isValidIndex(5), false);
    assert.equal(storage.isValidIndex(-1), false);

    assert.equal(storage.clampIndex(-10), 0);
    assert.equal(storage.clampIndex(100), 4);
    assert.equal(storage.clampIndex(2), 2);

    const step2 = storage.getStep(2);
    assert.equal(step2?.step, 2);
    assert.equal(step2?.variables["x"], 10);
    assert.equal(step2?.variables["y"], 20);
  });

  it("should expose ExecutionEngine getters: currentStep and totalSteps", () => {
    const engine = new ExecutionEngine(mockTrace);
    assert.equal(engine.totalSteps, 5);
    assert.notEqual(engine.currentStep, null);
    assert.equal(engine.currentStep?.step, 0);
  });

  it("should execute first(), last(), jumpTo(), and reset() timeline navigation", () => {
    const engine = new ExecutionEngine(mockTrace);

    engine.last();
    assert.equal(engine.getCurrentStepIndex(), 4);
    assert.equal(engine.currentStep?.event, "complete");

    engine.first();
    assert.equal(engine.getCurrentStepIndex(), 0);
    assert.equal(engine.currentStep?.event, "call");

    engine.jumpTo(3);
    assert.equal(engine.getCurrentStepIndex(), 3);
    assert.equal(engine.currentStep?.variables["sum"], 30);

    engine.reset();
    assert.equal(engine.getCurrentStepIndex(), 0);
  });

  it("should navigate forward and backward strictly step by step", () => {
    const engine = new ExecutionEngine(mockTrace);
    assert.equal(engine.getCurrentStepIndex(), 0);

    assert.equal(engine.next(), true);
    assert.equal(engine.getCurrentStepIndex(), 1);

    assert.equal(engine.next(), true);
    assert.equal(engine.getCurrentStepIndex(), 2);

    assert.equal(engine.previous(), true);
    assert.equal(engine.getCurrentStepIndex(), 1);

    assert.equal(engine.previous(), true);
    assert.equal(engine.getCurrentStepIndex(), 0);

    // Boundary check at step 0
    assert.equal(engine.previous(), false);
    assert.equal(engine.getCurrentStepIndex(), 0);
  });

  it("should guarantee deterministic historical state reversibility without manual mutations", () => {
    const engine = new ExecutionEngine(mockTrace);

    // Navigate to step 3
    engine.jumpTo(3);
    const step3FirstVisit = JSON.stringify(engine.currentStep);

    // Navigate forward to step 4, then back to step 1, then jump to step 3
    engine.next();
    engine.jumpTo(1);
    engine.jumpTo(3);
    const step3SecondVisit = JSON.stringify(engine.currentStep);

    // Deterministic state replay must match 100%
    assert.equal(step3FirstVisit, step3SecondVisit);
  });
});
