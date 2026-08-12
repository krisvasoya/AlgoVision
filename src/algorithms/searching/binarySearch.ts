import type { ExecutionTrace } from "../../types/execution.ts";
import type { ArrayVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ArrayTraceBuilder } from "../../engine/tracing/ArrayTraceBuilder.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";
import type { SearchInput } from "./linearSearch.ts";

export const BINARY_SEARCH_SOURCE_CODE = `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}`;

export function isArraySorted(arr: number[]): boolean {
  return arr.every((val, idx) => idx === 0 || val >= arr[idx - 1]);
}

export function generateBinarySearchTrace(
  input: SearchInput = { array: [10, 20, 30, 40, 50, 60, 70, 80], target: 60 }
): ExecutionTrace {
  const arr = [...(input.array || [10, 20, 30, 40, 50, 60, 70, 80])];
  const target = input.target !== undefined ? input.target : 60;

  // Strict Precondition: Binary Search requires a sorted array
  if (!isArraySorted(arr)) {
    throw new Error("Binary Search requires a sorted array.");
  }

  const n = arr.length;
  const builder = new ArrayTraceBuilder<number>(arr);

  if (n === 0) {
    builder.addStep({
      line: 1,
      event: "call",
      variables: { arr: [], target, n: 0 },
      description: `Binary Search called with empty array. Target = ${target}.`,
    });
    builder.addStep({
      line: 14,
      event: "complete",
      variables: { arr: [], target, result: -1, found: false },
      description: `Target ${target} not found in empty array. Returns -1.`,
    });
    return builder.toTrace(
      "binary-search",
      "Binary Search",
      BINARY_SEARCH_SOURCE_CODE,
      input,
      "O(log n)",
      "O(1)"
    );
  }

  // Initial step
  builder.addStep({
    line: 1,
    event: "call",
    variables: { arr: [...arr], target, n },
    description: `Binary Search initialized for target = ${target} on sorted array [${arr.join(", ")}].`,
    complexityHint: "Time Complexity: Best O(1), Average O(log n), Worst O(log n). Space Complexity: O(1).",
  });

  let low = 0;
  let high = n - 1;

  // Line 2: Initialize low
  builder.addStep({
    line: 2,
    event: "assign",
    variables: { low, target },
    searchRange: [low, high],
    pointers: { [low]: [`low=${low}`] },
    description: `Initialize low = 0.`,
  });

  // Line 3: Initialize high
  builder.addStep({
    line: 3,
    event: "assign",
    variables: { low, high, target },
    searchRange: [low, high],
    pointers: { [low]: [`low=${low}`], [high]: [`high=${high}`] },
    description: `Initialize high = arr.length - 1 (${high}). Active search range: [index ${low}..${high}].`,
  });

  let foundIndex = -1;

  while (low <= high) {
    // Line 4: Loop check
    builder.addStep({
      line: 4,
      event: "loop",
      variables: { low, high, target, rangeSize: high - low + 1 },
      searchRange: [low, high],
      pointers: { [low]: [`low=${low}`], [high]: [`high=${high}`] },
      description: `Loop check low (${low}) ≤ high (${high}). Search space contains ${high - low + 1} elements.`,
    });

    const mid = Math.floor((low + high) / 2);

    const pointers: Record<number, string[]> = {
      [low]: [`low=${low}`],
      [high]: [`high=${high}`],
      [mid]: [`mid=${mid}`],
    };
    if (low === mid) pointers[low] = [`low`, `mid`];
    if (high === mid) pointers[high] = [`high`, `mid`];
    if (low === high && low === mid) pointers[low] = [`low`, `high`, `mid`];

    // Line 5: Calculate mid
    builder.addStep({
      line: 5,
      event: "update",
      variables: { low, high, mid, "arr[mid]": arr[mid], target },
      searchRange: [low, high],
      pointers,
      description: `Calculate mid = Math.floor((${low} + ${high}) / 2) = ${mid}. Value at mid: arr[${mid}] = ${arr[mid]}.`,
    });

    // Line 6: Compare arr[mid] === target
    const isEqual = arr[mid] === target;
    builder.addStep({
      line: 6,
      event: "compare",
      variables: { low, high, mid, "arr[mid]": arr[mid], target, isEqual },
      compared: [mid],
      searchRange: [low, high],
      pointers,
      description: `Compare arr[mid] (${arr[mid]}) === target (${target}). ${
        isEqual ? `MATCH FOUND at index ${mid}!` : `Not equal (${arr[mid]} ≠ ${target}).`
      }`,
    });

    if (isEqual) {
      foundIndex = mid;
      builder.markSorted(mid);

      // Line 7: Return mid
      builder.addStep({
        line: 7,
        event: "visit",
        variables: { mid, target, foundIndex: mid, found: true },
        visited: [mid],
        pointers: { [mid]: [`FOUND AT ${mid}`] },
        description: `Target ${target} found at mid index ${mid}! Returning ${mid}.`,
      });

      break;
    }

    // Line 8: Compare arr[mid] < target
    const isMidLess = arr[mid] < target;
    builder.addStep({
      line: 8,
      event: "compare",
      variables: { low, high, mid, "arr[mid]": arr[mid], target, isMidLess },
      compared: [mid],
      searchRange: [low, high],
      pointers,
      description: `Compare arr[mid] (${arr[mid]}) < target (${target}). ${
        isMidLess
          ? `Since ${arr[mid]} < ${target}, target must lie in right half.`
          : `Since ${arr[mid]} > ${target}, target must lie in left half.`
      }`,
    });

    if (isMidLess) {
      // Line 9: Move low
      low = mid + 1;
      builder.addStep({
        line: 9,
        event: "assign",
        variables: { low, high, mid, target },
        searchRange: low <= high ? [low, high] : undefined,
        pointers: low <= high ? { [low]: [`low=${low}`], [high]: [`high=${high}`] } : {},
        description: `Move low = mid + 1 (${low}). Eliminating left half.`,
      });
    } else {
      // Line 11: Move high
      high = mid - 1;
      builder.addStep({
        line: 11,
        event: "assign",
        variables: { low, high, mid, target },
        searchRange: low <= high ? [low, high] : undefined,
        pointers: low <= high ? { [low]: [`low=${low}`], [high]: [`high=${high}`] } : {},
        description: `Move high = mid - 1 (${high}). Eliminating right half.`,
      });
    }
  }

  if (foundIndex !== -1) {
    builder.addStep({
      line: 7,
      event: "complete",
      variables: { target, foundIndex, result: foundIndex, found: true },
      visited: [foundIndex],
      pointers: { [foundIndex]: [`FOUND AT ${foundIndex}`] },
      description: `Binary Search complete! Target ${target} found at index ${foundIndex}.`,
    });
  } else {
    // Line 14: Complete (Not Found)
    builder.addStep({
      line: 14,
      event: "complete",
      variables: { target, result: -1, found: false },
      description: `Binary Search complete! Target ${target} was not found in sorted array. Returns -1.`,
    });
  }

  return builder.toTrace(
    "binary-search",
    "Binary Search",
    BINARY_SEARCH_SOURCE_CODE,
    input,
    "O(log n)",
    "O(1)"
  );
}

export const binarySearchDefinition: AlgorithmDefinition<SearchInput, ArrayVisualState> = {
  id: "binary-search",
  name: "Binary Search",
  title: "Binary Search",
  category: "searching",
  description: "An efficient search algorithm on sorted arrays that repeatedly divides the search interval in half.",
  complexity: {
    best: "O(1)",
    average: "O(log n)",
    worst: "O(log n)",
    space: "O(1)",
  },
  defaultInput: { array: [10, 20, 30, 40, 50, 60, 70, 80], target: 60 },
  sourceCode: BINARY_SEARCH_SOURCE_CODE,
  generateTrace: (input: SearchInput) => generateBinarySearchTrace(input),
};

ALGORITHM_REGISTRY.register(binarySearchDefinition as unknown as AlgorithmDefinition);
