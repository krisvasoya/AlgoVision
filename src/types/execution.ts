import type { VisualState } from "./visualization.ts";

export type ExecutionEventType =
  | "call"
  | "loop"
  | "compare"
  | "swap"
  | "assign"
  | "update"
  | "access"
  | "sorted"
  | "visit"
  | "insert"
  | "delete"
  | "push"
  | "pop"
  | "enqueue"
  | "dequeue"
  | "return"
  | "base_case"
  | "parameter_bind"
  | "local_assign"
  | "resume"
  | "select_min"
  | "relax_edge"
  | "update_distance"
  | "finalize"
  | "complete";

export interface CallFrame {
  id: string;
  functionName: string;
  parameters: Record<string, unknown>;
  locals: Record<string, unknown>;
  currentLine?: number;
  returnValue?: unknown;
}

export interface CallTreeNode {
  id: string;
  name: string;
  args: Record<string, unknown>;
  returnValue?: unknown;
  children: CallTreeNode[];
  status: "active" | "completed" | "pending";
}

export interface RuntimeState {
  callStack: CallFrame[];
  returnValue?: unknown;
  callTree?: CallTreeNode;
}

export interface StepMetadata {
  description: string;
  note?: string;
  callStack?: string[];
  complexityHint?: string;
  conversionError?: string;
}

export interface ExecutionStep {
  step: number;
  line: number;
  event: ExecutionEventType;
  variables: Record<string, unknown>;
  state: VisualState;
  runtimeState?: RuntimeState;
  metadata?: StepMetadata;
}

export interface ExecutionTrace {
  algorithmId: string;
  algorithmTitle: string;
  sourceCode: string;
  initialInput: unknown;
  steps: ExecutionStep[];
  totalSteps: number;
  timeComplexity: string;
  spaceComplexity: string;
}
