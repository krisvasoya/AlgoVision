import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALGORITHM_REGISTRY } from "../algorithms/registry.ts";
import { generateBFSTrace } from "../algorithms/graph/bfs.ts";
import { generateDFSTrace } from "../algorithms/graph/dfs.ts";
import { generateDijkstraTrace } from "../algorithms/graph/dijkstra.ts";
import { calculateGraphLayout } from "../engine/geometry/graphLayout.ts";
import type { GraphNodeData, GraphEdgeData } from "../types/visualization.ts";
import "../algorithms/index.ts";

describe("Cross-Graph Algorithm Verification Suite", () => {
  it("should have all registered algorithms & data structures in ALGORITHM_REGISTRY", () => {
    assert.equal(ALGORITHM_REGISTRY.has("bfs"), true);
    assert.equal(ALGORITHM_REGISTRY.has("dfs"), true);
    assert.equal(ALGORITHM_REGISTRY.has("dijkstra"), true);
    assert.equal(ALGORITHM_REGISTRY.getAll().length, 17);
  });

  it("should demonstrate traversal order divergence between BFS and DFS on the same graph", () => {
    const nodes: GraphNodeData[] = [
      { id: "A", label: "A", highlightState: "default" },
      { id: "B", label: "B", highlightState: "default" },
      { id: "C", label: "C", highlightState: "default" },
      { id: "D", label: "D", highlightState: "default" },
    ];
    const edges: GraphEdgeData[] = [
      { id: "e1", source: "A", target: "B" },
      { id: "e2", source: "A", target: "C" },
      { id: "e3", source: "B", target: "D" },
    ];

    const bfsTrace = generateBFSTrace({ nodes, edges, startNodeId: "A" });
    const dfsTrace = generateDFSTrace({ nodes, edges, startNodeId: "A" });

    const bfsOrder = bfsTrace.steps[bfsTrace.steps.length - 1].variables["visitedOrder"] as string[];
    const dfsOrder = dfsTrace.steps[dfsTrace.steps.length - 1].variables["visitedOrder"] as string[];

    assert.deepEqual(bfsOrder, ["A", "B", "C", "D"]);
    assert.notEqual(JSON.stringify(bfsOrder), JSON.stringify(dfsOrder));
  });

  it("should calculate deterministic layout coordinates for 10, 25, and 50 node graphs", () => {
    [10, 25, 50].forEach((nodeCount) => {
      const nodes: GraphNodeData[] = Array.from({ length: nodeCount }, (_, i) => ({
        id: `N${i}`,
        label: `N${i}`,
        highlightState: "default",
      }));

      const edges: GraphEdgeData[] = [];
      for (let i = 0; i < nodeCount - 1; i++) {
        edges.push({ id: `e${i}`, source: `N${i}`, target: `N${i + 1}` });
      }

      const layout1 = calculateGraphLayout(nodes, edges, 600, 300);
      const layout2 = calculateGraphLayout(nodes, edges, 600, 300);

      assert.equal(layout1.nodes.length, nodeCount);
      assert.equal(JSON.stringify(layout1), JSON.stringify(layout2));
    });
  });

  it("should guarantee non-mutation of input graph during BFS, DFS, and Dijkstra trace generation", () => {
    const graphInput = {
      nodes: [
        { id: "A", label: "A", highlightState: "default" as const },
        { id: "B", label: "B", highlightState: "default" as const },
      ],
      edges: [{ id: "e1", source: "A", target: "B", weight: 5 }],
      startNodeId: "A",
      targetNodeId: "B",
    };

    const inputSnapshot = JSON.stringify(graphInput);

    generateBFSTrace(graphInput);
    generateDFSTrace(graphInput);
    generateDijkstraTrace(graphInput);

    assert.equal(JSON.stringify(graphInput), inputSnapshot);
  });
});
