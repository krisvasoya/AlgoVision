import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/registry.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import "../algorithms/sorting/bubbleSort.ts"; // Ensure bubbleSort is registered

describe("Performance & Scalability Benchmark Tests", () => {
  it("should generate and scrub a 10-element array trace in under 50ms", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);

    const input = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // Reverse sorted worst-case

    const startTrace = performance.now();
    const trace = algo!.generateTrace(input);
    const traceTime = performance.now() - startTrace;

    assert.equal(traceTime < 50, true, `Trace generation took ${traceTime}ms (expected < 50ms)`);
    assert.equal(trace.totalSteps > 50, true);

    const engine = new ExecutionEngine(trace);
    const startScrub = performance.now();

    // Scrub through all steps
    for (let i = 0; i < engine.totalSteps; i++) {
      engine.jumpTo(i);
      assert.notEqual(engine.currentStep, null);
    }

    const scrubTime = performance.now() - startScrub;
    assert.equal(scrubTime < 50, true, `Engine scrub took ${scrubTime}ms (expected < 50ms)`);
  });

  it("should generate and scrub a 30-element array trace responsive under 100ms", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);
    const input = Array.from({ length: 30 }, (_, idx) => 30 - idx);

    const startTrace = performance.now();
    const trace = algo!.generateTrace(input);
    const traceTime = performance.now() - startTrace;

    assert.equal(traceTime < 100, true, `30-element trace generation took ${traceTime}ms`);
    assert.equal(trace.totalSteps > 400, true);

    const engine = new ExecutionEngine(trace);
    engine.jumpTo(Math.floor(trace.totalSteps / 2));
    assert.notEqual(engine.currentStep, null);
  });

  it("should process a 75-element worst-case array (~2,800 steps) without bottlenecks", () => {
    const algo = ALGORITHM_REGISTRY.get("bubble-sort");
    assert.notEqual(algo, undefined);
    const input = Array.from({ length: 75 }, (_, idx) => 75 - idx);

    const startTrace = performance.now();
    const trace = algo!.generateTrace(input);
    const traceTime = performance.now() - startTrace;

    assert.equal(traceTime < 300, true, `75-element trace generation took ${traceTime}ms`);
    assert.equal(trace.totalSteps > 2500, true);

    const engine = new ExecutionEngine(trace);
    engine.last();
    assert.equal(engine.currentStep?.event, "complete");
    assert.equal((engine.currentStep?.variables["arr"] as number[])[0], 1);
    assert.equal((engine.currentStep?.variables["arr"] as number[])[74], 75);
  });
});
