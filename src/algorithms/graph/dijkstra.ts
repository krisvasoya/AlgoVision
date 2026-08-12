import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { GraphVisualState, GraphNodeData, GraphEdgeData, DistanceTableEntry } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";
import type { GraphAlgorithmInput } from "./bfs.ts";

export const DIJKSTRA_SOURCE_CODE = `function dijkstra(graph, startNode) {
  let dist = {};
  let parent = {};
  let finalized = new Set();
  for (let node of graph.nodes) {
    dist[node] = Infinity;
    parent[node] = null;
  }
  dist[startNode] = 0;
  while (finalized.size < graph.nodes.length) {
    let curr = getMinDistanceNode(dist, finalized);
    if (!curr || dist[curr] === Infinity) break;
    finalized.add(curr);
    for (let { neighbor, weight } of graph.getEdges(curr)) {
      if (weight < 0) throw new Error("Dijkstra's algorithm requires non-negative edge weights.");
      if (!finalized.has(neighbor)) {
        let newDist = dist[curr] + weight;
        if (newDist < dist[neighbor]) {
          dist[neighbor] = newDist;
          parent[neighbor] = curr;
        }
      }
    }
  }
}`;

export const DEFAULT_WEIGHTED_GRAPH_NODES: GraphNodeData[] = [
  { id: "A", label: "A", highlightState: "default" },
  { id: "B", label: "B", highlightState: "default" },
  { id: "C", label: "C", highlightState: "default" },
  { id: "D", label: "D", highlightState: "default" },
  { id: "E", label: "E", highlightState: "default" },
];

export const DEFAULT_WEIGHTED_GRAPH_EDGES: GraphEdgeData[] = [
  { id: "e-A-B", source: "A", target: "B", weight: 4, isDirected: true },
  { id: "e-A-D", source: "A", target: "D", weight: 7, isDirected: true },
  { id: "e-B-C", source: "B", target: "C", weight: 2, isDirected: true },
  { id: "e-B-E", source: "B", target: "E", weight: 1, isDirected: true },
  { id: "e-C-E", source: "C", target: "E", weight: 3, isDirected: true },
  { id: "e-D-E", source: "D", target: "E", weight: 1, isDirected: true },
];

