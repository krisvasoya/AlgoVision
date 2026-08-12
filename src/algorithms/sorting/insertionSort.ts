import type { ExecutionTrace } from "../../types/execution.ts";
import type { ArrayVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ArrayTraceBuilder } from "../../engine/tracing/ArrayTraceBuilder.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const INSERTION_SORT_SOURCE_CODE = `function insertionSort(arr) {
  let n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`;

export function generateInsertionSortTrace(input: number[] = [12, 11, 13, 5, 6]): ExecutionTrace {
  const arr = [...input];
  const n = arr.length;
  const builder = new ArrayTraceBuilder<number>(arr);

  if (n === 0) {
    builder.addStep({
      line: 1,
      event: "call",
      variables: { arr: [], n: 0 },
      description: "Insertion Sort called with an empty array.",
    });
    builder.addStep({
      line: 12,
      event: "complete",
      variables: { arr: [], isSorted: true },
      description: "Insertion Sort complete on empty array.",
    });
    return builder.toTrace(
      "insertion-sort",
      "Insertion Sort",
      INSERTION_SORT_SOURCE_CODE,
      input,
      "O(n²)",
      "O(1)"
    );
  }

  // Initial step
  builder.addStep({
    line: 1,
    event: "call",
    variables: { arr: [...arr], n },
    description: `Insertion Sort initialized with array [${arr.join(", ")}].`,
    complexityHint: "Time Complexity: Best O(n), Average O(n²), Worst O(n²). Space Complexity: O(1).",
  });

  // Assign n
  builder.addStep({
    line: 2,
    event: "assign",
    variables: { n, arr: [...arr] },
    description: `Set n = arr.length (${n}).`,
  });

  // First element is inherently sorted
  builder.markSorted(0);

  for (let i = 1; i < n; i++) {
    // Line 3: Outer loop
    builder.addStep({
      line: 3,
      event: "loop",
      variables: { i, n, arr: [...arr] },
      pointers: { [i]: [`i=${i}`] },
      description: `Outer loop iteration i = ${i}. Pick element arr[${i}] (${arr[i]}) to insert into sorted sub-array [0..${i - 1}].`,
    });

    const key = arr[i];

    // Line 4: Select key
    builder.addStep({
      line: 4,
      event: "assign",
      variables: { i, key, "arr[i]": key },
      modified: [i],
      pointers: { [i]: [`key=${key}`] },
      description: `Select key = arr[${i}] (${key}).`,
    });

    let j = i - 1;

    // Line 5: Initialize j
    builder.addStep({
      line: 5,
      event: "assign",
      variables: { i, key, j, "arr[j]": arr[j] },
      pointers: { [i]: [`key=${key}`], [j]: [`j=${j}`] },
      description: `Set j = i - 1 (${j}).`,
    });

    while (j >= 0 && arr[j] > key) {
      // Line 6: Compare
      builder.addStep({
        line: 6,
        event: "compare",
        variables: { i, key, j, "arr[j]": arr[j], condition: `${arr[j]} > ${key}` },
        compared: [j],
        pointers: { [i]: [`key=${key}`], [j]: [`j=${j}`] },
        description: `Compare arr[${j}] (${arr[j]}) > key (${key}). Since ${arr[j]} > ${key}, shift ${arr[j]} right to index ${j + 1}.`,
      });

      // Line 7: Shift element right
      arr[j + 1] = arr[j];
      builder.setArray(arr);

      builder.addStep({
        line: 7,
        event: "update",
        variables: { i, key, j, "arr[j+1]": arr[j + 1], shifted: true },
        swapped: [j + 1],
        pointers: { [j]: [`j=${j}`], [j + 1]: [`shifted`] },
        description: `Shifted arr[${j}] (${arr[j]}) right to arr[${j + 1}].`,
      });

      j--;

      // Line 8: Decrement j
      builder.addStep({
        line: 8,
        event: "assign",
        variables: { i, key, j },
        pointers: j >= 0 ? { [j]: [`j=${j}`] } : {},
        description: `Decremented j to ${j}.`,
      });
    }

    // Line 6 boundary or comparison false step
    if (j >= 0) {
      builder.addStep({
        line: 6,
        event: "compare",
        variables: { i, key, j, "arr[j]": arr[j], condition: `${arr[j]} <= ${key}` },
        compared: [j],
        pointers: { [j]: [`j=${j}`] },
        description: `Compare arr[${j}] (${arr[j]}) > key (${key}). Since ${arr[j]} ≤ ${key}, stop shifting.`,
      });
    }

    // Line 10: Insert key
    arr[j + 1] = key;
    builder.setArray(arr);

    // Mark sorted range up to i
    for (let k = 0; k <= i; k++) {
      builder.markSorted(k);
    }

    builder.addStep({
      line: 10,
      event: "assign",
      variables: { i, key, insertedIndex: j + 1, "arr[j+1]": key },
      modified: [j + 1],
      pointers: { [j + 1]: [`inserted`] },
      description: `Inserted key (${key}) into position arr[${j + 1}]. Sub-array [0..${i}] is now sorted.`,
    });
  }

  // Complete
  builder.addStep({
    line: 12,
    event: "complete",
    variables: { arr: [...arr], isSorted: true },
    description: `Insertion Sort complete! Array sorted in ascending order: [${arr.join(", ")}].`,
    complexityHint: "Array is fully sorted.",
  });

  return builder.toTrace(
    "insertion-sort",
    "Insertion Sort",
    INSERTION_SORT_SOURCE_CODE,
    input,
    "O(n²)",
    "O(1)"
  );
}

export const insertionSortDefinition: AlgorithmDefinition<number[], ArrayVisualState> = {
  id: "insertion-sort",
  name: "Insertion Sort",
  title: "Insertion Sort",
  category: "sorting",
  description: "Builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position.",
  complexity: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
  },
  defaultInput: [12, 11, 13, 5, 6],
  sourceCode: INSERTION_SORT_SOURCE_CODE,
  generateTrace: (input: number[]) => generateInsertionSortTrace(input),
};

ALGORITHM_REGISTRY.register(insertionSortDefinition as unknown as AlgorithmDefinition);
