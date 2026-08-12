import type { ExecutionStep, ExecutionTrace } from "../../types/execution.ts";
import type { QueueVisualState, QueueElement } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const QUEUE_SOURCE_CODE = `class Queue {
  constructor() { this.items = []; }
  enqueue(val) { this.items.push(val); }
  dequeue() { return this.items.shift(); }
  peek() { return this.items[0]; }
}`;

export function generateQueueTrace(values: number[] = [10, 20, 30]): ExecutionTrace {
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
    const elements: QueueElement[] = items.map((val, idx) => ({
      id: `queue-el-${idx}`,
      value: val,
      index: idx,
      highlightState: idx === 0 ? "active" : "default",
    }));

    const visualState: QueueVisualState = {
      type: "queue",
      data: {
        elements,
        frontIndex: 0,
        rearIndex: Math.max(0, items.length - 1),
      },
      active: items.length > 0 ? [0] : [],
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

  createStep(1, "call", { items: [] }, "Queue initialized empty.");

  values.forEach((val) => {
    items.push(val);
    createStep(
      3,
      "assign",
      { action: "enqueue", val, front: items[0], rear: items[items.length - 1] },
      `Enqueue ${val} at rear of queue.`,
      [items.length - 1]
    );
  });

  if (items.length > 0) {
    createStep(
      5,
      "access",
      { action: "peek", front: items[0] },
      `Peek queue front: Returns ${items[0]}.`
    );
  }

  if (items.length > 0) {
    const dequeuedVal = items.shift()!;
    createStep(
      4,
      "update",
      { action: "dequeue", dequeued: dequeuedVal, front: items[0] },
      `Dequeue ${dequeuedVal} from front of queue.`,
      undefined,
      [0]
    );
  }

  createStep(5, "complete", { items: [...items] }, "Queue operations complete.");

  return {
    algorithmId: "queue-demo",
    algorithmTitle: "Queue (Enqueue / Dequeue)",
    sourceCode: QUEUE_SOURCE_CODE,
    initialInput: values,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(1)",
    spaceComplexity: "O(n)",
  };
}

export const queueDefinition: AlgorithmDefinition<number[], QueueVisualState> = {
  id: "queue-demo",
  name: "Queue Data Structure",
  title: "Queue (FIFO)",
  category: "data-structures",
  description: "A First-In, First-Out (FIFO) linear data structure supporting O(1) enqueue, dequeue, and peek operations.",
  complexity: { best: "O(1)", average: "O(1)", worst: "O(1)", space: "O(n)" },
  defaultInput: [10, 20, 30],
  sourceCode: QUEUE_SOURCE_CODE,
  generateTrace: (input: number[]) => generateQueueTrace(Array.isArray(input) ? input : [10, 20, 30]),
};

ALGORITHM_REGISTRY.register(queueDefinition as unknown as AlgorithmDefinition);
