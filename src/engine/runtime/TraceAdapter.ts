import type { RuntimeEvent } from "./types.ts";
import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { RecursionVisualState } from "../../types/visualization.ts";

export class TraceAdapter {
  public static adaptToTrace(
    sourceCode: string,
    initialInput: unknown,
    events: RuntimeEvent[]
  ): ExecutionTrace {
    const steps: ExecutionStep[] = events.map((evt, idx) => {
      const visualState: RecursionVisualState = {
        type: "recursion",
        data: {
          functionName: evt.functionName || "main",
        },
        runtimeState: evt.runtimeState || { callStack: [] },
      };

      return {
        step: idx,
        line: evt.line,
        event: evt.type,
        variables: JSON.parse(JSON.stringify(evt.variables || {})),
        state: visualState,
        runtimeState: evt.runtimeState ? JSON.parse(JSON.stringify(evt.runtimeState)) : undefined,
        metadata: {
          description: evt.metadata?.description || `Step ${idx + 1}: ${evt.type}`,
        },
      };
    });

    return {
      algorithmId: "user-code-playground",
      algorithmTitle: "User JavaScript Playground Execution",
      sourceCode,
      initialInput,
      steps,
      totalSteps: steps.length,
      timeComplexity: "User Code",
      spaceComplexity: "User Code",
    };
  }
}
