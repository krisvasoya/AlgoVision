import type { TreeNodeData } from "../../types/visualization.ts";

export interface PositionedTreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
  leftId: string | null;
  rightId: string | null;
  highlightState: string;
}

export interface TreeEdgeGeometry {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TreeLayoutResult {
  nodes: PositionedTreeNode[];
  edges: TreeEdgeGeometry[];
  width: number;
  height: number;
}

export function calculateTreeLayout(
  rawNodes: TreeNodeData[],
  rootId: string | null,
  width: number = 600,
  levelHeight: number = 70
): TreeLayoutResult {
  if (!rootId || rawNodes.length === 0) {
    return { nodes: [], edges: [], width, height: 120 };
  }

  const nodeMap = new Map<string, TreeNodeData>();
  rawNodes.forEach((node) => nodeMap.set(node.id, node));

  const positionedNodes: PositionedTreeNode[] = [];
  const edges: TreeEdgeGeometry[] = [];

  function layoutSubtree(
    nodeId: string,
    x: number,
    y: number,
    horizontalShift: number
  ) {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    positionedNodes.push({
      id: node.id,
      value: node.value,
      x,
      y,
      leftId: node.leftId,
      rightId: node.rightId,
      highlightState: node.highlightState,
    });

    if (node.leftId) {
      const leftX = x - horizontalShift;
      const leftY = y + levelHeight;
      edges.push({
        id: `edge-${node.id}-${node.leftId}`,
        x1: x,
        y1: y,
        x2: leftX,
        y2: leftY,
      });
      layoutSubtree(node.leftId, leftX, leftY, horizontalShift / 2);
    }

    if (node.rightId) {
      const rightX = x + horizontalShift;
      const rightY = y + levelHeight;
      edges.push({
        id: `edge-${node.id}-${node.rightId}`,
        x1: x,
        y1: y,
        x2: rightX,
        y2: rightY,
      });
      layoutSubtree(node.rightId, rightX, rightY, horizontalShift / 2);
    }
  }

  const startX = width / 2;
  const startY = 40;
  const initialShift = width / 4;

  layoutSubtree(rootId, startX, startY, initialShift);

  const maxY = Math.max(...positionedNodes.map((n) => n.y), 100);

  return {
    nodes: positionedNodes,
    edges,
    width,
    height: maxY + 50,
  };
}