export function generateDijkstraTrace(input?: GraphAlgorithmInput): ExecutionTrace {
  const nodes = input?.nodes || DEFAULT_WEIGHTED_GRAPH_NODES;
  const edges = input?.edges || DEFAULT_WEIGHTED_GRAPH_EDGES;
  const startNodeId = input?.startNodeId || "A";
  const targetNodeId = input?.targetNodeId || "E";

  const hasNegativeEdge = edges.some((e) => e.weight !== undefined && e.weight < 0);
  if (hasNegativeEdge) {
    throw new Error("Dijkstra's algorithm requires non-negative edge weights.");
  }

  const steps: ExecutionStep[] = [];
  let stepCounter = 0;

  const distMap = new Map<string, number>();
  const parentMap = new Map<string, string | null>();
  const finalizedSet = new Set<string>();

  nodes.forEach((n) => {
    distMap.set(n.id, Infinity);
    parentMap.set(n.id, null);
  });
  distMap.set(startNodeId, 0);

  function getCandidates(): string[] {
    return nodes
      .map((n) => n.id)
      .filter((id) => !finalizedSet.has(id) && distMap.get(id)! < Infinity);
  }

  function buildDistanceTable(): DistanceTableEntry[] {
    return nodes.map((n) => {
      const d = distMap.get(n.id)!;
      return {
        node: n.id,
        distance: d === Infinity ? "∞" : d,
        parent: parentMap.get(n.id) || null,
        isFinalized: finalizedSet.has(n.id),
        isCandidate: !finalizedSet.has(n.id) && d < Infinity,
      };
    });
  }

  function getShortestPathTreeEdges(): string[] {
    const treeEdges: string[] = [];
    nodes.forEach((n) => {
      const parent = parentMap.get(n.id);
      if (parent) {
        const edge = edges.find((e) => e.source === parent && e.target === n.id);
        if (edge) treeEdges.push(edge.id);
      }
    });
    return treeEdges;
  }

  function getFinalPathEdges(): string[] {
    const pathEdges: string[] = [];
    let curr: string | null = targetNodeId;
    while (curr) {
      const parent = parentMap.get(curr);
      if (parent) {
        const edge = edges.find((e) => e.source === parent && e.target === curr);
        if (edge) pathEdges.unshift(edge.id);
        curr = parent;
      } else {
        break;
      }
    }
    return pathEdges;
  }

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    activeNodeId?: string | null,
    activeEdgeId?: string | null,
    selectedNodeId?: string | null
  ) {
    const visualState: GraphVisualState = {
      type: "graph",
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        isDirected: input?.isDirected ?? true,
      },
      activeNodeId,
      activeEdgeId,
      visitedNodeIds: Array.from(finalizedSet),
      candidateNodeIds: getCandidates(),
      selectedNodeId,
      distanceTable: buildDistanceTable(),
      shortestPathTreeEdgeIds: getShortestPathTreeEdges(),
      finalPathEdgeIds: finalizedSet.has(targetNodeId) ? getFinalPathEdges() : [],
      startNodeId,
      targetNodeId,
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

  createStep(1, "call", { startNode: startNodeId, targetNode: targetNodeId }, `Dijkstra initialized with source node ${startNodeId}.`);

  createStep(
    5,
    "assign",
    { startNode: startNodeId, dist: 0 },
    `Initialized distances: dist[${startNodeId}] = 0, all other nodes set to Infinity (∞).`,
    startNodeId
  );

  while (finalizedSet.size < nodes.length) {
    let minNodeId: string | null = null;
    let minDistance = Infinity;

    nodes.forEach((n) => {
      if (!finalizedSet.has(n.id)) {
        const d = distMap.get(n.id)!;
        if (d < minDistance) {
          minDistance = d;
          minNodeId = n.id;
        }
      }
    });

    if (!minNodeId || minDistance === Infinity) {
      break;
    }

    createStep(
      7,
      "select_min",
      { minNode: minNodeId, distance: minDistance, candidates: getCandidates() },
      `Selected candidate node ${minNodeId} with minimum tentative distance (${minDistance}).`,
      minNodeId,
      undefined,
      minNodeId
    );

    finalizedSet.add(minNodeId);

    createStep(
      9,
      "finalize",
      { finalizedNode: minNodeId, finalDistance: minDistance },
      `Finalized shortest distance to node ${minNodeId} as ${minDistance}.`,
      minNodeId,
      undefined,
      minNodeId
    );

    const outgoingEdges = edges.filter((e) => e.source === minNodeId);

    for (const edge of outgoingEdges) {
      const neighborId = edge.target;
      const weight = edge.weight !== undefined ? edge.weight : 1;

      createStep(
        10,
        "compare",
        { curr: minNodeId, neighbor: neighborId, weight },
        `Inspecting outgoing edge ${minNodeId} → ${neighborId} with weight ${weight}.`,
        minNodeId,
        edge.id
      );

      if (!finalizedSet.has(neighborId)) {
        const newDist = minDistance + weight;
        const currentDist = distMap.get(neighborId)!;
        const isShorter = newDist < currentDist;

        createStep(
          12,
          "relax_edge",
          { curr: minNodeId, neighbor: neighborId, newDist, currentDist, isShorter },
          `Relax edge ${minNodeId} → ${neighborId}: dist[${minNodeId}] (${minDistance}) + ${weight} = ${newDist}. ${
            isShorter
              ? `New distance ${newDist} < current distance ${currentDist === Infinity ? "∞" : currentDist}. Updating distance!`
              : `Current distance ${currentDist} is already shorter than ${newDist}.`
          }`,
          neighborId,
          edge.id
        );

        if (isShorter) {
          distMap.set(neighborId, newDist);
          parentMap.set(neighborId, minNodeId);

          createStep(
            14,
            "update_distance",
            { neighbor: neighborId, updatedDistance: newDist, parent: minNodeId },
            `Updated dist[${neighborId}] = ${newDist}, parent[${neighborId}] = ${minNodeId}.`,
            neighborId,
            edge.id
          );
        }
      }
    }
  }

  const finalDist = distMap.get(targetNodeId);

  createStep(
    18,
    "complete",
    {
      startNode: startNodeId,
      targetNode: targetNodeId,
      shortestDistance: finalDist !== Infinity ? finalDist : "∞",
      finalPath: getFinalPathEdges(),
    },
    `Dijkstra completed! ${
      finalDist !== Infinity
        ? `Shortest distance from ${startNodeId} to ${targetNodeId} is ${finalDist}.`
        : `Target node ${targetNodeId} is unreachable from ${startNodeId}.`
    }`
  );

  return {
    algorithmId: "dijkstra",
    algorithmTitle: "Dijkstra's Shortest Path",
    sourceCode: DIJKSTRA_SOURCE_CODE,
    initialInput: input || null,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
  };
}

export const dijkstraDefinition: AlgorithmDefinition<GraphAlgorithmInput, GraphVisualState> = {
  id: "dijkstra",
  name: "Dijkstra's Shortest Path",
  title: "Dijkstra's Shortest Path",
  category: "data-structures",
  description: "Computes single-source shortest paths on weighted graphs with non-negative edge weights using distance relaxation and greedy minimum selection.",
  complexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V)", space: "O(V)" },
  defaultInput: { nodes: DEFAULT_WEIGHTED_GRAPH_NODES, edges: DEFAULT_WEIGHTED_GRAPH_EDGES, startNodeId: "A", targetNodeId: "E" },
  sourceCode: DIJKSTRA_SOURCE_CODE,
  generateTrace: (input: GraphAlgorithmInput) => generateDijkstraTrace(input),
};

ALGORITHM_REGISTRY.register(dijkstraDefinition as unknown as AlgorithmDefinition);
