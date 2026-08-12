import type { GraphNodeData, GraphEdgeData } from "../../types/visualization.ts";

export interface PositionedGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  highlightState: string;
}

export interface PositionedGraphEdge {
  id: string;
  source: string;
  target: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight?: number;
  isDirected?: boolean;
  highlightState?: string;
}

export interface GraphLayoutResult {
  nodes: PositionedGraphNode[];
  edges: PositionedGraphEdge[];
  width: number;
  height: number;
}

export function calculateGraphLayout(
  rawNodes: GraphNodeData[],
  rawEdges: GraphEdgeData[],
  width: number = 600,
  height: number = 320
): GraphLayoutResult {
  if (rawNodes.length === 0) {
    return { nodes: [], edges: [], width, height };
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2.6;

  const nodeMap = new Map<string, PositionedGraphNode>();
  const total = rawNodes.length;

  rawNodes.forEach((node, idx) => {
    // Use custom coordinates if provided, else compute circular layout
    const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
    const x = node.x ?? centerX + radius * Math.cos(angle);
    const y = node.y ?? centerY + radius * Math.sin(angle);

    const posNode: PositionedGraphNode = {
      id: node.id,
      label: node.label,
      x,
      y,
      highlightState: node.highlightState,
    };
    nodeMap.set(node.id, posNode);
  });

  const positionedEdges: PositionedGraphEdge[] = rawEdges.map((edge) => {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      x1: src ? src.x : 0,
      y1: src ? src.y : 0,
      x2: tgt ? tgt.x : 0,
      y2: tgt ? tgt.y : 0,
      weight: edge.weight,
      isDirected: edge.isDirected,
      highlightState: edge.highlightState,
    };
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges: positionedEdges,
    width,
    height,
  };
}
