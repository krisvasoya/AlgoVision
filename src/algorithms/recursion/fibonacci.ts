import type { ExecutionStep, ExecutionTrace, CallFrame, CallTreeNode, RuntimeState } from "../../types/execution.ts";
import type { RecursionVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const FIBONACCI_SOURCE_CODE = `function fib(n) {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}`;

export function generateFibonacciTrace(n: number = 5): ExecutionTrace {
  if (typeof n !== "number" || n < 0) {
    throw new Error("Fibonacci is undefined for negative numbers.");
  }

  const steps: ExecutionStep[] = [];
  const callStack: CallFrame[] = [];
  let stepCounter = 0;
  let nodeCounter = 0;

  const rootTreeNode: CallTreeNode = {
    id: `node-${nodeCounter++}`,
    name: "fib",
    args: { n },
    children: [],
    status: "active",
  };

  function createStep(
    line: number,
    event: any,
    variables: Record<string, unknown>,
    description: string,
    returnValue?: unknown
  ) {
    const runtimeState: RuntimeState = {
      callStack: JSON.parse(JSON.stringify(callStack)),
      returnValue,
      callTree: JSON.parse(JSON.stringify(rootTreeNode)),
    };

    const visualState: RecursionVisualState = {
      type: "recursion",
      data: {
        functionName: "fib",
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

  function runFib(currN: number, treeParentNode: CallTreeNode): number {
    const frameId = `frame-${currN}-${nodeCounter}`;
    const frame: CallFrame = {
      id: frameId,
      functionName: "fib",
      parameters: { n: currN },
      locals: { n: currN },
      currentLine: 1,
    };

    callStack.push(frame);

    // Line 1: Call
    createStep(1, "call", { n: currN }, `fib(${currN}) called. Active stack depth: ${callStack.length}.`);

    // Line 2: Base case check
    const isBaseCase = currN <= 1;
    createStep(
      2,
      "compare",
      { n: currN, isBaseCase },
      `Checking base case (n <= 1): ${currN} <= 1 is ${isBaseCase}.`
    );

    if (isBaseCase) {
      frame.currentLine = 3;
      frame.returnValue = currN;
      treeParentNode.returnValue = currN;
      treeParentNode.status = "completed";

      // Line 3: Return base case
      createStep(
        3,
        "base_case",
        { n: currN, returnVal: currN },
        `Base case reached for fib(${currN}). Returning ${currN}.`,
        currN
      );

      callStack.pop();
      return currN;
    }

    // Line 5: Call left branch fib(n - 1)
    frame.currentLine = 5;
    const leftChild: CallTreeNode = {
      id: `node-${nodeCounter++}`,
      name: "fib",
      args: { n: currN - 1 },
      children: [],
      status: "active",
    };
    treeParentNode.children.push(leftChild);

    createStep(
      5,
      "call",
      { n: currN, leftBranch: currN - 1 },
      `Evaluating fib(${currN - 1}) + fib(${currN - 2}): Branching left into fib(${currN - 1}).`
    );

    const leftVal = runFib(currN - 1, leftChild);

    // Resume frame for right branch call fib(n - 2)
    const activeFrame = callStack[callStack.length - 1];
    activeFrame.currentLine = 5;
    activeFrame.locals["leftVal"] = leftVal;

    const rightChild: CallTreeNode = {
      id: `node-${nodeCounter++}`,
      name: "fib",
      args: { n: currN - 2 },
      children: [],
      status: "active",
    };
    treeParentNode.children.push(rightChild);

    createStep(
      5,
      "call",
      { n: currN, leftVal, rightBranch: currN - 2 },
      `fib(${currN - 1}) returned ${leftVal}. Branching right into fib(${currN - 2}).`
    );

    const rightVal = runFib(currN - 2, rightChild);

    // Resume frame for sum
    activeFrame.currentLine = 5;
    const finalVal = leftVal + rightVal;
    activeFrame.locals["rightVal"] = rightVal;
    activeFrame.returnValue = finalVal;
    treeParentNode.returnValue = finalVal;
    treeParentNode.status = "completed";

    createStep(
      5,
      "resume",
      { n: currN, leftVal, rightVal, sum: finalVal },
      `fib(${currN - 1}) [${leftVal}] + fib(${currN - 2}) [${rightVal}] = ${finalVal}. fib(${currN}) returning ${finalVal}.`
    );

    callStack.pop();
    return finalVal;
  }

  const result = runFib(n, rootTreeNode);

  // Line 6: Complete
  createStep(
    6,
    "complete",
    { n, result },
    `Fibonacci execution complete! fib(${n}) = ${result}.`,
    result
  );

  return {
    algorithmId: "fibonacci",
    algorithmTitle: "Recursive Fibonacci",
    sourceCode: FIBONACCI_SOURCE_CODE,
    initialInput: n,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(2^n)",
    spaceComplexity: "O(n)",
  };
}

export const fibonacciDefinition: AlgorithmDefinition<number, RecursionVisualState> = {
  id: "fibonacci",
  name: "Fibonacci (Recursion)",
  title: "Recursive Fibonacci",
  category: "recursion",
  description: "Computes fib(n) recursively. Demonstrates branching call tree growth and call stack execution.",
  complexity: { best: "O(2^n)", average: "O(2^n)", worst: "O(2^n)", space: "O(n)" },
  defaultInput: 5,
  sourceCode: FIBONACCI_SOURCE_CODE,
  generateTrace: (input: number) => generateFibonacciTrace(typeof input === "number" ? input : 5),
};

ALGORITHM_REGISTRY.register(fibonacciDefinition as unknown as AlgorithmDefinition);
