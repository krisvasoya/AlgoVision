import type { RuntimeState } from "./execution.ts";

export type VisualStateType =
  | "array"
  | "stack"
  | "queue"
  | "linked-list"
  | "tree"
  | "graph"
  | "hanoi"
  | "recursion"
  | "matrix";

export type ElementHighlightState =
  | "default"
  | "active"
  | "compared"
  | "swapped"
  | "sorted"
  | "modified"
  | "visited";

// --- Array ---
export interface ArrayElement {
  id: string;
  value: number | string;
  index: number;
  highlightState: ElementHighlightState;
  pointers?: string[];
}

export interface ArrayVisualData {
  elements: ArrayElement[];
  length: number;
}

export interface ArrayVisualState {
  type: "array";
  data: ArrayVisualData;
  active?: number[];
  compared?: number[];
  modified?: number[];
  sorted?: number[];
  searchRange?: [number, number];
}

// --- Stack ---
export interface StackElement {
  id: string;
  value: number | string;
  index: number;
  highlightState: ElementHighlightState;
}

export interface StackVisualState {
  type: "stack";
  data: {
    elements: StackElement[];
    topIndex: number;
  };
  active?: number[];
  inserted?: number[];
  removed?: number[];
}

// --- Queue ---
export interface QueueElement {
  id: string;
  value: number | string;
  index: number;
  highlightState: ElementHighlightState;
}

export interface QueueVisualState {
  type: "queue";
  data: {
    elements: QueueElement[];
    frontIndex: number;
    rearIndex: number;
  };
  active?: number[];
  inserted?: number[];
  removed?: number[];
}

// --- Linked List ---
export interface LinkedListNodeData {
  id: string;
  value: number | string;
  nextId: string | null;
  highlightState: ElementHighlightState;
  pointers?: string[];
}

export interface LinkedListVisualState {
  type: "linked-list";
  data: {
    nodes: LinkedListNodeData[];
    headId: string | null;
  };
  activeId?: string | null;
  visitedIds?: string[];
}

// --- Tree (BST) ---
export interface TreeNodeData {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
  highlightState: ElementHighlightState;
}

export interface TreeVisualState {
  type: "tree";
  data: {
    nodes: TreeNodeData[];
    rootId: string | null;
  };
  activeId?: string | null;
  comparedIds?: string[];
  visitedIds?: string[];
  pathIds?: string[];
}

// --- Graph ---
export interface GraphNodeData {
  id: string;
  label: string;
  x?: number;
  y?: number;
  highlightState: ElementHighlightState;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  weight?: number;
  isDirected?: boolean;
  highlightState?: ElementHighlightState;
}

export interface DistanceTableEntry {
  node: string;
  distance: number | string;
  parent: string | null;
  isFinalized?: boolean;
  isCandidate?: boolean;
}

export interface GraphVisualState {
  type: "graph";
  data: {
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
    isDirected?: boolean;
  };
  activeNodeId?: string | null;
  activeEdgeId?: string | null;
  visitedNodeIds?: string[];
  queuedNodeIds?: string[];
  stackedNodeIds?: string[];
  candidateNodeIds?: string[];
  selectedNodeId?: string | null;
  distanceTable?: DistanceTableEntry[];
  shortestPathTreeEdgeIds?: string[];
  finalPathEdgeIds?: string[];
  startNodeId?: string;
  targetNodeId?: string;
}

// --- Tower of Hanoi ---
export interface HanoiDisk {
  id: string;
  size: number;
  color: string;
}

export interface HanoiVisualState {
  type: "hanoi";
  data: {
    rods: {
      A: HanoiDisk[];
      B: HanoiDisk[];
      C: HanoiDisk[];
    };
  };
  runtimeState?: RuntimeState;
  movedDisk?: { size: number; from: "A" | "B" | "C"; to: "A" | "B" | "C" };
}

// --- Generic Recursion State ---
export interface RecursionVisualState {
  type: "recursion";
  data: {
    functionName: string;
    subVisualState?: VisualState;
  };
  runtimeState: RuntimeState;
}

// --- Discriminated Union ---
export type VisualState =
  | ArrayVisualState
  | StackVisualState
  | QueueVisualState
  | LinkedListVisualState
  | TreeVisualState
  | GraphVisualState
  | HanoiVisualState
  | RecursionVisualState;
