import type { ExecutionEventType, RuntimeState } from "../../types/execution.ts";

export type SandboxStatus = "ready" | "running" | "completed" | "stopped" | "error";

export interface RuntimeEvent {
  sequence: number;
  type: ExecutionEventType;
  line: number;
  functionName?: string;
  variables?: Record<string, unknown>;
  runtimeState?: RuntimeState;
  metadata?: {
    sourceNodeId?: string;
    description?: string;
    returnValue?: unknown;
  };
}

export interface SandboxExecutionOptions {
  maxSteps?: number;
  maxStackDepth?: number;
  maxTimeMs?: number;
}

export interface SandboxExecutionResult {
  status: SandboxStatus;
  events: RuntimeEvent[];
  returnValue?: unknown;
  stepCount: number;
  durationMs: number;
  error?: string;
}
