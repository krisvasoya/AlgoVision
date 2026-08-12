import type { ExecutionStep, ExecutionTrace, CallFrame, RuntimeState } from "../../types/execution.ts";
import type { RecursionVisualState, ArrayVisualState, ArrayElement } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export interface RecursiveSearchInput {
  array: number[];
  target: number;
}

export const RECURSIVE_BINARY_SEARCH_SOURCE_CODE = `function binarySearch(arr, target, low, high) {
  if (low > high) return -1;
  let mid = Math.floor((low + high) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] > target) {
    return binarySearch(arr, target, low, mid - 1);
  }
  return binarySearch(arr, target, mid + 1, high);
}`;

export function generateRecursiveBinarySearchTrace(input?: RecursiveSearchInput): ExecutionTrace {
  const arr = input?.array !== undefined ? input.array : [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const target = input?.target !== undefined ? input.target : 23;

  // Verify sorted precondition
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      throw new Error("Binary Search requires a sorted array.");
    }
  }

  const steps: ExecutionStep[] = [];
  const callStack: CallFrame[] = [];
  let stepCounter = 0;

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    low: number,
    high: number,
    mid?: number,
    returnValue?: unknown
  ) {
    const elements: ArrayElement[] = arr.map((val, idx) => {
      let state: any = "default";
      if (idx === mid) state = "active";
      else if (idx >= low && idx <= high) state = "compared";

      const pointers: string[] = [];
      if (idx === low) pointers.push("LOW");
      if (idx === high) pointers.push("HIGH");
      if (idx === mid) pointers.push("MID");

      return {
        id: `el-${idx}`,
        value: val,
        index: idx,
        highlightState: state,
        pointers,
      };
    });

    const arrayState: ArrayVisualState = {
      type: "array",
      data: { elements, length: arr.length },
      searchRange: [low, high],
    };

    const runtimeState: RuntimeState = {
      callStack: JSON.parse(JSON.stringify(callStack)),
      returnValue,
    };

    const visualState: RecursionVisualState = {
      type: "recursion",
      data: {
        functionName: "binarySearch",
        subVisualState: arrayState,
      },
      runtimeState,
    };

    steps.push({
      step: stepCounter++,
      line,
      event,
      variables: JSON.parse(JSON.stringify(variables)),
      state: visualState,
      runtimeState,
      metadata: { description },
    });
  }

  function runBinarySearch(low: number, high: number): number {
    const frame: CallFrame = {
      id: `frame-${low}-${high}`,
      functionName: "binarySearch",
      parameters: { target, low, high },
      locals: { low, high },
      currentLine: 1,
    };

    callStack.push(frame);

    // Line 1: Call
    createStep(1, "call", { target, low, high }, `binarySearch(arr, ${target}, ${low}, ${high}) called.`, low, high);

    // Line 2: Base case check low > high
    const isBaseCase = low > high;
    createStep(
      2,
      "compare",
      { low, high, isBaseCase },
      `Checking base case (low > high): ${low} > ${high} is ${isBaseCase}.`,
      low,
      high
    );

    if (isBaseCase) {
      frame.returnValue = -1;
      createStep(
        2,
        "base_case",
        { low, high, returnVal: -1 },
        `Search range empty (low > high). Target ${target} not found. Returning -1.`,
        low,
        high,
        undefined,
        -1
      );
      callStack.pop();
      return -1;
    }

    // Line 3: Calculate mid
    const mid = Math.floor((low + high) / 2);
    frame.locals["mid"] = mid;
    frame.locals["midValue"] = arr[mid];
    frame.currentLine = 3;

    createStep(
      3,
      "assign",
      { low, high, mid, midVal: arr[mid] },
      `Calculated mid index: (${low} + ${high}) / 2 = ${mid}. arr[${mid}] = ${arr[mid]}.`,
      low,
      high,
      mid
    );

    // Line 4: Compare arr[mid] === target
    const isMatch = arr[mid] === target;
    createStep(
      4,
      "compare",
      { midVal: arr[mid], target, isMatch },
      `Comparing arr[${mid}] (${arr[mid]}) === ${target}: Match is ${isMatch}.`,
      low,
      high,
      mid
    );

    if (isMatch) {
      frame.returnValue = mid;
      createStep(
        4,
        "visit",
        { mid, target, returnVal: mid },
        `Target ${target} found at index ${mid}! Returning index ${mid}.`,
        low,
        high,
        mid,
        mid
      );
      callStack.pop();
      return mid;
    }

    // Line 5: Check arr[mid] > target
    const isGreater = arr[mid] > target;
    createStep(
      5,
      "compare",
      { midVal: arr[mid], target, isGreater },
      `Checking arr[${mid}] (${arr[mid]}) > ${target}: ${isGreater}.`,
      low,
      high,
      mid
    );

    let returnVal = -1;
    if (isGreater) {
      frame.currentLine = 6;
      createStep(
        6,
        "call",
        { low, newHigh: mid - 1 },
        `arr[${mid}] (${arr[mid]}) > ${target}. Recursing into left half: binarySearch(low=${low}, high=${mid - 1}).`,
        low,
        high,
        mid
      );
      returnVal = runBinarySearch(low, mid - 1);
    } else {
      frame.currentLine = 8;
      createStep(
        8,
        "call",
        { newLow: mid + 1, high },
        `arr[${mid}] (${arr[mid]}) < ${target}. Recursing into right half: binarySearch(low=${mid + 1}, high=${high}).`,
        low,
        high,
        mid
      );
      returnVal = runBinarySearch(mid + 1, high);
    }

    const activeFrame = callStack[callStack.length - 1];
    activeFrame.returnValue = returnVal;
    createStep(
      8,
      "return",
      { returnVal },
      `Recursive call returned index ${returnVal}. binarySearch(low=${low}, high=${high}) returning ${returnVal}.`,
      low,
      high,
      mid,
      returnVal
    );

    callStack.pop();
    return returnVal;
  }

  const finalIndex = runBinarySearch(0, arr.length - 1);

  createStep(
    9,
    "complete",
    { target, finalIndex },
    `Recursive Binary Search complete! Target ${target} ${
      finalIndex !== -1 ? `found at index ${finalIndex}.` : "not found."
    }`,
    0,
    arr.length - 1,
    undefined,
    finalIndex
  );

  return {
    algorithmId: "recursive-binary-search",
    algorithmTitle: "Recursive Binary Search",
    sourceCode: RECURSIVE_BINARY_SEARCH_SOURCE_CODE,
    initialInput: { array: arr, target },
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(log n)",
  };
}

export const recursiveBinarySearchDefinition: AlgorithmDefinition<RecursiveSearchInput, RecursionVisualState> = {
  id: "recursive-binary-search",
  name: "Recursive Binary Search",
  title: "Recursive Binary Search",
  category: "recursion",
  description: "Searches a sorted array by dividing search interval in half using recursive function call frames.",
  complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(log n)" },
  defaultInput: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
  sourceCode: RECURSIVE_BINARY_SEARCH_SOURCE_CODE,
  generateTrace: (input: RecursiveSearchInput) => generateRecursiveBinarySearchTrace(input),
};

ALGORITHM_REGISTRY.register(recursiveBinarySearchDefinition as unknown as AlgorithmDefinition);
