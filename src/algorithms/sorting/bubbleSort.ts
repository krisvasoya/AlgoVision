import type { ExecutionTrace } from "../../types/execution.ts";
import type { ArrayVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ArrayTraceBuilder } from "../../engine/tracing/ArrayTraceBuilder.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const BUBBLE_SORT_SOURCE_CODE = `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;

export function generateBubbleSortTrace(input: number[] = [7, 2, 9, 1, 5]): ExecutionTrace {
  const arr = [...input];
  const n = arr.length;
  const builder = new ArrayTraceBuilder<number>(arr);

  // Step 0: Function call & initialization
  builder.addStep({
    line: 1,
    event: "call",
    variables: { arr: [...arr], n },
    description: `Bubble Sort initialized with array [${arr.join(", ")}].`,
    complexityHint: "Time Complexity: Average O(n²), Worst O(n²), Best O(n). Space Complexity: O(1).",
  });

  // Step 1: Assign n
  builder.addStep({
    line: 2,
    event: "assign",
    variables: { n, arr: [...arr] },
    description: `Set n = arr.length (${n}).`,
  });

  // Main algorithm loops
  for (let i = 0; i < n - 1; i++) {
    builder.addStep({
      line: 3,
      event: "loop",
      variables: { i, n, arr: [...arr] },
      pointers: { 0: [`i=${i}`] },
      description: `Start outer loop pass i = ${i}. Elements after index ${n - i - 1} are sorted.`,
    });

    for (let j = 0; j < n - i - 1; j++) {
      const pointers: Record<number, string[]> = {};
      pointers[j] = pointers[j] ? [...pointers[j], `j=${j}`] : [`j=${j}`];
      pointers[j + 1] = pointers[j + 1] ? [...pointers[j + 1], `j+1`] : [`j+1`];
      if (j === 0) {
        pointers[0].push(`i=${i}`);
      }

      // Inner loop step
      builder.addStep({
        line: 4,
        event: "loop",
        variables: { i, j, "arr[j]": arr[j], "arr[j+1]": arr[j + 1] },
        compared: [j, j + 1],
        pointers,
        description: `Inner loop iteration j = ${j}. Preparing to compare arr[${j}] and arr[${j + 1}].`,
      });

      // Comparison step (Line 5)
      const valA = arr[j];
      const valB = arr[j + 1];
      const needsSwap = valA > valB;

      builder.addStep({
        line: 5,
        event: "compare",
        variables: { i, j, "arr[j]": valA, "arr[j+1]": valB, needsSwap },
        compared: [j, j + 1],
        pointers,
        description: `Compare arr[${j}] (${valA}) and arr[${j + 1}] (${valB}). ${
          needsSwap
            ? `Since ${valA} > ${valB}, a swap will take place.`
            : `Since ${valA} ≤ ${valB}, no swap is required.`
        }`,
      });

      if (needsSwap) {
        // Swap execution (Line 6)
        arr[j] = valB;
        arr[j + 1] = valA;
        builder.setArray(arr);

        builder.addStep({
          line: 6,
          event: "swap",
          variables: { i, j, "arr[j]": valB, "arr[j+1]": valA, swapped: true },
          swapped: [j, j + 1],
          pointers,
          description: `Swapped elements at index ${j} and ${j + 1}. Now arr[${j}] = ${valB} and arr[${j + 1}] = ${valA}.`,
        });
      }
    }

    // Mark element n - i - 1 as sorted
    builder.markSorted(n - i - 1);

    builder.addStep({
      line: 9,
      event: "update",
      variables: { i, sortedElement: arr[n - i - 1], sortedIndex: n - i - 1 },
      description: `Pass i = ${i} complete. Element ${arr[n - i - 1]} at index ${n - i - 1} is now placed in its final sorted position.`,
    });
  }

  // Mark remaining first element as sorted
  builder.markSorted(0);

  // Completion step (Line 10)
  builder.addStep({
    line: 10,
    event: "complete",
    variables: { arr: [...arr], isSorted: true },
    description: `Bubble Sort complete! All elements are sorted in ascending order: [${arr.join(", ")}].`,
    complexityHint: "Total passes: n - 1. Sorted array returned.",
  });

  return builder.toTrace(
    "bubble-sort",
    "Bubble Sort",
    BUBBLE_SORT_SOURCE_CODE,
    input,
    "O(n²)",
    "O(1)"
  );
}

export const bubbleSortDefinition: AlgorithmDefinition<number[], ArrayVisualState> = {
  id: "bubble-sort",
  name: "Bubble Sort",
  title: "Bubble Sort",
  category: "sorting",
  description: "A simple comparison-based sorting algorithm that steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
  complexity: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
  },
  defaultInput: [7, 2, 9, 1, 5],
  sourceCode: BUBBLE_SORT_SOURCE_CODE,
  generateTrace: (input: number[]) => {
    const arr = Array.isArray(input) ? input : [7, 2, 9, 1, 5];
    return generateBubbleSortTrace(arr);
  },
};

// Backwards compatibility alias
export const bubbleSortAlgorithm = bubbleSortDefinition;

// Auto-register Bubble Sort in ALGORITHM_REGISTRY
ALGORITHM_REGISTRY.register(bubbleSortDefinition as unknown as AlgorithmDefinition);
