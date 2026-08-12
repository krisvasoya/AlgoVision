import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateGraphTrace } from "../algorithms/data-structures/graphOps.ts";
import { calculateGraphLayout } from "../engine/geometry/graphLayout.ts";

describe("Graph Data Structure Unit Tests", () => {
  it("should generate a valid trace for graph traversal demonstration", () => {
    const trace = generateGraphTrace();
    assert.equal(trace.algorithmId, "graph-demo");

    const finalStep = trace.steps[trace.steps.length - 1];
    assert.equal(finalStep.event, "complete");

    const data = finalStep.state.data as { nodes: any[]; edges: any[] };
    assert.equal(data.nodes.length, 4);
    assert.equal(data.edges.length, 4);
  });

  it("should compute valid circular geometry coordinates for graph nodes", () => {
    const trace = generateGraphTrace();
    const data = trace.steps[0].state.data as { nodes: any[]; edges: any[] };

    const layout = calculateGraphLayout(data.nodes, data.edges, 600, 300);
    assert.equal(layout.nodes.length, 4);
    assert.equal(layout.edges.length, 4);

    layout.nodes.forEach((node) => {
      assert.equal(typeof node.x, "number");
      assert.equal(typeof node.y, "number");
      assert.equal(isNaN(node.x), false);
      assert.equal(isNaN(node.y), false);
    });
  });
});
