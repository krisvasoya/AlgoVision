import type { InferredVisualization } from "./types.ts";
import type { RuntimeEvent } from "../runtime/types.ts";
import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { VisualState, ArrayElement, ArrayVisualState, RecursionVisualState } from "../../types/visualization.ts";

export class VisualStateBuilder {
  public static buildTrace(
    sourceCode: string,
    initialInput: unknown,
    events: RuntimeEvent[],
    inference: InferredVisualization
  ): ExecutionTrace {
    let conversionError: string | undefined = undefined;

    // Validate Manual Override Safety
    if (inference.type === "tree") {
      const hasTreeData = events.some(
        (e) => e.variables && Object.keys(e.variables).some((k) => k.includes("node") || k.includes("root") || k.includes("left"))
      );
      if (!hasTreeData) {
        conversionError = "Tree visualization cannot be derived from the current runtime state.";
      }
    } else if (inference.type === "linked-list") {
      const hasListData = events.some(
        (e) => e.variables && Object.keys(e.variables).some((k) => k.includes("head") || k.includes("next") || k.includes("node"))
      );
      if (!hasListData) {
        conversionError = "Linked list visualization cannot be derived from the current runtime state.";
      }
    } else if (inference.type === "graph") {
      const hasGraphData = events.some(
        (e) => e.variables && Object.keys(e.variables).some((k) => k.includes("graph") || k.includes("adj") || k.includes("edges"))
      );
      if (!hasGraphData) {
        conversionError = "Graph visualization cannot be derived from the current runtime state.";
      }
    }

    const steps: ExecutionStep[] = events.map((evt, idx) => {
      let visualState: VisualState;

      if (inference.type === "array" || inference.type === "none") {
        // Extract array from variables
        let rawArr: any[] = [];
        if (evt.variables) {
          for (const val of Object.values(evt.variables)) {
            if (Array.isArray(val)) {
              rawArr = val;
              break;
            }
          }
        }

        if (rawArr.length === 0 && typeof initialInput === "object" && initialInput !== null) {
          const inputArr = (initialInput as any).arr || (initialInput as any).array || (initialInput as any).values || (initialInput as any).data;
          if (Array.isArray(inputArr)) rawArr = inputArr;
        }

        const elements: ArrayElement[] = rawArr.map((v, i) => {
          let highlight: any = "default";
          const activeIdx = evt.variables?.["i"] as number;
          const compIdx = evt.variables?.["j"] as number;

          if (i === activeIdx) highlight = "active";
          if (i === compIdx) highlight = "compared";

          return {
            id: `el-${i}`,
            value: v,
            index: i,
            highlightState: highlight,
          };
        });

        const arrayState: ArrayVisualState = {
          type: "array",
          data: {
            elements,
            length: elements.length,
          },
        };
        visualState = arrayState;
      } else {
        // Default to recursion / callstack visual state
        const recState: RecursionVisualState = {
          type: "recursion",
          data: {
            functionName: evt.functionName || "main",
          },
          runtimeState: evt.runtimeState || { callStack: [] },
        };
        visualState = recState;
      }

      return {
        step: idx,
        line: evt.line,
        event: evt.type,
        variables: JSON.parse(JSON.stringify(evt.variables || {})),
        state: visualState,
        runtimeState: evt.runtimeState ? JSON.parse(JSON.stringify(evt.runtimeState)) : undefined,
        metadata: {
          description: evt.metadata?.description || `Step ${idx + 1}: ${evt.type}`,
          conversionError,
        },
      };
    });

    return {
      algorithmId: "user-code-inferred",
      algorithmTitle: `User Code (${inference.type.toUpperCase()}) Execution`,
      sourceCode,
      initialInput,
      steps,
      totalSteps: steps.length,
      timeComplexity: "User Code",
      spaceComplexity: "User Code",
    };
  }
}
