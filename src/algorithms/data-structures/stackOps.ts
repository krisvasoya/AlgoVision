import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { StackVisualState, StackElement } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const STACK_SOURCE_CODE = `class Stack {
  constructor() { this.items = []; }
  push(val) { this.items.push(val); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
}`;

export function generateStackTrace(values: number[] = [10, 20, 30]): ExecutionTrace {
  const steps: ExecutionStep[] = [];
  const items: number[] = [];

  let stepCounter = 0;

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    inserted?: number[],
    removed?: number[]
  ) {
    const elements: StackElement[] = items.map((val, idx) => ({
      id: `stack-el-${idx}`,
      value: val,
      index: idx,
      highlightState: idx === items.length - 1 ? "active" : "default",
    }));

    const visualState: StackVisualState = {
      type: "stack",
      data: {
        elements,
        topIndex: items.length - 1,
      },
      active: items.length > 0 ? [items.length - 1] : [],
      inserted,
      removed,
    };

    steps.push({
      step: stepCounter++,
      line,
      event,
      variables: JSON.parse(JSON.stringify(variables)),
      state: visualState,
      metadata: { description },
    });
  }

  // Step 0: Init
  createStep(1, "call", { items: [] }, "Stack initialized empty.");

  // Push operations
  values.forEach((val) => {
    items.push(val);
    createStep(
      3,
      "assign",
      { action: "push", val, top: items[items.length - 1] },
      `Push ${val} onto top of the stack.`,
      [items.length - 1]
    );
  });

  // Peek
  if (items.length > 0) {
    const topVal = items[items.length - 1];
    createStep(
      5,
      "access",
      { action: "peek", top: topVal },
      `Peek stack top: Returns ${topVal}.`
    );
  }

  // Pop
  if (items.length > 0) {
    const poppedVal = items.pop()!;
    createStep(
      4,
      "update",
      { action: "pop", popped: poppedVal, top: items.length > 0 ? items[items.length - 1] : null },
      `Pop ${poppedVal} from top of the stack.`,
      undefined,
      [items.length]
    );
  }

  // Complete
  createStep(5, "complete", { items: [...items] }, "Stack operations complete.");

  return {
    algorithmId: "stack-demo",
    algorithmTitle: "Stack (Push / Pop / Peek)",
    sourceCode: STACK_SOURCE_CODE,
    initialInput: values,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(1)",
    spaceComplexity: "O(n)",
  };
}

export const stackDefinition: AlgorithmDefinition<number[], StackVisualState> = {
  id: "stack-demo",
  name: "Stack Data Structure",
  title: "Stack (LIFO)",
  category: "data-structures",
  description: "A Last-In, First-Out (LIFO) linear data structure supporting O(1) push, pop, and peek operations.",
  complexity: { best: "O(1)", average: "O(1)", worst: "O(1)", space: "O(n)" },
  defaultInput: [10, 20, 30],
  sourceCode: STACK_SOURCE_CODE,
  generateTrace: (input: number[]) => generateStackTrace(Array.isArray(input) ? input : [10, 20, 30]),
};

ALGORITHM_REGISTRY.register(stackDefinition as unknown as AlgorithmDefinition);
