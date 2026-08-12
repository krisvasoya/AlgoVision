import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";

export class TraceStorage {
  private trace: ExecutionTrace | null = null;

  constructor(trace?: ExecutionTrace) {
    if (trace) {
      this.setTrace(trace);
    }
  }

  public setTrace(trace: ExecutionTrace): void {
    if (!trace || !Array.isArray(trace.steps)) {
      throw new Error("Invalid ExecutionTrace: steps array is required.");
    }
    this.trace = trace;
  }

  public getTrace(): ExecutionTrace | null {
    return this.trace;
  }

  public getStep(index: number): ExecutionStep | null {
    if (!this.trace || index < 0 || index >= this.trace.steps.length) {
      return null;
    }
    return this.trace.steps[index];
  }

  public getTotalSteps(): number {
    return this.trace ? this.trace.steps.length : 0;
  }

  public isValidIndex(index: number): boolean {
    if (!this.trace) return false;
    return index >= 0 && index < this.trace.steps.length;
  }

  public clampIndex(index: number): number {
    const total = this.getTotalSteps();
    if (total === 0) return 0;
    return Math.max(0, Math.min(total - 1, index));
  }
}
