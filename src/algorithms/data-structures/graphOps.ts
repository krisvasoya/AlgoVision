import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { GraphVisualState, GraphNodeData, GraphEdgeData } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const GRAPH_SOURCE_CODE = `class Graph {
  constructor() {
    this.nodes = new Set();
    this.edges = new Map();
  }
  addNode(node) { this.nodes.add(node); }
  addEdge(src, tgt, w) { this.edges.set(\`\${src}-\${tgt}\`, w); }
}`;

export function generateGraphTrace(): ExecutionTrace {
  const steps: ExecutionStep[] = [];

  const rawNodes: GraphNodeData[] = [
    { id: "A", label: "A", highlightState: "default" },
    { id: "B", label: "B", highlightState: "default" },
    { id: "C", label: "C", highlightState: "default" },
    { id: "D", label: "D", highlightState: "default" },
  ];

  const rawEdges: GraphEdgeData[] = [
    { id: "e1", source: "A", target: "B", weight: 4, isDirected: true },
    { id: "e2", source: "A", target: "C", weight: 2, isDirected: true },
    { id: "e3", source: "B", target: "D", weight: 5, isDirected: true },
    { id: "e4", source: "C", target: "D", weight: 1, isDirected: true },
  ];

  let stepCounter = 0;

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    activeNodeId?: string | null,
    activeEdgeId?: string | null,
    visitedNodeIds?: string[]
  ) {
    const visualState: GraphVisualState = {
      type: "graph",
      data: {
        nodes: JSON.parse(JSON.stringify(rawNodes)),
        edges: JSON.parse(JSON.stringify(rawEdges)),
      },
      activeNodeId,
      activeEdgeId,
      visitedNodeIds,
    };

    steps.push({
      step: stepCounter++,
      line,
      event,
      variables: JSON.parse(JSON.stringify(variables)),
      state: visualState,
      metadata: { description },
    });
  }

  createStep(1, "call", { nodesCount: 4, edgesCount: 4 }, "Graph initialized with 4 nodes (A, B, C, D) and 4 directed weighted edges.");
  createStep(4, "visit", { activeNode: "A" }, "Start at Source Node A.", "A", undefined, ["A"]);
  createStep(5, "compare", { activeEdge: "e2", source: "A", target: "C", weight: 2 }, "Traverse Edge A → C (weight = 2).", "C", "e2", ["A"]);
  createStep(4, "visit", { activeNode: "C" }, "Arrived at Node C.", "C", undefined, ["A", "C"]);
  createStep(5, "compare", { activeEdge: "e4", source: "C", target: "D", weight: 1 }, "Traverse Edge C → D (weight = 1).", "D", "e4", ["A", "C"]);
  createStep(4, "visit", { activeNode: "D" }, "Arrived at Destination Node D. Total path weight = 3.", "D", undefined, ["A", "C", "D"]);
  createStep(6, "complete", { path: ["A", "C", "D"], totalWeight: 3 }, "Graph demonstration complete.");

  return {
    algorithmId: "graph-demo",
    algorithmTitle: "Graph Visualizer Demo",
    sourceCode: GRAPH_SOURCE_CODE,
    initialInput: null,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
  };
}

export const graphDefinition: AlgorithmDefinition<null, GraphVisualState> = {
  id: "graph-demo",
  name: "Graph Data Structure",
  title: "Graph Visualizer",
  category: "data-structures",
  description: "A network data structure of vertices (nodes) connected by weighted directed or undirected edges.",
  complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V²)", space: "O(V + E)" },
  defaultInput: null,
  sourceCode: GRAPH_SOURCE_CODE,
  generateTrace: () => generateGraphTrace(),
};

ALGORITHM_REGISTRY.register(graphDefinition as unknown as AlgorithmDefinition);
