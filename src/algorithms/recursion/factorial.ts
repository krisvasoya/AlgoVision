import type { ExecutionStep, ExecutionTrace, CallFrame, RuntimeState } from "../../types/execution.ts";
import type { RecursionVisualState } from "../../types/visualization.ts";
import type { AlgorithmDefinition } from "../../types/algorithm.ts";
import { ALGORITHM_REGISTRY } from "../registry.ts";

export const FACTORIAL_SOURCE_CODE = `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}`;

export function generateFactorialTrace(n: number = 4): ExecutionTrace {
  if (typeof n !== "number" || n < 0) {
    throw new Error("Factorial is undefined for negative numbers.");
  }

  const steps: ExecutionStep[] = [];
  const callStack: CallFrame[] = [];
  let stepCounter = 0;

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
    };

    const visualState: RecursionVisualState = {
      type: "recursion",
      data: {
        functionName: "factorial",
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

  function runFactorial(currN: number): number {
    const frameId = `frame-${currN}`;
    const frame: CallFrame = {
      id: frameId,
      functionName: "factorial",
      parameters: { n: currN },
      locals: { n: currN },
      currentLine: 1,
    };

    callStack.push(frame);

    // Line 1: Call
    createStep(1, "call", { n: currN }, `factorial(${currN}) called. Pushed new frame onto call stack.`);

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
      frame.returnValue = 1;

      // Line 3: Return base case
      createStep(
        3,
        "base_case",
        { n: currN, returnVal: 1 },
        `Base case reached for factorial(${currN}). Returning 1.`,
        1
      );

      callStack.pop();
      return 1;
    }

    // Line 5: Recursive call prepare
    frame.currentLine = 5;
    createStep(
      5,
      "call",
      { n: currN, nextN: currN - 1 },
      `Evaluating n * factorial(n - 1): Calling factorial(${currN - 1}).`
    );

    const subResult = runFactorial(currN - 1);

    // Resume frame
    const activeFrame = callStack[callStack.length - 1];
    activeFrame.currentLine = 5;
    activeFrame.locals["subResult"] = subResult;

    createStep(
      5,
      "resume",
      { n: currN, subResult, result: currN * subResult },
      `factorial(${currN - 1}) returned ${subResult}. Resuming factorial(${currN}) frame. Calculating ${currN} × ${subResult}.`
    );

    const finalVal = currN * subResult;
    activeFrame.returnValue = finalVal;

    createStep(
      5,
      "return",
      { n: currN, returnVal: finalVal },
      `factorial(${currN}) returning ${finalVal}. Popping frame from call stack.`,
      finalVal
    );

    callStack.pop();
    return finalVal;
  }

  const result = runFactorial(n);

  // Line 6: Complete
  createStep(
    6,
    "complete",
    { n, result },
    `Factorial execution complete! factorial(${n}) = ${result}.`,
    result
  );

  return {
    algorithmId: "factorial",
    algorithmTitle: "Recursive Factorial",
    sourceCode: FACTORIAL_SOURCE_CODE,
    initialInput: n,
    steps,
    totalSteps: steps.length,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  };
}

export const factorialDefinition: AlgorithmDefinition<number, RecursionVisualState> = {
  id: "factorial",
  name: "Factorial (Recursion)",
  title: "Recursive Factorial",
  category: "recursion",
  description: "Computes n! recursively. Demonstrates call stack depth buildup and base case return unwinding.",
  complexity: { best: "O(n)", average: "O(n)", worst: "O(n)", space: "O(n)" },
  defaultInput: 4,
  sourceCode: FACTORIAL_SOURCE_CODE,
  generateTrace: (input: number) => generateFactorialTrace(typeof input === "number" ? input : 4),
};

ALGORITHM_REGISTRY.register(factorialDefinition as unknown as AlgorithmDefinition);
