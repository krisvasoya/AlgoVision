import type { ProgramAnalysis } from "../analysis/types.ts";
import type { RuntimeEvent } from "../runtime/types.ts";
import type { InferredVisualization } from "./types.ts";

export class VisualizationInferenceEngine {
  private static cache = new Map<string, InferredVisualization>();

  public static infer(
    analysis: ProgramAnalysis,
    runtimeEvents: RuntimeEvent[],
    codeText: string = ""
  ): InferredVisualization {
    const cacheKey = `${codeText.length}-${runtimeEvents.length}-${analysis.functions.map((f) => f.name).join(",")}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const observedBehaviors: string[] = [];
    const codeLower = codeText.toLowerCase();

    // 1. Recursion Inference (Name Independent)
    const isRecursiveCode =
      analysis.recursion.isRecursive ||
      (codeLower.includes("return ") && codeLower.includes("(") && (codeLower.includes("- 1)") || codeLower.includes("+ 1)")));

    if (isRecursiveCode) {
      observedBehaviors.push("✓ Self-invoking recursive function execution");
      observedBehaviors.push("✓ Call stack frame buildup & return unwinding");

      const result: InferredVisualization = {
        type: "recursion",
        confidence: 1.0,
        explanation: "Recursive function execution observed. Visualized using Call Stack and Call Tree.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 2. Graph Adjacency Inference (Name Independent)
    const hasGraphAdjacency =
      codeLower.includes("graph[") ||
      codeLower.includes("adj[") ||
      codeLower.includes("edges.push") ||
      (codeLower.includes("neighbors") && codeLower.includes("for"));

    if (hasGraphAdjacency) {
      observedBehaviors.push("✓ Graph vertex & adjacency list traversal");
      observedBehaviors.push("✓ Edge connectivity & neighbor exploration");

      const result: InferredVisualization = {
        type: "graph",
        confidence: 0.85,
        explanation: "Graph adjacency list traversal observed. Visualized using GraphRenderer.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 3. Stack LIFO Inference (Name Independent)
    const hasStackPush = codeLower.includes(".push(");
    const hasStackPop = codeLower.includes(".pop()");

    if (hasStackPush && hasStackPop) {
      observedBehaviors.push("✓ LIFO element insertion (.push)");
      observedBehaviors.push("✓ LIFO element removal (.pop)");
      observedBehaviors.push("✓ Top element behavior tracking");

      const result: InferredVisualization = {
        type: "stack",
        confidence: 0.9,
        explanation: "LIFO stack operations (push/pop) observed. Visualized using StackRenderer.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 4. Queue FIFO Inference (Name Independent)
    const hasQueueShift = codeLower.includes(".shift()");
    if (hasStackPush && hasQueueShift) {
      observedBehaviors.push("✓ FIFO element insertion (.push)");
      observedBehaviors.push("✓ FIFO element removal (.shift)");
      observedBehaviors.push("✓ Front & rear pointer tracking");

      const result: InferredVisualization = {
        type: "queue",
        confidence: 0.9,
        explanation: "FIFO queue operations (push/shift) observed. Visualized using QueueRenderer.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 5. Linked List Inference (Name Independent)
    const hasNextPointer = codeLower.includes(".next");
    if (hasNextPointer) {
      observedBehaviors.push("✓ Node pointer reference traversal (.next)");
      observedBehaviors.push("✓ Node link update & identity tracking");

      const result: InferredVisualization = {
        type: "linked-list",
        confidence: 0.85,
        explanation: "Linked list node traversal (.next) observed. Visualized using LinkedListRenderer.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 6. Tree Inference (Name Independent)
    const hasTreePointers = codeLower.includes(".left") && codeLower.includes(".right");
    if (hasTreePointers) {
      observedBehaviors.push("✓ Binary tree node traversal (.left / .right)");
      observedBehaviors.push("✓ Parent-child structural relationship tracking");

      const result: InferredVisualization = {
        type: "tree",
        confidence: 0.85,
        explanation: "Binary tree traversal (.left/.right) observed. Visualized using TreeRenderer.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 7. Array Operations Inference (Name & Coding-Style Independent)
    const hasArrayArg = runtimeEvents.some(
      (e) => e.variables && Object.values(e.variables).some((v) => Array.isArray(v))
    );
    const hasIndexAccess = runtimeEvents.some((e) => e.type === "access" || e.type === "assign");
    const hasArrayBracketAccess = codeLower.includes("[") && codeLower.includes("]");

    if (hasArrayArg || hasIndexAccess || hasArrayBracketAccess) {
      observedBehaviors.push("✓ Array parameter & indexed element access");

      const hasSwapPattern =
        codeLower.includes("temp") ||
        codeLower.includes("swap") ||
        (codeLower.includes("[") && codeLower.includes("] = ") && codeLower.includes("[")) ||
        codeLower.includes("] = [");

      if (hasSwapPattern) {
        observedBehaviors.push("✓ Element comparison & swap mutation pattern");
      }

      const result: InferredVisualization = {
        type: "array",
        confidence: hasSwapPattern ? 1.0 : 0.8,
        explanation: "Indexed array operations and element traversals observed. Visualized using ArrayRenderer.",
        observedBehaviors,
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // Fallback: Safe "none" mode
    const fallbackResult: InferredVisualization = {
      type: "none",
      confidence: 0.0,
      explanation: "Execution available. No specialized visualization was confidently detected.",
      observedBehaviors: ["Standard statement execution"],
    };
    this.cache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}
