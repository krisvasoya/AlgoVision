import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { GraphVisualState, GraphNodeData, GraphEdgeData } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export interface GraphAlgorithmInput {
  nodes?: GraphNodeData[];
  edges?: GraphEdgeData[];
  startNodeId?: string;
  targetNodeId?: string;
  isDirected?: boolean;
}

export const BFS_SOURCE_CODE = `function bfs(graph, startNode) {
  let visited = new Set();
  let queue = [startNode];
  visited.add(startNode);
  while (queue.length > 0) {
    let curr = queue.shift();
    visit(curr);
    for (let neighbor of graph.getNeighbors(curr)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`;

export const DEFAULT_UNWEIGHTED_GRAPH_NODES: GraphNodeData[] = [
  { id: "A", label: "A", highlightState: "default" },
  { id: "B", label: "B", highlightState: "default" },
  { id: "C", label: "C", highlightState: "default" },
  { id: "D", label: "D", highlightState: "default" },
  { id: "E", label: "E", highlightState: "default" },
  { id: "F", label: "F", highlightState: "default" },
];

export const DEFAULT_UNWEIGHTED_GRAPH_EDGES: GraphEdgeData[] = [
  { id: "e-A-B", source: "A", target: "B" },
  { id: "e-A-C", source: "A", target: "C" },
  { id: "e-B-D", source: "B", target: "D" },
  { id: "e-B-E", source: "B", target: "E" },
  { id: "e-C-F", source: "C", target: "F" },
];

export function generateBFSTrace(input?: GraphAlgorithmInput): ExecutionTrace {
  const nodes = input?.nodes || DEFAULT_UNWEIGHTED_GRAPH_NODES;
  const edges = input?.edges || DEFAULT_UNWEIGHTED_GRAPH_EDGES;
  const startNodeId = input?.startNodeId || "A";

  const steps: ExecutionStep[] = [];
  let stepCounter = 0;

  // Build adjacency list
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    if (!input?.isDirected && adj.has(e.target)) adj.get(e.target)!.push(e.source);
  });

  const visitedSet = new Set<string>();
  const queue: string[] = [];
  const visitedOrder: string[] = [];

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    activeNodeId?: string | null,
    activeEdgeId?: string | null
  ) {
    const visualState: GraphVisualState = {
      type: "graph",
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        isDirected: input?.isDirected,
      },
      activeNodeId,
      activeEdgeId,
      visitedNodeIds: Array.from(visitedSet),
      queuedNodeIds: [...queue],
      startNodeId,
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

  // Line 1: Call
  createStep(1, "call", { startNode: startNodeId }, `BFS initialized with start node ${startNodeId}.`);

  // Line 2: Init visited & queue
  queue.push(startNodeId);
  visitedSet.add(startNodeId);
  createStep(
    2,
    "assign",
    { queue: [...queue], visited: Array.from(visitedSet) },
    `Discovered start node ${startNodeId}. Enqueued ${startNodeId} into BFS queue.`,
    startNodeId
  );

  while (queue.length > 0) {
    // Line 4: Loop check
    createStep(
      4,
      "loop",
      { queue: [...queue], queueSize: queue.length },
      `Queue contains ${queue.length} node(s): [${queue.join(", ")}]. Continuing loop.`
    );

    const curr = queue.shift()!;
    visitedOrder.push(curr);

    // Line 5: Dequeue & Visit
    createStep(
      5,
      "visit",
      { curr, queue: [...queue], visitedOrder: [...visitedOrder] },
      `Dequeued node ${curr} from front of queue. Visited node ${curr}.`,
      curr
    );

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const edgeId = edges.find(
        (e) =>
          (e.source === curr && e.target === neighbor) ||
          (!input?.isDirected && e.source === neighbor && e.target === curr)
      )?.id;

      // Line 6: Check neighbor
      const isVisited = visitedSet.has(neighbor);
      createStep(
        6,
        "compare",
        { curr, neighbor, isVisited },
        `Inspecting neighbor node ${neighbor} of node ${curr}. ${
          isVisited ? `Node ${neighbor} is already discovered/visited.` : `Node ${neighbor} is undiscovered.`
        }`,
        curr,
        edgeId
      );

      if (!isVisited) {
        visitedSet.add(neighbor);
        queue.push(neighbor);

        // Line 8: Enqueue neighbor
        createStep(
          8,
          "assign",
          { curr, neighbor, queue: [...queue] },
          `Discovered new neighbor ${neighbor}. Added ${neighbor} to BFS queue.`,
          neighbor,
          edgeId
        );
      }
    }
  }

  // Line 12: Complete
  createStep(
    12,
    "complete",
    { visitedOrder, totalVisited: visitedOrder.length },
    `BFS Traversal complete! Traversal order: [${visitedOrder.join(" → ")}].`
  );

  return {
    algorithmId: "bfs",
    algorithmTitle: "Breadth-First Search (BFS)",
    sourceCode: BFS_SOURCE_CODE,
    initialInput: input || null,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
  };
}

export const bfsDefinition: AlgorithmDefinition<GraphAlgorithmInput, GraphVisualState> = {
  id: "bfs",
  name: "Breadth-First Search",
  title: "Breadth-First Search (BFS)",
  category: "data-structures",
  description: "Level-by-level graph traversal algorithm using a queue (FIFO). Explores all neighbors at current distance before moving deeper.",
  complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  defaultInput: { nodes: DEFAULT_UNWEIGHTED_GRAPH_NODES, edges: DEFAULT_UNWEIGHTED_GRAPH_EDGES, startNodeId: "A" },
  sourceCode: BFS_SOURCE_CODE,
  generateTrace: (input: GraphAlgorithmInput) => generateBFSTrace(input),
};

ALGORITHM_REGISTRY.register(bfsDefinition as unknown as AlgorithmDefinition);
