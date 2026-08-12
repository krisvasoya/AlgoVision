import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateDijkstraTrace } from "../algorithms/graph/dijkstra.ts";
import { ExecutionEngine } from "../engine/execution/ExecutionEngine.ts";

describe("Dijkstra's Shortest Path Educational & Edge-Case Unit Tests", () => {
  it("should compute correct shortest path on default weighted graph", () => {
    const trace = generateDijkstraTrace();
    assert.equal(trace.algorithmId, "dijkstra");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["shortestDistance"], 5);
  });

  it("should explicitly track selectedNodeId during select_min steps", () => {
    const trace = generateDijkstraTrace();
    const selectMinStep = trace.steps.find((s) => s.event === "select_min");
    assert.notEqual(selectMinStep, undefined);
    if (selectMinStep && selectMinStep.state.type === "graph") {
      assert.notEqual(selectMinStep.state.selectedNodeId, undefined);
      assert.notEqual(selectMinStep.state.selectedNodeId, null);
    }
  });

  it("should track relaxation events and parent map updates", () => {
    const trace = generateDijkstraTrace();
    const relaxSteps = trace.steps.filter((s) => s.event === "relax_edge");
    const updateSteps = trace.steps.filter((s) => s.event === "update_distance");

    assert.equal(relaxSteps.length > 0, true);
    assert.equal(updateSteps.length > 0, true);

    const updateStep = updateSteps[0];
    assert.notEqual(updateStep.variables["updatedDistance"], undefined);
    assert.notEqual(updateStep.variables["parent"], undefined);
  });

  it("should distinguish shortestPathTreeEdgeIds from finalPathEdgeIds", () => {
    const trace = generateDijkstraTrace();
    const finalStep = trace.steps[trace.steps.length - 1];

    assert.equal(finalStep.state.type, "graph");
    if (finalStep.state.type === "graph") {
      assert.equal(Array.isArray(finalStep.state.shortestPathTreeEdgeIds), true);
      assert.equal(Array.isArray(finalStep.state.finalPathEdgeIds), true);
      assert.equal(finalStep.state.finalPathEdgeIds!.length > 0, true);
    }
  });

  it("should handle zero-weight edges correctly", () => {
    const trace = generateDijkstraTrace({
      nodes: [
        { id: "A", label: "A", highlightState: "default" },
        { id: "B", label: "B", highlightState: "default" },
      ],
      edges: [{ id: "e1", source: "A", target: "B", weight: 0 }],
      startNodeId: "A",
      targetNodeId: "B",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["shortestDistance"], 0);
  });

  it("should handle unreachable target node", () => {
    const trace = generateDijkstraTrace({
      nodes: [
        { id: "A", label: "A", highlightState: "default" },
        { id: "B", label: "B", highlightState: "default" },
        { id: "C", label: "C", highlightState: "default" },
      ],
      edges: [{ id: "e1", source: "A", target: "B", weight: 3 }],
      startNodeId: "A",
      targetNodeId: "C",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["shortestDistance"], "∞");
  });

  it("should handle single node graph", () => {
    const trace = generateDijkstraTrace({
      nodes: [{ id: "A", label: "A", highlightState: "default" }],
      edges: [],
      startNodeId: "A",
      targetNodeId: "A",
    });

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.variables["shortestDistance"], 0);
  });

  it("should reject negative edge weights and throw explicit error", () => {
    assert.throws(
      () =>
        generateDijkstraTrace({
          nodes: [
            { id: "A", label: "A", highlightState: "default" },
            { id: "B", label: "B", highlightState: "default" },
          ],
          edges: [{ id: "e1", source: "A", target: "B", weight: -5 }],
          startNodeId: "A",
        }),
      {
        name: "Error",
        message: "Dijkstra's algorithm requires non-negative edge weights.",
      }
    );
  });

  it("should guarantee deterministic timeline reversibility", () => {
    const trace = generateDijkstraTrace();
    const engine = new ExecutionEngine(trace);

    engine.jumpTo(5);
    const step5Original = JSON.stringify(engine.currentStep);

    engine.last();
    engine.first();
    engine.jumpTo(5);
    assert.equal(JSON.stringify(engine.currentStep), step5Original);
  });
});
