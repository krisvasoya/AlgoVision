import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateBFSTrace } from "../algorithms/graph/bfs.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Breadth-First Search (BFS) Educational & Edge-Case Unit Tests", () => {
  it("should perform level-by-level traversal on default graph", () => {
    const trace = generateBFSTrace();
    assert.equal(trace.algorithmId, "bfs");

    const finalStep = trace.steps[trace.steps.length - 1];
    const visitedOrder = finalStep.variables["visitedOrder"] as string[];
    assert.deepEqual(visitedOrder, ["A", "B", "C", "D", "E", "F"]);
  });

  it("should enforce exact queue state fidelity across steps", () => {
    const trace = generateBFSTrace();
    const enqueueSteps = trace.steps.filter(
      (s) => s.state.type === "graph" && s.state.queuedNodeIds !== undefined
    );
    assert.equal(enqueueSteps.length > 0, true);

    const step2 = trace.steps[1];
    assert.equal(step2.state.type, "graph");
    if (step2.state.type === "graph") {
      assert.deepEqual(step2.state.queuedNodeIds, ["A"]);
    }
  });

  it("should synchronize source code line numbers accurately with queue operations", () => {
    const trace = generateBFSTrace();
    trace.steps.forEach((step) => {
      assert.equal(typeof step.line, "number");
      assert.equal(step.line >= 1 && step.line <= 12, true);
    });
  });

  it("should handle disconnected graphs without stalling", () => {
    const trace = generateBFSTrace({
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

  it("should handle single node graph with no edges", () => {
    const trace = generateBFSTrace({
      nodes: [{ id: "A", label: "A", highlightState: "default" }],
      edges: [],
      startNodeId: "A",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.deepEqual(finalStep.variables["visitedOrder"], ["A"]);
  });

  it("should handle graphs with cycles safely", () => {
    const trace = generateBFSTrace({
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
    assert.deepEqual(finalStep.variables["visitedOrder"], ["A", "B", "C"]);
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateBFSTrace();
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(3);
    const step3Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(3);
    assert.equal(JSON.stringify(engine.currentStep), step3Original);
  });

  it("should guarantee snapshot isolation upon external mutation", () => {
    const trace = generateBFSTrace();
    const step2Original = JSON.stringify(trace.steps[2]);

    (trace.steps[trace.steps.length - 1].state as any).queuedNodeIds?.push("HACKED");
    assert.equal(JSON.stringify(trace.steps[2]), step2Original);
  });
});
