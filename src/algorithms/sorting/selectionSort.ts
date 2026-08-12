import type { ExecutionTrace } from "../../types/execution.ts";
import type { ArrayVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ArrayTraceBuilder } from "../../engine/tracing/ArrayTraceBuilder.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const SELECTION_SORT_SOURCE_CODE = `function selectionSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }
  }
  return arr;
}`;

export function generateSelectionSortTrace(input: number[] = [64, 25, 12, 22, 11]): ExecutionTrace {
  const arr = [...input];
  const n = arr.length;
  const builder = new ArrayTraceBuilder<number>(arr);

  if (n === 0) {
    builder.addStep({
      line: 1,
      event: "call",
      variables: { arr: [], n: 0 },
      description: "Selection Sort called with an empty array.",
    });
    builder.addStep({
      line: 16,
      event: "complete",
      variables: { arr: [], isSorted: true },
      description: "Selection Sort complete on empty array.",
    });
    return builder.toTrace(
      "selection-sort",
      "Selection Sort",
      SELECTION_SORT_SOURCE_CODE,
      input,
      "O(n²)",
      "O(1)"
    );
  }

  // Step 0: Function call
  builder.addStep({
    line: 1,
    event: "call",
    variables: { arr: [...arr], n },
    description: `Selection Sort initialized with array [${arr.join(", ")}].`,
    complexityHint: "Time Complexity: Best O(n²), Average O(n²), Worst O(n²). Space Complexity: O(1).",
  });

  // Step 1: Assign n
  builder.addStep({
    line: 2,
    event: "assign",
    variables: { n, arr: [...arr] },
    description: `Set n = arr.length (${n}).`,
  });

  for (let i = 0; i < n - 1; i++) {
    // Line 3: Outer loop
    builder.addStep({
      line: 3,
      event: "loop",
      variables: { i, n, arr: [...arr] },
      pointers: { [i]: [`i=${i}`] },
      description: `Start pass i = ${i}. Searching for minimum element in range [${i}..${n - 1}].`,
    });

    let minIdx = i;

    // Line 4: Initialize minIdx
    builder.addStep({
      line: 4,
      event: "assign",
      variables: { i, minIdx, "arr[minIdx]": arr[minIdx] },
      pointers: { [i]: [`i=${i}`, `minIdx`] },
      description: `Assume element at index ${i} (${arr[i]}) is current minimum (minIdx = ${i}).`,
    });

    for (let j = i + 1; j < n; j++) {
      const pointers: Record<number, string[]> = {
        [i]: [`i=${i}`],
        [j]: [`j=${j}`],
        [minIdx]: minIdx === i ? [`i=${i}`, `minIdx`] : [`minIdx`],
      };

      // Line 5: Inner loop scan
      builder.addStep({
        line: 5,
        event: "loop",
        variables: { i, j, minIdx, "arr[j]": arr[j], "arr[minIdx]": arr[minIdx] },
        compared: [j, minIdx],
        pointers,
        description: `Scan index j = ${j} (arr[${j}] = ${arr[j]}). Comparing with current minimum arr[${minIdx}] = ${arr[minIdx]}.`,
      });

      // Line 6: Comparison
      const isSmaller = arr[j] < arr[minIdx];
      builder.addStep({
        line: 6,
        event: "compare",
        variables: { i, j, minIdx, "arr[j]": arr[j], "arr[minIdx]": arr[minIdx], isSmaller },
        compared: [j, minIdx],
        pointers,
        description: `Compare arr[${j}] (${arr[j]}) < arr[${minIdx}] (${arr[minIdx]}). ${
          isSmaller ? `Found new smaller element!` : `Not smaller than current minimum.`
        }`,
      });

      if (isSmaller) {
        minIdx = j;
        const updatedPointers: Record<number, string[]> = {
          [i]: [`i=${i}`],
          [minIdx]: [`minIdx=${j}`],
        };

        // Line 7: Update minIdx
        builder.addStep({
          line: 7,
          event: "update",
          variables: { i, j, minIdx, "arr[minIdx]": arr[minIdx] },
          modified: [minIdx],
          pointers: updatedPointers,
          description: `Updated minIdx = ${minIdx} (new minimum value: ${arr[minIdx]}).`,
        });
      }
    }

    // Line 10: Check if swap is needed
    const needsSwap = minIdx !== i;
    if (needsSwap) {
      const valI = arr[i];
      const valMin = arr[minIdx];
      arr[i] = valMin;
      arr[minIdx] = valI;
      builder.setArray(arr);

      // Line 11-14: Swap execution
      builder.addStep({
        line: 11,
        event: "swap",
        variables: { i, minIdx, "arr[i]": valMin, "arr[minIdx]": valI, swapped: true },
        swapped: [i, minIdx],
        pointers: { [i]: [`i=${i}`], [minIdx]: [`swapped`] },
        description: `Swapped minimum element ${valMin} (from index ${minIdx}) into position i = ${i}.`,
      });
    }

    // Mark index i as sorted
    builder.markSorted(i);

    // Pass complete update (Line 15)
    builder.addStep({
      line: 15,
      event: "update",
      variables: { i, sortedElement: arr[i], sortedIndex: i },
      description: `Pass i = ${i} complete. Element ${arr[i]} at index ${i} is now in its final sorted position.`,
    });
  }

  // Mark remaining last element as sorted
  if (n > 0) {
    builder.markSorted(n - 1);
  }

  // Step 16: Complete
  builder.addStep({
    line: 16,
    event: "complete",
    variables: { arr: [...arr], isSorted: true },
    description: `Selection Sort complete! Array sorted in ascending order: [${arr.join(", ")}].`,
    complexityHint: "Total passes: n - 1. Selection sort completed.",
  });

  return builder.toTrace(
    "selection-sort",
    "Selection Sort",
    SELECTION_SORT_SOURCE_CODE,
    input,
    "O(n²)",
    "O(1)"
  );
}

export const selectionSortDefinition: AlgorithmDefinition<number[], ArrayVisualState> = {
  id: "selection-sort",
  name: "Selection Sort",
  title: "Selection Sort",
  category: "sorting",
  description: "A comparison sort that divides the array into a sorted and unsorted region, repeatedly selecting the minimum element from the unsorted region.",
  complexity: {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
  },
  defaultInput: [64, 25, 12, 22, 11],
  sourceCode: SELECTION_SORT_SOURCE_CODE,
  generateTrace: (input: number[]) => generateSelectionSortTrace(input),
};

ALGORITHM_REGISTRY.register(selectionSortDefinition as unknown as AlgorithmDefinition);
