import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { GraphVisualState, GraphNodeData, GraphEdgeData } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";
import {
  DEFAULT_UNWEIGHTED_GRAPH_NODES,
  DEFAULT_UNWEIGHTED_GRAPH_EDGES,
  type GraphAlgorithmInput,
} from "./bfs.ts";

export const DFS_SOURCE_CODE = `function dfs(graph, startNode) {
  let visited = new Set();
  let stack = [startNode];
  while (stack.length > 0) {
    let curr = stack.pop();
    if (!visited.has(curr)) {
      visited.add(curr);
      visit(curr);
      for (let neighbor of graph.getNeighbors(curr)) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    } else {
      backtrack(curr);
    }
  }
}`;

export function generateDFSTrace(input?: GraphAlgorithmInput): ExecutionTrace {
  const nodes = input?.nodes || DEFAULT_UNWEIGHTED_GRAPH_NODES;
  const edges = input?.edges || DEFAULT_UNWEIGHTED_GRAPH_EDGES;
  const startNodeId = input?.startNodeId || "A";

  const steps: ExecutionStep[] = [];
  let stepCounter = 0;

  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    if (!input?.isDirected && adj.has(e.target)) adj.get(e.target)!.push(e.source);
  });

  const visitedSet = new Set<string>();
  const stack: string[] = [];
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
      stackedNodeIds: [...stack],
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

  createStep(1, "call", { startNode: startNodeId }, `DFS initialized with start node ${startNodeId}.`);

  stack.push(startNodeId);
  createStep(
    2,
    "assign",
    { stack: [...stack], visited: Array.from(visitedSet) },
    `Pushed start node ${startNodeId} onto DFS stack.`,
    startNodeId
  );

  while (stack.length > 0) {
    createStep(
      4,
      "loop",
      { stack: [...stack], stackSize: stack.length },
      `Stack contains ${stack.length} node(s): [${stack.join(", ")}]. Continuing DFS loop.`
    );

    const curr = stack.pop()!;

    createStep(
      5,
      "pop",
      { curr, stack: [...stack] },
      `Popped node ${curr} from top of DFS stack.`,
      curr
    );

    const isAlreadyVisited = visitedSet.has(curr);
    createStep(
      6,
      "compare",
      { curr, isAlreadyVisited },
      `Checking if node ${curr} is already visited. ${
        isAlreadyVisited ? `Node ${curr} was already visited. Backtracking from node ${curr}.` : `Node ${curr} is unvisited.`
      }`,
      curr
    );

    if (!isAlreadyVisited) {
      visitedSet.add(curr);
      visitedOrder.push(curr);

      createStep(
        7,
        "visit",
        { curr, visitedOrder: [...visitedOrder] },
        `Marked node ${curr} as visited. DFS visit order: [${visitedOrder.join(" → ")}].`,
        curr
      );

      const neighbors = adj.get(curr) || [];
      const unvisitedNeighbors = [...neighbors].reverse();

      for (const neighbor of unvisitedNeighbors) {
        const edgeId = edges.find(
          (e) =>
            (e.source === curr && e.target === neighbor) ||
            (!input?.isDirected && e.source === neighbor && e.target === curr)
        )?.id;

        const isNeighborVisited = visitedSet.has(neighbor);

        createStep(
          8,
          "compare",
          { curr, neighbor, isNeighborVisited },
          `Inspecting neighbor node ${neighbor} of node ${curr}.`,
          curr,
          edgeId
        );

        if (!isNeighborVisited) {
          stack.push(neighbor);
          createStep(
            10,
            "push",
            { curr, neighbor, stack: [...stack] },
            `Pushed unvisited neighbor node ${neighbor} onto DFS stack. Moving deeper.`,
            neighbor,
            edgeId
          );
        }
      }
    }
  }

  createStep(
    14,
    "complete",
    { visitedOrder, totalVisited: visitedOrder.length },
    `DFS Traversal complete! Traversal order: [${visitedOrder.join(" → ")}].`
  );

  return {
    algorithmId: "dfs",
    algorithmTitle: "Depth-First Search (DFS)",
    sourceCode: DFS_SOURCE_CODE,
    initialInput: input || null,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
  };
}

export const dfsDefinition: AlgorithmDefinition<GraphAlgorithmInput, GraphVisualState> = {
  id: "dfs",
  name: "Depth-First Search",
  title: "Depth-First Search (DFS)",
  category: "data-structures",
  description: "Explores as far as possible along each branch before backtracking using a stack (LIFO). Useful for cycle detection and path searching.",
  complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  defaultInput: { nodes: DEFAULT_UNWEIGHTED_GRAPH_NODES, edges: DEFAULT_UNWEIGHTED_GRAPH_EDGES, startNodeId: "A" },
  sourceCode: DFS_SOURCE_CODE,
  generateTrace: (input: GraphAlgorithmInput) => generateDFSTrace(input),
};

ALGORITHM_REGISTRY.register(dfsDefinition as unknown as AlgorithmDefinition);
