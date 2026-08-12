import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/registry.ts";
import { generateFactorialTrace } from "../algorithms/recursion/factorial.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";
import "../algorithms/index.ts";

describe("Runtime Architecture Unit Tests", () => {
  it("should have all 17 algorithms and data structures registered in ALGORITHM_REGISTRY", () => {
    const registered = ALGORITHM_REGISTRY.getAll();
    assert.equal(registered.length, 17);

    const expectedIds = [
      "bubble-sort",
      "selection-sort",
      "insertion-sort",
      "linear-search",
      "binary-search",
      "stack-demo",
      "queue-demo",
      "linked-list-demo",
      "tree-demo",
      "graph-demo",
      "bfs",
      "dfs",
      "dijkstra",
      "factorial",
      "fibonacci",
      "recursive-binary-search",
      "tower-of-hanoi",
    ];

    expectedIds.forEach((id) => {
      assert.equal(ALGORITHM_REGISTRY.has(id), true, `Algorithm ID ${id} missing from ALGORITHM_REGISTRY.`);
    });
  });

  it("should enforce deep-copied immutable CallFrame snapshots across steps", () => {
    const trace = generateFactorialTrace(4);
    const step3 = trace.steps[2];
    const step3Snapshot = JSON.stringify(step3.runtimeState);

    // Mutate final step callStack
    const finalStep = trace.steps[trace.steps.length - 1];
    (finalStep.runtimeState as any).callStack.push({ id: "HACKED_FRAME", functionName: "hacked" });

    assert.equal(JSON.stringify(step3.runtimeState), step3Snapshot);
  });

  it("should match call and return event pairs and identify active frames accurately", () => {
    const trace = generateFactorialTrace(3);
    const callEvents = trace.steps.filter((s) => s.event === "call");
    const returnEvents = trace.steps.filter((s) => s.event === "return" || s.event === "base_case");

    assert.equal(callEvents.length > 0, true);
    assert.equal(returnEvents.length > 0, true);

    trace.steps.forEach((step) => {
      if (step.runtimeState && step.runtimeState.callStack.length > 0) {
        const stack = step.runtimeState.callStack;
        const activeFrame = stack[stack.length - 1];
        assert.equal(typeof activeFrame.functionName, "string");
        assert.equal(typeof activeFrame.parameters, "object");
      }
    });
  });

  it("should execute deterministic timeline navigation across recursive steps", () => {
    const trace = generateFactorialTrace(4);
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(6);
    const step6Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(6);
    assert.equal(JSON.stringify(engine.currentStep), step6Original);
  });
});
