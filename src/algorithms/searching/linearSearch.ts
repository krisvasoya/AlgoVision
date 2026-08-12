import type { ExecutionTrace } from "../../types/execution.ts";
import type { ArrayVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ArrayTraceBuilder } from "../../engine/tracing/ArrayTraceBuilder.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export interface SearchInput {
  array: number[];
  target: number;
}

export const LINEAR_SEARCH_SOURCE_CODE = `function linearSearch(arr, target) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`;

export function generateLinearSearchTrace(input: SearchInput = { array: [10, 50, 30, 70, 80, 20], target: 70 }): ExecutionTrace {
  const arr = [...(input.array || [10, 50, 30, 70, 80, 20])];
  const target = input.target !== undefined ? input.target : 70;
  const n = arr.length;
  const builder = new ArrayTraceBuilder<number>(arr);

  if (n === 0) {
    builder.addStep({
      line: 1,
      event: "call",
      variables: { arr: [], target, n: 0 },
      description: `Linear Search called with empty array. Target = ${target}.`,
    });
    builder.addStep({
      line: 8,
      event: "complete",
      variables: { arr: [], target, result: -1, found: false },
      description: `Target ${target} not found in empty array. Returns -1.`,
    });
    return builder.toTrace(
      "linear-search",
      "Linear Search",
      LINEAR_SEARCH_SOURCE_CODE,
      input,
      "O(n)",
      "O(1)"
    );
  }

  // Initial step
  builder.addStep({
    line: 1,
    event: "call",
    variables: { arr: [...arr], target, n },
    description: `Linear Search initialized. Searching for target = ${target} in array [${arr.join(", ")}].`,
    complexityHint: "Time Complexity: Best O(1), Average O(n), Worst O(n). Space Complexity: O(1).",
  });

  // Assign n
  builder.addStep({
    line: 2,
    event: "assign",
    variables: { n, target, arr: [...arr] },
    description: `Set n = arr.length (${n}).`,
  });

  let foundIndex = -1;

  for (let i = 0; i < n; i++) {
    // Line 3: Outer loop
    builder.addStep({
      line: 3,
      event: "loop",
      variables: { i, target, "arr[i]": arr[i] },
      pointers: { [i]: [`i=${i}`, `target=${target}`] },
      description: `Loop iteration i = ${i}. Access element arr[${i}] (${arr[i]}).`,
    });

    const isMatch = arr[i] === target;

    // Line 4: Comparison
    builder.addStep({
      line: 4,
      event: "compare",
      variables: { i, target, "arr[i]": arr[i], isMatch },
      compared: [i],
      pointers: { [i]: [`i=${i}`, `target=${target}`] },
      description: `Compare arr[${i}] (${arr[i]}) === target (${target}). ${
        isMatch ? `MATCH FOUND at index ${i}!` : `No match (${arr[i]} ≠ ${target}). Move to next element.`
      }`,
    });

    if (isMatch) {
      foundIndex = i;
      builder.markSorted(i); // Highlight match element

      // Line 5: Match found return
      builder.addStep({
        line: 5,
        event: "visit",
        variables: { i, target, foundIndex: i, found: true },
        visited: [i],
        pointers: { [i]: [`FOUND AT ${i}`] },
        description: `Target ${target} successfully found at index ${i}! Returning index ${i}.`,
      });

      break;
    }
  }

  if (foundIndex !== -1) {
    // Line 6: Complete (Found)
    builder.addStep({
      line: 6,
      event: "complete",
      variables: { target, foundIndex, result: foundIndex, found: true },
      visited: [foundIndex],
      pointers: { [foundIndex]: [`FOUND AT ${foundIndex}`] },
      description: `Linear Search complete! Target ${target} found at index ${foundIndex}.`,
    });
  } else {
    // Line 8: Complete (Not Found)
    builder.addStep({
      line: 8,
      event: "complete",
      variables: { target, result: -1, found: false },
      description: `Linear Search complete! Target ${target} was not found in array. Returns -1.`,
    });
  }

  return builder.toTrace(
    "linear-search",
    "Linear Search",
    LINEAR_SEARCH_SOURCE_CODE,
    input,
    "O(n)",
    "O(1)"
  );
}

export const linearSearchDefinition: AlgorithmDefinition<SearchInput, ArrayVisualState> = {
  id: "linear-search",
  name: "Linear Search",
  title: "Linear Search",
  category: "searching",
  description: "Sequentially checks each element of the list until a match is found or the whole list has been searched.",
  complexity: {
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
  },
  defaultInput: { array: [10, 50, 30, 70, 80, 20], target: 70 },
  sourceCode: LINEAR_SEARCH_SOURCE_CODE,
  generateTrace: (input: SearchInput) => generateLinearSearchTrace(input),
};

ALGORITHM_REGISTRY.register(linearSearchDefinition as unknown as AlgorithmDefinition);
