export type InferredVisualType =
  | "array"
  | "stack"
  | "queue"
  | "linked-list"
  | "tree"
  | "graph"
  | "recursion"
  | "none";

export interface InferredVisualization {
  type: InferredVisualType;
  confidence: number; // 0.0 to 1.0
  explanation: string;
  observedBehaviors: string[];
}
