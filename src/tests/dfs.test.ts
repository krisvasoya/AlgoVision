import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateDFSTrace } from "../algorithms/graph/dfs.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Depth-First Search (DFS) Educational & Edge-Case Unit Tests", () => {
  it("should perform depth-first traversal on default graph", () => {
    const trace = generateDFSTrace();
    assert.equal(trace.algorithmId, "dfs");

    const finalStep = trace.steps[trace.steps.length - 1];
    const visitedOrder = finalStep.variables["visitedOrder"] as string[];
    assert.equal(visitedOrder[0], "A");
    assert.equal(visitedOrder.length, 6);
  });

  it("should enforce exact stack state fidelity across steps", () => {
    const trace = generateDFSTrace();
    const stackSteps = trace.steps.filter(
      (s) => s.state.type === "graph" && s.state.stackedNodeIds !== undefined
    );
    assert.equal(stackSteps.length > 0, true);

    const step2 = trace.steps[1];
    assert.equal(step2.state.type, "graph");
    if (step2.state.type === "graph") {
      assert.deepEqual(step2.state.stackedNodeIds, ["A"]);
    }
  });

  it("should synchronize source code line numbers accurately with stack operations", () => {
    const trace = generateDFSTrace();
    trace.steps.forEach((step) => {
      assert.equal(typeof step.line, "number");
      assert.equal(step.line >= 1 && step.line <= 14, true);
    });
  });

  it("should emit explicit push and pop event types", () => {
    const trace = generateDFSTrace();
    const popEvents = trace.steps.filter((s) => s.event === "pop");
    const pushEvents = trace.steps.filter((s) => s.event === "push");
    assert.equal(popEvents.length > 0, true);
    assert.equal(pushEvents.length > 0, true);
  });

  it("should handle disconnected graph gracefully", () => {
    const trace = generateDFSTrace({
      nodes: [
        { id: "A", label: "A", highlightState: "default" },
        { id: "B", label: "B", highlightState: "default" },
        { id: "C", label: "C", highlightState: "default" },
      ],
      edges: [{ id: "e1", source: "A", target: "B" }],
      startNodeId: "A",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["visitedOrder"], ["A", "B"]);
  });

  it("should handle single node graph", () => {
    const trace = generateDFSTrace({
      nodes: [{ id: "A", label: "A", highlightState: "default" }],
      edges: [],
      startNodeId: "A",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["visitedOrder"], ["A"]);
  });

  it("should handle graph cycles without infinite loop", () => {
    const trace = generateDFSTrace({
      nodes: [
        { id: "A", label: "A", highlightState: "default" },
        { id: "B", label: "B", highlightState: "default" },
        { id: "C", label: "C", highlightState: "default" },
      ],
      edges: [
        { id: "e1", source: "A", target: "B" },
        { id: "e2", source: "B", target: "C" },
        { id: "e3", source: "C", target: "A" },
      ],
      startNodeId: "A",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal((finalStep.variables["visitedOrder"] as string[]).length, 3);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateDFSTrace();
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(4);
    const step4Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(4);
    assert.equal(JSON.stringify(engine.currentStep), step4Original);
  });
});
